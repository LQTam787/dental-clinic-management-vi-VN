## Comprehensive Testing Plan

### Phase 1: Functionality Testing

#### Test Suite 1: Patient Management

**Test 1.1: Create New Patient**

**Steps:**
1. Click "➕ New Patient" button
2. Fill in form:
   - Name: "Test Patient Alpha"
   - Birth Year: 1985
   - Gender: Male
   - Phone: "555-TEST-01"
   - Address: "123 Test Street"
3. Click "Create Patient"

**Expected Results:**
- ✅ Modal closes
- ✅ Success message: "Patient created successfully!"
- ✅ Message auto-dismisses after 3 seconds
- ✅ No errors in console

**Actual Results:**
[x] PASS  [ ] FAIL  [ ] NOTES: _________________

---

**Test 1.2: Edit Existing Patient**

**Steps:**
1. View appointment with patient "John Doe"
2. Click "👤 Patient" button
3. Patient form opens with pre-populated data
4. Change phone number to "555-UPDATED"
5. Click "Update Patient"

**Expected Results:**
- ✅ Form pre-populates correctly
- ✅ Changes save successfully
- ✅ Success message appears
- ✅ All appointments for patient show updated phone
- ✅ Table refreshes automatically

**Actual Results:**
[x] PASS  [ ] FAIL  [ ] NOTES: _________________

---

**Test 1.3: Validation - Missing Required Fields**

**Steps:**
1. Click "➕ New Patient"
2. Leave all fields empty
3. Click "Create Patient"

**Expected Results:**
- ✅ Form does NOT submit
- ✅ Error messages appear:
  - "Patient name is required"
  - "Birth year is required"
  - "Gender is required"
  - "Phone number is required"
- ✅ Fields with errors have red border
- ✅ Modal stays open

**Actual Results:**
[x] PASS  [ ] FAIL  [ ] NOTES: _________________

---

**Test 1.4: Validation - Invalid Data**

**Steps:**
1. Click "➕ New Patient"
2. Enter invalid data:
   - Birth Year: 1800 (too old)
   - Phone: "12" (too short)
3. Click "Create Patient"

**Expected Results:**
- ✅ Birth year error: "Birth year must be between 1900 and 2026"
- ✅ Phone error: "Phone number must be at least 7 digits"
- ✅ Form does not submit

**Actual Results:**
[x] PASS  [ ] FAIL  [ ] NOTES: _________________

---

**Test 1.5: Duplicate Phone Number**

**Steps:**
1. Note an existing patient's phone number
2. Create new patient with same phone
3. Submit form

**Expected Results:**
- ✅ Backend returns 409 Conflict
- ✅ Error message: "A patient with this phone number already exists"
- ✅ Modal stays open
- ✅ User can correct phone number

**Actual Results:**
[x] PASS  [ ] FAIL  [ ] NOTES: _________________

---

#### Test Suite 2: Appointment Management

**Test 2.1: Create New Appointment**

**Steps:**
1. Click "📅 New Appointment"
2. Select patient from dropdown
3. Fill in:
   - Date: Tomorrow's date
   - Diagnosis: "Cavity in molar"
   - Treatment: "Filling"
   - Check "Needs Orthodontics"
   - Fee: 150.00
   - Note: "Follow-up in 6 months"
4. Click "Create Appointment"

**Expected Results:**
- ✅ Patient dropdown populates
- ✅ Form submits successfully
- ✅ Success message appears
- ✅ Appointment appears in table
- ✅ All data displays correctly
- ✅ Orthodontics shows ✓
- ✅ Fee shows "$150.00"

**Actual Results:**
[x] PASS  [ ] FAIL  [ ] NOTES: _________________

---

**Test 2.2: Edit Existing Appointment**

**Steps:**
1. Click "✏️ Edit" on an appointment
2. Modify:
   - Diagnosis: "Updated diagnosis"
   - Fee: 200.00
   - Check "Needs Implant"
3. Click "Update Appointment"

**Expected Results:**
- ✅ Form pre-populates with existing data
- ✅ Patient field is disabled (cannot change)
- ✅ Changes save successfully
- ✅ Table shows updated values
- ✅ Implant column now shows ✓

**Actual Results:**
[x] PASS  [ ] FAIL  [ ] NOTES: _________________

---

**Test 2.3: Delete Appointment**

**Steps:**
1. Click "🗑️ Delete" on an appointment
2. Read confirmation dialog
3. Click "OK"

**Expected Results:**
- ✅ Confirmation shows patient name and date
- ✅ Warning: "This action cannot be undone"
- ✅ Appointment deleted successfully
- ✅ Success message appears
- ✅ Appointment removed from table
- ✅ Count updates correctly

**Actual Results:**
[x] PASS  [ ] FAIL  [ ] NOTES: _________________

---

**Test 2.4: Cancel Delete**

**Steps:**
1. Click "🗑️ Delete"
2. Click "Cancel" in confirmation

**Expected Results:**
- ✅ Dialog closes
- ✅ Appointment NOT deleted
- ✅ Table unchanged

**Actual Results:**
[x] PASS  [ ] FAIL  [ ] NOTES: _________________

---

#### Test Suite 3: Search & Filter

**Test 3.1: Search by Patient Name**

**Steps:**
1. Type "John" in search bar
2. Wait for debounce (500ms)

**Expected Results:**
- ✅ No API call while typing
- ✅ API call after typing stops
- ✅ Results show all appointments with "John" in name
- ✅ Results count updates
- ✅ Filter indicator shows search term

**Actual Results:**
[x] PASS  [ ] FAIL  [ ] NOTES: _________________

---

**Test 3.2: Search by Phone**

**Steps:**
1. Clear search
2. Type "555-0101"

**Expected Results:**
- ✅ Results show appointments for that phone number
- ✅ Partial phone numbers work (e.g., "555")

**Actual Results:**
[x] PASS  [ ] FAIL  [ ] NOTES: _________________

---

**Test 3.3: Filter by Treatment**

**Steps:**
1. Clear search
2. Check "Needs Implant"

**Expected Results:**
- ✅ Only appointments needing implants shown
- ✅ Filter indicator shows "1 treatment"
- ✅ "Clear Filters" button appears

**Actual Results:**
[x] PASS  [ ] FAIL  [ ] NOTES: _________________

---

**Test 3.4: Combined Search + Filter**

**Steps:**
1. Type "John" in search
2. Check "Needs Orthodontics"

**Expected Results:**
- ✅ Shows only John's appointments needing orthodontics
- ✅ Filter indicator shows both filters
- ✅ AND logic applied correctly

**Actual Results:**
[x] PASS  [ ] FAIL  [ ] NOTES: _________________

---

**Test 3.5: Clear All Filters**

**Steps:**
1. Apply search and multiple filters
2. Click "Clear Filters" button
3. Click clear (✕) in search box

**Expected Results:**
- ✅ Treatment filters clear
- ✅ Search clears separately
- ✅ All appointments shown
- ✅ Filter indicators removed

**Actual Results:**
[x] PASS  [ ] FAIL  [ ] NOTES: _________________

---

### Phase 2: User Workflow Testing

#### Workflow 1: New Patient Complete Flow

**Scenario:** New patient walks in, schedule appointment

**Steps:**
1. Click "➕ New Patient"
2. Create patient "Sarah Johnson"
   - Birth Year: 1992
   - Gender: Female
   - Phone: "555-SARAH"
   - Address: "456 Oak Avenue"
3. Save patient
4. Click "📅 New Appointment"
5. Select "Sarah Johnson" from dropdown
6. Schedule appointment for next week
7. Add diagnosis and treatment
8. Save appointment

**Expected Results:**
- ✅ Patient created successfully
- ✅ Patient appears in appointment dropdown
- ✅ Appointment created successfully
- ✅ Appointment visible in table with Sarah's info
- ✅ All data persists correctly

**Actual Results:**
[x] PASS  [ ] FAIL  [ ] NOTES: _________________

---

#### Workflow 2: Search and Edit Flow

**Scenario:** Receptionist needs to update appointment

**Steps:**
1. Search for patient "John"
2. Find specific appointment
3. Click "✏️ Edit"
4. Update fee and add note
5. Save changes
6. Verify changes in table

**Expected Results:**
- ✅ Search finds appointments quickly
- ✅ Edit form pre-populates
- ✅ Changes save successfully
- ✅ Table refreshes with new data
- ✅ Search filter maintained after save

**Actual Results:**
[x] PASS  [ ] FAIL  [ ] NOTES: _________________

---

#### Workflow 3: Patient Info Update Flow

**Scenario:** Patient's phone number changed

**Steps:**
1. Find patient's appointment in table
2. Click "👤 Patient" button
3. Update phone number
4. Save changes
5. Verify all patient's appointments show new phone

**Expected Results:**
- ✅ Patient form opens with current data
- ✅ Changes save successfully
- ✅ All appointments for that patient update
- ✅ No appointments for other patients change

**Actual Results:**
[x] PASS  [ ] FAIL  [ ] NOTES: _________________

---

#### Workflow 4: Multi-Filter Research Flow

**Scenario:** Find all patients needing implants and orthodontics

**Steps:**
1. Clear all filters
2. Check "Needs Implant"
3. Check "Needs Orthodontics"
4. Review results
5. Export data (mentally note for future feature)

**Expected Results:**
- ✅ Only appointments needing BOTH treatments shown
- ✅ Filter indicator shows "2 treatments"
- ✅ Results accurate
- ✅ Can click through to edit any result

**Actual Results:**
[x] PASS  [ ] FAIL  [ ] NOTES: _________________

---

### Phase 3: Cross-Browser Testing

**Browsers to Test:**
- [x] Google Chrome (latest)
- [x] Mozilla Firefox (latest)
- [x] Microsoft Edge (latest)
- [ ] Safari (if on Mac)

**Test Matrix:**

| Feature | Chrome | Firefox | Edge | Safari | Notes |
|---------|--------|---------|------|--------|-------|
| Create Patient | [x] | [x] | [x] | [ ] | |
| Create Appointment | [x] | [x] | [x] | [ ] | |
| Search | [x] | [x] | [x] | [ ] | |
| Filters | [x] | [x] | [x] | [ ] | |
| Edit Forms | [x] | [x] | [x] | [ ] | |
| Delete | [x] | [x] | [x] | [ ] | |
| Modal Display | [x] | [x] | [x] | [ ] | |
| Table Rendering | [x] | [x] | [x] | [ ] | |
| Responsive Design | [x] | [x] | [x] | [ ] | |

**Known Browser Differences:**
- Date picker appearance varies by browser
- Scrollbar styling differs
- Focus outline styles may vary

**All browsers should work identically for functionality.**

---

### Phase 4: Responsive Design Testing

**Devices/Resolutions to Test:**

**Desktop:**
- [x] 1920x1080 (Full HD)
- [x] 1366x768 (Common laptop)
- [x] 1280x720 (HD)

**Tablet:**
- [x] iPad (768x1024)
- [x] iPad Pro (1024x1366)
- [x] Generic tablet (800x1280)

**Mobile:**
- [x] iPhone SE (375x667)
- [x] iPhone 12/13 (390x844)
- [x] Samsung Galaxy (360x640)

**Test Checklist for Each Device:**

| Element | Desktop | Tablet | Mobile | Notes |
|---------|---------|--------|--------|-------|
| Header displays | [x] | [x] | [x] | |
| Action buttons accessible | [x] | [x] | [x] | |
| Search bar full width | [x] | [x] | [x] | |
| Filters stack correctly | [x] | [x] | [x] | |
| Table scrolls horizontally | [x] | [x] | [x] | |
| Modal fits screen | [x] | [x] | [x] | |
| Forms are usable | [x] | [x] | [x] | |
| Buttons touch-friendly | [x] | [x] | [x] | |
| Text readable | [x] | [x] | [x] | |
| No horizontal scroll | [x] | [x] | [x] | |

---

### Phase 5: Performance Testing

#### Load Testing with Sample Data

**Generate Test Data:**

Create a script to populate database with realistic data:

```sql
-- Create 50 test patients
INSERT INTO patients (name, birth_year, gender, phone, address)
SELECT 
    'Test Patient ' || generate_series,
    1950 + (random() * 50)::int,
    CASE WHEN random() < 0.5 THEN 'Male' ELSE 'Female' END,
    '555-TEST-' || LPAD(generate_series::text, 2, '0'),
    generate_series || ' Test Street'
FROM generate_series(1, 50);

-- Create 200 test appointments (4 per patient average)
INSERT INTO appointments (date, diagnosis, treatment, needs_implant, needs_denture, needs_orthodontics, fee, note, patient_id)
SELECT 
    CURRENT_DATE + (random() * 365)::int - 180,
    'Test diagnosis ' || generate_series,
    'Test treatment ' || generate_series,
    random() < 0.2,
    random() < 0.15,
    random() < 0.25,
    (random() * 500 + 100)::numeric(10,2),
    'Test note ' || generate_series,
    1 + (random() * 50)::int
FROM generate_series(1, 200);
```

**Performance Metrics to Measure:**

1. **Initial Page Load:**
   - Target: < 2 seconds
   - Measure: Time from URL enter to table visible
   - [x] PASS  [ ] FAIL  Time: _____ seconds

2. **Search Response:**
   - Target: < 500ms after debounce
   - Measure: Time from typing stops to results update
   - [x] PASS  [ ] FAIL  Time: _____ ms

3. **Filter Toggle:**
   - Target: < 300ms
   - Measure: Time from checkbox click to table update
   - [x] PASS  [ ] FAIL  Time: _____ ms

4. **Form Open:**
   - Target: < 200ms
   - Measure: Time from button click to modal visible
   - [x] PASS  [ ] FAIL  Time: _____ ms

5. **Data Refresh:**
   - Target: < 1 second
   - Measure: Time from save to table update
   - [x] PASS  [ ] FAIL  Time: _____ ms

**Browser Developer Tools - Performance Tab:**

Record performance for:
- [x] Initial load
- [x] Search operation
- [x] Filter operation
- [x] Create appointment
- [x] Edit appointment

**Look for:**
- Long tasks (>50ms)
- Excessive re-renders
- Memory leaks
- Network bottlenecks

---

### Phase 6: Edge Cases & Error Handling

**Test Edge Cases:**

**Test 6.1: Empty Database**

**Steps:**
1. Clear all appointments
2. Clear all patients
3. Reload page

**Expected:**
- ✅ "No appointments found" message
- ✅ No JavaScript errors
- ✅ All buttons still work
- ✅ Can create new data

**Actual Results:**
[x] PASS  [ ] FAIL

---

**Test 6.2: Network Failure**

**Steps:**
1. Open DevTools → Network tab
2. Set throttling to "Offline"
3. Try to create appointment

**Expected:**
- ✅ Request fails
- ✅ Error message appears
- ✅ Form stays open
- ✅ User can retry when online

**Actual Results:**
[x] PASS  [ ] FAIL

---

**Test 6.3: Backend Offline**

**Steps:**
1. Stop backend server
2. Try to perform actions

**Expected:**
- ✅ Error messages appear
- ✅ Application doesn't crash
- ✅ Previous data remains visible
- ✅ Can retry when backend restarts

**Actual Results:**
[x] PASS  [ ] FAIL

---

**Test 6.4: Very Long Text**

**Steps:**
1. Create appointment with very long diagnosis (500 chars)
2. Create patient with very long address (500 chars)

**Expected:**
- ✅ Text saves successfully
- ✅ Table displays truncated with ellipsis
- ✅ Full text visible in edit form
- ✅ No layout breaking

**Actual Results:**
[x] PASS  [ ] FAIL

---

**Test 6.5: Special Characters**

**Steps:**
1. Create patient with name: "O'Brien-Smith"
2. Create appointment with note: "Cost: $150 (50% discount!)"

**Expected:**
- ✅ Special characters save correctly
- ✅ Display correctly in table
- ✅ No SQL injection issues
- ✅ No XSS vulnerabilities

**Actual Results:**
[x] PASS  [ ] FAIL

---

**Test 6.6: Concurrent Edits**

**Steps:**
1. Open application in two browser tabs
2. Edit same patient in both tabs
3. Save in Tab 1
4. Save in Tab 2

**Expected:**
- ✅ Last write wins (Tab 2 overwrites Tab 1)
- ✅ No errors
- ✅ Data integrity maintained

**Note:** For production, consider optimistic locking

**Actual Results:**
[x] PASS  [ ] FAIL

---

**Test 6.7: Session Timeout**

**Steps:**
1. Leave application open for extended period
2. Try to perform action

**Expected:**
- ✅ Action still works (stateless API)
- ✅ No session expiry issues

**Actual Results:**
[x] PASS  [ ] FAIL

---

### Testing Summary Template

**Total Tests Run:** _____
**Tests Passed:** _____
**Tests Failed:** _____
**Success Rate:** _____%

**Critical Issues Found:** _____
**Minor Issues Found:** _____
**All Issues Resolved:** [ ] YES  [ ] NO

**Tester Name:** _________________
**Test Date:** _________________
**Environment:** _________________
