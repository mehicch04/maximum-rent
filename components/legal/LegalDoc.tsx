import type { ReactNode } from "react";
import type { TermsBlock, TermsContent } from "@/lib/rental-terms";
import { LegalBar, LegalList } from "./LegalNav";

function Block({ block }: { block: TermsBlock }) {
  if (block.type === "p") {
    return <p className="text-[15px] leading-relaxed text-foreground/90">{block.text}</p>;
  }
  if (block.type === "ul") {
    return (
      <ul className="space-y-2.5">
        {block.items.map((item, i) => (
          <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-foreground/90">
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
        <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-foreground/90">
          <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand/10 text-xs font-semibold text-brand">{i + 1}</span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

export function LegalDoc({ c, children, summary, help }: { c: TermsContent; children?: ReactNode; summary?: ReactNode; help?: ReactNode }) {
  const items = c.articles.map((a) => ({ id: `clanak-${a.n}`, n: a.n, topic: a.topic }));
  const extra = (
    <>
      {help}
      {children}
    </>
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24">
      {summary && <div className="relative z-10 -mt-12 sm:-mt-14">{summary}</div>}
      <div className={summary ? "mt-10 sm:mt-14" : "mt-12 sm:mt-16"}>
        <LegalBar items={items} container="legal-articles" />
        <div className="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-14">
          <aside className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
            <LegalList items={items} container="legal-articles" label={c.indexLabel} />
            {(help || children) && <div className="mt-6 space-y-3">{extra}</div>}
          </aside>

          <div id="legal-articles" className="min-w-0 space-y-4">
            {c.articles.map((a) => (
              <section
                key={a.n}
                id={`clanak-${a.n}`}
                className="scroll-mt-[148px] rounded-[24px] bg-surface p-5 ring-1 ring-border sm:p-7 lg:scroll-mt-28"
              >
                <div className="flex items-center gap-3.5 sm:gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand/10 font-display text-sm font-semibold tabular-nums text-brand-strong">
                    {String(a.n).padStart(2, "0")}
                  </span>
                  <h2 className="font-display text-lg font-bold tracking-tight text-foreground sm:text-2xl">{a.topic}</h2>
                </div>
                <div className="mt-4 space-y-4 sm:pl-14">
                  {a.blocks.map((block, i) => (
                    <Block key={i} block={block} />
                  ))}
                </div>
              </section>
            ))}
            {(help || children) && <div className="space-y-3 pt-2 lg:hidden">{extra}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
