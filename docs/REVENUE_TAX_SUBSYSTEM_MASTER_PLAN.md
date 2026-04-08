# Revenue & Tax Subsystem — Master Plan
## Dental Clinic Management System (Hệ thống Quản lý Phòng khám Nha khoa)

**Reference law:** Thông tư 152/2025/TT-BTC, ngày 31 tháng 12 năm 2025  
**Target form:** Mẫu số S1a-HKD — Sổ Doanh thu Bán hàng hóa, Dịch vụ  
**Applicable section:** Chương II, Mục 1, Điều 4  
**Date drafted:** 03/04/2026  
**Status:** Planning complete — ready for Session 1

---

## Table of Contents

- [0. Project Context & Confirmed Facts](#0-project-context--confirmed-facts)
- [1. Architecture Overview](#1-architecture-overview)
- [2. Database Schema](#2-database-schema)
- [3. Backend — Services & Controllers](#3-backend--services--controllers)
- [4. API Endpoints (Complete)](#4-api-endpoints-complete)
- [5. Frontend — Components](#5-frontend--components)
- [6. S1a-HKD Form Specification](#6-s1a-hkd-form-specification)
- [7. Key Design Decisions](#7-key-design-decisions)
- [8. Session-by-Session Implementation](#8-session-by-session-implementation)
- [9. Files Changed Per Session](#9-files-changed-per-session)
- [10. Edge Cases & Open Questions](#10-edge-cases--open-questions)
- [11. Repository Structure (Full)](#11-repository-structure-full)
- [12. Vietnamese Localization Keys](#12-vietnamese-localization-keys)
- [13. Data Flow Diagrams](#13-data-flow-diagrams)
- [14. Testing Scenarios](#14-testing-scenarios)

---

## 0. Project Context & Confirmed Facts

### Business Profile

| Field | Value |
|-------|-------|
| Business type | Hộ kinh doanh (HKD) |
| Tax method | Revenue-based declarations (kê khai theo doanh thu thực tế) |
| VAT status | Exempt (dental services = y tế/nha khoa) |
| TNCN required | Yes |
| Target form | Mẫu số S1a-HKD |
| Reference law | TT 152/2025/TT-BTC |
| Default TNCN rate | 2% (0.0200) — user-configurable |

### Legal Basis

Thông tư 152/2025/TT-BTC, ngày 31 tháng 12 năm 2025, Bộ Tài chính. The clinic is a hộ kinh doanh (HKD) that files revenue-based declarations rather than paying a flat presumptive tax (thuế khoán). Dental services are VAT-exempt under Vietnamese law. No goods are sold, so no mixed VAT treatment is needed.

The S1a-HKD template note says it is designed for businesses "không chịu thuế GTGT, không phải nộp thuế TNCN." However, Article 4, Chapter II, Section 1 of TT 152/2025 permits HKD that file revenue-based declarations to use this ledger for data tracking and reconciliation with the tax authority. The clinic uses S1a-HKD as the mandatory revenue ledger and calculates TNCN separately on top.

### Confirmed Decisions

**Cột B format — confirmed 03/04/2026:** Per-appointment (Option A). One row per patient visit. Format: `"Dịch vụ nha khoa — [Tên bệnh nhân]"`. Provides complete audit trail. Permitted under "ghi theo từng nghiệp vụ phát sinh" in TT 152/2025.

**TNCN rate:** Default 2% (0.0200). Configurable in clinic settings. **The owner must confirm the applicable rate with their local Chi cục Thuế before using the system for official filings.** A disclaimer is shown prominently in the UI and suppressed in print output.

### Existing System (Sessions 1–8, COMPLETED)

The dental clinic management system already has:

- **Backend:** Java 17, Spring Boot 3.2.1, PostgreSQL, Maven
- **Frontend:** React 18, Vite, Axios, Vietnamese localization (vi-VN.js)
- **Database tables:** `patients` (id, name, birth_year, gender, phone, address) and `appointments` (id, date, diagnosis, treatment, needsImplant, needsDenture, needsOrthodontics, fee, note, patient_id FK)
- **REST API:** `localhost:8080/api` with full CRUD for patients and appointments
- **Frontend:** `localhost:5173` with appointment table, search/filter, modal forms, Vietnamese UI
- **CORS:** Configured for `/api/**` — no changes needed for new endpoints
- **Note:** The patient list tab was previously omitted from the UI and will be surfaced in Session 4

---

## 1. Architecture Overview

### What Gets Built

**New database tables:** `clinic_settings`, `monthly_revenue`

**New backend files:**
- 2 JPA entities
- 2 repositories
- 3 service classes
- 2 controllers
- 4 DTOs
- 1 scheduled job

**New frontend components:**
- `TabBar`, `PatientTable`, `RevenueTabView`, `CurrentMonthWidget`, `AnnualSummaryTable`, `S1aHkdLedgerView`, `ClinicSettingsForm`

### Three-Tab UI Structure

| Tab | Label | Status | Content |
|-----|-------|--------|---------|
| 1 | Lịch hẹn | Existing | Current appointment table, search, filters — unchanged |
| 2 | Bệnh nhân | New | Patient list previously omitted from UI; edit/delete |
| 3 | Doanh thu & Thuế | New | Live monthly total · annual breakdown · S1a-HKD ledger · print/export |

### Monthly Reset Mechanics (Critical)

"Reset to 0 on day 1" does **not** delete any appointment data. The mechanism is:

1. A Spring `@Scheduled` job fires at midnight on the 1st of each month.
2. It reads the live `SUM(fee)` of all appointment fees for the previous month from the `appointments` table.
3. It writes a finalized snapshot row into `monthly_revenue` (year, month, total, appointment count, TNCN amount, finalized=true, finalized_at=now).
4. The current month's running total always recomputes live from the `appointments` table — **no data is ever deleted**.
5. If the server is offline on the 1st, `POST /api/revenue/finalize/{year}/{month}` is the manual recovery path.
6. The UI shows a "Chưa chốt sổ" warning badge for months that should have been finalized but haven't been yet.

### Session Dependencies

```
Sessions 1 → 2 → 3 (backend, must run in order)
Sessions 4 → 5 → 6 (frontend, must run in order)

Sessions 1–3 and Session 4 can run in parallel.
Session 5 requires Sessions 2 and 3 endpoints to be working.
Session 6 requires Session 5 UI to exist.
Session 7 requires Session 5 (export builds on the ledger view).
Session 8 requires all previous sessions.
```

---

## 2. Database Schema

### Table: `clinic_settings`

Single-row settings table. The service layer creates a default row on first read if none exists — the application never crashes on a missing row.

```sql
CREATE TABLE clinic_settings (
    id               BIGSERIAL PRIMARY KEY,
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

-- Seed default row (all fields empty, applied in V2 migration)
INSERT INTO clinic_settings (business_name, owner_name, address, tax_id,
    business_address, currency_unit, tncn_rate)
VALUES ('', '', '', '', '', 'VNĐ', 0.0200);
```

**Column notes:**
- `business_name` → S1a-HKD header "HỘ, CÁ NHÂN KINH DOANH"
- `owner_name` → S1a-HKD signature block "Người đại diện"
- `address` → S1a-HKD header "Địa chỉ"
- `tax_id` → S1a-HKD header "Mã số thuế"
- `business_address` → S1a-HKD sub-header "Địa điểm kinh doanh" (may differ from registered address)
- `currency_unit` → S1a-HKD sub-header "Đơn vị tính"
- `tncn_rate` → Decimal fraction (0.0200 = 2%). Validated in service: must be in [0.00, 1.00].

### Table: `monthly_revenue`

One row per finalized month. The `UNIQUE(year, month)` constraint prevents duplicate finalization and makes the finalization operation idempotent at the database level.

```sql
CREATE TABLE monthly_revenue (
    id                 BIGSERIAL    PRIMARY KEY,
    year               INTEGER      NOT NULL,
    month              INTEGER      NOT NULL CHECK (month BETWEEN 1 AND 12),
    total_revenue      NUMERIC(15,2) NOT NULL DEFAULT 0,
    appointment_count  INTEGER      NOT NULL DEFAULT 0,
    tncn_amount        NUMERIC(15,2) NOT NULL DEFAULT 0,
    finalized          BOOLEAN      NOT NULL DEFAULT FALSE,
    finalized_at       TIMESTAMP,
    notes              VARCHAR(1000),
    created_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_year_month UNIQUE (year, month)
);
```

**Column notes:**
- `total_revenue` → SUM of `appointments.fee` for the period (COALESCE NULL to 0)
- `tncn_amount` → `total_revenue × tncn_rate` at the moment of finalization (rate locked at finalization time)
- `finalized` → FALSE for a draft/preview row; TRUE once officially finalized
- `finalized_at` → Timestamp used to show when the declaration was made
- `notes` → Optional manual diễn giải for the period; nullable

### Migration File

Migration file path: `src/main/resources/db/migration/V2__revenue_tables.sql`

Both `CREATE TABLE` statements and the seed `INSERT` go in this single file. The application uses Spring Boot's built-in Flyway/Liquibase auto-configuration. If not already configured, add:

```properties
# application.properties
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
```

Alternatively, since the project uses `ddl-auto=update`, the entities can drive table creation — but the explicit SQL migration is preferred for production correctness and the `CHECK` constraint on `month`.

---

## 3. Backend — Services & Controllers

### Package Structure

All new files go under `src/main/java/com/dentalclinic/`:

```
model/
    ClinicSettings.java
    MonthlyRevenue.java
repository/
    ClinicSettingsRepository.java
    MonthlyRevenueRepository.java
dto/
    ClinicSettingsDTO.java
    MonthlyRevenueDTO.java
    S1aHkdDTO.java
    S1aHkdEntryDTO.java
service/
    ClinicSettingsService.java
    RevenueService.java
    MonthlyFinalizationJob.java
controller/
    ClinicSettingsController.java
    RevenueController.java
```

### ClinicSettings.java (Entity)

```java
@Entity
@Table(name = "clinic_settings")
public class ClinicSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String businessName;
    private String ownerName;
    private String address;
    private String taxId;
    private String businessAddress;
    private String currencyUnit;
    private BigDecimal tncnRate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // getters/setters
}
```

### MonthlyRevenue.java (Entity)

```java
@Entity
@Table(name = "monthly_revenue",
       uniqueConstraints = @UniqueConstraint(columnNames = {"year", "month"}))
public class MonthlyRevenue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Integer year;
    private Integer month;
    private BigDecimal totalRevenue;
    private Integer appointmentCount;
    private BigDecimal tncnAmount;
    private Boolean finalized;
    private LocalDateTime finalizedAt;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // getters/setters
}
```

### MonthlyRevenueRepository.java

```java
@Repository
public interface MonthlyRevenueRepository extends JpaRepository<MonthlyRevenue, Long> {
    Optional<MonthlyRevenue> findByYearAndMonth(int year, int month);
    List<MonthlyRevenue> findAllByYearOrderByMonth(int year);

    @Query("SELECT COALESCE(SUM(mr.totalRevenue), 0) FROM MonthlyRevenue mr WHERE mr.year = :year")
    BigDecimal sumTotalRevenueByYear(@Param("year") int year);
}
```

### ClinicSettingsService.java

```java
@Service
public class ClinicSettingsService {

    // Returns existing row, or creates and saves a default row if none exists.
    public ClinicSettings getSettings() { ... }

    // Validates tncnRate in [0.00, 1.00], throws IllegalArgumentException if invalid.
    public ClinicSettings updateSettings(ClinicSettingsDTO dto) { ... }
}
```

### RevenueService.java (Key Methods)

```java
@Service
public class RevenueService {

    // Live SUM(COALESCE(fee, 0)) for current calendar month.
    public BigDecimal getCurrentMonthRevenue() { ... }

    // Live COUNT for current calendar month.
    public long getCurrentMonthAppointmentCount() { ... }

    // Returns finalized row from DB if exists; otherwise builds a live MonthlyRevenueDTO
    // with finalized=false. Never returns null.
    public MonthlyRevenueDTO getMonthlyRevenue(int year, int month) { ... }

    // Returns a 12-element list for the given year. Each index corresponds to a month (0=Jan..11=Dec).
    // Finalized months come from DB; unfinalized months are computed live.
    // Future months (after today) return zero-value DTOs with finalized=false.
    public List<MonthlyRevenueDTO> getAllMonthsForYear(int year) { ... }

    // Sum of all monthly totals for the year (finalized + live current month if in that year).
    public BigDecimal getAnnualTotal(int year) { ... }

    // Idempotent: if monthly_revenue row already exists with finalized=true, return it unchanged.
    // Otherwise: compute live totals, fetch tncn_rate from settings, write row, mark finalized=true.
    public MonthlyRevenue finalizeMonth(int year, int month) { ... }

    // Builds S1aHkdDTO: pulls clinic_settings for header, queries appointments JOIN patients
    // for the period ordered by date ASC, maps each row to S1aHkdEntryDTO,
    // calculates total and TNCN.
    public S1aHkdDTO getS1aHkdData(int year, int month) { ... }
}
```

#### JPQL for live monthly revenue

```java
@Query("SELECT COALESCE(SUM(COALESCE(a.fee, 0)), 0) FROM Appointment a " +
       "WHERE YEAR(a.date) = :year AND MONTH(a.date) = :month")
BigDecimal sumFeeByYearAndMonth(@Param("year") int year, @Param("month") int month);

@Query("SELECT COUNT(a) FROM Appointment a " +
       "WHERE YEAR(a.date) = :year AND MONTH(a.date) = :month")
long countByYearAndMonth(@Param("year") int year, @Param("month") int month);
```

Add these to `AppointmentRepository.java` (already exists).

#### JPQL for S1a-HKD entries

```java
@Query("SELECT a, p FROM Appointment a JOIN a.patient p " +
       "WHERE YEAR(a.date) = :year AND MONTH(a.date) = :month " +
       "ORDER BY a.date ASC, p.name ASC")
List<Object[]> findAppointmentsWithPatientsByYearAndMonth(
    @Param("year") int year, @Param("month") int month);
```

Add to `AppointmentRepository.java`.

### MonthlyFinalizationJob.java

```java
@Component
public class MonthlyFinalizationJob {

    @Autowired
    private RevenueService revenueService;

    // Fires at midnight on the 1st of every month.
    // Finalizes the previous calendar month.
    @Scheduled(cron = "0 0 0 1 * *")
    public void finalizeLastMonth() {
        LocalDate lastMonth = LocalDate.now().minusMonths(1);
        int year = lastMonth.getYear();
        int month = lastMonth.getMonthValue();
        try {
            MonthlyRevenue result = revenueService.finalizeMonth(year, month);
            log.info("Finalized month {}/{}: revenue={}, tncn={}, appointments={}",
                     month, year, result.getTotalRevenue(),
                     result.getTncnAmount(), result.getAppointmentCount());
        } catch (Exception e) {
            log.error("Failed to finalize month {}/{}: {}", month, year, e.getMessage());
        }
    }
}
```

Requires `@EnableScheduling` on `DentalClinicApplication.java`.

### DTOs

**ClinicSettingsDTO** — mirrors clinic_settings; all fields nullable except id:
```java
public class ClinicSettingsDTO {
    private Long id;
    private String businessName;
    private String ownerName;
    private String address;
    private String taxId;
    private String businessAddress;
    private String currencyUnit;
    private BigDecimal tncnRate;
}
```

**MonthlyRevenueDTO** — used for both finalized DB rows and live-computed responses:
```java
public class MonthlyRevenueDTO {
    private int year;
    private int month;
    private BigDecimal totalRevenue;
    private int appointmentCount;
    private BigDecimal tncnAmount;
    private boolean finalized;
    private LocalDateTime finalizedAt;  // null if not finalized
}
```

**S1aHkdEntryDTO** — one per appointment row in the ledger:
```java
public class S1aHkdEntryDTO {
    private LocalDate entryDate;     // Cột A
    private String description;      // Cột B: "Dịch vụ nha khoa — [patientName]"
    private BigDecimal amount;        // Cột 1: COALESCE(fee, 0)
}
```

**S1aHkdDTO** — the complete form payload:
```java
public class S1aHkdDTO {
    // Header block
    private String businessName;
    private String ownerName;
    private String address;
    private String taxId;
    private String businessAddress;
    private String declarationPeriod;  // "Tháng MM/YYYY"
    private String currencyUnit;
    // Body
    private List<S1aHkdEntryDTO> entries;
    // Footer
    private BigDecimal totalRevenue;
    private BigDecimal tncnAmount;
    private String signatureDate;  // "Ngày DD tháng MM năm YYYY"
}
```

### Controllers

**ClinicSettingsController.java:**
```java
@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "http://localhost:5173")
public class ClinicSettingsController {
    @GetMapping   public ResponseEntity<ClinicSettingsDTO> getSettings() { ... }
    @PutMapping   public ResponseEntity<ClinicSettingsDTO> updateSettings(@RequestBody ClinicSettingsDTO dto) { ... }
}
```

**RevenueController.java:**
```java
@RestController
@RequestMapping("/api/revenue")
@CrossOrigin(origins = "http://localhost:5173")
public class RevenueController {
    @GetMapping("/current-month")
    public ResponseEntity<MonthlyRevenueDTO> getCurrentMonth() { ... }

    @GetMapping("/monthly/{year}")
    public ResponseEntity<List<MonthlyRevenueDTO>> getMonthlyByYear(@PathVariable int year) { ... }

    @GetMapping("/annual/{year}")
    public ResponseEntity<BigDecimal> getAnnualTotal(@PathVariable int year) { ... }

    @GetMapping("/s1a-hkd/{year}/{month}")
    public ResponseEntity<S1aHkdDTO> getS1aHkd(@PathVariable int year, @PathVariable int month) { ... }

    @PostMapping("/finalize/{year}/{month}")
    public ResponseEntity<MonthlyRevenueDTO> finalize(@PathVariable int year, @PathVariable int month) { ... }
}
```

---

## 4. API Endpoints (Complete)

| Method | Path | Description | Request body | Response |
|--------|------|-------------|--------------|----------|
| GET | `/api/settings` | Returns clinic settings. Creates default row if none exists. | — | `ClinicSettingsDTO` |
| PUT | `/api/settings` | Updates clinic settings. Validates tncnRate in [0.00, 1.00]. | `ClinicSettingsDTO` | `ClinicSettingsDTO` |
| GET | `/api/revenue/current-month` | Live `MonthlyRevenueDTO` for the current calendar month. finalized=false. | — | `MonthlyRevenueDTO` |
| GET | `/api/revenue/monthly/{year}` | 12-element list for the year. Finalized months from DB; current month live. | — | `List<MonthlyRevenueDTO>` |
| GET | `/api/revenue/annual/{year}` | Single BigDecimal: sum of all monthly totals for the year. | — | `BigDecimal` |
| GET | `/api/revenue/s1a-hkd/{year}/{month}` | Full `S1aHkdDTO` for the given period. | — | `S1aHkdDTO` |
| POST | `/api/revenue/finalize/{year}/{month}` | Manual finalization. Idempotent — returns existing row if already finalized. | — | `MonthlyRevenueDTO` |

All endpoints return HTTP 200 on success. The finalize endpoint returns 200 whether it created a new row or returned an existing one; check the `finalized_at` timestamp and `finalized` flag in the response to distinguish.

All revenue endpoints are under `/api/revenue/**` which is already covered by the existing CORS configuration at `/api/**`.

---

## 5. Frontend — Components

### New Components

#### `TabBar.jsx`

- Three tabs: `Lịch hẹn` · `Bệnh nhân` · `Doanh thu & Thuế`
- `activeTab` prop (string: `'appointments'`, `'patients'`, `'revenue'`)
- `onTabChange` callback prop
- Active tab uses the same `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` as the existing header
- Positioned below the header, above action buttons

#### `PatientTable.jsx`

- Columns: STT (row number) · Họ tên · Năm sinh · Giới tính · Số điện thoại · Địa chỉ · Số lịch hẹn
- "Số lịch hẹn" column: derived from a count of appointments per patient — add `GET /api/patients/{id}/appointment-count` to backend OR derive from a single call to the existing `/api/appointments/with-patients` endpoint by grouping client-side
- Edit button → opens existing `PatientForm` in edit mode (already handles this flow)
- Delete button → opens confirmation with appointment count (reuses existing cascade warning pattern from `PatientForm.jsx`)
- SearchBar reused above the table (search by name or phone within the patient list)
- Props: `patients` (array), `onEdit` (function), `onDelete` (function)

#### `RevenueTabView.jsx`

Container for Tab 3. Contains a segmented control (not a full tab bar) to switch between three sub-views:
- `Tháng hiện tại` → renders `CurrentMonthWidget`
- `Tổng theo năm` → renders `AnnualSummaryTable`
- `Sổ S1a-HKD` → renders `S1aHkdLedgerView`

#### `CurrentMonthWidget.jsx`

- Fetches `GET /api/revenue/current-month` on mount
- Polls the same endpoint every 60 seconds (use `setInterval` in `useEffect` cleanup)
- Displays: large VNĐ total, appointment count, estimated TNCN amount
- TNCN disclaimer badge: "Thuế TNCN ước tính — xác nhận tỷ lệ với cơ quan thuế trước khi nộp" (hidden in `@media print`)
- Format: use `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`

#### `AnnualSummaryTable.jsx`

- Year selector dropdown (current year pre-selected; allows navigating to prior years)
- Fetches `GET /api/revenue/monthly/{year}` when year changes
- 12 data rows (Jan–Dec) + `Tổng cộng` footer row
- Columns: Tháng · Số lịch hẹn · Doanh thu · TNCN ước tính · Trạng thái
- Status column: finalized months show 🔒 and the finalized_at date; current month shows a live "●" indicator; future months are greyed out
- Manual finalize button appears for past months that are not yet finalized (calls `POST /api/revenue/finalize/{year}/{month}`)

#### `S1aHkdLedgerView.jsx`

- Month picker + year picker (dropdowns); current month pre-selected
- Fetches `GET /api/revenue/s1a-hkd/{year}/{month}` when period changes
- Renders the complete S1a-HKD form (see Section 6 for exact structure)
- **Print button:** calls `window.print()`. The `@media print` rules hide everything except `.s1a-hkd-form-container`
- **Export to Excel button:** uses SheetJS (`xlsx` library from `cdnjs.cloudflare.com`) to generate a `.xlsx` file matching the official template structure; triggers browser download
- TNCN disclaimer badge (suppressed in print)

#### `ClinicSettingsForm.jsx`

- Opened via ⚙ gear icon in the app header (new `showSettingsModal` state in `App.jsx`)
- Uses existing `Modal` component as the wrapper
- Fields: all `clinic_settings` columns (business_name, owner_name, address, tax_id, business_address, currency_unit, tncn_rate)
- TNCN rate field shows tooltip: `"Xác nhận tỷ lệ này với Chi cục Thuế địa phương trước khi sử dụng"`
- On save: `PUT /api/settings`; on success, refetch `S1aHkdLedgerView` header (dispatch a custom event or lift state)

### Modified Components

#### `App.jsx`

New state variables:
```javascript
const [activeTab, setActiveTab] = useState('appointments'); // 'appointments'|'patients'|'revenue'
const [showSettingsModal, setShowSettingsModal] = useState(false);
const [patients, setPatients] = useState([]);  // for PatientTable
```

New logic:
- Fetch `patientAPI.getAll()` on mount (in addition to existing appointment fetch)
- Render `<TabBar>` below header
- Conditionally render tab content based on `activeTab`
- Render `<ClinicSettingsForm>` in Modal when `showSettingsModal=true`
- Add ⚙ icon button to header right side

#### `api.js`

```javascript
export const revenueAPI = {
    getCurrentMonth: () => api.get('/revenue/current-month'),
    getMonthlyByYear: (year) => api.get(`/revenue/monthly/${year}`),
    getAnnualTotal: (year) => api.get(`/revenue/annual/${year}`),
    getS1aHkd: (year, month) => api.get(`/revenue/s1a-hkd/${year}/${month}`),
    finalizeMonth: (year, month) => api.post(`/revenue/finalize/${year}/${month}`),
};

export const settingsAPI = {
    get: () => api.get('/settings'),
    update: (settings) => api.put('/settings', settings),
};
```

#### `App.css`

New rule sections to add:

```css
/* Tab bar */
.tab-bar { ... }
.tab-button { ... }
.tab-button.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }

/* Patient table — reuse appointment table classes where possible */
.patient-table-container { ... }

/* Revenue view */
.revenue-tab-view { ... }
.current-month-widget { ... }
.tncn-disclaimer { ... }
.annual-summary-table { ... }
.finalized-badge { ... }
.live-indicator { ... }

/* S1a-HKD form */
.s1a-hkd-form-container { ... }
.s1a-hkd-header { ... }
.s1a-hkd-table { ... }
.s1a-hkd-footer { ... }

/* Print rules */
@media print {
    .app-header,
    .tab-bar,
    .action-buttons,
    .controls-container,
    .results-info,
    .tncn-disclaimer,
    .s1a-hkd-controls,
    .s1a-hkd-export-buttons {
        display: none !important;
    }
    .s1a-hkd-form-container {
        display: block !important;
        width: 100%;
    }
    @page {
        margin: 2cm;
    }
    .s1a-hkd-footer {
        page-break-inside: avoid;
    }
}
```

---

## 6. S1a-HKD Form Specification

### Official Form Structure

```
┌─────────────────────────────────────────────────────────────┐
│ HỘ, CÁ NHÂN KINH DOANH: [business_name]                    │
│                                          Mẫu số S1a-HKD     │
│ Địa chỉ: [address]                       (TT 152/2025/TT-BTC│
│ Mã số thuế: [tax_id]                                        │
│                                                             │
│      SỔ DOANH THU BÁN HÀNG HÓA, DỊCH VỤ                   │
│      Địa điểm kinh doanh: [business_address]               │
│      Kỳ kê khai: Tháng MM/YYYY                             │
│      Đơn vị tính: [currency_unit]                          │
│                                                             │
│ ┌──────────────┬──────────────────────────────┬───────────┐ │
│ │ Ngày tháng   │ Diễn giải                    │ Số tiền   │ │
│ │ (Cột A)      │ (Cột B)                      │ (Cột 1)   │ │
│ ├──────────────┼──────────────────────────────┼───────────┤ │
│ │ 01/04/2026   │ Dịch vụ nha khoa — Nguyễn A  │ 500.000   │ │
│ │ 01/04/2026   │ Dịch vụ nha khoa — Trần B    │ 1.200.000 │ │
│ │ 02/04/2026   │ Dịch vụ nha khoa — Lê C      │ 750.000   │ │
│ │ ...          │ ...                           │ ...       │ │
│ ├──────────────┼──────────────────────────────┼───────────┤ │
│ │              │ Tổng cộng                     │ X.XXX.XXX │ │
│ └──────────────┴──────────────────────────────┴───────────┘ │
│                                                             │
│          Ngày [DD] tháng [MM] năm [YYYY]                   │
│    NGƯỜI ĐẠI DIỆN HỘ KINH DOANH/CÁ NHÂN KINH DOANH        │
│          (Ký, ghi rõ họ tên, đóng dấu (nếu có))            │
└─────────────────────────────────────────────────────────────┘
```

### Data Mapping

| Form Field | Source |
|------------|--------|
| HỘ, CÁ NHÂN KINH DOANH | `clinic_settings.business_name` |
| Địa chỉ (header) | `clinic_settings.address` |
| Mã số thuế | `clinic_settings.tax_id` |
| Địa điểm kinh doanh | `clinic_settings.business_address` |
| Kỳ kê khai | `"Tháng " + month + "/" + year` |
| Đơn vị tính | `clinic_settings.currency_unit` |
| Cột A (Ngày tháng) | `appointments.date` formatted as `dd/MM/yyyy` |
| Cột B (Diễn giải) | `"Dịch vụ nha khoa — " + patients.name` |
| Cột 1 (Số tiền) | `COALESCE(appointments.fee, 0)` |
| Tổng cộng | `SUM(all Cột 1 amounts)` |
| TNCN (not on form itself, shown in UI) | `totalRevenue × clinic_settings.tncn_rate` |
| Signature date | Current date when S1aHkdDTO is generated |
| Signature name | `clinic_settings.owner_name` (displayed as label; actual signature is handwritten) |

### Number Formatting Rules (Vietnamese Locale)

- Thousands separator: dấu chấm (`.`) — e.g., `1.500.000`
- Decimal separator: dấu phẩy (`,`) — e.g., `1.500.000,50`
- Currency suffix: `VNĐ` or `₫`
- Frontend: `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`
- Backend: Returns plain `BigDecimal`; formatting is entirely the frontend's responsibility
- The official form shows amounts **without** the currency symbol in the table cells; the symbol appears only in the "Đơn vị tính" header field

### Empty Settings Placeholder Behavior

When `clinic_settings` fields are empty strings (as in the default row), the S1a-HKD form renders `"..........."` for each blank header field — matching the visual convention of the official blank template. **The form never crashes on empty settings.**

---

## 7. Key Design Decisions

### Decision Log

| Decision | Rationale |
|----------|-----------|
| **Cột B = per-appointment** | Full audit trail; "ghi theo từng nghiệp vụ phát sinh" is permitted by TT 152/2025 |
| **Monthly reset = snapshot, not delete** | Appointment data is the source of truth; `monthly_revenue` stores snapshots only |
| **NULL fee → 0** | `COALESCE(fee, 0)` everywhere; appointment still appears in ledger with amount=0 |
| **Retroactive edits don't change finalized snapshots** | The finalized `monthly_revenue` row is the official declaration; live queries reflect edits but the locked snapshot does not |
| **TNCN rate locked at finalization** | `tncn_amount` stored in `monthly_revenue` uses the rate at finalization time; changing rate later does NOT retroactively alter finalized months |
| **No server-side PDF generation** | `window.print()` + `@media print` CSS is sufficient; avoids iText/JasperReports dependency |
| **Excel via SheetJS on frontend** | Avoids Apache POI dependency; SheetJS handles the `.xlsx` template structure well |
| **Settings default-created on first read** | Prevents null pointer exceptions; the form degrades gracefully with empty strings |
| **Finalization is idempotent** | `UNIQUE(year, month)` at DB level + service-layer check; calling the endpoint twice is safe |
| **Manual finalize endpoint** | Recovery path if the scheduled job misses (server offline on 1st of month) |
| **12-element list always returned** | `getAllMonthsForYear` always returns exactly 12 items; missing months get zero-value DTOs; frontend never needs to handle missing array elements |

---

## 8. Session-by-Session Implementation

### Session 1 — Database Extensions & Core Models
**~1.5 hours | Backend only**

**Prerequisites:** Send `dental-clinic-backend` folder as ZIP; Claude returns ZIP with all Session 1 files.

**Tasks:**
1. Write `V2__revenue_tables.sql`: `CREATE TABLE clinic_settings` + `CREATE TABLE monthly_revenue` (with `CHECK(month BETWEEN 1 AND 12)`, `UNIQUE(year, month)`) + seed `INSERT` for default settings row
2. Create `ClinicSettings.java` entity (all columns, correct JPA annotations)
3. Create `MonthlyRevenue.java` entity (all columns, `@UniqueConstraint`)
4. Create `ClinicSettingsRepository.java` (extends `JpaRepository<ClinicSettings, Long>`; no custom methods yet)
5. Create `MonthlyRevenueRepository.java` with: `findByYearAndMonth`, `findAllByYearOrderByMonth`, `sumTotalRevenueByYear`
6. Create `ClinicSettingsDTO.java` (plain POJO, all nullable)
7. Create `MonthlyRevenueDTO.java` (plain POJO)
8. If Flyway not configured, add `spring.flyway.enabled=true` to `application.properties`
9. Run application and verify: both tables exist, default settings row present, no migration errors

**Success criteria:**
- `mvn spring-boot:run` completes without errors
- `clinic_settings` and `monthly_revenue` tables exist in PostgreSQL
- Default `clinic_settings` row with `tncn_rate=0.0200` exists

---

### Session 2 — Revenue Aggregation & Settings APIs
**~2 hours | Backend only**

**Prerequisites:** Session 1 complete.

**Tasks:**
1. Add JPQL queries to existing `AppointmentRepository.java`: `sumFeeByYearAndMonth`, `countByYearAndMonth`
2. Create `ClinicSettingsService.java`: `getSettings()` with auto-create-default logic; `updateSettings()` with `[0.00, 1.00]` validation
3. Create `RevenueService.java`: `getCurrentMonthRevenue()`, `getCurrentMonthAppointmentCount()`, `getMonthlyRevenue()`, `getAllMonthsForYear()` (always 12 elements), `getAnnualTotal()`, `finalizeMonth()` (idempotent)
4. Create `MonthlyFinalizationJob.java`: `@Scheduled(cron = "0 0 0 1 * *")`, finalizes previous month, logs result
5. Add `@EnableScheduling` to `DentalClinicApplication.java`
6. Create `ClinicSettingsController.java`: `GET /api/settings`, `PUT /api/settings`
7. Create `RevenueController.java`: `GET /api/revenue/current-month`, `GET /api/revenue/monthly/{year}`, `GET /api/revenue/annual/{year}`, `POST /api/revenue/finalize/{year}/{month}`
8. Test all 6 endpoints in Postman; verify live total matches sum of current-month appointment fees

**Success criteria:**
- `GET /api/revenue/current-month` returns correct live total
- `POST /api/revenue/finalize/{year}/{month}` writes row to `monthly_revenue`
- Calling finalize twice returns same row (idempotent)
- `GET /api/settings` returns default row; `PUT /api/settings` updates it

---

### Session 3 — S1a-HKD Data Endpoint & TNCN
**~1.5 hours | Backend only**

**Prerequisites:** Sessions 1–2 complete.

**Tasks:**
1. Create `S1aHkdEntryDTO.java`: `entryDate` (LocalDate), `description` (String), `amount` (BigDecimal)
2. Create `S1aHkdDTO.java`: all header fields + `List<S1aHkdEntryDTO>` + `totalRevenue` + `tncnAmount` + `signatureDate`
3. Add JPQL query to `AppointmentRepository.java`: join appointments with patients for a given year/month, ordered by date ASC
4. Add `getS1aHkdData(int year, int month)` to `RevenueService.java`: pull settings for header; query appointments+patients; map each row to `S1aHkdEntryDTO` (`Cột B = "Dịch vụ nha khoa — " + patient.name`); compute total; compute TNCN; set `signatureDate` to today
5. Add `GET /api/revenue/s1a-hkd/{year}/{month}` to `RevenueController.java`
6. Verify JSON response against official form fields; confirm TNCN = `totalRevenue × tncn_rate`

**Success criteria:**
- Response contains all header, entry, total, and TNCN fields
- Entry count matches appointment count for the queried month
- `TNCN = totalRevenue × settings.tncn_rate` rounded to 2 decimal places
- NULL-fee appointments appear with `amount=0`, not causing errors

---

### Session 4 — Tab Navigation & Patient List
**~2 hours | Frontend only**

**Prerequisites:** Sessions 1–3 complete (or at minimum: backend running with `/api/patients` working).

**Tasks:**
1. Create `TabBar.jsx`: 3 tabs, `activeTab` prop, `onTabChange` callback, purple gradient on active tab
2. Add `activeTab` state to `App.jsx`; conditionally render tab content areas
3. Create `PatientTable.jsx`: columns (STT, Họ tên, Năm sinh, Giới tính, SĐT, Địa chỉ, Số lịch hẹn); edit → existing `PatientForm`; delete with cascade warning
4. For appointment count per patient: either add `GET /api/patients/{id}/appointment-count` to backend, or compute client-side from a single `/api/appointments/with-patients` call grouped by `patientId`
5. Add `revenueAPI` and `settingsAPI` objects to `api.js`
6. Tab 3 content: render `RevenueTabView` placeholder (just a card) to confirm routing works
7. Add tab bar CSS and patient table CSS to `App.css`
8. Add `⚙` gear icon button to header (no functionality yet — just the icon)

**Success criteria:**
- Three tabs switch without page reload
- Tab 1 (Lịch hẹn) unchanged from current
- Tab 2 (Bệnh nhân) shows all patients with edit/delete
- Tab 3 renders placeholder without console errors

---

### Session 5 — Revenue View (S1a-HKD Compliant)
**~2.5 hours | Frontend only**

**Prerequisites:** Sessions 2–4 complete (backend endpoints live).

**Tasks:**
1. `CurrentMonthWidget.jsx`: fetch `/api/revenue/current-month`; display large VNĐ total + count + TNCN estimate; poll every 60s; show TNCN disclaimer badge
2. `AnnualSummaryTable.jsx`: year selector; fetch `/api/revenue/monthly/{year}`; 12 rows + Tổng cộng footer; lock icon for finalized; live badge for current month; manual finalize button for unfinalised past months
3. `S1aHkdLedgerView.jsx`: month+year picker; fetch `/api/revenue/s1a-hkd/{year}/{month}`; render full form (header, table, footer); Print button; Export button (SheetJS stub — full export in Session 7)
4. `RevenueTabView.jsx`: container with segmented control (Tháng hiện tại · Tổng theo năm · Sổ S1a-HKD)
5. Wire Tab 3 to render `RevenueTabView`
6. Add `@media print` CSS block to `App.css`

**Success criteria:**
- `CurrentMonthWidget` shows correct live total matching backend
- `AnnualSummaryTable` shows all 12 months; finalized months show lock icon
- `S1aHkdLedgerView` renders header, table rows, Tổng cộng, and signature block
- Print preview shows only the form on a clean page

---

### Session 6 — Clinic Settings UI
**~1 hour | Frontend + Backend**

**Prerequisites:** Session 5 complete.

**Tasks:**
1. Create `ClinicSettingsForm.jsx`: fields for all `clinic_settings` columns; TNCN rate field with tooltip
2. Wire `⚙` gear icon in header to open `ClinicSettingsForm` in existing `Modal` component
3. On save: `PUT /api/settings`; on success refresh `S1aHkdLedgerView` header
4. Add `vi-VN.js` keys for settings namespace: `settings.title`, `settings.businessName`, `settings.ownerName`, `settings.address`, `settings.taxId`, `settings.businessAddress`, `settings.currencyUnit`, `settings.tncnRate`, `settings.tncnRateTooltip`, `settings.save`, `settings.saved`
5. Verify that changing settings immediately updates the S1a-HKD form header on next fetch

**Success criteria:**
- Settings form loads existing values on open
- Saving updates `clinic_settings` in DB
- S1a-HKD header fields reflect new settings on next period fetch

---

### Session 7 — Export & Print Polish
**~1.5 hours | Frontend only**

**Prerequisites:** Session 5 complete.

**Tasks:**
1. Implement SheetJS Excel export in `S1aHkdLedgerView.jsx`: structure mirrors official `.xlsx` template (header block, data table, Tổng cộng row, signature placeholder row)
2. Implement annual summary Excel export in `AnnualSummaryTable.jsx`: 12-month table with TNCN column, year in header cell
3. Refine `@media print` CSS: 2cm page margins; `page-break-inside: avoid` on `.s1a-hkd-footer`; suppress TNCN disclaimer badge; suppress export/print buttons themselves in print output
4. Test print-to-PDF in Chrome (Ctrl+P → Save as PDF); compare output against official template visually

**Success criteria:**
- Excel `.xlsx` download opens correctly and matches the official template structure
- Print-to-PDF is visually faithful to the S1a-HKD blank template
- TNCN disclaimer badge does not appear in print output

---

### Session 8 — Testing, Edge Cases & Documentation
**~1.5 hours | Frontend + Backend**

**Prerequisites:** All previous sessions complete.

**Tasks:**
1. **Year-boundary test:** Add appointments in December → finalize → verify January starts at 0; December shows locked
2. **NULL fee test:** Create appointment with no fee → verify it appears in S1a-HKD with amount=0 and no errors
3. **Empty month test:** Month with no appointments → `monthly_revenue` snapshot has `total_revenue=0`, `appointment_count=0`
4. **Settings-not-filled test:** Use default empty settings → S1a-HKD header shows `"..........."`, no null pointer exceptions
5. **Retroactive appointment test:** Add appointment to a finalized month → live query updates; finalized snapshot unchanged
6. **Double-finalization test:** Call `POST /api/revenue/finalize/{year}/{month}` twice → same response both times
7. **Manual finalize test:** Simulate missed scheduler (skip auto-run) → use manual endpoint to recover
8. Update `HUONG_DAN_SU_DUNG_CHI_TIET.md` with new section in Vietnamese covering the revenue tab
9. Code cleanup: remove debug `console.log` statements; final review of `vi-VN.js` strings for correctness

**Success criteria:**
- All 7 edge case tests pass
- Print and export outputs are submission-ready
- Vietnamese user documentation updated

---

## 9. Files Changed Per Session

### Backend files

| File | Session | Action |
|------|---------|--------|
| `db/migration/V2__revenue_tables.sql` | 1 | New |
| `model/ClinicSettings.java` | 1 | New |
| `model/MonthlyRevenue.java` | 1 | New |
| `repository/ClinicSettingsRepository.java` | 1 | New |
| `repository/MonthlyRevenueRepository.java` | 1 | New |
| `dto/ClinicSettingsDTO.java` | 1 | New |
| `dto/MonthlyRevenueDTO.java` | 1 | New |
| `repository/AppointmentRepository.java` | 2, 3 | Extend (add JPQL queries) |
| `service/ClinicSettingsService.java` | 2 | New |
| `service/RevenueService.java` | 2, 3 | New, then extend |
| `service/MonthlyFinalizationJob.java` | 2 | New |
| `DentalClinicApplication.java` | 2 | Modify (add `@EnableScheduling`) |
| `controller/ClinicSettingsController.java` | 2 | New |
| `controller/RevenueController.java` | 2, 3 | New, then extend |
| `dto/S1aHkdEntryDTO.java` | 3 | New |
| `dto/S1aHkdDTO.java` | 3 | New |

### Frontend files

| File | Session | Action |
|------|---------|--------|
| `src/components/TabBar.jsx` | 4 | New |
| `src/components/PatientTable.jsx` | 4 | New |
| `src/services/api.js` | 4 | Extend (add revenueAPI + settingsAPI) |
| `src/App.jsx` | 4, 5, 6 | Extend (tab state, revenue wiring, settings modal) |
| `src/App.css` | 4, 5, 7 | Extend (tabs, patient table, revenue, print) |
| `src/components/RevenueTabView.jsx` | 5 | New |
| `src/components/CurrentMonthWidget.jsx` | 5 | New |
| `src/components/AnnualSummaryTable.jsx` | 5 | New |
| `src/components/S1aHkdLedgerView.jsx` | 5, 7 | New, then extend (export) |
| `src/components/ClinicSettingsForm.jsx` | 6 | New |
| `src/locales/vi-VN.js` | 6 | Extend (new keys) |

### Documentation files

| File | Session | Action |
|------|---------|--------|
| `HUONG_DAN_SU_DUNG_CHI_TIET.md` | 8 | Extend (new Vietnamese section) |

---

## 10. Edge Cases & Open Questions

### Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| `appointments.fee = NULL` | `COALESCE(fee, 0)` everywhere. Appointment appears in S1a-HKD with Cột 1 = 0. No errors. |
| Month with zero appointments | `getAllMonthsForYear` still returns a DTO for that month with `totalRevenue=0`, `appointmentCount=0`. |
| Server offline on 1st of month | Scheduler job misses. UI shows "Chưa chốt sổ" badge for past unfinalized months. User triggers `POST /api/revenue/finalize/{year}/{month}` manually. |
| Appointment added to finalized month | Live query (`/api/revenue/current-month` if current month) reflects it. The finalized snapshot in `monthly_revenue` does NOT change. S1a-HKD form for that finalized period uses the snapshot. |
| `finalizeMonth` called twice | Returns existing `monthly_revenue` row unchanged. `finalized_at` remains the original timestamp. HTTP 200 both times. |
| Empty `clinic_settings` fields | S1a-HKD header renders `"..........."` placeholder strings. No `NullPointerException`. |
| Year boundary (Dec → Jan) | December finalization: `year=N, month=12`. January live query: year=N+1. `getAllMonthsForYear(N)` does not include January N+1. |
| `tncn_rate` changed after finalization | `monthly_revenue.tncn_amount` for past months is unchanged (rate was locked at finalization). New filings use the new rate. |
| `totalRevenue = 0` for the whole month | `tncn_amount = 0`. Valid state. S1a-HKD shows Tổng cộng = 0. |
| Future months in `getAllMonthsForYear` | Return zero-value DTOs with `finalized=false`. UI displays them greyed out. |
| Very large `fee` values | `NUMERIC(15,2)` supports up to 9,999,999,999,999.99 — well above any realistic Vietnamese dental fee. |

### Open Questions (Resolved)

| Question | Resolution |
|----------|------------|
| Cột B granularity? | Per-appointment (Option A). Confirmed 03/04/2026. |
| TNCN rate? | Default 2%. Owner must confirm with local Chi cục Thuế before live use. |
| PDF generation? | Browser `window.print()` + `@media print` CSS. No server-side library. |

### Remaining Open Item

> **TNCN rate confirmation:** The system defaults to 2% and displays a prominent disclaimer. Before the system is used for official tax filings, the clinic owner should confirm the exact applicable rate with the local Chi cục Thuế. The rate is configurable in Settings without any code changes.

---

## 11. Repository Structure (Full)

After all 8 sessions, the complete backend structure:

```
dental-clinic-backend/
└── src/main/java/com/dentalclinic/
    ├── DentalClinicApplication.java          (modified: @EnableScheduling)
    ├── model/
    │   ├── Patient.java                      (existing)
    │   ├── Appointment.java                  (existing)
    │   ├── ClinicSettings.java               (new, session 1)
    │   └── MonthlyRevenue.java               (new, session 1)
    ├── repository/
    │   ├── PatientRepository.java            (existing)
    │   ├── AppointmentRepository.java        (modified: new JPQL queries)
    │   ├── ClinicSettingsRepository.java     (new, session 1)
    │   └── MonthlyRevenueRepository.java     (new, session 1)
    ├── service/
    │   ├── PatientService.java               (existing)
    │   ├── AppointmentService.java           (existing)
    │   ├── ClinicSettingsService.java        (new, session 2)
    │   ├── RevenueService.java               (new, sessions 2–3)
    │   └── MonthlyFinalizationJob.java       (new, session 2)
    ├── controller/
    │   ├── PatientController.java            (existing)
    │   ├── AppointmentController.java        (existing)
    │   ├── ClinicSettingsController.java     (new, session 2)
    │   └── RevenueController.java            (new, sessions 2–3)
    ├── dto/
    │   ├── AppointmentWithPatientDTO.java    (existing)
    │   ├── ClinicSettingsDTO.java            (new, session 1)
    │   ├── MonthlyRevenueDTO.java            (new, session 1)
    │   ├── S1aHkdEntryDTO.java               (new, session 3)
    │   └── S1aHkdDTO.java                    (new, session 3)
    ├── exception/
    │   ├── ResourceNotFoundException.java    (existing)
    │   ├── DuplicatePhoneException.java      (existing)
    │   └── GlobalExceptionHandler.java       (existing)
    └── config/
        └── CorsConfig.java                   (existing, unchanged)

src/main/resources/
    ├── application.properties                (possibly modified: flyway config)
    └── db/migration/
        └── V2__revenue_tables.sql            (new, session 1)
```

After all 8 sessions, the complete frontend structure:

```
dental-clinic-frontend/
└── src/
    ├── App.jsx                               (modified: tabs, settings modal)
    ├── App.css                               (modified: tabs, revenue, print CSS)
    ├── main.jsx                              (unchanged)
    ├── index.css                             (unchanged)
    ├── locales/
    │   └── vi-VN.js                          (modified: new keys)
    ├── utils/
    │   ├── i18n.js                           (existing)
    │   └── formatters.js                     (existing)
    ├── services/
    │   └── api.js                            (modified: revenueAPI, settingsAPI)
    └── components/
        ├── AppointmentTable.jsx              (existing)
        ├── AppointmentForm.jsx               (existing)
        ├── PatientForm.jsx                   (existing)
        ├── SearchBar.jsx                     (existing)
        ├── TreatmentFilter.jsx               (existing)
        ├── Modal.jsx                         (existing)
        ├── LoadingSpinner.jsx                (existing)
        ├── TabBar.jsx                        (new, session 4)
        ├── PatientTable.jsx                  (new, session 4)
        ├── RevenueTabView.jsx                (new, session 5)
        ├── CurrentMonthWidget.jsx            (new, session 5)
        ├── AnnualSummaryTable.jsx            (new, session 5)
        ├── S1aHkdLedgerView.jsx              (new, sessions 5, 7)
        └── ClinicSettingsForm.jsx            (new, session 6)
```

---

## 12. Vietnamese Localization Keys

New keys to add to `src/locales/vi-VN.js` in Session 6 (organized by namespace):

```javascript
// Tabs
tab: {
    appointments: 'Lịch hẹn',
    patients: 'Bệnh nhân',
    revenue: 'Doanh thu & Thuế',
},

// Settings modal
settings: {
    title: 'Cài đặt phòng khám',
    businessName: 'Tên hộ/cá nhân kinh doanh',
    ownerName: 'Người đại diện',
    address: 'Địa chỉ',
    taxId: 'Mã số thuế',
    businessAddress: 'Địa điểm kinh doanh',
    currencyUnit: 'Đơn vị tính',
    tncnRate: 'Tỷ lệ thuế TNCN (%)',
    tncnRateTooltip: 'Xác nhận tỷ lệ này với Chi cục Thuế địa phương trước khi sử dụng cho hồ sơ thuế chính thức',
    save: 'Lưu cài đặt',
    saved: 'Đã lưu',
},

// Revenue tab
revenue: {
    title: 'Doanh thu & Thuế',
    currentMonth: 'Tháng hiện tại',
    annualSummary: 'Tổng theo năm',
    ledger: 'Sổ S1a-HKD',
    totalRevenue: 'Tổng doanh thu',
    appointmentCount: 'Số lịch hẹn',
    estimatedTncn: 'Thuế TNCN ước tính',
    finalize: 'Chốt sổ',
    finalized: 'Đã chốt',
    notFinalized: 'Chưa chốt sổ',
    finalizeMonth: 'Chốt sổ tháng',
    printForm: 'In sổ',
    exportExcel: 'Xuất Excel',
},

// S1a-HKD form labels
s1ahkd: {
    formTitle: 'SỔ DOANH THU BÁN HÀNG HÓA, DỊCH VỤ',
    formNumber: 'Mẫu số S1a-HKD',
    formRef: '(TT 152/2025/TT-BTC)',
    businessLabel: 'HỘ, CÁ NHÂN KINH DOANH',
    addressLabel: 'Địa chỉ',
    taxIdLabel: 'Mã số thuế',
    businessAddressLabel: 'Địa điểm kinh doanh',
    periodLabel: 'Kỳ kê khai',
    unitLabel: 'Đơn vị tính',
    colA: 'Ngày tháng',
    colB: 'Diễn giải',
    col1: 'Số tiền',
    total: 'Tổng cộng',
    signatureTitle: 'NGƯỜI ĐẠI DIỆN HỘ KINH DOANH/\nCÁ NHÂN KINH DOANH',
    signatureInstruction: '(Ký, ghi rõ họ tên, đóng dấu (nếu có))',
    entryDescription: 'Dịch vụ nha khoa —',
},

// TNCN disclaimer
tncn: {
    disclaimer: 'Thuế TNCN ước tính — xác nhận tỷ lệ với cơ quan thuế trước khi nộp',
    estimatedFor: 'TNCN ước tính tháng',
    rate: 'Tỷ lệ TNCN',
},

// Annual table
annual: {
    month: 'Tháng',
    description: 'Diễn giải',
    revenue: 'Doanh thu',
    estimatedTncn: 'TNCN ước tính',
    status: 'Trạng thái',
    total: 'Tổng cộng năm',
    months: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
             'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
},
```

---

## 13. Data Flow Diagrams

### Monthly Finalization Flow

```
[1st of month, midnight]
        │
        ▼
MonthlyFinalizationJob.finalizeLastMonth()
        │
        ▼
RevenueService.finalizeMonth(prevYear, prevMonth)
        │
        ├─ [Row already exists? finalized=true]
        │         └── return existing row (idempotent)
        │
        └─ [Row does not exist or finalized=false]
                  │
                  ├── SUM(COALESCE(fee,0)) FROM appointments
                  │   WHERE YEAR(date)=prevYear AND MONTH(date)=prevMonth
                  │
                  ├── COUNT(*) FROM appointments WHERE same condition
                  │
                  ├── Fetch tncn_rate FROM clinic_settings
                  │
                  ├── tncn_amount = totalRevenue × tncn_rate
                  │
                  └── INSERT/UPDATE monthly_revenue
                      (year, month, total_revenue, appointment_count,
                       tncn_amount, finalized=TRUE, finalized_at=NOW())
```

### S1a-HKD Form Generation Flow

```
User selects period (year, month) in S1aHkdLedgerView
        │
        ▼
GET /api/revenue/s1a-hkd/{year}/{month}
        │
        ▼
RevenueService.getS1aHkdData(year, month)
        │
        ├── Fetch clinic_settings (for header fields)
        │
        ├── SELECT a.date, a.fee, p.name
        │   FROM appointments a JOIN patients p ON a.patient_id = p.id
        │   WHERE YEAR(a.date) = year AND MONTH(a.date) = month
        │   ORDER BY a.date ASC, p.name ASC
        │
        ├── For each row → S1aHkdEntryDTO:
        │   entryDate = a.date
        │   description = "Dịch vụ nha khoa — " + p.name
        │   amount = COALESCE(a.fee, 0)
        │
        ├── totalRevenue = SUM(all amounts)
        ├── tncnAmount = totalRevenue × settings.tncnRate
        └── signatureDate = LocalDate.now().format("dd/MM/yyyy")
        │
        ▼
S1aHkdDTO returned to frontend
        │
        ▼
S1aHkdLedgerView renders form
(window.print() or SheetJS export on button click)
```

### Live Monthly Total Flow

```
CurrentMonthWidget mounts / polls every 60s
        │
        ▼
GET /api/revenue/current-month
        │
        ▼
RevenueService.getCurrentMonthRevenue()
        │
        ▼
SELECT COALESCE(SUM(COALESCE(fee,0)), 0)
FROM appointments
WHERE YEAR(date) = YEAR(NOW()) AND MONTH(date) = MONTH(NOW())
        │
        ▼
MonthlyRevenueDTO {
    finalized: false,
    totalRevenue: [live sum],
    appointmentCount: [live count],
    tncnAmount: [live sum × settings.tncnRate]
}
        │
        ▼
Widget displays formatted values
(Intl.NumberFormat('vi-VN', {style:'currency',currency:'VND'}))
```

---

## 14. Testing Scenarios

### Manual Test Plan for Session 8

#### Test 1 — Year boundary

1. Add 3 appointments in December of the previous year with known fee values
2. Call `POST /api/revenue/finalize/{prevYear}/12`
3. Verify `monthly_revenue` row exists: `year=prevYear, month=12, finalized=true, total_revenue` matches sum
4. Verify `GET /api/revenue/monthly/{prevYear}` shows December locked
5. Verify `GET /api/revenue/monthly/{thisYear}` shows all months at 0
6. Add appointment in January — verify `GET /api/revenue/current-month` shows only the January amount

**Expected:** No bleed between years. Previous year's December does not appear in current year total.

#### Test 2 — NULL fee

1. Create appointment via API with `"fee": null` (or no fee field)
2. Verify `GET /api/revenue/current-month` still returns without error
3. Verify the null-fee appointment has `totalRevenue += 0`
4. Verify `GET /api/revenue/s1a-hkd/{year}/{month}` includes the appointment with `amount: 0`

**Expected:** No NullPointerException anywhere in the chain.

#### Test 3 — Empty month

1. Ensure a specific past month has no appointments
2. Call `POST /api/revenue/finalize/{year}/{month}` for that month
3. Verify response: `total_revenue=0, appointment_count=0, tncn_amount=0, finalized=true`

**Expected:** Valid finalization of an empty month.

#### Test 4 — Empty settings

1. Clear all settings fields (PUT with empty strings and default tncn_rate)
2. Open S1a-HKD ledger view for any period
3. Verify header shows `"..........."` placeholder for each blank field
4. Verify no JavaScript errors in browser console

**Expected:** Graceful degradation.

#### Test 5 — Retroactive appointment in finalized month

1. Finalize a specific month (note the totalRevenue)
2. Add a new appointment dated within that finalized month
3. Verify: `GET /api/revenue/monthly/{year}` still shows the original locked total for that month
4. Verify: the S1a-HKD form for that month still uses the original snapshot
5. Verify: the live current-month total (if it's the current month) does reflect the new appointment

**Expected:** Finalized snapshot is immutable; live queries always reflect reality.

#### Test 6 — Double finalization

1. Call `POST /api/revenue/finalize/{year}/{month}` once
2. Note the `finalized_at` timestamp
3. Call the same endpoint again
4. Verify: same `finalized_at` timestamp in response (not overwritten)
5. Verify: HTTP 200 both times
6. Verify: only one row in `monthly_revenue` for that period

**Expected:** Idempotent behavior confirmed.

#### Test 7 — TNCN rate change after finalization

1. Set `tncn_rate = 0.02` in settings
2. Finalize a month — note `tncn_amount` stored
3. Change `tncn_rate = 0.03` in settings
4. Verify: previously finalized month's `tncn_amount` is unchanged
5. Verify: new unfinalized month's estimated TNCN uses 0.03

**Expected:** Historical TNCN amounts are immutable after finalization.

---

*End of master plan. Version 1.0 — 03/04/2026*
