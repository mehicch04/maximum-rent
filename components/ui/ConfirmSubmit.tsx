"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";

type Props = {
  children: React.ReactNode; // button label/content
  className?: string;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  tone?: "danger" | "confirm";
};

export function ConfirmSubmit({
  children,
  className = "",
  title,
  message,
  confirmLabel,
  cancelLabel,
  tone = "confirm",
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<HTMLFormElement | null>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const accent =
    tone === "danger"
      ? "bg-brand hover:bg-brand-700 text-brand-foreground"
      : "bg-emerald-600 hover:bg-emerald-700 text-white";

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={(e) => {
          setForm(e.currentTarget.closest("form"));
          setOpen(true);
        }}
      >
        {children}
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            className="fixed inset-0 z-[95] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-card-hover"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    tone === "danger"
                      ? "bg-brand/10 text-brand"
                      : "bg-emerald-500/10 text-emerald-600"
                  }`}
                >
                  <AlertTriangle className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-bold tracking-tight">
                    {title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{message}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 items-center rounded-xl border border-border px-4 text-sm font-medium text-foreground/80 transition-colors hover:border-brand hover:text-brand"
                >
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    form?.requestSubmit();
                  }}
                  className={`inline-flex h-10 items-center rounded-xl px-4 text-sm font-semibold transition-colors ${accent}`}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
