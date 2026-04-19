package io.shelters

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import io.shelters.persistence.ExposedShelterRepository
import org.jetbrains.exposed.v1.jdbc.Database

fun createShelterRepository(): ShelterRepository =
    System.getenv("DB_URL")?.trim().orEmpty()
        .let { jdbcUrl ->
            when {
                jdbcUrl.isEmpty() -> InMemoryShelterRepository()
                else -> {
                    ExposedShelterRepository(
                        Database.connect(dataSource(jdbcUrl))
                    )
                }
            }
        }

private fun dataSource(jdbcUrl: String): HikariDataSource =
    HikariDataSource(
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
    )