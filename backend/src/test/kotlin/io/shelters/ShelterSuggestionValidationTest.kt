package io.shelters

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue

class ShelterSuggestionValidationTest {
    @Test
    fun `validation trims optional fields`() {
        val outcome =
            validateShelterSuggestion(
                ShelterSuggestionCreateRequest(
                    name = "  New Shelter  ",
                    latitude = 52.1,
                    longitude = 5.1,
                    city = "  Utrecht  ",
                    contact = "  hello@voluntail.nl  ",
                ),
            )

        val ok = outcome as ShelterSuggestionValidationOutcome.Ok
        assertEquals("New Shelter", ok.value.name)
        assertEquals("Utrecht", ok.value.city)
        assertEquals("hello@voluntail.nl", ok.value.contact)
    }

    @Test
    fun `validation converts blank optional fields to null`() {
        val outcome =
            validateShelterSuggestion(
                ShelterSuggestionCreateRequest(
                    name = "Nomination",
                    latitude = 52.1,
                    longitude = 5.1,
                    city = "   ",
                    contact = "   ",
                ),
            )

        val ok = outcome as ShelterSuggestionValidationOutcome.Ok
        assertNull(ok.value.city)
        assertNull(ok.value.contact)
    }

    @Test
    fun `validation rejects non-finite coordinates`() {
        val outcome =
            validateShelterSuggestion(
                ShelterSuggestionCreateRequest(
                    name = "Nomination",
                    latitude = Double.NaN,
                    longitude = 5.1,
                ),
            )

        assertTrue(outcome is ShelterSuggestionValidationOutcome.Invalid)
        assertEquals("latitude and longitude must be finite numbers", outcome.responseText)
    }
}
