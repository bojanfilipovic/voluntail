import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n/I18nContext'

type Props = {
  cmsBusy: boolean
  canAddAnimal: boolean
  onAddAnimal: () => void
}

/** Curator-only strip below the directory list; same visibility rules as map CMS toolbar. */
export function AnimalCmsToolbar({ cmsBusy, canAddAnimal, onAddAnimal }: Props) {
  const { t } = useI18n()

  return (
    <div
      className="border-border bg-muted/40 flex flex-shrink-0 flex-wrap items-center gap-2 border-t px-3 py-2"
      role="toolbar"
      aria-label={t('animalCms.toolbarAria')}
    >
      <Button
        type="button"
        size="sm"
        variant="default"
        disabled={cmsBusy || !canAddAnimal}
        onClick={onAddAnimal}
      >
        {t('animalCms.addAnimal')}
      </Button>
    </div>
  )
}
