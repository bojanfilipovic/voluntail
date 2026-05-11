import type { Shelter } from '@/api/shelters'
import { buttonVariants } from '@/components/ui/button'
import { useI18n } from '@/i18n/I18nContext'
import { speciesLabel } from '@/domain/species'
import { cn } from '@/lib/utils'

export function ShelterDetailsPanel({
  shelter,
  onShelterClick,
}: {
  shelter: Shelter
  onShelterClick: () => void
}) {
  const { t } = useI18n()
  return (
    <div
      className="border-border bg-muted/30 space-y-3 rounded-lg border p-3 text-sm"
      id="animal-dialog-shelter-details"
    >
      <button
        type="button"
        className="text-primary text-sm font-medium underline-offset-4 hover:underline"
        onClick={onShelterClick}
      >
        {shelter.name}
      </button>
      <p className="text-muted-foreground text-sm">
        {shelter.city}
        {shelter.species.length ? ` · ${shelter.species.map(speciesLabel).join(', ')}` : ''}
      </p>
      <p className="text-foreground/95 leading-relaxed">{shelter.description}</p>
      <div className="flex flex-wrap gap-2">
        {shelter.signupUrl ? (
          <a
            href={shelter.signupUrl}
            rel="noreferrer noopener"
            target="_blank"
            className={cn(buttonVariants({ variant: 'default', size: 'sm' }))}
          >
            {t('outbound.volunteer')}
          </a>
        ) : null}
        {shelter.donationUrl ? (
          <a
            href={shelter.donationUrl}
            rel="noreferrer noopener"
            target="_blank"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            {t('outbound.donate')}
          </a>
        ) : null}
      </div>
    </div>
  )
}
