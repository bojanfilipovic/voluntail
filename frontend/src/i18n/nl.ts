/** Dutch UI copy — merged fragments; `MessageKey` is the contract for English parity. */
import { nlCatalog } from '@/i18n/messages/nl/catalog'
import { nlCore } from '@/i18n/messages/nl/core'
import { nlDirectoryShell } from '@/i18n/messages/nl/directoryShell'
import { nlExplore } from '@/i18n/messages/nl/explore'
import { nlMarketingPages } from '@/i18n/messages/nl/marketingPages'
import { nlSystemUi } from '@/i18n/messages/nl/systemUi'

export const nlMessages = {
  ...nlCore,
  ...nlDirectoryShell,
  ...nlSystemUi,
  ...nlCatalog,
  ...nlExplore,
  ...nlMarketingPages,
} as const

export type MessageKey = keyof typeof nlMessages
