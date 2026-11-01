"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALE_FLAG, LOCALE_NAMES, routing, type AppLocale } from "@/i18n/routing";
import { FlagIcon } from "@/components/ui/FlagIcon";

export function LangFlag({ locale, width = 20 }: { locale: AppLocale; width?: number }) {
  return <FlagIcon iso={LOCALE_FLAG[locale]} width={width} />;
}

function useSwitch() {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const [pending, start] = useTransition();
  const go = (next: AppLocale) => {
    if (next === locale) return;
    const search = typeof window !== "undefined" ? window.location.search : "";
    start(() => router.replace(`${pathname}${search}`, { locale: next, scroll: false }));
  };
  return { locale, go, pending };
}

export function LanguageToggle() {
  const t = useTranslations("Nav");
  const { locale, go, pending } = useSwitch();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative" data-pending={pending}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t("language")}: ${LOCALE_NAMES[locale]}`}
        className="inline-flex h-9 items-center gap-1.5 rounded-full pl-2.5 pr-2 text-xs font-semibold text-foreground/80 transition-colors hover:bg-foreground/[0.06] hover:text-foreground aria-expanded:bg-foreground/[0.06]"
      >
        <LangFlag locale={locale} />
        <span className="uppercase">{locale}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 z-50 mt-2 w-48 origin-top-right overflow-hidden rounded-2xl border border-border bg-surface p-1.5 shadow-[0_24px_50px_-24px_rgba(17,17,19,0.45)]"
          >
            {routing.locales.map((l) => {
              const active = l === locale;
              return (
                <button
                  key={l}
                  type="button"
                  role="option"
                  aria-selected={active}
                  lang={l}
                  onClick={() => {
                    setOpen(false);
                    go(l);
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-2.5 py-2.5 text-sm transition-colors ${
                    active ? "bg-brand/10 text-brand-strong" : "text-foreground hover:bg-surface-muted"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <LangFlag locale={l} width={22} />
                    <span className={active ? "font-semibold" : ""}>{LOCALE_NAMES[l]}</span>
                  </span>
                  {active ? <Check className="h-4 w-4 shrink-0" /> : <span className="text-[11px] font-semibold uppercase text-muted-foreground">{l}</span>}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
