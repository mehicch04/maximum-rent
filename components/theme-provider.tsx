"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

export function ThemeProvider({ children, forced }: { children: ReactNode; forced?: "light" | "dark" }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={forced ?? "dark"}
      forcedTheme={forced}
      enableSystem={false}
    >
      {children}
    </NextThemesProvider>
  );
}
