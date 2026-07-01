"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Car, Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const ease = [0.22, 1, 0.36, 1] as const;

// Images live in /public (root). The gallery tries these extensions in order,
// so it works whether your files are .jpg, .png or .webp — no code change needed.
const EXT = ["jpg", "png", "webp"] as const;
const COUNT = 10;
const IDS = Array.from({ length: COUNT }, (_, i) => i + 1);

const srcFor = (id: number, attempt: number) =>
  `/wed-placeholder-${id}.${EXT[attempt] ?? EXT[0]}`;

function Placeholder({ index }: { index: number }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-surface-muted to-brand/5 text-muted-foreground">
      <Car className="h-7 w-7 sm:h-8 sm:w-8" />
      <span className="mt-1 text-[10px] font-medium sm:text-[11px]">
        {index}
      </span>
    </div>
  );
}

export function WeddingCarsSection() {
  const t = useTranslations("WeddingCars");
  const [active, setActive] = useState(1);
  // per-image extension attempt; once it exceeds EXT we show the placeholder
  const [attempts, setAttempts] = useState<Record<number, number>>({});

  const attemptOf = (id: number) => attempts[id] ?? 0;
  const failed = (id: number) => attemptOf(id) >= EXT.length;

  const onImgError = (id: number) =>
    setAttempts((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));

  return (
    <section className="border-y border-border bg-surface-muted/40">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:gap-16 lg:py-28">
        {/* ── Left: content ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease }}
          className="flex flex-col"
        >
          <p className="mb-3 flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-strong">
            <span className="h-px w-7 bg-brand" />
            {t("eyebrow")}
          </p>

          <h2 className="font-display text-[1.75rem] font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
            {t("heading")}
          </h2>

          <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            <p>{t("p1")}</p>
            <p>{t("p2")}</p>
            <p>{t("p3")}</p>
          </div>

          <div className="mt-8">
            <Link
              href="/kontakt"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-semibold text-brand-foreground shadow-brand transition-colors hover:bg-brand-700 sm:w-auto"
            >
              <Heart className="h-4 w-4" />
              {t("cta")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </motion.div>

        {/* ── Right: interactive gallery ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, delay: 0.1, ease }}
        >
          {/* main image */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-surface-muted shadow-card">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease }}
                className="absolute inset-0"
              >
                {failed(active) ? (
                  <Placeholder index={active} />
                ) : (
                  <Image
                    key={attemptOf(active)}
                    src={srcFor(active, attemptOf(active))}
                    alt={t("imageAlt", { n: active })}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    onError={() => onImgError(active)}
                    priority
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* thumbnails */}
          <div className="mt-3 grid grid-cols-5 gap-2 sm:gap-2.5">
            {IDS.map((id) => {
              const isActive = id === active;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActive(id)}
                  aria-label={t("imageAlt", { n: id })}
                  aria-pressed={isActive}
                  className={`relative aspect-[4/3] overflow-hidden rounded-lg border transition-all duration-300 ${
                    isActive
                      ? "border-brand ring-2 ring-brand ring-offset-2 ring-offset-background"
                      : "border-border opacity-70 hover:opacity-100"
                  }`}
                >
                  {failed(id) ? (
                    <Placeholder index={id} />
                  ) : (
                    <Image
                      key={attemptOf(id)}
                      src={srcFor(id, attemptOf(id))}
                      alt={t("imageAlt", { n: id })}
                      fill
                      sizes="20vw"
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      onError={() => onImgError(id)}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
