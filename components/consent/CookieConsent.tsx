"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CONSENT_OPEN, readConsent, saveConsent } from "@/lib/consent";
import { Reveal, Toggle } from "@/components/booking/ui";

const EASE = [0.22, 1, 0.36, 1] as const;

export function CookieConsent() {
  const t = useTranslations("Consent");
  const [open, setOpen] = useState(false);
  const [more, setMore] = useState(false);
  const [maps, setMaps] = useState(true);
  const [known, setKnown] = useState(false);

  useEffect(() => {
    const c = readConsent();
    if (!c) {
      const id = setTimeout(() => setOpen(true), 900);
      return () => clearTimeout(id);
    }
    setKnown(true);
    setMaps(c.maps);
  }, []);

  useEffect(() => {
    const reopen = () => {
      const c = readConsent();
      if (c) {
        setMaps(c.maps);
        setKnown(true);
      }
      setMore(true);
      setOpen(true);
    };
    window.addEventListener(CONSENT_OPEN, reopen);
    return () => window.removeEventListener(CONSENT_OPEN, reopen);
  }, []);

  const done = (m: boolean) => {
    saveConsent(m);
    setMaps(m);
    setKnown(true);
    setOpen(false);
    setMore(false);
  };

  const btn = "inline-flex h-11 min-w-0 items-center justify-center rounded-full px-4 text-sm font-semibold transition-[background-color,transform] duration-200 active:scale-[0.98]";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="false"
          aria-labelledby="consent-title"
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="fixed inset-x-3 bottom-3 z-[80] sm:inset-x-auto sm:bottom-6 sm:left-6 sm:w-[400px]"
        >
          <div className="relative overflow-hidden rounded-[24px] bg-surface p-5 shadow-[0_30px_70px_-30px_rgba(17,17,19,0.6)] ring-1 ring-border">
            <span aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand/10 blur-3xl" />
            <div className="relative flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand-strong">
                <Cookie className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p id="consent-title" className="font-display text-base font-bold text-foreground">
                  {t("title")}
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  {t("body")}{" "}
                  <Link href="/privatnost" className="font-medium text-foreground underline underline-offset-2">
                    {t("policy")}
                  </Link>
                </p>
              </div>
              {known && (
                <button type="button" onClick={() => setOpen(false)} aria-label={t("close")} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <Reveal show={more}>
              <ul className="relative mt-4 space-y-2">
                <li className="flex items-center justify-between gap-4 rounded-2xl bg-surface-muted px-4 py-3">
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-foreground">{t("necessaryT")}</span>
                    <span className="block text-xs leading-snug text-muted-foreground">{t("necessaryB")}</span>
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-emerald-700">{t("always")}</span>
                </li>
                <li className="flex items-center justify-between gap-4 rounded-2xl bg-surface-muted px-4 py-3">
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-foreground">{t("mapsT")}</span>
                    <span className="block text-xs leading-snug text-muted-foreground">{t("mapsB")}</span>
                  </span>
                  <Toggle checked={maps} onChange={setMaps} label={t("mapsT")} />
                </li>
              </ul>
            </Reveal>

            <div className="relative mt-4 grid grid-cols-2 gap-2">
              {more ? (
                <button type="button" onClick={() => done(maps)} className={`${btn} bg-ink text-white hover:bg-ink/90`}>
                  {t("save")}
                </button>
              ) : (
                <button type="button" onClick={() => done(false)} className={`${btn} bg-surface-muted text-foreground hover:bg-border/70`}>
                  {t("necessary")}
                </button>
              )}
              <button type="button" onClick={() => done(true)} className={`${btn} bg-brand text-white shadow-[0_12px_24px_-14px_rgba(227,6,19,0.9)] hover:bg-brand-700`}>
                {t("acceptAll")}
              </button>
            </div>
            <div className="relative mt-2 flex justify-center">
              <button
                type="button"
                onClick={() => (more ? done(false) : setMore(true))}
                className="rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                {more ? t("necessary") : t("settings")}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ConsentLink({ label, className = "" }: { label: string; className?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN))} className={className}>
      {label}
    </button>
  );
}
