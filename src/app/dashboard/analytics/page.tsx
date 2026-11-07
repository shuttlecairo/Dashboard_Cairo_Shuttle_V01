"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, StatCard, CardSkeleton } from "@/components/dashboard/shared";
import { useToast } from "@/components/shared/toast";
import { BarChart3, Users, MapPin, TrendingUp, DollarSign, Truck, Percent } from "lucide-react";

function formatEGP(n: number) { return n.toLocaleString("en-EG") + " EGP"; }

export default function AnalyticsPage() {
  const { show } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({});
  const [trips, setTrips] = useState<any[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [aRes, tRes] = await Promise.all([
        fetch("/api/analytics").then(r => r.json()),
        fetch("/api/trips").then(r => r.json()),
      ]);
      setData(aRes.success ? aRes.data : {});
      setTrips(tRes.success ? tRes.data : []);
    } catch { show("Failed to load analytics", "danger"); }
    setLoading(false);
  }, [show]);

  useEffect(() => { load(); }, [load]);

  const completedTrips = trips.filter(t => t.status === "completed");
  const avgOccupancy = completedTrips.length ? Math.round(completedTrips.reduce((s, t) => s + (t.booked_seats / Math.max(1, t.total_seats)) * 100, 0) / completedTrips.length) : 0;

  // route popularity
  const routeCounts: Record<string, { name: string; count: number; revenue: number }> = {};
  trips.forEach(t => {
    const n = t.route_name || "Unknown";
    if (!routeCounts[n]) routeCounts[n] = { name: n, count: 0, revenue: 0 };
    routeCounts[n].count++;
    routeCounts[n].revenue += Number(t.price || 0) * Number(t.booked_seats || 0);
  });
  const topRoutes = Object.values(routeCounts).sort((a, b) => b.count - a.count).slice(0, 5);

  // trips by status
  const statusCounts: Record<string, number> = {};
  trips.forEach(t => { statusCounts[t.status] = (statusCounts[t.status] || 0) + 1; });

  if (loading) return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <h1 className="text-[1.6rem] font-bold mb-6 flex items-center gap-2"><BarChart3 size={24} style={{ color: "var(--brand)" }} /> Analytics</h1>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4 mb-6">{[1,2,3,4].map(i => <CardSkeleton key={i} />)}</div>
    </div>
  );

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <h1 className="text-[1.6rem] font-bold mb-6 flex items-center gap-2"><BarChart3 size={24} style={{ color: "var(--brand)" }} /> Analytics</h1>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4 mb-6">
        <StatCard label="Total Revenue" value={formatEGP(data.total_revenue || 0)} icon={<DollarSign size={20} />} />
        <StatCard label="Total Bookings" value={String(data.total_bookings || 0)} icon={<Users size={20} />} />
        <StatCard label="Active Routes" value={String(data.active_routes || 0)} icon={<MapPin size={20} />} />
        <StatCard label="Avg Occupancy" value={`${avgOccupancy}%`} icon={<Percent size={20} />} />
        <StatCard label="Total Trips" value={String(trips.length)} icon={<Truck size={20} />} />
        <StatCard label="Active Drivers" value={String(data.active_drivers || 0)} icon={<Users size={20} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Top Routes */}
        <Card>
          <div className="p-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <h2 className="text-[.95rem] font-bold flex items-center gap-2"><TrendingUp size={17} style={{ color: "var(--brand)" }} /> Top Routes</h2>
          </div>
          <div className="p-4 space-y-3">
            {topRoutes.map((r, i) => {
              const maxCount = topRoutes[0]?.count || 1;
              return (
                <div key={r.name}>
                  <div className="flex justify-between text-[.78rem] mb-1">
                    <span className="font-medium">{i + 1}. {r.name}</span>
                    <span style={{ color: "var(--fg-muted)" }}>{r.count} trips · {formatEGP(r.revenue)}</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: "var(--bg)" }}>
                    <div className="h-full rounded-full" style={{ width: `${(r.count / maxCount) * 100}%`, background: "var(--brand)", opacity: 1 - i * 0.15 }} />
                  </div>
                </div>
              );
            })}
            {topRoutes.length === 0 && <p className="text-[.78rem]" style={{ color: "var(--fg-muted)" }}>No trip data yet</p>}
          </div>
        </Card>

        {/* Trip Status Breakdown */}
        <Card>
          <div className="p-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <h2 className="text-[.95rem] font-bold flex items-center gap-2"><BarChart3 size={17} style={{ color: "var(--brand)" }} /> Trips by Status</h2>
          </div>
          <div className="p-4">
            <div className="flex items-end gap-3 h-48 justify-center">
              {Object.entries(statusCounts).map(([status, count]) => {
                const max = Math.max(1, ...Object.values(statusCounts));
                const colors: Record<string, string> = { completed: "var(--success)", scheduled: "var(--blue, #2563eb)", in_progress: "var(--amber)", cancelled: "var(--danger)" };
                return (
                  <div key={status} className="flex flex-col items-center gap-1">
                    <span className="text-[.72rem] font-bold">{count}</span>
                    <div style={{ width: 36, height: (count / max) * 140, background: colors[status] || "var(--brand)", borderRadius: 6, opacity: 0.8 }} />
                    <span className="text-[.62rem] capitalize" style={{ color: "var(--fg-muted)" }}>{status.replace(/_/g, " ")}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Occupancy by Route */}
      <Card>
        <div className="p-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="text-[.95rem] font-bold flex items-center gap-2"><Percent size={17} style={{ color: "var(--brand)" }} /> Occupancy Rate by Route</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[.82rem]">
            <thead><tr style={{ background: "var(--bg)" }}>
              {["Route", "Total Trips", "Avg Seats Booked", "Avg Capacity", "Occupancy"].map(h => (
                <th key={h} className="p-3 text-left text-[.72rem] font-semibold" style={{ color: "var(--fg-muted)" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {topRoutes.map(r => {
                const rTrips = trips.filter(t => t.route_name === r.name);
                const avgBooked = rTrips.length ? Math.round(rTrips.reduce((s, t) => s + Number(t.booked_seats || 0), 0) / rTrips.length) : 0;
                const avgTotal = rTrips.length ? Math.round(rTrips.reduce((s, t) => s + Number(t.total_seats || 1), 0) / rTrips.length) : 0;
                const occ = avgTotal ? Math.round((avgBooked / avgTotal) * 100) : 0;
                return (
                  <tr key={r.name} style={{ borderTop: "1px solid var(--border)" }}>
                    <td className="p-3 font-medium">{r.name}</td>
                    <td className="p-3">{r.count}</td>
                    <td className="p-3">{avgBooked}</td>
                    <td className="p-3">{avgTotal}</td>
                    <td className="p-3"><span className="font-semibold" style={{ color: occ >= 70 ? "var(--success)" : occ >= 40 ? "var(--amber)" : "var(--danger)" }}>{occ}%</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
