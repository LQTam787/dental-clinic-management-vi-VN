# Session 3 - Infinite Recursion Fix

## Problem Identified

When you call `GET /api/patients`, you're getting this error:
```
Could not write JSON: Infinite recursion (StackOverflowError)
```

## Root Cause

This is a **circular reference problem** in JPA bidirectional relationships:

```
Patient → appointments (List) → Appointment → patient → appointments → ...
```

When Jackson tries to serialize Patient to JSON, it creates an infinite loop.

## The Solution

We need to add Jackson annotations to break the circular reference:

### 1. Update Patient.java

**Add this import:**
```java
import com.fasterxml.jackson.annotation.JsonManagedReference;
```

**Add annotation to the appointments field:**
```java
@OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
@JsonManagedReference  // ADD THIS LINE
private List<Appointment> appointments = new ArrayList<>();
```

### 2. Update Appointment.java

**Add this import:**
```java
import com.fasterxml.jackson.annotation.JsonBackReference;
```

**Add annotation to the patient field:**
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "patient_id", nullable = false)
@JsonBackReference  // ADD THIS LINE
private Patient patient;
```

## What These Annotations Do

- **`@JsonManagedReference`** (on Patient.appointments): "I manage this side of the relationship, serialize it"
- **`@JsonBackReference`** (on Appointment.patient): "Don't serialize me to avoid circular reference"

## Result After Fix

**GET /api/patients** will now return:
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "birthYear": 1985,
    "gender": "Male",
    "phone": "555-0101",
    "address": "123 Main St",
    "appointments": [
      {
        "id": 1,
        "date": "2024-03-15",
        "diagnosis": "Cavity in molar",
        "treatment": "Filling",
        "needsImplant": false,
        "needsDenture": false,
        "needsOrthodontics": false,
        "fee": 150.00,
        "note": "Follow-up in 6 months"
        // NOTE: No "patient" field here - prevents infinite loop!
      }
    ]
  }
]
```

**GET /api/appointments/with-patients** will still work perfectly because it uses DTOs (not entities)!

## Steps to Apply the Fix

1. **Replace Patient.java** in your project with the fixed version
   - Location: `src/main/java/com/dentalclinic/model/Patient.java`
   - Add `@JsonManagedReference` on appointments field

2. **Replace Appointment.java** in your project with the fixed version
   - Location: `src/main/java/com/dentalclinic/model/Appointment.java`
   - Add `@JsonBackReference` on patient field

3. **Restart the application** in STS4
   - Boot Dashboard → Stop
   - Boot Dashboard → (Re)start

4. **Test again**
   - `GET http://localhost:8080/api/patients` ✅ Should work now!
   - `GET http://localhost:8080/api/appointments/with-patients` ✅ Still works!

## Alternative Solution (If You Prefer)

If you don't want to include appointments when returning patients, you can use `@JsonIgnore` instead:

```java
@OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
@JsonIgnore  // This completely ignores appointments when serializing Patient
private List<Appointment> appointments = new ArrayList<>();
```

This approach is simpler but means `GET /api/patients` won't show the appointments list.

## Why the /with-patients Endpoint Works

The `/api/appointments/with-patients` endpoint works fine because it returns **DTOs** (not entities), which have a flat structure with no circular references!

---

**Apply these fixes and your API will work perfectly!** ✅
