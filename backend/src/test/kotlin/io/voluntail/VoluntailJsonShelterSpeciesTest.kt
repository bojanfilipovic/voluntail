package io.voluntail

import io.shelters.ShelterSpecies
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.encodeToString
import kotlin.test.Test
import kotlin.test.assertEquals

/**
 * Ensures shared [voluntailJson] round-trips [ShelterSpecies] lists the same way Exposed jsonb expects.
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
