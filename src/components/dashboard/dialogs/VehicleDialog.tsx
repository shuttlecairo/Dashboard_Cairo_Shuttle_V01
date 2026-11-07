"use client";

import { useState } from "react";
import type { Vehicle } from "@/types/entities";
import { Dialog } from "@/components/shared/dialog";
import { FormGroup } from "@/components/dashboard/shared";
import { inputStyle } from "@/config/dashboard";

interface VehicleDialogProps {
    vehicle?: Vehicle;
    onClose: () => void;
    onSubmit: (data: Record<string, unknown>) => void;
}

export function VehicleDialog({ vehicle, onClose, onSubmit }: VehicleDialogProps) {
    const [plate, setPlate] = useState(vehicle?.plate ?? "");
    const [type, setType] = useState(vehicle?.type ?? "minibus");
    const [cap, setCap] = useState(vehicle?.capacity ?? 14);

    return (
        <Dialog title={vehicle ? "Edit Vehicle" : "Add Vehicle"} onClose={onClose}>
            <FormGroup label="Plate Number">
                <input
                    style={{ ...inputStyle, fontFamily: "'IBM Plex Mono', monospace" }}
                    placeholder="أ ب ج ١٢٣٤"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                />
            </FormGroup>
            <div className="flex gap-3">
                <FormGroup label="Type">
                    <select
                        style={inputStyle}
                        value={type}
                        onChange={(e) => setType(e.target.value as Vehicle["type"])}
                    >
                        {["minibus", "bus", "microbus", "van", "sedan"].map((t) => (
                            <option key={t}>{t}</option>
                        ))}
                    </select>
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
            <button
                className="w-full px-3.5 py-[9px] rounded-lg border-none text-[.82rem] font-semibold cursor-pointer text-white"
                style={{ background: "var(--brand)" }}
                onClick={() => onSubmit({ plate, type, capacity: cap })}
            >
                {vehicle ? "Update Vehicle" : "Add Vehicle"}
            </button>
        </Dialog>
    );
}
