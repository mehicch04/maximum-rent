"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Check, Clock3, Copy, Mail, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

export type ContactCard = {
  kind: "phone" | "whatsapp" | "email" | "hours";
  label: string;
  value?: string;
  href?: string;
  copy?: string;
  lines?: { value: string; href: string }[];
};

const EASE = [0.22, 1, 0.36, 1] as const;
const SHELL =
  "group relative flex h-full items-start gap-3.5 rounded-[22px] bg-surface p-4 ring-1 ring-border shadow-[0_18px_40px_-30px_rgba(17,17,19,0.45)] transition-[transform,box-shadow] duration-300 sm:p-5 lg:flex-col lg:gap-4";

function Icon({ kind }: { kind: ContactCard["kind"] }) {
  if (kind === "whatsapp")
    return (
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#25D366]/15 text-[#1DA851] transition-colors duration-300 group-hover:bg-[#25D366] group-hover:text-white">
        <WhatsAppIcon className="h-5 w-5" />
      </span>
    );
  const I = kind === "phone" ? Phone : kind === "email" ? Mail : Clock3;
  return (
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand-strong transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
      <I className="h-5 w-5" />
    </span>
  );
}

export function ContactCards({ cards, copyLabel, copiedLabel }: { cards: ContactCard[]; copyLabel: string; copiedLabel: string }) {
  const [copied, setCopied] = useState<number | null>(null);

  const copy = async (i: number, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(i);
      window.setTimeout(() => setCopied((c) => (c === i ? null : c)), 1600);
    } catch {}
  };

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c, i) => {
        const title = <span className="block text-xs font-medium text-muted-foreground">{c.label}</span>;
        let body;
        if (c.lines) {
          body = (
            <div className={SHELL}>
              <Icon kind={c.kind} />
              <span className="min-w-0 flex-1 lg:w-full">
                {title}
                <span className="mt-1 grid gap-1">
                  {c.lines.map((l) => (
                    <a
                      key={l.value}
                      href={l.href}
                      className="group/l flex items-center justify-between gap-2 rounded-lg font-display text-[15px] font-bold text-foreground transition-colors hover:text-brand-strong"
                    >
                      {l.value}
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover/l:-translate-y-0.5 group-hover/l:translate-x-0.5 group-hover/l:text-brand-strong" />
                    </a>
                  ))}
                </span>
              </span>
            </div>
          );
        } else {
          const inner = (
            <>
              <Icon kind={c.kind} />
              <span className="min-w-0 flex-1 lg:w-full">
                {title}
                <span className="mt-0.5 block truncate font-display text-[15px] font-bold text-foreground lg:whitespace-normal lg:text-balance">{c.value}</span>
              </span>
              {c.href && !c.copy && (
                <ArrowUpRight className="h-4 w-4 shrink-0 self-center text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-strong lg:absolute lg:right-5 lg:top-5" />
              )}
            </>
          );
          body = c.href ? (
            <a
              href={c.href}
              {...(c.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className={`${SHELL} items-center hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgba(227,6,19,0.35)] hover:ring-brand/30 lg:items-start ${c.copy ? "pr-14 lg:pr-5" : ""}`}
            >
              {inner}
            </a>
          ) : (
            <div className={`${SHELL} items-center lg:items-start`}>{inner}</div>
          );
        }
        return (
          <motion.li
            key={c.kind}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 * i, ease: EASE }}
            className="relative"
          >
            {body}
            {c.copy && (
              <button
                type="button"
                onClick={() => copy(i, c.copy!)}
                aria-label={`${copyLabel}: ${c.value}`}
                className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-surface-muted text-muted-foreground transition-colors hover:bg-brand/10 hover:text-brand-strong sm:right-4 lg:right-4 lg:top-4 lg:translate-y-0"
              >
                {copied === i ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                {copied === i && (
                  <span role="status" className="pointer-events-none absolute -top-9 right-0 whitespace-nowrap rounded-full bg-ink px-2.5 py-1 text-xs font-medium text-white motion-safe:animate-[pop-in_0.25s_ease_both]">
                    {copiedLabel}
                  </span>
                )}
              </button>
            )}
          </motion.li>
        );
      })}
    </ul>
  );
}
