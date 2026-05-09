package io.voluntail

import io.ktor.client.request.get
import io.ktor.client.statement.bodyAsText
import io.ktor.http.HttpStatusCode
import io.voluntail.test.voluntailTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class DirectoryRoutesTest {
    @Test
    fun `GET directory-stats returns aggregate fields`() {
        voluntailTest {
            val res = client.get("/api/directory-stats")
            assertEquals(HttpStatusCode.OK, res.status)
            val body = res.bodyAsText()
            assertTrue(body.contains("shelterCount"))
            assertTrue(body.contains("animalCount"))
            assertTrue(body.contains("heartCountSum"))
        }
    }
}
