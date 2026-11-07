"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { StatCard, Card, BtnPrimary, CardSkeleton } from "@/components/dashboard/shared";
import { api } from "@/api-client";
import {
  Truck,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  ArrowRight,
  Building2,
  Activity,
  AlertTriangle,
} from "lucide-react";

interface Partner {
  id: string;
  name: string;
  name_ar?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  city?: string;
  status: string;
}

interface Vehicle {
  id: string;
  model: string;
  license_plate: string;
  approval_status: string;
  is_active: boolean;
}

interface Driver {
  id: string;
  name: string;
  phone?: string;
  approval_status: string;
  is_active: boolean;
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; color: string; icon: React.ReactNode; label: string }> = {
    approved: { bg: "var(--success-light)", color: "var(--success)", icon: <CheckCircle size={12} />, label: "Approved" },
    pending: { bg: "var(--amber-light)", color: "var(--amber)", icon: <Clock size={12} />, label: "Pending" },
    rejected: { bg: "var(--danger-light)", color: "var(--danger)", icon: <XCircle size={12} />, label: "Rejected" },
    suspended: { bg: "var(--danger-light)", color: "var(--danger)", icon: <XCircle size={12} />, label: "Suspended" },
  };
  const c = config[status] || config.pending;
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[.68rem] font-semibold" style={{ background: c.bg, color: c.color }}>
      {c.icon} {c.label}
    </span>
  );
}

export default function PartnerOverviewPage() {
  const router = useRouter();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const partners = await api.get<Partner[]>("/api/partners");
      if (partners.length === 0) { setLoading(false); return; }
      const p = partners[0];
      setPartner(p);
      const [vehs, drvs] = await Promise.all([
        api.get<Vehicle[]>(`/api/partners/${p.id}/vehicles`),
        api.get<Driver[]>(`/api/partners/${p.id}/drivers`),
      ]);
      setVehicles(vehs);
      setDrivers(drvs);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return (
      <div style={{ animation: "fadeIn .3s ease" }}>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (!partner) {
    return <div className="flex items-center justify-center min-h-[400px]" style={{ color: "var(--fg-muted)" }}><p>No partner account found.</p></div>;
  }

  const approvedVehicles = vehicles.filter((v) => v.approval_status === "approved").length;
  const pendingVehicles = vehicles.filter((v) => v.approval_status === "pending").length;
  const approvedDrivers = drivers.filter((d) => d.approval_status === "approved").length;
  const pendingDrivers = drivers.filter((d) => d.approval_status === "pending").length;

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1" style={{ color: "var(--fg-muted)" }}>
          <Building2 size={16} />
          <span className="text-[.72rem] font-semibold uppercase tracking-wider">Partner Portal</span>
        </div>
        <h1 className="text-[1.6rem] font-bold">Welcome back, {partner.contact_name || partner.name}</h1>
        <p className="text-[.85rem]" style={{ color: "var(--fg-muted)" }}>{partner.name} — {partner.city || "Cairo"}</p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4 mb-6">
        <StatCard label="Total Vehicles" value={vehicles.length} sub={`${pendingVehicles} pending approval`} />
        <StatCard label="Approved Vehicles" value={approvedVehicles} valueColor="var(--success)" sub="Ready for assignment" />
        <StatCard label="Total Drivers" value={drivers.length} sub={`${pendingDrivers} pending approval`} />
        <StatCard label="Approved Drivers" value={approvedDrivers} valueColor="var(--success)" sub="Ready for assignment" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--brand-light)", color: "var(--brand)" }}><Truck size={20} /></div>
              <div>
                <h3 className="text-[.85rem] font-bold">Add Vehicle</h3>
                <p className="text-[.72rem]" style={{ color: "var(--fg-muted)" }}>Register a new vehicle</p>
              </div>
            </div>
            <BtnPrimary onClick={() => router.push("/dashboard/partner-vehicles")}><Plus size={14} /> Add Vehicle</BtnPrimary>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--blue-light)", color: "var(--blue)" }}><Users size={20} /></div>
              <div>
                <h3 className="text-[.85rem] font-bold">Add Driver</h3>
                <p className="text-[.72rem]" style={{ color: "var(--fg-muted)" }}>Register a new driver</p>
              </div>
            </div>
            <BtnPrimary onClick={() => router.push("/dashboard/partner-drivers")}><Plus size={14} /> Add Driver</BtnPrimary>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--amber-light)", color: "var(--amber)" }}><Activity size={20} /></div>
              <div>
                <h3 className="text-[.85rem] font-bold">View Accounting</h3>
                <p className="text-[.72rem]" style={{ color: "var(--fg-muted)" }}>Financial overview</p>
              </div>
            </div>
            <BtnPrimary onClick={() => router.push("/dashboard/partner-accounting")}><ArrowRight size={14} /> View</BtnPrimary>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
            <h2 className="text-[.95rem] font-bold flex items-center gap-2"><Truck size={17} style={{ color: "var(--brand)" }} /> Vehicle Status</h2>
            <button className="text-[.72rem] font-semibold cursor-pointer border-none bg-transparent" style={{ color: "var(--brand)" }} onClick={() => router.push("/dashboard/partner-vehicles")}>View All →</button>
          </div>
          <div className="p-5 space-y-3">
            {vehicles.length === 0
              ? <p className="text-[.82rem]" style={{ color: "var(--fg-muted)" }}>No vehicles registered yet.</p>
              : vehicles.slice(0, 5).map((v) => (
                <div key={v.id} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--border)" }}>
                  <div><p className="text-[.82rem] font-semibold">{v.model}</p><p className="text-[.72rem]" style={{ color: "var(--fg-muted)" }}>{v.license_plate}</p></div>
                  <StatusBadge status={v.approval_status} />
                </div>
              ))}
          </div>
        </Card>
        <Card>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
            <h2 className="text-[.95rem] font-bold flex items-center gap-2"><Users size={17} style={{ color: "var(--brand)" }} /> Driver Status</h2>
            <button className="text-[.72rem] font-semibold cursor-pointer border-none bg-transparent" style={{ color: "var(--brand)" }} onClick={() => router.push("/dashboard/partner-drivers")}>View All →</button>
          </div>
          <div className="p-5 space-y-3">
            {drivers.length === 0
              ? <p className="text-[.82rem]" style={{ color: "var(--fg-muted)" }}>No drivers registered yet.</p>
              : drivers.slice(0, 5).map((d) => (
                <div key={d.id} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--border)" }}>
                  <div><p className="text-[.82rem] font-semibold">{d.name}</p><p className="text-[.72rem]" style={{ color: "var(--fg-muted)" }}>{d.phone || "—"}</p></div>
                  <StatusBadge status={d.approval_status} />
                </div>
              ))}
          </div>
        </Card>
      </div>

      {(pendingVehicles > 0 || pendingDrivers > 0) && (
        <Card>
          <div className="p-5">
            <h2 className="text-[.95rem] font-bold flex items-center gap-2 mb-3"><AlertTriangle size={17} style={{ color: "var(--amber)" }} /> Pending Actions</h2>
            <div className="space-y-2">
              {pendingVehicles > 0 && <div className="flex items-center gap-2 text-[.82rem]" style={{ color: "var(--amber)" }}><Clock size={14} /><span>{pendingVehicles} vehicle(s) awaiting admin approval</span></div>}
              {pendingDrivers > 0 && <div className="flex items-center gap-2 text-[.82rem]" style={{ color: "var(--amber)" }}><Clock size={14} /><span>{pendingDrivers} driver(s) awaiting admin approval</span></div>}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
