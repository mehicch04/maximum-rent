import Link from "next/link";
import {
  CalendarDays,
  Car as CarIcon,
  Check,
  Clock,
  Mail,
  Phone,
  Plane,
  Package,
  Receipt,
  StickyNote,
  Trash2,
  X,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  confirmInquiry,
  cancelInquiry,
  addBlock,
  removeBlock,
} from "./actions";
import { ConfirmSubmit } from "@/components/ui/ConfirmSubmit";
import { BlockForm } from "@/components/admin/BlockForm";
import { EditInquiryButton } from "@/components/admin/EditInquiryButton";
import { EditInquiryForm } from "@/components/admin/EditInquiryForm";
import { updateInquiry } from "./edit-actions";
import { NewReservationButton } from "@/components/admin/NewReservationButton";
import { NewReservationForm } from "@/components/admin/NewReservationForm";
import { createManualInquiry } from "./new-reservation-actions";
import { getActiveExtras } from "@/lib/extras";
import { getBookedExtras, getCarOccupancy } from "@/lib/extras-availability";

export const dynamic = "force-dynamic";

type RawSearchParams = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const TZ = "Europe/Sarajevo";
function fmt(d: Date): string {
  return new Intl.DateTimeFormat("hr-HR", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
function fmtDay(d: Date): string {
  return new Intl.DateTimeFormat("hr-HR", {
    timeZone: "UTC", // blocks are stored as UTC day boundaries
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

const FILTERS = [
  { id: "pending", label: "Na čekanju" },
  { id: "confirmed", label: "Potvrđene" },
  { id: "cancelled", label: "Otkazane" },
  { id: "all", label: "Sve" },
] as const;
type Filter = (typeof FILTERS)[number]["id"];

const RANGES = [
  { id: "24h", label: "Zadnjih 24h", ms: 24 * 60 * 60 * 1000 },
  { id: "7d", label: "Zadnjih 7 dana", ms: 7 * 24 * 60 * 60 * 1000 },
  { id: "30d", label: "Zadnjih 30 dana", ms: 30 * 24 * 60 * 60 * 1000 },
  { id: "all", label: "Sve", ms: null },
] as const;
type Range = (typeof RANGES)[number]["id"];

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  NEW: {
    label: "Novo",
    cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  CONTACTED: {
    label: "Kontaktirano",
    cls: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  },
  CONFIRMED: {
    label: "Potvrđeno",
    cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  CANCELLED: {
    label: "Otkazano",
    cls: "bg-zinc-500/15 text-zinc-500 dark:text-zinc-400",
  },
  COMPLETED: {
    label: "Završeno",
    cls: "bg-zinc-500/15 text-zinc-500 dark:text-zinc-400",
  },
};

const MESSAGES: Record<string, { text: string; tone: "ok" | "warn" | "err" }> =
  {
    confirmed: {
      text: "Rezervacija je potvrđena — vozilo je zauzeto za taj period.",
      tone: "ok",
    },
    cancelled: { text: "Upit je otkazan.", tone: "ok" },
    conflict: {
      text: "Nije moguće potvrditi: vozilo je već zauzeto u tom periodu (potvrđena rezervacija ili blokada).",
      tone: "err",
    },
    blocked: {
      text: "Blokada je dodana — vozilo je nedostupno u tom periodu.",
      tone: "ok",
    },
    unblocked: { text: "Blokada je uklonjena.", tone: "ok" },
    error: {
      text: "Nešto nije u redu s unosom. Pokušajte ponovo.",
      tone: "err",
    },
    updated: { text: "Rezervacija je izmijenjena.", tone: "ok" },
  created: { text: "Rezervacija je kreirana i potvrđena.", tone: "ok" },
    busy: {
      text: "Izmjena nije sačuvana: vozilo je u novom periodu već zauzeto.",
      tone: "err",
    },
    extras: {
      text: "Izmjena nije sačuvana: tražena oprema nije dostupna u novom periodu.",
      tone: "err",
    },
  };

export default async function AdminPage({
  searchParams,
}: {
  searchParams: RawSearchParams;
}) {
  const filterRaw = one(searchParams.status) ?? "pending";
  const filter: Filter = (
    FILTERS.some((f) => f.id === filterRaw) ? filterRaw : "pending"
  ) as Filter;
  const rangeRaw = one(searchParams.range) ?? "all";
  const range: Range = (
    RANGES.some((r) => r.id === rangeRaw) ? rangeRaw : "all"
  ) as Range;
  const msg = MESSAGES[one(searchParams.msg) ?? ""];

  const rangeMs = RANGES.find((r) => r.id === range)?.ms ?? null;
  const createdAtWhere = rangeMs
    ? { createdAt: { gte: new Date(Date.now() - rangeMs) } }
    : {};

  const statusWhere =
    filter === "pending"
      ? {
          status: { in: ["NEW", "CONTACTED"] } as {
            in: ("NEW" | "CONTACTED")[];
          },
        }
      : filter === "confirmed"
        ? { status: "CONFIRMED" as const }
        : filter === "cancelled"
          ? {
              status: { in: ["CANCELLED", "COMPLETED"] } as {
                in: ("CANCELLED" | "COMPLETED")[];
              },
            }
          : {};

  const where = { ...statusWhere, ...createdAtWhere };

  const [
    inquiries,
    blocks,
    cars,
    counts,
    blockExtras,
    blockBooked,
    carOccupancy,
    editLocations,
  ] = await Promise.all([
    prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { car: { select: { title: true } }, extras: true },
    }),
    prisma.carBlock.findMany({
      orderBy: { startAt: "asc" },
      include: { car: { select: { title: true } } },
    }),
    prisma.car.findMany({
      where: { isAvailable: true },
      orderBy: { sortOrder: "asc" },
      // pricePerDay drives the live price calculation in the new-reservation form.
      select: { id: true, title: true, pricePerDay: true },
    }),
    prisma.inquiry.groupBy({
      by: ["status"],
      _count: true,
      where: createdAtWhere,
    }),
    getActiveExtras().catch(() => []),
    // Availability must never take the panel down; an empty list just means
    // the form shows full stock and the server still re-checks on submit.
    getBookedExtras().catch(() => []),
    getCarOccupancy().catch(() => []),
    prisma.location.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const countByStatus = new Map(counts.map((c) => [c.status, c._count]));
  const pendingCount =
    (countByStatus.get("NEW") ?? 0) + (countByStatus.get("CONTACTED") ?? 0);

  const filterCount: Record<Filter, number> = {
    pending: pendingCount,
    confirmed: countByStatus.get("CONFIRMED") ?? 0,
    cancelled:
      (countByStatus.get("CANCELLED") ?? 0) +
      (countByStatus.get("COMPLETED") ?? 0),
    all: counts.reduce((s, c) => s + c._count, 0),
  };

  // Prisma returns Decimal, which cannot cross into a client component.
  const carsForForm = cars.map((c) => ({
    id: c.id,
    title: c.title,
    pricePerDay: c.pricePerDay != null ? Number(c.pricePerDay) : null,
  }));

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Rezervacije
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
            Potvrdite upit da zauzme vozilo. Potvrđene rezervacije i blokade
            automatski skrivaju vozilo iz pretrage za taj period.
          </p>
        </div>

        <NewReservationButton>
          <NewReservationForm
            action={createManualInquiry}
            cars={carsForForm}
            locations={editLocations}
            extras={blockExtras}
            booked={blockBooked}
            occupancy={carOccupancy}
            today={today}
          />
        </NewReservationButton>
      </div>

      {msg && (
        <div
          className={`mt-5 rounded-2xl border p-4 text-sm ${
            msg.tone === "ok"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-brand/40 bg-brand/10 text-brand"
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Status filter */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTERS.map((f) => {
          const active = f.id === filter;
          return (
            <Link
              key={f.id}
              href={`/admin?status=${f.id}&range=${range}`}
              className={`inline-flex flex-none items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-border bg-surface text-foreground/80 hover:border-brand hover:text-brand"
              }`}
            >
              {f.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs tabular-nums ${
                  active
                    ? "bg-white/25 text-brand-foreground"
                    : "bg-surface-muted text-muted-foreground"
                }`}
              >
                {filterCount[f.id]}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Time-range filter */}
      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Clock className="h-4 w-4 flex-none text-muted-foreground" />
        {RANGES.map((r) => {
          const active = r.id === range;
          return (
            <Link
              key={r.id}
              href={`/admin?status=${filter}&range=${r.id}`}
              className={`inline-flex flex-none items-center rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-border bg-surface text-foreground/80 hover:border-brand hover:text-brand"
              }`}
            >
              {r.label}
            </Link>
          );
        })}
      </div>

      {/* Inquiries */}
      <div className="mt-5 space-y-4">
        {inquiries.length === 0 && (
          <p className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-muted-foreground">
            Nema upita u ovoj kategoriji.
          </p>
        )}

        {inquiries.map((q) => {
          const badge = STATUS_BADGE[q.status] ?? STATUS_BADGE.NEW;
          const canAct = q.status === "NEW" || q.status === "CONTACTED";
          return (
            <div
              key={q.id}
              className="rounded-2xl border border-border bg-surface p-5 shadow-card"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge.cls}`}
                    >
                      {badge.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {fmt(q.createdAt)} · {q.reference}
                    </span>
                  </div>
                  <p className="mt-2 flex items-center gap-2 font-semibold">
                    <CarIcon className="h-4 w-4 shrink-0 text-brand" />
                    {q.car?.title ?? q.carTitleSnapshot ?? "— (opći upit)"}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4 shrink-0 text-brand" />
                    {fmt(q.pickupAt)} → {fmt(q.returnAt)}
                    {q.rentalDays ? (
                      <span className="text-xs">· {q.rentalDays} dana</span>
                    ) : null}
                  </p>
                  {q.totalPrice != null && (
                    <p className="mt-1 flex items-center gap-2 text-sm">
                      <Receipt className="h-4 w-4 shrink-0 text-brand" />
                      <span className="font-semibold text-foreground">
                        {Number(q.totalPrice).toFixed(0)} KM
                      </span>
                      <span className="text-xs text-muted-foreground">
                        najam i oprema
                      </span>
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-start gap-2">
                  {/* Editing stays available whatever the status: plans change
                      after a booking is confirmed just as often as before. */}
                  <EditInquiryButton reference={q.reference} status={q.status}>
                    <EditInquiryForm
                      action={updateInquiry}
                      inquiry={{
                        id: q.id,
                        reference: q.reference,
                        carId: q.carId,
                        pickupAt: q.pickupAt.toISOString(),
                        returnAt: q.returnAt.toISOString(),
                        pickupLocationId: q.pickupLocationId,
                        returnLocationId: q.returnLocationId,
                        firstName: q.firstName,
                        lastName: q.lastName,
                        email: q.email,
                        phone: q.phone,
                        flightNumber: q.flightNumber,
                        message: q.message,
                        totalPrice:
                          q.totalPrice != null ? Number(q.totalPrice) : null,
                        extras: q.extras.map((e) => ({
                          extraId: e.extraId,
                          qty: e.qty,
                        })),
                      }}
                      cars={cars}
                      locations={editLocations}
                      extras={blockExtras}
                      booked={blockBooked}
                    />
                  </EditInquiryButton>
                </div>

                {canAct && (
                  <div className="flex flex-wrap gap-2">
                    <form action={confirmInquiry}>
                      <input type="hidden" name="id" value={q.id} />
                      <input type="hidden" name="statusFilter" value={filter} />
                      <input type="hidden" name="rangeFilter" value={range} />
                      <ConfirmSubmit
                        title="Potvrditi rezervaciju?"
                        message="Vozilo će biti označeno kao zauzeto za odabrani period, a klijent će dobiti email s potvrdom."
                        confirmLabel="Da, potvrdi"
                        cancelLabel="Odustani"
                        tone="confirm"
                        className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                      >
                        <Check className="h-4 w-4" />
                        Potvrdi
                      </ConfirmSubmit>
                    </form>
                    <form action={cancelInquiry}>
                      <input type="hidden" name="id" value={q.id} />
                      <input type="hidden" name="statusFilter" value={filter} />
                      <input type="hidden" name="rangeFilter" value={range} />
                      <ConfirmSubmit
                        title="Otkazati upit?"
                        message="Klijent će dobiti email da rezervacija nije potvrđena. Ovu radnju možete kasnije ručno izmijeniti."
                        confirmLabel="Da, otkaži"
                        cancelLabel="Nazad"
                        tone="danger"
                        className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-sm font-medium text-foreground/80 transition-colors hover:border-brand hover:text-brand"
                      >
                        <X className="h-4 w-4" />
                        Otkaži
                      </ConfirmSubmit>
                    </form>
                  </div>
                )}
                {q.status === "CONFIRMED" && (
                  <form action={cancelInquiry}>
                    <input type="hidden" name="id" value={q.id} />
                    <input type="hidden" name="statusFilter" value={filter} />
                    <input type="hidden" name="rangeFilter" value={range} />
                    <ConfirmSubmit
                      title="Otkazati potvrđenu rezervaciju?"
                      message="Vozilo će ponovo postati dostupno za taj period, a klijent će dobiti email o otkazivanju."
                      confirmLabel="Da, otkaži"
                      cancelLabel="Nazad"
                      tone="danger"
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-sm font-medium text-foreground/80 transition-colors hover:border-brand hover:text-brand"
                    >
                      <X className="h-4 w-4" />
                      Otkaži rezervaciju
                    </ConfirmSubmit>
                  </form>
                )}
              </div>

              <div className="mt-3 grid gap-1.5 border-t border-border pt-3 text-sm text-muted-foreground sm:grid-cols-2">
                <span className="truncate">
                  {q.firstName} {q.lastName}
                </span>
                <a
                  href={`mailto:${q.email}`}
                  className="flex items-center gap-1.5 truncate transition-colors hover:text-brand"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0" /> {q.email}
                </a>
                <a
                  href={`tel:${q.phone}`}
                  className="flex items-center gap-1.5 transition-colors hover:text-brand"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0" /> {q.phone}
                </a>
                {q.flightNumber && (
                  <span className="flex items-center gap-1.5">
                    <Plane className="h-3.5 w-3.5 shrink-0" /> {q.flightNumber}
                  </span>
                )}
                {q.extras.length > 0 && (
                  <span className="flex items-start gap-1.5 sm:col-span-2">
                    <Package className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      {q.extras
                        .map(
                          (x) => `${x.nameHr}${x.qty > 1 ? ` ×${x.qty}` : ""}`,
                        )
                        .join(" · ")}
                    </span>
                  </span>
                )}
                {q.message && (
                  <span className="flex items-start gap-1.5 sm:col-span-2">
                    <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {q.message}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual blocks */}
      <h2 className="mt-12 font-display text-xl font-bold tracking-tight">
        Blokade vozila (servis i sl.)
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Blokirano vozilo se ne nudi u tom periodu. Blokada vrijedi cijele dane
        (uključivo oba datuma).
      </p>

      <BlockForm
        action={addBlock}
        cars={cars}
        today={today}
        occupancy={carOccupancy}
      />

      {blocks.length > 0 && (
        <div className="mt-4 space-y-2">
          {blocks.map((b) => {
            const endInclusive = new Date(b.endAt);
            endInclusive.setUTCDate(endInclusive.getUTCDate() - 1);
            return (
              <div
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-sm"
              >
                <div className="min-w-0">
                  <span className="font-medium">{b.car.title}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    · {fmtDay(b.startAt)} – {fmtDay(endInclusive)}
                    {b.reason ? ` · ${b.reason}` : ""}
                  </span>
                </div>
                <form action={removeBlock}>
                  <input type="hidden" name="id" value={b.id} />
                  <button
                    type="submit"
                    aria-label="Ukloni blokadu"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-foreground/70 transition-colors hover:border-brand hover:text-brand"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
