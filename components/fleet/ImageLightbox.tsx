"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {
  images: string[];
  title: string;
  /** Index to open at, or null when closed. */
  openIndex: number | null;
  onClose: () => void;
  thumbSizes?: string;
};

/**
 * Fullscreen photo viewer. Rendered through a portal (the card uses Framer
 * transforms, which would otherwise trap `position: fixed`). Esc closes,
 * arrow keys + swipe navigate.
 */
export function ImageLightbox({
  images,
  title,
  openIndex,
  onClose,
  thumbSizes = "(max-width: 639px) 92vw, (max-width: 1023px) 46vw, 31vw",
}: Props) {
  const t = useTranslations("Common");
  const count = images.length;
  const [index, setIndex] = useState(() =>
    openIndex === null ? 0 : Math.min(openIndex, Math.max(count - 1, 0)),
  );
  const [lastOpen, setLastOpen] = useState(openIndex);
  if (openIndex !== lastOpen) {
    setLastOpen(openIndex);
    if (openIndex !== null) setIndex(Math.min(openIndex, Math.max(count - 1, 0)));
  }
  const [mounted, setMounted] = useState(false);
  const touchX = useRef<number | null>(null);

  const open = openIndex !== null && count > 0;

  useEffect(() => setMounted(true), []);

  // Keyboard + scroll lock while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % count);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + count) % count);
    };
    document.addEventListener("keydown", onKey);
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      root.style.overflow = prev;
    };
  }, [open, count, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90"
          onTouchStart={(e) => {
            touchX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchX.current === null || count < 2) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 40)
              setIndex((i) => (i + (dx < 0 ? 1 : -1) + count) % count);
          }}
        >
          <button
            type="button"
            aria-label={t("closeGallery")}
            onClick={onClose}
            className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          {count > 1 && (
            <span className="absolute left-1/2 top-5 z-10 -translate-x-1/2 rounded-full border border-white/15 bg-black/50 px-3 py-1 text-sm tabular-nums text-white/90">
              {index + 1} / {count}
            </span>
          )}

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative h-[80vh] w-[94vw] sm:h-[85vh] sm:w-[88vw]"
          >
            <Image
              key={`thumb-${index}`}
              src={images[index]}
              alt=""
              aria-hidden
              fill
              sizes={thumbSizes}
              className="object-contain"
            />
            {images.map((src, i) => (
              <Image
                key={src + i}
                src={src}
                alt={i === index ? `${title} — ${i + 1}/${count}` : ""}
                aria-hidden={i !== index}
                fill
                sizes="100vw"
                priority={i === index}
                loading={i === index ? undefined : "eager"}
                className={`object-contain ${i === index ? "visible" : "invisible"}`}
              />
            ))}
          </div>

          {count > 1 && (
            <>
              <button
                type="button"
                aria-label={t("prevImage")}
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex((i) => (i - 1 + count) % count);
                }}
                className="absolute left-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-5"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                aria-label={t("nextImage")}
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex((i) => (i + 1) % count);
                }}
                className="absolute right-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-5"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
