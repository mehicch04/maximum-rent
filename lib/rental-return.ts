/**
 * Choices offered when a rental is closed.
 *
 * Kept out of the server action file on purpose: a "use server" module may
 * only export async functions. Exporting these arrays from there left them
 * undefined in the browser, and the modal threw the moment it tried to list
 * them. Both the form and the action read them from here instead.
 */

export const FUEL_LEVELS = ["Prazan", "1/4", "1/2", "3/4", "Pun"] as const;

export type FuelLevel = (typeof FUEL_LEVELS)[number];

/** What the guest can be told about their deposit. */
export const DEPOSIT_STATUSES = [
  { value: "RETURNED", label: "Vraćen u cijelosti" },
  { value: "PARTIAL", label: "Djelimično zadržan" },
  { value: "WITHHELD", label: "Zadržan zbog štete" },
] as const;

export type DepositStatus = (typeof DEPOSIT_STATUSES)[number]["value"];
