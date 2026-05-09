package io.animals

import kotlinx.serialization.Serializable

@Serializable
data class AnimalListPageResponse(
    val items: List<AnimalResponse>,
    val total: Int,
    val limit: Int,
    val offset: Int,
)
