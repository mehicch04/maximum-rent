"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Car as CarIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmSubmit } from "@/components/ui/ConfirmSubmit";
import { VehicleFormModal } from "./VehicleFormModal";
import { carClassLabel, type AdminVehicle } from "@/lib/vehicle-options";
import type { SaveResult } from "@/app/admin/vozila/actions";

type Props = {
  vehicles: AdminVehicle[];
  saveAction: (formData: FormData) => Promise<SaveResult>;
  deleteAction: (formData: FormData) => void;
};

/** What a vehicle is doing right now, worked out fresh on every page load. */
export type LiveStatus = {
  busy: boolean;
  /** "u najmu", "servis", "oštećenje"… */
  reason: string;
  /** When it comes back, already formatted. */
  until: string;
};

export function VehicleManager({
  vehicles,
  saveAction,
  deleteAction,
  live = {},
}: Props & { live?: Record<string, LiveStatus> }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminVehicle | null>(null);

  function openAdd() {
    setEditing(null);
    setShowForm(true);
  }
  function openEdit(v: AdminVehicle) {
    setEditing(v);
    setShowForm(true);
  }
  function onSaved() {
    setShowForm(false);
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight">
            Vozni park
          </h1>
          <p className="text-sm text-muted-foreground">
            {vehicles.length}{" "}
            {vehicles.length === 1 ? "vozilo" : "vozila"} u bazi
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Dodaj vozilo
        </button>
      </div>

      {vehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <CarIcon className="h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            Još nema vozila u bazi.
          </p>
          <button
            type="button"
            onClick={openAdd}
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            Dodaj prvo vozilo
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-3 shadow-card sm:flex-row sm:items-center"
            >
              {/* thumb */}
              <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-xl bg-surface-muted sm:h-16 sm:w-24">
                {v.images?.[0] ? (
                  <Image
                    src={v.images[0]}
                    alt={v.title}
                    fill
                    sizes="96px"
                    className="object-contain p-1.5"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <CarIcon className="h-6 w-6" />
                  </div>
                )}
              </div>

              {/* info */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate font-semibold">{v.title}</h3>
                  {v.isFeatured && (
                    <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-brand">
                      Izdvojeno
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      v.isAvailable
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-muted-foreground/10 text-muted-foreground"
                    }`}
                  >
                    {v.isAvailable ? "U ponudi" : "Nije u ponudi"}
                  </span>
                </div>

                {/*
                 * What the car is doing right now, as opposed to whether it is
                 * offered at all. The two are easy to confuse: a vehicle can be
                 * in the catalogue and still be out with a guest today, and
                 * until now this screen showed only the former.
                 */}
                {/*
                  * Shown for withdrawn cars too. One that is out with a guest
                  * is still on the road, and hiding its status was how it
                  * disappeared from view the moment it left the offer.
                  */}
                {(v.isAvailable || live[v.id]?.busy) && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs">
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        live[v.id]?.busy ? "bg-brand" : "bg-emerald-500"
                      }`}
                    />
                    {live[v.id]?.busy ? (
                      <span className="text-brand-strong">
                        {live[v.id].reason}
                        {live[v.id].until ? ` do ${live[v.id].until}` : ""}
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        Slobodno
                      </span>
                    )}
                  </p>
                )}
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {carClassLabel(v.carClass)} · {v.year} ·{" "}
                  {v.pricePerDay != null
                    ? `${v.pricePerDay} ${v.currency}/dan`
                    : "cijena nije postavljena"}
                </p>
              </div>

              {/* actions */}
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(v)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-sm font-medium text-foreground/80 transition-colors hover:border-brand hover:text-brand"
                >
                  <Pencil className="h-4 w-4" />
                  Uredi
                </button>
                <form action={deleteAction}>
                  <input type="hidden" name="id" value={v.id} />
                  <ConfirmSubmit
                    title="Obrisati vozilo?"
                    message={`„${v.title}“ će biti trajno uklonjeno iz baze i nestat će sa sajta. Ova radnja se ne može poništiti.`}
                    confirmLabel="Da, obriši"
                    cancelLabel="Nazad"
                    tone="danger"
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-sm font-medium text-foreground/80 transition-colors hover:border-brand hover:text-brand"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Obriši</span>
                  </ConfirmSubmit>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <VehicleFormModal
          vehicle={editing}
          saveAction={saveAction}
          onClose={() => setShowForm(false)}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}
