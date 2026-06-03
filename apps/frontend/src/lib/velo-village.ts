export const unitTypes = [
  {
    id: 'woonunit-420-2',
    code: '420-2',
    title: 'Compact Warm Nest',
    capacityLabel: '2 personen',
    dimensions: '230 x 420 cm',
    sleepingLayout: '1 slaapkamer, 2 slaapplaatsen',
    summary:
      'De kleinste unit is ideaal voor een koppel of duo dat het EK-weekend slim wil aanpakken: droog slapen, warm douchen en snel terug het parcours op.',
    features: [
      'Aparte badkamer met douche, toilet en wastafel',
      'Keuken met vierpits kookplaat, koelkast en spoelbak',
      'Sterke fit voor korte crossweekends en crewverblijven',
    ],
  },
  {
    id: 'woonunit-570-2',
    code: '570-2',
    title: 'Duo Basecamp',
    capacityLabel: '2 personen',
    dimensions: '230 x 570 cm',
    sleepingLayout: '1 slaapkamer, 2 slaapplaatsen',
    summary:
      'Meer leefruimte voor twee personen, met precies genoeg comfort om een fris novemberweekend ontspannen door te komen.',
    features: [
      'Mobiele badkamer en complete keuken',
      'Extra lengte voor meer rust en bagageruimte',
      'Interessant voor fans die langer dan één nacht blijven',
    ],
  },
  {
    id: 'woonunit-660-2',
    code: '660-2',
    title: 'Comfort Couple Lodge',
    capacityLabel: '2 personen',
    dimensions: '250 x 660 cm',
    sleepingLayout: '1 slaapkamer, 2 slaapplaatsen',
    summary:
      'Voor gasten die de meeste vierkante meters willen zonder naar een familietype op te schalen. Zeer geschikt als rustige, luxe uitvalsbasis.',
    features: [
      'Volwaardige badkamer en keukenopstelling',
      'Ruimere breedte voor comfortabeler verblijf',
      'Aantrekkelijk voor VIP-gasten, staff of contentcrews',
    ],
  },
  {
    id: 'woonunit-730',
    code: '730',
    title: 'Team Cabin',
    capacityLabel: '4 personen',
    dimensions: '250 x 730 cm',
    sleepingLayout: '2 slaapkamers met stapelbedden',
    summary:
      'Deze vierpersoonsunit is sterk voor vriendengroepen of kleine teams die dicht bij de cross willen zitten en toch privacy zoeken.',
    features: [
      'Twee aparte slaapzones',
      'Keuken met kookplaat, koelkast en spoelbak',
      'Werkt goed voor fan crews en wedstrijdstaf',
    ],
  },
  {
    id: 'woonunit-733',
    code: '733',
    title: 'Family Cross Lodge',
    capacityLabel: '4 personen',
    dimensions: '250 x 730 cm',
    sleepingLayout: '2 slaapkamers: dubbel bed + stapelbed',
    summary:
      'De meest gezinsvriendelijke optie. Handig voor bezoekers die het EK als weekendtrip combineren met rust, warmte en een eigen kookplek.',
    features: [
      'Twee gescheiden slaapkamers',
      'Koelkast met vriezer, kookplaat en douche',
      'Sterke fit voor gezinnen en koppels met kinderen',
    ],
  },
  {
    id: 'woonunit-730-8-persoons',
    code: '730-8',
    title: 'Crew Sleep Wagon',
    capacityLabel: '8 personen',
    dimensions: '250 x 730 cm',
    sleepingLayout: '4 aparte kamers met stapelbedden',
    summary:
      'Gemaakt voor grotere crews en eventteams. De focus ligt hier op efficiënte slaapcapaciteit, privacy per kamer en snel herstel tussen lange dagen.',
    features: [
      'Vier aparte slaapcompartimenten',
      'Badkamer aan de achterzijde met douche en toilet',
      'Geen keuken, dus ideaal voor pure crewlogistiek',
    ],
  },
] as const;

export const locationHighlights = [
  {
    title: 'Loopafstand van het parcours',
    description:
      'VeloVillage ligt strategisch voor een compact EK-weekend: je zit dicht bij het Bergherbos en hoeft niet te pendelen tussen accommodatie en eventterrein.',
  },
  {
    title: 'Plug-and-play voorzieningen',
    description:
      'De pop-up camping werkt met vaste stroom- en wateraansluitingen, zodat alle units direct functioneel en comfortabel inzetbaar zijn.',
  },
  {
    title: 'Aankomst zonder gedoe',
    description:
      'Na boeking volgt heldere informatie over check-in, parkeren en de route naar je unit, zodat je vrijdag of zaterdag direct goed binnenkomt.',
  },
] as const;

export const conceptPoints = [
  {
    title: '5 min. lopen',
    description: 'naar het EK-parcours in Zeddam',
  },
  {
    title: 'Volledig verwarmd',
    description: 'met winterharde isolatie voor novembernachten',
  },
  {
    title: 'Eigen sanitair',
    description: 'dus geen koude loopjes naar een toiletgebouw',
  },
] as const;

export const lodgeOffers = [
  {
    title: 'Studio Unit',
    capacity: '2 personen',
    features: 'Compact, eigen kitchenette, badkamer, boxspringbedden.',
    perfectFor: 'Stellen of wielerduo\'s.',
    layoutHint: 'Compacte lodge-opzet met directe toegang tot douche en keukenblok.',
    bookingUnitId: 'woonunit-420-2',
  },
  {
    title: 'Family / Team Unit',
    capacity: '4 personen',
    features: 'Ruime living, twee aparte slaapcompartimenten, complete keuken.',
    perfectFor: 'Vriendengroepen en gezinnen.',
    layoutHint: 'Plattegrond met twee duidelijke slaapzones en centrale leefruimte.',
    bookingUnitId: 'woonunit-730',
  },
  {
    title: 'Pro XL Unit',
    capacity: '6 personen',
    features: 'Maximale ruimte, grote eethoek, extra opbergruimte voor materiaal.',
    perfectFor: 'Complete wielerteams of vriendenclubs.',
    layoutHint: 'Ruimtelijke teamindeling met extra plek voor tassen, kleding en materiaal.',
    bookingUnitId: 'woonunit-730-8-persoons',
  },
] as const;

export const faqItems = [
  {
    question: 'Wanneer kan ik inchecken?',
    answer:
      'De opzet is gericht op aankomst vanaf vrijdagmiddag 6 november, zodat gasten zaterdagochtend direct goed aan het EK-weekend kunnen beginnen.',
  },
  {
    question: 'Hoe zit het met de stroom en voorzieningen?',
    answer:
      'Alle units zijn plug-and-play aangesloten op vaste stroom- en waternetwerken van de pop-up camping. Je boekt dus geen kale plek, maar een direct bruikbare woonunit.',
  },
  {
    question: 'Zijn handdoeken en beddengoed inclusief?',
    answer:
      'Dat kan als inbegrepen service of als extra optie worden aangeboden. Deze homepage positioneert het product alvast als comfortabel premium verblijf; de exacte service-inhoud kan in de bevestiging worden vastgelegd.',
  },
  {
    question: 'Kan ik mijn auto bij de unit parkeren?',
    answer:
      'De bedoeling is een praktische eventlogistiek waarbij parkeren zo dicht mogelijk bij de unitzone of een korte loopafstand daarvan wordt georganiseerd. De definitieve parkeerinstructies volgen na boeking.',
  },
] as const;

export const stockLimitPerUnitType = 5;

export function getCapacityCount(value: string) {
  const match = value.match(/\d+/);

  return match ? Number(match[0]) : null;
}