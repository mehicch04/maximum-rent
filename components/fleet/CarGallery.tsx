"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Car as CarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {
  images: string[];
  title: string;
  /** Called when the visitor taps/clicks the photo (opens the lightbox). */
  onOpen?: (index: number) => void;
  /** Load the first shown image eagerly + high priority (above-the-fold cards). */
  priority?: boolean;
  /** Override the responsive `sizes` (e.g. smaller on the homepage teaser). */
  sizes?: string;
};

/**
 * Compact gallery for car cards: arrows + dots + touch swipe, no separate
 * page needed. Falls back to the car icon when there are no photos.
 */
export function CarGallery({
  images,
  title,
  onOpen,
  priority = false,
  sizes = "(max-width: 639px) 84vw, (max-width: 1023px) 44vw, 31vw",
}: Props) {
  const t = useTranslations("Common");
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);

  const count = images.length;
  const go = (dir: 1 | -1) =>
    setIndex((i) => (i + dir + count) % count);

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
      onTouchStart={(e) => {
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
        className="absolute inset-0 cursor-zoom-in"
      >
        <Image
          src={images[index]}
          alt={`${title} — ${index + 1}/${count}`}
          fill
          priority={priority && index === 0}
          sizes={sizes}
          className="object-contain p-6 transition-transform duration-500 ease-out group-hover/gallery:scale-[1.03]"
        />
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
          <div className="absolute bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`${i + 1}/${count}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex(i);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  i === index
                    ? "w-5 bg-brand"
                    : "w-1.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
