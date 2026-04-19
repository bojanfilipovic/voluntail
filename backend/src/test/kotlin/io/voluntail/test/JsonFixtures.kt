package io.voluntail.test

import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

internal const val TEST_CMS_KEY = "test-secret"

internal fun jsonStringField(body: String, field: String): String =
    Json.parseToJsonElement(body).jsonObject[field]?.jsonPrimitive?.content
        ?: error("missing JSON string field \"$field\"")
