import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, fromEngine } from "@/lib/supabase";
import type { PersonRow } from "@/types/schema";

interface AuthState {
    user: User | null;
    session: Session | null;
    person: PersonRow | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error?: string }>;
    signInWithOtp: (email: string) => Promise<{ error?: string }>;
    updatePassword: (password: string) => Promise<{ error?: string }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const PERSON_CACHE_KEY = "sinaport.person.v1";

// Read the persisted Supabase session straight from localStorage (no network) so the
// UI can hydrate instantly on a cold boot. Chromium browsers (Chrome Memory Saver /
// Edge Sleeping Tabs / Brave) discard idle background tabs and reload the SPA on
// return; without this, every such reload blocks on getSession() + the people_master
// lookup and shows the full-screen loader "as if landing for the first time".
function readPersistedSession(): Session | null {
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key || !/^sb-.*-auth-token$/.test(key)) continue;
            const parsed = JSON.parse(localStorage.getItem(key) ?? "null");
            const sess = (parsed?.currentSession ?? parsed) as Session | null;
            if (!sess?.user?.email) return null;
            // Don't trust an expired token; fall back to the normal async path.
            if (sess.expires_at && sess.expires_at * 1000 < Date.now()) return null;
            return sess;
        }
    } catch {
        /* fall through to the normal async resolution */
    }
    return null;
}

function readCachedPerson(email: string): PersonRow | null {
    try {
        const cached = JSON.parse(localStorage.getItem(PERSON_CACHE_KEY) ?? "null") as PersonRow | null;
        if (cached?.email && cached.email.toLowerCase() === email.toLowerCase()) return cached;
    } catch {
        /* ignore */
    }
    return null;
}

function writeCachedPerson(person: PersonRow | null) {
    try {
        if (person) localStorage.setItem(PERSON_CACHE_KEY, JSON.stringify(person));
        else localStorage.removeItem(PERSON_CACHE_KEY);
    } catch {
        /* ignore */
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    // Optimistic boot: if a valid session + matching cached identity are already in
    // localStorage, render straight to the dashboard with no blocking loader, then
    // revalidate in the background. Otherwise fall back to the normal async path.
    const bootSession = readPersistedSession();
    const bootPerson = bootSession?.user?.email ? readCachedPerson(bootSession.user.email) : null;

    const [session, setSession] = useState<Session | null>(bootSession);
    const [user, setUser] = useState<User | null>(bootSession?.user ?? null);
    const [person, setPerson] = useState<PersonRow | null>(bootPerson);
    const [loading, setLoading] = useState(!(bootSession && bootPerson));

    const fetchPerson = useCallback(async (email: string) => {
        const { data, error } = await fromEngine("people_master")
            .select("*")
            .ilike("email", email)
            .eq("status", "Active")
            .maybeSingle();
        if (error) {
            console.error("people_master lookup failed", error);
            return null;
        }
        return (data as PersonRow) ?? null;
    }, []);

    useEffect(() => {
        let unsubscribe: { subscription: { unsubscribe: () => void } } | null = null;
        // The email we've already resolved `person` for. Supabase fires auth events
        // (SIGNED_IN / INITIAL_SESSION / TOKEN_REFRESHED) every time the browser tab
        // regains focus. If we re-toggle `loading` or refetch on those, App.tsx swaps
        // the whole tree for <LoadingState/>, which unmounts the dashboard, refetches
        // every view, and resets scroll to the top. So only do real work when the
        // signed-in user actually CHANGES.
        let resolvedEmail: string | null = null;

        // `silent` skips the loading toggle so a background revalidation (after an
        // optimistic boot) never flashes the full-screen loader.
        const resolvePerson = async (email: string | null, silent = false) => {
            if (!email) {
                resolvedEmail = null;
                setPerson(null);
                writeCachedPerson(null);
                return;
            }
            if (email.toLowerCase() === resolvedEmail?.toLowerCase()) {
                // Same user already resolved -> no remount, no refetch, no flash.
                return;
            }
            // New / different user: hold loading until people_master resolves so the
            // "not provisioned" guard doesn't flash before the lookup finishes.
            if (!silent) setLoading(true);
            const p = await fetchPerson(email);
            resolvedEmail = email;
            setPerson(p);
            writeCachedPerson(p);
            if (!silent) setLoading(false);
        };

        // If we hydrated from cache, revalidate quietly in the background.
        const bootedOptimistically = !(bootSession && bootPerson) ? false : true;

        (async () => {
            const { data } = await supabase.auth.getSession();
            setSession(data.session);
            setUser(data.session?.user ?? null);
            await resolvePerson(data.session?.user?.email ?? null, bootedOptimistically);
            setLoading(false);

            unsubscribe = supabase.auth.onAuthStateChange(async (_event, newSession) => {
                setSession(newSession);
                setUser(newSession?.user ?? null);
                await resolvePerson(newSession?.user?.email ?? null);
            }) as unknown as { subscription: { unsubscribe: () => void } };
        })();
        return () => {
            unsubscribe?.subscription.unsubscribe();
        };
    }, [fetchPerson]);

    const value = useMemo<AuthState>(
        () => ({
            user,
            session,
            person,
            loading,
            signIn: async (email, password) => {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                return error ? { error: error.message } : {};
            },
            signInWithOtp: async (email) => {
                const { error } = await supabase.auth.signInWithOtp({
                    email,
                    options: { emailRedirectTo: window.location.origin },
                });
                return error ? { error: error.message } : {};
            },
            updatePassword: async (password) => {
                const { error } = await supabase.auth.updateUser({ password });
                return error ? { error: error.message } : {};
            },
            signOut: async () => {
                await supabase.auth.signOut();
            },
        }),
        [user, session, person, loading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
