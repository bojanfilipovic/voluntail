package io.shelters

import io.voluntail.voluntailJson
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.encodeToString
import kotlin.test.Test
import kotlin.test.assertEquals

/**
 * Unit-style check: [voluntailJson] round-trips [ShelterSpecies] lists like Exposed `jsonb` expects.
 */
class VoluntailJsonShelterSpeciesTest {

    @Test
    fun `species list serializes compatibly with jsonb column configuration`() {
        val serializer = ListSerializer(ShelterSpecies.serializer())
        val samples =
            listOf(
                ShelterSpecies.dog,
                ShelterSpecies.cat,
                ShelterSpecies.reptile,
            )
        val encoded = voluntailJson.encodeToString(serializer, samples)
        val decoded = voluntailJson.decodeFromString(serializer, encoded)
        assertEquals(samples, decoded)
    }
}
