import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

import { Button } from '@/components/ui/button';

export function App() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/#units', label: 'Units' },
    { href: '/#location', label: 'Locatie' },
    { href: '/#faq', label: 'FAQ' },
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="relative isolate overflow-hidden">
      <main className="mx-auto min-h-screen w-full max-w-5xl px-4 pb-8 pt-4 sm:px-6 lg:pb-10">
        <header className="border-border/70 bg-card/65 sticky top-3 z-20 mb-5 rounded-[1.5rem] border px-4 py-3 backdrop-blur-xl sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Link to="/" className="space-y-1">
                <p className="font-display text-xl font-extrabold tracking-[0.08em] text-white sm:text-2xl">
                  VeloVillage
                </p>
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
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
                  to="/voorwaarden"
                  className="rounded-full border border-border/60 px-3 py-1.5 text-sm text-stone-200 transition hover:border-[#76BD23]/70 hover:bg-[#1C5733]/18 hover:text-white"
                >
                  Voorwaarden
                </NavLink>
              </nav>

              <Button asChild size="sm" className="rounded-full bg-[#76BD23] px-4 text-[#10311c] hover:bg-[#6eb220]">
                <Link to="/boeken" onClick={closeMobileMenu}>Boek nu</Link>
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
                to="/voorwaarden"
                onClick={closeMobileMenu}
                className="rounded-2xl border border-border/60 bg-black/10 px-4 py-3 text-sm text-stone-100 transition hover:border-[#76BD23]/70 hover:bg-[#1C5733]/18 hover:text-white"
              >
                Voorwaarden
              </NavLink>
            </nav>
          ) : null}

          {!isHome ? (
            <div className="mt-4 border-t border-white/8 pt-4 text-sm text-stone-300">
              <Link to="/" onClick={closeMobileMenu} className="transition hover:text-white">
                Terug naar de homepage
              </Link>
            </div>
          ) : null}
        </header>

        <Outlet />

        <footer className="mt-6 px-1 text-sm text-stone-400">
          <p>Warme woonunits op loopafstand van het EK Veldrijden in Zeddam.</p>
        </footer>
      </main>
    </div>
  );
}