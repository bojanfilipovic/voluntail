import { describe, expect, it } from 'vitest'
import {
  friendlyHttpStatusMessage,
  plainTextErrorBody,
} from '@/lib/apiErrors'

describe('friendlyHttpStatusMessage', () => {
  it('maps gateway and upstream errors', () => {
    expect(friendlyHttpStatusMessage(502)).toContain('Could not reach')
    expect(friendlyHttpStatusMessage(503)).toContain('Could not reach')
  })

  it('maps client errors without raw codes in message', () => {
    expect(friendlyHttpStatusMessage(401)).toContain('CMS')
    expect(friendlyHttpStatusMessage(403)).toContain('not allowed')
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
