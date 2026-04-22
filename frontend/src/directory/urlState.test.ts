import { describe, expect, it } from 'vitest'
import { getAppViewFromSearchParams, type AppView } from './urlState'

function viewOf(search: string): AppView {
  return getAppViewFromSearchParams(
    search.startsWith('?') ? search : `?${search}`,
  )
}

describe('urlState', () => {
  it('treats explore only when ?view=explore', () => {
    expect(viewOf('view=explore')).toBe('explore')
    expect(viewOf('view=explore&foo=1')).toBe('explore')
    expect(viewOf('foo=1')).toBe('directory')
    expect(viewOf('view=directory')).toBe('directory')
    expect(viewOf('')).toBe('directory')
  })
})
