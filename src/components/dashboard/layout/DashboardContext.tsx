"use client";

import { createContext, useContext } from "react";
import type { UseDashboardReturn } from "@/types/dashboard";

const DashboardContext = createContext<UseDashboardReturn | null>(null);

export function DashboardProvider({
    value,
    children,
}: {
    value: UseDashboardReturn;
    children: React.ReactNode;
}) {
    return (
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboardContext(): UseDashboardReturn {
    const ctx = useContext(DashboardContext);
    if (!ctx) {
        throw new Error("useDashboardContext must be used within DashboardProvider");
    }
    return ctx;
}
