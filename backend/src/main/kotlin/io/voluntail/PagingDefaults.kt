package io.voluntail

/** Default page size for directory list endpoints. */
const val DEFAULT_PAGE_LIMIT = 50

/** Hard cap per request (abuse / memory guard). */
const val MAX_PAGE_LIMIT = 200

/** Safety cap for explore-deck aggregation (many internal pages). */
const val EXPLORE_DECK_MAX_ROWS = 10_000

/** Max length for explore shuffle seed query param. */
const val MAX_SHUFFLE_SEED_LENGTH = 128

/**
 * Parses `limit` and `offset` from query parameters.
 * @return null if invalid (caller should respond 400 with [INVALID_LIMIT_OFFSET_MESSAGE]).
 */
fun parseLimitOffset(
    limitRaw: String?,
    offsetRaw: String?,
): PagingParams? {
    val limit =
        limitRaw?.trim()?.takeIf { it.isNotEmpty() }?.toIntOrNull() ?: DEFAULT_PAGE_LIMIT
    val offset = offsetRaw?.trim()?.takeIf { it.isNotEmpty() }?.toIntOrNull() ?: 0
    if (limit < 1 || limit > MAX_PAGE_LIMIT) return null
    if (offset < 0) return null
    return PagingParams(limit = limit, offset = offset)
}

data class PagingParams(
    val limit: Int,
    val offset: Int,
)

const val INVALID_LIMIT_OFFSET_MESSAGE = "Invalid limit or offset query parameter"
