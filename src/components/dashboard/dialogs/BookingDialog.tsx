"use client";

import { useState } from "react";
import type { Booking, ShuttleRoute } from "@/types/entities";
import { Dialog } from "@/components/shared/dialog";
import { FormGroup } from "@/components/dashboard/shared";
import { inputStyle } from "@/config/dashboard";

interface BookingDialogProps {
    booking?: Booking;
    routes: ShuttleRoute[];
    onClose: () => void;
    onSubmit: (data: Record<string, unknown>) => void;
}

export function BookingDialog({ booking, routes, onClose, onSubmit }: BookingDialogProps) {
    const activeRoutes = routes.filter((r) => r.is_active);
    const [route, setRoute] = useState(
        booking?.route ?? activeRoutes[0]?.name ?? ""
    );
    const [rider, setRider] = useState(booking?.rider ?? "");
    const [phone, setPhone] = useState(booking?.phone ?? "");
    const [seats, setSeats] = useState(booking?.seats ?? 1);
    const [date, setDate] = useState(booking?.date ?? "2026-11-04");
    const [pickup, setPickup] = useState(booking?.pickup ?? "");
    const [status, setStatus] = useState(booking?.status ?? "confirmed");

    return (
        <Dialog title={booking ? "Edit Booking" : "Add Booking"} onClose={onClose}>
            <FormGroup label="Route">
                <select
                    style={inputStyle}
                    value={route}
                    onChange={(e) => setRoute(e.target.value)}
                >
                    {activeRoutes.map((r) => (
                        <option key={r.id}>{r.name}</option>
                    ))}
                </select>
            </FormGroup>
            <div className="flex gap-3">
                <FormGroup label="Rider Name">
                    <input
                        style={inputStyle}
                        placeholder="Full name"
                        value={rider}
                        onChange={(e) => setRider(e.target.value)}
                    />
                </FormGroup>
                <FormGroup label="Phone">
                    <input
                        style={inputStyle}
                        placeholder="+201xxxxxxxxx"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </FormGroup>
            </div>
            <div className="flex gap-3">
                <FormGroup label="Seats">
                    <input
                        style={inputStyle}
                        type="number"
                        min="1"
                        value={seats}
                        onChange={(e) => setSeats(Number(e.target.value))}
                    />
                </FormGroup>
                <FormGroup label="Date">
                    <input
                        style={inputStyle}
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </FormGroup>
            </div>
            <FormGroup label="Pickup Point">
                <input
                    style={inputStyle}
                    placeholder="Specific pickup"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                />
            </FormGroup>
            {booking && (
                <FormGroup label="Status">
                    <select
                        style={inputStyle}
                        value={status}
                        onChange={(e) => setStatus(e.target.value as Booking["status"])}
                    >
                        {["confirmed", "completed", "cancelled", "no_show"].map((s) => (
                            <option key={s}>{s}</option>
                        ))}
                    </select>
                </FormGroup>
            )}
            <button
                className="w-full px-3.5 py-[9px] rounded-lg border-none text-[.82rem] font-semibold cursor-pointer text-white"
                style={{ background: "var(--brand)" }}
                onClick={() =>
                    onSubmit({
                        route,
                        rider,
                        phone,
                        seats,
                        date,
                        pickup,
                        ...(booking ? { status } : {}),
                    })
                }
            >
                {booking ? "Update Booking" : "Add Booking"}
            </button>
        </Dialog>
    );
}
