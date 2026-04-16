package io.shelters

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import io.shelters.persistence.ExposedShelterRepository
import org.jetbrains.exposed.v1.jdbc.Database

// TODO bfilipovic: fix this class the code is quite messy
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
            // PgBouncer transaction mode (e.g. Supabase pooler :6543) cannot reuse server-side
            // prepared statements across pooled backend sessions; force simple protocol.
            addDataSourceProperty("prepareThreshold", "0")
        }
    val dataSource = HikariDataSource(cfg)
    val database = Database.connect(dataSource)
    return ExposedShelterRepository(database)
}
