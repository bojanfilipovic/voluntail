import { describe, expect, it } from 'vitest'
import { listWebsiteHref } from '@/domain/listWebsiteHref'

describe('listWebsiteHref', () => {
  it('uses origin for non–Dierenbescherming URLs', () => {
    expect(listWebsiteHref('https://example.org/path/to/volunteer')).toBe('https://example.org')
  })

  it('strips final /contact for dierenbescherming.nl', () => {
    expect(
      listWebsiteHref(
        'https://www.dierenbescherming.nl/dierenasiel/de-kuipershoek/contact',
      ),
    ).toBe('https://www.dierenbescherming.nl/dierenasiel/de-kuipershoek/')
  })

  it('strips final /contact with trailing slash', () => {
    expect(
      listWebsiteHref('https://dierenbescherming.nl/dierenasiel/foo/contact/'),
    ).toBe('https://dierenbescherming.nl/dierenasiel/foo/')
  })

  it('falls back to origin when DBC path does not end with /contact', () => {
    expect(listWebsiteHref('https://www.dierenbescherming.nl/doneren')).toBe(
      'https://www.dierenbescherming.nl',
    )
  })

  it('handles subdomain of dierenbescherming.nl', () => {
    expect(listWebsiteHref('https://foo.dierenbescherming.nl/x/contact')).toBe(
      'https://foo.dierenbescherming.nl/x/',
    )
  })
})
