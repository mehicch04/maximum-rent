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
import { effectivePrice, getCompany } from "@/lib/company";
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
import { createContinuation } from "./extend-actions";
import { NewReservationButton } from "@/components/admin/NewReservationButton";
import { StartRentalButton } from "@/components/admin/StartRentalButton";
import { ConflictNotice } from "@/components/admin/ConflictNotice";
import { SearchBox } from "@/components/admin/SearchBox";
import { ReservationDetail } from "@/components/admin/ReservationDetail";
import { DueBadge } from "@/components/admin/DueBadge";
import { FinishRentalButton } from "@/components/admin/FinishRentalButton";
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
  { id: "active", label: "Aktivne" },
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
  IN_PROGRESS: {
    label: "U toku",
    cls: "bg-brand/15 text-brand-strong",
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
  started: { text: "Vozilo je izdato. Rezervacija je sada u toku.", tone: "ok" },
  continued: {
    text: "Nastavak najma je kreiran na drugom vozilu.",
    tone: "ok",
  },
  continuedpartial: {
    text: "Nastavak je kreiran, ali dio opreme nije bio slobodan za te datume.",
    tone: "warn",
  },
  finished: {
    text: "Najam je zatvoren. Vozilo i oprema su ponovo slobodni.",
    tone: "ok",
  },
  nocar: {
    text: "Rezervaciji prvo dodijelite vozilo, pa je onda izdajte ili zatvorite.",
    tone: "err",
  },
  notactive: {
    text: "Povrat se može zabilježiti samo za najam koji je u toku.",
    tone: "err",
  },
  chargenote: {
    text: "Dodatna naplata mora imati opis troška.",
    tone: "err",
  },
  notconfirmed: {
    text: "Vozilo se može izdati samo za potvrđenu rezervaciju.",
    tone: "err",
  },
  migrated: {
    text: "Stare manuelne rezervacije su prebačene u listu rezervacija.",
    tone: "ok",
  },
  reason: {
    text: "Obnova nije sačuvana: upišite razlog vraćanja rezervacije.",
    tone: "err",
  },
    busy: {
      text: "Izmjena nije sačuvana: vozilo je u novom periodu već zauzeto.",
      tone: "err",
    },
    extras: {
      text: "Izmjena nije sačuvana: tražena oprema nije dostupna u novom periodu.",
      tone: "err",
    },
  };

/**
 * Digits from a query, but only when it actually looks like a phone number.
 *
 * Stripping non-digits from anything at all turns a reference like "MR-4TQ"
 * into "4", which then matches every phone number containing a four. A term is
 * treated as a number only when digits are what it is mostly made of.
 */
function phoneTerm(q: string): string | null {
  const digits = q.replace(/[^0-9]/g, "");
  if (digits.length < 3) return null;
  // Half or more of the characters must be digits for this to be a number.
  return digits.length * 2 >= q.replace(/\s/g, "").length ? digits : null;
}

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
  const missingExtras = one(searchParams.missing);

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
        : filter === "active"
          ? { status: "IN_PROGRESS" as const }
        : filter === "cancelled"
          ? {
              status: { in: ["CANCELLED", "COMPLETED"] } as {
                in: ("CANCELLED" | "COMPLETED")[];
              },
            }
          : {};

  /**
   * Free-text search over the fields somebody actually remembers: a name, the
   * number they were called from, the reference on the contract, or the car.
   * Case-insensitive, because nobody types names the way they were entered.
   */
  const q = (one(searchParams.q) ?? "").trim();
  const searchWhere = q
    ? {
        OR: [
          { firstName: { contains: q, mode: "insensitive" as const } },
          { lastName: { contains: q, mode: "insensitive" as const } },
          { email: { contains: q, mode: "insensitive" as const } },
          // Digits only, so "062 784 029" finds "+38762784029".
          ...(phoneTerm(q) ? [{ phone: { contains: phoneTerm(q)! } }] : []),
          { reference: { contains: q, mode: "insensitive" as const } },
          { carTitleSnapshot: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  // A search looks across everything; narrowing it by tab as well would hide
  // the very reservation somebody is trying to find.
  const where = q
    ? { ...searchWhere, ...createdAtWhere }
    : { ...statusWhere, ...createdAtWhere };

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
      // Active rentals are sorted by when they are due back, so whoever is
      // closest to running over sits at the top. Everywhere else the newest
      // enquiry is what matters.
      orderBy:
        filter === "active"
          ? { returnAt: "asc" }
          : { createdAt: "desc" },
      take: 100,
      include: {
        car: { select: { title: true, plate: true } },
        pickupLocation: { select: { name: true } },
        returnLocation: { select: { name: true } },
        extras: true,
        // Both directions of a swap, so the edit form can warn either way.
        continuesFrom: {
          select: { reference: true, carTitleSnapshot: true, pickupAt: true, returnAt: true },
        },
        continuedBy: {
          select: { reference: true, carTitleSnapshot: true, pickupAt: true, returnAt: true },
        },
      },
    }),
    prisma.carBlock.findMany({
      orderBy: { startAt: "asc" },
      include: { car: { select: { title: true } } },
    }),
    prisma.car.findMany({
      /*
       * Withdrawn vehicles are included, marked rather than hidden.
       *
       * A reservation may already point at one, and a dropdown that does not
       * contain its current value silently replaces it on save. The new
       * reservation form filters them out for itself; here they have to be
       * listed so nothing gets reassigned behind the owner's back.
       */
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        title: true,
        pricePerDay: true,
        seasonalPrice: true,
        isAvailable: true,
      },
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
    active: countByStatus.get("IN_PROGRESS") ?? 0,
    cancelled:
      (countByStatus.get("CANCELLED") ?? 0) +
      (countByStatus.get("COMPLETED") ?? 0),
    all: counts.reduce((s, c) => s + c._count, 0),
  };

  // Prisma returns Decimal, which cannot cross into a client component.
  // The rate in force today, so the live calculation in the forms matches the
  // figure the server will actually store.
  const { seasonalPricing } = await getCompany().catch(() => ({
    seasonalPricing: false,
  }));
  const carsForForm = cars.map((c) => ({
    id: c.id,
    // Withdrawn cars stay selectable when editing, but say so in the label.
    title: c.isAvailable ? c.title : `${c.title} (nije u ponudi)`,
    pricePerDay: effectivePrice(c, seasonalPricing),
  }));

  // A brand new booking should never start on a car that is out of the offer.
  const carsForNew = carsForForm.filter(
    (c) => cars.find((x) => x.id === c.id)?.isAvailable,
  );

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

        <div className="flex flex-wrap items-center gap-2">
          <SearchBox placeholder="Ime, telefon, broj rezervacije…" />
        </div>

        <NewReservationButton>
          <NewReservationForm
            action={createManualInquiry}
            cars={carsForNew}
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
          {missingExtras && (
            <span className="mt-0.5 block text-xs opacity-90">
              Nije preneseno: {missingExtras}
            </span>
          )}
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
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {q
              ? `Nema rezervacija koje odgovaraju pretrazi "${q}".`
              : "Nema rezervacija u ovom pregledu."}
          </p>
        )}

        {inquiries.map((q) => {
          const badge = STATUS_BADGE[q.status] ?? STATUS_BADGE.NEW;
          const canAct = q.status === "NEW" || q.status === "CONTACTED";
          return (
            <div
              key={q.id}
              // A rental that is out and past its hour gets a tinted card, so
              // it stands out while scrolling without shouting over the rest.
              className={`rounded-2xl border p-5 shadow-card ${
                q.status === "IN_PROGRESS" && q.returnAt < new Date()
                  ? "border-brand/50 bg-brand/[0.04]"
                  : "border-border bg-surface"
              }`}
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
                    {q.status === "IN_PROGRESS" && (
                      <>
                        {" · "}
                        <DueBadge returnAt={q.returnAt.toISOString()} />
                      </>
                    )}
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
                  <ReservationDetail
                    data={{
                      reference: q.reference,
                      status: q.status,
                      channel: q.channel,
                      guest: [q.firstName, q.lastName].filter(Boolean).join(" "),
                      email: q.email,
                      phone: q.phone,
                      flightNumber: q.flightNumber,
                      carTitle: q.car?.title ?? q.carTitleSnapshot ?? "",
                      plate: q.car?.plate ?? "",
                      pickupLocation: q.pickupLocation?.name ?? "",
                      returnLocation: q.returnLocation?.name ?? "",
                      pickupAt: q.pickupAt.toISOString(),
                      returnAt: q.returnAt.toISOString(),
                      actualPickUpTime: q.actualPickUpTime?.toISOString() ?? null,
                      actualDropOffTime: q.actualDropOffTime?.toISOString() ?? null,
                      rentalDays: q.rentalDays,
                      totalPrice: q.totalPrice != null ? Number(q.totalPrice) : null,
                      returnFuel: q.returnFuel,
                      depositStatus: q.depositStatus,
                      extraCharge: q.extraCharge != null ? Number(q.extraCharge) : null,
                      extraChargeNote: q.extraChargeNote,
                      statusNote: q.statusNote,
                      message: q.message,
                      createdAt: q.createdAt.toISOString(),
                      extras: q.extras.map((e) => ({ name: e.nameHr, qty: e.qty })),
                      continuesFrom: q.continuesFrom?.reference ?? null,
                      continuedBy: q.continuedBy.map((c) => c.reference),
                    }}
                  />
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
                        status: q.status,
                        continuesFrom: q.continuesFrom
                          ? {
                              reference: q.continuesFrom.reference,
                              carTitleSnapshot: q.continuesFrom.carTitleSnapshot,
                              pickupAt: q.continuesFrom.pickupAt.toISOString(),
                              returnAt: q.continuesFrom.returnAt.toISOString(),
                            }
                          : null,
                        continuedBy: q.continuedBy.map((c) => ({
                          reference: c.reference,
                          carTitleSnapshot: c.carTitleSnapshot,
                          pickupAt: c.pickupAt.toISOString(),
                          returnAt: c.returnAt.toISOString(),
                        })),
                        totalPrice:
                          q.totalPrice != null ? Number(q.totalPrice) : null,
                        extras: q.extras.map((e) => ({
                          extraId: e.extraId,
                          qty: e.qty,
                        })),
                      }}
                      cars={carsForForm}
                      occupancy={carOccupancy}
                      onContinue={createContinuation}
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
                {/* Only for enquiries still awaiting a decision: once a
                    booking is confirmed it holds the car itself. */}
                {canAct && (
                  <ConflictNotice
                    carId={q.carId}
                    pickupAt={q.pickupAt.toISOString()}
                    returnAt={q.returnAt.toISOString()}
                    occupancy={carOccupancy}
                    cars={carsForForm}
                  />
                )}

                {q.carId &&
                  (q.status === "IN_PROGRESS" ||
                    (q.status === "CONFIRMED" && q.pickupAt <= new Date())) && (
                  <div className="flex flex-wrap gap-2">
                    <FinishRentalButton
                      id={q.id}
                      reference={q.reference}
                      guest={[q.firstName, q.lastName].filter(Boolean).join(" ")}
                      carTitle={q.car?.title ?? q.carTitleSnapshot ?? ""}
                      returnAt={q.returnAt.toISOString()}
                      handoverMissing={q.status === "CONFIRMED"}
                    />
                  </div>
                )}

                {/*
                  * The car was pulled from the offer, most often because it is
                  * being sold. The booking can still be honoured if it is still
                  * on the lot, so this warns rather than blocks; nothing said
                  * anything at all before, and the owner found out when the
                  * guest arrived.
                  */}
                {canAct && q.car && !q.car.isAvailable && (
                  <p className="rounded-xl border border-amber-500/50 bg-amber-500/[0.07] px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
                    <strong className="font-semibold">
                      Vozilo je povučeno iz ponude.
                    </strong>{" "}
                    Provjerite je li još raspoloživo prije nego potvrdite, ili
                    kroz Uredi dodijelite drugo.
                  </p>
                )}

                {/*
                  * A missing button reads as a bug unless something says why.
                  * Shown only once the enquiry is approved, since before that
                  * a general question without a car is perfectly normal.
                  */}
                {!q.carId &&
                  (q.status === "CONFIRMED" || q.status === "IN_PROGRESS") && (
                    <p className="rounded-xl border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
                      Rezervacija nema dodijeljeno vozilo, pa se ne može izdati
                      ni zatvoriti. Odaberite vozilo kroz Uredi.
                    </p>
                  )}

                {/* Both actions need a vehicle to act on, so neither is
                    offered until one is assigned. */}
                {q.status === "CONFIRMED" && q.carId && (
                  <div className="flex flex-wrap gap-2">
                    <StartRentalButton
                      id={q.id}
                      reference={q.reference}
                      guest={[q.firstName, q.lastName].filter(Boolean).join(" ")}
                      carTitle={q.car?.title ?? q.carTitleSnapshot ?? ""}
                    />
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
