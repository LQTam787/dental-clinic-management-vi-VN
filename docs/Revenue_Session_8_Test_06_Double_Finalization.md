# Revenue Session 8 — Test 06: Double-Finalization Idempotency

**Session:** Revenue Session 8 of 8  
**Test ID:** T06  
**Reference:** `REVENUE_TAX_SUBSYSTEM_MASTER_PLAN.md` §8 (Session 8, Task 6) · §14 (Test 6) · §7 (Design: "Finalization is idempotent") · §10 (Edge Cases: "finalizeMonth called twice")  
**Status:** Ready to execute

---

## Purpose

Verify that calling `POST /api/revenue/finalize/{year}/{month}` a second time on an
already-finalized period is fully idempotent: it returns the same response (including
the same `finalizedAt` timestamp), does not create a duplicate row in `monthly_revenue`,
and does not modify any field of the existing row.

This property is critical for safe operation: the `MonthlyFinalizationJob` scheduler
may theoretically fire more than once (e.g. after a server restart with a delayed job),
and the manual recovery endpoint must be safe to call multiple times.

Key assertions:
- Both calls return HTTP 200.
- Both responses are identical in all fields, including `finalizedAt`.
- The database contains exactly **one** row for the period after both calls.
- No `DataIntegrityViolationException` or `UNIQUE constraint violation` reaches the
  caller — the service layer absorbs the duplicate gracefully.

---

## System Under Test

| Layer | Component / Endpoint |
|-------|----------------------|
| Backend endpoint | `POST /api/revenue/finalize/{year}/{month}` — called twice |
| Backend service | `RevenueService.finalizeMonth()` — idempotent guard logic |
| Database | `monthly_revenue` `UNIQUE(year, month)` constraint |
| Frontend component | `AnnualSummaryTable` — finalize button behavior (should not remain clickable after first finalization) |

---

## Prerequisites

| # | Requirement |
|---|-------------|
| 1 | Backend running on `localhost:8080` |
| 2 | Postman available |
| 3 | PostgreSQL accessible |
| 4 | All Sessions 1–7 complete |
| 5 | Choose a past month (`<DUP_YEAR>/<DUP_MONTH>`) with at least one appointment. |
| 6 | Verify there is no existing `monthly_revenue` row for this period yet: |

```sql
SELECT * FROM monthly_revenue
WHERE year = <DUP_YEAR> AND month = <DUP_MONTH>;
-- Expected: 0 rows
```

| 7 | Confirm appointments exist: |

```sql
SELECT COUNT(*) FROM appointments
WHERE EXTRACT(YEAR FROM date) = <DUP_YEAR>
  AND EXTRACT(MONTH FROM date) = <DUP_MONTH>;
-- Expected: >= 1
```

---

## Methodology

**Approach:** Purely API-level testing. The core test is making two identical POST calls
and comparing their responses. Database inspection confirms the absence of duplicate rows.

**Tools:**
- Postman (two sequential calls with response comparison; use Postman's "Tests" tab or
  manually compare JSON)
- psql / pgAdmin (row count and value verification)
- Optional: Browser DevTools to verify UI state after both calls

---

## Test Procedure

### Phase 1 — First finalization call

**Step 1.1** — Record the exact time before the first call (for `finalizedAt` context).

**Step 1.2** — Call the finalize endpoint for the first time.

```
POST http://localhost:8080/api/revenue/finalize/<DUP_YEAR>/<DUP_MONTH>
```

Expected: HTTP 200. Record the **complete response body** as `<RESPONSE_1>`:
```json
{
  "year": <DUP_YEAR>,
  "month": <DUP_MONTH>,
  "totalRevenue": <TOTAL>,
  "appointmentCount": <COUNT>,
  "tncnAmount": <TNCN>,
  "finalized": true,
  "finalizedAt": "<TIMESTAMP_1>"
}
```

Record every field value, especially:
- `totalRevenue` → `<R1_TOTAL>`
- `appointmentCount` → `<R1_COUNT>`
- `tncnAmount` → `<R1_TNCN>`
- `finalizedAt` → `<R1_FINALIZED_AT>` (exact string, including milliseconds if present)
- `finalized` → `true`

---

### Phase 2 — Verify database state after first call

**Step 2.1** — Query the row in the database.

```sql
SELECT id, year, month, total_revenue, appointment_count, tncn_amount,
       finalized, finalized_at, created_at, updated_at
FROM monthly_revenue
WHERE year = <DUP_YEAR> AND month = <DUP_MONTH>;
```

Record:
- The row `id` → `<ROW_ID>`
- `finalized_at` → confirm it matches `<R1_FINALIZED_AT>` (accounting for timezone display)

**Step 2.2** — Count rows to confirm uniqueness.

```sql
SELECT COUNT(*) FROM monthly_revenue
WHERE year = <DUP_YEAR> AND month = <DUP_MONTH>;
-- Expected: 1
```

---

### Phase 3 — Second finalization call (the idempotency test)

**Step 3.1** — Wait at least 2 seconds to ensure any new timestamp would differ from
`<R1_FINALIZED_AT>` if the service were incorrectly updating the row.

**Step 3.2** — Call the exact same finalize endpoint again.

```
POST http://localhost:8080/api/revenue/finalize/<DUP_YEAR>/<DUP_MONTH>
```

Expected: HTTP 200. Record the complete response body as `<RESPONSE_2>`.

---

### Phase 4 — Compare both responses

**Step 4.1** — Field-by-field comparison between `<RESPONSE_1>` and `<RESPONSE_2>`.

| Field | `<RESPONSE_1>` | `<RESPONSE_2>` | Must match? |
|-------|----------------|----------------|-------------|
| `year` | `<DUP_YEAR>` | `<DUP_YEAR>` | Yes |
| `month` | `<DUP_MONTH>` | `<DUP_MONTH>` | Yes |
| `totalRevenue` | `<R1_TOTAL>` | must equal `<R1_TOTAL>` | Yes |
| `appointmentCount` | `<R1_COUNT>` | must equal `<R1_COUNT>` | Yes |
| `tncnAmount` | `<R1_TNCN>` | must equal `<R1_TNCN>` | Yes |
| `finalized` | `true` | `true` | Yes |
| `finalizedAt` | `<R1_FINALIZED_AT>` | must equal `<R1_FINALIZED_AT>` | **Yes — critical** |

The `finalizedAt` timestamp is the key indicator of idempotency. If the second call
returns a **different** `finalizedAt`, the service is overwriting the row instead of
returning the existing one.

**Step 4.2** — Verify no new row was created.

```sql
SELECT COUNT(*) FROM monthly_revenue
WHERE year = <DUP_YEAR> AND month = <DUP_MONTH>;
-- Expected: 1 (same count as after the first call)
```

**Step 4.3** — Verify the row ID has not changed.

```sql
SELECT id FROM monthly_revenue
WHERE year = <DUP_YEAR> AND month = <DUP_MONTH>;
-- Expected: <ROW_ID> (same as recorded in Step 2.1)
```

**Step 4.4** — Verify `finalized_at` in the DB is unchanged.

```sql
SELECT finalized_at FROM monthly_revenue
WHERE year = <DUP_YEAR> AND month = <DUP_MONTH>;
-- Expected: matches <R1_FINALIZED_AT>
```

---

### Phase 5 — Third call (stress check)

**Step 5.1** — Call the endpoint a third time to confirm the idempotency holds under
repeated invocations.

```
POST http://localhost:8080/api/revenue/finalize/<DUP_YEAR>/<DUP_MONTH>
```

Expected: HTTP 200. Response must be identical to `<RESPONSE_1>` in all fields. Row
count in DB still `1`.

---

### Phase 6 — Backend log inspection

**Step 6.1** — Review the Spring Boot application log after all three calls.

Expected:
- The first call should produce a log line such as:
  `Finalized month <DUP_MONTH>/<DUP_YEAR>: revenue=<R1_TOTAL>, ...`
- The second and third calls should produce either:
  - No new log line (service returned early), **or**
  - A log line indicating the period was already finalized (e.g. `Already finalized: ...`)
- No `DataIntegrityViolationException` or `UNIQUE constraint violation` stack trace.
- No `ERROR` level entries related to the finalize endpoint.

---

### Phase 7 — Frontend verification (optional)

**Step 7.1** — Open the browser at `http://localhost:5173` → **Doanh thu & Thuế** →
**Tổng theo năm**. Select `<DUP_YEAR>`.

Expected:
- The row for `<DUP_MONTH>` shows the 🔒 lock icon.
- The **Chốt sổ** (finalize) button for that row is either hidden or disabled — it
  should not be possible to trigger another finalization from the UI once the month is
  locked.
- Clicking a disabled finalize button (if present) produces no error.

---

### Phase 8 — Cleanup

```sql
DELETE FROM monthly_revenue
WHERE year = <DUP_YEAR> AND month = <DUP_MONTH>;
```

---

## Expected Results Summary

| Step | Check | Expected |
|------|-------|----------|
| 1.2 | First call HTTP status | `200 OK` |
| 3.2 | Second call HTTP status | `200 OK` |
| 4.1 | `finalizedAt` comparison | `<RESPONSE_2>.finalizedAt` equals `<RESPONSE_1>.finalizedAt` |
| 4.1 | All other fields comparison | `<RESPONSE_2>` is field-for-field identical to `<RESPONSE_1>` |
| 4.2 | DB row count after second call | `1` (not `2`) |
| 4.3 | DB row ID after second call | Same `<ROW_ID>` as after first call |
| 5.1 | Third call HTTP status | `200 OK`, identical response |
| 6.1 | Backend logs | No `UNIQUE constraint violation`, no `ERROR` entries |
| 7.1 | UI finalize button | Hidden or disabled for the locked month |

---

## Failure Indicators

| Symptom | Probable cause |
|---------|----------------|
| HTTP 500 on second call with `UNIQUE constraint violation` | Service is calling `INSERT` unconditionally without checking for an existing `finalized=true` row; fix: add `findByYearAndMonth` check before insert |
| `finalizedAt` is different in `<RESPONSE_2>` | Service fetches existing row but then calls `.setFinalizedAt(LocalDateTime.now())` and saves it again; the idempotent path must return the existing entity without modification |
| DB row count = 2 after second call | `UNIQUE` constraint is missing or was not applied in the migration (`V2__revenue_tables.sql`); verify `CONSTRAINT uq_year_month UNIQUE (year, month)` exists |
| HTTP 409 Conflict on second call | Service is treating the second call as a conflict error rather than returning the existing row; idempotency requires returning `200 OK` with the existing data, not an error |
| `totalRevenue` or `tncnAmount` differ between calls | The service is re-computing live values and overwriting the snapshot on every call; the idempotent path must return the stored row unchanged |
| Finalize button still enabled in UI after first lock | `AnnualSummaryTable` is not checking `finalized === true` before rendering the button |
