"use client";

import { useDashboardContext } from "@/components/dashboard/layout";
import { Card, BtnPrimary, IconBtn } from "@/components/dashboard/shared";
import { Badge } from "@/components/shared/badge";
import { ICONS } from "@/components/icons";

export function FleetPage() {
    const { vehicles, setDialog, openEditDialog, handleDeleteVehicle } =
        useDashboardContext();

    const active = vehicles.filter((v) => v.active).length;

    return (
        <>
            <div className="flex justify-between items-center mb-5">
                <div>
                    <h1 className="text-[1.4rem] font-bold">Fleet Management</h1>
                    <p className="text-[.85rem]" style={{ color: "var(--fg-muted)" }}>
                        {active} active of {vehicles.length} vehicles
                    </p>
                </div>
                <BtnPrimary onClick={() => setDialog("addVehicle")}>
                    <ICONS.plus size={14} /> Add Vehicle
                </BtnPrimary>
            </div>
            <Card>
                <table className="w-full border-collapse text-[.85rem]">
                    <thead style={{ background: "var(--bg)" }}>
                        <tr>
                            <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Plate</th>
                            <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Type</th>
                            <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Capacity</th>
                            <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Status</th>
                            <th className="text-right p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vehicles.map((v) => (
                            <tr key={v.id} style={{ borderTop: "1px solid var(--border)" }}>
                                <td
                                    className="p-3 px-4 font-semibold"
                                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                                >
                                    {v.plate}
                                </td>
                                <td className="p-3 px-4 capitalize">{v.type}</td>
                                <td className="p-3 px-4">{v.capacity} seats</td>
                                <td className="p-3 px-4">
                                    <Badge status={v.active ? "active" : "inactive"} />
                                </td>
                                <td className="p-3 px-4 text-right">
                                    <IconBtn title="Edit" onClick={() => openEditDialog("editVehicle", v.id)}>
                                        <ICONS.edit size={14} />
                                    </IconBtn>
                                    <IconBtn title="Delete" danger onClick={() => handleDeleteVehicle(v.id)}>
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
