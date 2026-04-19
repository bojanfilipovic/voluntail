# Sample production-style image for Railway (or local smoke tests).
# Build: docker build -t voluntail-api ./backend
# Run:   docker run --rm -p 8080:8080 -e PORT=8080 voluntail-api

FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY gradlew ./gradlew
COPY gradle ./gradle
COPY settings.gradle.kts build.gradle.kts gradle.properties gradle/libs.versions.toml ./
COPY src ./src
RUN chmod +x gradlew && ./gradlew shadowJar --no-daemon -x test

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/build/libs/voluntail-all.jar /app/voluntail.jar
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/voluntail.jar"]
