package io.voluntail

import kotlinx.serialization.json.Json

/** Shared [Json] for HTTP content negotiation and Exposed `jsonb` columns (same module). */
internal val voluntailJson =
    Json {
        ignoreUnknownKeys = true
        explicitNulls = false
    }
