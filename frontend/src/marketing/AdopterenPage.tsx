import { Link } from 'react-router-dom'

import { SeoHelmet } from '@/components/SeoHelmet'
import { MarketingLayout } from '@/marketing/MarketingLayout'

const TITLE = 'Adopteren via een asiel — Voluntail'
const DESCRIPTION =
  'Voluntail helpt je om dierenasielen in Nederland te vinden. Adoptie verloopt altijd via het asiel zelf: bekijk dieren op de kaart en open de officiële adoptielink.'

export function AdopterenPage() {
  return (
    <MarketingLayout>
      <SeoHelmet title={TITLE} description={DESCRIPTION} path="/adopteren" />
      <article className="prose prose-neutral dark:prose-invert max-w-none">
        <h1 className="text-foreground text-3xl font-semibold tracking-tight">Adopteren</h1>
        <p className="text-muted-foreground mt-4 text-[15px] leading-relaxed">
          Wil je een dier adopteren? Op Voluntail zie je welke asielen en (published) dieren in de pilot
          zichtbaar zijn. Het echte adoptieproces — aanmelden, kennismaken, voorwaarden — gebeurt{' '}
          <strong className="text-foreground">altijd bij het asiel</strong>, via hun officiële website of
          hun eigen proces.
        </p>
        <h2 className="text-foreground mt-10 text-xl font-semibold">Hoe Voluntail helpt</h2>
        <ul className="text-muted-foreground mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed">
          <li>Oriëntatie op de kaart en in de lijst: waar zit welk asiel?</li>
          <li>Dieren bekijken en doorklikken naar de officiële pagina van het asiel.</li>
          <li>
            In Explore kun je anoniem door gepubliceerde dieren swipen; een match betekent alleen dat het
            bij je filters past — geen account op Voluntail.
          </li>
        </ul>
        <h2 className="text-foreground mt-10 text-xl font-semibold">Volgende stap</h2>
        <p className="text-muted-foreground mt-3 text-[15px] leading-relaxed">
          Ga naar de{' '}
          <Link to="/" className="text-primary font-medium underline underline-offset-4">
            kaart en directory
          </Link>{' '}
          of probeer{' '}
          <Link
            to={{ pathname: '/', search: '?view=explore' }}
            className="text-primary font-medium underline underline-offset-4"
          >
            Explore
          </Link>
          .
        </p>
      </article>
    </MarketingLayout>
  )
}
