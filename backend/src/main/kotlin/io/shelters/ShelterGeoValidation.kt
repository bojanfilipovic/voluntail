package io.shelters

import kotlin.math.abs

internal fun isValidShelterCreate(req: ShelterCreateRequest): Boolean =
    when {
        req.name.isBlank() -> false
        req.city.isBlank() -> false
        (!req.latitude.isFinite() || !req.longitude.isFinite()) -> false
        !isValidLatitude(req.latitude) || !isValidLongitude(req.longitude) -> false
        else -> true
    }

internal fun isValidShelterUpdate(req: ShelterUpdateRequest): Boolean =
    when {
        req.latitude != null && (!req.latitude.isFinite() || !isValidLatitude(req.latitude)) -> false
        req.longitude != null && (!req.longitude.isFinite() || !isValidLongitude(req.longitude)) -> false
        else -> true
    }

private fun isValidLatitude(value: Double): Boolean = abs(value) <= 90.0

private fun isValidLongitude(value: Double): Boolean = abs(value) <= 180.0
