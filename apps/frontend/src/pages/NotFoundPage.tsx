import { Link, useLocation } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { buildLocalizedPath, normalizeLocale } from '@/lib/i18n';

export function NotFoundPage() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const localeFromPath = normalizeLocale(pathSegments.find((segment) => segment === 'nl' || segment === 'en'));
  const isEnglish = localeFromPath === 'en';

  return (
    <section className="rounded-[2rem] border border-white/10 bg-card/80 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.24)] sm:p-7">
      <div className="max-w-2xl space-y-4">
        <p className="text-xs uppercase tracking-[0.28em] text-stone-400">404</p>
        <h1 className="font-display text-3xl font-bold uppercase tracking-[0.04em] text-white sm:text-4xl">
          {isEnglish ? 'Page not found' : 'Pagina niet gevonden'}
        </h1>
        <p className="text-sm leading-7 text-stone-300 sm:text-base">
          {isEnglish
            ? 'This page does not exist or is no longer available.'
            : 'Deze pagina bestaat niet of is niet langer beschikbaar.'}
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild className="rounded-full bg-[#76BD23] text-[#10311c] hover:bg-[#6eb220]">
          <Link to={buildLocalizedPath(localeFromPath, '/')}>{isEnglish ? 'Back to homepage' : 'Terug naar homepage'}</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full border-[#00953B]/25 bg-[#1C5733]/16 text-white hover:bg-[#1C5733]/22">
          <Link to={buildLocalizedPath(localeFromPath, '/boeken')}>{isEnglish ? 'Book now' : 'Boek nu'}</Link>
        </Button>
      </div>
    </section>
  );
}