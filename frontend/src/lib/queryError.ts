export function toQueryError(error: unknown): Error | null {
  if (!error) return null
  if (error instanceof Error) return error
  return new Error(typeof error === 'string' ? error : 'Request failed')
}
