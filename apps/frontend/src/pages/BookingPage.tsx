import { useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, CalendarDays, Check, LoaderCircle, Mail, MapPin, Phone, Users } from 'lucide-react';
import { getCountries, getCountryCallingCode, type CountryCode } from 'libphonenumber-js';
import { Link, useSearchParams } from 'react-router-dom';

import {
  bookingAvailabilityQueryOptions,
  locationsQueryOptions,
  queryKeys,
  submitBookingRequest,
  type BookingRequestPayload,
} from '@/lib/api';
import { formatCurrency, type Locale, useI18n } from '@/lib/i18n';
import { siteCopy } from '@/lib/site-copy';
import { getCapacityCount, getUnitTypes } from '@/lib/velo-village';
import { SeoHead } from '@/components/SeoHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UnitLayoutList } from '../components/UnitLayoutList';

const earliestCheckIn = '2026-11-05';
const latestCheckIn = '2026-11-09';
const earliestCheckOut = '2026-11-06';
const defaultCheckOut = '2026-11-10';
const latestCheckOut = '2026-11-10';

const fallbackCountryNames: Partial<Record<CountryCode, string>> = {
  AC: 'Ascension Island',
  TA: 'Tristan da Cunha',
  XK: 'Kosovo',
};

type BookingUnit = ReturnType<typeof getUnitTypes>[number];
type SelectedUnitLine = {
  unit: BookingUnit;
  quantity: number;
  lineTotal: number;
};

function parseIsoDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);

  return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
}

function isValidIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsedDate = parseIsoDate(value);

  return !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === value;
}

function compareIsoDates(left: string, right: string) {
  return parseIsoDate(left).getTime() - parseIsoDate(right).getTime();
}

function addDaysToIsoDate(value: string, days: number) {
  const date = parseIsoDate(value);

  date.setUTCDate(date.getUTCDate() + days);

  return date.toISOString().slice(0, 10);
}

function getNightCount(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) {
    return 0;
  }

  const differenceInMilliseconds = parseIsoDate(checkOut).getTime() - parseIsoDate(checkIn).getTime();
  const millisecondsPerNight = 1000 * 60 * 60 * 24;

  return Math.max(Math.floor(differenceInMilliseconds / millisecondsPerNight), 0);
}

function formatLocalizedDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parseIsoDate(value));
}

function getNightWord(locale: Locale, count: number) {
  if (locale === 'en') {
    return count === 1 ? 'night' : 'nights';
  }

  return count === 1 ? 'nacht' : 'nachten';
}

function formatInternationalPhoneNumber(countryCode: string, phoneNumber: string) {
  const normalizedLocalNumber = phoneNumber.replace(/[^\d]/g, '').replace(/^0+/, '');

  if (!normalizedLocalNumber) {
    return '';
  }

  return `${countryCode} ${normalizedLocalNumber}`;
}

function getPhoneCountryOptions(locale: Locale) {
  const displayNames = new Intl.DisplayNames([locale === 'en' ? 'en' : 'nl'], { type: 'region' });

  return getCountries()
    .map((country) => {
      const callingCode = `+${getCountryCallingCode(country)}`;
      const countryName = displayNames.of(country) ?? fallbackCountryNames[country] ?? country;

      return {
        country,
        callingCode,
        label: `${countryName} (${callingCode})`,
      };
    })
    .sort((left, right) => left.label.localeCompare(right.label));
}

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

function RequiredLabel({ children }: { children: string }) {
  return (
    <>
      {children} <span className="text-[#D6CAA0]">*</span>
    </>
  );
}

function UnitPriceDisplay({
  totalPrice,
  nightlyPrice,
  availabilityText,
  title,
}: {
  totalPrice: string;
  nightlyPrice: string;
  availabilityText?: string;
  title: string;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm-[2rem] text-[0.65rem] font-bold text-stone-400">{title}</p>
      <p className="text-xl font-bold leading-none text-[#F0E7C9] sm:text-2xl">{totalPrice}</p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-3 text-xs text-stone-400">
        <span>{nightlyPrice}</span>
        {availabilityText ? <span>{availabilityText}</span> : null}
      </div>
    </div>
  );
}

function UnitSelectionRow({
  unit,
  remaining,
  selectedQuantity,
  nightCount,
  locale,
  copy,
  onChange,
}: {
  unit: BookingUnit;
  remaining: number | undefined;
  selectedQuantity: number;
  nightCount: number;
  locale: Locale;
  copy: (typeof siteCopy)[Locale]['booking'];
  onChange: (quantity: number) => void;
}) {
  const stayLabel = `${nightCount} ${getNightWord(locale, nightCount)}`;
  const availabilityText = remaining === undefined ? copy.availabilityLoading : copy.availabilityLabel(remaining);

  return (
    <div className="flex items-start gap-3 px-4 py-4">
      <div className="min-w-0 flex-1">
        <div className="space-y-1.5">
          <p className="font-semibold text-white">{unit.title}</p>
        </div>

        <UnitLayoutList
          title={copy.layoutLabel}
          dimensions={unit.dimensions}
          sleepingLayout={unit.sleepingLayout}
          features={unit.features}
          compact
          className="mt-3"
        />

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs leading-5 text-stone-400">
          <span className="text-stone-200">
            <CapacityInline label={unit.capacityLabel} />
          </span>
          <span>{availabilityText}</span>
        </div>

        <div className="mt-3 max-w-sm">
          <UnitPriceDisplay
            title={copy.priceForStayLabel(stayLabel)}
            totalPrice={formatCurrency(unit.pricePerNight * nightCount, locale)}
            nightlyPrice={`${formatCurrency(unit.pricePerNight, locale)} ${copy.perNight}`}
          />
        </div>
      </div>

      <div className="w-24 shrink-0">
        <label className="text-[0.65rem] uppercase tracking-[0.18em] text-stone-400">{copy.quantityLabel}</label>
        <select
          value={String(selectedQuantity)}
          onChange={(event) => onChange(Number(event.target.value))}
          disabled={remaining === undefined}
          className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-[#22282a] px-3 text-base text-white outline-none transition focus:border-[#76BD23]/45 sm:text-sm"
        >
          {remaining === undefined ? (
            <option value="0" className="bg-[#22282a] text-white">...</option>
          ) : (
            Array.from({ length: remaining + 1 }, (_, index) => index).map((value) => (
              <option key={value} value={value} className="bg-[#22282a] text-white">{value}</option>
            ))
          )}
        </select>
      </div>
    </div>
  );
}

function SelectedUnitsSummary({
  title,
  lines,
  totalAmount,
  totalLabel,
  emptyLabel,
  locale,
}: {
  title: string;
  lines: SelectedUnitLine[];
  totalAmount: number;
  totalLabel: string;
  emptyLabel: string;
  locale: Locale;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/15 p-4 sm:p-5">
      <p className="text-xs uppercase font-bold text-[#D6CAA0]">{title}</p>

      {lines.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-stone-300">{emptyLabel}</p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
          <div className="divide-y divide-white/10 md:hidden">
            {lines.map((line) => (
              <div key={line.unit.id} className="space-y-3 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="font-semibold text-white">{line.unit.title}</p>
                  </div>
                  <p className="text-sm text-stone-300">{line.quantity}x</p>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-stone-400">{totalLabel}</span>
                  <span className="font-medium text-[#F0E7C9]">{formatCurrency(line.lineTotal, locale)}</span>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between gap-3 bg-white/[0.03] px-4 py-3 font-semibold text-white">
              <span>{totalLabel}</span>
              <span>{formatCurrency(totalAmount, locale)}</span>
            </div>
          </div>

          <table className="hidden w-full border-collapse text-left text-sm text-stone-200 md:table">
            <tbody>
              {lines.map((line) => (
                <tr key={line.unit.id} className="border-b border-white/10 last:border-b-0">
                  <td className="px-4 py-3 align-top text-white">
                    <div className="space-y-1.5">
                      <p>{line.unit.title}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top text-stone-300">{line.quantity}x</td>
                  <td className="px-4 py-3 text-right align-top font-medium text-[#F0E7C9]">
                    {formatCurrency(line.lineTotal, locale)}
                  </td>
                </tr>
              ))}
              <tr className="bg-white/[0.03]">
                <td className="px-4 py-3" />
                <td className="px-4 py-3 font-semibold text-white">{totalLabel}</td>
                <td className="px-4 py-3 text-right font-semibold text-white">{formatCurrency(totalAmount, locale)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function BookingPage() {
  const { locale, localizePath } = useI18n();
  const copy = siteCopy[locale].booking;
  const staticUnitTypes = getUnitTypes(locale);
  const [searchParams] = useSearchParams();
  const requestedUnit = searchParams.get('unit');
  const bookingSectionRef = useRef<HTMLElement | null>(null);
  const initialUnitId = staticUnitTypes.some((unit) => unit.id === requestedUnit) ? requestedUnit! : null;

  const [step, setStep] = useState(1);
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(staticUnitTypes.map((unit) => [unit.id, unit.id === initialUnitId ? 1 : 0])),
  );
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [guestPhoneCountryCode, setGuestPhoneCountryCode] = useState<CountryCode>('NL');
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkIn: earliestCheckIn,
    checkOut: defaultCheckOut,
    notes: '',
  });

  const queryClient = useQueryClient();
  const availabilityQuery = useQuery(bookingAvailabilityQueryOptions());
  const locationsQuery = useQuery(locationsQueryOptions());
  const locations = locationsQuery.data ?? [];
  const selectedLocation = locations.find((location) => location.id === selectedLocationId) ?? null;

  const availabilityByUnitId = useMemo(
    () => new Map((availabilityQuery.data ?? []).map((item) => [item.unitType, item])),
    [availabilityQuery.data],
  );
  const unitTypes = useMemo(
    () =>
      staticUnitTypes.map((unit) => ({
        ...unit,
        pricePerNight: availabilityByUnitId.get(unit.id)?.pricePerNight ?? unit.pricePerNight,
      })),
    [availabilityByUnitId, staticUnitTypes],
  );
  const phoneCountryOptions = useMemo(() => getPhoneCountryOptions(locale), [locale]);
  const pricedNightCount = getNightCount(earliestCheckIn, defaultCheckOut);
  const nightCount = getNightCount(formData.checkIn, formData.checkOut);
  const formattedGuestPhone = formatInternationalPhoneNumber(`+${getCountryCallingCode(guestPhoneCountryCode)}`, formData.guestPhone);
  const stepLabels = copy.stepLabels;
  const nightLabel = `${nightCount} ${getNightWord(locale, nightCount)}`;
  const unitPriceLabel = copy.priceForStayLabel(nightLabel);
  const stayStartLabel = formatLocalizedDate(formData.checkIn, locale);
  const stayDepartureLabel = formatLocalizedDate(formData.checkOut, locale);
  const trimmedGuestEmail = formData.guestEmail.trim();
  const hasEmailInput = trimmedGuestEmail.length > 0;
  const hasValidGuestEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedGuestEmail);
  const dateErrors = useMemo(() => {
    const errors: { checkIn: string | null; checkOut: string | null } = {
      checkIn: null,
      checkOut: null,
    };

    if (!isValidIsoDate(formData.checkIn)) {
      errors.checkIn = copy.validations.invalidDates;
    }

    if (!isValidIsoDate(formData.checkOut)) {
      errors.checkOut = copy.validations.invalidDates;
    }

    if (errors.checkIn || errors.checkOut) {
      return errors;
    }

    if (compareIsoDates(formData.checkIn, earliestCheckIn) < 0 || compareIsoDates(formData.checkIn, latestCheckIn) > 0) {
      errors.checkIn = copy.validations.checkInRange;
    }

    if (compareIsoDates(formData.checkOut, earliestCheckOut) < 0 || compareIsoDates(formData.checkOut, latestCheckOut) > 0) {
      errors.checkOut = copy.validations.checkOutRange;
    }

    if (!errors.checkIn && !errors.checkOut && compareIsoDates(formData.checkOut, formData.checkIn) <= 0) {
      errors.checkOut = copy.validations.checkOutAfterCheckIn;
    }

    return errors;
  }, [copy.validations, formData.checkIn, formData.checkOut]);

  const selectedUnits = useMemo(
    () =>
      unitTypes.reduce<SelectedUnitLine[]>((lines, unit) => {
        const remaining = availabilityByUnitId.get(unit.id)?.remaining;
        const requestedQuantity = selectedQuantities[unit.id] ?? 0;
        const quantity = remaining === undefined ? requestedQuantity : Math.min(requestedQuantity, remaining);

        if (quantity <= 0) {
          return lines;
        }

        lines.push({
          unit,
          quantity,
          lineTotal: unit.pricePerNight * quantity * pricedNightCount,
        });

        return lines;
      }, []),
    [availabilityByUnitId, pricedNightCount, selectedQuantities, unitTypes],
  );

  const totalStayPrice = selectedUnits.reduce((sum, line) => sum + line.lineTotal, 0);
  const selectedUnitsCount = selectedUnits.reduce((sum, line) => sum + line.quantity, 0);

  const mutation = useMutation({
    mutationFn: (payload: BookingRequestPayload) => submitBookingRequest(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.bookingAvailability() });
    },
  });

  const isLocationStepValid = selectedLocationId !== null;

  const isDetailsStepValid =
    formData.guestName.trim().length >= 2 &&
    hasValidGuestEmail &&
    formData.guestPhone.replace(/[^\d]/g, '').length >= 6 &&
    !dateErrors.checkIn &&
    !dateErrors.checkOut &&
    nightCount > 0;

  const submitReservation = async () => {
    if (!selectedLocationId) {
      return;
    }

    await mutation.mutateAsync({
      locationId: selectedLocationId,
      lines: selectedUnits.map((line) => ({
        unitType: line.unit.id,
        quantity: line.quantity,
      })),
      guestName: formData.guestName.trim(),
      guestEmail: formData.guestEmail.trim(),
      guestPhone: formattedGuestPhone,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      notes: formData.notes.trim(),
    });
  };

  const goToStep = (getNextStep: (current: number) => number) => {
    setStep((current) => {
      const nextStep = getNextStep(current);

      if (nextStep !== current) {
        window.requestAnimationFrame(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }

      return nextStep;
    });
  };

  return (
    <>
      <SeoHead
        title={copy.seoTitle}
        description={copy.seoDescription}
        canonicalPath={localizePath('/boeken')}
      />

      <section ref={bookingSectionRef} className="rounded-[2rem] border border-white/10 bg-card/80 p-5 sm:p-6">
        <article>
          <div className="flex flex-col gap-4 border-b border-white/8 pb-5">
            <div className="space-y-2">
              <div>
                <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-[0.04em] text-white">
                  {copy.pageTitle}
                </h1>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {stepLabels.map((label, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === step;
                const isDone = stepNumber < step;

                return (
                  <div
                    key={label}
                    className={`flex min-w-fit items-center gap-2.5 rounded-full border px-4 py-2 ${
                      isActive ? 'border-white/25 bg-white/5' : 'border-white/8 bg-black/15'
                    }`}
                  >
                    <span
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isDone
                          ? 'bg-[#76BD23] text-[#10311c]'
                          : isActive
                            ? 'border-2 border-[#76BD23] text-[#76BD23]'
                            : 'border border-white/20 text-stone-500'
                      }`}
                    >
                      <span className="sr-only">{locale === 'en' ? 'Step' : 'Stap'} {stepNumber}: </span>
                      {isDone ? <Check className="size-3.5" /> : stepNumber}
                    </span>
                    <span className={`font-medium ${isActive ? 'text-white' : isDone ? 'text-stone-200' : 'text-stone-500'}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {mutation.isSuccess ? (
            <div className="mt-6 rounded-[1.5rem] border border-[#00953B]/35 bg-[#1C5733]/20 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-[#D6CAA0]">{copy.successEyebrow}</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">{copy.successTitle}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-200">
                {copy.successMessage(mutation.data.confirmationCode)}
              </p>
              <div className="mt-5 max-w-3xl">
                <SelectedUnitsSummary
                  title={copy.selectedUnitsTitle}
                  lines={mutation.data.lines.map((line) => {
                    const unit = unitTypes.find((item) => item.id === line.unitType) ?? unitTypes[0];

                    return {
                      unit,
                      quantity: line.quantity,
                      lineTotal: unit.pricePerNight * line.quantity * pricedNightCount,
                    };
                  })}
                  totalAmount={mutation.data.lines.reduce((sum, line) => {
                    const unit = unitTypes.find((item) => item.id === line.unitType) ?? unitTypes[0];

                    return sum + unit.pricePerNight * line.quantity * pricedNightCount;
                  }, 0)}
                  totalLabel={copy.totalAmount}
                  emptyLabel={copy.selectedUnitsEmpty}
                  locale={locale}
                />
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="rounded-full bg-[#76BD23] text-[#10311c] hover:bg-[#6eb220]">
                  <Link to={localizePath('/')}>{copy.backHome}</Link>
                </Button>
              </div>
            </div>
          ) : null}

          {!mutation.isSuccess ? (
            <div className="mt-6 space-y-6">
              {step === 1 ? (
                <div id="unit-selector" className="scroll-mt-6 space-y-5">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-white">{copy.step1Title}</h2>
                    <p className="text-sm leading-7 text-stone-300">
                      {copy.step1Description}
                    </p>
                  </div>

                  <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/15 md:hidden">
                    {unitTypes.map((unit) => {
                      const availability = availabilityByUnitId.get(unit.id);
                      const remaining = availability?.remaining;
                      const selectedQuantity = remaining === undefined
                        ? selectedQuantities[unit.id] ?? 0
                        : Math.min(selectedQuantities[unit.id] ?? 0, remaining);

                      return (
                        <div key={unit.id} className="border-t border-white/10 first:border-t-0">
                          <UnitSelectionRow
                            unit={unit}
                            remaining={remaining}
                            selectedQuantity={selectedQuantity}
                            nightCount={pricedNightCount}
                            locale={locale}
                            copy={copy}
                            onChange={(quantity) =>
                              setSelectedQuantities((current) => ({
                                ...current,
                                [unit.id]: quantity,
                              }))
                            }
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="hidden overflow-x-auto rounded-[1.5rem] border border-white/10 bg-black/15 md:block">
                    <table className="min-w-full border-collapse text-left text-sm text-stone-200">
                      <thead className="bg-white/[0.03] text-xs text-swhite">
                        <tr>
                          <th className="px-4 py-3 font-semibold">{copy.unitTypeLabel}</th>
                          <th className="px-4 py-3 font-semibold">{copy.personsLabel}</th>
                          <th className="px-4 py-3 font-semibold">{unitPriceLabel}</th>
                          <th className="px-4 py-3 font-semibold">{copy.quantityLabel}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unitTypes.map((unit) => {
                          const availability = availabilityByUnitId.get(unit.id);
                          const remaining = availability?.remaining;
                          const selectedQuantity = remaining === undefined
                            ? selectedQuantities[unit.id] ?? 0
                            : Math.min(selectedQuantities[unit.id] ?? 0, remaining);
                          const availabilityText = remaining === undefined ? copy.availabilityLoading : copy.availabilityLabel(remaining);

                          return (
                            <tr key={unit.id} className="border-t border-white/10 align-top first:border-t-0">
                              <td className="px-4 py-4">
                                <div className="space-y-1.5">
                                  <p className="font-semibold text-white">{unit.title}</p>
                                </div>
                                <UnitLayoutList
                                  title={copy.layoutLabel}
                                  dimensions={unit.dimensions}
                                  sleepingLayout={unit.sleepingLayout}
                                  features={unit.features}
                                  compact
                                  className="mt-3"
                                />
                              </td>
                              <td className="px-4 py-4 text-stone-300">
                                <CapacityInline label={unit.capacityLabel} />
                              </td>
                              <td className="px-4 py-4">
                                <UnitPriceDisplay
                                  title={unitPriceLabel}
                                  totalPrice={formatCurrency(unit.pricePerNight * pricedNightCount, locale)}
                                  nightlyPrice={`${formatCurrency(unit.pricePerNight, locale)} ${copy.perNight}`}
                                  availabilityText={availabilityText}
                                />
                              </td>
                              <td className="px-4 py-4">
                                <select
                                  value={String(selectedQuantity)}
                                  onChange={(event) =>
                                    setSelectedQuantities((current) => ({
                                      ...current,
                                      [unit.id]: Number(event.target.value),
                                    }))
                                  }
                                  disabled={remaining === undefined}
                                  className="h-10 min-w-24 rounded-xl border border-white/10 bg-[#22282a] px-3 text-base text-white outline-none transition focus:border-[#76BD23]/45 sm:text-sm"
                                >
                                  {remaining === undefined ? (
                                    <option value="0" className="bg-[#22282a] text-white">...</option>
                                  ) : (
                                    Array.from({ length: remaining + 1 }, (_, index) => index).map((value) => (
                                      <option key={value} value={value} className="bg-[#22282a] text-white">{value}</option>
                                    ))
                                  )}
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-white">{copy.locationStepTitle}</h2>
                    <p className="text-sm leading-7 text-stone-300">
                      {copy.locationStepDescription}
                    </p>
                  </div>

                  {locationsQuery.isLoading ? null : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {locations.map((location) => {
                        const isSelected = location.id === selectedLocationId;

                        return (
                          <button
                            key={location.id}
                            type="button"
                            onClick={() => setSelectedLocationId(location.id)}
                            aria-pressed={isSelected}
                            className={`relative rounded-[1.5rem] border-2 bg-black/15 p-5 text-left transition ${
                              isSelected
                                ? 'border-[#76BD23]'
                                : 'border-white/10 hover:border-white/25'
                            }`}
                          >
                            {isSelected ? (
                              <span className="absolute right-4 top-4 flex size-6 items-center justify-center rounded-full bg-[#76BD23] text-[#10311c]">
                                <Check className="size-4" />
                              </span>
                            ) : null}
                            <p className="pr-8 text-lg font-semibold text-white">{location.name}</p>
                            <p className="mt-2 text-sm leading-6 text-stone-300">{location.address}</p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : null}

              {step === 3 ? (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-white">{copy.step3Title}</h2>
                    <p className="text-sm leading-7 text-stone-300">
                      {copy.step3Description}
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="guestName" className="text-stone-100"><RequiredLabel>{copy.labels.guestName}</RequiredLabel></Label>
                      <Input
                        id="guestName"
                        value={formData.guestName}
                        onChange={(event) =>
                          setFormData((current) => ({ ...current, guestName: event.target.value }))
                        }
                        className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                        placeholder={copy.placeholders.guestName}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guestEmail" className="text-stone-100"><RequiredLabel>{copy.labels.guestEmail}</RequiredLabel></Label>
                      <Input
                        id="guestEmail"
                        type="email"
                        value={formData.guestEmail}
                        onChange={(event) =>
                          setFormData((current) => ({ ...current, guestEmail: event.target.value }))
                        }
                        aria-invalid={hasEmailInput && !hasValidGuestEmail ? 'true' : 'false'}
                        className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                        placeholder={copy.placeholders.guestEmail}
                      />
                      {hasEmailInput && !hasValidGuestEmail ? (
                        <p className="text-sm text-red-300">{copy.validations.invalidEmail}</p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guestPhone" className="text-stone-100"><RequiredLabel>{copy.labels.guestPhone}</RequiredLabel></Label>
                      <div className="flex gap-2">
                        <select
                          aria-label={locale === 'en' ? 'Country code' : 'Landcode'}
                          value={guestPhoneCountryCode}
                          onChange={(event) => setGuestPhoneCountryCode(event.target.value as CountryCode)}
                          className="h-11 w-36 shrink-0 rounded-xl border border-white/10 bg-black/20 px-2.5 text-base text-white outline-none transition focus:border-[#76BD23]/45 sm:text-sm"
                        >
                          {phoneCountryOptions.map((option) => (
                            <option key={option.country} value={option.country} className="bg-[#22282a] text-white">
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <Input
                          id="guestPhone"
                          inputMode="tel"
                          autoComplete="tel-national"
                          value={formData.guestPhone}
                          onChange={(event) =>
                            setFormData((current) => ({ ...current, guestPhone: event.target.value }))
                          }
                          className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                          placeholder={copy.placeholders.guestPhone}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkIn" className="text-stone-100"><RequiredLabel>{copy.labels.checkIn}</RequiredLabel></Label>
                      <Input
                        id="checkIn"
                        type="date"
                        value={formData.checkIn}
                        min={earliestCheckIn}
                        max={latestCheckIn}
                        onChange={(event) =>
                          setFormData((current) => ({ ...current, checkIn: event.target.value }))
                        }
                        aria-invalid={dateErrors.checkIn ? 'true' : 'false'}
                        className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                      />
                      {dateErrors.checkIn ? <p className="text-sm text-red-300">{dateErrors.checkIn}</p> : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkOut" className="text-stone-100"><RequiredLabel>{copy.labels.checkOut}</RequiredLabel></Label>
                      <Input
                        id="checkOut"
                        type="date"
                        value={formData.checkOut}
                        min={isValidIsoDate(formData.checkIn)
                          ? addDaysToIsoDate(formData.checkIn, 1) < earliestCheckOut
                            ? earliestCheckOut
                            : addDaysToIsoDate(formData.checkIn, 1)
                          : earliestCheckOut}
                        max={latestCheckOut}
                        onChange={(event) =>
                          setFormData((current) => ({ ...current, checkOut: event.target.value }))
                        }
                        aria-invalid={dateErrors.checkOut ? 'true' : 'false'}
                        className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                      />
                      {dateErrors.checkOut ? <p className="text-sm text-red-300">{dateErrors.checkOut}</p> : null}
                    </div>
                    <div className="rounded-[1.5rem] border border-[#76BD23]/20 bg-[#1C5733]/18 p-4 md:col-span-2">
                      <p className="text-sm font-semibold text-[#F0E7C9]">
                        {locale === 'en' ? 'Period' : 'Verblijfsperiode'}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {nightLabel}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-stone-300">
                        {copy.stayDurationDescription(
                          stayStartLabel,
                          stayDepartureLabel,
                          nightLabel,
                        )}
                      </p>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="notes" className="text-stone-100">{copy.labels.notes}</Label>
                      <textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(event) =>
                          setFormData((current) => ({ ...current, notes: event.target.value }))
                        }
                        className="border-input placeholder:text-muted-foreground focus-visible:ring-ring min-h-32 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-base text-white outline-none transition-colors focus-visible:ring-2 sm:text-sm"
                        placeholder={copy.placeholders.notes}
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              {step === 4 ? (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-white">{copy.step4Title}</h2>
                    <p className="text-sm leading-7 text-stone-300">
                      {copy.step4Description}
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[1.5rem] border border-white/10 bg-black/15 p-5">
                      <SelectedUnitsSummary
                        title={copy.selectedUnitsTitle}
                        lines={selectedUnits}
                        totalAmount={totalStayPrice}
                        totalLabel={copy.totalAmount}
                        emptyLabel={copy.selectedUnitsEmpty}
                        locale={locale}
                      />

                      <div className="mt-4 space-y-3 text-sm text-stone-300">
                        {selectedLocation ? (
                          <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-black/20 p-4">
                            <MapPin className="mt-0.5 size-5 shrink-0 text-[#D6CAA0]" />
                            <div>
                              <p className="font-medium text-white">{selectedLocation.name}</p>
                              <p className="mt-1 text-sm text-stone-300">{selectedLocation.address}</p>
                            </div>
                          </div>
                        ) : null}

                        <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-black/20 p-4">
                          <CalendarDays className="mt-0.5 size-5 shrink-0 text-[#D6CAA0]" />
                          <div>
                            <p className="font-medium text-white">
                              {stayStartLabel} {locale === 'en' ? 'to' : 'tot en met'} {stayDepartureLabel}
                            </p>
                            <p className="mt-1 text-sm text-stone-300">
                              {nightLabel}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#D6CAA0]/20 bg-[linear-gradient(180deg,rgba(214,202,160,0.16)_0%,rgba(214,202,160,0.06)_100%)] p-4">
                          <p className="text-sm font-semibold text-[#F0E7C9]">{copy.totalAmount}</p>
                          <div className="mt-2 flex items-end justify-between gap-3">
                            <div>
                              <p className="text-3xl font-bold leading-none text-white sm:text-4xl">
                                {formatCurrency(totalStayPrice, locale)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-[1.5rem] border border-white/10 bg-black/15 p-5">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-[#F0E7C9]">{copy.contactPerson}</p>
                        <h3 className="text-xl font-semibold text-white">{formData.guestName}</h3>
                      </div>

                      <div className="mt-4 space-y-3 text-sm text-stone-300">
                        <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-black/20 p-4">
                          <Mail className="mt-0.5 size-5 shrink-0 text-[#D6CAA0]" />
                          <div>
                            <p className="font-medium text-white">{copy.email}</p>
                            <p className="mt-1 text-stone-300">{formData.guestEmail}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-black/20 p-4">
                          <Phone className="mt-0.5 size-5 shrink-0 text-[#D6CAA0]" />
                          <div>
                            <p className="font-medium text-white">{copy.phone}</p>
                            <p className="mt-1 text-stone-300">{formattedGuestPhone}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <label className="flex items-start gap-3 rounded-[1.5rem] border border-white/10 bg-black/15 p-4 text-sm leading-6 text-stone-300">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(event) => setAcceptedTerms(event.target.checked)}
                      className="mt-0.5 size-5 rounded border-white/15 bg-transparent"
                    />
                    <span>
                      {copy.agreePrefix} <Link to={localizePath('/voorwaarden')} className="text-[#D6CAA0] underline underline-offset-4" target="_blank">{copy.agreeTerms}</Link>.
                    </span>
                  </label>

                  {mutation.isError ? (
                    <div className="rounded-[1.5rem] border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-100">
                      {mutation.error instanceof Error ? mutation.error.message : copy.submitErrorFallback}
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="space-y-4 border-t border-white/8 pt-5">
                {step === 1 ? (
                  <SelectedUnitsSummary
                    title={copy.selectedUnitsTitle}
                    lines={selectedUnits}
                    totalAmount={totalStayPrice}
                    totalLabel={copy.totalAmount}
                    emptyLabel={copy.selectedUnitsEmpty}
                    locale={locale}
                  />
                ) : null}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-[#00953B]/25 bg-[#1C5733]/16 text-white hover:bg-[#1C5733]/22"
                  onClick={() => goToStep((current) => Math.max(1, current - 1))}
                  disabled={step === 1 || mutation.isPending}
                >
                  <ArrowLeft />
                  {copy.previous}
                </Button>

                {step < 4 ? (
                  <Button
                    type="button"
                    className="rounded-full bg-[#76BD23] text-[#10311c] hover:bg-[#6eb220]"
                    onClick={() => goToStep((current) => current + 1)}
                    disabled={
                      mutation.isPending ||
                      (step === 1 && (availabilityQuery.data === undefined || selectedUnitsCount === 0)) ||
                      (step === 2 && !isLocationStepValid) ||
                      (step === 3 && !isDetailsStepValid)
                    }
                  >
                    {copy.next}
                    <ArrowRight />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="rounded-full bg-[#76BD23] text-[#10311c] hover:bg-[#6eb220]"
                    onClick={submitReservation}
                    disabled={
                      mutation.isPending ||
                      !acceptedTerms ||
                      !isLocationStepValid ||
                      !isDetailsStepValid ||
                      selectedUnitsCount === 0
                    }
                  >
                    {mutation.isPending ? <LoaderCircle className="animate-spin" /> : null}
                    {copy.sendRequest}
                  </Button>
                )}
                </div>
              </div>
            </div>
          ) : null}
        </article>
      </section>
    </>
  );
}
