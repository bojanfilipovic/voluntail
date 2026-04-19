package io.voluntail.test

import io.ktor.server.testing.ApplicationTestBuilder
import io.ktor.server.testing.testApplication
import io.voluntail.module

/**
 * Integration tests run against the same modules as production ([module]); this avoids repeating
 * `application { module() }` in every case. The block is suspend so Ktor test [HttpClient] calls are
 * valid (same as [testApplication]'s receiver).
 */
fun voluntailTest(block: suspend ApplicationTestBuilder.() -> Unit) {
    testApplication {
        application {
            module()
        }
        block()
    }
}
