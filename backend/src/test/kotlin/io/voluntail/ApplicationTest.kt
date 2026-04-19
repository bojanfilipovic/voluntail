package io.voluntail

import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.request.patch
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.server.testing.testApplication
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

class ApplicationTest {

    @Test
    fun testRoot() =
        testApplication {
            application {
                module()
            }
            client.get("/").apply {
                assertEquals(HttpStatusCode.OK, status)
            }
        }

    @Test
    fun testHealth() =
        testApplication {
            application {
                module()
            }
            client.get("/health").apply {
                assertEquals(HttpStatusCode.OK, status)
            }
        }

    @Test
    fun testGetShelters() =
        testApplication {
            application {
                module()
            }
            client.get("/api/shelters").apply {
                assertEquals(HttpStatusCode.OK, status)
            }
        }

    @Test
    fun testPostShelterWithoutCmsKeyReturns401() =
        testApplication {
            application {
                module()
            }
            client
                .post("/api/shelters") {
                    contentType(ContentType.Application.Json)
                    setBody(
                        """{"name":"X","description":"Y","latitude":1.0,"longitude":2.0,"species":[]}""",
                    )
                }.apply {
                    assertEquals(HttpStatusCode.Unauthorized, status)
                }
        }

    @Test
    fun testPostShelterWithCmsKeyThenDelete() =
        testApplication {
            application {
                module()
            }
            val createRes =
                client.post("/api/shelters") {
                    header("X-CMS-Key", "test-secret")
                    contentType(ContentType.Application.Json)
                    setBody(
                        """{"name":"API Test Shelter","description":"From test","latitude":52.0,"longitude":5.0,"species":["dog"]}""",
                    )
                }
            assertEquals(HttpStatusCode.Created, createRes.status)
            val id =
                Json.parseToJsonElement(createRes.bodyAsText())
                    .jsonObject["id"]
                    ?.jsonPrimitive
                    ?.content
                    ?: error("no id in body")
            val del =
                client.delete("/api/shelters/$id") {
                    header("X-CMS-Key", "test-secret")
                }
            assertEquals(HttpStatusCode.NoContent, del.status)
            val listBody = client.get("/api/shelters").bodyAsText()
            assertTrue(!listBody.contains("API Test Shelter"))
        }

    @Test
    fun testPatchShelterWithCmsKey() =
        testApplication {
            application {
                module()
            }
            val createRes =
                client.post("/api/shelters") {
                    header("X-CMS-Key", "test-secret")
                    contentType(ContentType.Application.Json)
                    setBody(
                        """{"name":"Patch Me","description":"Before","latitude":52.1,"longitude":5.1,"species":["cat"]}""",
                    )
                }
            assertEquals(HttpStatusCode.Created, createRes.status)
            val id =
                Json.parseToJsonElement(createRes.bodyAsText())
                    .jsonObject["id"]
                    ?.jsonPrimitive
                    ?.content
                    ?: error("no id in body")
            val patchRes =
                client.patch("/api/shelters/$id") {
                    header("X-CMS-Key", "test-secret")
                    contentType(ContentType.Application.Json)
                    setBody("""{"description":"After patch"}""")
                }
            assertEquals(HttpStatusCode.OK, patchRes.status)
            assertTrue(patchRes.bodyAsText().contains("After patch"))
            client.delete("/api/shelters/$id") {
                header("X-CMS-Key", "test-secret")
            }
        }

    @Test
    fun testPostSuggestionEmptyMessageReturns400() =
        testApplication {
            application {
                module()
            }
            client
                .post("/api/suggestions") {
                    contentType(ContentType.Application.Json)
                    setBody("""{"message":""}""")
                }.apply {
                    assertEquals(HttpStatusCode.BadRequest, status)
                }
        }

    @Test
    fun testPostSuggestionTooLongReturns400() =
        testApplication {
            application {
                module()
            }
            val longMessage = "a".repeat(4001)
            client
                .post("/api/suggestions") {
                    contentType(ContentType.Application.Json)
                    setBody("""{"message":"$longMessage"}""")
                }.apply {
                    assertEquals(HttpStatusCode.BadRequest, status)
                }
        }

    @Test
    fun testPostSuggestionContactTooLongReturns400() =
        testApplication {
            application {
                module()
            }
            val longContact = "a".repeat(101)
            client
                .post("/api/suggestions") {
                    contentType(ContentType.Application.Json)
                    setBody("""{"message":"Thanks!","contact":"$longContact"}""")
                }.apply {
                    assertEquals(HttpStatusCode.BadRequest, status)
                }
        }

    @Test
    fun testPostSuggestionWithoutDbReturns503() =
        testApplication {
            application {
                module()
            }
            client
                .post("/api/suggestions") {
                    contentType(ContentType.Application.Json)
                    setBody("""{"message":"Thanks for the pilot build!"}""")
                }.apply {
                    assertEquals(HttpStatusCode.ServiceUnavailable, status)
                }
        }
}
