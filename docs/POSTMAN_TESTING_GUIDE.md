# Session 3 - Postman Testing Guide

## Complete API Testing Checklist

This guide provides a systematic approach to testing all REST endpoints.

---

## Setup Postman

1. Download and install Postman from https://www.postman.com/downloads/
2. Create a new collection named "Dental Clinic API"
3. Set base URL as an environment variable (optional but recommended):
   - Variable name: `base_url`
   - Value: `http://localhost:8080/api`

---

## Test Sequence (Follow This Order)

### Phase 1: Read Operations (GET)

These tests verify you can retrieve data. Start here because they don't modify anything.

#### Test 1.1: Get All Patients ✅
```
Method: GET
URL: {{base_url}}/patients
OR: http://localhost:8080/api/patients

Expected Status: 200 OK
Expected Response: Array of 4 patients
```

**Expected Result:**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "birthYear": 1985,
    "gender": "Male",
    "phone": "555-0101",
    "address": "123 Main St"
  },
  ...
]
```

#### Test 1.2: Get Patient by ID ✅
```
Method: GET
URL: {{base_url}}/patients/1
OR: http://localhost:8080/api/patients/1

Expected Status: 200 OK
Expected Response: Single patient object
```

#### Test 1.3: Get All Appointments ✅
```
Method: GET
URL: {{base_url}}/appointments
OR: http://localhost:8080/api/appointments

Expected Status: 200 OK
Expected Response: Array of 6 appointments
```

**Note:** Patient data will be minimal (just ID) because this endpoint doesn't join.

#### Test 1.4: Get Appointment by ID ✅
```
Method: GET
URL: {{base_url}}/appointments/1
OR: http://localhost:8080/api/appointments/1

Expected Status: 200 OK
Expected Response: Single appointment object
```

#### Test 1.5: Get Appointments with Patients (No Filters) ✅
```
Method: GET
URL: {{base_url}}/appointments/with-patients
OR: http://localhost:8080/api/appointments/with-patients

Expected Status: 200 OK
Expected Response: Array of 6 appointments with complete patient data
```

**This is the PRIMARY endpoint!**

**Expected Result:**
```json
[
  {
    "appointmentId": 1,
    "date": "2024-03-15",
    "diagnosis": "Cavity in molar",
    "treatment": "Filling",
    "needsImplant": false,
    "needsDenture": false,
    "needsOrthodontics": false,
    "fee": 150.00,
    "note": "Follow-up in 6 months",
    "patientId": 1,
    "patientName": "John Doe",
    "birthYear": 1985,
    "gender": "Male",
    "phone": "555-0101",
    "address": "123 Main St"
  },
  ...
]
```

---

### Phase 2: Search & Filter Operations

Test the flexible search functionality.

#### Test 2.1: Search by Name ✅
```
Method: GET
URL: {{base_url}}/appointments/with-patients?search=John
OR: http://localhost:8080/api/appointments/with-patients?search=John

Expected Status: 200 OK
Expected Response: 3 appointments (John Doe + Bob Johnson)
```

**Why 3?** Partial matching finds "John" in both "John Doe" and "Bob Johnson"

#### Test 2.2: Search by Phone ✅
```
Method: GET
URL: {{base_url}}/appointments/with-patients?search=555-0102
OR: http://localhost:8080/api/appointments/with-patients?search=555-0102

Expected Status: 200 OK
Expected Response: 2 appointments for Jane Smith
```

#### Test 2.3: Filter by Needs Implant ✅
```
Method: GET
URL: {{base_url}}/appointments/with-patients?needsImplant=true
OR: http://localhost:8080/api/appointments/with-patients?needsImplant=true

Expected Status: 200 OK
Expected Response: 1 appointment (Jane Smith - Missing tooth)
```

#### Test 2.4: Filter by Needs Denture ✅
```
Method: GET
URL: {{base_url}}/appointments/with-patients?needsDenture=true
OR: http://localhost:8080/api/appointments/with-patients?needsDenture=true

Expected Status: 200 OK
Expected Response: 1 appointment (Alice Brown - Broken denture)
```

#### Test 2.5: Filter by Needs Orthodontics ✅
```
Method: GET
URL: {{base_url}}/appointments/with-patients?needsOrthodontics=true
OR: http://localhost:8080/api/appointments/with-patients?needsOrthodontics=true

Expected Status: 200 OK
Expected Response: 1 appointment (John Doe - Crooked teeth)
```

#### Test 2.6: Combined Search + Filter ✅
```
Method: GET
URL: {{base_url}}/appointments/with-patients?search=Jane&needsImplant=true
OR: http://localhost:8080/api/appointments/with-patients?search=Jane&needsImplant=true

Expected Status: 200 OK
Expected Response: 1 appointment (Jane Smith - Missing tooth)
```

#### Test 2.7: Search with No Results ✅
```
Method: GET
URL: {{base_url}}/appointments/with-patients?search=NonexistentName
OR: http://localhost:8080/api/appointments/with-patients?search=NonexistentName

Expected Status: 200 OK
Expected Response: Empty array []
```

---

### Phase 3: Create Operations (POST)

Test creating new records.

#### Test 3.1: Create New Patient ✅
```
Method: POST
URL: {{base_url}}/patients
OR: http://localhost:8080/api/patients

Headers:
Content-Type: application/json

Body (raw JSON):
{
  "name": "Sarah Wilson",
  "birthYear": 1988,
  "gender": "Female",
  "phone": "555-0105",
  "address": "789 Maple Dr"
}

Expected Status: 201 Created
Expected Response: Patient object with generated ID
```

**Verify:**
- Response includes `"id": 5` (or next available ID)
- GET /patients now returns 5 patients

#### Test 3.2: Create New Appointment ✅
```
Method: POST
URL: {{base_url}}/appointments
OR: http://localhost:8080/api/appointments

Headers:
Content-Type: application/json

Body (raw JSON):
{
  "date": "2024-03-25",
  "diagnosis": "Tooth sensitivity",
  "treatment": "Fluoride treatment",
  "needsImplant": false,
  "needsDenture": false,
  "needsOrthodontics": false,
  "fee": 120.00,
  "note": "Patient reported cold sensitivity",
  "patient": {
    "id": 1
  }
}

Expected Status: 201 Created
Expected Response: Appointment object with generated ID
```

**Note:** The `patient.id` must reference an existing patient!

**Verify:**
- Response includes new ID
- GET /appointments/with-patients shows the new appointment

#### Test 3.3: Create Appointment for Newly Created Patient ✅
```
Method: POST
URL: {{base_url}}/appointments
OR: http://localhost:8080/api/appointments

Headers:
Content-Type: application/json

Body (raw JSON):
{
  "date": "2024-03-26",
  "diagnosis": "First checkup",
  "treatment": "Examination",
  "needsImplant": false,
  "needsDenture": false,
  "needsOrthodontics": false,
  "fee": 75.00,
  "note": "New patient",
  "patient": {
    "id": 5
  }
}

Expected Status: 201 Created
Expected Response: Appointment object
```

This links the appointment to Sarah Wilson (ID 5 from Test 3.1).

---

### Phase 4: Update Operations (PUT)

Test modifying existing records.

#### Test 4.1: Update Patient ✅
```
Method: PUT
URL: {{base_url}}/patients/1
OR: http://localhost:8080/api/patients/1

Headers:
Content-Type: application/json

Body (raw JSON):
{
  "name": "John Doe",
  "birthYear": 1985,
  "gender": "Male",
  "phone": "555-0101",
  "address": "123 Main St Apt 2"
}

Expected Status: 200 OK
Expected Response: Updated patient object
```

**Note:** Address changed from "123 Main St" to "123 Main St Apt 2"

**Verify:**
- Response shows updated address
- GET /patients/1 shows new address

#### Test 4.2: Update Appointment ✅
```
Method: PUT
URL: {{base_url}}/appointments/1
OR: http://localhost:8080/api/appointments/1

Headers:
Content-Type: application/json

Body (raw JSON):
{
  "date": "2024-03-15",
  "diagnosis": "Cavity in molar - TREATED",
  "treatment": "Filling completed",
  "needsImplant": false,
  "needsDenture": false,
  "needsOrthodontics": false,
  "fee": 175.00,
  "note": "Follow-up in 6 months - Patient doing well"
}

Expected Status: 200 OK
Expected Response: Updated appointment object
```

**Note:** 
- Diagnosis updated
- Treatment updated
- Fee increased from 150.00 to 175.00
- Note updated

**Verify:**
- Response shows all updates
- GET /appointments/1 shows new data

---

### Phase 5: Error Handling Tests

Test that errors are handled gracefully.

#### Test 5.1: Get Non-Existent Patient ❌
```
Method: GET
URL: {{base_url}}/patients/999
OR: http://localhost:8080/api/patients/999

Expected Status: 404 Not Found
Expected Response:
{
  "timestamp": "2026-01-27T...",
  "status": 404,
  "error": "Not Found",
  "message": "Patient not found with id: 999",
  "path": "/api/patients/999"
}
```

#### Test 5.2: Get Non-Existent Appointment ❌
```
Method: GET
URL: {{base_url}}/appointments/999
OR: http://localhost:8080/api/appointments/999

Expected Status: 404 Not Found
Expected Response: Error object with 404 status
```

#### Test 5.3: Create Appointment with Non-Existent Patient ❌
```
Method: POST
URL: {{base_url}}/appointments
OR: http://localhost:8080/api/appointments

Headers:
Content-Type: application/json

Body (raw JSON):
{
  "date": "2024-03-30",
  "diagnosis": "Test",
  "treatment": "Test",
  "needsImplant": false,
  "needsDenture": false,
  "needsOrthodontics": false,
  "fee": 100.00,
  "note": "Test",
  "patient": {
    "id": 999
  }
}

Expected Status: 404 Not Found
Expected Response: Error indicating patient not found
```

#### Test 5.4: Update Non-Existent Patient ❌
```
Method: PUT
URL: {{base_url}}/patients/999
OR: http://localhost:8080/api/patients/999

Headers:
Content-Type: application/json

Body (raw JSON):
{
  "name": "Test",
  "birthYear": 2000,
  "gender": "Male",
  "phone": "555-9999",
  "address": "Test"
}

Expected Status: 404 Not Found
Expected Response: Error object with 404 status
```

#### Test 5.5: Delete Non-Existent Appointment ❌
```
Method: DELETE
URL: {{base_url}}/appointments/999
OR: http://localhost:8080/api/appointments/999

Expected Status: 404 Not Found
Expected Response: Error object with 404 status
```

---

### Phase 6: Delete Operations (DESTRUCTIVE - Test Last!)

**⚠️ Warning:** These tests permanently delete data!

#### Test 6.1: Delete Appointment ✅
```
Method: DELETE
URL: {{base_url}}/appointments/7
OR: http://localhost:8080/api/appointments/7

Expected Status: 204 No Content
Expected Response: Empty body
```

**Verify:**
- GET /appointments no longer includes ID 7
- Patient still exists (only appointment deleted)

#### Test 6.2: Delete Patient (Cascades to Appointments) ✅
```
Method: DELETE
URL: {{base_url}}/patients/5
OR: http://localhost:8080/api/patients/5

Expected Status: 204 No Content
Expected Response: Empty body
```

**Verify:**
- GET /patients no longer includes ID 5 (Sarah Wilson)
- GET /appointments no longer includes Sarah's appointment (cascade delete!)

---

## Testing Checklist Summary

### Phase 1: Read Operations
- [ ] Test 1.1: Get all patients
- [ ] Test 1.2: Get patient by ID
- [ ] Test 1.3: Get all appointments
- [ ] Test 1.4: Get appointment by ID
- [ ] Test 1.5: Get appointments with patients (no filters)

### Phase 2: Search & Filter
- [ ] Test 2.1: Search by name
- [ ] Test 2.2: Search by phone
- [ ] Test 2.3: Filter by needs implant
- [ ] Test 2.4: Filter by needs denture
- [ ] Test 2.5: Filter by needs orthodontics
- [ ] Test 2.6: Combined search + filter
- [ ] Test 2.7: Search with no results

### Phase 3: Create Operations
- [ ] Test 3.1: Create new patient
- [ ] Test 3.2: Create new appointment
- [ ] Test 3.3: Create appointment for new patient

### Phase 4: Update Operations
- [ ] Test 4.1: Update patient
- [ ] Test 4.2: Update appointment

### Phase 5: Error Handling
- [ ] Test 5.1: Get non-existent patient
- [ ] Test 5.2: Get non-existent appointment
- [ ] Test 5.3: Create appointment with non-existent patient
- [ ] Test 5.4: Update non-existent patient
- [ ] Test 5.5: Delete non-existent appointment

### Phase 6: Delete Operations
- [ ] Test 6.1: Delete appointment
- [ ] Test 6.2: Delete patient (cascade)

**Total Tests:** 22

---

## Expected Final State

After running all tests (assuming you don't re-add deleted records):

**Patients:** 4 (originally 4, added 1, deleted 1)
- John Doe (ID 1) - updated address
- Jane Smith (ID 2)
- Bob Johnson (ID 3)
- Alice Brown (ID 4)

**Appointments:** 6-7 (originally 6, added 2, deleted 2)
- Appointment 1 (John Doe) - updated
- Appointment 2 (Jane Smith)
- Appointment 3 (Bob Johnson)
- Appointment 4 (John Doe)
- Appointment 5 (Alice Brown)
- Appointment 6 (Jane Smith)
- Appointment 8 (John Doe) - new

---

## Tips for Postman

### Save Requests to Collection

1. After creating each request, click "Save"
2. Save to "Dental Clinic API" collection
3. Organize into folders:
   - Patient CRUD
   - Appointment CRUD
   - Search & Filter
   - Error Tests

### Use Environment Variables

Create environment "Dental Clinic Local":
```
base_url: http://localhost:8080/api
new_patient_id: (save from Test 3.1 response)
new_appointment_id: (save from Test 3.2 response)
```

### Use Tests Tab

In Postman, add this to the "Tests" tab to auto-verify:

```javascript
// For GET requests expecting 200
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is JSON", function () {
    pm.response.to.be.json;
});

// For POST requests expecting 201
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

// For DELETE requests expecting 204
pm.test("Status code is 204", function () {
    pm.response.to.have.status(204);
});
```

---

## Troubleshooting

### "Connection Refused" Error

**Cause:** Spring Boot application not running

**Fix:**
1. Check STS4 Boot Dashboard
2. Restart application if needed
3. Verify console shows "Started DentalClinicApplication"

### "404 Not Found" for Valid Endpoints

**Cause:** Wrong base URL

**Fix:** Ensure using `/api/` prefix:
- ✓ Correct: `http://localhost:8080/api/patients`
- ✗ Wrong: `http://localhost:8080/patients`

### "500 Internal Server Error"

**Cause:** Database issue or missing patient reference

**Fix:**
1. Check console for stack trace
2. Verify patient ID exists when creating appointment
3. Check database connection

### Empty Response Body

**Cause:** May be expected for some operations (DELETE)

**Verify:** Check status code:
- 204 No Content = Success (DELETE operations)
- 200 OK with empty array = No results found (valid)

---

## Session 3 Complete! ✅

Once you've tested all endpoints successfully:

**You're ready for Session 4: React Frontend!**

The backend is now fully operational and ready to serve data to the React frontend we'll build next.

---

*Postman collection can be exported and shared with team members*  
*File → Export → Collection v2.1 → Save as dental-clinic-api.json*
