import type { TermsContent } from "@/lib/rental-terms";

export type PrivacyContent = TermsContent & {
  updated: string;
  facts: { v: string; l: string }[];
  helpTitle: string;
  helpBody: string;
  cookies: string;
};

const CONTROLLER = "MAXIMUM RENT A CAR d.o.o., Potpolje b.b., 88260 Čitluk";

export const PRIVACY: Record<"hr" | "en" | "de" | "es", PrivacyContent> = {
  hr: {
    heading: "Politika privatnosti",
    intro: "Koje osobne podatke prikupljamo putem ove stranice, zašto ih koristimo, koliko ih dugo čuvamo i kako ostvariti svoja prava.",
    articleLabel: "Članak",
    indexLabel: "Sadržaj",
    updated: "Zadnja izmjena: studeni 2026.",
    facts: [
      { v: "0", l: "kolačića za analitiku i oglase" },
      { v: "14 dana", l: "nakon povrata vozila upit se briše" },
      { v: "Karte", l: "učitavaju se tek uz vašu privolu" },
      { v: "Nikad", l: "ne prodajemo vaše podatke" },
    ],
    helpTitle: "Pitanja o vašim podacima?",
    helpBody: "Pišite nam i odgovorit ćemo u najkraćem roku.",
    cookies: "Postavke kolačića",
    articles: [
      {
        n: 1,
        topic: "Voditelj obrade",
        blocks: [
          { type: "p", text: `Voditelj obrade osobnih podataka je ${CONTROLLER}, Bosna i Hercegovina. Za sva pitanja o zaštiti podataka možete nam pisati na info@maximum-rent.com ili nas nazvati na +387 63 660 444.` },
        ],
      },
      {
        n: 2,
        topic: "Koje podatke prikupljamo",
        blocks: [
          { type: "p", text: "Prikupljamo samo podatke koje sami unesete u obrasce na stranici:" },
          {
            type: "ul",
            items: [
              "Upit za najam: ime i prezime, email, broj telefona, odabrano vozilo, datumi i lokacije preuzimanja i povrata, dodatna oprema te, ako ih unesete, broj leta i poruka.",
              "Kontakt i poslovni upit: ime i prezime, email, broj telefona, naziv tvrtke i poruka.",
              "Tehnički podaci: IP adresa, isključivo radi zaštite obrazaca od zloupotrebe i prekomjernog slanja.",
            ],
          },
          { type: "p", text: "Podatke potrebne za sklapanje ugovora o najmu, poput vozačke dozvole i osobne isprave, ne prikupljamo putem stranice nego prilikom preuzimanja vozila na poslovnici." },
        ],
      },
      {
        n: 3,
        topic: "Svrha i pravna osnova",
        blocks: [
          {
            type: "ul",
            items: [
              "Odgovor na vaš upit, provjera dostupnosti vozila i priprema najma, na vaš zahtjev prije sklapanja ugovora.",
              "Slanje potvrde upita i obavijesti o rezervaciji na vaš email.",
              "Zaštita stranice i obrazaca od zloupotrebe, na temelju našeg legitimnog interesa.",
              "Prikaz Google karata, isključivo na temelju vaše privole.",
            ],
          },
          { type: "p", text: "Ne koristimo vaše podatke za automatizirano odlučivanje, profiliranje ni slanje promotivnih poruka." },
        ],
      },
      {
        n: 4,
        topic: "Koliko dugo čuvamo podatke",
        blocks: [
          {
            type: "ul",
            items: [
              "Upiti za najam automatski se brišu 14 dana nakon datuma povrata vozila.",
              "Kontakt i poslovni upiti čuvaju se dok je potrebno za odgovor i daljnju suradnju, a na vaš zahtjev ih brišemo ranije.",
              "Podaci iz sklopljenih ugovora o najmu čuvaju se onoliko koliko propisuju zakoni Bosne i Hercegovine.",
            ],
          },
        ],
      },
      {
        n: 5,
        topic: "Kome prosljeđujemo podatke",
        blocks: [
          { type: "p", text: "Vaše podatke ne prodajemo i ne ustupamo u marketinške svrhe. Za rad stranice koristimo provjerene pružatelje usluga koji podatke obrađuju samo po našem nalogu:" },
          {
            type: "ul",
            items: [
              "Vercel, za hosting stranice.",
              "Supabase, za bazu podataka u kojoj se čuvaju upiti.",
              "Resend, za slanje email potvrda.",
              "Google, za prikaz karata, samo ako ih uključite.",
            ],
          },
          { type: "p", text: "Neki od ovih pružatelja mogu obrađivati podatke izvan Bosne i Hercegovine, uz odgovarajuće ugovorne mjere zaštite." },
        ],
      },
      {
        n: 6,
        topic: "Kolačići i lokalna pohrana",
        blocks: [
          { type: "p", text: "Ne koristimo kolačiće za analitiku ni oglašavanje. Koristimo samo ono što je nužno za rad stranice:" },
          {
            type: "ul",
            items: [
              "Kolačić s odabranim jezikom stranice.",
              "Lokalnu pohranu preglednika za odabranu valutu i vaše postavke privatnosti.",
              "Pohranu sesije kako se uvodna animacija ne bi ponavljala tijekom posjeta.",
            ],
          },
          { type: "p", text: "Ugrađene Google karte učitavamo tek kada ih dopustite, jer Google pritom može postaviti vlastite kolačiće. Svoj odabir možete promijeniti u bilo kojem trenutku putem poveznice Postavke kolačića u podnožju stranice." },
        ],
      },
      {
        n: 7,
        topic: "Vaša prava",
        blocks: [
          {
            type: "ul",
            items: [
              "Pravo na pristup svojim podacima i dobivanje kopije.",
              "Pravo na ispravak netočnih podataka.",
              "Pravo na brisanje i ograničenje obrade.",
              "Pravo na prigovor i na prijenos podataka.",
              "Pravo da u svakom trenutku povučete privolu, bez utjecaja na raniju obradu.",
            ],
          },
          { type: "p", text: "Zahtjev pošaljite na info@maximum-rent.com. Ako smatrate da su vaša prava povrijeđena, možete podnijeti pritužbu Agenciji za zaštitu osobnih podataka u Bosni i Hercegovini, a gosti iz Europske unije i nadzornom tijelu svoje države." },
        ],
      },
      {
        n: 8,
        topic: "Sigurnost i izmjene",
        blocks: [
          { type: "p", text: "Stranica radi isključivo preko šifrirane veze, pristup upitima ima samo ovlašteno osoblje, a obrasci su zaštićeni od automatiziranog slanja. Ovu politiku možemo povremeno ažurirati, a datum zadnje izmjene uvijek je naveden na vrhu stranice." },
        ],
      },
    ],
  },
  en: {
    heading: "Privacy policy",
    intro: "Which personal data we collect through this website, why we use it, how long we keep it and how to exercise your rights.",
    articleLabel: "Article",
    indexLabel: "Contents",
    updated: "Last updated: November 2026",
    facts: [
      { v: "0", l: "analytics or advertising cookies" },
      { v: "14 days", l: "after the return the inquiry is deleted" },
      { v: "Maps", l: "load only with your consent" },
      { v: "Never", l: "do we sell your data" },
    ],
    helpTitle: "Questions about your data?",
    helpBody: "Write to us and we will reply as soon as possible.",
    cookies: "Cookie settings",
    articles: [
      {
        n: 1,
        topic: "Data controller",
        blocks: [
          { type: "p", text: `The controller of your personal data is ${CONTROLLER}, Bosnia and Herzegovina. For any data protection question, write to info@maximum-rent.com or call +387 63 660 444.` },
        ],
      },
      {
        n: 2,
        topic: "What data we collect",
        blocks: [
          { type: "p", text: "We only collect the data you enter into the forms on the website:" },
          {
            type: "ul",
            items: [
              "Rental inquiry: first and last name, email, phone number, chosen vehicle, pickup and return dates and locations, extras and, if you enter them, your flight number and message.",
              "Contact and business inquiry: first and last name, email, phone number, company name and message.",
              "Technical data: IP address, used only to protect the forms from abuse and excessive submissions.",
            ],
          },
          { type: "p", text: "Data needed to sign the rental agreement, such as your driving licence and ID, is not collected through the website but at the branch when you collect the vehicle." },
        ],
      },
      {
        n: 3,
        topic: "Purpose and legal basis",
        blocks: [
          {
            type: "ul",
            items: [
              "Replying to your inquiry, checking vehicle availability and preparing the rental, at your request before a contract is signed.",
              "Sending the inquiry confirmation and booking updates to your email.",
              "Protecting the website and forms from abuse, based on our legitimate interest.",
              "Showing Google Maps, only on the basis of your consent.",
            ],
          },
          { type: "p", text: "We do not use your data for automated decision making, profiling or promotional messages." },
        ],
      },
      {
        n: 4,
        topic: "How long we keep data",
        blocks: [
          {
            type: "ul",
            items: [
              "Rental inquiries are deleted automatically 14 days after the vehicle return date.",
              "Contact and business inquiries are kept as long as needed to reply and work together, and we delete them earlier on request.",
              "Data from signed rental agreements is kept for as long as the laws of Bosnia and Herzegovina require.",
            ],
          },
        ],
      },
      {
        n: 5,
        topic: "Who we share data with",
        blocks: [
          { type: "p", text: "We do not sell your data or share it for marketing. To run the website we use trusted service providers who process data only on our instructions:" },
          {
            type: "ul",
            items: [
              "Vercel, for website hosting.",
              "Supabase, for the database where inquiries are stored.",
              "Resend, for sending email confirmations.",
              "Google, for showing maps, only if you turn them on.",
            ],
          },
          { type: "p", text: "Some of these providers may process data outside Bosnia and Herzegovina, with appropriate contractual safeguards." },
        ],
      },
      {
        n: 6,
        topic: "Cookies and local storage",
        blocks: [
          { type: "p", text: "We do not use analytics or advertising cookies. We only use what the website needs to work:" },
          {
            type: "ul",
            items: [
              "A cookie with your chosen website language.",
              "Browser local storage for your chosen currency and privacy settings.",
              "Session storage so the intro animation does not repeat during your visit.",
            ],
          },
          { type: "p", text: "Embedded Google Maps load only once you allow them, because Google may set its own cookies. You can change your choice at any time through the Cookie settings link in the footer." },
        ],
      },
      {
        n: 7,
        topic: "Your rights",
        blocks: [
          {
            type: "ul",
            items: [
              "The right to access your data and receive a copy.",
              "The right to correct inaccurate data.",
              "The right to erasure and to restrict processing.",
              "The right to object and to data portability.",
              "The right to withdraw consent at any time, without affecting earlier processing.",
            ],
          },
          { type: "p", text: "Send your request to info@maximum-rent.com. If you believe your rights have been violated, you can lodge a complaint with the Personal Data Protection Agency of Bosnia and Herzegovina, and guests from the European Union also with the supervisory authority in their country." },
        ],
      },
      {
        n: 8,
        topic: "Security and changes",
        blocks: [
          { type: "p", text: "The website runs only over an encrypted connection, only authorised staff can access inquiries and the forms are protected against automated submissions. We may update this policy from time to time, and the date of the last change is always shown at the top of the page." },
        ],
      },
    ],
  },
  de: {
    heading: "Datenschutzerklärung",
    intro: "Welche personenbezogenen Daten wir über diese Website erheben, wofür wir sie nutzen, wie lange wir sie speichern und wie Sie Ihre Rechte wahrnehmen.",
    articleLabel: "Artikel",
    indexLabel: "Inhalt",
    updated: "Stand: November 2026",
    facts: [
      { v: "0", l: "Cookies für Analyse und Werbung" },
      { v: "14 Tage", l: "nach der Rückgabe wird die Anfrage gelöscht" },
      { v: "Karten", l: "laden nur mit Ihrer Zustimmung" },
      { v: "Nie", l: "verkaufen wir Ihre Daten" },
    ],
    helpTitle: "Fragen zu Ihren Daten?",
    helpBody: "Schreiben Sie uns, wir antworten so schnell wie möglich.",
    cookies: "Cookies verwalten",
    articles: [
      {
        n: 1,
        topic: "Verantwortlicher",
        blocks: [
          { type: "p", text: `Verantwortlich für die Verarbeitung Ihrer Daten ist ${CONTROLLER}, Bosnien und Herzegowina. Bei Fragen zum Datenschutz schreiben Sie an info@maximum-rent.com oder rufen Sie +387 63 660 444 an.` },
        ],
      },
      {
        n: 2,
        topic: "Welche Daten wir erheben",
        blocks: [
          { type: "p", text: "Wir erheben nur Daten, die Sie selbst in die Formulare der Website eingeben:" },
          {
            type: "ul",
            items: [
              "Mietanfrage: vollständiger Name, Mailadresse, Telefonnummer, gewähltes Fahrzeug, Daten und Orte für Abholung und Rückgabe, Extras sowie, falls angegeben, Flugnummer und Nachricht.",
              "Kontaktanfrage und Firmenanfrage: vollständiger Name, Mailadresse, Telefonnummer, Firmenname und Nachricht.",
              "Technische Daten: die IP Ihres Geräts, ausschließlich zum Schutz der Formulare vor Missbrauch und übermäßigem Versand.",
            ],
          },
          { type: "p", text: "Daten für den Mietvertrag, etwa Führerschein und Ausweis, erheben wir nicht über die Website, sondern bei der Fahrzeugübergabe in der Filiale." },
        ],
      },
      {
        n: 3,
        topic: "Zweck und Rechtsgrundlage",
        blocks: [
          {
            type: "ul",
            items: [
              "Beantwortung Ihrer Anfrage, Prüfung der Verfügbarkeit und Vorbereitung der Miete, auf Ihren Wunsch vor Vertragsschluss.",
              "Versand der Anfragebestätigung und von Buchungsinformationen an Ihre Mailadresse.",
              "Schutz der Website und Formulare vor Missbrauch, auf Grundlage unseres berechtigten Interesses.",
              "Anzeige von Google Maps, ausschließlich mit Ihrer Einwilligung.",
            ],
          },
          { type: "p", text: "Wir nutzen Ihre Daten nicht für automatisierte Entscheidungen, Profiling oder Werbenachrichten." },
        ],
      },
      {
        n: 4,
        topic: "Speicherdauer",
        blocks: [
          {
            type: "ul",
            items: [
              "Mietanfragen werden 14 Tage nach dem Rückgabedatum automatisch gelöscht.",
              "Kontaktanfragen und Firmenanfragen speichern wir, solange es für die Antwort und die weitere Zusammenarbeit nötig ist, auf Wunsch löschen wir sie früher.",
              "Daten aus abgeschlossenen Mietverträgen speichern wir so lange, wie es die Gesetze von Bosnien und Herzegowina vorschreiben.",
            ],
          },
        ],
      },
      {
        n: 5,
        topic: "Empfänger der Daten",
        blocks: [
          { type: "p", text: "Wir verkaufen Ihre Daten nicht und geben sie nicht für Werbezwecke weiter. Für den Betrieb der Website nutzen wir geprüfte Dienstleister, die Daten nur in unserem Auftrag verarbeiten:" },
          {
            type: "ul",
            items: [
              "Vercel, für das Hosting der Website.",
              "Supabase, für die Datenbank, in der Anfragen gespeichert werden.",
              "Resend, für den Versand von Bestätigungen per Mail.",
              "Google, für die Anzeige von Karten, nur wenn Sie diese aktivieren.",
            ],
          },
          { type: "p", text: "Einige dieser Anbieter können Daten außerhalb von Bosnien und Herzegowina verarbeiten, mit geeigneten vertraglichen Schutzmaßnahmen." },
        ],
      },
      {
        n: 6,
        topic: "Cookies und lokaler Speicher",
        blocks: [
          { type: "p", text: "Wir verwenden keine Cookies für Analyse oder Werbung, sondern nur, was für den Betrieb der Website nötig ist:" },
          {
            type: "ul",
            items: [
              "Ein Cookie mit der gewählten Sprache der Website.",
              "Den lokalen Speicher des Browsers für die gewählte Währung und Ihre Datenschutzeinstellungen.",
              "Den Sitzungsspeicher, damit sich die Begrüßungsanimation während Ihres Besuchs nicht wiederholt.",
            ],
          },
          { type: "p", text: "Eingebettete Karten von Google laden wir erst, wenn Sie sie erlauben, da Google dabei eigene Cookies setzen kann. Ihre Auswahl können Sie jederzeit über den Link Cookies verwalten in der Fußzeile ändern." },
        ],
      },
      {
        n: 7,
        topic: "Ihre Rechte",
        blocks: [
          {
            type: "ul",
            items: [
              "Recht auf Auskunft über Ihre Daten und auf eine Kopie.",
              "Recht auf Berichtigung unrichtiger Daten.",
              "Recht auf Löschung und Einschränkung der Verarbeitung.",
              "Recht auf Widerspruch und Datenübertragbarkeit.",
              "Recht, eine Einwilligung jederzeit zu widerrufen, ohne dass die frühere Verarbeitung berührt wird.",
            ],
          },
          { type: "p", text: "Senden Sie Ihre Anfrage an info@maximum-rent.com. Wenn Sie meinen, dass Ihre Rechte verletzt wurden, können Sie sich bei der Agentur für den Schutz personenbezogener Daten in Bosnien und Herzegowina beschweren, Gäste aus der Europäischen Union auch bei der Aufsichtsbehörde ihres Landes." },
        ],
      },
      {
        n: 8,
        topic: "Sicherheit und Änderungen",
        blocks: [
          { type: "p", text: "Die Website läuft ausschließlich über eine verschlüsselte Verbindung, nur befugtes Personal hat Zugriff auf Anfragen, und die Formulare sind gegen automatisierten Versand geschützt. Wir können diese Erklärung gelegentlich aktualisieren, das Datum der letzten Änderung steht immer oben auf der Seite." },
        ],
      },
    ],
  },
  es: {
    heading: "Política de privacidad",
    intro: "Qué datos personales recogemos a través de esta web, para qué los usamos, cuánto tiempo los guardamos y cómo ejercer tus derechos.",
    articleLabel: "Artículo",
    indexLabel: "Contenido",
    updated: "Última actualización: noviembre de 2026",
    facts: [
      { v: "0", l: "cookies de analítica o publicidad" },
      { v: "14 días", l: "después de la devolución se borra la solicitud" },
      { v: "Mapas", l: "solo se cargan con tu consentimiento" },
      { v: "Nunca", l: "vendemos tus datos" },
    ],
    helpTitle: "¿Preguntas sobre tus datos?",
    helpBody: "Escríbenos y te responderemos lo antes posible.",
    cookies: "Ajustes de cookies",
    articles: [
      {
        n: 1,
        topic: "Responsable del tratamiento",
        blocks: [
          { type: "p", text: `El responsable del tratamiento de tus datos es ${CONTROLLER}, Bosnia y Herzegovina. Para cualquier pregunta sobre protección de datos escribe a info@maximum-rent.com o llama al +387 63 660 444.` },
        ],
      },
      {
        n: 2,
        topic: "Qué datos recogemos",
        blocks: [
          { type: "p", text: "Solo recogemos los datos que tú introduces en los formularios de la web:" },
          {
            type: "ul",
            items: [
              "Solicitud de alquiler: nombre y apellidos, email, teléfono, vehículo elegido, fechas y lugares de recogida y devolución, extras y, si los indicas, número de vuelo y mensaje.",
              "Contacto y solicitud para empresas: nombre y apellidos, email, teléfono, nombre de la empresa y mensaje.",
              "Datos técnicos: dirección IP, usada solo para proteger los formularios frente al abuso y los envíos excesivos.",
            ],
          },
          { type: "p", text: "Los datos necesarios para firmar el contrato de alquiler, como el carné de conducir y el documento de identidad, no se recogen en la web sino en la oficina al recoger el vehículo." },
        ],
      },
      {
        n: 3,
        topic: "Finalidad y base legal",
        blocks: [
          {
            type: "ul",
            items: [
              "Responder a tu solicitud, comprobar la disponibilidad y preparar el alquiler, a petición tuya antes de firmar el contrato.",
              "Enviar a tu email la confirmación de la solicitud y los avisos de la reserva.",
              "Proteger la web y los formularios frente al abuso, por nuestro interés legítimo.",
              "Mostrar Google Maps, solo con tu consentimiento.",
            ],
          },
          { type: "p", text: "No usamos tus datos para decisiones automatizadas, elaboración de perfiles ni mensajes promocionales." },
        ],
      },
      {
        n: 4,
        topic: "Cuánto tiempo guardamos los datos",
        blocks: [
          {
            type: "ul",
            items: [
              "Las solicitudes de alquiler se borran automáticamente 14 días después de la fecha de devolución.",
              "Las solicitudes de contacto y de empresas se guardan el tiempo necesario para responder y colaborar, y las borramos antes si lo pides.",
              "Los datos de los contratos de alquiler firmados se guardan el tiempo que exigen las leyes de Bosnia y Herzegovina.",
            ],
          },
        ],
      },
      {
        n: 5,
        topic: "Con quién compartimos los datos",
        blocks: [
          { type: "p", text: "No vendemos tus datos ni los cedemos con fines de marketing. Para que la web funcione usamos proveedores de confianza que tratan los datos solo según nuestras instrucciones:" },
          {
            type: "ul",
            items: [
              "Vercel, para el alojamiento de la web.",
              "Supabase, para la base de datos donde se guardan las solicitudes.",
              "Resend, para enviar las confirmaciones por email.",
              "Google, para mostrar mapas, solo si los activas.",
            ],
          },
          { type: "p", text: "Algunos de estos proveedores pueden tratar datos fuera de Bosnia y Herzegovina, con las garantías contractuales adecuadas." },
        ],
      },
      {
        n: 6,
        topic: "Cookies y almacenamiento local",
        blocks: [
          { type: "p", text: "No usamos cookies de analítica ni de publicidad. Solo usamos lo necesario para que la web funcione:" },
          {
            type: "ul",
            items: [
              "Una cookie con el idioma elegido de la web.",
              "El almacenamiento local del navegador para la moneda elegida y tus ajustes de privacidad.",
              "El almacenamiento de sesión para que la animación de inicio no se repita durante tu visita.",
            ],
          },
          { type: "p", text: "Los mapas de Google integrados solo se cargan cuando los permites, ya que Google puede instalar sus propias cookies. Puedes cambiar tu elección en cualquier momento con el enlace Ajustes de cookies del pie de página." },
        ],
      },
      {
        n: 7,
        topic: "Tus derechos",
        blocks: [
          {
            type: "ul",
            items: [
              "Derecho de acceso a tus datos y a recibir una copia.",
              "Derecho de rectificación de datos inexactos.",
              "Derecho de supresión y de limitación del tratamiento.",
              "Derecho de oposición y de portabilidad.",
              "Derecho a retirar tu consentimiento en cualquier momento, sin que afecte al tratamiento anterior.",
            ],
          },
          { type: "p", text: "Envía tu solicitud a info@maximum-rent.com. Si crees que se han vulnerado tus derechos, puedes presentar una reclamación ante la Agencia de Protección de Datos Personales de Bosnia y Herzegovina y, si vienes de la Unión Europea, también ante la autoridad de control de tu país." },
        ],
      },
      {
        n: 8,
        topic: "Seguridad y cambios",
        blocks: [
          { type: "p", text: "La web funciona solo mediante una conexión cifrada, solo el personal autorizado accede a las solicitudes y los formularios están protegidos contra envíos automatizados. Podemos actualizar esta política de vez en cuando, y la fecha del último cambio siempre aparece en la parte superior de la página." },
        ],
      },
    ],
  },
};
