import {
  AlertTriangle,
  Building2,
  Check,
  MapPin,
  Plus,
  Star,
  Tag,
  Trash2,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCompany } from "@/lib/company";
import { ConfirmSubmit } from "@/components/ui/ConfirmSubmit";
import { SeasonalToggle } from "@/components/admin/SeasonalToggle";
import { saveCompany, saveLocation, deleteLocation } from "./actions";

export const dynamic = "force-dynamic";

type RawSearchParams = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const TYPES = [
  { value: "HEAD_OFFICE", label: "Glavni ured" },
  { value: "AIRPORT", label: "Aerodrom" },
  { value: "BUS_STATION", label: "Autobusni kolodvor" },
  { value: "CITY_OFFICE", label: "Poslovnica" },
] as const;

const field =
  "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-ring/30";
const lbl = "mb-1 block text-xs font-medium text-muted-foreground";
const card = "rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6";
const h2 = "font-display text-base font-semibold text-foreground";

export default async function AdminCompanyPage({
  searchParams,
}: {
  searchParams: RawSearchParams;
}) {
  const saved = one(searchParams.saved) === "1";
  const failed = one(searchParams.error) === "1";
  const editId = one(searchParams.lokacija);

  const company = await getCompany();

  let locations: Awaited<ReturnType<typeof prisma.location.findMany>> = [];
  let seasonalCount = 0;
  let tableMissing = false;
  try {
    [locations, seasonalCount] = await Promise.all([
      prisma.location.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
      prisma.car.count({ where: { seasonalPrice: { not: null } } }),
    ]);
  } catch {
    tableMissing = true;
  }

  const editing = editId ? locations.find((l) => l.id === editId) : null;
  const p = company.phones;

  if (tableMissing) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Podaci firme</h1>
        <div className="mt-6 rounded-2xl border border-brand/40 bg-brand/[0.06] p-6">
          <p className="flex items-center gap-2 font-semibold text-foreground">
            <AlertTriangle className="h-5 w-5 text-brand-strong" />
            Baza još nije pripremljena
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Pokrenite jednom u folderu projekta:
          </p>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-surface-muted p-4 text-sm text-foreground">
npx prisma generate{"\n"}npx prisma db push
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Podaci firme
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Sve što se prikazuje na sajtu: kontakti, radno vrijeme, ocjena,
          društvene mreže i lokacije. Izmjene su vidljive odmah.
        </p>
      </div>

      {failed && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-brand/40 bg-brand/[0.06] p-3 text-sm text-foreground">
          <AlertTriangle className="h-4 w-4 shrink-0 text-brand-strong" />
          Spremanje nije uspjelo. Pokušajte ponovo.
        </div>
      )}
      {saved && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
          <Check className="h-4 w-4" />
          Sačuvano.
        </div>
      )}

      {/* ── Sezonske cijene ── */}
      <div className="mt-8">
        <SeasonalToggle
          active={company.seasonalPricing}
          carsWithSeasonal={seasonalCount}
        />
      </div>

      {/* ── Kontakt ── */}
      <form action={saveCompany} className={`${card} mt-6`}>
        <h2 className={`${h2} flex items-center gap-2`}>
          <Building2 className="h-4 w-4 text-brand-strong" />
          Kontakt i osnovni podaci
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={lbl}>Naziv firme</label>
            <input name="name" defaultValue={company.name} className={field} />
          </div>
          <div>
            <label className={lbl}>Email</label>
            <input name="email" type="email" defaultValue={company.email} className={field} />
          </div>
        </div>

        <p className="mt-5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Telefoni
        </p>
        <div className="mt-2 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="grid grid-cols-[7rem_1fr] gap-3">
              <input
                name={`phone${i + 1}Label`}
                defaultValue={p[i]?.label ?? ["Tel", "Mob", "Fax"][i]}
                placeholder="Oznaka"
                className={field}
              />
              <input
                name={`phone${i + 1}`}
                defaultValue={p[i]?.value ?? ""}
                placeholder={i === 0 ? "+387 (0) 63 660 444" : "neobavezno"}
                className={field}
              />
            </div>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={lbl}>WhatsApp broj</label>
            <input
              name="whatsapp"
              defaultValue={company.whatsapp}
              placeholder="38763660444"
              className={field}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Samo cifre, s pozivnim brojem države i bez nule.
            </p>
          </div>
          <div>
            <label className={lbl}>Radno vrijeme</label>
            <input
              name="hours"
              defaultValue={company.hours}
              placeholder="07:30 – 20:30h"
              className={field}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Prikazuje se u podnožju i na kontakt stranici.
            </p>
          </div>
        </div>

        <p className="mt-6 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <Star className="h-3.5 w-3.5" />
          Google ocjena
        </p>
        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={lbl}>Ocjena</label>
            <input name="ratingScore" defaultValue={company.rating.score ?? ""} placeholder="4.8" className={field} />
          </div>
          <div>
            <label className={lbl}>Broj recenzija</label>
            <input name="ratingCount" defaultValue={company.rating.count ?? ""} placeholder="108" className={field} />
          </div>
          <div>
            <label className={lbl}>Link na Google profil</label>
            <input name="mapLink" defaultValue={company.map.link ?? ""} className={field} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={lbl}>Facebook</label>
            <input name="facebook" defaultValue={company.socials.facebook ?? ""} placeholder="neobavezno" className={field} />
          </div>
          <div>
            <label className={lbl}>Instagram</label>
            <input name="instagram" defaultValue={company.socials.instagram ?? ""} placeholder="neobavezno" className={field} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={lbl}>Geografska širina</label>
            <input name="mapLat" defaultValue={company.map.lat ?? ""} className={field} />
          </div>
          <div>
            <label className={lbl}>Geografska dužina</label>
            <input name="mapLng" defaultValue={company.map.lng ?? ""} className={field} />
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-brand px-6 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-700"
        >
          Sačuvaj podatke
        </button>
      </form>

      {/* ── Lokacije ── */}
      <div id="lokacije" className={`${card} mt-6`}>
        <h2 className={`${h2} flex items-center gap-2`}>
          <MapPin className="h-4 w-4 text-brand-strong" />
          Lokacije preuzimanja i vraćanja
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Gost ih bira pri rezervaciji. Prikazuju se i u podnožju sajta.
        </p>

        <form action={saveLocation} className="mt-4 rounded-xl border border-border p-4">
          <input type="hidden" name="id" value={editing?.id ?? ""} />
          <p className="text-sm font-medium text-foreground">
            {editing ? `Uredi: ${editing.name}` : "Nova lokacija"}
          </p>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={lbl}>Naziv *</label>
              <input name="name" required defaultValue={editing?.name ?? ""} placeholder="Mostar – Zračna luka" className={field} />
            </div>
            <div>
              <label className={lbl}>Tip</label>
              <select name="type" defaultValue={editing?.type ?? "CITY_OFFICE"} className={field}>
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={lbl}>Ulica</label>
              <input name="street" defaultValue={editing?.street ?? ""} className={field} />
            </div>
            <div>
              <label className={lbl}>Grad</label>
              <input name="city" defaultValue={editing?.city ?? ""} placeholder="88000 Mostar" className={field} />
            </div>
            <div>
              <label className={lbl}>Poštanski broj</label>
              <input name="postalCode" defaultValue={editing?.postalCode ?? ""} className={field} />
            </div>
            <div>
              <label className={lbl}>Redoslijed</label>
              <input name="sortOrder" type="number" defaultValue={editing?.sortOrder ?? 0} className={field} />
            </div>
          </div>

          <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={editing ? editing.isActive : true}
              className="h-4 w-4 accent-brand"
            />
            Nudi se gostima
          </label>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-brand px-4 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-700"
            >
              <Plus className="h-4 w-4" />
              {editing ? "Sačuvaj" : "Dodaj lokaciju"}
            </button>
            {editing && (
              <a href="/admin/firma#lokacije" className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm text-muted-foreground transition-colors hover:text-foreground">
                Odustani
              </a>
            )}
          </div>
        </form>

        <ul className="mt-4 space-y-2">
          {locations.map((l) => (
            <li
              key={l.id}
              className={`flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border px-4 py-3 ${
                l.isActive ? "border-border" : "border-dashed border-border opacity-60"
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{l.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {[l.street, l.city].filter(Boolean).join(", ")}
                  {!l.isActive && " · skriveno"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/admin/firma?lokacija=${l.id}#lokacije`}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-brand hover:text-brand-strong"
                >
                  Uredi
                </a>
                <form action={deleteLocation}>
                  <input type="hidden" name="id" value={l.id} />
                  <ConfirmSubmit
                    title="Brisanje lokacije"
                    message={`Ukloniti "${l.name}"? Ako je vezana za postojeće rezervacije, bit će samo sakrivena od gostiju.`}
                    confirmLabel="Ukloni"
                    cancelLabel="Odustani"
                    tone="danger"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-brand hover:text-brand-strong"
                  >
                    <Trash2 className="h-4 w-4" />
                  </ConfirmSubmit>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <Tag className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Cijene pojedinih vozila mijenjate na stranici Vozila.
      </p>
    </div>
  );
}
