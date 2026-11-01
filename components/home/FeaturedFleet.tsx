"use client";

import { Infinity as InfinityIcon, Plane, ShieldCheck, Ticket } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CarListItem } from "@/lib/types";
import { CarCard } from "@/components/fleet/CarCard";
import { PillLink } from "@/components/ui/PillLink";
import { CardRail } from "@/components/ui/CardRail";
import { Band } from "@/components/ui/Band";
import { Heading } from "./Heading";

const PERKS = [ShieldCheck, InfinityIcon, Ticket, Plane];

export function FeaturedFleet({ cars, total }: { cars: CarListItem[]; total: number }) {
  const t = useTranslations("HomeFleet");
  const perks = t.raw("included") as { title: string; body: string }[];
  const ordered = [...cars.filter((c) => c.isFeatured), ...cars.filter((c) => !c.isFeatured)];
  const shown = ordered.slice(0, ordered.length >= 6 ? 6 : ordered.length >= 3 ? 3 : ordered.length);

  if (shown.length === 0) return null;

  return (
    <Band className="py-3">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <Heading eyebrow={t("eyebrow")} title={t("title")} accent={t("accent")} subtitle={t("lead")} tone="dark" className="max-w-xl" />
          <PillLink href="/vozila" variant="light" className="self-start lg:self-auto">
            {t("viewAllCount", { count: total })}
          </PillLink>
        </div>

        <CardRail
          className="mt-12"
          label={(i) => t("goTo", { n: i + 1 })}
          items={shown.map((car) => ({
            key: car.id,
            node: <CarCard car={car} imageSizes="(max-width: 639px) 86vw, (max-width: 1023px) 46vw, 31vw" />,
          }))}
        />

        <ul className="mt-6 grid overflow-hidden rounded-[24px] bg-white/[0.03] ring-1 ring-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {perks.map((p, i) => {
            const Icon = PERKS[i] ?? ShieldCheck;
            return (
              <li
                key={p.title}
                className="flex gap-4 border-white/10 p-5 sm:p-6 [&:not(:first-child)]:border-t sm:[&:nth-child(2)]:border-t-0 sm:[&:nth-child(even)]:border-l lg:[&:not(:first-child)]:border-l lg:[&:not(:first-child)]:border-t-0"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand/15 text-brand-300">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{p.title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-white/60">{p.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </Band>
  );
}
