# Revenue Session 8 — Test 07: Manual Finalization Recovery Path

**Session:** Revenue Session 8 of 8  
**Test ID:** T07  
**Reference:** `REVENUE_TAX_SUBSYSTEM_MASTER_PLAN.md` §8 (Session 8, Task 7) · §3 (`MonthlyFinalizationJob`) · §7 (Design: "Manual finalize endpoint") · §10 (Edge Cases: "Server offline on 1st of month")  
**Status:** Ready to execute

---

## Purpose

Verify the manual recovery path for months where `MonthlyFinalizationJob` did not run
automatically (e.g. the server was offline on the 1st of the month). The test simulates
the scheduler never having fired for a specific past month and confirms that:

- The `POST /api/revenue/finalize/{year}/{month}` endpoint produces the correct snapshot
  when called manually, identical to what the scheduled job would have produced.
- The UI displays a "Chưa chốt sổ" (not yet finalized) warning for past months that
  should have been finalized but haven't been.
- After manual finalization, the warning disappears and the lock icon appears.
- The scheduler job code path (`MonthlyFinalizationJob.finalizeLastMonth()`) and the
  manual endpoint code path both delegate to the same `RevenueService.finalizeMonth()`
  method — so a successful manual call proves the scheduled job would also have
  succeeded.

---

## System Under Test

| Layer | Component / Endpoint |
|-------|----------------------|
| Backend endpoint | `POST /api/revenue/finalize/{year}/{month}` — the manual recovery path |
| Backend service | `RevenueService.finalizeMonth()` — shared logic for both scheduled and manual paths |
| Backend job | `MonthlyFinalizationJob` — deliberately not invoked; this test verifies the manual alternative |
| Backend endpoint | `GET /api/revenue/monthly/{year}` — used to detect unfinalized past months |
| Database | `monthly_revenue` — row created by manual call |
| Frontend component | `AnnualSummaryTable` — "Chưa chốt sổ" badge and manual finalize button |

---

## Prerequisites

| # | Requirement |
|---|-------------|
| 1 | Backend running on `localhost:8080` |
| 2 | Frontend running on `localhost:5173` |
| 3 | PostgreSQL accessible |
| 4 | Postman available |
| 5 | All Sessions 1–7 complete |
| 6 | Choose a past calendar month that: (a) has at least one appointment, and (b) does **not** yet have a `monthly_revenue` row. This simulates the scheduler having missed that month. Use the earliest unfinalized past month you can find. Substitute `<MISS_YEAR>` and `<MISS_MONTH>` throughout. |
| 7 | Verify both conditions: |

```sql
-- Condition a: appointments exist
SELECT COUNT(*), SUM(COALESCE(fee, 0)) AS expected_total
FROM appointments
WHERE EXTRACT(YEAR FROM date) = <MISS_YEAR>
  AND EXTRACT(MONTH FROM date) = <MISS_MONTH>;
-- Expected: count >= 1

-- Condition b: no snapshot row
SELECT * FROM monthly_revenue
WHERE year = <MISS_YEAR> AND month = <MISS_MONTH>;
-- Expected: 0 rows
```

Record `expected_total` from condition (a) as `<EXPECTED_TOTAL>`.

| 8 | Confirm the `clinic_settings` `tncn_rate`. Record as `<TNCN_RATE>`. |

```
GET http://localhost:8080/api/settings
```

---

## Methodology

**Approach:** This test does **not** restart the server or manipulate the scheduler.
Instead, it verifies the manual endpoint as a standalone recovery path. The test
verifies the full chain from API call through to database row, and cross-validates via
the frontend UI.

The scheduler (`MonthlyFinalizationJob`) is treated as a black box — we trust it calls
`revenueService.finalizeMonth()` at the correct time based on the `@Scheduled` cron.
Since the manual endpoint calls the same service method, a verified manual call
constitutes indirect proof that the scheduled job would also produce a correct result.

**Tools:**
- Postman (HTTP calls)
- psql / pgAdmin (SQL verification)
- Browser DevTools — Console tab

---

## Test Procedure

### Phase 1 — Confirm the "missed" month is visible as unfinalized in the UI

**Step 1.1** — Fetch the yearly breakdown to confirm the unfinalized past month is
returned with `finalized: false`.

```
GET http://localhost:8080/api/revenue/monthly/<MISS_YEAR>
```

Find the element where `"month": <MISS_MONTH>`. Expected:
```json
{
  "year": <MISS_YEAR>,
  "month": <MISS_MONTH>,
  "totalRevenue": <EXPECTED_TOTAL>,
  "appointmentCount": <some positive integer>,
  "finalized": false,
  "finalizedAt": null
}
```

**Step 1.2** — Open the browser at `http://localhost:5173` → **Doanh thu & Thuế** →
**Tổng theo năm**. Select `<MISS_YEAR>`.

Expected:
- The row for `<MISS_MONTH>` does **not** show the 🔒 lock icon.
- A "Chưa chốt sổ" warning badge or the manual **Chốt sổ** button is visible for that
  row (per the design specification in the master plan, past unfinalized months show
  a warning badge and a manual finalize button).
- No JavaScript errors in Console.

---

### Phase 2 — Compute expected values manually (for verification)

Before calling the recovery endpoint, compute what the correct snapshot should contain.

**Step 2.1** — Calculate expected TNCN.

```
<EXPECTED_TNCN> = <EXPECTED_TOTAL> × <TNCN_RATE>
```

For example: `1,500,000 × 0.0200 = 30,000`.

**Step 2.2** — Get the expected appointment count.

```sql
SELECT COUNT(*) FROM appointments
WHERE EXTRACT(YEAR FROM date) = <MISS_YEAR>
  AND EXTRACT(MONTH FROM date) = <MISS_MONTH>;
```

Record as `<EXPECTED_COUNT>`.

---

### Phase 3 — Execute the manual recovery

**Step 3.1** — Call the manual finalize endpoint.

```
POST http://localhost:8080/api/revenue/finalize/<MISS_YEAR>/<MISS_MONTH>
```

Expected: HTTP 200. Response:
```json
{
  "year": <MISS_YEAR>,
  "month": <MISS_MONTH>,
  "totalRevenue": <EXPECTED_TOTAL>,
  "appointmentCount": <EXPECTED_COUNT>,
  "tncnAmount": <EXPECTED_TNCN>,
  "finalized": true,
  "finalizedAt": "<ISO_TIMESTAMP>"
}
```

Verify each field:
- `totalRevenue` matches `<EXPECTED_TOTAL>` (computed independently in Step 2.1).
- `appointmentCount` matches `<EXPECTED_COUNT>` (from Step 2.2).
- `tncnAmount` matches `<EXPECTED_TNCN>` (from Step 2.1).
- `finalized` is `true`.
- `finalizedAt` is a valid ISO 8601 timestamp set to approximately now.

Record `finalizedAt` as `<RECOVERY_FINALIZED_AT>`.

---

### Phase 4 — Verify the database row

**Step 4.1** — Query the created row.

```sql
SELECT year, month, total_revenue, appointment_count, tncn_amount,
       finalized, finalized_at
FROM monthly_revenue
WHERE year = <MISS_YEAR> AND month = <MISS_MONTH>;
```

Expected:
```
 year | month | total_revenue | appointment_count | tncn_amount | finalized | finalized_at
------+-------+---------------+-------------------+-------------+-----------+--------------
 <MISS_YEAR> | <MISS_MONTH> | <EXPECTED_TOTAL> | <EXPECTED_COUNT> | <EXPECTED_TNCN> | true | <timestamp>
```

**Step 4.2** — Confirm only one row exists.

```sql
SELECT COUNT(*) FROM monthly_revenue
WHERE year = <MISS_YEAR> AND month = <MISS_MONTH>;
-- Expected: 1
```

**Step 4.3** — Confirm the `UNIQUE(year, month)` constraint is in effect by trying a
direct SQL insert that would duplicate the row.

```sql
-- This should fail with a UNIQUE constraint violation:
INSERT INTO monthly_revenue (year, month, total_revenue, appointment_count,
    tncn_amount, finalized, finalized_at, created_at, updated_at)
VALUES (<MISS_YEAR>, <MISS_MONTH>, 0, 0, 0, false, NULL, NOW(), NOW());
-- Expected: ERROR: duplicate key value violates unique constraint "uq_year_month"
```

Run this in psql/pgAdmin and confirm the error. Then roll back or confirm the INSERT
failed — do not leave a duplicate row. This confirms the DB-level guard is active.

---

### Phase 5 — Verify the monthly API reflects the recovery

**Step 5.1** — Re-fetch the yearly breakdown.

```
GET http://localhost:8080/api/revenue/monthly/<MISS_YEAR>
```

Find the element for `<MISS_MONTH>`. Expected: `finalized: true`,
`finalizedAt: "<RECOVERY_FINALIZED_AT>"`.

**Step 5.2** — Fetch the S1a-HKD data for the recovered period.

```
GET http://localhost:8080/api/revenue/s1a-hkd/<MISS_YEAR>/<MISS_MONTH>
```

Expected: HTTP 200. `entries` contains all appointments for the period. `totalRevenue`
matches `<EXPECTED_TOTAL>`. The form header is populated from current `clinic_settings`.

---

### Phase 6 — Frontend: warning disappears, lock icon appears

**Step 6.1** — Reload the **Tổng theo năm** view in the browser (or navigate away and
back).

**Step 6.2** — Select `<MISS_YEAR>`.

Expected:
- The row for `<MISS_MONTH>` now shows the 🔒 lock icon.
- The "Chưa chốt sổ" badge and/or the manual **Chốt sổ** button are no longer visible
  for this row.
- The `Doanh thu` column for `<MISS_MONTH>` shows `<EXPECTED_TOTAL>`.
- No JavaScript errors in Console.

---

### Phase 7 — Simulate scheduler behavior (documentation check)

This step is observational and does not change any data.

**Step 7.1** — Review `MonthlyFinalizationJob.java`. Confirm:
- It calls `LocalDate.now().minusMonths(1)` to compute the previous month.
- It calls `revenueService.finalizeMonth(year, month)` — the **same** method called by
  the manual endpoint.
- It logs success with revenue, TNCN, and appointment count.
- It catches exceptions and logs errors without crashing.

**Step 7.2** — Confirm `@EnableScheduling` is present on `DentalClinicApplication.java`.

```
GET http://localhost:8080/actuator/scheduledtasks
```

(If Spring Actuator is enabled.) Alternatively, inspect the source file directly. Look
for:
```java
@Scheduled(cron = "0 0 0 1 * *")
public void finalizeLastMonth() { ... }
```

This verifies the scheduler is wired. Since both scheduler and manual endpoint share
`RevenueService.finalizeMonth()`, the manual test in Phase 3 proves the scheduler
logic is correct.

---

### Phase 8 — Cleanup

```sql
DELETE FROM monthly_revenue
WHERE year = <MISS_YEAR> AND month = <MISS_MONTH>;
```

---

## Expected Results Summary

| Step | Check | Expected |
|------|-------|----------|
| 1.1 | Pre-recovery monthly API | `finalized: false`, `finalizedAt: null` |
| 1.2 | UI — unfinalized past month | "Chưa chốt sổ" badge visible, no lock icon |
| 3.1 | Manual finalize HTTP status | `200 OK` |
| 3.1 | `totalRevenue` in response | Matches SQL SUM independently computed |
| 3.1 | `tncnAmount` in response | `totalRevenue × tncn_rate`, rounded to 2 dp |
| 3.1 | `finalized` | `true` |
| 4.2 | DB row count | Exactly 1 |
| 4.3 | Direct SQL duplicate INSERT | Fails with UNIQUE constraint error |
| 5.1 | Post-recovery monthly API | `finalized: true`, `finalizedAt` populated |
| 6.2 | UI after recovery | Lock icon visible, warning/button gone |

---

## Failure Indicators

| Symptom | Probable cause |
|---------|----------------|
| HTTP 500 on manual finalize | `RevenueService.finalizeMonth()` has an unhandled exception path; check backend logs for stack trace; common causes: null JPQL result, missing `COALESCE`, `BigDecimal` null multiplication |
| `totalRevenue` in response does not match SQL SUM | JPQL query is using incorrect year/month parameters, or the `YEAR()`/`MONTH()` JPQL functions behave unexpectedly on the PostgreSQL dialect; try adding `spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect` |
| "Chưa chốt sổ" badge not visible in UI | `AnnualSummaryTable` does not check whether a past month (i.e. before current month) is unfinalized; the badge condition should be: `month < currentMonth OR year < currentYear` AND `finalized === false` |
| Lock icon does not appear after recovery | UI is not refetching data after the manual finalize button is clicked; the click handler must re-call `GET /api/revenue/monthly/{year}` and update state |
| `@EnableScheduling` missing | `MonthlyFinalizationJob` cron never fires; the scheduler is registered but silently inactive; add `@EnableScheduling` to `DentalClinicApplication.java` |
| Scheduler fires but does not finalize | Cron expression `"0 0 0 1 * *"` may be parsed as "every minute of hour 0 on day 1" vs. "at 00:00:00 on day 1"; verify using an online cron parser — `0 0 0 1 * *` means second=0, minute=0, hour=0, day-of-month=1, every month, every day-of-week |
| `tncnAmount` is `0` even though `totalRevenue > 0` | `clinic_settings.tncn_rate` is `0` at the time of finalization; verify with `GET /api/settings` and update if needed before re-testing |
| Manual endpoint returns `400 Bad Request` for a past month | Endpoint validation incorrectly rejects past month/year values; remove any such forward-only validation — manual recovery must accept any valid year/month combination |
