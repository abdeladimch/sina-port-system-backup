import { Calendar, UserPlus } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { LoadingState, EmptyState } from "@/components/LoadingState";
import { SetterTrackingDaily } from "@/components/SetterTrackingDaily";
import { RegistrySections } from "@/components/RegistrySections";
import { DateRangeFilter, useDateRange } from "@/components/DateRangeFilter";
import { useRoleView, useRangeView } from "@/hooks/useRoleView";
import type { DashboardMetric } from "@/types/schema";
import { formatDateTime } from "@/lib/utils";

interface Booking {
    calendly_event_id: string;
    lead_id: string | null;
    event_name: string;
    host: string;
    lead_name: string;
    lead_email: string;
    status: string;
    start_time: string;
    booked_at: string;
    hours_until_call: number;
}

const ICON_BY_METRIC: Record<string, React.ReactNode> = {
    bookings: <Calendar className="w-5 h-5" />,
    new_leads: <UserPlus className="w-5 h-5" />,
};

const LABEL_BY_METRIC: Record<string, string> = {
    bookings: "Bookings",
    new_leads: "New leads",
};

export function SetterDashboard() {
    const [range, setRange] = useDateRange();
    const metrics = useRangeView<DashboardMetric>("fn_setter_dashboard", range);
    const bookings = useRangeView<Booking>("fn_setter_recent_bookings", range);

    return (
        <div className="space-y-8">
            <header className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-semibold text-zinc-900">Your day</h1>
                    <p className="text-sm text-zinc-500">Your bookings and pipeline for the selected range.</p>
                </div>
                <DateRangeFilter value={range} onChange={setRange} />
            </header>

            {metrics.loading ? (
                <LoadingState label="Loading metrics..." />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(metrics.data ?? []).map((m) => (
                        <MetricCard
                            key={m.metric}
                            label={LABEL_BY_METRIC[m.metric] ?? m.metric}
                            value={m.value}
                            icon={ICON_BY_METRIC[m.metric]}
                        />
                    ))}
                </div>
            )}

            <section>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-semibold text-zinc-900">Inbound bookings (Calendly)</h2>
                    <div className="text-xs text-zinc-500">From Calendly / Google Calendar · {range.label}</div>
                </div>
                {bookings.loading ? (
                    <LoadingState />
                ) : bookings.data && bookings.data.length > 0 ? (
                    <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-zinc-50 text-zinc-600 text-left text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-2">Lead ID</th>
                                    <th className="px-4 py-2">Lead</th>
                                    <th className="px-4 py-2">Email</th>
                                    <th className="px-4 py-2">Host / triager</th>
                                    <th className="px-4 py-2">Event</th>
                                    <th className="px-4 py-2">When</th>
                                    <th className="px-4 py-2">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {bookings.data.slice(0, 12).map((b) => (
                                    <tr key={b.calendly_event_id}>
                                        <td className="px-4 py-2 font-mono text-xs text-zinc-500">{b.lead_id || "-"}</td>
                                        <td className="px-4 py-2 font-medium text-zinc-900">{b.lead_name || "-"}</td>
                                        <td className="px-4 py-2 text-zinc-600">{b.lead_email || "-"}</td>
                                        <td className="px-4 py-2 text-zinc-600">{b.host || "-"}</td>
                                        <td className="px-4 py-2 text-zinc-600">{b.event_name ?? "-"}</td>
                                        <td className="px-4 py-2 text-zinc-600">{formatDateTime(b.start_time)}</td>
                                        <td className="px-4 py-2">
                                            <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                                                {b.status ?? "-"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <EmptyState
                        title="No bookings yet"
                        description="When leads book through your Calendly link, they'll appear here."
                    />
                )}
            </section>

            <SetterTrackingDaily range={range} />

            <RegistrySections />
        </div>
    );
}
