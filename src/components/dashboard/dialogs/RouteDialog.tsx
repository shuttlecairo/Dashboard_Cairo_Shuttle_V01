"use client";

import { useState } from "react";
import type { ShuttleRoute, Driver, DayOfWeek } from "@/types/entities";
import { Dialog } from "@/components/shared/dialog";
import { FormGroup } from "@/components/dashboard/shared";
import { inputStyle } from "@/config/dashboard";

interface RouteDialogProps {
    route?: ShuttleRoute;
    drivers: Driver[];
    onClose: () => void;
    onSubmit: (data: Record<string, unknown>) => void;
}

export function RouteDialog({ route, drivers, onClose, onSubmit }: RouteDialogProps) {
    const [pickup, setPickup] = useState(route?.pickup_area ?? "");
    const [dropoff, setDropoff] = useState(route?.dropoff_area ?? "");
    const [dep, setDep] = useState(route?.departure_time ?? "07:00");
    const [ret, setRet] = useState(route?.return_time ?? "18:00");
    const [days, setDays] = useState<DayOfWeek[]>(
        route?.days ?? ["Sun", "Mon", "Tue", "Wed", "Thu"]
    );
    const [price, setPrice] = useState(route?.price ?? 85);
    const [cap, setCap] = useState(route?.capacity ?? 14);
    const [driver, setDriver] = useState(route?.driver ?? "");

    const allDays: DayOfWeek[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    function toggleDay(d: DayOfWeek) {
        setDays((prev) =>
            prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
        );
    }

    return (
        <Dialog title={route ? "Edit Route" : "Add Shuttle Route"} onClose={onClose}>
            <div className="flex gap-3">
                <FormGroup label="Pickup Area">
                    <input
                        style={inputStyle}
                        placeholder="New Cairo - 5th Settlement"
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                    />
                </FormGroup>
                <FormGroup label="Drop-off Area">
                    <input
                        style={inputStyle}
                        placeholder="Downtown Cairo"
                        value={dropoff}
                        onChange={(e) => setDropoff(e.target.value)}
                    />
                </FormGroup>
            </div>
            <div className="flex gap-3">
                <FormGroup label="Departure">
                    <input
                        style={inputStyle}
                        type="time"
                        value={dep}
                        onChange={(e) => setDep(e.target.value)}
                    />
                </FormGroup>
                <FormGroup label="Arrival">
                    <input
                        style={inputStyle}
                        type="time"
                        value={ret}
                        onChange={(e) => setRet(e.target.value)}
                    />
                </FormGroup>
            </div>
            <FormGroup label="Days of Week">
                <div className="flex gap-1.5 flex-wrap">
                    {allDays.map((d) => (
                        <button
                            key={d}
                            onClick={() => toggleDay(d)}
                            className="px-2.5 py-1 rounded-full text-[.72rem] font-semibold cursor-pointer transition-all"
                            style={{
                                background: days.includes(d) ? "var(--brand)" : "var(--bg)",
                                color: days.includes(d) ? "#fff" : "var(--fg-muted)",
                                border: `1px solid ${days.includes(d) ? "var(--brand)" : "var(--border)"}`,
                            }}
                        >
                            {d}
                        </button>
                    ))}
                </div>
            </FormGroup>
            <div className="flex gap-3">
                <FormGroup label="Price (EGP)">
                    <input
                        style={inputStyle}
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                    />
                </FormGroup>
                <FormGroup label="Capacity">
                    <input
                        style={inputStyle}
                        type="number"
                        value={cap}
                        onChange={(e) => setCap(Number(e.target.value))}
                    />
                </FormGroup>
            </div>
            <FormGroup label="Assign Driver">
                <select
                    style={inputStyle}
                    value={driver}
                    onChange={(e) => setDriver(e.target.value)}
                >
                    <option value="">— Select Driver —</option>
                    {drivers
                        .filter((d) => d.active)
                        .map((d) => (
                            <option key={d.id}>{d.name}</option>
                        ))}
                </select>
            </FormGroup>
            <button
                className="w-full px-3.5 py-[9px] rounded-lg border-none text-[.82rem] font-semibold cursor-pointer text-white"
                style={{ background: "var(--brand)" }}
                onClick={() =>
                    onSubmit({
                        pickup_area: pickup,
                        dropoff_area: dropoff,
                        departure_time: dep,
                        return_time: ret,
                        days,
                        price,
                        capacity: cap,
                        driver: driver || null,
                    })
                }
            >
                {route ? "Update Route" : "Add Route"}
            </button>
        </Dialog>
    );
}
