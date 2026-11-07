"use client";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode | React.ComponentType<{ size?: number }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const renderIcon = () => {
    if (!icon) return <Inbox size={28} />;
    if (typeof icon === "function") { const Icon = icon as React.ComponentType<{ size?: number }>; return <Icon size={28} />; }
    return icon;
  };
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "var(--bg)", color: "var(--fg-muted)" }}>
        {renderIcon()}
      </div>
      <h3 className="text-[.92rem] font-semibold mb-1">{title}</h3>
      {description && <p className="text-[.78rem] text-center max-w-[300px]" style={{ color: "var(--fg-muted)" }}>{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
