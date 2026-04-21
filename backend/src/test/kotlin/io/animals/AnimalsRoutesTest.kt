package io.animals

import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.request.patch
import io.ktor.client.request.post
import io.ktor.client.request.parameter
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
 * HTTP smoke tests for `/api/animals` through the full app module (in-memory repo when DB unset).
 */
class AnimalsRoutesTest {

    private val sampleShelterId = "a0000001-0001-4001-8001-000000000001"

    @Test
    fun `GET animals returns OK and hides unpublished without CMS key`() {
        voluntailTest {
            val body = client.get("/api/animals").bodyAsText()
            assertTrue(body.contains("Milo"))
            assertTrue(!body.contains("Draft pup"))
        }
    }

    @Test
    fun `GET animals with CMS key includes unpublished`() {
        voluntailTest {
            val body =
                client.get("/api/animals") {
                    header("X-CMS-Key", TEST_CMS_KEY)
                }.bodyAsText()
            assertTrue(body.contains("Draft pup"))
        }
    }

    @Test
    fun `POST animal without CMS key returns 401`() {
        voluntailTest {
            client
                .post("/api/animals") {
                    contentType(ContentType.Application.Json)
                    setBody(
                        """{"shelterId":"$sampleShelterId","name":"X","species":"dog","status":"available"}""",
                    )
                }.apply {
                    assertEquals(HttpStatusCode.Unauthorized, status)
                }
        }
    }

    @Test
    fun `POST animal with CMS then DELETE`() {
        voluntailTest {
            val createRes =
                client.post("/api/animals") {
                    header("X-CMS-Key", TEST_CMS_KEY)
                    contentType(ContentType.Application.Json)
                    setBody(
                        """{"shelterId":"$sampleShelterId","name":"API Test Ferret","description":"x","species":"dog","status":"available","published":true}""",
                    )
                }
            assertEquals(HttpStatusCode.Created, createRes.status)
            val id = jsonStringField(createRes.bodyAsText(), "id")

            val del =
                client.delete("/api/animals/$id") {
                    header("X-CMS-Key", TEST_CMS_KEY)
                }
            assertEquals(HttpStatusCode.NoContent, del.status)

            val listBody = client.get("/api/animals").bodyAsText()
            assertTrue(!listBody.contains("API Test Ferret"))
        }
    }

    @Test
    fun `PATCH animal toggles published`() {
        voluntailTest {
            val createRes =
                client.post("/api/animals") {
                    header("X-CMS-Key", TEST_CMS_KEY)
                    contentType(ContentType.Application.Json)
                    setBody(
                        """{"shelterId":"$sampleShelterId","name":"Toggle Pub","description":"x","species":"cat","status":"available","published":false}""",
                    )
                }
            assertEquals(HttpStatusCode.Created, createRes.status)
            val id = jsonStringField(createRes.bodyAsText(), "id")

            assertTrue(!client.get("/api/animals").bodyAsText().contains("Toggle Pub"))

            client.patch("/api/animals/$id") {
                header("X-CMS-Key", TEST_CMS_KEY)
                contentType(ContentType.Application.Json)
                setBody("""{"published":true}""")
            }.apply {
                assertEquals(HttpStatusCode.OK, status)
            }

            assertTrue(client.get("/api/animals").bodyAsText().contains("Toggle Pub"))

            client.delete("/api/animals/$id") {
                header("X-CMS-Key", TEST_CMS_KEY)
            }
        }
    }

    @Test
    fun `GET animals filters by city query`() {
        voluntailTest {
            val body =
                client.get("/api/animals") {
                    parameter("city", "Amsterdam")
                }.bodyAsText()
            assertTrue(body.contains("Milo"))
            assertTrue(!body.contains("Rex"))
        }
    }
}
