import { SITE_URL } from "@/lib/seo";
import { SITE } from "@/lib/site-config";

export function GET() {
  const u = (p: string) => `${SITE_URL}${p}`;

  const body = `# ${SITE.name}

> Premium najam vozila (rent a car) u Hercegovini, Bosna i Hercegovina. Preuzimanje na 6 lokacija — od gradskih automobila do luksuznih limuzina i svadbenih vozila. Dvojezično (HR/EN). Rezervacija na upit: gost šalje zahtjev, agencija potvrđuje (bez online plaćanja).

## Osnovno
- Lokacije: Čitluk (glavni ured), Međugorje, Mostar (zračna luka), Mostar (Vukovarska), Čapljina, Ljubuški
- Radno vrijeme: ${SITE.hours}
- Kontakt: ${SITE.email}, ${SITE.phones[0]?.value ?? ""}
- Model rezervacije: upit → potvrda agencije (bez online naplate)

## Stranice (hrvatski)
- [Početna](${u("/hr")}): ponuda vozila, provjera dostupnosti i status radnog vremena
- [Vozila](${u("/hr/vozila")}): vozni park s filterima, galerijom i cijenama po danu
- [O nama](${u("/hr/o-nama")}): o agenciji Maximum Rent a Car
- [Poslovna ponuda](${u("/hr/poslovna-ponuda")}): najam za firme i duži period
- [Uvjeti najma](${u("/hr/uvjeti-najma")}): uvjeti, dokumenti i pravila najma
- [Kontakt](${u("/hr/kontakt")}): lokacije, telefoni i upit

## Pages (English)
- [Home](${u("/en")}): fleet, availability search and opening status
- [Vehicles](${u("/en/vozila")}): fleet with filters, gallery and daily prices
- [About](${u("/en/o-nama")}): about Maximum Rent a Car
- [Business offer](${u("/en/poslovna-ponuda")}): corporate and long-term rental
- [Rental terms](${u("/en/uvjeti-najma")}): terms, documents and rental rules
- [Contact](${u("/en/kontakt")}): locations, phones and inquiry

## Napomene
- Sitemap: ${u("/sitemap.xml")}
- Admin i API rute nisu za indeksiranje.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
