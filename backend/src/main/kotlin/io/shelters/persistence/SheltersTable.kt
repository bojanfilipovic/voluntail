package io.shelters.persistence

import io.shelters.ShelterSpecies
import io.voluntail.voluntailJson
import kotlinx.serialization.builtins.ListSerializer
import org.jetbrains.exposed.v1.core.Table
import org.jetbrains.exposed.v1.core.java.javaUUID
import org.jetbrains.exposed.v1.json.jsonb

object SheltersTable : Table("shelters") {
    val id = javaUUID("id")
    val name = text("name")
    val description = text("description")
    val latitude = double("latitude")
    val longitude = double("longitude")
    val species =
        jsonb(
            "species",
            voluntailJson,
            ListSerializer(ShelterSpecies.serializer()),
        )
    val signupUrl = text("signup_url").nullable()
    val imageUrl = text("image_url").nullable()
    val donationUrl = text("donation_url").nullable()
    val city = text("city")

    override val primaryKey = PrimaryKey(id)
}
