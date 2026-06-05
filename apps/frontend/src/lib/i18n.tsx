import { createContext, useContext } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';

export const supportedLocales = ['nl', 'en'] as const;
export type Locale = (typeof supportedLocales)[number];

const normalizeAppBasePath = (value: string | undefined) => {
  const normalizedValue = value?.trim() ?? '';

  if (!normalizedValue || normalizedValue === '/') {
    return '';
  }

  return `/${normalizedValue.replace(/^\/+|\/+$/g, '')}`;
};

export const appBasePath = normalizeAppBasePath(import.meta.env.VITE_APP_BASE_PATH);

type Copy = {
  language: {
    label: string;
    switchLabel: string;
  };
  nav: {
    units: string;
    location: string;
    faq: string;
    terms: string;
    bookNow: string;
    backToHomepage: string;
  };
  footer: {
    summary: string;
  };
};

const copyByLocale: Record<Locale, Copy> = {
  nl: {
    language: {
      label: 'Taal',
      switchLabel: 'Wijzig taal',
    },
    nav: {
      units: 'Units',
      location: 'Locatie',
      faq: 'FAQ',
      terms: 'Voorwaarden',
      bookNow: 'Boek nu',
      backToHomepage: 'Terug naar de homepage',
    },
    footer: {
      summary: 'Warme woonunits op slechts 6 minuten rijden van het EK Veldrijden in Zeddam.',
    },
  },
  en: {
    language: {
      label: 'Language',
      switchLabel: 'Change language',
    },
    nav: {
      units: 'Units',
      location: 'Location',
      faq: 'FAQ',
      terms: 'Terms',
      bookNow: 'Book now',
      backToHomepage: 'Back to homepage',
    },
    footer: {
      summary: 'Warm accommodation units just 6 minutes by car from the 2026 European Cyclo-cross Championships in Zeddam.',
    },
  },
};

type I18nContextValue = {
  locale: Locale;
  copy: Copy;
  localizePath: (path: string) => string;
  setLocale: (locale: Locale) => void;
  locales: typeof supportedLocales;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function isSupportedLocale(value: string | null | undefined): value is Locale {
  return value === 'nl' || value === 'en';
}

function splitPath(path: string) {
  const hashIndex = path.indexOf('#');
  const hash = hashIndex >= 0 ? path.slice(hashIndex) : '';
  const withoutHash = hashIndex >= 0 ? path.slice(0, hashIndex) : path;
  const searchIndex = withoutHash.indexOf('?');
  const search = searchIndex >= 0 ? withoutHash.slice(searchIndex) : '';
  const pathname = searchIndex >= 0 ? withoutHash.slice(0, searchIndex) : withoutHash;

  return { pathname, search, hash };
}

function stripAppBasePath(pathname: string) {
  if (!appBasePath) {
    return pathname;
  }

  if (pathname === appBasePath) {
    return '/';
  }

  if (pathname.startsWith(`${appBasePath}/`)) {
    return pathname.slice(appBasePath.length) || '/';
  }

  return pathname;
}

export function withAppBasePath(path: string) {
  const { pathname, search, hash } = splitPath(path);
  const normalizedPathname = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const prefixedPathname = appBasePath
    ? `${appBasePath}${normalizedPathname === '/' ? '' : normalizedPathname}`
    : normalizedPathname;

  return `${prefixedPathname || '/'}${search}${hash}`;
}

export function resolvePublicAssetPath(path: string) {
  const normalizedPath = path.replace(/^\/+/, '');

  return `${import.meta.env.BASE_URL}${normalizedPath}`;
}

export function normalizeLocale(value: string | undefined): Locale {
  return isSupportedLocale(value) ? value : 'nl';
}

export function buildLocalizedPath(locale: Locale, path: string) {
  const { pathname, search, hash } = splitPath(path);
  const segments = stripAppBasePath(pathname).split('/').filter(Boolean);

  if (isSupportedLocale(segments[0])) {
    segments.shift();
  }

  const localizedPath = ['/', locale, ...segments].join('/').replace(/\/+/g, '/');
  const normalizedPath = localizedPath === `/${locale}/` ? `/${locale}` : localizedPath;

  return withAppBasePath(`${normalizedPath}${search}${hash}`);
}

export function getPreferredLocale() {
  if (typeof window === 'undefined') {
    return 'nl' as const;
  }

  const storedLocale = window.localStorage.getItem('preferredLocale');

  if (isSupportedLocale(storedLocale)) {
    return storedLocale;
  }

  const browserLocale = (window.navigator.languages?.[0] ?? window.navigator.language ?? 'nl').toLowerCase();

  return browserLocale.startsWith('en') ? 'en' : 'nl';
}

export function formatCurrency(value: number, locale: Locale) {
  const intlLocale = locale === 'en' ? 'en-GB' : 'nl-NL';

  return new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function LocaleRedirect() {
  const location = useLocation();
  const locale = getPreferredLocale();

  return <Navigate to={buildLocalizedPath(locale, `${location.pathname}${location.search}${location.hash}`)} replace />;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const locale = normalizeLocale(params.locale);

  const setLocale = (nextLocale: Locale) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('preferredLocale', nextLocale);
    }

    navigate(buildLocalizedPath(nextLocale, `${location.pathname}${location.search}${location.hash}`));
  };

  const value: I18nContextValue = {
    locale,
    copy: copyByLocale[locale],
    localizePath: (path) => buildLocalizedPath(locale, path),
    setLocale,
    locales: supportedLocales,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used within a LocaleProvider');
  }

  return context;
}