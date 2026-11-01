"use client";

import { useRef, type ReactNode, type Ref } from "react";
import { ChevronDown, MapPin, Repeat2 } from "lucide-react";
import { useTranslations } from "next-intl";

export const CONTROL =
  "h-11 w-full min-w-0 rounded-xl border border-border bg-background px-3 text-base text-foreground outline-none transition-[border-color,box-shadow] focus:border-brand focus:ring-2 focus:ring-ring/30 sm:text-sm";

export const LABEL = "mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground";

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

export function Select({
  id,
  value,
  onChange,
  children,
  ariaLabel,
  disabled,
  selectRef,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
  ariaLabel?: string;
  disabled?: boolean;
  selectRef?: Ref<HTMLSelectElement>;
}) {
  return (
    <div className="relative">
      <select
        ref={selectRef}
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className={`${CONTROL} appearance-none pe-10`}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

export function ReturnField({
  id,
  label,
  diff,
  onDiff,
  value,
  onChange,
  pickupName,
  children,
}: {
  id: string;
  label: string;
  diff: boolean;
  onDiff: (v: boolean) => void;
  value: string;
  onChange: (v: string) => void;
  pickupName?: string;
  children: ReactNode;
}) {
  const t = useTranslations("Search");
  const ref = useRef<HTMLSelectElement>(null);

  return (
    <div>
      <label htmlFor={id} className={LABEL}>
        <MapPin className="h-3.5 w-3.5 text-brand-strong" />
        {label}
      </label>
      <div className="relative">
        <div aria-hidden={!diff} className={`transition-[opacity,transform] duration-300 ${EASE} ${diff ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0"}`}>
          <Select id={id} value={value} onChange={onChange} disabled={!diff} selectRef={ref}>
            {children}
          </Select>
        </div>
        <button
          type="button"
          tabIndex={diff ? -1 : 0}
          aria-hidden={diff}
          onClick={() => {
            onDiff(true);
            requestAnimationFrame(() => ref.current?.focus());
          }}
          className={`group absolute inset-0 flex items-center gap-2.5 rounded-xl border border-dashed border-border bg-surface-muted px-3 text-start text-sm transition-[opacity,transform,border-color] duration-300 ${EASE} hover:border-brand/60 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 ${
            diff ? "pointer-events-none -translate-y-1 opacity-0" : "translate-y-0 opacity-100"
          }`}
        >
          <Repeat2 className="h-4 w-4 shrink-0 text-brand-strong" />
          <span className="min-w-0 truncate text-muted-foreground">
            {t("sameAsPickup")}
            {pickupName && <span className="text-foreground">{` · ${pickupName}`}</span>}
          </span>
          <span className="ms-auto shrink-0 text-xs font-medium text-brand-strong underline-offset-4 group-hover:underline">{t("change")}</span>
        </button>
      </div>
      <label className="mt-3 inline-flex cursor-pointer select-none items-center gap-3 text-[13px] text-foreground/80">
        <input type="checkbox" checked={!diff} onChange={(e) => onDiff(!e.target.checked)} className="peer sr-only" />
        <span
          aria-hidden
          className={`relative h-6 w-11 shrink-0 rounded-full bg-foreground/15 transition-colors duration-300 after:absolute after:start-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.22,1,0.36,1)] peer-checked:bg-brand peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface`}
        />
        {t("sameLocation")}
      </label>
    </div>
  );
}
