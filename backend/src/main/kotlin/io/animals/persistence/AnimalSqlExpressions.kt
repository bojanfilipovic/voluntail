package io.animals.persistence

import org.jetbrains.exposed.v1.core.Column
import org.jetbrains.exposed.v1.core.Expression
import org.jetbrains.exposed.v1.core.Op
import org.jetbrains.exposed.v1.core.QueryBuilder
import org.jetbrains.exposed.v1.core.stringLiteral
import java.util.UUID

/** Case-insensitive equality on a text column (Postgres `LOWER(col) = LOWER(literal)`). */
class CityEqualsIgnoreCaseOp(
    private val column: Column<String>,
    private val value: String,
) : Op<Boolean>() {
    override fun toQueryBuilder(queryBuilder: QueryBuilder) {
        queryBuilder {
            append("LOWER(")
            append(column)
            append(") = ")
            append(stringLiteral(value.trim().lowercase()))
        }
    }
}

/** `md5(seed || id::text)` for deterministic per-session shuffle ordering. */
class Md5SeedConcatAnimalIdExpr(
    private val seed: String,
    private val idColumn: Column<UUID>,
) : Expression<String>() {
    override fun toQueryBuilder(queryBuilder: QueryBuilder) {
        queryBuilder {
            append("md5(")
            append(stringLiteral(seed))
            append(" || ")
            append(idColumn)
            append("::text)")
        }
    }
}
