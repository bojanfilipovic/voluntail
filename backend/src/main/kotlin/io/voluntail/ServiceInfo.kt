package io.voluntail

import kotlinx.serialization.Serializable

@Serializable
data class ServiceInfo(
    val status: String,
    val service: String,
    val version: String,
)
