import { useSyncExternalStore } from 'react'

/** `true` when viewport is at least Tailwind `sm` (640px). */
export function useSmUp(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia('(min-width: 640px)')
      mq.addEventListener('change', onStoreChange)
      return () => mq.removeEventListener('change', onStoreChange)
    },
    () => window.matchMedia('(min-width: 640px)').matches,
    () => true,
  )
}
