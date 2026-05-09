import { directoryStatsResponseSchema } from '@/schemas/directoryStats'
import { buildCmsHeaders } from '@/lib/cmsHeaders'
import { fetchJsonZod } from '@/lib/apiRequest'

const STATS_URL = '/api/directory-stats'

export async function fetchDirectoryStats() {
  return fetchJsonZod(
    STATS_URL,
    { headers: { ...buildCmsHeaders() } },
    'Invalid JSON from /api/directory-stats',
    directoryStatsResponseSchema,
    'publicRead',
  )
}
