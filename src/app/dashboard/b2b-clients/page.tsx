// "use client";

// import { useState } from "react";
// import { Card, StatCard, BtnPrimary, IconBtn } from "@/components/dashboard/shared";
// import { Badge } from "@/components/shared/badge";
// import { Building2, Plus, Search, Mail, Phone, MapPin, Edit, Trash2 } from "lucide-react";
// import { b2bClients, b2bRequests, nextId } from "@/store/data";
// import { inputStyle } from "@/config/dashboard";
// import type { B2BClient } from "@/types/entities";

// export default function B2BClientsPage() {
//   const [search, setSearch] = useState("");
//   const [showForm, setShowForm] = useState(false);
//   const [editingClient, setEditingClient] = useState<B2BClient | null>(null);

//   const filtered = b2bClients.filter(
//     (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.contact_name.toLowerCase().includes(search.toLowerCase())
//   );

//   const activeClients = b2bClients.filter((c) => c.is_active);

//   function getRequestCount(clientId: string) {
//     return b2bRequests.filter((r) => r.client_id === clientId).length;
//   }

//   function getActiveRequests(clientId: string) {
//     return b2bRequests.filter((r) => r.client_id === clientId && ["accepted", "quoted"].includes(r.status)).length;
//   }

//   return (
//     <div style={{ animation: "fadeIn .3s ease" }}>
//       <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
//         <div>
//           <h1 className="text-[1.6rem] font-bold flex items-center gap-2">
//             <Building2 size={24} style={{ color: "var(--brand)" }} />
//             B2B Clients
//           </h1>
//           <p className="text-[.85rem] mt-0.5" style={{ color: "var(--fg-muted)" }}>
//             Manage corporate transportation clients
//           </p>
//         </div>
//         <BtnPrimary onClick={() => { setEditingClient(null); setShowForm(true); }}>
//           <Plus size={14} /> Add Client
//         </BtnPrimary>
//       </div>

//       <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-4 mb-6">
//         <StatCard label="Total Clients" value={b2bClients.length} />
//         <StatCard label="Active" value={activeClients.length} valueColor="var(--success)" />
//         <StatCard label="Total Requests" value={b2bRequests.length} valueColor="var(--blue)" />
//       </div>

//       {/* Search */}
//       <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
//         <Search size={16} style={{ color: "var(--fg-muted)" }} />
//         <input
//           type="text"
//           placeholder="Search clients..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="flex-1 bg-transparent border-none outline-none text-[.85rem]"
//           style={{ color: "var(--fg)" }}
//         />
//       </div>

//       {/* Client Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
//         {filtered.map((client) => (
//           <Card key={client.id}>
//             <div className="p-5">
//               <div className="flex items-start justify-between mb-3">
//                 <div className="flex items-center gap-3">
//                   <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: "var(--brand)" }}>
//                     {client.name.charAt(0)}
//                   </div>
//                   <div>
//                     <div className="text-[.92rem] font-bold">{client.name}</div>
//                     <div className="text-[.75rem]" style={{ color: "var(--fg-muted)" }}>{client.contact_name}</div>
//                   </div>
//                 </div>
//                 <span className="text-[.68rem] px-2 py-0.5 rounded-full font-semibold" style={{
//                   background: client.is_active ? "var(--success-light)" : "var(--danger-light)",
//                   color: client.is_active ? "var(--success)" : "var(--danger)",
//                 }}>
//                   {client.is_active ? "Active" : "Inactive"}
//                 </span>
//               </div>

//               <div className="space-y-1.5 text-[.78rem]" style={{ color: "var(--fg-muted)" }}>
//                 <div className="flex items-center gap-2"><Mail size={13} /> {client.contact_email}</div>
//                 <div className="flex items-center gap-2"><Phone size={13} /> {client.contact_phone}</div>
//                 {client.address && <div className="flex items-center gap-2"><MapPin size={13} /> {client.address}</div>}
//               </div>

//               <div className="flex items-center gap-4 mt-4 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
//                 <div>
//                   <div className="text-[.68rem]" style={{ color: "var(--fg-muted)" }}>Requests</div>
//                   <div className="text-[1rem] font-bold">{getRequestCount(client.id)}</div>
//                 </div>
//                 <div>
//                   <div className="text-[.68rem]" style={{ color: "var(--fg-muted)" }}>Active</div>
//                   <div className="text-[1rem] font-bold" style={{ color: "var(--success)" }}>{getActiveRequests(client.id)}</div>
//                 </div>
//                 <div className="ml-auto flex gap-1">
//                   <IconBtn title="Edit" onClick={() => { setEditingClient(client); setShowForm(true); }}>
//                     <Edit size={14} />
//                   </IconBtn>
//                 </div>
//               </div>
//             </div>
//           </Card>
//         ))}
//       </div>

//       {/* Add/Edit Modal */}
//       {showForm && <ClientFormModal client={editingClient} onClose={() => setShowForm(false)} />}
//     </div>
//   );
// }

// function ClientFormModal({ client, onClose }: { client: B2BClient | null; onClose: () => void }) {
//   const [form, setForm] = useState({
//     name: client?.name || "",
//     contact_name: client?.contact_name || "",
//     contact_email: client?.contact_email || "",
//     contact_phone: client?.contact_phone || "",
//     address: client?.address || "",
//   });

//   function handleSubmit() {
//     if (!form.name || !form.contact_name) return;
//     if (client) {
//       Object.assign(client, form);
//     } else {
//       b2bClients.push({ id: nextId(), ...form, is_active: true });
//     }
//     onClose();
//   }

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,.5)" }} onClick={onClose}>
//       <div className="w-full max-w-md rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }} onClick={(e) => e.stopPropagation()}>
//         <h2 className="text-[1.1rem] font-bold mb-4">{client ? "Edit Client" : "Add New Client"}</h2>
//         <div className="space-y-3">
//           <div>
//             <label className="text-[.75rem] font-semibold block mb-1" style={{ color: "var(--fg-muted)" }}>Company Name *</label>
//             <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
//           </div>
//           <div>
//             <label className="text-[.75rem] font-semibold block mb-1" style={{ color: "var(--fg-muted)" }}>Contact Person *</label>
//             <input style={inputStyle} value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
//           </div>
//           <div>
//             <label className="text-[.75rem] font-semibold block mb-1" style={{ color: "var(--fg-muted)" }}>Email</label>
//             <input style={inputStyle} value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
//           </div>
//           <div>
//             <label className="text-[.75rem] font-semibold block mb-1" style={{ color: "var(--fg-muted)" }}>Phone</label>
//             <input style={inputStyle} value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
//           </div>
//           <div>
//             <label className="text-[.75rem] font-semibold block mb-1" style={{ color: "var(--fg-muted)" }}>Address</label>
//             <input style={inputStyle} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
//           </div>
//         </div>
//         <div className="flex justify-end gap-2 mt-5">
//           <button onClick={onClose} className="px-4 py-2 rounded-lg text-[.82rem] font-semibold cursor-pointer border-none" style={{ background: "var(--bg)", color: "var(--fg-muted)" }}>Cancel</button>
//           <button onClick={handleSubmit} className="px-4 py-2 rounded-lg text-[.82rem] font-semibold cursor-pointer border-none text-white" style={{ background: "var(--brand)" }}>
//             {client ? "Update" : "Add Client"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, StatCard, BtnPrimary, IconBtn } from "@/components/dashboard/shared";
import { useToast } from "@/components/shared/toast";
import { Building2, Plus, Search, Mail, Phone, MapPin, Edit } from "lucide-react";
import { inputStyle } from "@/config/dashboard";

export default function B2BClientsPage() {
  const { show } = useToast();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Load clients
      const cRes = await fetch("/api/b2b-clients").then((r) => r.json());
      setClients(cRes.success ? (Array.isArray(cRes.data) ? cRes.data : []) : []);

      // Load requests
      const rRes = await fetch("/api/b2b-requests").then((r) => r.json());
      setRequests(rRes.success ? (Array.isArray(rRes.data) ? rRes.data : []) : []);
    } catch {
      show("Failed to load clients", "danger");
    }
    setLoading(false);
  }, [show]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = clients.filter(
    (c) =>
      (c.company_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.contact_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const activeClients = clients.filter((c) => c.status === "active");

  function getRequestCount(clientId: string) {
    return requests.filter((r) => r.client_id === clientId).length;
  }

  function getActiveRequests(clientId: string) {
    return requests.filter(
      (r) => r.client_id === clientId && ["accepted", "quoted"].includes(r.status)
    ).length;
  }

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-[1.6rem] font-bold flex items-center gap-2">
            <Building2 size={24} style={{ color: "var(--brand)" }} />
            B2B Clients
          </h1>
          <p className="text-[.85rem] mt-0.5" style={{ color: "var(--fg-muted)" }}>
            Manage corporate transportation clients
          </p>
        </div>
        <BtnPrimary
          onClick={() => {
            setEditingClient(null);
            setShowForm(true);
          }}
        >
          <Plus size={14} /> Add Client
        </BtnPrimary>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-4 mb-6">
        <StatCard label="Total Clients" value={clients.length} />
        <StatCard label="Active" value={activeClients.length} valueColor="var(--success)" />
        <StatCard label="Total Requests" value={requests.length} valueColor="var(--blue)" />
      </div>

      {/* Search */}
      <div
        className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <Search size={16} style={{ color: "var(--fg-muted)" }} />
        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-[.85rem]"
          style={{ color: "var(--fg)" }}
        />
      </div>

      {/* Client Cards */}
      {loading ? (
        <p className="text-center py-10" style={{ color: "var(--fg-muted)" }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center py-10" style={{ color: "var(--fg-muted)" }}>No clients found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <Card key={client.id}>
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ background: "var(--brand)" }}
                    >
                      {(client.company_name || "?").charAt(0)}
                    </div>
                    <div>
                      <div className="text-[.92rem] font-bold">{client.company_name}</div>
                      <div className="text-[.75rem]" style={{ color: "var(--fg-muted)" }}>
                        {client.contact_name || "—"}
                      </div>
                    </div>
                  </div>
                  <span
                    className="text-[.68rem] px-2 py-0.5 rounded-full font-semibold"
                    style={{
                      background:
                        client.status === "active" ? "var(--success-light)" : "var(--danger-light)",
                      color: client.status === "active" ? "var(--success)" : "var(--danger)",
                    }}
                  >
                    {client.status === "active" ? "Active" : client.status === "prospect" ? "Prospect" : "Inactive"}
                  </span>
                </div>

                <div className="space-y-1.5 text-[.78rem]" style={{ color: "var(--fg-muted)" }}>
                  {client.contact_email && (
                    <div className="flex items-center gap-2">
                      <Mail size={13} /> {client.contact_email}
                    </div>
                  )}
                  {client.contact_phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={13} /> {client.contact_phone}
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center gap-2">
                      <MapPin size={13} /> {client.address}
                    </div>
                  )}
                </div>

                <div
                  className="flex items-center gap-4 mt-4 pt-3"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <div>
                    <div className="text-[.68rem]" style={{ color: "var(--fg-muted)" }}>
                      Requests
                    </div>
                    <div className="text-[1rem] font-bold">{getRequestCount(client.id)}</div>
                  </div>
                  <div>
                    <div className="text-[.68rem]" style={{ color: "var(--fg-muted)" }}>
                      Active
                    </div>
                    <div className="text-[1rem] font-bold" style={{ color: "var(--success)" }}>
                      {getActiveRequests(client.id)}
                    </div>
                  </div>
                  <div className="ml-auto flex gap-1">
                    <IconBtn
                      title="Edit"
                      onClick={() => {
                        setEditingClient(client);
                        setShowForm(true);
                      }}
                    >
                      <Edit size={14} />
                    </IconBtn>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <ClientFormModal
          client={editingClient}
          onClose={() => setShowForm(false)}
          onSave={() => {
            setShowForm(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function ClientFormModal({
  client,
  onClose,
  onSave,
}: {
  client: any;
  onClose: () => void;
  onSave: () => void;
}) {
  const { show } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    company_name: client?.company_name || "",
    contact_name: client?.contact_name || "",
    contact_email: client?.contact_email || "",
    contact_phone: client?.contact_phone || "",
    address: client?.address || "",
  });

  async function handleSubmit() {
    if (!form.company_name || !form.contact_name) {
      show("Company name and contact person are required", "danger");
      return;
    }
    setSaving(true);
    try {
      const url = client ? `/api/b2b-clients?id=${client.id}` : "/api/b2b-clients";
      const method = client ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        show(client ? "Client updated" : "Client added", "success");
        onSave();
      } else {
        show(json.error || "Failed", "danger");
      }
    } catch {
      show("Network error", "danger");
    }
    setSaving(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-[1.1rem] font-bold mb-4">
          {client ? "Edit Client" : "Add New Client"}
        </h2>
        <div className="space-y-3">
          <div>
            <label
              className="text-[.75rem] font-semibold block mb-1"
              style={{ color: "var(--fg-muted)" }}
            >
              Company Name *
            </label>
            <input
              style={inputStyle}
              value={form.company_name}
              onChange={(e) => setForm({ ...form, company_name: e.target.value })}
            />
          </div>
          <div>
            <label
              className="text-[.75rem] font-semibold block mb-1"
              style={{ color: "var(--fg-muted)" }}
            >
              Contact Person *
            </label>
            <input
              style={inputStyle}
              value={form.contact_name}
              onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
            />
          </div>
          <div>
            <label
              className="text-[.75rem] font-semibold block mb-1"
              style={{ color: "var(--fg-muted)" }}
            >
              Email
            </label>
            <input
              style={inputStyle}
              value={form.contact_email}
              onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
            />
          </div>
          <div>
            <label
              className="text-[.75rem] font-semibold block mb-1"
              style={{ color: "var(--fg-muted)" }}
            >
              Phone
            </label>
            <input
              style={inputStyle}
              value={form.contact_phone}
              onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
            />
          </div>
          <div>
            <label
              className="text-[.75rem] font-semibold block mb-1"
              style={{ color: "var(--fg-muted)" }}
            >
              Address
            </label>
            <input
              style={inputStyle}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[.82rem] font-semibold cursor-pointer border-none"
            style={{ background: "var(--bg)", color: "var(--fg-muted)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-[.82rem] font-semibold cursor-pointer border-none text-white"
            style={{ background: "var(--brand)", opacity: saving ? 0.6 : 1 }}
          >
            {saving ? "Saving..." : client ? "Update" : "Add Client"}
          </button>
        </div>
      </div>
    </div>
  );
}