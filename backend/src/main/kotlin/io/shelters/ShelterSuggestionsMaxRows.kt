package io.shelters

/**
 * Max stored [shelter_suggestions] rows before POST returns 429.
 * Overridable via [SHELTER_SUGGESTIONS_MAX_ROWS]. Default 75; valid range 50..100 (outside → clamped).
 */
private const val SHELTER_SUGGESTIONS_MAX_ROWS_DEFAULT = 75
private const val SHELTER_SUGGESTIONS_MAX_ROWS_FLOOR = 50
private const val SHELTER_SUGGESTIONS_MAX_ROWS_CEILING = 100

fun shelterSuggestionsMaxRows(): Int {
    val raw = System.getenv("SHELTER_SUGGESTIONS_MAX_ROWS")?.trim()?.toIntOrNull()
        ?: return SHELTER_SUGGESTIONS_MAX_ROWS_DEFAULT
    if (raw <= 0) return SHELTER_SUGGESTIONS_MAX_ROWS_DEFAULT
    return raw.coerceIn(SHELTER_SUGGESTIONS_MAX_ROWS_FLOOR, SHELTER_SUGGESTIONS_MAX_ROWS_CEILING)
}
