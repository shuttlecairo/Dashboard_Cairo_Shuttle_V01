import { ReactNode } from "react";

export function StatCard({
    label,
    value,
    sub,
    valueColor,
    icon,
    color,
}: {
    label: string;
    value: string | number;
    sub?: string;
    valueColor?: string;
    icon?: ReactNode;
    color?: string;
}) {
    return (
        <div
            className="rounded-[14px] p-5"
            style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow)",
            }}
        >
            <div className="flex items-center justify-between">
                <div className="text-[.78rem]" style={{ color: "var(--fg-muted)" }}>
                    {label}
                </div>
                {icon && <div style={{ color: color || "var(--fg-muted)" }}>{icon}</div>}
            </div>
            <div
                className="text-[1.8rem] font-bold mt-1"
                style={{ color: valueColor || color }}
            >
                {value}
            </div>
            {sub && (
                <div className="text-[.72rem] mt-0.5" style={{ color: "var(--fg-muted)" }}>
                    {sub}
                </div>
            )}
        </div>
    );
}
