"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, CalendarDays, Clock, ArrowRight, AlertCircle, ChevronDown } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { DateField } from "@/components/ui/DateField";
import { useReturnAfterPickup } from "@/hooks/useReturnAfterPickup";

type SimpleLocation = { id: string; name: string; city: string };

const pad = (n: number) => String(n).padStart(2, "0");

/** Local `YYYY-MM-DD`. */
function dateOffset(days = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// 24-hour, 30-minute slots: 00:00 → 23:30. Always 24h, no AM/PM, all browsers.
const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => `${pad(Math.floor(i / 2))}:${i % 2 ? "30" : "00"}`);

const CONTROL =
  "h-12 w-full min-w-0 rounded-xl border border-border bg-background px-3.5 text-base text-foreground outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-ring/30 sm:text-sm";
const DATE_CONTROL = `${CONTROL} flex-1`;
const LBL =
  "mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground";

/** Select with a custom, always-aligned chevron (consistent across browsers). */
function StyledSelect({
  id,
  value,
  onChange,
  children,
  ariaLabel,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className={`${CONTROL} appearance-none pr-10`}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}


export function ReservationSearchForm({ locations }: { locations: SimpleLocation[] }) {
  const t = useTranslations("Search");
  const locale = useLocale();
  const router = useRouter();

  const [sameLocation, setSameLocation] = useState(true);
  const [pickupLocationId, setPickupLocationId] = useState("");
  const [returnLocationId, setReturnLocationId] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("09:00");
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("09:00");
  const [today, setToday] = useState("");
  const [error, setError] = useState<string | null>(null);

  useReturnAfterPickup(pickupDate, returnDate, setReturnDate);

  // Default dates and the min date are relative to the visitor's LOCAL calendar
  // day, which only the browser knows. Compute them after mount so the
  // server-rendered HTML (UTC clock) matches the first client render — otherwise
  // the differing <input> values cause a hydration mismatch (React #418/#423/#425
  // logged to the console, which drops the PageSpeed "Best Practices" score).
  useEffect(() => {
    setToday(dateOffset(0));
    setPickupDate((v) => v || dateOffset(1));
    setReturnDate((v) => v || dateOffset(3));
  }, []);

  const effectiveReturnId = sameLocation ? pickupLocationId : returnLocationId;

  function handleSubmit() {
    setError(null);
    if (!pickupLocationId || !effectiveReturnId) {
      setError(t("errRequired"));
      return;
    }
    const start = new Date(`${pickupDate}T${pickupTime}`);
    const end = new Date(`${returnDate}T${returnTime}`);
    if (end <= start) {
      setError(t("errOrder"));
      return;
    }
    const params = new URLSearchParams({
      pickupLocationId,
      returnLocationId: effectiveReturnId,
      pickupAt: start.toISOString(),
      returnAt: end.toISOString(),
    });
    router.push(`/vozila?${params.toString()}`);
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="w-full rounded-2xl border border-border bg-surface/95 p-5 shadow-card backdrop-blur-md sm:p-6"
    >
      <div className="grid gap-4">
        {/* Locations row */}
        <div className={`grid grid-cols-1 gap-4 ${sameLocation ? "" : "sm:grid-cols-2"}`}>
          <div>
            <label htmlFor="pickup-loc" className={LBL}>
              <MapPin className="h-3.5 w-3.5 text-brand" />
              {t("pickupLocation")}
            </label>
            <StyledSelect id="pickup-loc" value={pickupLocationId} onChange={setPickupLocationId}>
              <option value="" disabled>
                {t("placeholder")}
              </option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </StyledSelect>
          </div>

          <AnimatePresence initial={false}>
            {!sameLocation && (
              <motion.div
                key="return-loc"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                <label htmlFor="return-loc" className={LBL}>
                  <MapPin className="h-3.5 w-3.5 text-brand" />
                  {t("returnLocation")}
                </label>
                <StyledSelect id="return-loc" value={returnLocationId} onChange={setReturnLocationId}>
                  <option value="" disabled>
                    {t("placeholder")}
                  </option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </StyledSelect>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dates row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Pickup */}
          <div>
            <label htmlFor="pickup-date" className={LBL}>
              <CalendarDays className="h-3.5 w-3.5 text-brand" />
              {t("pickupDate")}
            </label>
            <div className="flex gap-2">
              <DateField
                value={pickupDate}
                min={today}
                locale={locale}
                // The return date is kept valid by useReturnAfterPickup, which
                // also preserves how many days the visitor wanted the car.
                // Setting it to the pickup day here would briefly make the
                // rental zero days long and anchor the return calendar on the
                // wrong month.
                onChange={setPickupDate}
                className={DATE_CONTROL}
              />
              <div className="w-28 shrink-0">
                <StyledSelect value={pickupTime} onChange={setPickupTime} ariaLabel={`${t("pickupDate")} – ${t("time")}`}>
                  {TIME_SLOTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </StyledSelect>
              </div>
            </div>
          </div>

          {/* Return */}
          <div>
            <label htmlFor="return-date" className={LBL}>
              <Clock className="h-3.5 w-3.5 text-brand" />
              {t("returnDate")}
            </label>
            <div className="flex gap-2">
              <DateField
                value={returnDate}
                min={pickupDate}
                locale={locale}
                onChange={setReturnDate}
                className={DATE_CONTROL}
              />
              <div className="w-28 shrink-0">
                <StyledSelect value={returnTime} onChange={setReturnTime} ariaLabel={`${t("returnDate")} – ${t("time")}`}>
                  {TIME_SLOTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </StyledSelect>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: same-location toggle + submit */}
      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={sameLocation}
            onChange={(e) => setSameLocation(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-brand"
          />
          {t("sameLocation")}
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                role="alert"
                className="flex items-center gap-1.5 text-sm font-medium text-brand-strong"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-semibold text-brand-foreground shadow-brand transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto"
          >
            {t("search")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </motion.form>
  );
}
