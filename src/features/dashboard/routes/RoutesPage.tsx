"use client";

import { useDashboardContext } from "@/components/dashboard/layout";
import { Card, BtnPrimary, IconBtn } from "@/components/dashboard/shared";
import { Badge } from "@/components/shared/badge";
import { ICONS } from "@/components/icons";

export function RoutesPage() {
    const { routes, drivers, setDialog, openEditDialog, handleDeleteRoute } =
        useDashboardContext();

    const active = routes.filter((r) => r.is_active).length;

    return (
        <>
            <div className="flex justify-between items-center mb-5">
                <div>
                    <h1 className="text-[1.4rem] font-bold">Shuttle Routes</h1>
                    <p className="text-[.85rem]" style={{ color: "var(--fg-muted)" }}>
                        {active} active of {routes.length} routes
                    </p>
                </div>
                <BtnPrimary onClick={() => setDialog("addRoute")}>
                    <ICONS.plus size={14} /> Add Route
                </BtnPrimary>
            </div>
            <Card>
                <table className="w-full border-collapse text-[.85rem]">
                    <thead style={{ background: "var(--bg)" }}>
                        <tr>
                            <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Route</th>
                            <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Time</th>
                            <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Days</th>
                            <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Price</th>
                            <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Cap.</th>
                            <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Driver</th>
                            <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Status</th>
                            <th className="text-right p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {routes.map((r) => (
                            <tr key={r.id} className="hover:bg-brand-light" style={{ borderTop: "1px solid var(--border)" }}>
                                <td className="p-3 px-4">
                                    <strong>{r.name}</strong>
                                    <br />
                                    <span className="text-[.75rem]" style={{ color: "var(--fg-muted)" }}>
                                        {r.pickup_area} → {r.dropoff_area}
                                    </span>
                                </td>
                                <td className="p-3 px-4 whitespace-nowrap">
                                    {r.departure_time}
                                    {r.return_time ? ` – ${r.return_time}` : ""}
                                </td>
                                <td className="p-3 px-4">
                                    {r.days.map((d) => d.slice(0, 2)).join(" ")}
                                </td>
                                <td className="p-3 px-4">{r.price} EGP</td>
                                <td className="p-3 px-4">{r.capacity}</td>
                                <td className="p-3 px-4">
                                    {r.driver || (
                                        <span style={{ color: "var(--fg-muted)" }}>—</span>
                                    )}
                                </td>
                                <td className="p-3 px-4">
                                    <Badge status={r.is_active ? "active" : "inactive"} />
                                </td>
                                <td className="p-3 px-4 text-right">
                                    <IconBtn title="Edit" onClick={() => openEditDialog("editRoute", r.id)}>
                                        <ICONS.edit size={14} />
                                    </IconBtn>
                                    <IconBtn title="Delete" danger onClick={() => handleDeleteRoute(r.id)}>
                                        <ICONS.trash size={14} />
                                    </IconBtn>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </>
    );
}
