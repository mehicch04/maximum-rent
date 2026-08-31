"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Star } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCompany } from "@/components/company/CompanyProvider";

const ease = [0.22, 1, 0.36, 1] as const;

// Agency opening window in minutes from midnight (07:30 – 20:30, local).
const OPEN_MIN = 7 * 60 + 30;
const CLOSE_MIN = 20 * 60 + 30;
const TZ = "Europe/Sarajevo";

/** Live local time + open/closed badge (shows the agency's local time, so
 *  visitors in other time zones know whether it's worth calling now). */
function OpenStatus({
  openLabel,
  closedLabel,
  localLabel,
}: {
  openLabel: string;
  closedLabel: string;
  localLabel: string;
}) {
  const [state, setState] = useState<{ time: string; open: boolean } | null>(
    null,
  );

  useEffect(() => {
    const compute = () => {
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: TZ,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).formatToParts(new Date());
      const h = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
      const m = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
      const mins = h * 60 + m;
      setState({
        time: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
        open: mins >= OPEN_MIN && mins < CLOSE_MIN,
      });
    };
    compute();
    const id = setInterval(compute, 30_000);
    return () => clearInterval(id);
  }, []);

  // Render nothing until mounted to avoid a server/client clock mismatch.
  if (!state) return null;

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/50 px-3.5 py-2 shadow-lg shadow-black/30 backdrop-blur-md">
      <span
        className={`h-2 w-2 rounded-full ${
          state.open ? "bg-emerald-400 animate-pulse" : "bg-red-400"
        }`}
      />
      <span className="font-medium text-white">
        {state.open ? openLabel : closedLabel}
      </span>
      <span className="text-white/80">
        · {state.time} {localLabel}
      </span>
    </span>
  );
}

export function Hero() {
  const t = useTranslations("Hero");
  const company = useCompany();
  const locale = useLocale();

  // The background video plays on every screen size, with a lighter file on
  // phones so it doesn't eat mobile data. It mounts only after hydration, so
  // the server-rendered HTML ships the poster alone — the poster is the LCP
  // and paints immediately, then the video fades in over it.
  //
  // A single <source> (H.264, universally supported) is chosen on purpose:
  // listing several makes some browsers fetch more than one file.
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 768px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      if (reduce.matches) {
        setVideoSrc(null); // respect the visitor's motion preference
        return;
      }
      setVideoSrc(wide.matches ? "/hero.mp4" : "/hero-mobile.mp4");
    };
    update();
    wide.addEventListener("change", update);
    reduce.addEventListener("change", update);
    return () => {
      wide.removeEventListener("change", update);
      reduce.removeEventListener("change", update);
    };
  }, []);

  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden">
      {/* Background: the poster paints first (it is the LCP), then the
          autoplay video fades in over it — on phones too, with a lighter file. */}
      <div className="absolute inset-0 -z-10 bg-black">
        <img
          src="/hero-poster.webp"
          alt=""
          aria-hidden
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {videoSrc && (
          <video
            key={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/hero-poster.webp"
            disablePictureInPicture
            aria-hidden
            tabIndex={-1}
            onCanPlay={(e) => e.currentTarget.classList.add("opacity-100")}
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        )}
      </div>

      {/* Overlays: darken for legibility + fade into the page background */}
      <div className="absolute inset-0 -z-10 bg-black/55" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-background to-transparent" />

      <div className="container relative">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-white/90 backdrop-blur"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          {t("eyebrow")}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05, ease }}
          className="max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl"
        >
          {t("title")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease }}
          className="mt-6 max-w-xl text-base text-white/80 sm:text-lg"
        >
          {t("subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease }}
          className="mt-9 flex flex-wrap items-center gap-3"
        >
          <a
            href="#rezervacija"
            className="group inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-semibold text-brand-foreground shadow-brand transition-colors hover:bg-brand-700"
          >
            {t("ctaSearch")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <Link
            href="/vozila"
            className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/10"
          >
            {t("ctaFleet")}
          </Link>
        </motion.div>

        {/* Trust row: Google rating + live open/closed status */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.28, ease }}
          className="mt-7 flex flex-wrap items-center gap-3 text-sm"
        >
          <a
            href={(company.map.link ?? "#")}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${(company.rating.score ?? 0)} / 5 — ${(company.rating.count ?? 0)} ${t("reviews")}`}
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/50 px-3.5 py-2 shadow-lg shadow-black/30 backdrop-blur-md transition-colors hover:bg-black/60"
          >
            <span className="flex items-center gap-0.5 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
            </span>
            <span className="font-semibold text-white">
              {(company.rating.score ?? 0).toLocaleString(locale)}
            </span>
            <span className="text-white/85">
              · {(company.rating.count ?? 0)} {t("reviews")}
            </span>
          </a>

          <OpenStatus
            openLabel={t("open")}
            closedLabel={t("closed")}
            localLabel={t("localTime")}
          />
        </motion.div>
      </div>

      <a
        href="#rezervacija"
        aria-label={t("scroll")}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 transition-colors hover:text-white"
      >
        <ChevronDown className="h-6 w-6 animate-bounce" />
      </a>
    </section>
  );
}
