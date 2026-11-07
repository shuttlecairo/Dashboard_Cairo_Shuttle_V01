"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Bus, Crosshair } from "lucide-react";
import type { Role } from "@/types/entities";
import { ROLES, ICON_MAP } from "@/config/dashboard";
import { ThemeToggle } from "@/components/dashboard/shared/ThemeToggle";

interface DashboardSidebarProps {
    role: Role;
    onRoleChange: (r: Role) => void;
    onNavigate?: () => void;
}

export function DashboardSidebar({ role, onRoleChange, onNavigate }: DashboardSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const roleConfig = ROLES[role];

    function switchRole(r: Role) {
        onRoleChange(r);
        // Navigate to first page of the new role
        const firstPage = ROLES[r].items[0].key;
        router.push(`/dashboard/${firstPage}`);
    }

    // Get active page key from pathname
    const activeKey = pathname.replace("/dashboard/", "").replace("/dashboard", "") || roleConfig.items[0].key;

    return (
        <nav
            className="w-[220px] flex-shrink-0 flex flex-col overflow-y-auto border-r h-full"
            style={{
                background: "var(--bg-card)",
                borderColor: "var(--border)",
                padding: "20px 0",
            }}
        >
            <div
                className="flex items-center gap-2 px-5 pb-4 text-lg font-bold"
                style={{ color: "var(--brand)" }}
            >
                <Bus size={22} />
                Cairo Shuttle
            </div>

            <div
                className="px-3 py-2 text-[.65rem] uppercase tracking-widest font-semibold"
                style={{ color: "var(--fg-muted)" }}
            >
                Role
            </div>
            {(Object.entries(ROLES) as [Role, typeof ROLES.admin][]).map(([key, val]) => (
                <button
                    key={key}
                    onClick={() => switchRole(key)}
                    className="flex items-center gap-2.5 py-2 px-5 text-[.85rem] cursor-pointer transition-all text-left border-l-[3px]"
                    style={{
                        color: role === key ? "var(--brand)" : "var(--fg-muted)",
                        background: role === key ? "var(--brand-light)" : "transparent",
                        borderColor: role === key ? "var(--brand)" : "transparent",
                        fontWeight: role === key ? 600 : 400,
                    }}
                >
                    {val.label}
                </button>
            ))}

            <div
                className="px-3 py-2 mt-4 text-[.65rem] uppercase tracking-widest font-semibold"
                style={{ color: "var(--fg-muted)" }}
            >
                Pages
            </div>
            {roleConfig.items.map((item) => {
                const Icon = ICON_MAP[item.icon] || Crosshair;
                const isActive = activeKey === item.key;
                return (
                    <Link
                        key={item.key}
                        href={`/dashboard/${item.key}`}
                        onClick={() => onNavigate?.()}
                        className="flex items-center gap-2.5 py-2 px-5 text-[.85rem] cursor-pointer transition-all text-left border-l-[3px] no-underline"
                        style={{
                            color: isActive ? "var(--brand)" : "var(--fg-muted)",
                            background: isActive ? "var(--brand-light)" : "transparent",
                            borderColor: isActive ? "var(--brand)" : "transparent",
                            fontWeight: isActive ? 600 : 400,
                        }}
                    >
                        <Icon size={16} />
                        {item.label}
                    </Link>
                );
            })}

            <div className="mt-auto pt-4 px-5">
                <ThemeToggle />
            </div>
        </nav>
    );
}
