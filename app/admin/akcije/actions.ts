"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, tokenValid } from "@/lib/admin-auth";
import { uploadVehicleImage } from "@/lib/supabase-admin";

async function requireAdmin() {
  const ok = await tokenValid(cookies().get(ADMIN_COOKIE)?.value);
  if (!ok) redirect("/admin/login");
}

function refresh() {
  revalidateTag("promotions");
  revalidatePath("/", "layout");
  revalidatePath("/admin/akcije");
}

const text = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim() || null;

function day(fd: FormData, k: string, end: boolean): Date | null {
  const v = String(fd.get(k) ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const guess = new Date(`${v}T${end ? "23:59:59" : "00:00:00"}Z`);
  if (Number.isNaN(guess.getTime())) return null;
  const zone = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Sarajevo", timeZoneName: "shortOffset" })
    .formatToParts(guess)
    .find((p) => p.type === "timeZoneName")?.value;
  const hours = Number(zone?.match(/GMT([+-]\d+)/)?.[1] ?? 1);
  return new Date(guess.getTime() - hours * 3_600_000);
}

export async function savePromotion(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const titleHr = text(formData, "titleHr");
  if (!titleHr) redirect(`/admin/akcije?error=title${id ? `&edit=${id}` : ""}`);

  let image = text(formData, "currentImage");
  if (formData.get("removeImage") === "on") image = null;
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    try {
      image = await uploadVehicleImage(file);
    } catch (err) {
      console.error("[akcije] upload failed:", err);
      redirect(`/admin/akcije?error=upload${id ? `&edit=${id}` : ""}`);
    }
  }

  const carId = text(formData, "carId");
  const data = {
    titleHr: titleHr as string,
    titleEn: text(formData, "titleEn"),
    titleDe: text(formData, "titleDe"),
    titleEs: text(formData, "titleEs"),
    textHr: text(formData, "textHr"),
    textEn: text(formData, "textEn"),
    textDe: text(formData, "textDe"),
    textEs: text(formData, "textEs"),
    badge: text(formData, "badge"),
    link: text(formData, "link"),
    image,
    carId,
    startsAt: day(formData, "startsAt", false),
    endsAt: day(formData, "endsAt", true),
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
    isActive: formData.get("isActive") === "on",
  };

  try {
    if (id) await prisma.promotion.update({ where: { id }, data });
    else await prisma.promotion.create({ data });
  } catch (err) {
    console.error("[akcije] save failed:", err);
    redirect("/admin/akcije?error=db");
  }

  refresh();
  redirect("/admin/akcije?saved=1");
}

export async function togglePromotion(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    try {
      await prisma.promotion.update({ where: { id }, data: { isActive: formData.get("next") === "1" } });
    } catch {}
  }
  refresh();
}

export async function deletePromotion(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    try {
      await prisma.promotion.delete({ where: { id } });
    } catch {}
  }
  refresh();
}
