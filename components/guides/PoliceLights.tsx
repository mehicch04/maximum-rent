"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

export function PoliceLights() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [run, setRun] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setRun((r) => r + 1), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  const anim = (name: string) => (run && !reduce ? { animation: `${name} 0.9s linear 4 forwards` } : undefined);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <span
        key={`r${run}`}
        className="absolute -top-56 left-[-10%] h-[520px] w-[640px] rounded-full bg-[radial-gradient(closest-side,rgba(255,59,48,0.42),transparent)] opacity-[0.12]"
        style={anim("siren-red")}
      />
      <span
        key={`b${run}`}
        className="absolute -top-56 right-[-10%] h-[520px] w-[640px] rounded-full bg-[radial-gradient(closest-side,rgba(47,123,255,0.5),transparent)] opacity-[0.12]"
        style={anim("siren-blue")}
      />
    </div>
  );
}
