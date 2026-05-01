package io.feedback

/**
 * Max stored [peer_feedback] rows before POST returns 429. Overridable via [PEER_FEEDBACK_MAX_ROWS]
 * (e.g. Railway) without code changes. Default 1000; valid range 1..1000 (higher values clamp to 1000).
 */
private const val PEER_FEEDBACK_MAX_ROWS_DEFAULT = 1000
private const val PEER_FEEDBACK_MAX_ROWS_CEILING = 1000

fun peerFeedbackMaxRows(): Int {
    val raw = System.getenv("PEER_FEEDBACK_MAX_ROWS")?.trim()?.toIntOrNull()
        ?: return PEER_FEEDBACK_MAX_ROWS_DEFAULT
    if (raw <= 0) return PEER_FEEDBACK_MAX_ROWS_DEFAULT
    return raw.coerceAtMost(PEER_FEEDBACK_MAX_ROWS_CEILING)
}
