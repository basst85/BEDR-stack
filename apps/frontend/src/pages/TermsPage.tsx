import { Link } from 'react-router-dom';

import { SeoHead } from '@/components/SeoHead';
import { Button } from '@/components/ui/button';

const sections = [
  {
    title: '1. Reserveringsaanvraag',
    body:
      'Een reservering via deze funnel geldt als aanvraag. VeloVillage bevestigt de aanvraag pas nadat beschikbaarheid, verblijfsperiode en operationele haalbaarheid zijn gecontroleerd.',
  },
  {
    title: '2. Voorraadlimiet',
    body:
      'Per unitsoort zijn maximaal vijf exemplaren beschikbaar. Zodra de backendlimiet is bereikt, kan er voor dat type geen nieuwe aanvraag meer worden ingediend.',
  },
  {
    title: '3. Gebruik van de units',
    body:
      'De units zijn tijdelijke woonvoorzieningen voor het EK-weekend en dienen zorgvuldig te worden gebruikt. Bezetting mag het opgegeven maximum van het gekozen type niet overschrijden.',
  },
  {
    title: '4. Wijzigingen en annulering',
    body:
      'Definitieve wijzigings- en annuleringsregels worden meegeleverd in de bevestiging. Deze pagina toont de compacte productversie van de voorwaarden voor de funnel.',
  },
  {
    title: '5. Betaling',
    body:
      'De huidige flow registreert aanvragen. In een vervolgfase kan deze stap gekoppeld worden aan directe online betaling of een factuurtraject.',
  },
] as const;

export function TermsPage() {
  return (
    <>
      <SeoHead
        title="Voorwaarden | VeloVillage Zeddam"
        description="Compacte voorwaardenpagina voor de VeloVillage booking funnel, inclusief voorraadlimiet per unitsoort."
        canonicalPath="/voorwaarden"
      />

      <section className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-card/80 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.24)] sm:p-7 lg:p-10">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs uppercase tracking-[0.28em] text-stone-400">Algemene voorwaarden</p>
          <h1 className="font-display text-3xl font-bold uppercase tracking-[0.04em] text-white sm:text-4xl">
            Compact, duidelijk en afgestemd op een korte eventfunnel
          </h1>
          <p className="text-sm leading-7 text-stone-300 sm:text-base">
            Voor VeloVillage is dit bewust een lichte subpagina. De voorwaarden ondersteunen de conversie, zonder de gebruiker uit de boekingsflow te trekken.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {sections.map((section) => (
            <article key={section.title} className="rounded-[1.75rem] border border-white/10 bg-black/15 p-5">
              <h2 className="text-xl font-semibold text-white">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-stone-300">{section.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="rounded-full bg-[#76BD23] text-[#10311c] hover:bg-[#6eb220]">
            <Link to="/boeken">Terug naar boeken</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full border-[#00953B]/25 bg-[#1C5733]/16 text-white hover:bg-[#1C5733]/22">
            <Link to="/">Naar homepage</Link>
          </Button>
        </div>
      </section>
    </>
  );
}