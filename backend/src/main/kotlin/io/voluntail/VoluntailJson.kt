package io.voluntail

import kotlinx.serialization.json.Json

/** Shared [Json] instance for HTTP content negotiation. */
internal val voluntailJson =
    Json {
        ignoreUnknownKeys = true
        explicitNulls = false
    }
