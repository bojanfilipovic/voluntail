package io.animals

import io.shelters.ShelterSpecies
import kotlinx.coroutines.runBlocking
import java.util.UUID
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class ExploreDeckItemsTest {
    @Test
    fun `loadExploreDeckItems stops on empty page`() =
        runBlocking {
            val repo =
                object : StubAnimalRepository() {
                    override suspend fun listPage(
                        filters: AnimalListFilters,
                        visibility: AnimalListVisibility,
                        limit: Int,
                        offset: Int,
                        shuffleSeed: String?,
                    ): AnimalListPageResponse {
                        assertEquals(AnimalListVisibility.Public, visibility)
                        return AnimalListPageResponse(
                            items = emptyList(),
                            total = 0,
                            limit = limit,
                            offset = offset,
                        )
                    }
                }
            val out =
                loadExploreDeckItems(
                    animalRepository = repo,
                    filters = AnimalListFilters(),
                    shuffleSeed = null,
                    maxRows = 100,
                    pageLimit = 50,
                )
            assertTrue(out.isEmpty())
        }

    @Test
    fun `loadExploreDeckItems pages with increasing offset until total reached`() =
        runBlocking {
            val calls = mutableListOf<Int>()
            val item = sampleAnimal("1")
            val repo =
                object : StubAnimalRepository() {
                    override suspend fun listPage(
                        filters: AnimalListFilters,
                        visibility: AnimalListVisibility,
                        limit: Int,
                        offset: Int,
                        shuffleSeed: String?,
                    ): AnimalListPageResponse {
                        calls.add(offset)
                        return when (offset) {
                            0 ->
                                AnimalListPageResponse(
                                    items = List(2) { item.copy(id = "id-$it") },
                                    total = 5,
                                    limit = limit,
                                    offset = offset,
                                )
                            2 ->
                                AnimalListPageResponse(
                                    items = List(2) { item.copy(id = "id-b-$it") },
                                    total = 5,
                                    limit = limit,
                                    offset = offset,
                                )
                            4 ->
                                AnimalListPageResponse(
                                    items = listOf(item.copy(id = "id-last")),
                                    total = 5,
                                    limit = limit,
                                    offset = offset,
                                )
                            else ->
                                AnimalListPageResponse(
                                    items = emptyList(),
                                    total = 5,
                                    limit = limit,
                                    offset = offset,
                                )
                        }
                    }
                }
            val out =
                loadExploreDeckItems(
                    animalRepository = repo,
                    filters = AnimalListFilters(species = ShelterSpecies.dog),
                    shuffleSeed = "seed",
                    maxRows = 10_000,
                    pageLimit = 2,
                )
            assertEquals(5, out.size)
            assertEquals(listOf(0, 2, 4), calls)
        }
}

private fun sampleAnimal(suffix: String): AnimalResponse =
    AnimalResponse(
        id = "00000000-0000-4000-8000-00000000000$suffix",
        shelterId = "a0000001-0001-4001-8001-000000000001",
        city = "X",
        name = "n",
        description = "d",
        species = ShelterSpecies.dog,
        status = AnimalStatus.available,
        published = true,
        imageUrls = emptyList(),
        imageUrl = null,
        externalUrl = null,
        createdAt = "1970-01-01T00:00:00Z",
        heartCount = 0,
    )

/** Throws on every [AnimalRepository] method except overrides in tests. */
private abstract class StubAnimalRepository : AnimalRepository {
    override suspend fun listPage(
        filters: AnimalListFilters,
        visibility: AnimalListVisibility,
        limit: Int,
        offset: Int,
        shuffleSeed: String?,
    ): AnimalListPageResponse = unsupported()

    override suspend fun count(
        filters: AnimalListFilters,
        visibility: AnimalListVisibility,
    ): Int = unsupported()

    override suspend fun sumHeartCount(
        filters: AnimalListFilters,
        visibility: AnimalListVisibility,
    ): Long = unsupported()

    override suspend fun speciesFacetCounts(
        filters: AnimalListFilters,
        visibility: AnimalListVisibility,
    ): Map<String, Int> = unsupported()

    override suspend fun findById(id: UUID): AnimalResponse? = unsupported()

    override suspend fun insert(request: AnimalCreateRequest): AnimalResponse = unsupported()

    override suspend fun update(
        id: UUID,
        request: AnimalUpdateRequest,
    ): AnimalResponse? = unsupported()

    override suspend fun delete(id: UUID): Boolean = unsupported()

    override suspend fun incrementHeartCount(id: UUID): Int? = unsupported()

    override suspend fun decrementHeartCount(id: UUID): Int? = unsupported()

    private fun unsupported(): Nothing = throw UnsupportedOperationException("not used in explore-deck unit test")
}
