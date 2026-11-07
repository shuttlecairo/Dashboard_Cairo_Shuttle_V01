"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bus, Menu, X } from "lucide-react";
import type { Role } from "@/types/entities";
import { ROLES } from "@/config/dashboard";
import { ToastProvider } from "@/components/shared/toast";
import { useDashboard } from "@/hooks/dashboard/useDashboard";
import { DashboardProvider } from "./DashboardContext";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardDialogs } from "./DashboardDialogs";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [role, setRole] = useState<Role>("admin");
    const pathname = usePathname();
    const router = useRouter();

    // Ensure current page is valid for role — redirect if not
    useEffect(() => {
        const currentKey = pathname.replace("/dashboard/", "").replace("/dashboard", "");
        const roleConfig = ROLES[role];
        const validKeys = roleConfig.items.map((i) => i.key);

        if (!validKeys.includes(currentKey)) {
            router.replace(`/dashboard/${roleConfig.items[0].key}`);
        }
    }, [role, pathname, router]);

    function handleRoleChange(r: Role) {
        setRole(r);
    }

    return (
        <ToastProvider>
            <DashboardLayoutInner role={role} onRoleChange={handleRoleChange}>
                {children}
            </DashboardLayoutInner>
        </ToastProvider>
    );
}

function DashboardLayoutInner({
    role,
    onRoleChange,
    children,
}: {
    role: Role;
    onRoleChange: (r: Role) => void;
    children: React.ReactNode;
}) {
    const dashboardState = useDashboard();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <DashboardProvider value={dashboardState}>
            <div className="flex h-full">
                {/* Mobile header */}
                <div className="fixed top-0 left-0 right-0 z-50 md:hidden flex items-center justify-between px-4 h-14"
                  style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
                  <div className="flex items-center gap-2 font-bold" style={{ color: "var(--brand)" }}>
                    <Bus size={20} /> Cairo Shuttle
                  </div>
                  <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-9 h-9 rounded-lg flex items-center justify-center border-none cursor-pointer" style={{ background: "var(--bg)", color: "var(--fg)" }}>
                    {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
                  </button>
                </div>
                {/* Overlay */}
                {sidebarOpen && <div className="fixed inset-0 z-40 md:hidden" style={{ background: "rgba(0,0,0,.3)" }} onClick={() => setSidebarOpen(false)} />}
                {/* Sidebar */}
                <div className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:static z-50 md:z-auto h-full transition-transform duration-200`}>
                  <DashboardSidebar role={role} onRoleChange={(r) => { onRoleChange(r); setSidebarOpen(false); }} onNavigate={() => setSidebarOpen(false)} />
                </div>
                <main className="flex-1 overflow-y-auto p-7 max-md:p-4 max-md:pt-[72px]" style={{ background: "var(--bg)" }}>
                    {children}
                </main>
                <DashboardDialogs />
            </div>
        </DashboardProvider>
    );
}
