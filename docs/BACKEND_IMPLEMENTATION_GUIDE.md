# Backend Implementation Guide
## Fixing Test 1.5: Duplicate Phone Number Validation

**Time Required:** 10 minutes  
**Files to Modify:** 3  
**Files to Create:** 2

---

## Step 1: Add New Exception Files (2 minutes)

### File 1: DuplicatePhoneException.java

**Location:** `src/main/java/com/dentalclinic/exception/DuplicatePhoneException.java`

**Action:** Copy the provided `DuplicatePhoneException.java` file to this location

**What it does:** Defines a custom exception for duplicate phone numbers

---

### File 2: GlobalExceptionHandler.java

**Location:** `src/main/java/com/dentalclinic/exception/GlobalExceptionHandler.java`

**Action:** Copy the provided `GlobalExceptionHandler.java` file to this location

**What it does:** 
- Catches `DuplicatePhoneException` and returns HTTP 409
- Catches `ResourceNotFoundException` and returns HTTP 404
- Handles all other exceptions appropriately
- Returns user-friendly error messages

---

## Step 2: Update PatientRepository (1 minute)

**File:** `src/main/java/com/dentalclinic/repository/PatientRepository.java`

**Find this:**
```java
@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    // existing methods if any
}
```

**Add this method:**
```java
@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    
    /**
     * Find a patient by phone number
     * Used to check for duplicate phone numbers before creating/updating patients
     * 
     * @param phone The phone number to search for
     * @return Optional containing the patient if found, empty otherwise
     */
    Optional<Patient> findByPhone(String phone);
}
```

**Action:** Add the `findByPhone` method to your repository interface

---

## Step 3: Update PatientService (5 minutes)

**File:** `src/main/java/com/dentalclinic/service/PatientService.java`

### Part A: Add Import

**At the top of the file, add:**
```java
import com.dentalclinic.exception.DuplicatePhoneException;
```

### Part B: Update createPatient Method

**Find your `createPatient` method:**
```java
public PatientDTO createPatient(PatientDTO patientDTO) {
    Patient patient = convertToEntity(patientDTO);
    Patient savedPatient = patientRepository.save(patient);
    return convertToDTO(savedPatient);
}
```

**Replace it with:**
```java
public PatientDTO createPatient(PatientDTO patientDTO) {
    // Check for duplicate phone number BEFORE saving
    Optional<Patient> existingPatient = patientRepository.findByPhone(patientDTO.getPhone());
    if (existingPatient.isPresent()) {
        throw new DuplicatePhoneException("A patient with this phone number already exists");
    }
    
    Patient patient = convertToEntity(patientDTO);
    Patient savedPatient = patientRepository.save(patient);
    return convertToDTO(savedPatient);
}
```

### Part C: Update updatePatient Method

**Find your `updatePatient` method:**
```java
public Optional<PatientDTO> updatePatient(Long id, PatientDTO patientDTO) {
    return patientRepository.findById(id)
            .map(existingPatient -> {
                existingPatient.setName(patientDTO.getName());
                existingPatient.setBirthYear(patientDTO.getBirthYear());
                existingPatient.setGender(patientDTO.getGender());
                existingPatient.setPhone(patientDTO.getPhone());
                existingPatient.setAddress(patientDTO.getAddress());
                
                Patient updatedPatient = patientRepository.save(existingPatient);
                return convertToDTO(updatedPatient);
            });
}
```

**Replace it with:**
```java
public Optional<PatientDTO> updatePatient(Long id, PatientDTO patientDTO) {
    return patientRepository.findById(id)
            .map(existingPatient -> {
                // Check if phone number is being changed
                if (!existingPatient.getPhone().equals(patientDTO.getPhone())) {
                    // Check if new phone number already exists
                    Optional<Patient> duplicatePhone = patientRepository.findByPhone(patientDTO.getPhone());
                    if (duplicatePhone.isPresent() && !duplicatePhone.get().getId().equals(id)) {
                        throw new DuplicatePhoneException("A patient with this phone number already exists");
                    }
                }
                
                existingPatient.setName(patientDTO.getName());
                existingPatient.setBirthYear(patientDTO.getBirthYear());
                existingPatient.setGender(patientDTO.getGender());
                existingPatient.setPhone(patientDTO.getPhone());
                existingPatient.setAddress(patientDTO.getAddress());
                
                Patient updatedPatient = patientRepository.save(existingPatient);
                return convertToDTO(updatedPatient);
            });
}
```

---

## Step 4: Verify Changes (2 minutes)

### Your exception package should now contain:
```
src/main/java/com/dentalclinic/exception/
├── ResourceNotFoundException.java (already exists)
├── DuplicatePhoneException.java (NEW)
└── GlobalExceptionHandler.java (NEW)
```

### Check your imports in PatientService.java:
```java
import com.dentalclinic.exception.DuplicatePhoneException;
import java.util.Optional;
// ... other imports
```

---

## Step 5: Rebuild and Test (2 minutes)

### Rebuild Backend:
```bash
cd dental-clinic-backend
mvn clean install
```

**Expected Output:**
```
[INFO] BUILD SUCCESS
[INFO] Total time: XX seconds
```

### Start Backend:
```bash
mvn spring-boot:run
```

**Expected Output:**
```
Started DentalClinicApplication in X.XXX seconds
```

---

## Step 6: Test the Fix

### Test 1: Create Patient with Unique Phone
```bash
curl -X POST http://localhost:8080/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Patient One",
    "birthYear": 1990,
    "gender": "Male",
    "phone": "555-UNIQUE-01",
    "address": "123 Test St"
  }'
```

**Expected:** HTTP 200/201, patient created successfully

### Test 2: Try to Create Duplicate
```bash
curl -X POST http://localhost:8080/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Patient Two",
    "birthYear": 1995,
    "gender": "Female",
    "phone": "555-UNIQUE-01",
    "address": "456 Test Ave"
  }'
```

**Expected Response:**
```json
{
  "timestamp": "2026-02-02T...",
  "status": 409,
  "error": "Conflict",
  "message": "A patient with this phone number already exists",
  "path": "/api/patients"
}
```

**Expected Status Code:** 409 Conflict (NOT 500!)

---

## Verification Checklist

- [ ] `DuplicatePhoneException.java` created in exception package
- [ ] `GlobalExceptionHandler.java` created in exception package
- [ ] `findByPhone` method added to `PatientRepository`
- [ ] `createPatient` method updated with duplicate check
- [ ] `updatePatient` method updated with duplicate check
- [ ] Backend compiles without errors (`mvn clean install`)
- [ ] Backend starts successfully (`mvn spring-boot:run`)
- [ ] Creating unique patient works (returns 200/201)
- [ ] Creating duplicate patient returns 409 with message
- [ ] No errors in console logs

---

## What This Fixes

**Before:**
- Duplicate phone number → HTTP 500 error
- Technical error message in database language
- User confused about what went wrong

**After:**
- Duplicate phone number → HTTP 409 Conflict
- Clear message: "A patient with this phone number already exists"
- User knows exactly what to fix
- Modal stays open so user can correct the phone number

**Test 1.5 Status:** ✅ WILL NOW PASS

---

## Error Response Structure

All exceptions now return consistent JSON format:

```json
{
  "timestamp": "2026-02-02T10:30:45.123",
  "status": 409,
  "error": "Conflict",
  "message": "User-friendly error message here",
  "path": "/api/patients"
}
```

This makes it easy for the frontend to:
1. Check the status code
2. Display the message to the user
3. Handle errors appropriately

---

## Troubleshooting

### "Cannot find symbol: DuplicatePhoneException"
**Fix:** Make sure the file is in the correct package: `com.dentalclinic.exception`

### "Method findByPhone not found"
**Fix:** Make sure you added the method to `PatientRepository` interface

### Still getting 500 error
**Fix:** 
1. Check that `GlobalExceptionHandler` has `@ControllerAdvice` annotation
2. Restart the backend completely
3. Clear any cached builds: `mvn clean install`

### Backend won't start
**Fix:**
1. Check for compilation errors in console
2. Make sure all imports are correct
3. Verify package names match

---

## Next Steps

After completing this:
1. Test manually in Postman or curl
2. Test in the frontend application
3. Verify Test 1.5 now passes
4. Move on to frontend fixes for responsive design

---

**Time Investment:** 10 minutes  
**Impact:** Fixes Test 1.5 + improves overall error handling  
**Difficulty:** Easy (copy/paste with minor updates)
