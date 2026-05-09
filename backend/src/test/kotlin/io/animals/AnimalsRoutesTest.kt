package io.animals

import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.request.parameter
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
                client
                    .get("/api/animals") {
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
    fun `POST animal with wrong CMS key returns 401`() {
        voluntailTest {
            client
                .post("/api/animals") {
                    header("X-CMS-Key", "wrong-secret")
                    contentType(ContentType.Application.Json)
                    setBody(
                        """{"shelterId":"$sampleShelterId","name":"X","species":"dog","status":"available"}""",
                    )
                }.apply {
                    assertEquals(HttpStatusCode.Unauthorized, status)
                    assertEquals("Invalid or missing X-CMS-Key header", bodyAsText())
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

            client
                .patch("/api/animals/$id") {
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
                client
                    .get("/api/animals") {
                        parameter("city", "Amsterdam")
                    }.bodyAsText()
            assertTrue(body.contains("Milo"))
            assertTrue(!body.contains("Rex"))
        }
    }

    @Test
    fun `GET animals with invalid shelterId query returns 400`() {
        voluntailTest {
            client
                .get("/api/animals") {
                    parameter("shelterId", "not-a-uuid")
                }.apply {
                    assertEquals(HttpStatusCode.BadRequest, status)
                    assertEquals("Invalid shelterId query parameter", bodyAsText())
                }
        }
    }

    @Test
    fun `GET animals with invalid species query returns 400`() {
        voluntailTest {
            client
                .get("/api/animals") {
                    parameter("species", "fish")
                }.apply {
                    assertEquals(HttpStatusCode.BadRequest, status)
                    assertEquals("Invalid species query parameter", bodyAsText())
                }
        }
    }

    @Test
    fun `GET animals includes heartCount createdAt and imageUrls`() {
        voluntailTest {
            val body = client.get("/api/animals").bodyAsText()
            assertTrue(body.contains("\"heartCount\""))
            assertTrue(body.contains("\"createdAt\""))
            assertTrue(body.contains("\"imageUrls\""))
        }
    }

    @Test
    fun `POST heart increments count for published animal`() {
        voluntailTest {
            val sampleId = "b0000001-0001-4001-8001-000000000001"
            val res = client.post("/api/animals/$sampleId/heart")
            assertEquals(HttpStatusCode.OK, res.status)
            val body = res.bodyAsText()
            assertTrue(body.contains("\"heartCount\":1"))

            val res2 = client.post("/api/animals/$sampleId/heart")
            assertEquals(HttpStatusCode.OK, res2.status)
            assertTrue(res2.bodyAsText().contains("\"heartCount\":2"))
        }
    }

    @Test
    fun `POST heart returns 404 for unpublished animal`() {
        voluntailTest {
            val unpublishedId = "b0000004-0004-4004-8004-000000000004"
            val res = client.post("/api/animals/$unpublishedId/heart")
            assertEquals(HttpStatusCode.NotFound, res.status)
        }
    }

    @Test
    fun `POST heart returns 404 for nonexistent animal`() {
        voluntailTest {
            val res = client.post("/api/animals/00000000-0000-0000-0000-000000000000/heart")
            assertEquals(HttpStatusCode.NotFound, res.status)
        }
    }

    @Test
    fun `POST unheart decrements count for published animal`() {
        voluntailTest {
            val sampleId = "b0000001-0001-4001-8001-000000000001"
            client.post("/api/animals/$sampleId/heart")
            client.post("/api/animals/$sampleId/heart")
            val res = client.post("/api/animals/$sampleId/unheart")
            assertEquals(HttpStatusCode.OK, res.status)
            assertTrue(res.bodyAsText().contains("\"heartCount\":1"))

            val res2 = client.post("/api/animals/$sampleId/unheart")
            assertEquals(HttpStatusCode.OK, res2.status)
            assertTrue(res2.bodyAsText().contains("\"heartCount\":0"))
        }
    }

    @Test
    fun `POST unheart when count is zero stays zero`() {
        voluntailTest {
            val sampleId = "b0000001-0001-4001-8001-000000000001"
            val res = client.post("/api/animals/$sampleId/unheart")
            assertEquals(HttpStatusCode.OK, res.status)
            assertTrue(res.bodyAsText().contains("\"heartCount\":0"))
        }
    }

    @Test
    fun `POST unheart returns 404 for unpublished animal`() {
        voluntailTest {
            val unpublishedId = "b0000004-0004-4004-8004-000000000004"
            val res = client.post("/api/animals/$unpublishedId/unheart")
            assertEquals(HttpStatusCode.NotFound, res.status)
        }
    }

    @Test
    fun `POST unheart returns 404 for nonexistent animal`() {
        voluntailTest {
            val res = client.post("/api/animals/00000000-0000-0000-0000-000000000000/unheart")
            assertEquals(HttpStatusCode.NotFound, res.status)
        }
    }

    @Test
    fun `GET animals returns paged envelope with items total offset`() {
        voluntailTest {
            val body = client.get("/api/animals").bodyAsText()
            assertTrue(body.contains("\"items\""))
            assertTrue(body.contains("\"total\""))
            assertTrue(body.contains("\"offset\""))
        }
    }

    @Test
    fun `GET animal by id returns published row`() {
        voluntailTest {
            val sampleId = "b0000001-0001-4001-8001-000000000001"
            val res = client.get("/api/animals/$sampleId")
            assertEquals(HttpStatusCode.OK, res.status)
            assertTrue(res.bodyAsText().contains("Milo"))
        }
    }

    @Test
    fun `GET animals facets returns counts`() {
        voluntailTest {
            val body = client.get("/api/animals/facets").bodyAsText()
            assertTrue(body.contains("\"counts\""))
        }
    }

    @Test
    fun `GET animals with same shuffleSeed returns identical ordering`() {
        voluntailTest {
            val seed = "voluntail-test-shuffle"
            val a =
                client
                    .get("/api/animals") {
                        parameter("shuffleSeed", seed)
                        parameter("limit", 50)
                        parameter("offset", 0)
                    }.bodyAsText()
            val b =
                client
                    .get("/api/animals") {
                        parameter("shuffleSeed", seed)
                        parameter("limit", 50)
                        parameter("offset", 0)
                    }.bodyAsText()
            assertEquals(a, b)
        }
    }
}
