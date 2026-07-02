"use client";

import { motion } from "framer-motion";
import { MapPin, ShieldCheck, Sparkles, Headset } from "lucide-react";
import { useTranslations } from "next-intl";
import { SectionHeading } from "./SectionHeading";

const ease = [0.22, 1, 0.36, 1] as const;
const ICONS = [MapPin, ShieldCheck, Sparkles, Headset];

export function WhyChoose() {
  const t = useTranslations("WhyChoose");
  const items = t.raw("items") as { title: string; body: string }[];

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <SectionHeading
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => {
          const Icon = ICONS[i] ?? MapPin;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, transition: { duration: 0.25, ease } }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: Math.min(i * 0.08, 0.32), ease }}
              className="group rounded-2xl border border-border bg-surface p-6 shadow-card transition-shadow duration-300 hover:shadow-card-hover"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors duration-300 group-hover:bg-brand group-hover:text-brand-foreground">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
