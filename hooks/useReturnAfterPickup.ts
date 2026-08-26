"use client";

import { useEffect, useRef } from "react";

/** "YYYY-MM-DD" for a local date, without timezone drift. */
function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/**
 * Keeps the return date after the pickup date.
 *
 * When the pickup moves past the return — typically when the visitor jumps to
 * the end of a month — the return is carried along and the rental keeps the
 * same number of days. Without this the return silently becomes invalid and
 * the visitor has to page through the calendar to repair it.
 */
export function useReturnAfterPickup(
  pickupDate: string,
  returnDate: string,
  setReturnDate: (v: string) => void,
) {
  const gapRef = useRef(2); // remembers how long they wanted the car

  useEffect(() => {
    if (!pickupDate || !returnDate) return;

    const p = new Date(`${pickupDate}T00:00`);
    const r = new Date(`${returnDate}T00:00`);
    if (Number.isNaN(p.getTime()) || Number.isNaN(r.getTime())) return;

    const days = Math.round((r.getTime() - p.getTime()) / 86_400_000);
    if (days >= 1) {
      gapRef.current = days;
      return;
    }

    const next = new Date(p);
    next.setDate(next.getDate() + Math.max(1, gapRef.current));
    setReturnDate(toISODate(next));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickupDate, returnDate]);
}
