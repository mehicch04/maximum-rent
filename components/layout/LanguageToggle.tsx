"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { useTransition } from "react";

export function LanguageToggle() {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchTo(next: AppLocale) {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next, scroll: false });
    });
  }

  return (
    <div
      className="inline-flex items-center rounded-lg border border-border p-0.5 text-xs font-semibold"
      data-pending={isPending}
    >
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchTo(l)}
          aria-current={l === locale}
          className={
            l === locale
              ? "rounded-md bg-brand px-2.5 py-1 uppercase text-brand-foreground"
              : "rounded-md px-2.5 py-1 uppercase text-muted-foreground transition-colors hover:text-foreground"
          }
        >
          {l}
        </button>
      ))}
    </div>
  );
}
