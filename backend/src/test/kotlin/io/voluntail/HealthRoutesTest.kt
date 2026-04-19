package io.voluntail

import io.ktor.client.request.get
import io.ktor.http.HttpStatusCode
import io.voluntail.test.voluntailTest
import kotlin.test.Test
import kotlin.test.assertEquals

/** HTTP entry and liveness endpoints. */
class HealthRoutesTest {

    @Test
    fun `GET root returns OK`() {
        voluntailTest {
            client.get("/").apply {
                assertEquals(HttpStatusCode.OK, status)
            }
        }
    }

    @Test
    fun `GET health returns OK`() {
        voluntailTest {
            client.get("/health").apply {
                assertEquals(HttpStatusCode.OK, status)
            }
        }
    }
}
