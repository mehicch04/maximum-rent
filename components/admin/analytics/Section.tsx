"use client";

import { motion, useReducedMotion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Shared shell for every analytics block.
 *
 * Keeping the card, heading and entrance animation in one place means a
 * section can be moved, reordered or removed without touching its contents.
 */
export function Section({
  title,
  subtitle,
  delay = 0,
  className = "",
  children,
}: {
  title: string;
  subtitle?: string;
  /** Small stagger so blocks appear in reading order, not all at once. */
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 14 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay, ease }}
      className={`rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6 ${className}`}
    >
      <header className="mb-4">
        <h2 className="font-display text-base font-semibold text-foreground">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </header>
      {children}
    </motion.section>
  );
}
