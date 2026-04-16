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
- **JDBC:** set env **`DATABASE_JDBC_URL`** to your full JDBC URL (see [`.env.example`](.env.example)). If unset, `/api/shelters` uses **in-memory** sample data.
- Pool: **HikariCP** (`maximumPoolSize` 5).

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

To build or run the project, use one of the following tasks:

| Task                                    | Description                                                          |
| -----------------------------------------|---------------------------------------------------------------------- |
| `./gradlew test`                        | Run the tests                                                        |
| `./gradlew build`                       | Build everything                                                     |
| `./gradlew buildFatJar`                 | Build an executable JAR of the server with all dependencies included |
| `./gradlew buildImage`                  | Build the docker image to use with the fat JAR                       |
| `./gradlew publishImageToLocalRegistry` | Publish the docker image locally                                     |
| `./gradlew run`                         | Run the server                                                       |
| `./gradlew runDocker`                   | Run using the local docker image                                     |

If the server starts successfully, you'll see the following output:

```
2024-12-04 14:32:45.584 [main] INFO  Application - Application started in 0.303 seconds.
2024-12-04 14:32:45.682 [main] INFO  Application - Responding at http://0.0.0.0:8080
```

