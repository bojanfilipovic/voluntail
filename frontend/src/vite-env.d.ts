/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAPBOX_ACCESS_TOKEN?: string
  /** Same value as backend `CMS_API_KEY`; enables Add / Remove pin in the UI. */
  readonly VITE_CMS_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
