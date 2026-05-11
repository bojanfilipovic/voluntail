import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EXPLORE_INTENT_MESSAGE_KEYS } from '@/explore/labels'
import { EXPLORE_INTENTS, type ExploreIntent } from '@/explore/types'
import { pickFunnyDisplayName } from '@/explore/funnyDisplayNames'
import { useI18n } from '@/i18n/I18nContext'
import { Dices } from 'lucide-react'

type Props = {
  /** Controlled — display name in storage (never empty; funny fallback). */
  displayName: string
  onDisplayNameChange: (value: string) => void
  intent: ExploreIntent
  onIntentChange: (v: ExploreIntent) => void
  /** Suffix to keep ids unique in DOM when form appears twice (pre-deck + settings). */
  idSuffix: string
  /** If true, show only the name field (no intent selector). */
  nameOnly?: boolean
}

export function ExploreFormFields({
  displayName,
  onDisplayNameChange,
  intent,
  onIntentChange,
  idSuffix,
  nameOnly = false,
}: Props) {
  const { t } = useI18n()
  const s = (k: string) => `${k}-${idSuffix}`

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor={s('name')}>{t('explore.form.nameLabel')}</Label>
        <div className="flex gap-2">
          <Input
            id={s('name')}
            value={displayName}
            onChange={(e) => onDisplayNameChange(e.target.value)}
            autoComplete="nickname"
            className="min-w-0 flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0 transition active:scale-95"
            onClick={() => onDisplayNameChange(pickFunnyDisplayName())}
            aria-label={t('explore.form.randomNameAria')}
            title={t('explore.form.randomNameTitle')}
          >
            <Dices className="size-4" />
          </Button>
        </div>
      </div>
      {!nameOnly && (
        <div className="grid gap-2">
          <Label htmlFor={s('intent')}>{t('explore.form.intentLabel')}</Label>
          <select
            id={s('intent')}
            className="border-input bg-background ring-offset-background h-9 w-full rounded-md border px-3 text-sm"
            value={intent}
            onChange={(e) => onIntentChange(e.target.value as ExploreIntent)}
          >
            {EXPLORE_INTENTS.map((i) => (
              <option key={i} value={i}>
                {t(EXPLORE_INTENT_MESSAGE_KEYS[i])}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
