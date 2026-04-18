# Revenue & Tax Subsystem — Session 2: Revenue Aggregation & Settings APIs
## Final Working Script

**Session:** Revenue Session 2 of 8  
**Duration:** ~2 hours | Backend only  
**Reference:** `REVENUE_TAX_SUBSYSTEM_MASTER_PLAN.md` — Section 8, Session 2  
**Prerequisite:** Revenue Session 1 complete (tables and models exist)  
**Status:** Complete

---

## Session Objectives

Build the full service and controller layer for the Revenue & Tax subsystem. After this session all revenue and settings API endpoints are live and testable in Postman. The S1a-HKD-specific code (S1a-HKD DTOs, the `getS1aHkdData` method, and its endpoint) is deferred to Revenue Session 3.

**Tasks completed:**
1. Add `sumFeeByYearAndMonth` and `countByYearAndMonth` JPQL queries to `AppointmentRepository.java`
2. Create `ClinicSettingsService.java`
3. Create `RevenueService.java` (without `getS1aHkdData`)
4. Create `MonthlyFinalizationJob.java`
5. Add `@EnableScheduling` to `DentalClinicApplication.java`
6. Create `ClinicSettingsController.java`
7. Create `RevenueController.java` (without the S1a-HKD endpoint)

---

## Files Changed

| File | Action | Package/Path |
|------|--------|--------------|
| `AppointmentRepository.java` | **Modified** (2 new JPQL methods) | `com.dentalclinic.repository` |
| `ClinicSettingsService.java` | **New** | `com.dentalclinic.service` |
| `RevenueService.java` | **New** | `com.dentalclinic.service` |
| `MonthlyFinalizationJob.java` | **New** | `com.dentalclinic.service` |
| `DentalClinicApplication.java` | **Modified** (`@EnableScheduling` added) | `com.dentalclinic` |
| `ClinicSettingsController.java` | **New** | `com.dentalclinic.controller` |
| `RevenueController.java` | **New** | `com.dentalclinic.controller` |

---

## Complete File Contents

### 1. `AppointmentRepository.java` — additions only

Two new JPQL methods appended to the existing interface. The existing `findAppointmentsWithPatients` query is unchanged.

```java
// Add inside AppointmentRepository (after the existing findAppointmentsWithPatients query)

/**
 * Sum of all appointment fees for a specific calendar month.
 *
 * Uses COALESCE at two levels:
 *   Inner COALESCE(a.fee, 0) — treats NULL fees as zero.
 *   Outer COALESCE(SUM(...), 0) — returns zero rather than NULL
 *   when there are no appointments in the period.
 *
 * @param year  4-digit calendar year
 * @param month 1-based month number (1 = January … 12 = December)
 * @return Non-null sum of fees; BigDecimal.ZERO when no appointments exist
 */
@Query("SELECT COALESCE(SUM(COALESCE(a.fee, 0)), 0) FROM Appointment a "
        + "WHERE EXTRACT(YEAR FROM a.date) = :year AND EXTRACT(MONTH FROM a.date) = :month")
BigDecimal sumFeeByYearAndMonth(@Param("year") int year, @Param("month") int month);

/**
 * Count of appointments for a specific calendar month.
 *
 * @param year  4-digit calendar year
 * @param month 1-based month number
 * @return Number of appointments in the period (0 if none)
 */
@Query("SELECT COUNT(a) FROM Appointment a "
        + "WHERE EXTRACT(YEAR FROM a.date) = :year AND EXTRACT(MONTH FROM a.date) = :month")
long countByYearAndMonth(@Param("year") int year, @Param("month") int month);
```

**Full file after Session 2 modifications** (the Session 3 `findAppointmentsWithPatientsByYearAndMonth` query is NOT yet present):

```java
package com.dentalclinic.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.dentalclinic.dto.AppointmentWithPatientDTO;
import com.dentalclinic.model.Appointment;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatientId(Long patientId);

    @Query("SELECT new com.dentalclinic.dto.AppointmentWithPatientDTO("
            + "a.id, a.date, a.diagnosis, a.treatment, a.needsImplant, "
            + "a.needsDenture, a.needsOrthodontics, a.fee, a.note, "
            + "p.id, p.name, p.birthYear, p.gender, p.phone, p.address) "
            + "FROM Appointment a JOIN a.patient p "
            + "WHERE (:search IS NULL OR "
            + "LOWER(p.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR "
            + "p.phone LIKE CONCAT('%', CAST(:search AS string), '%')) "
            + "AND (:needsImplant IS NULL OR a.needsImplant = :needsImplant) "
            + "AND (:needsDenture IS NULL OR a.needsDenture = :needsDenture) "
            + "AND (:needsOrthodontics IS NULL OR a.needsOrthodontics = :needsOrthodontics)")
    List<AppointmentWithPatientDTO> findAppointmentsWithPatients(
            @Param("search") String search,
            @Param("needsImplant") Boolean needsImplant,
            @Param("needsDenture") Boolean needsDenture,
            @Param("needsOrthodontics") Boolean needsOrthodontics);

    // Revenue aggregation queries — added Session 2

    @Query("SELECT COALESCE(SUM(COALESCE(a.fee, 0)), 0) FROM Appointment a "
            + "WHERE EXTRACT(YEAR FROM a.date) = :year AND EXTRACT(MONTH FROM a.date) = :month")
    BigDecimal sumFeeByYearAndMonth(@Param("year") int year, @Param("month") int month);

    @Query("SELECT COUNT(a) FROM Appointment a "
            + "WHERE EXTRACT(YEAR FROM a.date) = :year AND EXTRACT(MONTH FROM a.date) = :month")
    long countByYearAndMonth(@Param("year") int year, @Param("month") int month);
}
```

> **Why `EXTRACT` instead of `YEAR()`/`MONTH()`?** The JPQL functions `YEAR()` and `MONTH()` are Hibernate-specific and may not translate reliably to all databases. `EXTRACT(YEAR FROM ...)` and `EXTRACT(MONTH FROM ...)` are standard JPQL / SQL and work correctly with PostgreSQL.

---

### 2. `src/main/java/com/dentalclinic/service/ClinicSettingsService.java`

```java
package com.dentalclinic.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dentalclinic.dto.ClinicSettingsDTO;
import com.dentalclinic.model.ClinicSettings;
import com.dentalclinic.repository.ClinicSettingsRepository;

/**
 * Business logic for clinic settings (single-row configuration table).
 *
 * The settings table is always guaranteed to contain exactly one row.
 * getSettings() creates and persists a default row if none exists, so
 * callers never need to handle a null/empty result.
 */
@Service
public class ClinicSettingsService {

    @Autowired
    private ClinicSettingsRepository settingsRepository;

    /**
     * Returns the singleton settings row.
     *
     * If no row exists (e.g. on a fresh database that somehow missed the
     * Flyway seed), a default row is created and persisted before returning.
     *
     * @return The (only) ClinicSettings row — never null
     */
    @Transactional
    public ClinicSettings getSettings() {
        List<ClinicSettings> all = settingsRepository.findAll();
        if (all.isEmpty()) {
            ClinicSettings defaults = buildDefaultSettings();
            return settingsRepository.save(defaults);
        }
        return all.get(0);
    }

    /**
     * Updates the clinic settings from the supplied DTO.
     *
     * Validation rules:
     *   tncnRate must be in the closed interval [0.0000, 1.0000].
     *   Values outside this range throw IllegalArgumentException.
     *   All string fields may be null or blank (the S1a-HKD form degrades
     *   gracefully with placeholder dots).
     *
     * Partial updates are supported: any field left null in the DTO retains
     * its existing value. Only non-null fields are overwritten.
     *
     * @param dto Updated settings values
     * @return The persisted, updated ClinicSettings
     * @throws IllegalArgumentException if tncnRate is out of range
     */
    @Transactional
    public ClinicSettings updateSettings(ClinicSettingsDTO dto) {
        if (dto.getTncnRate() != null) {
            BigDecimal rate = dto.getTncnRate();
            if (rate.compareTo(BigDecimal.ZERO) < 0 || rate.compareTo(BigDecimal.ONE) > 0) {
                throw new IllegalArgumentException(
                        "Tỷ lệ thuế TNCN phải nằm trong khoảng [0.0000, 1.0000]. "
                        + "Giá trị nhận được: " + rate);
            }
        }

        ClinicSettings existing = getSettings();

        if (dto.getBusinessName()    != null) existing.setBusinessName(dto.getBusinessName());
        if (dto.getOwnerName()       != null) existing.setOwnerName(dto.getOwnerName());
        if (dto.getAddress()         != null) existing.setAddress(dto.getAddress());
        if (dto.getTaxId()           != null) existing.setTaxId(dto.getTaxId());
        if (dto.getBusinessAddress() != null) existing.setBusinessAddress(dto.getBusinessAddress());
        if (dto.getCurrencyUnit()    != null) existing.setCurrencyUnit(dto.getCurrencyUnit());
        if (dto.getTncnRate()        != null) existing.setTncnRate(dto.getTncnRate());

        existing.setUpdatedAt(LocalDateTime.now());
        return settingsRepository.save(existing);
    }

    /**
     * Convenience method: converts a ClinicSettings entity to a DTO.
     *
     * @param entity Source entity
     * @return Corresponding DTO
     */
    public ClinicSettingsDTO toDTO(ClinicSettings entity) {
        return new ClinicSettingsDTO(
                entity.getId(),
                entity.getBusinessName(),
                entity.getOwnerName(),
                entity.getAddress(),
                entity.getTaxId(),
                entity.getBusinessAddress(),
                entity.getCurrencyUnit(),
                entity.getTncnRate()
        );
    }

    private ClinicSettings buildDefaultSettings() {
        ClinicSettings s = new ClinicSettings();
        s.setBusinessName("");
        s.setOwnerName("");
        s.setAddress("");
        s.setTaxId("");
        s.setBusinessAddress("");
        s.setCurrencyUnit("VNĐ");
        s.setTncnRate(new BigDecimal("0.0200"));
        s.setCreatedAt(LocalDateTime.now());
        s.setUpdatedAt(LocalDateTime.now());
        return s;
    }
}
```

---

### 3. `src/main/java/com/dentalclinic/service/RevenueService.java`

This is the Session 2 version of `RevenueService`. It does **not** yet contain `getS1aHkdData` — that method and its supporting imports (`S1aHkdDTO`, `S1aHkdEntryDTO`, `Patient`) are added in Session 3.

```java
package com.dentalclinic.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dentalclinic.dto.MonthlyRevenueDTO;
import com.dentalclinic.model.ClinicSettings;
import com.dentalclinic.model.MonthlyRevenue;
import com.dentalclinic.repository.AppointmentRepository;
import com.dentalclinic.repository.MonthlyRevenueRepository;

/**
 * Core service for the Revenue & Tax subsystem.
 *
 * Responsibilities (Session 2):
 *   Computing live (unfinalized) monthly totals directly from the
 *   appointments table.
 *   Building the 12-element annual summary list.
 *   Finalizing a month — writing an immutable snapshot to monthly_revenue.
 *
 * Session 3 adds: getS1aHkdData (S1a-HKD ledger payload).
 *
 * Monthly reset mechanics: "Reset to zero on day 1" does NOT delete data.
 * The scheduled job (or manual endpoint) takes a snapshot of the previous
 * month's total and writes it to monthly_revenue. The live monthly total is
 * always re-computed from the appointments table, so it reflects any
 * retroactive edits. The finalized snapshot is immutable.
 */
@Service
public class RevenueService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private MonthlyRevenueRepository monthlyRevenueRepository;

    @Autowired
    private ClinicSettingsService settingsService;

    // -----------------------------------------------------------------------
    // Live (current month) queries
    // -----------------------------------------------------------------------

    /**
     * Live revenue total for the current calendar month.
     *
     * Computes SUM(COALESCE(fee, 0)) directly from the appointments table
     * for the current year/month. Never returns null.
     *
     * @return Current-month revenue; BigDecimal.ZERO if no appointments
     */
    public BigDecimal getCurrentMonthRevenue() {
        LocalDate today = LocalDate.now();
        BigDecimal result = appointmentRepository.sumFeeByYearAndMonth(
                today.getYear(), today.getMonthValue());
        return result != null ? result : BigDecimal.ZERO;
    }

    /**
     * Live appointment count for the current calendar month.
     *
     * @return Number of appointments in the current month
     */
    public long getCurrentMonthAppointmentCount() {
        LocalDate today = LocalDate.now();
        return appointmentRepository.countByYearAndMonth(
                today.getYear(), today.getMonthValue());
    }

    /**
     * Builds a MonthlyRevenueDTO for the current calendar month.
     *
     * The returned DTO always has finalized = false because the current
     * month is never finalized until it has ended.
     *
     * @return Live DTO for the current month
     */
    public MonthlyRevenueDTO getCurrentMonthDTO() {
        LocalDate today = LocalDate.now();
        return buildLiveDTO(today.getYear(), today.getMonthValue());
    }

    // -----------------------------------------------------------------------
    // Monthly / annual queries
    // -----------------------------------------------------------------------

    /**
     * Returns a MonthlyRevenueDTO for the given year/month.
     *
     * If a finalized snapshot exists in monthly_revenue, that row is returned
     * (finalized = true). Otherwise a live DTO is computed from the
     * appointments table (finalized = false).
     *
     * @param year  4-digit calendar year
     * @param month 1-based month number
     * @return DTO for the period — never null
     */
    public MonthlyRevenueDTO getMonthlyRevenue(int year, int month) {
        Optional<MonthlyRevenue> snapshot = monthlyRevenueRepository.findByYearAndMonth(year, month);
        if (snapshot.isPresent()) {
            return toDTO(snapshot.get());
        }
        return buildLiveDTO(year, month);
    }

    /**
     * Returns a 12-element list of monthly revenue DTOs for the given year.
     *
     * The list is always exactly 12 elements (index 0 = January,
     * index 11 = December). For each month:
     *   If a finalized snapshot exists → use it (finalized = true).
     *   If the month is in the past (but no snapshot) → compute live.
     *   If the month is in the future → return a zero-value DTO.
     *
     * @param year 4-digit calendar year
     * @return Immutable 12-element list, one DTO per calendar month
     */
    public List<MonthlyRevenueDTO> getAllMonthsForYear(int year) {
        Map<Integer, MonthlyRevenue> finalizedByMonth = monthlyRevenueRepository
                .findAllByYearOrderByMonth(year)
                .stream()
                .collect(Collectors.toMap(MonthlyRevenue::getMonth, mr -> mr));

        LocalDate today = LocalDate.now();
        List<MonthlyRevenueDTO> result = new ArrayList<>(12);

        for (int month = 1; month <= 12; month++) {
            if (finalizedByMonth.containsKey(month)) {
                result.add(toDTO(finalizedByMonth.get(month)));
            } else {
                boolean isFutureMonth = year > today.getYear()
                        || (year == today.getYear() && month > today.getMonthValue());
                if (isFutureMonth) {
                    result.add(buildZeroDTO(year, month));
                } else {
                    result.add(buildLiveDTO(year, month));
                }
            }
        }
        return result;
    }

    /**
     * Annual revenue total for the given year.
     *
     * Sums all finalized monthly totals from monthly_revenue plus the live
     * current-month total if the year is the current year. For past years,
     * only finalized rows contribute.
     *
     * @param year 4-digit calendar year
     * @return Annual total; BigDecimal.ZERO if no data
     */
    public BigDecimal getAnnualTotal(int year) {
        BigDecimal finalizedTotal = monthlyRevenueRepository.sumTotalRevenueByYear(year);
        if (finalizedTotal == null) finalizedTotal = BigDecimal.ZERO;

        LocalDate today = LocalDate.now();
        if (year == today.getYear()) {
            int currentMonth = today.getMonthValue();
            boolean currentMonthFinalized = monthlyRevenueRepository
                    .findByYearAndMonth(year, currentMonth)
                    .map(MonthlyRevenue::getFinalized)
                    .orElse(false);

            if (!currentMonthFinalized) {
                BigDecimal liveRevenue = getCurrentMonthRevenue();
                finalizedTotal = finalizedTotal.add(liveRevenue);
            }
        }
        return finalizedTotal;
    }

    // -----------------------------------------------------------------------
    // Finalization
    // -----------------------------------------------------------------------

    /**
     * Finalizes a calendar month — writes an immutable snapshot to
     * monthly_revenue.
     *
     * This method is idempotent: if a finalized row already exists for the
     * given year/month, it is returned unchanged. The second call has no
     * side effects.
     *
     * Steps when a snapshot does not yet exist:
     *   1. Compute SUM(COALESCE(fee,0)) from appointments.
     *   2. Read current TNCN rate from ClinicSettings and lock it into the
     *      snapshot (changing the rate later will not alter this row).
     *   3. Write and persist the MonthlyRevenue row.
     *
     * @param year  4-digit calendar year
     * @param month 1-based month number
     * @return The finalized MonthlyRevenue row (existing or newly created)
     */
    @Transactional
    public MonthlyRevenue finalizeMonth(int year, int month) {
        Optional<MonthlyRevenue> existing = monthlyRevenueRepository.findByYearAndMonth(year, month);
        if (existing.isPresent() && Boolean.TRUE.equals(existing.get().getFinalized())) {
            return existing.get();
        }

        BigDecimal totalRevenue = appointmentRepository.sumFeeByYearAndMonth(year, month);
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

        long appointmentCount = appointmentRepository.countByYearAndMonth(year, month);

        ClinicSettings settings = settingsService.getSettings();
        BigDecimal tncnRate = settings.getTncnRate();
        BigDecimal tncnAmount = totalRevenue.multiply(tncnRate)
                .setScale(2, RoundingMode.HALF_UP);

        LocalDateTime now = LocalDateTime.now();

        MonthlyRevenue record = existing.orElseGet(MonthlyRevenue::new);
        record.setYear(year);
        record.setMonth(month);
        record.setTotalRevenue(totalRevenue);
        record.setAppointmentCount((int) appointmentCount);
        record.setTncnAmount(tncnAmount);
        record.setFinalized(true);
        record.setFinalizedAt(now);
        record.setUpdatedAt(now);
        if (record.getCreatedAt() == null) {
            record.setCreatedAt(now);
        }

        return monthlyRevenueRepository.save(record);
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    private MonthlyRevenueDTO buildLiveDTO(int year, int month) {
        BigDecimal totalRevenue = appointmentRepository.sumFeeByYearAndMonth(year, month);
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

        long appointmentCount = appointmentRepository.countByYearAndMonth(year, month);

        ClinicSettings settings = settingsService.getSettings();
        BigDecimal tncnAmount = totalRevenue.multiply(settings.getTncnRate())
                .setScale(2, RoundingMode.HALF_UP);

        return new MonthlyRevenueDTO(
                year, month, totalRevenue, (int) appointmentCount,
                tncnAmount, false, null);
    }

    private MonthlyRevenueDTO buildZeroDTO(int year, int month) {
        return new MonthlyRevenueDTO(
                year, month, BigDecimal.ZERO, 0, BigDecimal.ZERO, false, null);
    }

    private MonthlyRevenueDTO toDTO(MonthlyRevenue entity) {
        return new MonthlyRevenueDTO(
                entity.getYear(),
                entity.getMonth(),
                entity.getTotalRevenue(),
                entity.getAppointmentCount(),
                entity.getTncnAmount(),
                entity.getFinalized(),
                entity.getFinalizedAt());
    }
}
```

---

### 4. `src/main/java/com/dentalclinic/service/MonthlyFinalizationJob.java`

```java
package com.dentalclinic.service;

import java.time.LocalDate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.dentalclinic.model.MonthlyRevenue;

/**
 * Scheduled job that finalizes the previous calendar month at midnight on
 * the 1st of every month.
 *
 * This is the automatic path for month-end finalization. If the server is
 * offline when the job fires, the manual recovery path is:
 *   POST /api/revenue/finalize/{year}/{month}
 *
 * Requires @EnableScheduling on the main application class (added this session).
 *
 * The underlying RevenueService.finalizeMonth call is idempotent — if
 * finalization has already been done (manually or by a previous job run)
 * the job is a no-op.
 */
@Component
public class MonthlyFinalizationJob {

    private static final Logger log = LoggerFactory.getLogger(MonthlyFinalizationJob.class);

    @Autowired
    private RevenueService revenueService;

    /**
     * Runs at midnight (00:00:00) on the 1st of every month.
     *
     * Cron expression: "0 0 0 1 * *"
     *   second=0, minute=0, hour=0, day-of-month=1, month=*, day-of-week=*
     */
    @Scheduled(cron = "0 0 0 1 * *")
    public void finalizeLastMonth() {
        LocalDate lastMonth = LocalDate.now().minusMonths(1);
        int year  = lastMonth.getYear();
        int month = lastMonth.getMonthValue();

        log.info("[MonthlyFinalizationJob] Bắt đầu chốt sổ tháng {}/{}", month, year);

        try {
            MonthlyRevenue result = revenueService.finalizeMonth(year, month);

            log.info("[MonthlyFinalizationJob] Chốt sổ thành công — "
                    + "Tháng {}/{}: doanh thu={}, TNCN={}, số lịch hẹn={}",
                    month, year,
                    result.getTotalRevenue(),
                    result.getTncnAmount(),
                    result.getAppointmentCount());

        } catch (Exception e) {
            log.error("[MonthlyFinalizationJob] Lỗi khi chốt sổ tháng {}/{}: {}",
                    month, year, e.getMessage(), e);
        }
    }
}
```

---

### 5. `DentalClinicApplication.java` — `@EnableScheduling` added

```java
package com.dentalclinic;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DentalClinicApplication {

    public static void main(String[] args) {
        SpringApplication.run(DentalClinicApplication.class, args);
    }
}
```

> **What `@EnableScheduling` does:** Activates Spring's task scheduling infrastructure. Without it, the `@Scheduled(cron = "0 0 0 1 * *")` annotation on `MonthlyFinalizationJob.finalizeLastMonth` would be silently ignored — the method would never fire.

---

### 6. `src/main/java/com/dentalclinic/controller/ClinicSettingsController.java`

```java
package com.dentalclinic.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dentalclinic.dto.ClinicSettingsDTO;
import com.dentalclinic.model.ClinicSettings;
import com.dentalclinic.service.ClinicSettingsService;

/**
 * REST endpoints for clinic business settings.
 *
 * Endpoints:
 *   GET  /api/settings — returns the current settings
 *   PUT  /api/settings — updates settings (partial update supported)
 */
@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "http://localhost:5173")
public class ClinicSettingsController {

    @Autowired
    private ClinicSettingsService settingsService;

    /**
     * Returns the clinic's current settings.
     *
     * Creates a default row if none exists (safe to call on a fresh DB).
     *
     * @return HTTP 200 with ClinicSettingsDTO
     */
    @GetMapping
    public ResponseEntity<ClinicSettingsDTO> getSettings() {
        ClinicSettings settings = settingsService.getSettings();
        return ResponseEntity.ok(settingsService.toDTO(settings));
    }

    /**
     * Updates the clinic settings.
     *
     * Partial updates are supported: any field left null in the request body
     * retains its existing value. Only the supplied (non-null) fields are
     * overwritten.
     *
     * Validates that tncnRate (if provided) is in [0.0000, 1.0000];
     * returns HTTP 400 otherwise (via GlobalExceptionHandler).
     *
     * @param dto Updated settings values
     * @return HTTP 200 with the updated ClinicSettingsDTO
     */
    @PutMapping
    public ResponseEntity<ClinicSettingsDTO> updateSettings(@RequestBody ClinicSettingsDTO dto) {
        ClinicSettings updated = settingsService.updateSettings(dto);
        return ResponseEntity.ok(settingsService.toDTO(updated));
    }
}
```

---

### 7. `src/main/java/com/dentalclinic/controller/RevenueController.java`

This is the Session 2 version. The `GET /api/revenue/s1a-hkd/{year}/{month}` endpoint is **not yet present** — it is added in Session 3.

```java
package com.dentalclinic.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dentalclinic.dto.MonthlyRevenueDTO;
import com.dentalclinic.model.MonthlyRevenue;
import com.dentalclinic.service.RevenueService;

/**
 * REST endpoints for the Revenue & Tax subsystem.
 *
 * All paths are under /api/revenue, which is covered by the existing CORS
 * configuration at /api/** in CorsConfig.java.
 *
 * Endpoints provided in Session 2:
 *   GET  /api/revenue/current-month         — live running total
 *   GET  /api/revenue/monthly/{year}        — 12-element annual breakdown
 *   GET  /api/revenue/annual/{year}         — single annual total
 *   POST /api/revenue/finalize/{year}/{month} — manual month-end finalization
 *
 * Session 3 adds:
 *   GET  /api/revenue/s1a-hkd/{year}/{month} — S1a-HKD ledger payload
 */
@RestController
@RequestMapping("/api/revenue")
@CrossOrigin(origins = "http://localhost:5173")
public class RevenueController {

    @Autowired
    private RevenueService revenueService;

    /**
     * Returns the live revenue total for the current calendar month.
     *
     * The response always has finalized = false because the current month is
     * never finalized until it has ended. Data is computed on-the-fly from
     * the appointments table.
     *
     * @return HTTP 200 with a MonthlyRevenueDTO for the current month
     */
    @GetMapping("/current-month")
    public ResponseEntity<MonthlyRevenueDTO> getCurrentMonth() {
        MonthlyRevenueDTO dto = revenueService.getCurrentMonthDTO();
        return ResponseEntity.ok(dto);
    }

    /**
     * Returns monthly revenue data for all 12 months of the given year.
     *
     * Always returns exactly 12 elements (January = index 0, December = index 11).
     *   Finalized months → data from monthly_revenue (finalized = true)
     *   Past/current unfinalized months → live data from appointments
     *   Future months → zero-value DTO (finalized = false)
     *
     * @param year 4-digit calendar year (e.g. 2026)
     * @return HTTP 200 with a list of 12 MonthlyRevenueDTOs
     */
    @GetMapping("/monthly/{year}")
    public ResponseEntity<List<MonthlyRevenueDTO>> getMonthlyByYear(@PathVariable int year) {
        List<MonthlyRevenueDTO> months = revenueService.getAllMonthsForYear(year);
        return ResponseEntity.ok(months);
    }

    /**
     * Returns the total revenue for the given year.
     *
     * For the current year, the live current-month total is added to the sum
     * of all finalized months (avoiding double-counting if the current month
     * has already been finalized). For past years, only finalized rows contribute.
     *
     * @param year 4-digit calendar year
     * @return HTTP 200 with a BigDecimal annual total
     */
    @GetMapping("/annual/{year}")
    public ResponseEntity<BigDecimal> getAnnualTotal(@PathVariable int year) {
        BigDecimal total = revenueService.getAnnualTotal(year);
        return ResponseEntity.ok(total);
    }

    /**
     * Finalizes the given calendar month — writes an immutable snapshot to
     * monthly_revenue.
     *
     * This endpoint is idempotent: calling it on a month that is already
     * finalized returns the existing row unchanged (HTTP 200). The
     * finalized_at timestamp in the response indicates when finalization
     * occurred.
     *
     * Normal flow: MonthlyFinalizationJob fires automatically at midnight
     * on the 1st of every month. Use this endpoint to manually trigger
     * finalization if the scheduler missed a run (e.g. server was offline).
     *
     * @param year  4-digit calendar year
     * @param month 1-based month number (1–12)
     * @return HTTP 200 with the finalized MonthlyRevenueDTO
     */
    @PostMapping("/finalize/{year}/{month}")
    public ResponseEntity<MonthlyRevenueDTO> finalizeMonth(
            @PathVariable int year, @PathVariable int month) {

        MonthlyRevenue finalized = revenueService.finalizeMonth(year, month);

        MonthlyRevenueDTO dto = new MonthlyRevenueDTO(
                finalized.getYear(),
                finalized.getMonth(),
                finalized.getTotalRevenue(),
                finalized.getAppointmentCount(),
                finalized.getTncnAmount(),
                finalized.getFinalized(),
                finalized.getFinalizedAt());
        return ResponseEntity.ok(dto);
    }
}
```

---

## API Endpoints Live After This Session

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| GET | `/api/settings` | Returns clinic settings. Creates default row if none exists. | `ClinicSettingsDTO` |
| PUT | `/api/settings` | Updates clinic settings. Validates tncnRate in [0.00, 1.00]. | `ClinicSettingsDTO` |
| GET | `/api/revenue/current-month` | Live `MonthlyRevenueDTO` for the current calendar month. `finalized=false`. | `MonthlyRevenueDTO` |
| GET | `/api/revenue/monthly/{year}` | 12-element list for the year. Finalized months from DB; current month live. | `List<MonthlyRevenueDTO>` |
| GET | `/api/revenue/annual/{year}` | Sum of all monthly totals for the year. | `BigDecimal` |
| POST | `/api/revenue/finalize/{year}/{month}` | Manual finalization. Idempotent. | `MonthlyRevenueDTO` |

---

## Design Notes

### Why does `getAnnualTotal` avoid double-counting?
`sumTotalRevenueByYear` queries only `monthly_revenue` (finalized rows). If the current month has already been finalized, adding `getCurrentMonthRevenue()` on top would count it twice. The service checks `findByYearAndMonth(year, currentMonth).getFinalized()` before adding the live total.

### Why does `getAllMonthsForYear` return exactly 12 items even for future months?
The frontend `AnnualSummaryTable` component renders a fixed 12-row table. Returning a variable-length list would require the frontend to handle sparse arrays. Zero-value DTOs for future months simplify the frontend — it never needs to guard against missing array elements.

### Why is `tncnRate` locked at finalization time?
The `tncnAmount` stored in `monthly_revenue` represents the official declaration for that period. If the owner changes the rate mid-year, historical periods must retain the rate that was in effect when they were declared. Only new (unfinalised) months use the updated rate.

### Partial update pattern in `updateSettings`
Rather than requiring the frontend to send all fields every time, the service checks `if (dto.getField() != null)` before overwriting. This lets the frontend send only the fields that changed. `tncnRate` validation happens only when the field is non-null in the DTO.

---

## Postman Test Scenarios

### Test 1 — GET current month
```
GET http://localhost:8080/api/revenue/current-month
Expected: { "year": 2026, "month": 4, "totalRevenue": <sum>, "finalized": false, "finalizedAt": null }
```

### Test 2 — GET annual breakdown
```
GET http://localhost:8080/api/revenue/monthly/2026
Expected: Array of 12 objects. Future months have totalRevenue: 0. Current month has finalized: false.
```

### Test 3 — POST finalize (first call)
```
POST http://localhost:8080/api/revenue/finalize/2026/3
Expected: { "finalized": true, "finalizedAt": "<timestamp>", "totalRevenue": <march total> }
```

### Test 4 — POST finalize (second call — idempotency)
```
POST http://localhost:8080/api/revenue/finalize/2026/3
Expected: Same response as Test 3. finalizedAt timestamp unchanged.
```

### Test 5 — GET settings
```
GET http://localhost:8080/api/settings
Expected: { "id": 1, "businessName": "", "tncnRate": 0.0200, ... }
```

### Test 6 — PUT settings
```
PUT http://localhost:8080/api/settings
Body: { "businessName": "Phòng khám Nha khoa ABC", "tncnRate": 0.0200 }
Expected: 200 with updated DTO. Other fields unchanged.
```

### Test 7 — PUT settings invalid tncnRate
```
PUT http://localhost:8080/api/settings
Body: { "tncnRate": 1.5 }
Expected: 400 Bad Request with error message about valid range [0.0000, 1.0000]
```

---

## Success Criteria

- `GET /api/revenue/current-month` returns correct live total matching the sum of current-month appointment fees
- `POST /api/revenue/finalize/{year}/{month}` writes a row to `monthly_revenue` with `finalized=true`
- Calling finalize twice returns the same row (same `finalized_at`, HTTP 200 both times)
- `GET /api/settings` returns the default row; `PUT /api/settings` updates it
- Application startup log shows `[MonthlyFinalizationJob]` bean registered (Spring scheduling active)

---

## Session Dependencies

- **Depends on:** Revenue Session 1 (tables and JPA models must exist)
- **Required by:** Revenue Session 3 (extends `RevenueService` and `RevenueController`)
- **Required by:** Revenue Session 5 (frontend consumes all 6 endpoints added here)
