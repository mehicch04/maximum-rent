export type TermsBlock =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

export type TermsArticle = {
  n: number;
  topic: string;
  blocks: TermsBlock[];
};

export type TermsContent = {
  heading: string;
  intro: string;
  articleLabel: string;
  indexLabel: string;
  articles: TermsArticle[];
};

export const RENTAL_TERMS: Record<"hr" | "en" | "de" | "es", TermsContent> = {
  hr: {
    heading: "Uvjeti najma",
    intro:
      "Opći uvjeti najma vozila tvrtke Maximum Rent a Car. Molimo da pažljivo pročitate sve članke prije preuzimanja vozila.",
    articleLabel: "Članak",
    indexLabel: "Sadržaj",
    articles: [
      {
        n: 1,
        topic: "Pojmovi i definicije",
        blocks: [
          {
            type: "ul",
            items: [
              `„Najmodavatelj": tvrtka MAXIMUM RENT A CAR d. o. o., sa sjedištem na adresi Potpolje bb, 88260 Čitluk, Bosna i Hercegovina, matični broj: 4227631720004.`,
              `„Najmoprimatelj": fizička ili pravna osoba u čije ime se vozilo unajmljuje. U Ugovoru o najmu vozila navedena je kao „Najmoprimatelj" te je odgovorna za poštivanje svih točaka ovih Općih uvjeta o najmu i Ugovora o najmu.`,
              `„Ugovor": pojedinačni ugovor o najmu koji se potpisuje prilikom preuzimanja vozila u najam u kojem se odobrava korištenje vozila, definira preuzimanje i vraćanje vozila, pokriće, oprema i usluge uključene u cijenu najma i način plaćanja najma. Ugovor sadrži i informacije o stanju kilometraže, količini goriva, oštećenjima i eventualnim nedostacima na unajmljenom vozilu te druga prava i obveze koje obje ugovorne strane svojim potpisom u cijelosti prihvaćaju.`,
              `Stanje vozila prilikom izdavanja i Opći uvjeti najma smatraju se dijelom Ugovora o najmu vozila.`,
              `„Vozač/dodatni vozač": fizička osoba navedena u Ugovoru o najmu kao „Korisnik" koja potpisuje Ugovor o najmu i preuzima vozilo, odgovorna za poštivanje svih odredbi Ugovora o najmu.`,
              `„Korisnik": Najmoprimatelj, vozač i dodatni vozač u daljnjem tekstu Općih uvjeta najma označavaju se jednom riječju: Korisnik.`,
              `„Vozilo" je objekt najma Ugovora, a čiji podaci su navedeni u Ugovoru.`,
            ],
          },
        ],
      },
      {
        n: 2,
        topic: "Preuzimanje vozila",
        blocks: [
          {
            type: "p",
            text: `Potpisivanjem ovog Ugovora najmoprimatelj potvrđuje da je preuzeo vozilo u ispravnom i neoštećenom stanju i punog spremnika goriva, osim ako u Ugovoru nije izričito pismeno drugčije navedeno. Najmoprimatelj potvrđuje da je uz vozilo primio dokument za vozilo, ključeve za vozilo, svu obveznu opremu i pribor vozila kao i dodatnu opremu i pribor naveden u Ugovoru.`,
          },
          {
            type: "p",
            text: `Najmoprimatelj potpisom Ugovora jamči Najmodavatelju da ispunjava opće uvjete minimuma godina za upravljanje motornim vozilom te da posjeduje potrebne isprave za upravljanje motornim vozilom, sukladno pozitivnim propisima Bosne i Hercegovine, a koje je dužan u originalu dati na uvid najmodavatelju, dok preslika istih ostaje u posjedu Najmodavatelja, kao prilog Ugovoru.`,
          },
        ],
      },
      {
        n: 3,
        topic: "Obveze pri vraćanju vozila",
        blocks: [
          { type: "p", text: `Najmoprimatelj se obvezuje:` },
          {
            type: "ul",
            items: [
              `da će vozilo vratiti u mjesto preuzimanja i to najkasnije u roku utvrđenom ovim Ugovorom;`,
              `da će vozilo vratiti i prije ugovorenog roka, a na zahtjev najmodavatelja;`,
              `da će vozilo vratiti ispravno i neoštećeno, sa svom dokumentacijom, ključevima, gumama, alatom, obaveznom, standardnom i dodatnom opremom, punim spremnikom goriva, kako ga je i preuzeo;`,
              `novčane obveze prema ovom Ugovoru, ukoliko se ne plaćaju u vidu predujma ili pologa, Najmoprimatelj je dužan platiti odmah kod preuzimanja vozila;`,
              `da na teret njegove kreditne kartice ili nekim drugim načinom plaćanja, Najmodavatelj naplati sve troškove popravka, kvarova ili gubitka koji su otkriveni nakon što je vozilo vraćeno, a Najmoprimatelj nije o tome izvijestio Najmodavatelja u skladu s procedurom o povratu vozila;`,
              `da priznaje da je Najmodavatelj ovlašten teretiti njegovu kreditnu karticu za bilo kakve troškove koje najmodavatelj ima prema Ugovoru;`,
              `da će produženje trajanja najma kao i ostale promjene glede najma pravovremeno zatražiti od Najmodavatelja;`,
              `u slučaju da Najmoprimatelj prekorači ugovoreni rok vraćanja vozila bez suglasnosti Najmodavatelja, Najmodavatelj ima pravo vozilo smatrati ukradenim i o tome izvijestiti policiju. U tom slučaju Najmoprimatelj snosi svu nastalu štetu;`,
              `u slučaju prekoračenja roka vraćanja vozila prihvaća sve obveze i odgovornosti iz ovog Ugovora, a koje su inače dogovorene za vrijeme trajanja najma.`,
            ],
          },
          {
            type: "p",
            text: `Svi zaposlenici MAXIMUM RENT A CAR d. o. o. imaju pravo kontrolirati bilo koje vozilo u bilo koje vrijeme. Ako se ustanovi da je Najmoprimatelj prekršio bilo koji od uvjeta ovog Ugovora, zaposlenici su ovlašteni izuzeti vozilo.`,
          },
          {
            type: "p",
            text: `Najmodavatelj bezuvjetno zadržava pravo raskida Ugovora o najmu vozila, bilo kada i bilo gdje i prije isteka Ugovora o najmu vozila, bez ikakve obveze nadoknađivanja štete Najmoprimatelju.`,
          },
        ],
      },
      {
        n: 4,
        topic: "Obveze Najmoprimatelja",
        blocks: [
          { type: "p", text: `Obaveze Najmoprimatelja:` },
          {
            type: "ul",
            items: [
              `da će iznajmljeno vozilo preuzeti i koristiti sukladno Zakonu o sigurnosti prometa na cestama BiH ili bilo kojim drugim zakonom kojim je reguliran cestovni promet na području drugih država, te drugim važećim propisima;`,
              `da će odmah prekinuti vožnju ukoliko se na vozilu dogodi kvar na brojaču kilometara, te o tome bez odlaganja izvijestiti Najmodavatelja;`,
              `da će vozilo koristiti samo za vlastite potrebe;`,
              `da će vozilom upravljati samo Najmoprimatelj ili osoba koja je pored Najmoprimatelja u Ugovoru navedena kao vozač, odnosno u Ugovoru navedena kao dodatni vozač, a sve pod uvjetom da te osobe imaju potrebne dozvole i dokumente za upravljanje vozilom;`,
              `da neće vozilo voziti izvan granica Bosne i Hercegovine, osim ako nije ugovorom naglašeno, kao i da neće voziti vozilo u zemlje u koje ulazak nije dopušten;`,
              `da neće vozilo koristiti u nedozvoljene svrhe, primjerice za vršenje kaznenih djela, carinskih, deviznih ili drugih prekršaja ili drugih nedozvoljenih radnji;`,
              `da neće vozilo pretovariti teretom ili putnicima;`,
              `da neće vozilom upravljati pod utjecajem alkohola ili narkotika;`,
              `da će se brinuti o tehničkoj ispravnosti vozila i obaveznom periodičnom servisiranju vozila;`,
              `da će redovito kontrolirati i po potrebi nadopunjavati tekućinu za hlađenje, ulje i tlak u gumama;`,
              `da će vozilo, kada ga ne koristi, obavezno zaključavati i uzimati ključeve i dokumentaciju vozila uz aktiviranje i drugih sigurnosnih uređaja ukoliko isti na vozilu postoje;`,
              `da vozilo neće koristiti za prijevoz robe, tereta ili putnika; za vuču ili prijevoz drugih vozila ili prikolica; za prijevoz materijala, predmeta ili stvari koje mogu oštetiti ili zagaditi vozilo, primjerice životinja, lako zapaljivih materijala, natprosječno prljavih stvari ili stvari neugodnog mirisa; za utrke, moto-sportska ili druga slična natjecanja; te za obuku vozača.`,
              `da će koristiti vozilo kao dobar domaćin / gospodarstvenik sukladno odredbama ZOO-a F BiH.`,
            ],
          },
        ],
      },
      {
        n: 5,
        topic: "Troškovi i gorivo",
        blocks: [
          {
            type: "p",
            text: `Troškove goriva utrošenog tijekom najma snosi Najmoprimatelj.`,
          },
          {
            type: "p",
            text: `Troškovi koje se obvezuje podmiriti Najmoprimatelj bez obzira terete li oni Najmodavatelja kao vlasnika vozila, Najmoprimatelja ili vozača vozila (osim ako navedeni troškovi nisu uzrokovani isključivom krivnjom Najmodavatelja), a nastali su:`,
          },
          {
            type: "ul",
            items: [
              `u svezi transporta vozila;`,
              `garažiranja, parkiranja, cestarina, mostarina i slično;`,
              `svih kazni radi kršenja prometnih ili drugih propisa;`,
              `sudskih, prekršajnih ili drugih postupaka;`,
              `zateznih kamata na navedena dugovanja;`,
              `nastali ili uzrokovani za vrijeme trajanja najma vozila, bez obzira kada su utvrđeni ili dospjeli.`,
            ],
          },
          {
            type: "p",
            text: `Najmodavatelj nadoknađuje Najmoprimatelju neophodne troškove za ulje, mazivo, obvezno periodično servisiranje i druge lake popravke, a koji su nastali za vrijeme trajanja najma. Najmoprimatelj je pritom Najmodavatelju dužan predati valjani račun koji je izdala pravna osoba koja je izvršila uslugu. U slučaju da se utvrdi kako je Najmoprimatelj izvršio nepotrebnu zamjenu ili servis nekog sklopa, dijela ili uređaja na vozilu, Najmodavatelj pridržava pravo da Najmoprimatelju odbije naknadu takvog troška. Troškovi pranja vozila se ne nadoknađuju.`,
          },
        ],
      },
      {
        n: 6,
        topic: "Oštećenja i naknada štete",
        blocks: [
          {
            type: "p",
            text: `U slučaju manjka ili oštećenja vozila, opreme ili pribora, bez obzira na to kako su nastali, Najmoprimatelj će isplatiti Najmodavatelju njihovu punu novčanu protuvrijednost po tržišnim cijenama za nove iste dijelove, a važećim na dan ugovorenog vraćanja vozila.`,
          },
          {
            type: "p",
            text: `Ako u slučaju nepažnje najmoprimatelja vozila ili vozača dođe do oštećenja motora ili pogonskog mehanizma vozila (primjerice radi nedostatka ulja ili sredstva za hlađenje), u slučajevima oštećenja kartera, spojke, donjeg postroja vozila ili drugih kvarova izazvanih nemarnošću Najmoprimatelja ili vozača (primjerice nepažljiva vožnja ili vožnja izvan putova), Najmoprimatelj vozila nadoknađuje Najmodavatelju cjelokupni iznos troškova popravka vozila te dodatno iznos izgubljenog dnevnog najma vozila prema važećem cjeniku za vrijeme trajanja popravka vozila, ali ne više od 30 dana te svu nastalu štetu kao što su primjerice troškovi vuče vozila ili umanjene vrijednosti vozila. Ako je iz bilo kojeg razloga potrebno posebno čišćenje vozila, Najmodavatelj će pokriti trošak bilo kakvog potrebnog čišćenja. Najmodavatelj zadržava pravo zaračunavanja usluge punjenja goriva.`,
          },
        ],
      },
      {
        n: 7,
        topic: "Osiguranje",
        blocks: [
          {
            type: "p",
            text: `Sva vozila su osigurana protiv odgovornosti za štetu prouzročenu trećoj osobi.`,
          },
          {
            type: "p",
            text: `Franšiza ovisi o grupi vozila i određena je važećom tarifom Najmodavatelja i navedena je u Ugovoru.`,
          },
          {
            type: "p",
            text: `CDW, dnevno kasko osiguranje: njime Najmoprimatelj umanjuje svoju odgovornost za štetu na iznos franšize koja ovisi o grupi vozila te ukoliko je iznos štete manji od franšize, naplaćuje mu se taj manji iznos.`,
          },
          {
            type: "p",
            text: `TP, osiguranje od krađe: korisnik ograničava svoju odgovornost za tu vrstu štete do iznosa učešća u šteti (franšize).`,
          },
          {
            type: "p",
            text: `CDW+ je pokriće za otkup dijela odgovornosti od učešća u šteti nastaloj na karoseriji vozila, na umanjen iznos.`,
          },
          {
            type: "p",
            text: `SCDW je pokriće s kojim se u potpunost otkupljuje financijska odgovornost učešća u šteti nastaloj na karoseriji vozila.`,
          },
          { type: "p", text: `Osiguranje ni u kojem slučaju ne pokriva:` },
          {
            type: "ol",
            items: [
              `štetu na gumama, felgama i naplatcima;`,
              `štetu na donjem postroju vozila, unutrašnjosti vozila, vjetrobranskom i ostalim staklima vozila;`,
              `spaljeno kvačilo vozila;`,
              `štetu na motoru uzrokovanu nedostatkom ulja, ulijevanjem krive vrste goriva ili nemarnim korištenjem;`,
              `šteta nastala gubitkom dokumenata, ključeva vozila ili registarskih pločica;`,
              `štetu koju je napravio vozač pod utjecajem alkohola, droge ili drugih opojnih sredstava;`,
              `štetu koju je napravio neovlašteni vozač;`,
              `štetu koja je napravljena u inozemstvu, a prelazak granice nije bio odobren od strane Najmodavatelja;`,
              `bilo koje oštećenje na vozilu koje nije prijavljeno nadležnoj policijskoj postaji / Najmodavatelju;`,
            ],
          },
          {
            type: "p",
            text: `U slučaju bilo koje od gore navedenih štetnih događaja, Najmoprimatelj odgovara za puni iznos štete.`,
          },
          {
            type: "p",
            text: `Najmodavatelj se ne smatra odgovornim za štetu ili gubitak imovine Najmoprimatelja.`,
          },
        ],
      },
      {
        n: 8,
        topic: "Nezgode, krađa i šteta",
        blocks: [
          {
            type: "p",
            text: `U slučaju prometne nesreće, oštećenja, havarije, utaje, krađe, pogonske neispravnosti vozila i drugih sličnih okolnosti Najmoprimatelj je dužan:`,
          },
          {
            type: "ul",
            items: [
              `čuvati vozilo do njegovog preuzimanja od strane Najmodavatelja;`,
              `zabilježiti imena i adrese sudionika i svjedoka;`,
              `pozvati nadležnu policijsku upravu i osigurati njihov zapisnik, osim u slučaju pogonske neispravnosti;`,
              `bez odlaganja dati izjavu o događaju u najbližoj poslovnici Najmodavatelja.`,
            ],
          },
          {
            type: "p",
            text: `U slučaju da Najmoprimatelj ne osigura policijski zapisnik, sav trošak naknade štete u svezi s oštećenjem ili nestankom vozila pada na teret Najmoprimatelja u punom iznosu bez obzira na Najmoprimatelju krivicu za takav događaj. Najmoprimatelj prima na znanje da u slučaju nemarnog odnosa prema vozilu, dokumentima ili ključevima vozila kao i drugim slučajevima predviđenim pravilima osiguranja ili zakonom, može biti terećen regresnim zahtjevom osiguravatelja vozila.`,
          },
          {
            type: "p",
            text: `Osiguranjem nisu pokrivene štete koje su prouzročene namjerno, pod utjecajem alkohola ili droge, bez propisane vozačke dozvole ili u slučaju da je dozvola vozaču oduzeta, u slučajevima da se u vozilu nalazi veći broj osoba od broja registriranih sjedišta, štete izazvane ratnim djelovanjima ili pobunama, kao i u drugim okolnostima predviđenim pravilima osiguravajućeg društva ili zakonskim propisom.`,
          },
          {
            type: "p",
            text: `Osiguranjem nisu pokriveni rizici uništenja ili oštećenja automobilskih guma, naplataka ili poklopaca naplataka ili uništenje odnosno oštećenje donjeg postroja vozila.`,
          },
        ],
      },
      {
        n: 9,
        topic: "Šteta i krađa vozila",
        blocks: [
          {
            type: "p",
            text: `U slučaju štete na vozilu, Najmoprimatelj će na traženje Najmodavatelja platiti puni iznos popravka oštećenog vozila i druge gubitke koje Najmodavatelj ima zbog oštećenja vozila uključujući i izgubljenu dobit u visini dnevnog najma zbog nekorištenja vozila za vrijeme trajanja popravka prema važećem cjeniku, ali najviše do 30 dana.`,
          },
          {
            type: "p",
            text: `U slučaju krađe vozila ili drugih okolnosti radi kojih Najmoprimatelj nije u mogućnosti po završetku najma vratiti vozilo Najmodavatelju, Najmoprimatelj će na traženje Najmodavatelja platiti punu vrijednost vozila i to nabavnu vrijednost novog vozila, a prema ponudi Najmodavateljevog dobavljača kao i druge gubitke koje Najmodavatelj ima zbog nedostatka vozila uključujući i izgubljenu dobit u visini dnevnog najma zbog nekorištenja vozila prema važećem cjeniku, ali najviše do 30 dana.`,
          },
          {
            type: "p",
            text: `U slučaju štete prema trećim osobama Najmoprimatelj će snositi sve troškove koje bi Najmodavatelj mogao imati po toj osnovi.`,
          },
        ],
      },
      {
        n: 10,
        topic: "Odgovornost Najmodavatelja",
        blocks: [
          {
            type: "p",
            text: `Najmodavatelj ne odgovara za štete koje bi Najmoprimatelju mogle nastati uslijed zakašnjenja prilikom isporuke vozila kao ni za štete koje bi mogle nastati zbog bilo kakvog kvara na vozilu za vrijeme trajanja najma.`,
          },
          {
            type: "p",
            text: `Najmodavatelj ne odgovara za štete koje bi nastale na osobama ili stvarima koje se prevoze u vozilu.`,
          },
        ],
      },
      {
        n: 11,
        topic: "Prijenos prava i preinake",
        blocks: [
          {
            type: "p",
            text: `Najmoprimatelj ne smije prenijeti prava ili obaveze po ovom Ugovoru na treće osobe, a niti smije otuđiti vozilo, dijelove ili opremu vozila ili vršiti bilo kakve preinake na vozilu.`,
          },
        ],
      },
      {
        n: 12,
        topic: "Mjerodavno pravo",
        blocks: [
          {
            type: "p",
            text: `Na sva prava i obveze koja nisu regulirani ovim uvjetima primjenjivat će se odredbe Zakona o obveznim odnosima prema sjedištu Najmodavatelja.`,
          },
        ],
      },
      {
        n: 13,
        topic: "Nadležnost suda",
        blocks: [
          {
            type: "p",
            text: `U slučaju spora po ovom Ugovoru, stranke ugovaraju mjesnu nadležnost stvarno nadležnog suda u Širokom Brijegu.`,
          },
        ],
      },
    ],
  },

  en: {
    heading: "Rental terms",
    intro:
      "General vehicle rental terms of Maximum Rent a Car. Please read all articles carefully before collecting the vehicle.",
    articleLabel: "Article",
    indexLabel: "Contents",
    articles: [
      {
        n: 1,
        topic: "Definitions",
        blocks: [
          {
            type: "ul",
            items: [
              `"Lessor": the company MAXIMUM RENT A CAR d.o.o., with its registered seat at Potpolje bb, 88260 Čitluk, Bosnia and Herzegovina, company registration number: 4227631720004.`,
              `"Lessee": the natural or legal person in whose name the vehicle is rented. In the Vehicle Rental Agreement they are designated as the "Lessee" and are responsible for complying with all points of these General Rental Terms and of the Rental Agreement.`,
              `"Agreement": the individual rental agreement signed upon collection of the vehicle, which authorises the use of the vehicle and defines the collection and return of the vehicle, the coverage, the equipment and services included in the rental price, and the method of payment. The Agreement also contains information on the odometer reading, the amount of fuel, damage and any defects on the rented vehicle, as well as other rights and obligations which both contracting parties fully accept by their signature.`,
              `The condition of the vehicle at the time of handover and the General Rental Terms are considered part of the Vehicle Rental Agreement.`,
              `"Driver / additional driver": the natural person named in the Rental Agreement as the "User", who signs the Rental Agreement and collects the vehicle, responsible for complying with all provisions of the Rental Agreement.`,
              `"User": the Lessee, the driver and the additional driver are, in the remainder of these General Rental Terms, referred to by the single term "User".`,
              `"Vehicle" is the object of the rental under the Agreement, whose details are stated in the Agreement.`,
            ],
          },
        ],
      },
      {
        n: 2,
        topic: "Vehicle handover",
        blocks: [
          {
            type: "p",
            text: `By signing this Agreement, the Lessee confirms that they have collected the vehicle in proper and undamaged condition and with a full fuel tank, unless expressly stated otherwise in writing in the Agreement. The Lessee confirms that, together with the vehicle, they have received the vehicle document, the vehicle keys, all mandatory equipment and vehicle accessories, as well as the additional equipment and accessories listed in the Agreement.`,
          },
          {
            type: "p",
            text: `By signing the Agreement, the Lessee warrants to the Lessor that they meet the general minimum-age requirements for operating a motor vehicle and that they hold the documents required to operate a motor vehicle in accordance with the applicable regulations of Bosnia and Herzegovina, which they are obliged to present to the Lessor in the original, while a copy thereof remains in the Lessor's possession as an annex to the Agreement.`,
          },
        ],
      },
      {
        n: 3,
        topic: "Return obligations",
        blocks: [
          { type: "p", text: `The Lessee undertakes:` },
          {
            type: "ul",
            items: [
              `to return the vehicle to the place of collection, no later than within the period set out in this Agreement;`,
              `to return the vehicle even before the agreed term, at the Lessor's request;`,
              `to return the vehicle in proper and undamaged condition, with all documentation, keys, tyres, tools, mandatory, standard and additional equipment, and a full fuel tank, just as it was collected;`,
              `to pay any monetary obligations under this Agreement immediately upon collection of the vehicle, where they are not paid in the form of an advance payment or deposit;`,
              `that the Lessor may charge to their credit card, or by another method of payment, all costs of repair, faults or loss discovered after the vehicle has been returned, where the Lessee did not report them to the Lessor in accordance with the vehicle return procedure;`,
              `to acknowledge that the Lessor is authorised to charge their credit card for any costs the Lessor incurs under the Agreement;`,
              `to request from the Lessor, in good time, any extension of the rental period as well as any other changes regarding the rental;`,
              `in the event that the Lessee exceeds the agreed vehicle return deadline without the Lessor's consent, the Lessor has the right to consider the vehicle stolen and to report it to the police. In that case, the Lessee bears all resulting damage;`,
              `in the event of exceeding the vehicle return deadline, the Lessee accepts all obligations and liabilities under this Agreement that are otherwise agreed for the duration of the rental.`,
            ],
          },
          {
            type: "p",
            text: `All employees of MAXIMUM RENT A CAR d.o.o. have the right to inspect any vehicle at any time. If it is established that the Lessee has breached any of the terms of this Agreement, the employees are authorised to seize the vehicle.`,
          },
          {
            type: "p",
            text: `The Lessor unconditionally reserves the right to terminate the Vehicle Rental Agreement, at any time and in any place and before the expiry of the Vehicle Rental Agreement, without any obligation to compensate the Lessee for damage.`,
          },
        ],
      },
      {
        n: 4,
        topic: "Lessee's obligations",
        blocks: [
          { type: "p", text: `Obligations of the Lessee:` },
          {
            type: "ul",
            items: [
              `to collect and use the rented vehicle in accordance with the Road Traffic Safety Act of BiH, or any other law regulating road traffic in the territory of other states, and other applicable regulations;`,
              `to stop driving immediately if a fault occurs on the vehicle's odometer, and to notify the Lessor thereof without delay;`,
              `to use the vehicle only for their own needs;`,
              `that the vehicle will be operated only by the Lessee or a person named in the Agreement as a driver alongside the Lessee, that is, named in the Agreement as an additional driver, provided that such persons hold the necessary licences and documents to operate the vehicle;`,
              `not to drive the vehicle outside the borders of Bosnia and Herzegovina, unless specified in the Agreement, and not to drive the vehicle into countries where entry is not permitted;`,
              `not to use the vehicle for unlawful purposes, for example to commit criminal offences, customs, foreign-currency or other violations, or other unlawful acts;`,
              `not to overload the vehicle with cargo or passengers;`,
              `not to operate the vehicle under the influence of alcohol or narcotics;`,
              `to take care of the technical soundness of the vehicle and its mandatory periodic servicing;`,
              `to regularly check and, if necessary, top up the coolant, the oil and the tyre pressure;`,
              `when not using the vehicle, to always lock it and remove the keys and vehicle documentation, while also activating any other security devices if such exist on the vehicle;`,
              `not to use the vehicle to transport goods, cargo or passengers; to tow or transport other vehicles or trailers; to transport materials, objects or items that may damage or contaminate the vehicle, for example animals, highly flammable materials, excessively dirty items or items with an unpleasant odour; for races, motorsport or other similar competitions; or for driver training.`,
              `to use the vehicle as a good steward / prudent businessperson in accordance with the provisions of the Obligations Act of the Federation of BiH.`,
            ],
          },
        ],
      },
      {
        n: 5,
        topic: "Costs and fuel",
        blocks: [
          {
            type: "p",
            text: `The cost of fuel used during the rental is borne by the Lessee.`,
          },
          {
            type: "p",
            text: `Costs which the Lessee undertakes to settle, regardless of whether they are charged to the Lessor as the owner of the vehicle, to the Lessee or to the driver of the vehicle (unless such costs are caused by the exclusive fault of the Lessor), and which arise from:`,
          },
          {
            type: "ul",
            items: [
              `matters connected with the transport of the vehicle;`,
              `garaging, parking, road tolls, bridge tolls and the like;`,
              `all fines for breaches of traffic or other regulations;`,
              `court, misdemeanour or other proceedings;`,
              `default interest on the said debts;`,
              `costs arising or caused during the term of the vehicle rental, regardless of when they are determined or fall due.`,
            ],
          },
          {
            type: "p",
            text: `The Lessor reimburses the Lessee for the necessary costs of oil, lubricant, mandatory periodic servicing and other minor repairs incurred during the rental period. In doing so, the Lessee is obliged to submit to the Lessor a valid invoice issued by the legal entity that performed the service. If it is established that the Lessee carried out an unnecessary replacement or service of an assembly, part or device on the vehicle, the Lessor reserves the right to refuse to reimburse the Lessee for such cost. Vehicle washing costs are not reimbursed.`,
          },
        ],
      },
      {
        n: 6,
        topic: "Damage and compensation",
        blocks: [
          {
            type: "p",
            text: `In the event of a shortage of, or damage to, the vehicle, equipment or accessories, regardless of how it occurred, the Lessee shall pay the Lessor their full monetary value at market prices for new identical parts, applicable on the agreed date of the vehicle's return.`,
          },
          {
            type: "p",
            text: `If, due to negligence of the vehicle's Lessee or driver, damage occurs to the engine or drivetrain of the vehicle (for example due to a lack of oil or coolant), in cases of damage to the oil pan, the clutch, the undercarriage of the vehicle or other faults caused by the negligence of the Lessee or driver (for example careless driving or driving off-road), the vehicle's Lessee shall reimburse the Lessor for the entire amount of the vehicle repair costs and, additionally, the amount of lost daily rental of the vehicle according to the applicable price list for the duration of the vehicle repair, but no more than 30 days, as well as all resulting damage such as, for example, vehicle towing costs or the diminished value of the vehicle. If, for any reason, special cleaning of the vehicle is required, the Lessor shall cover the cost of any necessary cleaning. The Lessor reserves the right to charge for the fuel-refilling service.`,
          },
        ],
      },
      {
        n: 7,
        topic: "Insurance",
        blocks: [
          {
            type: "p",
            text: `All vehicles are insured against liability for damage caused to a third party.`,
          },
          {
            type: "p",
            text: `The deductible depends on the vehicle group and is determined by the Lessor's applicable tariff and stated in the Agreement.`,
          },
          {
            type: "p",
            text: `CDW, daily collision (casco) insurance, by which the Lessee reduces their liability for damage to the amount of the deductible, which depends on the vehicle group; if the amount of the damage is less than the deductible, the lower amount is charged to them.`,
          },
          {
            type: "p",
            text: `TP, theft protection: the user limits their liability for that type of damage up to the amount of their share in the damage (the deductible).`,
          },
          {
            type: "p",
            text: `CDW+ is coverage for buying out part of the liability for the share in damage occurring on the vehicle's bodywork, for a reduced amount.`,
          },
          {
            type: "p",
            text: `SCDW is coverage by which the financial liability for the share in damage occurring on the vehicle's bodywork is fully bought out.`,
          },
          { type: "p", text: `The insurance does not, under any circumstances, cover:` },
          {
            type: "ol",
            items: [
              `damage to tyres, rims and wheel rims;`,
              `damage to the vehicle's undercarriage, the vehicle interior, the windscreen and other vehicle glass;`,
              `a burnt-out vehicle clutch;`,
              `damage to the engine caused by a lack of oil, by filling with the wrong type of fuel, or by negligent use;`,
              `damage arising from the loss of documents, vehicle keys or registration plates;`,
              `damage caused by a driver under the influence of alcohol, drugs or other intoxicants;`,
              `damage caused by an unauthorised driver;`,
              `damage caused abroad where the border crossing was not approved by the Lessor;`,
              `any damage to the vehicle that has not been reported to the competent police station / the Lessor;`,
            ],
          },
          {
            type: "p",
            text: `In the event of any of the above damaging events, the Lessee is liable for the full amount of the damage.`,
          },
          {
            type: "p",
            text: `The Lessor is not considered liable for damage to, or loss of, the Lessee's property.`,
          },
        ],
      },
      {
        n: 8,
        topic: "Accidents, theft and damage",
        blocks: [
          {
            type: "p",
            text: `In the event of a traffic accident, damage, breakdown, embezzlement, theft, mechanical failure of the vehicle and other similar circumstances, the Lessee is obliged to:`,
          },
          {
            type: "ul",
            items: [
              `safeguard the vehicle until it is taken over by the Lessor;`,
              `record the names and addresses of the participants and witnesses;`,
              `call the competent police authority and secure their report, except in the case of mechanical failure;`,
              `without delay, give a statement about the event at the nearest branch of the Lessor.`,
            ],
          },
          {
            type: "p",
            text: `If the Lessee does not secure a police report, the entire cost of compensation for damage in connection with damage to or loss of the vehicle falls on the Lessee in full, regardless of the Lessee's fault for such event. The Lessee acknowledges that, in the event of negligent treatment of the vehicle, the documents or the vehicle keys, as well as in other cases provided for by the insurance rules or by law, they may be charged by a recourse claim of the vehicle insurer.`,
          },
          {
            type: "p",
            text: `The insurance does not cover damage caused intentionally, under the influence of alcohol or drugs, without the prescribed driving licence, or in the event that the driver's licence has been revoked, in cases where the vehicle carries more persons than the number of registered seats, damage caused by acts of war or rebellion, as well as in other circumstances provided for by the rules of the insurance company or by legal regulation.`,
          },
          {
            type: "p",
            text: `The insurance does not cover the risks of destruction or damage of vehicle tyres, wheel rims or rim caps, or the destruction or damage of the vehicle's undercarriage.`,
          },
        ],
      },
      {
        n: 9,
        topic: "Vehicle damage and theft",
        blocks: [
          {
            type: "p",
            text: `In the event of damage to the vehicle, the Lessee shall, at the Lessor's request, pay the full amount of the repair of the damaged vehicle and other losses the Lessor incurs due to the damage to the vehicle, including lost profit in the amount of the daily rental due to non-use of the vehicle during the repair period according to the applicable price list, but no more than 30 days.`,
          },
          {
            type: "p",
            text: `In the event of theft of the vehicle or other circumstances due to which the Lessee is unable to return the vehicle to the Lessor at the end of the rental, the Lessee shall, at the Lessor's request, pay the full value of the vehicle, namely the purchase value of a new vehicle, according to the offer of the Lessor's supplier, as well as other losses the Lessor incurs due to the lack of the vehicle, including lost profit in the amount of the daily rental due to non-use of the vehicle according to the applicable price list, but no more than 30 days.`,
          },
          {
            type: "p",
            text: `In the event of damage to third parties, the Lessee shall bear all costs the Lessor might incur on that basis.`,
          },
        ],
      },
      {
        n: 10,
        topic: "Lessor's liability",
        blocks: [
          {
            type: "p",
            text: `The Lessor is not liable for damage that the Lessee might incur as a result of a delay in the delivery of the vehicle, nor for damage that might arise due to any fault of the vehicle during the term of the rental.`,
          },
          {
            type: "p",
            text: `The Lessor is not liable for damage that might arise to persons or items transported in the vehicle.`,
          },
        ],
      },
      {
        n: 11,
        topic: "Transfer of rights and modifications",
        blocks: [
          {
            type: "p",
            text: `The Lessee may not transfer the rights or obligations under this Agreement to third parties, nor may they alienate the vehicle, its parts or equipment, or carry out any modifications to the vehicle.`,
          },
        ],
      },
      {
        n: 12,
        topic: "Governing law",
        blocks: [
          {
            type: "p",
            text: `All rights and obligations not regulated by these terms shall be governed by the provisions of the Act on Obligations applicable at the seat of the Lessor.`,
          },
        ],
      },
      {
        n: 13,
        topic: "Jurisdiction",
        blocks: [
          {
            type: "p",
            text: `In the event of a dispute under this Agreement, the parties agree to the local jurisdiction of the materially competent court in Široki Brijeg.`,
          },
        ],
      },
    ],
  },
  de: {
    heading: "Mietbedingungen",
    intro: "Allgemeine Mietbedingungen von Maximum Rent a Car. Bitte lesen Sie alle Artikel sorgfältig, bevor Sie das Fahrzeug abholen.",
    articleLabel: "Artikel",
    indexLabel: "Inhalt",
    articles: [
      {
        n: 1,
        topic: "Begriffe",
        blocks: [
          {
            type: "ul",
            items: [
              `„Vermieter": die Firma MAXIMUM RENT A CAR d.o.o. mit Sitz in Potpolje bb, 88260 Čitluk, Bosnien und Herzegowina, Registernummer: 4227631720004.`,
              `„Mieter": die natürliche oder juristische Person, in deren Namen das Fahrzeug gemietet wird. Sie ist im Mietvertrag als „Mieter" angegeben und für die Einhaltung aller Punkte dieser Allgemeinen Mietbedingungen und des Mietvertrags verantwortlich.`,
              `„Vertrag": der einzelne Mietvertrag, der bei der Abholung des Fahrzeugs unterzeichnet wird. Er erlaubt die Nutzung des Fahrzeugs und regelt Abholung und Rückgabe, Versicherungsschutz, die im Mietpreis enthaltene Ausstattung und Leistungen sowie die Zahlungsweise. Der Vertrag enthält außerdem Angaben zum Kilometerstand, zur Kraftstoffmenge, zu Schäden und etwaigen Mängeln am Mietfahrzeug sowie weitere Rechte und Pflichten, die beide Vertragsparteien mit ihrer Unterschrift vollständig anerkennen.`,
              `Der Zustand des Fahrzeugs bei der Übergabe und die Allgemeinen Mietbedingungen gelten als Bestandteil des Mietvertrags.`,
              `„Fahrer oder Zusatzfahrer": die im Mietvertrag als „Nutzer" genannte natürliche Person, die den Mietvertrag unterzeichnet und das Fahrzeug übernimmt und für die Einhaltung aller Bestimmungen des Mietvertrags verantwortlich ist.`,
              `„Nutzer": Mieter, Fahrer und Zusatzfahrer werden im weiteren Text dieser Allgemeinen Mietbedingungen einheitlich als „Nutzer" bezeichnet.`,
              `„Fahrzeug" ist der Gegenstand der Miete nach dem Vertrag, dessen Daten im Vertrag angegeben sind.`,
            ],
          },
        ],
      },
      {
        n: 2,
        topic: "Fahrzeugübergabe",
        blocks: [
          { type: "p", text: `Mit der Unterzeichnung dieses Vertrags bestätigt der Mieter, dass er das Fahrzeug in ordnungsgemäßem und unbeschädigtem Zustand und vollgetankt übernommen hat, sofern im Vertrag nicht ausdrücklich schriftlich etwas anderes vermerkt ist. Der Mieter bestätigt, dass er mit dem Fahrzeug die Fahrzeugpapiere, die Schlüssel, die gesamte Pflichtausstattung und das Fahrzeugzubehör sowie die im Vertrag aufgeführte Zusatzausstattung erhalten hat.` },
          { type: "p", text: `Mit der Unterzeichnung des Vertrags sichert der Mieter dem Vermieter zu, dass er das gesetzliche Mindestalter für das Führen eines Kraftfahrzeugs erreicht hat und die nach den geltenden Vorschriften von Bosnien und Herzegowina erforderlichen Dokumente besitzt. Diese muss er dem Vermieter im Original vorlegen, eine Kopie verbleibt als Anlage zum Vertrag beim Vermieter.` },
        ],
      },
      {
        n: 3,
        topic: "Pflichten bei der Rückgabe",
        blocks: [
          { type: "p", text: `Der Mieter verpflichtet sich:` },
          {
            type: "ul",
            items: [
              `das Fahrzeug am Ort der Abholung zurückzugeben, spätestens innerhalb der in diesem Vertrag festgelegten Frist;`,
              `das Fahrzeug auf Verlangen des Vermieters auch vor Ablauf der vereinbarten Frist zurückzugeben;`,
              `das Fahrzeug in ordnungsgemäßem und unbeschädigtem Zustand zurückzugeben, mit allen Papieren, Schlüsseln, Reifen, Werkzeugen, der Pflicht-, Standard- und Zusatzausstattung und vollem Tank, so wie er es übernommen hat;`,
              `Geldforderungen aus diesem Vertrag sofort bei der Übernahme des Fahrzeugs zu begleichen, soweit sie nicht als Anzahlung oder Kaution geleistet wurden;`,
              `dass der Vermieter alle nach der Rückgabe festgestellten Reparaturkosten, Mängel oder Verluste, die der Mieter nicht gemäß dem Rückgabeverfahren gemeldet hat, von seiner Kreditkarte oder auf andere Weise abbuchen darf;`,
              `anzuerkennen, dass der Vermieter berechtigt ist, alle ihm aus dem Vertrag entstehenden Kosten von seiner Kreditkarte abzubuchen;`,
              `eine Verlängerung der Mietdauer sowie alle sonstigen Änderungen rechtzeitig beim Vermieter zu beantragen;`,
              `überschreitet der Mieter ohne Zustimmung des Vermieters die vereinbarte Rückgabefrist, darf der Vermieter das Fahrzeug als gestohlen betrachten und bei der Polizei anzeigen. In diesem Fall trägt der Mieter den gesamten daraus entstehenden Schaden;`,
              `bei Überschreitung der Rückgabefrist übernimmt der Mieter alle Pflichten und Haftungen aus diesem Vertrag, die ansonsten für die Mietdauer vereinbart sind.`,
            ],
          },
          { type: "p", text: `Alle Mitarbeiter der MAXIMUM RENT A CAR d.o.o. dürfen jedes Fahrzeug jederzeit überprüfen. Wird festgestellt, dass der Mieter gegen Bedingungen dieses Vertrags verstoßen hat, sind die Mitarbeiter berechtigt, das Fahrzeug einzuziehen.` },
          { type: "p", text: `Der Vermieter behält sich ausdrücklich das Recht vor, den Mietvertrag jederzeit, an jedem Ort und vor Ablauf des Mietvertrags zu beenden, ohne zum Ersatz eines Schadens des Mieters verpflichtet zu sein.` },
        ],
      },
      {
        n: 4,
        topic: "Pflichten des Mieters",
        blocks: [
          { type: "p", text: `Pflichten des Mieters:` },
          {
            type: "ul",
            items: [
              `das Mietfahrzeug gemäß dem Gesetz über die Grundlagen der Straßenverkehrssicherheit in BiH bzw. den im Ausland geltenden Verkehrsgesetzen und sonstigen geltenden Vorschriften zu übernehmen und zu nutzen;`,
              `bei einem Defekt des Kilometerzählers die Fahrt sofort zu beenden und den Vermieter unverzüglich zu informieren;`,
              `das Fahrzeug nur für eigene Zwecke zu nutzen;`,
              `dass das Fahrzeug nur vom Mieter oder von einer im Vertrag als Fahrer oder Zusatzfahrer genannten Person geführt wird, sofern diese die erforderlichen Berechtigungen und Dokumente besitzt;`,
              `mit dem Fahrzeug Bosnien und Herzegowina nicht zu verlassen, sofern dies nicht im Vertrag vorgesehen ist, und nicht in Länder zu fahren, in die die Einreise nicht erlaubt ist;`,
              `das Fahrzeug nicht für unerlaubte Zwecke zu nutzen, etwa für Straftaten, Zoll- oder Devisenvergehen oder sonstige unerlaubte Handlungen;`,
              `das Fahrzeug nicht mit Ladung oder Personen zu überladen;`,
              `das Fahrzeug nicht unter Einfluss von Alkohol oder Betäubungsmitteln zu führen;`,
              `auf den technisch einwandfreien Zustand des Fahrzeugs und die vorgeschriebenen regelmäßigen Wartungen zu achten;`,
              `Kühlflüssigkeit, Öl und Reifendruck regelmäßig zu prüfen und bei Bedarf nachzufüllen;`,
              `das Fahrzeug bei Nichtbenutzung stets abzuschließen, Schlüssel und Papiere mitzunehmen und vorhandene Sicherungseinrichtungen zu aktivieren;`,
              `das Fahrzeug nicht zu nutzen für die gewerbliche Beförderung von Waren, Ladung oder Personen, zum Abschleppen oder Transportieren anderer Fahrzeuge oder Anhänger, für den Transport von Stoffen oder Gegenständen, die das Fahrzeug beschädigen oder verschmutzen können (z. B. Tiere, leicht entzündliche Stoffe, stark verschmutzte oder übel riechende Gegenstände), für Rennen, Motorsport oder ähnliche Wettbewerbe sowie für Fahrschulzwecke.`,
              `das Fahrzeug mit der Sorgfalt eines ordentlichen Kaufmanns gemäß dem Obligationengesetz der Föderation BiH zu nutzen.`,
            ],
          },
        ],
      },
      {
        n: 5,
        topic: "Kosten und Kraftstoff",
        blocks: [
          { type: "p", text: `Die Kosten für den während der Miete verbrauchten Kraftstoff trägt der Mieter.` },
          { type: "p", text: `Kosten, die der Mieter zu begleichen hat, unabhängig davon, ob sie dem Vermieter als Halter, dem Mieter oder dem Fahrer in Rechnung gestellt werden (sofern sie nicht ausschließlich vom Vermieter verschuldet sind), und die entstehen aus:` },
          {
            type: "ul",
            items: [
              `dem Transport des Fahrzeugs;`,
              `Garagen, Parken, Straßen- und Brückenmaut und Ähnlichem;`,
              `allen Bußgeldern wegen Verstößen gegen Verkehrs- oder sonstige Vorschriften;`,
              `Gerichts-, Ordnungswidrigkeiten- oder sonstigen Verfahren;`,
              `Verzugszinsen auf die genannten Forderungen;`,
              `Kosten, die während der Mietdauer entstehen oder verursacht werden, unabhängig davon, wann sie festgestellt oder fällig werden.`,
            ],
          },
          { type: "p", text: `Der Vermieter erstattet dem Mieter notwendige Kosten für Öl, Schmierstoffe, vorgeschriebene regelmäßige Wartungen und andere kleinere Reparaturen während der Mietdauer. Dazu muss der Mieter eine gültige Rechnung des ausführenden Betriebs vorlegen. Stellt sich heraus, dass der Mieter unnötig ein Bauteil oder Gerät ersetzt oder gewartet hat, kann der Vermieter die Erstattung dieser Kosten verweigern. Kosten für die Fahrzeugwäsche werden nicht erstattet.` },
        ],
      },
      {
        n: 6,
        topic: "Schäden und Schadenersatz",
        blocks: [
          { type: "p", text: `Bei Fehlen oder Beschädigung von Fahrzeug, Ausstattung oder Zubehör, gleich wie es dazu kam, zahlt der Mieter dem Vermieter den vollen Wert zu Marktpreisen für neue, identische Teile, gültig am vereinbarten Rückgabetag.` },
          { type: "p", text: `Entsteht durch Fahrlässigkeit des Mieters oder Fahrers ein Schaden an Motor oder Antrieb (z. B. durch Öl- oder Kühlmittelmangel), an der Ölwanne, der Kupplung, dem Unterboden oder ein anderer Defekt durch Fahrlässigkeit (z. B. unvorsichtiges Fahren oder Fahren abseits befestigter Straßen), erstattet der Mieter dem Vermieter die gesamten Reparaturkosten und zusätzlich die entgangene Tagesmiete nach geltender Preisliste für die Dauer der Reparatur, höchstens jedoch 30 Tage, sowie alle Folgeschäden wie Abschleppkosten oder Wertminderung. Ist aus irgendeinem Grund eine Sonderreinigung nötig, trägt der Vermieter die Kosten der erforderlichen Reinigung. Der Vermieter behält sich vor, das Nachtanken in Rechnung zu stellen.` },
        ],
      },
      {
        n: 7,
        topic: "Versicherung",
        blocks: [
          { type: "p", text: `Alle Fahrzeuge sind gegen die Haftung für Schäden gegenüber Dritten versichert.` },
          { type: "p", text: `Die Selbstbeteiligung hängt von der Fahrzeuggruppe ab, richtet sich nach dem geltenden Tarif des Vermieters und ist im Vertrag angegeben.` },
          { type: "p", text: `CDW: tägliche Kaskoversicherung, mit der der Mieter seine Haftung für Schäden auf die Höhe der Selbstbeteiligung begrenzt, die von der Fahrzeuggruppe abhängt. Ist der Schaden geringer als die Selbstbeteiligung, wird der niedrigere Betrag berechnet.` },
          { type: "p", text: `TP: Diebstahlschutz, mit dem der Nutzer seine Haftung für diese Schadenart auf die Höhe seiner Selbstbeteiligung begrenzt.` },
          { type: "p", text: `CDW+: Abdeckung, mit der ein Teil der Haftung für Schäden an der Karosserie zu einem reduzierten Betrag abgelöst wird.` },
          { type: "p", text: `SCDW: Abdeckung, mit der die finanzielle Haftung für Schäden an der Karosserie vollständig abgelöst wird.` },
          { type: "p", text: `Die Versicherung deckt in keinem Fall:` },
          {
            type: "ol",
            items: [
              `Schäden an Reifen, Felgen und Radkappen;`,
              `Schäden am Unterboden, im Innenraum, an der Windschutzscheibe und an anderen Scheiben;`,
              `eine verbrannte Kupplung;`,
              `Motorschäden durch Ölmangel, falschen Kraftstoff oder fahrlässige Nutzung;`,
              `Schäden durch Verlust von Papieren, Schlüsseln oder Kennzeichen;`,
              `Schäden, die ein Fahrer unter Einfluss von Alkohol, Drogen oder anderen Rauschmitteln verursacht;`,
              `Schäden, die ein nicht berechtigter Fahrer verursacht;`,
              `Schäden im Ausland, wenn der Grenzübertritt nicht vom Vermieter genehmigt wurde;`,
              `Schäden am Fahrzeug, die nicht der zuständigen Polizeidienststelle bzw. dem Vermieter gemeldet wurden;`,
            ],
          },
          { type: "p", text: `Tritt einer der genannten Schadensfälle ein, haftet der Mieter für den vollen Schadensbetrag.` },
          { type: "p", text: `Der Vermieter haftet nicht für Schäden an oder den Verlust von Eigentum des Mieters.` },
        ],
      },
      {
        n: 8,
        topic: "Unfall, Diebstahl und Schaden",
        blocks: [
          { type: "p", text: `Bei Verkehrsunfall, Beschädigung, Panne, Unterschlagung, Diebstahl, technischem Defekt und ähnlichen Umständen ist der Mieter verpflichtet:` },
          {
            type: "ul",
            items: [
              `das Fahrzeug zu sichern, bis der Vermieter es übernimmt;`,
              `Namen und Adressen der Beteiligten und Zeugen zu notieren;`,
              `die zuständige Polizei zu rufen und deren Protokoll zu sichern, außer bei einem technischen Defekt;`,
              `unverzüglich in der nächsten Filiale des Vermieters eine Erklärung zum Ereignis abzugeben.`,
            ],
          },
          { type: "p", text: `Sichert der Mieter kein Polizeiprotokoll, gehen alle Kosten des Schadenersatzes im Zusammenhang mit Beschädigung oder Verlust des Fahrzeugs vollständig zu seinen Lasten, unabhängig von seinem Verschulden. Der Mieter erkennt an, dass er bei fahrlässigem Umgang mit Fahrzeug, Papieren oder Schlüsseln sowie in anderen in den Versicherungsbedingungen oder im Gesetz vorgesehenen Fällen vom Versicherer in Regress genommen werden kann.` },
          { type: "p", text: `Die Versicherung deckt keine Schäden, die vorsätzlich, unter Einfluss von Alkohol oder Drogen, ohne vorgeschriebene Fahrerlaubnis oder bei entzogenem Führerschein verursacht wurden, Fälle, in denen mehr Personen befördert werden als zugelassene Sitzplätze vorhanden sind, Schäden durch Krieg oder Aufruhr sowie andere in den Bedingungen des Versicherers oder in Rechtsvorschriften vorgesehene Fälle.` },
          { type: "p", text: `Die Versicherung deckt nicht das Risiko der Zerstörung oder Beschädigung von Reifen, Felgen oder Radkappen sowie des Unterbodens.` },
        ],
      },
      {
        n: 9,
        topic: "Beschädigung und Diebstahl des Fahrzeugs",
        blocks: [
          { type: "p", text: `Bei Beschädigung des Fahrzeugs zahlt der Mieter auf Verlangen des Vermieters die gesamten Reparaturkosten und sonstige Verluste des Vermieters, einschließlich des entgangenen Gewinns in Höhe der Tagesmiete für die Dauer der Reparatur nach geltender Preisliste, höchstens jedoch 30 Tage.` },
          { type: "p", text: `Bei Diebstahl des Fahrzeugs oder anderen Umständen, durch die der Mieter das Fahrzeug am Ende der Miete nicht zurückgeben kann, zahlt der Mieter auf Verlangen des Vermieters den vollen Wert des Fahrzeugs, nämlich den Kaufpreis eines Neufahrzeugs laut Angebot des Lieferanten des Vermieters, sowie sonstige Verluste, einschließlich des entgangenen Gewinns in Höhe der Tagesmiete nach geltender Preisliste, höchstens jedoch 30 Tage.` },
          { type: "p", text: `Bei Schäden gegenüber Dritten trägt der Mieter alle Kosten, die dem Vermieter daraus entstehen können.` },
        ],
      },
      {
        n: 10,
        topic: "Haftung des Vermieters",
        blocks: [
          { type: "p", text: `Der Vermieter haftet nicht für Schäden, die dem Mieter durch eine verspätete Übergabe des Fahrzeugs entstehen, und nicht für Schäden durch einen Defekt des Fahrzeugs während der Mietdauer.` },
          { type: "p", text: `Der Vermieter haftet nicht für Schäden an Personen oder Sachen, die im Fahrzeug befördert werden.` },
        ],
      },
      {
        n: 11,
        topic: "Übertragung von Rechten und Änderungen",
        blocks: [
          { type: "p", text: `Der Mieter darf Rechte oder Pflichten aus diesem Vertrag nicht auf Dritte übertragen, das Fahrzeug, seine Teile oder Ausstattung nicht veräußern und keine Änderungen am Fahrzeug vornehmen.` },
        ],
      },
      {
        n: 12,
        topic: "Anwendbares Recht",
        blocks: [
          { type: "p", text: `Für alle in diesen Bedingungen nicht geregelten Rechte und Pflichten gelten die Bestimmungen des am Sitz des Vermieters geltenden Obligationengesetzes.` },
        ],
      },
      {
        n: 13,
        topic: "Gerichtsstand",
        blocks: [
          { type: "p", text: `Bei Streitigkeiten aus diesem Vertrag vereinbaren die Parteien die örtliche Zuständigkeit des sachlich zuständigen Gerichts in Široki Brijeg.` },
        ],
      },
    ],
  },
  es: {
    heading: "Condiciones de alquiler",
    intro: "Condiciones generales de alquiler de vehículos de Maximum Rent a Car. Lee con atención todos los artículos antes de recoger el vehículo.",
    articleLabel: "Artículo",
    indexLabel: "Contenido",
    articles: [
      {
        n: 1,
        topic: "Definiciones",
        blocks: [
          {
            type: "ul",
            items: [
              `«Arrendador»: la empresa MAXIMUM RENT A CAR d.o.o., con domicilio social en Potpolje bb, 88260 Čitluk, Bosnia y Herzegovina, número de registro: 4227631720004.`,
              `«Arrendatario»: la persona física o jurídica a cuyo nombre se alquila el vehículo. En el Contrato de alquiler figura como «Arrendatario» y es responsable de cumplir todos los puntos de estas Condiciones generales y del Contrato de alquiler.`,
              `«Contrato»: el contrato de alquiler individual que se firma al recoger el vehículo, que autoriza su uso y define la recogida y la devolución, la cobertura, el equipamiento y los servicios incluidos en el precio y la forma de pago. El Contrato recoge también el kilometraje, el nivel de combustible, los daños y posibles defectos del vehículo, así como otros derechos y obligaciones que ambas partes aceptan íntegramente con su firma.`,
              `El estado del vehículo en el momento de la entrega y las Condiciones generales de alquiler forman parte del Contrato de alquiler.`,
              `«Conductor o conductor adicional»: la persona física indicada en el Contrato como «Usuario», que firma el Contrato y recoge el vehículo, y que es responsable de cumplir todas sus disposiciones.`,
              `«Usuario»: el Arrendatario, el conductor y el conductor adicional se denominan en adelante, en estas Condiciones generales, con el término único de «Usuario».`,
              `«Vehículo» es el objeto del alquiler según el Contrato, cuyos datos figuran en el mismo.`,
            ],
          },
        ],
      },
      {
        n: 2,
        topic: "Entrega del vehículo",
        blocks: [
          { type: "p", text: `Al firmar este Contrato, el Arrendatario confirma que ha recibido el vehículo en buen estado, sin daños y con el depósito lleno, salvo que el Contrato indique expresamente lo contrario por escrito. El Arrendatario confirma que, junto con el vehículo, ha recibido la documentación, las llaves, todo el equipamiento obligatorio y los accesorios, así como el equipamiento adicional indicado en el Contrato.` },
          { type: "p", text: `Al firmar el Contrato, el Arrendatario garantiza al Arrendador que cumple la edad mínima para conducir un vehículo de motor y que posee los documentos necesarios según la normativa vigente de Bosnia y Herzegovina, que debe presentar al Arrendador en original. Una copia queda en poder del Arrendador como anexo al Contrato.` },
        ],
      },
      {
        n: 3,
        topic: "Obligaciones en la devolución",
        blocks: [
          { type: "p", text: `El Arrendatario se compromete a:` },
          {
            type: "ul",
            items: [
              `devolver el vehículo en el lugar de recogida, a más tardar dentro del plazo fijado en este Contrato;`,
              `devolver el vehículo antes del plazo acordado si el Arrendador lo solicita;`,
              `devolver el vehículo en buen estado y sin daños, con toda la documentación, llaves, neumáticos, herramientas, equipamiento obligatorio, estándar y adicional y con el depósito lleno, tal como lo recibió;`,
              `pagar las obligaciones económicas de este Contrato en el momento de recoger el vehículo, si no se abonan como anticipo o fianza;`,
              `aceptar que el Arrendador pueda cargar en su tarjeta de crédito, o por otro medio de pago, todos los costes de reparación, defectos o pérdidas detectados tras la devolución que el Arrendatario no haya comunicado según el procedimiento de devolución;`,
              `reconocer que el Arrendador está autorizado a cargar en su tarjeta de crédito cualquier coste que le genere el Contrato;`,
              `solicitar con antelación al Arrendador cualquier ampliación del periodo de alquiler y cualquier otro cambio;`,
              `si el Arrendatario supera el plazo de devolución acordado sin el consentimiento del Arrendador, este puede considerar el vehículo robado y denunciarlo a la policía. En ese caso, el Arrendatario asume todos los daños resultantes;`,
              `si se supera el plazo de devolución, el Arrendatario asume todas las obligaciones y responsabilidades de este Contrato acordadas para la duración del alquiler.`,
            ],
          },
          { type: "p", text: `Todos los empleados de MAXIMUM RENT A CAR d.o.o. pueden inspeccionar cualquier vehículo en cualquier momento. Si se comprueba que el Arrendatario ha incumplido alguna condición de este Contrato, los empleados están autorizados a retirar el vehículo.` },
          { type: "p", text: `El Arrendador se reserva incondicionalmente el derecho a rescindir el Contrato de alquiler en cualquier momento y lugar antes de su vencimiento, sin obligación de indemnizar al Arrendatario.` },
        ],
      },
      {
        n: 4,
        topic: "Obligaciones del Arrendatario",
        blocks: [
          { type: "p", text: `Obligaciones del Arrendatario:` },
          {
            type: "ul",
            items: [
              `recoger y usar el vehículo de acuerdo con la Ley de bases de seguridad vial de BiH, o con cualquier otra ley que regule el tráfico en otros países, y demás normativa aplicable;`,
              `dejar de conducir inmediatamente si falla el cuentakilómetros e informar de ello al Arrendador sin demora;`,
              `usar el vehículo solo para necesidades propias;`,
              `que el vehículo lo conduzca solo el Arrendatario o una persona indicada en el Contrato como conductor o conductor adicional, siempre que tenga los permisos y documentos necesarios;`,
              `no salir con el vehículo de Bosnia y Herzegovina salvo que el Contrato lo prevea, y no entrar en países donde no esté permitida la entrada;`,
              `no usar el vehículo con fines ilícitos, por ejemplo para cometer delitos, infracciones aduaneras, de divisas u otras, o actos ilegales;`,
              `no sobrecargar el vehículo con carga o pasajeros;`,
              `no conducir bajo los efectos del alcohol o de estupefacientes;`,
              `cuidar del buen estado técnico del vehículo y de sus revisiones periódicas obligatorias;`,
              `revisar con regularidad y, si es necesario, reponer el refrigerante, el aceite y la presión de los neumáticos;`,
              `cuando no use el vehículo, cerrarlo siempre, llevarse las llaves y la documentación y activar los dispositivos de seguridad que tenga;`,
              `no usar el vehículo para el transporte comercial de mercancías, carga o pasajeros; para remolcar o transportar otros vehículos o remolques; para transportar materiales u objetos que puedan dañarlo o ensuciarlo (por ejemplo, animales, materiales inflamables, objetos muy sucios o con mal olor); para carreras, competiciones de motor o similares; ni para clases de conducción.`,
              `usar el vehículo con la diligencia de un buen administrador, de acuerdo con la Ley de obligaciones de la Federación de BiH.`,
            ],
          },
        ],
      },
      {
        n: 5,
        topic: "Costes y combustible",
        blocks: [
          { type: "p", text: `El coste del combustible consumido durante el alquiler corre a cargo del Arrendatario.` },
          { type: "p", text: `Costes que el Arrendatario se compromete a pagar, independientemente de que se carguen al Arrendador como propietario, al Arrendatario o al conductor (salvo que se deban a culpa exclusiva del Arrendador), y que se deriven de:` },
          {
            type: "ul",
            items: [
              `el transporte del vehículo;`,
              `garajes, aparcamiento, peajes de carreteras y puentes y similares;`,
              `todas las multas por infracciones de tráfico u otras normas;`,
              `procedimientos judiciales, sancionadores u otros;`,
              `intereses de demora sobre dichas deudas;`,
              `costes surgidos o causados durante el alquiler, independientemente de cuándo se determinen o venzan.`,
            ],
          },
          { type: "p", text: `El Arrendador reembolsa al Arrendatario los gastos necesarios de aceite, lubricante, revisiones periódicas obligatorias y otras reparaciones menores durante el alquiler. Para ello, el Arrendatario debe presentar una factura válida emitida por la empresa que realizó el servicio. Si se comprueba que el Arrendatario cambió o reparó sin necesidad un conjunto, pieza o dispositivo, el Arrendador puede negarse a reembolsar ese coste. Los gastos de lavado no se reembolsan.` },
        ],
      },
      {
        n: 6,
        topic: "Daños e indemnización",
        blocks: [
          { type: "p", text: `En caso de falta o daño del vehículo, del equipamiento o de los accesorios, sea cual sea la causa, el Arrendatario pagará al Arrendador su valor íntegro a precio de mercado de piezas nuevas idénticas, vigente en la fecha de devolución acordada.` },
          { type: "p", text: `Si por negligencia del Arrendatario o del conductor se daña el motor o la transmisión (por ejemplo, por falta de aceite o refrigerante), el cárter, el embrague, los bajos del vehículo u otros elementos por un uso negligente (por ejemplo, conducción descuidada o fuera de carretera), el Arrendatario reembolsará al Arrendador el importe total de la reparación y, además, el alquiler diario perdido según la tarifa vigente durante la reparación, con un máximo de 30 días, así como todos los daños derivados, como el remolque o la pérdida de valor del vehículo. Si por cualquier motivo se necesita una limpieza especial, el Arrendador cubrirá el coste de la limpieza necesaria. El Arrendador se reserva el derecho a cobrar el servicio de repostaje.` },
        ],
      },
      {
        n: 7,
        topic: "Seguro",
        blocks: [
          { type: "p", text: `Todos los vehículos están asegurados frente a la responsabilidad por daños a terceros.` },
          { type: "p", text: `La franquicia depende del grupo del vehículo, se fija según la tarifa vigente del Arrendador y figura en el Contrato.` },
          { type: "p", text: `CDW: seguro diario a todo riesgo con el que el Arrendatario limita su responsabilidad por daños al importe de la franquicia, que depende del grupo del vehículo. Si el daño es menor que la franquicia, se cobra el importe menor.` },
          { type: "p", text: `TP: protección contra robo, con la que el usuario limita su responsabilidad por este tipo de daño al importe de su franquicia.` },
          { type: "p", text: `CDW+: cobertura con la que se reduce, por un importe menor, parte de la responsabilidad por daños en la carrocería.` },
          { type: "p", text: `SCDW: cobertura con la que se elimina por completo la responsabilidad económica por daños en la carrocería.` },
          { type: "p", text: `El seguro no cubre en ningún caso:` },
          {
            type: "ol",
            items: [
              `daños en neumáticos, llantas y tapacubos;`,
              `daños en los bajos del vehículo, el interior, el parabrisas y otros cristales;`,
              `un embrague quemado;`,
              `daños en el motor por falta de aceite, por repostar el combustible equivocado o por uso negligente;`,
              `daños por la pérdida de documentos, llaves o matrículas;`,
              `daños causados por un conductor bajo los efectos del alcohol, drogas u otras sustancias;`,
              `daños causados por un conductor no autorizado;`,
              `daños en el extranjero cuando el Arrendador no autorizó el paso de la frontera;`,
              `cualquier daño del vehículo no comunicado a la policía competente o al Arrendador;`,
            ],
          },
          { type: "p", text: `Si se produce cualquiera de estos supuestos, el Arrendatario responde por el importe total del daño.` },
          { type: "p", text: `El Arrendador no responde por daños o pérdidas de los bienes del Arrendatario.` },
        ],
      },
      {
        n: 8,
        topic: "Accidentes, robo y daños",
        blocks: [
          { type: "p", text: `En caso de accidente de tráfico, daño, avería, apropiación indebida, robo, fallo mecánico u otras circunstancias similares, el Arrendatario está obligado a:` },
          {
            type: "ul",
            items: [
              `proteger el vehículo hasta que el Arrendador se haga cargo de él;`,
              `anotar los nombres y direcciones de los implicados y de los testigos;`,
              `llamar a la policía competente y obtener su atestado, salvo en caso de fallo mecánico;`,
              `declarar sin demora lo sucedido en la oficina más cercana del Arrendador.`,
            ],
          },
          { type: "p", text: `Si el Arrendatario no obtiene el atestado policial, todos los costes de indemnización por daño o pérdida del vehículo corren íntegramente a su cargo, con independencia de su culpa. El Arrendatario reconoce que, en caso de trato negligente del vehículo, los documentos o las llaves, y en otros casos previstos por las normas del seguro o por la ley, la aseguradora puede reclamarle el importe.` },
          { type: "p", text: `El seguro no cubre daños causados de forma intencionada, bajo los efectos del alcohol o drogas, sin el permiso de conducir exigido o con el permiso retirado, los casos en que el vehículo lleva más personas que plazas homologadas, los daños por actos de guerra o rebelión, ni otras circunstancias previstas por las normas de la aseguradora o por la ley.` },
          { type: "p", text: `El seguro no cubre la destrucción o el daño de neumáticos, llantas o tapacubos, ni de los bajos del vehículo.` },
        ],
      },
      {
        n: 9,
        topic: "Daños y robo del vehículo",
        blocks: [
          { type: "p", text: `En caso de daño del vehículo, el Arrendatario pagará, a petición del Arrendador, el importe total de la reparación y otras pérdidas que sufra el Arrendador, incluido el lucro cesante equivalente al alquiler diario durante la reparación según la tarifa vigente, con un máximo de 30 días.` },
          { type: "p", text: `En caso de robo del vehículo u otras circunstancias por las que el Arrendatario no pueda devolverlo al final del alquiler, pagará, a petición del Arrendador, el valor íntegro del vehículo, es decir, el precio de compra de un vehículo nuevo según la oferta del proveedor del Arrendador, así como otras pérdidas, incluido el lucro cesante equivalente al alquiler diario según la tarifa vigente, con un máximo de 30 días.` },
          { type: "p", text: `En caso de daños a terceros, el Arrendatario asumirá todos los costes que el Arrendador pudiera tener por ese motivo.` },
        ],
      },
      {
        n: 10,
        topic: "Responsabilidad del Arrendador",
        blocks: [
          { type: "p", text: `El Arrendador no responde por los daños que pueda sufrir el Arrendatario por un retraso en la entrega del vehículo, ni por los daños derivados de una avería durante el alquiler.` },
          { type: "p", text: `El Arrendador no responde por los daños a personas u objetos transportados en el vehículo.` },
        ],
      },
      {
        n: 11,
        topic: "Cesión de derechos y modificaciones",
        blocks: [
          { type: "p", text: `El Arrendatario no puede ceder a terceros los derechos u obligaciones de este Contrato, ni enajenar el vehículo, sus piezas o equipamiento, ni realizar modificaciones en él.` },
        ],
      },
      {
        n: 12,
        topic: "Ley aplicable",
        blocks: [
          { type: "p", text: `Todos los derechos y obligaciones no regulados en estas condiciones se rigen por la Ley de obligaciones vigente en el domicilio del Arrendador.` },
        ],
      },
      {
        n: 13,
        topic: "Jurisdicción",
        blocks: [
          { type: "p", text: `En caso de litigio derivado de este Contrato, las partes aceptan la competencia territorial del tribunal competente por razón de la materia en Široki Brijeg.` },
        ],
      },
    ],
  },
};
