package io.shelters

import kotlinx.serialization.Serializable

/** Registry / umbrella org the shelter lists with (DOA, ROZ, …). */
@Serializable
enum class RegistryTag {
    DOA,
    ROZ,
}
