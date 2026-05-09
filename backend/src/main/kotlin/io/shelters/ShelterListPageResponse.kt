package io.shelters

import kotlinx.serialization.Serializable

@Serializable
data class ShelterListPageResponse(
    val items: List<ShelterResponse>,
    val total: Int,
    val limit: Int,
    val offset: Int,
)
