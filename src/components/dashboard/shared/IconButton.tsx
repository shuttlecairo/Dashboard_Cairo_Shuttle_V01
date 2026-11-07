export function IconBtn({
    children,
    onClick,
    title,
    danger = false,
}: {
    children: React.ReactNode;
    onClick: () => void;
    title?: string;
    danger?: boolean;
}) {
    return (
        <button
            className="inline-flex items-center justify-center w-[30px] h-[30px] rounded-md border-none cursor-pointer transition-all"
            style={{
                background: "transparent",
                color: "var(--fg-muted)",
            }}
            title={title}
            onClick={onClick}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = danger
                    ? "var(--danger-light)"
                    : "var(--brand-light)";
                e.currentTarget.style.color = danger ? "var(--danger)" : "var(--brand)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--fg-muted)";
            }}
        >
            {children}
        </button>
    );
}
