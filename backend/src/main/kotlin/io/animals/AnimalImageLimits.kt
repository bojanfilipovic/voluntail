package io.animals

internal const val ANIMAL_MAX_IMAGE_URLS = 15

internal const val ANIMAL_MAX_IMAGE_URL_CHARS = 2000

internal fun normalizeAnimalImageUrls(raw: List<String>): List<String> {
    val seen = LinkedHashSet<String>()
    for (s in raw) {
        val t = s.trim()
        if (t.isEmpty()) continue
        if (t.length > ANIMAL_MAX_IMAGE_URL_CHARS) continue
        if (seen.add(t) && seen.size >= ANIMAL_MAX_IMAGE_URLS) break
    }
    return seen.toList()
}
