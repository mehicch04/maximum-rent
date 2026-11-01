"use client";

import { motion } from "framer-motion";

type Props = {
  eyebrow: string;
  title: string;
  accent?: string;
  subtitle?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
};

export function Heading({
  eyebrow,
  title,
  accent,
  subtitle,
  align = "left",
  tone = "light",
  className = "",
}: Props) {
  const dark = tone === "dark";
  const center = align === "center";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`${center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"} ${className}`}
    >
      <p
        className={`flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] ${
          center ? "justify-center" : ""
        } ${dark ? "text-brand-400" : "text-brand-strong"}`}
      >
        <span className="h-px w-7 bg-brand" />
        {eyebrow}
      </p>
      <h2
        className={`mt-4 text-balance font-display text-3xl font-bold leading-[1.1] tracking-tight sm:text-[2.6rem] ${
          dark ? "text-white" : "text-foreground"
        }`}
      >
        {title}
        {accent && (
          <>
            {" "}
            <span className={dark ? "text-brand-500" : "text-brand-strong dark:text-brand-500"}>{accent}</span>
          </>
        )}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-base leading-relaxed ${dark ? "text-white/65" : "text-muted-foreground"}`}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
