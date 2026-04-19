package io.feedback

/**
 * Max stored [peer_feedback] rows before POST returns 429. Overridable via [PEER_FEEDBACK_MAX_ROWS]
 * (e.g. Railway) without code changes. Default 50; valid range 1..50 (higher values clamp to 50).
 */
private const val PEER_FEEDBACK_MAX_ROWS_DEFAULT = 50
private const val PEER_FEEDBACK_MAX_ROWS_CEILING = 50

fun peerFeedbackMaxRows(): Int {
    val raw = System.getenv("PEER_FEEDBACK_MAX_ROWS")?.trim()?.toIntOrNull()
        ?: return PEER_FEEDBACK_MAX_ROWS_DEFAULT
    if (raw <= 0) return PEER_FEEDBACK_MAX_ROWS_DEFAULT
    return raw.coerceAtMost(PEER_FEEDBACK_MAX_ROWS_CEILING)
}
