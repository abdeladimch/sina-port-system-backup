import { cn } from "@/lib/utils";

interface MetricCardProps {
    label: string;
    value: string | number;
    sublabel?: string;
    flag?: "green" | "red" | "orange" | "blue" | null;
    icon?: React.ReactNode;
    className?: string;
}

export function MetricCard({ label, value, sublabel, flag, icon, className }: MetricCardProps) {
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
                    <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</div>
                    <div className="mt-1 text-3xl font-semibold text-zinc-900">{value}</div>
                    {sublabel && <div className="mt-1 text-xs text-zinc-500">{sublabel}</div>}
                </div>
                {icon && <div className="text-zinc-400">{icon}</div>}
            </div>
        </div>
    );
}
