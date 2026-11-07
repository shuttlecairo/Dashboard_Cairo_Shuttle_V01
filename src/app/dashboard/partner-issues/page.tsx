


"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  AlertTriangle,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Calendar,
  Search,
  FileWarning,
} from "lucide-react";

import {
  Card,
  BtnPrimary,
  BtnOutline,
  Modal,
  SearchInput,
  TableSkeleton,
} from "@/components/dashboard/shared";

import { useToast } from "@/components/shared/toast";
import { api } from "@/api-client";
import { inputStyle } from "@/config/dashboard";

// --------------------------------------------------
// Types
// --------------------------------------------------
interface Issue {
  id: string;
  title: string;       // will map from "subject"
  description: string;
  category: string;
  priority: string;
  status: string;
  reporter_name?: string;
  created_at: string;
  updated_at: string;
}
// interface Issue {
//   id: string;
//   title: string;
//   description: string;
//   category: string;
//   priority: string;
//   status: string;
//   created_by?: string;
//   assigned_to?: string;
//   created_at: string;
//   updated_at: string;
// }

interface Partner {
  id: string;
  name: string;
}

interface IssueForm {
  title: string;
  description: string;
  category: string;
  priority: string;
}

const EMPTY_FORM: IssueForm = {
  title: "",
  description: "",
  category: "service",
  priority: "medium",
};

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function formatDate(date?: string) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function capitalize(value?: string) {
  if (!value) return "Unknown";

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// --------------------------------------------------
// Priority Badge
// --------------------------------------------------

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    low: {
      bg: "var(--blue-light)",
      color: "var(--blue)",
    },
    medium: {
      bg: "var(--amber-light)",
      color: "var(--amber)",
    },
    high: {
      bg: "var(--danger-light)",
      color: "var(--danger)",
    },
    urgent: {
      bg: "var(--danger-light)",
      color: "var(--danger)",
    },
  };

  const config = colors[priority?.toLowerCase()] || colors.medium;

  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap"
      style={{
        background: config.bg,
        color: config.color,
      }}
    >
      {priority || "Medium"}
    </span>
  );
}

// --------------------------------------------------
// Status Badge
// --------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  const statuses: Record<
    string,
    {
      bg: string;
      color: string;
      icon: React.ReactNode;
    }
  > = {
    open: {
      bg: "var(--amber-light)",
      color: "var(--amber)",
      icon: <Clock size={12} />,
    },
    in_progress: {
      bg: "var(--blue-light)",
      color: "var(--blue)",
      icon: <MessageSquare size={12} />,
    },
    resolved: {
      bg: "var(--success-light)",
      color: "var(--success)",
      icon: <CheckCircle size={12} />,
    },
    closed: {
      bg: "var(--bg)",
      color: "var(--fg-muted)",
      icon: <XCircle size={12} />,
    },
  };

  const config = statuses[status?.toLowerCase()] || statuses.open;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{
        background: config.bg,
        color: config.color,
      }}
    >
      {config.icon}
      {capitalize(status)}
    </span>
  );
}

// --------------------------------------------------
// Stat Card
// --------------------------------------------------

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div
      className="rounded-xl p-5 flex items-center justify-between gap-4 min-w-0"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="min-w-0">
        <p
          className="text-sm font-medium mb-2"
          style={{ color: "var(--fg-muted)" }}
        >
          {title}
        </p>

        <p className="text-2xl font-bold tabular-nums">{value}</p>
      </div>

      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{
          background: "var(--bg)",
          color,
        }}
      >
        <Icon size={21} />
      </div>
    </div>
  );
}

// --------------------------------------------------
// Empty State
// --------------------------------------------------

function IssuesEmptyState({
  filtered,
}: {
  filtered: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-5 py-16">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{
          background: "var(--amber-light)",
          color: "var(--amber)",
        }}
      >
        <FileWarning size={30} />
      </div>

      <h3 className="text-base font-bold mb-2">
        {filtered ? "No matching issues" : "No issues reported yet"}
      </h3>

      <p
        className="text-sm max-w-sm leading-relaxed"
        style={{ color: "var(--fg-muted)" }}
      >
        {filtered
          ? "We couldn't find any issues matching your search or selected filter. Try adjusting your filters."
          : "There are currently no reported issues. You can report a new issue using the button above."}
      </p>
    </div>
  );
}

// --------------------------------------------------
// Main Page
// --------------------------------------------------

export default function PartnerIssuesPage() {
  const { show } = useToast();

  const [issues, setIssues] = useState<Issue[]>([]);
  const [partner, setPartner] = useState<Partner | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showReport, setShowReport] = useState(false);
  const [detailIssue, setDetailIssue] = useState<Issue | null>(null);

  const [form, setForm] = useState<IssueForm>(EMPTY_FORM);

  // --------------------------------------------------
  // Load Data
  // --------------------------------------------------

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const partners = await api.get<Partner[]>("/api/partners");

      if (!Array.isArray(partners) || partners.length === 0) {
        setPartner(null);
        setIssues([]);
        return;
      }

      const currentPartner = partners[0];

      setPartner(currentPartner);
const data = await api.get<any[]>(
  `/api/partners/${currentPartner.id}/issues`
);

setIssues(
  (Array.isArray(data) ? data : []).map((t) => ({
    ...t,
    title: t.subject || t.title || "Untitled",
  }))
);
      // const data = await api.get<Issue[]>(
      //   `/api/partners/${currentPartner.id}/issues`
      // );

      // setIssues(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load partner issues:", error);
      show("Failed to load issues", "danger");
    } finally {
      setLoading(false);
    }
  }, [show]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --------------------------------------------------
  // Filtering
  // --------------------------------------------------

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return issues.filter((issue) => {
      const title = issue.title || "";
      const description = issue.description || "";
      const category = issue.category || "";

      const matchesSearch =
        !normalizedSearch ||
        title.toLowerCase().includes(normalizedSearch) ||
        description.toLowerCase().includes(normalizedSearch) ||
        category.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" || issue.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [issues, search, statusFilter]);

  // --------------------------------------------------
  // Statistics
  // --------------------------------------------------

  const openCount = issues.filter(
    (issue) => issue.status === "open"
  ).length;

  const inProgressCount = issues.filter(
    (issue) => issue.status === "in_progress"
  ).length;

  const resolvedCount = issues.filter(
    (issue) =>
      issue.status === "resolved" || issue.status === "closed"
  ).length;

  // --------------------------------------------------
  // Report Issue
  // --------------------------------------------------
async function handleSubmit() {
    if (!partner) {
      show("Partner information is not available", "danger");
      return;
    }
    if (!form.title.trim() || !form.description.trim()) {
      show("Title and description are required", "danger");
      return;
    }
    setSaving(true);
    try {
      await api.post("/api/support", {
        subject: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        priority: form.priority,
        partner_id: partner.id,
        reporter_name: partner.name,
        reporter_role: "partner",
      });
      show("Issue reported successfully", "success");
      setShowReport(false);
      setForm(EMPTY_FORM);
      await loadData();
    } catch (error) {
      console.error("Failed to report issue:", error);
      show("Failed to report issue", "danger");
    } finally {
      setSaving(false);
    }
}
  // async function handleSubmit() {
  //   if (!partner) {
  //     show("Partner information is not available", "danger");
  //     return;
  //   }

  //   if (!form.title.trim() || !form.description.trim()) {
  //     show("Title and description are required", "danger");
  //     return;
  //   }

  //   setSaving(true);

  //   try {
  //     await api.post("/api/issues", {
  //       ...form,
  //       title: form.title.trim(),
  //       description: form.description.trim(),
  //       partner_id: partner.id,
  //     });

  //     show("Issue reported successfully", "success");

  //     setShowReport(false);
  //     setForm(EMPTY_FORM);

  //     await loadData();
  //   } catch (error) {
  //     console.error("Failed to report issue:", error);
  //     show("Failed to report issue", "danger");
  //   } finally {
  //     setSaving(false);
  //   }
  // }

  // --------------------------------------------------
  // Status Filters
  // --------------------------------------------------

  const statusOptions = [
    "all",
    "open",
    "in_progress",
    "resolved",
    "closed",
  ];

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div
      className="w-full min-w-0 space-y-7 pb-8"
      style={{ animation: "fadeIn .3s ease" }}
    >
      {/* Page Header */}

      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "var(--amber-light)",
                color: "var(--amber)",
              }}
            >
              <AlertTriangle size={21} />
            </div>

            <h1 className="text-2xl font-bold">
              Issues & Disputes
            </h1>
          </div>

          <p
            className="text-sm"
            style={{ color: "var(--fg-muted)" }}
          >
            Report and track your issues
            {partner?.name ? ` — ${partner.name}` : ""}
          </p>
        </div>

        <BtnPrimary
          onClick={() => {
            setForm(EMPTY_FORM);
            setShowReport(true);
          }}
        >
          <Plus size={16} />
          Report Issue
        </BtnPrimary>
      </div>

      {/* Statistics */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Open Issues"
          value={openCount}
          icon={AlertTriangle}
          color="var(--amber)"
        />

        <StatCard
          title="In Progress"
          value={inProgressCount}
          icon={Clock}
          color="var(--blue)"
        />

        <StatCard
          title="Resolved"
          value={resolvedCount}
          icon={CheckCircle}
          color="var(--success)"
        />

        <StatCard
          title="Total Issues"
          value={issues.length}
          icon={FileWarning}
          color="var(--brand)"
        />
      </div>

      {/* Issues List */}

      <Card>
        {/* Filters Header */}

        <div
          className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="w-full lg:max-w-sm">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search issues..."
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {statusOptions.map((status) => {
              const active = statusFilter === status;

              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold transition-all border cursor-pointer"
                  style={{
                    background: active ? "var(--brand)" : "var(--bg)",
                    color: active ? "white" : "var(--fg-muted)",
                    borderColor: active
                      ? "var(--brand)"
                      : "var(--border)",
                  }}
                >
                  {status === "all" ? "All" : capitalize(status)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}

        {loading ? (
          <div className="p-5 sm:p-6">
            <TableSkeleton />
          </div>
        ) : filtered.length === 0 ? (
          <IssuesEmptyState
            filtered={Boolean(search.trim() || statusFilter !== "all")}
          />
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {filtered.map((issue) => (
              <button
                key={issue.id}
                type="button"
                onClick={() => setDetailIssue(issue)}
                className="w-full text-left p-5 sm:p-6 flex items-start gap-4 transition-colors hover:bg-[var(--bg)] cursor-pointer"
                style={{
                  borderBottom: "1px solid var(--border)",
                }}
              >
                {/* Issue Icon */}

                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background:
                      issue.priority === "high" ||
                      issue.priority === "urgent"
                        ? "var(--danger-light)"
                        : "var(--amber-light)",
                    color:
                      issue.priority === "high" ||
                      issue.priority === "urgent"
                        ? "var(--danger)"
                        : "var(--amber)",
                  }}
                >
                  <AlertTriangle size={18} />
                </div>

                {/* Issue Information */}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h4 className="text-sm font-bold break-words">
                      {issue.title}
                    </h4>

                    <PriorityBadge priority={issue.priority} />
                    <StatusBadge status={issue.status} />
                  </div>

                  <p
                    className="text-sm leading-relaxed line-clamp-2"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    {issue.description}
                  </p>

                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    <span
                      className="text-xs flex items-center gap-1.5"
                      style={{ color: "var(--fg-muted)" }}
                    >
                      <Calendar size={13} />
                      {formatDate(issue.created_at)}
                    </span>

                    <span
                      className="text-xs px-2.5 py-1 rounded-md capitalize"
                      style={{
                        background: "var(--bg)",
                        color: "var(--fg-muted)",
                      }}
                    >
                      {capitalize(issue.category)}
                    </span>
                  </div>
                </div>

                {/* View Icon */}

                <div
                  className="shrink-0 mt-2"
                  style={{ color: "var(--fg-muted)" }}
                >
                  <Eye size={18} />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Results Footer */}

        {!loading && filtered.length > 0 && (
          <div
            className="px-5 sm:px-6 py-4 flex justify-between items-center gap-3 flex-wrap"
            style={{
              borderTop: "1px solid var(--border)",
              color: "var(--fg-muted)",
            }}
          >
            <p className="text-xs">
              Showing {filtered.length} of {issues.length} issues
            </p>

            {search || statusFilter !== "all" ? (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
                className="text-xs font-semibold cursor-pointer"
                style={{ color: "var(--brand)" }}
              >
                Clear filters
              </button>
            ) : null}
          </div>
        )}
      </Card>

      {/* Report Issue Modal */}

      {showReport && (
        <Modal
          title="Report Issue"
          onClose={() => {
            if (!saving) setShowReport(false);
          }}
        >
          <div className="space-y-5 p-2">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Issue Title *
              </label>

              <input
                style={inputStyle}
                className="w-full"
                value={form.title}
                onChange={(e) =>
                  setForm((previous) => ({
                    ...previous,
                    title: e.target.value,
                  }))
                }
                placeholder="Brief description of the issue"
                maxLength={150}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Description *
              </label>

              <textarea
                style={{
                  ...inputStyle,
                  minHeight: 120,
                  resize: "vertical",
                } as React.CSSProperties}
                className="w-full"
                value={form.description}
                onChange={(e) =>
                  setForm((previous) => ({
                    ...previous,
                    description: e.target.value,
                  }))
                }
                placeholder="Provide details about the issue..."
                rows={5}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Category
                </label>

                <select
                  style={inputStyle}
                  className="w-full"
                  value={form.category}
                  onChange={(e) =>
                    setForm((previous) => ({
                      ...previous,
                      category: e.target.value,
                    }))
                  }
                >
                  <option value="service">Service Issue</option>
                  <option value="billing">Billing Dispute</option>
                  <option value="vehicle">Vehicle Problem</option>
                  <option value="driver">Driver Issue</option>
                  <option value="route">Route Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Priority
                </label>

                <select
                  style={inputStyle}
                  className="w-full"
                  value={form.priority}
                  onChange={(e) =>
                    setForm((previous) => ({
                      ...previous,
                      priority: e.target.value,
                    }))
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div
              className="flex justify-end gap-3 pt-4"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <BtnOutline
                onClick={() => setShowReport(false)}
                disabled={saving}
              >
                Cancel
              </BtnOutline>

              <BtnPrimary
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? "Submitting..." : "Submit Issue"}
              </BtnPrimary>
            </div>
          </div>
        </Modal>
      )}

      {/* Issue Details Modal */}

      {detailIssue && (
        <Modal
          title="Issue Details"
          onClose={() => setDetailIssue(null)}
          wide
        >
          <div className="space-y-6 p-2">
            {/* Title and Status */}

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <PriorityBadge priority={detailIssue.priority} />
                <StatusBadge status={detailIssue.status} />
              </div>

              <h3 className="text-lg font-bold">
                {detailIssue.title}
              </h3>
            </div>

            {/* Issue Metadata */}

            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 rounded-xl"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
              }}
            >
              <div>
                <p
                  className="text-xs mb-1"
                  style={{ color: "var(--fg-muted)" }}
                >
                  Category
                </p>

                <p className="text-sm font-semibold capitalize">
                  {capitalize(detailIssue.category)}
                </p>
              </div>

              <div>
                <p
                  className="text-xs mb-1"
                  style={{ color: "var(--fg-muted)" }}
                >
                  Priority
                </p>

                <p className="text-sm font-semibold capitalize">
                  {detailIssue.priority}
                </p>
              </div>

              <div>
                <p
                  className="text-xs mb-1"
                  style={{ color: "var(--fg-muted)" }}
                >
                  Reported
                </p>

                <p className="text-sm font-semibold">
                  {formatDate(detailIssue.created_at)}
                </p>
              </div>

              <div>
                <p
                  className="text-xs mb-1"
                  style={{ color: "var(--fg-muted)" }}
                >
                  Last Updated
                </p>

                <p className="text-sm font-semibold">
                  {formatDate(detailIssue.updated_at)}
                </p>
              </div>

              {/* {detailIssue.assigned_to && (
                <div>
                  <p
                    className="text-xs mb-1"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    Assigned To
                  </p>

                  <p className="text-sm font-semibold">
                    {detailIssue.assigned_to}
                  </p>
                </div>
              )} */}
            </div>

            {/* Description */}

            <div>
              <p className="text-sm font-semibold mb-2">
                Description
              </p>

              <div
                className="p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap break-words"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  color: "var(--fg)",
                }}
              >
                {detailIssue.description || "No description provided."}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <BtnOutline onClick={() => setDetailIssue(null)}>
                Close
              </BtnOutline>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
