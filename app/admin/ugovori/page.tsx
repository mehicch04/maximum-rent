import { FileSignature, Info } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCompany } from "@/lib/company";
import { HandoverBoard } from "@/components/admin/handover/HandoverBoard";
import type { HandoverItem } from "@/components/admin/handover/types";

export const dynamic = "force-dynamic";

export default async function AdminHandoverPage() {
  // Only what can actually be handed over: confirmed, and not already gone.
  // Today counts from midnight, so a pickup earlier this morning that has not
  // happened yet does not vanish from the desk.
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // Issuer details for the contract header, with the same fallback the rest of
  // the site uses so a contract is never printed without them.
  const company = await getCompany();
  const issuer = {
    name: company.name,
    address: company.address ?? "",
    taxId: company.taxId ?? "",
    phone: company.phones[0]?.value ?? "",
    email: company.email,
  };

  let items: HandoverItem[] = [];
  let failed = false;

  try {
    const rows = await prisma.inquiry.findMany({
      where: { status: "CONFIRMED", pickupAt: { gte: startOfToday } },
      orderBy: { pickupAt: "asc" },
      take: 100,
      include: {
        car: { select: { title: true, plate: true } },
        pickupLocation: { select: { name: true } },
        returnLocation: { select: { name: true } },
        extras: true,
      },
    });

    items = rows.map((r) => ({
      id: r.id,
      reference: r.reference,
      pickupAt: r.pickupAt.toISOString(),
      returnAt: r.returnAt.toISOString(),
      guest: [r.firstName, r.lastName].filter(Boolean).join(" "),
      email: r.email ?? "",
      phone: r.phone ?? "",
      carTitle: r.car?.title ?? r.carTitleSnapshot ?? "",
      plate: r.car?.plate ?? "",
      pickupLocation: r.pickupLocation?.name ?? "",
      returnLocation: r.returnLocation?.name ?? "",
      rentalDays: r.rentalDays ?? 1,
      totalPrice: r.totalPrice != null ? Number(r.totalPrice) : null,
      extras: r.extras.map((e) => ({ name: e.nameHr, qty: e.qty })),
    }));
  } catch (err) {
    console.error("[handover] failed:", err);
    failed = true;
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-foreground">
          <FileSignature className="h-6 w-6 text-brand-strong" />
          Ugovori i primopredaja
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Priprema ugovora pri izdavanju vozila. Prikazane su potvrđene
          rezervacije čije preuzimanje tek dolazi.
        </p>
      </div>

      {failed ? (
        <p className="mt-6 rounded-xl border border-brand/40 bg-brand/[0.06] p-3 text-sm">
          Podaci se trenutno ne mogu učitati. Pokušajte osvježiti stranicu.
        </p>
      ) : (
        <div className="mt-6">
          <HandoverBoard items={items} company={issuer} />
        </div>
      )}

      <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Izmjene u ugovoru ne mijenjaju samu rezervaciju. Za trajnu promjenu
        uredite rezervaciju na stranici Rezervacije.
      </p>
    </div>
  );
}
