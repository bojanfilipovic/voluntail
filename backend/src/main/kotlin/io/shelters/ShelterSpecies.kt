package io.shelters

import kotlinx.serialization.Serializable

@Serializable
enum class ShelterSpecies {
    dog,
    cat,
    rabbit,
    reptile,
}

/** Returns null if any non-empty token is not a valid [ShelterSpecies] name. */
fun List<String>.toShelterSpeciesListOrNull(): List<ShelterSpecies>? {
    val out = LinkedHashSet<ShelterSpecies>()
    for (raw in this) {
        val t = raw.trim()
        if (t.isEmpty()) continue
        val e = ShelterSpecies.entries.find { it.name == t } ?: return null
        out.add(e)
    }
    return out.toList()
}
