package io.voluntail

import kotlinx.serialization.Serializable

@Serializable
data class DirectoryStatsResponse(
    val shelterCount: Int,
    val animalCount: Int,
    val heartCountSum: Long,
)

@Serializable
data class AnimalSpeciesFacetsResponse(
    /** Species enum [ShelterSpecies.name] → count (omitted keys mean zero). */
    val counts: Map<String, Int>,
)
