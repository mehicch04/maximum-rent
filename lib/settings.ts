import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { Currency } from "@/lib/currency";

const PRIMARY_CURRENCY_KEY = "primaryCurrency";

/**
 * The site's default (primary) currency, set by the owner in the admin panel.
 * Cached; invalidated via the "settings" tag when changed. Falls back to BAM.
 */
export const getPrimaryCurrency = unstable_cache(
  async (): Promise<Currency> => {
    try {
      const row = await prisma.setting.findUnique({
        where: { key: PRIMARY_CURRENCY_KEY },
      });
      return row?.value === "EUR" ? "EUR" : "BAM";
    } catch {
      return "BAM";
    }
  },
  ["primary-currency"],
  { revalidate: 300, tags: ["settings"] },
);

export { PRIMARY_CURRENCY_KEY };
