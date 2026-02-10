# Session 1 Quick Setup Guide

## What You Have Now

I've created a complete Spring Boot backend project structure with:

1. **Maven Configuration (pom.xml)**
   - Spring Boot 3.2.1
   - Spring Web (for REST APIs)
   - Spring Data JPA (for database operations)
   - PostgreSQL driver
   - Lombok (reduces boilerplate code)
   - DevTools (hot reload during development)

2. **Entity Models**
   - `Patient.java` - Represents patient data
   - `Appointment.java` - Represents appointment data
   - Relationship: One patient can have many appointments

3. **Configuration**
   - `application.properties` - Database and JPA settings
   - Configured for PostgreSQL on localhost:5432

4. **Main Application**
   - `DentalClinicApplication.java` - Spring Boot entry point

## Your Action Items (In Order)

### 1. Save the Project Files

Download the `dental-clinic-backend` folder from the outputs and save it to your desktop or preferred location.

### 2. Import into STS4

**Steps:**
```
STS4 → File → Import
    → Maven → Existing Maven Projects
    → Browse to where you saved dental-clinic-backend
    → Select the folder
    → Click Finish
```

**Wait for:**
- Maven to download dependencies (2-5 minutes first time)
- "Building workspace" to complete
- Progress bar in bottom-right corner

### 3. Update Database Password

**Open:** `src/main/resources/application.properties`

**Find this line:**
```
spring.datasource.password=your_password_here
```

**Replace with your actual PostgreSQL password:**
```
spring.datasource.password=YourActualPassword123
```

**Save the file** (Ctrl+S)

### 4. Ensure Database Exists

**Option A: Using pgAdmin 4**
- Open pgAdmin 4
- Check if "dental_clinic" database exists under Databases
- If not, create it: Right-click Databases → Create → Database → Name: dental_clinic

**Option B: Using command line**
```bash
psql -U postgres
CREATE DATABASE dental_clinic;
\q
```

### 5. Run the Application

**In STS4:**

**Method 1 (Easiest):**
- Find "Boot Dashboard" panel (usually at bottom)
- If not visible: Window → Show View → Other → Spring → Boot Dashboard
- Right-click "dental-clinic-backend" → (Re)start
- Or click the green play button

**Method 2:**
- Right-click `DentalClinicApplication.java`
- Run As → Spring Boot App

### 6. Verify Success

**Look for in Console:**
```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/

Started DentalClinicApplication in X.XXX seconds (JVM running for X.XXX)
```

**Also look for Hibernate creating tables:**
```
Hibernate: create table appointments (...)
Hibernate: create table patients (...)
```

### 7. Check Database Tables

**Open pgAdmin 4:**
```
Servers → PostgreSQL 15 → Databases → dental_clinic
    → Schemas → public → Tables → Refresh
```

**You should see:**
- `appointments` table
- `patients` table

**Right-click each table → Properties → Columns** to verify structure

## Success Criteria

✅ Application starts without errors
✅ Console shows "Started DentalClinicApplication"
✅ Two tables created in database
✅ No red error messages in console
✅ STS4 shows green indicator in Boot Dashboard

## Common Issues & Quick Fixes

### "Cannot connect to database"
- ✓ Check PostgreSQL service is running
- ✓ Verify password in application.properties
- ✓ Confirm database "dental_clinic" exists

### "Port 8080 already in use"
- ✓ Stop other running applications in Boot Dashboard
- ✓ Or change to port 8081 in application.properties

### "Cannot resolve Lombok annotations"
- ✓ Install Lombok plugin: Help → Eclipse Marketplace → Search "lombok"
- ✓ Restart STS4
- ✓ Right-click project → Maven → Update Project

### Tables not created
- ✓ Check console for Hibernate SQL statements
- ✓ Verify `spring.jpa.hibernate.ddl-auto=update` in properties
- ✓ Ensure database connection successful

## Project File Structure

```
dental-clinic-backend/
├── pom.xml                                    ← Maven configuration
└── src/
    └── main/
        ├── java/
        │   └── com/dentalclinic/
        │       ├── DentalClinicApplication.java    ← Main class
        │       └── model/
        │           ├── Patient.java                ← Patient entity
        │           └── Appointment.java            ← Appointment entity
        └── resources/
            └── application.properties              ← Database config
```

## What Each File Does

**pom.xml**
- Defines project dependencies (Spring Boot, PostgreSQL, etc.)
- Maven uses this to download required libraries

**DentalClinicApplication.java**
- Entry point of the application
- Starts Spring Boot when you run it

**Patient.java**
- Defines the structure of the patients table
- Maps to database table "patients"
- One patient can have many appointments

**Appointment.java**
- Defines the structure of the appointments table
- Maps to database table "appointments"
- Each appointment belongs to one patient

**application.properties**
- Database connection settings (URL, username, password)
- JPA/Hibernate configuration
- Server port (8080)

## Next Steps After Session 1

Once everything above is working, you're ready for **Session 2**:
- Create Repository interfaces (data access layer)
- Create Service classes (business logic layer)
- Add custom database queries
- Test retrieving data

**Estimated Session 2 Time:** 1-2 hours

## Testing Your Setup

After running the application, try this in pgAdmin:

**Check if tables exist:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

**View patients table structure:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'patients';
```

**View appointments table structure:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'appointments';
```

All should return results if setup is successful!

## Time Estimate

- Importing into STS4: 5 minutes
- Maven downloading dependencies: 2-5 minutes (first time)
- Updating password and running: 2 minutes
- Verifying in database: 2 minutes

**Total: ~15-20 minutes**

---

**You're doing great! Once you complete these steps, Session 1 is complete and you'll have a solid foundation for the rest of the project.** 🎉
