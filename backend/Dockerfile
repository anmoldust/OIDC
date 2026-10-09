# ─────────────────────────────────────────────────────────────────────────────
#  Spring Boot Backend — Multi-stage Dockerfile
#  Stage 1: Build with Maven
#  Stage 2: Runtime with distroless Java 21 for minimal attack surface
# ─────────────────────────────────────────────────────────────────────────────

# ── Build Stage ──────────────────────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /workspace/app

# Copy POM first (layer caching)
COPY pom.xml .

# Download dependencies in a separate layer
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src src
RUN mvn package -DskipTests -B --no-transfer-progress

# Extract Spring Boot layers for optimized layer caching
RUN java -Djarmode=layertools -jar target/*.jar extract --destination target/extracted

# ── Runtime Stage ─────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runtime

# Security: run as non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

WORKDIR /app

# Copy Spring Boot layers in order (least → most likely to change)
COPY --from=builder /workspace/app/target/extracted/dependencies/          ./
COPY --from=builder /workspace/app/target/extracted/spring-boot-loader/   ./
COPY --from=builder /workspace/app/target/extracted/snapshot-dependencies/ ./
COPY --from=builder /workspace/app/target/extracted/application/           ./

# JVM tuning for containers
ENV JAVA_OPTS="-XX:+UseContainerSupport \
               -XX:MaxRAMPercentage=75 \
               -XX:+UseG1GC \
               -XX:+UseStringDeduplication \
               -Djava.security.egd=file:/dev/./urandom"

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS org.springframework.boot.loader.launch.JarLauncher"]
