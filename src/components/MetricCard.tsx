import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
    label: string;
    value: string | number;
    sublabel?: string;
    flag?: "green" | "red" | "orange" | "blue" | null;
    icon?: React.ReactNode;
    className?: string;
    formula?: string; // shown on hover so the team can see how the number is calculated
}

export function MetricCard({ label, value, sublabel, flag, icon, className, formula }: MetricCardProps) {
    const flagColor = {
        green: "border-l-kpi-green",
        red: "border-l-kpi-red",
        orange: "border-l-kpi-orange",
        blue: "border-l-kpi-blue",
    };
    return (
        <div
            className={cn(
                "bg-white rounded-lg shadow-sm border border-zinc-200 p-5 border-l-4",
                flag ? flagColor[flag] : "border-l-zinc-300",
                className
            )}
        >
            <div className="flex items-start justify-between">
                <div>
                    <div className="text-xs font-medium uppercase tracking-wide text-zinc-500 flex items-center gap-1">
                        {label}
                        {formula && (
                            <span className="relative inline-flex group">
                                <Info className="w-3.5 h-3.5 text-zinc-400 cursor-help" />
                                <span
                                    role="tooltip"
                                    className="pointer-events-none absolute left-1/2 top-5 z-20 hidden group-hover:block w-60 -translate-x-1/2 rounded-md bg-zinc-900 px-3 py-2 text-xs font-normal normal-case tracking-normal text-white shadow-lg"
                                >
                                    {formula}
                                </span>
                            </span>
                        )}
                    </div>
                    <div className="mt-1 text-3xl font-semibold text-zinc-900">{value}</div>
                    {sublabel && <div className="mt-1 text-xs text-zinc-500">{sublabel}</div>}
                </div>
                {icon && <div className="text-zinc-400">{icon}</div>}
            </div>
        </div>
    );
}
