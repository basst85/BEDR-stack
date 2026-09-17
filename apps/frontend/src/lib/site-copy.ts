import { createElement, type ReactNode } from 'react';

import type { Locale } from '@/lib/i18n';

type HomeCopy = {
  seoTitle: string;
  seoDescription: string;
  heroAlt: string;
  heroTitle: string;
  heroDescription: string;
  heroTags: [string, string];
  heroCta: string;
  introTitle: string;
  introBody: string;
  unitsTitle: string;
  unitsBody: string;
  locationTitle: string;
  locationBody: string;
  faqTitle: string;
  availabilityLoading: string;
  availabilityLabel: (remaining: number) => string;
  choose: string;
  layoutLabel: string;
  perNight: string;
};

type BookingCopy = {
  seoTitle: string;
  seoDescription: string;
  stepLabels: [string, string, string, string];
  pageTitle: string;
  successEyebrow: string;
  successTitle: string;
  successMessage: (confirmationCode: string) => ReactNode;
  backHome: string;
  makeAnother: string;
  step1Title: string;
  step1Description: string;
  personsLabel: string;
  quantityLabel: string;
  selectedUnitsTitle: string;
  selectedUnitsEmpty: string;
  priceForStayLabel: (nightLabel: string) => string;
  perNight: string;
  layoutLabel: string;
  availabilityLoading: string;
  availabilityLabel: (remaining: number) => string;
  unitTypeLabel: string;
  locationStepTitle: string;
  locationStepDescription: string;
  chooseLocationLabel: string;
  locationSelectedLabel: string;
  selectedLocationLabel: string;
  step3Title: string;
  step3Description: string;
  labels: {
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    checkIn: string;
    checkOut: string;
    notes: string;
  };
  placeholders: {
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    notes: string;
  };
  validations: {
    invalidEmail: string;
    invalidDates: string;
    checkInRange: string;
    checkOutRange: string;
    checkOutAfterCheckIn: string;
  };
  stayDurationLabel: string;
  stayDurationDescription: (checkIn: string, checkOut: string, nightLabel: string) => string;
  step4Title: string;
  step4Description: string;
  chosenUnit: string;
  totalAmount: string;
  contactPerson: string;
  email: string;
  phone: string;
  agreePrefix: string;
  agreeTerms: string;
  submitErrorFallback: string;
  previous: string;
  next: string;
  sendRequest: string;
};

type TermsCopy = {
  seoTitle: string;
  seoDescription: string;
  eyebrow: string;
  title: string;
  intro: string;
  backToBooking: string;
  backToHome: string;
  sections: Array<{
    title: string;
    body: string;
  }>;
};

type AboutCopy = {
  seoTitle: string;
  seoDescription: string;
  eyebrow: string;
  title: string;
  intro: string;
  sections: Array<{
    title: string;
    body: string;
  }>;
  closing: string;
  signature: string;
  backToBooking: string;
  backToHome: string;
};

type SiteCopy = {
  home: HomeCopy;
  booking: BookingCopy;
  terms: TermsCopy;
  about: AboutCopy;
};

export const siteCopy: Record<Locale, SiteCopy> = {
  nl: {
    home: {
      seoTitle: 'CrossVillage Zeddam | Verwarmde woonunits bij EK Veldrijden 2026',
      seoDescription:
        'Boek een verwarmde woonunit in CrossVillage Zeddam voor het EK Veldrijden 2026. Verblijf van 5 t/m 9 november op 6 minuten van het parcours, met eigen douche en keuken.',
      heroAlt: 'Warme eventcamping vlak bij het veldritparcours',
      heroTitle: 'Overnacht in warmte tijdens het EK Veldrijden 2026 in Zeddam.',
      heroDescription:
        'Volledig geisoleerde en verwarmde woonunits op slechts 6 minuten rijden van het parcours. Boek jouw verblijf van donderdag 5 november tot en met 9 november.',
      heroTags: ['5 nachten', '6 minuten rijden van het parcours'],
      heroCta: 'Bekijk beschikbare units',
      introTitle: 'Modder buiten, comfort binnen',
      introBody:
        "Veldrijden hoort koud, nat en rauw te zijn. Je accommodatie niet. Overdag beleef je de strijd in het Bergherbos van dichtbij, 's avonds kom je tot rust in een warme en comfortabele Totalrent unit met eigen douche en keuken.",
      unitsTitle: 'Kies jouw verblijf',
      unitsBody:
        'Kies het verblijf dat bij jou past. Ga voor een comfortabele, verwarmde woonunit en beleef het EK veldrijden zonder in te leveren op comfort. Het aantal beschikbare units per type is beperkt, dus wacht niet te lang met boeken.',
      locationTitle: 'Dicht bij de cross, comfortabel verblijven',
      locationBody:
        'CrossVillage is bedoeld als compacte uitvalsbasis voor een intens sportweekend. Geen grote omwegen, maar een plek waar je snel terug bent om op te warmen, te douchen en de volgende dag fris te starten.',
      faqTitle: 'Veelgestelde vragen',
      availabilityLoading: 'Beschikbaarheid wordt geladen',
      availabilityLabel: (remaining) => `Nog ${remaining} beschikbaar`,
      choose: 'Kies',
      layoutLabel: 'Indeling',
      perNight: 'per nacht',
    },
    booking: {
      seoTitle: 'Boek je woonunit | CrossVillage Zeddam',
      seoDescription:
        'Kies je unit, controleer de beschikbaarheid en vraag direct je verblijf aan voor CrossVillage Zeddam tijdens het EK Veldrijden van 5 t/m 9 november 2026.',
      stepLabels: ['Unit', 'Locatie', 'Gegevens', 'Betalen'],
      pageTitle: 'Reserveer je woonunit in 4 stappen',
      successEyebrow: 'Aanvraag ontvangen',
      successTitle: 'Je aanvraag staat klaar voor opvolging.',
      successMessage: (confirmationCode) => [
        'Boekingscode ',
        createElement('strong', { className: 'font-bold text-white', key: confirmationCode }, confirmationCode),
        '. We hebben je reservering ontvangen en nemen contact met je op voor de definitieve bevestiging.',
      ],
      backHome: 'Terug naar homepage',
      makeAnother: 'Nog een aanvraag doen',
      step1Title: '1. Kies je unittype',
      step1Description:
        'Kies per unitsoort hoeveel units je wilt reserveren.',
      personsLabel: 'Personen',
      quantityLabel: 'Aantal',
      selectedUnitsTitle: 'Gekozen units',
      selectedUnitsEmpty: 'Selecteer minimaal één unit om door te gaan naar je gegevens.',
      priceForStayLabel: () => 'Weekendprijs',
      perNight: 'per nacht',
      layoutLabel: 'Indeling',
      availabilityLoading: 'Beschikbaarheid wordt geladen',
      availabilityLabel: (remaining) => `Nog ${remaining} beschikbaar`,
      unitTypeLabel: 'Type unit',
      locationStepTitle: '2. Kies je locatie',
      locationStepDescription:
        'We hebben twee locaties in Zeddam. Kies de locatie waar je wilt verblijven.',
      chooseLocationLabel: 'Kies deze locatie',
      locationSelectedLabel: 'Geselecteerd',
      selectedLocationLabel: 'Gekozen locatie',
      step3Title: '3. Vul je verblijfsgegevens in',
      step3Description:
        'Klaar voor een geweldig EK-weekend? Je boekt bij ons een speciaal 5-daags arrangement. Ongeacht aankomst en vertrekdatum betaalt u een vaste prijs voor het hele pakket.',
      labels: {
        guestName: 'Naam',
        guestEmail: 'E-mail',
        guestPhone: 'Telefoon',
        checkIn: 'Aankomst',
        checkOut: 'Vertrek',
        notes: 'Opmerking',
      },
      placeholders: {
        guestName: 'Voor- en achternaam',
        guestEmail: 'naam@voorbeeld.nl',
        guestPhone: '06 12 34 56 78',
        notes: 'Bijvoorbeeld verwachte aankomsttijd of extra context voor de aanvraag',
      },
      validations: {
        invalidEmail: 'Vul een geldig e-mailadres in.',
        invalidDates: 'Vul een geldige aankomst- en vertrekdatum in.',
        checkInRange: 'Aankomst moet tussen 5 november 2026 en 9 november 2026 liggen.',
        checkOutRange: 'Vertrek moet tussen 6 november 2026 en 10 november 2026 liggen.',
        checkOutAfterCheckIn: 'Vertrek moet na aankomst liggen.',
      },
      stayDurationLabel: 'Verblijfsduur',
      stayDurationDescription: (checkIn, checkOut, nightLabel) =>
        `Bij aankomst op ${checkIn} en vertrek op ${checkOut} verblijf je ${nightLabel}.`,
      step4Title: '4. Controleer en verstuur',
      step4Description:
        'Na je bevestiging ontvangen wij jouw aanvraag. Wij nemen vervolgens via e-mail persoonlijk contact met je op om de boeking door te nemen en de betaalinstructies te delen. Zodra de betaling via bankoverschrijving is afgerond, is jouw warme EK-basis definitief gereserveerd.',
      chosenUnit: 'Gekozen unit',
      totalAmount: 'Totaalbedrag',
      contactPerson: 'Contactpersoon',
      email: 'E-mail',
      phone: 'Telefoon',
      agreePrefix: 'Ik ga akkoord met de',
      agreeTerms: 'algemene voorwaarden',
      submitErrorFallback: 'De reservering kon niet worden opgeslagen.',
      previous: 'Vorige',
      next: 'Volgende',
      sendRequest: 'Aanvraag versturen',
    },
    terms: {
      seoTitle: 'Algemene voorwaarden | CrossVillage Zeddam',
      seoDescription:
        'Lees de algemene voorwaarden van CrossVillage Zeddam over reservering, betaling, annulering, huisregels, aansprakelijkheid en verblijf tijdens het EK-weekend.',
      eyebrow: 'Algemene voorwaarden',
      title: 'Algemene Voorwaarden Cross Village Zeddam',
      intro:
        'Onderstaande voorwaarden zijn van toepassing op alle aanbiedingen, reserveringen en overeenkomsten met betrekking tot de accommodaties van Cross Village Zeddam.',
      backToBooking: 'Terug naar boeken',
      backToHome: 'Naar homepage',
      sections: [
        {
          title: 'Artikel 1: Definities',
          body:
            'Organisatie: Totalrent B.V., handelend onder de naam Cross Village Zeddam. Gevestigd aan de Stirlingstraat 5, 7037 DG te Beek. KVK-nummer: 84429240.\n\nGast/Hoofdboeker: De natuurlijke persoon of rechtspersoon die de overeenkomst aangaat met de Organisatie voor het huren van een accommodatie.\n\nEvenement: Het EK Veldrijden te Zeddam.\n\nVerblijfsperiode: De periode tussen 5 november en 9 november.\n\nAccommodatie/Unit: De door de Organisatie verhuurde tijdelijke woonunits (inclusief eigen sanitair en stroom, tenzij anders aangegeven, zoals bij de slaapwagencabines).',
        },
        {
          title: 'Artikel 2: Toepasselijkheid',
          body:
            'Deze algemene voorwaarden zijn van toepassing op alle aanbiedingen, reserveringen en overeenkomsten met betrekking tot alle accommodaties die door Totalrent B.V. via crossvillagezeddam.com worden aangeboden.\n\nDoor het maken van een boeking gaat de Gast akkoord met deze algemene voorwaarden.\n\nAfwijkingen van deze voorwaarden zijn slechts geldig indien deze uitdrukkelijk en schriftelijk door de Organisatie zijn bevestigd.',
        },
        {
          title: 'Artikel 3: Reservering, Prijzen en Betaling',
          body:
            'Alle vermelde prijzen op de website zijn inclusief BTW, stroom- en waterverbruik, tenzij uitdrukkelijk anders vermeld.\n\nEen reservering is pas definitief nadat de Gast het volledige boekingsbedrag (100%) heeft voldaan en hiervan een schriftelijke (e-mail) bevestiging heeft ontvangen.\n\nIndien een betaling wordt gestorneerd of niet succesvol is, vervalt de reservering automatisch en heeft de Gast geen recht op de gereserveerde accommodatie.',
        },
        {
          title: 'Artikel 4: Annulering door de Gast',
          body:
            'Gezien het tijdelijke en evenement-gebonden karakter van Cross Village Zeddam, hanteren wij de volgende annuleringsvoorwaarden:\n\nBij annulering tot 60 dagen voor de ingangsdatum van het verblijf wordt 50% van de totale reissom in rekening gebracht (u ontvangt 50% retour).\n\nBij annulering tussen 60 dagen en 30 dagen voor de ingangsdatum van het verblijf wordt 75% van de totale reissom in rekening gebracht (u ontvangt 25% retour).\n\nBij annulering binnen 30 dagen voor de ingangsdatum van het verblijf, of bij een no-show (niet komen opdagen), is de Gast 100% van de reissom verschuldigd en vindt er geen restitutie plaats.\n\nAnnuleringen dienen altijd schriftelijk (per e-mail) te worden doorgegeven. De datum van ontvangst van de e-mail geldt als annuleringsdatum.\n\nWij adviseren onze gasten om zelfstandig een kortlopende annuleringsverzekering af te sluiten.',
        },
        {
          title: 'Artikel 5: Aankomst, Verblijf en Vertrek',
          body:
            'In- en uitchecken: Inchecken is mogelijk op de aankomstdag vanaf 10.00 uur. Uitchecken dient te gebeuren op de vertrekdag uiterlijk om 11.00 uur.\n\nGebruik accommodatie: De accommodatie mag uitsluitend worden bewoond door het maximaal aantal personen dat voor de betreffende unit is aangegeven (varierend van 2 tot 5 personen, afhankelijk van het geboekte type).\n\nBezoekers: Het is niet toegestaan om zonder voorafgaande toestemming van de Organisatie derden (niet-gasten) in de units te laten overnachten.',
        },
        {
          title: 'Artikel 6: Huisregels',
          body:
            'Om het verblijf voor alle gasten en de omgeving prettig te houden, gelden op Cross Village Zeddam de volgende huisregels:\n\nNachtrust: Tussen 23:00 uur en 07:00 uur dient het stil te zijn op het terrein.\n\nVuur en veiligheid: Open vuur, vuurkorven, fakkels en (wegwerp)barbecues zijn ten strengste verboden op het gehele terrein en in de units.\n\nHuisdieren: Huisdieren zijn in de woonunits en op het terrein niet toegestaan, tenzij vooraf schriftelijk goedgekeurd door de Organisatie.\n\nParkeren: Voertuigen dienen geparkeerd te worden op de daarvoor aangewezen parkeerplaatsen en niet direct naast de woonunits, tenzij anders aangegeven door de Organisatie.\n\nBij overtreding van de huisregels behoudt de Organisatie zich het recht voor om de Gast(en) per direct de toegang tot het terrein en de accommodatie te ontzeggen, zonder recht op restitutie van de betaalde reissom.',
        },
        {
          title: 'Artikel 7: Schade en Aansprakelijkheid Gast',
          body:
            'De Organisatie brengt geen borg in rekening. Dit ontslaat de Gast echter niet van de verantwoordelijkheid om als een goed huisvader met de accommodatie om te gaan.\n\nDe Hoofdboeker is hoofdelijk aansprakelijk voor alle schade aan de woonunit, inventaris, sanitaire voorzieningen, of het terrein, veroorzaakt door het doen of nalaten van de Gast zelf of diens mede-reizigers.\n\nIndien er na vertrek schade wordt geconstateerd die niet vooraf is gemeld, zullen de reparatie- of vervangingskosten direct aan de Hoofdboeker worden gefactureerd. Deze factuur dient binnen 14 dagen te worden voldaan.',
        },
        {
          title: 'Artikel 8: Aansprakelijkheid Organisatie & Overmacht',
          body:
            'Het verblijf op Cross Village Zeddam is geheel op eigen risico. De Organisatie is niet aansprakelijk voor diefstal, verlies of beschadiging van eigendommen van de Gast, noch voor persoonlijk letsel, opgelopen tijdens het verblijf.\n\nDe Organisatie is niet aansprakelijk voor storingen in de nutsvoorzieningen (stroom en water), tenzij er sprake is van grove nalatigheid vanuit de Organisatie.\n\nOvermacht (Afgelasting Evenement): Indien het EK Veldrijden door overmacht (bijv. extreme weersomstandigheden, overheidsmaatregelen of besluiten van de evenementenorganisatie) wordt afgelast, geeft dit de Gast geen recht op kosteloze annulering van de woonunit of restitutie van de reissom, tenzij de Organisatie (Totalrent B.V.) zelf niet meer in staat is de accommodatie te leveren.',
        },
        {
          title: 'Artikel 9: Klachten en Toepasselijk Recht',
          body:
            'Eventuele klachten tijdens het verblijf dienen direct, op locatie, bij de Organisatie te worden gemeld, zodat deze de kans krijgt de klacht op te lossen.\n\nOp alle overeenkomsten gesloten met Totalrent B.V. is uitsluitend het Nederlands recht van toepassing.\n\nGeschillen zullen uitsluitend worden voorgelegd aan de bevoegde rechter in het arrondissement waar Totalrent B.V. is gevestigd.',
        },
      ],
    },
    about: {
      seoTitle: 'Over ons | CrossVillage Zeddam',
      seoDescription:
        'Lees hoe de familie Bleekman CrossVillage Zeddam startte als pop-up camping voor het EK Veldrijden 2026.',
      eyebrow: 'Over ons',
      title: 'Welkom bij onze pop-up camping',
      intro:
        'Wij zijn de familie Bleekman en we kijken er enorm naar uit om jullie te ontvangen tijdens het Europees Kampioenschap Veldrijden 2026 in het prachtige Zeddam.',
      sections: [
        {
          title: 'Hoe het allemaal begon...',
          body:
            'Toen bekend werd dat het EK Veldrijden op 7 en 8 november 2026 naar Zeddam zou komen, begon het bij ons meteen te kriebelen. Het belooft een waanzinnig sportfestijn te worden. Maar met duizenden enthousiaste wielerfans die onze kant op komen, rees al snel de vraag: waar gaat iedereen slapen?\n\nGelukkig dacht de gemeente Montferland met ons mee. Onlangs besloten zij om rondom het EK een unieke, eenmalige uitzondering te maken. Om de drukte op te vangen en het toerisme in de regio een boost te geven, mogen grondeigenaren in het buitengebied voor maximaal zes dagen een tijdelijke pop-up camping openen. Twee dagen voor de race opbouwen, het weekend zelf vieren, en de dag erna weer rustig inpakken. Toen we dat hoorden, lieten we er als familie natuurlijk geen gras over groeien!',
        },
        {
          title: 'Samen de schouders eronder',
          body:
            'En zo ontstond het initiatief voor onze pop-up camping. We besloten onze ruimte open te stellen en om te toveren tot een gezellige, praktische uitvalsbasis voor veldritfans. Omdat wij voor dat ene weekend alles uit de kast halen en de woonunits speciaal voor deze paar dagen worden opgebouwd, betaal je bij ons niet per nacht, maar boek je meteen voor het hele feestelijke weekend.\n\nGeen ingewikkelde poespas, maar gewoon een warme en gastvrije plek waar je na een dag koukleumen en juichen langs het parcours echt even kunt bijkomen.\n\nWe zijn achter de schermen druk bezig om alles tot in de puntjes voor te bereiden. Heb je er al net zoveel zin in als wij? We zien je heel graag in november!',
        },
      ],
      closing: 'Sportieve groet,',
      signature: 'De Familie Bleekman',
      backToBooking: 'Bekijk de woonunits',
      backToHome: 'Naar homepage',
    },
  },
  en: {
    home: {
      seoTitle: 'CrossVillage Zeddam | Heated units near the 2026 European Cyclo-cross Championships',
      seoDescription:
        'Book a heated accommodation unit at CrossVillage Zeddam for the 2026 European Cyclo-cross Championships. Stay from 5 to 9 November just 6 minutes from the course, with private shower and kitchen.',
      heroAlt: 'Warm event camping close to the cyclo-cross course',
      heroTitle: 'Stay in warmth during the 2026 European Cyclo-cross Championships in Zeddam.',
      heroDescription:
        'Fully insulated and heated accommodation units just 6 minutes by car from the course. Book your stay from Thursday 5 November through Monday 9 November.',
      heroTags: ['5 nights', '6-minute drive from the course'],
      heroCta: 'View available units',
      introTitle: 'Mud outside, comfort inside',
      introBody:
        "Cyclo-cross should feel cold, wet and raw. Your accommodation should not. During the day you experience the action up close in the Bergherbos, and in the evening you unwind in a warm and comfortable Totalrent unit with its own shower and kitchen.",
      unitsTitle: 'Choose your stay',
      unitsBody:
        'Choose the stay that suits you best. Go for a comfortable, heated accommodation unit and experience the European Cyclo-cross Championships without giving up comfort. Availability per unit type is limited, so do not wait too long before booking.',
      locationTitle: 'Close to the race, comfortably staying nearby',
      locationBody:
        'CrossVillage is designed as a compact base for an intense race weekend. No unnecessary detours, just a place where you can quickly warm up, shower and start the next day refreshed.',
      faqTitle: 'Frequently asked questions',
      availabilityLoading: 'Loading availability',
      availabilityLabel: (remaining) => `${remaining} still available`,
      choose: 'Choose',
      layoutLabel: 'Layout',
      perNight: 'per night',
    },
    booking: {
      seoTitle: 'Book your accommodation unit | CrossVillage Zeddam',
      seoDescription:
        'Choose your accommodation unit, check live availability and submit your stay request for CrossVillage Zeddam during the European Cyclo-cross Championships from 5 to 9 November 2026.',
      stepLabels: ['Unit', 'Location', 'Details', 'Payment'],
      pageTitle: 'Reserve your warm championship base in 4 steps',
      successEyebrow: 'Request received',
      successTitle: 'Your request is ready for follow-up.',
      successMessage: (confirmationCode) => [
        'Booking code ',
        createElement('strong', { className: 'font-bold text-white', key: confirmationCode }, confirmationCode),
        '. We received your selected units and will contact you to confirm the reservation.',
      ],
      backHome: 'Back to homepage',
      makeAnother: 'Submit another request',
      step1Title: '1. Choose your units',
      step1Description:
        'Choose how many units you want to reserve per unit type.',
      personsLabel: 'Persons',
      quantityLabel: 'Quantity',
      selectedUnitsTitle: 'Selected units',
      selectedUnitsEmpty: 'Select at least one unit to continue to your details.',
      priceForStayLabel: () => 'Weekend price',
      perNight: 'per night',
      layoutLabel: 'Layout',
      availabilityLoading: 'Loading availability',
      availabilityLabel: (remaining) => `${remaining} still available`,
      unitTypeLabel: 'Unit type',
      locationStepTitle: '2. Choose your location',
      locationStepDescription:
        'We have two locations in Zeddam. Choose the location where you want to stay.',
      chooseLocationLabel: 'Choose this location',
      locationSelectedLabel: 'Selected',
      selectedLocationLabel: 'Selected location',
      step3Title: '3. Enter your stay details',
      step3Description:
        'Fill in your contact and stay details. Arrival is possible from Thursday 5 November through Monday 9 November, departure from Friday 6 November through Tuesday 10 November.',
      labels: {
        guestName: 'Name',
        guestEmail: 'Email',
        guestPhone: 'Phone',
        checkIn: 'Arrival',
        checkOut: 'Departure',
        notes: 'Notes',
      },
      placeholders: {
        guestName: 'First and last name',
        guestEmail: 'name@example.com',
        guestPhone: '+31 6 12 34 56 78',
        notes: 'For example your expected arrival time or extra context for the request',
      },
      validations: {
        invalidEmail: 'Enter a valid email address.',
        invalidDates: 'Enter a valid arrival and departure date.',
        checkInRange: 'Arrival must be between 5 November 2026 and 9 November 2026.',
        checkOutRange: 'Departure must be between 6 November 2026 and 10 November 2026.',
        checkOutAfterCheckIn: 'Departure must be after arrival.',
      },
      stayDurationLabel: 'Length of stay',
      stayDurationDescription: (checkIn, checkOut, nightLabel) =>
        `With arrival on ${checkIn} and departure on ${checkOut}, your stay lasts ${nightLabel}.`,
      step4Title: '4. Review and submit',
      step4Description:
        'After confirmation you will receive payment instructions for bank transfer. The reservation only becomes final after the payment has been received.',
      chosenUnit: 'Selected unit',
      totalAmount: 'Total amount',
      contactPerson: 'Contact person',
      email: 'Email',
      phone: 'Phone',
      agreePrefix: 'I agree to the',
      agreeTerms: 'general terms',
      submitErrorFallback: 'The reservation request could not be saved.',
      previous: 'Previous',
      next: 'Next',
      sendRequest: 'Submit request',
    },
    terms: {
      seoTitle: 'General terms | CrossVillage Zeddam',
      seoDescription:
        'Read the general terms for CrossVillage Zeddam covering reservation, payment, cancellation, house rules, liability and your stay during the championship weekend.',
      eyebrow: 'General terms',
      title: 'General Terms Cross Village Zeddam',
      intro:
        'The terms below apply to all offers, reservations and agreements relating to the accommodations of Cross Village Zeddam.',
      backToBooking: 'Back to booking',
      backToHome: 'Go to homepage',
      sections: [
        {
          title: 'Article 1: Definitions',
          body:
            'Organisation: Totalrent B.V., trading under the name Cross Village Zeddam. Established at Stirlingstraat 5, 7037 DG in Beek. Chamber of Commerce number: 84429240.\n\nGuest/Lead Booker: The natural person or legal entity entering into the agreement with the Organisation for the rental of accommodation.\n\nEvent: The European Cyclo-cross Championships in Zeddam.\n\nStay Period: The period between 5 November and 9 November.\n\nAccommodation/Unit: The temporary accommodation units rented out by the Organisation, including private sanitary facilities and electricity unless stated otherwise, such as the sleeper wagon cabins.',
        },
        {
          title: 'Article 2: Applicability',
          body:
            'These general terms apply to all offers, reservations and agreements relating to all accommodations offered by Totalrent B.V. via crossvillagezeddam.com.\n\nBy making a booking, the Guest agrees to these general terms.\n\nAny deviation from these terms is only valid if expressly confirmed in writing by the Organisation.',
        },
        {
          title: 'Article 3: Reservation, Prices and Payment',
          body:
            'All prices listed on the website include VAT, electricity and water consumption, unless explicitly stated otherwise.\n\nA reservation only becomes final after the Guest has paid the full booking amount (100%) and has received written confirmation by email.\n\nIf a payment is reversed or unsuccessful, the reservation automatically lapses and the Guest is no longer entitled to the reserved accommodation.',
        },
        {
          title: 'Article 4: Cancellation by the Guest',
          body:
            'Given the temporary and event-related nature of Cross Village Zeddam, the following cancellation terms apply:\n\nIn case of cancellation up to 60 days before the start date of the stay, 50% of the total travel sum will be charged and 50% will be refunded.\n\nIn case of cancellation between 60 days and 30 days before the start date of the stay, 75% of the total travel sum will be charged and 25% will be refunded.\n\nIn case of cancellation within 30 days before the start date of the stay, or in case of a no-show, the Guest owes 100% of the travel sum and no refund will be made.\n\nCancellations must always be submitted in writing by email. The date on which the email is received counts as the cancellation date.\n\nWe advise our guests to take out their own short-term cancellation insurance.',
        },
        {
          title: 'Article 5: Arrival, Stay and Departure',
          body:
            'Check-in and check-out: Check-in is possible on the arrival day from 10:00. Check-out must take place no later than 11:00 on the departure day.\n\nUse of accommodation: The accommodation may only be occupied by the maximum number of persons stated for the relevant unit, ranging from 2 to 5 persons depending on the booked type.\n\nVisitors: It is not permitted to allow third parties who are not guests to stay overnight in the units without prior permission from the Organisation.',
        },
        {
          title: 'Article 6: House Rules',
          body:
            'To keep the stay pleasant for all guests and the surrounding area, the following house rules apply at Cross Village Zeddam:\n\nQuiet hours: Between 23:00 and 07:00 the site must remain quiet.\n\nFire and safety: Open fire, fire baskets, torches and disposable barbecues are strictly prohibited throughout the site and inside the units.\n\nPets: Pets are not allowed in the accommodation units or on the site unless approved in writing in advance by the Organisation.\n\nParking: Vehicles must be parked in the designated parking areas and not directly next to the accommodation units unless otherwise indicated by the Organisation.\n\nIn the event of a breach of the house rules, the Organisation reserves the right to deny the Guest or Guests immediate access to the site and accommodation without any right to a refund of the paid travel sum.',
        },
        {
          title: 'Article 7: Damage and Liability of the Guest',
          body:
            'The Organisation does not charge a deposit. This does not release the Guest from the responsibility to treat the accommodation with proper care.\n\nThe Lead Booker is jointly and severally liable for all damage to the accommodation unit, inventory, sanitary facilities or the site caused by the acts or omissions of the Guest or fellow travellers.\n\nIf damage is found after departure that was not reported in advance, the repair or replacement costs will be invoiced directly to the Lead Booker. This invoice must be paid within 14 days.',
        },
        {
          title: 'Article 8: Liability of the Organisation & Force Majeure',
          body:
            'Staying at Cross Village Zeddam is entirely at your own risk. The Organisation is not liable for theft, loss or damage to the Guest\'s property, nor for personal injury incurred during the stay.\n\nThe Organisation is not liable for interruptions in utilities such as electricity and water unless there is gross negligence on the part of the Organisation.\n\nForce majeure (event cancellation): If the European Cyclo-cross Championships are cancelled due to force majeure, such as extreme weather conditions, government measures or decisions by the event organisation, this does not entitle the Guest to cancel the accommodation free of charge or receive a refund, unless the Organisation (Totalrent B.V.) is itself no longer able to provide the accommodation.',
        },
        {
          title: 'Article 9: Complaints and Applicable Law',
          body:
            'Any complaints during the stay must be reported immediately on site to the Organisation so that it has the opportunity to resolve the complaint.\n\nAll agreements concluded with Totalrent B.V. are governed exclusively by Dutch law.\n\nDisputes will be submitted exclusively to the competent court in the district where Totalrent B.V. is established.',
        },
      ],
    },
    about: {
      seoTitle: 'About us | CrossVillage Zeddam',
      seoDescription:
        'Read how the Bleekman family started CrossVillage Zeddam as a pop-up camping concept for the 2026 European Cyclo-cross Championships.',
      eyebrow: 'About us',
      title: 'Welcome to our pop-up camping',
      intro:
        'We are the Bleekman family and we are very much looking forward to welcoming you during the 2026 European Cyclo-cross Championships in beautiful Zeddam.',
      sections: [
        {
          title: 'How it all started...',
          body:
            'When it was announced that the European Cyclo-cross Championships would come to Zeddam on 7 and 8 November 2026, we immediately felt the excitement. It promises to be an incredible sporting event. But with thousands of enthusiastic cycling fans heading our way, one question quickly came up: where is everyone going to sleep?\n\nFortunately, the municipality of Montferland thought along with us. They recently decided to make a unique one-time exception around the championship weekend. To absorb the crowds and give tourism in the region a boost, landowners in the rural area may open a temporary pop-up campsite for up to six days. Two days to build up before the race, the weekend itself to celebrate, and the day after to pack everything down again. Once we heard that, we as a family moved quickly.',
        },
        {
          title: 'Working together as a family',
          body:
            'That is how the idea for our pop-up camping was born. We decided to open up our space and turn it into a welcoming, practical base for cyclo-cross fans. Because we go all in for that one special weekend and the accommodation units are built up especially for those few days, you do not pay per night with us, but book the full festive weekend in one go.\n\nNo unnecessary fuss, just a warm and hospitable place where you can truly recover after a day of cold weather and cheering along the course.\n\nBehind the scenes we are working hard to prepare everything down to the last detail. Are you looking forward to it just as much as we are? We would love to welcome you in November.',
        },
      ],
      closing: 'Sporting regards,',
      signature: 'The Bleekman Family',
      backToBooking: 'View the accommodation units',
      backToHome: 'Go to homepage',
    },
  },
};
