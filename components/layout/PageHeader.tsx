import type { ReactNode } from "react";
import Image from "next/image";

export function PageHeader({
  eyebrow,
  title,
  lead,
  image = "/hero-poster.webp",
  position = "object-[70%_center]",
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  image?: string;
  position?: string;
  children?: ReactNode;
}) {
  return (
    <section className="px-3 pt-3 sm:px-4">
      <div className="relative isolate overflow-hidden rounded-[28px] bg-ink">
        <Image
          src={image}
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          className={`-z-10 object-cover opacity-60 motion-safe:animate-[hero-zoom_1.6s_cubic-bezier(0.22,1,0.36,1)_both] ${position}`}
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-black/90 via-black/70 to-black/25" />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-24 -z-10 h-[360px] w-[520px] rounded-full bg-brand/25 blur-[120px]" />
        <div className="mx-auto max-w-6xl px-5 pb-24 pt-14 text-white sm:px-6 sm:pt-20">
          {eyebrow && (
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/80 backdrop-blur-md motion-safe:animate-fade-up">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              {eyebrow}
            </span>
          )}
          <h1 className="mt-5 max-w-3xl text-balance font-display text-4xl font-bold leading-[1.08] tracking-tight motion-safe:animate-fade-up sm:text-[3.4rem]">
            {title}
          </h1>
          {lead && (
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70 motion-safe:animate-fade-up motion-safe:[animation-delay:120ms] sm:text-lg">
              {lead}
            </p>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}
