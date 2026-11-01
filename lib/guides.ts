export type GuideBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "table"; head: [string, string]; rows: [string, string][] }
  | { type: "note"; text: string };

export type GuideIcon = "fines" | "rules";

export type Guide = {
  slug: string;
  icon: GuideIcon;
  minutes: number;
  updated: string;
  title: string;
  lead: string;
  blocks: GuideBlock[];
};

type Loc = "hr" | "en";
type Copy = Pick<Guide, "title" | "lead" | "blocks">;

const META = [
  { slug: "prometne-kazne-bih", icon: "fines", minutes: 2 },
  { slug: "pravila-voznje-bih", icon: "rules", minutes: 2 },
] as const;

const UPDATED = "2026-11-01";

const W: Record<Loc, { to: string; about: string; nf: string }> = {
  hr: { to: "do", about: "oko", nf: "hr-HR" },
  en: { to: "to", about: "about", nf: "en-GB" },
};

function amount(l: Loc, km: [number, number?], eur: [number, number?]): string {
  const n = (v: number) => v.toLocaleString(W[l].nf);
  const r = ([a, b]: [number, number?]) => (b ? `${n(a)} ${W[l].to} ${n(b)}` : n(a));
  return `${r(km)} KM (${W[l].about} ${r(eur)} €)`;
}

const FINE_AMOUNTS: [[number, number?], [number, number?]][] = [
  [[50], [26]],
  [[100, 300], [51, 153]],
  [[400, 1000], [205, 511]],
  [[200, 400], [102, 205]],
  [[200, 400], [102, 205]],
  [[100, 300], [51, 153]],
  [[50, 250], [26, 128]],
  [[100, 300], [51, 153]],
  [[400, 1000], [205, 511]],
  [[400, 1000], [205, 511]],
  [[40], [20]],
  [[30], [15]],
  [[40], [20]],
  [[2000, 3000], [1023, 1534]],
];

const FINE_LABELS: Record<Loc, string[]> = {
  hr: [
    "Prekoračenje brzine 10 do 20 km/h",
    "Prekoračenje brzine 20 do 30 km/h",
    "Prekoračenje brzine više od 30 km/h",
    "Mobitel u vožnji bez handsfree uređaja",
    "Nevezan sigurnosni pojas",
    "Prolazak kroz crveno svjetlo",
    "Alkohol 0,3 do 0,8 g/kg",
    "Alkohol 0,8 do 1,5 g/kg",
    "Alkohol preko 1,5 g/kg",
    "Dijete mlađe od 12 godina na prednjem sjedalu",
    "Dijete bez propisane sjedalice",
    "Vožnja danju bez kratkih ili dnevnih svjetala",
    "Bez zimske opreme (1.11. do 1.4.)",
    "Obijesna vožnja (npr. 40 km/h preko u naselju, 60 izvan naselja)",
  ],
  en: [
    "Speeding by 10 to 20 km/h",
    "Speeding by 20 to 30 km/h",
    "Speeding by more than 30 km/h",
    "Phone while driving without hands free",
    "Not wearing a seat belt",
    "Running a red light",
    "Alcohol 0.3 to 0.8 g/kg",
    "Alcohol 0.8 to 1.5 g/kg",
    "Alcohol above 1.5 g/kg",
    "Child under 12 in the front seat",
    "Child without the required child seat",
    "No dipped or daytime lights during the day",
    "No winter equipment (1 Nov to 1 Apr)",
    "Reckless driving (e.g. 40 km/h over in town, 60 outside)",
  ],
};

const SPEED: Record<Loc, { head: [string, string]; rows: string[] }> = {
  hr: { head: ["Cesta", "Ograničenje"], rows: ["U naselju", "Izvan naselja", "Brze ceste", "Autocesta"] },
  en: { head: ["Road", "Limit"], rows: ["In towns and villages", "Outside towns", "Expressways", "Motorways"] },
};

function speedTable(l: Loc): GuideBlock {
  const limits = ["50 km/h", "80 km/h", "100 km/h", "130 km/h"];
  return { type: "table", head: SPEED[l].head, rows: SPEED[l].rows.map((r, i) => [r, limits[i]] as [string, string]) };
}

function finesTable(l: Loc, head: [string, string]): GuideBlock {
  return {
    type: "table",
    head,
    rows: FINE_LABELS[l].map((label, i) => [label, amount(l, FINE_AMOUNTS[i][0], FINE_AMOUNTS[i][1])] as [string, string]),
  };
}

function copy(l: Loc): Copy[] {
  if (l === "en")
    return [
      {
        title: "Traffic fines in Bosnia and Herzegovina (2026)",
        lead: "What speeding, phone use, seat belts, alcohol and red lights cost, in KM and euros.",
        blocks: [
          { type: "p", text: "Fines in Bosnia and Herzegovina are set by one state law, so the amounts are the same in Mostar, Međugorje and the rest of the country. They are written in convertible marks, pegged to the euro at 1 € = 1.95583 KM. The table follows the law with the changes in force since 27 May 2026." },
          finesTable(l, ["Offence", "Fine"]),
          { type: "h2", text: "What changed in May 2026" },
          { type: "ul", items: ["Using a phone and driving without a seat belt now cost 200 to 400 KM, up from 100 to 300 KM.", "A new offence, reckless driving, covers speeding by more than 40 km/h in town or 60 km/h outside it, and repeated red lights. It carries 2,000 to 3,000 KM and a six month driving ban."] },
          { type: "h2", text: "Speed limits" },
          speedTable(l),
          { type: "h2", text: "If you are stopped in a rental car" },
          { type: "ul", items: ["The fine is issued to the driver. Under our rental terms, fines for traffic offences are paid by the lessee.", "Carry your driving licence, ID card or passport and the rental agreement you get with the car.", "Cruise control is the cheapest insurance against speed cameras."] },
          { type: "note", text: "A summary for visitors, not legal advice. Amounts can change and the law is what counts." },
        ],
      },
      {
        title: "Driving in Bosnia and Herzegovina: rules every visitor should know",
        lead: "Speed limits, lights on all day, alcohol, children and winter equipment in one place.",
        blocks: [
          { type: "p", text: "Bosnia and Herzegovina drives on the right and the rules are close to the rest of Europe. Five points catch visitors out more than anything else." },
          { type: "h2", text: "1. Speed limits" },
          speedTable(l),
          { type: "p", text: "Signs override these general limits, and villages often start right after a bend. Slow down when you see the town sign." },
          { type: "h2", text: "2. Lights on, day and night" },
          { type: "p", text: "Dipped or daytime running lights must be on whenever the car moves, even at noon in July." },
          { type: "h2", text: "3. Alcohol: 0.3 g/kg" },
          { type: "p", text: "The general limit is 0.3 g/kg. For drivers under 21, drivers with less than three years of experience and professional drivers the limit is zero." },
          { type: "h2", text: "4. Children" },
          { type: "ul", items: ["A child under 12 may not sit in the front seat.", "Children up to 5 travel in a child seat and from 5 to 12 on a booster seat."] },
          { type: "h2", text: "5. Winter equipment from 1 November to 1 April" },
          { type: "p", text: "In this period winter tyres are required, or summer tyres with chains in the car." },
          { type: "h2", text: "Seat belts and phones" },
          { type: "p", text: "Belts are compulsory in every seat and a phone may only be used hands free. Both fines went up in May 2026." },
          { type: "note", text: "A summary for visitors, not legal advice. The law is what counts." },
        ],
      },
    ];
  return [
    {
      title: "Prometne kazne u BiH (2026): brzina, mobitel, pojas",
      lead: "Koliko iznose kazne za brzinu, mobitel, pojas, alkohol i crveno svjetlo, u KM i eurima.",
      blocks: [
        { type: "p", text: "Kazne u Bosni i Hercegovini propisuje jedan državni zakon, pa su iznosi isti u Mostaru, Međugorju i ostatku zemlje. Izražene su u konvertibilnim markama, a tečaj je fiksan: 1 € = 1,95583 KM. Tablica prati zakon s izmjenama koje vrijede od 27. svibnja 2026." },
        finesTable(l, ["Prekršaj", "Kazna"]),
        { type: "h2", text: "Što se promijenilo u svibnju 2026." },
        { type: "ul", items: ["Mobitel u vožnji i nevezan pojas sada koštaju 200 do 400 KM, a ranije 100 do 300 KM.", "Uvedena je obijesna vožnja: prekoračenje brzine za više od 40 km/h u naselju ili 60 km/h izvan naselja te ponovljeni prolazak kroz crveno. Kazna je 2.000 do 3.000 KM i zabrana upravljanja vozilom od šest mjeseci."] },
        { type: "h2", text: "Ograničenja brzine" },
        speedTable(l),
        { type: "h2", text: "Ako vas zaustave u unajmljenom vozilu" },
        { type: "ul", items: ["Kazna se izdaje vozaču. Prema našim Uvjetima najma, kazne za prometne prekršaje snosi Najmoprimatelj.", "Uz sebe imajte vozačku dozvolu, osobnu iskaznicu ili putovnicu i ugovor o najmu koji dobivate uz vozilo.", "Tempomat je najjeftinije osiguranje od radara."] },
        { type: "note", text: "Ovo je sažetak za posjetitelje, a ne pravni savjet. Iznosi se mogu promijeniti, a mjerodavan je zakon." },
      ],
    },
    {
      title: "Vožnja po BiH: pravila koja svaki posjetitelj treba znati",
      lead: "Ograničenja brzine, svjetla tijekom cijelog dana, alkohol, djeca i zimska oprema na jednom mjestu.",
      blocks: [
        { type: "p", text: "U Bosni i Hercegovini vozi se desnom stranom i pravila su slična ostatku Europe. Pet stvari najčešće iznenadi posjetitelje." },
        { type: "h2", text: "1. Ograničenja brzine" },
        speedTable(l),
        { type: "p", text: "Prometni znakovi imaju prednost nad općim ograničenjima, a naselja često počinju odmah iza zavoja. Usporite čim vidite ploču s nazivom mjesta." },
        { type: "h2", text: "2. Svjetla danju i noću" },
        { type: "p", text: "Kratka ili dnevna svjetla moraju biti upaljena kad god se vozilo kreće, i u podne u srpnju." },
        { type: "h2", text: "3. Alkohol: 0,3 g/kg" },
        { type: "p", text: "Opća granica je 0,3 g/kg. Za vozače mlađe od 21 godine, vozače s manje od tri godine iskustva i profesionalne vozače granica je nula." },
        { type: "h2", text: "4. Djeca" },
        { type: "ul", items: ["Dijete mlađe od 12 godina ne smije sjediti na prednjem sjedalu.", "Djeca do 5 godina voze se u dječjoj sjedalici, a od 5 do 12 godina na povišenom sjedalu."] },
        { type: "h2", text: "5. Zimska oprema od 1. studenog do 1. travnja" },
        { type: "p", text: "U tom razdoblju obvezne su zimske gume, ili ljetne uz lance u vozilu." },
        { type: "h2", text: "Pojas i mobitel" },
        { type: "p", text: "Pojas je obvezan na svim sjedalima, a mobitel se smije koristiti samo uz handsfree. Obje kazne povećane su u svibnju 2026." },
        { type: "note", text: "Sažetak za posjetitelje, a ne pravni savjet. Mjerodavan je zakon." },
      ],
    },
  ];
}

export function getGuides(locale: string): Guide[] {
  const l: Loc = locale === "en" ? "en" : "hr";
  return copy(l).map((c, i) => ({ ...META[i], updated: UPDATED, ...c }));
}

export function getGuide(locale: string, slug: string): Guide | null {
  return getGuides(locale).find((g) => g.slug === slug) ?? null;
}

export const GUIDE_SLUGS = META.map((m) => m.slug);
