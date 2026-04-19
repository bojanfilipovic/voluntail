package io.shelters.persistence

import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.builtins.serializer
import kotlinx.serialization.json.Json
import org.jetbrains.exposed.v1.core.Table
import org.jetbrains.exposed.v1.core.java.javaUUID
import org.jetbrains.exposed.v1.json.jsonb

internal val sheltersTableJson =
    Json {
        ignoreUnknownKeys = true
    }

object SheltersTable : Table("shelters") {
    val id = javaUUID("id")
    val name = text("name")
    val description = text("description")
    val latitude = double("latitude")
    val longitude = double("longitude")
    val species =
        jsonb(
            "species",
            sheltersTableJson,
            ListSerializer(String.serializer()),
        )
    val signupUrl = text("signup_url").nullable()
    val imageUrl = text("image_url").nullable()
    val donationUrl = text("donation_url").nullable()

    override val primaryKey = PrimaryKey(id)
}
