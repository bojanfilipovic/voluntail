import { Link } from 'react-router-dom'

import { SeoHelmet } from '@/components/SeoHelmet'
import { MarketingLayout } from '@/marketing/MarketingLayout'

const TITLE = 'Hoe Voluntail werkt — kaart, directory en Explore'
const DESCRIPTION =
  'Voluntail is een Nederlandse orientatiehub: asielen en dieren op de kaart, met links naar officiële bronnen. Lees hoe directory en Explore samenhangen.'

export function HoeHetWerktPage() {
  return (
    <MarketingLayout>
      <SeoHelmet title={TITLE} description={DESCRIPTION} path="/hoe-het-werkt" />
      <article className="prose prose-neutral dark:prose-invert max-w-none">
        <h1 className="text-foreground text-3xl font-semibold tracking-tight">Hoe het werkt</h1>
        <p className="text-muted-foreground mt-4 text-[15px] leading-relaxed">
          Voluntail bundelt publieke informatie over dierenasielen en — waar beschikbaar — gepubliceerde
          dieren uit de pilot. Het doel is sneller de juiste officiële route te vinden.
        </p>
        <h2 className="text-foreground mt-10 text-xl font-semibold">Directory (kaart &amp; lijst)</h2>
        <p className="text-muted-foreground mt-3 text-[15px] leading-relaxed">
          Op de voorpagina combineer je kaart en lijsten. Je opent een asiel of dier om details te zien en
          gebruikt daarna de <strong className="text-foreground">outbound links</strong> naar het asiel
          (adoptie, vrijwilliger, donatie, enz.) waar die zijn ingevuld.
        </p>
        <h2 className="text-foreground mt-10 text-xl font-semibold">Explore</h2>
        <p className="text-muted-foreground mt-3 text-[15px] leading-relaxed">
          Explore is een apart scherm: je kiest voorkeuren en swipet door gepubliceerde dieren. Er zijn
          geen accounts; een shortlist leeft in je browser (`sessionStorage`). &quot;Match&quot; is een
          filter-fit, geen aanbevelings-algoritme op de server.
        </p>
        <h2 className="text-foreground mt-10 text-xl font-semibold">Feedback</h2>
        <p className="text-muted-foreground mt-3 text-[15px] leading-relaxed">
          Staat er iets niet kloppends of mis je een asiel? Gebruik &quot;Share feedback&quot; of de
          suggestie-flow in de app — dan kan het triaged worden.
        </p>
        <p className="text-muted-foreground mt-8 text-[15px] leading-relaxed">
          <Link to="/" className="text-primary font-medium underline underline-offset-4">
            Terug naar de kaart
          </Link>{' '}
          ·{' '}
          <Link
            to={{ pathname: '/', search: '?view=explore' }}
            className="text-primary font-medium underline underline-offset-4"
          >
            Naar Explore
          </Link>
        </p>
      </article>
    </MarketingLayout>
  )
}
