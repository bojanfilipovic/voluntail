import { useEffect, useRef, useState } from 'react'
import { fetchAnimalById, type Animal } from '@/api/animals'
import { clearAnimalIdFromUrl, getAnimalIdFromUrl } from '@/directory/urlState'

/** Opens the animal detail flow once when `?animal=` is present and the list has loaded. */
export function useAnimalDeepLink(
  animals: Animal[] | undefined,
  onSelectAnimal: (animal: Animal) => void,
) {
  const [initialAnimalId] = useState(getAnimalIdFromUrl)
  const deepLinkHandled = useRef(false)

  useEffect(() => {
    if (!initialAnimalId || deepLinkHandled.current) return
    if (animals === undefined) return
    deepLinkHandled.current = true
    const fromList = animals.find((a) => a.id === initialAnimalId)
    clearAnimalIdFromUrl()
    if (fromList) {
      const id = requestAnimationFrame(() => onSelectAnimal(fromList))
      return () => cancelAnimationFrame(id)
    }
    let cancelled = false
    void (async () => {
      try {
        const fetched = await fetchAnimalById(initialAnimalId)
        if (!cancelled) onSelectAnimal(fetched)
      } catch {
        /* ignore missing / network */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [initialAnimalId, animals, onSelectAnimal])
}
