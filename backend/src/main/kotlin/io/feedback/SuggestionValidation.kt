package io.feedback

internal sealed interface SuggestionValidationOutcome {
    data class Ok(
        val message: String,
        val contact: String?,
    ) : SuggestionValidationOutcome

    data class Invalid(
        val responseText: String,
    ) : SuggestionValidationOutcome
}

internal fun validateSuggestionFields(body: SuggestionCreateRequest): SuggestionValidationOutcome {
    val trimmed = body.message.trim()
    val contactNormalized =
        body.contact?.trim()?.takeUnless { it.isEmpty() }
    return when {
        trimmed.isEmpty() ->
            SuggestionValidationOutcome.Invalid("Message is required")
        trimmed.length > SUGGESTION_MAX_MESSAGE_LENGTH ->
            SuggestionValidationOutcome.Invalid(
                "Message exceeds maximum length ($SUGGESTION_MAX_MESSAGE_LENGTH characters)",
            )
        contactNormalized != null &&
            contactNormalized.length > SUGGESTION_MAX_CONTACT_LENGTH ->
            SuggestionValidationOutcome.Invalid(
                "Contact exceeds maximum length ($SUGGESTION_MAX_CONTACT_LENGTH characters)",
            )
        else ->
            SuggestionValidationOutcome.Ok(trimmed, contactNormalized)
    }
}
