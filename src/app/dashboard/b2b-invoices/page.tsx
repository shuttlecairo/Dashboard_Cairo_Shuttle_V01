// 
"use client";

import { Card, StatCard } from "@/components/dashboard/shared";
import {
  FileText,
  DollarSign,
  CheckCircle,
  Clock,
  Download,
} from "lucide-react";
import { b2bRequests, accountingEntries } from "@/store/data";

function formatEGP(n: number) {
  return n.toLocaleString("en-EG") + " EGP";
}

export default function B2BInvoicesPage() {
  const clientId = "c1";
  const clientName = "Vodafone Egypt";

  const myRequests = b2bRequests.filter(
    (r) => r.client_id === clientId && r.status === "accepted"
  );

  const totalMonthly = myRequests.reduce(
    (s, r) => s + (r.quote || 0),
    0
  );

  // Mock invoices
  const invoices = [
    {
      id: "INV-2026-11-001",
      date: "2026-11-03",
      description: "November Shuttle Service — Smart Village Route",
      amount: 12000,
      status: "unpaid",
    },
    {
      id: "INV-2026-11-002",
      date: "2026-11-03",
      description: "November Shuttle Service — Heliopolis Route",
      amount: 9500,
      status: "unpaid",
    },
    {
      id: "INV-2026-10-001",
      date: "2026-10-05",
      description: "October Shuttle Service — Smart Village Route",
      amount: 12000,
      status: "paid",
      paid_date: "2026-10-28",
    },
  ];

  const totalOutstanding = invoices
    .filter((i) => i.status === "unpaid")
    .reduce((s, i) => s + i.amount, 0);

  const totalPaid = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + i.amount, 0);

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      {/* Header */}

      <div className="mb-6">
        <h1 className="text-[1.6rem] font-bold flex items-center gap-2">
          <FileText size={24} style={{ color: "#E60000" }} />
          Invoices & Payments
        </h1>

        <p
          className="text-[.85rem] mt-0.5"
          style={{ color: "#777777" }}
        >
          Billing for {clientName}
        </p>
      </div>

      {/* KPIs */}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-6">
        <StatCard
          label="Monthly Commitment"
          value={formatEGP(totalMonthly)}
          valueColor="#E60000"
        />

        <StatCard
          label="Outstanding"
          value={formatEGP(totalOutstanding)}
          valueColor="#C40000"
        />

        <StatCard
          label="Paid to Date"
          value={formatEGP(totalPaid)}
          valueColor="#E60000"
        />
      </div>

      {/* Invoice History */}

      <Card>
        <div
          className="p-4 pb-3 flex justify-between items-center"
          style={{ borderBottom: "1px solid #EEEEEE" }}
        >
          <h2 className="text-[.95rem] font-bold">
            Invoice History
          </h2>

          <span
            className="text-[.72rem] px-2 py-0.5 rounded-full font-semibold"
            style={{
              background: "#FCE8E8",
              color: "#E60000",
            }}
          >
            {invoices.length} invoices
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[.82rem]">
            <thead style={{ background: "#F5F5F5" }}>
              <tr>
                <th
                  className="text-left p-2.5 px-4 font-medium text-[.75rem]"
                  style={{ color: "#777777" }}
                >
                  Invoice #
                </th>

                <th
                  className="text-left p-2.5 px-4 font-medium text-[.75rem]"
                  style={{ color: "#777777" }}
                >
                  Date
                </th>

                <th
                  className="text-left p-2.5 px-4 font-medium text-[.75rem]"
                  style={{ color: "#777777" }}
                >
                  Description
                </th>

                <th
                  className="text-right p-2.5 px-4 font-medium text-[.75rem]"
                  style={{ color: "#777777" }}
                >
                  Amount
                </th>

                <th
                  className="text-center p-2.5 px-4 font-medium text-[.75rem]"
                  style={{ color: "#777777" }}
                >
                  Status
                </th>

                <th
                  className="text-right p-2.5 px-4 font-medium text-[.75rem]"
                  style={{ color: "#777777" }}
                >
                  {/* Actions */}
                </th>
              </tr>
            </thead>

            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  style={{ borderTop: "1px solid #EEEEEE" }}
                >
                  <td className="p-3 px-4">
                    <code
                      className="text-[.78rem] font-semibold"
                      style={{ color: "#E60000" }}
                    >
                      {inv.id}
                    </code>
                  </td>

                  <td className="p-3 px-4">
                    {inv.date}
                  </td>

                  <td className="p-3 px-4">
                    {inv.description}
                  </td>

                  <td className="p-3 px-4 text-right font-semibold">
                    {formatEGP(inv.amount)}
                  </td>

                  <td className="p-3 px-4 text-center">
                    <span
                      className="text-[.72rem] px-2 py-0.5 rounded-full font-semibold inline-flex items-center gap-1"
                      style={{
                        background:
                          inv.status === "paid"
                            ? "#FCE8E8"
                            : "#F5F5F5",
                        color:
                          inv.status === "paid"
                            ? "#E60000"
                            : "#777777",
                      }}
                    >
                      {inv.status === "paid" ? (
                        <CheckCircle size={10} />
                      ) : (
                        <Clock size={10} />
                      )}

                      {inv.status === "paid" ? "Paid" : "Unpaid"}
                    </span>
                  </td>

                  <td className="p-3 px-4 text-right">
                    <button
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[.72rem] font-semibold cursor-pointer border-none"
                      style={{
                        background: "#FCE8E8",
                        color: "#E60000",
                      }}
                    >
                      <Download size={12} />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
