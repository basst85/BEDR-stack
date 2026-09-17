import { ArrowRight, Bike, ChevronDown, Flame, MapPinned, ShowerHead, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { Image } from '@/components/Image';
import { SeoHead } from '@/components/SeoHead';
import { UnitImageCarousel } from '@/components/UnitImageCarousel';
import { Button } from '@/components/ui/button';
import { UnitLayoutList } from '../components/UnitLayoutList';
import { bookingAvailabilityQueryOptions, locationsQueryOptions } from '@/lib/api';
import { formatCurrency, resolvePublicAssetPath, useI18n } from '@/lib/i18n';
import { siteCopy } from '@/lib/site-copy';
import {
  getConceptPoints,
  getCapacityCount,
  getFaqItems,
  getLocationHighlights,
  getUnitTypes,
} from '@/lib/velo-village';

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
  const { locale, localizePath } = useI18n();
  const copy = siteCopy[locale].home;
  const conceptPoints = getConceptPoints(locale);
  const faqItems = getFaqItems(locale);
  const locationHighlights = getLocationHighlights(locale);
  const locationHighlightIcons = [MapPinned, ShowerHead, Bike] as const;
  const unitTypes = getUnitTypes(locale);
  const availabilityQuery = useQuery(bookingAvailabilityQueryOptions());
  const availability = availabilityQuery.data ?? [];
  const locationsQuery = useQuery(locationsQueryOptions());
  const locations = locationsQuery.data ?? [];
  const heroImageSrc = resolvePublicAssetPath('impressie.jpg');
  const addressLabel = locale === 'en' ? 'Address' : 'Adres';
  const mapButtonLabel = locale === 'en' ? 'Google Maps' : 'Google Maps';
  const primaryAddress = locations[0]?.address ?? 'Zeddamseweg 16, Kilder';
  const configuredSiteUrl = import.meta.env.VITE_SITE_URL?.replace(/\/$/, '');
  const browserOrigin = typeof window !== 'undefined' ? window.location.origin : undefined;
  const siteUrl = configuredSiteUrl ?? browserOrigin;
  const pagePath = localizePath('/');
  const pageUrl = siteUrl ? `${siteUrl}${pagePath}` : undefined;
  const logoImageSrc = resolvePublicAssetPath('logo-crossvillage.jpg');
  const logoImageUrl = siteUrl ? new URL(logoImageSrc, siteUrl).toString() : undefined;
  const homeJsonLd: Array<Record<string, unknown>> = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: copy.seoTitle,
      description: copy.seoDescription,
      url: pageUrl,
      inLanguage: locale === 'en' ? 'en-GB' : 'nl-NL',
      ...(logoImageUrl ? { image: logoImageUrl } : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Campground',
      name: 'CrossVillage Zeddam',
      description: copy.seoDescription,
      url: pageUrl,
      ...(logoImageUrl ? { image: logoImageUrl } : {}),
      address: {
        '@type': 'PostalAddress',
        streetAddress: primaryAddress,
        addressRegion: 'Gelderland',
        addressCountry: 'NL',
      },
      amenityFeature: conceptPoints.map((point) => ({
        '@type': 'LocationFeatureSpecification',
        name: point.title,
        value: true,
        description: point.description,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    },
  ];

  const renderFaqAnswer = (answer: string) => {
    const marker = 'Let op:';
    const markerIndex = answer.indexOf(marker);

    if (markerIndex === -1) {
      return answer;
    }

    return (
      <>
        {answer.slice(0, markerIndex)}
        <strong className="font-semibold text-white">{marker}</strong>
        {answer.slice(markerIndex + marker.length)}
      </>
    );
  };

  return (
    <>
      <SeoHead
        title={copy.seoTitle}
        description={copy.seoDescription}
        canonicalPath={localizePath('/')}
        jsonLd={homeJsonLd}
      />

      <div className="space-y-5">
        <section
          className="relative overflow-hidden rounded-[2rem] border border-white/10"
        >
          <Image
            src={heroImageSrc}
            alt={copy.heroAlt}
            width={1600}
            height={900}
            quality={80}
            fill
            sizes="100vw"
            className="scale-[1.02] object-cover brightness-[0.62] contrast-[0.92] saturate-[0.82]"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(214,202,160,0.12),transparent_24%),linear-gradient(90deg,rgba(8,14,11,0.82)_0%,rgba(14,24,19,0.62)_34%,rgba(26,38,35,0.28)_66%,rgba(24,34,31,0.14)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,12,10,0.14)_0%,rgba(10,16,14,0.06)_28%,rgba(7,12,10,0.24)_100%)]" />
          <div className="relative z-10 p-5 sm:p-7 lg:px-8 lg:py-12">
            <div className="max-w-3xl">
              <h1 className="font-display text-3xl font-extrabold uppercase leading-none tracking-[0.04em] text-white sm:text-5xl">
                {copy.heroTitle}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-stone-100/92 sm:text-lg">
                {copy.heroDescription}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-stone-200/90">
                <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5">{copy.heroTags[0]}</span>
                <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5">{copy.heroTags[1]}</span>
              </div>
              <Button asChild size="lg" className="mt-6 rounded-full bg-[#76BD23] text-[#10311c] hover:bg-[#6eb220]">
                <a href={localizePath('/#units')}>
                  {copy.heroCta}
                  <ArrowRight />
                </a>
              </Button>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-[2rem] border border-white/10 bg-card/80 p-6 sm:p-7">
          <article>
            <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-[0.04em] text-white">
              {copy.introTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-300">
              {copy.introBody}
            </p>
          </article>

          <div className="grid gap-3 sm:grid-cols-3">
            <article className="rounded-[1.5rem] border border-white/10 bg-black/15 p-4">
              <Bike className="size-5 text-[#76BD23]" />
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
            <h2 className="font-display text-3xl font-bold uppercase tracking-[0.04em] text-white">
              {copy.unitsTitle}
            </h2>
            <p className="text-sm leading-7 text-stone-300">
              {copy.unitsBody}
            </p>
          </div>

          <div className="mt-5 grid gap-3 xl:grid-cols-2">
            {unitTypes.map((unit) => {
              const unitAvailability = availability.find((item) => item.unitType === unit.id);

              return (
                <article key={unit.id} className="flex h-full flex-col rounded-[1.5rem] border border-white/10 bg-black/15 p-5">
                  <UnitImageCarousel images={unit.images} title={unit.title} />

                  <div className="mt-4 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white">{unit.title}</h3>
                        <p className="mt-1 text-sm text-stone-300">
                          <CapacityInline label={unit.capacityLabel} />
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-2xl font-bold leading-none text-[#F0E7C9]">{formatCurrency(unitAvailability?.pricePerNight ?? unit.pricePerNight, locale)}</p>
                        <p className="mt-1 text-xs text-stone-400">{copy.perNight}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-1 flex-col gap-3 text-sm text-stone-300">
                    <p className="leading-6">{unit.summary}</p>
                    <div className="mt-auto space-y-3">
                      <div className="rounded-2xl border border-dashed border-[#76BD23]/35 bg-[#1C5733]/20 p-4">
                        <UnitLayoutList
                          title={copy.layoutLabel}
                          dimensions={unit.dimensions}
                          sleepingLayout={unit.sleepingLayout}
                          features={unit.features}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3 pt-1">
                        <p className="text-sm text-stone-400">
                          {unitAvailability
                            ? copy.availabilityLabel(unitAvailability.remaining)
                            : copy.availabilityLoading}
                        </p>
                        <Button asChild className="rounded-full bg-[#76BD23] px-4 text-[#10311c] hover:bg-[#6eb220]">
                          <Link to={localizePath(`/boeken?unit=${unit.id}`)}>{copy.choose}</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section id="location" className="space-y-4 rounded-[2rem] border border-white/10 bg-card/80 p-6 sm:p-7">
          <article>
            <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-[0.04em] text-white">
              {copy.locationTitle}
            </h2>
            <p className="mt-4 text-sm leading-7 text-stone-300">
              {copy.locationBody}
            </p>
          </article>

          {locationsQuery.isLoading ? null : (
            <div className="space-y-4">
              {locations.map((location) => {
                const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`;
                const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(location.address)}&output=embed`;

                return (
                  <article
                    key={location.id}
                    className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/15"
                  >
                    <div className="grid gap-0 lg:grid-cols-[0.95fr_1.25fr]">
                      <div className="flex flex-col justify-between gap-4 p-5 sm:p-6">
                        <div>
                          <p className="text-xs text-[#D6CAA0]">{location.name}</p>
                          <p className="mt-4 text-sm font-semibold text-white">{addressLabel}</p>
                          <p className="mt-2 text-sm leading-7 text-stone-300">{location.address}</p>
                        </div>

                        <a
                          href={googleMapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex w-fit items-center rounded-full border border-[#76BD23]/35 bg-[#1C5733]/20 px-4 py-2 text-sm font-semibold text-[#D9F0B6] transition hover:border-[#76BD23]/60 hover:bg-[#1C5733]/30 hover:text-white"
                        >
                          {mapButtonLabel}
                        </a>
                      </div>

                      <div className="min-h-[280px] border-t border-white/10 lg:border-l lg:border-t-0">
                        <iframe
                          title={`${location.name} map`}
                          src={mapEmbedUrl}
                          className="h-full min-h-[280px] w-full"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="space-y-3">
            {locationHighlights.map((item, index) => {
              const Icon = locationHighlightIcons[index] ?? MapPinned;

              return (
              <article key={item.title} className="rounded-[1.5rem] border border-white/10 bg-black/15 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center text-[#00953B]">
                    <Icon className="size-6" />
                  </span>
                  <div>
                    <p className="text-base font-semibold text-white">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-stone-300">{item.description}</p>
                  </div>
                </div>
              </article>
              );
            })}
          </div>
        </section>

        <section id="faq" className="rounded-[2rem] border border-white/10 bg-card/80 p-6 sm:p-7">
          <div className="max-w-2xl space-y-2">
            <h2 className="font-display text-3xl font-bold uppercase tracking-[0.04em] text-white">
              {copy.faqTitle}
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
                <p className="px-4 pb-4 text-sm leading-7 text-stone-300">{renderFaqAnswer(item.answer)}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
