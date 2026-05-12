package io.voluntail

import io.github.oshai.kotlinlogging.KotlinLogging

/** App logs: `io.github.oshai:kotlin-logging` on SLF4J/Logback. */
internal val logger = KotlinLogging.logger("io.voluntail")

internal fun logApplicationStartup(
    persistence: String,
    feedbackAvailable: Boolean,
    cmsMutationsEnabled: Boolean,
) {
    val port = System.getenv("PORT")?.trim()?.toIntOrNull() ?: 8080
    val cmsMode = if (cmsMutationsEnabled) "enabled" else "disabled"
    logger.info {
        "voluntail startup: port=$port persistence=$persistence feedback=$feedbackAvailable cms=$cmsMode"
    }
}
