import { useTranslations } from "next-intl";
import { Band } from "@/components/ui/Band";
import type { Guide } from "@/lib/guides";
import { GuideCard } from "@/components/guides/GuideCard";
import { FineTicker, type Fine } from "@/components/guides/FineTicker";
import { PoliceLights } from "@/components/guides/PoliceLights";
import { PillLink } from "@/components/ui/PillLink";
import { Heading } from "./Heading";

const PICK: [number, Fine["kind"]][] = [
  [0, "speed"],
  [3, "phone"],
  [4, "belt"],
  [5, "light"],
];

export function GuidesTeaser({ guides }: { guides: Guide[] }) {
  const t = useTranslations("Guides");
  if (!guides.length) return null;

  const finesGuide = guides.find((g) => g.icon === "fines");
  const picked = (["fines", "rules", "airport"] as const).map((i) => guides.find((g) => g.icon === i)).filter((g): g is Guide => Boolean(g));
  const cards = picked.length === 3 ? picked : guides.slice(0, 3);
  const table = finesGuide?.blocks.find((b) => b.type === "table");
  const fines: Fine[] =
    table && table.type === "table"
      ? PICK.filter(([n]) => table.rows[n]).map(([n, kind]) => ({ kind, label: table.rows[n][0], amount: table.rows[n][1] }))
      : [];

  return (
    <Band id="vodici" className="scroll-mt-24">
      <PoliceLights />
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-end lg:gap-12">
          <div>
            <Heading eyebrow={t("eyebrow")} title={t("title")} accent={t("accent")} subtitle={t("lead")} tone="dark" />
            <PillLink href="/vodici" variant="light" className="mt-6">
              {t("all")}
            </PillLink>
          </div>
          {fines.length > 0 && finesGuide && (
            <FineTicker fines={fines} title={t("finesTitle")} cta={t("finesAll")} href={`/vodici/${finesGuide.slug}`} slideLabel={t("fineSlide")} />
          )}
        </div>
        <ul className="no-scrollbar -mx-4 mt-10 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 pt-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 md:mx-0 md:mt-12 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0">
          {cards.map((g) => (
            <li key={g.slug} className="w-[84%] shrink-0 snap-start md:w-auto">
              <GuideCard guide={g} readLabel={t("read")} minutesLabel={t("minutes", { n: g.minutes })} />
            </li>
          ))}
        </ul>
      </div>
    </Band>
  );
}
