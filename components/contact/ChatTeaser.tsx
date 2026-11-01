"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

export function ChatTeaser({
  phone,
  name,
  online,
  greeting,
  chips,
  cta,
  className = "",
}: {
  phone: string;
  name: string;
  online: string;
  greeting: string;
  chips: { label: string; text: string }[];
  cta: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const show = inView || reduce;
  const wa = (text?: string) => `https://wa.me/${phone}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

  return (
    <div ref={ref} className={`relative overflow-hidden rounded-[28px] bg-ink text-white ring-1 ring-white/5 ${className}`}>
      <span aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(closest-side,rgba(227,6,19,0.4),transparent)]" />
      <div className="relative flex items-center gap-3 border-b border-white/10 px-5 py-4 sm:px-6">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-white/15">
          <Image src="/intro-shield.png" alt="" width={26} height={26} className="h-[26px] w-auto" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[15px] font-semibold">{name}</p>
          <p className="flex items-center gap-1.5 text-xs text-emerald-300">
            <span className="relative grid h-2 w-2 place-items-center">
              <span className="absolute inset-0 rounded-full bg-emerald-400/60 motion-safe:animate-ping" />
              <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            {online}
          </p>
        </div>
        <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
      </div>

      <div className="relative min-h-[152px] px-5 py-5 sm:px-6">
        {show && !reduce && (
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.3, times: [0, 0.15, 0.8, 1] }}
            className="absolute left-5 top-5 flex w-16 items-center justify-center gap-1 rounded-2xl rounded-tl-md bg-white/10 px-3 py-3 sm:left-6"
          >
            {[0, 1, 2].map((d) => (
              <span key={d} className="h-1.5 w-1.5 rounded-full bg-white/70" style={{ animation: `chat-dot 1s ${d * 0.15}s infinite` }} />
            ))}
          </motion.div>
        )}
        {show && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: reduce ? 0 : 1.15, duration: 0.35 }}
            className="max-w-[88%] origin-bottom-left rounded-2xl rounded-tl-md bg-white/10 px-4 py-3 text-[15px] leading-relaxed text-white/90"
          >
            {greeting}
          </motion.div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {chips.map((c, i) => (
            <motion.a
              key={c.label}
              href={wa(c.text)}
              target="_blank"
              rel="noopener noreferrer"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={show ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: reduce ? 0 : 1.55 + i * 0.12, duration: 0.3 }}
              className="inline-flex h-10 items-center rounded-full bg-white/[0.06] px-4 text-sm font-medium text-white ring-1 ring-white/15 transition-colors hover:bg-white/15 active:scale-[0.98]"
            >
              {c.label}
            </motion.a>
          ))}
        </div>
      </div>

      <a
        href={wa()}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative mx-5 mb-5 flex h-12 items-center justify-between rounded-full bg-[#25D366] pr-1.5 pl-5 text-sm font-semibold text-ink transition-[filter] hover:brightness-105 active:scale-[0.99] sm:mx-6 sm:mb-6"
      >
        <span className="inline-flex items-center gap-2">
          <WhatsAppIcon className="h-4 w-4" />
          {cta}
        </span>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-white transition-transform duration-300 group-hover:rotate-45">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </a>
    </div>
  );
}
