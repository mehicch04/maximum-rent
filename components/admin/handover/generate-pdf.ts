import {
  CONDITION_TITLE,
  SIGN_LEFT,
  SIGN_RIGHT,
  contractFilename,
  contractSections,
  type ContractData,
} from "./contract-data";

/**
 * A4 rental contract.
 *
 * The font is loaded from /public rather than bundled: jsPDF's built-in fonts
 * silently DROP č, ć and đ, so "Čitluk" prints as "itluk" and a guest's name
 * comes out mangled on a document they are about to sign. Loading it only when
 * a contract is generated keeps it out of every other page's payload.
 */

const A4 = { w: 210, h: 297 };
const M = 18; // margin
const LINE = 5.6;

let fontsCached: { regular: string; bold: string } | null = null;

async function loadFonts() {
  if (fontsCached) return fontsCached;
  const toBase64 = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`font ${url}: ${res.status}`);
    const buf = await res.arrayBuffer();
    let bin = "";
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  };
  fontsCached = {
    regular: await toBase64("/fonts/contract-regular.ttf"),
    bold: await toBase64("/fonts/contract-bold.ttf"),
  };
  return fontsCached;
}

export async function generateContractPdf(data: ContractData): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const fonts = await loadFonts();

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.addFileToVFS("contract.ttf", fonts.regular);
  doc.addFont("contract.ttf", "Contract", "normal");
  doc.addFileToVFS("contract-b.ttf", fonts.bold);
  doc.addFont("contract-b.ttf", "Contract", "bold");

  let y = M;

  /** Starts a new page when the next block would run off the bottom. */
  const room = (needed: number) => {
    if (y + needed > A4.h - 32) {
      doc.addPage();
      y = M;
    }
  };

  // ── Header ──
  doc.setFont("Contract", "bold");
  doc.setFontSize(15);
  doc.text("UGOVOR O NAJMU VOZILA", A4.w / 2, y, { align: "center" });
  y += 6;

  doc.setFont("Contract", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text(
    `Broj: ${data.reference || "—"}    Datum: ${new Date().toLocaleDateString("hr-HR")}`,
    A4.w / 2,
    y,
    { align: "center" },
  );
  doc.setTextColor(0);
  y += 5;

  doc.setDrawColor(227, 6, 19);
  doc.setLineWidth(0.6);
  doc.line(M, y, A4.w - M, y);
  y += 8;

  // ── Sections ──
  const LABEL_W = 52;
  for (const section of contractSections(data)) {
    room(12 + section.rows.length * LINE);

    doc.setFont("Contract", "bold");
    doc.setFontSize(10);
    doc.text(section.title, M, y);
    y += 1.5;
    doc.setDrawColor(210);
    doc.setLineWidth(0.2);
    doc.line(M, y, A4.w - M, y);
    y += 5;

    doc.setFontSize(9.5);
    for (const [label, value] of section.rows) {
      const lines = doc.splitTextToSize(value, A4.w - M * 2 - LABEL_W) as string[];
      room(lines.length * LINE);

      doc.setFont("Contract", "normal");
      doc.setTextColor(110);
      doc.text(label, M, y);
      doc.setTextColor(0);
      doc.setFont("Contract", "bold");
      doc.text(lines, M + LABEL_W, y);
      y += lines.length * LINE;
    }
    y += 5;
  }

  // ── Condition notes ──
  const notes = (data.condition || "").trim();
  const noteLines = notes
    ? (doc.splitTextToSize(notes, A4.w - M * 2) as string[])
    : ["Bez zabilježenih oštećenja."];

  room(14 + noteLines.length * LINE);
  doc.setFont("Contract", "bold");
  doc.setFontSize(10);
  doc.text(CONDITION_TITLE, M, y);
  y += 5;
  doc.setFont("Contract", "normal");
  doc.setFontSize(9.5);
  doc.text(noteLines, M, y);
  y += noteLines.length * LINE + 4;

  // ── Signatures, always at the foot of the last page ──
  const signY = Math.max(y + 14, A4.h - 34);
  const colW = (A4.w - M * 2 - 16) / 2;

  doc.setDrawColor(80);
  doc.setLineWidth(0.3);
  doc.line(M, signY, M + colW, signY);
  doc.line(A4.w - M - colW, signY, A4.w - M, signY);

  doc.setFont("Contract", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text(SIGN_LEFT, M, signY + 5);
  doc.text(SIGN_RIGHT, A4.w - M - colW, signY + 5);

  doc.save(contractFilename(data.reference, "pdf"));
}
