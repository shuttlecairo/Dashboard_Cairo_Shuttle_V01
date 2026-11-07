"use client";

import { useState, useEffect, useCallback } from "react";
import { StatCard, Card, BtnPrimary, BtnOutline, BtnDanger, Modal, SearchInput, TableSkeleton, EmptyState } from "@/components/dashboard/shared";
import { useToast } from "@/components/shared/toast";
import { api } from "@/api-client";
import { inputStyle } from "@/config/dashboard";
import {
  Truck,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Eye,
  Upload,
  FileText,
  Shield,
} from "lucide-react";

interface Vehicle {
  id: string;
  partner_id: string;
  model: string;
  year?: number;
  license_plate: string;
  color?: string;
  total_seats: number;
  approval_status: string;
  is_active: boolean;
  registration_expiry?: string;
  insurance_expiry?: string;
  photo_url?: string;
  vehicle_type_id?: string;
  created_at: string;
}

interface ApprovalEntry {
  id: string;
  action: string;
  reason?: string;
  reviewer_name?: string;
  created_at: string;
}

interface Partner { id: string; name: string; }

const EMPTY_FORM = { model: "", year: "", license_plate: "", color: "", total_seats: "14", registration_expiry: "", insurance_expiry: "" };

function StatusBadge({ status }: { status: string }) {
  const c: Record<string, { bg: string; color: string; icon: React.ReactNode; label: string }> = {
    approved: { bg: "var(--success-light)", color: "var(--success)", icon: <CheckCircle size={12} />, label: "Approved" },
    pending: { bg: "var(--amber-light)", color: "var(--amber)", icon: <Clock size={12} />, label: "Pending" },
    rejected: { bg: "var(--danger-light)", color: "var(--danger)", icon: <XCircle size={12} />, label: "Rejected" },
    suspended: { bg: "var(--danger-light)", color: "var(--danger)", icon: <XCircle size={12} />, label: "Suspended" },
  };
  const cfg = c[status] || c.pending;
  return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[.68rem] font-semibold" style={{ background: cfg.bg, color: cfg.color }}>{cfg.icon} {cfg.label}</span>;
}

export default function PartnerVehiclesPage() {
  const { show } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [editVeh, setEditVeh] = useState<Vehicle | null>(null);
  const [detailVeh, setDetailVeh] = useState<Vehicle | null>(null);
  const [approvalHistory, setApprovalHistory] = useState<ApprovalEntry[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const partners = await api.get<Partner[]>("/api/partners");
      if (partners.length === 0) { setLoading(false); return; }
      setPartner(partners[0]);
      const vehs = await api.get<Vehicle[]>(`/api/partners/${partners[0].id}/vehicles`);
      setVehicles(vehs);
    } catch { show("Failed to load vehicles", "danger"); } finally { setLoading(false); }
  }, [show]);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = vehicles.filter((v) => {
    const matchSearch = v.model.toLowerCase().includes(search.toLowerCase()) || v.license_plate.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || v.approval_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const approvedCount = vehicles.filter((v) => v.approval_status === "approved").length;
  const pendingCount = vehicles.filter((v) => v.approval_status === "pending").length;
  const rejectedCount = vehicles.filter((v) => v.approval_status === "rejected").length;

  function openAdd() { setForm(EMPTY_FORM); setShowAdd(true); }
  function openEdit(v: Vehicle) {
    setForm({ model: v.model, year: String(v.year || ""), license_plate: v.license_plate, color: v.color || "", total_seats: String(v.total_seats), registration_expiry: v.registration_expiry || "", insurance_expiry: v.insurance_expiry || "" });
    setEditVeh(v);
  }

  async function openDetail(v: Vehicle) {
    setDetailVeh(v);
    try {
      const hist = await api.get<ApprovalEntry[]>(`/api/approval/history?entity_type=vehicle&entity_id=${v.id}`);
      setApprovalHistory(hist);
    } catch { setApprovalHistory([]); }
  }

  async function handleSave() {
    if (!partner || !form.model || !form.license_plate) { show("Model and license plate are required", "danger"); return; }
    setSaving(true);
    try {
      if (editVeh) {
        await api.patch(`/api/vehicles/${editVeh.id}`, { ...form, year: form.year ? Number(form.year) : null, total_seats: Number(form.total_seats) });
        show("Vehicle updated", "success");
        setEditVeh(null);
      } else {
        await api.post("/api/vehicles", { ...form, year: form.year ? Number(form.year) : null, total_seats: Number(form.total_seats), partner_id: partner.id });
        show("Vehicle added — pending approval", "success");
        setShowAdd(false);
      }
      loadData();
    } catch { show("Failed to save vehicle", "danger"); } finally { setSaving(false); }
  }

  async function handleDelete(v: Vehicle) {
    if (!confirm(`Delete vehicle ${v.model} (${v.license_plate})?`)) return;
    try {
      await api.del(`/api/vehicles/${v.id}`);
      show("Vehicle deleted", "success");
      loadData();
    } catch { show("Failed to delete vehicle", "danger"); }
  }

  async function handleResubmit(v: Vehicle) {
    try {
      await api.patch(`/api/vehicles/${v.id}`, { approval_status: "pending" });
      show("Vehicle resubmitted for approval", "success");
      loadData();
    } catch { show("Failed to resubmit", "danger"); }
  }

  function VehicleForm() {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-[.78rem] font-semibold mb-1">Model *</label>
          <input style={inputStyle} value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="e.g. Toyota Coaster 2024" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[.78rem] font-semibold mb-1">Year</label>
            <input style={inputStyle} type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2024" />
          </div>
          <div>
            <label className="block text-[.78rem] font-semibold mb-1">Seats</label>
            <input style={inputStyle} type="number" value={form.total_seats} onChange={(e) => setForm({ ...form, total_seats: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="block text-[.78rem] font-semibold mb-1">License Plate *</label>
          <input style={inputStyle} value={form.license_plate} onChange={(e) => setForm({ ...form, license_plate: e.target.value })} placeholder="م ق ه 1234" />
        </div>
        <div>
          <label className="block text-[.78rem] font-semibold mb-1">Color</label>
          <input style={inputStyle} value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="White" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[.78rem] font-semibold mb-1">Registration Expiry</label>
            <input style={inputStyle} type="date" value={form.registration_expiry} onChange={(e) => setForm({ ...form, registration_expiry: e.target.value })} />
          </div>
          <div>
            <label className="block text-[.78rem] font-semibold mb-1">Insurance Expiry</label>
            <input style={inputStyle} type="date" value={form.insurance_expiry} onChange={(e) => setForm({ ...form, insurance_expiry: e.target.value })} />
          </div>
        </div>

        {/* Document uploads placeholder */}
        <div>
          <label className="block text-[.78rem] font-semibold mb-2">Documents</label>
          <div className="grid grid-cols-2 gap-2">
            {["Registration", "Insurance", "Photo", "License"].map((doc) => (
              <button key={doc} type="button" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-[.75rem] font-medium cursor-pointer transition-all" style={{ border: "1px dashed var(--border)", background: "var(--bg)", color: "var(--fg-muted)" }}>
                <Upload size={14} /> {doc}
              </button>
            ))}
          </div>
          <p className="text-[.68rem] mt-1" style={{ color: "var(--fg-muted)" }}>Document upload requires storage setup</p>
        </div>

        <div className="flex gap-2 pt-2">
          <BtnPrimary onClick={handleSave} disabled={saving}>{saving ? "Saving..." : editVeh ? "Update Vehicle" : "Add Vehicle"}</BtnPrimary>
          <BtnOutline onClick={() => { setShowAdd(false); setEditVeh(null); }}>Cancel</BtnOutline>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-[1.6rem] font-bold flex items-center gap-2"><Truck size={24} style={{ color: "var(--brand)" }} /> My Vehicles</h1>
          <p className="text-[.85rem]" style={{ color: "var(--fg-muted)" }}>Manage your fleet — {partner?.name}</p>
        </div>
        <BtnPrimary onClick={openAdd}><Plus size={15} /> Add Vehicle</BtnPrimary>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4 mb-6">
        <StatCard label="Total" value={vehicles.length} sub="All vehicles" />
        <StatCard label="Approved" value={approvedCount} valueColor="var(--success)" sub="Active fleet" />
        <StatCard label="Pending" value={pendingCount} valueColor="var(--amber)" sub="Awaiting review" />
        <StatCard label="Rejected" value={rejectedCount} valueColor="var(--danger)" sub="Need attention" />
      </div>

      <Card>
        <div className="p-4 flex items-center justify-between flex-wrap gap-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="w-[260px]"><SearchInput value={search} onChange={setSearch} placeholder="Search vehicles..." /></div>
          <div className="flex gap-2">
            {["all", "approved", "pending", "rejected"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)} className="px-3 py-1.5 rounded-lg text-[.72rem] font-semibold cursor-pointer border-none transition-all"
                style={{ background: statusFilter === s ? "var(--brand)" : "var(--bg)", color: statusFilter === s ? "white" : "var(--fg-muted)" }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? <TableSkeleton /> : filtered.length === 0 ? (
         <EmptyState icon={<Truck size={40} />} title="No vehicles found" description={search || statusFilter !== "all" ? "Try adjusting your filters" : "Add your first vehicle to get started"} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[.82rem]">
              <thead>
                <tr style={{ background: "var(--bg)" }}>
                  {["Model", "Plate", "Seats", "Year", "Color", "Status", "Actions"].map((h) => (
                    <th key={h} className="p-3 text-left text-[.72rem] font-semibold" style={{ color: "var(--fg-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr key={v.id} className="transition-colors" style={{ borderTop: "1px solid var(--border)" }}>
                    <td className="p-3 font-semibold">{v.model}</td>
                    <td className="p-3" style={{ color: "var(--brand)", fontWeight: 600 }}>{v.license_plate}</td>
                    <td className="p-3">{v.total_seats}</td>
                    <td className="p-3">{v.year || "—"}</td>
                    <td className="p-3">{v.color || "—"}</td>
                    <td className="p-3"><StatusBadge status={v.approval_status} /></td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openDetail(v)} className="w-7 h-7 rounded flex items-center justify-center cursor-pointer border-none" style={{ background: "var(--bg)", color: "var(--fg-muted)" }}><Eye size={14} /></button>
                        <button onClick={() => openEdit(v)} className="w-7 h-7 rounded flex items-center justify-center cursor-pointer border-none" style={{ background: "var(--bg)", color: "var(--blue)" }}><Edit size={14} /></button>
                        {v.approval_status === "rejected" && (
                          <button onClick={() => handleResubmit(v)} className="w-7 h-7 rounded flex items-center justify-center cursor-pointer border-none" style={{ background: "var(--amber-light)", color: "var(--amber)" }}><RefreshCw size={14} /></button>
                        )}
                        <button onClick={() => handleDelete(v)} className="w-7 h-7 rounded flex items-center justify-center cursor-pointer border-none" style={{ background: "var(--danger-light)", color: "var(--danger)" }}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {(showAdd || editVeh) && (
        <Modal title={editVeh ? "Edit Vehicle" : "Add Vehicle"} onClose={() => { setShowAdd(false); setEditVeh(null); }}>
          <VehicleForm />
        </Modal>
      )}

      {detailVeh && (
        <Modal title="Vehicle Details" onClose={() => setDetailVeh(null)} wide>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-[.72rem]" style={{ color: "var(--fg-muted)" }}>Model</p><p className="text-[.85rem] font-semibold">{detailVeh.model}</p></div>
              <div><p className="text-[.72rem]" style={{ color: "var(--fg-muted)" }}>License Plate</p><p className="text-[.85rem] font-semibold">{detailVeh.license_plate}</p></div>
              <div><p className="text-[.72rem]" style={{ color: "var(--fg-muted)" }}>Seats</p><p className="text-[.85rem] font-semibold">{detailVeh.total_seats}</p></div>
              <div><p className="text-[.72rem]" style={{ color: "var(--fg-muted)" }}>Year</p><p className="text-[.85rem] font-semibold">{detailVeh.year || "—"}</p></div>
              <div><p className="text-[.72rem]" style={{ color: "var(--fg-muted)" }}>Color</p><p className="text-[.85rem] font-semibold">{detailVeh.color || "—"}</p></div>
              <div><p className="text-[.72rem]" style={{ color: "var(--fg-muted)" }}>Status</p><StatusBadge status={detailVeh.approval_status} /></div>
              <div><p className="text-[.72rem]" style={{ color: "var(--fg-muted)" }}>Registration Expiry</p><p className="text-[.85rem] font-semibold">{detailVeh.registration_expiry || "—"}</p></div>
              <div><p className="text-[.72rem]" style={{ color: "var(--fg-muted)" }}>Insurance Expiry</p><p className="text-[.85rem] font-semibold">{detailVeh.insurance_expiry || "—"}</p></div>
            </div>

            {/* Documents section */}
            <div>
              <h3 className="text-[.85rem] font-bold flex items-center gap-2 mb-2"><FileText size={15} /> Documents</h3>
              <div className="grid grid-cols-2 gap-2">
                {["Registration", "Insurance", "Photo", "License"].map((doc) => (
                  <div key={doc} className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ border: "1px solid var(--border)", background: "var(--bg)" }}>
                    <FileText size={14} style={{ color: "var(--fg-muted)" }} />
                    <span className="text-[.75rem]">{doc}</span>
                    <span className="text-[.68rem] ml-auto" style={{ color: "var(--fg-muted)" }}>Not uploaded</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Approval History */}
            <div>
              <h3 className="text-[.85rem] font-bold flex items-center gap-2 mb-2"><Shield size={15} /> Approval History</h3>
              {approvalHistory.length === 0 ? (
                <p className="text-[.78rem]" style={{ color: "var(--fg-muted)" }}>No approval history yet.</p>
              ) : (
                <div className="space-y-2">
                  {approvalHistory.map((h) => (
                    <div key={h.id} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: "var(--bg)" }}>
                      <div className="mt-0.5">
                        {h.action === "approved" ? <CheckCircle size={14} style={{ color: "var(--success)" }} /> : h.action === "rejected" ? <XCircle size={14} style={{ color: "var(--danger)" }} /> : <Clock size={14} style={{ color: "var(--amber)" }} />}
                      </div>
                      <div>
                        <p className="text-[.78rem] font-semibold capitalize">{h.action}</p>
                        {h.reason && <p className="text-[.72rem]" style={{ color: "var(--fg-muted)" }}>Reason: {h.reason}</p>}
                        <p className="text-[.68rem]" style={{ color: "var(--fg-muted)" }}>
                          {h.reviewer_name || "System"} — {new Date(h.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
