"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Truck, Plus, Edit2, Trash2, CheckCircle, XCircle,
  Clock, Shield, FileText,
} from "lucide-react";
import {
  Card, BtnPrimary, BtnOutline, BtnSuccess, BtnDanger, IconBtn, FormGroup,
  Modal, SearchInput, EmptyState, TableSkeleton, StatCard,
} from "@/components/dashboard/shared";
import { useToast } from "@/components/shared/toast";
import { inputStyle } from "@/config/dashboard";
import { api } from "@/api-client";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface Vehicle {
  id: string;
  partner_id: string;
  bus_partners?: { id: string; name: string; name_ar?: string };
  vehicle_type_id: string;
  vehicle_types?: { id: string; name: string; seat_capacity: number };
  model: string;
  year: number;
  license_plate: string;
  color: string;
  total_seats: number;
  vin: string;
  approval_status: "pending" | "approved" | "rejected" | "suspended";
  is_active: boolean;
  insurance_expiry: string;
  registration_expiry: string;
  photo_url: string;
  created_at: string;
}

interface VehicleType { id: string; name: string; seat_capacity: number; }
interface Partner { id: string; name: string; name_ar?: string; }

interface ApprovalEntry {
  id: string;
  action: string;
  reason: string;
  performed_by_name?: string;
  created_at: string;
}

const approvalPill = (status: string) => {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    pending: { bg: "var(--amber-light)", fg: "var(--amber)", label: "Pending" },
    approved: { bg: "var(--success-light)", fg: "var(--success)", label: "Approved" },
    rejected: { bg: "var(--danger-light)", fg: "var(--danger)", label: "Rejected" },
    suspended: { bg: "var(--border)", fg: "var(--fg-muted)", label: "Suspended" },
  };
  const c = map[status] || map.pending;
  return <span className="text-[.68rem] px-2.5 py-1 rounded-full font-semibold" style={{ background: c.bg, color: c.fg }}>{c.label}</span>;
};

export default function FleetPage() {
  const { show } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, setModal] = useState<"add" | "edit" | "approve" | "reject" | "history" | null>(null);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [approvalHistory, setApprovalHistory] = useState<ApprovalEntry[]>([]);

  const [form, setForm] = useState({
    partner_id: "", vehicle_type_id: "", model: "",
    year: new Date().getFullYear(), license_plate: "", color: "",
    total_seats: 14, vin: "", insurance_expiry: "", registration_expiry: "",
  });

  const fetchAll = useCallback(async () => {
    try {
      const [v, vt, p] = await Promise.all([
        api.get<Vehicle[]>("/api/vehicles"),
        api.get<VehicleType[]>("/api/vehicle-types"),
        api.get<Partner[]>("/api/partners"),
      ]);
      setVehicles(v);
      setVehicleTypes(vt);
      setPartners(p);
    } catch (e: any) {
      show(e?.message || "Failed to load", "danger");
    } finally {
      setLoading(false);
    }
  }, [show]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = vehicles.filter((v) => {
    if (search) {
      const q = search.toLowerCase();
      const partnerName = v.bus_partners?.name || "";
      if (!`${v.model} ${v.license_plate}`.toLowerCase().includes(q) && !partnerName.toLowerCase().includes(q)) return false;
    }
    if (statusFilter !== "all" && v.approval_status !== statusFilter) return false;
    return true;
  });

  const stats = {
    total: vehicles.length,
    approved: vehicles.filter((v) => v.approval_status === "approved").length,
    pending: vehicles.filter((v) => v.approval_status === "pending").length,
    rejected: vehicles.filter((v) => v.approval_status === "rejected").length,
  };

  const openAdd = () => {
    setForm({ partner_id: "", vehicle_type_id: "", model: "", year: new Date().getFullYear(), license_plate: "", color: "", total_seats: 14, vin: "", insurance_expiry: "", registration_expiry: "" });
    setEditing(null);
    setModal("add");
  };

  const openEdit = (v: Vehicle) => {
    setEditing(v);
    setForm({
      partner_id: v.partner_id, vehicle_type_id: v.vehicle_type_id || "", model: v.model,
      year: v.year, license_plate: v.license_plate, color: v.color || "", total_seats: v.total_seats,
      vin: v.vin || "",
      insurance_expiry: v.insurance_expiry ? v.insurance_expiry.slice(0, 10) : "",
      registration_expiry: v.registration_expiry ? v.registration_expiry.slice(0, 10) : "",
    });
    setModal("edit");
  };

  const handleSave = async () => {
    if (!form.model.trim() || !form.license_plate.trim()) { show("Model and plate number are required", "danger"); return; }
    setSaving(true);
    try {
      if (modal === "edit" && editing) {
        await api.patch(`/api/vehicles/${editing.id}`, form);
        show("Vehicle updated");
      } else {
        await api.post("/api/vehicles", form);
        show("Vehicle created");
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
    if (!confirm("Delete this vehicle? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await api.del(`/api/vehicles/${id}`);
      show("Vehicle deleted");
      fetchAll();
    } catch (e: any) {
      show(e?.message || "Failed to delete", "danger");
    } finally {
      setDeleting(null);
    }
  };

  const handleApprove = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await api.post("/api/approval", { entity_type: "vehicle", entity_id: editing.id, action: "approved", reason: "Approved by admin" });
      show("Vehicle approved");
      setModal(null);
      fetchAll();
    } catch (e: any) {
      show(e?.message || "Failed to approve", "danger");
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!editing || !rejectionReason.trim()) { show("Rejection reason is required", "danger"); return; }
    setSaving(true);
    try {
      await api.post("/api/approval", { entity_type: "vehicle", entity_id: editing.id, action: "rejected", reason: rejectionReason });
      show("Vehicle rejected");
      setModal(null);
      setRejectionReason("");
      fetchAll();
    } catch (e: any) {
      show(e?.message || "Failed to reject", "danger");
    } finally {
      setSaving(false);
    }
  };

  const openHistory = async (v: Vehicle) => {
    setEditing(v);
    try {
      const data = await api.get<ApprovalEntry[]>(`/api/approval/history?entity_type=vehicle&entity_id=${v.id}`);
      setApprovalHistory(data);
    } catch { setApprovalHistory([]); }
    setModal("history");
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-[1.6rem] font-bold flex items-center gap-2">
            <Truck size={24} style={{ color: "var(--brand)" }} /> Fleet Management
          </h1>
          <p className="text-[.82rem] mt-1" style={{ color: "var(--fg-muted)" }}>Manage vehicles and approval status</p>
        </div>
        {/* <BtnPrimary onClick={openAdd}><Plus size={15} /> Add Vehicle</BtnPrimary> */}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Vehicles" value={stats.total} icon={<Truck size={20} />} />
        <StatCard label="Approved" value={stats.approved} icon={<CheckCircle size={20} />} color="var(--success)" />
        <StatCard label="Pending" value={stats.pending} icon={<Clock size={20} />} color="var(--amber)" />
        <StatCard label="Rejected" value={stats.rejected} icon={<XCircle size={20} />} color="var(--danger)" />
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="flex-1 min-w-[200px] max-w-[360px]">
          <SearchInput value={search} onChange={setSearch} placeholder="Search vehicles..." />
        </div>
        {["all", "approved", "pending", "rejected", "suspended"].map((f) => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className="px-3 py-1.5 rounded-lg text-[.75rem] font-semibold cursor-pointer border-none transition-all"
            style={{ background: statusFilter === f ? "var(--brand)" : "var(--bg)", color: statusFilter === f ? "#fff" : "var(--fg-muted)", border: `1px solid ${statusFilter === f ? "var(--brand)" : "var(--border)"}` }}
          >{f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>

      <Card>
        {loading ? <TableSkeleton rows={5} cols={7} /> : filtered.length === 0 ? (
          <EmptyState icon={<Truck size={32} style={{ color: "var(--brand)" }} />} title="No vehicles found" description="Add your first vehicle to the fleet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[.82rem]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Vehicle", "Partner", "Type", "Plate", "Seats", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left p-4 text-[.72rem] font-semibold" style={{ color: "var(--fg-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr key={v.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="p-4">
                      <div className="font-semibold">{v.model}</div>
                      <div className="text-[.68rem]" style={{ color: "var(--fg-muted)" }}>{v.year} · {v.color}</div>
                    </td>
                    <td className="p-4">{v.bus_partners?.name || "—"}</td>
                    <td className="p-4">{v.vehicle_types?.name || "—"}</td>
                    <td className="p-4 font-mono font-semibold">{v.license_plate}</td>
                    <td className="p-4">{v.total_seats} seats</td>
                    <td className="p-4">{approvalPill(v.approval_status)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        {v.approval_status === "pending" && (
                          <>
                            <IconBtn onClick={() => { setEditing(v); setModal("approve"); }} title="Approve"><CheckCircle size={14} style={{ color: "var(--success)" }} /></IconBtn>
                            <IconBtn onClick={() => { setEditing(v); setRejectionReason(""); setModal("reject"); }} title="Reject"><XCircle size={14} style={{ color: "var(--danger)" }} /></IconBtn>
                          </>
                        )}
                        <IconBtn onClick={() => openHistory(v)} title="History"><FileText size={14} /></IconBtn>
                        {/* <IconBtn onClick={() => openEdit(v)}><Edit2 size={14} /></IconBtn> */}
                        {/* <IconBtn onClick={() => handleDelete(v.id)}>
                          {deleting === v.id ? <span className="text-[.68rem]">...</span> : <Trash2 size={14} style={{ color: "var(--danger)" }} />}
                        </IconBtn> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {(modal === "add" || modal === "edit") && (
        <Modal title={modal === "edit" ? "Edit Vehicle" : "Add Vehicle"} onClose={() => setModal(null)} wide>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <FormGroup label="Bus Partner">
              <select style={inputStyle as React.CSSProperties} value={form.partner_id} onChange={(e) => setForm({ ...form, partner_id: e.target.value })}>
                <option value="">Select partner...</option>
                {partners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Vehicle Type">
              <select style={inputStyle as React.CSSProperties} value={form.vehicle_type_id} onChange={(e) => setForm({ ...form, vehicle_type_id: e.target.value })}>
                <option value="">Select type...</option>
                {vehicleTypes.map((vt) => <option key={vt.id} value={vt.id}>{vt.name} ({vt.seat_capacity} seats)</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Model">
              <input style={inputStyle} value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="e.g. Mercedes-Benz Sprinter" />
            </FormGroup>
            <FormGroup label="Year">
              <input style={inputStyle} type="number" value={form.year} onChange={(e) => setForm({ ...form, year: +e.target.value })} />
            </FormGroup>
            <FormGroup label="License Plate">
              <input style={inputStyle} value={form.license_plate} onChange={(e) => setForm({ ...form, license_plate: e.target.value })} placeholder="e.g. أ ب ج ١٢٣٤" />
            </FormGroup>
            <FormGroup label="Color">
              <input style={inputStyle} value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="e.g. White" />
            </FormGroup>
            <FormGroup label="Total Seats">
              <input style={inputStyle} type="number" value={form.total_seats} onChange={(e) => setForm({ ...form, total_seats: +e.target.value })} />
            </FormGroup>
            <FormGroup label="VIN (optional)">
              <input style={inputStyle} value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value })} placeholder="Vehicle identification number" />
            </FormGroup>
            <FormGroup label="Insurance Expiry">
              <input style={inputStyle} type="date" value={form.insurance_expiry} onChange={(e) => setForm({ ...form, insurance_expiry: e.target.value })} />
            </FormGroup>
            <FormGroup label="Registration Expiry">
              <input style={inputStyle} type="date" value={form.registration_expiry} onChange={(e) => setForm({ ...form, registration_expiry: e.target.value })} />
            </FormGroup>
          </div>
          <div className="flex justify-end gap-2 mt-5 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <BtnOutline onClick={() => setModal(null)}>Cancel</BtnOutline>
            <BtnPrimary onClick={handleSave} disabled={saving}>{saving ? "Saving..." : modal === "edit" ? "Update Vehicle" : "Add Vehicle"}</BtnPrimary>
          </div>
        </Modal>
      )}

      {modal === "approve" && editing && (
        <Modal title="Approve Vehicle" onClose={() => setModal(null)}>
          <p className="text-[.85rem] mb-4">Approve <strong>{editing.model}</strong> ({editing.license_plate})? This will make it available for trip assignments.</p>
          <div className="flex justify-end gap-2 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <BtnOutline onClick={() => setModal(null)}>Cancel</BtnOutline>
            <BtnSuccess onClick={handleApprove} disabled={saving}>{saving ? "Approving..." : "Approve Vehicle"}</BtnSuccess>
          </div>
        </Modal>
      )}

      {modal === "reject" && editing && (
        <Modal title="Reject Vehicle" onClose={() => setModal(null)}>
          <p className="text-[.85rem] mb-3">Reject <strong>{editing.model}</strong> ({editing.license_plate})?</p>
          <FormGroup label="Rejection Reason (required)">
            <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" } as React.CSSProperties} value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Explain why this vehicle is being rejected..." />
          </FormGroup>
          <div className="flex justify-end gap-2 mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <BtnOutline onClick={() => setModal(null)}>Cancel</BtnOutline>
            <BtnDanger onClick={handleReject} disabled={saving || !rejectionReason.trim()}>{saving ? "Rejecting..." : "Reject Vehicle"}</BtnDanger>
          </div>
        </Modal>
      )}

      {modal === "history" && editing && (
        <Modal title={`Approval History — ${editing.model}`} onClose={() => setModal(null)}>
          {approvalHistory.length === 0 ? (
            <EmptyState icon={<Shield size={24} />} title="No approval history" description="No approval actions recorded yet" />
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {approvalHistory.map((entry) => (
                <div key={entry.id} className="p-3 rounded-lg" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
                  <div className="flex items-center justify-between mb-1">
                    {approvalPill(entry.action)}
                    <span className="text-[.68rem]" style={{ color: "var(--fg-muted)" }}>{new Date(entry.created_at).toLocaleDateString("en-EG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  {entry.reason && <p className="text-[.78rem] mt-1">{entry.reason}</p>}
                  {entry.performed_by_name && <p className="text-[.68rem] mt-1" style={{ color: "var(--fg-muted)" }}>By: {entry.performed_by_name}</p>}
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <BtnOutline onClick={() => setModal(null)}>Close</BtnOutline>
          </div>
        </Modal>
      )}
    </div>
  );
}
