import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { type UnitTypeValue, unitTypeValues } from '@backend/modules/booking/booking.model';

const parseDotEnvValue = (rawValue: string) => {
  const trimmedValue = rawValue.trim();

  if (
    (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) ||
    (trimmedValue.startsWith("'") && trimmedValue.endsWith("'"))
  ) {
    return trimmedValue.slice(1, -1);
  }

  return trimmedValue;
};

const loadEnvFile = (path: string) => {
  if (!existsSync(path)) {
    return;
  }

  const contents = readFileSync(path, 'utf8');

  for (const line of contents.split(/\r?\n/)) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();

    if (!key || process.env[key] !== undefined) {
      continue;
    }

    process.env[key] = parseDotEnvValue(trimmedLine.slice(separatorIndex + 1));
  }
};

loadEnvFile(resolve(import.meta.dir, '../../../../.env'));
loadEnvFile(resolve(import.meta.dir, '../../.env'));

const getEnv = (name: string, fallback: string) => process.env[name] ?? fallback;
const getOptionalEnv = (name: string) => {
  const value = (process.env[name] ?? '').trim();
  return value ? value : '';
};

export const isProduction = process.env.NODE_ENV === 'production';

const insecureJwtSecret = 'change-me-in-production';
const configuredJwtSecret = (process.env.JWT_SECRET ?? '').trim();
const localCorsHosts = new Set(['localhost', '127.0.0.1']);

const resolveJwtSecret = () => {
  if (configuredJwtSecret && configuredJwtSecret !== insecureJwtSecret) {
    return configuredJwtSecret;
  }

  if (isProduction) {
    throw new Error('JWT_SECRET must be set to a strong, unique value in production.');
  }

  return `${crypto.randomUUID()}${crypto.randomUUID()}`;
};

const normalizeOrigin = (origin: string) => origin.replace(/\/$/, '');
const parseCsvEnv = (name: string) =>
  getEnv(name, '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

const configuredCorsOrigins = getEnv('CORS_ORIGIN', '')
  .split(',')
  .map((origin) => normalizeOrigin(origin.trim()))
  .filter(Boolean);
const configuredSiteUrl = normalizeOrigin(getEnv('VITE_SITE_URL', '').trim());

const collectAllowedImageHosts = () => {
  const allowedHosts = new Set(parseCsvEnv('IMAGE_ALLOWED_HOSTS'));

  const candidateUrls = [configuredSiteUrl, ...configuredCorsOrigins];

  for (const candidateUrl of candidateUrls) {
    if (!candidateUrl) {
      continue;
    }

    try {
      allowedHosts.add(new URL(candidateUrl).hostname);
    } catch {
      continue;
    }
  }

  return Array.from(allowedHosts);
};

const configuredImageAllowedHosts = collectAllowedImageHosts();

const parseNonNegativeIntegerEnv = (name: string, fallback: number) => {
  const rawValue = (process.env[name] ?? '').trim();

  if (!rawValue) {
    return fallback;
  }

  const parsedValue = Number(rawValue);

  if (!Number.isInteger(parsedValue) || parsedValue < 0) {
    throw new Error(`${name} must be set to a whole number greater than or equal to 0.`);
  }

  return parsedValue;
};

const bookingStockEnvByUnitType: Record<UnitTypeValue, string> = {
  '420': 'BOOKING_STOCK_420',
  '660': 'BOOKING_STOCK_660',
  '730': 'BOOKING_STOCK_730',
  '733': 'BOOKING_STOCK_733',
  '900': 'BOOKING_STOCK_900',
  cabine: 'BOOKING_STOCK_CABINE',
};

const bookingDefaultStockByUnitType: Record<UnitTypeValue, number> = {
  '420': 5,
  '660': 5,
  '730': 5,
  '733': 5,
  '900': 5,
  cabine: 8,
};

const bookingStockByUnitType = Object.fromEntries(
  unitTypeValues.map((unitType) => [
    unitType,
    parseNonNegativeIntegerEnv(bookingStockEnvByUnitType[unitType], bookingDefaultStockByUnitType[unitType]),
  ]),
) as Record<UnitTypeValue, number>;

const bookingPriceEnvByUnitType: Record<UnitTypeValue, string> = {
  '420': 'BOOKING_PRICE_420',
  '660': 'BOOKING_PRICE_660',
  '730': 'BOOKING_PRICE_730',
  '733': 'BOOKING_PRICE_733',
  '900': 'BOOKING_PRICE_900',
  cabine: 'BOOKING_PRICE_CABINE',
};

const bookingDefaultPriceByUnitType: Record<UnitTypeValue, number> = {
  '420': 150,
  '660': 170,
  '730': 300,
  '733': 320,
  '900': 400,
  cabine: 90,
};

const bookingPriceByUnitType = Object.fromEntries(
  unitTypeValues.map((unitType) => [
    unitType,
    parseNonNegativeIntegerEnv(bookingPriceEnvByUnitType[unitType], bookingDefaultPriceByUnitType[unitType]),
  ]),
) as Record<UnitTypeValue, number>;

export const isAllowedCorsOrigin = (origin: string | null) => {
  if (!origin) {
    return false;
  }

  const normalizedOrigin = normalizeOrigin(origin);

  if (configuredCorsOrigins.includes(normalizedOrigin)) {
    return true;
  }

  try {
    const { hostname } = new URL(normalizedOrigin);

    return localCorsHosts.has(hostname);
  } catch {
    return false;
  }
};

export const config = {
  port: Number(getEnv('PORT', '3000')),
  corsOrigins: configuredCorsOrigins,
  imageAllowedHosts: configuredImageAllowedHosts,
  cookieName: getEnv('COOKIE_NAME', 'bedr_session'),
  jwtSecret: resolveJwtSecret(),
  databaseUrl: getEnv('DATABASE_URL', 'dev.db'),
  bookingStockByUnitType,
  bookingPriceByUnitType,
  bmsUser: getEnv('BMS_USER', 'crossvillage'),
  bmsPassword: getEnv('BMS_PASSWORD', 'admin123'),
  resendApiKey: getOptionalEnv('RESEND_API_KEY'),
  resendAdminApiKey: getOptionalEnv('RESEND_ADMIN_API_KEY'),
  resendFromEmail: getOptionalEnv('RESEND_FROM_EMAIL'),
  resendReplyTo: getOptionalEnv('RESEND_REPLY_TO'),
};
