import { prisma } from "@/lib/prisma";
import { PRIMARY_CURRENCY_KEY } from "@/lib/settings";
import { setPrimaryCurrency } from "./actions";
import { Check } from "lucide-react";

export const dynamic = "force-dynamic";

async function currentPrimary(): Promise<"BAM" | "EUR"> {
  try {
    const row = await prisma.setting.findUnique({
      where: { key: PRIMARY_CURRENCY_KEY },
    });
    return row?.value === "EUR" ? "EUR" : "BAM";
  } catch {
    return "BAM";
  }
}

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: { saved?: string };
}) {
  const primary = await currentPrimary();
  const saved = searchParams.saved === "1";

  const options: { value: "BAM" | "EUR"; title: string; sub: string }[] = [
    { value: "BAM", title: "Marka (KM)", sub: "Cijene se podrazumijevano prikazuju u markama." },
    { value: "EUR", title: "Euro (€)", sub: "Cijene se podrazumijevano prikazuju u eurima." },
  ];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
        Postavke
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Cijene uvijek unosite u markama. Ovdje birate koja se valuta
        podrazumijevano prikazuje posjetiocima na sajtu. Posjetilac i dalje može
        sam prebaciti KM/€ u vrhu stranice.
      </p>

      {saved && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
          <Check className="h-4 w-4" />
          Sačuvano.
        </div>
      )}

      <form action={setPrimaryCurrency} className="mt-6 space-y-3">
        <fieldset className="space-y-3">
          <legend className="mb-1 text-sm font-medium text-foreground">
            Primarna valuta
          </legend>
          {options.map((o) => (
            <label
              key={o.value}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-brand/50 has-[:checked]:border-brand has-[:checked]:bg-brand/[0.04]"
            >
              <input
                type="radio"
                name="currency"
                value={o.value}
                defaultChecked={primary === o.value}
                className="mt-1 h-4 w-4 accent-brand"
              />
              <span>
                <span className="block text-sm font-semibold text-foreground">
                  {o.title}
                </span>
                <span className="block text-sm text-muted-foreground">
                  {o.sub}
                </span>
              </span>
            </label>
          ))}
        </fieldset>

        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-700"
        >
          Sačuvaj
        </button>
      </form>
    </div>
  );
}
