package io.shelters.persistence

import io.shelters.RegistryTag
import org.jetbrains.exposed.v1.core.Table
import org.jetbrains.exposed.v1.core.java.javaUUID

object SheltersTable : Table("shelters") {
    val id = javaUUID("id")
    val name = text("name")
    val description = text("description")
    val latitude = double("latitude")
    val longitude = double("longitude")
    val registryTag = enumerationByName<RegistryTag>("registry_tag", 16)
    val species = text("species")
    val signupUrl = text("signup_url").nullable()

    override val primaryKey = PrimaryKey(id)
}
