package io.animals

internal fun isValidAnimalCreate(req: AnimalCreateRequest): Boolean =
    req.name.isNotBlank() &&
        req.city.isNotBlank()

internal fun isValidAnimalUpdate(req: AnimalUpdateRequest): Boolean = true
