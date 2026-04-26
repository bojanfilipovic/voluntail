import { describe, expect, it } from 'vitest'
import {
  errorMessageFromResponse,
  friendlyHttpStatusMessage,
  isProbablyInfrastructureErrorBody,
  plainTextErrorBody,
} from '@/lib/apiErrors'

describe('friendlyHttpStatusMessage', () => {
  it('maps gateway and upstream errors', () => {
    const m502 = friendlyHttpStatusMessage(502)
    expect(
      m502.includes('Could not reach') || m502.includes("couldn’t reach") || m502.includes("couldn't reach"),
    ).toBe(true)
    const m503 = friendlyHttpStatusMessage(503)
    expect(
      m503.includes('Could not reach') || m503.includes("couldn’t reach") || m503.includes("couldn't reach"),
    ).toBe(true)
  })

  it('maps client errors without raw codes in message', () => {
    expect(friendlyHttpStatusMessage(401)).toContain('CMS')
    expect(friendlyHttpStatusMessage(403)).toContain('not allowed')
  })

  it('distinguishes 404 for public read vs default', () => {
    const pub = friendlyHttpStatusMessage(404, 'publicRead')
    expect(pub.toLowerCase()).toContain('directory')
    const d = friendlyHttpStatusMessage(404, 'default')
    expect(d.toLowerCase()).toMatch(/find|removed/)
  })
})

describe('isProbablyInfrastructureErrorBody', () => {
  it('flags common edge host 404 text', () => {
    expect(
      isProbablyInfrastructureErrorBody('The page could not be found NOT_NOTHING'),
    ).toBe(true)
    expect(isProbablyInfrastructureErrorBody('x NOT_FOUND y')).toBe(true)
  })

  it('flags platform-style ids', () => {
    expect(
      isProbablyInfrastructureErrorBody(
        'The page could not be found NOT_FOUND fra1::lv7zs-1777231719446-65b550e07cec',
      ),
    ).toBe(true)
  })

  it('is false for short or normal API text', () => {
    expect(isProbablyInfrastructureErrorBody('bad')).toBe(false)
    expect(isProbablyInfrastructureErrorBody('shelterId and animalId do not refer to a valid pair')).toBe(
      false,
    )
  })
})

describe('errorMessageFromResponse', () => {
  it('replaces infrastructure-looking bodies with friendly line', async () => {
    const res = new Response('The page could not be found NOT_FOUND fra1::x-y', {
      status: 404,
    })
    const msg = await errorMessageFromResponse(res, 'publicRead')
    expect(msg.toLowerCase()).toContain('directory')
  })

  it('keeps trusted short plain text', async () => {
    const res = new Response('suggestion message too long', { status: 400 })
    const msg = await errorMessageFromResponse(res, 'default')
    expect(msg).toContain('suggestion message too long')
  })
})

describe('plainTextErrorBody', () => {
  it('returns null for HTML', () => {
    expect(plainTextErrorBody('<!DOCTYPE html><html>')).toBeNull()
  })

  it('returns short plain text', () => {
    expect(plainTextErrorBody(' Missing field ')).toBe('Missing field')
  })
})
