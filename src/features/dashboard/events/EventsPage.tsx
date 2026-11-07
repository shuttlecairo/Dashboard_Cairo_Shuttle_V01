"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, BtnPrimary, BtnOutline, SearchInput, Pagination, EmptyState, TableSkeleton, Modal } from "@/components/dashboard/shared";
import { useToast } from "@/components/shared/toast";
import { inputStyle } from "@/config/dashboard";
import { Calendar, Plus, Eye, MapPin, Users, Clock } from "lucide-react";

const statusColors: Record<string, { bg: string; fg: string }> = {
  pending: { bg: "var(--amber-light)", fg: "var(--amber)" },
  quoted: { bg: "var(--blue-light, #e8f4fd)", fg: "var(--blue, #2563eb)" },
  confirmed: { bg: "var(--success-light)", fg: "var(--success)" },
  completed: { bg: "var(--success-light)", fg: "var(--success)" },
  cancelled: { bg: "var(--danger-light, #fee)", fg: "var(--danger)" },
};

function StatusPill({ status }: { status: string }) {
  const c = statusColors[status] || { bg: "var(--bg)", fg: "var(--fg-muted)" };
  return <span className="inline-flex rounded-full px-2.5 py-1 text-[.68rem] font-semibold capitalize" style={{ background: c.bg, color: c.fg }}>{status}</span>;
}

function formatEGP(n: number) { return n.toLocaleString("en-EG") + " EGP"; }

const EMPTY: any = { route_description: "", pickup_area: "", dropoff_area: "", passengers: "", preferred_date: "", preferred_time: "", frequency: "one-time", client_id: "" };

export default function EventsPage() {
  const { show } = useToast();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<null | "add" | "view">(null);
  const [form, setForm] = useState<any>({ ...EMPTY });
  const [selected, setSelected] = useState<any>(null);
  const perPage = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rRes, cRes] = await Promise.all([
        fetch("/api/b2b-requests").then(r => r.json()),
        fetch("/api/b2b-clients").then(r => r.json()),
      ]);
      const all = rRes.success ? rRes.data : [];
      // filter for event-type requests (one-time)
      setRequests(all.filter((r: any) => r.frequency === "one-time" || r.frequency === "event"));
      setClients(cRes.success ? cRes.data : []);
    } catch { show("Failed to load event requests", "danger"); }
    setLoading(false);
  }, [show]);

  useEffect(() => { load(); }, [load]);

  const filtered = requests.filter(r =>
    [r.route_description, r.pickup_area, r.dropoff_area, r.client_name].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  async function save() {
    try {
      const res = await fetch("/api/b2b-requests", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, passengers: Number(form.passengers) || 0, frequency: "one-time" }),
      });
      const json = await res.json();
      if (json.success) { show("Event request created", "success"); setModal(null); setForm({ ...EMPTY }); load(); }
      else show(json.error || "Failed", "danger");
    } catch { show("Network error", "danger"); }
  }

  async function updateStatus(id: string, status: string, quote?: number) {
    try {
      const body: any = { status };
      if (quote != null) body.quote = quote;
      const res = await fetch(`/api/b2b-requests?id=${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (json.success) { show(`Request ${status}`, "success"); load(); setModal(null); }
      else show(json.error || "Failed", "danger");
    } catch { show("Network error", "danger"); }
  }

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
        <h1 className="text-[1.6rem] font-bold flex items-center gap-2"><Calendar size={24} style={{ color: "var(--brand)" }} /> Event Shuttle Requests</h1>
        <BtnPrimary onClick={() => { setForm({ ...EMPTY }); setModal("add"); }}><Plus size={14} /> New Request</BtnPrimary>
      </div>

      <div className="mb-4"><SearchInput value={search} onChange={setSearch} placeholder="Search events…" /></div>

      {loading ? <TableSkeleton rows={5} cols={7} /> : filtered.length === 0 ? <EmptyState title="No event requests" description="Create a shuttle request for an event" /> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-[.82rem]">
              <thead><tr style={{ background: "var(--bg)" }}>
                {["Client", "Description", "Pickup", "Dropoff", "Passengers", "Date", "Status", ""].map(h => (
                  <th key={h} className="p-3 text-left text-[.72rem] font-semibold" style={{ color: "var(--fg-muted)" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {paged.map(r => (
                  <tr key={r.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td className="p-3 font-medium">{r.client_name || "—"}</td>
                    <td className="p-3 max-w-[180px] truncate">{r.route_description}</td>
                    <td className="p-3">{r.pickup_area}</td>
                    <td className="p-3">{r.dropoff_area}</td>
                    <td className="p-3">{r.passengers}</td>
                    <td className="p-3 whitespace-nowrap">{r.preferred_date || "—"}</td>
                    <td className="p-3"><StatusPill status={r.status} /></td>
                    <td className="p-3"><button onClick={() => { setSelected(r); setModal("view"); }} className="text-[.72rem] font-semibold" style={{ color: "var(--brand)" }}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && <div className="p-3" style={{ borderTop: "1px solid var(--border)" }}><Pagination current={page} total={totalPages} onChange={setPage} /></div>}
        </Card>
      )}

      {modal === "view" && selected && (
        <Modal title="Event Request Details" onClose={() => setModal(null)} wide>
          <div className="space-y-4 text-[.82rem]">
            <div className="flex gap-2 items-center"><StatusPill status={selected.status} />{selected.quote && <span className="font-semibold" style={{ color: "var(--brand)" }}>{formatEGP(selected.quote)}</span>}</div>
            <div className="grid grid-cols-2 gap-3">
              {[["Client", selected.client_name || "—"], ["Description", selected.route_description], ["Pickup", selected.pickup_area], ["Dropoff", selected.dropoff_area], ["Passengers", selected.passengers], ["Date", selected.preferred_date || "—"], ["Time", selected.preferred_time || "—"]].map(([l, v]) => (
                <div key={l as string}><span className="text-[.72rem]" style={{ color: "var(--fg-muted)" }}>{l}</span><div className="font-medium">{v}</div></div>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              {selected.status === "pending" && <BtnPrimary onClick={() => { const q = prompt("Enter quote amount (EGP):"); if (q) updateStatus(selected.id, "quoted", Number(q)); }}>Send Quote</BtnPrimary>}
              {selected.status === "quoted" && <BtnPrimary onClick={() => updateStatus(selected.id, "confirmed")}>Confirm</BtnPrimary>}
              <BtnOutline onClick={() => setModal(null)}>Close</BtnOutline>
            </div>
          </div>
        </Modal>
      )}

      {modal === "add" && (
        <Modal title="New Event Shuttle Request" onClose={() => setModal(null)}>
          <div className="space-y-3">
            <div><label className="text-[.72rem] font-semibold block mb-1" style={{ color: "var(--fg-muted)" }}>Client</label>
              <select style={inputStyle} className="w-full" value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })}>
                <option value="">Select client…</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
              </select>
            </div>
            {[["route_description", "Event Description"], ["pickup_area", "Pickup Area"], ["dropoff_area", "Dropoff Area"], ["passengers", "Number of Passengers"]].map(([k, l]) => (
              <div key={k}><label className="text-[.72rem] font-semibold block mb-1" style={{ color: "var(--fg-muted)" }}>{l}</label>
                <input style={inputStyle} className="w-full" value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[.72rem] font-semibold block mb-1" style={{ color: "var(--fg-muted)" }}>Date</label>
                <input type="date" style={inputStyle} className="w-full" value={form.preferred_date} onChange={e => setForm({ ...form, preferred_date: e.target.value })} />
              </div>
              <div><label className="text-[.72rem] font-semibold block mb-1" style={{ color: "var(--fg-muted)" }}>Time</label>
                <input type="time" style={inputStyle} className="w-full" value={form.preferred_time} onChange={e => setForm({ ...form, preferred_time: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 pt-2"><BtnPrimary onClick={save}>Create Request</BtnPrimary><BtnOutline onClick={() => setModal(null)}>Cancel</BtnOutline></div>
          </div>
        </Modal>
      )}
    </div>
  );
}
