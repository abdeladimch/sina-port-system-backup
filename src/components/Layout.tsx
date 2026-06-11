import { Link, Outlet, useLocation } from "react-router-dom";
import { LogOut, LayoutDashboard, GaugeCircle, AlertCircle, Trophy, FlaskConical } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const COMMON_LOG_NAV = [
    { label: "Log bottleneck", to: "/log/bottleneck", icon: AlertCircle },
    { label: "Log winner", to: "/log/winner", icon: Trophy },
    { label: "Log test input", to: "/log/test-input", icon: FlaskConical },
];

const NAV_BY_DEPARTMENT: Record<string, { label: string; to: string; icon: typeof LayoutDashboard }[]> = {
    Admin: [
        { label: "Dashboard", to: "/ea", icon: LayoutDashboard },
        { label: "KPI Dictionary", to: "/kpis", icon: GaugeCircle },
        ...COMMON_LOG_NAV,
    ],
    Setter: [
        { label: "Today", to: "/setter", icon: LayoutDashboard },
        ...COMMON_LOG_NAV,
    ],
    Closer: [
        { label: "Today", to: "/closer", icon: LayoutDashboard },
        ...COMMON_LOG_NAV,
    ],
    Delivery: [
        { label: "Today", to: "/sm", icon: LayoutDashboard },
        ...COMMON_LOG_NAV,
    ],
};

export function Layout() {
    const { person, signOut, user } = useAuth();
    const location = useLocation();
    const nav = NAV_BY_DEPARTMENT[person?.department ?? ""] ?? [];

    return (
        <div className="min-h-screen flex">
            <aside className="w-60 bg-zinc-900 text-zinc-100 flex flex-col">
                <div className="px-6 py-5 border-b border-zinc-800">
                    <div className="text-sm font-semibold tracking-tight">Sina Port</div>
                    <div className="text-xs text-zinc-400 truncate">{person?.full_name ?? user?.email}</div>
                    <div className="text-xs text-zinc-500">{person?.role ?? ""}</div>
                </div>
                <nav className="flex-1 px-3 py-3 space-y-1">
                    {nav.map((item) => {
                        const Icon = item.icon;
                        const active = location.pathname === item.to;
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                                    active
                                        ? "bg-zinc-800 text-white"
                                        : "text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <button
                    onClick={() => void signOut()}
                    className="m-3 flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white border border-zinc-800 rounded-md"
                >
                    <LogOut className="w-4 h-4" />
                    Sign out
                </button>
            </aside>
            <main className="flex-1 p-8">
                <Outlet />
            </main>
        </div>
    );
}
