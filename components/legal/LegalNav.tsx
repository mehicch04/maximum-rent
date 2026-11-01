"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";

type Item = { id: string; n: number; topic: string };

function useActive(items: Item[], container: string) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const progress = useRef<HTMLSpanElement>(null);
  const key = items.map((i) => i.id).join();

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => !!e);
    let raf = 0;
    const paint = () => {
      raf = 0;
      const box = document.getElementById(container);
      if (box && progress.current) {
        const r = box.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (innerHeight * 0.35 - r.top) / Math.max(1, r.height - innerHeight * 0.4)));
        progress.current.style.transform = `scaleX(${p})`;
      }
      if (!els.length) return;
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) {
        setActive(els[els.length - 1].id);
        return;
      }
      const line = Math.max(170, innerHeight * 0.3);
      let cur = els[0].id;
      for (const el of els) if (el.getBoundingClientRect().top <= line) cur = el.id;
      setActive(cur);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    paint();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, [key, container]);

  return { active, progress };
}

function jump(e: MouseEvent<HTMLAnchorElement>, id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  e.preventDefault();
  el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
}

const nn = (n: number) => String(n).padStart(2, "0");

export function LegalBar({ items, container }: { items: Item[]; container: string }) {
  const { active, progress } = useActive(items, container);
  const rail = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = rail.current;
    const chip = box?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (!box || !chip) return;
    const b = box.getBoundingClientRect();
    const c = chip.getBoundingClientRect();
    box.scrollBy({ left: c.left + c.width / 2 - (b.left + b.width / 2), behavior: "smooth" });
  }, [active]);

  return (
    <div className="sticky top-[68px] z-30 -mx-4 mb-5 border-b border-border bg-background/90 backdrop-blur-md sm:-mx-6 lg:hidden">
      <div ref={rail} className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-2.5 sm:px-6">
        {items.map((i) => {
          const on = i.id === active;
          return (
            <a
              key={i.id}
              href={`#${i.id}`}
              data-id={i.id}
              onClick={(e) => jump(e, i.id)}
              aria-current={on || undefined}
              className={`inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-sm ring-1 transition-colors duration-300 ${
                on ? "bg-ink text-white ring-ink dark:bg-white dark:text-ink dark:ring-white" : "bg-surface text-foreground/80 ring-border"
              }`}
            >
              <span className={`font-display text-xs font-semibold tabular-nums ${on ? "text-brand-300 dark:text-brand-strong" : "text-brand-strong"}`}>{nn(i.n)}</span>
              {i.topic}
            </a>
          );
        })}
      </div>
      <span className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden">
        <span ref={progress} className="block h-full origin-left bg-brand-gradient will-change-transform" style={{ transform: "scaleX(0)" }} />
      </span>
    </div>
  );
}

export function LegalList({ items, container, label }: { items: Item[]; container: string; label: string }) {
  const { active, progress } = useActive(items, container);
  const idx = Math.max(0, items.findIndex((i) => i.id === active));

  return (
    <nav aria-label={label}>
      <p className="flex items-center justify-between px-3 text-sm font-semibold text-foreground">
        {label}
        <span className="text-xs font-medium tabular-nums text-muted-foreground">
          {nn(idx + 1)} / {nn(items.length)}
        </span>
      </p>
      <span className="mx-3 mt-3 block h-1 overflow-hidden rounded-full bg-border">
        <span ref={progress} className="block h-full origin-left rounded-full bg-brand-gradient will-change-transform" style={{ transform: "scaleX(0)" }} />
      </span>
      <ol className="mt-3 space-y-0.5">
        {items.map((i) => {
          const on = i.id === active;
          return (
            <li key={i.id}>
              <a
                href={`#${i.id}`}
                onClick={(e) => jump(e, i.id)}
                aria-current={on || undefined}
                className={`relative flex gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors duration-300 ${
                  on ? "bg-brand/10 font-medium text-foreground" : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                }`}
              >
                <span className={`absolute inset-y-2 left-0 w-0.5 rounded-full bg-brand transition-opacity duration-300 ${on ? "opacity-100" : "opacity-0"}`} />
                <span className="font-display font-semibold tabular-nums text-brand-strong">{nn(i.n)}</span>
                {i.topic}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
