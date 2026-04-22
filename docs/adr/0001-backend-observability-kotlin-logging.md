# 0001 — Backend observability (kotlin-logging, access logs, unhandled errors)

**Status:** Accepted (supersedes klogging-only draft)  
**Date:** 2026-04-22

## Context

Solo project goal: **near-zero DevOps** with enough signal to debug production: host log tail, a stable liveness path, and visibility into requests and unhandled failures. Application code uses **[kotlin-logging](https://github.com/oshai/kotlin-logging)** as **`io.github.oshai:kotlin-logging-jvm`** (import **`io.github.oshai.kotlinlogging`**, lazy message lambdas) on top of **SLF4J/Logback**. This is the current supported line; legacy `io.github.microutils` / `mu` were [superseded in v5+](https://github.com/oshai/kotlin-logging). Ktor `CallLogging` and Netty also emit via SLF4J.

## Decision

1. **Application events:** `KotlinLogging.logger("io.voluntail")` in [`LoggingConfig.kt`](../../backend/src/main/kotlin/io/voluntail/LoggingConfig.kt) — `logger.info { }` / `logger.error(throwable) { }` with no separate runtime “logging init” (Logback is configured from `logback.xml`).
2. **Startup (non-secret):** Log port (from `PORT` or default), `persistence` = `postgres` or `in-memory` (from `DB_URL`), `feedback` availability (from repository wiring), and `cms` = `enabled` | `disabled` (presence of `CMS_API_KEY` only — no key material).
3. **Access line:** Ktor `CallLogging` at INFO, **skipping** `GET /health` to limit probe noise; logs to SLF4J/Logback.
4. **Unhandled `Throwable`:** Ktor `StatusPages` — `logger.error(cause) { }`, respond with plain `500` + `"Internal server error"`.

**Deferred:** JSON/structured one-line log layout, separate `/ready` with DB check.

**Superseded:** `io.klogging:klogging` and pre–v5 `io.github.microutils` / `mu` in favor of **`io.github.oshai`** kotlin-logging.

## Consequences

- Gradle (version catalog): `io.github.oshai:kotlin-logging-jvm:8.0.01`, `ch.qos.logback:logback-classic:1.5.32`, `org.postgresql:postgresql:42.7.8`, Ktor `ktor-server-status-pages` + `ktor-server-call-logging` (see `backend/gradle/libs.versions.toml` for current pins).
- No change to `/health` JSON. No new required env vars.

**Code:** `backend/.../LoggingConfig.kt`, `Application.kt`, `HTTP.kt`, `Routing.kt`
