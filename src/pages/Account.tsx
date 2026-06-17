import { useState } from "react";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// In-app password change (no email needed). Lets each member set their own password
// after first login. Self-serve "forgot password" (logged out) is separate - needs SMTP.
export function Account() {
    const { user, person, updatePassword } = useAuth();
    const [pw, setPw] = useState("");
    const [pw2, setPw2] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [saving, setSaving] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState("");

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (pw.length < 8) { setError("Use at least 8 characters."); return; }
        if (pw !== pw2) { setError("Passwords don't match."); return; }
        setSaving(true);
        const res = await updatePassword(pw);
        setSaving(false);
        if (res.error) { setError(res.error); return; }
        setDone(true);
        setPw(""); setPw2("");
    };

    const inputClass = "mt-1 w-full px-3 py-2 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900";

    return (
        <div className="max-w-md mx-auto px-4 py-6">
            <h1 className="text-xl font-semibold text-zinc-900">Account</h1>
            <p className="mt-1 text-sm text-zinc-500">
                {person?.full_name ?? user?.email} · {person?.role ?? ""}
            </p>

            <div className="mt-6 bg-white border border-zinc-200 rounded-lg p-5">
                <h2 className="text-sm font-semibold text-zinc-900 mb-3">Change password</h2>
                {done && (
                    <div className="mb-3 flex items-center gap-2 text-sm text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" /> Password updated.
                    </div>
                )}
                <form onSubmit={submit} className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700">New password</label>
                        <div className="relative mt-1">
                            <input type={showPw ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)} className={inputClass + " pr-10"} placeholder="At least 8 characters" />
                            <button type="button" onClick={() => setShowPw((s) => !s)} aria-label={showPw ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700">
                                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700">Confirm new password</label>
                        <input type={showPw ? "text" : "password"} value={pw2} onChange={(e) => setPw2(e.target.value)} className={inputClass} />
                    </div>
                    {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</div>}
                    <button type="submit" disabled={saving} className="rounded bg-zinc-900 text-white px-4 py-2 text-sm font-medium disabled:opacity-60">
                        {saving ? "Saving..." : "Update password"}
                    </button>
                </form>
            </div>
        </div>
    );
}
