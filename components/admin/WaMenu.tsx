"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

type Lang = "HR" | "EN" | "DE" | "ES";
type Item = { key: string; label: string; text: string; href: string };

const LANGS: Lang[] = ["HR", "EN", "DE", "ES"];
const NAMES: Record<Lang, string> = { HR: "hrvatski", EN: "engleski", DE: "njemački", ES: "španski" };

export function WaMenu({ items, lang, blank }: { items: Record<Lang, Item[]>; lang: Lang; blank: string }) {
  const [open, setOpen] = useState(false);
  const [pick, setPick] = useState<Lang>(lang);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const link = "block rounded-xl px-2.5 py-2 transition-colors hover:bg-surface-muted";

  return (
    <div ref={root} className="relative inline-block">
      <button
        type="button"
        onClick={() => {
          setPick(lang);
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-1 rounded-full bg-[#25D366]/15 px-2.5 py-1 text-[11px] font-semibold text-[#128C4B] transition-colors hover:bg-[#25D366]/25 dark:text-[#4ADE80]"
      >
        <WhatsAppIcon className="h-3.5 w-3.5" />
        WhatsApp
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div aria-hidden onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-ink/40 sm:hidden" />
          <div
            role="menu"
            className="fixed inset-x-3 bottom-3 z-50 max-h-[75vh] overflow-y-auto rounded-2xl border border-border bg-surface p-1.5 shadow-[0_24px_50px_-24px_rgba(11,18,32,0.45)] sm:absolute sm:inset-x-auto sm:bottom-auto sm:start-0 sm:top-full sm:mt-2 sm:max-h-none sm:w-72"
          >
            <div className="flex items-center justify-between gap-2 px-2.5 pb-1.5 pt-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Poruka gostu</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Zatvori"
                className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-surface-muted sm:hidden"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div role="radiogroup" aria-label="Jezik poruke" className="mx-1 mb-1.5 grid grid-cols-4 gap-1 rounded-xl bg-surface-muted p-1">
              {LANGS.map((l) => (
                <button
                  key={l}
                  type="button"
                  role="radio"
                  aria-checked={pick === l}
                  title={NAMES[l]}
                  onClick={() => setPick(l)}
                  className={`relative h-8 rounded-lg text-xs font-semibold transition-colors ${
                    pick === l ? "bg-surface text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l}
                  {l === lang && <span aria-hidden className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#25D366]" />}
                </button>
              ))}
            </div>
            <p className="px-2.5 pb-1 text-[11px] text-muted-foreground">
              {pick === lang ? `Jezik gosta: ${NAMES[lang]}` : `Gost je rezervisao na jeziku: ${NAMES[lang]}`}
            </p>
            {items[pick].map((m) => (
              <a key={m.key} role="menuitem" href={m.href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className={link}>
                <span className="block text-sm font-semibold text-foreground">{m.label}</span>
                <span className="mt-0.5 line-clamp-3 text-xs text-muted-foreground">{m.text}</span>
              </a>
            ))}
            <a
              role="menuitem"
              href={blank}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className={`${link} mt-1 border-t border-border text-xs font-semibold text-[#128C4B] dark:text-[#4ADE80]`}
            >
              Otvori prazan chat
            </a>
          </div>
        </>
      )}
    </div>
  );
}
