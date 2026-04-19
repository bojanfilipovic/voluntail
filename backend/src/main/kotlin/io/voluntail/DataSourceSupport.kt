package io.voluntail

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource

internal fun createHikariDataSource(
    jdbcUrl: String,
    poolName: String,
): HikariDataSource =
    HikariDataSource(
        HikariConfig().apply {
            this.jdbcUrl = jdbcUrl
            System.getenv("DB_USERNAME")?.takeIf { it.isNotBlank() }?.let { username = it }
            System.getenv("DB_PASSWORD")?.takeIf { it.isNotBlank() }?.let { password = it }
            maximumPoolSize = 5
            this.poolName = poolName
            // PgBouncer transaction mode (e.g. Supabase pooler :6543) cannot reuse server-side
            // prepared statements across pooled backend sessions; force simple protocol.
            addDataSourceProperty(
                "prepareThreshold",
                "0",
            )
        },
    )
