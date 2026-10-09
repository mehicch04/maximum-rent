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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:gap-2.5">
          {vehicles.map((v) => {
            const st = live[v.id];
            const showStatus = v.isAvailable || st?.busy;
            return (
              <div
                key={v.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card lg:flex-row lg:items-center lg:gap-4 lg:p-3"
              >
                <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-surface-muted lg:aspect-auto lg:h-20 lg:w-32 lg:rounded-xl">
                  {v.images?.[0] ? (
                    <Image
                      src={v.images[0]}
                      alt={v.title}
                      fill
                      sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 128px"
                      className="object-contain p-3 lg:p-1.5"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <CarIcon className="h-10 w-10 lg:h-6 lg:w-6" />
                    </div>
                  )}
                  <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 lg:hidden">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur ${
                        v.isAvailable
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : "bg-background/80 text-muted-foreground"
                      }`}
                    >
                      {v.isAvailable ? "U ponudi" : "Nije u ponudi"}
                    </span>
                    {v.isFeatured && (
                      <span className="rounded-full bg-brand px-2.5 py-1 text-[11px] font-semibold text-brand-foreground">
                        Izdvojeno
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 lg:flex-row lg:items-center lg:gap-4 lg:p-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-base font-semibold lg:text-sm">
                        {v.title}
                      </h3>
                      {v.isFeatured && (
                        <span className="hidden rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-brand lg:inline">
                          Izdvojeno
                        </span>
                      )}
                      <span
                        className={`hidden rounded-full px-2 py-0.5 text-[11px] font-medium lg:inline ${
                          v.isAvailable
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-muted-foreground/10 text-muted-foreground"
                        }`}
                      >
                        {v.isAvailable ? "U ponudi" : "Nije u ponudi"}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {carClassLabel(v.carClass)} · {v.year}
                      {v.plate ? ` · ${v.plate}` : ""}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                      <span className="text-base font-bold lg:text-sm">
                        {v.pricePerDay != null ? (
                          <>
                            {v.pricePerDay} {v.currency}
                            <span className="ml-1 text-xs font-normal text-muted-foreground">
                              / dan
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-normal text-muted-foreground">
                            Cijena nije postavljena
                          </span>
                        )}
                      </span>
                      {showStatus && (
                        <span className="flex items-center gap-1.5 text-xs">
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${
                              st?.busy ? "bg-brand" : "bg-emerald-500"
                            }`}
                          />
                          {st?.busy ? (
                            <span className="text-brand-strong">
                              {st.reason}
                              {st.until ? ` do ${st.until}` : ""}
                            </span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400">
                              Slobodno
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 lg:flex lg:shrink-0">
                    <button
                      type="button"
                      onClick={() => openEdit(v)}
                      className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-border px-3 text-sm font-medium text-foreground/80 transition-colors hover:border-brand hover:text-brand lg:h-9"
                    >
                      <Pencil className="h-4 w-4" />
                      Uredi
                    </button>
                    <form action={deleteAction} className="contents">
                      <input type="hidden" name="id" value={v.id} />
                      <ConfirmSubmit
                        title="Obrisati vozilo?"
                        message={`„${v.title}“ će biti trajno uklonjeno iz baze i nestat će sa sajta. Ova radnja se ne može poništiti.`}
                        confirmLabel="Da, obriši"
                        cancelLabel="Nazad"
                        tone="danger"
                        className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-border px-3 text-sm font-medium text-foreground/80 transition-colors hover:border-brand hover:text-brand lg:h-9 lg:w-auto"
                      >
                        <Trash2 className="h-4 w-4" />
                        Obriši
                      </ConfirmSubmit>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
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
