package io.shelters.persistence

import io.shelters.ShelterSuggestionStatus
import org.jetbrains.exposed.v1.core.Table
import org.jetbrains.exposed.v1.core.java.javaUUID
import org.jetbrains.exposed.v1.javatime.timestampWithTimeZone

internal object ShelterSuggestionsTable : Table("shelter_suggestions") {
    val id = javaUUID("id")
    val createdAt = timestampWithTimeZone("created_at")
    val name = text("name")
    val latitude = double("latitude")
    val longitude = double("longitude")
    val description = text("description").nullable()
    val city = text("city").nullable()
    val speciesNote = text("species_note").nullable()
    val signupUrl = text("signup_url").nullable()
    val imageUrl = text("image_url").nullable()
    val donationUrl = text("donation_url").nullable()
    val contact = text("contact").nullable()
    val status = enumerationByName<ShelterSuggestionStatus>("status", 32)

    override val primaryKey = PrimaryKey(id)
}
