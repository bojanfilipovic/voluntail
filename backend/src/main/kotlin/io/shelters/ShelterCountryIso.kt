package io.shelters

import kotlin.math.abs

/**
 * Maps coordinates to ISO 3166-1 alpha-2 using rough bounding boxes — **no Mapbox Tilequery**
 * (zero billable geocoding HTTP calls). Borders may classify ambiguous points incorrectly.
 * Regions are checked in order (specific overlaps handled first).
 */
internal fun countryIsoFromLatLon(
    latitude: Double,
    longitude: Double,
): String? {
    if (!latitude.isFinite() || !longitude.isFinite()) return null
    if (abs(latitude) > 90.0 || abs(longitude) > 180.0) return null
    for ((minLat, maxLat, minLon, maxLon, iso) in COUNTRY_REGION_BOXES) {
        if (latitude in minLat..maxLat && longitude in minLon..maxLon) return iso
    }
    return null
}

private val COUNTRY_REGION_BOXES: List<RegionBox> =
    listOf(
        /** Croatia (pilot shelter outside NL). */
        RegionBox(42.2, 46.95, 13.0, 19.55, "HR"),
        /** Netherlands (directory pilot). */
        RegionBox(50.75, 53.55, 3.3, 7.23, "NL"),
    )

private data class RegionBox(
    val minLat: Double,
    val maxLat: Double,
    val minLon: Double,
    val maxLon: Double,
    val iso: String,
)
