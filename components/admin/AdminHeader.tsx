"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Bell, Moon, Sun } from "lucide-react";
import { SearchBox } from "@/components/admin/SearchBox";

export function AdminHeader({
  counts = { inquiries: 0, messages: 0 },
}: {
  counts?: { inquiries: number; messages: number };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const onLogin = pathname === "/admin/login";
  const isDark = resolvedTheme === "dark";

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background/85 px-4 backdrop-blur sm:px-6">
      <Link href="/admin" className="flex shrink-0 items-center gap-2.5 lg:w-60">
        <Image
          src="/logo.png"
          alt="Maximum Rent a Car"
          width={800}
          height={239}
          priority
          className="h-7 w-auto dark:hidden"
        />
        <Image
          src="/logo-dark.png"
          alt="Maximum Rent a Car"
          width={800}
          height={239}
          priority
          className="hidden h-7 w-auto dark:block"
        />
        <span className="border-l border-border pl-2.5 text-sm font-semibold text-brand">
          Admin
        </span>
      </Link>

      {!onLogin && (
        <>
          <div className="hidden min-w-0 flex-1 md:block">
            <SearchBox placeholder="Pretraži rezervacije, klijente ili vozila…" />
          </div>

          <div className="ml-auto flex items-center gap-2">
            {mounted && (
              <button
                type="button"
                aria-label="Promijeni temu"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-foreground/70 transition-colors hover:text-foreground"
              >
                {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
              </button>
            )}
            <Link
              href="/admin/poruke"
              aria-label="Poruke"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-foreground/70 transition-colors hover:text-foreground"
            >
              <Bell className="h-[18px] w-[18px]" />
              {counts.messages > 0 && (
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-brand ring-2 ring-background" />
              )}
            </Link>
            <button
              type="button"
              onClick={logout}
              aria-label="Odjava"
              title="Odjava"
              className="grid h-10 w-10 place-items-center rounded-full bg-ink text-[13px] font-semibold text-white"
            >
              MA
            </button>
          </div>
        </>
      )}
    </header>
  );
}
