"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

/**
 * How long until a rental is due back, or how far past it already is.
 *
 * Counted on the client and refreshed every half minute: this is the one
 * figure on the screen that goes stale while somebody is looking at it, and a
 * badge that says "due in 5 min" an hour after the fact is worse than none.
 */
export function DueBadge({ returnAt }: { returnAt: string }) {
  const [now, setNow] = useState<number | null>(null);

  // Set after mount so the server and the browser never disagree on the time.
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  if (now === null) return null;

  const diff = new Date(returnAt).getTime() - now;
  const mins = Math.round(Math.abs(diff) / 60_000);

  /** "45 min", "3 h", "2 dana" — whichever unit reads naturally. */
  const span = (m: number) => {
    if (m < 60) return `${m} min`;
    const h = Math.round(m / 60);
    if (h < 24) return `${h} h`;
    const d = Math.round(h / 24);
    return `${d} ${d === 1 ? "dan" : "dana"}`;
  };

  const late = diff < 0;
  // Under two hours is the point where somebody should be watching the door.
  const soon = !late && diff < 2 * 3_600_000;

  const tone = late
    ? "text-brand-strong"
    : soon
      ? "text-amber-600 dark:text-amber-400"
      : "text-muted-foreground";

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${tone}`}>
      <Clock className="h-3.5 w-3.5 shrink-0" />
      {late ? `Kasni ${span(mins)}` : `Ističe za ${span(mins)}`}
    </span>
  );
}
