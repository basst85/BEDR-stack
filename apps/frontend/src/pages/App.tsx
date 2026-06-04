import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useI18n, type Locale } from '@/lib/i18n';

function LanguageSwitcher({ onSelect }: { onSelect?: () => void }) {
  const { copy, locale, locales, setLocale } = useI18n();
  const flagByLocale: Record<Locale, string> = {
    nl: 'NL',
    en: 'EN',
  };

  const flagIconByLocale: Record<Locale, string> = {
    nl: '🇳🇱',
    en: '🇬🇧',
  };

  return (
    <div className="flex items-center gap-1 rounded-full border border-border/60 bg-black/10 p-1 text-xs text-stone-200">
      {locales.map((item) => {
        const isActive = item === locale;

        return (
          <button
            key={item}
            type="button"
            onClick={() => {
              setLocale(item as Locale);
              onSelect?.();
            }}
            aria-label={`${copy.language.switchLabel}: ${flagByLocale[item as Locale]}`}
            title={flagByLocale[item as Locale]}
            className={`rounded-full px-2.5 py-1 font-semibold transition ${
              isActive
                ? 'bg-[#76BD23] text-[#10311c]'
                : 'text-stone-200 hover:bg-[#1C5733]/18 hover:text-white'
            }`}
          >
            <span className="text-sm leading-none">{flagIconByLocale[item as Locale]}</span>
          </button>
        );
      })}
    </div>
  );
}

export function App() {
  const location = useLocation();
  const { copy, localizePath } = useI18n();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: localizePath('/#units'), label: copy.nav.units },
    { href: localizePath('/#location'), label: copy.nav.location },
    { href: localizePath('/#faq'), label: copy.nav.faq },
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="relative isolate overflow-hidden">
      <div className="fixed inset-x-0 top-4 z-30 px-4 sm:px-6">
        <div className="mx-auto w-full max-w-5xl">
          <header className="border-border/70 bg-card/75 rounded-[1.5rem] border px-4 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Link to={localizePath('/')} className="space-y-1">
                <p className="font-display text-xl font-extrabold tracking-[0.08em] text-white sm:text-2xl">
                  CrossVillage
                </p>
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden lg:block">
                <LanguageSwitcher />
              </div>

              <nav className="hidden gap-2 overflow-x-auto pb-1 md:flex md:pb-0">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="rounded-full border border-border/60 px-3 py-1.5 text-sm text-stone-200 transition hover:border-[#76BD23]/70 hover:bg-[#1C5733]/18 hover:text-white"
                  >
                    {item.label}
                  </a>
                ))}
                <NavLink
                  to={localizePath('/voorwaarden')}
                  className="rounded-full border border-border/60 px-3 py-1.5 text-sm text-stone-200 transition hover:border-[#76BD23]/70 hover:bg-[#1C5733]/18 hover:text-white"
                >
                  {copy.nav.terms}
                </NavLink>
              </nav>

              <Button asChild size="sm" className="rounded-full bg-[#76BD23] px-4 text-[#10311c] hover:bg-[#6eb220]">
                <Link to={localizePath('/boeken')} onClick={closeMobileMenu}>{copy.nav.bookNow}</Link>
              </Button>

              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label={isMobileMenuOpen ? 'Sluit menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen((open) => !open)}
                className="size-10 rounded-full border border-border/60 text-stone-100 hover:border-[#76BD23]/70 hover:bg-[#1C5733]/18 hover:text-white md:hidden"
              >
                {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </Button>
            </div>
          </div>

          {isMobileMenuOpen ? (
            <nav className="mt-3 grid gap-2 border-t border-white/8 pt-3 md:hidden">
              <LanguageSwitcher onSelect={closeMobileMenu} />
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className="rounded-2xl border border-border/60 bg-black/10 px-4 py-3 text-sm text-stone-100 transition hover:border-[#76BD23]/70 hover:bg-[#1C5733]/18 hover:text-white"
                >
                  {item.label}
                </a>
              ))}
              <NavLink
                to={localizePath('/voorwaarden')}
                onClick={closeMobileMenu}
                className="rounded-2xl border border-border/60 bg-black/10 px-4 py-3 text-sm text-stone-100 transition hover:border-[#76BD23]/70 hover:bg-[#1C5733]/18 hover:text-white"
              >
                {copy.nav.terms}
              </NavLink>
            </nav>
          ) : null}

          </header>
        </div>
      </div>

      <main className="min-h-screen w-full pb-8 pt-28 sm:pt-30 lg:pb-10">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
          <Outlet />

          <footer className="mt-6 flex flex-col gap-3 px-1 text-sm text-stone-400 sm:flex-row sm:items-center sm:justify-between">
            <p>{copy.footer.summary}</p>
            <LanguageSwitcher />
          </footer>
        </div>
      </main>
    </div>
  );
}