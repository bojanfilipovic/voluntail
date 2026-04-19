import { SPECIES_VALUES, speciesLabel, type ShelterSpecies } from '@/domain/species'

type Props = {
  idPrefix: string
  selected: ShelterSpecies[]
  onToggle: (species: ShelterSpecies) => void
}

export function ShelterSpeciesFieldset({ idPrefix, selected, onToggle }: Props) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-foreground mb-1.5 text-sm font-medium">Species</legend>
      <div className="flex flex-col gap-2">
        {SPECIES_VALUES.map((sp) => (
          <label
            key={sp}
            htmlFor={`${idPrefix}-species-${sp}`}
            className="flex cursor-pointer items-center gap-2 text-sm"
          >
            <input
              id={`${idPrefix}-species-${sp}`}
              type="checkbox"
              name="species"
              checked={selected.includes(sp)}
              onChange={() => onToggle(sp)}
              className="border-input accent-primary size-4 rounded"
            />
            <span>{speciesLabel(sp)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
