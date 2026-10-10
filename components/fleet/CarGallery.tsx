"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Car as CarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {
  images: string[];
  title: string;
  onOpen?: (index: number) => void;
  autoPlay?: boolean;
  priority?: boolean;
  sizes?: string;
  frozen?: boolean;
};

export function CarGallery({
  images,
  title,
  onOpen,
  autoPlay = false,
  priority = false,
  frozen = false,
  sizes = "(max-width: 639px) 92vw, (max-width: 1023px) 46vw, 31vw",
}: Props) {
  const t = useTranslations("Common");
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const touchX = useRef<number | null>(null);

  const count = images.length;

  const [ready, setReady] = useState<Set<number>>(() => new Set([0]));
  const warm = useCallback(
    (targets: number[]) =>
      setReady((prev) => {
        const next = targets.filter((i) => i >= 0 && i < count && !prev.has(i));
        if (next.length === 0) return prev;
        const s = new Set(prev);
        next.forEach((i) => s.add(i));
        return s;
      }),
    [count],
  );
  const warmAll = useCallback(
    () => warm(Array.from({ length: count }, (_, i) => i)),
    [warm, count],
  );

  useEffect(() => {
    if (count > 1) warm([(index + 1) % count, (index - 1 + count) % count]);
  }, [index, count, warm]);

  useEffect(() => {
    if (!autoPlay || paused || count < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 3500);
    return () => clearInterval(id);
  }, [autoPlay, paused, count]);

  const go = (dir: 1 | -1) => {
    setPaused(true);
    setIndex((i) => (i + dir + count) % count);
  };

  if (count === 0) {
    return (
      <div className="relative flex aspect-[16/10] w-full items-center justify-center bg-surface-muted text-muted-foreground">
        <CarIcon className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div
      className="group/gallery relative aspect-[16/10] w-full overflow-hidden bg-surface-muted"
      onPointerEnter={warmAll}
      onFocus={warmAll}
      onTouchStart={(e) => {
        warmAll();
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null || count < 2) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      }}
    >
      <button
        type="button"
        onClick={() => onOpen?.(index)}
        aria-label={title}
        className="absolute inset-0 cursor-zoom-in outline-none [-webkit-tap-highlight-color:transparent] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        {images.map((src, i) =>
          ready.has(i) ? (
            <Image
              key={src + i}
              src={src}
              alt={i === index ? `${title} — ${i + 1}/${count}` : ""}
              aria-hidden={i !== index}
              fill
              priority={priority && i === 0}
              sizes={sizes}
              quality={90}
              className={`object-contain p-6 transition-[opacity,transform] duration-300 ease-out [@media(hover:hover)]:group-hover/gallery:scale-[1.03] ${
                frozen ? "[@media(hover:hover)]:scale-[1.03]" : ""
              } ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
            />
          ) : null,
        )}
      </button>

      {count > 1 && (
        <>
          {/* Arrows — always visible on touch, fade in on desktop hover */}
          <button
            type="button"
            aria-label={t("prevImage")}
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            className="absolute left-2 top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white opacity-80 backdrop-blur-sm transition-opacity hover:opacity-100 sm:opacity-0 sm:group-hover/gallery:opacity-90"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label={t("nextImage")}
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            className="absolute right-2 top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white opacity-80 backdrop-blur-sm transition-opacity hover:opacity-100 sm:opacity-0 sm:group-hover/gallery:opacity-90"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dots */}
          {/* The dots sit on the photo, not on the page, so the theme is not
              what decides whether they show: a white car against a bright sky
              swallowed them either way. A dark pill behind the row fixes it
              everywhere, and matches the arrows, which already work. */}
          <div className="absolute bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/40 px-2 py-1.5 backdrop-blur-sm">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`${i + 1}/${count}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setPaused(true);
                  setIndex(i);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  i === index
                    ? "w-5 bg-brand-foreground"
                    : "w-1.5 bg-white/60 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
