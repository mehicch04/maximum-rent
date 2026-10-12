export const FUEL_LEVELS = ["Prazan", "1/4", "1/2", "3/4", "Pun"] as const;

export type FuelLevel = (typeof FUEL_LEVELS)[number];

/** What the guest can be told about their deposit. */
export const DEPOSIT_STATUSES = [
  { value: "RETURNED", label: "Vraćen u cijelosti" },
  { value: "PARTIAL", label: "Djelimično zadržan" },
  { value: "WITHHELD", label: "Zadržan zbog štete" },
] as const;

export type DepositStatus = (typeof DEPOSIT_STATUSES)[number]["value"];
