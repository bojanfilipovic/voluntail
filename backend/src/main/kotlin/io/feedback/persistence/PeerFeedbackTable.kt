package io.feedback.persistence

import org.jetbrains.exposed.v1.core.Table
import org.jetbrains.exposed.v1.core.java.javaUUID
import org.jetbrains.exposed.v1.javatime.timestampWithTimeZone

internal object PeerFeedbackTable : Table("peer_feedback") {
    val id = javaUUID("id")
    val createdAt = timestampWithTimeZone("created_at")
    val message = text("message")
    val contact = text("contact").nullable()
    val shelterId = javaUUID("shelter_id").nullable()
    val animalId = javaUUID("animal_id").nullable()

    override val primaryKey = PrimaryKey(id)
}
