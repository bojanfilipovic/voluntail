package io.voluntail

import io.animals.AnimalRepository
import io.animals.InMemoryAnimalRepository
import io.animals.persistence.ExposedAnimalRepository
import io.feedback.FeedbackRepository
import io.feedback.persistence.ExposedFeedbackRepository
import io.shelters.InMemoryShelterRepository
import io.shelters.ShelterRepository
import io.shelters.ShelterSuggestionRepository
import io.shelters.persistence.ExposedShelterRepository
import io.shelters.persistence.ExposedShelterSuggestionRepository
import org.jetbrains.exposed.v1.jdbc.Database

data class ApplicationRepositories(
    val shelterRepository: ShelterRepository,
    val animalRepository: AnimalRepository,
    val feedbackRepository: FeedbackRepository?,
    val shelterSuggestionRepository: ShelterSuggestionRepository?,
)

/**
 * Single JDBC pool + single Exposed [Database] per process when [DB_URL] is set.
 * Shelters fall back to in-memory samples without DB; feedback and shelter suggestions stay unavailable until DB is configured.
 */
fun createApplicationRepositories(): ApplicationRepositories {
    val jdbcUrl = System.getenv("DB_URL")?.trim().orEmpty()
    return if (jdbcUrl.isEmpty()) {
        val shelters = InMemoryShelterRepository()
        ApplicationRepositories(
            shelterRepository = shelters,
            animalRepository = InMemoryAnimalRepository(shelters),
            feedbackRepository = null,
            shelterSuggestionRepository = null,
        )
    } else {
        val database =
            Database.connect(
                createHikariDataSource(
                    jdbcUrl,
                    "voluntail-pg",
                ),
            )
        ApplicationRepositories(
            shelterRepository = ExposedShelterRepository(database),
            animalRepository = ExposedAnimalRepository(database),
            feedbackRepository = ExposedFeedbackRepository(database),
            shelterSuggestionRepository = ExposedShelterSuggestionRepository(database),
        )
    }
}
