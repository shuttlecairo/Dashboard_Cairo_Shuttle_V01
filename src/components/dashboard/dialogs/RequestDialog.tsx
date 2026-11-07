"use client";

import { useState } from "react";
import { Dialog } from "@/components/shared/dialog";
import { FormGroup } from "@/components/dashboard/shared";
import { inputStyle } from "@/config/dashboard";

interface RequestDialogProps {
    title: string;
    labels: { pickup: string; dropoff: string; count: string };
    defaultCount: number;
    onClose: () => void;
    onSubmit: (data: Record<string, unknown>) => void;
}

export function RequestDialog({
    title,
    labels,
    defaultCount,
    onClose,
    onSubmit,
}: RequestDialogProps) {
    const [pickup, setPickup] = useState("");
    const [dropoff, setDropoff] = useState("");
    const [schedule, setSchedule] = useState("");
    const [count, setCount] = useState(defaultCount);
    const [notes, setNotes] = useState("");

    return (
        <Dialog title={title} onClose={onClose}>
            <FormGroup label={labels.pickup}>
                <input
                    style={inputStyle}
                    placeholder="Enter location"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                />
            </FormGroup>
            <FormGroup label={labels.dropoff}>
                <input
                    style={inputStyle}
                    placeholder="Enter destination"
                    value={dropoff}
                    onChange={(e) => setDropoff(e.target.value)}
                />
            </FormGroup>
            <FormGroup label="Schedule">
                <input
                    style={inputStyle}
                    placeholder="e.g. Daily 7am & 5pm"
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                />
            </FormGroup>
            <FormGroup label={labels.count}>
                <input
                    style={inputStyle}
                    type="number"
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                />
            </FormGroup>
            <FormGroup label="Notes">
                <input
                    style={inputStyle}
                    placeholder="Any special requirements..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
            </FormGroup>
            <button
                className="w-full px-3.5 py-[9px] rounded-lg border-none text-[.82rem] font-semibold cursor-pointer text-white"
                style={{ background: "var(--brand)" }}
                onClick={() => onSubmit({ pickup, dropoff, schedule, count, notes })}
            >
                Submit Request
            </button>
        </Dialog>
    );
}
