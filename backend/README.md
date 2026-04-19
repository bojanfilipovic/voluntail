# voluntail

This project was created using the [Ktor Project Generator](https://start.ktor.io).

Here are some useful links to get you started:

- [Ktor Documentation](https://ktor.io/docs/home.html)
- [Ktor GitHub page](https://github.com/ktorio/ktor)
- The [Ktor Slack chat](https://app.slack.com/client/T09229ZC6/C0A974TJ9). You'll need to [request an invite](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up) to join.

## Features

Here's a list of features included in this project:

| Name                                                                   | Description                                                                        |
| ------------------------------------------------------------------------|------------------------------------------------------------------------------------ |
| [Default Headers](https://start.ktor.io/p/default-headers)             | Adds a default set of headers to HTTP responses                                    |
| [Content Negotiation](https://start.ktor.io/p/content-negotiation)     | Provides automatic content conversion according to Content-Type and Accept headers |
| [Routing](https://start.ktor.io/p/routing)                             | Provides a structured routing DSL                                                  |
| [kotlinx.serialization](https://start.ktor.io/p/kotlinx-serialization) | Handles JSON serialization using kotlinx.serialization library                     |
| [CORS](https://start.ktor.io/p/cors)                                   | Enables Cross-Origin Resource Sharing (CORS)                                       |

## Building & Running

Uses **JDK 21** via Gradle `kotlin { jvmToolchain(21) }` and Kotlin `jvmTarget` 21.

### Shelters / Postgres (Supabase)

- Versioned DDL: [`supabase/migrations/`](supabase/migrations/) — run files **in name order** in the Supabase SQL editor (create table, then seed), or wire Supabase CLI later. The seed migration is **idempotent** (`ON CONFLICT DO UPDATE`).
- **JDBC:** set env **`DB_URL`** to your full JDBC URL for Postgres (Supabase). Optional **`DB_USERNAME`** / **`DB_PASSWORD`** when the URL does not embed credentials. See [`.env.example`](.env.example). If **`DB_URL`** is unset or empty, `/api/shelters` uses **in-memory** sample data.
- **CORS:** optional comma-separated **`CORS_ORIGINS`** (browser Origins, e.g. `http://localhost:5173,https://myapp.vercel.app`). If unset, defaults to local Vite ports only (`http://localhost:5173`, `http://localhost:4173`).
- Reads use **JetBrains Exposed** (DSL + JDBC) on top of the same Hikari pool; schema remains owned by Supabase SQL only (no `SchemaUtils` DDL from the app).
- Pool: **HikariCP** (`maximumPoolSize` 5).

**Supabase pooler / JDBC URL hints**

- Prefer **`sslmode=require`** (or stricter) on hosted Postgres.
- Supabase’s **transaction pooler** (PgBouncer in transaction mode) does not play well with server-side prepared statements. **`ShelterRepositoryFactory`** sets **`prepareThreshold=0`** on the pool via Hikari `addDataSourceProperty`, so the PostgreSQL JDBC driver avoids server-side named prepared statements for connections from this pool.

### JDK 21 on this Mac (Homebrew)

`openjdk@21` is **keg-only**: it does not replace the default `java`, and `/usr/libexec/java_home` may still only list another JDK (e.g. 26). Gradle then cannot resolve toolchain 21 unless you point it at 21.

**Option A — per shell (no sudo, good default)**  
Use Homebrew’s JDK 21 as `JAVA_HOME` before Gradle:

```bash
export JAVA_HOME="/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"
```

Add the same `export` lines to `~/.zshrc` if you want that for every terminal.

**Option B — install once, system `java_home` sees 21 (requires sudo)**  
Then `/usr/libexec/java_home -v 21` works for GUI apps and tools that only look at the macOS JVM directory:

```bash
brew install openjdk@21   # if not already installed
sudo ln -sfn /opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-21.jdk
```

**Check:** `./gradlew -version` should report JVM **21** after Option A or after `export JAVA_HOME=$(/usr/libexec/java_home -v 21)`.

### CI (GitHub Actions)

The repo runs **`./gradlew test`** on `backend/` and **`npm ci` + lint + build** on `frontend/` on pushes and PRs to `main` / `master` — see [`.github/workflows/ci.yml`](../.github/workflows/ci.yml).

### Docker sample (Railway-ready image)

[`Dockerfile`](Dockerfile) builds a runnable image with `./gradlew shadowJar`. Example:

```bash
docker build -t voluntail-api -f Dockerfile .
docker run --rm -p 8080:8080 -e PORT=8080 voluntail-api
```

The process listens on **`PORT`** (default **8080**). Configure **`DB_URL`**, **`CMS_API_KEY`**, etc. when you deploy.

### Gradle tasks

| Task | Description |
|------|-------------|
| `./gradlew test` | Run tests |
| `./gradlew build` | Build and test |
| `./gradlew shadowJar` | Fat JAR with runtime deps (`build/libs/voluntail-all.jar`) |
| `./gradlew run` | Run the server locally |

If the server starts successfully, you'll see log output ending with responding at **`http://0.0.0.0:<port>`** (`PORT` or **8080**).

### Frontend (monorepo)

The React app lives in **`../frontend/`**. **V1 uses plain CSS** (see `frontend/src/App.css`); Tailwind/shadcn are planned later.

