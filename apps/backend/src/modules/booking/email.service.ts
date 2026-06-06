import { config } from '@backend/core/config';

import { type UnitTypeValue } from './booking.model';

type BookingEmailLine = {
  unitType: UnitTypeValue;
  quantity: number;
};

type SendBookingConfirmationEmailParams = {
  requestGroupId: string;
  confirmationCode: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  notes?: string;
  lines: BookingEmailLine[];
};

export type BookingEmailLogEntry = {
  emailType: 'booking_confirmation';
  provider: 'resend';
  providerMessageId: string | null;
  status: 'sent' | 'failed' | 'skipped';
  recipientEmail: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  errorMessage: string | null;
};

export type ResendSentEmailReference = {
  id: string;
  to: string[];
  from: string;
  createdAt: string;
  subject: string;
  lastEvent: string | null;
};

export type ResendReceivedEmail = {
  id: string;
  to: string[];
  from: string;
  createdAt: string;
  subject: string;
  replyTo: string[];
  messageId: string | null;
  textBody: string | null;
  htmlBody: string | null;
};

type RespondToReceivedEmailParams = {
  emailId: string;
  action: 'reply' | 'forward';
  to: string[];
  subject: string;
  textBody: string;
};

const getResendReadApiKey = () => config.resendAdminApiKey || config.resendApiKey;

const getResendErrorMessage = async (response: Response) => {
  const payload = (await response.json().catch(() => null)) as
    | {
        message?: string;
        name?: string;
      }
    | null;

  return payload?.message ?? payload?.name ?? `Resend returned HTTP ${response.status}.`;
};

const unitCatalog: Record<UnitTypeValue, string> = {
  '420': '2 persoons unit met stapelbed',
  '660': '2 persoons unit met 2 losse bedden',
  '730': '4 persoons unit met twee stapelbedden',
  '733': '4 persoons unit met stapelbed en twee persoonsbed',
  '900': '3 - 5 persoons VIP unit',
  cabine: '2 persoons compartiment in 8 persoons slaapwagen',
};

const unitPricePerNightCatalog: Record<UnitTypeValue, number> = {
  '420': 150,
  '660': 170,
  '730': 300,
  '733': 320,
  '900': 400,
  cabine: 90,
};

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const calculateNightCount = (checkIn: string, checkOut: string) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const differenceInMs = end.getTime() - start.getTime();

  return Math.max(1, Math.round(differenceInMs / (1000 * 60 * 60 * 24)));
};

const buildBookingLinesHtml = (lines: BookingEmailLine[]) =>
  lines
    .map((line) => `<li>${line.quantity}x ${escapeHtml(unitCatalog[line.unitType])}</li>`)
    .join('');

const buildBookingLinesText = (lines: BookingEmailLine[]) =>
  lines.map((line) => `- ${line.quantity}x ${unitCatalog[line.unitType]}`).join('\n');

const buildEmailContent = (params: SendBookingConfirmationEmailParams) => {
  const nightCount = calculateNightCount(params.checkIn, params.checkOut);
  const totalAmount = params.lines.reduce(
    (sum, line) => sum + unitPricePerNightCatalog[line.unitType] * line.quantity * nightCount,
    0,
  );
  const depositAmount = totalAmount / 2;
  const remainingAmount = totalAmount - depositAmount;
  const subject = `CrossVillage boekingsbevestiging (${params.confirmationCode})`;
  const bookingLinesHtml = buildBookingLinesHtml(params.lines);
  const bookingLinesText = buildBookingLinesText(params.lines);
  const totalAmountText = formatCurrency(totalAmount);
  const depositAmountText = formatCurrency(depositAmount);
  const remainingAmountText = formatCurrency(remainingAmount);

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
      <p>Beste ${escapeHtml(params.guestName)},</p>
      <p>Bedankt voor je boeking! Wat ontzettend leuk dat je naar Zeddam komt om het EK Veldrijden te beleven, en dat je bij ons op de pop-up camping verblijft. Hierbij ontvang je de bevestiging van je reservering.</p>
      <p>Om jouw woonunit definitief voor je te reserveren, vragen we je om een aanbetaling van 50% aan ons over te maken. Let op: je boeking is pas definitief zodra deze aanbetaling op onze rekening staat. De overige 50% betaal je bij aankomst contant op de camping.</p>
      <p><strong>Jouw betalingsoverzicht:</strong></p>
      <ul>
        <li>Totaalbedrag: ${escapeHtml(totalAmountText)}</li>
        <li>Nu overmaken (50%): ${escapeHtml(depositAmountText)}</li>
        <li>Contant betalen bij aankomst (50%): ${escapeHtml(remainingAmountText)}</li>
        <li>Borg: €100,- p.p. bij aankomst op locatie betalen</li>
      </ul>
      <p><strong>Betaalgegevens voor de aanbetaling:</strong></p>
      <ul>
        <li>Rekeningnummer (IBAN): NL09 INGB 0116 2476 65</li>
        <li>Ten name van: Totalrent B.V.</li>
        <li>Onder vermelding van: Boekingsnummer ${escapeHtml(params.confirmationCode)}</li>
        <li>Betaaltermijn: Graag overmaken binnen 7 dagen na ontvangst van deze mail.</li>
      </ul>
      <p><strong>Jouw boekingsgegevens</strong></p>
      <p>Boekingsnummer: ${escapeHtml(params.confirmationCode)}</p>
      <p>Gekozen woonunit(s):</p>
      <ul>${bookingLinesHtml}</ul>
      <p>Verblijfsperiode: ${escapeHtml(formatDate(params.checkIn))} t/m ${escapeHtml(formatDate(params.checkOut))}</p>
      <p>Heb je in de tussentijd nog vragen? Kijk dan even bij de Veelgestelde Vragen op onze website, of stuur een antwoord op deze e-mail.</p>
      <p>We zijn achter de schermen druk bezig met de voorbereidingen en kijken ernaar uit je in november 2026 te verwelkomen!</p>
    </div>
  `.trim();

  const textBody = `
Beste ${params.guestName},

Bedankt voor je boeking! Wat ontzettend leuk dat je naar Zeddam komt om het EK Veldrijden te beleven, en dat je bij ons op de pop-up camping verblijft. Hierbij ontvang je de bevestiging van je reservering.

Om jouw woonunit definitief voor je te reserveren, vragen we je om een aanbetaling van 50% aan ons over te maken. Let op: je boeking is pas definitief zodra deze aanbetaling op onze rekening staat. De overige 50% betaal je bij aankomst contant op de camping.

Jouw betalingsoverzicht:

Totaalbedrag: ${totalAmountText}
Nu overmaken (50%): ${depositAmountText}
Contant betalen bij aankomst (50%): ${remainingAmountText}
Borg: €100,- p.p. bij aankomst op locatie betalen

Betaalgegevens voor de aanbetaling:

Rekeningnummer (IBAN): NL09 INGB 0116 2476 65
Ten name van: Totalrent B.V.
Onder vermelding van: Boekingsnummer ${params.confirmationCode}
Betaaltermijn: Graag overmaken binnen 7 dagen na ontvangst van deze mail.

Jouw boekingsgegevens
Boekingsnummer: ${params.confirmationCode}
Gekozen woonunit(s):
${bookingLinesText}
Verblijfsperiode: ${formatDate(params.checkIn)} t/m ${formatDate(params.checkOut)}

Heb je in de tussentijd nog vragen? Kijk dan even bij de Veelgestelde Vragen op onze website, of stuur een antwoord op deze e-mail.

We zijn achter de schermen druk bezig met de voorbereidingen en kijken ernaar uit je in november 2026 te verwelkomen!
  `.trim();

  return {
    subject,
    htmlBody,
    textBody,
  };
};

export async function sendBookingConfirmationEmail(
  params: SendBookingConfirmationEmailParams,
): Promise<BookingEmailLogEntry> {
  const { subject, htmlBody, textBody } = buildEmailContent(params);

  if (!config.resendApiKey) {
    return {
      emailType: 'booking_confirmation',
      provider: 'resend',
      providerMessageId: null,
      status: 'skipped',
      recipientEmail: params.guestEmail,
      subject,
      htmlBody,
      textBody,
      errorMessage: 'RESEND_API_KEY is not configured.',
    };
  }

  if (!config.resendFromEmail) {
    return {
      emailType: 'booking_confirmation',
      provider: 'resend',
      providerMessageId: null,
      status: 'skipped',
      recipientEmail: params.guestEmail,
      subject,
      htmlBody,
      textBody,
      errorMessage: 'RESEND_FROM_EMAIL is not configured.',
    };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${config.resendApiKey}`,
        'content-type': 'application/json',
        'user-agent': 'crossvillage-booking-service/1.0',
        'idempotency-key': `booking-confirmation-${params.requestGroupId}`,
      },
      body: JSON.stringify({
        from: config.resendFromEmail,
        to: [params.guestEmail],
        subject,
        html: htmlBody,
        text: textBody,
        ...(config.resendReplyTo ? { reply_to: config.resendReplyTo } : {}),
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | { id?: string; message?: string; name?: string }
      | null;

    if (!response.ok) {
      return {
        emailType: 'booking_confirmation',
        provider: 'resend',
        providerMessageId: null,
        status: 'failed',
        recipientEmail: params.guestEmail,
        subject,
        htmlBody,
        textBody,
        errorMessage: payload?.message ?? payload?.name ?? `Resend returned HTTP ${response.status}.`,
      };
    }

    return {
      emailType: 'booking_confirmation',
      provider: 'resend',
      providerMessageId: payload?.id ?? null,
      status: 'sent',
      recipientEmail: params.guestEmail,
      subject,
      htmlBody,
      textBody,
      errorMessage: null,
    };
  } catch (error) {
    return {
      emailType: 'booking_confirmation',
      provider: 'resend',
      providerMessageId: null,
      status: 'failed',
      recipientEmail: params.guestEmail,
      subject,
      htmlBody,
      textBody,
      errorMessage: error instanceof Error ? error.message : 'Unknown Resend error.',
    };
  }
}

export async function listResendSentEmails(): Promise<ResendSentEmailReference[]> {
  const resendReadApiKey = getResendReadApiKey();

  if (!resendReadApiKey) {
    return [];
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'GET',
      headers: {
        authorization: `Bearer ${resendReadApiKey}`,
        'user-agent': 'crossvillage-booking-service/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(await getResendErrorMessage(response));
    }

    const payload = (await response.json().catch(() => null)) as
      | {
          data?: Array<{
            id?: string;
            to?: string[] | null;
            from?: string;
            created_at?: string;
            subject?: string;
            last_event?: string | null;
          }>;
        }
      | null;

    if (!payload?.data) {
      return [];
    }

    return payload.data
      .filter((item): item is NonNullable<typeof item> & { id: string; from: string; created_at: string; subject: string } =>
        Boolean(item?.id && item.from && item.created_at && item.subject),
      )
      .map((item) => ({
        id: item.id,
        to: item.to ?? [],
        from: item.from,
        createdAt: item.created_at,
        subject: item.subject,
        lastEvent: item.last_event ?? null,
      }));
  } catch (error) {
    throw error instanceof Error ? error : new Error('Kon verzonden e-mails niet ophalen via Resend.');
  }
}

export async function listResendReceivedEmails(): Promise<ResendReceivedEmail[]> {
  const resendReadApiKey = getResendReadApiKey();

  if (!resendReadApiKey) {
    return [];
  }

  try {
    const listResponse = await fetch('https://api.resend.com/emails/receiving', {
      method: 'GET',
      headers: {
        authorization: `Bearer ${resendReadApiKey}`,
        'user-agent': 'crossvillage-booking-service/1.0',
      },
    });

    if (!listResponse.ok) {
      throw new Error(await getResendErrorMessage(listResponse));
    }

    const listPayload = (await listResponse.json().catch(() => null)) as
      | {
          data?: Array<{
            id?: string;
            to?: string[] | null;
            from?: string;
            created_at?: string;
            subject?: string;
            reply_to?: string[] | null;
            message_id?: string | null;
          }>;
        }
      | null;

    if (!listPayload?.data) {
      return [];
    }

    const summaries = listPayload.data.filter(
      (item): item is {
        id: string;
        to?: string[] | null;
        from: string;
        created_at: string;
        subject: string;
        reply_to?: string[] | null;
        message_id?: string | null;
      } =>
        Boolean(item?.id && item.from && item.created_at && item.subject),
    );

    const details = await Promise.all(
      summaries.map(async (item) => {
        try {
          const detailResponse = await fetch(`https://api.resend.com/emails/receiving/${item.id}`, {
            method: 'GET',
            headers: {
              authorization: `Bearer ${resendReadApiKey}`,
              'user-agent': 'crossvillage-booking-service/1.0',
            },
          });

          if (!detailResponse.ok) {
            throw new Error(await getResendErrorMessage(detailResponse));
          }

          const detailPayload = (await detailResponse.json().catch(() => null)) as
            | {
                html?: string | null;
                text?: string | null;
                reply_to?: string[] | null;
                message_id?: string | null;
              }
            | null;

          return {
            id: item.id,
            to: item.to ?? [],
            from: item.from,
            createdAt: item.created_at,
            subject: item.subject,
            replyTo: detailPayload?.reply_to ?? item.reply_to ?? [],
            messageId: detailPayload?.message_id ?? item.message_id ?? null,
            textBody: detailPayload?.text ?? null,
            htmlBody: detailPayload?.html ?? null,
          };
        } catch {
          return {
            id: item.id,
            to: item.to ?? [],
            from: item.from,
            createdAt: item.created_at,
            subject: item.subject,
            replyTo: item.reply_to ?? [],
            messageId: item.message_id ?? null,
            textBody: null,
            htmlBody: null,
          };
        }
      }),
    );

    return details;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Kon ontvangen e-mails niet ophalen via Resend.');
  }
}

const stripHtmlTags = (value: string) => value.replace(/<[^>]+>/g, '').trim();

const escapeReplyHtml = (value: string) =>
  value
    .split('\n')
    .map((line) => `<p style="margin: 0 0 12px;">${escapeHtml(line) || '&nbsp;'}</p>`)
    .join('');

export async function respondToReceivedEmail(
  params: RespondToReceivedEmailParams,
): Promise<{ id: string }> {
  if (!config.resendApiKey) {
    throw new Error('RESEND_API_KEY is not configured.');
  }

  if (!config.resendFromEmail) {
    throw new Error('RESEND_FROM_EMAIL is not configured.');
  }

  const receivedEmails = await listResendReceivedEmails();
  const email = receivedEmails.find((item) => item.id === params.emailId);

  if (!email) {
    throw new Error('Ontvangen e-mail niet gevonden.');
  }

  const originalText = email.textBody?.trim() || stripHtmlTags(email.htmlBody ?? '') || '(Geen oorspronkelijke inhoud beschikbaar)';
  const quotedOriginalText = originalText
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n');
  const quotedOriginalHtml = `
    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #d6d3d1;">
      <p style="margin: 0 0 12px; color: #57534e; font-size: 12px;">Oorspronkelijk bericht van ${escapeHtml(email.from)}</p>
      <blockquote style="margin: 0; padding-left: 16px; border-left: 3px solid #d6d3d1; color: #44403c;">
        ${email.htmlBody ?? escapeReplyHtml(originalText)}
      </blockquote>
    </div>
  `.trim();

  const headers =
    params.action === 'reply' && email.messageId
      ? {
          'In-Reply-To': email.messageId,
          References: email.messageId,
        }
      : undefined;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${config.resendApiKey}`,
      'content-type': 'application/json',
      'user-agent': 'crossvillage-booking-service/1.0',
    },
    body: JSON.stringify({
      from: config.resendFromEmail,
      to: params.to,
      subject: params.subject,
      text: `${params.textBody}\n\n---\n\n${quotedOriginalText}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
          ${escapeReplyHtml(params.textBody)}
          ${quotedOriginalHtml}
        </div>
      `.trim(),
      ...(config.resendReplyTo ? { reply_to: config.resendReplyTo } : {}),
      ...(headers ? { headers } : {}),
    }),
  });

  const payload = (await response.json().catch(() => null)) as
    | {
        id?: string;
        message?: string;
        name?: string;
      }
    | null;

  if (!response.ok || !payload?.id) {
    throw new Error(payload?.message ?? payload?.name ?? `Resend returned HTTP ${response.status}.`);
  }

  return { id: payload.id };
}
