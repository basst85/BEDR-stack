import { formatCurrency, resolvePublicAssetPath, type Locale } from '@/lib/i18n';

const unitPreviewImageSrc = resolvePublicAssetPath('impressie.jpg');

type UnitType = {
  id: string;
  code: string;
  title: string;
  capacityLabel: string;
  pricePerNight: number;
  dimensions: string;
  sleepingLayout: string;
  summary: string;
  features: string[];
  images: Array<{
    src: string;
    alt: string;
  }>;
};

const unitTypesByLocale: Record<Locale, UnitType[]> = {
  nl: [
    {
      id: '420',
      code: '420',
      title: '2 persoons unit met stapelbed',
      capacityLabel: '2 personen',
      pricePerNight: 150,
      dimensions: 'Type unit 420',
      sleepingLayout: '1 stapelbed',
      summary:
        'Compacte 2-persoonsunit met stapelbed voor een korte en praktische overnachting dicht bij het evenement.',
      features: ['2 slaapplaatsen in stapelbed-opstelling', 'Type unit 420', 'EUR 150 per nacht'],
      images: [{ src: unitPreviewImageSrc, alt: '2 persoons unit met stapelbed' }],
    },
    {
      id: '660',
      code: '660',
      title: '2 persoons unit met 2 losse bedden',
      capacityLabel: '2 personen',
      pricePerNight: 170,
      dimensions: 'Type unit 660',
      sleepingLayout: '2 losse bedden',
      summary:
        '2-persoonsunit met losse bedden voor gasten die apart willen slapen zonder naar een grotere unit te gaan.',
      features: ['2 slaapplaatsen in twin-opstelling', 'Type unit 660', 'EUR 170 per nacht'],
      images: [{ src: unitPreviewImageSrc, alt: '2 persoons unit met 2 losse bedden' }],
    },
    {
      id: '730',
      code: '730',
      title: '4 persoons unit met twee stapelbedden',
      capacityLabel: '4 personen',
      pricePerNight: 300,
      dimensions: 'Type unit 730',
      sleepingLayout: '2 stapelbedden',
      summary:
        'Vierpersoonsunit met twee stapelbedden, geschikt voor teams, vrienden of een gezin dat compact wil overnachten.',
      features: ['4 slaapplaatsen verdeeld over twee stapelbedden', 'Type unit 730', 'EUR 300 per nacht'],
      images: [{ src: unitPreviewImageSrc, alt: '4 persoons unit met twee stapelbedden' }],
    },
    {
      id: '733',
      code: '733',
      title: '4 persoons unit met stapelbed en twee persoonsbed',
      capacityLabel: '4 personen',
      pricePerNight: 320,
      dimensions: 'Type unit 733',
      sleepingLayout: '1 stapelbed en 1 tweepersoonsbed',
      summary:
        'Vierpersoonsunit met combinatie van stapelbed en tweepersoonsbed, passend voor gezinnen of gemengde reisgezelschappen.',
      features: ['4 slaapplaatsen met gemengde bedindeling', 'Type unit 733', 'EUR 320 per nacht'],
      images: [{ src: unitPreviewImageSrc, alt: '4 persoons unit met stapelbed en tweepersoonsbed' }],
    },
    {
      id: '900',
      code: '900',
      title: '3 - 5 persoons VIP unit',
      capacityLabel: '3 - 5 personen',
      pricePerNight: 400,
      dimensions: 'Type unit 900',
      sleepingLayout: 'VIP-opstelling voor 3 tot 5 personen',
      summary:
        'Ruimere VIP-unit voor kleinere groepen die meer comfort en flexibiliteit in bezetting zoeken.',
      features: ['Geschikt voor 3 tot 5 personen', 'Type unit 900', 'EUR 400 per nacht'],
      images: [{ src: unitPreviewImageSrc, alt: '3 tot 5 persoons VIP unit' }],
    },
    {
      id: 'cabine',
      code: 'cabine',
      title: '2 persoons compartiment in 8 persoons slaapwagen',
      capacityLabel: '2 personen',
      pricePerNight: 90,
      dimensions: 'Type unit cabine',
      sleepingLayout: '1 afsluitbaar 2-persoons compartiment in slaapwagen',
      summary:
        'Afzonderlijk 2-persoonscompartiment binnen een 8-persoons slaapwagen voor de meest budgetgerichte overnachting.',
      features: ['2 slaapplaatsen binnen een gedeelde slaapwagen', 'Type unit cabine', 'EUR 90 per nacht'],
      images: [{ src: unitPreviewImageSrc, alt: '2 persoons compartiment in slaapwagen' }],
    },
  ],
  en: [
    {
      id: '420',
      code: '420',
      title: '2 person unit with bunk bed',
      capacityLabel: '2 people',
      pricePerNight: 150,
      dimensions: 'Unit type 420',
      sleepingLayout: '1 bunk bed',
      summary: 'Compact 2-person unit with a bunk bed for a short and practical overnight stay close to the event.',
      features: ['2 sleeping places in a bunk-bed layout', 'Unit type 420', 'EUR 150 per night'],
      images: [{ src: unitPreviewImageSrc, alt: '2 person unit with bunk bed' }],
    },
    {
      id: '660',
      code: '660',
      title: '2 person unit with twin beds',
      capacityLabel: '2 people',
      pricePerNight: 170,
      dimensions: 'Unit type 660',
      sleepingLayout: '2 single beds',
      summary: '2-person unit with separate beds for guests who want to sleep separately without moving to a larger unit.',
      features: ['2 sleeping places in a twin layout', 'Unit type 660', 'EUR 170 per night'],
      images: [{ src: unitPreviewImageSrc, alt: '2 person unit with twin beds' }],
    },
    {
      id: '730',
      code: '730',
      title: '4 person unit with two bunk beds',
      capacityLabel: '4 people',
      pricePerNight: 300,
      dimensions: 'Unit type 730',
      sleepingLayout: '2 bunk beds',
      summary: 'Four-person unit with two bunk beds, suitable for teams, friends or a family looking for compact accommodation.',
      features: ['4 sleeping places spread across two bunk beds', 'Unit type 730', 'EUR 300 per night'],
      images: [{ src: unitPreviewImageSrc, alt: '4 person unit with two bunk beds' }],
    },
    {
      id: '733',
      code: '733',
      title: '4 person unit with bunk bed and double bed',
      capacityLabel: '4 people',
      pricePerNight: 320,
      dimensions: 'Unit type 733',
      sleepingLayout: '1 bunk bed and 1 double bed',
      summary: 'Four-person unit combining a bunk bed and a double bed, suitable for families or mixed travel groups.',
      features: ['4 sleeping places with a mixed bed layout', 'Unit type 733', 'EUR 320 per night'],
      images: [{ src: unitPreviewImageSrc, alt: '4 person unit with bunk bed and double bed' }],
    },
    {
      id: '900',
      code: '900',
      title: '3 to 5 person VIP unit',
      capacityLabel: '3 - 5 people',
      pricePerNight: 400,
      dimensions: 'Unit type 900',
      sleepingLayout: 'VIP layout for 3 to 5 people',
      summary: 'Spacious VIP unit for smaller groups looking for more comfort and flexibility in occupancy.',
      features: ['Suitable for 3 to 5 people', 'Unit type 900', 'EUR 400 per night'],
      images: [{ src: unitPreviewImageSrc, alt: '3 to 5 person VIP unit' }],
    },
    {
      id: 'cabine',
      code: 'cabine',
      title: '2 person compartment in an 8 person sleeper wagon',
      capacityLabel: '2 people',
      pricePerNight: 90,
      dimensions: 'Unit type cabine',
      sleepingLayout: '1 lockable 2-person compartment in sleeper wagon',
      summary: 'Separate 2-person compartment within an 8-person sleeper wagon for the most budget-conscious overnight stay.',
      features: ['2 sleeping places inside a shared sleeper wagon', 'Unit type cabine', 'EUR 90 per night'],
      images: [{ src: unitPreviewImageSrc, alt: '2 person compartment in sleeper wagon' }],
    },
  ],
};

const locationHighlightsByLocale = {
  nl: [
    {
      title: 'Loopafstand van het parcours',
      description:
        'CrossVillage ligt strategisch voor een compact EK-weekend: je zit dicht bij het Bergherbos en hoeft niet te pendelen tussen accommodatie en eventterrein.',
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
  ],
  en: [
    {
      title: 'Walking distance from the course',
      description:
        'CrossVillage is positioned for a compact championship weekend: you stay close to the Bergherbos course and do not have to shuttle between accommodation and event site.',
    },
    {
      title: 'Plug-and-play facilities',
      description:
        'The pop-up camping uses fixed power and water connections, so every unit is directly functional and comfortable from the moment you arrive.',
    },
    {
      title: 'Arrival without hassle',
      description:
        'After booking you receive clear information about check-in, parking and the route to your unit, so you can arrive smoothly on Friday or Saturday.',
    },
  ],
} as const;

const conceptPointsByLocale = {
  nl: [
    { title: '5 min. lopen', description: 'naar het EK-parcours in Zeddam' },
    { title: 'Volledig verwarmd', description: 'met winterharde isolatie voor novembernachten' },
    { title: 'Eigen sanitair', description: 'dus geen koude loopjes naar een toiletgebouw' },
  ],
  en: [
    { title: '5 min. walk', description: 'to the European Championship course in Zeddam' },
    { title: 'Fully heated', description: 'with winter-proof insulation for November nights' },
    { title: 'Private sanitary facilities', description: 'so no cold walks to a shared toilet block' },
  ],
} as const;

const faqItemsByLocale = {
  nl: [
    {
      question: 'Wanneer kan ik inchecken?',
      answer:
        'Inchecken kan vanaf donderdag 5 november. De laatste incheckdatum is maandag 9 november en uitchecken kan uiterlijk op dinsdag 10 november.',
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
  ],
  en: [
    {
      question: 'When can I check in?',
      answer:
        'Check-in is possible from Thursday 5 November. The last check-in date is Monday 9 November and check-out is possible until Tuesday 10 November.',
    },
    {
      question: 'What about power and facilities?',
      answer:
        'All units are plug-and-play connected to the fixed power and water networks of the pop-up camping. So you are not booking an empty pitch, but a ready-to-use accommodation unit.',
    },
    {
      question: 'Are towels and bed linen included?',
      answer:
        'That can be offered as an included service or as an extra option. This homepage already positions the product as a comfortable premium stay; the exact service contents can be confirmed after booking.',
    },
    {
      question: 'Can I park my car near the unit?',
      answer:
        'The intention is to organise practical event logistics, with parking as close as possible to the unit zone or within a short walking distance. Final parking instructions follow after booking.',
    },
  ],
} as const;

export function getUnitTypes(locale: Locale) {
  return unitTypesByLocale[locale];
}

export function getLocationHighlights(locale: Locale) {
  return locationHighlightsByLocale[locale];
}

export function getConceptPoints(locale: Locale) {
  return conceptPointsByLocale[locale];
}

export function getFaqItems(locale: Locale) {
  return faqItemsByLocale[locale];
}

export function formatNightlyPrice(value: number, locale: Locale) {
  return `${formatCurrency(value, locale)} ${locale === 'en' ? 'per night' : 'per nacht'}`;
}

export function getCapacityCount(value: string) {
  const match = value.match(/\d+/);

  return match ? Number(match[0]) : null;
}