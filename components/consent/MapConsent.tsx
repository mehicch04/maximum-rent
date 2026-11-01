"use client";

import { ExternalLink, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMapsConsent } from "@/lib/consent";

export function MapPlaceholder({ link, onAllow }: { link: string; onAllow: () => void }) {
  const t = useTranslations("Consent");
  return (
    <div className="absolute inset-0 grid place-items-center overflow-hidden bg-surface-muted p-4 sm:p-5">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(hsl(var(--border))_1.2px,transparent_1.2px)] [background-size:18px_18px]" />
      <svg aria-hidden viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full text-border">
        <path d="M-10 210 C 80 170, 140 240, 220 190 S 340 120, 420 150" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round" />
        <path d="M120 -10 C 140 80, 110 160, 170 320" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        <path d="M280 -10 C 260 90, 320 170, 300 320" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      </svg>
      <div className="relative w-full max-w-sm rounded-[22px] bg-surface p-5 text-center shadow-[0_24px_50px_-30px_rgba(17,17,19,0.5)] ring-1 ring-border sm:p-6">
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-brand text-white shadow-[0_10px_20px_-10px_rgba(227,6,19,0.9)]">
          <MapPin className="h-5 w-5" />
        </span>
        <p className="mt-4 font-display text-base font-bold text-foreground">{t("mapTitle")}</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{t("mapBody")}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={onAllow}
            className="inline-flex h-10 items-center rounded-full bg-ink px-4 text-sm font-semibold text-white transition-colors hover:bg-ink/90"
          >
            {t("mapShow")}
          </button>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-surface-muted px-4 text-sm font-semibold text-foreground ring-1 ring-border transition-colors hover:bg-border/60"
          >
            {t("mapOpen")}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

export function ConsentMap({ src, title, link, className = "" }: { src: string; title: string; link: string; className?: string }) {
  const [ok, allow] = useMapsConsent();
  if (ok === null) return null;
  if (!ok) return <MapPlaceholder link={link} onAllow={() => allow(true)} />;
  return <iframe src={src} title={title} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen className={`absolute inset-0 h-full w-full ${className}`} />;
}
