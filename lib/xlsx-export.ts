import ExcelJS from "exceljs";

export type Column = {
  header: string;
  /** Rough width in characters; the sheet auto-fits within sensible bounds. */
  width?: number;
  /** How the value should be treated by the spreadsheet. */
  kind?: "text" | "number" | "money" | "date" | "datetime";
};

const BRAND = "FFE30613";

export async function buildWorkbook(
  sheetName: string,
  columns: Column[],
  rows: unknown[][],
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Maximum Rent a Car";
  wb.created = new Date();

  const ws = wb.addWorksheet(sheetName, {
    views: [{ state: "frozen", ySplit: 1 }], // header stays visible while scrolling
  });

  ws.columns = columns.map((c) => ({
    header: c.header,
    width: c.width ?? 18,
  }));

  // Header: brand colour, white bold text, taller row.
  const head = ws.getRow(1);
  head.height = 22;
  head.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND } };
    cell.alignment = { vertical: "middle", horizontal: "left" };
    cell.border = { bottom: { style: "thin", color: { argb: "FFCCCCCC" } } };
  });

  rows.forEach((r) => ws.addRow(r));

  // Per-column formatting, so dates sort and prices add up.
  columns.forEach((c, i) => {
    const col = ws.getColumn(i + 1);
    if (c.kind === "money") col.numFmt = "#,##0.00";
    else if (c.kind === "number") col.numFmt = "0";
    else if (c.kind === "date") col.numFmt = "dd.mm.yyyy";
    else if (c.kind === "datetime") col.numFmt = "dd.mm.yyyy hh:mm";
    col.alignment = {
      vertical: "top",
      horizontal:
        c.kind === "money" || c.kind === "number" ? "right" : "left",
      wrapText: c.kind === undefined || c.kind === "text",
    };
  });

  // Filter arrows on the header, so the owner can narrow the list himself.
  if (rows.length > 0) {
    ws.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: columns.length },
    };
  }

  // Widen columns to fit their content, within limits so nothing runs away.
  columns.forEach((c, i) => {
    const col = ws.getColumn(i + 1);
    let longest = c.header.length;
    col.eachCell({ includeEmpty: false }, (cell) => {
      const v = cell.value;
      const len =
        v instanceof Date ? 16 : String(v ?? "").split("\n")[0].length;
      if (len > longest) longest = len;
    });
    col.width = Math.min(Math.max(longest + 3, 10), 46);
  });

  const out = await wb.xlsx.writeBuffer();
  return Buffer.from(out);
}

/** Filename such as rezervacije-2026-08-31.xlsx */
export function workbookFilename(kind: string): string {
  const n = new Date();
  const iso = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
  return `${kind}-${iso}.xlsx`;
}

export function safeText(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
}
