"use client";

import { useEffect, useRef, type CSSProperties } from "react";

const COLORS = ["#FFC7C9", "#FF9DA1", "#F7B4B8", "#D4142A", "#FFE0E1"];

const P = [
  { x: 3, d: 15, o: 2, w: 3.2, s: 1, c: 0 },
  { x: 11, d: 19, o: 9, w: 4.1, s: 0.8, c: 3 },
  { x: 19, d: 17, o: 5, w: 3.6, s: 1.15, c: 1 },
  { x: 27, d: 21, o: 14, w: 4.4, s: 0.75, c: 4 },
  { x: 36, d: 16, o: 11, w: 3.4, s: 0.95, c: 2 },
  { x: 44, d: 20, o: 3, w: 3.9, s: 0.85, c: 3 },
  { x: 52, d: 18, o: 16, w: 3.1, s: 1.1, c: 0 },
  { x: 61, d: 22, o: 7, w: 4.6, s: 0.7, c: 1 },
  { x: 69, d: 16, o: 13, w: 3.5, s: 1, c: 4 },
  { x: 77, d: 19, o: 1, w: 4, s: 0.9, c: 3 },
  { x: 85, d: 17, o: 10, w: 3.3, s: 1.2, c: 2 },
  { x: 93, d: 21, o: 6, w: 4.2, s: 0.8, c: 0 },
];

export function Petals({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const set = () => el.style.setProperty("--fall", `${el.offsetHeight + 80}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => el.toggleAttribute("data-run", e.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className={`petals pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {P.map((p, i) => (
        <span
          key={i}
          className={`petal ${i % 2 ? "max-sm:hidden" : ""}`}
          style={{ left: `${p.x}%`, animationDuration: `${p.d}s`, animationDelay: `-${p.o}s`, "--s": p.s } as CSSProperties}
        >
          <span style={{ animationDuration: `${p.w}s` }}>
            <svg viewBox="0 0 20 24" className="h-full w-full">
              <path
                d="M10 23C3.5 18 1.5 11 4 5.5 6 1.5 9 2 10 4.5 11 2 14 1.5 16 5.5 18.5 11 16.5 18 10 23Z"
                fill={COLORS[p.c]}
                fillOpacity={p.c === 3 ? 0.55 : 0.9}
              />
              <path d="M10 6v14" stroke="#fff" strokeOpacity="0.35" strokeWidth="0.8" />
            </svg>
          </span>
        </span>
      ))}
    </div>
  );
}
