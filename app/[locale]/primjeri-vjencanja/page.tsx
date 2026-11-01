import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { WeddingA } from "@/components/home/wv/WeddingA";
import { WeddingB } from "@/components/home/wv/WeddingB";
import { WeddingC } from "@/components/home/wv/WeddingC";
import { WeddingD } from "@/components/home/wv/WeddingD";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const VARIANTS = [
  { k: "A", C: WeddingA },
  { k: "B", C: WeddingB },
  { k: "C", C: WeddingC },
  { k: "D", C: WeddingD },
];

export default function Page({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return (
    <div className="pb-10">
      {VARIANTS.map(({ k, C }) => (
        <div key={k} id={`v${k.toLowerCase()}`}>
          <p className="mx-auto mt-14 flex max-w-6xl items-center gap-3 px-4 sm:px-6">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-ink font-display text-lg font-bold text-white">{k}</span>
            <span className="h-px flex-1 bg-border" />
          </p>
          <C />
        </div>
      ))}
    </div>
  );
}
