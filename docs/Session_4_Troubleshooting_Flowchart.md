# Session 4 Troubleshooting Flowchart

## START HERE: Frontend Not Working?

```
┌─────────────────────────────────────────────────────────┐
│  Can you access http://localhost:5173 in browser?      │
└───────────────┬─────────────────────┬───────────────────┘
                │                     │
              YES                    NO
                │                     │
                v                     v
    ┌──────────────────────┐  ┌──────────────────────────┐
    │ Is the page blank    │  │ Is npm run dev running?  │
    │ or showing errors?   │  └──────┬───────────┬───────┘
    └──┬────────────┬──────┘         │           │
       │            │               YES          NO
      YES          NO                │           │
       │            │                v           v
       v            v         ┌──────────┐  ┌──────────┐
    Go to       ┌─────────┐  │ Check    │  │ Run:     │
    SECTION A   │ Working │  │ terminal │  │ npm run  │
                │ ! ✓     │  │ for      │  │ dev      │
                └─────────┘  │ errors   │  └──────────┘
                             └──────────┘
```

---

## SECTION A: Page Loads But Has Issues

### A1: "No appointments found" showing

```
┌──────────────────────────────────────────────────┐
│ Open browser DevTools (F12) → Console tab       │
└────────────────────┬─────────────────────────────┘
                     │
                     v
┌──────────────────────────────────────────────────┐
│ Do you see error messages in red?               │
└────┬─────────────────────────────────┬──────────┘
     │                                 │
    YES                               NO
     │                                 │
     v                                 v
Go to A2                      ┌────────────────────┐
(Console Errors)              │ Open Network tab   │
                              │ Refresh page (F5)  │
                              └─────────┬──────────┘
                                        │
                                        v
                              ┌────────────────────┐
                              │ See "with-patients"│
                              │ request?           │
                              └─┬────────────────┬─┘
                                │                │
                               YES              NO
                                │                │
                                v                v
                          Go to A3        ┌──────────────┐
                          (Network)       │ API call not │
                                          │ being made.  │
                                          │ Check App.jsx│
                                          │ useEffect    │
                                          └──────────────┘
```

### A2: Console Errors

```
┌────────────────────────────────────────────────────┐
│ What error do you see?                            │
└┬───────────────┬────────────────┬──────────────┬──┘
 │               │                │              │
 │               │                │              │
 v               v                v              v
"CORS"        "Network"      "Module"        "Cannot"
Error         Error          not found       read property
 │               │                │              │
 │               │                │              │
 v               v                v              v
┌────┐    ┌────────────┐   ┌──────────┐   ┌─────────────┐
│Fix │    │Is backend  │   │Check     │   │Check data   │
│CORS│    │running?    │   │import    │   │structure    │
│(B1)│    │on 8080?    │   │paths     │   │matches code │
└────┘    └─┬────────┬─┘   └──────────┘   └─────────────┘
            │        │
          YES       NO
            │        │
            v        v
         ┌────┐  ┌────────┐
         │Fix │  │Start   │
         │URL │  │backend │
         │(B2)│  │first!  │
         └────┘  └────────┘
```

### A3: Network Tab Shows Request

```
┌──────────────────────────────────────┐
│ What status code shows?              │
└┬────────────┬──────────────┬─────────┘
 │            │              │
200 OK      304           4xx/5xx
 │            │              │
 v            v              v
┌──────┐  ┌──────┐    ┌────────────┐
│Check │  │Cache │    │Backend     │
│data  │  │issue │    │error       │
│in    │  │Ctrl+ │    │Check       │
│Response│ │Shift│    │backend     │
│tab   │  │+R   │    │console     │
└──┬───┘  └─────┘    └────────────┘
   │
   v
┌────────────────────────┐
│Is response an array?   │
└───┬────────────────┬───┘
    │                │
  YES               NO
    │                │
    v                v
┌─────────┐    ┌──────────┐
│Response │    │Backend   │
│structure│    │returning │
│correct? │    │wrong     │
│Check if │    │format    │
│empty [] │    └──────────┘
└─────────┘
```

---

## SECTION B: Specific Error Solutions

### B1: CORS Error Fix

**Error Message:**
```
Access to XMLHttpRequest at 'http://localhost:8080/api/...' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution Steps:**

```
Step 1: Check Backend CORS Configuration
────────────────────────────────────────
File: src/main/java/.../config/CorsConfig.java

Should contain:
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:5173")  // ← IMPORTANT!
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*");
            }
        };
    }
}

Step 2: Restart Backend
───────────────────────
In STS4:
- Click red square to stop
- Click green play to start

Or terminal:
- Ctrl+C to stop
- mvn spring-boot:run

Step 3: Hard Refresh Browser
─────────────────────────────
Ctrl+Shift+R (not just F5)

Step 4: Check Console Again
────────────────────────────
Should not see CORS error anymore
```

### B2: Wrong API URL

**Symptom:** Network error, can't connect

**Solution:**

```
Check: src/services/api.js

const API_BASE_URL = 'http://localhost:8080/api';
                      ↑
                      Must match backend port!

Common mistakes:
✗ http://localhost:3000/api  (wrong port)
✗ http://localhost:8080      (missing /api)
✗ http://localhost:8080/     (missing api)
✓ http://localhost:8080/api  (correct!)
```

### B3: Backend Not Running

**How to verify:**

```
Method 1: Browser Test
──────────────────────
Open: http://localhost:8080/api/appointments/with-patients

✓ Shows JSON data → Backend is running
✗ "This site can't be reached" → Backend is NOT running

Method 2: STS4 Check
────────────────────
Look at:
- Console output: Should show "Started DentalClinicApplication"
- Boot Dashboard: Green play icon next to project

Method 3: Terminal Check
────────────────────────
Windows: netstat -ano | findstr :8080
Should show LISTENING

How to start backend:
─────────────────────
STS4: Right-click project → Run As → Spring Boot App
Terminal: mvn spring-boot:run
```

### B4: Import Path Errors

**Error:** `Module not found: Error: Can't resolve './components/...'`

**Solution:**

```
Check exact file names:
───────────────────────
✗ import AppointmentTable from './components/appointmenttable';
✗ import AppointmentTable from './components/AppointmentTable.js';
✗ import AppointmentTable from './Components/AppointmentTable';

✓ import AppointmentTable from './components/AppointmentTable';
  (exact name, no .jsx extension needed)

Common issues:
- Case sensitivity: 'AppointmentTable' ≠ 'appointmentTable'
- File extension: Don't add .jsx in import
- Wrong path: './component/' vs './components/'

File structure check:
────────────────────
src/
├── components/
│   └── AppointmentTable.jsx  ← File must exist here!
├── services/
│   └── api.js                ← File must exist here!
└── App.jsx
```

### B5: Data Structure Mismatch

**Symptom:** Console shows data but table doesn't render

**Debug Steps:**

```javascript
// Add to App.jsx after fetchAppointments():
console.log('Full response:', response);
console.log('Data:', response.data);
console.log('First appointment:', response.data[0]);

// Check console output structure:
Expected:
{
  data: [
    {
      appointmentId: 1,
      date: "2024-03-15",
      patientName: "John Doe",
      // ... other fields
    }
  ]
}

// In AppointmentTable.jsx, check:
appointments.map((apt) => (
  <tr key={apt.appointmentId}>  ← Field name must match!
    <td>{apt.patientName}</td>   ← Field name must match!
  </tr>
))

Common field name mistakes:
✗ apt.id (should be apt.appointmentId)
✗ apt.name (should be apt.patientName)
✗ apt.patient.name (data is already joined)
```

---

## SECTION C: Fresh Start Checklist

### If Everything Seems Broken, Start Over:

```
1. Stop Everything
   ──────────────
   [ ] Stop frontend: Ctrl+C in terminal
   [ ] Stop backend: Red square in STS4

2. Clean Frontend
   ──────────────
   [ ] Close all browser tabs
   [ ] In terminal:
       cd dental-clinic-frontend
       rm -rf node_modules  (or delete folder manually)
       npm install
       
3. Verify Backend
   ──────────────
   [ ] Backend compiles: mvn clean install
   [ ] Start backend
   [ ] Test in browser: http://localhost:8080/api/appointments/with-patients
   [ ] Should see JSON (even if empty array)

4. Start Frontend Fresh
   ────────────────────
   [ ] npm run dev
   [ ] Open new browser tab
   [ ] http://localhost:5173
   [ ] Open DevTools (F12)
   [ ] Check Console and Network tabs

5. Verify Files Exist
   ──────────────────
   [ ] src/services/api.js exists
   [ ] src/components/AppointmentTable.jsx exists
   [ ] src/App.jsx updated with fetch logic
   [ ] src/App.css has styling

6. Check Imports
   ─────────────
   [ ] App.jsx imports AppointmentTable
   [ ] App.jsx imports { appointmentAPI } from './services/api'
   [ ] No red squiggly lines in VS Code
```

---

## SECTION D: Performance Issues

### Page Loads Slowly

```
Possible Causes:

1. Too much data
   ─────────────
   Check: How many appointments in database?
   If > 1000: Need pagination (Session 7+)
   
2. Network slow
   ────────────
   Check: Network tab → Time column
   If > 5 seconds: Backend query optimization needed
   
3. Browser DevTools open
   ──────────────────────
   Sometimes DevTools slows rendering
   Try closing and reopening

4. Multiple console.log statements
   ────────────────────────────────
   Remove debug logs in production code
```

---

## Emergency Contact Card

```
┌──────────────────────────────────────────────────────┐
│ WHEN YOU'RE REALLY STUCK                             │
├──────────────────────────────────────────────────────┤
│                                                      │
│ 1. Take a 5-minute break                            │
│    Clear your mind, grab water                      │
│                                                      │
│ 2. Document the error                               │
│    Take screenshot of:                              │
│    - Console errors (F12)                           │
│    - Network tab                                    │
│    - Your code                                      │
│                                                      │
│ 3. Check basics again                               │
│    ✓ Backend running?                               │
│    ✓ Frontend running?                              │
│    ✓ Correct URLs?                                  │
│    ✓ Files saved?                                   │
│                                                      │
│ 4. Search the error                                 │
│    Google: "React [your error message]"             │
│    Stack Overflow usually has answers               │
│                                                      │
│ 5. Review the master plan                           │
│    Session 4 guide has detailed examples            │
│                                                      │
│ 6. Start fresh                                      │
│    Follow Section C above                           │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## Success Indicators

**You know it's working when:**

✓ Browser loads page without errors
✓ Console shows: "Fetched appointments: Array(X)"
✓ Network tab shows 200 OK status
✓ Table displays data (or "No appointments found" if database empty)
✓ Styling looks professional
✓ No red error messages anywhere

**Screenshot your working app - you earned it!**

---

## Quick Decision Tree

```
Problem? → Check Console (F12)
   ↓
Error in Console?
   ↓
  YES → Read error message → Follow sections above
   ↓
  NO → Check Network tab
   ↓
Request failing?
   ↓
  YES → Check backend (is it running? CORS config?)
   ↓
  NO → Check data structure (console.log response)
   ↓
Data looks correct?
   ↓
  YES → Check component rendering (props, mapping)
   ↓
  NO → Fix backend query/DTO structure
```

---

**Remember:** Most problems are simple:
- Backend not running
- Typo in import path
- CORS misconfiguration
- Wrong port number

**Don't overthink it - check the basics first!**
