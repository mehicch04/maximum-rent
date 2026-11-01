"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowUpRight, BookOpen, Car, FileText, Search, X } from "lucide-react";
import { Link } from "@/i18n/navigation";

export type SearchItem = { kind: "page" | "guide" | "car"; title: string; href: string; sub?: string };

const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d");

const ICON = { page: FileText, guide: BookOpen, car: Car };

export function NotFoundSearch({
  items,
  placeholder,
  empty,
  clear,
  kinds,
}: {
  items: SearchItem[];
  placeholder: string;
  empty: string;
  clear: string;
  kinds: Record<SearchItem["kind"], string>;
}) {
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const query = fold(q.trim());

  const results = useMemo(() => {
    if (!query) return [];
    const words = query.split(/\s+/);
    return items
      .map((it) => {
        const hay = fold(`${it.title} ${it.sub ?? ""}`);
        const hit = words.every((w) => hay.includes(w));
        return hit ? { it, score: fold(it.title).startsWith(words[0]) ? 0 : 1 } : null;
      })
      .filter((x): x is { it: SearchItem; score: number } => x !== null)
      .sort((a, b) => a.score - b.score)
      .slice(0, 7)
      .map((x) => x.it);
  }, [items, query]);

  return (
    <div className="relative w-full max-w-xl">
      <label className="relative flex h-14 items-center rounded-full bg-white pl-5 pr-2 shadow-[0_24px_50px_-24px_rgba(0,0,0,0.6)] ring-1 ring-white/20 focus-within:ring-2 focus-within:ring-brand">
        <Search className="h-5 w-5 shrink-0 text-ink/40" />
        <input
          ref={input}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-[15px] text-ink outline-none placeholder:text-ink/40"
        />
        {q && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              input.current?.focus();
            }}
            aria-label={clear}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink/50 transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </label>

      {query && (
        <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-[22px] bg-white text-ink shadow-[0_30px_70px_-30px_rgba(0,0,0,0.7)] ring-1 ring-black/5">
          {results.length > 0 ? (
            <ul className="max-h-[340px] overflow-y-auto p-2">
              {results.map((r) => {
                const Icon = ICON[r.kind];
                return (
                  <li key={r.href}>
                    <Link href={r.href} className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-ink/[0.04]">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand-strong">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{r.title}</span>
                        <span className="block truncate text-xs text-ink/50">
                          {kinds[r.kind]}
                          {r.sub ? ` · ${r.sub}` : ""}
                        </span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-ink/30 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-strong" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-5 py-4 text-sm text-ink/55">{empty}</p>
          )}
        </div>
      )}
    </div>
  );
}
