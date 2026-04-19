/** Shared fetch helpers for JSON APIs (keeps error messages stable for UX). */

export async function readErrorBody(res: Response): Promise<string> {
  return (await res.text().catch(() => '')).trim()
}

export async function parseJsonResponse(
  res: Response,
  invalidJsonMessage: string,
): Promise<unknown> {
  try {
    return await res.json()
  } catch {
    throw new Error(invalidJsonMessage)
  }
}

export async function rejectWithResponseBody(
  res: Response,
  fallback: string,
): Promise<never> {
  const detail = await readErrorBody(res)
  throw new Error(detail || fallback || `HTTP ${res.status}`)
}
