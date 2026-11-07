"use client";

import { useDashboardContext } from "@/components/dashboard/layout";
import { Card, StatCard, BtnPrimary, BtnSuccess, IconBtn } from "@/components/dashboard/shared";
import { Badge } from "@/components/shared/badge";
import { ICONS } from "@/components/icons";

export function B2BPage() {
    const { b2bReqs, setDialog, handleAcceptRequest, handleCancelRequest } =
        useDashboardContext();

    return (
        <>
            <div className="flex justify-between items-center mb-5">
                <div>
                    <h1 className="text-[1.4rem] font-bold">Route Requests</h1>
                    <p className="text-[.85rem]" style={{ color: "var(--fg-muted)" }}>
                        Manage your corporate shuttle requests
                    </p>
                </div>
                <BtnPrimary onClick={() => setDialog("addB2B")}>
                    <ICONS.plus size={14} /> New Request
                </BtnPrimary>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4 mb-6">
                <StatCard label="Total" value={b2bReqs.length} />
                <StatCard
                    label="Pending"
                    value={b2bReqs.filter((r) => r.status === "pending").length}
                    valueColor="var(--amber)"
                />
                <StatCard
                    label="Active"
                    value={
                        b2bReqs.filter((r) =>
                            ["accepted", "quoted"].includes(r.status)
                        ).length
                    }
                    valueColor="var(--success)"
                />
            </div>
            <Card>
                <table className="w-full border-collapse text-[.85rem]">
                    <thead style={{ background: "var(--bg)" }}>
                        <tr>
                            <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Route</th>
                            <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Schedule</th>
                            <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Employees</th>
                            <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Status</th>
                            <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Quote</th>
                            <th className="text-right p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {b2bReqs.map((r) => (
                            <tr key={r.id} style={{ borderTop: "1px solid var(--border)" }}>
                                <td className="p-3 px-4">
                                    <strong>
                                        {r.pickup} → {r.dropoff}
                                    </strong>
                                    {r.notes && (
                                        <>
                                            <br />
                                            <span className="text-[.72rem]" style={{ color: "var(--fg-muted)" }}>
                                                {r.notes}
                                            </span>
                                        </>
                                    )}
                                </td>
                                <td className="p-3 px-4">{r.schedule}</td>
                                <td className="p-3 px-4">{r.count}</td>
                                <td className="p-3 px-4">
                                    <Badge status={r.status} />
                                </td>
                                <td className="p-3 px-4">
                                    {r.quote ? (
                                        `${r.quote.toLocaleString()} EGP`
                                    ) : (
                                        <span style={{ color: "var(--fg-muted)" }}>—</span>
                                    )}
                                </td>
                                <td className="p-3 px-4 text-right">
                                    {r.status === "quoted" && (
                                        <BtnSuccess onClick={() => handleAcceptRequest("b2b", r.id)}>
                                            <ICONS.check size={12} /> Accept
                                        </BtnSuccess>
                                    )}
                                    {["pending", "quoted"].includes(r.status) && (
                                        <IconBtn
                                            title="Cancel"
                                            danger
                                            onClick={() => handleCancelRequest("b2b", r.id)}
                                        >
                                            <ICONS.trash size={14} />
                                        </IconBtn>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </>
    );
}
