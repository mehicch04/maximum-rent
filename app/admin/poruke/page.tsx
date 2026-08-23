import Link from "next/link";
import { Building2, Check, Mail, MessageSquare, Phone, RotateCcw, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ConfirmSubmit } from "@/components/ui/ConfirmSubmit";
import { setMessageStatus, deleteMessage } from "./actions";

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

const FILTERS = [
  { key: "all", label: "Sve" },
  { key: "new", label: "Nepročitane" },
  { key: "business", label: "Poslovne" },
] as const;

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: RawSearchParams;
}) {
  const filter = one(searchParams.filter) ?? "all";

  const where =
    filter === "new"
      ? { status: "NEW" }
      : filter === "business"
        ? { type: "BUSINESS" }
        : {};

  const [messages, newCount] = await Promise.all([
    prisma.contactRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.contactRequest.count({ where: { status: "NEW" } }),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Poruke
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Upiti s kontakt stranice i stranice poslovne ponude.
            {newCount > 0 && (
              <span className="ml-1 font-medium text-brand-strong">
                {newCount} nepročitano.
              </span>
            )}
          </p>
        </div>

        <div className="flex gap-1.5">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <Link
                key={f.key}
                href={f.key === "all" ? "/admin/poruke" : `/admin/poruke?filter=${f.key}`}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "border-brand bg-brand/10 text-brand-strong"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            Nema poruka za ovaj filter.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {messages.map((m) => {
            const isNew = m.status === "NEW";
            const isBusiness = m.type === "BUSINESS";
            return (
              <li
                key={m.id}
                className={`rounded-2xl border bg-surface p-5 shadow-card ${
                  isNew ? "border-brand/40" : "border-border"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          isBusiness
                            ? "bg-brand/15 text-brand-strong"
                            : "bg-surface-muted text-muted-foreground"
                        }`}
                      >
                        {isBusiness ? (
                          <Building2 className="h-3.5 w-3.5" />
                        ) : (
                          <MessageSquare className="h-3.5 w-3.5" />
                        )}
                        {isBusiness ? "Poslovna ponuda" : "Kontakt"}
                      </span>

                      {isNew && (
                        <span className="rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-brand-foreground">
                          Novo
                        </span>
                      )}

                      <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {m.locale === "EN" ? "EN" : "HR"}
                      </span>
                    </div>

                    <p className="mt-2.5 font-display text-lg font-semibold text-foreground">
                      {m.firstName} {m.lastName}
                    </p>
                    {m.company && (
                      <p className="text-sm text-muted-foreground">{m.company}</p>
                    )}
                  </div>

                  <p className="shrink-0 text-xs text-muted-foreground">
                    {fmt(m.createdAt)}
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
                  <a
                    href={`mailto:${m.email}`}
                    className="inline-flex items-center gap-1.5 text-brand-strong hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    {m.email}
                  </a>
                  <a
                    href={`tel:${m.phone.replace(/\([^)]*\)/g, "").replace(/[^\d+]/g, "")}`}
                    className="inline-flex items-center gap-1.5 text-brand-strong hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    {m.phone}
                  </a>
                </div>

                {m.message && (
                  <p className="mt-3 whitespace-pre-line rounded-xl bg-surface-muted p-4 text-sm leading-relaxed text-foreground">
                    {m.message}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={setMessageStatus}>
                    <input type="hidden" name="id" value={m.id} />
                    <input
                      type="hidden"
                      name="status"
                      value={isNew ? "DONE" : "NEW"}
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-brand hover:text-brand-strong"
                    >
                      {isNew ? (
                        <>
                          <Check className="h-4 w-4" />
                          Označi kao riješeno
                        </>
                      ) : (
                        <>
                          <RotateCcw className="h-4 w-4" />
                          Vrati u nepročitano
                        </>
                      )}
                    </button>
                  </form>

                  <form action={deleteMessage}>
                    <input type="hidden" name="id" value={m.id} />
                    <ConfirmSubmit
                      title="Brisanje poruke"
                      message="Obrisati ovu poruku? Radnja je trajna."
                      confirmLabel="Obriši"
                      cancelLabel="Odustani"
                      tone="danger"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-brand hover:text-brand-strong"
                    >
                      <Trash2 className="h-4 w-4" />
                      Obriši
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
