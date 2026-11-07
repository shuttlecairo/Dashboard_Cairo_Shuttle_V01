export function Card({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="rounded-[14px] overflow-hidden mb-5"
            style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow)",
            }}
        >
            {children}
        </div>
    );
}
