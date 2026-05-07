package io.animals.persistence

import io.voluntail.textArray
import org.jetbrains.exposed.v1.core.Table
import org.jetbrains.exposed.v1.core.java.javaUUID
import org.jetbrains.exposed.v1.javatime.timestampWithTimeZone

object AnimalsTable : Table("animals") {
    val id = javaUUID("id")
    val shelterId = javaUUID("shelter_id")
    val city = text("city")
    val name = text("name")
    val description = text("description")
    val species = text("species")
    val status = text("status")
    val published = bool("published")
    val imageUrls = textArray("image_urls")
    val imageUrl = text("image_url").nullable()
    val externalUrl = text("external_url").nullable()
    val createdAt = timestampWithTimeZone("created_at")
    val heartCount = integer("heart_count")

    override val primaryKey = PrimaryKey(id)
}
