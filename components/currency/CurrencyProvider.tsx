"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Currency } from "@/lib/currency";

type Ctx = { currency: Currency; setCurrency: (c: Currency) => void };

const CurrencyContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "mr-currency";

/**
 * Holds the currently displayed currency. Starts from `defaultCurrency` (the
 * owner's primary-currency admin setting) so the first paint matches on server
 * and client, then restores the visitor's own choice (if any) after mount.
 */
export function CurrencyProvider({
  defaultCurrency = "BAM",
  children,
}: {
  defaultCurrency?: Currency;
  children: ReactNode;
}) {
  const [currency, setCurrencyState] = useState<Currency>(defaultCurrency);

  useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? window.localStorage.getItem(STORAGE_KEY)
        : null;
    if (saved === "BAM" || saved === "EUR") setCurrencyState(saved);
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    try {
      window.localStorage.setItem(STORAGE_KEY, c);
    } catch {
      /* ignore (private mode etc.) */
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): Ctx {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return ctx;
}
