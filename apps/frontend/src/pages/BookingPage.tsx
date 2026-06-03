import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Check, LoaderCircle, Users } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

import {
  bookingAvailabilityQueryOptions,
  queryKeys,
  submitBookingRequest,
  type BookingRequestPayload,
} from '@/lib/api';
import { getCapacityCount, unitTypes } from '@/lib/velo-village';
import { SeoHead } from '@/components/SeoHead';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const stepLabels = ['Unit', 'Gegevens', 'Betalen'];

const defaultUnitId = unitTypes[0].id;

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

export function BookingPage() {
  const [searchParams] = useSearchParams();
  const requestedUnit = searchParams.get('unit');
  const initialUnitId = unitTypes.some((unit) => unit.id === requestedUnit) ? requestedUnit! : defaultUnitId;

  const [step, setStep] = useState(1);
  const [selectedUnitId, setSelectedUnitId] = useState(initialUnitId);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkIn: '2026-11-06',
    checkOut: '2026-11-09',
    notes: '',
  });

  const queryClient = useQueryClient();
  const availabilityQuery = useQuery(bookingAvailabilityQueryOptions());

  const selectedUnit = useMemo(
    () => unitTypes.find((unit) => unit.id === selectedUnitId) ?? unitTypes[0],
    [selectedUnitId],
  );

  const selectedAvailability = availabilityQuery.data?.find((item) => item.unitType === selectedUnitId);

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
    formData.checkOut.length > 0;

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

  return (
    <>
      <SeoHead
        title="Boeken | VeloVillage Zeddam"
        description="Afleidingsvrije booking funnel voor VeloVillage: kies je woonunit, vul je gegevens in en leg je EK-verblijf vast."
        canonicalPath="/boeken"
      />

      <section className="rounded-[2rem] border border-white/10 bg-card/80 p-5 sm:p-6">
        <article>
          <div className="flex flex-col gap-4 border-b border-white/8 pb-5">
            <div className="space-y-2">
              <div>
                <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-[0.04em] text-white">
                  Reserveer je warme EK-basis in 3 stappen
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
                      <span className="text-xs uppercase tracking-[0.22em] text-stone-400">Stap {stepNumber}</span>
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
              <p className="text-xs uppercase tracking-[0.28em] text-[#D6CAA0]">Aanvraag ontvangen</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Je aanvraag staat klaar voor opvolging.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-200">
                Referentie <span className="font-semibold text-white">{mutation.data.confirmationCode}</span>. Deze unitsoort heeft nu nog {mutation.data.remaining} exemplaren beschikbaar binnen de ingestelde limiet van 5.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="rounded-full bg-[#76BD23] text-[#10311c] hover:bg-[#6eb220]">
                  <Link to="/">Terug naar homepage</Link>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-[#00953B]/25 bg-[#1C5733]/16 text-white hover:bg-[#1C5733]/22"
                  onClick={() => mutation.reset()}
                >
                  Nog een aanvraag doen
                </Button>
              </div>
            </div>
          ) : null}

          {!mutation.isSuccess ? (
            <div className="mt-6 space-y-6">
              {step === 1 ? (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-white">1. Kies je unittype</h2>
                    <p className="text-sm leading-7 text-stone-300">
                      Alleen types met resterende voorraad zijn te boeken. De backend bewaakt dat er maximaal vijf units per soort kunnen worden aangevraagd.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {unitTypes.map((unit) => {
                      const availability = availabilityQuery.data?.find((item) => item.unitType === unit.id);
                      const remaining = availability?.remaining ?? 5;
                      const isSelected = selectedUnitId === unit.id;

                      return (
                        <button
                          key={unit.id}
                          type="button"
                          disabled={remaining === 0}
                          onClick={() => setSelectedUnitId(unit.id)}
                          className={`w-full rounded-[1.5rem] border p-4 text-left transition ${
                            isSelected
                              ? 'border-[#76BD23]/45 bg-[#1C5733]/25'
                              : 'border-white/10 bg-black/15 hover:border-white/20 hover:bg-white/[0.04]'
                          } ${remaining === 0 ? 'cursor-not-allowed opacity-50' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs uppercase tracking-[0.22em] text-stone-400">{unit.code}</p>
                              <h3 className="mt-2 text-lg font-semibold text-white">{unit.title}</h3>
                            </div>
                            <Badge className="rounded-full border border-white/10 bg-white/5 text-stone-100">
                              <CapacityInline label={unit.capacityLabel} />
                            </Badge>
                          </div>

                          <p className="mt-3 text-sm leading-6 text-stone-300">{unit.summary}</p>

                          <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/8 pt-4 text-sm">
                            <div>
                              <p className="text-stone-500">Afmeting</p>
                              <p className="font-medium text-white">{unit.dimensions}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-stone-500">Nog beschikbaar</p>
                              <p className="font-medium text-white">{remaining} / 5</p>
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
                    <h2 className="text-2xl font-semibold text-white">2. Vul je verblijfsgegevens in</h2>
                    <p className="text-sm leading-7 text-stone-300">
                      Houd de flow kort. Alleen de data die nodig is om de aanvraag te bevestigen en de planning rond het EK-weekend te regelen.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="guestName" className="text-stone-100">Naam</Label>
                      <Input
                        id="guestName"
                        value={formData.guestName}
                        onChange={(event) =>
                          setFormData((current) => ({ ...current, guestName: event.target.value }))
                        }
                        className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                        placeholder="Voor- en achternaam"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guestEmail" className="text-stone-100">E-mail</Label>
                      <Input
                        id="guestEmail"
                        type="email"
                        value={formData.guestEmail}
                        onChange={(event) =>
                          setFormData((current) => ({ ...current, guestEmail: event.target.value }))
                        }
                        className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                        placeholder="naam@voorbeeld.nl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guestPhone" className="text-stone-100">Telefoon</Label>
                      <Input
                        id="guestPhone"
                        value={formData.guestPhone}
                        onChange={(event) =>
                          setFormData((current) => ({ ...current, guestPhone: event.target.value }))
                        }
                        className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                        placeholder="06 12 34 56 78"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkIn" className="text-stone-100">Aankomst</Label>
                      <Input
                        id="checkIn"
                        type="date"
                        value={formData.checkIn}
                        onChange={(event) =>
                          setFormData((current) => ({ ...current, checkIn: event.target.value }))
                        }
                        className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkOut" className="text-stone-100">Vertrek</Label>
                      <Input
                        id="checkOut"
                        type="date"
                        value={formData.checkOut}
                        onChange={(event) =>
                          setFormData((current) => ({ ...current, checkOut: event.target.value }))
                        }
                        className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="notes" className="text-stone-100">Opmerking</Label>
                      <textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(event) =>
                          setFormData((current) => ({ ...current, notes: event.target.value }))
                        }
                        className="border-input placeholder:text-muted-foreground focus-visible:ring-ring min-h-32 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none transition-colors focus-visible:ring-2"
                        placeholder="Bijvoorbeeld teamnaam, verwachte aankomsttijd of extra context voor de aanvraag"
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-white">3. Controleer en verstuur</h2>
                    <p className="text-sm leading-7 text-stone-300">
                      De betaalstap is hier strategisch opgezet als bevestigingsmoment. In dit prototype wordt nog geen PSP aangeroepen; de aanvraag wordt wel direct in de backend opgeslagen en telt mee voor de limiet.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[1.5rem] border border-white/10 bg-black/15 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Gekozen unit</p>
                      <h3 className="mt-2 text-xl font-semibold text-white">{selectedUnit.title}</h3>
                      <p className="mt-2 flex items-center gap-2 text-sm leading-6 text-stone-300">
                        <span>{selectedUnit.dimensions}</span>
                        <span className="text-stone-500">·</span>
                        <CapacityInline label={selectedUnit.capacityLabel} />
                      </p>
                      <p className="mt-2 text-sm leading-6 text-stone-300">Je vraagt 1 unit van dit type aan.</p>
                    </div>
                    <div className="rounded-[1.5rem] border border-white/10 bg-black/15 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Contact</p>
                      <p className="mt-2 text-sm leading-6 text-white">{formData.guestName}</p>
                      <p className="text-sm leading-6 text-stone-300">{formData.guestEmail}</p>
                      <p className="text-sm leading-6 text-stone-300">{formData.guestPhone}</p>
                      <p className="mt-2 text-sm leading-6 text-stone-300">{formData.checkIn} tot {formData.checkOut}</p>
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
                      Ik begrijp dat deze flow een reserveringsaanvraag indient en ga akkoord met de <Link to="/voorwaarden" className="text-[#D6CAA0] underline underline-offset-4">algemene voorwaarden</Link>.
                    </span>
                  </label>

                  {mutation.isError ? (
                    <div className="rounded-[1.5rem] border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-100">
                      {mutation.error instanceof Error ? mutation.error.message : 'De reservering kon niet worden opgeslagen.'}
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="flex flex-col-reverse gap-3 border-t border-white/8 pt-5 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                    className="rounded-full border-[#00953B]/25 bg-[#1C5733]/16 text-white hover:bg-[#1C5733]/22"
                  onClick={() => setStep((current) => Math.max(1, current - 1))}
                  disabled={step === 1 || mutation.isPending}
                >
                  <ArrowLeft />
                  Vorige
                </Button>

                {step < 3 ? (
                  <Button
                    type="button"
                    className="rounded-full bg-[#76BD23] text-[#10311c] hover:bg-[#6eb220]"
                    onClick={() => setStep((current) => current + 1)}
                    disabled={
                      mutation.isPending ||
                      (step === 1 && (selectedAvailability?.remaining ?? 5) === 0) ||
                      (step === 2 && !isDetailsStepValid)
                    }
                  >
                    Volgende
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
                    Aanvraag versturen
                  </Button>
                )}
              </div>
            </div>
          ) : null}
        </article>
      </section>
    </>
  );
}