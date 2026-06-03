import { ArrowRight, ChevronDown, Flame, Footprints, MapPinned, ShowerHead, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { SeoHead } from '@/components/SeoHead';
import { Button } from '@/components/ui/button';
import { bookingAvailabilityQueryOptions } from '@/lib/api';
import { conceptPoints, faqItems, getCapacityCount, locationHighlights, lodgeOffers } from '@/lib/velo-village';

function CapacityInline({ label }: { label: string }) {
  const capacity = getCapacityCount(label);

  if (capacity === null) {
    return <span>{label}</span>;
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <Users className="size-4" />
      <span>{capacity}</span>
    </span>
  );
}

export function HomePage() {
  const availabilityQuery = useQuery(bookingAvailabilityQueryOptions());
  const availability = availabilityQuery.data ?? [];

  return (
    <>
      <SeoHead
        title="VeloVillage Zeddam | Pop-up camping voor het EK Veldrijden"
        description="Mobile-first pop-up campingwebsite voor VeloVillage in Zeddam. Comfortabele woonunits dicht bij het EK Veldrijden-parcours, met warme bookingflow en beperkte beschikbaarheid per type."
        canonicalPath="/"
      />

      <div className="space-y-5">
        <section
          className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.24)]"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(19,42,28,0.72) 0%, rgba(33,54,47,0.52) 42%, rgba(51,66,70,0.34) 100%), url('https://images.unsplash.com/photo-1697446303480-6d4351452812?auto=format&fit=crop&w=1600&q=80')",
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        >
          <div className="max-w-3xl space-y-5 p-6 sm:p-7 lg:px-8 lg:py-12">
            <h1 className="font-display text-4xl font-extrabold uppercase leading-none tracking-[0.04em] text-white sm:text-5xl">
              Overnacht in luxe en warmte tijdens het EK Veldrijden 2026 in Zeddam.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-stone-200">
              Volledig geisoleerde en verwarmde woonunits op loopafstand van het parcours. Boek jouw verblijf voor het weekend van 6 t/m 9 november.
            </p>
            <Button asChild size="lg" className="rounded-full bg-[#76BD23] text-[#10311c] hover:bg-[#6eb220]">
              <a href="#units">
                Bekijk beschikbare units
                <ArrowRight />
              </a>
            </Button>
          </div>
        </section>

        <section className="space-y-4 rounded-[2rem] border border-white/10 bg-card/80 p-6 sm:p-7">
          <article>
            <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-[0.04em] text-white">
              Modder buiten, comfort binnen
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-300">
              Veldrijden hoort koud, nat en rauw te zijn. Je verblijf niet. Overdag sta je in het Bergherbos aan de kant te schreeuwen, 's avonds trek je de modderige schoenen uit en stap je een behaaglijke, solide TotalRent unit binnen met eigen douche en keuken.
            </p>
          </article>

          <div className="grid gap-3 sm:grid-cols-3">
            <article className="rounded-[1.5rem] border border-white/10 bg-black/15 p-4">
              <Footprints className="size-5 text-[#76BD23]" />
              <p className="mt-3 text-base font-semibold text-white">{conceptPoints[0].title}</p>
              <p className="mt-2 text-sm leading-6 text-stone-300">{conceptPoints[0].description}</p>
            </article>
            <article className="rounded-[1.5rem] border border-white/10 bg-black/15 p-4">
              <Flame className="size-5 text-[#D6CAA0]" />
              <p className="mt-3 text-base font-semibold text-white">{conceptPoints[1].title}</p>
              <p className="mt-2 text-sm leading-6 text-stone-300">{conceptPoints[1].description}</p>
            </article>
            <article className="rounded-[1.5rem] border border-white/10 bg-black/15 p-4">
              <ShowerHead className="size-5 text-[#00953B]" />
              <p className="mt-3 text-base font-semibold text-white">{conceptPoints[2].title}</p>
              <p className="mt-2 text-sm leading-6 text-stone-300">{conceptPoints[2].description}</p>
            </article>
          </div>
        </section>

        <section id="units" className="rounded-[2rem] border border-white/10 bg-card/80 p-6 sm:p-7">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Het aanbod</p>
            <h2 className="font-display text-3xl font-bold uppercase tracking-[0.04em] text-white">
              Jouw TotalRent woonunit
            </h2>
            <p className="text-sm leading-7 text-stone-300">
              We presenteren de units als drie heldere premium categorieen voor deze week. Per type zijn maximaal vijf units beschikbaar binnen VeloVillage.
            </p>
          </div>

          <div className="mt-5 grid gap-3">
            {lodgeOffers.map((offer) => {
              const unitAvailability = availability.find((item) => item.unitType === offer.bookingUnitId);

              return (
                <article key={offer.title} className="rounded-[1.5rem] border border-white/10 bg-black/15 p-5">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-white">{offer.title}</h3>
                    <p className="text-sm text-stone-300">
                      <CapacityInline label={offer.capacity} />
                    </p>
                  </div>

                  <div className="mt-4 space-y-3 text-sm text-stone-300">
                    <p className="leading-6">{offer.features}</p>
                    <p className="leading-6">
                      <span className="text-stone-400">Perfect voor:</span> {offer.perfectFor}
                    </p>
                    <div className="rounded-2xl border border-dashed border-[#76BD23]/35 bg-[#1C5733]/20 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-[#D6CAA0]">Plattegrond</p>
                      <p className="mt-2 leading-6 text-stone-200">{offer.layoutHint}</p>
                    </div>
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <p className="text-sm text-stone-400">
                        {unitAvailability ? `${unitAvailability.remaining} van ${unitAvailability.stockLimit} beschikbaar` : '5 van 5 beschikbaar'}
                      </p>
                      <Button asChild className="rounded-full bg-[#76BD23] px-4 text-[#10311c] hover:bg-[#6eb220]">
                        <Link to={`/boeken?unit=${offer.bookingUnitId}`}>Kies</Link>
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section id="location" className="space-y-4 rounded-[2rem] border border-white/10 bg-card/80 p-6 sm:p-7">
          <article>
            <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Locatie & bereikbaarheid</p>
            <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-[0.04em] text-white">
              Dicht bij de cross, logisch in gebruik
            </h2>
            <p className="mt-4 text-sm leading-7 text-stone-300">
              VeloVillage is bedoeld als compacte uitvalsbasis voor een intens sportweekend. Geen grote omwegen, maar een plek waar je snel terug bent om op te warmen, te douchen en de volgende dag fris te starten.
            </p>
          </article>

          <div className="space-y-3">
            {locationHighlights.map((item) => (
              <article key={item.title} className="rounded-[1.5rem] border border-white/10 bg-black/15 p-4">
                <div className="flex items-start gap-3">
                  <MapPinned className="mt-1 size-5 text-[#00953B]" />
                  <div>
                    <p className="text-base font-semibold text-white">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-stone-300">{item.description}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="faq" className="rounded-[2rem] border border-white/10 bg-card/80 p-6 sm:p-7">
          <div className="max-w-2xl space-y-2">
            <h2 className="font-display text-3xl font-bold uppercase tracking-[0.04em] text-white">
              Veelgestelde vragen
            </h2>
          </div>

          <div className="mt-5 space-y-3">
            {faqItems.map((item) => (
              <details key={item.question} className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/15 transition open:border-[#76BD23]/35 open:bg-[#1C5733]/20">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 text-base font-semibold text-white marker:hidden">
                  <span>{item.question}</span>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-stone-200 transition group-open:rotate-180 group-open:border-[#76BD23]/35 group-open:bg-[#76BD23]/12 group-open:text-white">
                    <ChevronDown className="size-4" />
                  </span>
                </summary>
                <p className="px-4 pb-4 text-sm leading-7 text-stone-300">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}