export function FormGroup({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="mb-3.5">
            <label
                className="block text-[.78rem] font-semibold mb-1"
                style={{ color: "var(--fg-muted)" }}
            >
                {label}
            </label>
            {children}
        </div>
    );
}
