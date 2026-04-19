package io.voluntail

import io.feedback.FeedbackRepository
import io.feedback.persistence.ExposedFeedbackRepository
import io.shelters.InMemoryShelterRepository
import io.shelters.ShelterRepository
import io.shelters.persistence.ExposedShelterRepository
import org.jetbrains.exposed.v1.jdbc.Database

/**
 * Single JDBC pool + single Exposed [Database] per process when [DB_URL] is set.
 * Shelters fall back to in-memory samples without DB; feedback stays unavailable until DB is configured.
 */
fun createApplicationRepositories(): Pair<ShelterRepository, FeedbackRepository?> {
    val jdbcUrl = System.getenv("DB_URL")?.trim().orEmpty()
    return if (jdbcUrl.isEmpty()) {
        InMemoryShelterRepository() to null
    } else {
        val database =
            Database.connect(
                createHikariDataSource(
                    jdbcUrl,
                    "voluntail-pg",
                ),
            )
        ExposedShelterRepository(database) to ExposedFeedbackRepository(database)
    }
}
