
"use client";

import { useState, useEffect, useCallback } from "react";
import { StatCard, Card, BtnPrimary, BtnOutline, Modal, SearchInput, TableSkeleton, EmptyState } from "@/components/dashboard/shared";
import { useToast } from "@/components/shared/toast";
import { api } from "@/api-client";
import { inputStyle } from "@/config/dashboard";
import {
  Users,
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
  Phone,
} from "lucide-react";

interface Driver {
  id: string;
  partner_id: string;
  name: string;
  full_name: string;
  phone: string;
  email?: string;
  license_number: string;
  license_expiry?: string;
  national_id?: string;
  date_of_birth?: string;
  photo_url?: string;
  approval_status: string;
  is_active: boolean;
  created_at: string;
}

interface ApprovalEntry {
  id: string;
  action: string;
  reason?: string;
  reviewer_name?: string;
  created_at: string;
}

interface Partner {
  id: string;
  name: string;
}

const EMPTY_FORM = {
  full_name: "",
  phone: "",
  email: "",
  license_number: "",
  license_expiry: "",
  national_id: "",
  date_of_birth: "",
};

function StatusBadge({ status }: { status: string }) {
  const c: Record<string, { bg: string; color: string; icon: React.ReactNode; label: string }> = {
    approved: { bg: "var(--success-light)", color: "var(--success)", icon: <CheckCircle size={12} />, label: "Approved" },
    pending: { bg: "var(--amber-light)", color: "var(--amber)", icon: <Clock size={12} />, label: "Pending" },
    rejected: { bg: "var(--danger-light)", color: "var(--danger)", icon: <XCircle size={12} />, label: "Rejected" },
    suspended: { bg: "var(--danger-light)", color: "var(--danger)", icon: <XCircle size={12} />, label: "Suspended" },
  };
  const cfg = c[status] || c.pending;
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[.68rem] font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.icon} {cfg.label}
    </span>
  );
}

export default function PartnerDriversPage() {
  const { show } = useToast();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [editDrv, setEditDrv] = useState<Driver | null>(null);
  const [detailDrv, setDetailDrv] = useState<Driver | null>(null);
  const [approvalHistory, setApprovalHistory] = useState<ApprovalEntry[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const partners = await api.get<Partner[]>("/api/partners");
      if (partners.length === 0) {
        setLoading(false);
        return;
      }
      setPartner(partners[0]);
      const drvs = await api.get<Driver[]>(`/api/partners/${partners[0].id}/drivers`);
      setDrivers(drvs);
    } catch {
      show("Failed to load drivers", "danger");
    } finally {
      setLoading(false);
    }
  }, [show]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = drivers.filter((d) => {
    const name = d.full_name || d.name || "";
    const matchSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      (d.phone || "").includes(search) ||
      (d.license_number || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || d.approval_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const approvedCount = drivers.filter((d) => d.approval_status === "approved").length;
  const pendingCount = drivers.filter((d) => d.approval_status === "pending").length;
  const rejectedCount = drivers.filter((d) => d.approval_status === "rejected").length;

  function openAdd() {
    setForm(EMPTY_FORM);
    setShowAdd(true);
  }

  function openEdit(d: Driver) {
    setForm({
      full_name: d.full_name || d.name || "",
      phone: d.phone || "",
      email: d.email || "",
      license_number: d.license_number || "",
      license_expiry: d.license_expiry || "",
      national_id: d.national_id || "",
      date_of_birth: d.date_of_birth || "",
    });
    setEditDrv(d);
  }

  async function openDetail(d: Driver) {
    setDetailDrv(d);
    try {
      const hist = await api.get<ApprovalEntry[]>(
        `/api/approval/history?entity_type=driver&entity_id=${d.id}`
      );
      setApprovalHistory(hist);
    } catch {
      setApprovalHistory([]);
    }
  }

  async function handleSave() {
    if (!partner || !form.full_name || !form.phone || !form.license_number) {
      show("Name, phone and license number are required", "danger");
      return;
    }
    setSaving(true);
    try {
      if (editDrv) {
        await api.patch(`/api/drivers/${editDrv.id}`, form);
        show("Driver updated", "success");
        setEditDrv(null);
      } else {
        await api.post("/api/drivers", { ...form, partner_id: partner.id });
        show("Driver added — pending approval", "success");
        setShowAdd(false);
      }
      loadData();
    } catch {
      show("Failed to save driver", "danger");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(d: Driver) {
    if (!confirm(`Delete driver ${d.full_name || d.name}?`)) return;
    try {
      await api.del(`/api/drivers/${d.id}`);
      show("Driver deleted", "success");
      loadData();
    } catch {
      show("Failed to delete driver", "danger");
    }
  }

  async function handleResubmit(d: Driver) {
    try {
      await api.patch(`/api/drivers/${d.id}`, { approval_status: "pending" });
      show("Driver resubmitted for approval", "success");
      loadData();
    } catch {
      show("Failed to resubmit", "danger");
    }
  }

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-[1.6rem] font-bold flex items-center gap-2">
            <Users size={24} style={{ color: "var(--brand)" }} /> My Drivers
          </h1>
          <p className="text-[.85rem]" style={{ color: "var(--fg-muted)" }}>
            Manage your drivers — {partner?.name}
          </p>
        </div>
        <BtnPrimary onClick={openAdd}>
          <Plus size={15} /> Add Driver
        </BtnPrimary>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4 mb-6">
        <StatCard label="Total" value={drivers.length} sub="All drivers" />
        <StatCard label="Approved" value={approvedCount} valueColor="var(--success)" sub="Active drivers" />
        <StatCard label="Pending" value={pendingCount} valueColor="var(--amber)" sub="Awaiting review" />
        <StatCard label="Rejected" value={rejectedCount} valueColor="var(--danger)" sub="Need attention" />
      </div>

      <Card>
        <div
          className="p-4 flex items-center justify-between flex-wrap gap-3"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="w-[260px]">
            <SearchInput value={search} onChange={setSearch} placeholder="Search drivers..." />
          </div>
          <div className="flex gap-2">
            {["all", "approved", "pending", "rejected"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="px-3 py-1.5 rounded-lg text-[.72rem] font-semibold cursor-pointer border-none transition-all"
                style={{
                  background: statusFilter === s ? "var(--brand)" : "var(--bg)",
                  color: statusFilter === s ? "white" : "var(--fg-muted)",
                }}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Users size={40} />}
            title="No drivers found"
            description={
              search || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Add your first driver to get started"
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[.82rem]">
              <thead>
                <tr style={{ background: "var(--bg)" }}>
                  {["Name", "Phone", "License #", "License Expiry", "Status", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="p-3 text-left text-[.72rem] font-semibold"
                        style={{ color: "var(--fg-muted)" }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr
                    key={d.id}
                    className="transition-colors"
                    style={{ borderTop: "1px solid var(--border)" }}
                  >
                    <td className="p-3 font-semibold">{d.full_name || d.name}</td>
                    <td className="p-3">
                      <span className="flex items-center gap-1">
                        <Phone size={12} style={{ color: "var(--fg-muted)" }} /> {d.phone}
                      </span>
                    </td>
                    <td className="p-3" style={{ color: "var(--brand)", fontWeight: 600 }}>
                      {d.license_number}
                    </td>
                    <td className="p-3">
                      {d.license_expiry
                        ? new Date(d.license_expiry).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="p-3">
                      <StatusBadge status={d.approval_status} />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openDetail(d)}
                          className="w-7 h-7 rounded flex items-center justify-center cursor-pointer border-none"
                          style={{ background: "var(--bg)", color: "var(--fg-muted)" }}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => openEdit(d)}
                          className="w-7 h-7 rounded flex items-center justify-center cursor-pointer border-none"
                          style={{ background: "var(--bg)", color: "var(--blue)" }}
                        >
                          <Edit size={14} />
                        </button>
                        {d.approval_status === "rejected" && (
                          <button
                            onClick={() => handleResubmit(d)}
                            className="w-7 h-7 rounded flex items-center justify-center cursor-pointer border-none"
                            style={{ background: "var(--amber-light)", color: "var(--amber)" }}
                          >
                            <RefreshCw size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(d)}
                          className="w-7 h-7 rounded flex items-center justify-center cursor-pointer border-none"
                          style={{ background: "var(--danger-light)", color: "var(--danger)" }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add/Edit Modal — inline form, not a nested component */}
      {(showAdd || editDrv) && (
        <Modal
          title={editDrv ? "Edit Driver" : "Add Driver"}
          onClose={() => {
            setShowAdd(false);
            setEditDrv(null);
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-[.78rem] font-semibold mb-1">Full Name *</label>
              <input
                style={inputStyle}
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="Ahmed Mohamed"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[.78rem] font-semibold mb-1">Phone *</label>
                <input
                  style={inputStyle}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+201012345678"
                />
              </div>
              <div>
                <label className="block text-[.78rem] font-semibold mb-1">Email</label>
                <input
                  style={inputStyle}
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="driver@email.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[.78rem] font-semibold mb-1">License Number *</label>
                <input
                  style={inputStyle}
                  value={form.license_number}
                  onChange={(e) => setForm({ ...form, license_number: e.target.value })}
                  placeholder="DRV-12345"
                />
              </div>
              <div>
                <label className="block text-[.78rem] font-semibold mb-1">License Expiry</label>
                <input
                  style={inputStyle}
                  type="date"
                  value={form.license_expiry}
                  onChange={(e) => setForm({ ...form, license_expiry: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[.78rem] font-semibold mb-1">National ID</label>
                <input
                  style={inputStyle}
                  value={form.national_id}
                  onChange={(e) => setForm({ ...form, national_id: e.target.value })}
                  placeholder="29901011234567"
                />
              </div>
              <div>
                <label className="block text-[.78rem] font-semibold mb-1">Date of Birth</label>
                <input
                  style={inputStyle}
                  type="date"
                  value={form.date_of_birth}
                  onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-[.78rem] font-semibold mb-2">Documents</label>
              <div className="grid grid-cols-2 gap-2">
                {["License", "National ID", "Criminal Record", "Photo"].map((doc) => (
                  <button
                    key={doc}
                    type="button"
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-[.75rem] font-medium cursor-pointer transition-all"
                    style={{
                      border: "1px dashed var(--border)",
                      background: "var(--bg)",
                      color: "var(--fg-muted)",
                    }}
                  >
                    <Upload size={14} /> {doc}
                  </button>
                ))}
              </div>
              <p className="text-[.68rem] mt-1" style={{ color: "var(--fg-muted)" }}>
                Document upload requires storage setup
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <BtnPrimary onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editDrv ? "Update Driver" : "Add Driver"}
              </BtnPrimary>
              <BtnOutline
                onClick={() => {
                  setShowAdd(false);
                  setEditDrv(null);
                }}
              >
                Cancel
              </BtnOutline>
            </div>
          </div>
        </Modal>
      )}

      {/* Detail Modal */}
      {detailDrv && (
        <Modal title="Driver Details" onClose={() => setDetailDrv(null)} wide>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[.72rem]" style={{ color: "var(--fg-muted)" }}>Full Name</p>
                <p className="text-[.85rem] font-semibold">{detailDrv.full_name || detailDrv.name}</p>
              </div>
              <div>
                <p className="text-[.72rem]" style={{ color: "var(--fg-muted)" }}>Phone</p>
                <p className="text-[.85rem] font-semibold">{detailDrv.phone}</p>
              </div>
              <div>
                <p className="text-[.72rem]" style={{ color: "var(--fg-muted)" }}>Email</p>
                <p className="text-[.85rem] font-semibold">{detailDrv.email || "—"}</p>
              </div>
              <div>
                <p className="text-[.72rem]" style={{ color: "var(--fg-muted)" }}>License Number</p>
                <p className="text-[.85rem] font-semibold">{detailDrv.license_number}</p>
              </div>
              <div>
                <p className="text-[.72rem]" style={{ color: "var(--fg-muted)" }}>License Expiry</p>
                <p className="text-[.85rem] font-semibold">
                  {detailDrv.license_expiry
                    ? new Date(detailDrv.license_expiry).toLocaleDateString()
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-[.72rem]" style={{ color: "var(--fg-muted)" }}>National ID</p>
                <p className="text-[.85rem] font-semibold">{detailDrv.national_id || "—"}</p>
              </div>
              <div>
                <p className="text-[.72rem]" style={{ color: "var(--fg-muted)" }}>Date of Birth</p>
                <p className="text-[.85rem] font-semibold">
                  {detailDrv.date_of_birth
                    ? new Date(detailDrv.date_of_birth).toLocaleDateString()
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-[.72rem]" style={{ color: "var(--fg-muted)" }}>Status</p>
                <StatusBadge status={detailDrv.approval_status} />
              </div>
            </div>

            {/* Documents section */}
            <div>
              <h3 className="text-[.85rem] font-bold flex items-center gap-2 mb-2">
                <FileText size={15} /> Documents
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {["License", "National ID", "Criminal Record", "Photo"].map((doc) => (
                  <div
                    key={doc}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
                    style={{ border: "1px solid var(--border)", background: "var(--bg)" }}
                  >
                    <FileText size={14} style={{ color: "var(--fg-muted)" }} />
                    <span className="text-[.75rem]">{doc}</span>
                    <span className="text-[.68rem] ml-auto" style={{ color: "var(--fg-muted)" }}>
                      Not uploaded
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Approval History */}
            <div>
              <h3 className="text-[.85rem] font-bold flex items-center gap-2 mb-2">
                <Shield size={15} /> Approval History
              </h3>
              {approvalHistory.length === 0 ? (
                <p className="text-[.78rem]" style={{ color: "var(--fg-muted)" }}>
                  No approval history yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {approvalHistory.map((h) => (
                    <div
                      key={h.id}
                      className="flex items-start gap-3 p-3 rounded-lg"
                      style={{ background: "var(--bg)" }}
                    >
                      <div className="mt-0.5">
                        {h.action === "approved" ? (
                          <CheckCircle size={14} style={{ color: "var(--success)" }} />
                        ) : h.action === "rejected" ? (
                          <XCircle size={14} style={{ color: "var(--danger)" }} />
                        ) : (
                          <Clock size={14} style={{ color: "var(--amber)" }} />
                        )}
                      </div>
                      <div>
                        <p className="text-[.78rem] font-semibold capitalize">{h.action}</p>
                        {h.reason && (
                          <p className="text-[.72rem]" style={{ color: "var(--fg-muted)" }}>
                            Reason: {h.reason}
                          </p>
                        )}
                        <p className="text-[.68rem]" style={{ color: "var(--fg-muted)" }}>
                          {h.reviewer_name || "System"} —{" "}
                          {new Date(h.created_at).toLocaleDateString()}
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