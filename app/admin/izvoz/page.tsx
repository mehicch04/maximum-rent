import { CalendarCheck, Car, Download, FileSpreadsheet, MessageSquare } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ExportForm } from "@/components/admin/ExportForm";

export const dynamic = "force-dynamic";

export default async function AdminExportPage() {
  let counts = { inquiries: 0, cars: 0, messages: 0 };
  try {
    const [inquiries, cars, messages] = await Promise.all([
      prisma.inquiry.count(),
      prisma.car.count(),
      prisma.contactRequest.count(),
    ]);
    counts = { inquiries, cars, messages };
  } catch {
    // Counts are a convenience; the export itself still works.
  }

  const cards = [
    {
      key: "rezervacije",
      icon: CalendarCheck,
      title: "Rezervacije",
      count: counts.inquiries,
      body: "Broj upita, status, vozilo, period, lokacije, podaci gosta, dodatna oprema i napomena.",
    },
    {
      key: "vozila",
      icon: Car,
      title: "Vozila",
      count: counts.cars,
      body: "Cijeli vozni park sa specifikacijama, cijenama, depozitom i dostupnošću.",
    },
    {
      key: "poruke",
      icon: MessageSquare,
      title: "Poruke",
      count: counts.messages,
      body: "Upiti s kontakt stranice i poslovne ponude, s podacima pošiljaoca.",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Izvoz podataka
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Preuzmite svoje podatke kao Excel tabelu, spremnu za rad. Podaci su vaše
          vlasništvo i možete ih izvesti kad god želite.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.key}
              className="rounded-2xl border border-border bg-surface p-5 shadow-card"
            >
              <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-brand-strong" />
                <span className="font-display text-2xl font-bold tabular-nums text-foreground">
                  {c.count}
                </span>
              </div>
              <h2 className="mt-3 font-display text-base font-semibold text-foreground">
                {c.title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {c.body}
              </p>
            </div>
          );
        })}
      </div>

      <ExportForm />

      <div className="mt-8 rounded-2xl border border-border bg-surface-muted/50 p-5">
        <p className="flex items-center gap-2 font-display text-sm font-semibold text-foreground">
          <FileSpreadsheet className="h-4 w-4 text-brand-strong" />
          Kako otvoriti datoteku
        </p>
        <ul className="mt-2.5 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
          <li>
            Dvoklik otvara datoteku u Excelu ili LibreOfficeu, već složenu:
            zaglavlje ostaje vidljivo pri listanju, a kolone su prilagođene
            sadržaju.
          </li>
          <li>
            Na svakoj koloni je strelica za filtriranje, pa listu možete suziti
            po statusu, vozilu ili bilo čemu drugom.
          </li>
          <li>
            Datumi i cijene su pravi datumi i brojevi, pa se mogu sortirati i
            sabirati bez ikakvog podešavanja.
          </li>
        </ul>
      </div>

      <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <Download className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Datoteka se preuzima direktno na vaš uređaj i nigdje se ne pohranjuje.
      </p>
    </div>
  );
}
