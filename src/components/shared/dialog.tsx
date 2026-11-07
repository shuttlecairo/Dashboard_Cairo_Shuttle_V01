"use client";

interface DialogProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function Dialog({ title, onClose, children }: DialogProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,.4)", animation: "fadeIn .15s" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="rounded-[14px] p-6 w-[90%] max-w-[440px]"
        style={{
          background: "var(--bg-card)",
          boxShadow: "0 20px 60px rgba(0,0,0,.2)",
          animation: "slideUp .2s",
        }}
      >
        <h3 className="text-base font-bold mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}
