"use client";

import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";

const MAX = 1800;

async function shrink(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.size < 450_000) return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.85));
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.\w+$/, "") + ".webp", { type: "image/webp" });
}

export function ImageCompressInput({ name, label }: { name: string; label: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-background px-3 py-3 text-sm text-muted-foreground transition-colors hover:border-brand hover:text-foreground">
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" className="h-12 w-20 rounded-lg object-cover" />
      ) : (
        <span className="grid h-12 w-12 place-items-center rounded-lg bg-surface-muted">
          <ImagePlus className="h-5 w-5" />
        </span>
      )}
      <span>{busy ? "Obrada slike…" : label}</span>
      <input
        ref={input}
        type="file"
        name={name}
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setBusy(true);
          try {
            const small = await shrink(f);
            const dt = new DataTransfer();
            dt.items.add(small);
            if (input.current) input.current.files = dt.files;
            setPreview(URL.createObjectURL(small));
          } finally {
            setBusy(false);
          }
        }}
      />
    </label>
  );
}
