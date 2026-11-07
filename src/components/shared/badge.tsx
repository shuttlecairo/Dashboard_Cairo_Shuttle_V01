"use client";

const BADGE_COLORS: Record<string, string> = {
  confirmed: "bg-success-light text-success",
  completed: "bg-blue-light text-blue",
  cancelled: "bg-danger-light text-danger",
  no_show: "bg-amber-light text-amber",
  accepted: "bg-success-light text-success",
  quoted: "bg-blue-light text-blue",
  pending: "bg-amber-light text-amber",
  rejected: "bg-danger-light text-danger",
  active: "bg-success-light text-success",
  inactive: "bg-border text-fg-muted",
};

// Inline style version for CSS variable colors
const BADGE_STYLES: Record<string, { bg: string; color: string }> = {
  confirmed: { bg: "var(--success-light)", color: "var(--success)" },
  completed: { bg: "var(--blue-light)", color: "var(--blue)" },
  cancelled: { bg: "var(--danger-light)", color: "var(--danger)" },
  no_show: { bg: "var(--amber-light)", color: "var(--amber)" },
  accepted: { bg: "var(--success-light)", color: "var(--success)" },
  quoted: { bg: "var(--blue-light)", color: "var(--blue)" },
  pending: { bg: "var(--amber-light)", color: "var(--amber)" },
  rejected: { bg: "var(--danger-light)", color: "var(--danger)" },
  active: { bg: "var(--success-light)", color: "var(--success)" },
  inactive: { bg: "var(--border)", color: "var(--fg-muted)" },
};

export function Badge({ status }: { status: string }) {
  const style = BADGE_STYLES[status] ?? BADGE_STYLES.inactive;
  return (
    <span
      className="inline-block px-2.5 py-0.5 rounded-full text-[.72rem] font-semibold"
      style={{ background: style.bg, color: style.color }}
    >
      {status.replace("_", " ")}
    </span>
  );
}
