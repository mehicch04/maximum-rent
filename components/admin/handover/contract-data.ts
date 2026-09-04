/** Everything the contract prints, gathered from the editor. */
export type ContractData = {
  reference: string;
  guest: string;
  phone: string;
  email: string;
  address: string;
  licence: string;
  document: string;
  carTitle: string;
  plate: string;
  pickupAt: string;
  returnAt: string;
  pickupLocation: string;
  returnLocation: string;
  rentalDays: number;
  extras: { name: string; qty: number }[];
  totalPrice: string;
  mileage: string;
  fuel: string;
  condition: string;
};

const dash = (v: string | null | undefined) => (v && v.trim() ? v.trim() : "—");

/** Section title with the rows beneath it, shared by both exports. */
export type Section = { title: string; rows: [string, string][] };

/**
 * The contract laid out once, used by the PDF and the Word file alike.
 *
 * Writing it twice would guarantee the two drift apart, and a contract that
 * says different things depending on which button was pressed is worse than
 * having only one format.
 */
/**
 * "2026-09-12T10:00" written the way it is read here.
 *
 * The raw value is what the form fields hold; printing it unchanged on a
 * contract looks like a system error rather than a date.
 */
function human(v: string): string {
  const m = String(v ?? "").trim().match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}:\d{2})/);
  return m ? `${m[3]}.${m[2]}.${m[1]}. u ${m[4]}` : dash(v);
}

export function contractSections(d: ContractData): Section[] {
  const extras =
    d.extras.length === 0
      ? "—"
      : d.extras
          .map((e) => `${e.name}${e.qty > 1 ? ` (${e.qty} kom)` : ""}`)
          .join(", ");

  return [
    {
      title: "1. PODACI O KLIJENTU",
      rows: [
        ["Ime i prezime", dash(d.guest)],
        ["Adresa", dash(d.address)],
        ["Telefon", dash(d.phone)],
        ["E-mail", dash(d.email)],
        ["Broj vozačke dozvole", dash(d.licence)],
        ["Broj pasoša / lične karte", dash(d.document)],
      ],
    },
    {
      title: "2. PREDMET NAJMA",
      rows: [
        ["Vozilo", dash(d.carTitle)],
        ["Registarska oznaka", dash(d.plate)],
        ["Preuzimanje", `${human(d.pickupAt)} · ${dash(d.pickupLocation)}`],
        ["Vraćanje", `${human(d.returnAt)} · ${dash(d.returnLocation)}`],
        ["Trajanje najma", `${d.rentalDays} ${d.rentalDays === 1 ? "dan" : "dana"}`],
        ["Dodatna oprema", extras],
      ],
    },
    {
      title: "3. FINANSIJE",
      rows: [
        ["Ukupna cijena najma", d.totalPrice ? `${d.totalPrice} KM` : "—"],
        ["Broj ugovora", dash(d.reference)],
      ],
    },
    {
      title: "4. ZAPISNIK O STANJU VOZILA",
      rows: [
        ["Kilometraža pri preuzimanju", dash(d.mileage)],
        ["Nivo goriva", dash(d.fuel)],
      ],
    },
  ];
}

/** Filename such as ugovor-MR-7K3P9W.pdf */
export function contractFilename(reference: string, ext: string): string {
  const safe = (reference || "ugovor").replace(/[^A-Za-z0-9-]/g, "");
  return `ugovor-${safe}.${ext}`;
}

export const CONDITION_TITLE = "Postojeća oštećenja i napomene";
export const SIGN_LEFT = "Potpis klijenta";
export const SIGN_RIGHT = "Za agenciju";
