package io.feedback

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
 * HTTP smoke tests for `/api/suggestions` (validation + 503 without DB in default test env).
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
    fun `POST suggestion with invalid shelterId returns 400`() {
        voluntailTest {
            client
                .post("/api/suggestions") {
                    contentType(ContentType.Application.Json)
                    setBody("""{"message":"Hi","shelterId":"nope"}""")
                }.apply {
                    assertEquals(HttpStatusCode.BadRequest, status)
                    assertEquals("shelterId must be a valid UUID", bodyAsText())
                }
        }
    }

    @Test
    fun `POST suggestion with invalid animalId returns 400`() {
        voluntailTest {
            client
                .post("/api/suggestions") {
                    contentType(ContentType.Application.Json)
                    setBody("""{"message":"Hi","animalId":"nope-uuid"}""")
                }.apply {
                    assertEquals(HttpStatusCode.BadRequest, status)
                    assertEquals("animalId must be a valid UUID", bodyAsText())
                }
        }
    }

    @Test
    fun `POST suggestion with malformed JSON returns 400`() {
        voluntailTest {
            client
                .post("/api/suggestions") {
                    contentType(ContentType.Application.Json)
                    setBody("{")
                }.apply {
                    assertEquals(HttpStatusCode.BadRequest, status)
                    assertEquals("Invalid JSON body", bodyAsText())
                }
        }
    }

    @Test
    fun `POST suggestion with JSON type mismatch returns 400`() {
        voluntailTest {
            client
                .post("/api/suggestions") {
                    contentType(ContentType.Application.Json)
                    setBody("""{"message":1}""")
                }.apply {
                    assertEquals(HttpStatusCode.BadRequest, status)
                    assertEquals("Invalid JSON body", bodyAsText())
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
