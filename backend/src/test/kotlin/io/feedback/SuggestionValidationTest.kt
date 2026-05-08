package io.feedback

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue

class SuggestionValidationTest {
    @Test
    fun `validation trims message and optional contact`() {
        val outcome =
            validateSuggestionFields(
                SuggestionCreateRequest(
                    message = "  Thanks for running this pilot  ",
                    contact = "  hello@example.com  ",
                ),
            )

        val ok = outcome as SuggestionValidationOutcome.Ok
        assertEquals("Thanks for running this pilot", ok.message)
        assertEquals("hello@example.com", ok.contact)
        assertNull(ok.shelterId)
        assertNull(ok.animalId)
    }

    @Test
    fun `validation rejects blank contact after trimming`() {
        val outcome =
            validateSuggestionFields(
                SuggestionCreateRequest(
                    message = "Looks good",
                    contact = "   ",
                ),
            )

        val ok = outcome as SuggestionValidationOutcome.Ok
        assertNull(ok.contact)
    }

    @Test
    fun `validation rejects invalid UUID context`() {
        val outcome =
            validateSuggestionFields(
                SuggestionCreateRequest(
                    message = "Check this",
                    shelterId = "bad-uuid",
                ),
            )

        assertTrue(outcome is SuggestionValidationOutcome.Invalid)
        assertEquals("shelterId must be a valid UUID", outcome.responseText)
    }
}
