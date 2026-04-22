package io.feedback

import java.util.UUID

internal sealed interface SuggestionValidationOutcome {
    data class Ok(
        val message: String,
        val contact: String?,
        val shelterId: UUID?,
        val animalId: UUID?,
    ) : SuggestionValidationOutcome

    data class Invalid(
        val responseText: String,
    ) : SuggestionValidationOutcome
}

internal fun validateSuggestionFields(body: SuggestionCreateRequest): SuggestionValidationOutcome {
    val trimmed = body.message.trim()
    val contactNormalized =
        body.contact?.trim()?.takeUnless { it.isEmpty() }
    if (trimmed.isEmpty()) {
        return SuggestionValidationOutcome.Invalid("Message is required")
    }
    if (trimmed.length > SUGGESTION_MAX_MESSAGE_LENGTH) {
        return SuggestionValidationOutcome.Invalid(
            "Message exceeds maximum length ($SUGGESTION_MAX_MESSAGE_LENGTH characters)",
        )
    }
    if (contactNormalized != null &&
        contactNormalized.length > SUGGESTION_MAX_CONTACT_LENGTH
    ) {
        return SuggestionValidationOutcome.Invalid(
            "Contact exceeds maximum length ($SUGGESTION_MAX_CONTACT_LENGTH characters)",
        )
    }

    val shelterIdRaw = body.shelterId?.trim()?.takeUnless { it.isEmpty() }
    val animalIdRaw = body.animalId?.trim()?.takeUnless { it.isEmpty() }

    val shelterUuid: UUID? =
        shelterIdRaw?.let { raw ->
            runCatching { UUID.fromString(raw) }
                .getOrElse {
                    return SuggestionValidationOutcome.Invalid("shelterId must be a valid UUID")
                }
        }
    val animalUuid: UUID? =
        animalIdRaw?.let { raw ->
            runCatching { UUID.fromString(raw) }
                .getOrElse {
                    return SuggestionValidationOutcome.Invalid("animalId must be a valid UUID")
                }
        }

    return SuggestionValidationOutcome.Ok(
        message = trimmed,
        contact = contactNormalized,
        shelterId = shelterUuid,
        animalId = animalUuid,
    )
}
