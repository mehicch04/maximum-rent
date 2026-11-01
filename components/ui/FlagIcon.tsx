import { FLAG_ORDER, FLAG_SHEET } from "@/lib/flag-sprite";

const INDEX = new Map(FLAG_ORDER.map((iso, i) => [iso, i]));

export function FlagIcon({ iso, width = 24, className = "" }: { iso: string; width?: number; className?: string }) {
  const i = INDEX.get(iso.toLowerCase());
  const s = width / FLAG_SHEET.cell;
  const height = Math.round(FLAG_SHEET.height * s * 100) / 100;
  if (i === undefined) return <span aria-hidden className={`inline-block shrink-0 rounded-[3px] bg-foreground/10 ${className}`} style={{ width, height }} />;
  const col = i % FLAG_SHEET.cols;
  const row = Math.floor(i / FLAG_SHEET.cols);
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 rounded-[3px] ring-1 ring-black/10 ${className}`}
      style={{
        width,
        height,
        backgroundImage: "url(/flags.webp)",
        backgroundSize: `${FLAG_SHEET.cols * FLAG_SHEET.pitchX * s}px ${FLAG_SHEET.rows * FLAG_SHEET.pitchY * s}px`,
        backgroundPosition: `${-(col * FLAG_SHEET.pitchX + FLAG_SHEET.pad) * s}px ${-(row * FLAG_SHEET.pitchY + FLAG_SHEET.pad) * s}px`,
      }}
    />
  );
}
