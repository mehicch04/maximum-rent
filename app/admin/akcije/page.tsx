import { AlertTriangle, BadgePercent, Check, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ConfirmSubmit } from "@/components/ui/ConfirmSubmit";
import { ImageCompressInput } from "@/components/admin/ImageCompressInput";
import { savePromotion, togglePromotion, deletePromotion } from "./actions";

export const dynamic = "force-dynamic";

type RawSearchParams = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const field =
  "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-ring/30";
const area =
  "w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-ring/30";
const lbl = "mb-1 block text-xs font-medium text-muted-foreground";

type Row = Prisma.PromotionGetPayload<{ include: { car: { select: { title: true } } } }>;

const SQL = `ALTER TABLE "Car" ADD COLUMN IF NOT EXISTS "descriptionDe" TEXT, ADD COLUMN IF NOT EXISTS "descriptionEs" TEXT;

CREATE TABLE IF NOT EXISTS "Promotion" (
  "id" TEXT NOT NULL,
  "titleHr" TEXT NOT NULL,
  "titleEn" TEXT, "titleDe" TEXT, "titleEs" TEXT,
  "textHr" TEXT, "textEn" TEXT, "textDe" TEXT, "textEs" TEXT,
  "badge" TEXT, "image" TEXT, "link" TEXT, "carId" TEXT,
  "startsAt" TIMESTAMP(3), "endsAt" TIMESTAMP(3),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Promotion_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Promotion_isActive_sortOrder_idx" ON "Promotion"("isActive", "sortOrder");`;

const ERRORS: Record<string, string> = {
  title: "Naslov na hrvatskom je obavezan.",
  upload: "Slika se nije uspjela učitati. Pokušajte s manjom slikom (JPG, PNG ili WEBP).",
  db: "Spremanje nije uspjelo. Provjerite je li tabela za akcije napravljena u bazi.",
};

const iso = (d: Date | null) => (d ? new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Sarajevo" }).format(d) : "");
const nice = (d: Date) => new Intl.DateTimeFormat("hr-HR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Sarajevo" }).format(d);

function status(p: { isActive: boolean; startsAt: Date | null; endsAt: Date | null }) {
  const now = Date.now();
  if (!p.isActive) return { label: "Skrivena", cls: "bg-surface-muted text-muted-foreground" };
  if (p.endsAt && p.endsAt.getTime() < now) return { label: "Istekla", cls: "bg-surface-muted text-muted-foreground" };
  if (p.startsAt && p.startsAt.getTime() > now) return { label: "Zakazana", cls: "bg-amber-500/15 text-amber-700" };
  return { label: "Aktivna", cls: "bg-emerald-500/15 text-emerald-700" };
}

export default async function AdminPromotionsPage({ searchParams }: { searchParams: RawSearchParams }) {
  const editId = one(searchParams.edit);
  const saved = one(searchParams.saved) === "1";
  const error = one(searchParams.error);

  let promos: Row[] = [];
  let tableMissing = false;
  try {
    promos = await prisma.promotion.findMany({
      include: { car: { select: { title: true } } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  } catch {
    tableMissing = true;
  }
  const cars = await prisma.car
    .findMany({ select: { id: true, title: true }, orderBy: { sortOrder: "asc" } })
    .catch(() => [] as { id: string; title: string }[]);

  const editing = editId ? promos.find((p) => p.id === editId) : null;
  const val = (k: string) => ((editing as unknown as Record<string, string | null> | null | undefined)?.[k] ?? "") as string;

  if (tableMissing) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Akcije i ponude</h1>
        <div className="mt-6 rounded-2xl border border-brand/40 bg-brand/[0.06] p-6">
          <p className="flex items-center gap-2 font-semibold text-foreground">
            <AlertTriangle className="h-5 w-5 text-brand-strong" />
            Baza još nije pripremljena
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Tabela za akcije još ne postoji. U Supabase otvorite SQL Editor, pokrenite SQL ispod i osvježite stranicu.
          </p>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-surface-muted p-4 text-xs text-foreground">{SQL}</pre>
        </div>
      </div>
    );
  }

  const langs = [
    { k: "Hr", label: "HR", req: true },
    { k: "En", label: "EN", req: false },
    { k: "De", label: "DE", req: false },
    { k: "Es", label: "ES", req: false },
  ] as const;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Akcije i ponude</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Akcije se prikazuju na početnoj stranici dok traje period važenja. Ako tekst na nekom jeziku ostane prazan, prikazuje se engleski, a zatim hrvatski.
        </p>
      </div>

      {error && ERRORS[error] && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-brand/40 bg-brand/[0.06] p-3 text-sm text-foreground">
          <AlertTriangle className="h-4 w-4 shrink-0 text-brand-strong" />
          {ERRORS[error]}
        </div>
      )}
      {saved && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-700">
          <Check className="h-4 w-4" />
          Sačuvano.
        </div>
      )}

      <form action={savePromotion} className="mt-8 rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
        <input type="hidden" name="id" value={editing?.id ?? ""} />
        <input type="hidden" name="currentImage" value={editing?.image ?? ""} />
        <h2 className="font-display text-base font-semibold text-foreground">{editing ? `Uredi: ${editing.titleHr}` : "Nova akcija"}</h2>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {langs.map((l) => (
            <div key={l.k}>
              <label className={lbl}>
                Naslov ({l.label}){l.req ? " *" : ""}
              </label>
              <input
                name={`title${l.k}`}
                required={l.req}
                defaultValue={val(`title${l.k}`)}
                placeholder={l.k === "Hr" ? "Zimska akcija na SUV vozila" : ""}
                className={field}
              />
            </div>
          ))}
          {langs.map((l) => (
            <div key={`t${l.k}`}>
              <label className={lbl}>Kratki opis ({l.label})</label>
              <textarea name={`text${l.k}`} rows={2} defaultValue={val(`text${l.k}`)} className={area} />
            </div>
          ))}
          <div>
            <label className={lbl}>Oznaka na slici</label>
            <input name="badge" defaultValue={editing?.badge ?? ""} placeholder="-15% ili Novo" className={field} />
          </div>
          <div>
            <label className={lbl}>Vozilo (nije obavezno)</label>
            <select name="carId" defaultValue={editing?.carId ?? ""} className={field}>
              <option value="">Bez vozila</option>
              {cars.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-muted-foreground">Ako odaberete vozilo, prikazuje se njegova cijena i klik vodi na to vozilo.</p>
          </div>
          <div className="sm:col-span-2">
            <label className={lbl}>Link (nije obavezno)</label>
            <input name="link" defaultValue={editing?.link ?? ""} placeholder="/vozila?tip=SUV" className={field} />
            <p className="mt-1 text-xs text-muted-foreground">Ima prednost pred vozilom. Bez linka i vozila klik vodi na stranicu Vozila.</p>
          </div>
          <div>
            <label className={lbl}>Vrijedi od</label>
            <input type="date" name="startsAt" defaultValue={iso(editing?.startsAt ?? null)} className={field} />
          </div>
          <div>
            <label className={lbl}>Vrijedi do</label>
            <input type="date" name="endsAt" defaultValue={iso(editing?.endsAt ?? null)} className={field} />
          </div>
          <div className="sm:col-span-2">
            <label className={lbl}>Slika (nije obavezno)</label>
            <div className="flex flex-wrap items-center gap-3">
              {editing?.image && (
                <img src={editing.image} alt="" className="h-16 w-28 rounded-lg object-cover ring-1 ring-border" />
              )}
              <div className="min-w-[240px] flex-1">
                <ImageCompressInput name="image" label={editing?.image ? "Zamijeni sliku" : "Odaberite sliku"} />
              </div>
            </div>
            {editing?.image && (
              <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <input type="checkbox" name="removeImage" className="h-3.5 w-3.5 accent-brand" />
                Ukloni sliku
              </label>
            )}
            <p className="mt-1 text-xs text-muted-foreground">Bez slike se koristi fotografija odabranog vozila.</p>
          </div>
          <div>
            <label className={lbl}>Redoslijed</label>
            <input name="sortOrder" type="number" defaultValue={editing?.sortOrder ?? 0} className={field} />
          </div>
        </div>

        <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
          <input type="checkbox" name="isActive" defaultChecked={editing ? editing.isActive : true} className="h-4 w-4 accent-brand" />
          Prikaži na stranici
        </label>

        <div className="mt-5 flex flex-wrap gap-2">
          <button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-700">
            <Plus className="h-4 w-4" />
            {editing ? "Sačuvaj izmjene" : "Dodaj akciju"}
          </button>
          {editing && (
            <a href="/admin/akcije" className="inline-flex h-11 items-center justify-center rounded-xl border border-border px-5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Odustani
            </a>
          )}
        </div>
      </form>

      {promos.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center">
          <BadgePercent className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">Još nema akcija. Dodajte prvu iznad.</p>
        </div>
      ) : (
        <ul className="mt-8 space-y-2">
          {promos.map((p) => {
            const s = status(p);
            return (
              <li key={p.id} className={`flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border bg-surface px-4 py-3 ${p.isActive ? "border-border" : "border-dashed border-border opacity-70"}`}>
                {p.image ? (
                  <img src={p.image} alt="" className="h-12 w-20 shrink-0 rounded-lg object-cover" />
                ) : (
                  <span className="grid h-12 w-20 shrink-0 place-items-center rounded-lg bg-surface-muted text-muted-foreground">
                    <BadgePercent className="h-5 w-5" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
                    <span className="truncate">{p.titleHr}</span>
                    {p.badge && <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-bold text-white">{p.badge}</span>}
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${s.cls}`}>{s.label}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {p.car?.title ? `${p.car.title} · ` : ""}
                    {p.startsAt ? `od ${nice(p.startsAt)} ` : ""}
                    {p.endsAt ? `do ${nice(p.endsAt)}` : p.startsAt ? "" : "bez roka"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a href={`/admin/akcije?edit=${p.id}`} className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-brand hover:text-brand-strong">
                    Uredi
                  </a>
                  <form action={togglePromotion}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="next" value={p.isActive ? "0" : "1"} />
                    <button type="submit" aria-label={p.isActive ? "Sakrij" : "Prikaži"} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-brand hover:text-brand-strong">
                      {p.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </form>
                  <form action={deletePromotion}>
                    <input type="hidden" name="id" value={p.id} />
                    <ConfirmSubmit
                      title="Brisanje akcije"
                      message={`Obrisati "${p.titleHr}"? Radnja je trajna.`}
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
