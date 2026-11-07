"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bus, Plus, Edit2, Trash2, Calendar, Clock, Users,
  AlertTriangle, CheckCircle, XCircle, MapPin,
} from "lucide-react";
import {
  Card, BtnPrimary, BtnOutline, IconBtn, FormGroup,
  Modal, SearchInput, EmptyState, TableSkeleton, StatCard,
} from "@/components/dashboard/shared";
import { useToast } from "@/components/shared/toast";
import { inputStyle } from "@/config/dashboard";
import { api } from "@/api-client";

/* eslint-disable @typescript-eslint/no-explicit-any */

function formatEGP(n: number) {
  return n.toLocaleString("en-EG") + " EGP";
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-EG", { day: "numeric", month: "short", year: "numeric" });
}
function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString("en-EG", { hour: "2-digit", minute: "2-digit" });
}

interface Route { id: string; name: string; name_ar?: string; default_price: number; duration_minutes: number; distance_km: number; }
interface Vehicle { id: string; model: string; license_plate: string; total_seats: number; bus_partners?: { name: string }; }
interface DriverOption { id: string; name: string; phone: string; bus_partners?: { name: string }; }
interface Trip {
  id: string;
  route_id: string;
  routes?: { id: string; name: string; name_ar?: string; duration_minutes?: number; distance_km?: number };
  driver_id: string;
  drivers?: { id: string; name: string; phone: string; approval_status?: string };
  vehicle_id: string;
  vehicles?: { id: string; model: string; license_plate: string; total_seats?: number; approval_status?: string };
  departure_time: string;
  arrival_time: string;
  price: number;
  total_seats: number;
  booked_seats: number;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  notes: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; bg: string; fg: string }> = {
  scheduled: { label: "Scheduled", bg: "var(--blue-light)", fg: "var(--blue)" },
  in_progress: { label: "In Progress", bg: "var(--amber-light)", fg: "var(--amber)" },
  completed: { label: "Completed", bg: "var(--success-light)", fg: "var(--success)" },
  cancelled: { label: "Cancelled", bg: "var(--danger-light)", fg: "var(--danger)" },
};

const statusPill = (status: string) => {
  const c = statusConfig[status] || statusConfig.scheduled;
  return <span className="text-[.68rem] px-2.5 py-1 rounded-full font-semibold" style={{ background: c.bg, color: c.fg }}>{c.label}</span>;
};

export default function TripsPage() {
  const { show } = useToast();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [driverOptions, setDriverOptions] = useState<DriverOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<Trip | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [availabilityWarning, setAvailabilityWarning] = useState("");

  const [form, setForm] = useState({
    route_id: "", driver_id: "", vehicle_id: "",
    departure_time: "", arrival_time: "", price: 0,
    total_seats: 14, status: "scheduled", notes: "",
  });

  const fetchAll = useCallback(async () => {
    try {
      const [tripsData, routesData, vehiclesData, driversData] = await Promise.all([
        api.get<Trip[]>("/api/trips"),
        api.get<Route[]>("/api/routes"),
        api.get<Vehicle[]>("/api/vehicles?approval_status=approved"),
        api.get<DriverOption[]>("/api/drivers?approval_status=approved"),
      ]);
      setTrips(tripsData);
      setRoutes(routesData);
      setVehicles(vehiclesData);
      setDriverOptions(driversData);
    } catch (e: any) {
      show(e?.message || "Failed to load data", "danger");
    } finally {
      setLoading(false);
    }
  }, [show]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = trips.filter((t) => {
    if (search) {
      const q = search.toLowerCase();
      const routeName = t.routes?.name || "";
      const driverName = t.drivers?.name || "";
      const vehicleLabel = t.vehicles ? `${t.vehicles.model} ${t.vehicles.license_plate}` : "";
      if (!routeName.toLowerCase().includes(q) && !driverName.toLowerCase().includes(q) && !vehicleLabel.toLowerCase().includes(q)) return false;
    }
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    return true;
  });

  const stats = {
    total: trips.length,
    scheduled: trips.filter((t) => t.status === "scheduled").length,
    inProgress: trips.filter((t) => t.status === "in_progress").length,
    completed: trips.filter((t) => t.status === "completed").length,
  };

  const openAdd = () => {
    setForm({ route_id: "", driver_id: "", vehicle_id: "", departure_time: "", arrival_time: "", price: 0, total_seats: 14, status: "scheduled", notes: "" });
    setEditing(null);
    setAvailabilityWarning("");
    setModal("add");
  };

  const openEdit = (t: Trip) => {
    setEditing(t);
    setForm({
      route_id: t.route_id, driver_id: t.driver_id || "", vehicle_id: t.vehicle_id || "",
      departure_time: t.departure_time ? new Date(t.departure_time).toISOString().slice(0, 16) : "",
      arrival_time: t.arrival_time ? new Date(t.arrival_time).toISOString().slice(0, 16) : "",
      price: t.price, total_seats: t.total_seats, status: t.status, notes: t.notes || "",
    });
    setAvailabilityWarning("");
    setModal("edit");
  };

  const onRouteChange = (routeId: string) => {
    const route = routes.find((r) => r.id === routeId);
    if (route) {
      setForm((f) => ({ ...f, route_id: routeId, price: route.default_price }));
    } else {
      setForm((f) => ({ ...f, route_id: routeId }));
    }
  };

  const checkAvailability = async () => {
    if (!form.driver_id || !form.vehicle_id || !form.departure_time || !form.arrival_time) return;
    try {
      const res = await api.post<{ available: boolean; conflicts: string[] }>("/api/trips/check-availability", {
        driver_id: form.driver_id, vehicle_id: form.vehicle_id,
        departure_time: form.departure_time, arrival_time: form.arrival_time,
        exclude_trip_id: editing?.id,
      });
      setAvailabilityWarning(res.available ? "" : (res.conflicts?.join("; ") || "Driver or vehicle has a scheduling conflict."));
    } catch { /* optional check */ }
  };

  useEffect(() => {
    if (modal) checkAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.driver_id, form.vehicle_id, form.departure_time, form.arrival_time]);

  const handleSave = async () => {
    if (!form.route_id) { show("Route is required", "danger"); return; }
    if (!form.departure_time) { show("Departure time is required", "danger"); return; }
    if (availabilityWarning) { show("Resolve availability conflicts first", "danger"); return; }
    setSaving(true);
    try {
      if (modal === "edit" && editing) {
        await api.patch(`/api/trips/${editing.id}`, form);
        show("Trip updated");
      } else {
        await api.post("/api/trips", form);
        show("Trip created");
      }
      setModal(null);
      fetchAll();
    } catch (e: any) {
      show(e?.message || "Failed to save", "danger");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this trip?")) return;
    setDeleting(id);
    try {
      await api.del(`/api/trips/${id}`);
      show("Trip deleted");
      fetchAll();
    } catch (e: any) {
      show(e?.message || "Failed to delete", "danger");
    } finally {
      setDeleting(null);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/api/trips/${id}`, { status });
      show(`Trip marked as ${status.replace("_", " ")}`);
      fetchAll();
    } catch (e: any) {
      show(e?.message || "Failed to update", "danger");
    }
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-[1.6rem] font-bold flex items-center gap-2">
            <Bus size={24} style={{ color: "var(--brand)" }} /> Trip Management
          </h1>
          <p className="text-[.82rem] mt-1" style={{ color: "var(--fg-muted)" }}>Schedule and manage shuttle trips</p>
        </div>
        <BtnPrimary onClick={openAdd}><Plus size={15} /> Schedule Trip</BtnPrimary>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Trips" value={stats.total} icon={<Bus size={20} />} />
        <StatCard label="Scheduled" value={stats.scheduled} icon={<Calendar size={20} />} color="var(--blue)" />
        <StatCard label="In Progress" value={stats.inProgress} icon={<Clock size={20} />} color="var(--amber)" />
        <StatCard label="Completed" value={stats.completed} icon={<CheckCircle size={20} />} color="var(--success)" />
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="flex-1 min-w-[200px] max-w-[360px]">
          <SearchInput value={search} onChange={setSearch} placeholder="Search trips..." />
        </div>
        {["all", "scheduled", "in_progress", "completed", "cancelled"].map((f) => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className="px-3 py-1.5 rounded-lg text-[.75rem] font-semibold cursor-pointer border-none transition-all"
            style={{ background: statusFilter === f ? "var(--brand)" : "var(--bg)", color: statusFilter === f ? "#fff" : "var(--fg-muted)", border: `1px solid ${statusFilter === f ? "var(--brand)" : "var(--border)"}` }}
          >{f === "all" ? "All" : f === "in_progress" ? "In Progress" : f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>

      <Card>
        {loading ? <TableSkeleton rows={5} cols={8} /> : filtered.length === 0 ? (
          <EmptyState icon={<Bus size={32} style={{ color: "var(--brand)" }} />} title="No trips found" description="Schedule your first trip to get started" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[.82rem]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Route", "Driver", "Vehicle", "Departure", "Seats", "Price", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left p-4 text-[.72rem] font-semibold" style={{ color: "var(--fg-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="p-4">
                      <div className="flex items-center gap-2"><MapPin size={14} style={{ color: "var(--brand)" }} /><span className="font-semibold">{t.routes?.name || "—"}</span></div>
                    </td>
                    <td className="p-4">{t.drivers?.name || "—"}</td>
                    <td className="p-4">
                      {t.vehicles ? <><span className="font-semibold">{t.vehicles.model}</span><br/><span className="text-[.68rem]" style={{ color: "var(--fg-muted)" }}>{t.vehicles.license_plate}</span></> : "—"}
                    </td>
                    <td className="p-4">
                      <div className="text-[.78rem] font-semibold">{fmtDate(t.departure_time)}</div>
                      <div className="text-[.68rem]" style={{ color: "var(--fg-muted)" }}>{fmtTime(t.departure_time)}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1"><Users size={13} style={{ color: "var(--fg-muted)" }} />{t.booked_seats}/{t.total_seats}</div>
                    </td>
                    <td className="p-4 font-semibold">{formatEGP(t.price)}</td>
                    <td className="p-4">{statusPill(t.status)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        {t.status === "scheduled" && <IconBtn onClick={() => updateStatus(t.id, "in_progress")} title="Start"><Clock size={14} style={{ color: "var(--amber)" }} /></IconBtn>}
                        {t.status === "in_progress" && <IconBtn onClick={() => updateStatus(t.id, "completed")} title="Complete"><CheckCircle size={14} style={{ color: "var(--success)" }} /></IconBtn>}
                        {(t.status === "scheduled" || t.status === "in_progress") && <IconBtn onClick={() => updateStatus(t.id, "cancelled")} title="Cancel"><XCircle size={14} style={{ color: "var(--danger)" }} /></IconBtn>}
                        <IconBtn onClick={() => openEdit(t)}><Edit2 size={14} /></IconBtn>
                        <IconBtn onClick={() => handleDelete(t.id)}>{deleting === t.id ? <span className="text-[.68rem]">...</span> : <Trash2 size={14} style={{ color: "var(--danger)" }} />}</IconBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {modal && (
        <Modal title={modal === "edit" ? "Edit Trip" : "Schedule Trip"} onClose={() => setModal(null)} wide>
          {availabilityWarning && (
            <div className="rounded-lg p-3 mb-4 flex items-start gap-2 text-[.78rem]" style={{ background: "var(--danger-light)", color: "var(--danger)" }}>
              <AlertTriangle size={16} className="shrink-0 mt-0.5" /><span>{availabilityWarning}</span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <FormGroup label="Route">
              <select style={inputStyle as React.CSSProperties} value={form.route_id} onChange={(e) => onRouteChange(e.target.value)}>
                <option value="">Select route...</option>
                {routes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Driver (approved only)">
              <select style={inputStyle as React.CSSProperties} value={form.driver_id} onChange={(e) => setForm({ ...form, driver_id: e.target.value })}>
                <option value="">Select driver...</option>
                {driverOptions.map((d) => <option key={d.id} value={d.id}>{d.name}{d.bus_partners ? ` (${d.bus_partners.name})` : ""}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Vehicle (approved only)">
              <select style={inputStyle as React.CSSProperties} value={form.vehicle_id} onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}>
                <option value="">Select vehicle...</option>
                {vehicles.map((v) => <option key={v.id} value={v.id}>{v.model} — {v.license_plate}{v.bus_partners ? ` (${v.bus_partners.name})` : ""}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Status">
              <select style={inputStyle as React.CSSProperties} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </FormGroup>
            <FormGroup label="Departure Time">
              <input style={inputStyle} type="datetime-local" value={form.departure_time} onChange={(e) => setForm({ ...form, departure_time: e.target.value })} />
            </FormGroup>
            <FormGroup label="Arrival Time">
              <input style={inputStyle} type="datetime-local" value={form.arrival_time} onChange={(e) => setForm({ ...form, arrival_time: e.target.value })} />
            </FormGroup>
            <FormGroup label="Price (EGP)">
              <input style={inputStyle} type="number" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} />
            </FormGroup>
            <FormGroup label="Total Seats">
              <input style={inputStyle} type="number" value={form.total_seats} onChange={(e) => setForm({ ...form, total_seats: +e.target.value })} />
            </FormGroup>
          </div>
          <FormGroup label="Notes">
            <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" } as React.CSSProperties} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes..." />
          </FormGroup>
          <div className="flex justify-end gap-2 mt-5 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <BtnOutline onClick={() => setModal(null)}>Cancel</BtnOutline>
            <BtnPrimary onClick={handleSave} disabled={saving || !!availabilityWarning}>{saving ? "Saving..." : modal === "edit" ? "Update Trip" : "Schedule Trip"}</BtnPrimary>
          </div>
        </Modal>
      )}
    </div>
  );
}
