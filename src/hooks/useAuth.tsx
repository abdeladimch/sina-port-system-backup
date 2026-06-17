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

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [person, setPerson] = useState<PersonRow | null>(null);
    const [loading, setLoading] = useState(true);

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

        const resolvePerson = async (email: string | null) => {
            if (!email) {
                resolvedEmail = null;
                setPerson(null);
                return;
            }
            if (email.toLowerCase() === resolvedEmail?.toLowerCase()) {
                // Same user already resolved -> no remount, no refetch, no flash.
                return;
            }
            // New / different user: hold loading until people_master resolves so the
            // "not provisioned" guard doesn't flash before the lookup finishes.
            setLoading(true);
            const p = await fetchPerson(email);
            resolvedEmail = email;
            setPerson(p);
            setLoading(false);
        };

        (async () => {
            const { data } = await supabase.auth.getSession();
            setSession(data.session);
            setUser(data.session?.user ?? null);
            await resolvePerson(data.session?.user?.email ?? null);
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
