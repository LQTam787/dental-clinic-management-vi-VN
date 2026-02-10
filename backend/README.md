# Backend - Dental Clinic Management System

Spring Boot REST API for dental clinic management.

## Technology Stack

- **Spring Boot:** 3.2.1
- **Java:** 17
- **Maven:** 3.8+
- **Database:** PostgreSQL 14
- **ORM:** Spring Data JPA

## Prerequisites

- Java JDK 17+
- PostgreSQL 14+
- Maven 3.8+

## Setup

1. Create database:
   ```sql
   CREATE DATABASE dental_clinic;
   ```

2. Configure `application.properties`:
   ```properties
   spring.datasource.password=YOUR_PASSWORD
   ```

3. Build:
   ```bash
   mvn clean install
   ```

4. Run:
   ```bash
   mvn spring-boot:run
   ```

## API Endpoints

See main README.md for full API documentation.

**Base URL:** `http://localhost:8080/api`

## Architecture

```
src/main/java/com/dentalclinic/
├── model/          # JPA entities
├── repository/     # Data access
├── service/        # Business logic
├── controller/     # REST endpoints
├── dto/            # Data transfer objects
├── exception/      # Exception handling
└── config/         # Configuration
```

## Building for Production

```bash
mvn clean package -DskipTests
java -jar target/dental-clinic-backend-0.0.1-SNAPSHOT.jar
```

## Testing

```bash
mvn test
```

## License

MIT License - See LICENSE file