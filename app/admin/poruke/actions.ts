"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, tokenValid } from "@/lib/admin-auth";

async function requireAdmin() {
  const ok = await tokenValid(cookies().get(ADMIN_COOKIE)?.value);
  if (!ok) redirect("/admin/login");
}

/** Marks a message as handled (or puts it back to new). */
export async function setMessageStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["NEW", "DONE"].includes(status)) return;

  try {
    await prisma.contactRequest.update({ where: { id }, data: { status } });
  } catch {
    // already gone — nothing to do
  }
  revalidatePath("/admin/poruke", "layout");
}

export async function deleteMessage(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    try {
      await prisma.contactRequest.delete({ where: { id } });
    } catch {
      // already gone
    }
  }
  revalidatePath("/admin/poruke", "layout");
}
