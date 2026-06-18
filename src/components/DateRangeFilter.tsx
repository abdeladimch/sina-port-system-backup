import { useState } from "react";
import { cn } from "@/lib/utils";

// Global-style date-range filter (Khryzl feedback #1: 7 / 14 / 30 days / specific date / range).
export interface DateRange { from: string; to: string; label: string }

function iso(d: Date): string { return d.toISOString().slice(0, 10); }
function daysAgo(n: number): string { const d = new Date(); d.setDate(d.getDate() - n); return iso(d); }
function monthStart(): string { const d = new Date(); return iso(new Date(d.getFullYear(), d.getMonth(), 1)); }

export const DATE_PRESETS: DateRange[] = [
    { label: "7 days", from: daysAgo(6), to: iso(new Date()) },
    { label: "14 days", from: daysAgo(13), to: iso(new Date()) },
    { label: "30 days", from: daysAgo(29), to: iso(new Date()) },
    { label: "This month", from: monthStart(), to: iso(new Date()) },
];

export function defaultRange(): DateRange {
    return DATE_PRESETS[3]; // This month
}

export function useDateRange(): [DateRange, (r: DateRange) => void] {
    const [range, setRange] = useState<DateRange>(defaultRange());
    return [range, setRange];
}

export function DateRangeFilter({ value, onChange }: { value: DateRange; onChange: (r: DateRange) => void }) {
    const [custom, setCustom] = useState(false);
    return (
        <div className="flex flex-wrap items-center gap-2">
            {DATE_PRESETS.map((p) => (
                <button
                    key={p.label}
                    onClick={() => { setCustom(false); onChange(p); }}
                    className={cn(
                        "px-3 py-1.5 rounded-md text-xs font-medium border transition-colors",
                        !custom && value.label === p.label
                            ? "bg-zinc-900 text-white border-zinc-900"
                            : "bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50"
                    )}
                >
                    {p.label}
                </button>
            ))}
            <button
                onClick={() => setCustom(true)}
                className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium border transition-colors",
                    custom ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50"
                )}
            >
                Custom
            </button>
            {custom && (
                <div className="flex items-center gap-1">
                    <input type="date" value={value.from} max={value.to}
                        onChange={(e) => onChange({ from: e.target.value, to: value.to, label: "Custom" })}
                        className="rounded border border-zinc-300 px-2 py-1 text-xs" />
                    <span className="text-zinc-400 text-xs">to</span>
                    <input type="date" value={value.to} min={value.from} max={iso(new Date())}
                        onChange={(e) => onChange({ from: value.from, to: e.target.value, label: "Custom" })}
                        className="rounded border border-zinc-300 px-2 py-1 text-xs" />
                </div>
            )}
        </div>
    );
}
