import { useEffect, useState } from "react";
import { fromEngine } from "@/lib/supabase";

// Stale-while-revalidate cache: revisiting a tab shows cached rows instantly while a
// fresh fetch updates them in the background. Kills the "reload everything on every
// mount" latency on first land + tab switches. Cleared on sign-out (see useAuth).
const cache = new Map<string, unknown[]>();
export function clearRoleViewCache() {
    cache.clear();
}

export function useRoleView<T = Record<string, unknown>>(viewName: string) {
    const [data, setData] = useState<T[] | null>(() => (cache.get(viewName) as T[]) ?? null);
    const [loading, setLoading] = useState(() => !cache.has(viewName));
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const cached = cache.get(viewName);
        if (cached) {
            setData(cached as T[]);
            setLoading(false);
        } else {
            setLoading(true);
        }
        (async () => {
            const { data, error } = await fromEngine(viewName).select("*");
            if (cancelled) return;
            if (error) {
                console.error(`[useRoleView] ${viewName}:`, error.message);
                setError(error.message);
                if (!cache.has(viewName)) setData(null);
            } else {
                cache.set(viewName, data as unknown[]);
                setData(data as T[]);
                setError(null);
            }
            setLoading(false);
        })();
        return () => {
            cancelled = true;
        };
    }, [viewName]);

    return { data, loading, error };
}
