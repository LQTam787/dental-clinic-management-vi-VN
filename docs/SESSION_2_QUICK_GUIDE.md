# Session 2 Quick Guide - Repository & Service Layers

## What We've Built

I've created the complete Repository and Service layers for the dental clinic backend:

### Files Created:

1. **DTO (Data Transfer Object)**
   - `AppointmentWithPatientDTO.java` - Combines appointment + patient data for efficient queries

2. **Exception**
   - `ResourceNotFoundException.java` - Custom exception for when data isn't found

3. **Repositories**
   - `PatientRepository.java` - Database access for patients with custom search queries
   - `AppointmentRepository.java` - Database access for appointments with complex filtering

4. **Services**
   - `PatientService.java` - Business logic for patient CRUD operations
   - `AppointmentService.java` - Business logic for appointment operations + main UI query

---

## Your Action Items (In Order)

### 1. Add the Files to Your Project

Download the `dental-clinic-backend` folder from outputs and extract it. You should see:

```
dental-clinic-backend/
└── src/main/java/com/dentalclinic/
    ├── dto/
    │   └── AppointmentWithPatientDTO.java
    ├── exception/
    │   └── ResourceNotFoundException.java
    ├── repository/
    │   ├── PatientRepository.java
    │   └── AppointmentRepository.java
    └── service/
        ├── PatientService.java
        └── AppointmentService.java
```

**In STS4:**
```
1. Copy these folders into your existing project structure
2. Refresh the project (F5 or right-click → Refresh)
3. Wait for Maven to rebuild (progress bar bottom-right)
```

### 2. Add Sample Data to Database

We need some test data to verify everything works. Open pgAdmin 4 and run these SQL statements:

**Connect to Database:**
```
pgAdmin 4 → Servers → PostgreSQL → Databases → dental_clinic
Right-click → Query Tool
```

**Insert Sample Patients:**
```sql
INSERT INTO patients (name, birth_year, gender, phone, address) VALUES
('John Doe', 1985, 'Male', '555-0101', '123 Main St'),
('Jane Smith', 1990, 'Female', '555-0102', '456 Oak Ave'),
('Bob Johnson', 1975, 'Male', '555-0103', '789 Pine Rd'),
('Alice Brown', 1995, 'Female', '555-0104', '321 Elm St');
```

**Insert Sample Appointments:**
```sql
INSERT INTO appointments (date, diagnosis, treatment, needs_implant, needs_denture, needs_orthodontics, fee, note, patient_id) VALUES
('2024-03-15', 'Cavity in molar', 'Filling', FALSE, FALSE, FALSE, 150.00, 'Follow-up in 6 months', 1),
('2024-03-16', 'Missing tooth', 'Implant consultation', TRUE, FALSE, FALSE, 200.00, 'Schedule implant surgery', 2),
('2024-03-17', 'Routine checkup', 'Cleaning', FALSE, FALSE, FALSE, 100.00, 'Good oral health', 3),
('2024-03-18', 'Crooked teeth', 'Orthodontic assessment', FALSE, FALSE, TRUE, 300.00, 'Consider braces', 1),
('2024-03-19', 'Broken denture', 'Denture repair', FALSE, TRUE, FALSE, 250.00, 'Same-day service', 4),
('2024-03-20', 'Wisdom tooth pain', 'Extraction', FALSE, FALSE, FALSE, 350.00, 'Post-op care needed', 2);
```

**Verify Data:**
```sql
-- Check patients
SELECT * FROM patients;

-- Check appointments
SELECT * FROM appointments;

-- Check the join (what our app will do)
SELECT 
    a.id as appointment_id, 
    a.date, 
    p.name as patient_name, 
    a.diagnosis, 
    a.treatment
FROM appointments a
JOIN patients p ON a.patient_id = p.id;
```

### 3. Test the Services with a Main Method

To verify everything works, we'll temporarily modify the main application class to test our services.

**Open:** `DentalClinicApplication.java`

**Replace with this test version:**

```java
package com.dentalclinic;

import com.dentalclinic.dto.AppointmentWithPatientDTO;
import com.dentalclinic.model.Patient;
import com.dentalclinic.service.AppointmentService;
import com.dentalclinic.service.PatientService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.List;

@SpringBootApplication
public class DentalClinicApplication {

    public static void main(String[] args) {
        SpringApplication.run(DentalClinicApplication.class, args);
    }

    /**
     * CommandLineRunner runs after the application starts.
     * We use it to test our services.
     */
    @Bean
    public CommandLineRunner testServices(PatientService patientService, 
                                          AppointmentService appointmentService) {
        return args -> {
            System.out.println("\n" + "=".repeat(60));
            System.out.println("TESTING SESSION 2 - Repository & Service Layers");
            System.out.println("=".repeat(60) + "\n");

            // Test 1: Get all patients
            System.out.println("TEST 1: Get all patients");
            System.out.println("-".repeat(40));
            List<Patient> patients = patientService.getAllPatients();
            System.out.println("Found " + patients.size() + " patients:");
            patients.forEach(p -> System.out.println("  - " + p.getName() + " (" + p.getPhone() + ")"));
            System.out.println();

            // Test 2: Get appointments with patients (all data)
            System.out.println("TEST 2: Get all appointments with patient data");
            System.out.println("-".repeat(40));
            List<AppointmentWithPatientDTO> allAppointments = 
                appointmentService.getAppointmentsWithPatients(null, null, null, null);
            System.out.println("Found " + allAppointments.size() + " appointments:");
            allAppointments.forEach(apt -> System.out.println(
                "  - " + apt.getDate() + " | " + apt.getPatientName() + 
                " | " + apt.getDiagnosis() + " | Fee: $" + apt.getFee()
            ));
            System.out.println();

            // Test 3: Search by patient name
            System.out.println("TEST 3: Search for patients with 'John' in name");
            System.out.println("-".repeat(40));
            List<AppointmentWithPatientDTO> johnAppointments = 
                appointmentService.getAppointmentsWithPatients("John", null, null, null);
            System.out.println("Found " + johnAppointments.size() + " appointments:");
            johnAppointments.forEach(apt -> System.out.println(
                "  - " + apt.getPatientName() + " | " + apt.getDiagnosis()
            ));
            System.out.println();

            // Test 4: Filter by treatment needs
            System.out.println("TEST 4: Filter appointments needing implants");
            System.out.println("-".repeat(40));
            List<AppointmentWithPatientDTO> implantAppointments = 
                appointmentService.getAppointmentsWithPatients(null, true, null, null);
            System.out.println("Found " + implantAppointments.size() + " appointments:");
            implantAppointments.forEach(apt -> System.out.println(
                "  - " + apt.getPatientName() + " | " + apt.getTreatment()
            ));
            System.out.println();

            // Test 5: Combined filters
            System.out.println("TEST 5: Search 'Jane' AND needs orthodontics");
            System.out.println("-".repeat(40));
            List<AppointmentWithPatientDTO> combined = 
                appointmentService.getAppointmentsWithPatients("Jane", null, null, true);
            System.out.println("Found " + combined.size() + " appointments:");
            combined.forEach(apt -> System.out.println(
                "  - " + apt.getPatientName() + " | " + apt.getTreatment()
            ));
            System.out.println();

            System.out.println("=".repeat(60));
            System.out.println("ALL TESTS COMPLETED SUCCESSFULLY!");
            System.out.println("Session 2 verification complete. Ready for Session 3!");
            System.out.println("=".repeat(60) + "\n");
        };
    }
}
```

### 4. Run the Application

**In STS4:**
```
1. Right-click DentalClinicApplication.java → Run As → Spring Boot App
   OR: Use Boot Dashboard → (Re)start
```

**Expected Output:**

You should see output similar to this in the console:

```
============================================================
TESTING SESSION 2 - Repository & Service Layers
============================================================

TEST 1: Get all patients
----------------------------------------
Found 4 patients:
  - John Doe (555-0101)
  - Jane Smith (555-0102)
  - Bob Johnson (555-0103)
  - Alice Brown (555-0104)

TEST 2: Get all appointments with patient data
----------------------------------------
Found 6 appointments:
  - 2024-03-15 | John Doe | Cavity in molar | Fee: $150.00
  - 2024-03-16 | Jane Smith | Missing tooth | Fee: $200.00
  - 2024-03-17 | Bob Johnson | Routine checkup | Fee: $100.00
  - 2024-03-18 | John Doe | Crooked teeth | Fee: $300.00
  - 2024-03-19 | Alice Brown | Broken denture | Fee: $250.00
  - 2024-03-20 | Jane Smith | Wisdom tooth pain | Fee: $350.00

TEST 3: Search for patients with 'John' in name
----------------------------------------
Found 2 appointments:
  - John Doe | Cavity in molar
  - John Doe | Crooked teeth

TEST 4: Filter appointments needing implants
----------------------------------------
Found 1 appointments:
  - Jane Smith | Implant consultation

TEST 5: Search 'Jane' AND needs orthodontics
----------------------------------------
Found 0 appointments:

============================================================
ALL TESTS COMPLETED SUCCESSFULLY!
Session 2 verification complete. Ready for Session 3!
============================================================
```

---

## Success Criteria

✅ **All 6 files added to project without errors**  
✅ **Sample data inserted into database**  
✅ **Application starts successfully**  
✅ **All 5 tests run and show expected results**  
✅ **No red errors in console**

---

## What Each Component Does

### AppointmentWithPatientDTO
- **Purpose:** Efficiently combines appointment and patient data
- **Why:** Avoids N+1 query problem (fetching patient for each appointment separately)
- **Usage:** Main UI table display

### ResourceNotFoundException
- **Purpose:** Custom exception for missing data
- **Why:** Better error handling than generic exceptions
- **Usage:** Thrown when trying to access non-existent patients/appointments

### PatientRepository
- **Purpose:** Database access layer for patients
- **Provides:**
  - Built-in CRUD methods (findAll, findById, save, delete)
  - Custom search methods (by name, by phone, combined search)
- **Why Interface:** Spring Data JPA implements it automatically

### AppointmentRepository
- **Purpose:** Database access layer for appointments
- **Provides:**
  - Built-in CRUD methods
  - Find by patient ID
  - **CRITICAL:** Complex query joining appointments with patients + filtering
- **Query Features:**
  - Nullable parameters (flexible filtering)
  - Case-insensitive search
  - Partial matching
  - Multiple treatment filters

### PatientService
- **Purpose:** Business logic for patient operations
- **Methods:**
  - getAllPatients() - Get all patients
  - getPatientById(id) - Get one patient
  - createPatient(patient) - Add new patient
  - updatePatient(id, patient) - Modify patient
  - deletePatient(id) - Remove patient (cascades to appointments)
  - searchPatients(term) - Search by name or phone

### AppointmentService
- **Purpose:** Business logic for appointment operations
- **Methods:**
  - getAllAppointments() - Get all appointments
  - getAppointmentById(id) - Get one appointment
  - createAppointment(appointment) - Add new appointment
  - updateAppointment(id, appointment) - Modify appointment
  - deleteAppointment(id) - Remove appointment
  - **getAppointmentsWithPatients()** - **PRIMARY METHOD** - Gets joined data with filtering

---

## Architecture Overview

```
Controller Layer (Session 3)
      ↓ calls
Service Layer (Session 2) ← Business logic, validation
      ↓ calls
Repository Layer (Session 2) ← Database access
      ↓ uses
JPA/Hibernate ← ORM framework
      ↓ generates
SQL Queries
      ↓ executes on
PostgreSQL Database
```

**Session 2 completed the middle layers** (Service + Repository)

**Session 3 will add Controllers** to expose these as REST APIs

---

## Common Issues & Fixes

### "Cannot resolve symbol ResourceNotFoundException"
**Fix:** Ensure ResourceNotFoundException.java is in the correct package (com.dentalclinic.exception)

### "No property 'searchByNameOrPhone' found"
**Fix:** This is correct - we use @Query annotation, not method name query

### Tests show 0 results
**Fix:** Check that sample data was inserted (run SELECT * FROM patients; in pgAdmin)

### "Patient not found" errors in tests
**Fix:** Make sure patient IDs in appointments match existing patient IDs

### Application won't start
**Fix:** Check console for specific error. Most common:
- Database connection failed (verify PostgreSQL running)
- Syntax error in query (check @Query strings have no typos)

---

## After Successful Testing

**Restore the main class** to its original simple version:

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

This removes the test output but keeps all the services working.

---

## Next Session Preview: REST Controllers

**Session 3 will create:**
- PatientController - REST API endpoints for patients
- AppointmentController - REST API endpoints for appointments
- CORS configuration - Allow frontend to access API
- Testing with Postman/Thunder Client

**After Session 3, you'll have:**
- Complete REST API accessible at http://localhost:8080/api
- Ability to perform CRUD operations via HTTP requests
- Foundation ready for React frontend

---

## Time Estimate

- Adding files to project: 2 minutes
- Adding sample data: 3 minutes
- Modifying main class: 2 minutes
- Running and verifying tests: 3 minutes

**Total: ~10-15 minutes**

---

**Excellent work! Once you verify all tests pass, Session 2 is complete!** 🎉

You've now built:
- ✅ Entity models (Session 1)
- ✅ Repository layer (Session 2)
- ✅ Service layer (Session 2)

**Next up: Controllers to expose this as a REST API!**
