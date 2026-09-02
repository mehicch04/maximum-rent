import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export type ExtraPricing = "PER_DAY" | "PER_RENTAL" | "INCLUDED";

export type ExtraItem = {
  id: string;
  nameHr: string;
  nameEn: string;
  noteHr: string | null;
  noteEn: string | null;
  pricing: ExtraPricing;
  price: number;
  maxQty: number;
  /** Total pieces owned; availability is worked out against this. */
  totalStock: number;
};

/**
 * Extras offered with a booking. Cached like the fleet — the list changes only
 * when the owner edits it in the admin, and it is read on every inquiry modal.
 */
export const getActiveExtras = unstable_cache(
  async (): Promise<ExtraItem[]> => {
    try {
      const rows = await prisma.extra.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { nameHr: "asc" }],
      });
      return rows.map((e) => ({
        id: e.id,
        nameHr: e.nameHr,
        nameEn: e.nameEn,
        noteHr: e.noteHr,
        noteEn: e.noteEn,
        pricing: e.pricing as ExtraPricing,
        price: Number(e.price),
        maxQty: e.maxQty,
        totalStock: e.totalStock,
      }));
    } catch {
      // Never let a missing table break the booking flow.
      return [];
    }
  },
  ["active-extras"],
  { revalidate: 300, tags: ["extras"] },
);

/** Whole rental days, minimum 1 — used to price PER_DAY extras. */
export function rentalDays(pickupAt: Date, returnAt: Date): number {
  const ms = returnAt.getTime() - pickupAt.getTime();
  if (!Number.isFinite(ms) || ms <= 0) return 1;
  return Math.max(1, Math.ceil(ms / 86_400_000));
}

/** What one chosen extra costs for the whole rental. */
export function extraLineTotal(
  pricing: ExtraPricing,
  unitPrice: number,
  qty: number,
  days: number,
): number {
  if (pricing === "INCLUDED") return 0;
  if (pricing === "PER_DAY") return unitPrice * qty * days;
  return unitPrice * qty;
}
