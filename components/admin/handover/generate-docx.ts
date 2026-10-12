import {
  CONDITION_TITLE,
  SIGN_LEFT,
  SIGN_RIGHT,
  contractFilename,
  contractSections,
  type ContractData,
  companyHeaderLines,
} from "./contract-data";

export async function generateContractDocx(data: ContractData): Promise<void> {
  const {
    AlignmentType,
    BorderStyle,
    Document,
    HeadingLevel,
    Packer,
    Paragraph,
    Table,
    TableCell,
    TableRow,
    TextRun,
    WidthType,
  } = await import("docx");

  const NONE = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const noBorders = { top: NONE, bottom: NONE, left: NONE, right: NONE };

  const line = (label: string, value: string) =>
    new TableRow({
      children: [
        new TableCell({
          width: { size: 32, type: WidthType.PERCENTAGE },
          borders: noBorders,
          margins: { top: 40, bottom: 40 },
          children: [
            new Paragraph({
              children: [new TextRun({ text: label, size: 19, color: "666666" })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 68, type: WidthType.PERCENTAGE },
          borders: noBorders,
          margins: { top: 40, bottom: 40 },
          children: [
            new Paragraph({
              children: [new TextRun({ text: value, size: 19, bold: true })],
            }),
          ],
        }),
      ],
    });

  const issuer: InstanceType<typeof Paragraph>[] = data.company?.name
    ? [
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: data.company.name, bold: true, size: 24 }),
          ],
        }),
        ...companyHeaderLines(data.company).map(
          (line) =>
            new Paragraph({
              spacing: { after: 20 },
              children: [new TextRun({ text: line, size: 17, color: "666666" })],
            }),
        ),
        new Paragraph({
          spacing: { after: 260 },
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC" },
          },
          children: [new TextRun({ text: "", size: 2 })],
        }),
      ]
    : [];

  const body: (InstanceType<typeof Paragraph> | InstanceType<typeof Table>)[] = [
    ...issuer,
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: "UGOVOR O NAJMU VOZILA", bold: true, size: 30 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: `Broj: ${data.reference || "—"}    Datum: ${new Date().toLocaleDateString("hr-HR")}`,
          size: 18,
          color: "666666",
        }),
      ],
    }),
  ];

  for (const section of contractSections(data)) {
    body.push(
      new Paragraph({
        spacing: { before: 240, after: 100 },
        children: [new TextRun({ text: section.title, bold: true, size: 21 })],
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: noBorders,
        rows: section.rows.map(([l, v]) => line(l, v)),
      }),
    );
  }

  const notes = (data.condition || "").trim() || "Bez zabilježenih oštećenja.";
  body.push(
    new Paragraph({
      spacing: { before: 260, after: 100 },
      children: [new TextRun({ text: CONDITION_TITLE, bold: true, size: 21 })],
    }),
    new Paragraph({ children: [new TextRun({ text: notes, size: 19 })] }),
  );

  // Signature lines: two cells with only a top border, so they print as rules.
  const topOnly = {
    top: { style: BorderStyle.SINGLE, size: 6, color: "555555" },
    bottom: NONE,
    left: NONE,
    right: NONE,
  };
  body.push(
    new Paragraph({ spacing: { before: 900 }, children: [] }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: noBorders,
      rows: [
        new TableRow({
          children: [SIGN_LEFT, SIGN_RIGHT].map(
            (t) =>
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: topOnly,
                margins: { top: 80, right: 300 },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: t, size: 18, color: "666666" })],
                  }),
                ],
              }),
          ),
        }),
      ],
    }),
  );

  const doc = new Document({
    creator: "Maximum Rent a Car",
    title: `Ugovor ${data.reference}`,
    sections: [{ properties: {}, children: body }],
  });

  // Blob, not Buffer: this runs in the browser.
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = contractFilename(data.reference, "docx");
  a.click();
  URL.revokeObjectURL(url);
}
