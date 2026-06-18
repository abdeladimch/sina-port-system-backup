import { useEffect, useState } from "react";
import { fromEngine, supabase } from "@/lib/supabase";

// Fetch a date-parameterized engine RPC (fn_*(p_from,p_to)) for the selected range.
// Powers the global date filter across all role dashboards (Khryzl feedback #1).
export function useRangeView<T = Record<string, unknown>>(rpc: string, range: { from: string; to: string }) {
    const [data, setData] = useState<T[] | null>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        void supabase
            .schema("engine" as never)
            .rpc(rpc, { p_from: range.from, p_to: range.to })
            .then(({ data, error }) => {
                if (cancelled) return;
                if (error) console.error(`[useRangeView] ${rpc}:`, error.message);
                setData((data as T[]) ?? []);
                setLoading(false);
            });
        return () => { cancelled = true; };
    }, [rpc, range.from, range.to]);
    return { data, loading };
}

export function useRoleView<T = Record<string, unknown>>(viewName: string) {
    const [data, setData] = useState<T[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const { data, error } = await fromEngine(viewName).select("*");
            if (cancelled) return;
            if (error) {
                // Keep the real error for debugging, but the UI shows a friendly message.
                console.error(`[useRoleView] ${viewName}:`, error.message);
                setError(error.message);
                setData(null);
            } else {
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
