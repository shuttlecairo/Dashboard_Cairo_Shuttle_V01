"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users, Plus, Edit2, Trash2, CheckCircle, XCircle,
  Clock, Shield, FileText, Phone, Mail,
} from "lucide-react";
import {
  Card, BtnPrimary, BtnOutline, BtnSuccess, BtnDanger, IconBtn, FormGroup,
  Modal, SearchInput, EmptyState, TableSkeleton, StatCard,
} from "@/components/dashboard/shared";
import { useToast } from "@/components/shared/toast";
import { inputStyle } from "@/config/dashboard";
import { api } from "@/api-client";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface Driver {
  id: string;
  partner_id: string;
  bus_partners?: { id: string; name: string; name_ar?: string };
  name: string;
  phone: string;
  email: string;
  national_id: string;
  license_number: string;
  license_expiry: string;
  date_of_birth: string;
  address: string;
  city: string;
  emergency_contact: string;
  emergency_phone: string;
  speaks_english: boolean;
  english_level: string;
  approval_status: "pending" | "approved" | "rejected" | "suspended";
  is_active: boolean;
  created_at: string;
}

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

export default function DriversPage() {
  const { show } = useToast();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, setModal] = useState<"add" | "edit" | "approve" | "reject" | "history" | null>(null);
  const [editing, setEditing] = useState<Driver | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [approvalHistory, setApprovalHistory] = useState<ApprovalEntry[]>([]);

  const [form, setForm] = useState({
    partner_id: "", name: "", phone: "", email: "",
    national_id: "", license_number: "", license_expiry: "", date_of_birth: "",
    address: "", city: "", emergency_contact: "", emergency_phone: "",
    speaks_english: false, english_level: "",
  });

  const fetchAll = useCallback(async () => {
    try {
      const [d, p] = await Promise.all([
        api.get<Driver[]>("/api/drivers"),
        api.get<Partner[]>("/api/partners"),
      ]);
      setDrivers(d);
      setPartners(p);
    } catch (e: any) {
      show(e?.message || "Failed to load", "danger");
    } finally {
      setLoading(false);
    }
  }, [show]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = drivers.filter((d) => {
    if (search) {
      const q = search.toLowerCase();
      const partnerName = d.bus_partners?.name || "";
      if (!d.name.toLowerCase().includes(q) && !d.phone.includes(q) && !partnerName.toLowerCase().includes(q)) return false;
    }
    if (statusFilter !== "all" && d.approval_status !== statusFilter) return false;
    return true;
  });

  const stats = {
    total: drivers.length,
    approved: drivers.filter((d) => d.approval_status === "approved").length,
    pending: drivers.filter((d) => d.approval_status === "pending").length,
    rejected: drivers.filter((d) => d.approval_status === "rejected").length,
  };

  const openAdd = () => {
    setForm({ partner_id: "", name: "", phone: "", email: "", national_id: "", license_number: "", license_expiry: "", date_of_birth: "", address: "", city: "", emergency_contact: "", emergency_phone: "", speaks_english: false, english_level: "" });
    setEditing(null);
    setModal("add");
  };

  const openEdit = (d: Driver) => {
    setEditing(d);
    setForm({
      partner_id: d.partner_id, name: d.name, phone: d.phone, email: d.email || "",
      national_id: d.national_id || "", license_number: d.license_number || "",
      license_expiry: d.license_expiry ? d.license_expiry.slice(0, 10) : "",
      date_of_birth: d.date_of_birth ? d.date_of_birth.slice(0, 10) : "",
      address: d.address || "", city: d.city || "",
      emergency_contact: d.emergency_contact || "", emergency_phone: d.emergency_phone || "",
      speaks_english: d.speaks_english || false, english_level: d.english_level || "",
    });
    setModal("edit");
  };

  const handleSave = async () => {
    if (!form.name.trim()) { show("Driver name is required", "danger"); return; }
    if (!form.phone.trim()) { show("Phone is required", "danger"); return; }
    setSaving(true);
    try {
      if (modal === "edit" && editing) {
        await api.patch(`/api/drivers/${editing.id}`, form);
        show("Driver updated");
      } else {
        await api.post("/api/drivers", form);
        show("Driver created");
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
    if (!confirm("Delete this driver? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await api.del(`/api/drivers/${id}`);
      show("Driver deleted");
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
      await api.post("/api/approval", { entity_type: "driver", entity_id: editing.id, action: "approved", reason: "Approved by admin" });
      show("Driver approved");
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
      await api.post("/api/approval", { entity_type: "driver", entity_id: editing.id, action: "rejected", reason: rejectionReason });
      show("Driver rejected");
      setModal(null);
      setRejectionReason("");
      fetchAll();
    } catch (e: any) {
      show(e?.message || "Failed to reject", "danger");
    } finally {
      setSaving(false);
    }
  };

  const openHistory = async (d: Driver) => {
    setEditing(d);
    try {
      const data = await api.get<ApprovalEntry[]>(`/api/approval/history?entity_type=driver&entity_id=${d.id}`);
      setApprovalHistory(data);
    } catch { setApprovalHistory([]); }
    setModal("history");
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-[1.6rem] font-bold flex items-center gap-2">
            <Users size={24} style={{ color: "var(--brand)" }} /> Driver Management
          </h1>
          <p className="text-[.82rem] mt-1" style={{ color: "var(--fg-muted)" }}>Manage drivers and approval status</p>
        </div>
        {/* <BtnPrimary onClick={openAdd}><Plus size={15} /> Add Driver</BtnPrimary> */}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Drivers" value={stats.total} icon={<Users size={20} />} />
        <StatCard label="Approved" value={stats.approved} icon={<CheckCircle size={20} />} color="var(--success)" />
        <StatCard label="Pending" value={stats.pending} icon={<Clock size={20} />} color="var(--amber)" />
        <StatCard label="Rejected" value={stats.rejected} icon={<XCircle size={20} />} color="var(--danger)" />
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="flex-1 min-w-[200px] max-w-[360px]">
          <SearchInput value={search} onChange={setSearch} placeholder="Search drivers..." />
        </div>
        {["all", "approved", "pending", "rejected", "suspended"].map((f) => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className="px-3 py-1.5 rounded-lg text-[.75rem] font-semibold cursor-pointer border-none transition-all"
            style={{ background: statusFilter === f ? "var(--brand)" : "var(--bg)", color: statusFilter === f ? "#fff" : "var(--fg-muted)", border: `1px solid ${statusFilter === f ? "var(--brand)" : "var(--border)"}` }}
          >{f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>

      <Card>
        {loading ? <TableSkeleton rows={5} cols={6} /> : filtered.length === 0 ? (
          <EmptyState icon={<Users size={32} style={{ color: "var(--brand)" }} />} title="No drivers found" description="Add your first driver to get started" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[.82rem]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Driver", "Partner", "Contact", "License", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left p-4 text-[.72rem] font-semibold" style={{ color: "var(--fg-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="p-4">
                      <div className="font-semibold">{d.name}</div>
                      {d.city && <div className="text-[.68rem]" style={{ color: "var(--fg-muted)" }}>{d.city}</div>}
                    </td>
                    <td className="p-4">{d.bus_partners?.name || "—"}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-[.78rem]"><Phone size={12} style={{ color: "var(--fg-muted)" }} />{d.phone}</div>
                      {d.email && <div className="flex items-center gap-1 text-[.68rem]" style={{ color: "var(--fg-muted)" }}><Mail size={11} />{d.email}</div>}
                    </td>
                    <td className="p-4">
                      <div className="text-[.78rem]">{d.license_number || "—"}</div>
                      {d.license_expiry && (
                        <div className="text-[.68rem]" style={{ color: new Date(d.license_expiry) < new Date() ? "var(--danger)" : "var(--fg-muted)" }}>
                          Exp: {new Date(d.license_expiry).toLocaleDateString("en-EG", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      )}
                    </td>
                    <td className="p-4">{approvalPill(d.approval_status)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        {d.approval_status === "pending" && (
                          <>
                            <IconBtn onClick={() => { setEditing(d); setModal("approve"); }} title="Approve"><CheckCircle size={14} style={{ color: "var(--success)" }} /></IconBtn>
                            <IconBtn onClick={() => { setEditing(d); setRejectionReason(""); setModal("reject"); }} title="Reject"><XCircle size={14} style={{ color: "var(--danger)" }} /></IconBtn>
                          </>
                        )}
                        <IconBtn onClick={() => openHistory(d)} title="History"><FileText size={14} /></IconBtn>
                        {/* <IconBtn onClick={() => openEdit(d)}><Edit2 size={14} /></IconBtn> */}
                        {/* <IconBtn onClick={() => handleDelete(d.id)}>
                          {deleting === d.id ? <span className="text-[.68rem]">...</span> : <Trash2 size={14} style={{ color: "var(--danger)" }} />}
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
        <Modal title={modal === "edit" ? "Edit Driver" : "Add Driver"} onClose={() => setModal(null)} wide>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <FormGroup label="Bus Partner">
              <select style={inputStyle as React.CSSProperties} value={form.partner_id} onChange={(e) => setForm({ ...form, partner_id: e.target.value })}>
                <option value="">Select partner...</option>
                {partners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Full Name">
              <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ahmed Hassan" />
            </FormGroup>
            <FormGroup label="Phone">
              <input style={inputStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+201XXXXXXXXX" />
            </FormGroup>
            <FormGroup label="Email">
              <input style={inputStyle} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="driver@example.com" />
            </FormGroup>
            <FormGroup label="National ID">
              <input style={inputStyle} value={form.national_id} onChange={(e) => setForm({ ...form, national_id: e.target.value })} placeholder="14-digit national ID" />
            </FormGroup>
            <FormGroup label="License Number">
              <input style={inputStyle} value={form.license_number} onChange={(e) => setForm({ ...form, license_number: e.target.value })} placeholder="License number" />
            </FormGroup>
            <FormGroup label="License Expiry">
              <input style={inputStyle} type="date" value={form.license_expiry} onChange={(e) => setForm({ ...form, license_expiry: e.target.value })} />
            </FormGroup>
            <FormGroup label="Date of Birth">
              <input style={inputStyle} type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
            </FormGroup>
            <FormGroup label="Address">
              <input style={inputStyle} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street address" />
            </FormGroup>
            <FormGroup label="City">
              <input style={inputStyle} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="e.g. Cairo" />
            </FormGroup>
            <FormGroup label="Emergency Contact">
              <input style={inputStyle} value={form.emergency_contact} onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })} placeholder="Emergency contact name" />
            </FormGroup>
            <FormGroup label="Emergency Phone">
              <input style={inputStyle} value={form.emergency_phone} onChange={(e) => setForm({ ...form, emergency_phone: e.target.value })} placeholder="+201XXXXXXXXX" />
            </FormGroup>
            <FormGroup label="Speaks English">
              <select style={inputStyle as React.CSSProperties} value={form.speaks_english ? "yes" : "no"} onChange={(e) => setForm({ ...form, speaks_english: e.target.value === "yes" })}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </FormGroup>
            {form.speaks_english && (
              <FormGroup label="English Level">
                <select style={inputStyle as React.CSSProperties} value={form.english_level} onChange={(e) => setForm({ ...form, english_level: e.target.value })}>
                  <option value="">Select level...</option>
                  <option value="basic">Basic</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="fluent">Fluent</option>
                </select>
              </FormGroup>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-5 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <BtnOutline onClick={() => setModal(null)}>Cancel</BtnOutline>
            <BtnPrimary onClick={handleSave} disabled={saving}>{saving ? "Saving..." : modal === "edit" ? "Update Driver" : "Add Driver"}</BtnPrimary>
          </div>
        </Modal>
      )}

      {modal === "approve" && editing && (
        <Modal title="Approve Driver" onClose={() => setModal(null)}>
          <p className="text-[.85rem] mb-4">Approve <strong>{editing.name}</strong>? This will make them available for trip assignments.</p>
          <div className="flex justify-end gap-2 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <BtnOutline onClick={() => setModal(null)}>Cancel</BtnOutline>
            <BtnSuccess onClick={handleApprove} disabled={saving}>{saving ? "Approving..." : "Approve Driver"}</BtnSuccess>
          </div>
        </Modal>
      )}

      {modal === "reject" && editing && (
        <Modal title="Reject Driver" onClose={() => setModal(null)}>
          <p className="text-[.85rem] mb-3">Reject <strong>{editing.name}</strong>?</p>
          <FormGroup label="Rejection Reason (required)">
            <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" } as React.CSSProperties} value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Explain why this driver is being rejected..." />
          </FormGroup>
          <div className="flex justify-end gap-2 mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <BtnOutline onClick={() => setModal(null)}>Cancel</BtnOutline>
            <BtnDanger onClick={handleReject} disabled={saving || !rejectionReason.trim()}>{saving ? "Rejecting..." : "Reject Driver"}</BtnDanger>
          </div>
        </Modal>
      )}

      {modal === "history" && editing && (
        <Modal title={`Approval History — ${editing.name}`} onClose={() => setModal(null)}>
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
