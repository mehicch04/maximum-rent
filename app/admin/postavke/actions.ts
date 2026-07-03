"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, tokenValid } from "@/lib/admin-auth";
import { PRIMARY_CURRENCY_KEY } from "@/lib/settings";

async function requireAdmin() {
  const ok = await tokenValid(cookies().get(ADMIN_COOKIE)?.value);
  if (!ok) redirect("/admin/login");
}

export async function setPrimaryCurrency(formData: FormData) {
  await requireAdmin();
  const value = String(formData.get("currency")) === "EUR" ? "EUR" : "BAM";

  await prisma.setting.upsert({
    where: { key: PRIMARY_CURRENCY_KEY },
    create: { key: PRIMARY_CURRENCY_KEY, value },
    update: { value },
  });

  // Refresh the cached setting and re-render the public site with the new default.
  revalidateTag("settings");
  revalidatePath("/", "layout");
  redirect("/admin/postavke?saved=1");
}
