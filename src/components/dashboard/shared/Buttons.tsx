export function BtnPrimary({
    children,
    onClick,
    className = "",
    disabled = false,
    type = "button",
}: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
}) {
    return (
        <button
            type={type}
            className={`inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg border-none text-[.82rem] font-semibold cursor-pointer transition-all text-white ${className}`}
            style={{ background: disabled ? "var(--fg-muted)" : "var(--brand)", opacity: disabled ? 0.6 : 1 }}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}

export function BtnOutline({
    children,
    onClick,
    className = "",
    disabled = false,
    type = "button",
}: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
}) {
    return (
        <button
            type={type}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[.75rem] font-semibold cursor-pointer transition-all ${className}`}
            style={{
                background: "transparent",
                border: "1px solid var(--border)",
                color: "var(--fg)",
                opacity: disabled ? 0.6 : 1,
            }}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}

export function BtnSuccess({
    children,
    onClick,
    className = "",
    disabled = false,
}: {
    children: React.ReactNode;
    onClick: () => void;
    className?: string;
    disabled?: boolean;
}) {
    return (
        <button
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border-none text-[.75rem] font-semibold cursor-pointer transition-all text-white ${className}`}
            style={{ background: "var(--success)", opacity: disabled ? 0.6 : 1 }}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}

export function BtnDanger({
    children,
    onClick,
    className = "",
    disabled = false,
}: {
    children: React.ReactNode;
    onClick: () => void;
    className?: string;
    disabled?: boolean;
}) {
    return (
        <button
            className={`inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg border-none text-[.82rem] font-semibold cursor-pointer transition-all text-white ${className}`}
            style={{ background: "var(--danger)", opacity: disabled ? 0.6 : 1 }}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
