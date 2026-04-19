package io.voluntail

import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.voluntail.test.voluntailTest
import kotlin.test.Test
import kotlin.test.assertEquals

/**
 * Public feedback suggestions: validation rules and persistence availability (503 without DB).
 */
class SuggestionsRoutesTest {

    @Test
    fun `POST suggestion with empty message returns 400`() {
        voluntailTest {
            client
                .post("/api/suggestions") {
                    contentType(ContentType.Application.Json)
                    setBody("""{"message":""}""")
                }.apply {
                    assertEquals(HttpStatusCode.BadRequest, status)
                }
        }
    }

    @Test
    fun `POST suggestion with message over max length returns 400`() {
        voluntailTest {
            val longMessage = "a".repeat(4001)
            client
                .post("/api/suggestions") {
                    contentType(ContentType.Application.Json)
                    setBody("""{"message":"$longMessage"}""")
                }.apply {
                    assertEquals(HttpStatusCode.BadRequest, status)
                }
        }
    }

    @Test
    fun `POST suggestion with contact over max length returns 400`() {
        voluntailTest {
            val longContact = "a".repeat(101)
            client
                .post("/api/suggestions") {
                    contentType(ContentType.Application.Json)
                    setBody("""{"message":"Thanks!","contact":"$longContact"}""")
                }.apply {
                    assertEquals(HttpStatusCode.BadRequest, status)
                }
        }
    }

    @Test
    fun `POST suggestion returns 503 when database is not configured`() {
        voluntailTest {
            client
                .post("/api/suggestions") {
                    contentType(ContentType.Application.Json)
                    setBody("""{"message":"Thanks for the pilot build!"}""")
                }.apply {
                    assertEquals(HttpStatusCode.ServiceUnavailable, status)
                }
        }
    }
}
