import { useEffect, useRef, useState } from 'react'
import type { Animal } from '@/api/animals'
import { clearAnimalIdFromUrl, getAnimalIdFromUrl } from '@/directory/urlState'

/** Opens the animal detail flow once when `?animal=` is present and the list has loaded. */
export function useAnimalDeepLink(
  animals: Animal[] | undefined,
  onSelectAnimal: (animal: Animal) => void,
) {
  const [initialAnimalId] = useState(getAnimalIdFromUrl)
  const deepLinkHandled = useRef(false)

  useEffect(() => {
    if (!initialAnimalId || deepLinkHandled.current || !animals) return
    deepLinkHandled.current = true
    const target = animals.find((a) => a.id === initialAnimalId)
    clearAnimalIdFromUrl()
    if (!target) return
    const id = requestAnimationFrame(() => onSelectAnimal(target))
    return () => cancelAnimationFrame(id)
  }, [initialAnimalId, animals, onSelectAnimal])
}
