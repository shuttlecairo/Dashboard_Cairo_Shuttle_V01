// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { StatCard, Card, BtnOutline, SearchInput, TableSkeleton, EmptyState } from "@/components/dashboard/shared";
// import { useToast } from "@/components/shared/toast";
// import { api } from "@/api-client";
// import { inputStyle } from "@/config/dashboard";
// import {
//   DollarSign,
//   TrendingUp,
//   TrendingDown,
//   Calendar,
//   Download,
//   Filter,
//   ArrowUpRight,
//   ArrowDownLeft,
// } from "lucide-react";

// type DateFilter = "today" | "week" | "month" | "quarter" | "year" | "custom";

// interface Transaction {
//   id: string;
//   partner_id: string;
//   type: string;
//   amount: number;
//   description: string;
//   reference_number?: string;
//   status: string;
//   created_at: string;
// }

// interface Partner { id: string; name: string; }

// const filterLabels: Record<DateFilter, string> = { today: "Today", week: "This Week", month: "This Month", quarter: "This Quarter", year: "This Year", custom: "Custom" };

// const formatEGP = (n: number) => n.toLocaleString("en-EG") + " EGP";

// export default function PartnerAccountingPage() {
//   const { show } = useToast();
//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const [partner, setPartner] = useState<Partner | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [dateFilter, setDateFilter] = useState<DateFilter>("month");
//   const [typeFilter, setTypeFilter] = useState<string>("all");

//   const loadData = useCallback(async () => {
//     try {
//       const partners = await api.get<Partner[]>("/api/partners");
//       if (partners.length === 0) { setLoading(false); return; }
//       setPartner(partners[0]);
//       const txns = await api.get<Transaction[]>(`/api/partners/${partners[0].id}/transactions`);
//       setTransactions(txns);
//     } catch { show("Failed to load transactions", "danger"); } finally { setLoading(false); }
//   }, [show]);

//   useEffect(() => { loadData(); }, [loadData]);

//   const filtered = transactions.filter((t) => {
//     const matchSearch = t.description.toLowerCase().includes(search.toLowerCase()) || (t.reference_number || "").toLowerCase().includes(search.toLowerCase());
//     const matchType = typeFilter === "all" || t.type === typeFilter;
//     // Date filter would apply server-side in production
//     return matchSearch && matchType;
//   });

//   const totalRevenue = transactions.filter((t) => t.type === "credit").reduce((s, t) => s + t.amount, 0);
//   const totalExpenses = transactions.filter((t) => t.type === "debit").reduce((s, t) => s + t.amount, 0);
//   const netBalance = totalRevenue - totalExpenses;

//   return (
//     <div style={{ animation: "fadeIn .3s ease" }}>
//       <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
//         <div>
//           <h1 className="text-[1.6rem] font-bold flex items-center gap-2"><DollarSign size={24} style={{ color: "var(--brand)" }} /> Accounting</h1>
//           <p className="text-[.85rem]" style={{ color: "var(--fg-muted)" }}>Financial overview — {partner?.name}</p>
//         </div>
//         <BtnOutline onClick={() => show("Export coming soon", "success")}><Download size={15} /> Export</BtnOutline>
//       </div>

//       <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-6">
//         <StatCard label="Revenue" value={formatEGP(totalRevenue)} valueColor="var(--success)" sub="Total income" />
//         <StatCard label="Expenses" value={formatEGP(totalExpenses)} valueColor="var(--danger)" sub="Total outgoing" />
//         <StatCard label="Net Balance" value={formatEGP(netBalance)} valueColor={netBalance >= 0 ? "var(--success)" : "var(--danger)"} sub={netBalance >= 0 ? "Positive balance" : "Negative balance"} />
//         <StatCard label="Transactions" value={transactions.length} sub={`${filterLabels[dateFilter]}`} />
//       </div>

//       <Card>
//         <div className="p-4 flex items-center justify-between flex-wrap gap-3" style={{ borderBottom: "1px solid var(--border)" }}>
//           <div className="flex items-center gap-3 flex-wrap">
//             <div className="w-[220px]"><SearchInput value={search} onChange={setSearch} placeholder="Search transactions..." /></div>
//             <div className="flex items-center gap-1">
//               <Filter size={14} style={{ color: "var(--fg-muted)" }} />
//               <select style={{ ...inputStyle, width: "auto", paddingRight: "2rem" } as React.CSSProperties} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
//                 <option value="all">All Types</option>
//                 <option value="credit">Credits</option>
//                 <option value="debit">Debits</option>
//               </select>
//             </div>
//           </div>
//           <div className="flex gap-1">
//             {(Object.keys(filterLabels) as DateFilter[]).filter((k) => k !== "custom").map((f) => (
//               <button key={f} onClick={() => setDateFilter(f)} className="px-2.5 py-1.5 rounded-lg text-[.68rem] font-semibold cursor-pointer border-none transition-all"
//                 style={{ background: dateFilter === f ? "var(--brand)" : "var(--bg)", color: dateFilter === f ? "white" : "var(--fg-muted)" }}>
//                 {filterLabels[f]}
//               </button>
//             ))}
//           </div>
//         </div>

//         {loading ? <TableSkeleton /> : filtered.length === 0 ? (
//           <EmptyState icon={DollarSign} title="No transactions" description="No transactions found for the selected period." />
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full border-collapse text-[.82rem]">
//               <thead>
//                 <tr style={{ background: "var(--bg)" }}>
//                   {["Date", "Description", "Reference", "Type", "Amount", "Status"].map((h) => (
//                     <th key={h} className="p-3 text-left text-[.72rem] font-semibold" style={{ color: "var(--fg-muted)" }}>{h}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {filtered.map((t) => (
//                   <tr key={t.id} className="transition-colors" style={{ borderTop: "1px solid var(--border)" }}>
//                     <td className="p-3 text-[.78rem]">
//                       <span className="flex items-center gap-1"><Calendar size={12} style={{ color: "var(--fg-muted)" }} /> {new Date(t.created_at).toLocaleDateString()}</span>
//                     </td>
//                     <td className="p-3 font-semibold">{t.description}</td>
//                     <td className="p-3 text-[.75rem]" style={{ color: "var(--fg-muted)" }}>{t.reference_number || "—"}</td>
//                     <td className="p-3">
//                       <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[.68rem] font-semibold" style={{ background: t.type === "credit" ? "var(--success-light)" : "var(--danger-light)", color: t.type === "credit" ? "var(--success)" : "var(--danger)" }}>
//                         {t.type === "credit" ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
//                         {t.type === "credit" ? "Credit" : "Debit"}
//                       </span>
//                     </td>
//                     <td className="p-3 font-bold" style={{ color: t.type === "credit" ? "var(--success)" : "var(--danger)" }}>
//                       {t.type === "credit" ? "+" : "−"}{formatEGP(t.amount)}
//                     </td>
//                     <td className="p-3">
//                       <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[.68rem] font-semibold" style={{ background: t.status === "completed" ? "var(--success-light)" : "var(--amber-light)", color: t.status === "completed" ? "var(--success)" : "var(--amber)" }}>
//                         {t.status === "completed" ? "Completed" : "Pending"}
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </Card>

//       {/* Summary cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
//         <Card>
//           <div className="p-4" style={{ borderBottom: "1px solid var(--border)" }}>
//             <h3 className="text-[.95rem] font-bold flex items-center gap-2"><TrendingUp size={16} style={{ color: "var(--success)" }} /> Recent Credits</h3>
//           </div>
//           <div className="p-4 space-y-2">
//             {transactions.filter((t) => t.type === "credit").slice(0, 5).map((t) => (
//               <div key={t.id} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--border)" }}>
//                 <div>
//                   <p className="text-[.78rem] font-semibold">{t.description}</p>
//                   <p className="text-[.68rem]" style={{ color: "var(--fg-muted)" }}>{new Date(t.created_at).toLocaleDateString()}</p>
//                 </div>
//                 <p className="text-[.82rem] font-bold" style={{ color: "var(--success)" }}>+{formatEGP(t.amount)}</p>
//               </div>
//             ))}
//             {transactions.filter((t) => t.type === "credit").length === 0 && <p className="text-[.78rem]" style={{ color: "var(--fg-muted)" }}>No recent credits</p>}
//           </div>
//         </Card>

//         <Card>
//           <div className="p-4" style={{ borderBottom: "1px solid var(--border)" }}>
//             <h3 className="text-[.95rem] font-bold flex items-center gap-2"><TrendingDown size={16} style={{ color: "var(--danger)" }} /> Recent Debits</h3>
//           </div>
//           <div className="p-4 space-y-2">
//             {transactions.filter((t) => t.type === "debit").slice(0, 5).map((t) => (
//               <div key={t.id} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--border)" }}>
//                 <div>
//                   <p className="text-[.78rem] font-semibold">{t.description}</p>
//                   <p className="text-[.68rem]" style={{ color: "var(--fg-muted)" }}>{new Date(t.created_at).toLocaleDateString()}</p>
//                 </div>
//                 <p className="text-[.82rem] font-bold" style={{ color: "var(--danger)" }}>−{formatEGP(t.amount)}</p>
//               </div>
//             ))}
//             {transactions.filter((t) => t.type === "debit").length === 0 && <p className="text-[.78rem]" style={{ color: "var(--fg-muted)" }}>No recent debits</p>}
//           </div>
//         </Card>
//       </div>
//     </div>
//   );
// }


"use client";

import { useState, useEffect, useCallback } from "react";
import { StatCard, Card, BtnOutline, SearchInput, TableSkeleton, EmptyState } from "@/components/dashboard/shared";
import { useToast } from "@/components/shared/toast";
import { api } from "@/api-client";
import { inputStyle } from "@/config/dashboard";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";

type DateFilter = "today" | "week" | "month" | "quarter" | "year" | "custom";

interface Transaction {
  id: string;
  partner_id: string;
  type: string;
  amount: number;
  description: string;
  reference_number?: string;
  status: string;
  created_at: string;
}

interface Partner {
  id: string;
  name: string;
}

const filterLabels: Record<DateFilter, string> = {
  today: "Today",
  week: "This Week",
  month: "This Month",
  quarter: "This Quarter",
  year: "This Year",
  custom: "Custom",
};

const formatEGP = (n: number) => n.toLocaleString("en-EG") + " EGP";

export default function PartnerAccountingPage() {
  const { show } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("month");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const loadData = useCallback(async () => {
    try {
      const partners = await api.get<Partner[]>("/api/partners");
      if (partners.length === 0) {
        setLoading(false);
        return;
      }
      setPartner(partners[0]);
      const txns = await api.get<Transaction[]>(`/api/partners/${partners[0].id}/transactions`);
      setTransactions(txns);
    } catch {
      show("Failed to load transactions", "danger");
    } finally {
      setLoading(false);
    }
  }, [show]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = transactions.filter((t) => {
    const matchSearch =
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      (t.reference_number || "").toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || t.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalRevenue = transactions
    .filter((t) => t.type === "credit")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "debit")
    .reduce((s, t) => s + t.amount, 0);
  const netBalance = totalRevenue - totalExpenses;

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-[1.6rem] font-bold flex items-center gap-2">
            <DollarSign size={24} style={{ color: "var(--brand)" }} /> Accounting
          </h1>
          <p className="text-[.85rem]" style={{ color: "var(--fg-muted)" }}>
            Financial overview — {partner?.name}
          </p>
        </div>
        <BtnOutline onClick={() => show("Export coming soon", "success")}>
          <Download size={15} /> Export
        </BtnOutline>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-6">
        <StatCard label="Revenue" value={formatEGP(totalRevenue)} valueColor="var(--success)" sub="Total income" />
        <StatCard label="Expenses" value={formatEGP(totalExpenses)} valueColor="var(--danger)" sub="Total outgoing" />
        <StatCard
          label="Net Balance"
          value={formatEGP(netBalance)}
          valueColor={netBalance >= 0 ? "var(--success)" : "var(--danger)"}
          sub={netBalance >= 0 ? "Positive balance" : "Negative balance"}
        />
        <StatCard label="Transactions" value={transactions.length} sub={filterLabels[dateFilter]} />
      </div>

      {/* Transactions Table */}
      <Card>
        <div
          className="p-4 flex items-center justify-between flex-wrap gap-3"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-[220px]">
              <SearchInput value={search} onChange={setSearch} placeholder="Search transactions..." />
            </div>
            <div className="flex items-center gap-1">
              <Filter size={14} style={{ color: "var(--fg-muted)" }} />
              <select
                style={{ ...inputStyle, width: "auto", paddingRight: "2rem" } as React.CSSProperties}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="credit">Credits</option>
                <option value="debit">Debits</option>
              </select>
            </div>
          </div>
          <div className="flex gap-1">
            {(Object.keys(filterLabels) as DateFilter[])
              .filter((k) => k !== "custom")
              .map((f) => (
                <button
                  key={f}
                  onClick={() => setDateFilter(f)}
                  className="px-2.5 py-1.5 rounded-lg text-[.68rem] font-semibold cursor-pointer border-none transition-all"
                  style={{
                    background: dateFilter === f ? "var(--brand)" : "var(--bg)",
                    color: dateFilter === f ? "white" : "var(--fg-muted)",
                  }}
                >
                  {filterLabels[f]}
                </button>
              ))}
          </div>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<DollarSign size={40} />}
            title="No transactions"
            description="No transactions found for the selected period."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[.82rem]">
              <thead>
                <tr style={{ background: "var(--bg)" }}>
                  {["Date", "Description", "Reference", "Type", "Amount", "Status"].map((h) => (
                    <th key={h} className="p-3 text-left text-[.72rem] font-semibold" style={{ color: "var(--fg-muted)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="transition-colors" style={{ borderTop: "1px solid var(--border)" }}>
                    <td className="p-3 text-[.78rem]">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} style={{ color: "var(--fg-muted)" }} />
                        {new Date(t.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-3 font-semibold">{t.description}</td>
                    <td className="p-3 text-[.75rem]" style={{ color: "var(--fg-muted)" }}>
                      {t.reference_number || "—"}
                    </td>
                    <td className="p-3">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[.68rem] font-semibold"
                        style={{
                          background: t.type === "credit" ? "color-mix(in srgb, var(--success) 15%, transparent)" : "color-mix(in srgb, var(--danger) 15%, transparent)",
                          color: t.type === "credit" ? "var(--success)" : "var(--danger)",
                        }}
                      >
                        {t.type === "credit" ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
                        {t.type === "credit" ? "Credit" : "Debit"}
                      </span>
                    </td>
                    <td className="p-3 font-bold" style={{ color: t.type === "credit" ? "var(--success)" : "var(--danger)" }}>
                      {t.type === "credit" ? "+" : "−"}
                      {formatEGP(t.amount)}
                    </td>
                    <td className="p-3">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[.68rem] font-semibold"
                        style={{
                          background: t.status === "completed" ? "color-mix(in srgb, var(--success) 15%, transparent)" : "color-mix(in srgb, var(--amber) 15%, transparent)",
                          color: t.status === "completed" ? "var(--success)" : "var(--amber)",
                        }}
                      >
                        {t.status === "completed" ? "Completed" : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Card>
          <div className="p-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <h3 className="text-[.95rem] font-bold flex items-center gap-2">
              <TrendingUp size={16} style={{ color: "var(--success)" }} /> Recent Credits
            </h3>
          </div>
          <div className="p-4 space-y-2">
            {transactions
              .filter((t) => t.type === "credit")
              .slice(0, 5)
              .map((t) => (
                <div key={t.id} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--border)" }}>
                  <div>
                    <p className="text-[.78rem] font-semibold">{t.description}</p>
                    <p className="text-[.68rem]" style={{ color: "var(--fg-muted)" }}>
                      {new Date(t.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-[.82rem] font-bold" style={{ color: "var(--success)" }}>
                    +{formatEGP(t.amount)}
                  </p>
                </div>
              ))}
            {transactions.filter((t) => t.type === "credit").length === 0 && (
              <p className="text-[.78rem]" style={{ color: "var(--fg-muted)" }}>No recent credits</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="p-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <h3 className="text-[.95rem] font-bold flex items-center gap-2">
              <TrendingDown size={16} style={{ color: "var(--danger)" }} /> Recent Debits
            </h3>
          </div>
          <div className="p-4 space-y-2">
            {transactions
              .filter((t) => t.type === "debit")
              .slice(0, 5)
              .map((t) => (
                <div key={t.id} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--border)" }}>
                  <div>
                    <p className="text-[.78rem] font-semibold">{t.description}</p>
                    <p className="text-[.68rem]" style={{ color: "var(--fg-muted)" }}>
                      {new Date(t.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-[.82rem] font-bold" style={{ color: "var(--danger)" }}>
                    −{formatEGP(t.amount)}
                  </p>
                </div>
              ))}
            {transactions.filter((t) => t.type === "debit").length === 0 && (
              <p className="text-[.78rem]" style={{ color: "var(--fg-muted)" }}>No recent debits</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}