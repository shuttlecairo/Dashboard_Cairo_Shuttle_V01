"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, StatCard, EmptyState, CardSkeleton } from "@/components/dashboard/shared";
import { useToast } from "@/components/shared/toast";
import { User, MapPin, Clock, CheckCircle, Navigation, Calendar, DollarSign, Truck } from "lucide-react";

function formatEGP(n: number) { return n.toLocaleString("en-EG") + " EGP"; }

const statusColors: Record<string, { bg: string; fg: string }> = {
  scheduled: { bg: "var(--blue-light, #e8f4fd)", fg: "var(--blue, #2563eb)" },
  in_progress: { bg: "var(--amber-light)", fg: "var(--amber)" },
  completed: { bg: "var(--success-light)", fg: "var(--success)" },
  cancelled: { bg: "var(--danger-light, #fee)", fg: "var(--danger)" },
};

function StatusPill({ status }: { status: string }) {
  const c = statusColors[status] || { bg: "var(--bg)", fg: "var(--fg-muted)" };
  return <span className="inline-flex rounded-full px-2.5 py-1 text-[.68rem] font-semibold capitalize" style={{ background: c.bg, color: c.fg }}>{status.replace(/_/g, " ")}</span>;
}

export default function DriverDashboardPage() {
  const { show } = useToast();
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<any[]>([]);
  const [driverId] = useState<string | null>(null); // would be from auth context

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/trips").then(r => r.json());
      // In production, filter by authenticated driver. For now, show all.
      setTrips(res.success ? res.data : []);
    } catch { show("Failed to load trips", "danger"); }
    setLoading(false);
  }, [show]);

  useEffect(() => { load(); }, [load]);

  const today = new Date().toISOString().slice(0, 10);
  const todayTrips = trips.filter(t => t.departure_time?.startsWith(today));
  const upcomingTrips = trips.filter(t => t.status === "scheduled" && t.departure_time > new Date().toISOString());
  const completedTrips = trips.filter(t => t.status === "completed");
  const totalEarnings = completedTrips.reduce((s, t) => s + Number(t.price || 0), 0);

  async function updateTripStatus(tripId: string, status: string) {
    try {
           const res = await fetch(`/api/trips/${tripId}`, {

      // const res = await fetch(`/api/trips?id=${tripId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.success) { show(`Trip ${status.replace(/_/g, " ")}`, "success"); load(); }
      else show(json.error || "Failed", "danger");
    } catch { show("Network error", "danger"); }
  }

  if (loading) return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <h1 className="text-[1.6rem] font-bold mb-6 flex items-center gap-2"><User size={24} style={{ color: "var(--brand)" }} /> Driver Dashboard</h1>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">{[1,2,3,4].map(i => <CardSkeleton key={i} />)}</div>
    </div>
  );

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <h1 className="text-[1.6rem] font-bold mb-6 flex items-center gap-2"><User size={24} style={{ color: "var(--brand)" }} /> Driver Dashboard</h1>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4 mb-6">
        <StatCard label="Today's Trips" value={String(todayTrips.length)} icon={<Calendar size={20} />} />
        <StatCard label="Upcoming" value={String(upcomingTrips.length)} icon={<Clock size={20} />} />
        <StatCard label="Completed" value={String(completedTrips.length)} icon={<CheckCircle size={20} />} />
        <StatCard label="Total Earnings" value={formatEGP(totalEarnings)} icon={<DollarSign size={20} />} />
      </div>

      {/* Current / Next Trip */}
      {todayTrips.length > 0 && (
        <Card>
          <div className="p-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <h2 className="text-[.95rem] font-bold flex items-center gap-2"><Navigation size={17} style={{ color: "var(--brand)" }} /> Today&apos;s Trips</h2>
          </div>
          <div className="p-4 space-y-3">
            {todayTrips.map(t => (
              <div key={t.id} className="p-4 rounded-xl" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-[.85rem] font-bold flex items-center gap-2"><MapPin size={14} style={{ color: "var(--brand)" }} /> {t.route_name || "Route"}</h3>
                    <div className="text-[.72rem] mt-1" style={{ color: "var(--fg-muted)" }}>
                      {t.departure_time ? new Date(t.departure_time).toLocaleString("en-EG", { hour: "2-digit", minute: "2-digit" }) : "—"}
                      {" · "}{t.booked_seats}/{t.total_seats} seats · {t.vehicle_plate || "No vehicle"}
                    </div>
                  </div>
                  <StatusPill status={t.status} />
                </div>
                <div className="flex gap-2">
                  {t.status === "scheduled" && (
                    <button onClick={() => updateTripStatus(t.id, "in_progress")} className="px-3 py-1.5 rounded-lg text-[.75rem] font-semibold text-white" style={{ background: "var(--brand)" }}>
                      <Navigation size={12} className="inline mr-1" /> Start Trip
                    </button>
                  )}
                  {t.status === "in_progress" && (
                    <button onClick={() => updateTripStatus(t.id, "completed")} className="px-3 py-1.5 rounded-lg text-[.75rem] font-semibold text-white" style={{ background: "var(--success)" }}>
                      <CheckCircle size={12} className="inline mr-1" /> Complete Trip
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Upcoming Trips */}
      <Card>
        <div className="p-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="text-[.95rem] font-bold flex items-center gap-2"><Clock size={17} style={{ color: "var(--brand)" }} /> Upcoming Trips</h2>
        </div>
        {upcomingTrips.length === 0 ? (
          <div className="p-6 text-center text-[.82rem]" style={{ color: "var(--fg-muted)" }}>No upcoming trips scheduled</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[.82rem]">
              <thead><tr style={{ background: "var(--bg)" }}>
                {["Route", "Date", "Time", "Vehicle", "Seats", "Status"].map(h => (
                  <th key={h} className="p-3 text-left text-[.72rem] font-semibold" style={{ color: "var(--fg-muted)" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {upcomingTrips.slice(0, 10).map(t => (
                  <tr key={t.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td className="p-3 font-medium">{t.route_name || "—"}</td>
                    <td className="p-3 whitespace-nowrap">{t.departure_time ? new Date(t.departure_time).toLocaleDateString("en-EG") : "—"}</td>
                    <td className="p-3">{t.departure_time ? new Date(t.departure_time).toLocaleTimeString("en-EG", { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                    <td className="p-3">{t.vehicle_plate || "—"}</td>
                    <td className="p-3">{t.booked_seats}/{t.total_seats}</td>
                    <td className="p-3"><StatusPill status={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Recent Completed */}
      <Card>
        <div className="p-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="text-[.95rem] font-bold flex items-center gap-2"><CheckCircle size={17} style={{ color: "var(--success)" }} /> Recent Completed Trips</h2>
        </div>
        {completedTrips.length === 0 ? (
          <div className="p-6 text-center text-[.82rem]" style={{ color: "var(--fg-muted)" }}>No completed trips yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[.82rem]">
              <thead><tr style={{ background: "var(--bg)" }}>
                {["Route", "Date", "Passengers", "Earnings"].map(h => (
                  <th key={h} className="p-3 text-left text-[.72rem] font-semibold" style={{ color: "var(--fg-muted)" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {completedTrips.slice(0, 5).map(t => (
                  <tr key={t.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td className="p-3 font-medium">{t.route_name || "—"}</td>
                    <td className="p-3 whitespace-nowrap">{t.departure_time ? new Date(t.departure_time).toLocaleDateString("en-EG") : "—"}</td>
                    <td className="p-3">{t.booked_seats}</td>
                    <td className="p-3 font-semibold" style={{ color: "var(--success)" }}>{formatEGP(Number(t.price || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
