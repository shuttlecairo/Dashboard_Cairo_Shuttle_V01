"use client";

import { useState } from "react";
import { useDashboardContext } from "@/components/dashboard/layout";
import { Card, BtnPrimary, IconBtn } from "@/components/dashboard/shared";
import { Badge } from "@/components/shared/badge";
import { ICONS } from "@/components/icons";

export function BookingsPage() {
    const { bookings, routes, setDialog, openEditDialog, handleDeleteBooking } =
        useDashboardContext();

    const [bookingFilter, setBookingFilter] = useState("all");

    const counts = {
        all: bookings.length,
        confirmed: bookings.filter((b) => b.status === "confirmed").length,
        completed: bookings.filter((b) => b.status === "completed").length,
        cancelled: bookings.filter((b) => b.status === "cancelled").length,
    };
    const filtered =
        bookingFilter === "all" ? bookings : bookings.filter((b) => b.status === bookingFilter);

    return (
        <>
            <div className="flex justify-between items-center mb-5">
                <div>
                    <h1 className="text-[1.4rem] font-bold">Bookings</h1>
                    <p className="text-[.85rem]" style={{ color: "var(--fg-muted)" }}>
                        {counts.confirmed} confirmed today
                    </p>
                </div>
                <BtnPrimary onClick={() => setDialog("addBooking")}>
                    <ICONS.plus size={14} /> Add Booking
                </BtnPrimary>
            </div>
            <div className="flex gap-2 mb-4 flex-wrap">
                {(["all", "confirmed", "completed", "cancelled"] as const).map((f) => (
                    <button
                        key={f}
                        className="px-3.5 py-1 rounded-full text-[.78rem] font-medium cursor-pointer transition-all"
                        style={{
                            background: bookingFilter === f ? "var(--brand)" : "var(--bg)",
                            color: bookingFilter === f ? "#fff" : "var(--fg-muted)",
                            border: `1px solid ${bookingFilter === f ? "var(--brand)" : "var(--border)"}`,
                            fontFamily: "inherit",
                        }}
                        onClick={() => setBookingFilter(f)}
                    >
                        {f === "all" ? "All" : f[0].toUpperCase() + f.slice(1)} (
                        {counts[f] || 0})
                    </button>
                ))}
            </div>
            <Card>
                <table className="w-full border-collapse text-[.85rem]">
                    <thead style={{ background: "var(--bg)" }}>
                        <tr>
                            <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Rider</th>
                            <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Route</th>
                            <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Date</th>
                            <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Seats</th>
                            <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Pickup</th>
                            <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Status</th>
                            <th className="text-right p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((b) => (
                            <tr key={b.id} style={{ borderTop: "1px solid var(--border)" }}>
                                <td className="p-3 px-4">
                                    <strong>{b.rider}</strong>
                                    <br />
                                    <span className="text-[.75rem]" style={{ color: "var(--fg-muted)" }}>
                                        {b.phone}
                                    </span>
                                </td>
                                <td className="p-3 px-4">{b.route}</td>
                                <td className="p-3 px-4">{b.date}</td>
                                <td className="p-3 px-4">{b.seats}</td>
                                <td className="p-3 px-4">
                                    {b.pickup || (
                                        <span style={{ color: "var(--fg-muted)" }}>—</span>
                                    )}
                                </td>
                                <td className="p-3 px-4">
                                    <Badge status={b.status} />
                                </td>
                                <td className="p-3 px-4 text-right">
                                    <IconBtn title="Edit" onClick={() => openEditDialog("editBooking", b.id)}>
                                        <ICONS.edit size={14} />
                                    </IconBtn>
                                    <IconBtn title="Delete" danger onClick={() => handleDeleteBooking(b.id)}>
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
