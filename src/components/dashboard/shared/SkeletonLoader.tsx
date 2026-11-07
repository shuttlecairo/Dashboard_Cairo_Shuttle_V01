"use client";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-lg ${className}`}
      style={{
        background: "var(--border)",
        animation: "pulse-dot 1.5s ease-in-out infinite",
      }}
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className={`h-5 ${j === 0 ? "w-32" : "flex-1"}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-[14px] p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}
