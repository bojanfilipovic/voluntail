package io.voluntail

import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.header
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
                        """{"name":"X","description":"Y","latitude":1.0,"longitude":2.0,"registryTag":"DOA","species":[]}""",
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
                        """{"name":"API Test Shelter","description":"From test","latitude":52.0,"longitude":5.0,"registryTag":"DOA","species":["dog"]}""",
                    )
                }
            assertEquals(HttpStatusCode.Created, createRes.status)
            val idRegex = """"id"\s*:\s*"([^"]+)"""".toRegex()
            val id =
                idRegex
                    .find(createRes.bodyAsText())
                    ?.groupValues
                    ?.get(1)
                    ?: error("no id in body")
            val del =
                client.delete("/api/shelters/$id") {
                    header("X-CMS-Key", "test-secret")
                }
            assertEquals(HttpStatusCode.NoContent, del.status)
            val listBody = client.get("/api/shelters").bodyAsText()
            assertTrue(!listBody.contains("API Test Shelter"))
        }
}
