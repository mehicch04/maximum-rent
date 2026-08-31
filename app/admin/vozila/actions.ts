"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, tokenValid } from "@/lib/admin-auth";
import { uploadVehicleImage } from "@/lib/supabase-admin";
import { vehicleSchema } from "@/lib/vehicle-schema";
import { slugify } from "@/lib/vehicle-options";

async function requireAdmin() {
  const ok = await tokenValid(cookies().get(ADMIN_COOKIE)?.value);
  if (!ok) redirect("/admin/login");
}

export type SaveResult = { ok: boolean; error?: string };

function bool(v: FormDataEntryValue | null) {
  return v === "true" || v === "on" || v === "1";
}

function parse(formData: FormData) {
  const brand = String(formData.get("brand") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const titleRaw = String(formData.get("title") ?? "").trim();
  return {
    brand,
    model,
    title: titleRaw || `${brand} ${model}`.trim(),
    year: formData.get("year"),
    carClass: formData.get("carClass"),
    categories: formData.getAll("categories").map(String),
    transmission: formData.get("transmission"),
    fuelType: formData.get("fuelType"),
    passengers: formData.get("passengers"),
    doors: formData.get("doors") || 4,
    pricePerDay: formData.get("pricePerDay") || undefined,
    seasonalPrice: formData.get("seasonalPrice") || undefined,
    currency: String(formData.get("currency") || "BAM"),
    emissionClass: String(formData.get("emissionClass") || "").trim() || undefined,
    descriptionHr: String(formData.get("descriptionHr") || "").trim() || undefined,
    descriptionEn: String(formData.get("descriptionEn") || "").trim() || undefined,
    isAvailable: bool(formData.get("isAvailable")),
    isFeatured: bool(formData.get("isFeatured")),
    sortOrder: formData.get("sortOrder") || 0,
  };
}

/**
 * Create or update a vehicle. Handles image uploads to Supabase Storage:
 * `existingImages` (already-hosted URLs kept by the user) are merged with any
 * freshly uploaded `newImages` files. Returns a result object so the client
 * form can show inline success/error states.
 */
export async function saveVehicle(formData: FormData): Promise<SaveResult> {
  await requireAdmin();

  const id = formData.get("id") ? String(formData.get("id")) : null;
  const parsed = vehicleSchema.safeParse(parse(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Neispravni podaci.",
    };
  }
  const { categories, ...rest } = parsed.data;

  // Merge kept images with newly uploaded files.
  const existing = formData.getAll("existingImages").map(String).filter(Boolean);
  const files = formData
    .getAll("newImages")
    .filter((f): f is File => f instanceof File && f.size > 0);

  let uploaded: string[] = [];
  try {
    uploaded = await Promise.all(files.map(uploadVehicleImage));
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Greška pri uploadu slike.",
    };
  }
  const images = [...existing, ...uploaded];

  try {
    if (id) {
      await prisma.car.update({
        where: { id },
        data: { ...rest, categories: { set: categories }, images },
      });
    } else {
      await prisma.car.create({
        data: {
          ...rest,
          categories,
          images,
          slug: slugify(`${rest.brand}-${rest.model}-${rest.year}`),
        },
      });
    }
  } catch (e) {
    const msg =
      e instanceof Error && e.message.includes("Unique")
        ? "Vozilo s tim nazivom/godinom već postoji (slug nije jedinstven)."
        : "Greška pri spremanju u bazu.";
    return { ok: false, error: msg };
  }

  revalidatePath("/admin/vozila");
  revalidatePath("/vozila");
  revalidatePath("/");
  revalidateTag("fleet");
  return { ok: true };
}

/** Delete a vehicle. Form-action style (redirect back to the list). */
export async function deleteVehicle(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    try {
      await prisma.car.delete({ where: { id } });
    } catch {
      // ignore — already gone or blocked by relation
    }
  }
  revalidatePath("/admin/vozila");
  revalidatePath("/vozila");
  revalidatePath("/");
  revalidateTag("fleet");
  redirect("/admin/vozila");
}
