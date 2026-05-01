package io.shelters

import kotlin.math.abs

internal const val SHELTER_SUGGESTION_MAX_NAME = 300
internal const val SHELTER_SUGGESTION_MAX_DESCRIPTION = 10000
internal const val SHELTER_SUGGESTION_MAX_CITY = 200
internal const val SHELTER_SUGGESTION_MAX_SPECIES_NOTE = 2000
internal const val SHELTER_SUGGESTION_MAX_URL = 2000
internal const val SHELTER_SUGGESTION_MAX_CONTACT = 100

/** Normalized, length-checked payload for persistence (after validation). */
data class ShelterSuggestionInsert(
    val name: String,
    val latitude: Double,
    val longitude: Double,
    val description: String?,
    val city: String?,
    val speciesNote: String?,
    val signupUrl: String?,
    val imageUrl: String?,
    val donationUrl: String?,
    val contact: String?,
)

internal sealed interface ShelterSuggestionValidationOutcome {
    data class Ok(
        val value: ShelterSuggestionInsert,
    ) : ShelterSuggestionValidationOutcome

    data class Invalid(
        val responseText: String,
    ) : ShelterSuggestionValidationOutcome
}

internal fun validateShelterSuggestion(body: ShelterSuggestionCreateRequest): ShelterSuggestionValidationOutcome {
    val nameTrimmed = body.name.trim()
    if (nameTrimmed.isEmpty()) {
        return ShelterSuggestionValidationOutcome.Invalid("name is required")
    }
    if (nameTrimmed.length > SHELTER_SUGGESTION_MAX_NAME) {
        return ShelterSuggestionValidationOutcome.Invalid(
            "name exceeds maximum length ($SHELTER_SUGGESTION_MAX_NAME characters)",
        )
    }
    if (!body.latitude.isFinite() || !body.longitude.isFinite()) {
        return ShelterSuggestionValidationOutcome.Invalid("latitude and longitude must be finite numbers")
    }
    if (!isValidLatitude(body.latitude) || !isValidLongitude(body.longitude)) {
        return ShelterSuggestionValidationOutcome.Invalid("latitude or longitude is out of range")
    }

    val description = body.description?.trim()?.takeUnless { it.isEmpty() }
    if (description != null && description.length > SHELTER_SUGGESTION_MAX_DESCRIPTION) {
        return ShelterSuggestionValidationOutcome.Invalid(
            "description exceeds maximum length ($SHELTER_SUGGESTION_MAX_DESCRIPTION characters)",
        )
    }

    val city = body.city?.trim()?.takeUnless { it.isEmpty() }
    if (city != null && city.length > SHELTER_SUGGESTION_MAX_CITY) {
        return ShelterSuggestionValidationOutcome.Invalid(
            "city exceeds maximum length ($SHELTER_SUGGESTION_MAX_CITY characters)",
        )
    }

    val speciesNote = body.speciesNote?.trim()?.takeUnless { it.isEmpty() }
    if (speciesNote != null && speciesNote.length > SHELTER_SUGGESTION_MAX_SPECIES_NOTE) {
        return ShelterSuggestionValidationOutcome.Invalid(
            "speciesNote exceeds maximum length ($SHELTER_SUGGESTION_MAX_SPECIES_NOTE characters)",
        )
    }

    val signupUrl = body.signupUrl?.trim()?.takeUnless { it.isEmpty() }
    if (signupUrl != null && signupUrl.length > SHELTER_SUGGESTION_MAX_URL) {
        return ShelterSuggestionValidationOutcome.Invalid(
            "signupUrl exceeds maximum length ($SHELTER_SUGGESTION_MAX_URL characters)",
        )
    }
    val imageUrl = body.imageUrl?.trim()?.takeUnless { it.isEmpty() }
    if (imageUrl != null && imageUrl.length > SHELTER_SUGGESTION_MAX_URL) {
        return ShelterSuggestionValidationOutcome.Invalid(
            "imageUrl exceeds maximum length ($SHELTER_SUGGESTION_MAX_URL characters)",
        )
    }
    val donationUrl = body.donationUrl?.trim()?.takeUnless { it.isEmpty() }
    if (donationUrl != null && donationUrl.length > SHELTER_SUGGESTION_MAX_URL) {
        return ShelterSuggestionValidationOutcome.Invalid(
            "donationUrl exceeds maximum length ($SHELTER_SUGGESTION_MAX_URL characters)",
        )
    }

    val contact = body.contact?.trim()?.takeUnless { it.isEmpty() }
    if (contact != null && contact.length > SHELTER_SUGGESTION_MAX_CONTACT) {
        return ShelterSuggestionValidationOutcome.Invalid(
            "contact exceeds maximum length ($SHELTER_SUGGESTION_MAX_CONTACT characters)",
        )
    }

    return ShelterSuggestionValidationOutcome.Ok(
        ShelterSuggestionInsert(
            name = nameTrimmed,
            latitude = body.latitude,
            longitude = body.longitude,
            description = description,
            city = city,
            speciesNote = speciesNote,
            signupUrl = signupUrl,
            imageUrl = imageUrl,
            donationUrl = donationUrl,
            contact = contact,
        ),
    )
}

private fun isValidLatitude(value: Double): Boolean = abs(value) <= 90.0

private fun isValidLongitude(value: Double): Boolean = abs(value) <= 180.0
