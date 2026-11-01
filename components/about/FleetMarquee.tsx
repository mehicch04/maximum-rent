import Image from "next/image";
import { Users } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { CarListItem } from "@/lib/types";

export function FleetMarquee({ cars }: { cars: CarListItem[] }) {
  const list = cars.filter((c) => c.images?.[0]).slice(0, 12);
  if (list.length < 4) return null;
  const track = [...list, ...list];
  return (
    <div className="group relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
      <ul className="flex w-max animate-marquee gap-4 py-2 group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {track.map((c, i) => (
          <li key={`${c.slug}-${i}`} aria-hidden={i >= list.length || undefined} className="w-[260px] shrink-0 sm:w-[300px]">
            <Link
              href={`/vozila/${c.slug}`}
              tabIndex={i >= list.length ? -1 : undefined}
              className="block overflow-hidden rounded-[22px] bg-surface ring-1 ring-border transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-30px_rgba(227,6,19,0.35)]"
            >
              <span className="relative block aspect-[16/10] bg-white">
                <Image src={c.images[0]} alt={c.title} fill sizes="300px" className="object-cover" />
              </span>
              <span className="flex items-center justify-between gap-3 px-4 py-3.5">
                <span className="truncate font-display text-sm font-semibold text-foreground">{c.title}</span>
                <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {c.passengers}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
