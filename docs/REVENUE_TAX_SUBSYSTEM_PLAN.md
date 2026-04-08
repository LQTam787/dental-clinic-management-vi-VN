# Revenue & Tax Subsystem — Project Plan
## Dental Clinic Management System (Hệ thống Quản lý Phòng khám Nha khoa)

**Reference:** Thông tư 152/2025/TT-BTC, ngày 31 tháng 12 năm 2025  
**Form Target:** Mẫu số S1a-HKD — Sổ Doanh thu Bán hàng hóa, Dịch vụ  
**Applicable Section:** Chương II, Mục 1, Điều 4  
**Date drafted:** 03/04/2026

---

## 1. Confirmed Facts from Uploaded Documents

### Business Profile
- **Type:** Hộ kinh doanh (HKD)
- **Activity:** Dental services (dịch vụ nha khoa)
- **VAT status:** Not subject to GTGT (y tế/nha khoa = VAT-exempt)
- **Tax method:** Revenue-based declarations (kê khai theo doanh thu thực tế)
- **TNCN:** Required — calculations needed
- **Target form:** S1a-HKD (confirmed from both the .xlsx and .docx templates)

### S1a-HKD Form Structure (confirmed from templates)
```
┌─────────────────────────────────────────────────────────┐
│ HỘ, CÁ NHÂN KINH DOANH: ____     Mẫu số S1a-HKD        │
│ Địa chỉ: ____                     (TT 152/2025/TT-BTC)  │
│ Mã số thuế: ____                                         │
│                                                          │
│         SỔ DOANH THU BÁN HÀNG HÓA, DỊCH VỤ             │
│         Địa điểm kinh doanh: ____                        │
│         Kỳ kê khai: ____                                 │
│         Đơn vị tính: ____                                │
│                                                          │
│  ┌──────────────┬──────────────────────┬───────────┐    │
│  │ Ngày tháng   │ Diễn giải            │ Số tiền   │    │
│  │ (A)          │ (B)                  │ (1)       │    │
│  ├──────────────┼──────────────────────┼───────────┤    │
│  │ [date]       │ [description]        │ [amount]  │    │
│  │ ...          │ ...                  │ ...       │    │
│  ├──────────────┼──────────────────────┼───────────┤    │
│  │              │ Tổng cộng            │ [total]   │    │
│  └──────────────┴──────────────────────┴───────────┘    │
│                                                          │
│               Ngày ... tháng ... năm ...                 │
│         NGƯỜI ĐẠI DIỆN HỘ KINH DOANH/                   │
│              CÁ NHÂN KINH DOANH                          │
│     (Ký, ghi rõ họ tên, đóng dấu (nếu có))              │
└─────────────────────────────────────────────────────────┘
```

### Important Legal Note on S1a-HKD vs TNCN
The Excel template note states S1a-HKD is designed for the group "không chịu thuế GTGT, không phải nộp thuế TNCN." However, Article 4 of the Thông tư explicitly allows HKD that DO file revenue-based tax declarations to **use this ledger for tracking and reconciling data with the tax authority**. The clinic falls into this permitted overlap:
- Uses S1a-HKD as the mandatory revenue ledger
- TNCN is calculated separately on top of S1a-HKD revenue data
- TNCN rate must be **user-configurable** (to be confirmed by owner with local tax authority; standard rate for service businesses is typically 2% on revenue)

---

## 2. What Gets Built

### New Database Tables
```
clinic_settings          — Business name, address, tax ID, TNCN rate, etc.
monthly_revenue          — Finalized monthly totals (snapshot on month rollover)
```

### New Backend Services
```
RevenueService           — Aggregate from appointments, live and finalized
MonthlyFinalizationJob   — Scheduled: runs on day 1, snapshots previous month
TNCNCalculationService   — Revenue × configured rate
ClinicSettingsService    — CRUD for business info
```

### New API Endpoints
```
GET  /api/revenue/current-month      — Live running total for current month
GET  /api/revenue/monthly/{year}     — All 12 months for a given year
GET  /api/revenue/annual/{year}      — Annual total
GET  /api/revenue/s1a-hkd/{year}/{month}  — Full S1a-HKD data for a period
POST /api/revenue/finalize/{year}/{month} — Manual month-end finalization
GET  /api/settings                   — Clinic settings
PUT  /api/settings                   — Update settings
```

### Frontend Changes
```
Tab navigation system (3 tabs):
  Tab 1: Lịch hẹn (Appointments)    — existing, unchanged
  Tab 2: Bệnh nhân (Patients)       — new (previously omitted from UI)
  Tab 3: Doanh thu & Thuế (Revenue) — new, S1a-HKD compliant

New components:
  TabBar                             — navigation between the three tables
  PatientListTable                   — shows all patients from DB
  RevenueTabView                     — container for revenue sub-views
    CurrentMonthWidget               — running total for current month
    MonthlyBreakdownTable            — Jan–Dec summary for selected year
    S1aHkdLedgerView                 — full S1a-HKD form view (printable)
  ClinicSettingsForm                 — business info + TNCN rate
```

---

## 3. Database Schema

### `clinic_settings` table
```sql
CREATE TABLE clinic_settings (
    id              BIGSERIAL PRIMARY KEY,
    business_name   VARCHAR(255) NOT NULL,
    owner_name      VARCHAR(255),
    address         VARCHAR(500),
    tax_id          VARCHAR(50),
    business_address VARCHAR(500),   -- địa điểm kinh doanh (may differ from address)
    currency_unit   VARCHAR(20) DEFAULT 'VNĐ',
    tncn_rate       NUMERIC(5,4) DEFAULT 0.0200,  -- 2% default, configurable
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `monthly_revenue` table
```sql
CREATE TABLE monthly_revenue (
    id                  BIGSERIAL PRIMARY KEY,
    year                INTEGER NOT NULL,
    month               INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    total_revenue       NUMERIC(15,2) NOT NULL DEFAULT 0,
    appointment_count   INTEGER NOT NULL DEFAULT 0,
    tncn_amount         NUMERIC(15,2) NOT NULL DEFAULT 0,
    finalized           BOOLEAN NOT NULL DEFAULT FALSE,
    finalized_at        TIMESTAMP,
    notes               VARCHAR(1000),          -- optional diễn giải
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (year, month)
);
```

### Notes on monthly reset mechanics
- "Reset to 0 on day 1" means: when the 1st of a new month arrives, the **previous month is finalized** (snapshot written to `monthly_revenue`), and the current month's running total starts fresh.
- The current month's live total is always computed dynamically from the `appointments` table (sum of `fee` where date falls in current month) — no actual data is lost.
- The `monthly_revenue` table stores **finalized** period records for S1a-HKD compliance and historical reporting.
- Manual finalization endpoint allows the user to force-finalize if the scheduler misses.

---

## 4. Session Breakdown

---

### Session 1 — Database Extensions & Core Models
**Estimated time:** 1.5 hours  
**Files:** Backend only

**Tasks:**
1. Create and run Flyway/Liquibase migration for `clinic_settings` and `monthly_revenue` tables
2. Seed one default `clinic_settings` row (empty values, to be filled via settings form)
3. Create `ClinicSettings.java` entity
4. Create `MonthlyRevenue.java` entity
5. Create `ClinicSettingsRepository.java`
6. Create `MonthlyRevenueRepository.java` with custom queries:
   - `findByYearAndMonth(int year, int month)`
   - `findAllByYear(int year)` — returns List ordered by month
   - `sumRevenueByYear(int year)` — annual total
7. Create `MonthlyRevenueDTO.java` and `ClinicSettingsDTO.java`
8. Verify application starts, tables created

**Success criteria:**
- Application starts without errors
- Both new tables exist in DB with correct schema
- Repository methods compile and basic queries work

---

### Session 2 — Backend: Revenue Aggregation & Settings APIs
**Estimated time:** 2 hours  
**Files:** Backend — service + controller layers

**Tasks:**
1. **ClinicSettingsService.java:**
   - `getSettings()` — returns single row, creates default if missing
   - `updateSettings(ClinicSettingsDTO)` — update row

2. **RevenueService.java:**
   - `getCurrentMonthRevenue()` — live sum from `appointments` for current month
   - `getCurrentMonthAppointmentCount()` — live count for current month
   - `getMonthlyRevenue(int year, int month)` — from `monthly_revenue` table (finalized) or computed if not finalized
   - `getAllMonthsForYear(int year)` — returns array of 12 monthly totals
   - `getAnnualTotal(int year)` — sum of all finalized months + current month (if in that year)
   - `finalizeMonth(int year, int month)` — writes snapshot to `monthly_revenue`, marks as finalized

3. **MonthlyFinalizationJob.java:**
   - `@Scheduled(cron = "0 0 0 1 * *")` — runs at midnight on the 1st of every month
   - Finalizes the previous month
   - Calculates and stores TNCN amount (revenue × rate from settings)
   - Logs result

4. **RevenueController.java:**
   - `GET /api/revenue/current-month`
   - `GET /api/revenue/monthly/{year}`
   - `GET /api/revenue/annual/{year}`
   - `POST /api/revenue/finalize/{year}/{month}`

5. **ClinicSettingsController.java:**
   - `GET /api/settings`
   - `PUT /api/settings`

6. Test all endpoints with Postman

**Success criteria:**
- All 5 endpoints return correct data
- Live monthly total matches sum of current-month appointments
- Finalization writes correct row to `monthly_revenue`
- Settings CRUD works

---

### Session 3 — Backend: S1a-HKD Data Endpoint & TNCN
**Estimated time:** 1.5 hours  
**Files:** Backend — service + DTO + controller

**Tasks:**
1. **S1aHkdDTO.java** — mirrors the official form structure:
   ```java
   // Header fields
   String businessName, ownerName, address, taxId;
   String businessAddress, declarationPeriod, currencyUnit;
   // Entry rows (each appointment in the period)
   List<S1aHkdEntryDTO> entries;
   // Footer
   BigDecimal totalRevenue;
   BigDecimal tncnAmount;
   String signatureDate;
   ```

2. **S1aHkdEntryDTO.java:**
   ```java
   LocalDate entryDate;    // Cột A — ngày tháng
   String description;     // Cột B — diễn giải (e.g., "Dịch vụ nha khoa")
   BigDecimal amount;      // Cột 1 — số tiền
   ```

3. **RevenueService** — add `getS1aHkdData(int year, int month)`:
   - Pull clinic settings for header
   - Pull all appointments for the period, map to entries
   - Column B description = "Dịch vụ nha khoa - [patient name]" (per-transaction) OR "Dịch vụ nha khoa tháng MM/YYYY" (periodic summary — configurable)
   - Calculate total, TNCN amount

4. **RevenueController** — add `GET /api/revenue/s1a-hkd/{year}/{month}`

5. Test output structure against the official form template

**Success criteria:**
- S1a-HKD endpoint returns all required header/body/footer fields
- Entry data maps correctly to Cột A / B / 1 from the official form
- TNCN calculated correctly from configured rate

---

### Session 4 — Frontend: Tab Navigation & Patient List
**Estimated time:** 1.5–2 hours  
**Files:** Frontend — new components + updated App.jsx

**Tasks:**
1. **Tab navigation component** (`src/components/TabBar.jsx`):
   - Three tabs: "Lịch hẹn" | "Bệnh nhân" | "Doanh thu & Thuế"
   - Active tab highlighted (purple gradient consistent with existing design)
   - Tab state managed in App.jsx

2. **Patient list table** (`src/components/PatientTable.jsx`):
   - Columns: STT, Họ tên, Năm sinh, Giới tính, Số điện thoại, Địa chỉ, Số lịch hẹn
   - Sortable by name
   - Search by name/phone (reuse existing SearchBar component)
   - Edit button → opens existing PatientForm
   - Delete button with cascade warning (same as Session 7 pattern)

3. **Update App.jsx:**
   - Add tab state (`activeTab`)
   - Conditionally render `AppointmentTable`, `PatientTable`, or `RevenueTabView`
   - Pass `onEditPatient` handler to PatientTable
   - Fetch patient list (already in `patientAPI.getAll()`)

4. **Update api.js:**
   - Add `revenueAPI` section with all new endpoints

5. **CSS updates:**
   - Tab bar styles
   - Patient table styles (can reuse most from appointment table)

**Success criteria:**
- Three tabs visible, switching works
- Appointments tab unchanged from current
- Patient tab shows all patients from DB with edit/delete
- Revenue tab placeholder renders without errors

---

### Session 5 — Frontend: Revenue View (S1a-HKD Compliant)
**Estimated time:** 2–2.5 hours  
**Files:** Frontend — revenue components

**Tasks:**
1. **`RevenueTabView.jsx`** — container with two sub-views:
   - "Tháng hiện tại" (current month summary)
   - "Sổ S1a-HKD" (ledger view, selectable by year/month)

2. **`CurrentMonthWidget.jsx`** — live running total:
   - Large total display (formatted as VNĐ)
   - Appointment count
   - Auto-refreshes every 60 seconds (or on tab focus)
   - Shows estimated TNCN for current month

3. **`AnnualSummaryTable.jsx`** — monthly breakdown for a year:
   - Matches the S1a-HKD structure (Cột A / B / 1)
   - Rows: Jan, Feb, ..., Dec (+ "Tổng cộng" footer)
   - Columns: Tháng | Diễn giải | Doanh thu | Thuế TNCN ước tính
   - Finalized months: show from `monthly_revenue` (locked icon)
   - Current month: show live total (animated/green indicator)
   - Year selector dropdown

4. **`S1aHkdLedgerView.jsx`** — full official form view:
   - Renders the S1a-HKD form exactly as per the .docx/.xlsx template
   - Month/year selector to view any period
   - Print button → uses `window.print()` with `@media print` CSS
   - Each appointment becomes one row (Cột A = date, Cột B = description, Cột 1 = fee)
   - "Tổng cộng" row at bottom
   - Footer with date and signature placeholder

**Success criteria:**
- Current month widget shows correct live total
- Annual summary table shows all 12 months with correct totals
- S1a-HKD ledger view is visually faithful to official template
- Print preview looks like the official form

---

### Session 6 — Frontend: Clinic Settings
**Estimated time:** 1 hour  
**Files:** Frontend — settings component + integration

**Tasks:**
1. **`ClinicSettingsForm.jsx`** — accessed via gear icon in header or Settings tab:
   - HỘ, CÁ NHÂN KINH DOANH (business name)
   - Họ tên người đại diện (owner/representative name)
   - Địa chỉ (address)
   - Mã số thuế (tax ID)
   - Địa điểm kinh doanh (business location — for S1a-HKD header)
   - Đơn vị tính (currency unit, default "VNĐ")
   - Tỷ lệ thuế TNCN (TNCN rate %, with tooltip explaining it)

2. **Settings gear icon** in header → opens modal with `ClinicSettingsForm`

3. **S1a-HKD header auto-population:** When settings are filled, the S1a-HKD ledger view automatically shows the correct business name, tax ID, etc. in the form header

4. **Settings persistence** — updates `PUT /api/settings`

5. Add settings to Vietnamese localization file (`vi-VN.js`)

**Success criteria:**
- Settings form saves and loads correctly
- S1a-HKD ledger view shows correct business info from settings
- TNCN rate change propagates to all calculations

---

### Session 7 — Export & Print
**Estimated time:** 1.5–2 hours  
**Files:** Frontend + optional backend PDF generation

**Tasks:**
1. **Print S1a-HKD** (browser print):
   - `@media print` CSS: hide tabs, buttons, sidebar; show only the form
   - Print-optimized layout matching the official template
   - Auto-populated with data for the selected period
   - "In / Print" button in S1aHkdLedgerView

2. **Export to Excel** (frontend-only, using SheetJS):
   - Exports the S1a-HKD data for the selected period
   - Format matches the .xlsx template structure
   - Includes header, entries, total, and footer (date/signature placeholder)

3. **Export Annual Summary to Excel:**
   - 12-month breakdown table
   - TNCN column alongside revenue
   - Year header

4. **Optional: PDF export via browser print-to-PDF instruction** (guide the user to use browser's "Save as PDF" option — no server-side PDF library needed unless complexity warrants it)

**Success criteria:**
- Printed S1a-HKD form is visually faithful to the official template
- Excel export opens correctly and matches template structure
- Print/export buttons available for both monthly and annual views

---

### Session 8 — Testing, Edge Cases & Documentation
**Estimated time:** 1.5 hours  
**Files:** Various

**Tasks:**
1. **Year-boundary testing:**
   - December finalization → January start
   - Annual total for year N does not bleed into year N+1
   - Historical monthly totals from previous years display correctly

2. **Edge cases:**
   - Month with zero appointments → revenue = 0, TNCN = 0 (valid row)
   - Appointment with `fee = null` → treated as 0 in revenue calculations
   - Finalized month → appointments added retroactively? (decision: live query always; finalized record is the official snapshot used for the form)
   - Settings not yet configured → form shows placeholders, not errors

3. **Integration testing:**
   - Add appointment → current month widget updates
   - Edit fee on appointment → current month widget updates
   - Delete appointment → current month widget updates
   - Month finalization flow end-to-end

4. **User documentation (Vietnamese):**
   - Add a "Hướng dẫn: Tab Doanh thu & Thuế" section to the existing HUONG_DAN_SU_DUNG_CHI_TIET.md
   - Explain S1a-HKD form, how to print, TNCN rate configuration

5. **Code cleanup:**
   - Remove test/seed code
   - Final review of Vietnamese localization strings

**Success criteria:**
- All year-boundary scenarios produce correct numbers
- No null pointer errors from uninitialized settings
- Print and export produce clean, submission-ready output
- Vietnamese help documentation updated

---

## 5. Key Design Decisions

### Monthly Reset Mechanics (clarified)
The "reset to 0 on day 1" **does not delete data**. It means:
- The finalization job runs at midnight on the 1st of each month
- It snapshots the previous month's total into `monthly_revenue`
- The live monthly total for the current month starts from the first appointment dated in that month
- Both live and finalized totals are always calculable from `appointments` — the snapshot is for official record-keeping and form generation

### S1a-HKD Entry Granularity
The form allows entries "per transaction" or "per period" (theo từng nghiệp vụ phát sinh hoặc theo định kỳ). We will implement both modes:
- **Per-transaction (default):** Each appointment = one row. Cột B = "Dịch vụ nha khoa — [patient name]"
- **Daily summary (optional):** Group all same-day appointments. Cột B = "Dịch vụ nha khoa ngày DD/MM/YYYY"

### TNCN Rate
- Stored in `clinic_settings.tncn_rate`
- Default: 0.02 (2%) — typical for service-sector HKD
- **The owner must confirm the applicable rate with their local tax authority before use**
- The system displays a prominent disclaimer on the TNCN calculation

### No Server-side Scheduler Dependency
The finalization job uses Spring's `@Scheduled`. If the server is offline on the 1st, the manual `POST /api/revenue/finalize/{year}/{month}` endpoint allows recovery.

---

## 6. One Clarification Needed Before Starting

**Q: What should Cột B (Diễn giải) say on the S1a-HKD form?**

The law allows either per-transaction entries or periodic summaries. Two options:

- **Option A (detailed):** One row per appointment — "Dịch vụ nha khoa — Nguyễn Văn A" — better audit trail, longer form
- **Option B (periodic):** One row per day or one row for the whole month — "Doanh thu dịch vụ nha khoa tháng 04/2026" — cleaner form, simpler

Most small clinics use Option B. **Please confirm which you prefer before Session 3.**

---

## 7. Session Summary Table

| Session | Focus | Backend | Frontend | Estimated Time |
|---------|-------|---------|----------|----------------|
| 1 | DB schema + entities | ✅ | — | 1.5h |
| 2 | Revenue APIs + finalization job | ✅ | — | 2h |
| 3 | S1a-HKD data endpoint + TNCN | ✅ | — | 1.5h |
| 4 | Tab nav + Patient list | — | ✅ | 2h |
| 5 | Revenue view (S1a-HKD compliant) | — | ✅ | 2.5h |
| 6 | Clinic settings | ✅ | ✅ | 1h |
| 7 | Export & print | — | ✅ | 2h |
| 8 | Testing, edge cases, docs | ✅ | ✅ | 1.5h |
| **Total** | | | | **~14h** |

---

## 8. Files That Will Change

### Backend (new)
- `db/migration/V2__revenue_tables.sql`
- `model/ClinicSettings.java`
- `model/MonthlyRevenue.java`
- `repository/ClinicSettingsRepository.java`
- `repository/MonthlyRevenueRepository.java`
- `dto/ClinicSettingsDTO.java`
- `dto/MonthlyRevenueDTO.java`
- `dto/S1aHkdDTO.java`
- `dto/S1aHkdEntryDTO.java`
- `service/ClinicSettingsService.java`
- `service/RevenueService.java`
- `service/MonthlyFinalizationJob.java`
- `service/TNCNCalculationService.java`
- `controller/ClinicSettingsController.java`
- `controller/RevenueController.java`

### Frontend (new)
- `src/components/TabBar.jsx`
- `src/components/PatientTable.jsx`
- `src/components/RevenueTabView.jsx`
- `src/components/CurrentMonthWidget.jsx`
- `src/components/AnnualSummaryTable.jsx`
- `src/components/S1aHkdLedgerView.jsx`
- `src/components/ClinicSettingsForm.jsx`

### Frontend (modified)
- `src/App.jsx` — tab state, settings modal
- `src/services/api.js` — revenueAPI section
- `src/App.css` — tab styles, print styles, revenue view styles
- `src/locales/vi-VN.js` — new keys for revenue/tax/settings
- `HUONG_DAN_SU_DUNG_CHI_TIET.md` — new section on revenue tab

---

*Plan version 1.0 — ready to begin Session 1 pending Cột B clarification*
