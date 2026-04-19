package io.feedback

/** Upper bound on stored peer_feedback rows (spam blast radius). Default 50; override via PEER_FEEDBACK_MAX_ROWS. */
private const val PEER_FEEDBACK_MAX_ROWS_FALLBACK = 50
private const val PEER_FEEDBACK_MAX_ROWS_CEILING = 10_000

fun peerFeedbackMaxRows(): Int =
    System.getenv("PEER_FEEDBACK_MAX_ROWS")?.trim()?.toIntOrNull()?.coerceIn(
        1,
        PEER_FEEDBACK_MAX_ROWS_CEILING,
    )
        ?: PEER_FEEDBACK_MAX_ROWS_FALLBACK
