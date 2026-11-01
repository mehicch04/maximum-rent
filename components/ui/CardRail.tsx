"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";

export function CardRail({
  items,
  cols = "sm:grid-cols-2 lg:grid-cols-3",
  bleed = "-mx-4 px-4",
  className = "",
  label,
}: {
  items: { key: string; node: ReactNode }[];
  cols?: string;
  bleed?: string;
  className?: string;
  label?: (i: number) => string;
}) {
  const ref = useRef<HTMLUListElement>(null);
  const [at, setAt] = useState(0);

  const step = () => {
    const el = ref.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return 0;
    return first.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0");
  };

  const raf = useRef(0);
  const onScroll = () => {
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      const el = ref.current;
      const w = step();
      if (el && w) setAt(Math.min(items.length - 1, Math.round(el.scrollLeft / w)));
    });
  };

  const go = (i: number) => {
    ref.current?.scrollTo({ left: i * step(), behavior: "smooth" });
  };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <ul
        ref={ref}
        onScroll={onScroll}
        className={`no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 sm:mx-0 sm:grid sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 ${bleed} ${cols}`}
      >
        {items.map((it) => (
          <li key={it.key} className="w-[86%] shrink-0 snap-center [transform:translateZ(0)] sm:w-auto sm:[transform:none]">
            {it.node}
          </li>
        ))}
      </ul>
      {items.length > 1 && (
        <div className="mt-4 flex justify-center gap-1.5 sm:hidden">
          {items.map((it, i) => (
            <button
              key={it.key}
              type="button"
              onClick={() => go(i)}
              aria-label={label ? label(i) : String(i + 1)}
              aria-current={i === at ? "true" : undefined}
              className="grid h-6 min-w-[24px] place-items-center px-0.5"
            >
              <span className={`block h-1.5 rounded-full transition-all duration-300 ${i === at ? "w-6 bg-brand" : "w-1.5 bg-foreground/25"}`} />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
