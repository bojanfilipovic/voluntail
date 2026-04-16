package io.shelters

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import io.shelters.persistence.ExposedShelterRepository
import org.jetbrains.exposed.v1.jdbc.Database

fun createShelterRepository(): ShelterRepository {
    val jdbcUrl =
        System.getenv("DATABASE_JDBC_URL")?.trim().orEmpty().ifEmpty {
            System.getenv("DB_URL")?.trim().orEmpty()
        }
    if (jdbcUrl.isEmpty()) {
        return InMemoryShelterRepository()
    }
    val cfg =
        HikariConfig().apply {
            this.jdbcUrl = jdbcUrl
            System.getenv("DB_USERNAME")?.takeIf { it.isNotBlank() }?.let { username = it }
            System.getenv("DB_PASSWORD")?.takeIf { it.isNotBlank() }?.let { password = it }
            maximumPoolSize = 5
            poolName = "voluntail-shelters"
        }
    val dataSource = HikariDataSource(cfg)
    val database = Database.connect(dataSource)
    return ExposedShelterRepository(database)
}
