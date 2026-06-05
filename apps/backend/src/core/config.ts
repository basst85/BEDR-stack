import { type UnitTypeValue, unitTypeValues } from '@backend/modules/booking/booking.model';

const getEnv = (name: string, fallback: string) => process.env[name] ?? fallback;

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
  bmsUser: getEnv('BMS_USER', 'crossvillage'),
  bmsPassword: getEnv('BMS_PASSWORD', 'admin123'),
};
