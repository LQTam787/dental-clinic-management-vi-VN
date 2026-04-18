# Revenue & Tax Subsystem — Session 1: Database Extensions & Core Models
## Final Working Script

**Session:** Revenue Session 1 of 8  
**Duration:** ~1.5 hours | Backend only  
**Reference:** `REVENUE_TAX_SUBSYSTEM_MASTER_PLAN.md` — Section 8, Session 1  
**Status:** Complete

---

## Session Objectives

Add the two new database tables and the Java model/repository/DTO layer that all later Revenue sessions depend on. No service logic or controllers are created in this session.

**Tasks completed:**
1. Write `V2__revenue_tables.sql` (two `CREATE TABLE` statements + seed `INSERT`)
2. Create `ClinicSettings.java` entity
3. Create `MonthlyRevenue.java` entity
4. Create `ClinicSettingsRepository.java`
5. Create `MonthlyRevenueRepository.java`
6. Create `ClinicSettingsDTO.java`
7. Create `MonthlyRevenueDTO.java`
8. Add Flyway dependency to `pom.xml`
9. Add Flyway configuration to `application.properties`

---

## Files Changed

| File | Action | Package/Path |
|------|--------|--------------|
| `V2__revenue_tables.sql` | **New** | `src/main/resources/db/migration/` |
| `ClinicSettings.java` | **New** | `com.dentalclinic.model` |
| `MonthlyRevenue.java` | **New** | `com.dentalclinic.model` |
| `ClinicSettingsRepository.java` | **New** | `com.dentalclinic.repository` |
| `MonthlyRevenueRepository.java` | **New** | `com.dentalclinic.repository` |
| `ClinicSettingsDTO.java` | **New** | `com.dentalclinic.dto` |
| `MonthlyRevenueDTO.java` | **New** | `com.dentalclinic.dto` |
| `pom.xml` | **Modified** | project root |
| `application.properties` | **Modified** | `src/main/resources/` |

---

## Complete File Contents

### 1. `src/main/resources/db/migration/V2__revenue_tables.sql`

This migration runs once via Flyway on startup. It creates both revenue tables and seeds the default `clinic_settings` row.

```sql
-- V2__revenue_tables.sql
-- Revenue & Tax Subsystem — Session 1
-- Reference: TT 152/2025/TT-BTC

-- ---------------------------------------------------------------------------
-- Table: clinic_settings
-- Single-row table. The service layer creates a default row on first read
-- if the seed INSERT below is somehow absent. All string fields may be empty.
-- ---------------------------------------------------------------------------
CREATE TABLE clinic_settings (
    id               BIGSERIAL    PRIMARY KEY,
    business_name    VARCHAR(255),
    owner_name       VARCHAR(255),
    address          VARCHAR(500),
    tax_id           VARCHAR(50),
    business_address VARCHAR(500),
    currency_unit    VARCHAR(20)  NOT NULL DEFAULT 'VNĐ',
    tncn_rate        NUMERIC(5,4) NOT NULL DEFAULT 0.0200,
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed the default settings row.
-- All string fields are intentionally empty; the user fills them in via the
-- Settings UI (Session 6). The S1a-HKD form renders "..........." for blanks.
INSERT INTO clinic_settings (business_name, owner_name, address, tax_id,
    business_address, currency_unit, tncn_rate)
VALUES ('', '', '', '', '', 'VNĐ', 0.0200);

-- ---------------------------------------------------------------------------
-- Table: monthly_revenue
-- One row per finalized calendar month. The UNIQUE(year, month) constraint
-- makes finalization idempotent at the database level.
-- ---------------------------------------------------------------------------
CREATE TABLE monthly_revenue (
    id                BIGSERIAL     PRIMARY KEY,
    year              INTEGER       NOT NULL,
    month             INTEGER       NOT NULL CHECK (month BETWEEN 1 AND 12),
    total_revenue     NUMERIC(15,2) NOT NULL DEFAULT 0,
    appointment_count INTEGER       NOT NULL DEFAULT 0,
    tncn_amount       NUMERIC(15,2) NOT NULL DEFAULT 0,
    finalized         BOOLEAN       NOT NULL DEFAULT FALSE,
    finalized_at      TIMESTAMP,
    notes             VARCHAR(1000),
    created_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_year_month UNIQUE (year, month)
);
```

---

### 2. `src/main/java/com/dentalclinic/model/ClinicSettings.java`

```java
package com.dentalclinic.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Clinic business identity and tax configuration.
 *
 * Always contains exactly one row. The service layer creates a default row
 * on first access if none is present (the Flyway migration also seeds one,
 * so in practice the row always exists when the application starts).
 *
 * Field mapping to the S1a-HKD form (TT 152/2025/TT-BTC):
 *   businessName    → "HỘ, CÁ NHÂN KINH DOANH"
 *   address         → "Địa chỉ" in the header block
 *   taxId           → "Mã số thuế"
 *   businessAddress → "Địa điểm kinh doanh" sub-header
 *   currencyUnit    → "Đơn vị tính" sub-header
 *   ownerName       → signature block label
 *   tncnRate        → used to calculate thuế TNCN ước tính
 */
@Entity
@Table(name = "clinic_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClinicSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** "HỘ, CÁ NHÂN KINH DOANH" — printed on the S1a-HKD header. */
    @Column(name = "business_name")
    private String businessName;

    /** Full name of the representative / owner (used in signature block). */
    @Column(name = "owner_name")
    private String ownerName;

    /** Registered address of the business. */
    @Column(name = "address")
    private String address;

    /** "Mã số thuế" — tax identification number. */
    @Column(name = "tax_id")
    private String taxId;

    /**
     * "Địa điểm kinh doanh" — may differ from the registered address.
     * This is the physical location where services are rendered.
     */
    @Column(name = "business_address")
    private String businessAddress;

    /**
     * "Đơn vị tính" on the S1a-HKD sub-header.
     * Defaults to "VNĐ".
     */
    @Column(name = "currency_unit", nullable = false)
    private String currencyUnit = "VNĐ";

    /**
     * Personal income tax (thuế TNCN) rate as a decimal fraction.
     * 0.0200 represents 2%.
     *
     * The service layer validates that this value is in [0.0000, 1.0000].
     * The rate is locked into each MonthlyRevenue row at finalization time,
     * so changing it here does not alter historical records.
     *
     * Important: the clinic owner must confirm the applicable rate with the
     * local Chi cục Thuế before using this system for official tax filings.
     */
    @Column(name = "tncn_rate", nullable = false, precision = 5, scale = 4)
    private BigDecimal tncnRate = new BigDecimal("0.0200");

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
}
```

---

### 3. `src/main/java/com/dentalclinic/model/MonthlyRevenue.java`

```java
package com.dentalclinic.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Finalized monthly revenue snapshot.
 *
 * One row is written per calendar month when that month is finalized
 * (either by the scheduled job on the 1st or by the manual finalization
 * endpoint). The UNIQUE(year, month) database constraint makes
 * finalization idempotent.
 *
 * This table stores snapshots. Appointment data is never deleted;
 * the appointments table remains the source of truth for live queries.
 * A finalized row is the official declaration for a period and is not
 * updated retroactively when appointments are later edited.
 *
 * The tncnAmount is computed as totalRevenue × tncn_rate at the moment
 * of finalization and stored here. Changing the TNCN rate in ClinicSettings
 * does not alter previously finalized rows.
 */
@Entity
@Table(
    name = "monthly_revenue",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_year_month",
        columnNames = {"year", "month"}
    )
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyRevenue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Calendar year (e.g. 2026). */
    @Column(name = "year", nullable = false)
    private Integer year;

    /** Calendar month, 1-based (1 = January … 12 = December). */
    @Column(name = "month", nullable = false)
    private Integer month;

    /**
     * Sum of COALESCE(appointments.fee, 0) for appointments in this year/month.
     */
    @Column(name = "total_revenue", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalRevenue = BigDecimal.ZERO;

    /** Number of appointments in the period. */
    @Column(name = "appointment_count", nullable = false)
    private Integer appointmentCount = 0;

    /**
     * Personal income tax (thuế TNCN) amount:
     * totalRevenue × ClinicSettings.tncnRate at finalization time.
     */
    @Column(name = "tncn_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal tncnAmount = BigDecimal.ZERO;

    /**
     * false = draft / live preview; true = officially finalized.
     * Once set to true by the service layer it is never set back to false.
     */
    @Column(name = "finalized", nullable = false)
    private Boolean finalized = false;

    /** Timestamp when the month was finalized; null while not yet finalized. */
    @Column(name = "finalized_at")
    private LocalDateTime finalizedAt;

    /** Optional diễn giải / notes for the period. */
    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
}
```

---

### 4. `src/main/java/com/dentalclinic/repository/ClinicSettingsRepository.java`

```java
package com.dentalclinic.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dentalclinic.model.ClinicSettings;

/**
 * Data-access layer for ClinicSettings.
 *
 * No custom query methods are needed here — the single-row semantics are
 * handled entirely in ClinicSettingsService:
 *   findAll() is used to retrieve the singleton row.
 *   save(Object) is used to persist updates.
 */
@Repository
public interface ClinicSettingsRepository extends JpaRepository<ClinicSettings, Long> {
    // All required operations are covered by JpaRepository's default methods.
}
```

---

### 5. `src/main/java/com/dentalclinic/repository/MonthlyRevenueRepository.java`

```java
package com.dentalclinic.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.dentalclinic.model.MonthlyRevenue;

/**
 * Data-access layer for MonthlyRevenue.
 *
 * All query methods here operate on the finalized snapshot table.
 * Live revenue figures (current, unfinalized month) are computed directly
 * from the appointments table in AppointmentRepository.
 */
@Repository
public interface MonthlyRevenueRepository extends JpaRepository<MonthlyRevenue, Long> {

    /**
     * Returns the finalized record for a specific year/month, if one exists.
     *
     * Used by RevenueService to determine whether a month has already been
     * finalized before attempting to write a new snapshot.
     *
     * @param year  4-digit calendar year
     * @param month 1-based month (1 = January … 12 = December)
     * @return Optional containing the row if finalized, empty otherwise
     */
    Optional<MonthlyRevenue> findByYearAndMonth(int year, int month);

    /**
     * Returns all finalized records for a given year, ordered chronologically.
     *
     * Used by RevenueService.getAllMonthsForYear() to build the 12-element list
     * shown in the annual summary table. Months without a finalized record are
     * filled in with live-computed zero-value DTOs by the service layer.
     *
     * @param year 4-digit calendar year
     * @return List of finalized records for the year, sorted by month ASC
     */
    List<MonthlyRevenue> findAllByYearOrderByMonth(int year);

    /**
     * Aggregates the total revenue across all finalized records for a year.
     *
     * Returns BigDecimal.ZERO (via COALESCE) rather than null when there are
     * no finalized records for the year.
     *
     * @param year 4-digit calendar year
     * @return Sum of total_revenue for all finalized months in the year
     */
    @Query("SELECT COALESCE(SUM(mr.totalRevenue), 0) "
         + "FROM MonthlyRevenue mr "
         + "WHERE mr.year = :year")
    BigDecimal sumTotalRevenueByYear(@Param("year") int year);
}
```

---

### 6. `src/main/java/com/dentalclinic/dto/ClinicSettingsDTO.java`

```java
package com.dentalclinic.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data transfer object for ClinicSettings.
 *
 * All string fields are nullable to support the "empty settings" state:
 * the S1a-HKD ledger view renders placeholder dots when a field is blank.
 * Only currencyUnit and tncnRate have non-null defaults matching the
 * database defaults.
 *
 * Used by:
 *   GET /api/settings — returns the current settings
 *   PUT /api/settings — accepts updated settings
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClinicSettingsDTO {

    private Long id;

    /** "HỘ, CÁ NHÂN KINH DOANH" on the S1a-HKD form. */
    private String businessName;

    /** Representative / owner name (signature block). */
    private String ownerName;

    /** Registered address. */
    private String address;

    /** Tax identification number ("Mã số thuế"). */
    private String taxId;

    /** Physical service location ("Địa điểm kinh doanh"). */
    private String businessAddress;

    /** Currency unit label, e.g. "VNĐ". */
    private String currencyUnit;

    /**
     * TNCN rate as a decimal fraction (0.0200 = 2%).
     * Validated at the service layer to be in [0.0000, 1.0000].
     */
    private BigDecimal tncnRate;
}
```

---

### 7. `src/main/java/com/dentalclinic/dto/MonthlyRevenueDTO.java`

```java
package com.dentalclinic.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data transfer object for monthly revenue data.
 *
 * Returned by all revenue endpoints. Can represent either:
 *   A finalized month — data comes from MonthlyRevenue
 *     (finalized = true, finalizedAt is set).
 *   A live / unfinalized month — data is computed on-the-fly
 *     from the appointments table (finalized = false, finalizedAt is null).
 *
 * The getAllMonthsForYear service method always returns exactly 12 instances
 * of this DTO — one per calendar month. Future months use zero values and
 * finalized = false.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyRevenueDTO {

    /** 4-digit calendar year. */
    private int year;

    /** 1-based calendar month (1 = January … 12 = December). */
    private int month;

    /**
     * Total revenue for the period.
     * COALESCE(SUM(fee), 0) — never null.
     */
    private BigDecimal totalRevenue;

    /** Number of appointments in the period. */
    private int appointmentCount;

    /**
     * Personal income tax estimate:
     * totalRevenue × tncnRate at the time this DTO was built.
     * For finalized months this is the rate that was in effect at
     * finalization time.
     */
    private BigDecimal tncnAmount;

    /**
     * true if the month has been officially finalized and a snapshot row
     * exists in monthly_revenue.
     */
    private boolean finalized;

    /**
     * Timestamp when the month was finalized.
     * null for live / unfinalized months.
     */
    private LocalDateTime finalizedAt;
}
```

---

### 8. `pom.xml` — Flyway dependency added

Add this block inside the `<dependencies>` section:

```xml
<!-- Flyway — database migration (Session 1: V2__revenue_tables.sql) -->
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
```

Full `pom.xml` for reference:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.1</version>
        <relativePath/>
    </parent>

    <groupId>com.dentalclinic</groupId>
    <artifactId>dental-clinic-backend</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>dental-clinic-backend</name>
    <description>Dental Clinic Management System - Backend</description>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <scope>runtime</scope>
            <optional>true</optional>
        </dependency>

        <!-- Flyway — database migration (Session 1: V2__revenue_tables.sql) -->
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

---

### 9. `src/main/resources/application.properties` — Flyway configuration added

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/dental_clinic_vi_vn
spring.datasource.username=postgres
spring.datasource.password=123
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true

# Server Configuration
server.port=8080

# Logging
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE

# Application Name
spring.application.name=dental-clinic-backend

# Flyway - database migration (added Session 1)
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
spring.flyway.baseline-on-migrate=true
spring.flyway.baseline-version=1
```

> **Note on `baseline-on-migrate=true`:** Because the `patients` and `appointments` tables were already created by Hibernate (`ddl-auto=update`) before Flyway was added, `baseline-on-migrate=true` tells Flyway to mark the existing database as "already at baseline version 1" and only apply migrations V2 and later. Without this, Flyway would refuse to run on a non-empty database with no migration history.

---

## Design Notes

### Why NUMERIC(5,4) for tncn_rate?
Stores values from 0.0000 to 9.9999. The valid range is [0.0000, 1.0000], enforced in the service layer. This gives four decimal places of precision for the rate (e.g., 0.0200 = exactly 2%).

### Why NUMERIC(15,2) for monetary columns?
Supports amounts up to 9,999,999,999,999.99 VNĐ — well above any realistic Vietnamese dental fee. Two decimal places is standard for VNĐ amounts.

### Why seed an empty settings row?
The S1a-HKD form must never crash on missing settings. The seed row provides `tncn_rate=0.0200` and empty strings for all text fields. The form renders `"..........."` for blank fields, matching the official blank template convention.

### Why UNIQUE(year, month)?
This constraint at the database level is the last line of defense for idempotency. Even if the application service layer somehow calls `finalizeMonth` twice concurrently, only one row is ever written. The constraint also validates data integrity directly in the database.

---

## Success Criteria

After running `mvn spring-boot:run`:

1. **No startup errors** — Flyway applies V2 migration without errors
2. **Tables exist** — `clinic_settings` and `monthly_revenue` visible in PostgreSQL
3. **Seed row present** — `SELECT * FROM clinic_settings` returns one row with `tncn_rate = 0.0200`
4. **Constraints active** — `UNIQUE(year, month)` on `monthly_revenue` confirmed in `\d monthly_revenue`

### Verification queries

```sql
-- Confirm both tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('clinic_settings', 'monthly_revenue');

-- Confirm seed row
SELECT id, currency_unit, tncn_rate, created_at
FROM clinic_settings;

-- Confirm CHECK constraint on month
INSERT INTO monthly_revenue (year, month, total_revenue, appointment_count, tncn_amount, finalized)
VALUES (2026, 13, 0, 0, 0, false);
-- Expected: ERROR: new row for relation "monthly_revenue" violates check constraint

-- Confirm UNIQUE constraint
INSERT INTO monthly_revenue (year, month, total_revenue, appointment_count, tncn_amount, finalized)
VALUES (2026, 1, 1000000, 5, 20000, true);
INSERT INTO monthly_revenue (year, month, total_revenue, appointment_count, tncn_amount, finalized)
VALUES (2026, 1, 2000000, 8, 40000, true);
-- Expected second insert: ERROR: duplicate key value violates unique constraint "uq_year_month"
```

---

## Session Dependencies

- **Depends on:** Nothing — this is the foundation session.
- **Required by:** Revenue Session 2 (services and controllers), Revenue Session 3 (S1a-HKD endpoint).
- Sessions 1–3 and Session 4 (frontend tab navigation) can run in parallel.
