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
const configuredCorsOrigins = getEnv('CORS_ORIGIN', '')
  .split(',')
  .map((origin) => normalizeOrigin(origin.trim()))
  .filter(Boolean);

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
  cookieName: getEnv('COOKIE_NAME', 'bedr_session'),
  jwtSecret: resolveJwtSecret(),
  databaseUrl: getEnv('DATABASE_URL', 'dev.db'),
};
