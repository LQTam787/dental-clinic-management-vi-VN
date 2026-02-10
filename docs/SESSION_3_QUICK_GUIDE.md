# Session 3 Quick Guide - REST Controllers & API Testing

## What We've Built

I've created the complete REST API layer for the dental clinic backend:

### Files Created:

1. **Controllers**
   - `PatientController.java` - REST API for patient CRUD operations
   - `AppointmentController.java` - REST API for appointment CRUD operations + main `/with-patients` endpoint

2. **Configuration**
   - `CorsConfig.java` - Enables React frontend to call the API
   - `GlobalExceptionHandler.java` - Converts exceptions to proper HTTP error responses

---

## Your Action Items (In Order)

### 1. Add the Files to Your Project

Download the `dental-clinic-backend` files and add them to your project:

```
src/main/java/com/dentalclinic/
├── config/
│   ├── CorsConfig.java                    [NEW]
│   └── GlobalExceptionHandler.java        [NEW]
└── controller/
    ├── PatientController.java             [NEW]
    └── AppointmentController.java         [NEW]
```

**In STS4:**
```
1. Copy these folders/files into your existing project structure
2. Refresh the project (F5 or right-click → Refresh)
3. Wait for Maven to rebuild
```

### 2. Remove CommandLineRunner from DentalClinicApplication.java

Restore your main application class to its simple version:

**Replace the entire content with:**

```java
package com.dentalclinic;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DentalClinicApplication {

    public static void main(String[] args) {
        SpringApplication.run(DentalClinicApplication.class, args);
    }
}
```

This removes the test output but keeps all services working and ready for the controllers.

### 3. Run the Application

**In STS4:**
```
Boot Dashboard → (Re)start
OR
Right-click DentalClinicApplication.java → Run As → Spring Boot App
```

**Expected Console Output:**
```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.2.1)

...
Started DentalClinicApplication in X.XXX seconds (JVM running for X.XXX)
```

✅ **No test output anymore** - this is correct! The API is ready to accept HTTP requests.

---

## 4. Test the API with Your Browser or Postman

### Quick Browser Tests

Open your browser and visit these URLs:

**Test 1: Get all patients**
```
http://localhost:8080/api/patients
```

**Expected Response:**
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
  {
    "id": 2,
    "name": "Jane Smith",
    "birthYear": 1990,
    "gender": "Female",
    "phone": "555-0102",
    "address": "456 Oak Ave"
  },
  ...
]
```

**Test 2: Get all appointments with patient data (PRIMARY ENDPOINT)**
```
http://localhost:8080/api/appointments/with-patients
```

**Expected Response:**
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

**Test 3: Search for appointments**
```
http://localhost:8080/api/appointments/with-patients?search=John
```

Should return only appointments for patients with "John" in their name.

**Test 4: Filter by treatment needs**
```
http://localhost:8080/api/appointments/with-patients?needsImplant=true
```

Should return only appointments that need implants.

---

## 5. Test with Postman (Recommended)

### Install Postman (if not already installed)

Download from: https://www.postman.com/downloads/

### Test All Endpoints

#### A. Patient Endpoints

**1. GET All Patients**
```
GET http://localhost:8080/api/patients
```

**2. GET Patient by ID**
```
GET http://localhost:8080/api/patients/1
```

**3. POST Create New Patient**
```
POST http://localhost:8080/api/patients
Content-Type: application/json

Body (raw JSON):
{
  "name": "Sarah Wilson",
  "birthYear": 1988,
  "gender": "Female",
  "phone": "555-0105",
  "address": "789 Maple Dr"
}
```

**4. PUT Update Patient**
```
PUT http://localhost:8080/api/patients/1
Content-Type: application/json

Body (raw JSON):
{
  "name": "John Doe Updated",
  "birthYear": 1985,
  "gender": "Male",
  "phone": "555-0101",
  "address": "123 Main St Apt 2"
}
```

**5. DELETE Patient**
```
DELETE http://localhost:8080/api/patients/5
```
(This will cascade delete to appointments)

#### B. Appointment Endpoints

**1. GET All Appointments**
```
GET http://localhost:8080/api/appointments
```

**2. GET Appointment by ID**
```
GET http://localhost:8080/api/appointments/1
```

**3. POST Create New Appointment**
```
POST http://localhost:8080/api/appointments
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
```

**4. PUT Update Appointment**
```
PUT http://localhost:8080/api/appointments/1
Content-Type: application/json

Body (raw JSON):
{
  "date": "2024-03-15",
  "diagnosis": "Cavity in molar - UPDATED",
  "treatment": "Filling completed",
  "needsImplant": false,
  "needsDenture": false,
  "needsOrthodontics": false,
  "fee": 175.00,
  "note": "Follow-up in 6 months - UPDATED"
}
```

**5. DELETE Appointment**
```
DELETE http://localhost:8080/api/appointments/7
```

#### C. Main UI Endpoint (Most Important)

**1. GET All Appointments with Patients (No Filter)**
```
GET http://localhost:8080/api/appointments/with-patients
```

**2. Search by Name or Phone**
```
GET http://localhost:8080/api/appointments/with-patients?search=Jane
```

**3. Filter by Implant Need**
```
GET http://localhost:8080/api/appointments/with-patients?needsImplant=true
```

**4. Filter by Denture Need**
```
GET http://localhost:8080/api/appointments/with-patients?needsDenture=true
```

**5. Filter by Orthodontics Need**
```
GET http://localhost:8080/api/appointments/with-patients?needsOrthodontics=true
```

**6. Combined Filters**
```
GET http://localhost:8080/api/appointments/with-patients?search=John&needsOrthodontics=true
```

---

## Success Criteria

✅ **Application starts without errors**
✅ **All GET endpoints return data**
✅ **POST endpoints create new records**
✅ **PUT endpoints update records**
✅ **DELETE endpoints remove records**
✅ **Search parameter works (partial matching)**
✅ **Treatment filters work (boolean filtering)**
✅ **Combined filters work (search + treatment)**
✅ **Error responses are properly formatted JSON**

---

## Common Issues & Fixes

### Issue 1: "404 Not Found" for all endpoints

**Fix:** Check the base URL is correct:
- ✓ Correct: `http://localhost:8080/api/patients`
- ✗ Wrong: `http://localhost:8080/patients` (missing `/api`)

### Issue 2: CORS errors (when testing from browser)

**Fix:** Verify CorsConfig.java is in the project and application restarted.

### Issue 3: "Patient not found" when creating appointment

**Fix:** Make sure the patient ID exists:
```
GET http://localhost:8080/api/patients
```
Use an ID from this list in your appointment creation.

### Issue 4: Appointments return patient as null

**Fix:** This is expected for the regular `/api/appointments` endpoint.
Use `/api/appointments/with-patients` instead - this is the primary UI endpoint.

---

## What Each Endpoint Does

### Patient Endpoints

| Method | URL | Purpose | Request Body | Response |
|--------|-----|---------|--------------|----------|
| GET | /api/patients | Get all patients | None | List of patients |
| GET | /api/patients/{id} | Get one patient | None | Single patient |
| POST | /api/patients | Create patient | Patient (no ID) | Created patient |
| PUT | /api/patients/{id} | Update patient | Patient | Updated patient |
| DELETE | /api/patients/{id} | Delete patient | None | 204 No Content |

### Appointment Endpoints

| Method | URL | Purpose | Request Body | Response |
|--------|-----|---------|--------------|----------|
| GET | /api/appointments | Get all appointments | None | List of appointments |
| GET | /api/appointments/{id} | Get one appointment | None | Single appointment |
| POST | /api/appointments | Create appointment | Appointment (with patient.id) | Created appointment |
| PUT | /api/appointments/{id} | Update appointment | Appointment | Updated appointment |
| DELETE | /api/appointments/{id} | Delete appointment | None | 204 No Content |

### Main UI Endpoint

| Method | URL | Purpose | Query Parameters | Response |
|--------|-----|---------|------------------|----------|
| GET | /api/appointments/with-patients | Get appointments + patient data | search, needsImplant, needsDenture, needsOrthodontics | List of DTOs |

---

## API Architecture

```
Browser/Postman
      ↓ HTTP Request
┌─────────────────────┐
│  CONTROLLER LAYER   │ ← Session 3 (New!)
│  - PatientController│
│  - AppointmentCtrl  │
└──────────┬──────────┘
           │ calls
┌──────────▼──────────┐
│   SERVICE LAYER     │ ← Session 2
│  - PatientService   │
│  - AppointmentSvc   │
└──────────┬──────────┘
           │ calls
┌──────────▼──────────┐
│  REPOSITORY LAYER   │ ← Session 2
│  - PatientRepo      │
│  - AppointmentRepo  │
└──────────┬──────────┘
           │ SQL
┌──────────▼──────────┐
│   PostgreSQL DB     │ ← Session 1
│  - patients table   │
│  - appointments tbl │
└─────────────────────┘
```

---

## Error Response Examples

**404 Not Found (Patient doesn't exist):**
```json
{
  "timestamp": "2026-01-27T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Patient not found with id: 99",
  "path": "/api/patients/99"
}
```

**400 Bad Request (Invalid data):**
```json
{
  "timestamp": "2026-01-27T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid patient data",
  "path": "/api/patients"
}
```

**500 Internal Server Error (Unexpected error):**
```json
{
  "timestamp": "2026-01-27T10:30:00",
  "status": 500,
  "error": "Internal Server Error",
  "message": "Database connection failed",
  "path": "/api/appointments"
}
```

---

## Next Steps After Session 3

Once you verify all endpoints work correctly:

1. ✅ All GET endpoints return data
2. ✅ All POST endpoints create records
3. ✅ All PUT endpoints update records
4. ✅ All DELETE endpoints remove records
5. ✅ Search and filters work correctly

**You're ready for Session 4: React Frontend Setup!**

---

## Time Estimate

- Adding controller files: 2 minutes
- Updating main class: 1 minute
- Running application: 1 minute
- Testing with browser: 5 minutes
- Testing with Postman: 15 minutes

**Total: ~25 minutes**

---

**Excellent work! Once you verify all endpoints work, Session 3 is complete!** 🎉

You've now built:
- ✅ Entity models (Session 1)
- ✅ Repository layer (Session 2)
- ✅ Service layer (Session 2)
- ✅ REST API layer (Session 3)

**Next up: React frontend to create a beautiful UI!**
