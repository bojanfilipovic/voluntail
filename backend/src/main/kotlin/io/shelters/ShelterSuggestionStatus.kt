package io.shelters

/** Persisted as PostgreSQL enum `shelter_suggestion_status`; labels must match migration. */
enum class ShelterSuggestionStatus {
    pending,
    reviewed,
    rejected,
    imported,
}
