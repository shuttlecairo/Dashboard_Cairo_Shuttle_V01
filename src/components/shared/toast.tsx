"use client";

import { useEffect, useState, useCallback, createContext, useContext } from "react";

type ToastType = "success" | "danger";

interface ToastContextValue {
  show: (msg: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ show: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(null);

  const show = useCallback((msg: string, type: ToastType = "success") => {
    setToast({ msg, type });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && (
        <div
          className="fixed top-5 right-5 z-[200] rounded-lg px-5 py-3 text-sm font-semibold text-white pointer-events-none"
          style={{
            background: toast.type === "success" ? "var(--success)" : "var(--danger)",
            animation: "slideDown 0.3s",
          }}
        >
          {toast.msg}
        </div>
      )}
    </ToastContext.Provider>
  );
}
