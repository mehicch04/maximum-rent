/** One reservation ready for handover, flattened for the client components. */
export type HandoverItem = {
  id: string;
  reference: string;
  pickupAt: string;
  returnAt: string;
  guest: string;
  email: string;
  phone: string;
  carTitle: string;
  plate: string;
  pickupLocation: string;
  returnLocation: string;
  rentalDays: number;
  /** Pickup time already passed and the car has not gone out. */
  overdue?: boolean;
  totalPrice: number | null;
  extras: { name: string; qty: number }[];
};

export const FUEL_LEVELS = ["1/4", "1/2", "3/4", "Puno"] as const;
export type FuelLevel = (typeof FUEL_LEVELS)[number];
