import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
    (import.meta.env.VITE_SUPABASE_URL as string) ??
    "https://itbmwkfrzuxnijkhuild.supabase.co";

const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_ANON_KEY) {
    console.warn("Missing VITE_SUPABASE_ANON_KEY. Auth and queries will fail.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    },
    db: { schema: "public" },
});

// Convenience helpers for cross-schema queries
export function fromEngine(table: string) {
    return supabase.schema("engine").from(table);
}
export function fromRegistry(table: string) {
    return supabase.schema("registry").from(table);
}
export function fromDictionary(table: string) {
    return supabase.schema("dictionary").from(table);
}
export function fromLibrary(table: string) {
    return supabase.schema("library").from(table);
}
