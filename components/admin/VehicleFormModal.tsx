"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import {
  AlertCircle,
  Check,
  ImageIcon,
  Loader2,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import {
  CAR_CATEGORY_OPTIONS,
  CAR_CLASS_OPTIONS,
  FUEL_OPTIONS,
  TRANSMISSION_OPTIONS,
  type AdminVehicle,
} from "@/lib/vehicle-options";
import type { SaveResult } from "@/app/admin/vozila/actions";

type Props = {
  vehicle: AdminVehicle | null; // null = add new
  saveAction: (formData: FormData) => Promise<SaveResult>;
  onClose: () => void;
  onSaved: () => void;
};

const field =
  "h-10 w-full min-w-0 rounded-xl border bg-background px-3 text-base outline-none transition-colors focus:ring-2 focus:ring-ring/30 sm:text-sm";
const lbl = "mb-1 block text-xs font-medium text-muted-foreground";

export function VehicleFormModal({
  vehicle,
  saveAction,
  onClose,
  onSaved,
}: Props) {
  const editing = Boolean(vehicle);
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

  // ── form state ──
  const [brand, setBrand] = useState(vehicle?.brand ?? "");
  const [model, setModel] = useState(vehicle?.model ?? "");
  const [title, setTitle] = useState(vehicle?.title ?? "");
  const [year, setYear] = useState(String(vehicle?.year ?? new Date().getFullYear()));
  const [carClass, setCarClass] = useState(vehicle?.carClass ?? "");
  const [categories, setCategories] = useState<string[]>(vehicle?.categories ?? []);
  const [transmission, setTransmission] = useState(vehicle?.transmission ?? "");
  const [fuelType, setFuelType] = useState(vehicle?.fuelType ?? "");
  const [passengers, setPassengers] = useState(String(vehicle?.passengers ?? 5));
  const [doors, setDoors] = useState(String(vehicle?.doors ?? 4));
  const [plate, setPlate] = useState(vehicle?.plate ?? "");
  const [pricePerDay, setPricePerDay] = useState(
    vehicle?.pricePerDay != null ? String(vehicle.pricePerDay) : "",
  );
  const [seasonalPrice, setSeasonalPrice] = useState(
    vehicle?.seasonalPrice != null ? String(vehicle.seasonalPrice) : "",
  );
  const [currency, setCurrency] = useState(vehicle?.currency ?? "BAM");
  const [emissionClass, setEmissionClass] = useState(vehicle?.emissionClass ?? "");
  const [descriptionHr, setDescriptionHr] = useState(vehicle?.descriptionHr ?? "");
  const [descriptionEn, setDescriptionEn] = useState(vehicle?.descriptionEn ?? "");
  const [isAvailable, setIsAvailable] = useState(vehicle?.isAvailable ?? true);
  const [isFeatured, setIsFeatured] = useState(vehicle?.isFeatured ?? false);
  const [sortOrder, setSortOrder] = useState(String(vehicle?.sortOrder ?? 0));

  // images
  const [existingImages, setExistingImages] = useState<string[]>(
    vehicle?.images ?? [],
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previews = useMemo(
    () => newFiles.map((f) => ({ file: f, url: URL.createObjectURL(f) })),
    [newFiles],
  );
  useEffect(() => {
    return () => previews.forEach((p) => URL.revokeObjectURL(p.url));
  }, [previews]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && !pending && (confirming ? setConfirming(false) : onClose());
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [pending, confirming, onClose]);

  function toggleCategory(value: string) {
    setCategories((c) =>
      c.includes(value) ? c.filter((x) => x !== value) : [...c, value],
    );
  }

  function validate(): boolean {
    const errs: Record<string, boolean> = {};
    if (!brand.trim()) errs.brand = true;
    if (!model.trim()) errs.model = true;
    if (!year || Number(year) < 1990) errs.year = true;
    if (!carClass) errs.carClass = true;
    if (!transmission) errs.transmission = true;
    if (!fuelType) errs.fuelType = true;
    if (!passengers || Number(passengers) < 1) errs.passengers = true;
    if (pricePerDay && Number(pricePerDay) <= 0) errs.pricePerDay = true;
    if (seasonalPrice && Number(seasonalPrice) <= 0) errs.seasonalPrice = true;
    setFieldErrors(errs);
    if (Object.keys(errs).length) {
      setError("Molimo popunite obavezna polja ispravno.");
      return false;
    }
    setError(null);
    return true;
  }

  function onSaveClick() {
    if (validate()) setConfirming(true);
  }

  function doSave() {
    setConfirming(false);
    setError(null);
    const fd = new FormData();
    if (vehicle) fd.set("id", vehicle.id);
    fd.set("brand", brand);
    fd.set("model", model);
    fd.set("title", title);
    fd.set("year", year);
    fd.set("carClass", carClass);
    categories.forEach((c) => fd.append("categories", c));
    fd.set("transmission", transmission);
    fd.set("fuelType", fuelType);
    fd.set("passengers", passengers);
    fd.set("doors", doors);
    if (plate.trim()) fd.set("plate", plate.trim());
    if (pricePerDay) fd.set("pricePerDay", pricePerDay);
    if (seasonalPrice) fd.set("seasonalPrice", seasonalPrice);
    fd.set("currency", currency);
    fd.set("emissionClass", emissionClass);
    fd.set("descriptionHr", descriptionHr);
    fd.set("descriptionEn", descriptionEn);
    fd.set("isAvailable", String(isAvailable));
    fd.set("isFeatured", String(isFeatured));
    fd.set("sortOrder", sortOrder);
    existingImages.forEach((u) => fd.append("existingImages", u));
    newFiles.forEach((f) => fd.append("newImages", f));

    startTransition(async () => {
      const res = await saveAction(fd);
      if (res.ok) {
        setSuccess(true);
        setTimeout(onSaved, 700);
      } else {
        setError(res.error ?? "Greška pri spremanju.");
      }
    });
  }

  const border = (key: string) =>
    fieldErrors[key] ? "border-red-500" : "border-border focus:border-brand";

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:items-center">
      <div className="my-4 w-full max-w-2xl rounded-2xl border border-border bg-surface shadow-card-hover">
        {/* header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-bold tracking-tight">
            {editing ? "Uredi vozilo" : "Dodaj novo vozilo"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-foreground/70 transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* body */}
        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-5 py-5">
          {/* basic */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Marka *</label>
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="BMW"
                className={`${field} ${border("brand")}`}
              />
            </div>
            <div>
              <label className={lbl}>Model *</label>
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="X5 xDrive40d"
                className={`${field} ${border("model")}`}
              />
            </div>
          </div>

          <div>
            <label className={lbl}>
              Naziv (prikazuje se na sajtu — ostavi prazno za automatski)
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`${brand} ${model}`.trim() || "BMW X5 xDrive40d"}
              className={`${field} border-border focus:border-brand`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className={lbl}>Godina *</label>
              <input
                inputMode="numeric"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className={`${field} ${border("year")}`}
              />
            </div>
            <div>
              <label className={lbl}>Putnici *</label>
              <input
                inputMode="numeric"
                value={passengers}
                onChange={(e) => setPassengers(e.target.value)}
                className={`${field} ${border("passengers")}`}
              />
            </div>
            <div>
              <label className={lbl}>Vrata</label>
              <input
                inputMode="numeric"
                value={doors}
                onChange={(e) => setDoors(e.target.value)}
                className={`${field} border-border focus:border-brand`}
              />
            </div>
            <div>
              <label className={lbl}>Euro norma</label>
              <input
                value={emissionClass}
                onChange={(e) => setEmissionClass(e.target.value)}
                placeholder="Euro 6"
                className={`${field} border-border focus:border-brand`}
              />
            </div>
          </div>

          {/* selects */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className={lbl}>Klasa *</label>
              <select
                value={carClass}
                onChange={(e) => setCarClass(e.target.value)}
                className={`${field} ${border("carClass")}`}
              >
                <option value="" disabled>
                  Odaberite…
                </option>
                {CAR_CLASS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={lbl}>Mjenjač *</label>
              <select
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
                className={`${field} ${border("transmission")}`}
              >
                <option value="" disabled>
                  Odaberite…
                </option>
                {TRANSMISSION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={lbl}>Gorivo *</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className={`${field} ${border("fuelType")}`}
              >
                <option value="" disabled>
                  Odaberite…
                </option>
                {FUEL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* categories (filter tags) */}
          <div>
            <label className={lbl}>Kategorije (filteri na sajtu)</label>
            <div className="flex flex-wrap gap-1.5">
              {CAR_CATEGORY_OPTIONS.map((o) => {
                const on = categories.includes(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => toggleCategory(o.value)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      on
                        ? "border-brand bg-brand text-brand-foreground"
                        : "border-border text-foreground/70 hover:border-brand hover:text-brand"
                    }`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* price */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <label className={lbl}>Cijena / dan</label>
              <input
                inputMode="decimal"
                value={pricePerDay}
                onChange={(e) => setPricePerDay(e.target.value)}
                placeholder="120"
                className={`${field} ${border("pricePerDay")}`}
              />
            </div>
            <div>
              <label className={lbl}>Registarska oznaka</label>
              <input
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                placeholder="J45-M-987"
                className={field}
              />
            </div>
            <div>
              <label className={lbl}>Sezonska cijena</label>
              <input
                inputMode="decimal"
                value={seasonalPrice}
                onChange={(e) => setSeasonalPrice(e.target.value)}
                placeholder="neobavezno"
                className={`${field} ${border("seasonalPrice")}`}
              />
            </div>
            <div>
              <label className={lbl}>Valuta</label>
              <input
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={`${field} border-border focus:border-brand`}
              />
            </div>
            <div>
              <label className={lbl}>Redoslijed (manji = gore)</label>
              <input
                inputMode="numeric"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className={`${field} border-border focus:border-brand`}
              />
            </div>
          </div>

          {/* descriptions */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={lbl}>Opis (HR)</label>
              <textarea
                value={descriptionHr}
                onChange={(e) => setDescriptionHr(e.target.value)}
                rows={3}
                className={`${field} h-auto resize-none border-border py-2 focus:border-brand`}
              />
            </div>
            <div>
              <label className={lbl}>Opis (EN)</label>
              <textarea
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                rows={3}
                className={`${field} h-auto resize-none border-border py-2 focus:border-brand`}
              />
            </div>
          </div>

          {/* toggles */}
          <div className="flex flex-wrap gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="h-4 w-4 accent-brand"
              />
              Dostupno
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 accent-brand"
              />
              Izdvojeno (homepage)
            </label>
          </div>

          {/* images */}
          <div>
            <label className={lbl}>Slike (prva je glavna)</label>
            <div className="flex flex-wrap gap-2">
              {existingImages.map((url) => (
                <div
                  key={url}
                  className="group relative h-20 w-28 overflow-hidden rounded-lg border border-border bg-surface-muted"
                >
                  <Image
                    src={url}
                    alt=""
                    fill
                    sizes="112px"
                    className="object-contain p-1"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setExistingImages((imgs) => imgs.filter((u) => u !== url))
                    }
                    className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-md bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {previews.map((p, i) => (
                <div
                  key={p.url}
                  className="group relative h-20 w-28 overflow-hidden rounded-lg border border-brand/40 bg-surface-muted"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.url}
                    alt=""
                    className="h-full w-full object-contain p-1"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setNewFiles((files) => files.filter((_, idx) => idx !== i))
                    }
                    className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-md bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <span className="absolute bottom-0 left-0 right-0 bg-brand/90 py-0.5 text-center text-[10px] font-medium text-brand-foreground">
                    nova
                  </span>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-20 w-28 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:border-brand hover:text-brand"
              >
                <UploadCloud className="h-5 w-5" />
                <span className="text-[11px]">Dodaj sliku</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  if (files.length) setNewFiles((cur) => [...cur, ...files]);
                  e.target.value = "";
                }}
              />
            </div>
            {existingImages.length + newFiles.length === 0 && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                <ImageIcon className="h-3.5 w-3.5" />
                Bez slike vozilo prikazuje zadanu ikonu.
              </p>
            )}
          </div>

          {/* error / success banner */}
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600">
              <Check className="h-4 w-4" />
              Sačuvano.
            </div>
          )}
        </div>

        {/* footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="inline-flex h-10 items-center rounded-xl border border-border px-4 text-sm font-medium text-foreground/80 transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
          >
            Odustani
          </button>
          <button
            type="button"
            onClick={onSaveClick}
            disabled={pending || success}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-700 disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {pending
              ? newFiles.length
                ? "Upload i spremanje…"
                : "Spremanje…"
              : editing
                ? "Sačuvaj izmjene"
                : "Dodaj vozilo"}
          </button>
        </div>
      </div>

      {/* confirm sub-modal */}
      {confirming && (
        <div
          className="fixed inset-0 z-[85] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setConfirming(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-card-hover"
          >
            <h3 className="font-display text-lg font-bold tracking-tight">
              {editing ? "Spremiti izmjene?" : "Dodati vozilo?"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {editing
                ? "Podaci o vozilu će biti ažurirani u bazi i odmah vidljivi na sajtu."
                : "Novo vozilo će biti dodano u bazu i prikazano na sajtu."}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="inline-flex h-10 items-center rounded-xl border border-border px-4 text-sm font-medium text-foreground/80 transition-colors hover:border-brand hover:text-brand"
              >
                Nazad
              </button>
              <button
                type="button"
                onClick={doSave}
                className="inline-flex h-10 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-700"
              >
                {editing ? "Da, sačuvaj" : "Da, dodaj"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
