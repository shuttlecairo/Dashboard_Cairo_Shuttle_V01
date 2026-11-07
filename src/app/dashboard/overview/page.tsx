"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, StatCard, BtnSuccess, BtnDanger, CardSkeleton } from "@/components/dashboard/shared";
import { useToast } from "@/components/shared/toast";
import {
  BarChart3, DollarSign, MapPin, Users, Truck, Clock,
  AlertTriangle, CheckCircle, XCircle, ChevronRight, Plus,
} from "lucide-react";

function formatEGP(n: number) { return n.toLocaleString("en-EG") + " EGP"; }

const statusColor: Record<string, { bg: string; fg: string }> = {
  scheduled: { bg: "var(--blue-light, #e8f4fd)", fg: "var(--blue, #2563eb)" },
  in_progress: { bg: "var(--amber-light)", fg: "var(--amber)" },
  completed: { bg: "var(--success-light)", fg: "var(--success)" },
  cancelled: { bg: "var(--danger-light, #fee)", fg: "var(--danger)" },
};

function StatusPill({ status }: { status: string }) {
  const c = statusColor[status] || { bg: "var(--bg)", fg: "var(--fg-muted)" };
  return (
    <span className="inline-flex rounded-full px-2.5 py-1 text-[.68rem] font-semibold capitalize" style={{ background: c.bg, color: c.fg }}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export default function OverviewPage() {
  const { show } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [recentTrips, setRecentTrips] = useState<any[]>([]);
  const [pendingVehicles, setPendingVehicles] = useState<any[]>([]);
  const [pendingDrivers, setPendingDrivers] = useState<any[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [analyticsRes, tripsRes, vehiclesRes, driversRes] = await Promise.all([
        fetch("/api/analytics").then(r => r.json()),
        fetch("/api/trips").then(r => r.json()),
        fetch("/api/vehicles").then(r => r.json()),
        fetch("/api/drivers").then(r => r.json()),
      ]);
      setStats(analyticsRes.success ? analyticsRes.data : {});
      setRecentTrips(tripsRes.success ? tripsRes.data.slice(0, 5) : []);
      setPendingVehicles(vehiclesRes.success ? vehiclesRes.data.filter((v: any) => v.approval_status === "pending") : []);
      setPendingDrivers(driversRes.success ? driversRes.data.filter((d: any) => d.approval_status === "pending") : []);
    } catch { show("Failed to load dashboard", "danger"); }
    setLoading(false);
  }, [show]);

  useEffect(() => { load(); }, [load]);

  async function handleApproval(entityType: string, entityId: string, action: string) {
    try {
      const res = await fetch("/api/approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity_type: entityType, entity_id: entityId, action, reviewer_name: "Admin" }),
      });
      const json = await res.json();
      if (json.success) { show(`${entityType} ${action} successfully`, "success"); load(); }
      else show(json.error || "Failed", "danger");
    } catch { show("Network error", "danger"); }
  }

  if (loading) return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <h1 className="text-[1.6rem] font-bold mb-6 flex items-center gap-2"><BarChart3 size={24} style={{ color: "var(--brand)" }} /> Dashboard Overview</h1>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-6">{[1,2,3,4,5].map(i => <CardSkeleton key={i} />)}</div>
    </div>
  );

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <h1 className="text-[1.6rem] font-bold mb-6 flex items-center gap-2">
        <BarChart3 size={24} style={{ color: "var(--brand)" }} /> Dashboard Overview
      </h1>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4 mb-6">
        <StatCard label="Total Revenue" value={formatEGP(stats.total_revenue || 0)} />
        <StatCard label="Total Bookings" value={String(stats.total_bookings || 0)} />
        <StatCard label="Active Routes" value={String(stats.active_routes || 0)} />
        <StatCard label="Active Drivers" value={String(stats.active_drivers || 0)} />
        <StatCard label="Pending Approvals" value={String(pendingVehicles.length + pendingDrivers.length)} valueColor="var(--amber)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Create Trip", icon: Plus, href: "/dashboard/trips" },
          { label: "Add Route", icon: MapPin, href: "/dashboard/routes" },
          { label: "View Partners", icon: Truck, href: "/dashboard/partners" },
        ].map(a => (
          <a key={a.label} href={a.href} className="no-underline">
            <Card>
              <div className="p-4 flex items-center gap-3 cursor-pointer" style={{ color: "var(--fg)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--brand-light)", color: "var(--brand)" }}>
                  <a.icon size={18} />
                </div>
                <span className="text-[.85rem] font-semibold flex-1">{a.label}</span>
                <ChevronRight size={16} style={{ color: "var(--fg-muted)" }} />
              </div>
            </Card>
          </a>
        ))}
      </div>

      <Card>
        <div className="p-4 flex justify-between items-center" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="text-[.95rem] font-bold flex items-center gap-2"><Clock size={17} style={{ color: "var(--brand)" }} /> Recent Trips</h2>
          <a href="/dashboard/trips" className="text-[.72rem] font-semibold no-underline" style={{ color: "var(--brand)" }}>View All →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[.82rem]">
            <thead><tr style={{ background: "var(--bg)" }}>
              {["Route", "Driver", "Vehicle", "Departure", "Seats", "Status"].map(h => (
                <th key={h} className="p-3 text-left text-[.72rem] font-semibold" style={{ color: "var(--fg-muted)" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {recentTrips.map((t: any) => (
                <tr key={t.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td className="p-3 font-medium">{t.route_name || "—"}</td>
                  <td className="p-3">{t.driver_name || "—"}</td>
                  <td className="p-3">{t.vehicle_plate || "—"}</td>
                  <td className="p-3 whitespace-nowrap">{t.departure_time ? new Date(t.departure_time).toLocaleString("en-EG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                  <td className="p-3">{t.booked_seats}/{t.total_seats}</td>
                  <td className="p-3"><StatusPill status={t.status} /></td>
                </tr>
              ))}
              {recentTrips.length === 0 && <tr><td colSpan={6} className="p-6 text-center" style={{ color: "var(--fg-muted)" }}>No trips found</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      {(pendingVehicles.length > 0 || pendingDrivers.length > 0) && (
        <Card>
          <div className="p-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <h2 className="text-[.95rem] font-bold flex items-center gap-2"><AlertTriangle size={17} style={{ color: "var(--amber)" }} /> Pending Approvals</h2>
          </div>
          <div className="p-4 space-y-3">
            {pendingVehicles.map((v: any) => (
              <div key={v.id} className="flex items-center justify-between p-3 rounded-lg flex-wrap gap-2" style={{ background: "var(--bg)" }}>
                <div>
                  <div className="text-[.82rem] font-semibold flex items-center gap-2"><Truck size={14} style={{ color: "var(--brand)" }} /> {v.model}</div>
                  <div className="text-[.72rem]" style={{ color: "var(--fg-muted)" }}>{v.license_plate} · {v.partner_name || "—"}</div>
                </div>
                <div className="flex gap-2">
                  <BtnSuccess onClick={() => handleApproval("vehicle", v.id, "approved")}><CheckCircle size={13} /> Approve</BtnSuccess>
                  <BtnDanger onClick={() => handleApproval("vehicle", v.id, "rejected")}><XCircle size={13} /> Reject</BtnDanger>
                </div>
              </div>
            ))}
            {pendingDrivers.map((d: any) => (
              <div key={d.id} className="flex items-center justify-between p-3 rounded-lg flex-wrap gap-2" style={{ background: "var(--bg)" }}>
                <div>
                  <div className="text-[.82rem] font-semibold flex items-center gap-2"><Users size={14} style={{ color: "var(--brand)" }} /> {d.name}</div>
                  <div className="text-[.72rem]" style={{ color: "var(--fg-muted)" }}>{d.phone} · {d.partner_name || "—"}</div>
                </div>
                <div className="flex gap-2">
                  <BtnSuccess onClick={() => handleApproval("driver", d.id, "approved")}><CheckCircle size={13} /> Approve</BtnSuccess>
                  <BtnDanger onClick={() => handleApproval("driver", d.id, "rejected")}><XCircle size={13} /> Reject</BtnDanger>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
