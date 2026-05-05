package io.voluntail

import org.jetbrains.exposed.v1.core.Column
import org.jetbrains.exposed.v1.core.ColumnType
import org.jetbrains.exposed.v1.core.Op
import org.jetbrains.exposed.v1.core.QueryBuilder
import org.jetbrains.exposed.v1.core.Table
import org.jetbrains.exposed.v1.core.stringLiteral

class TextArrayColumnType : ColumnType<List<String>>() {
    override fun sqlType(): String = "TEXT[]"

    override fun valueFromDB(value: Any): List<String> =
        when (value) {
            is java.sql.Array -> (value.array as Array<*>).map { it.toString() }
            is Array<*> -> value.map { it.toString() }
            is Collection<*> -> value.map { it.toString() }
            else -> error(
                "Column type mismatch: expected text[] but got ${value::class.simpleName}. " +
                    "Run the latest migrations (species column changed from jsonb to text[]).",
            )
        }

    override fun notNullValueToDB(value: List<String>): Any = value.toTypedArray()
}

fun Table.textArray(name: String): Column<List<String>> =
    registerColumn(name, TextArrayColumnType())

/** Emits `column @> ARRAY['element']::text[]` (array-contains). */
class ArrayContainsOp(
    private val column: Column<List<String>>,
    private val element: String,
) : Op<Boolean>() {
    override fun toQueryBuilder(queryBuilder: QueryBuilder) {
        queryBuilder {
            append(column)
            append(" @> ARRAY[")
            append(stringLiteral(element))
            append("]::text[]")
        }
    }
}

infix fun Column<List<String>>.arrayContains(element: String): Op<Boolean> =
    ArrayContainsOp(this, element)
