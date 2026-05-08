package io.shelters

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull

class ShelterCountryIsoTest {
    @Test
    fun `Amsterdam resolves to NL`() {
        assertEquals("NL", countryIsoFromLatLon(52.3629026, 4.7845807))
    }

    @Test
    fun `Zagreb area resolves to HR`() {
        assertEquals("HR", countryIsoFromLatLon(45.8, 15.98))
    }

    @Test
    fun `Pacific ocean returns null`() {
        assertNull(countryIsoFromLatLon(1.0, -150.0))
    }

    @Test
    fun `invalid latitude returns null`() {
        assertNull(countryIsoFromLatLon(91.0, 5.0))
    }
}
