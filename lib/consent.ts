"use client";

import { useEffect, useState } from "react";

export type Consent = { v: 1; maps: boolean; ts: number };

const CONSENT_KEY = "mx-consent";
export const CONSENT_OPEN = "mx:consent-open";
const CONSENT_CHANGE = "mx:consent";

export function readConsent(): Consent | null {
  try {
    const c = JSON.parse(localStorage.getItem(CONSENT_KEY) ?? "null");
    return c && c.v === 1 ? (c as Consent) : null;
  } catch {
    return null;
  }
}

export function saveConsent(maps: boolean): Consent {
  const c: Consent = { v: 1, maps, ts: Date.now() };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(c));
  } catch {}
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE, { detail: c }));
  return c;
}

export function useMapsConsent(): [boolean | null, (v: boolean) => void] {
  const [maps, setMaps] = useState<boolean | null>(null);
  useEffect(() => {
    setMaps(readConsent()?.maps ?? false);
    const on = (e: Event) => setMaps(!!(e as CustomEvent<Consent>).detail?.maps);
    window.addEventListener(CONSENT_CHANGE, on);
    return () => window.removeEventListener(CONSENT_CHANGE, on);
  }, []);
  return [maps, (v: boolean) => saveConsent(v)];
}
