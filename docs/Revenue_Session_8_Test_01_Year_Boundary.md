# Revenue Session 8 — Test 01: Year-Boundary Isolation

**Session:** Revenue Session 8 of 8  
**Test ID:** T01  
**Reference:** `REVENUE_TAX_SUBSYSTEM_MASTER_PLAN.md` §8 (Session 8, Task 1) · §14 (Test 1) · §10 (Edge Cases)  
**Status:** Ready to execute

---

## Purpose

Verify that year-end finalization and the year transition from December to January work
correctly with no data bleed between calendar years. Specifically:

- Appointments in December of year N are captured in the `monthly_revenue` snapshot for
  `year=N, month=12` only.
- The annual summary for year N+1 shows all months at 0 when January of N+1 has no
  appointments yet.
- After adding an appointment in January of N+1, only the N+1 live total reflects it —
  the December N snapshot remains unchanged.

---

## System Under Test

| Layer | Component / Endpoint |
|-------|----------------------|
| Backend endpoint | `POST /api/revenue/finalize/{year}/{month}` |
| Backend endpoint | `GET /api/revenue/monthly/{year}` |
| Backend endpoint | `GET /api/revenue/current-month` |
| Backend endpoint | `GET /api/revenue/annual/{year}` |
| Backend service | `RevenueService.finalizeMonth()` |
| Backend service | `RevenueService.getAllMonthsForYear()` |
| Backend job | `MonthlyFinalizationJob` (indirectly — this test exercises the same code path via the manual endpoint) |
| Frontend component | `AnnualSummaryTable` (year selector, lock icon, zero rows) |
| Frontend component | `CurrentMonthWidget` (live total) |
| Database table | `monthly_revenue` — `UNIQUE(year, month)` constraint |
| Database query | `AppointmentRepository.sumFeeByYearAndMonth` |

---

## Prerequisites

| # | Requirement |
|---|-------------|
| 1 | Backend running on `localhost:8080` |
| 2 | Frontend running on `localhost:5173` |
| 3 | PostgreSQL accessible (for direct DB verification steps) |
| 4 | Postman (or equivalent REST client) available |
| 5 | All Sessions 1–7 successfully completed |
| 6 | `monthly_revenue` table has **no** existing row for December of the chosen test year (`prevYear`) — either use a year with no prior finalization, or delete the row: `DELETE FROM monthly_revenue WHERE year = <prevYear> AND month = 12;` |
| 7 | Decide on a `prevYear` (e.g. `2025`) and `thisYear` (`2026`). Substitute these values for `<PREV>` and `<THIS>` throughout this document. |

---

## Methodology

**Approach:** Black-box manual testing via REST API (Postman) and direct database inspection
(psql or pgAdmin), cross-validated against the frontend `AnnualSummaryTable` UI.

**Tools:**
- Postman (HTTP requests with exact JSON verification)
- psql / pgAdmin (SQL verification queries)
- Browser DevTools — Console tab (watch for JavaScript errors during UI steps)
- Chrome Network tab (verify request/response payloads)

**Isolation:** This test deliberately uses a prior year so that running it does not
interfere with the current live month's data. All test appointments are dated in December
`<PREV>`, not in the current calendar month.

---

## Test Data

Three appointments will be created in December `<PREV>` with known, easily summed fees.

| Appointment | Date | Fee (VNĐ) |
|-------------|------|-----------|
| A1 | `<PREV>-12-05` | 500,000 |
| A2 | `<PREV>-12-15` | 1,200,000 |
| A3 | `<PREV>-12-28` | 800,000 |
| **Expected total** | | **2,500,000** |

Choose an existing patient ID from your database for these appointments
(`GET /api/patients` to list). Substitute `<PATIENT_ID>` below.

---

## Test Procedure

### Phase 1 — Baseline verification

**Step 1.1** — Confirm no December `<PREV>` finalization row exists.

```sql
SELECT * FROM monthly_revenue WHERE year = <PREV> AND month = 12;
-- Expected: 0 rows
```

**Step 1.2** — Confirm `GET /api/revenue/monthly/<PREV>` returns 12 elements all with
`totalRevenue: 0` (or that December is absent/unfinalized).

```
GET http://localhost:8080/api/revenue/monthly/<PREV>
```

Expected: HTTP 200. Array of 12 objects. Element at index 11 (December):
```json
{
  "year": <PREV>,
  "month": 12,
  "totalRevenue": 0,
  "appointmentCount": 0,
  "tncnAmount": 0,
  "finalized": false,
  "finalizedAt": null
}
```

---

### Phase 2 — Create test appointments in December `<PREV>`

**Step 2.1** — Create appointment A1.

```
POST http://localhost:8080/api/appointments
Content-Type: application/json

{
  "date": "<PREV>-12-05",
  "diagnosis": "Test T01 A1",
  "treatment": "Kiểm tra định kỳ",
  "fee": 500000,
  "patientId": <PATIENT_ID>
}
```

Note the returned `id` as `<A1_ID>`.

**Step 2.2** — Create appointment A2.

```
POST http://localhost:8080/api/appointments
Content-Type: application/json

{
  "date": "<PREV>-12-15",
  "diagnosis": "Test T01 A2",
  "treatment": "Trám răng",
  "fee": 1200000,
  "patientId": <PATIENT_ID>
}
```

Note the returned `id` as `<A2_ID>`.

**Step 2.3** — Create appointment A3.

```
POST http://localhost:8080/api/appointments
Content-Type: application/json

{
  "date": "<PREV>-12-28",
  "diagnosis": "Test T01 A3",
  "treatment": "Nhổ răng",
  "fee": 800000,
  "patientId": <PATIENT_ID>
}
```

Note the returned `id` as `<A3_ID>`.

**Step 2.4** — Verify the live sum before finalization.

```
GET http://localhost:8080/api/revenue/monthly/<PREV>
```

Element at index 11 should now show:
```json
{
  "year": <PREV>,
  "month": 12,
  "totalRevenue": 2500000,
  "appointmentCount": 3,
  "finalized": false
}
```

---

### Phase 3 — Finalize December `<PREV>`

**Step 3.1** — Call the finalize endpoint.

```
POST http://localhost:8080/api/revenue/finalize/<PREV>/12
```

Expected response HTTP 200:
```json
{
  "year": <PREV>,
  "month": 12,
  "totalRevenue": 2500000.00,
  "appointmentCount": 3,
  "tncnAmount": 50000.00,
  "finalized": true,
  "finalizedAt": "<timestamp>"
}
```

Record the exact `finalizedAt` value as `<FINALIZED_AT>`.

**Step 3.2** — Verify the database row directly.

```sql
SELECT year, month, total_revenue, appointment_count, tncn_amount, finalized, finalized_at
FROM monthly_revenue
WHERE year = <PREV> AND month = 12;
```

Expected:
```
 year | month | total_revenue | appointment_count | tncn_amount | finalized | finalized_at
------+-------+---------------+-------------------+-------------+-----------+--------------
 <PREV>|  12  |   2500000.00  |         3         |   50000.00  |   true    | <timestamp>
```

---

### Phase 4 — Verify year N summary shows December locked

**Step 4.1** — Fetch the full year `<PREV>` monthly breakdown.

```
GET http://localhost:8080/api/revenue/monthly/<PREV>
```

Expected: 12-element array. December element:
```json
{
  "year": <PREV>,
  "month": 12,
  "totalRevenue": 2500000.00,
  "appointmentCount": 3,
  "finalized": true,
  "finalizedAt": "<FINALIZED_AT>"
}
```

All other months: `finalized: false`, `totalRevenue: 0` (unless they have prior data).

**Step 4.2** — Open the browser at `http://localhost:5173`, navigate to
**Doanh thu & Thuế → Tổng theo năm**, and select year `<PREV>`.

Confirm:
- December row shows the 🔒 lock icon and the `finalized_at` date.
- No other months are affected by this test.

---

### Phase 5 — Verify year N+1 starts at 0

**Step 5.1** — Fetch year `<THIS>` monthly breakdown.

```
GET http://localhost:8080/api/revenue/monthly/<THIS>
```

Expected: All 12 elements have `totalRevenue: 0`, `appointmentCount: 0`, `finalized: false`
(except for any months in `<THIS>` that were previously finalized before this test).

**Step 5.2** — Fetch the current-month live total (assuming today is in `<THIS>`).

```
GET http://localhost:8080/api/revenue/current-month
```

Expected: The response reflects only appointments dated in the current calendar month of
`<THIS>` — none of the December `<PREV>` appointments appear.

**Step 5.3** — Verify the annual total for `<PREV>`.

```
GET http://localhost:8080/api/revenue/annual/<PREV>
```

Expected: `2500000` (or the sum of all finalized months in `<PREV>` if others exist).

**Step 5.4** — Verify the annual total for `<THIS>` does not include December `<PREV>` data.

```
GET http://localhost:8080/api/revenue/annual/<THIS>
```

Expected: The returned value does **not** include `2500000` from December `<PREV>`.

---

### Phase 6 — Add January `<THIS>` appointment; verify no cross-year bleed

**Step 6.1** — Create a January `<THIS>` appointment.

```
POST http://localhost:8080/api/appointments
Content-Type: application/json

{
  "date": "<THIS>-01-10",
  "diagnosis": "Test T01 Jan",
  "treatment": "Kiểm tra",
  "fee": 300000,
  "patientId": <PATIENT_ID>
}
```

**Step 6.2** — If today is in January `<THIS>`, call `GET /api/revenue/current-month`.
Expected: `totalRevenue` includes `300000` (and any other January appointments).

If today is later in `<THIS>`, call `GET /api/revenue/monthly/<THIS>` and verify January
(index 0) shows `totalRevenue` that includes `300000`, with `finalized: false`.

**Step 6.3** — Confirm December `<PREV>` snapshot is unchanged.

```
POST http://localhost:8080/api/revenue/finalize/<PREV>/12
```

Expected: HTTP 200. The response must be **identical** to the Step 3.1 response — same
`totalRevenue: 2500000`, same `finalizedAt: <FINALIZED_AT>`. The January appointment did
not alter the December snapshot.

---

### Phase 7 — Cleanup (optional)

If you want to restore the database to a clean state after the test:

```sql
DELETE FROM appointments WHERE diagnosis LIKE 'Test T01%';
DELETE FROM monthly_revenue WHERE year = <PREV> AND month = 12;
```

> **Note:** Only delete the `monthly_revenue` row if no official filing has been made
> for that period. In production, finalized rows should never be deleted.

---

## Expected Results Summary

| Step | Check | Expected value |
|------|-------|----------------|
| 1.1 | December `<PREV>` row in DB before test | 0 rows |
| 2.4 | Live monthly total before finalization | `totalRevenue: 2500000`, `finalized: false` |
| 3.1 | Finalize response | `totalRevenue: 2500000`, `tncnAmount: 50000`, `finalized: true` |
| 3.2 | DB row after finalization | Matches Step 3.1 values |
| 4.2 | UI — December row in `<PREV>` year | Lock icon visible, date shown |
| 5.1 | `monthly/<THIS>` | All months `totalRevenue: 0` (no bleed from `<PREV>`) |
| 5.4 | `annual/<THIS>` | Does not contain December `<PREV>` amounts |
| 6.3 | Second finalize call | Identical to Step 3.1 response; `finalizedAt` unchanged |

> **TNCN calculation:** `2,500,000 × 0.02 = 50,000`. Adjust if the clinic's `tncn_rate`
> has been changed from the default `0.0200`.

---

## Failure Indicators

| Symptom | Probable cause |
|---------|----------------|
| `annual/<THIS>` includes December `<PREV>` amounts | `getAllMonthsForYear` does not filter by year, or JPQL year filter is broken |
| `current-month` includes December `<PREV>` appointments | `YEAR(a.date) = YEAR(NOW())` filter not applied; appointments queried without year boundary |
| `finalizedAt` changes on second finalize call (Step 6.3) | `finalizeMonth()` is not checking for an existing finalized row before overwriting |
| HTTP 500 on finalize endpoint | JPQL query error, missing `@Transactional`, or `UNIQUE` constraint violation from non-idempotent insert |
| `tncnAmount: 0` even though `totalRevenue > 0` | `clinic_settings.tncn_rate` is `0`; verify settings with `GET /api/settings` |
| UI shows wrong year in lock icon date | `finalizedAt` timezone offset issue between JVM and browser |
| January appointment appears in December `<PREV>` S1a-HKD | `MONTH(a.date)` filter not applied to the JPQL join query in `getS1aHkdData()` |
