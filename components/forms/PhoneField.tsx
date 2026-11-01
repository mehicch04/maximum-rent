"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { COUNTRIES, LOCALE_COUNTRY, countryOf, flagEmoji, joinPhone, matchDial, splitPhone } from "@/lib/phone";

function Flag({ iso, plain }: { iso: string; plain: boolean }) {
  return plain ? (
    <span className="grid h-5 w-7 place-items-center rounded-[4px] bg-foreground/[0.07] text-[9px] font-bold tracking-wide text-foreground/70">{iso}</span>
  ) : (
    <span className="text-lg leading-none">{flagEmoji(iso)}</span>
  );
}

export function PhoneField({
  id,
  value,
  onChange,
  onBlur,
  invalid,
  describedBy,
  inputClassName = "",
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  invalid?: boolean;
  describedBy?: string;
  inputClassName?: string;
  placeholder?: string;
}) {
  const locale = useLocale();
  const t = useTranslations("Phone");
  const fallback = LOCALE_COUNTRY[locale] ?? "BA";
  const [iso, setIso] = useState(() => splitPhone(value, fallback).iso);
  const [national, setNational] = useState(() => splitPhone(value, fallback).national);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [plain, setPlain] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const last = useRef(value);

  useEffect(() => {
    setPlain(/Windows/i.test(navigator.userAgent));
    if (value) return;
    if (locale === "hr") return;
    const region = (navigator.languages?.[0] ?? navigator.language ?? "").split("-")[1]?.toUpperCase();
    if (region && COUNTRIES.some((c) => c.iso === region)) setIso(region);
  }, []);

  useEffect(() => {
    if (value === last.current) return;
    last.current = value;
    const s = splitPhone(value, iso);
    setIso(s.iso);
    setNational(s.national);
  }, [value]);

  const emit = (nextIso: string, nextNational: string) => {
    const full = joinPhone(nextIso, nextNational);
    last.current = full;
    onChange(full);
  };

  const [names, setNames] = useState<Map<string, string>>(() => new Map());
  const [index, setIndex] = useState<Map<string, string>>(() => new Map());
  useEffect(() => {
    const make = (l: string[]) => {
      try {
        return new Intl.DisplayNames(l, { type: "region" });
      } catch {
        return null;
      }
    };
    const dn = make(locale === "hr" ? ["hr", "bs", "en"] : [locale, "en"]);
    const en = make(["en"]);
    const label = (iso: string) => dn?.of(iso) || iso;
    setNames(new Map(COUNTRIES.map((c) => [c.iso, label(c.iso)])));
    setIndex(new Map(COUNTRIES.map((c) => [c.iso, `${label(c.iso)} ${en?.of(c.iso) ?? ""} ${c.iso}`.toLowerCase()])));
  }, [locale]);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase().replace(/^\+/, "");
    const top = COUNTRIES.slice(0, 22);
    const rest = COUNTRIES.slice(22).sort((a, b) => (names.get(a.iso) ?? "").localeCompare(names.get(b.iso) ?? "", locale));
    const all = [...top, ...rest];
    if (!term) return all;
    return all.filter((c) => c.dial.startsWith(term) || (index.get(c.iso) ?? c.iso.toLowerCase()).includes(term));
  }, [q, names, index, locale]);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => search.current?.focus());
    const away = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      input.current?.focus();
    };
    document.addEventListener("pointerdown", away);
    window.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      window.removeEventListener("keydown", esc);
    };
  }, [open]);

  const pick = (next: string) => {
    setIso(next);
    setOpen(false);
    setQ("");
    emit(next, national);
    requestAnimationFrame(() => input.current?.focus());
  };

  const onType = (raw: string) => {
    if (/^\s*(\+|00)/.test(raw)) {
      const hit = matchDial(raw.replace(/^\s*00/, "").replace(/\D/g, ""), iso);
      if (hit) {
        const pattern = new RegExp(`^\\s*(?:\\+|00)\\s*${hit.country.dial.split("").join("\\s*")}[\\s-]*`);
        const rest = raw.replace(pattern, "").replace(/[^\d\s]/g, "");
        setIso(hit.country.iso);
        setNational(rest);
        emit(hit.country.iso, rest);
        return;
      }
    }
    const clean = raw.replace(/[^\d\s]/g, "");
    setNational(clean);
    emit(iso, clean);
  };

  const c = countryOf(iso);

  return (
    <div ref={root} className="relative">
      <div
        className={`flex items-stretch overflow-hidden rounded-xl border bg-surface transition-[border-color,box-shadow] focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/30 ${
          invalid ? "border-rose-400 ring-2 ring-rose-500/15" : "border-border"
        } ${inputClassName}`}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`${t("country")}: ${names.get(iso) ?? iso} +${c.dial}`}
          className="flex shrink-0 items-center gap-1.5 border-e border-border bg-surface-muted/60 ps-3 pe-2 text-sm font-semibold tabular-nums text-foreground transition-colors hover:bg-surface-muted"
        >
          <Flag iso={iso} plain={plain} />
          <span>+{c.dial}</span>
          <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <input
          ref={input}
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={national}
          placeholder={placeholder ?? t("placeholder")}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={(e) => onType(e.target.value)}
          onBlur={onBlur}
          className="h-12 w-full min-w-0 bg-transparent px-3 text-base text-foreground outline-none placeholder:text-muted-foreground/70 sm:text-sm"
        />
      </div>

      {open && (
        <div className="absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-2xl bg-surface shadow-[0_24px_50px_-24px_rgba(11,18,32,0.5)] ring-1 ring-border">
          <div dir="auto" className="flex items-center gap-2 border-b border-border px-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              ref={search}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (list[0]) pick(list[0].iso);
                }
              }}
              placeholder={t("search")}
              aria-label={t("search")}
              className="h-11 w-full min-w-0 bg-transparent text-base outline-none placeholder:text-muted-foreground/70 sm:text-sm"
            />
          </div>
          <ul role="listbox" className="max-h-64 overflow-y-auto overscroll-contain p-1.5">
            {list.length === 0 && <li className="px-3 py-3 text-sm text-muted-foreground">{t("none")}</li>}
            {list.map((x, i) => (
              <li key={x.iso}>
                {i === 22 && !q && <span aria-hidden className="mx-2 my-1 block h-px bg-border" />}
                <button
                  type="button"
                  role="option"
                  aria-selected={x.iso === iso}
                  onClick={() => pick(x.iso)}
                  className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-start text-sm transition-colors ${
                    x.iso === iso ? "bg-brand/10 font-semibold text-foreground" : "text-foreground/85 hover:bg-surface-muted"
                  }`}
                >
                  <Flag iso={x.iso} plain={plain} />
                  <span dir="auto" className="min-w-0 flex-1 truncate">
                    {names.get(x.iso)}
                  </span>
                  <span className="tabular-nums text-muted-foreground">+{x.dial}</span>
                  {x.iso === iso && <Check className="h-4 w-4 shrink-0 text-brand-strong" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
