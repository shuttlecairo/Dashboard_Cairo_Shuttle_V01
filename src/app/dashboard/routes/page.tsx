"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
import {
  MapPin, Plus, Edit2, Trash2, ChevronDown, ChevronUp,
  ToggleLeft, ToggleRight, ArrowUp, ArrowDown, Map, Navigation,
} from "lucide-react";
import {
  Card, BtnPrimary, BtnOutline, IconBtn, FormGroup,
  Modal, SearchInput, EmptyState, TableSkeleton,
} from "@/components/dashboard/shared";
import { useToast } from "@/components/shared/toast";
import { inputStyle } from "@/config/dashboard";
import { api } from "@/api-client";

function formatEGP(n: number) {
  return n.toLocaleString("en-EG") + " EGP";
}

interface RouteStop {
  id?: string;
  name: string;
  name_ar: string;
  address: string;
  lat: number;
  lng: number;
  sequence: number;
  stop_type: "pickup" | "intermediate" | "destination";
  estimated_minutes: number;
}

interface Route {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  default_price: number;
  duration_minutes: number;
  distance_km: number;
  is_active: boolean;
  route_stops: RouteStop[];
  created_at: string;
}

const emptyStop = (): RouteStop => ({
  name: "", name_ar: "", address: "", lat: 0, lng: 0,
  sequence: 1, stop_type: "intermediate", estimated_minutes: 0,
});

const emptyForm = (): { name: string; name_ar: string; description: string; default_price: number; duration_minutes: number; distance_km: number; stops: RouteStop[] } => ({
  name: "", name_ar: "", description: "",
  default_price: 0, duration_minutes: 0, distance_km: 0,
  stops: [
    { ...emptyStop(), sequence: 1, stop_type: "pickup" },
    { ...emptyStop(), sequence: 2, stop_type: "destination" },
  ],
});

const statusPill = (active: boolean) => (
  <span
    className="text-[.68rem] px-2.5 py-1 rounded-full font-semibold"
    style={{
      background: active ? "var(--success-light)" : "var(--border)",
      color: active ? "var(--success)" : "var(--fg-muted)",
    }}
  >
    {active ? "Active" : "Inactive"}
  </span>
);

export default function RoutesPage() {
  const { show } = useToast();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<Route | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchRoutes = useCallback(async () => {
    try {
      const data = await api.get<Route[]>("/api/routes");
      setRoutes(data);
    } catch (e: unknown) {
      show((e as Error).message || "Failed to load routes", "danger");
    } finally {
      setLoading(false);
    }
  }, [show]);

  useEffect(() => { fetchRoutes(); }, [fetchRoutes]);

  const filtered = routes.filter((r) => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !(r.name_ar || "").includes(search)) return false;
    if (filterActive === "active" && !r.is_active) return false;
    if (filterActive === "inactive" && r.is_active) return false;
    return true;
  });

  const openAdd = () => { setForm(emptyForm()); setEditing(null); setModal("add"); };
  const openEdit = (r: Route) => {
    setEditing(r);
    setForm({
      name: r.name, name_ar: r.name_ar || "", description: r.description || "",
      default_price: r.default_price, duration_minutes: r.duration_minutes, distance_km: r.distance_km,
      stops: r.route_stops && r.route_stops.length > 0
        ? [...r.route_stops].sort((a, b) => a.sequence - b.sequence)
        : emptyForm().stops,
    });
    setModal("edit");
  };

  const handleSave = async () => {
    if (!form.name.trim()) { show("Route name is required", "danger"); return; }
    if (form.stops.length < 2) { show("At least 2 stops required", "danger"); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name, name_ar: form.name_ar, description: form.description,
        default_price: form.default_price, duration_minutes: form.duration_minutes,
        distance_km: form.distance_km,
        stops: form.stops.map((s, i) => ({ ...s, sequence: i + 1 })),
      };
      if (modal === "edit" && editing) {
        await api.patch(`/api/routes/${editing.id}`, payload);
        show("Route updated");
      } else {
        await api.post("/api/routes", payload);
        show("Route created");
      }
      setModal(null);
      fetchRoutes();
    } catch (e: unknown) {
      show((e as Error).message || "Failed to save", "danger");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this route? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await api.del(`/api/routes/${id}`);
      show("Route deleted");
      fetchRoutes();
    } catch (e: unknown) {
      show((e as Error).message || "Failed to delete", "danger");
    } finally {
      setDeleting(null);
    }
  };

  const toggleActive = async (r: Route) => {
    try {
      await api.patch(`/api/routes/${r.id}`, { is_active: !r.is_active });
      show(r.is_active ? "Route deactivated" : "Route activated");
      fetchRoutes();
    } catch (e: unknown) {
      show((e as Error).message || "Failed to toggle", "danger");
    }
  };

  // Stop helpers
  const updateStop = (idx: number, field: string, value: unknown) => {
    const stops = [...form.stops];
    stops[idx] = { ...stops[idx], [field]: value };
    setForm({ ...form, stops });
  };
  const addStop = () => {
    const stops = [...form.stops];
    stops.splice(stops.length - 1, 0, { ...emptyStop(), sequence: stops.length, stop_type: "intermediate" });
    setForm({ ...form, stops });
  };
  const removeStop = (idx: number) => {
    if (form.stops.length <= 2) { show("Minimum 2 stops required", "danger"); return; }
    setForm({ ...form, stops: form.stops.filter((_, i) => i !== idx) });
  };
  const moveStop = (idx: number, dir: -1 | 1) => {
    const stops = [...form.stops];
    const target = idx + dir;
    if (target < 0 || target >= stops.length) return;
    [stops[idx], stops[target]] = [stops[target], stops[idx]];
    setForm({ ...form, stops });
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-[1.6rem] font-bold flex items-center gap-2">
            <Map size={24} style={{ color: "var(--brand)" }} />
            Route Management
          </h1>
          <p className="text-[.82rem] mt-1" style={{ color: "var(--fg-muted)" }}>
            Create and manage shuttle routes with stops
          </p>
        </div>
        <BtnPrimary onClick={openAdd}><Plus size={15} /> Add Route</BtnPrimary>
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="flex-1 min-w-[200px] max-w-[360px]">
          <SearchInput value={search} onChange={setSearch} placeholder="Search routes..." />
        </div>
        {(["all", "active", "inactive"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilterActive(f)}
            className="px-3 py-1.5 rounded-lg text-[.75rem] font-semibold cursor-pointer border-none transition-all"
            style={{
              background: filterActive === f ? "var(--brand)" : "var(--bg)",
              color: filterActive === f ? "#fff" : "var(--fg-muted)",
              border: `1px solid ${filterActive === f ? "var(--brand)" : "var(--border)"}`,
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <Card>
        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<MapPin size={32} style={{ color: "var(--brand)" }} />}
            title="No routes found"
            description="Create your first route to get started"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[.82rem]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Route", "Stops", "Distance", "Duration", "Price", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left p-4 text-[.72rem] font-semibold" style={{ color: "var(--fg-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <Fragment key={r.id}>
                    <tr className="transition-colors" style={{ borderBottom: "1px solid var(--border)" }}>
                      <td className="p-4">
                        <div className="font-semibold">{r.name}</div>
                        {r.name_ar && <div className="text-[.72rem]" style={{ color: "var(--fg-muted)" }}>{r.name_ar}</div>}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                          className="inline-flex items-center gap-1 text-[.78rem] font-semibold cursor-pointer border-none bg-transparent"
                          style={{ color: "var(--brand)" }}
                        >
                          {r.route_stops?.length || 0} stops
                          {expanded === r.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </td>
                      <td className="p-4">{r.distance_km} km</td>
                      <td className="p-4">{r.duration_minutes} min</td>
                      <td className="p-4 font-semibold">{formatEGP(r.default_price)}</td>
                      <td className="p-4">{statusPill(r.is_active)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <IconBtn onClick={() => toggleActive(r)} title={r.is_active ? "Deactivate" : "Activate"}>
                            {r.is_active ? <ToggleRight size={16} style={{ color: "var(--success)" }} /> : <ToggleLeft size={16} />}
                          </IconBtn>
                          <IconBtn onClick={() => openEdit(r)}><Edit2 size={14} /></IconBtn>
                          <IconBtn onClick={() => handleDelete(r.id)}>
                            {deleting === r.id
                              ? <span className="text-[.68rem]">...</span>
                              : <Trash2 size={14} style={{ color: "var(--danger)" }} />}
                          </IconBtn>
                        </div>
                      </td>
                    </tr>
                    {expanded === r.id && r.route_stops?.length > 0 && (
                      <tr key={`${r.id}-stops`}>
                        <td colSpan={7} className="p-0">
                          <div className="px-6 py-3" style={{ background: "var(--bg)" }}>
                            <div className="flex items-center gap-2 mb-2 text-[.72rem] font-semibold" style={{ color: "var(--fg-muted)" }}>
                              <Navigation size={13} /> Route Stops
                            </div>
                            <div className="flex flex-col gap-1">
                              {[...r.route_stops].sort((a, b) => a.sequence - b.sequence).map((s, i) => (
                                <div key={s.id || i} className="flex items-center gap-3 text-[.78rem]">
                                  <span
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-[.65rem] font-bold text-white shrink-0"
                                    style={{
                                      background: s.stop_type === "pickup" ? "var(--success)" : s.stop_type === "destination" ? "var(--danger)" : "var(--brand)",
                                    }}
                                  >
                                    {s.sequence}
                                  </span>
                                  <span className="font-medium">{s.name}</span>
                                  <span className="text-[.68rem]" style={{ color: "var(--fg-muted)" }}>
                                    {s.stop_type} · {s.estimated_minutes} min
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {modal && (
        <Modal title={modal === "edit" ? "Edit Route" : "Add Route"} onClose={() => setModal(null)} wide>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <FormGroup label="Route Name (English)">
              <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Maadi → Smart Village" />
            </FormGroup>
            <FormGroup label="Route Name (Arabic)">
              <input style={inputStyle} value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} placeholder="مثال: المعادي → القرية الذكية" dir="rtl" />
            </FormGroup>
            <FormGroup label="Default Price (EGP)">
              <input style={inputStyle} type="number" value={form.default_price} onChange={(e) => setForm({ ...form, default_price: +e.target.value })} />
            </FormGroup>
            <FormGroup label="Duration (minutes)">
              <input style={inputStyle} type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: +e.target.value })} />
            </FormGroup>
            <FormGroup label="Distance (km)">
              <input style={inputStyle} type="number" value={form.distance_km} onChange={(e) => setForm({ ...form, distance_km: +e.target.value })} />
            </FormGroup>
            <FormGroup label="Description">
              <input style={inputStyle} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </FormGroup>
          </div>

          <div className="mt-4 mb-3 flex items-center justify-between">
            <h4 className="text-[.85rem] font-bold flex items-center gap-2">
              <MapPin size={16} style={{ color: "var(--brand)" }} /> Route Stops ({form.stops.length})
            </h4>
            <BtnOutline onClick={addStop}><Plus size={13} /> Add Stop</BtnOutline>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {form.stops.map((s, i) => (
              <div key={i} className="rounded-lg p-3" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[.65rem] font-bold text-white"
                      style={{
                        background: i === 0 ? "var(--success)" : i === form.stops.length - 1 ? "var(--danger)" : "var(--brand)",
                      }}
                    >
                      {i + 1}
                    </span>
                    <select
                      value={s.stop_type}
                      onChange={(e) => updateStop(i, "stop_type", e.target.value)}
                      className="text-[.72rem] font-semibold px-2 py-0.5 rounded cursor-pointer"
                      style={{ background: "var(--bg-card)", color: "var(--fg)", border: "1px solid var(--border)" }}
                    >
                      <option value="pickup">Pickup</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="destination">Destination</option>
                    </select>
                  </div>
                  <div className="flex gap-1">
                    <IconBtn onClick={() => moveStop(i, -1)} title="Move up"><ArrowUp size={13} /></IconBtn>
                    <IconBtn onClick={() => moveStop(i, 1)} title="Move down"><ArrowDown size={13} /></IconBtn>
                    <IconBtn onClick={() => removeStop(i)}><Trash2 size={13} style={{ color: "var(--danger)" }} /></IconBtn>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input style={{ ...inputStyle, fontSize: ".78rem", padding: "6px 10px" }} value={s.name} onChange={(e) => updateStop(i, "name", e.target.value)} placeholder="Stop name" />
                  <input style={{ ...inputStyle, fontSize: ".78rem", padding: "6px 10px" }} value={s.name_ar} onChange={(e) => updateStop(i, "name_ar", e.target.value)} placeholder="اسم المحطة" dir="rtl" />
                  <input style={{ ...inputStyle, fontSize: ".78rem", padding: "6px 10px" }} value={s.address} onChange={(e) => updateStop(i, "address", e.target.value)} placeholder="Address" />
                  <input style={{ ...inputStyle, fontSize: ".78rem", padding: "6px 10px" }} type="number" value={s.estimated_minutes} onChange={(e) => updateStop(i, "estimated_minutes", +e.target.value)} placeholder="Est. minutes" />
                  <input style={{ ...inputStyle, fontSize: ".78rem", padding: "6px 10px" }} type="number" value={s.lat || ""} onChange={(e) => updateStop(i, "lat", +e.target.value)} placeholder="Latitude" />
                  <input style={{ ...inputStyle, fontSize: ".78rem", padding: "6px 10px" }} type="number" value={s.lng || ""} onChange={(e) => updateStop(i, "lng", +e.target.value)} placeholder="Longitude" />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-5 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <BtnOutline onClick={() => setModal(null)}>Cancel</BtnOutline>
            <BtnPrimary onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : modal === "edit" ? "Update Route" : "Create Route"}
            </BtnPrimary>
          </div>
        </Modal>
      )}
    </div>
  );
}

