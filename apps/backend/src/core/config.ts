const getEnv = (name: string, fallback: string) => process.env[name] ?? fallback;

export const isProduction = process.env.NODE_ENV === 'production';

const insecureJwtSecret = 'change-me-in-production';
const configuredJwtSecret = (process.env.JWT_SECRET ?? '').trim();

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

export const config = {
  port: Number(getEnv('PORT', '3000')),
  corsOrigins: getEnv('CORS_ORIGIN', 'http://localhost:5173')
    .split(',')
    .map((origin) => normalizeOrigin(origin.trim()))
    .filter(Boolean),
  cookieName: getEnv('COOKIE_NAME', 'bedr_session'),
  jwtSecret: resolveJwtSecret(),
  databaseUrl: getEnv('DATABASE_URL', 'dev.db'),
};
