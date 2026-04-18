# Revenue Session 8 — Test 02: NULL Fee Handling

**Session:** Revenue Session 8 of 8  
**Test ID:** T02  
**Reference:** `REVENUE_TAX_SUBSYSTEM_MASTER_PLAN.md` §8 (Session 8, Task 2) · §14 (Test 2) · §7 (Design: NULL fee → 0) · §10 (Edge Cases)  
**Status:** Ready to execute

---

## Purpose

Verify that an appointment created without a fee value (`fee: null`) is handled safely
at every layer of the system:

- The `appointments` table accepts a NULL `fee` without a constraint violation.
- All revenue aggregation queries use `COALESCE(fee, 0)` so the NULL fee contributes
  `0` to all totals rather than causing a `NULL + number = NULL` propagation.
- The S1a-HKD ledger includes the appointment as a line item with `amount: 0`.
- No `NullPointerException` is thrown anywhere in the Java service layer.
- No JavaScript error appears in the browser console when the appointment is rendered.

---

## System Under Test

| Layer | Component / Endpoint |
|-------|----------------------|
| Backend endpoint | `POST /api/appointments` (accepts null fee) |
| Backend endpoint | `GET /api/revenue/current-month` |
| Backend endpoint | `GET /api/revenue/s1a-hkd/{year}/{month}` |
| Backend endpoint | `GET /api/revenue/monthly/{year}` |
| Backend service | `RevenueService.getCurrentMonthRevenue()` |
| Backend service | `RevenueService.getS1aHkdData()` |
| Backend query | `AppointmentRepository.sumFeeByYearAndMonth` — `COALESCE(fee, 0)` |
| Backend query | `AppointmentRepository.findAppointmentsWithPatientsByYearAndMonth` |
| Frontend component | `CurrentMonthWidget` (live total unchanged) |
| Frontend component | `S1aHkdLedgerView` (row with `0` amount renders correctly) |
| Frontend component | `AnnualSummaryTable` (count increments, total unchanged) |

---

## Prerequisites

| # | Requirement |
|---|-------------|
| 1 | Backend running on `localhost:8080` |
| 2 | Frontend running on `localhost:5173` |
| 3 | PostgreSQL accessible (for direct DB verification) |
| 4 | Postman available |
| 5 | All Sessions 1–7 complete |
| 6 | At least one existing patient in the database. Note their `id` as `<PATIENT_ID>` (`GET /api/patients`). |
| 7 | Know the current calendar year and month. Substitute `<YEAR>` and `<MONTH>` (numeric, e.g. `2026` and `4`) throughout. |
| 8 | Note the current live `totalRevenue` from `GET /api/revenue/current-month` before starting. Record it as `<BASELINE_TOTAL>`. |
| 9 | Note the current live `appointmentCount` from the same call. Record it as `<BASELINE_COUNT>`. |

---

## Methodology

**Approach:** Black-box testing via REST API (Postman) combined with database inspection
(psql / pgAdmin) and browser console observation.

The test focuses on the absence of errors more than on value changes — a null fee should
silently contribute zero to all totals while still producing a valid line item in the
S1a-HKD ledger.

**Tools:**
- Postman (REST calls and JSON assertion)
- psql / pgAdmin (verify `fee IS NULL` stored correctly)
- Browser DevTools — Console tab (must remain error-free throughout)
- Browser DevTools — Network tab (inspect S1a-HKD response payload)

---

## Test Data

| Field | Value |
|-------|-------|
| `date` | `<YEAR>-<MONTH>-20` (a date within the current month) |
| `diagnosis` | `Test T02 NULL fee` |
| `treatment` | `Kiểm tra` |
| `fee` | *(omitted from JSON body — not sent)* |
| `patientId` | `<PATIENT_ID>` |

Two variants are tested: omitting the `fee` field entirely (no key in JSON), and
explicitly sending `"fee": null`. Both must produce the same safe behavior.

---

## Test Procedure

### Phase 1 — Capture baseline totals

**Step 1.1** — Record the live monthly total before the test appointment is created.

```
GET http://localhost:8080/api/revenue/current-month
```

Record:
- `totalRevenue` → `<BASELINE_TOTAL>`
- `appointmentCount` → `<BASELINE_COUNT>`

---

### Phase 2 — Create appointment with omitted fee field

**Step 2.1** — POST a new appointment without including the `fee` key at all.

```
POST http://localhost:8080/api/appointments
Content-Type: application/json

{
  "date": "<YEAR>-<MONTH>-20",
  "diagnosis": "Test T02 NULL fee",
  "treatment": "Kiểm tra",
  "patientId": <PATIENT_ID>
}
```

Expected: HTTP 201 (or 200). The response body includes the created appointment. The
`fee` field in the response is either absent or `null`. Record the appointment `id` as
`<A_OMIT_ID>`.

**Step 2.2** — Verify the database stores NULL.

```sql
SELECT id, fee, diagnosis
FROM appointments
WHERE id = <A_OMIT_ID>;
```

Expected: `fee` column is `NULL`.

---

### Phase 3 — Create appointment with explicit `null` fee

**Step 3.1** — POST a second appointment with `"fee": null` explicitly.

```
POST http://localhost:8080/api/appointments
Content-Type: application/json

{
  "date": "<YEAR>-<MONTH>-20",
  "diagnosis": "Test T02 explicit null",
  "treatment": "Khám tổng quát",
  "fee": null,
  "patientId": <PATIENT_ID>
}
```

Expected: HTTP 201 (or 200). Record the `id` as `<A_NULL_ID>`.

**Step 3.2** — Verify the database stores NULL.

```sql
SELECT id, fee, diagnosis
FROM appointments
WHERE id = <A_NULL_ID>;
```

Expected: `fee` column is `NULL`.

---

### Phase 4 — Verify revenue totals remain unaffected

**Step 4.1** — Fetch the live monthly total after both null-fee appointments.

```
GET http://localhost:8080/api/revenue/current-month
```

Expected:
```json
{
  "totalRevenue": <BASELINE_TOTAL>,
  "appointmentCount": <BASELINE_COUNT + 2>,
  "finalized": false
}
```

The `totalRevenue` must equal `<BASELINE_TOTAL>` — adding two null-fee appointments
must **not** change the revenue total. The `appointmentCount` must increment by 2.

**Step 4.2** — Verify no NullPointerException in backend logs.

Check the Spring Boot console / log output. No stack trace should appear after steps
2.1 or 3.1. Look specifically for:
- `java.lang.NullPointerException`
- `could not extract ResultSet`
- `SQL Error` related to NULL arithmetic

---

### Phase 5 — Verify S1a-HKD ledger includes both appointments with amount 0

**Step 5.1** — Fetch the S1a-HKD data for the current period.

```
GET http://localhost:8080/api/revenue/s1a-hkd/<YEAR>/<MONTH>
```

Expected: HTTP 200. The `entries` array contains entries for both null-fee appointments.
Each entry matching the test patient on `<YEAR>-<MONTH>-20` must have:

```json
{
  "entryDate": "<YEAR>-<MONTH>-20",
  "description": "Dịch vụ nha khoa — <PATIENT_NAME>",
  "amount": 0
}
```

The `totalRevenue` in the response must equal `<BASELINE_TOTAL>` (unchanged from
before the null-fee appointments were added).

**Step 5.2** — Inspect the response carefully.

Check that:
- The entries array is not shorter than expected (null-fee appointments must not be
  silently excluded from the ledger).
- No `amount` field is `null` — it must be the number `0`.
- `totalRevenue` and `tncnAmount` are numbers, not `null`.

---

### Phase 6 — Verify the frontend renders without errors

**Step 6.1** — Open browser DevTools (F12) and go to the **Console** tab. Clear any
existing messages.

**Step 6.2** — Navigate to `http://localhost:5173` → **Doanh thu & Thuế** →
**Sổ S1a-HKD**.

**Step 6.3** — Select `<YEAR>` and `<MONTH>` in the period picker.

Expected:
- The S1a-HKD table renders all appointment rows.
- Both null-fee appointments appear as rows with `0` (or `0 VNĐ`) in the Số tiền column.
- No JavaScript errors (red messages) appear in the Console tab.

**Step 6.4** — Navigate to **Tháng hiện tại** sub-view.

Expected:
- `CurrentMonthWidget` displays `<BASELINE_TOTAL>` (not a different value).
- Appointment count shows `<BASELINE_COUNT + 2>`.
- No JavaScript errors.

**Step 6.5** — Navigate to **Tổng theo năm** sub-view and select `<YEAR>`.

Expected:
- The month row for `<MONTH>` shows appointment count incremented by 2.
- The `Doanh thu` column for that month remains `<BASELINE_TOTAL>`.

---

### Phase 7 — Finalize the month (optional extended check)

**Step 7.1** — If you want to confirm null-fee handling persists through finalization,
call the finalize endpoint.

> **Warning:** Only do this step if the current month is suitable for finalization
> testing (i.e., it is a past month or you are intentionally finalizing the current one).

```
POST http://localhost:8080/api/revenue/finalize/<YEAR>/<MONTH>
```

Expected: The `totalRevenue` in the response equals `<BASELINE_TOTAL>` — null fees do
not inflate or corrupt the finalized snapshot.

**Step 7.2** — Verify the `monthly_revenue` row.

```sql
SELECT total_revenue, appointment_count, tncn_amount, finalized
FROM monthly_revenue
WHERE year = <YEAR> AND month = <MONTH>;
```

Expected: `total_revenue` matches `<BASELINE_TOTAL>`. `appointment_count` includes the
two null-fee appointments.

---

### Phase 8 — Cleanup

```sql
DELETE FROM appointments WHERE id IN (<A_OMIT_ID>, <A_NULL_ID>);
-- If Step 7 was performed:
DELETE FROM monthly_revenue WHERE year = <YEAR> AND month = <MONTH>;
```

---

## Expected Results Summary

| Step | Check | Expected |
|------|-------|----------|
| 2.1 | POST with omitted fee | HTTP 201, no server error |
| 2.2 | DB fee column | `NULL` |
| 3.1 | POST with explicit null | HTTP 201, no server error |
| 4.1 | `current-month` total | `totalRevenue = <BASELINE_TOTAL>`, count `+2` |
| 4.2 | Backend logs | No NullPointerException, no SQL error |
| 5.1 | S1a-HKD entries | Both appointments present with `amount: 0` |
| 5.2 | S1a-HKD totals | `totalRevenue` and `tncnAmount` are numeric (not null) |
| 6.3 | Browser Console | No JavaScript errors during ledger render |
| 6.4 | `CurrentMonthWidget` | Total unchanged, count incremented |

---

## Failure Indicators

| Symptom | Probable cause |
|---------|----------------|
| HTTP 500 on `POST /api/appointments` with null fee | `fee` column has a `NOT NULL` constraint that should not exist; check DDL |
| `totalRevenue` becomes `null` after adding null-fee appointments | `SUM()` without `COALESCE`; fix: `COALESCE(SUM(COALESCE(a.fee, 0)), 0)` |
| Null-fee appointment missing from S1a-HKD `entries` array | JPQL query filters out rows where `fee IS NULL`; remove any such `WHERE fee IS NOT NULL` condition |
| `amount: null` in S1a-HKD entry (instead of `0`) | `S1aHkdEntryDTO` mapping does not apply `COALESCE`; fix: use `a.fee != null ? a.fee : BigDecimal.ZERO` |
| `NullPointerException` in `RevenueService` | A `BigDecimal` multiplication or addition on a potentially-null `fee` value; fix: apply null check before arithmetic |
| JavaScript `TypeError: Cannot read properties of null` in console | Frontend renders `entry.amount` directly without guarding for `null`; add `?? 0` fallback |
| Appointment count does NOT increment | The appointment was rejected (check POST response HTTP status) or the count query filters null-fee rows |
