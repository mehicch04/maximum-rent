import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ChevronDown } from "lucide-react";
import { RENTAL_TERMS, type TermsBlock } from "@/lib/rental-terms";

function Block({ block }: { block: TermsBlock }) {
  if (block.type === "p") {
    return (
      <p className="text-[15px] leading-relaxed text-foreground/90">{block.text}</p>
    );
  }
  if (block.type === "ul") {
    return (
      <ul className="space-y-2.5">
        {block.items.map((item, i) => (
          <li
            key={i}
            className="flex gap-3 text-[15px] leading-relaxed text-foreground/90"
          >
            <span className="mt-[0.55rem] h-1.5 w-1.5 flex-none rounded-full bg-brand" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ol className="space-y-2.5">
      {block.items.map((item, i) => (
        <li
          key={i}
          className="flex gap-3 text-[15px] leading-relaxed text-foreground/90"
        >
          <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand/10 text-xs font-semibold text-brand">
            {i + 1}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const tSeo = await getTranslations({ locale, namespace: "Seo" });
  const tNav = await getTranslations({ locale, namespace: "Nav" });
  return buildPageMetadata({
    locale,
    path: "/uvjeti-najma",
    title: tSeo("terms.title"),
    description: tSeo("terms.description"),
    tab: tNav("terms"),
  });
}

export default async function TermsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const c = RENTAL_TERMS[locale === "en" ? "en" : "hr"];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <header className="max-w-3xl">
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {c.heading}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{c.intro}</p>
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-[16rem_1fr] lg:gap-12">
        {/* Table of contents */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          {/* Mobile: collapsible */}
          <details className="group rounded-2xl border border-border bg-surface p-2 lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-foreground">
              {c.indexLabel}
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <nav className="px-1 pb-1">
              <ol className="space-y-0.5">
                {c.articles.map((a) => (
                  <li key={a.n}>
                    <a
                      href={`#clanak-${a.n}`}
                      className="flex gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-muted hover:text-brand"
                    >
                      <span className="font-semibold text-brand">{a.n}.</span>
                      {a.topic}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </details>

          {/* Desktop: sticky list */}
          <nav className="hidden lg:block">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {c.indexLabel}
            </p>
            <ol className="mt-3 space-y-0.5">
              {c.articles.map((a) => (
                <li key={a.n}>
                  <a
                    href={`#clanak-${a.n}`}
                    className="flex gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-muted hover:text-brand"
                  >
                    <span className="font-semibold text-brand">{a.n}.</span>
                    {a.topic}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        {/* Articles */}
        <div className="space-y-6">
          {c.articles.map((a) => (
            <section
              key={a.n}
              id={`clanak-${a.n}`}
              className="scroll-mt-24 rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8"
            >
              <div className="flex items-start gap-4">
                <span className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-full bg-brand text-sm font-bold text-brand-foreground">
                  {a.n}
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
                    {c.articleLabel} {a.n}
                  </p>
                  <h2 className="mt-1 font-display text-xl font-bold tracking-tight text-foreground">
                    {a.topic}
                  </h2>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {a.blocks.map((block, i) => (
                  <Block key={i} block={block} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
