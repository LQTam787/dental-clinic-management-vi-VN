# Revenue & Tax Subsystem — Session 3: S1a-HKD Data Endpoint & TNCN
## Final Working Script

**Session:** Revenue Session 3 of 8  
**Duration:** ~1.5 hours | Backend only  
**Reference:** `REVENUE_TAX_SUBSYSTEM_MASTER_PLAN.md` — Section 8, Session 3  
**Prerequisite:** Revenue Sessions 1 & 2 complete  
**Status:** Complete

---

## Session Objectives

Add everything required to serve the complete S1a-HKD (Mẫu số S1a-HKD, TT 152/2025/TT-BTC) ledger payload from the backend. After this session the frontend can fetch a fully structured form object — header, per-appointment line items, total, and TNCN estimate — for any month.

**Tasks completed:**
1. Create `S1aHkdEntryDTO.java`
2. Create `S1aHkdDTO.java`
3. Add `findAppointmentsWithPatientsByYearAndMonth` JPQL query to `AppointmentRepository.java`
4. Add `getS1aHkdData(int year, int month)` method to `RevenueService.java`
5. Add `GET /api/revenue/s1a-hkd/{year}/{month}` endpoint to `RevenueController.java`

---

## Files Changed

| File | Action | Package/Path |
|------|--------|--------------|
| `S1aHkdEntryDTO.java` | **New** | `com.dentalclinic.dto` |
| `S1aHkdDTO.java` | **New** | `com.dentalclinic.dto` |
| `AppointmentRepository.java` | **Modified** (1 new JPQL method) | `com.dentalclinic.repository` |
| `RevenueService.java` | **Modified** (`getS1aHkdData` + imports) | `com.dentalclinic.service` |
| `RevenueController.java` | **Modified** (1 new endpoint) | `com.dentalclinic.controller` |

---

## Complete File Contents

### 1. `src/main/java/com/dentalclinic/dto/S1aHkdEntryDTO.java`

One instance per appointment row in the ledger body. Maps directly to the three-column body of the S1a-HKD form.

```java
package com.dentalclinic.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * One line-item row in the S1a-HKD revenue ledger.
 *
 * Maps directly to the three-column body of Mẫu số S1a-HKD
 * (TT 152/2025/TT-BTC):
 *   Cột A — Ngày tháng:  entryDate
 *   Cột B — Diễn giải:   description
 *                         (format: "Dịch vụ nha khoa — [tên bệnh nhân]")
 *   Cột 1 — Số tiền:     amount
 *                         (COALESCE(appointments.fee, 0) — never null)
 *
 * One instance is created per appointment in the queried period.
 * Appointments with a NULL fee appear with amount = 0, not omitted.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class S1aHkdEntryDTO {

    /** Cột A — date of the appointment (dd/MM/yyyy on the printed form). */
    private LocalDate entryDate;

    /**
     * Cột B — narrative description.
     * Always "Dịch vụ nha khoa — <patientName>" per the confirmed
     * per-appointment granularity decision (03/04/2026).
     */
    private String description;

    /**
     * Cột 1 — fee amount.
     * COALESCE(appointments.fee, 0); never null.
     * Formatting (Vietnamese locale thousands separator) is the frontend's
     * responsibility.
     */
    private BigDecimal amount;
}
```

---

### 2. `src/main/java/com/dentalclinic/dto/S1aHkdDTO.java`

The complete payload for rendering or exporting the S1a-HKD form. Returned by `GET /api/revenue/s1a-hkd/{year}/{month}`.

```java
package com.dentalclinic.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Complete payload for rendering or exporting the S1a-HKD revenue ledger form.
 *
 * Mẫu số S1a-HKD (Thông tư 152/2025/TT-BTC) structure:
 *
 *   ┌─ Header block ────────────────────────────────────────────────────────┐
 *   │  HỘ, CÁ NHÂN KINH DOANH: businessName                               │
 *   │  Địa chỉ: address            Mẫu số S1a-HKD (TT 152/2025/TT-BTC)   │
 *   │  Mã số thuế: taxId                                                   │
 *   │       SỔ DOANH THU BÁN HÀNG HÓA, DỊCH VỤ                           │
 *   │       Địa điểm kinh doanh: businessAddress                          │
 *   │       Kỳ kê khai: declarationPeriod  (e.g. "Tháng 04/2026")         │
 *   │       Đơn vị tính: currencyUnit                                      │
 *   ├─ Body (entries) ──────────────────────────────────────────────────────┤
 *   │  Cột A (date) │ Cột B (description) │ Cột 1 (amount)                │
 *   │  …            │ …                   │ …                              │
 *   │               │ Tổng cộng           │ totalRevenue                   │
 *   ├─ Footer ───────────────────────────────────────────────────────────────┤
 *   │  signatureDate                                                         │
 *   │  NGƯỜI ĐẠI DIỆN: ownerName                                            │
 *   └────────────────────────────────────────────────────────────────────────┘
 *
 * Empty-settings behaviour:
 *   When a clinic_settings field is an empty string, the backend returns an
 *   empty string here. The frontend renders "..........." in its place,
 *   matching the visual convention of the official blank template. This class
 *   never contains null string fields.
 *
 * TNCN disclaimer:
 *   tncnAmount is an estimate based on the TNCN rate stored in clinic_settings
 *   at the time of the request. It is shown in the UI with a disclaimer badge
 *   but does not appear in the printed form itself (the S1a-HKD template has
 *   no TNCN column).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class S1aHkdDTO {

    // Header block — sourced from clinic_settings

    /** "HỘ, CÁ NHÂN KINH DOANH" field; empty string if not configured. */
    private String businessName;

    /** Owner / representative name for the signature block. */
    private String ownerName;

    /** Registered address ("Địa chỉ" in the form header). */
    private String address;

    /** Tax identification number ("Mã số thuế"). */
    private String taxId;

    /** Physical service location ("Địa điểm kinh doanh"); may differ from address. */
    private String businessAddress;

    /**
     * Declaration period label ("Kỳ kê khai").
     * Format: "Tháng MM/YYYY" — e.g. "Tháng 04/2026".
     */
    private String declarationPeriod;

    /** Currency unit label ("Đơn vị tính"), e.g. "VNĐ". */
    private String currencyUnit;

    // Body

    /**
     * One entry per appointment in the queried period, ordered by date ASC
     * then patient name ASC. An empty list is valid (month with no appointments).
     */
    private List<S1aHkdEntryDTO> entries;

    // Footer

    /**
     * Sum of all S1aHkdEntryDTO.amount values.
     * Shown in the "Tổng cộng" row. Never null.
     */
    private BigDecimal totalRevenue;

    /**
     * Estimated personal income tax: totalRevenue × tncnRate.
     * Rounded to 2 decimal places (HALF_UP). Displayed in the UI with a
     * disclaimer; suppressed in @media print output.
     */
    private BigDecimal tncnAmount;

    /**
     * Signature date line.
     * Format: "Ngày DD tháng MM năm YYYY" — e.g. "Ngày 30 tháng 04 năm 2026".
     * Set to LocalDate.now() at generation time.
     */
    private String signatureDate;
}
```

---

### 3. `AppointmentRepository.java` — Session 3 addition

One new JPQL method added at the bottom of the interface. The two methods added in Session 2 (`sumFeeByYearAndMonth`, `countByYearAndMonth`) remain unchanged.

**New method only:**

```java
/**
 * Fetches all appointments with their associated patient for a given calendar
 * month, ordered by date ASC then patient name ASC.
 *
 * Used by RevenueService.getS1aHkdData (Session 3) to build the per-row
 * entries of the S1a-HKD ledger.
 *
 * @param year  4-digit calendar year
 * @param month 1-based month number
 * @return List of Object[] where index 0 is Appointment and index 1 is Patient
 */
@Query("SELECT a, p FROM Appointment a JOIN a.patient p "
        + "WHERE EXTRACT(YEAR FROM a.date) = :year AND EXTRACT(MONTH FROM a.date) = :month "
        + "ORDER BY a.date ASC, p.name ASC")
List<Object[]> findAppointmentsWithPatientsByYearAndMonth(
        @Param("year") int year, @Param("month") int month);
```

**Full file after Session 3 modifications:**

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

    // Revenue aggregation queries — Session 2

    @Query("SELECT COALESCE(SUM(COALESCE(a.fee, 0)), 0) FROM Appointment a "
            + "WHERE EXTRACT(YEAR FROM a.date) = :year AND EXTRACT(MONTH FROM a.date) = :month")
    BigDecimal sumFeeByYearAndMonth(@Param("year") int year, @Param("month") int month);

    @Query("SELECT COUNT(a) FROM Appointment a "
            + "WHERE EXTRACT(YEAR FROM a.date) = :year AND EXTRACT(MONTH FROM a.date) = :month")
    long countByYearAndMonth(@Param("year") int year, @Param("month") int month);

    // S1a-HKD ledger query — Session 3

    @Query("SELECT a, p FROM Appointment a JOIN a.patient p "
            + "WHERE EXTRACT(YEAR FROM a.date) = :year AND EXTRACT(MONTH FROM a.date) = :month "
            + "ORDER BY a.date ASC, p.name ASC")
    List<Object[]> findAppointmentsWithPatientsByYearAndMonth(
            @Param("year") int year, @Param("month") int month);
}
```

> **Why `List<Object[]>` instead of a DTO constructor expression?** The S1a-HKD query needs both the full `Appointment` entity (for `date` and `fee`) and the full `Patient` entity (for `name`). A constructor DTO expression would require a new DTO class with all needed fields and break the JOIN eagerness. `Object[]` is a well-established JPQL idiom for multi-entity joins; `row[0]` is cast to `Appointment` and `row[1]` to `Patient` in the service layer.

---

### 4. `RevenueService.java` — Session 3 additions

The `getS1aHkdData` method is appended to the service. Three new imports are required. All Session 2 methods remain unchanged.

**New imports to add:**

```java
import com.dentalclinic.dto.S1aHkdDTO;
import com.dentalclinic.dto.S1aHkdEntryDTO;
import com.dentalclinic.model.Patient;
```

**New method to append (after `finalizeMonth`):**

```java
// -----------------------------------------------------------------------
// S1a-HKD form data — Session 3
// -----------------------------------------------------------------------

/**
 * Builds the complete S1aHkdDTO for the given year/month.
 *
 * Steps:
 *   1. Fetch ClinicSettings for the header block fields.
 *   2. Query all appointments with their patients for the period,
 *      ordered by date ASC then patient name ASC.
 *   3. Map each row to an S1aHkdEntryDTO:
 *        Cột A — appointment.date
 *        Cột B — "Dịch vụ nha khoa — " + patient.name
 *        Cột 1 — COALESCE(appointment.fee, 0)
 *   4. Sum all entry amounts → totalRevenue.
 *   5. Apply tncnRate → tncnAmount (rounded HALF_UP to 2 dp).
 *   6. Set signatureDate to today in "Ngày DD tháng MM năm YYYY" format.
 *
 * NULL-fee appointments are included with amount = 0 and do not cause any
 * exception. An empty period (no appointments) returns a valid DTO with an
 * empty entries list and all totals at zero.
 *
 * Empty clinic_settings string fields are returned as-is (empty strings).
 * The frontend renders "..........." placeholders for blank fields.
 *
 * @param year  4-digit calendar year
 * @param month 1-based month number (1 = January … 12 = December)
 * @return A fully populated S1aHkdDTO; never null
 */
public S1aHkdDTO getS1aHkdData(int year, int month) {
    ClinicSettings settings = settingsService.getSettings();

    String declarationPeriod = String.format("Tháng %02d/%d", month, year);

    List<Object[]> rows = appointmentRepository
            .findAppointmentsWithPatientsByYearAndMonth(year, month);

    List<S1aHkdEntryDTO> entries = new ArrayList<>(rows.size());
    BigDecimal totalRevenue = BigDecimal.ZERO;

    for (Object[] row : rows) {
        Appointment appt    = (Appointment) row[0];
        Patient     patient = (Patient)     row[1];

        BigDecimal amount      = appt.getFee() != null ? appt.getFee() : BigDecimal.ZERO;
        String     description = "Dịch vụ nha khoa — " + patient.getName();

        entries.add(new S1aHkdEntryDTO(appt.getDate(), description, amount));
        totalRevenue = totalRevenue.add(amount);
    }

    BigDecimal tncnAmount = totalRevenue
            .multiply(settings.getTncnRate())
            .setScale(2, RoundingMode.HALF_UP);

    LocalDate today = LocalDate.now();
    String signatureDate = String.format("Ngày %02d tháng %02d năm %d",
            today.getDayOfMonth(), today.getMonthValue(), today.getYear());

    return new S1aHkdDTO(
            nullToEmpty(settings.getBusinessName()),
            nullToEmpty(settings.getOwnerName()),
            nullToEmpty(settings.getAddress()),
            nullToEmpty(settings.getTaxId()),
            nullToEmpty(settings.getBusinessAddress()),
            declarationPeriod,
            settings.getCurrencyUnit() != null ? settings.getCurrencyUnit() : "VNĐ",
            entries,
            totalRevenue,
            tncnAmount,
            signatureDate);
}
```

**Also add the `nullToEmpty` private helper if not already present:**

```java
/** Returns the string value, or an empty string if null. */
private String nullToEmpty(String value) {
    return value != null ? value : "";
}
```

**Full `RevenueService.java` after Session 3** (complete, self-contained):

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
import com.dentalclinic.dto.S1aHkdDTO;
import com.dentalclinic.dto.S1aHkdEntryDTO;
import com.dentalclinic.model.Appointment;
import com.dentalclinic.model.ClinicSettings;
import com.dentalclinic.model.MonthlyRevenue;
import com.dentalclinic.model.Patient;
import com.dentalclinic.repository.AppointmentRepository;
import com.dentalclinic.repository.MonthlyRevenueRepository;

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

    public BigDecimal getCurrentMonthRevenue() {
        LocalDate today = LocalDate.now();
        BigDecimal result = appointmentRepository.sumFeeByYearAndMonth(
                today.getYear(), today.getMonthValue());
        return result != null ? result : BigDecimal.ZERO;
    }

    public long getCurrentMonthAppointmentCount() {
        LocalDate today = LocalDate.now();
        return appointmentRepository.countByYearAndMonth(
                today.getYear(), today.getMonthValue());
    }

    public MonthlyRevenueDTO getCurrentMonthDTO() {
        LocalDate today = LocalDate.now();
        return buildLiveDTO(today.getYear(), today.getMonthValue());
    }

    // -----------------------------------------------------------------------
    // Monthly / annual queries
    // -----------------------------------------------------------------------

    public MonthlyRevenueDTO getMonthlyRevenue(int year, int month) {
        Optional<MonthlyRevenue> snapshot = monthlyRevenueRepository.findByYearAndMonth(year, month);
        if (snapshot.isPresent()) {
            return toDTO(snapshot.get());
        }
        return buildLiveDTO(year, month);
    }

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
        BigDecimal tncnRate   = settings.getTncnRate();
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
    // S1a-HKD form data — Session 3
    // -----------------------------------------------------------------------

    public S1aHkdDTO getS1aHkdData(int year, int month) {
        ClinicSettings settings = settingsService.getSettings();

        String declarationPeriod = String.format("Tháng %02d/%d", month, year);

        List<Object[]> rows = appointmentRepository
                .findAppointmentsWithPatientsByYearAndMonth(year, month);

        List<S1aHkdEntryDTO> entries = new ArrayList<>(rows.size());
        BigDecimal totalRevenue = BigDecimal.ZERO;

        for (Object[] row : rows) {
            Appointment appt    = (Appointment) row[0];
            Patient     patient = (Patient)     row[1];

            BigDecimal amount      = appt.getFee() != null ? appt.getFee() : BigDecimal.ZERO;
            String     description = "Dịch vụ nha khoa — " + patient.getName();

            entries.add(new S1aHkdEntryDTO(appt.getDate(), description, amount));
            totalRevenue = totalRevenue.add(amount);
        }

        BigDecimal tncnAmount = totalRevenue
                .multiply(settings.getTncnRate())
                .setScale(2, RoundingMode.HALF_UP);

        LocalDate today = LocalDate.now();
        String signatureDate = String.format("Ngày %02d tháng %02d năm %d",
                today.getDayOfMonth(), today.getMonthValue(), today.getYear());

        return new S1aHkdDTO(
                nullToEmpty(settings.getBusinessName()),
                nullToEmpty(settings.getOwnerName()),
                nullToEmpty(settings.getAddress()),
                nullToEmpty(settings.getTaxId()),
                nullToEmpty(settings.getBusinessAddress()),
                declarationPeriod,
                settings.getCurrencyUnit() != null ? settings.getCurrencyUnit() : "VNĐ",
                entries,
                totalRevenue,
                tncnAmount,
                signatureDate);
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

    private String nullToEmpty(String value) {
        return value != null ? value : "";
    }
}
```

---

### 5. `RevenueController.java` — Session 3 addition

One new endpoint is added. The four Session 2 endpoints remain unchanged.

**New import to add:**

```java
import com.dentalclinic.dto.S1aHkdDTO;
```

**New endpoint to append (inside the class, after the `finalizeMonth` method):**

```java
/**
 * Returns the complete S1a-HKD ledger payload for the given period.
 *
 * The response contains:
 *   Header block populated from clinic_settings.
 *   One S1aHkdEntryDTO per appointment in the period,
 *   ordered by date ASC then patient name ASC.
 *   Footer: totalRevenue (sum of all entry amounts) and
 *   tncnAmount (totalRevenue × tncnRate).
 *   signatureDate: today formatted as "Ngày DD tháng MM năm YYYY".
 *
 * NULL-fee appointments appear with amount = 0.
 * Empty clinic_settings string fields are returned as empty strings;
 * the frontend renders "..........." placeholders.
 *
 * @param year  4-digit calendar year
 * @param month 1-based month number (1–12)
 * @return HTTP 200 with a fully populated S1aHkdDTO
 */
@GetMapping("/s1a-hkd/{year}/{month}")
public ResponseEntity<S1aHkdDTO> getS1aHkd(
        @PathVariable int year, @PathVariable int month) {
    S1aHkdDTO dto = revenueService.getS1aHkdData(year, month);
    return ResponseEntity.ok(dto);
}
```

**Full `RevenueController.java` after Session 3** (complete, self-contained):

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
import com.dentalclinic.dto.S1aHkdDTO;
import com.dentalclinic.model.MonthlyRevenue;
import com.dentalclinic.service.RevenueService;

@RestController
@RequestMapping("/api/revenue")
@CrossOrigin(origins = "http://localhost:5173")
public class RevenueController {

    @Autowired
    private RevenueService revenueService;

    @GetMapping("/current-month")
    public ResponseEntity<MonthlyRevenueDTO> getCurrentMonth() {
        MonthlyRevenueDTO dto = revenueService.getCurrentMonthDTO();
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/monthly/{year}")
    public ResponseEntity<List<MonthlyRevenueDTO>> getMonthlyByYear(@PathVariable int year) {
        List<MonthlyRevenueDTO> months = revenueService.getAllMonthsForYear(year);
        return ResponseEntity.ok(months);
    }

    @GetMapping("/annual/{year}")
    public ResponseEntity<BigDecimal> getAnnualTotal(@PathVariable int year) {
        BigDecimal total = revenueService.getAnnualTotal(year);
        return ResponseEntity.ok(total);
    }

    @GetMapping("/s1a-hkd/{year}/{month}")
    public ResponseEntity<S1aHkdDTO> getS1aHkd(
            @PathVariable int year, @PathVariable int month) {
        S1aHkdDTO dto = revenueService.getS1aHkdData(year, month);
        return ResponseEntity.ok(dto);
    }

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

## Complete API Surface After Sessions 1–3

All seven endpoints are now live:

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| GET | `/api/settings` | Returns clinic settings | `ClinicSettingsDTO` |
| PUT | `/api/settings` | Updates clinic settings | `ClinicSettingsDTO` |
| GET | `/api/revenue/current-month` | Live running total for current month | `MonthlyRevenueDTO` |
| GET | `/api/revenue/monthly/{year}` | 12-element annual breakdown | `List<MonthlyRevenueDTO>` |
| GET | `/api/revenue/annual/{year}` | Annual total | `BigDecimal` |
| GET | `/api/revenue/s1a-hkd/{year}/{month}` | Full S1a-HKD ledger payload (**new**) | `S1aHkdDTO` |
| POST | `/api/revenue/finalize/{year}/{month}` | Manual month-end finalization | `MonthlyRevenueDTO` |

---

## S1a-HKD Response Structure

Example `GET /api/revenue/s1a-hkd/2026/4` response (abbreviated):

```json
{
  "businessName": "Phòng khám Nha khoa ABC",
  "ownerName": "Nguyễn Văn A",
  "address": "123 Đường Lê Lợi, TP.HCM",
  "taxId": "0123456789",
  "businessAddress": "123 Đường Lê Lợi, TP.HCM",
  "declarationPeriod": "Tháng 04/2026",
  "currencyUnit": "VNĐ",
  "entries": [
    {
      "entryDate": "2026-04-01",
      "description": "Dịch vụ nha khoa — Nguyễn Thị B",
      "amount": 500000.00
    },
    {
      "entryDate": "2026-04-01",
      "description": "Dịch vụ nha khoa — Trần Văn C",
      "amount": 1200000.00
    },
    {
      "entryDate": "2026-04-02",
      "description": "Dịch vụ nha khoa — Lê Thị D",
      "amount": 0.00
    }
  ],
  "totalRevenue": 1700000.00,
  "tncnAmount": 34000.00,
  "signatureDate": "Ngày 18 tháng 04 năm 2026"
}
```

> **Note on empty settings:** If `businessName` was never configured, the backend returns `""`. The React frontend renders `"..........."` as a placeholder in that case. The backend never returns `null` for string fields in `S1aHkdDTO`.

---

## Design Notes

### Cột B format — confirmed decision
Per the master plan (confirmed 03/04/2026): one row per patient visit, formatted as `"Dịch vụ nha khoa — [Tên bệnh nhân]"`. This provides a complete audit trail and is permitted under "ghi theo từng nghiệp vụ phát sinh" in TT 152/2025.

### NULL fee handling
`appt.getFee() != null ? appt.getFee() : BigDecimal.ZERO` — never skip appointments with null fees. They appear in the ledger with `amount = 0`. This ensures the appointment count in the S1a-HKD entry list matches what the patient saw, and prevents any discrepancy between the ledger and the appointment records.

### `signatureDate` is generated at request time
`LocalDate.now()` at the moment `getS1aHkdData` is called. This means the date reflects when the user viewed or printed the form, not when appointments occurred. This matches the official template convention where the signature date is filled in on the day of signing.

### `String.format("Tháng %02d/%d", month, year)`
The `%02d` zero-pads the month to two digits (e.g., `04` not `4`). This matches the format used on the official S1a-HKD template (e.g., "Tháng 04/2026").

### `String.format("Ngày %02d tháng %02d năm %d", ...)`
Both day and month are zero-padded. This matches the Vietnamese formal date format used in official documents.

### TNCN disclaimer — backend responsibility
The backend returns `tncnAmount` without comment. The disclaimer ("Thuế TNCN ước tính — xác nhận tỷ lệ với cơ quan thuế trước khi nộp") is displayed by the frontend and suppressed in `@media print`. The backend does not embed disclaimer text in the DTO.

---

## Postman Test Scenarios

### Test 1 — Basic S1a-HKD fetch
```
GET http://localhost:8080/api/revenue/s1a-hkd/2026/4
Expected: 200. entries[] has one object per appointment in April 2026.
          totalRevenue = sum of all fees. tncnAmount = totalRevenue × 0.0200.
```

### Test 2 — Empty month
```
GET http://localhost:8080/api/revenue/s1a-hkd/2026/1
(assuming no appointments in January)
Expected: 200. entries: []. totalRevenue: 0. tncnAmount: 0.
```

### Test 3 — NULL fee appointment
```
POST http://localhost:8080/api/appointments
Body: { "date": "2026-04-15", "diagnosis": "Kiểm tra", "fee": null, "patientId": 1 }

GET http://localhost:8080/api/revenue/s1a-hkd/2026/4
Expected: The null-fee appointment appears in entries[] with amount: 0.00.
          No 500 error. totalRevenue is not affected by the null entry.
```

### Test 4 — TNCN calculation accuracy
```
Assumptions: tncn_rate = 0.0200, total fees for month = 5,000,000

GET http://localhost:8080/api/revenue/s1a-hkd/2026/4
Expected tncnAmount: 100000.00  (5,000,000 × 0.02 = 100,000, rounded HALF_UP to 2dp)
```

### Test 5 — Empty settings (default row)
```
PUT http://localhost:8080/api/settings
Body: { "businessName": "", "ownerName": "", "address": "", "taxId": "", "businessAddress": "" }

GET http://localhost:8080/api/revenue/s1a-hkd/2026/4
Expected: businessName: "", ownerName: "", etc. — empty strings, NOT null.
          Frontend renders "..........." for each blank. No 500 error.
```

### Test 6 — Entry ordering
```
Add appointments:
  - 2026-04-03, patient "Nguyễn Văn Z"
  - 2026-04-01, patient "Trần Thị A"
  - 2026-04-01, patient "Nguyễn Thị B"

GET http://localhost:8080/api/revenue/s1a-hkd/2026/4
Expected entries order:
  1. 2026-04-01, Dịch vụ nha khoa — Nguyễn Thị B
  2. 2026-04-01, Dịch vụ nha khoa — Trần Thị A
  3. 2026-04-03, Dịch vụ nha khoa — Nguyễn Văn Z
(sorted by date ASC, then patient name ASC within same date)
```

---

## Success Criteria

- `GET /api/revenue/s1a-hkd/{year}/{month}` returns a response containing all header, entry, total, and TNCN fields
- Entry count in `entries[]` matches the number of appointments in the queried month
- `tncnAmount = totalRevenue × settings.tncnRate` rounded to 2 decimal places
- NULL-fee appointments appear with `amount: 0.00` — no errors, no omissions
- Empty `clinic_settings` string fields return as `""` (not `null`) — no `NullPointerException`
- Entries are ordered: date ASC, then patient name ASC within the same date

---

## Session Dependencies

- **Depends on:** Revenue Sessions 1 & 2 (models, repositories, base service, and controllers must exist)
- **Required by:** Revenue Session 5 (`S1aHkdLedgerView.jsx` consumes this endpoint)
- **Required by:** Revenue Session 7 (Excel export builds on the S1a-HKD structure)
- After this session, the entire backend for the Revenue & Tax subsystem is complete. Revenue Sessions 4–8 are all frontend work.
