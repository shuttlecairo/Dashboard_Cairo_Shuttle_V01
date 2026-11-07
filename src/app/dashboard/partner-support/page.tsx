"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, BtnPrimary, BtnOutline, Modal, SearchInput, TableSkeleton, EmptyState } from "@/components/dashboard/shared";
import { useToast } from "@/components/shared/toast";
import { api } from "@/api-client";
import { inputStyle } from "@/config/dashboard";
import {
  Headphones,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Calendar,
  Send,
} from "lucide-react";

interface Ticket {
  id: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  created_by?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

interface Partner { id: string; name: string; }

const EMPTY_FORM = { subject: "", description: "", priority: "medium" };

function PriorityDot({ priority }: { priority: string }) {
  const c: Record<string, string> = { high: "var(--danger)", urgent: "var(--danger)", medium: "var(--amber)", low: "var(--blue)" };
  return <span className="w-2 h-2 rounded-full inline-block" style={{ background: c[priority] || c.medium }} />;
}

function StatusBadge({ status }: { status: string }) {
  const c: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
    open: { bg: "var(--amber-light)", color: "var(--amber)", icon: <Clock size={11} /> },
    in_progress: { bg: "var(--blue-light)", color: "var(--blue)", icon: <MessageSquare size={11} /> },
    resolved: { bg: "var(--success-light)", color: "var(--success)", icon: <CheckCircle size={11} /> },
    closed: { bg: "var(--bg)", color: "var(--fg-muted)", icon: <XCircle size={11} /> },
  };
  const cfg = c[status] || c.open;
  const label = status.replace("_", " ");
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[.68rem] font-semibold capitalize" style={{ background: cfg.bg, color: cfg.color }}>{cfg.icon} {label}</span>;
}

export default function PartnerSupportPage() {
  const { show } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showNew, setShowNew] = useState(false);
  const [detailTicket, setDetailTicket] = useState<Ticket | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const partners = await api.get<Partner[]>("/api/partners");
      if (partners.length === 0) { setLoading(false); return; }
      setPartner(partners[0]);
      const data = await api.get<Ticket[]>(`/api/support-tickets?partner_id=${partners[0].id}`);
      setTickets(data);
    } catch { show("Failed to load support tickets", "danger"); } finally { setLoading(false); }
  }, [show]);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = tickets.filter((t) => {
    const matchSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openCount = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter((t) => t.status === "in_progress").length;

  async function handleSubmit() {
    if (!partner || !form.subject || !form.description) { show("Subject and description are required", "danger"); return; }
    setSaving(true);
    try {
      await api.post("/api/support-tickets", { ...form, partner_id: partner.id });
      show("Support request submitted", "success");
      setShowNew(false);
      setForm(EMPTY_FORM);
      loadData();
    } catch { show("Failed to submit request", "danger"); } finally { setSaving(false); }
  }

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-[1.6rem] font-bold flex items-center gap-2"><Headphones size={24} style={{ color: "var(--brand)" }} /> Support</h1>
          <p className="text-[.85rem]" style={{ color: "var(--fg-muted)" }}>Get help from Cairo Shuttle — {partner?.name}</p>
        </div>
        <BtnPrimary onClick={() => { setForm(EMPTY_FORM); setShowNew(true); }}><Plus size={15} /> New Request</BtnPrimary>
      </div>

      {/* Quick stats */}
      {(openCount > 0 || inProgressCount > 0) && (
        <div className="flex gap-3 mb-6 flex-wrap">
          {openCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: "var(--amber-light)", border: "1px solid var(--amber)" }}>
              <Clock size={14} style={{ color: "var(--amber)" }} />
              <span className="text-[.78rem] font-semibold" style={{ color: "var(--amber)" }}>{openCount} open ticket{openCount > 1 ? "s" : ""}</span>
            </div>
          )}
          {inProgressCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: "var(--blue-light)", border: "1px solid var(--blue)" }}>
              <MessageSquare size={14} style={{ color: "var(--blue)" }} />
              <span className="text-[.78rem] font-semibold" style={{ color: "var(--blue)" }}>{inProgressCount} in progress</span>
            </div>
          )}
        </div>
      )}

      <Card>
        <div className="p-4 flex items-center justify-between flex-wrap gap-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="w-[260px]"><SearchInput value={search} onChange={setSearch} placeholder="Search tickets..." /></div>
          <div className="flex gap-1">
            {["all", "open", "in_progress", "resolved", "closed"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)} className="px-2.5 py-1.5 rounded-lg text-[.68rem] font-semibold cursor-pointer border-none transition-all"
                style={{ background: statusFilter === s ? "var(--brand)" : "var(--bg)", color: statusFilter === s ? "white" : "var(--fg-muted)" }}>
                {s === "all" ? "All" : s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {loading ? <TableSkeleton /> : filtered.length === 0 ? (
          <EmptyState icon={<Headphones size={40} />} title="No tickets found" description={search || statusFilter !== "all" ? "Try adjusting your filters" : "You haven't submitted any support requests yet"} />
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {filtered.map((ticket) => (
              <div key={ticket.id} className="p-4 flex items-start gap-4 cursor-pointer transition-colors hover:opacity-80" onClick={() => setDetailTicket(ticket)}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mt-0.5" style={{ background: "var(--brand-light)" }}>
                  <Headphones size={14} style={{ color: "var(--brand)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <PriorityDot priority={ticket.priority} />
                    <h4 className="text-[.85rem] font-bold">{ticket.subject}</h4>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <p className="text-[.78rem] line-clamp-1" style={{ color: "var(--fg-muted)" }}>{ticket.description}</p>
                  <span className="text-[.68rem] flex items-center gap-1 mt-1.5" style={{ color: "var(--fg-muted)" }}><Calendar size={11} /> {new Date(ticket.created_at).toLocaleDateString()}</span>
                </div>
                <Eye size={16} style={{ color: "var(--fg-muted)", marginTop: 6 }} />
              </div>
            ))}
          </div>
        )}
      </Card>

      {showNew && (
        <Modal title="New Support Request" onClose={() => setShowNew(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-[.78rem] font-semibold mb-1">Subject *</label>
              <input style={inputStyle} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="What do you need help with?" />
            </div>
            <div>
              <label className="block text-[.78rem] font-semibold mb-1">Description *</label>
              <textarea style={{ ...inputStyle, minHeight: 120 } as React.CSSProperties} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Please provide as much detail as possible..." />
            </div>
            <div>
              <label className="block text-[.78rem] font-semibold mb-1">Priority</label>
              <select style={inputStyle} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low — General inquiry</option>
                <option value="medium">Medium — Needs attention</option>
                <option value="high">High — Urgent issue</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <BtnPrimary onClick={handleSubmit} disabled={saving}><Send size={14} /> {saving ? "Submitting..." : "Submit Request"}</BtnPrimary>
              <BtnOutline onClick={() => setShowNew(false)}>Cancel</BtnOutline>
            </div>
          </div>
        </Modal>
      )}

      {detailTicket && (
        <Modal title="Ticket Details" onClose={() => setDetailTicket(null)} wide>
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <PriorityDot priority={detailTicket.priority} />
              <h3 className="text-[.95rem] font-bold">{detailTicket.subject}</h3>
              <StatusBadge status={detailTicket.status} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-[.72rem]" style={{ color: "var(--fg-muted)" }}>Priority</p><p className="text-[.82rem] font-semibold capitalize">{detailTicket.priority}</p></div>
              <div><p className="text-[.72rem]" style={{ color: "var(--fg-muted)" }}>Created</p><p className="text-[.82rem] font-semibold">{new Date(detailTicket.created_at).toLocaleDateString()}</p></div>
              <div><p className="text-[.72rem]" style={{ color: "var(--fg-muted)" }}>Last Updated</p><p className="text-[.82rem] font-semibold">{new Date(detailTicket.updated_at).toLocaleDateString()}</p></div>
              <div><p className="text-[.72rem]" style={{ color: "var(--fg-muted)" }}>Assigned To</p><p className="text-[.82rem] font-semibold">{detailTicket.assigned_to || "Unassigned"}</p></div>
            </div>
            <div>
              <p className="text-[.72rem] mb-1" style={{ color: "var(--fg-muted)" }}>Description</p>
              <div className="p-3 rounded-lg text-[.82rem]" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>{detailTicket.description}</div>
            </div>

            {/* Placeholder for conversation thread */}
            <div>
              <h4 className="text-[.82rem] font-bold flex items-center gap-2 mb-2"><MessageSquare size={14} /> Conversation</h4>
              <div className="p-4 rounded-lg text-center" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
                <p className="text-[.78rem]" style={{ color: "var(--fg-muted)" }}>No messages yet. A support agent will respond soon.</p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
