import { Link } from 'react-router-dom';

import { SeoHead } from '@/components/SeoHead';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { siteCopy } from '@/lib/site-copy';

export function TermsPage() {
  const { locale, localizePath } = useI18n();
  const copy = siteCopy[locale].terms;

  return (
    <>
      <SeoHead
        title={copy.seoTitle}
        description={copy.seoDescription}
        canonicalPath={localizePath('/voorwaarden')}
      />

      <section className="rounded-[2rem] border border-white/10 bg-card/80 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.24)] sm:p-7">
        <div className="max-w-2xl space-y-3">
          <h1 className="font-display text-3xl font-bold uppercase tracking-[0.04em] text-white sm:text-4xl">
            {copy.title}
          </h1>
          <p className="text-sm leading-7 text-stone-300 sm:text-base">
            {copy.intro}
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {copy.sections.map((section) => (
            <article key={section.title} className="rounded-[1.75rem] border border-white/10 bg-black/15 p-5">
              <h2 className="text-xl font-semibold text-white">{section.title}</h2>
              <div className="mt-3 space-y-4 text-sm leading-7 text-stone-300">
                {section.body.split('\n\n').map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}