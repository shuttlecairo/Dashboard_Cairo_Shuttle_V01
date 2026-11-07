"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, BtnPrimary, BtnOutline, BtnSuccess, BtnDanger, SearchInput, Pagination, EmptyState, TableSkeleton, Modal } from "@/components/dashboard/shared";
import { useToast } from "@/components/shared/toast";
import { inputStyle } from "@/config/dashboard";
import { Building, Plus, Edit3, Eye, CheckCircle, XCircle, Users, Truck } from "lucide-react";

const statusColors: Record<string, { bg: string; fg: string }> = {
  active: { bg: "var(--success-light)", fg: "var(--success)" },
  inactive: { bg: "var(--danger-light, #fee)", fg: "var(--danger)" },
  pending: { bg: "var(--amber-light)", fg: "var(--amber)" },
  suspended: { bg: "var(--danger-light, #fee)", fg: "var(--danger)" },
};

function StatusPill({ status }: { status: string }) {
  const c = statusColors[status] || { bg: "var(--bg)", fg: "var(--fg-muted)" };
  return <span className="inline-flex rounded-full px-2.5 py-1 text-[.68rem] font-semibold capitalize" style={{ background: c.bg, color: c.fg }}>{status}</span>;
}

const EMPTY: any = { name: "", name_ar: "", contact_name: "", contact_phone: "", contact_email: "", address: "", city: "", status: "pending", notes: "" };

export default function PartnersPage() {
  const { show } = useToast();
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<null | "add" | "edit" | "view">(null);
  const [form, setForm] = useState<any>({ ...EMPTY });
  const [selected, setSelected] = useState<any>(null);
  const perPage = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, vRes, dRes] = await Promise.all([
        fetch("/api/partners").then(r => r.json()),
        fetch("/api/vehicles").then(r => r.json()),
        fetch("/api/drivers").then(r => r.json()),
      ]);
      setPartners(pRes.success ? pRes.data : []);
      setVehicles(vRes.success ? vRes.data : []);
      setDrivers(dRes.success ? dRes.data : []);
    } catch { show("Failed to load partners", "danger"); }
    setLoading(false);
  }, [show]);

  useEffect(() => { load(); }, [load]);

  const filtered = partners.filter(p =>
    [p.name, p.contact_name, p.city].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  // function partnerStats(partnerId: string) {
  //   return {
  //     vehicleCount: vehicles.filter(v => v.partner_id === partnerId).length,
  //     driverCount: drivers.filter(d => d.partner_id === partnerId).length,
  //   };
  // }
function partnerStats(partnerId: string) {
    return {
      vehicleCount: vehicles.filter(v => v.partner_id === partnerId && v.approval_status === "approved").length,
      driverCount: drivers.filter(d => d.partner_id === partnerId && d.approval_status === "approved").length,
    };
}
  async function save() {
    const method = modal === "edit" ? "PATCH" : "POST";
    const url = modal === "edit" ? `/api/partners?id=${selected.id}` : "/api/partners";
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const json = await res.json();
      if (json.success) { show(modal === "edit" ? "Partner updated" : "Partner created", "success"); setModal(null); load(); }
      else show(json.error || "Failed", "danger");
    } catch { show("Network error", "danger"); }
  }

  function openEdit(p: any) {
    setSelected(p);
    setForm({ name: p.name, name_ar: p.name_ar || "", contact_name: p.contact_name, contact_phone: p.contact_phone, contact_email: p.contact_email, address: p.address || "", city: p.city || "", status: p.status, notes: p.notes || "" });
    setModal("edit");
  }

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
        <h1 className="text-[1.6rem] font-bold flex items-center gap-2"><Building size={24} style={{ color: "var(--brand)" }} /> Bus Partners</h1>
        <BtnPrimary onClick={() => { setForm({ ...EMPTY }); setModal("add"); }}><Plus size={14} /> New Partner</BtnPrimary>
      </div>

      <div className="mb-4"><SearchInput value={search} onChange={setSearch} placeholder="Search partner name or city…" /></div>

      {loading ? <TableSkeleton rows={5} cols={7} /> : filtered.length === 0 ? <EmptyState title="No partners" description="Add your first bus partner" /> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-[.82rem]">
              <thead><tr style={{ background: "var(--bg)" }}>
                {["Partner", "Contact", "City", "Vehicles", "Drivers", "Status", "Actions"].map(h => (
                  <th key={h} className="p-3 text-left text-[.72rem] font-semibold" style={{ color: "var(--fg-muted)" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {paged.map(p => {
                  const s = partnerStats(p.id);
                  return (
                    <tr key={p.id} style={{ borderTop: "1px solid var(--border)" }}>
                      <td className="p-3"><div className="font-medium">{p.name}</div>{p.name_ar && <div className="text-[.72rem]" style={{ color: "var(--fg-muted)" }}>{p.name_ar}</div>}</td>
                      <td className="p-3"><div>{p.contact_name}</div><div className="text-[.72rem]" style={{ color: "var(--fg-muted)" }}>{p.contact_phone}</div></td>
                      <td className="p-3">{p.city || "—"}</td>
                      <td className="p-3"><span className="flex items-center gap-1"><Truck size={13} style={{ color: "var(--brand)" }} /> {s.vehicleCount}</span></td>
                      <td className="p-3"><span className="flex items-center gap-1"><Users size={13} style={{ color: "var(--brand)" }} /> {s.driverCount}</span></td>
                      <td className="p-3"><StatusPill status={p.status} /></td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <button onClick={() => { setSelected(p); setModal("view"); }} className="p-1.5 rounded" style={{ color: "var(--brand)" }}><Eye size={14} /></button>
                          {/* <button onClick={() => openEdit(p)} className="p-1.5 rounded" style={{ color: "var(--amber)" }}><Edit3 size={14} /></button> */}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && <div className="p-3" style={{ borderTop: "1px solid var(--border)" }}><Pagination current={page} total={totalPages} onChange={setPage} /></div>}
        </Card>
      )}

      {modal === "view" && selected && (
        <Modal title="Partner Details" onClose={() => setModal(null)} wide>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[.82rem]">
            <div className="space-y-2">
              <h3 className="text-[.85rem] font-bold mb-2">Information</h3>
              {[["Name", selected.name], ["Arabic Name", selected.name_ar || "—"], ["Contact", selected.contact_name], ["Phone", selected.contact_phone], ["Email", selected.contact_email], ["City", selected.city || "—"], ["Status", selected.status]].map(([l, v]) => (
                <div key={l as string} className="flex justify-between"><span style={{ color: "var(--fg-muted)" }}>{l}</span><span className="font-medium">{v}</span></div>
              ))}
            </div>
            <div>
              <h3 className="text-[.85rem] font-bold mb-2">Fleet Overview</h3>
              <div className="space-y-2">
                <div className="p-3 rounded-lg" style={{ background: "var(--bg)" }}>
                  <div className="flex items-center gap-2"><Truck size={16} style={{ color: "var(--brand)" }} /> <span className="font-semibold">{partnerStats(selected.id).vehicleCount} Vehicles</span></div>
                </div>
                <div className="p-3 rounded-lg" style={{ background: "var(--bg)" }}>
                  <div className="flex items-center gap-2"><Users size={16} style={{ color: "var(--brand)" }} /> <span className="font-semibold">{partnerStats(selected.id).driverCount} Drivers</span></div>
                </div>
              </div>
              {selected.notes && <div className="mt-3"><span className="text-[.72rem] font-semibold" style={{ color: "var(--fg-muted)" }}>Notes</span><p className="mt-1">{selected.notes}</p></div>}
            </div>
          </div>
        </Modal>
      )}

      {(modal === "add" || modal === "edit") && (
        <Modal title={modal === "edit" ? "Edit Partner" : "New Partner"} onClose={() => setModal(null)}>
          <div className="space-y-3">
            {[["name", "Company Name"], ["name_ar", "Arabic Name"], ["contact_name", "Contact Person"], ["contact_phone", "Phone"], ["contact_email", "Email"], ["address", "Address"], ["city", "City"]].map(([k, l]) => (
              <div key={k}><label className="text-[.72rem] font-semibold block mb-1" style={{ color: "var(--fg-muted)" }}>{l}</label>
                <input style={inputStyle} className="w-full" value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} />
              </div>
            ))}
            <div><label className="text-[.72rem] font-semibold block mb-1" style={{ color: "var(--fg-muted)" }}>Status</label>
              <select style={inputStyle} className="w-full" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {["pending", "active", "inactive", "suspended"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div><label className="text-[.72rem] font-semibold block mb-1" style={{ color: "var(--fg-muted)" }}>Notes</label>
              <textarea style={inputStyle} className="w-full" rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="flex gap-2 pt-2"><BtnPrimary onClick={save}>{modal === "edit" ? "Update" : "Create"}</BtnPrimary><BtnOutline onClick={() => setModal(null)}>Cancel</BtnOutline></div>
          </div>
        </Modal>
      )}
    </div>
  );
}
