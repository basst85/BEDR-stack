import { SeoHead } from '@/components/SeoHead';
import { useI18n } from '@/lib/i18n';
import { siteCopy } from '@/lib/site-copy';

export function AboutPage() {
  const { locale, localizePath } = useI18n();
  const copy = siteCopy[locale].about;
  const contactEmail = 'contact@booking.crossvillagezeddam.com';

  return (
    <>
      <SeoHead
        title={copy.seoTitle}
        description={copy.seoDescription}
        canonicalPath={localizePath('/over-ons')}
      />

      <section className="rounded-[2rem] border border-white/10 bg-card/80 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.24)] sm:p-7">
        <article className="rounded-[1.75rem] border border-white/10 bg-black/15 p-5 sm:p-6">
          <div className="max-w-3xl space-y-3">
            <h1 className="font-display text-3xl font-bold uppercase tracking-[0.04em] text-white sm:text-4xl">
              {copy.title}
            </h1>
            <p className="text-base leading-8 text-stone-200 sm:text-lg">
              {copy.intro}
            </p>
          </div>

          <div className="mt-8 space-y-6">
            {copy.sections.map((section) => (
              <section key={section.title} className="space-y-3">
                <h2 className="text-2xl font-semibold text-white">{section.title}</h2>
                <div className="space-y-4 text-sm leading-7 text-stone-300 sm:text-base">
                  {section.body.split('\n\n').map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}

            <div className="space-y-2 border-t border-white/10 pt-6">
              <p className="text-sm leading-7 text-stone-200">{copy.closing}</p>
              <p className="text-lg font-semibold text-white">{copy.signature}</p>
              <p className="text-sm leading-7 text-stone-300">
                Contact: <a href={`mailto:${contactEmail}`} className="text-[#D6CAA0] underline underline-offset-4">{contactEmail}</a>
              </p>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
