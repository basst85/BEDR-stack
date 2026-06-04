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
  stepLabels: [string, string, string];
  pageTitle: string;
  successEyebrow: string;
  successTitle: string;
  successMessage: (confirmationCode: string, remaining: number) => string;
  backHome: string;
  makeAnother: string;
  step1Title: string;
  step1Description: string;
  selected: string;
  perNight: string;
  layoutLabel: string;
  availabilityLoading: string;
  availabilityLabel: (remaining: number) => string;
  unitTypeLabel: string;
  step2Title: string;
  step2Description: string;
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
    invalidDates: string;
    checkInRange: string;
    checkOutRange: string;
    checkOutAfterCheckIn: string;
  };
  stayDurationLabel: string;
  stayDurationDescription: (checkIn: string, checkOut: string, nightLabel: string) => string;
  step3Title: string;
  step3Description: string;
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

type SiteCopy = {
  home: HomeCopy;
  booking: BookingCopy;
  terms: TermsCopy;
};

export const siteCopy: Record<Locale, SiteCopy> = {
  nl: {
    home: {
      seoTitle: 'CrossVillage Zeddam | Pop-up camping voor het EK Veldrijden',
      seoDescription:
        'Mobile-first pop-up campingwebsite voor CrossVillage in Zeddam. Comfortabele woonunits dicht bij het EK Veldrijden-parcours, met warme bookingflow en beperkte beschikbaarheid per type.',
      heroAlt: 'Warme eventcamping vlak bij het veldritparcours',
      heroTitle: 'Overnacht in luxe en warmte tijdens het EK Veldrijden 2026 in Zeddam.',
      heroDescription:
        'Volledig geisoleerde en verwarmde woonunits op loopafstand van het parcours. Boek jouw verblijf tussen donderdag 5 november en dinsdag 10 november.',
      heroTags: ['5 nachten mogelijk', 'Loopafstand van het parcours'],
      heroCta: 'Bekijk beschikbare units',
      introTitle: 'Modder buiten, comfort binnen',
      introBody:
        "Veldrijden hoort koud, nat en rauw te zijn. Je verblijf niet. Overdag sta je in het Bergherbos aan de kant te schreeuwen, 's avonds trek je de modderige schoenen uit en stap je een behaaglijke, solide TotalRent unit binnen met eigen douche en keuken.",
      unitsTitle: 'Jouw woonunit',
      unitsBody:
        'Kies uit verschillende types comfortabele, verwarmde units. Het beschikbaar aantal per type is beperkt, dus wacht niet te lang met boeken.',
      locationTitle: 'Dicht bij de cross, logisch in gebruik',
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
      seoTitle: 'Boeken | CrossVillage Zeddam',
      seoDescription:
        'Afleidingsvrije booking funnel voor CrossVillage: kies je woonunit, vul je gegevens in en leg je EK-verblijf vast.',
      stepLabels: ['Unit', 'Gegevens', 'Betalen'],
      pageTitle: 'Reserveer je warme EK-basis in 3 stappen',
      successEyebrow: 'Aanvraag ontvangen',
      successTitle: 'Je aanvraag staat klaar voor opvolging.',
      successMessage: (confirmationCode, remaining) =>
        `Referentie ${confirmationCode}. Deze unitsoort heeft nu nog ${remaining} exemplaren beschikbaar.`,
      backHome: 'Terug naar homepage',
      makeAnother: 'Nog een aanvraag doen',
      step1Title: '1. Kies je unittype',
      step1Description:
        'Alleen types met resterende voorraad zijn te boeken. De backend bewaakt de per type ingestelde voorraadlimiet.',
      selected: 'Geselecteerd',
      perNight: 'per nacht',
      layoutLabel: 'Indeling',
      availabilityLoading: 'Beschikbaarheid wordt geladen',
      availabilityLabel: (remaining) => `Nog ${remaining} beschikbaar`,
      unitTypeLabel: 'Type unit',
      step2Title: '2. Vul je verblijfsgegevens in',
      step2Description:
        'Houd de flow kort. Alleen de data die nodig is om de aanvraag te bevestigen en de planning rond het EK-weekend te regelen. Aankomst kan van donderdag 5 november tot en met maandag 9 november, vertrek van vrijdag 6 november tot en met dinsdag 10 november.',
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
        invalidDates: 'Vul een geldige aankomst- en vertrekdatum in.',
        checkInRange: 'Aankomst moet tussen 5 november 2026 en 9 november 2026 liggen.',
        checkOutRange: 'Vertrek moet tussen 6 november 2026 en 10 november 2026 liggen.',
        checkOutAfterCheckIn: 'Vertrek moet na aankomst liggen.',
      },
      stayDurationLabel: 'Verblijfsduur',
      stayDurationDescription: (checkIn, checkOut, nightLabel) =>
        `Bij aankomst op ${checkIn} en vertrek op ${checkOut} verblijf je ${nightLabel}.`,
      step3Title: '3. Controleer en verstuur',
      step3Description:
        'Na bevestiging ontvang je instructies voor betaling per bankoverschrijving. De reservering is pas definitief na ontvangst van de betaling.',
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
      seoTitle: 'Voorwaarden | CrossVillage Zeddam',
      seoDescription:
        'Compacte voorwaardenpagina voor de CrossVillage booking funnel, inclusief voorraadlimiet per unitsoort.',
      eyebrow: 'Algemene voorwaarden',
      title: 'Compact, duidelijk en afgestemd op een korte eventfunnel',
      intro:
        'Voor CrossVillage is dit bewust een lichte subpagina. De voorwaarden ondersteunen de conversie, zonder de gebruiker uit de boekingsflow te trekken.',
      backToBooking: 'Terug naar boeken',
      backToHome: 'Naar homepage',
      sections: [
        {
          title: '1. Reserveringsaanvraag',
          body:
            'Een reservering via deze funnel geldt als aanvraag. CrossVillage bevestigt de aanvraag pas nadat beschikbaarheid, verblijfsperiode en operationele haalbaarheid zijn gecontroleerd.',
        },
        {
          title: '2. Voorraadlimiet',
          body:
            'Per unitsoort wordt het beschikbare aantal via environment variables ingesteld. Zodra die backendlimiet is bereikt, kan er voor dat type geen nieuwe aanvraag meer worden ingediend.',
        },
        {
          title: '3. Gebruik van de units',
          body:
            'De units zijn tijdelijke woonvoorzieningen voor het EK-weekend en dienen zorgvuldig te worden gebruikt. Bezetting mag het opgegeven maximum van het gekozen type niet overschrijden.',
        },
        {
          title: '4. Wijzigingen en annulering',
          body:
            'Definitieve wijzigings- en annuleringsregels worden meegeleverd in de bevestiging. Deze pagina toont de compacte productversie van de voorwaarden voor de funnel.',
        },
        {
          title: '5. Betaling',
          body:
            'De huidige flow registreert aanvragen. In een vervolgfase kan deze stap gekoppeld worden aan directe online betaling of een factuurtraject.',
        },
      ],
    },
  },
  en: {
    home: {
      seoTitle: 'CrossVillage Zeddam | Pop-up camping for the European Cyclo-cross Championships',
      seoDescription:
        'Mobile-first pop-up camping website for CrossVillage in Zeddam. Comfortable accommodation units close to the European Cyclo-cross Championships course, with a warm booking flow and limited availability per unit type.',
      heroAlt: 'Warm event camping close to the cyclo-cross course',
      heroTitle: 'Stay in warmth and comfort during the 2026 European Cyclo-cross Championships in Zeddam.',
      heroDescription:
        'Fully insulated and heated accommodation units within walking distance of the course. Book your stay between Thursday 5 November and Tuesday 10 November.',
      heroTags: ['Up to 5 nights', 'Walking distance from the course'],
      heroCta: 'View available units',
      introTitle: 'Mud outside, comfort inside',
      introBody:
        "Cyclo-cross should feel cold, wet and raw. Your stay should not. During the day you cheer at the Bergherbos course, and in the evening you kick off your muddy shoes and step into a warm, solid TotalRent unit with its own shower and kitchen.",
      unitsTitle: 'Your accommodation unit',
      unitsBody:
        'Choose from several types of comfortable, heated units. Availability per type is limited, so do not wait too long before booking.',
      locationTitle: 'Close to the race, practical to use',
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
      seoTitle: 'Book | CrossVillage Zeddam',
      seoDescription:
        'Distraction-free booking funnel for CrossVillage: choose your accommodation unit, enter your details and secure your championship stay.',
      stepLabels: ['Unit', 'Details', 'Payment'],
      pageTitle: 'Reserve your warm championship base in 3 steps',
      successEyebrow: 'Request received',
      successTitle: 'Your request is ready for follow-up.',
      successMessage: (confirmationCode, remaining) =>
        `Reference ${confirmationCode}. This unit type now has ${remaining} units remaining.`,
      backHome: 'Back to homepage',
      makeAnother: 'Submit another request',
      step1Title: '1. Choose your unit type',
      step1Description:
        'Only unit types with remaining stock can be booked. The backend enforces the configured stock limit per type.',
      selected: 'Selected',
      perNight: 'per night',
      layoutLabel: 'Layout',
      availabilityLoading: 'Loading availability',
      availabilityLabel: (remaining) => `${remaining} still available`,
      unitTypeLabel: 'Unit type',
      step2Title: '2. Enter your stay details',
      step2Description:
        'Keep the flow short. Only the information needed to confirm the request and coordinate the championship weekend planning. Arrival is possible from Thursday 5 November through Monday 9 November, departure from Friday 6 November through Tuesday 10 November.',
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
        invalidDates: 'Enter a valid arrival and departure date.',
        checkInRange: 'Arrival must be between 5 November 2026 and 9 November 2026.',
        checkOutRange: 'Departure must be between 6 November 2026 and 10 November 2026.',
        checkOutAfterCheckIn: 'Departure must be after arrival.',
      },
      stayDurationLabel: 'Length of stay',
      stayDurationDescription: (checkIn, checkOut, nightLabel) =>
        `With arrival on ${checkIn} and departure on ${checkOut}, your stay lasts ${nightLabel}.`,
      step3Title: '3. Review and submit',
      step3Description:
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
      seoTitle: 'Terms | CrossVillage Zeddam',
      seoDescription:
        'Compact terms page for the CrossVillage booking funnel, including stock limits per unit type.',
      eyebrow: 'General terms',
      title: 'Compact, clear and tailored to a short event funnel',
      intro:
        'For CrossVillage this is intentionally a lightweight subpage. The terms support conversion without pulling the user out of the booking flow.',
      backToBooking: 'Back to booking',
      backToHome: 'Go to homepage',
      sections: [
        {
          title: '1. Reservation request',
          body:
            'A reservation made through this funnel counts as a request. CrossVillage only confirms the request after availability, stay period and operational feasibility have been checked.',
        },
        {
          title: '2. Stock limit',
          body:
            'The available quantity per unit type is configured through environment variables. Once that backend limit has been reached, no new request can be submitted for that type.',
        },
        {
          title: '3. Use of the units',
          body:
            'The units are temporary accommodation for the championship weekend and must be used with care. Occupancy may not exceed the stated maximum of the chosen unit type.',
        },
        {
          title: '4. Changes and cancellation',
          body:
            'Final change and cancellation rules are included with the confirmation. This page shows the compact product version of the terms for the funnel.',
        },
        {
          title: '5. Payment',
          body:
            'The current flow registers requests. In a later phase this step can be connected to direct online payment or an invoicing process.',
        },
      ],
    },
  },
};