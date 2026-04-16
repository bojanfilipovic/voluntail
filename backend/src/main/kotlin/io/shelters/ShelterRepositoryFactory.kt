package io.shelters

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource

fun createShelterRepository(): ShelterRepository {
//    val url = System.getenv("DATABASE_JDBC_URL")?.trim().orEmpty()
    val url = System.getenv("DB_URL")?.trim().orEmpty()
    if (url.isEmpty()) {
        return InMemoryShelterRepository()
    }
    val cfg =
        HikariConfig().apply {
            jdbcUrl = url
            username = System.getenv("DB_USERNAME")
            password = System.getenv("DB_PASSWORD")
            maximumPoolSize = 5
            poolName = "voluntail-shelters"
        }
    val dataSource = HikariDataSource(cfg)
    return JdbcShelterRepository(dataSource)
}
