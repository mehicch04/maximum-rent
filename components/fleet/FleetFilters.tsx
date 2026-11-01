"use client";

import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/booking/ui";
import { PriceRange, type RangeModel } from "./PriceRange";

export type Facet = "price" | "cat" | "gear" | "fuel" | "seats" | "brand";
export type Selection = Record<Facet, string[]>;
export type Option = { value: string; label: string; count: number; icon?: ComponentType<{ className?: string }> };
export type Group = { id: Facet; title: string; options: Option[]; kind: "check" | "list" | "range"; range?: RangeModel };

export const EMPTY: Selection = { price: [], cat: [], gear: [], fuel: [], seats: [], brand: [] };

const usable = (groups: Group[], selection: Selection) =>
  groups.filter((g) => (g.range ? g.range.max > g.range.min : g.options.length > 1) || selection[g.id].length > 0);

const picked = (g: Group, selected: string[]) => (g.kind === "range" ? Math.min(1, selected.length) : selected.length);

function Body({ group, selected, onToggle }: { group: Group; selected: string[]; onToggle: (v: string) => void }) {
  return group.range ? <PriceRange {...group.range} /> : <OptionList group={group} selected={selected} onToggle={onToggle} />;
}

function Box({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={`grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] border transition-colors duration-200 ${
        on ? "border-brand bg-brand text-white" : "border-foreground/30 bg-surface group-hover/o:border-foreground/50"
      }`}
    >
      <Check className={`h-3 w-3 transition-transform duration-200 ${on ? "scale-100" : "scale-0"}`} strokeWidth={3.5} />
    </span>
  );
}

function OptionList({ group, selected, onToggle }: { group: Group; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <ul className={group.kind === "list" ? "-mx-2 space-y-0.5" : "space-y-1"}>
      {group.options.map((o) => {
        const on = selected.includes(o.value);
        const off = !on && o.count === 0;
        const Icon = o.icon;
        return (
          <li key={o.value}>
            {group.kind === "list" ? (
              <button
                type="button"
                onClick={() => onToggle(o.value)}
                disabled={off}
                aria-pressed={on}
                className={`group/o flex w-full items-center gap-3 rounded-xl px-2 py-2 text-start text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  on ? "bg-brand/10 font-semibold text-foreground" : "text-foreground/80 hover:bg-surface-muted"
                }`}
              >
                {Icon && (
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors ${on ? "bg-brand text-white" : "bg-surface-muted text-foreground/70"}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                )}
                <span className="min-w-0 flex-1 truncate">{o.label}</span>
                <span className="text-xs tabular-nums text-muted-foreground">{o.count}</span>
                <span
                  aria-hidden
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-full transition-all duration-200 ${
                    on ? "scale-100 bg-brand text-white" : "scale-75 opacity-0"
                  }`}
                >
                  <Check className="h-3 w-3" strokeWidth={3.5} />
                </span>
              </button>
            ) : (
              <label className={`group/o flex items-center gap-3 rounded-lg py-1.5 text-sm ${off ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}>
                <input type="checkbox" checked={on} disabled={off} onChange={() => onToggle(o.value)} className="peer sr-only" />
                <Box on={on} />
                <span className={`min-w-0 flex-1 truncate peer-focus-visible:underline ${on ? "font-semibold text-foreground" : "text-foreground/80"}`}>{o.label}</span>
                <span className="text-xs tabular-nums text-muted-foreground">{o.count}</span>
              </label>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function GroupBlock({
  group,
  selected,
  onToggle,
  defaultOpen,
}: {
  group: Group;
  selected: string[];
  onToggle: (v: string) => void;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border py-1 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 py-3.5 text-start"
      >
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-foreground">
          {group.title}
          {picked(group, selected) > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[10px] font-semibold text-white">{picked(group, selected)}</span>
          )}
        </span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <Reveal show={open}>
        <div className="pb-3">
          <Body group={group} selected={selected} onToggle={onToggle} />
        </div>
      </Reveal>
    </div>
  );
}

export function FilterPanel({
  groups,
  selection,
  onToggle,
  onClear,
  headingId,
  closeSpace,
  bare,
}: {
  closeSpace?: boolean;
  bare?: boolean;
  groups: Group[];
  selection: Selection;
  onToggle: (f: Facet, v: string) => void;
  onClear: () => void;
  headingId?: string;
}) {
  const t = useTranslations("Fleet");
  const active = Object.values(selection).some((v) => v.length > 0);
  return (
    <div>
      {!bare && <div className={`flex items-center justify-between gap-3 border-b border-border pb-4 ${closeSpace ? "pe-12" : ""}`}>
        <h2 id={headingId} className="font-display text-xl font-semibold tracking-tight text-foreground">
          {t("filters")}
        </h2>
        <button
          type="button"
          onClick={onClear}
          disabled={!active}
          className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          {t("clearAll")}
        </button>
      </div>}
      {usable(groups, selection).map((g, i) => (
        <GroupBlock key={g.id} group={g} selected={selection[g.id]} onToggle={(v) => onToggle(g.id, v)} defaultOpen={i < 3 || selection[g.id].length > 0} />
      ))}
    </div>
  );
}

const POP_W = 288;

export function FilterBar({
  groups,
  selection,
  onToggle,
  onReset,
  total,
  end,
}: {
  groups: Group[];
  selection: Selection;
  onToggle: (f: Facet, v: string) => void;
  onReset: (f: Facet) => void;
  total: number;
  end?: ReactNode;
}) {
  const t = useTranslations("Fleet");
  const root = useRef<HTMLDivElement>(null);
  const pills = useRef<Partial<Record<Facet, HTMLButtonElement | null>>>({});
  const [open, setOpen] = useState<Facet | null>(null);
  const [pos, setPos] = useState(0);
  const list = usable(groups, selection);
  const group = list.find((g) => g.id === open);

  const show = (f: Facet) => {
    if (open === f) return setOpen(null);
    const box = root.current?.getBoundingClientRect();
    const pill = pills.current[f]?.getBoundingClientRect();
    if (box && pill) {
      const rtl = getComputedStyle(root.current!).direction === "rtl";
      const start = rtl ? box.right - pill.right : pill.left - box.left;
      setPos(Math.max(0, Math.min(start, box.width - POP_W)));
    }
    setOpen(f);
  };

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(null);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      pills.current[open]?.focus();
      setOpen(null);
    };
    document.addEventListener("pointerdown", away);
    window.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      window.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <div className="flex items-center gap-1.5 rounded-full bg-surface/85 p-1.5 shadow-[0_18px_44px_-30px_rgba(11,18,32,0.55)] ring-1 ring-border backdrop-blur-xl backdrop-saturate-150">
        <div onScroll={() => setOpen(null)} className="no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {list.map((g) => {
            const n = picked(g, selection[g.id]);
            const isOpen = open === g.id;
            return (
              <button
                key={g.id}
                ref={(el) => {
                  pills.current[g.id] = el;
                }}
                type="button"
                onClick={() => show(g.id)}
                aria-expanded={isOpen}
                aria-controls={isOpen ? "fleet-filter-pop" : undefined}
                className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full ps-4 pe-3 text-[13px] font-medium transition-colors duration-200 ${
                  n > 0 ? "bg-foreground text-background" : isOpen ? "bg-surface-muted text-foreground" : "text-foreground/75 hover:bg-surface-muted hover:text-foreground"
                }`}
              >
                {g.title}
                {n > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[10px] font-semibold text-white">{n}</span>}
                <ChevronDown className={`h-3.5 w-3.5 opacity-70 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
              </button>
            );
          })}
        </div>
        {end}
      </div>

      <AnimatePresence>
        {group && (
          <motion.div
            key={group.id}
            id="fleet-filter-pop"
            role="dialog"
            aria-label={group.title}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ insetInlineStart: pos, width: POP_W }}
            className="absolute top-full z-40 mt-2 origin-top rounded-[22px] bg-surface p-4 shadow-[0_30px_60px_-28px_rgba(11,18,32,0.55)] ring-1 ring-border"
          >
            <p className="pb-3 text-xs font-semibold uppercase tracking-[0.08em] text-foreground">{group.title}</p>
            <div className="no-scrollbar -mx-2 max-h-[min(50vh,360px)] overflow-y-auto px-2">
              <Body group={group} selected={selection[group.id]} onToggle={(v) => onToggle(group.id, v)} />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
              <button
                type="button"
                onClick={() => onReset(group.id)}
                disabled={selection[group.id].length === 0}
                className="text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              >
                {t("reset")}
              </button>
              <button
                type="button"
                onClick={() => setOpen(null)}
                className="inline-flex h-9 items-center whitespace-nowrap rounded-full bg-brand px-4 text-xs font-semibold text-white transition-colors hover:bg-brand-700"
              >
                {t("showN", { count: total })}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
