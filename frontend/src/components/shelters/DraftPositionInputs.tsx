import type { MapCenter } from '@/components/ShelterMap'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Props = {
  idPrefix: string
  draftLocation: MapCenter
}

/**
 * Lat/lon for shelter forms; remount when draft pin moves via parent key so defaults stay in sync.
 */
export function DraftPositionInputs({ idPrefix, draftLocation }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-lat`}>Latitude</Label>
        <Input
          id={`${idPrefix}-lat`}
          name="latitude"
          inputMode="decimal"
          required
          defaultValue={String(draftLocation.latitude)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-lng`}>Longitude</Label>
        <Input
          id={`${idPrefix}-lng`}
          name="longitude"
          inputMode="decimal"
          required
          defaultValue={String(draftLocation.longitude)}
        />
      </div>
    </div>
  )
}
