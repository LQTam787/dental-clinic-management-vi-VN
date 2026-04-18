# Revenue Session 8 — Test 03: Empty Month Finalization

**Session:** Revenue Session 8 of 8  
**Test ID:** T03  
**Reference:** `REVENUE_TAX_SUBSYSTEM_MASTER_PLAN.md` §8 (Session 8, Task 3) · §14 (Test 3) · §10 (Edge Cases: "Month with zero appointments")  
**Status:** Ready to execute

---

## Purpose

Verify that a calendar month with zero appointments can be finalized cleanly and produces
a valid `monthly_revenue` snapshot row with all numeric fields correctly set to `0` rather
than `null`, and that the system does not throw exceptions or behave unexpectedly when
aggregating over an empty result set.

Key assertions:
- `POST /api/revenue/finalize/{year}/{month}` succeeds on a month with no appointments.
- The resulting `monthly_revenue` row has `total_revenue = 0`, `appointment_count = 0`,
  `tncn_amount = 0`, and `finalized = true`.
- `GET /api/revenue/s1a-hkd/{year}/{month}` returns an empty `entries` array (not null),
  a `totalRevenue` of `0`, and renders the form header correctly.
- `GET /api/revenue/monthly/{year}` returns a zero-value, finalized DTO for that month.
- The frontend renders the empty ledger and the annual summary without errors.

---

## System Under Test

| Layer | Component / Endpoint |
|-------|----------------------|
| Backend endpoint | `POST /api/revenue/finalize/{year}/{month}` |
| Backend endpoint | `GET /api/revenue/monthly/{year}` |
| Backend endpoint | `GET /api/revenue/s1a-hkd/{year}/{month}` |
| Backend service | `RevenueService.finalizeMonth()` — `COALESCE(SUM(...), 0)` on empty set |
| Backend service | `RevenueService.getS1aHkdData()` — `entries` list can be empty |
| Backend query | `AppointmentRepository.sumFeeByYearAndMonth` — must return `0`, not `null` |
| Backend query | `AppointmentRepository.countByYearAndMonth` — must return `0` |
| Backend query | `AppointmentRepository.findAppointmentsWithPatientsByYearAndMonth` — returns empty list |
| Frontend component | `AnnualSummaryTable` — zero-value finalized row |
| Frontend component | `S1aHkdLedgerView` — renders header + empty table body + `Tổng cộng: 0` |

---

## Prerequisites

| # | Requirement |
|---|-------------|
| 1 | Backend running on `localhost:8080` |
| 2 | Frontend running on `localhost:5173` |
| 3 | PostgreSQL accessible |
| 4 | Postman available |
| 5 | All Sessions 1–7 complete |
| 6 | Identify a specific past month that has **no appointments** in the database. Use a year/month combination such as `2025/02` that you are confident is empty. Substitute `<EMPTY_YEAR>` and `<EMPTY_MONTH>` throughout. |
| 7 | Confirm the chosen month is empty: |

```sql
SELECT COUNT(*) FROM appointments
WHERE EXTRACT(YEAR FROM date) = <EMPTY_YEAR>
  AND EXTRACT(MONTH FROM date) = <EMPTY_MONTH>;
-- Expected: count = 0
```

| 8 | Confirm no `monthly_revenue` row exists yet for this period: |

```sql
SELECT * FROM monthly_revenue
WHERE year = <EMPTY_YEAR> AND month = <EMPTY_MONTH>;
-- Expected: 0 rows
```

---

## Methodology

**Approach:** REST API testing (Postman) combined with direct database inspection and
frontend UI verification. The test does not create any appointment data — it relies on
an intentionally empty month.

**Tools:**
- Postman (HTTP calls, JSON response inspection)
- psql / pgAdmin (SQL verification before and after finalization)
- Browser DevTools — Console tab (watch for JavaScript errors)
- Browser DevTools — Network tab (inspect response for empty entries array shape)

---

## Test Procedure

### Phase 1 — Confirm empty month via API

**Step 1.1** — Fetch the monthly breakdown for `<EMPTY_YEAR>` and verify the target month
shows zero revenue before finalization.

```
GET http://localhost:8080/api/revenue/monthly/<EMPTY_YEAR>
```

Find the array element where `"month": <EMPTY_MONTH>`. Expected:
```json
{
  "year": <EMPTY_YEAR>,
  "month": <EMPTY_MONTH>,
  "totalRevenue": 0,
  "appointmentCount": 0,
  "tncnAmount": 0,
  "finalized": false,
  "finalizedAt": null
}
```

**Step 1.2** — Fetch the S1a-HKD data for the empty period before finalization.

```
GET http://localhost:8080/api/revenue/s1a-hkd/<EMPTY_YEAR>/<EMPTY_MONTH>
```

Expected: HTTP 200. The `entries` field must be an empty array (`[]`), not `null`. All
header fields are populated from `clinic_settings`. `totalRevenue` and `tncnAmount` are
`0`.

```json
{
  "businessName": "...",
  "entries": [],
  "totalRevenue": 0,
  "tncnAmount": 0,
  "signatureDate": "..."
}
```

---

### Phase 2 — Finalize the empty month

**Step 2.1** — Call the finalize endpoint.

```
POST http://localhost:8080/api/revenue/finalize/<EMPTY_YEAR>/<EMPTY_MONTH>
```

Expected: HTTP 200. Response body:
```json
{
  "year": <EMPTY_YEAR>,
  "month": <EMPTY_MONTH>,
  "totalRevenue": 0,
  "appointmentCount": 0,
  "tncnAmount": 0,
  "finalized": true,
  "finalizedAt": "<ISO_TIMESTAMP>"
}
```

Confirm:
- HTTP status is `200`, not `400`, `500`, or any error.
- `totalRevenue` is the number `0`, not `null`.
- `appointmentCount` is the number `0`, not `null`.
- `tncnAmount` is the number `0`, not `null`.
- `finalized` is `true`.
- `finalizedAt` is a valid ISO 8601 timestamp.

Record `finalizedAt` as `<EMPTY_FINALIZED_AT>`.

---

### Phase 3 — Verify database row

**Step 3.1** — Query the row directly.

```sql
SELECT year, month, total_revenue, appointment_count, tncn_amount,
       finalized, finalized_at, notes
FROM monthly_revenue
WHERE year = <EMPTY_YEAR> AND month = <EMPTY_MONTH>;
```

Expected:
```
 year | month | total_revenue | appointment_count | tncn_amount | finalized | finalized_at
------+-------+---------------+-------------------+-------------+-----------+--------------
 <EMPTY_YEAR> | <EMPTY_MONTH> | 0.00 | 0 | 0.00 | true | <timestamp>
```

Confirm no NULL values in numeric columns (`total_revenue`, `appointment_count`,
`tncn_amount`). The `NUMERIC` columns must store `0.00`, not `NULL`.

**Step 3.2** — Confirm only one row was created (no duplicate from the finalization logic).

```sql
SELECT COUNT(*) FROM monthly_revenue
WHERE year = <EMPTY_YEAR> AND month = <EMPTY_MONTH>;
-- Expected: 1
```

---

### Phase 4 — Verify the monthly API reflects the finalized zero row

**Step 4.1** — Re-fetch the yearly breakdown.

```
GET http://localhost:8080/api/revenue/monthly/<EMPTY_YEAR>
```

Find the element for `<EMPTY_MONTH>`. Expected:
```json
{
  "year": <EMPTY_YEAR>,
  "month": <EMPTY_MONTH>,
  "totalRevenue": 0,
  "appointmentCount": 0,
  "tncnAmount": 0,
  "finalized": true,
  "finalizedAt": "<EMPTY_FINALIZED_AT>"
}
```

**Step 4.2** — Fetch the S1a-HKD data again after finalization.

```
GET http://localhost:8080/api/revenue/s1a-hkd/<EMPTY_YEAR>/<EMPTY_MONTH>
```

Expected: Same shape as Step 1.2 — empty `entries` array, `totalRevenue: 0`,
`tncnAmount: 0`. The form must still render without error even though there are no data
rows.

**Step 4.3** — Fetch the annual total.

```
GET http://localhost:8080/api/revenue/annual/<EMPTY_YEAR>
```

Expected: The finalized zero-value month does not inflate the annual total. If no other
months have revenue in `<EMPTY_YEAR>`, the response is `0`.

---

### Phase 5 — Frontend verification

**Step 5.1** — Open browser DevTools Console. Clear all messages.

**Step 5.2** — Navigate to `http://localhost:5173` → **Doanh thu & Thuế** →
**Tổng theo năm**. Select `<EMPTY_YEAR>`.

Expected:
- The row for `<EMPTY_MONTH>` shows the 🔒 lock icon and `<EMPTY_FINALIZED_AT>` date.
- The `Doanh thu` cell for that month shows `0 VNĐ` (or equivalent formatted zero).
- The `TNCN ước tính` cell shows `0 VNĐ`.
- No JavaScript errors in Console.

**Step 5.3** — Navigate to **Sổ S1a-HKD**. Select `<EMPTY_YEAR>` and `<EMPTY_MONTH>`.

Expected:
- The form header renders correctly using `clinic_settings` values.
- The table body has **no data rows** (empty tbody, or a "Không có dữ liệu" placeholder
  if implemented).
- The `Tổng cộng` row shows `0`.
- The signature block renders normally.
- No JavaScript errors in Console.

**Step 5.4** — Click the **In sổ** (Print) button. Inspect the print preview.

Expected:
- A valid print preview opens (no blank page error).
- The form header, empty table, and Tổng cộng row are all visible.
- The TNCN disclaimer badge is not visible in print preview.

---

### Phase 6 — Cleanup

```sql
DELETE FROM monthly_revenue
WHERE year = <EMPTY_YEAR> AND month = <EMPTY_MONTH>;
```

---

## Expected Results Summary

| Step | Check | Expected value |
|------|-------|----------------|
| 1.1 | Pre-finalization monthly API | `totalRevenue: 0`, `finalized: false` |
| 1.2 | Pre-finalization S1a-HKD | `entries: []`, `totalRevenue: 0` (no null) |
| 2.1 | Finalize HTTP status | `200 OK` |
| 2.1 | Finalize response fields | `totalRevenue: 0`, `appointmentCount: 0`, `tncnAmount: 0`, `finalized: true` |
| 3.1 | DB row numeric fields | `0.00` (not NULL) |
| 3.2 | DB row count | Exactly 1 row |
| 4.1 | Post-finalization monthly API | `finalized: true`, `finalizedAt` populated |
| 4.2 | Post-finalization S1a-HKD | Same shape, `entries: []` |
| 5.2 | UI annual table | Lock icon shown for that month, revenue = 0 |
| 5.3 | UI ledger | Empty table body renders without errors |

---

## Failure Indicators

| Symptom | Probable cause |
|---------|----------------|
| HTTP 500 on `POST /finalize` for empty month | `COALESCE` missing from `SUM(fee)` query — `SUM` on empty set returns `NULL`, and `NULL.setScale()` throws NPE; fix: `COALESCE(SUM(COALESCE(a.fee,0)), 0)` |
| `totalRevenue: null` in finalize response | Same as above — `BigDecimal` returned as `null` from JPQL query, not coerced to `0` |
| `entries: null` in S1a-HKD response (instead of `[]`) | `getS1aHkdData()` returns `null` instead of `Collections.emptyList()` when the JPQL query finds no rows |
| Frontend crashes on empty `entries` | JavaScript tries `entries.map(...)` where `entries` is `null`; add `(data.entries ?? []).map(...)` |
| `Tổng cộng` row displays `NaN` | Frontend sums a `null` entries array rather than an empty one |
| No row in DB after finalization | Service is returning early (idempotent check fires incorrectly); check `findByYearAndMonth` logic |
| `appointmentCount: null` | COUNT query returns null on empty set; fix: ensure the JPQL `COUNT` query is wrapped with COALESCE or casts properly |
