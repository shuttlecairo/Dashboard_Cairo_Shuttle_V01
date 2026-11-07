"use client";
import { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}

export function Modal({ title, onClose, children, wide }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,.45)", animation: "fadeIn .15s" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`rounded-[14px] w-[90%] ${wide ? "max-w-[680px]" : "max-w-[480px]"} max-h-[85vh] flex flex-col`}
        style={{
          background: "var(--bg-card)",
          boxShadow: "0 20px 60px rgba(0,0,0,.25)",
          animation: "slideUp .2s",
        }}
      >
        <div className="flex items-center justify-between p-5 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <h3 className="text-[.95rem] font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-none"
            style={{ background: "var(--bg)", color: "var(--fg-muted)" }}
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </div>
  );
}
