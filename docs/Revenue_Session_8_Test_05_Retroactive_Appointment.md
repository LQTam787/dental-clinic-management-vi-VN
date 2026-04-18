# Revenue Session 8 — Test 05: Retroactive Appointment in Finalized Month

**Session:** Revenue Session 8 of 8  
**Test ID:** T05  
**Reference:** `REVENUE_TAX_SUBSYSTEM_MASTER_PLAN.md` §8 (Session 8, Task 5) · §14 (Test 5) · §7 (Design: "Retroactive edits don't change finalized snapshots") · §10 (Edge Cases)  
**Status:** Ready to execute

---

## Purpose

Verify that the finalized `monthly_revenue` snapshot is **immutable**: adding a new
appointment dated within an already-finalized month must not alter the stored
`total_revenue`, `tncn_amount`, or `appointment_count` in the `monthly_revenue` row.

At the same time, the system's live queries — which always recompute from the
`appointments` table — must reflect the retroactive appointment correctly.

Key assertions:
- After finalization, the `monthly_revenue` row is a locked snapshot and cannot be
  mutated by inserting new appointments into the same period.
- `GET /api/revenue/monthly/{year}` returns the **snapshot** totals for a finalized
  month, not a live recomputed value.
- `GET /api/revenue/s1a-hkd/{year}/{month}` for a finalized period returns the
  snapshot's total (not the augmented live total), and does NOT include the
  retroactive appointment in its entries.
- The live `GET /api/revenue/current-month` (if the retroactive month is the current
  calendar month) or the live annual summary still reflects the new appointment in the
  running totals — it is only the finalized snapshot that is locked.

---

## System Under Test

| Layer | Component / Endpoint |
|-------|----------------------|
| Backend endpoint | `POST /api/revenue/finalize/{year}/{month}` |
| Backend endpoint | `GET /api/revenue/monthly/{year}` |
| Backend endpoint | `GET /api/revenue/s1a-hkd/{year}/{month}` |
| Backend endpoint | `POST /api/appointments` (creates the retroactive appointment) |
| Backend service | `RevenueService.getMonthlyRevenue()` — returns snapshot for finalized months |
| Backend service | `RevenueService.getS1aHkdData()` — determines whether to use snapshot or live data |
| Backend service | `RevenueService.getAllMonthsForYear()` — finalized months use DB snapshot |
| Database | `monthly_revenue` row must not be updated by appointment inserts |
| Frontend component | `AnnualSummaryTable` — finalized row shows locked total |
| Frontend component | `S1aHkdLedgerView` — form content for finalized period |

---

## Prerequisites

| # | Requirement |
|---|-------------|
| 1 | Backend running on `localhost:8080` |
| 2 | Frontend running on `localhost:5173` |
| 3 | PostgreSQL accessible |
| 4 | Postman available |
| 5 | All Sessions 1–7 complete |
| 6 | Choose a past month (`<RETRO_YEAR>/<RETRO_MONTH>`) that has no existing `monthly_revenue` row yet, and that has at least one appointment. If necessary, create some test appointments first. Verify: |

```sql
-- Verify appointments exist
SELECT COUNT(*) FROM appointments
WHERE EXTRACT(YEAR FROM date) = <RETRO_YEAR>
  AND EXTRACT(MONTH FROM date) = <RETRO_MONTH>;
-- Expected: >= 1

-- Verify no snapshot row yet
SELECT * FROM monthly_revenue
WHERE year = <RETRO_YEAR> AND month = <RETRO_MONTH>;
-- Expected: 0 rows
```

| 7 | Have at least one patient ID available. Record it as `<PATIENT_ID>`. |

---

## Methodology

**Approach:** REST API (Postman) combined with direct database inspection. The test is
sequential: finalize the month, record the snapshot, add a retroactive appointment,
then confirm the snapshot has not changed.

**Tools:**
- Postman (HTTP calls with JSON comparison)
- psql / pgAdmin (direct DB verification before and after retroactive insert)
- Browser DevTools — Console tab (watch for errors during UI steps)

---

## Test Data Setup

If the chosen `<RETRO_YEAR>/<RETRO_MONTH>` has no appointments yet, create two seed
appointments now:

```
POST http://localhost:8080/api/appointments
Content-Type: application/json

{
  "date": "<RETRO_YEAR>-<RETRO_MONTH>-10",
  "diagnosis": "T05 seed A",
  "treatment": "Trám răng",
  "fee": 600000,
  "patientId": <PATIENT_ID>
}
```

```
POST http://localhost:8080/api/appointments
Content-Type: application/json

{
  "date": "<RETRO_YEAR>-<RETRO_MONTH>-20",
  "diagnosis": "T05 seed B",
  "treatment": "Nhổ răng",
  "fee": 900000,
  "patientId": <PATIENT_ID>
}
```

This gives a known initial total of **1,500,000 VNĐ** for the period.
Record any seed appointment IDs for cleanup.

---

## Test Procedure

### Phase 1 — Capture the pre-finalization live total

**Step 1.1** — Fetch the live total for the period.

```
GET http://localhost:8080/api/revenue/monthly/<RETRO_YEAR>
```

Find the element where `"month": <RETRO_MONTH>`. Record:
- `totalRevenue` → `<LIVE_TOTAL_BEFORE>` (e.g. `1500000`)
- `appointmentCount` → `<COUNT_BEFORE>` (e.g. `2`)
- `finalized` must be `false`

---

### Phase 2 — Finalize the month

**Step 2.1** — Finalize `<RETRO_YEAR>/<RETRO_MONTH>`.

```
POST http://localhost:8080/api/revenue/finalize/<RETRO_YEAR>/<RETRO_MONTH>
```

Expected: HTTP 200. Record the **complete response body** as `<SNAPSHOT>`:
```json
{
  "year": <RETRO_YEAR>,
  "month": <RETRO_MONTH>,
  "totalRevenue": 1500000.00,
  "appointmentCount": 2,
  "tncnAmount": 30000.00,
  "finalized": true,
  "finalizedAt": "<SNAPSHOT_FINALIZED_AT>"
}
```

Record:
- `totalRevenue` → `<SNAPSHOT_TOTAL>` (= `<LIVE_TOTAL_BEFORE>`)
- `appointmentCount` → `<SNAPSHOT_COUNT>`
- `tncnAmount` → `<SNAPSHOT_TNCN>`
- `finalizedAt` → `<SNAPSHOT_FINALIZED_AT>`

**Step 2.2** — Verify the database snapshot directly.

```sql
SELECT total_revenue, appointment_count, tncn_amount, finalized, finalized_at
FROM monthly_revenue
WHERE year = <RETRO_YEAR> AND month = <RETRO_MONTH>;
```

Confirm all values match `<SNAPSHOT>`.

---

### Phase 3 — Add a retroactive appointment

**Step 3.1** — Create a new appointment dated within the already-finalized period.

```
POST http://localhost:8080/api/appointments
Content-Type: application/json

{
  "date": "<RETRO_YEAR>-<RETRO_MONTH>-25",
  "diagnosis": "T05 RETROACTIVE",
  "treatment": "Cạo vôi răng",
  "fee": 400000,
  "patientId": <PATIENT_ID>
}
```

Expected: HTTP 201 (or 200). The appointment is accepted — the system does not reject
retroactive inserts. Record the appointment `id` as `<RETRO_ID>`.

---

### Phase 4 — Verify the finalized snapshot is unchanged

**Step 4.1** — Query the database snapshot directly.

```sql
SELECT total_revenue, appointment_count, tncn_amount, finalized, finalized_at
FROM monthly_revenue
WHERE year = <RETRO_YEAR> AND month = <RETRO_MONTH>;
```

Expected: **All values identical to Step 2.2.** The retroactive appointment must not
have triggered an UPDATE on this row.

- `total_revenue` = `<SNAPSHOT_TOTAL>` (NOT `<SNAPSHOT_TOTAL + 400000>`)
- `appointment_count` = `<SNAPSHOT_COUNT>` (NOT `<SNAPSHOT_COUNT + 1>`)
- `tncn_amount` = `<SNAPSHOT_TNCN>` (unchanged)
- `finalized_at` = `<SNAPSHOT_FINALIZED_AT>` (unchanged)

**Step 4.2** — Verify via the monthly API.

```
GET http://localhost:8080/api/revenue/monthly/<RETRO_YEAR>
```

Find the element where `"month": <RETRO_MONTH>`. Expected:
```json
{
  "year": <RETRO_YEAR>,
  "month": <RETRO_MONTH>,
  "totalRevenue": <SNAPSHOT_TOTAL>,
  "appointmentCount": <SNAPSHOT_COUNT>,
  "tncnAmount": <SNAPSHOT_TNCN>,
  "finalized": true,
  "finalizedAt": "<SNAPSHOT_FINALIZED_AT>"
}
```

The `totalRevenue` must equal `<SNAPSHOT_TOTAL>`, **not** `<SNAPSHOT_TOTAL + 400000>`.

**Step 4.3** — Verify the S1a-HKD form data for the finalized period.

```
GET http://localhost:8080/api/revenue/s1a-hkd/<RETRO_YEAR>/<RETRO_MONTH>
```

Expected: The `entries` array does **not** include the retroactive appointment
(diagnosed `"T05 RETROACTIVE"`). The `totalRevenue` in the response matches
`<SNAPSHOT_TOTAL>`.

> **Design note:** The S1a-HKD endpoint always queries live appointment data. If the
> implementation queries live appointments rather than the snapshot, the retroactive
> appointment will appear. Check the master plan's design decision: the ledger view for
> a finalized month should reflect the snapshot, not the augmented live set. If the
> current implementation queries appointments live regardless of finalization status,
> this test documents that behavior as a known limitation to be tracked.

---

### Phase 5 — Verify live queries DO reflect the retroactive appointment

The retroactive appointment is a real record in the `appointments` table. The following
live queries should include it even though the finalized snapshot does not.

**Step 5.1** — Verify appointment count via direct SQL.

```sql
SELECT COUNT(*) FROM appointments
WHERE EXTRACT(YEAR FROM date) = <RETRO_YEAR>
  AND EXTRACT(MONTH FROM date) = <RETRO_MONTH>;
```

Expected: `<SNAPSHOT_COUNT + 1>` (e.g. `3`) — the retroactive appointment is stored.

**Step 5.2** — If this is the current calendar month, verify the live total.

```
GET http://localhost:8080/api/revenue/current-month
```

Expected: `totalRevenue` now includes the `400000` retroactive fee (i.e.
`<SNAPSHOT_TOTAL + 400000>`). The current month widget reflects reality.

If this is a past month, this step does not apply — the current-month endpoint only
reflects the present calendar month.

---

### Phase 6 — Frontend verification

**Step 6.1** — Open browser DevTools Console. Clear messages.

**Step 6.2** — Navigate to `http://localhost:5173` → **Doanh thu & Thuế** →
**Tổng theo năm**. Select `<RETRO_YEAR>`.

Expected:
- The row for `<RETRO_MONTH>` shows the 🔒 lock icon.
- The `Doanh thu` column shows `<SNAPSHOT_TOTAL>` (the snapshot value), NOT
  `<SNAPSHOT_TOTAL + 400000>`.
- No JavaScript errors.

**Step 6.3** — Navigate to **Sổ S1a-HKD**. Select `<RETRO_YEAR>` and `<RETRO_MONTH>`.

Expected:
- The `Tổng cộng` row shows `<SNAPSHOT_TOTAL>`.
- The retroactive appointment (`T05 RETROACTIVE`) is either absent from the table (if
  the service uses the snapshot) or present (if the service queries live). Document
  which behavior is observed.

---

### Phase 7 — Cleanup

```sql
DELETE FROM appointments WHERE id = <RETRO_ID>;
DELETE FROM appointments WHERE diagnosis LIKE 'T05%';
DELETE FROM monthly_revenue WHERE year = <RETRO_YEAR> AND month = <RETRO_MONTH>;
```

---

## Expected Results Summary

| Step | Check | Expected |
|------|-------|----------|
| 1.1 | Pre-finalization live total | `finalized: false`, `totalRevenue = <LIVE_TOTAL_BEFORE>` |
| 2.1 | Finalize response | `finalized: true`, `totalRevenue = <LIVE_TOTAL_BEFORE>` |
| 4.1 | DB row after retroactive insert | All values identical to Step 2.2 |
| 4.2 | Monthly API for finalized month | Returns snapshot totals, NOT augmented totals |
| 4.3 | S1a-HKD `totalRevenue` | Equals `<SNAPSHOT_TOTAL>` |
| 5.1 | Direct SQL appointment count | `<SNAPSHOT_COUNT + 1>` (retroactive appointment stored) |
| 6.2 | UI annual table — locked row | Shows `<SNAPSHOT_TOTAL>`, lock icon visible |

---

## Failure Indicators

| Symptom | Probable cause |
|---------|----------------|
| `monthly_revenue.total_revenue` updates after retroactive insert | A database trigger or Spring event listener is recomputing and overwriting the snapshot; remove any such logic — the row must be write-once after `finalized=true` |
| Monthly API returns augmented total for finalized month | `getAllMonthsForYear()` is querying live appointments for finalized months instead of reading from `monthly_revenue`; fix: for months where `finalized=true`, return the DB snapshot |
| Retroactive appointment appears in S1a-HKD entries but `totalRevenue` is still `<SNAPSHOT_TOTAL>` | `getS1aHkdData()` queries live appointments but uses the snapshot for the total; this is a mixed-state inconsistency — decide one source of truth and be consistent |
| `appointmentCount` in snapshot increments | Same as first row — the row is being overwritten |
| HTTP 400 or 422 on `POST /api/appointments` for a past date | The backend is incorrectly rejecting past-dated appointments; past dates must be accepted |
| UI lock icon disappears after retroactive insert | Frontend is re-fetching and the `finalized` flag is being returned as `false`; check whether the service is re-evaluating finalization status dynamically |
