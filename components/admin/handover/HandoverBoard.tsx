"use client";

import { useState } from "react";
import { FileSignature } from "lucide-react";
import { ReservationList } from "./ReservationList";
import { ContractEditor } from "./ContractEditor";
import type { HandoverItem } from "./types";
import type { ContractCompany } from "./contract-data";

/**
 * Split view: who is coming on the left, their contract on the right.
 *
 * The selection lives here rather than in either half, so the list and the
 * editor stay independent and can be moved or replaced on their own.
 */
export function HandoverBoard({
  items,
  company,
}: {
  items: HandoverItem[];
  company?: ContractCompany;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = items.find((i) => i.id === selectedId) ?? null;

  return (
    <div className="grid gap-4 lg:grid-cols-10">
      <aside className="lg:col-span-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Nadolazeća preuzimanja ({items.filter((i) => !i.active).length})
        </p>
        {/* Capped height with its own scroll, so a long queue never pushes the
            contract off the screen. */}
        <div className="max-h-[calc(100dvh-14rem)] overflow-y-auto pr-1">
          <ReservationList
            items={items}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
      </aside>

      <section className="lg:col-span-7">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
          {selected ? (
            <ContractEditor key={selected.id} item={selected} company={company} />
          ) : (
            <div className="flex min-h-[24rem] flex-col items-center justify-center text-center">
              <FileSignature className="h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 font-display text-base font-semibold text-foreground">
                Odaberite rezervaciju
              </p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Izaberite preuzimanje s lijeve strane i podaci će se popuniti
                sami. Prije štampe možete ispraviti sve što treba.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
