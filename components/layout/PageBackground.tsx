"use client";

import { usePathname } from "@/i18n/navigation";

export function PageBackground() {
  const pathname = usePathname();
  if (!pathname.startsWith("/vozila")) return null;
  return <div aria-hidden className="page-bg page-bg--top" />;
}
