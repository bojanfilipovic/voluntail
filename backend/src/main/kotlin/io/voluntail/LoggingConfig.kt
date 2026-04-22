package io.voluntail

import io.github.oshai.kotlinlogging.KotlinLogging

/** App logs: `io.github.oshai:kotlin-logging` on SLF4J/Logback. */
internal val logger = KotlinLogging.logger("io.voluntail")

internal fun logApplicationStartup(
    persistence: String,
    feedbackAvailable: Boolean,
) {
    val port = System.getenv("PORT")?.trim()?.toIntOrNull() ?: 8080
    val cms = System.getenv("CMS_API_KEY")?.trim().orEmpty()
    val cmsMode = if (cms.isEmpty()) "disabled" else "enabled"
    logger.info {
        "voluntail startup: port=$port persistence=$persistence feedback=$feedbackAvailable cms=$cmsMode"
    }
}
