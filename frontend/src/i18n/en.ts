import type { MessageKey } from '@/i18n/nl'
import { enCatalog } from '@/i18n/messages/en/catalog'
import { enCore } from '@/i18n/messages/en/core'
import { enDirectoryShell } from '@/i18n/messages/en/directoryShell'
import { enExplore } from '@/i18n/messages/en/explore'
import { enMarketingPages } from '@/i18n/messages/en/marketingPages'
import { enSystemUi } from '@/i18n/messages/en/systemUi'

/** English UI copy — must define every `MessageKey`. */
export const enMessages = {
  ...enCore,
  ...enDirectoryShell,
  ...enSystemUi,
  ...enCatalog,
  ...enExplore,
  ...enMarketingPages,
} satisfies Record<MessageKey, string>
