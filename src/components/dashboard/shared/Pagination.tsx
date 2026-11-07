"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  page?: number;
  totalPages?: number;
  onPageChange?: (p: number) => void;
  current?: number;
  total?: number;
  onChange?: (p: number) => void;
}

export function Pagination(props: PaginationProps) {
  const page = props.page ?? props.current ?? 1;
  const totalPages = props.totalPages ?? props.total ?? 1;
  const onPageChange = props.onPageChange ?? props.onChange ?? (() => {});
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-none disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ background: "var(--bg)", color: "var(--fg-muted)" }}
      >
        <ChevronLeft size={16} />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
        Math.max(0, page - 3), Math.min(totalPages, page + 2)
      ).map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-none text-[.78rem] font-semibold"
          style={{
            background: p === page ? "var(--brand)" : "var(--bg)",
            color: p === page ? "white" : "var(--fg-muted)",
          }}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-none disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ background: "var(--bg)", color: "var(--fg-muted)" }}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
