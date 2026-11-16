"use client";

import { useEffect, useRef } from "react";

const TYPE = "whitespace-nowrap text-center font-display text-[16.5vw] font-bold leading-[0.8] tracking-tighter lg:text-[16.5rem]";

const mask = (r: number) => {
  const m = `radial-gradient(${r}px circle at var(--x, -999px) var(--y, -999px), #000 0%, rgba(0,0,0,0.55) 45%, transparent 75%)`;
  return { maskImage: m, WebkitMaskImage: m };
};

export function FooterWordmark({ word = "MAXIMUM" }: { word?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    const fx = glow.current;
    if (!el || !fx) return;
    const p = { x: 0, y: 0, tx: 0, ty: 0 };
    let raf = 0;
    let fresh = true;

    const paint = () => {
      fx.style.setProperty("--x", `${p.x}px`);
      fx.style.setProperty("--y", `${p.y}px`);
    };

    const tick = () => {
      p.x += (p.tx - p.x) * 0.18;
      p.y += (p.ty - p.y) * 0.18;
      paint();
      raf = Math.abs(p.tx - p.x) + Math.abs(p.ty - p.y) > 0.4 ? requestAnimationFrame(tick) : 0;
    };

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      p.tx = e.clientX - r.left;
      p.ty = e.clientY - r.top;
      if (fresh) {
        p.x = p.tx;
        p.y = p.ty;
        fresh = false;
        paint();
      }
      fx.style.opacity = "1";
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const leave = () => {
      fx.style.opacity = "0";
      fresh = true;
    };

    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div aria-hidden className="relative mt-10 select-none overflow-hidden sm:mt-12">
      <div ref={wrap} className="relative translate-y-[18%]">
        <p className={`${TYPE} text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.09)]`}>{word}</p>
        <div ref={glow} className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500">
          <p className={`${TYPE} absolute inset-0 text-brand/40`} style={mask(200)}>
            {word}
          </p>
          <p
            className={`${TYPE} absolute inset-0 text-transparent [-webkit-text-stroke:1.5px_#FB5860] [filter:drop-shadow(0_0_14px_rgba(227,6,19,0.75))]`}
            style={mask(280)}
          >
            {word}
          </p>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink to-transparent" />
    </div>
  );
}
