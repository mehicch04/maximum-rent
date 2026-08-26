import { z } from "zod";

export const inquirySchema = z.object({
  carId: z.string().min(1).optional(),
  carTitle: z.string().min(1),
  pickupLocationId: z.string().min(1).optional(),
  returnLocationId: z.string().min(1).optional(),
  pickupAt: z.string().datetime(),
  returnAt: z.string().datetime(),
  firstName: z.string().trim().min(2).max(60),
  lastName: z.string().trim().min(2).max(60),
  email: z.string().trim().email(),
  phone: z.string().trim().min(6).max(30),
  flightNumber: z.string().trim().max(20).optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
  locale: z.enum(["hr", "en"]).default("hr"),
  /** Currency shown to the guest, so the emails can match what they saw. */
  currency: z.enum(["BAM", "EUR"]).default("BAM"),
  /**
   * Optional equipment picked by the guest. Only ids and quantities travel —
   * prices are re-read from the database so they cannot be tampered with.
   */
  extras: z
    .array(
      z.object({
        id: z.string().min(1),
        qty: z.number().int().min(1).max(20),
      }),
    )
    .max(20)
    .optional(),
  })
  .refine(
    (d) => new Date(d.returnAt).getTime() > new Date(d.pickupAt).getTime(),
    {
      // Without this the browser could post a return date before the pickup:
      // the rental would read as one day, and the overlap check that guards
      // against double-booking would compare an inverted period.
      message: "returnAt must be after pickupAt",
      path: ["returnAt"],
    },
  );

export type InquiryInput = z.infer<typeof inquirySchema>;

export const contactRequestSchema = z.object({
  type: z.enum(["contact", "business"]).default("contact"),
  firstName: z.string().trim().min(2).max(60),
  lastName: z.string().trim().min(2).max(60),
  email: z.string().trim().email(),
  phone: z.string().trim().min(6).max(30),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  locale: z.enum(["hr", "en"]).default("hr"),
});

export type ContactRequestInput = z.infer<typeof contactRequestSchema>;
