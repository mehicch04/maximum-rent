"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Car as CarIcon, ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { useTranslations } from "next-intl";

export function DetailGallery({ images, title, onOpen }: { images: string[]; title: string; onOpen: (i: number) => void }) {
  const t = useTranslations("Fleet");
  const tc = useTranslations("Common");
  const [index, setIndex] = useState(0);
  const [seen, setSeen] = useState<Set<number>>(() => new Set([0, 1]));
  const strip = useRef<HTMLUListElement>(null);
  const touchX = useRef<number | null>(null);
  const count = images.length;

  const go = (i: number) => {
    const n = (i + count) % count;
    setIndex(n);
    setSeen((s) => (s.has(n) && s.has((n + 1) % count) ? s : new Set([...s, n, (n + 1) % count, (n - 1 + count) % count])));
  };

  useEffect(() => {
    const el = strip.current?.children[index] as HTMLElement | undefined;
    if (!el || !strip.current) return;
    const box = strip.current;
    const left = el.offsetLeft - box.clientWidth / 2 + el.clientWidth / 2;
    box.scrollTo({ left, behavior: "smooth" });
  }, [index]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });

  if (count === 0) {
    return (
      <div className="grid aspect-[16/10] w-full place-items-center rounded-[22px] bg-surface-muted text-muted-foreground">
        <CarIcon className="h-12 w-12" />
      </div>
    );
  }

  const arrow = "grid h-11 w-11 place-items-center rounded-full bg-white/90 text-ink shadow-[0_10px_24px_-12px_rgba(0,0,0,0.6)] backdrop-blur transition-[transform,opacity] hover:scale-105 active:scale-95";

  return (
    <div>
      <div
        className="group/g relative isolate aspect-[16/10] w-full overflow-hidden rounded-[22px] bg-surface-muted [transform:translateZ(0)]"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
        }}
      >
        <button type="button" onClick={() => onOpen(index)} aria-label={t("enlarge")} className="absolute inset-0 cursor-zoom-in outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
          {images.map((src, i) =>
            seen.has(i) ? (
              <Image
                key={src + i}
                src={src}
                alt={i === index ? `${title}, ${t("photoN", { n: i + 1 })}` : ""}
                aria-hidden={i !== index}
                fill
                priority={i === 0}
                sizes="(max-width: 1023px) 92vw, 62vw"
                quality={90}
                className={`object-cover transition-[opacity,transform] duration-500 ease-out ${i === index ? "scale-100 opacity-100" : "scale-[1.02] opacity-0"}`}
              />
            ) : null,
          )}
        </button>

        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />

        <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold tabular-nums text-white backdrop-blur-sm sm:bottom-4 sm:left-4">
          {index + 1} / {count}
        </span>
        <button
          type="button"
          onClick={() => onOpen(index)}
          aria-label={t("enlarge")}
          className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/70 sm:bottom-4 sm:right-4"
        >
          <Expand className="h-4 w-4" />
        </button>

        {count > 1 && (
          <>
            <button type="button" onClick={() => go(index - 1)} aria-label={tc("prevImage")} className={`${arrow} absolute left-3 top-1/2 -translate-y-1/2 sm:left-4 lg:opacity-0 lg:group-hover/g:opacity-100`}>
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => go(index + 1)} aria-label={tc("nextImage")} className={`${arrow} absolute right-3 top-1/2 -translate-y-1/2 sm:right-4 lg:opacity-0 lg:group-hover/g:opacity-100`}>
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <ul ref={strip} className="no-scrollbar -mx-1 mt-2 flex snap-x scroll-px-1 gap-2 overflow-x-auto p-1 sm:gap-2.5">
          {images.map((src, i) => {
            const on = i === index;
            return (
              <li key={src + i} className="shrink-0 snap-start">
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-label={t("photoN", { n: i + 1 })}
                  aria-current={on || undefined}
                  className={`relative block aspect-[16/10] w-20 overflow-hidden rounded-xl transition-opacity duration-300 sm:w-28 ${on ? "opacity-100" : "opacity-55 hover:opacity-100"}`}
                >
                  <Image src={src} alt="" fill sizes="112px" className="object-cover" />
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute inset-0 rounded-xl transition-shadow duration-300 ${on ? "shadow-[inset_0_0_0_2px_#E30613,inset_0_0_0_4px_rgba(255,255,255,0.9)]" : "shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]"}`}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
