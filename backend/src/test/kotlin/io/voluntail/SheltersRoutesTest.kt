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
import io.voluntail.test.TEST_CMS_KEY
import io.voluntail.test.jsonStringField
import io.voluntail.test.voluntailTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

/**
 * CMS-gated shelter directory: list, create, patch, delete, and species validation.
 * Uses in-memory repository when DB is not configured (typical local test run).
 */
class SheltersRoutesTest {

    @Test
    fun `GET shelters returns OK`() {
        voluntailTest {
            client.get("/api/shelters").apply {
                assertEquals(HttpStatusCode.OK, status)
            }
        }
    }

    @Test
    fun `POST shelter without CMS key returns 401`() {
        voluntailTest {
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
    }

    @Test
    fun `POST shelter with invalid species returns 400`() {
        voluntailTest {
            client
                .post("/api/shelters") {
                    header("X-CMS-Key", TEST_CMS_KEY)
                    contentType(ContentType.Application.Json)
                    setBody(
                        """{"name":"Bad Species","description":"X","latitude":52.0,"longitude":5.0,"species":["fish"]}""",
                    )
                }.apply {
                    assertEquals(HttpStatusCode.BadRequest, status)
                }
        }
    }

    @Test
    fun `POST shelter then DELETE removes it from listing`() {
        voluntailTest {
            val createRes =
                client.post("/api/shelters") {
                    header("X-CMS-Key", TEST_CMS_KEY)
                    contentType(ContentType.Application.Json)
                    setBody(
                        """{"name":"API Test Shelter","description":"From test","latitude":52.0,"longitude":5.0,"species":["dog"]}""",
                    )
                }
            assertEquals(HttpStatusCode.Created, createRes.status)
            val id = jsonStringField(createRes.bodyAsText(), "id")

            val del =
                client.delete("/api/shelters/$id") {
                    header("X-CMS-Key", TEST_CMS_KEY)
                }
            assertEquals(HttpStatusCode.NoContent, del.status)

            val listBody = client.get("/api/shelters").bodyAsText()
            assertTrue(!listBody.contains("API Test Shelter"))
        }
    }

    @Test
    fun `PATCH shelter updates fields`() {
        voluntailTest {
            val createRes =
                client.post("/api/shelters") {
                    header("X-CMS-Key", TEST_CMS_KEY)
                    contentType(ContentType.Application.Json)
                    setBody(
                        """{"name":"Patch Me","description":"Before","latitude":52.1,"longitude":5.1,"species":["cat"]}""",
                    )
                }
            assertEquals(HttpStatusCode.Created, createRes.status)
            val id = jsonStringField(createRes.bodyAsText(), "id")

            val patchRes =
                client.patch("/api/shelters/$id") {
                    header("X-CMS-Key", TEST_CMS_KEY)
                    contentType(ContentType.Application.Json)
                    setBody("""{"description":"After patch"}""")
                }
            assertEquals(HttpStatusCode.OK, patchRes.status)
            assertTrue(patchRes.bodyAsText().contains("After patch"))

            client.delete("/api/shelters/$id") {
                header("X-CMS-Key", TEST_CMS_KEY)
            }
        }
    }
}
