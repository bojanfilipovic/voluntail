import { describe, expect, it } from 'vitest'
import {
  parseJsonResponse,
  readErrorBody,
  rejectWithResponseBody,
} from '@/lib/http'

describe('readErrorBody', () => {
  it('returns trimmed text', async () => {
    const res = new Response('  hello  ')
    await expect(readErrorBody(res)).resolves.toBe('hello')
  })

  it('returns empty string on failure', async () => {
    const res = new Response(null)
    Object.defineProperty(res, 'text', {
      value: () => Promise.reject(new Error('fail')),
    })
    await expect(readErrorBody(res)).resolves.toBe('')
  })
})

describe('parseJsonResponse', () => {
  it('parses JSON body', async () => {
    const res = Response.json({ a: 1 })
    await expect(parseJsonResponse(res, 'bad')).resolves.toEqual({ a: 1 })
  })

  it('throws custom message when JSON is invalid', async () => {
    const res = new Response('not json')
    await expect(parseJsonResponse(res, 'bad json')).rejects.toThrow('bad json')
  })
})

describe('rejectWithResponseBody', () => {
  it('prefers response body text', async () => {
    const res = new Response('Missing field', { status: 400 })
    await expect(rejectWithResponseBody(res, 'fallback')).rejects.toThrow('Missing field')
  })

  it('uses fallback when body empty', async () => {
    const res = new Response('', { status: 403 })
    await expect(rejectWithResponseBody(res, 'fallback')).rejects.toThrow('fallback')
  })

  it('uses HTTP status when nothing else applies', async () => {
    const res = new Response('', { status: 418 })
    await expect(rejectWithResponseBody(res, '')).rejects.toThrow('HTTP 418')
  })
})
