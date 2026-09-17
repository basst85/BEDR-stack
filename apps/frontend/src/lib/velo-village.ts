import { formatCurrency, resolvePublicAssetPath, type Locale } from '@/lib/i18n';

const unitPreviewImageSrc = resolvePublicAssetPath('impressie.jpg');
const unit420ImageSources = [1, 2, 3, 4, 5].map((index) => resolvePublicAssetPath(`420/420-${index}.jpg`));
const unit660ImageSources = [1, 2, 3, 4, 5].map((index) => resolvePublicAssetPath(`660/660-${index}.jpg`));
const unit730ImageSources = [1, 2, 3, 4, 5, 6].map((index) => resolvePublicAssetPath(`730/730-${index}.jpg`));
const unit733ImageSources = [1, 2, 3, 4, 5, 6, 7].map((index) => resolvePublicAssetPath(`733/733-${index}.jpg`));
const unit900ImageSources = [1, 2, 3, 4, 5, 6, 7].map((index) => resolvePublicAssetPath(`900/900-${index}.jpg`));
const unit730CabinImageSources = [1, 2, 3, 4, 5].map((index) => resolvePublicAssetPath(`730-cabin/730-cabin-${index}.jpg`));

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
      dimensions: 'Type unit 420 • 10 m2',
      sleepingLayout: '1 slaapkamer met stapelbed',
      summary:
        'Compact en comfortabel. Deze 2-persoons unit biedt het nodige voor een ontspannen verblijf tijdens het EK veldrijden. Na een dag langs het parcours kom je tot rust in een warme, volledig geïsoleerde unit met eigen sanitair en basiskeuken zonder oven, vriezer en een opbergkastje minder dan de overige woonunits.',
      features: ['Douche, toilet en wastafel', 'Eenvoudige keuken', 'Volledig geïsoleerd'],
      images: unit420ImageSources.map((src, index) => ({ src, alt: `2 persoons unit met stapelbed foto ${index + 1}` })),
    },
    {
      id: '660',
      code: '660',
      title: '2 persoons unit met 2 losse bedden',
      capacityLabel: '2 personen',
      pricePerNight: 170,
      dimensions: 'Type unit 660 • 16 m2',
      sleepingLayout: '1 slaapkamer met twee losse bedden',
      summary:
        'Compact, comfortabel en van alle gemakken voorzien. Deze 2-persoons unit biedt alles wat je nodig hebt voor een ontspannen verblijf tijdens het EK veldrijden. Na een dag langs het parcours kom je tot rust in een warme, volledig geïsoleerde unit met eigen sanitair en keuken.',
      features: ['Douche, toilet en wastafel', 'Eenvoudige keuken', 'Volledig geïsoleerd'],
      images: unit660ImageSources.map((src, index) => ({ src, alt: `2 persoons unit met 2 losse bedden foto ${index + 1}` })),
    },
    {
      id: '730',
      code: '730',
      title: '4 persoons unit met twee stapelbedden',
      capacityLabel: '4 personen',
      pricePerNight: 300,
      dimensions: 'Type unit 730 • 18 m2',
      sleepingLayout: '2 slaapkamers met een stapelbed',
      summary:
        'Perfect voor vrienden, familie of een klein gezelschap dat het EK veldrijden van dichtbij wil beleven. Met twee slaapkamers, een eigen keuken en privé sanitair biedt deze volledig geïsoleerde unit alles voor een comfortabel verblijf.',
      features: ['Douche, toilet en wastafel', 'Eenvoudige keuken', 'Volledig geïsoleerd'],
      images: unit730ImageSources.map((src, index) => ({ src, alt: `4 persoons unit met twee stapelbedden foto ${index + 1}` })),
    },
    {
      id: '733',
      code: '733',
      title: '4 persoons unit met stapelbed en twee persoonsbed',
      capacityLabel: '4 personen',
      pricePerNight: 320,
      dimensions: 'Type unit 733 • 18 m2',
      sleepingLayout: '2 slaapkamers met tweepersoonsbed en stapelbed',
      summary:
        'Deze comfortabele 4-persoons unit is ideaal voor gezinnen, stellen of vrienden die wat extra ruimte waarderen. Met een aparte slaapkamer met tweepersoonsbed en een slaapkamer met stapelbed, plus een eigen keuken en sanitair, geniet je van een zorgeloos verblijf tijdens het EK veldrijden.',
      features: ['Douche, toilet en wastafel', 'Eenvoudige keuken', 'Volledig geïsoleerd'],
      images: unit733ImageSources.map((src, index) => ({ src, alt: `4 persoons unit met stapelbed en tweepersoonsbed foto ${index + 1}` })),
    },
    {
      id: '900',
      code: '900',
      title: 'Drie tot vijf-persoons VIP woonunit',
      capacityLabel: '3 - 5 personen',
      pricePerNight: 400,
      dimensions: 'Type unit 900 • 22 m2',
      sleepingLayout: '2 slaapkamers geschikt voor 5 personen',
      summary:
        "Voor wie net wat meer comfort zoekt. Deze volledig geïsoleerde VIP woonunit biedt plaats aan maximaal vijf personen en combineert ruimte, privacy en gemak. De ideale uitvalsbasis om overdag het EK te beleven en 's avonds comfortabel te ontspannen.",
      features: ['Douche, toilet en wastafel', 'Eenvoudige keuken', 'Volledig geïsoleerd'],
      images: unit900ImageSources.map((src, index) => ({ src, alt: `Drie tot vijf-persoons VIP woonunit foto ${index + 1}` })),
    },
    {
      id: 'cabine',
      code: 'cabine',
      title: '2 persoons compartiment in 8 persoons slaapwagen',
      capacityLabel: '2 personen',
      pricePerNight: 90,
      dimensions: 'Compartiment • 5 m2',
      sleepingLayout: '4 slaapkamers met een stapelbed',
      summary:
        'Een compacte en budgetvriendelijke keuze voor twee personen. Dit 2-persoons compartiment bevindt zich in een volledig geïsoleerde 8-persoons slaapwagen en biedt een comfortabele plek om te overnachten na een dag vol veldritactie.',
      features: ['Douche, toilet en wastafel', 'Volledig geïsoleerd', 'Compact en budgetvriendelijk'],
      images: unit730CabinImageSources.map((src, index) => ({ src, alt: `2 persoons compartiment in slaapwagen foto ${index + 1}` })),
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
      sleepingLayout: '1 bedroom with bunk bed',
      summary:
        'Compact, comfortable and fully equipped. This 2-person unit offers everything you need for a relaxed stay during the European Cyclo-cross Championships. After a day at the course, you can unwind in a warm, fully insulated unit with private sanitary facilities and a kitchen.',
      features: ['Shower, toilet and washbasin', 'Simple kitchen', 'Fully insulated'],
      images: unit420ImageSources.map((src, index) => ({ src, alt: `2 person unit with bunk bed photo ${index + 1}` })),
    },
    {
      id: '660',
      code: '660',
      title: '2 person unit with twin beds',
      capacityLabel: '2 people',
      pricePerNight: 170,
      dimensions: 'Unit type 660 • 16 m2',
      sleepingLayout: '1 bedroom with two single beds',
      summary:
        'Compact, comfortable and fully equipped. This 2-person unit offers everything you need for a relaxed stay during the European Cyclo-cross Championships. After a day at the course, you can unwind in a warm, fully insulated unit with private sanitary facilities and a kitchen.',
      features: ['Shower, toilet and washbasin', 'Simple kitchen', 'Fully insulated'],
      images: unit660ImageSources.map((src, index) => ({ src, alt: `2 person unit with twin beds photo ${index + 1}` })),
    },
    {
      id: '730',
      code: '730',
      title: '4 person unit with two bunk beds',
      capacityLabel: '4 people',
      pricePerNight: 300,
      dimensions: 'Unit type 730 • 18 m2',
      sleepingLayout: '2 bedrooms with one bunk bed each',
      summary:
        'Perfect for friends, family or a small group that wants to experience the European Cyclo-cross Championships up close. With two bedrooms, a private kitchen and private sanitary facilities, this fully insulated unit offers everything you need for a comfortable stay.',
      features: ['Shower, toilet and washbasin', 'Simple kitchen', 'Fully insulated'],
      images: unit730ImageSources.map((src, index) => ({ src, alt: `4 person unit with two bunk beds photo ${index + 1}` })),
    },
    {
      id: '733',
      code: '733',
      title: '4 person unit with bunk bed and double bed',
      capacityLabel: '4 people',
      pricePerNight: 320,
      dimensions: 'Unit type 733 • 18 m2',
      sleepingLayout: '2 bedrooms with a double bed and a bunk bed',
      summary:
        'This comfortable 4-person unit is ideal for families, couples or friends who appreciate a bit of extra space. With a separate bedroom with a double bed and a bedroom with a bunk bed, plus a private kitchen and sanitary facilities, you can enjoy a carefree stay during the European Cyclo-cross Championships.',
      features: ['Shower, toilet and washbasin', 'Simple kitchen', 'Fully insulated'],
      images: unit733ImageSources.map((src, index) => ({ src, alt: `4 person unit with bunk bed and double bed photo ${index + 1}` })),
    },
    {
      id: '900',
      code: '900',
      title: 'Three to five-person VIP accommodation unit',
      capacityLabel: '3 - 5 people',
      pricePerNight: 400,
      dimensions: 'Unit type 900 • 22 m2',
      sleepingLayout: '2 bedrooms suitable for 5 people',
      summary:
        'For those looking for just a little more comfort. This fully insulated VIP accommodation unit sleeps up to five people and combines space, privacy and convenience. The ideal base to enjoy the championships during the day and relax in comfort in the evening.',
      features: ['Shower, toilet and washbasin', 'Simple kitchen', 'Fully insulated'],
      images: unit900ImageSources.map((src, index) => ({ src, alt: `Three to five-person VIP accommodation unit photo ${index + 1}` })),
    },
    {
      id: 'cabine',
      code: 'cabine',
      title: '2 person compartment in 8 person sleeper wagon',
      capacityLabel: '2 people',
      pricePerNight: 90,
      dimensions: 'Compartment • 5 m2',
      sleepingLayout: '4 bedrooms with one bunk bed',
      summary:
        'A compact and budget-friendly option for two people. This 2-person compartment is located inside a fully insulated 8-person sleeper wagon and offers a comfortable place to stay after a day full of cyclo-cross action.',
      features: ['Shower, toilet and washbasin', 'Fully insulated', 'Compact and budget-friendly'],
      images: unit730CabinImageSources.map((src, index) => ({ src, alt: `2 person compartment in sleeper wagon photo ${index + 1}` })),
    },
  ],
};

const locationHighlightsByLocale = {
  nl: [
    {
      title: 'Dicht bij de cross',
      description:
        'CrossVillage ligt op slechts 6 minuten rijden van het Bergherbos. Daardoor combineer je de sfeer van het EK veldrijden met het comfort van een rustige en goed bereikbare accommodatie.',
    },
    {
      title: 'Plug-and-play voorzieningen',
      description:
        'De pop-up camping werkt met vaste stroom- en watervoorzieningen, zodat alle units direct functioneel en comfortabel inzetbaar zijn.',
    },
    {
      title: 'Een vliegende start van je EK-weekend',
      description:
        'Na boeking volgt heldere informatie over check-in, parkeren en de route naar je woonunit, zodat je vrijdag of zaterdag direct goed binnenkomt.',
    },
  ],
  en: [
    {
      title: 'Close to the race',
      description:
        'CrossVillage is just a 6-minute drive from the Bergherbos. That way, you combine the atmosphere of the European Cyclo-cross Championships with the comfort of a calm and easily accessible accommodation.',
    },
    {
      title: 'Plug-and-play facilities',
      description:
        'The pop-up camping uses fixed power and water supplies, so every unit is directly functional and comfortable from the moment you arrive.',
    },
    {
      title: 'A flying start to your championship weekend',
      description:
        'After booking you receive clear information about check-in, parking and the route to your accommodation unit, so you can arrive smoothly on Friday or Saturday.',
    },
  ],
} as const;

const conceptPointsByLocale = {
  nl: [
    { title: '6 min. rijden', description: 'naar het EK-parcours in Zeddam' },
    { title: 'Altijd warm', description: 'volledig geïsoleerd voor koude novembernachten' },
    { title: 'Eigen sanitair', description: 'geen nachtelijke wandelingen naar een toiletgebouw' },
  ],
  en: [
    { title: '6 min. drive', description: 'to the European Championship course in Zeddam' },
    { title: 'Always warm', description: 'fully insulated for cold November nights' },
    { title: 'Private sanitary facilities', description: 'no late-night walks to a toilet block' },
  ],
} as const;

const faqItemsByLocale = {
  nl: [
    {
      question: 'Wat is Cross Village Zeddam en wanneer is het geopend?',
      answer:
        'Cross Village Zeddam is een tijdelijke pop-up camping met comfortabele woonunits, speciaal opgezet voor de bezoekers van het EK Veldrijden in Zeddam. De camping is geopend van donderdag 5 november tot en met maandag 9 november. Zo mis je geen seconde van het wielerspektakel!',
    },
    {
      question: 'Waar ligt de camping en hoe kom ik bij het EK-parcours?',
      answer:
        'Onze camping is gelegen in Zeddam. Het grote voordeel? Je zit super dichtbij de actie! De camping ligt op 9 minuten van het officiele wedstrijdparcours.',
    },
    {
      question: 'Welke verschillende woonunits kan ik boeken?',
      answer:
        'We hebben tijdelijke woonunits voor elk type gezelschap, varierend van 2-persoons units met losse bedden of een stapelbed tot ruime 4- of 5-persoons (VIP) units. Ook bieden we voordelige 2-persoons compartimenten aan in een grotere slaapwagen. Alle actuele prijzen (inclusief btw) en types vind je op onze boekingspagina.',
    },
    {
      question: 'Zijn de units voorzien van stroom, verwarming en eigen sanitair?',
      answer:
        'Ja! Het is begin november, dus we zorgen dat je er warm bij zit. Al onze typen woonunits (Type 420, 660, 730, 733 en 900) zijn uitgerust met stroom, verwarming en een eigen badkamer (douche en toilet) in de unit. Let op: kies je voor het budgetvriendelijke 2-persoons compartiment in de slaapwagen? Dan maak je gebruik van de centrale sanitaire voorzieningen in de wagen.',
    },
    {
      question: 'Hoe groot zijn de bedden en moet ik zelf bedlinnen en handdoeken meenemen?',
      answer:
        'Een 1-persoonsbed heeft de afmetingen 80 x 200 en een 2-persoonsbed heeft de afmetingen 140 x 200. We vragen je om zelf een slaapzak of dekbed, hoeslaken, kussensloop en handdoeken mee te nemen. De matrassen (en kussens) zijn uiteraard wel aanwezig.',
    },
    {
      question: 'Hoe werkt het in- en uitchecken?',
      answer:
        'Je bent vanaf donderdag 5 november welkom om vanaf 10.00 uur in te checken en je unit te betrekken. Kom je op vrijdag of zaterdag aan? Geen probleem, de incheckbalie is flexibel geopend. Op de maandag na het EK dien je uiterlijk om 11.00 uur uit te checken, zodat ons team de units weer kan ontmantelen.',
    },
    {
      question: 'Waar kan ik mijn auto parkeren?',
      answer:
        'Veiligheid en een overzichtelijk terrein staan bij ons voorop. Daarom parkeren we alle auto\'s op een centraal parkeerveld op de camping en niet direct naast de woonunits. Vanaf het parkeerveld loop je in een paar stappen naar je accommodatie. Parkeren is gratis voor campinggasten.',
    },
    {
      question: 'Moet ik borg betalen voor de woonunit?',
      answer:
        'Ja, wij vragen een borg van € 100,- per persoon. Als de woonunit na afloop van het verblijf in goede staat en netjes wordt achtergelaten, ontvang je dit bedrag weer volledig terug.',
    },
    {
      question: 'Zijn huisdieren toegestaan en mag ik bezoek ontvangen?',
      answer:
        'Om het terrein en de units voor iedereen schoon en allergievrij te houden, zijn huisdieren helaas niet toegestaan. Daggasten (vrienden die ook naar het EK komen kijken) zijn overdag van harte welkom voor een gezellig drankje, maar zij mogen niet blijven overnachten. De units zijn strikt gereserveerd voor het maximaal aantal geboekte personen.',
    },
    {
      question: 'Wat zijn de regels rondom nachtrust en gezelligheid?',
      answer:
        'Gezelligheid en een biertje horen natuurlijk bij het veldrijden! Om ervoor te zorgen dat iedereen aan zijn broodnodige rust toekomt, geldt er tussen 23:00 uur en 07:00 uur absolute nachtrust op het terrein. Vanwege de brandveiligheid is open vuur, inclusief vuurkorven en (wegwerp)barbecues, streng verboden op het gehele terrein.',
    },
    {
      question: 'Is er bestek en kookgerei aanwezig in de woonunit?',
      answer:
        'In elke woonunit met keuken ligt een bestekset voor je klaar. Er zijn standaard geen pannen en overig kookgerei aanwezig. Heb je toch een pannenset of kookgerei nodig? Neem dan gerust contact met ons op, dan regelen we dit voor je!',
    },
    {
      question: 'Waarom betaal ik niet per nacht, maar voor het hele weekend?',
      answer:
        'Onze camping is een unieke pop-up locatie. Dit betekent dat we alles speciaal voor dit weekend opbouwen en inrichten om er een geweldige ervaring van te maken. Omdat het onderdak exclusief gedurende dit specifieke weekend beschikbaar is, boek en betaal je altijd voor het volledige weekend.',
    },
    {
      question: 'Is er WiFi aanwezig in de woonunit?',
      answer:
        'Nee, er is geen WiFi aanwezig. Gelukkig is het mobiele bereik (4G/5G) op ons terrein uitstekend.',
    },
  ],
  en: [
    {
      question: 'What is Cross Village Zeddam and when is it open?',
      answer:
        'Cross Village Zeddam is a temporary pop-up campsite with comfortable accommodation units, specially created for visitors to the European Cyclo-cross Championships in Zeddam. The campsite is open from Thursday 5 November through Monday 9 November, so you will not miss a second of the cycling spectacle!',
    },
    {
      question: 'Where is the campsite located and how do I get to the championship course?',
      answer:
        'Our campsite is located in Zeddam. The big advantage? You are very close to the action. The campsite is 9 minutes away from the official race course.',
    },
    {
      question: 'Which different accommodation units can I book?',
      answer:
        'We offer temporary accommodation units for every type of group, ranging from 2-person units with twin beds or a bunk bed to spacious 4- or 5-person VIP units. We also offer affordable 2-person compartments in a larger sleeper wagon. You can find all current prices, including VAT, and available types on our booking page.',
    },
    {
      question: 'Do the units include electricity, heating and private sanitary facilities?',
      answer:
        'Yes. It is early November, so we make sure you stay warm. All of our accommodation unit types (420, 660, 730, 733 and 900) include electricity, heating and a private bathroom with shower and toilet inside the unit. Please note: if you choose the budget-friendly 2-person compartment in the sleeper wagon, you will use the central sanitary facilities in the wagon.',
    },
    {
      question: 'How large are the beds and do I need to bring my own bed linen and towels?',
      answer:
        'A single bed measures 80 x 200 and a double bed measures 140 x 200. We ask you to bring your own sleeping bag or duvet, fitted sheet, pillowcase and towels. The mattresses and pillows are of course already provided.',
    },
    {
      question: 'How do check-in and check-out work?',
      answer:
        'You are welcome to check in and move into your unit from 10:00 on Thursday 5 November. Arriving on Friday or Saturday instead? No problem, the check-in desk will be flexibly staffed. On the Monday after the championships you must check out no later than 11:00, so our team can dismantle the units again.',
    },
    {
      question: 'Where can I park my car?',
      answer:
        'Safety and a well-organised site come first for us. That is why all cars are parked in a central parking field on the campsite and not directly next to the accommodation units. From the parking field, you can reach your accommodation in just a few steps. Parking is free for campsite guests.',
    },
    {
      question: 'Do I need to pay a deposit for the accommodation unit?',
      answer:
        'No, we do not charge a deposit in advance. We do, however, expect everyone to treat the units and inventory with proper care. If something is damaged unexpectedly, we will unfortunately have to invoice the repair costs afterwards to the main booker.',
    },
    {
      question: 'Are pets allowed and may I receive visitors?',
      answer:
        'To keep the site and the units clean and allergy-friendly for everyone, pets are unfortunately not allowed. Day visitors, such as friends who also come to watch the championships, are welcome during the day for a drink, but they may not stay overnight. The units are strictly reserved for the maximum number of booked guests.',
    },
    {
      question: 'What are the rules around quiet hours and socialising?',
      answer:
        'A good atmosphere and a beer are naturally part of cyclo-cross. To make sure everyone gets the rest they need, strict quiet hours apply on the site between 23:00 and 07:00. Because of fire safety rules, open flames, including fire baskets and disposable barbecues, are strictly forbidden anywhere on the site.',
    },
    {
      question: 'Is cutlery and cooking equipment available in the accommodation unit?',
      answer:
        'In every accommodation unit with a kitchen, a cutlery set is provided for you. Pots and other cooking utensils are not included as standard. Do you still need a pan set or cooking equipment? Feel free to contact us and we will arrange it for you.',
    },
    {
      question: 'Why do I not pay per night, but for the whole weekend?',
      answer:
        'Our campsite is a unique pop-up location. This means we specially build and prepare everything for this weekend to create a great experience. Because the accommodation is available exclusively during this specific weekend, you always book and pay for the full weekend.',
    },
    {
      question: 'Is WiFi available in the accommodation unit?',
      answer:
        'No, there is no WiFi available. Fortunately, mobile coverage (4G/5G) on our site is excellent.',
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
  const match = value.match(/\d+(?:\s*-\s*\d+)?/);

  return match ? match[0].replace(/\s+/g, '') : null;
}
