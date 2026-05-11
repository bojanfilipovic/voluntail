/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAPBOX_ACCESS_TOKEN?: string
  /** Same value as backend `CMS_API_KEY`; enables Add / Remove pin in the UI. */
  readonly VITE_CMS_API_KEY?: string
  /** Canonical public site URL (no trailing slash), e.g. https://voluntail.vercel.app — used for canonicals, OG, sitemap. */
  readonly VITE_SITE_ORIGIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
