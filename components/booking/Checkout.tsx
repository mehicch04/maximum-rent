"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowRight,
  BookUser,
  Check,
  Copy,
  IdCard,
  Loader2,
  ShieldCheck,
  TriangleAlert,
  Wallet,
} from "lucide-react";

import type { CarListItem } from "@/lib/types";
import type { ExtraItem } from "@/lib/extras";
import { extraLineTotal, rentalDays } from "@/lib/extras";
import { availabilityFor, maxSelectable, type Booked } from "@/lib/extras-availability";
import { formatPrice } from "@/lib/currency";
import { phoneValid } from "@/lib/phone";
import { PhoneField } from "@/components/forms/PhoneField";
import { useCurrency } from "@/components/currency/CurrencyProvider";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { Link } from "@/i18n/navigation";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { bookingHref, overlapsBusy, type BusyRange } from "@/lib/booking";
import { FUEL_LABELS, TRANSMISSION_LABELS, label as pick } from "@/lib/car-labels";
import type { AppLocale } from "@/i18n/routing";
import { CheckoutSummary, type SummaryLine } from "./CheckoutSummary";
import { Amount, Reveal, Step, Stepper, Toggle, useStickyTop } from "./ui";
import { extraText, type Loc } from "./state";

type Props = {
  car: CarListItem;
  pickupAt: string;
  returnAt: string;
  pickup: Loc | null;
  ret: Loc | null;
  locations: Loc[];
  extras: ExtraItem[];
  booked: Booked[];
  busy: BusyRange[];
  upsell: { car: CarListItem; diff: number }[];
};

type Field = "firstName" | "lastName" | "phone" | "email" | "flight" | "note";

const EASE = [0.22, 1, 0.36, 1] as const;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STORE = "maximum-checkout";

const INPUT =
  "peer h-12 w-full min-w-0 rounded-xl border bg-background px-3.5 pe-10 text-base text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/60 focus:border-brand focus:ring-4 focus:ring-brand/15 sm:text-sm";

export function Checkout({ car, pickupAt, returnAt, pickup, ret, locations, extras, booked, busy, upsell }: Props) {
  const t = useTranslations("Booking");
  const tf = useTranslations("Fleet");
  const locale = useLocale() as AppLocale;
  const { currency } = useCurrency();
  const price = (v: number) => formatPrice(v, currency);
  const top = useRef<HTMLDivElement>(null);
  const aside = useRef<HTMLDivElement>(null);
  const stickTop = useStickyTop(aside);

  const start = useMemo(() => new Date(pickupAt), [pickupAt]);
  const end = useMemo(() => new Date(returnAt), [returnAt]);
  const days = rentalDays(start, end);
  const [status, setStatus] = useState<"idle" | "sending" | "error" | "booked" | "extras">("idle");
  const conflict = overlapsBusy(busy, start, end) || status === "booked";

  const gear = extras.filter((e) => e.pricing !== "INCLUDED");

  const free = useMemo(
    () =>
      availabilityFor(
        extras,
        booked.map((x) => ({ ...x, from: new Date(x.from), to: new Date(x.to) })),
        start,
        end,
      ),
    [extras, booked, start, end],
  );
  const [live, setLive] = useState<Record<string, number>>({});
  const freeOf = (e: ExtraItem) => Math.max(0, live[e.id] ?? free[e.id] ?? e.totalStock);
  const cap = (e: ExtraItem) => maxSelectable(e.maxQty, freeOf(e));

  const [form, setForm] = useState<Record<Field, string>>({ firstName: "", lastName: "", phone: "", email: "", flight: "", note: "" });
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [qty, setQty] = useState<Record<string, number>>({});
  const [done, setDone] = useState<{ reference: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const payRef = useRef<HTMLElement>(null);
  const [barHidden, setBarHidden] = useState(false);
  const restored = useRef(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORE);
      if (raw) {
        const saved = JSON.parse(raw) as { form?: Partial<Record<Field, string>> };
        if (saved.form) setForm((f) => ({ ...f, ...saved.form }));
      }
    } catch {}
    restored.current = true;
  }, []);

  useEffect(() => {
    if (!restored.current) return;
    try {
      sessionStorage.setItem(STORE, JSON.stringify({ form }));
    } catch {}
  }, [form]);

  useEffect(() => {
    const el = payRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setBarHidden(e.isIntersecting || e.boundingClientRect.top < 0), { rootMargin: "0px 0px -40px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [done]);

  useEffect(() => setLive({}), [pickupAt, returnAt]);

  useEffect(() => {
    const root = document.documentElement;
    if (!done && !barHidden) root.dataset.bar = "1";
    else delete root.dataset.bar;
    return () => {
      delete root.dataset.bar;
    };
  }, [done, barHidden]);

  useEffect(() => {
    setQty((q) => {
      let changed = false;
      const next = { ...q };
      for (const e of gear) {
        const m = cap(e);
        if ((next[e.id] ?? 0) > m) {
          next[e.id] = m;
          changed = true;
        }
      }
      return changed ? next : q;
    });
  }, [free, live]);

  const valid: Record<Field, boolean> = {
    firstName: form.firstName.trim().length >= 2,
    lastName: form.lastName.trim().length >= 2,
    phone: phoneValid(form.phone),
    email: EMAIL.test(form.email.trim()),
    flight: form.flight.trim().length > 0,
    note: true,
  };
  const required: Field[] = ["firstName", "lastName", "phone", "email"];
  const filled = required.filter((k) => valid[k]).length;
  const detailsDone = filled === required.length;

  const setField = (k: Field, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const chosen = gear.filter((e) => (qty[e.id] ?? 0) > 0).map((e) => ({ e, q: qty[e.id] }));

  const daily = car.pricePerDay ?? 0;
  const rental = daily * days;
  const rentalLabel = t("rentalLine", { days, price: price(daily) });
  const lines: SummaryLine[] = chosen.map(({ e, q }) => ({
      key: e.id,
      label: `${extraText(e, locale).name}${q > 1 ? ` × ${q}` : ""}`,
      amount: extraLineTotal(e.pricing, e.price, q, days),
    }));
  const total = rental + lines.reduce((a, l) => a + l.amount, 0);
  const wa = buildWhatsAppUrl({ car: { title: car.title }, pickupLocation: pickup, returnLocation: ret, pickupAt: start, returnAt: end, locale });

  useEffect(() => {
    if (done || status === "booked") top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (status === "extras") document.getElementById("co-gear")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [done, status]);

  function validate() {
    const e: Partial<Record<Field, string>> = {};
    if (!valid.firstName) e.firstName = t("errRequired");
    if (!valid.lastName) e.lastName = t("errRequired");
    if (!valid.phone) e.phone = t("errPhone");
    if (!valid.email) e.email = t("errEmail");
    setErrors(e);
    setTouched({ firstName: true, lastName: true, phone: true, email: true });
    const firstBad = (Object.keys(e) as Field[])[0];
    if (firstBad) document.getElementById(`co-${firstBad}`)?.focus({ preventScroll: false });
    return !firstBad;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (conflict || status === "sending" || !validate()) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carId: car.id,
          carTitle: car.title,
          pickupLocationId: pickup?.id,
          returnLocationId: ret?.id,
          pickupAt,
          returnAt,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          flightNumber: form.flight.trim(),
          message: form.note.trim(),
          locale,
          currency,
          extras: chosen.map(({ e, q }) => ({ id: e.id, qty: q })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.error === "booked") return setStatus("booked");
      if (data.error === "extras" && data.free) {
        const next: Record<string, number> = data.free;
        setLive((l) => ({ ...l, ...next }));
        return setStatus("extras");
      }
      if (!res.ok || !data.ok) throw new Error(data.error ?? "failed");
      setStatus("idle");
      try {
        sessionStorage.removeItem(STORE);
      } catch {}
      setDone({ reference: data.reference });
    } catch {
      setStatus("error");
    }
  }

  const steps = t.raw("steps") as string[];
  const progress = done ? [1, 1] : [1, filled / required.length];

  const field = (
    k: Field,
    opts: { label: string; type?: string; auto?: string; hint?: string; optional?: boolean; ph?: string; dir?: "ltr"; mode?: "tel" | "email" | "text" },
  ) => {
    const err = errors[k];
    const ok = touched[k] && valid[k] && !err && (!opts.optional || form[k].trim());
    return (
      <div className="min-w-0">
        <label htmlFor={`co-${k}`} className="mb-1.5 flex items-baseline justify-between gap-2 text-sm font-medium text-foreground">
          {opts.label}
          {opts.optional && <span className="text-xs font-normal text-muted-foreground">{t("optional")}</span>}
        </label>
        <div className="relative">
          {k === "phone" ? (
            <PhoneField
              id="co-phone"
              value={form.phone}
              onChange={(v) => setField("phone", v)}
              onBlur={() => setTouched((x) => ({ ...x, phone: true }))}
              invalid={Boolean(err)}
              describedBy="co-phone-d"
              inputClassName={ok ? "border-emerald-500/60" : ""}
            />
          ) : (
            <input
              id={`co-${k}`}
              type={opts.type ?? "text"}
              inputMode={opts.mode}
              autoComplete={opts.auto}
              dir={opts.dir}
              value={form[k]}
              placeholder={opts.ph}
              aria-invalid={Boolean(err)}
              aria-describedby={`co-${k}-d`}
              onChange={(e) => setField(k, e.target.value)}
              onBlur={() => setTouched((x) => ({ ...x, [k]: true }))}
              className={`${INPUT} ${err ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/15" : ok ? "border-emerald-500/60" : "border-border"}`}
            />
          )}
          <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center">
            <AnimatePresence>
              {ok && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-white"
                >
                  <Check className="h-3 w-3" strokeWidth={3} />
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </div>
        <AnimatePresence initial={false} mode="wait">
          <motion.p
            key={err ? "e" : "h"}
            id={`co-${k}-d`}
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className={`mt-1.5 min-h-[16px] text-xs ${err ? "text-rose-600 dark:text-rose-300" : "text-muted-foreground"}`}
          >
            {err ?? opts.hint ?? ""}
          </motion.p>
        </AnimatePresence>
      </div>
    );
  };

  const unit = (e: ExtraItem) => (
    <span>
      <bdi>{price(e.price)}</bdi> {e.pricing === "PER_DAY" ? `/ ${t("perDayUnit")}` : t("once")}
    </span>
  );

  const docs = [
    { key: "id", icon: BookUser, title: t("needPassport"), sub: t("needPassportSub") },
    { key: "lic", icon: IdCard, title: t("needLicence"), sub: t("needLicenceSub") },
  ];

  let n = 0;
  const next = () => ++n;

  if (done) {
    return (
      <div ref={top} className="scroll-mt-24">
        <StepBar steps={steps} active={2} progress={progress} center />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mx-auto mt-10 max-w-xl rounded-[28px] bg-surface p-6 text-center shadow-[0_40px_80px_-50px_rgba(11,18,32,0.5)] ring-1 ring-border sm:p-10"
        >
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-white shadow-[0_12px_30px_-12px_rgba(16,185,129,0.8)]">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.25, ease: EASE }} />
            </svg>
          </span>
          <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{t("successTitle")}</h1>
          <p className="mt-5 text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("reference")}</p>
          <div className="mt-1.5 inline-flex items-center gap-2 rounded-full bg-surface-muted py-1.5 pe-1.5 ps-4">
            <bdi className="font-mono text-lg font-semibold tracking-wider text-foreground">
              {done.reference}
            </bdi>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(done.reference).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1800);
                });
              }}
              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-surface px-3 text-xs font-semibold text-foreground ring-1 ring-border transition-colors hover:bg-background"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? t("copied") : t("copy")}
            </button>
          </div>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">{t("successBody", { email: form.email.trim() })}</p>

          <div className="mt-6 rounded-2xl bg-brand/[0.05] p-4 text-start ring-1 ring-brand/15">
            <p className="text-sm font-semibold text-foreground">{t("needTitle")}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {docs.map((d) => (
                <li key={d.key} className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-foreground ring-1 ring-border">
                  <d.icon className="h-3.5 w-3.5 text-brand-strong" />
                  {d.title}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 grid gap-2">
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 text-sm font-semibold text-[#06301A] transition-colors hover:bg-[#1FB859]"
            >
              <WhatsAppIcon className="h-5 w-5" />
              {t("waUs")}
            </a>
            <Link href="/" className="inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold text-foreground ring-1 ring-border transition-colors hover:bg-surface-muted">
              {t("backHome")}
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={top} className="scroll-mt-24">
      <StepBar steps={steps} active={1} progress={progress} />

      <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10">
        <aside className="min-w-0 lg:order-2">
          <div ref={aside} style={{ top: stickTop }} className="lg:sticky">
            <CheckoutSummary
              car={car}
              pickupAt={pickupAt}
              returnAt={returnAt}
              pickup={pickup}
              ret={ret}
              locations={locations}
              busy={busy}
              daily={daily}
              days={days}
              rentalLabel={rentalLabel}
              rental={rental}
              lines={lines}
              total={total}
              deposit={car.deposit}
            />
          </div>
        </aside>

        <form id="checkout" noValidate onSubmit={submit} className="min-w-0 space-y-5 lg:order-1">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{t("title")}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{t("lead")}</p>
          </div>

          <AnimatePresence>
            {conflict && (
              <motion.p
                role="alert"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-2.5 rounded-2xl bg-rose-500/10 px-4 py-3.5 text-sm font-medium text-rose-700 dark:text-rose-300"
              >
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                {t("errBooked")}
              </motion.p>
            )}
          </AnimatePresence>

          <Step n={next()} done={detailsDone} title={t("details")}>
            <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
              {field("firstName", { label: t("firstName"), auto: "given-name" })}
              {field("lastName", { label: t("lastName"), auto: "family-name" })}
              {field("phone", { label: t("phone"), type: "tel", mode: "tel", auto: "tel", hint: t("phoneHint"), ph: "+387 6x xxx xxx", dir: "ltr" })}
              {field("email", { label: t("email"), type: "email", mode: "email", auto: "email", hint: t("emailHint"), dir: "ltr" })}
              {field("flight", { label: t("flight"), hint: t("flightHint"), optional: true, ph: "W6 4217", dir: "ltr" })}
            </div>
          </Step>

          <section className="rounded-[22px] bg-gradient-to-b from-brand/[0.07] to-brand/[0.03] p-5 ring-1 ring-brand/20 sm:p-6">
            <h2 className="flex items-center gap-2.5 font-display text-base font-semibold text-brand-strong sm:text-lg">
              <ShieldCheck className="h-5 w-5" />
              {t("needTitle")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/85">{t("needBody")}</p>
            <ul className="mt-4 grid grid-cols-2 gap-2.5">
              <AnimatePresence initial={false} mode="popLayout">
                {docs.map((d) => (
                  <motion.li
                    key={d.key}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="flex flex-col items-center rounded-2xl bg-surface px-2 py-4 text-center ring-1 ring-brand/15"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-brand/10 text-brand-strong">
                      <d.icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="mt-2.5 text-[13px] font-semibold leading-tight text-foreground sm:text-sm">{d.title}</span>
                    <span className="mt-0.5 text-[11px] leading-tight text-muted-foreground sm:text-xs">{d.sub}</span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </section>

          {gear.length > 0 && (
            <Step n={next()} id="co-gear" title={t("equipmentTitle")} lead={t("equipmentLead")}>
              <Reveal show={status === "extras"}>
                <p role="alert" className="mb-4 flex items-start gap-2 rounded-2xl bg-amber-400/15 px-4 py-3 text-sm font-medium text-amber-800 dark:text-amber-200">
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  {t("errExtras")}
                </p>
              </Reveal>
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {gear.map((e) => {
                  const x = extraText(e, locale);
                  const max = cap(e);
                  const left = freeOf(e);
                  const v = qty[e.id] ?? 0;
                  const counted = e.totalStock < 20;
                  const pct = counted ? Math.round((left / Math.max(1, e.totalStock)) * 100) : 100;
                  return (
                    <li
                      key={e.id}
                      className={`flex flex-col rounded-2xl p-4 transition-[background-color,box-shadow] duration-200 ${
                        v > 0 ? "bg-brand/[0.06] ring-2 ring-brand" : "bg-surface-muted ring-1 ring-transparent"
                      } ${left === 0 ? "opacity-60" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">{x.name}</p>
                          {x.note && <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">{x.note}</p>}
                        </div>
                        {e.maxQty > 1 ? (
                          <Stepper name={x.name} value={v} max={max} onChange={(q) => setQty((s) => ({ ...s, [e.id]: q }))} />
                        ) : (
                          <Toggle checked={v > 0} disabled={max === 0} label={x.name} onChange={(c) => setQty((s) => ({ ...s, [e.id]: c ? 1 : 0 }))} />
                        )}
                      </div>
                      <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                        <span className="text-[13px] font-semibold text-foreground">{unit(e)}</span>
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                            left === 0
                              ? "text-rose-600 dark:text-rose-300"
                              : counted && pct <= 34
                                ? "text-amber-700 dark:text-amber-300"
                                : "text-emerald-700 dark:text-emerald-300"
                          }`}
                        >
                          {counted && (
                            <span aria-hidden className="h-1.5 w-12 overflow-hidden rounded-full bg-foreground/10">
                              <span
                                className={`block h-full rounded-full transition-[width] duration-500 ${left === 0 ? "bg-rose-500" : pct <= 34 ? "bg-amber-500" : "bg-emerald-500"}`}
                                style={{ width: `${pct}%` }}
                              />
                            </span>
                          )}
                          {left === 0 ? t("stockNone") : counted ? t("stock", { free: left, total: e.totalStock }) : t("stockAlways")}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Step>
          )}

          <Step n={next()} title={t("noteTitle")}>
            <label htmlFor="co-note" className="sr-only">
              {t("noteTitle")}
            </label>
            <textarea
              id="co-note"
              rows={3}
              value={form.note}
              placeholder={t("notePh")}
              onChange={(e) => setField("note", e.target.value)}
              className="w-full resize-y rounded-xl border border-border bg-background px-3.5 py-3 text-base text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/60 focus:border-brand focus:ring-4 focus:ring-brand/15 sm:text-sm"
            />
          </Step>

          {upsell.length > 0 && (
            <section className="rounded-[22px] bg-surface-muted p-5 sm:p-6">
              <h2 className="font-display text-base font-semibold text-foreground sm:text-lg">{t("upsellTitle")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("upsellLead")}</p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {upsell.map(({ car: c, diff }) => (
                  <li key={c.id}>
                    <Link
                      href={bookingHref(c.slug, { pickupLocationId: pickup?.id, returnLocationId: ret?.id, pickupAt, returnAt })}
                      scroll={false}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-surface ring-1 ring-border transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-28px_rgba(11,18,32,0.45)]"
                    >
                      <div className="relative aspect-[16/9] overflow-hidden bg-surface-muted">
                        {c.images?.[0] && (
                          <Image
                            src={c.images[0]}
                            alt={c.title}
                            fill
                            sizes="(max-width: 640px) 90vw, 300px"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-4">
                        <p className="text-sm font-semibold text-foreground">{c.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {[pick(TRANSMISSION_LABELS[c.transmission], locale), pick(FUEL_LABELS[c.fuelType], locale), `${c.passengers} ${tf("cardSeats")}`].join(" · ")}
                        </p>
                        <p className="mt-3 text-sm font-semibold text-brand-strong">{t("upsellDiff", { amount: `⁦${price(diff)}⁩` })}</p>
                        <span className="mt-auto pt-3">
                          <span className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full text-sm font-semibold text-foreground ring-1 ring-border transition-colors group-hover:bg-foreground group-hover:text-background">
                            {t("upsellTake")}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section ref={payRef} className="rounded-[22px] bg-surface p-5 ring-1 ring-border sm:p-6">
            <div className="flex items-start gap-3 rounded-2xl bg-emerald-500/10 p-4">
              <Wallet className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-300" />
              <div>
                <p className="text-sm font-semibold text-foreground">{t("payTitle")}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{t("payBody")}</p>
              </div>
            </div>

            <Reveal show={status === "error"}>
              <p role="alert" className="mt-4 flex items-start gap-2 text-sm font-medium text-rose-600 dark:text-rose-300">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                {t("errGeneric")}
              </p>
            </Reveal>

            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
              <SubmitButton disabled={conflict} sending={status === "sending"} className="w-full sm:w-auto sm:flex-1">
                {t("submit")}
                <span className="text-white/60">·</span>
                <Amount value={total} />
              </SubmitButton>
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold text-foreground ring-1 ring-border transition-colors hover:bg-surface-muted"
              >
                <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
                {t("orWa")}
              </a>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              {t.rich("terms", {
                link: (c) => (
                  <Link href="/uvjeti-najma" className="font-medium text-foreground underline underline-offset-2">
                    {c}
                  </Link>
                ),
              })}
            </p>
          </section>
        </form>
      </div>

      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_30px_-20px_rgba(11,18,32,0.35)] backdrop-blur-md transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${
          barHidden ? "pointer-events-none translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {t("total")} · {t("daysCount", { days })}
            </p>
            <Amount value={total} className="font-display text-xl font-semibold text-foreground" />
          </div>
          <SubmitButton disabled={conflict} sending={status === "sending"} form="checkout" tabIndex={barHidden ? -1 : 0} className="px-6">
            {t("submitShort")}
            <ArrowRight className="h-4 w-4" />
          </SubmitButton>
        </div>
      </div>
    </div>
  );
}

function SubmitButton({
  disabled,
  sending,
  form,
  tabIndex,
  className = "",
  children,
}: {
  disabled: boolean;
  sending: boolean;
  form?: string;
  tabIndex?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const t = useTranslations("Booking");
  return (
    <button
      type="submit"
      form={form}
      tabIndex={tabIndex}
      disabled={disabled || sending}
      className={`group relative inline-flex h-12 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-brand px-6 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(227,6,19,0.9)] transition-[background-color,transform,opacity] hover:bg-brand-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ${className}`}
    >
      <span aria-hidden className="pointer-events-none absolute inset-y-0 -start-1/2 w-1/2 -skew-x-12 bg-white/20 opacity-0 transition-[transform,opacity] duration-700 group-hover:translate-x-[300%] group-hover:opacity-100" />
      {sending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("sending")}
        </>
      ) : (
        children
      )}
    </button>
  );
}

function StepBar({ steps, active, progress, center }: { steps: string[]; active: number; progress: number[]; center?: boolean }) {
  return (
    <ol className={`flex items-center gap-2 text-xs font-medium sm:gap-3 sm:text-sm ${center ? "mx-auto max-w-xl sm:justify-center" : ""}`}>
      {steps.map((s, i) => {
        const isDone = i < active;
        const isActive = i === active;
        return (
          <li key={s} className={`flex items-center gap-2 sm:gap-3 ${i > 0 ? "min-w-0 flex-1 sm:flex-none" : ""}`}>
            {i > 0 && (
              <span aria-hidden className="relative h-1 min-w-[16px] flex-1 overflow-hidden rounded-full bg-border sm:w-14 sm:flex-none">
                <span
                  className="absolute inset-y-0 start-0 rounded-full bg-brand transition-[width] duration-500 ease-out"
                  style={{ width: `${Math.round((progress[i - 1] ?? 0) * 100)}%` }}
                />
              </span>
            )}
            <span
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold transition-colors duration-300 ${
                isDone ? "bg-brand text-white" : isActive ? "bg-foreground text-background ring-4 ring-foreground/10" : "bg-surface-muted text-muted-foreground"
              }`}
            >
              {isDone ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
            </span>
            <span
              aria-current={isActive ? "step" : undefined}
              className={`truncate ${isActive ? "text-foreground" : "text-muted-foreground"} ${isActive ? "" : "hidden sm:inline"}`}
            >
              {s}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
