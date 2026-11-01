"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

export function FallbackImage({ src, fallback, fallbackAlt, alt, ...rest }: ImageProps & { fallback: string; fallbackAlt?: string }) {
  const [failed, setFailed] = useState(false);
  return <Image {...rest} src={failed ? fallback : src} alt={failed ? fallbackAlt ?? alt : alt} onError={() => setFailed(true)} />;
}
