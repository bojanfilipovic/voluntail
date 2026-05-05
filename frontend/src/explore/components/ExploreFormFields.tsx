import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EXPLORE_INTENTS, type ExploreIntent } from '@/explore/types'
import { intentLabel } from '@/explore/labels'

type Props = {
  /** Controlled — display name in storage (never empty; funny fallback). */
  displayName: string
  onDisplayNameChange: (value: string) => void
  intent: ExploreIntent
  onIntentChange: (v: ExploreIntent) => void
  /** Suffix to keep ids unique in DOM when form appears twice (pre-deck + settings). */
  idSuffix: string
}

export function ExploreFormFields({
  displayName,
  onDisplayNameChange,
  intent,
  onIntentChange,
  idSuffix,
}: Props) {
  const s = (k: string) => `${k}-${idSuffix}`

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor={s('name')}>What should we call you?</Label>
        <Input
          id={s('name')}
          value={displayName}
          onChange={(e) => onDisplayNameChange(e.target.value)}
          autoComplete="nickname"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={s('intent')}>I&apos;m here to…</Label>
        <select
          id={s('intent')}
          className="border-input bg-background ring-offset-background h-9 w-full rounded-md border px-3 text-sm"
          value={intent}
          onChange={(e) => onIntentChange(e.target.value as ExploreIntent)}
        >
          {EXPLORE_INTENTS.map((i) => (
            <option key={i} value={i}>
              {intentLabel(i)}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
