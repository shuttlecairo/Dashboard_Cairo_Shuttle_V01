"use client";

import { useDashboardContext } from "@/components/dashboard/layout";
import { Card, BtnOutline, BtnSuccess } from "@/components/dashboard/shared";
import { Badge } from "@/components/shared/badge";

export function DriversPage() {
    const { drivers, handleToggleDriver } = useDashboardContext();

    const active = drivers.filter((d) => d.active).length;

    return (
        <>
            <div className="mb-5">
                <h1 className="text-[1.4rem] font-bold">Drivers</h1>
                <p className="text-[.85rem]" style={{ color: "var(--fg-muted)" }}>
                    {active} active, {drivers.length - active} pending
                </p>
            </div>
            <Card>
                <table className="w-full border-collapse text-[.85rem]">
                    <thead style={{ background: "var(--bg)" }}>
                        <tr>
                            <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Name</th>
                            <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Email</th>
                            <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Phone</th>
                            <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Status</th>
                            <th className="text-right p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {drivers.map((d) => (
                            <tr key={d.id} style={{ borderTop: "1px solid var(--border)" }}>
                                <td className="p-3 px-4 font-semibold">{d.name}</td>
                                <td className="p-3 px-4" style={{ color: "var(--fg-muted)" }}>
                                    {d.email}
                                </td>
                                <td
                                    className="p-3 px-4 text-[.8rem]"
                                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                                >
                                    {d.phone}
                                </td>
                                <td className="p-3 px-4">
                                    <Badge status={d.active ? "active" : "pending"} />
                                </td>
                                <td className="p-3 px-4 text-right">
                                    {d.active ? (
                                        <BtnOutline onClick={() => handleToggleDriver(d.id)}>
                                            Deactivate
                                        </BtnOutline>
                                    ) : (
                                        <BtnSuccess onClick={() => handleToggleDriver(d.id)}>
                                            Activate
                                        </BtnSuccess>
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
