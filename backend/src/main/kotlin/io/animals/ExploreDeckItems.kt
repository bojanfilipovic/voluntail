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
    val items = mutableListOf<AnimalResponse>()
    var offset = 0
    while (items.size < maxRows) {
        val page =
            animalRepository.listPage(
                filters = filters,
                visibility = AnimalListVisibility.Public,
                limit = pageLimit,
                offset = offset,
                shuffleSeed = shuffleSeed,
            )
        items.addAll(page.items)
        if (page.items.isEmpty() || items.size >= page.total) break
        offset += page.items.size
    }
    return items
}
