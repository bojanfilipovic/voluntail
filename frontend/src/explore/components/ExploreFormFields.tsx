import { SPECIES_VALUES, speciesLabel, type ShelterSpecies } from '@/domain/species'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EXPLORE_INTENTS, type ExploreIntent, type ExploreSpeciesMode } from '@/explore/types'
import { intentLabel } from '@/explore/labels'

type Props = {
  /** Controlled — display name in storage (never empty; funny fallback). */
  displayName: string
  onDisplayNameChange: (value: string) => void
  intent: ExploreIntent
  onIntentChange: (v: ExploreIntent) => void
  speciesMode: ExploreSpeciesMode
  onSpeciesModeChange: (v: ExploreSpeciesMode) => void
  rememberNo: boolean
  onRememberNoChange: (v: boolean) => void
  /** Suffix to keep ids unique in DOM when form appears twice (pre-deck + settings). */
  idSuffix: string
}

export function ExploreFormFields({
  displayName,
  onDisplayNameChange,
  intent,
  onIntentChange,
  speciesMode,
  onSpeciesModeChange,
  rememberNo,
  onRememberNoChange,
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
        <p className="text-muted-foreground text-xs">Leave as-is, or set your own. We use this on match moments and your matches row.</p>
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
        <p className="text-muted-foreground text-xs">Doesn&apos;t change the deck yet; we use it in the experience later.</p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor={s('species')}>Animals</Label>
        <select
          id={s('species')}
          className="border-input bg-background ring-offset-background h-9 w-full rounded-md border px-3 text-sm"
          value={speciesMode}
          onChange={(e) => {
            const v = e.target.value
            onSpeciesModeChange(v === 'all' ? 'all' : (v as ShelterSpecies))
          }}
        >
          <option value="all">All species in the list</option>
          {SPECIES_VALUES.map((sp) => (
            <option key={sp} value={sp}>
              {speciesLabel(sp)} only
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          className="border-input mt-1 size-4 rounded"
          id={s('remember')}
          checked={rememberNo}
          onChange={(e) => onRememberNoChange(e.target.checked)}
        />
        <div className="min-w-0">
          <Label htmlFor={s('remember')}>Remember “not for me” for small lists</Label>
          <p className="text-muted-foreground text-xs">
            When on, we store passes so you do not see them again. When off, passes are forgotten when you
            leave Explore.
          </p>
        </div>
      </div>
    </div>
  )
}
