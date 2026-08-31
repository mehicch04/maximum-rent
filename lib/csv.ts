/**
 * CSV export helpers, tuned for the spreadsheet programs people here actually
 * use (Excel and LibreOffice with a Croatian/Bosnian locale).
 *
 * Three details decide whether the file opens correctly or looks broken:
 *
 *  1. Separator. Excel on a regional locale expects a semicolon, not a comma.
 *     With a comma every row lands in one cell and the owner concludes the
 *     export is broken.
 *  2. Encoding. Without a UTF-8 byte-order mark Excel renders č, ć, š and ž as
 *     garbage, so the mark is written first.
 *  3. Formula injection. A cell that starts with = + - or @ is executed by the
 *     spreadsheet. Guests type free text into the message field, so every value
 *     that starts with one of those characters is prefixed with an apostrophe.
 */

const SEP = ";";
const BOM = "\uFEFF";

/** Characters that make a spreadsheet treat the cell as a formula. */
const FORMULA_START = /^[=+\-@\t\r]/;

function cell(value: unknown): string {
  if (value === null || value === undefined) return "";

  let text = String(value);

  // Neutralise formulas without losing what the guest actually wrote.
  if (FORMULA_START.test(text)) text = `'${text}`;

  // Quote when the value could otherwise break the row apart.
  if (
    text.includes(SEP) ||
    text.includes('"') ||
    text.includes("\n") ||
    text.includes("\r")
  ) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/** Builds the whole file: header row plus data, ready to download. */
export function toCsv(headers: string[], rows: unknown[][]): string {
  const lines = [
    headers.map(cell).join(SEP),
    ...rows.map((r) => r.map(cell).join(SEP)),
  ];
  // CRLF keeps older Excel versions happy.
  return BOM + lines.join("\r\n") + "\r\n";
}

const TZ = "Europe/Sarajevo";

/** Date and time as people write it here: 12.08.2026. 10:00 */
export function fmtDateTime(d: Date | null | undefined): string {
  if (!d) return "";
  return new Intl.DateTimeFormat("hr-HR", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/** Date only: 12.08.2026. */
export function fmtDate(d: Date | null | undefined): string {
  if (!d) return "";
  return new Intl.DateTimeFormat("hr-HR", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

/**
 * Number with a comma as the decimal mark, so the spreadsheet reads it as a
 * number and not as text. Safe next to a semicolon separator.
 */
export function fmtNumber(n: unknown): string {
  if (n === null || n === undefined || n === "") return "";
  const v = Number(n);
  if (!Number.isFinite(v)) return "";
  return v.toFixed(2).replace(".", ",");
}

export function fmtBool(b: boolean | null | undefined): string {
  return b ? "da" : "ne";
}

/** Filename such as rezervacije-2026-08-31.csv */
export function exportFilename(kind: string): string {
  const now = new Date();
  const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return `${kind}-${iso}.csv`;
}
