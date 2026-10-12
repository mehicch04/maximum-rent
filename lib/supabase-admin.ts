import "server-only";
import { createClient } from "@supabase/supabase-js";

export const STORAGE_BUCKET = "cars";
const IMAGE_PREFIX = "fleet";

function client() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase nije konfigurisan (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).",
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

/** Upload one image file to Storage and return its public URL. */
export async function uploadVehicleImage(file: File): Promise<string> {
  if (!ALLOWED.includes(file.type)) {
    throw new Error("Dozvoljene su samo slike (JPG, PNG, WEBP, AVIF).");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Slika je prevelika (maksimalno 8 MB).");
  }

  const sb = client();
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${IMAGE_PREFIX}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error } = await sb.storage
    .from(STORAGE_BUCKET)
    .upload(path, bytes, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });
  if (error) throw new Error(`Upload nije uspio: ${error.message}`);

  const { data } = sb.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
