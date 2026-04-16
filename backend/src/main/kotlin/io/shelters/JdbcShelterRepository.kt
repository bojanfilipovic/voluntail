package io.shelters

import java.util.UUID
import javax.sql.DataSource
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.builtins.serializer
import kotlinx.serialization.json.Json

class JdbcShelterRepository(
    private val dataSource: DataSource,
) : ShelterRepository {
    private val jsonParser = Json { ignoreUnknownKeys = true }

    override suspend fun list(): List<ShelterResponse> =
        withContext(Dispatchers.IO) {
            dataSource.connection.use { conn ->
                conn.prepareStatement(
                    """
                    select id, name, description, latitude, longitude, registry_tag, species, signup_url
                    from public.shelters
                    order by name
                    """.trimIndent(),
                ).use { ps ->
                    ps.executeQuery().use { rs ->
                        buildList {
                            while (rs.next()) {
                                val speciesJson = rs.getString("species")
                                add(
                                    ShelterResponse(
                                        id = rs.getObject("id", UUID::class.java).toString(),
                                        name = rs.getString("name"),
                                        description = rs.getString("description"),
                                        latitude = rs.getDouble("latitude"),
                                        longitude = rs.getDouble("longitude"),
                                        registryTag = RegistryTag.valueOf(rs.getString("registry_tag")),
                                        species = parseSpeciesJson(speciesJson),
                                        signupUrl = rs.getString("signup_url"),
                                    ),
                                )
                            }
                        }
                    }
                }
            }
        }

    private fun parseSpeciesJson(json: String?): List<String> {
        if (json.isNullOrBlank()) return emptyList()
        return json.decodeJsonArrayOfStrings()
    }

    private fun String.decodeJsonArrayOfStrings(): List<String> =
        jsonParser.decodeFromString(ListSerializer(String.serializer()), this)
}
