import { AlertTriangle, Check, Eye, EyeOff, Package, Plus, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ConfirmSubmit } from "@/components/ui/ConfirmSubmit";
import { saveExtra, toggleExtra, deleteExtra } from "./actions";

export const dynamic = "force-dynamic";

type RawSearchParams = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const PRICING = [
  { value: "PER_DAY", label: "Po danu" },
  { value: "PER_RENTAL", label: "Po najmu (jednokratno)" },
  { value: "INCLUDED", label: "Uključeno u cijenu" },
] as const;

const field =
  "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-ring/30";
const lbl = "mb-1 block text-xs font-medium text-muted-foreground";

export default async function AdminExtrasPage({
  searchParams,
}: {
  searchParams: RawSearchParams;
}) {
  const editId = one(searchParams.edit);
  const saved = one(searchParams.saved) === "1";
  const failed = one(searchParams.error) === "1";

  // The table only exists after `prisma db push`. Until then, show a clear
  // instruction instead of crashing the whole admin page.
  let extras: Awaited<ReturnType<typeof prisma.extra.findMany>> = [];
  let tableMissing = false;
  try {
    extras = await prisma.extra.findMany({
      orderBy: [{ sortOrder: "asc" }, { nameHr: "asc" }],
    });
  } catch {
    tableMissing = true;
  }
  const editing = editId ? extras.find((e) => e.id === editId) : null;

  if (tableMissing) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Dodatna oprema
        </h1>
        <div className="mt-6 rounded-2xl border border-brand/40 bg-brand/[0.06] p-6">
          <p className="flex items-center gap-2 font-semibold text-foreground">
            <AlertTriangle className="h-5 w-5 text-brand-strong" />
            Baza još nije pripremljena
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Tabele za dodatnu opremu još ne postoje. Pokrenite jednom u folderu
            projekta:
          </p>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-surface-muted p-4 text-sm text-foreground">
npx prisma generate{"\n"}npx prisma db push
          </pre>
          <p className="mt-3 text-sm text-muted-foreground">
            Nakon toga osvježite ovu stranicu.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Dodatna oprema
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Oprema i usluge koje gost može zatražiti uz rezervaciju. Prikazuje se u
          obrascu za upit, na hrvatskom i engleskom.
        </p>
      </div>

      {failed && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-brand/40 bg-brand/[0.06] p-3 text-sm text-foreground">
          <AlertTriangle className="h-4 w-4 shrink-0 text-brand-strong" />
          Spremanje nije uspjelo. Provjerite je li pokrenut <code className="mx-1">npx prisma db push</code>.
        </div>
      )}

      {saved && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
          <Check className="h-4 w-4" />
          Sačuvano.
        </div>
      )}

      {/* ── Form ── */}
      <form
        action={saveExtra}
        className="mt-8 rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6"
      >
        <input type="hidden" name="id" value={editing?.id ?? ""} />

        <h2 className="font-display text-base font-semibold text-foreground">
          {editing ? `Uredi: ${editing.nameHr}` : "Nova stavka"}
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={lbl}>Naziv (HR) *</label>
            <input
              name="nameHr"
              required
              defaultValue={editing?.nameHr ?? ""}
              placeholder="Dječija sjedalica"
              className={field}
            />
          </div>
          <div>
            <label className={lbl}>Naziv (EN) *</label>
            <input
              name="nameEn"
              required
              defaultValue={editing?.nameEn ?? ""}
              placeholder="Child seat"
              className={field}
            />
          </div>

          <div>
            <label className={lbl}>Napomena (HR)</label>
            <input
              name="noteHr"
              defaultValue={editing?.noteHr ?? ""}
              placeholder="0–4 godine"
              className={field}
            />
          </div>
          <div>
            <label className={lbl}>Napomena (EN)</label>
            <input
              name="noteEn"
              defaultValue={editing?.noteEn ?? ""}
              placeholder="0–4 years"
              className={field}
            />
          </div>

          <div>
            <label className={lbl}>Način naplate</label>
            <select
              name="pricing"
              defaultValue={editing?.pricing ?? "PER_DAY"}
              className={field}
            >
              {PRICING.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={lbl}>Cijena (KM)</label>
            <input
              name="price"
              type="number"
              min={0}
              step="0.5"
              defaultValue={editing ? Number(editing.price) : 0}
              className={field}
            />
          </div>

          <div>
            <label className={lbl}>Najveća količina</label>
            <input
              name="maxQty"
              type="number"
              min={1}
              max={20}
              defaultValue={editing?.maxQty ?? 1}
              className={field}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              1 = obična kvačica. Više od 1 daje gostu brojač (npr. 3 sjedalice).
            </p>
          </div>
          <div>
            <label className={lbl}>Redoslijed</label>
            <input
              name="sortOrder"
              type="number"
              defaultValue={editing?.sortOrder ?? 0}
              className={field}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Manji broj ide više na listi.
            </p>
          </div>
        </div>

        <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={editing ? editing.isActive : true}
            className="h-4 w-4 accent-brand"
          />
          Prikaži gostima
        </label>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            {editing ? "Sačuvaj izmjene" : "Dodaj"}
          </button>
          {editing && (
            <a
              href="/admin/oprema"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-border px-5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Odustani
            </a>
          )}
        </div>
      </form>

      {/* ── List ── */}
      {extras.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center">
          <Package className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            Još nema stavki. Dodajte prvu iznad.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-2">
          {extras.map((e) => {
            const price =
              e.pricing === "INCLUDED"
                ? "Uključeno"
                : `${Number(e.price).toFixed(0)} KM${e.pricing === "PER_DAY" ? " / dan" : ""}`;
            return (
              <li
                key={e.id}
                className={`flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border bg-surface px-4 py-3 ${
                  e.isActive ? "border-border" : "border-dashed border-border opacity-60"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {e.nameHr}
                    <span className="ml-2 font-normal text-muted-foreground">
                      {e.nameEn}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {price}
                    {e.maxQty > 1 && ` · do ${e.maxQty} kom`}
                    {!e.isActive && " · skriveno"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`/admin/oprema?edit=${e.id}`}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-brand hover:text-brand-strong"
                  >
                    Uredi
                  </a>

                  <form action={toggleExtra}>
                    <input type="hidden" name="id" value={e.id} />
                    <input type="hidden" name="next" value={e.isActive ? "0" : "1"} />
                    <button
                      type="submit"
                      aria-label={e.isActive ? "Sakrij" : "Prikaži"}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-brand hover:text-brand-strong"
                    >
                      {e.isActive ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                  </form>

                  <form action={deleteExtra}>
                    <input type="hidden" name="id" value={e.id} />
                    <ConfirmSubmit
                      title="Brisanje stavke"
                      message={`Obrisati "${e.nameHr}"? Radnja je trajna. Postojeće rezervacije zadržavaju ono što je gost izabrao.`}
                      confirmLabel="Obriši"
                      cancelLabel="Odustani"
                      tone="danger"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-brand hover:text-brand-strong"
                    >
                      <Trash2 className="h-4 w-4" />
                    </ConfirmSubmit>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
