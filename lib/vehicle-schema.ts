import { z } from "zod";
import {
  CarCategory,
  CarClass,
  FuelType,
  Transmission,
} from "@prisma/client";

const currentYear = new Date().getFullYear();

export const vehicleSchema = z.object({
  brand: z.string().trim().min(1, "Marka je obavezna."),
  model: z.string().trim().min(1, "Model je obavezan."),
  title: z.string().trim().min(1, "Naziv je obavezan."),
  year: z.coerce
    .number()
    .int()
    .min(1990, "Godina mora biti od 1990.")
    .max(currentYear + 2, `Godina ne može biti veća od ${currentYear + 2}.`),
  carClass: z.nativeEnum(CarClass, {
    errorMap: () => ({ message: "Odaberite klasu vozila." }),
  }),
  categories: z.array(z.nativeEnum(CarCategory)).default([]),
  transmission: z.nativeEnum(Transmission, {
    errorMap: () => ({ message: "Odaberite mjenjač." }),
  }),
  fuelType: z.nativeEnum(FuelType, {
    errorMap: () => ({ message: "Odaberite gorivo." }),
  }),
  passengers: z.coerce
    .number()
    .int()
    .min(1, "Najmanje 1 putnik.")
    .max(50, "Previše putnika."),
  doors: z.coerce.number().int().min(2).max(6).default(4),
  pricePerDay: z.coerce
    .number()
    .positive("Cijena mora biti veća od 0.")
    .optional(),
  seasonalPrice: z.coerce
    .number()
    .positive("Sezonska cijena mora biti veća od 0.")
    .optional(),
  currency: z.string().trim().default("BAM"),
  emissionClass: z.string().trim().optional(),
  descriptionHr: z.string().trim().optional(),
  descriptionEn: z.string().trim().optional(),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
});

export type VehicleInput = z.infer<typeof vehicleSchema>;
