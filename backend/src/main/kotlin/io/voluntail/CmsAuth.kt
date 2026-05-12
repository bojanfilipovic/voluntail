package io.voluntail

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.ApplicationCall
import io.ktor.server.response.respondText
import io.ktor.util.AttributeKey

/**
 * CMS shared-secret loaded once per [Application] (see [installCmsAuthConfig]).
 * [expectedApiKey] is trimmed; empty means CMS mutations are disabled server-side.
 */
data class CmsAuthConfig(
    val expectedApiKey: String,
) {
    val mutationsEnabled: Boolean get() = expectedApiKey.isNotEmpty()
}

internal val CmsAuthConfigKey = AttributeKey<CmsAuthConfig>("VoluntailCmsAuthConfig")

/** Read [CmsAuthConfig] from the environment once and store it on [Application.attributes]. */
fun Application.installCmsAuthConfig() {
    val expected = System.getenv("CMS_API_KEY")?.trim().orEmpty()
    attributes.put(CmsAuthConfigKey, CmsAuthConfig(expected))
}

internal val Application.cmsAuthConfig: CmsAuthConfig
    get() = attributes[CmsAuthConfigKey]

/** True when CMS key matches; does not send a response (for GET visibility branching). */
fun ApplicationCall.isCmsAuthorized(): Boolean {
    val expected = application.cmsAuthConfig.expectedApiKey
    val provided = request.headers["X-CMS-Key"]?.trim().orEmpty()
    return expected.isNotEmpty() && provided == expected
}

suspend fun ApplicationCall.ensureCmsAuthorized(): Boolean {
    val expected = application.cmsAuthConfig.expectedApiKey
    val provided = request.headers["X-CMS-Key"]?.trim().orEmpty()
    return when {
        expected.isEmpty() -> {
            respondText(
                "CMS mutations disabled: set CMS_API_KEY on the server",
                status = HttpStatusCode.Forbidden,
            )
            false
        }
        provided != expected -> {
            respondText(
                "Invalid or missing X-CMS-Key header",
                status = HttpStatusCode.Unauthorized,
            )
            false
        }
        else -> true
    }
}
