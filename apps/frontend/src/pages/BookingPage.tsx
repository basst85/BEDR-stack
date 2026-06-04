import { useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, CalendarDays, Check, CheckCircle2, LoaderCircle, Mail, Phone, Users } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

import {
  bookingAvailabilityQueryOptions,
  queryKeys,
  submitBookingRequest,
  type BookingRequestPayload,
} from '@/lib/api';
import { formatCurrency, type Locale, useI18n } from '@/lib/i18n';
import { siteCopy } from '@/lib/site-copy';
import { getCapacityCount, getUnitTypes } from '@/lib/velo-village';
import { SeoHead } from '@/components/SeoHead';
import { UnitImageCarousel } from '@/components/UnitImageCarousel';
import { useMountEffect } from '@/hooks/useMountEffect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const earliestCheckIn = '2026-11-05';
const latestCheckIn = '2026-11-09';
const earliestCheckOut = '2026-11-06';
const latestCheckOut = '2026-11-10';

function parseIsoDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);

  return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
}

function formatIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(value: string, days: number) {
  const date = parseIsoDate(value);

  date.setUTCDate(date.getUTCDate() + days);

  return formatIsoDate(date);
}

function getNightCount(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) {
    return 0;
  }

  const differenceInMilliseconds = parseIsoDate(checkOut).getTime() - parseIsoDate(checkIn).getTime();
  const millisecondsPerNight = 1000 * 60 * 60 * 24;

  return Math.max(Math.floor(differenceInMilliseconds / millisecondsPerNight), 0);
}

function isIsoDateString(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function getDateValidationMessage(locale: Locale, checkIn: string, checkOut: string) {
  const copy = siteCopy[locale].booking;

  if (!checkIn || !checkOut || !isIsoDateString(checkIn) || !isIsoDateString(checkOut)) {
    return copy.validations.invalidDates;
  }

  if (checkIn < earliestCheckIn || checkIn > latestCheckIn) {
    return copy.validations.checkInRange;
  }

  if (checkOut < earliestCheckOut || checkOut > latestCheckOut) {
    return copy.validations.checkOutRange;
  }

  if (checkOut <= checkIn) {
    return copy.validations.checkOutAfterCheckIn;
  }

  return null;
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

export function BookingPage() {
  const { locale, localizePath } = useI18n();
  const copy = siteCopy[locale].booking;
  const unitTypes = getUnitTypes(locale);
  const defaultUnitId = unitTypes[0].id;
  const [searchParams] = useSearchParams();
  const requestedUnit = searchParams.get('unit');
  const initialUnitId = unitTypes.some((unit) => unit.id === requestedUnit) ? requestedUnit! : defaultUnitId;
  const stepActionRef = useRef<HTMLDivElement | null>(null);

  const [step, setStep] = useState(1);
  const [selectedUnitId, setSelectedUnitId] = useState(initialUnitId);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkIn: earliestCheckIn,
    checkOut: earliestCheckOut,
    notes: '',
  });

  const queryClient = useQueryClient();
  const availabilityQuery = useQuery(bookingAvailabilityQueryOptions());

  const selectedUnit = useMemo(
    () => unitTypes.find((unit) => unit.id === selectedUnitId) ?? unitTypes[0],
    [selectedUnitId],
  );

  const selectedAvailability = availabilityQuery.data?.find((item) => item.unitType === selectedUnitId);
  const nightCount = getNightCount(formData.checkIn, formData.checkOut);
  const totalStayPrice = selectedUnit.pricePerNight * nightCount;
  const dateValidationMessage = getDateValidationMessage(locale, formData.checkIn, formData.checkOut);
  const stepLabels = copy.stepLabels;
  const nightLabel = `${nightCount} ${getNightWord(locale, nightCount)}`;

  const mutation = useMutation({
    mutationFn: (payload: BookingRequestPayload) => submitBookingRequest(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.bookingAvailability() });
    },
  });

  const isDetailsStepValid =
    formData.guestName.trim().length >= 2 &&
    formData.guestEmail.trim().length >= 5 &&
    formData.guestPhone.trim().length >= 8 &&
    formData.checkIn.length > 0 &&
    formData.checkOut.length > 0 &&
    !dateValidationMessage &&
    nightCount > 0;

  const submitReservation = async () => {
    await mutation.mutateAsync({
      unitType: selectedUnit.id,
      quantity: 1,
      guestName: formData.guestName.trim(),
      guestEmail: formData.guestEmail.trim(),
      guestPhone: formData.guestPhone.trim(),
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      notes: formData.notes.trim(),
    });
  };

  const handleSelectUnit = (unitId: string) => {
    setSelectedUnitId(unitId);

    window.requestAnimationFrame(() => {
      stepActionRef.current?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    });
  };

  useMountEffect(() => {
    if (!requestedUnit) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      stepActionRef.current?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  });

  return (
    <>
      <SeoHead
        title={copy.seoTitle}
        description={copy.seoDescription}
        canonicalPath={localizePath('/boeken')}
      />

      <section className="rounded-[2rem] border border-white/10 bg-card/80 p-5 sm:p-6">
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
                    className={`min-w-fit rounded-full border px-4 py-2 ${
                      isActive
                        ? 'border-[#76BD23]/45 bg-[#1C5733]/25'
                        : isDone
                          ? 'border-[#00953B]/35 bg-[#1C5733]/18'
                          : 'border-white/8 bg-black/15'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-white">
                      <span className="text-xs uppercase tracking-[0.22em] text-stone-400">{locale === 'en' ? 'Step' : 'Stap'} {stepNumber}</span>
                      {isDone ? <Check className="size-4 text-[#76BD23]" /> : null}
                      <span className="font-medium">{label}</span>
                    </div>
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
                {copy.successMessage(mutation.data.confirmationCode, mutation.data.remaining)}
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="rounded-full bg-[#76BD23] text-[#10311c] hover:bg-[#6eb220]">
                  <Link to={localizePath('/')}>{copy.backHome}</Link>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-[#00953B]/25 bg-[#1C5733]/16 text-white hover:bg-[#1C5733]/22"
                  onClick={() => mutation.reset()}
                >
                  {copy.makeAnother}
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

                  <div className="space-y-3">
                    {unitTypes.map((unit) => {
                      const availability = availabilityQuery.data?.find((item) => item.unitType === unit.id);
                      const remaining = availability?.remaining;
                      const stockLimit = availability?.stockLimit;
                      const isSelected = selectedUnitId === unit.id;

                      return (
                        <button
                          key={unit.id}
                          type="button"
                          disabled={remaining === 0}
                          onClick={() => handleSelectUnit(unit.id)}
                          className={`w-full rounded-[1.5rem] border p-5 text-left transition ${
                            isSelected
                              ? 'border-[#76BD23]/55 bg-[#1C5733]/26 shadow-[0_0_0_1px_rgba(118,189,35,0.32),0_22px_44px_rgba(0,0,0,0.18)]'
                              : 'border-white/10 bg-black/15 hover:border-white/20 hover:bg-white/[0.04]'
                          } ${remaining === 0 ? 'cursor-not-allowed opacity-50' : ''}`}
                        >
                          <UnitImageCarousel images={unit.images} title={unit.title} />

                          <div className="space-y-2">
                            {isSelected ? (
                              <div className="inline-flex items-center gap-2 rounded-full border border-[#76BD23]/30 bg-[#76BD23]/12 px-3 py-1 text-xs font-semibold text-[#D9F0B6]">
                                <CheckCircle2 className="size-4" />
                                {copy.selected}
                              </div>
                            ) : null}
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="text-xl font-semibold text-white">{unit.title}</h3>
                                <p className="mt-1 text-sm text-stone-300">
                                  <CapacityInline label={unit.capacityLabel} />
                                </p>
                              </div>
                              <div className="shrink-0 text-right">
                                <p className="text-2xl font-bold leading-none text-[#F0E7C9]">{formatCurrency(unit.pricePerNight, locale)}</p>
                                <p className="mt-1 text-xs text-stone-400">{copy.perNight}</p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 space-y-3 text-sm text-stone-300">
                            <p className="leading-6">{unit.summary}</p>

                            <div className="rounded-2xl border border-dashed border-[#76BD23]/35 bg-[#1C5733]/20 p-4">
                              <p className="text-xs uppercase tracking-[0.2em] text-[#D6CAA0]">{copy.layoutLabel}</p>
                              <p className="mt-2 leading-6 text-stone-200">{unit.sleepingLayout}</p>
                            </div>

                            <div className="flex items-center justify-between gap-3 pt-1 text-sm">
                              <p className="text-stone-400">
                                {remaining === undefined || stockLimit === undefined
                                  ? copy.availabilityLoading
                                  : copy.availabilityLabel(remaining)}
                              </p>
                              <span className="text-stone-500">{unit.dimensions}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-white">{copy.step2Title}</h2>
                    <p className="text-sm leading-7 text-stone-300">
                      {copy.step2Description}
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
                        className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                        placeholder={copy.placeholders.guestEmail}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guestPhone" className="text-stone-100"><RequiredLabel>{copy.labels.guestPhone}</RequiredLabel></Label>
                      <Input
                        id="guestPhone"
                        value={formData.guestPhone}
                        onChange={(event) =>
                          setFormData((current) => ({ ...current, guestPhone: event.target.value }))
                        }
                        className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                        placeholder={copy.placeholders.guestPhone}
                      />
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
                          setFormData((current) => {
                            const nextCheckIn = event.target.value;
                            const minimumCheckOut = addDays(nextCheckIn, 1);

                            return {
                              ...current,
                              checkIn: nextCheckIn,
                              checkOut:
                                current.checkOut < minimumCheckOut
                                  ? minimumCheckOut
                                  : current.checkOut > latestCheckOut
                                    ? latestCheckOut
                                    : current.checkOut,
                            };
                          })
                        }
                        className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkOut" className="text-stone-100"><RequiredLabel>{copy.labels.checkOut}</RequiredLabel></Label>
                      <Input
                        id="checkOut"
                        type="date"
                        value={formData.checkOut}
                        min={formData.checkIn ? addDays(formData.checkIn, 1) : earliestCheckOut}
                        max={latestCheckOut}
                        onChange={(event) =>
                          setFormData((current) => ({ ...current, checkOut: event.target.value }))
                        }
                        className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                      />
                    </div>
                    {dateValidationMessage ? (
                      <div className="rounded-[1.25rem] border border-red-400/20 bg-red-400/10 p-4 md:col-span-2">
                        <p className="text-sm font-medium text-red-100">{dateValidationMessage}</p>
                      </div>
                    ) : null}
                    <div className="rounded-[1.5rem] border border-[#76BD23]/20 bg-[#1C5733]/18 p-4 md:col-span-2">
                      <p className="text-sm font-semibold text-[#F0E7C9]">{copy.stayDurationLabel}</p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {nightLabel}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-stone-300">
                        {copy.stayDurationDescription(
                          formatLocalizedDate(formData.checkIn, locale),
                          formatLocalizedDate(formData.checkOut, locale),
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
                        className="border-input placeholder:text-muted-foreground focus-visible:ring-ring min-h-32 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none transition-colors focus-visible:ring-2"
                        placeholder={copy.placeholders.notes}
                      />
                    </div>
                  </div>
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
                    <div className="rounded-[1.5rem] border border-white/10 bg-black/15 p-5">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-[#F0E7C9]">{copy.chosenUnit}</p>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-semibold text-white">{selectedUnit.title}</h3>
                            <p className="mt-1 text-sm text-stone-300">
                              <CapacityInline label={selectedUnit.capacityLabel} />
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-2xl font-bold leading-none text-[#F0E7C9]">
                              {formatCurrency(selectedUnit.pricePerNight, locale)}
                            </p>
                            <p className="mt-1 text-xs text-stone-400">{copy.perNight}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3 text-sm text-stone-300">
                        <p className="leading-6">{selectedUnit.summary}</p>

                        <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-black/20 p-4">
                          <CalendarDays className="mt-0.5 size-5 shrink-0 text-[#D6CAA0]" />
                          <div>
                            <p className="font-medium text-white">
                              {formatLocalizedDate(formData.checkIn, locale)} {locale === 'en' ? 'to' : 'tot'} {formatLocalizedDate(formData.checkOut, locale)}
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

                        <div className="flex items-center justify-between gap-3 pt-1 text-sm">
                          <p className="text-stone-400">{selectedUnit.dimensions}</p>
                          <span className="text-stone-300">{selectedUnit.sleepingLayout}</span>
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
                            <p className="mt-1 text-stone-300">{formData.guestPhone}</p>
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
                      className="mt-1 size-4 rounded border-white/15 bg-transparent"
                    />
                    <span>
                      {copy.agreePrefix} <Link to={localizePath('/voorwaarden')} className="text-[#D6CAA0] underline underline-offset-4">{copy.agreeTerms}</Link>.
                    </span>
                  </label>

                  {mutation.isError ? (
                    <div className="rounded-[1.5rem] border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-100">
                      {mutation.error instanceof Error ? mutation.error.message : copy.submitErrorFallback}
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div ref={stepActionRef} className="space-y-4 border-t border-white/8 pt-5">
                {step === 1 ? (
                  <div className="rounded-[1.5rem] border border-[#76BD23]/20 bg-[#1C5733]/18 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#D6CAA0]">{copy.chosenUnit}</p>
                    <div className="mt-3 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{selectedUnit.title}</h3>
                        <p className="mt-1 text-sm text-stone-300">
                          <CapacityInline label={selectedUnit.capacityLabel} />
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-2xl font-bold leading-none text-[#F0E7C9]">
                          {formatCurrency(selectedUnit.pricePerNight, locale)}
                        </p>
                        <p className="mt-1 text-xs text-stone-400">{copy.perNight}</p>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-[#00953B]/25 bg-[#1C5733]/16 text-white hover:bg-[#1C5733]/22"
                  onClick={() => setStep((current) => Math.max(1, current - 1))}
                  disabled={step === 1 || mutation.isPending}
                >
                  <ArrowLeft />
                  {copy.previous}
                </Button>

                {step < 3 ? (
                  <Button
                    type="button"
                    className="rounded-full bg-[#76BD23] text-[#10311c] hover:bg-[#6eb220]"
                    onClick={() => setStep((current) => current + 1)}
                    disabled={
                      mutation.isPending ||
                      (step === 1 && selectedAvailability?.remaining === 0) ||
                      (step === 2 && !isDetailsStepValid)
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
                    disabled={mutation.isPending || !acceptedTerms || !isDetailsStepValid}
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