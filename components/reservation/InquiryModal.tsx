"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Loader2, Send, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import type { CarListItem, SearchContext } from "@/lib/types";
import { buildWhatsAppUrl, type InquiryContext } from "@/lib/whatsapp";
import { DateField } from "@/components/ui/DateField";
import { ExtrasPicker, type ExtraSelection } from "./ExtrasPicker";
import { PriceBreakdown } from "./PriceBreakdown";
import { rentalDays } from "@/lib/extras";
import { useCurrency } from "@/components/currency/CurrencyProvider";
import type { ExtraItem } from "@/lib/extras";
import type { Booked } from "@/lib/extras-availability";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

type Props = {
  car: CarListItem | null;
  search?: SearchContext;
  locations?: { id: string; name: string }[];
  /** Optional equipment the owner offers (empty list hides the section). */
  extras?: ExtraItem[];
  bookedExtras?: Booked[];
  onClose: () => void;
};

// 24-hour, 30-minute slots (00:00 → 23:30). A native <select> keeps a
// predictable width on every browser, unlike iOS <input type="time">.
const pad = (n: number) => String(n).padStart(2, "0");
const TIME_SLOTS = Array.from(
  { length: 48 },
  (_, i) => `${pad(Math.floor(i / 2))}:${i % 2 ? "30" : "00"}`,
);

function splitISO(iso?: string | null, fallbackOffsetDays = 1) {
  const d = iso ? new Date(iso) : new Date(Date.now() + fallbackOffsetDays * 86_400_000);
  const date = d.toISOString().slice(0, 10);
  const time = d.toTimeString().slice(0, 5);
  return { date, time };
}

// Snap any "HH:MM" to the nearest valid 30-minute slot so it matches a
// dropdown option (00:00 → 23:30).
function snapTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const total = Math.min(Math.round((h * 60 + m) / 30) * 30, 23 * 60 + 30);
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

export function InquiryModal({
  car,
  search,
  locations = [],
  extras = [],
  bookedExtras = [],
  onClose,
}: Props) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("Inquiry");

  const initPickup = useMemo(() => splitISO(search?.pickupAt, 1), [search?.pickupAt]);
  const initReturn = useMemo(() => splitISO(search?.returnAt, 3), [search?.returnAt]);

  const [pickupDate, setPickupDate] = useState(initPickup.date);
  const [pickupTime, setPickupTime] = useState(snapTime(initPickup.time));
  const [returnDate, setReturnDate] = useState(initReturn.date);
  const [returnTime, setReturnTime] = useState(snapTime(initReturn.time));
  const [pickupLoc, setPickupLoc] = useState(search?.pickupLocationId ?? "");
  const [returnLoc, setReturnLoc] = useState(search?.returnLocationId ?? "");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [message, setMessage] = useState("");
  const [chosenExtras, setChosenExtras] = useState<ExtraSelection>({});
  const { currency } = useCurrency();

  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Reset form whenever a new car is selected
  useEffect(() => {
    if (car) {
      setStatus("idle");
      setErrorMsg("");
      setPickupDate(initPickup.date);
      setPickupTime(initPickup.time);
      setReturnDate(initReturn.date);
      setReturnTime(initReturn.time);
      setPickupLoc(search?.pickupLocationId ?? "");
      setReturnLoc(search?.returnLocationId ?? "");
    }
  }, [car, initPickup, initReturn, search?.pickupLocationId, search?.returnLocationId]);

  // Lock body scroll while open + close on Escape
  useEffect(() => {
    if (!car) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [car, onClose]);

  if (!car) return null;

  const days = rentalDays(
    new Date(`${pickupDate}T${pickupTime}`),
    new Date(`${returnDate}T${returnTime}`),
  );

  const pickupISO = new Date(`${pickupDate}T${pickupTime}`).toISOString();
  const returnISO = new Date(`${returnDate}T${returnTime}`).toISOString();

  // Effective locations: explicit choice in the modal, else search context.
  const effPickupId = pickupLoc || search?.pickupLocationId || "";
  const effReturnId = returnLoc || effPickupId;
  const locName = (id: string) => locations.find((l) => l.id === id)?.name;

  const inquiryCtx: InquiryContext = {
    car: { title: car.title },
    pickupLocation: effPickupId
      ? { name: locName(effPickupId) ?? search?.pickupLocation?.name ?? "" }
      : search?.pickupLocation,
    returnLocation: effReturnId
      ? { name: locName(effReturnId) ?? search?.returnLocation?.name ?? "" }
      : search?.returnLocation,
    pickupAt: pickupISO,
    returnAt: returnISO,
    locale,
  };
  const whatsappUrl = buildWhatsAppUrl(inquiryCtx);

  async function handleSubmit() {
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carId: car!.id,
          carTitle: car!.title,
          pickupLocationId: effPickupId || undefined,
          returnLocationId: effReturnId || undefined,
          pickupAt: pickupISO,
          returnAt: returnISO,
          firstName,
          lastName,
          email,
          phone,
          flightNumber,
          message,
          locale,
          currency,
          extras: Object.entries(chosenExtras).map(([id, qty]) => ({ id, qty })),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg(t("errGeneric"));
    }
  }

  // text-base (16px) on mobile prevents iOS Safari from auto-zooming into
  // focused fields; sm:text-sm restores the compact look on larger screens.
  const input =
    "h-11 w-full min-w-0 rounded-xl border border-border bg-background px-3 text-base outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-ring/30 sm:text-sm";
  const lbl = "mb-1 block text-xs font-medium text-muted-foreground";

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      >
        <motion.div
          key="panel"
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.98 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border bg-surface p-6 shadow-card-hover sm:rounded-2xl"
        >
          <button
            type="button"
            aria-label={t("close")}
            onClick={onClose}
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>

          {status === "success" ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
                <Check className="h-7 w-7" />
              </div>
              <h3 className="font-display text-xl font-semibold">{t("success")}</h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">{t("successBody")}</p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-brand-foreground hover:bg-brand-700"
              >
                {t("close")}
              </button>
            </div>
          ) : (
            <>
              <h3 className="pr-8 font-display text-xl font-semibold tracking-tight">
                {t("title")}
              </h3>
              <p className="mt-1 text-sm font-medium text-brand-strong">{car.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="mt-5 space-y-4"
              >
                {/* Locations */}
                {locations.length > 0 && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className={lbl}>{t("pickupLocation")}</label>
                      <div className="relative">
                        <select
                          value={pickupLoc}
                          onChange={(e) => setPickupLoc(e.target.value)}
                          aria-label={t("pickupLocation")}
                          className={`${input} appearance-none pr-8 ${pickupLoc ? "" : "text-muted-foreground"}`}
                          required
                        >
                          <option value="" disabled>
                            {t("selectLocation")}
                          </option>
                          {locations.map((l) => (
                            <option key={l.id} value={l.id}>
                              {l.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </div>
                    <div>
                      <label className={lbl}>{t("returnLocation")}</label>
                      <div className="relative">
                        <select
                          value={returnLoc}
                          onChange={(e) => setReturnLoc(e.target.value)}
                          aria-label={t("returnLocation")}
                          className={`${input} appearance-none pr-8`}
                        >
                          <option value="">{t("sameAsPickup")}</option>
                          {locations.map((l) => (
                            <option key={l.id} value={l.id}>
                              {l.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className={lbl}>{t("summaryPickup")}</label>
                    <div className="grid grid-cols-[minmax(0,1fr)_6.75rem] gap-2">
                      <DateField
                        value={pickupDate}
                        min={splitISO(undefined, 0).date}
                        locale={locale}
                        onChange={setPickupDate}
                        className={input}
                      />
                      <div className="relative">
                        <select
                          value={pickupTime}
                          onChange={(e) => setPickupTime(e.target.value)}
                          aria-label={t("summaryPickup")}
                          className={`${input} w-full appearance-none pr-8`}
                          required
                        >
                          {TIME_SLOTS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>{t("summaryReturn")}</label>
                    <div className="grid grid-cols-[minmax(0,1fr)_6.75rem] gap-2">
                      <DateField
                        value={returnDate}
                        min={pickupDate}
                        locale={locale}
                        onChange={setReturnDate}
                        className={input}
                      />
                      <div className="relative">
                        <select
                          value={returnTime}
                          onChange={(e) => setReturnTime(e.target.value)}
                          aria-label={t("summaryReturn")}
                          className={`${input} w-full appearance-none pr-8`}
                          required
                        >
                          {TIME_SLOTS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>{t("firstName")}</label>
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={input}
                      required
                      minLength={2}
                    />
                  </div>
                  <div>
                    <label className={lbl}>{t("lastName")}</label>
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={input}
                      required
                      minLength={2}
                    />
                  </div>
                </div>

                {/* Contact */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>{t("email")}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={input}
                      required
                    />
                  </div>
                  <div>
                    <label className={lbl}>{t("phone")}</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={input}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={lbl}>{t("flight")}</label>
                  <input
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    className={input}
                  />
                </div>

                <ExtrasPicker
                  extras={extras}
                  value={chosenExtras}
                  onChange={setChosenExtras}
                  pickupAt={new Date(`${pickupDate}T${pickupTime}`)}
                  returnAt={new Date(`${returnDate}T${returnTime}`)}
                  booked={bookedExtras}
                />

                <PriceBreakdown
                  pricePerDay={car.pricePerDay}
                  days={days}
                  extras={extras}
                  selection={chosenExtras}
                />

                <div>
                  <label className={lbl}>{t("message")}</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className={`${input} h-auto py-2`}
                  />
                </div>

                {status === "error" && (
                  <p className="text-sm font-medium text-brand-strong">{errorMsg}</p>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground shadow-brand transition-colors hover:bg-brand-700 disabled:opacity-70"
                  >
                    {status === "sending" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("sending")}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        {t("send")}
                      </>
                    )}
                  </button>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-muted px-5 py-3 text-sm font-semibold transition-colors hover:border-brand hover:text-brand"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    {t("whatsapp")}
                  </a>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
