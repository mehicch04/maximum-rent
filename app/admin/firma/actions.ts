"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, tokenValid } from "@/lib/admin-auth";
import { COMPANY_FALLBACK } from "@/lib/company";

async function requireAdmin() {
  if (!(await tokenValid(cookies().get(ADMIN_COOKIE)?.value))) {
    redirect("/admin/login");
  }
}

/** Clears every cache that carries company data or prices. */
function refresh() {
  revalidateTag("company");
  revalidateTag("fleet");
  revalidatePath("/", "layout");
  revalidatePath("/admin/firma");
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const opt = (fd: FormData, k: string) => str(fd, k) || null;
const numOpt = (fd: FormData, k: string) => {
  const v = str(fd, k);
  if (!v) return null;
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

export async function saveCompany(formData: FormData) {
  await requireAdmin();

  const name = str(formData, "name") || COMPANY_FALLBACK.name;
  const email = str(formData, "email") || COMPANY_FALLBACK.email;
  const phone1 = str(formData, "phone1") || COMPANY_FALLBACK.phones[0].value;

  const data = {
    name,
    email,
    phone1,
    phone1Label: str(formData, "phone1Label") || "Tel",
    phone2: opt(formData, "phone2"),
    phone2Label: str(formData, "phone2Label") || "Mob",
    phone3: opt(formData, "phone3"),
    phone3Label: str(formData, "phone3Label") || "Fax",
    // wa.me needs digits only.
    whatsapp: str(formData, "whatsapp").replace(/\D/g, ""),
    hours: str(formData, "hours"),
    address: opt(formData, "address"),
    taxId: opt(formData, "taxId"),
    mapLat: numOpt(formData, "mapLat"),
    mapLng: numOpt(formData, "mapLng"),
    mapLink: opt(formData, "mapLink"),
    ratingScore: numOpt(formData, "ratingScore"),
    ratingCount: numOpt(formData, "ratingCount"),
    facebook: opt(formData, "facebook"),
    instagram: opt(formData, "instagram"),
  };

  try {
    await prisma.companyInfo.upsert({
      where: { id: "main" },
      create: { id: "main", ...data },
      update: data,
    });
  } catch (err) {
    console.error("[company] save failed:", err);
    redirect("/admin/firma?error=1");
  }

  refresh();
  redirect("/admin/firma?saved=1");
}

/** Turns the seasonal rates on or off for the whole fleet at once. */
export async function toggleSeasonal(formData: FormData) {
  await requireAdmin();
  const next = formData.get("next") === "1";

  try {
    await prisma.companyInfo.upsert({
      where: { id: "main" },
      create: {
        id: "main",
        name: COMPANY_FALLBACK.name,
        email: COMPANY_FALLBACK.email,
        phone1: COMPANY_FALLBACK.phones[0].value,
        whatsapp: COMPANY_FALLBACK.whatsapp,
        hours: COMPANY_FALLBACK.hours,
        seasonalPricing: next,
      },
      update: { seasonalPricing: next },
    });
  } catch (err) {
    console.error("[company] seasonal toggle failed:", err);
  }
  refresh();
}

/** URL-safe slug, keeping our diacritics readable. */
function slugify(v: string): string {
  return v
    .toLowerCase()
    .replace(/č|ć/g, "c").replace(/š/g, "s").replace(/ž/g, "z").replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "lokacija";
}

export async function saveLocation(formData: FormData) {
  await requireAdmin();

  const id = str(formData, "id");
  const name = str(formData, "name");
  if (!name) return;

  const data = {
    name,
    type: (["HEAD_OFFICE", "AIRPORT", "BUS_STATION", "CITY_OFFICE"] as const).includes(
      formData.get("type") as never,
    )
      ? (str(formData, "type") as "HEAD_OFFICE" | "AIRPORT" | "BUS_STATION" | "CITY_OFFICE")
      : ("CITY_OFFICE" as const),
    street: str(formData, "street"),
    city: str(formData, "city"),
    postalCode: str(formData, "postalCode"),
    latitude: numOpt(formData, "latitude"),
    longitude: numOpt(formData, "longitude"),
    sortOrder: Number(str(formData, "sortOrder")) || 0,
    isActive: formData.get("isActive") === "on",
  };

  try {
    if (id) {
      await prisma.location.update({ where: { id }, data });
    } else {
      await prisma.location.create({
        data: { ...data, slug: `${slugify(name)}-${Date.now().toString(36).slice(-4)}` },
      });
    }
  } catch (err) {
    console.error("[location] save failed:", err);
    redirect("/admin/firma?error=1");
  }

  refresh();
  redirect("/admin/firma?saved=1#lokacije");
}

export async function deleteLocation(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  if (!id) return;
  try {
    await prisma.location.delete({ where: { id } });
  } catch (err) {
    console.error("[location] delete failed, hiding instead:", err);
    try {
      await prisma.location.update({ where: { id }, data: { isActive: false } });
    } catch {
      /* already gone */
    }
  }
  refresh();
}
