package io.animals

import io.voluntail.EXPLORE_DECK_MAX_ROWS
import io.voluntail.MAX_PAGE_LIMIT

/**
 * Loads up to [EXPLORE_DECK_MAX_ROWS] published animals matching [filters], paging internally with [pageLimit].
 * Ordering matches [AnimalRepository.listPage] for public visibility (including shuffle when [shuffleSeed] is non-null).
 */
suspend fun loadExploreDeckItems(
    animalRepository: AnimalRepository,
    filters: AnimalListFilters,
    shuffleSeed: String?,
    maxRows: Int = EXPLORE_DECK_MAX_ROWS,
    pageLimit: Int = MAX_PAGE_LIMIT,
): List<AnimalResponse> {
    suspend fun paginate(
        offset: Int,
        acc: List<AnimalResponse>,
    ): List<AnimalResponse> {
        if (acc.size >= maxRows) return acc
        val page =
            animalRepository.listPage(
                filters = filters,
                visibility = AnimalListVisibility.Public,
                limit = pageLimit,
                offset = offset,
                shuffleSeed = shuffleSeed,
            )
        val merged = acc + page.items
        return when {
            page.items.isEmpty() || merged.size >= page.total -> merged
            else -> paginate(offset + page.items.size, merged)
        }
    }
    return paginate(0, emptyList())
}
