# Revenue Session 8 — Test 04: Empty Clinic Settings Graceful Degradation

**Session:** Revenue Session 8 of 8  
**Test ID:** T04  
**Reference:** `REVENUE_TAX_SUBSYSTEM_MASTER_PLAN.md` §8 (Session 8, Task 4) · §14 (Test 4) · §6 ("Empty Settings Placeholder Behavior") · §10 (Edge Cases: "Empty clinic_settings fields")  
**Status:** Ready to execute

---

## Purpose

Verify that the system degrades gracefully when all `clinic_settings` string fields are
empty. The S1a-HKD form — both via the API and in the browser UI — must render
`"..........."` placeholder strings for each blank header field, matching the visual
convention of the official blank government template. No `NullPointerException` must be
thrown on the backend, and no JavaScript error must appear in the browser.

Key assertions:
- `PUT /api/settings` with all-empty strings succeeds without validation errors.
- `GET /api/revenue/s1a-hkd/{year}/{month}` returns placeholder strings (`"..........."`)
  for all blank header fields.
- The S1a-HKD form renders in the browser without errors.
- The `ClinicSettingsForm` modal opens and shows empty fields — not null crashes.
- The `tncn_rate` default (`0.0200`) is preserved; this test only clears string fields.

---

## System Under Test

| Layer | Component / Endpoint |
|-------|----------------------|
| Backend endpoint | `GET /api/settings` |
| Backend endpoint | `PUT /api/settings` |
| Backend endpoint | `GET /api/revenue/s1a-hkd/{year}/{month}` |
| Backend service | `ClinicSettingsService.updateSettings()` — accepts empty strings |
| Backend service | `RevenueService.getS1aHkdData()` — placeholder substitution for blank fields |
| Frontend component | `ClinicSettingsForm` — loads and saves empty-string settings |
| Frontend component | `S1aHkdLedgerView` — renders `"..........."` placeholders in the header |

---

## Prerequisites

| # | Requirement |
|---|-------------|
| 1 | Backend running on `localhost:8080` |
| 2 | Frontend running on `localhost:5173` |
| 3 | Postman available |
| 4 | All Sessions 1–7 complete |
| 5 | At least one month with some appointments exists in the database (so the S1a-HKD form has at least one data row to render). Substitute `<TEST_YEAR>` and `<TEST_MONTH>` throughout. |
| 6 | Record the **current** settings before the test so they can be restored afterward: |

```
GET http://localhost:8080/api/settings
```

Save the full response JSON as `<ORIGINAL_SETTINGS>`.

---

## Methodology

**Approach:** REST API (Postman) to manipulate `clinic_settings`, combined with browser
UI inspection and JavaScript console monitoring. The test is non-destructive to appointment
data — only `clinic_settings` is modified and then restored.

**Tools:**
- Postman (GET and PUT settings, GET S1a-HKD)
- Browser DevTools — Console tab (must remain error-free)
- Browser DevTools — Network tab (inspect S1a-HKD response header fields)

---

## Test Data

Settings payload with all string fields set to empty string. The `tncn_rate` is kept at
the default `0.0200` to avoid confusing this test with rate-related behavior.

```json
{
  "businessName": "",
  "ownerName": "",
  "address": "",
  "taxId": "",
  "businessAddress": "",
  "currencyUnit": "",
  "tncnRate": 0.0200
}
```

The expected placeholder string used in the S1a-HKD header for blank fields is
`"..........."` (eleven dots), as specified in the master plan.

---

## Test Procedure

### Phase 1 — Record original settings

**Step 1.1** — Fetch and record current settings.

```
GET http://localhost:8080/api/settings
```

Save the complete JSON response. You will use this to restore settings in the cleanup
phase. The `id` field from this response will be needed.

---

### Phase 2 — Clear all string fields

**Step 2.1** — Send a PUT request with all string fields emptied.

```
PUT http://localhost:8080/api/settings
Content-Type: application/json

{
  "businessName": "",
  "ownerName": "",
  "address": "",
  "taxId": "",
  "businessAddress": "",
  "currencyUnit": "",
  "tncnRate": 0.0200
}
```

Expected: HTTP 200. The response body mirrors the saved values with all string fields
as empty strings.

**Step 2.2** — Verify the settings were persisted.

```
GET http://localhost:8080/api/settings
```

Expected: All string fields are empty strings (`""`). `tncnRate` is `0.0200`.

---

### Phase 3 — Verify S1a-HKD API response uses placeholders

**Step 3.1** — Fetch the S1a-HKD data for the test period.

```
GET http://localhost:8080/api/revenue/s1a-hkd/<TEST_YEAR>/<TEST_MONTH>
```

Expected: HTTP 200. Inspect the header fields in the response:

```json
{
  "businessName": "...........",
  "ownerName": "...........",
  "address": "...........",
  "taxId": "...........",
  "businessAddress": "...........",
  "declarationPeriod": "Tháng <TEST_MONTH>/<TEST_YEAR>",
  "currencyUnit": "...........",
  "entries": [...],
  "totalRevenue": <number>,
  "tncnAmount": <number>,
  "signatureDate": "..."
}
```

Confirm that **every** blank string field in the response is `"..........."` (not `null`,
not `""`, not `"undefined"`).

**Step 3.2** — Confirm no NullPointerException in backend logs.

Check the Spring Boot console / log output. No stack trace should appear after Step 3.1.

---

### Phase 4 — Frontend: S1a-HKD ledger renders with placeholders

**Step 4.1** — Open browser DevTools Console (F12). Clear all messages.

**Step 4.2** — Navigate to `http://localhost:5173` → **Doanh thu & Thuế** →
**Sổ S1a-HKD**. Select `<TEST_YEAR>` and `<TEST_MONTH>`.

Expected:
- The form header section renders the `"..........."` placeholder text in each blank
  field position (business name, address, tax ID, business address, currency unit).
- The appointment data rows still render correctly beneath the header.
- The `Tổng cộng` row shows the correct fee sum.
- No red errors appear in the Console tab.

**Step 4.3** — Visually compare the rendered form header against the official blank
S1a-HKD government template. Fields that would normally contain clinic-specific values
should show the dot-ellipsis placeholder.

**Step 4.4** — Click the **In sổ** (Print) button.

Expected: Print preview opens. The placeholder strings appear in the header exactly as
they do on screen. No blank page. No console errors.

---

### Phase 5 — Frontend: Settings modal opens without crash

**Step 5.1** — Click the `⚙` gear icon in the application header to open the
**Cài đặt phòng khám** modal.

Expected:
- The modal opens.
- All text input fields are **empty** (blank inputs, not `null` or `undefined` displayed
  as text).
- The TNCN rate field shows `2.00` (the decimal `0.0200` converted to a percentage).
- The TNCN disclaimer tooltip is visible.
- No JavaScript errors in Console.

**Step 5.2** — Without changing any values, click the **Lưu cài đặt** (Save) button.

Expected:
- HTTP 200 from `PUT /api/settings`.
- The modal closes (or shows "Đã lưu" confirmation).
- No error message is displayed.

---

### Phase 6 — Verify `currencyUnit` empty string vs. placeholder

The `currencyUnit` field controls the "Đơn vị tính" sub-header in the S1a-HKD form.
When it is an empty string, it must also render as `"..........."`.

**Step 6.1** — Inspect the rendered S1a-HKD form in the browser. Confirm that the
**Đơn vị tính** line reads `"..........."` (not blank, not `"VNĐ"`, not `undefined`).

**Step 6.2** — In the API response from Step 3.1, confirm:
```json
"currencyUnit": "..........."
```

---

### Phase 7 — Restore original settings

**Step 7.1** — Restore using the values saved in Step 1.1.

```
PUT http://localhost:8080/api/settings
Content-Type: application/json

<ORIGINAL_SETTINGS>
```

Expected: HTTP 200. The response mirrors `<ORIGINAL_SETTINGS>`.

**Step 7.2** — Verify restoration.

```
GET http://localhost:8080/api/settings
```

Confirm all fields match `<ORIGINAL_SETTINGS>`.

**Step 7.3** — Navigate to the S1a-HKD ledger view in the browser and reload. Confirm
that the form header now shows the restored clinic name and other details instead of
placeholders.

---

## Expected Results Summary

| Step | Check | Expected |
|------|-------|----------|
| 2.1 | PUT with empty strings | HTTP 200, no validation error |
| 2.2 | GET after clear | All string fields are `""` |
| 3.1 | S1a-HKD header fields | `"..........."` for each blank string field |
| 3.1 | S1a-HKD numeric fields | `totalRevenue` and `tncnAmount` are numbers (not null) |
| 3.2 | Backend logs | No NullPointerException |
| 4.2 | Browser form header | Placeholder text visible, no JS errors |
| 4.4 | Print preview | Placeholder text renders, no blank page |
| 5.1 | Settings modal | Empty inputs render, no crash |
| 7.2 | Settings after restore | Matches original values |

---

## Failure Indicators

| Symptom | Probable cause |
|---------|----------------|
| HTTP 400 on PUT with empty `businessName` | Service has a `@NotEmpty` or `@NotBlank` validation on string fields; these fields must be optional |
| `NullPointerException` in `getS1aHkdData()` | Code does `settings.getBusinessName().toUpperCase()` or similar without a null/empty check; add `(s == null || s.isBlank()) ? "..........." : s` |
| `"businessName": null` instead of `"..........."` | Placeholder substitution logic is inside the frontend only; it should also be applied server-side in `RevenueService` so the API contract is consistent |
| `"businessName": ""` (empty string, not placeholder) | Placeholder substitution is not implemented; the mapping returns the raw empty string |
| `currencyUnit` blank in form (not `"..........."`) | Empty string treated as falsy in JavaScript; check `v || "..........."` condition covers empty strings, not just `null` |
| JavaScript `TypeError` on Settings modal open | `ClinicSettingsForm` initializes state from API; if `businessName` is `""` and state is initialized to `undefined`, input becomes uncontrolled; ensure default `""` for all fields |
| S1a-HKD ledger shows the wrong period's header | `S1aHkdLedgerView` is not re-fetching after settings change; verify the `settings-updated` event listener is working |
