import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.ktor)
    alias(libs.plugins.kotlin.plugin.serialization)
    alias(libs.plugins.ktlint)
}

group = "io"
version = "0.0.1"

application {
    mainClass = "io.voluntail.ApplicationKt"
}

kotlin {
    jvmToolchain(21)
}

ktlint {
    additionalEditorconfig.set(
        mapOf(
            "ktlint_standard_enum-entry-name-case" to "disabled",
            "ktlint_standard_filename" to "disabled",
        ),
    )
}

tasks.withType<KotlinCompile>().configureEach {
    compilerOptions {
        jvmTarget.set(JvmTarget.JVM_21)
    }
}

dependencies {
    implementation(libs.postgresql.jdbc)
    implementation(libs.hikari)
    implementation(libs.exposed.core)
    implementation(libs.exposed.jdbc)
    implementation(libs.exposed.java.time)
    implementation(libs.ktor.server.default.headers)
    implementation(libs.ktor.server.content.negotiation)
    implementation(libs.ktor.server.core)
    implementation(libs.ktor.serialization.kotlinx.json)
    implementation(libs.ktor.server.cors)
    implementation(libs.ktor.server.call.logging)
    implementation(libs.ktor.server.status.pages)
    implementation(libs.ktor.server.netty)
    implementation(libs.kotlin.logging)
    implementation(libs.logback.classic)
    testImplementation(libs.ktor.server.test.host)
    testImplementation("io.ktor:ktor-client-core:${libs.versions.ktor.get()}")
    testImplementation(libs.kotlin.test.junit)
}

tasks.withType<Test>().configureEach {
    environment("CMS_API_KEY", "test-secret")
    // Do not inherit a developer/CI DB_URL: tests use in-memory repositories and expect no JDBC pool.
    environment("DB_URL", "")
}
