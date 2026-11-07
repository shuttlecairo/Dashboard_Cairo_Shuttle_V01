"use client";
import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = "Search..." }: SearchInputProps) {
  return (
    <div className="relative">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--fg-muted)" }} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2 rounded-lg text-[.82rem] border-none outline-none"
        style={{
          background: "var(--bg)",
          color: "var(--fg)",
          border: "1px solid var(--border)",
          fontFamily: "inherit",
        }}
      />
    </div>
  );
}
