package io.animals

import kotlinx.serialization.Serializable

@Serializable
enum class AnimalStatus {
    available,
    reserved,
    adopted,
}
