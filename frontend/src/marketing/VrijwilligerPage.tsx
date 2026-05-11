import { Link } from 'react-router-dom'

import { SeoHelmet } from '@/components/SeoHelmet'
import { MarketingLayout } from '@/marketing/MarketingLayout'

const TITLE = 'Vrijwilligerswerk bij een dierenasiel — Voluntail'
const DESCRIPTION =
  'Vind asielen in Nederland op de kaart. Vrijwilligerswerk meld je bij het asiel zelf — Voluntail linkt naar officiële vrijwilligers- en contactpagina’s waar beschikbaar.'

export function VrijwilligerPage() {
  return (
    <MarketingLayout>
      <SeoHelmet title={TITLE} description={DESCRIPTION} path="/vrijwilliger" />
      <article className="prose prose-neutral dark:prose-invert max-w-none">
        <h1 className="text-foreground text-3xl font-semibold tracking-tight">Vrijwilligerswerk</h1>
        <p className="text-muted-foreground mt-4 text-[15px] leading-relaxed">
          Asiels zijn vaak afhankelijk van vrijwilligers. Voluntail is een{' '}
          <strong className="text-foreground">startpunt</strong>: je ziet waar organisaties zitten en kunt
          doorklikken naar hun eigen site voor vrijwilligersinformatie, aanmelding of contact.
        </p>
        <h2 className="text-foreground mt-10 text-xl font-semibold">Wat Voluntail niet doet</h2>
        <p className="text-muted-foreground mt-3 text-[15px] leading-relaxed">
          Wij plaatsen je niet als vrijwilliger en plannen geen diensten. Dat blijft bij het asiel — zo
          blijft hun proces leidend en betrouwbaar.
        </p>
        <h2 className="text-foreground mt-10 text-xl font-semibold">Aan de slag</h2>
        <p className="text-muted-foreground mt-3 text-[15px] leading-relaxed">
          Open de{' '}
          <Link to="/" className="text-primary font-medium underline underline-offset-4">
            kaart
          </Link>
          , kies een asiel en gebruik de officiële links (bijv. aanmelden of website van het asiel).
        </p>
      </article>
    </MarketingLayout>
  )
}
