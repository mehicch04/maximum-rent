"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, tokenValid } from "@/lib/admin-auth";

async function requireAdmin() {
  const ok = await tokenValid(cookies().get(ADMIN_COOKIE)?.value);
  if (!ok) redirect("/admin/login");
}

/** Clears the cached list so the site shows the change straight away. */
function refresh() {
  revalidateTag("extras");
  revalidatePath("/admin/oprema");
}

export async function saveExtra(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const nameHr = String(formData.get("nameHr") ?? "").trim();
  const nameEn = String(formData.get("nameEn") ?? "").trim();
  if (!nameHr || !nameEn) return;

  const data = {
    nameHr,
    nameEn,
    noteHr: String(formData.get("noteHr") ?? "").trim() || null,
    noteEn: String(formData.get("noteEn") ?? "").trim() || null,
    pricing: (["PER_DAY", "PER_RENTAL", "INCLUDED"] as const).includes(
      formData.get("pricing") as never,
    )
      ? (String(formData.get("pricing")) as "PER_DAY" | "PER_RENTAL" | "INCLUDED")
      : "PER_DAY",
    price: Math.max(0, Number(formData.get("price") ?? 0) || 0),
    maxQty: Math.min(20, Math.max(1, Number(formData.get("maxQty") ?? 1) || 1)),
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
    isActive: formData.get("isActive") === "on",
  };

  try {
    if (id) await prisma.extra.update({ where: { id }, data });
    else await prisma.extra.create({ data });
  } catch (err) {
    // Most likely the table does not exist yet (`prisma db push` not run).
    console.error("[extras] save failed:", err);
    redirect("/admin/oprema?error=1");
  }

  refresh();
  redirect("/admin/oprema?saved=1");
}

export async function toggleExtra(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const next = formData.get("next") === "1";
  if (id) {
    try {
      await prisma.extra.update({ where: { id }, data: { isActive: next } });
    } catch {
      /* already gone */
    }
  }
  refresh();
}

export async function deleteExtra(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    try {
      await prisma.extra.delete({ where: { id } });
    } catch {
      /* already gone */
    }
  }
  refresh();
}
