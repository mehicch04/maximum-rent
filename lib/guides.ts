import { AIRPORT, MEDJUGORJE, TRIPS } from "./guides-extra";

export type GuideBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "table"; head: [string, string]; rows: [string, string][] }
  | { type: "note"; text: string };

export type GuideIcon = "fines" | "rules" | "trips" | "airport" | "medjugorje";

export type Guide = {
  slug: string;
  icon: GuideIcon;
  minutes: number;
  updated: string;
  title: string;
  lead: string;
  blocks: GuideBlock[];
};

type Loc = "hr" | "en" | "de" | "es";
type Copy = Pick<Guide, "title" | "lead" | "blocks">;

const META = [
  { slug: "prometne-kazne-bih", icon: "fines", minutes: 2 },
  { slug: "pravila-voznje-bih", icon: "rules", minutes: 2 },
  { slug: "izleti-mostar-medugorje", icon: "trips", minutes: 4 },
  { slug: "zracna-luka-mostar", icon: "airport", minutes: 3 },
  { slug: "medugorje-autom", icon: "medjugorje", minutes: 3 },
] as const;

const UPDATED = "2026-11-02";

const W: Record<Loc, { to: string; about: string; nf: string }> = {
  hr: { to: "do", about: "oko", nf: "hr-HR" },
  en: { to: "to", about: "about", nf: "en-GB" },
  de: { to: "bis", about: "ca.", nf: "de-DE" },
  es: { to: "a", about: "aprox.", nf: "es-ES" },
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
  de: [
    "10 bis 20 km/h zu schnell",
    "20 bis 30 km/h zu schnell",
    "Mehr als 30 km/h zu schnell",
    "Handy am Steuer ohne Freisprechanlage",
    "Nicht angeschnallt",
    "Rote Ampel überfahren",
    "Alkohol 0,3 bis 0,8 g/kg",
    "Alkohol 0,8 bis 1,5 g/kg",
    "Alkohol über 1,5 g/kg",
    "Kind unter 12 auf dem Beifahrersitz",
    "Kind ohne vorgeschriebenen Kindersitz",
    "Tagsüber ohne Abblend- oder Tagfahrlicht",
    "Ohne Winterausrüstung (1.11. bis 1.4.)",
    "Rücksichtsloses Fahren (z. B. 40 km/h zu schnell innerorts, 60 außerorts)",
  ],
  es: [
    "Exceso de velocidad de 10 a 20 km/h",
    "Exceso de velocidad de 20 a 30 km/h",
    "Exceso de velocidad de más de 30 km/h",
    "Móvil al volante sin manos libres",
    "Sin cinturón de seguridad",
    "Saltarse un semáforo en rojo",
    "Alcohol de 0,3 a 0,8 g/kg",
    "Alcohol de 0,8 a 1,5 g/kg",
    "Alcohol por encima de 1,5 g/kg",
    "Menor de 12 años en el asiento delantero",
    "Niño sin la silla infantil obligatoria",
    "Circular de día sin luces de cruce o diurnas",
    "Sin equipamiento de invierno (1.11. a 1.4.)",
    "Conducción temeraria (p. ej. 40 km/h de más en ciudad, 60 fuera)",
  ],
};

const SPEED: Record<Loc, { head: [string, string]; rows: string[] }> = {
  hr: { head: ["Cesta", "Ograničenje"], rows: ["U naselju", "Izvan naselja", "Brze ceste", "Autocesta"] },
  en: { head: ["Road", "Limit"], rows: ["In towns and villages", "Outside towns", "Expressways", "Motorways"] },
  de: { head: ["Straße", "Limit"], rows: ["Innerorts", "Außerorts", "Schnellstraßen", "Autobahn"] },
  es: { head: ["Vía", "Límite"], rows: ["En poblado", "Fuera de poblado", "Vías rápidas", "Autopistas"] },
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
  if (l === "de")
    return [
      {
        title: "Bußgelder in Bosnien und Herzegowina (2026): Tempo, Handy, Gurt",
        lead: "Was Rasen, Handy am Steuer, fehlender Gurt, Alkohol und Rotlicht kosten, in KM und Euro.",
        blocks: [
          { type: "p", text: "Bußgelder in Bosnien und Herzegowina regelt ein einheitliches Staatsgesetz, die Beträge sind also in Mostar, Međugorje und im ganzen Land gleich. Sie werden in Konvertiblen Mark angegeben, fest an den Euro gekoppelt: 1 € = 1,95583 KM. Die Tabelle folgt dem Gesetz mit den Änderungen, die seit dem 27. Mai 2026 gelten." },
          finesTable(l, ["Verstoß", "Bußgeld"]),
          { type: "h2", text: "Was sich im Mai 2026 geändert hat" },
          { type: "ul", items: ["Handy am Steuer und fehlender Gurt kosten jetzt 200 bis 400 KM statt 100 bis 300 KM.", "Neu ist das rücksichtslose Fahren: mehr als 40 km/h zu schnell innerorts oder 60 km/h außerorts sowie wiederholtes Überfahren roter Ampeln. Dafür drohen 2.000 bis 3.000 KM und sechs Monate Fahrverbot."] },
          { type: "h2", text: "Tempolimits" },
          speedTable(l),
          { type: "h2", text: "Wenn Sie im Mietwagen angehalten werden" },
          { type: "ul", items: ["Das Bußgeld geht an den Fahrer. Laut unseren Mietbedingungen trägt der Mieter Bußgelder für Verkehrsverstöße.", "Haben Sie Führerschein, Personalausweis oder Reisepass und den Mietvertrag dabei, den Sie mit dem Fahrzeug erhalten.", "Der Tempomat ist die günstigste Versicherung gegen Blitzer."] },
          { type: "note", text: "Eine Zusammenfassung für Besucher, keine Rechtsberatung. Beträge können sich ändern, maßgeblich ist das Gesetz." },
        ],
      },
      {
        title: "Autofahren in Bosnien und Herzegowina: Regeln für Besucher",
        lead: "Tempolimits, Licht am Tag, Alkohol, Kinder und Winterausrüstung auf einen Blick.",
        blocks: [
          { type: "p", text: "In Bosnien und Herzegowina fährt man rechts, und die Regeln ähneln denen im übrigen Europa. Fünf Punkte überraschen Besucher am häufigsten." },
          { type: "h2", text: "1. Tempolimits" },
          speedTable(l),
          { type: "p", text: "Verkehrszeichen gehen den allgemeinen Limits vor, und Ortschaften beginnen oft direkt hinter einer Kurve. Bremsen Sie, sobald Sie das Ortsschild sehen." },
          { type: "h2", text: "2. Licht bei Tag und Nacht" },
          { type: "p", text: "Abblend- oder Tagfahrlicht muss immer eingeschaltet sein, wenn das Fahrzeug fährt, auch mittags im Juli." },
          { type: "h2", text: "3. Alkohol: 0,3 g/kg" },
          { type: "p", text: "Die allgemeine Grenze liegt bei 0,3 g/kg. Für Fahrer unter 21, Fahranfänger mit weniger als drei Jahren Erfahrung und Berufsfahrer gilt null." },
          { type: "h2", text: "4. Kinder" },
          { type: "ul", items: ["Kinder unter 12 Jahren dürfen nicht vorne sitzen.", "Kinder bis 5 Jahre fahren im Kindersitz, von 5 bis 12 Jahren auf einer Sitzerhöhung."] },
          { type: "h2", text: "5. Winterausrüstung vom 1. November bis 1. April" },
          { type: "p", text: "In diesem Zeitraum sind Winterreifen Pflicht, oder Sommerreifen mit Schneeketten im Fahrzeug." },
          { type: "h2", text: "Gurt und Handy" },
          { type: "p", text: "Auf allen Sitzen herrscht Gurtpflicht, und das Handy darf nur mit Freisprechanlage benutzt werden. Beide Bußgelder wurden im Mai 2026 erhöht." },
          { type: "note", text: "Eine Zusammenfassung für Besucher, keine Rechtsberatung. Maßgeblich ist das Gesetz." },
        ],
      },
    ];
  if (l === "es")
    return [
      {
        title: "Multas de tráfico en Bosnia y Herzegovina (2026): velocidad, móvil, cinturón",
        lead: "Cuánto cuestan el exceso de velocidad, el móvil, el cinturón, el alcohol y los semáforos en rojo, en KM y euros.",
        blocks: [
          { type: "p", text: "Las multas en Bosnia y Herzegovina las fija una única ley estatal, así que los importes son los mismos en Mostar, Međugorje y el resto del país. Se expresan en marcos convertibles, con un cambio fijo con el euro: 1 € = 1,95583 KM. La tabla sigue la ley con los cambios vigentes desde el 27 de mayo de 2026." },
          finesTable(l, ["Infracción", "Multa"]),
          { type: "h2", text: "Qué cambió en mayo de 2026" },
          { type: "ul", items: ["Usar el móvil al volante y no llevar el cinturón cuesta ahora de 200 a 400 KM, antes de 100 a 300 KM.", "Se introdujo la conducción temeraria: superar el límite en más de 40 km/h en poblado o 60 km/h fuera, y saltarse semáforos en rojo de forma repetida. La multa es de 2.000 a 3.000 KM y seis meses sin carné."] },
          { type: "h2", text: "Límites de velocidad" },
          speedTable(l),
          { type: "h2", text: "Si te paran con un coche de alquiler" },
          { type: "ul", items: ["La multa se pone al conductor. Según nuestras condiciones de alquiler, las multas de tráfico corren a cargo del arrendatario.", "Lleva contigo el carné de conducir, el DNI o pasaporte y el contrato de alquiler que recibes con el vehículo.", "El control de crucero es el seguro más barato contra los radares."] },
          { type: "note", text: "Resumen para visitantes, no asesoramiento legal. Los importes pueden cambiar y lo que cuenta es la ley." },
        ],
      },
      {
        title: "Conducir en Bosnia y Herzegovina: normas que todo visitante debe conocer",
        lead: "Límites de velocidad, luces todo el día, alcohol, niños y equipamiento de invierno en un solo lugar.",
        blocks: [
          { type: "p", text: "En Bosnia y Herzegovina se conduce por la derecha y las normas se parecen a las del resto de Europa. Cinco puntos son los que más sorprenden a los visitantes." },
          { type: "h2", text: "1. Límites de velocidad" },
          speedTable(l),
          { type: "p", text: "Las señales prevalecen sobre los límites generales, y los pueblos suelen empezar justo después de una curva. Reduce la velocidad en cuanto veas el cartel con el nombre del lugar." },
          { type: "h2", text: "2. Luces de día y de noche" },
          { type: "p", text: "Las luces de cruce o diurnas deben ir encendidas siempre que el vehículo esté en marcha, incluso a mediodía en julio." },
          { type: "h2", text: "3. Alcohol: 0,3 g/kg" },
          { type: "p", text: "El límite general es de 0,3 g/kg. Para menores de 21 años, conductores con menos de tres años de experiencia y profesionales el límite es cero." },
          { type: "h2", text: "4. Niños" },
          { type: "ul", items: ["Los menores de 12 años no pueden ir en el asiento delantero.", "Hasta los 5 años viajan en silla infantil y de 5 a 12 años en un alzador."] },
          { type: "h2", text: "5. Equipamiento de invierno del 1 de noviembre al 1 de abril" },
          { type: "p", text: "En este periodo son obligatorios los neumáticos de invierno, o neumáticos de verano con cadenas en el coche." },
          { type: "h2", text: "Cinturón y móvil" },
          { type: "p", text: "El cinturón es obligatorio en todos los asientos y el móvil solo puede usarse con manos libres. Ambas multas subieron en mayo de 2026." },
          { type: "note", text: "Resumen para visitantes, no asesoramiento legal. Lo que cuenta es la ley." },
        ],
      },
    ];
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
  const l: Loc = (["hr", "en", "de", "es"] as const).includes(locale as Loc) ? (locale as Loc) : "hr";
  return [...copy(l), TRIPS[l](), AIRPORT[l](), MEDJUGORJE[l]()].map((c, i) => ({ ...META[i], updated: UPDATED, ...c }));
}

export function getGuide(locale: string, slug: string): Guide | null {
  return getGuides(locale).find((g) => g.slug === slug) ?? null;
}

export const GUIDE_SLUGS = META.map((m) => m.slug);
