package io.shelters

import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.voluntail.test.voluntailTest
import kotlin.test.Test
import kotlin.test.assertEquals

/**
 * HTTP smoke tests for `/api/shelter-suggestions` (validation + 503 without DB in default test env).
 */
class ShelterSuggestionsRoutesTest {

    @Test
    fun `POST shelter suggestion with empty name returns 400`() {
        voluntailTest {
            client
                .post("/api/shelter-suggestions") {
                    contentType(ContentType.Application.Json)
                    setBody("""{"name":"","latitude":52.0,"longitude":5.0}""")
                }.apply {
                    assertEquals(HttpStatusCode.BadRequest, status)
                }
        }
    }

    @Test
    fun `POST shelter suggestion with latitude out of range returns 400`() {
        voluntailTest {
            client
                .post("/api/shelter-suggestions") {
                    contentType(ContentType.Application.Json)
                    setBody("""{"name":"Test","latitude":91.0,"longitude":5.0}""")
                }.apply {
                    assertEquals(HttpStatusCode.BadRequest, status)
                    assertEquals("latitude or longitude is out of range", bodyAsText())
                }
        }
    }

    @Test
    fun `POST shelter suggestion with speciesNote over max returns 400`() {
        voluntailTest {
            val longNote = "a".repeat(2001)
            client
                .post("/api/shelter-suggestions") {
                    contentType(ContentType.Application.Json)
                    setBody(
                        """{"name":"Hi","latitude":52.0,"longitude":5.0,"speciesNote":"$longNote"}""",
                    )
                }.apply {
                    assertEquals(HttpStatusCode.BadRequest, status)
                }
        }
    }

    @Test
    fun `POST shelter suggestion with malformed JSON returns 400`() {
        voluntailTest {
            client
                .post("/api/shelter-suggestions") {
                    contentType(ContentType.Application.Json)
                    setBody("{")
                }.apply {
                    assertEquals(HttpStatusCode.BadRequest, status)
                    assertEquals("Invalid JSON body", bodyAsText())
                }
        }
    }

    @Test
    fun `POST shelter suggestion returns 503 when database is not configured`() {
        voluntailTest {
            client
                .post("/api/shelter-suggestions") {
                    contentType(ContentType.Application.Json)
                    setBody("""{"name":"New shelter","latitude":52.09,"longitude":5.12}""")
                }.apply {
                    assertEquals(HttpStatusCode.ServiceUnavailable, status)
                }
        }
    }
}
