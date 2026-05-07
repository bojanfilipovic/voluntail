/**
 * Unified fetch + JSON + Zod pipeline for `/api/*` calls.
 * Keeps network handling, error mapping, and parsing in one place.
 */

import {
  errorFromFetchFailure,
  errorMessageFromResponse,
  type PublicApiErrorContext,
} from '@/lib/apiErrors'
import { parseJsonResponse } from '@/lib/http'
import type { z } from 'zod'

export async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init)
  } catch (e) {
    throw errorFromFetchFailure(e)
  }
}

/** Merge JSON content-type with optional extra headers (e.g. CMS key). */
export function jsonHeaders(extra?: HeadersInit): HeadersInit {
  return {
    'Content-Type': 'application/json',
    ...extra,
  }
}

/**
 * Expect 2xx with a JSON body; map errors with {@link errorMessageFromResponse}, then parse with Zod.
 */
export async function fetchJsonZod<T>(
  url: string,
  init: RequestInit | undefined,
  invalidJsonMessage: string,
  schema: z.ZodType<T>,
  errorContext: PublicApiErrorContext = 'default',
): Promise<T> {
  const res = await apiFetch(url, init)
  if (!res.ok) {
    throw new Error(await errorMessageFromResponse(res, errorContext))
  }
  const raw = await parseJsonResponse(res, invalidJsonMessage)
  return schema.parse(raw)
}

/**
 * DELETE-style success: 204 or empty success with no JSON body.
 */
export async function fetchExpectEmpty(
  url: string,
  init: RequestInit | undefined,
  errorContext: PublicApiErrorContext = 'default',
): Promise<void> {
  const res = await apiFetch(url, init)
  if (res.status === 204) return
  if (!res.ok) {
    throw new Error(await errorMessageFromResponse(res, errorContext))
  }
}
