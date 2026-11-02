export type Country = { iso: string; dial: string };

const RAW =
  "BA387 HR385 RS381 ME382 SI386 MK389 XK383 AL355 AT43 DE49 CH41 LI423 SE46 NO47 DK45 FI358 IS354 NL31 BE32 LU352 FR33 MC377 IT39 SM378 VA379 MT356 ES34 AD376 PT351 GB44 IE353 PL48 CZ420 SK421 HU36 RO40 BG359 GR30 CY357 TR90 MD373 UA380 BY375 LT370 LV371 EE372 RU7 GE995 AM374 AZ994 KZ7 UZ998 KG996 TJ992 TM993 " +
  "SA966 AE971 KW965 QA974 BH973 OM968 YE967 JO962 LB961 SY963 IQ964 IR98 IL972 PS970 EG20 LY218 TN216 DZ213 MA212 SD249 SS211 MR222 " +
  "US1 CA1 MX52 GT502 BZ501 SV503 HN504 NI505 CR506 PA507 CU53 DO1809 HT509 JM1876 BS1242 BB1246 TT1868 AG1268 DM1767 GD1473 KN1869 LC1758 VC1784 PR1787 " +
  "BR55 AR54 CL56 CO57 VE58 PE51 EC593 BO591 PY595 UY598 GY592 SR597 " +
  "CN86 JP81 KR82 KP850 TW886 HK852 MO853 MN976 IN91 PK92 BD880 LK94 NP977 BT975 MV960 AF93 MM95 TH66 LA856 KH855 VN84 MY60 SG65 ID62 PH63 BN673 TL670 " +
  "AU61 NZ64 PG675 FJ679 SB677 VU678 WS685 TO676 KI686 TV688 NR674 FM691 MH692 PW680 " +
  "NG234 GH233 CI225 SN221 ML223 BF226 NE227 TG228 BJ229 GM220 GN224 GW245 SL232 LR231 CV238 ST239 CM237 GA241 GQ240 CG242 CD243 CF236 TD235 AO244 " +
  "ET251 ER291 DJ253 SO252 KE254 UG256 TZ255 RW250 BI257 MZ258 MW265 ZM260 ZW263 NA264 BW267 ZA27 LS266 SZ268 MG261 MU230 SC248 KM269";

export const COUNTRIES: Country[] = RAW.split(" ").map((c) => ({ iso: c.slice(0, 2), dial: c.slice(2) }));

const BY_ISO = new Map(COUNTRIES.map((c) => [c.iso, c]));
const DIALS = [...new Set(COUNTRIES.map((c) => c.dial))].sort((a, b) => b.length - a.length);

export const LOCALE_COUNTRY: Record<string, string> = { hr: "BA", en: "GB", de: "DE", es: "ES" };

export const countryOf = (iso: string) => BY_ISO.get(iso) ?? BY_ISO.get("BA")!;

export function matchDial(digits: string, prefer?: string): { country: Country; rest: string } | null {
  for (const d of DIALS) {
    if (!digits.startsWith(d)) continue;
    const pref = prefer && BY_ISO.get(prefer);
    const country = pref && pref.dial === d ? pref : COUNTRIES.find((c) => c.dial === d)!;
    return { country, rest: digits.slice(d.length) };
  }
  return null;
}

export function splitPhone(value: string, fallback: string): { iso: string; national: string } {
  const v = value.trim();
  const m = v.match(/^\+(\d{1,4})\s(.*)$/);
  if (m) {
    const hit = matchDial(m[1], fallback);
    if (hit && hit.country.dial === m[1]) return { iso: hit.country.iso, national: m[2] };
  }
  if (/^(\+|00)/.test(v)) {
    const hit = matchDial(v.replace(/^00/, "").replace(/\D/g, ""), fallback);
    if (hit) return { iso: hit.country.iso, national: hit.rest };
  }
  return { iso: fallback, national: v };
}

export function joinPhone(iso: string, national: string) {
  const n = national.replace(/[^\d\s]/g, "").replace(/^\s*0+/, "").replace(/\s+/g, " ").trim();
  return n ? `+${countryOf(iso).dial} ${n}` : "";
}

export function phoneValid(value: string) {
  const m = value.trim().match(/^\+\d{1,4}\s(.*)$/);
  const digits = (m ? m[1] : value).replace(/\D/g, "");
  return digits.length >= 6 && digits.length <= 14;
}
