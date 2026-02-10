# Session 4: Frontend Setup & Basic UI
## Dental Clinic Management System

**Duration:** 1-2 hours  
**Goal:** Initialize React project, create basic component structure, set up API service layer, and display data in a table

---

## Pre-Session Checklist

Before starting Session 4, verify you have completed:

### ✅ Backend Prerequisites (Sessions 1-3)
- [ ] Spring Boot backend project created and running
- [ ] PostgreSQL database configured with tables created
- [ ] All REST endpoints working and tested
- [ ] Backend running on `http://localhost:8080`
- [ ] Can access: `http://localhost:8080/api/appointments/with-patients`

### ✅ Development Environment
- [ ] Node.js installed (v18 or higher)
  ```bash
  node -v  # Should show v18.x.x or higher
  npm -v   # Should show 9.x.x or higher
  ```
- [ ] VS Code installed with React extensions (see VS Code Setup Guide)
- [ ] Modern web browser (Chrome, Edge, or Firefox)

### ✅ VS Code Extensions Installed
- [ ] ES7+ React/Redux/React-Native snippets (dsznajder)
- [ ] Prettier - Code formatter (esbenp)
- [ ] ESLint (dbaeumer)
- [ ] Auto Rename Tag (formulahendry)
- [ ] Auto Close Tag (formulahendry)

**If any of these are not ready, complete them before proceeding!**

---

## Part 1: Create React Project (15 minutes)

### Step 1.1: Create Project Directory

Open your terminal (PowerShell, Command Prompt, or VS Code integrated terminal):

```bash
# Navigate to your development folder
cd C:\Dev  # Or wherever you keep your projects

# Verify backend folder exists
dir
# You should see: dental-clinic-backend

# Create frontend project using Vite
npm create vite@latest dental-clinic-frontend -- --template react
```

**Expected Output:**
```
✔ Select a framework: › React
✔ Select a variant: › JavaScript

Scaffolding project in C:\Dev\dental-clinic-frontend...

Done. Now run:

  cd dental-clinic-frontend
  npm install
  npm run dev
```

### Step 1.2: Navigate and Install Dependencies

```bash
# Navigate into the new project
cd dental-clinic-frontend

# Install dependencies (this will take 1-2 minutes)
npm install

# You should see: added XXX packages
```

### Step 1.3: Install Axios for API Calls

```bash
# Install axios for HTTP requests
npm install axios
```

**Verification:**
```bash
# Check package.json was updated
cat package.json  # Linux/Mac
type package.json # Windows

# Should see axios in dependencies
```

### Step 1.4: Initial Test Run

```bash
# Start development server
npm run dev
```

**Expected Output:**
```
VITE v5.0.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Open browser to:** `http://localhost:5173`

**You should see:** Default Vite + React welcome page with spinning React logo

**Success Indicator:** ✅ If you see the React page, your setup is working!

**Stop the server:** Press `Ctrl+C` in terminal

---

## Part 2: Project Structure Setup (10 minutes)

### Step 2.1: Open Project in VS Code

```bash
# From your terminal (still in dental-clinic-frontend folder)
code .

# Or: File → Open Folder → Select dental-clinic-frontend
```

### Step 2.2: Understand Current Structure

Your project should look like this:

```
dental-clinic-frontend/
├── node_modules/        # Dependencies (ignore)
├── public/              # Static assets
│   └── vite.svg
├── src/                 # Your code goes here
│   ├── assets/
│   ├── App.css
│   ├── App.jsx         # Main component
│   ├── index.css
│   └── main.jsx        # Entry point
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

### Step 2.3: Create Project Folders

In VS Code, create these folders inside `src/`:

```bash
# Using VS Code Explorer:
# Right-click src → New Folder

src/
├── components/    # UI components
├── services/      # API calls
└── (existing files)
```

**Or use terminal:**
```bash
# Make sure you're in dental-clinic-frontend folder
mkdir src\components  # Windows
mkdir src\services

# Or Linux/Mac:
mkdir src/components
mkdir src/services
```

### Step 2.4: Verify Folder Structure

Your `src/` folder should now look like:

```
src/
├── assets/
├── components/    # ← New
├── services/      # ← New
├── App.css
├── App.jsx
├── index.css
└── main.jsx
```

---

## Part 3: Create API Service Layer (15 minutes)

### Step 3.1: Create API Configuration File

**Create:** `src/services/api.js`

**In VS Code:**
1. Right-click `src/services` folder → New File
2. Name it: `api.js`
3. Copy and paste the following code:

```javascript
import axios from 'axios';

// Base URL for backend API
const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Patient API endpoints
export const patientAPI = {
  // Get all patients
  getAll: () => api.get('/patients'),
  
  // Get single patient by ID
  getById: (id) => api.get(`/patients/${id}`),
  
  // Create new patient
  create: (patient) => api.post('/patients', patient),
  
  // Update existing patient
  update: (id, patient) => api.put(`/patients/${id}`, patient),
  
  // Delete patient
  delete: (id) => api.delete(`/patients/${id}`),
};

// Appointment API endpoints
export const appointmentAPI = {
  // Get all appointments
  getAll: () => api.get('/appointments'),
  
  // Get single appointment by ID
  getById: (id) => api.get(`/appointments/${id}`),
  
  // Create new appointment
  create: (appointment) => api.post('/appointments', appointment),
  
  // Update existing appointment
  update: (id, appointment) => api.put(`/appointments/${id}`, appointment),
  
  // Delete appointment
  delete: (id) => api.delete(`/appointments/${id}`),
  
  // MAIN ENDPOINT: Get appointments with patient data (for UI)
  getWithPatients: (params) => {
    return api.get('/appointments/with-patients', { params });
  },
};

// Export the base api instance as default
export default api;
```

**Save the file:** `Ctrl+S`

### Step 3.2: Understand the API Structure

**Key Concepts:**

1. **Base URL Configuration:**
   ```javascript
   const API_BASE_URL = 'http://localhost:8080/api';
   ```
   - Points to your Spring Boot backend
   - Change this if backend runs on different port

2. **Axios Instance:**
   ```javascript
   const api = axios.create({ ... });
   ```
   - Reusable HTTP client
   - Pre-configured headers

3. **API Modules:**
   - `patientAPI` - Patient-related operations
   - `appointmentAPI` - Appointment-related operations

4. **Main UI Endpoint:**
   ```javascript
   getWithPatients: (params) => { ... }
   ```
   - This is what your UI will primarily use
   - Returns appointments WITH patient data joined
   - Supports search and filter parameters

---

## Part 4: Create Initial Components (15 minutes)

### Step 4.1: Create AppointmentTable Component

**Create:** `src/components/AppointmentTable.jsx`

```javascript
import React from 'react';

function AppointmentTable({ appointments, loading }) {
  if (loading) {
    return <div className="loading">Loading appointments...</div>;
  }

  if (!appointments || appointments.length === 0) {
    return <div className="no-data">No appointments found</div>;
  }

  return (
    <div className="appointment-table-container">
      <table className="appointment-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Patient Name</th>
            <th>Birth Year</th>
            <th>Gender</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Diagnosis</th>
            <th>Treatment</th>
            <th>Implant</th>
            <th>Denture</th>
            <th>Orthodontics</th>
            <th>Fee</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((apt) => (
            <tr key={apt.appointmentId}>
              <td>{new Date(apt.date).toLocaleDateString()}</td>
              <td>{apt.patientName}</td>
              <td>{apt.birthYear}</td>
              <td>{apt.gender}</td>
              <td>{apt.phone}</td>
              <td>{apt.address || '—'}</td>
              <td>{apt.diagnosis || '—'}</td>
              <td>{apt.treatment || '—'}</td>
              <td>{apt.needsImplant ? '✓' : '—'}</td>
              <td>{apt.needsDenture ? '✓' : '—'}</td>
              <td>{apt.needsOrthodontics ? '✓' : '—'}</td>
              <td>{apt.fee ? `$${apt.fee.toFixed(2)}` : '—'}</td>
              <td>{apt.note || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AppointmentTable;
```

**Save:** `Ctrl+S`

### Step 4.2: Update Main App Component

**Edit:** `src/App.jsx`

**Replace entire contents with:**

```javascript
import { useState, useEffect } from 'react';
import AppointmentTable from './components/AppointmentTable';
import { appointmentAPI } from './services/api';
import './App.css';

function App() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch appointments when component mounts
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await appointmentAPI.getWithPatients({});
      console.log('Fetched appointments:', response.data);
      setAppointments(response.data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Dental Clinic Management</h1>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        <AppointmentTable 
          appointments={appointments}
          loading={loading}
        />
      </main>
    </div>
  );
}

export default App;
```

**Save:** `Ctrl+S`

### Step 4.3: Add Basic Styling

**Edit:** `src/App.css`

**Replace entire contents with:**

```css
/* Reset and base styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f5f5;
}

.App {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header */
.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.app-header h1 {
  font-size: 2rem;
  font-weight: 600;
}

/* Main content */
.app-main {
  flex: 1;
  padding: 2rem;
  max-width: 1800px;
  margin: 0 auto;
  width: 100%;
}

/* Error message */
.error-message {
  background-color: #fee;
  color: #c33;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #fcc;
  margin-bottom: 1rem;
  font-weight: 500;
}

/* Loading state */
.loading {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: #666;
}

/* No data state */
.no-data {
  text-align: center;
  padding: 3rem;
  font-size: 1.1rem;
  color: #999;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* Table container */
.appointment-table-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow-x: auto;
}

/* Table styles */
.appointment-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.appointment-table thead {
  background-color: #f8f9fa;
  position: sticky;
  top: 0;
  z-index: 10;
}

.appointment-table th {
  padding: 1rem 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #dee2e6;
  white-space: nowrap;
}

.appointment-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #e9ecef;
  color: #495057;
}

.appointment-table tbody tr {
  transition: background-color 0.2s;
}

.appointment-table tbody tr:hover {
  background-color: #f8f9fa;
}

/* Responsive design */
@media (max-width: 1200px) {
  .appointment-table {
    font-size: 0.85rem;
  }
  
  .appointment-table th,
  .appointment-table td {
    padding: 0.5rem;
  }
}

@media (max-width: 768px) {
  .app-header {
    padding: 1rem;
  }
  
  .app-header h1 {
    font-size: 1.5rem;
  }
  
  .app-main {
    padding: 1rem;
  }
}
```

**Save:** `Ctrl+S`

---

## Part 5: Testing (15 minutes)

### Step 5.1: Ensure Backend is Running

**Important:** Your Spring Boot backend must be running for the frontend to work!

**Check if backend is running:**

1. **Option A:** Test in browser
   - Open: `http://localhost:8080/api/appointments/with-patients`
   - Should see JSON data (even if empty array `[]`)

2. **Option B:** Check STS4/Eclipse
   - Look for Console output showing "Started DentalClinicApplication"
   - Boot Dashboard should show green play icon

**If backend is NOT running:**
```bash
# In backend project directory
cd C:\Dev\dental-clinic-backend  # Or wherever your backend is

# Run with Maven
mvn spring-boot:run

# Or in STS4: Right-click project → Run As → Spring Boot App
```

### Step 5.2: Start Frontend Development Server

**In your frontend terminal:**

```bash
# Make sure you're in dental-clinic-frontend folder
cd C:\Dev\dental-clinic-frontend

# Start Vite dev server
npm run dev
```

**Expected Output:**
```
VITE v5.0.x  ready in 300 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 5.3: Open Application in Browser

1. Open browser to: `http://localhost:5173`
2. You should see:
   - Header: "Dental Clinic Management"
   - If you have data in database: Table with appointments
   - If database is empty: "No appointments found"

### Step 5.4: Verify Data Loading

**Open Browser Developer Tools:**
- Press `F12` or Right-click → Inspect
- Go to **Console** tab

**Expected console output:**
```
Fetched appointments: Array(X)
```

**If you see an error:**

**Common Error 1: Network Error / CORS**
```
Access to XMLHttpRequest at 'http://localhost:8080/api/appointments/with-patients' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution:** Check your Spring Boot CORS configuration
```java
// Should exist in: src/main/java/.../config/CorsConfig.java
@CrossOrigin(origins = "http://localhost:5173")
```

**Common Error 2: Backend Not Running**
```
Error fetching appointments: Error: Network Error
```

**Solution:** Start your Spring Boot backend (see Step 5.1)

### Step 5.5: Browser Testing Checklist

**Visual Verification:**
- [ ] Page loads without errors
- [ ] Header displays correctly
- [ ] Table is visible (or "No appointments found" if database empty)
- [ ] Styling looks professional
- [ ] No console errors (red messages)

**Network Verification:**
- [ ] Open Network tab (F12 → Network)
- [ ] Refresh page
- [ ] See request to: `with-patients` endpoint
- [ ] Status: 200 OK (green)
- [ ] Response contains data (or empty array)

---

## Part 6: Add Sample Data for Testing (Optional - 10 minutes)

### If Your Database is Empty

**Option A: Using pgAdmin**

1. Open pgAdmin 4
2. Connect to `dental_clinic` database
3. Tools → Query Tool
4. Paste and run:

```sql
-- Insert sample patients
INSERT INTO patients (name, birth_year, gender, phone, address) VALUES
('John Doe', 1985, 'Male', '555-0101', '123 Main St'),
('Jane Smith', 1990, 'Female', '555-0102', '456 Oak Ave'),
('Bob Johnson', 1975, 'Male', '555-0103', '789 Pine Rd');

-- Insert sample appointments
INSERT INTO appointments (date, diagnosis, treatment, needs_implant, needs_denture, needs_orthodontics, fee, note, patient_id) VALUES
('2024-03-15', 'Cavity in molar', 'Filling', FALSE, FALSE, FALSE, 150.00, 'Follow-up in 6 months', 1),
('2024-03-16', 'Missing tooth', 'Implant consultation', TRUE, FALSE, FALSE, 200.00, 'Schedule implant surgery', 2),
('2024-03-17', 'Routine checkup', 'Cleaning', FALSE, FALSE, FALSE, 100.00, 'Good oral health', 3),
('2024-03-18', 'Crooked teeth', 'Orthodontic assessment', FALSE, FALSE, TRUE, 300.00, 'Consider braces', 1);
```

**Option B: Using Postman**

1. POST to `http://localhost:8080/api/patients`
2. Body (JSON):
```json
{
  "name": "John Doe",
  "birthYear": 1985,
  "gender": "Male",
  "phone": "555-0101",
  "address": "123 Main St"
}
```

3. Then POST to `http://localhost:8080/api/appointments` with patient ID

### After Adding Data

**Refresh your browser** (`Ctrl+R` or `F5`)

**You should now see:**
- Table populated with appointment data
- Patient information displayed
- Proper date formatting
- Checkmarks for treatment needs
- Fee amounts formatted as currency

---

## Troubleshooting Guide

### Problem 1: "npm: command not found"

**Cause:** Node.js not installed or not in PATH

**Solution:**
```bash
# Download and install Node.js from: https://nodejs.org
# Choose LTS version (Long Term Support)
# Restart terminal after installation
node -v  # Verify installation
```

### Problem 2: Port 5173 Already in Use

**Error:** `Port 5173 is already in use`

**Solution:**
```bash
# Option A: Kill existing process
# Windows:
netstat -ano | findstr :5173
taskkill /PID <process_id> /F

# Option B: Use different port
npm run dev -- --port 5174
```

### Problem 3: CORS Error in Browser Console

**Error:** "blocked by CORS policy"

**Solution:**

1. **Check backend CORS configuration:**
```java
// src/main/java/.../config/CorsConfig.java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:5173")  // ← Check this!
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*");
            }
        };
    }
}
```

2. **Restart Spring Boot backend**

### Problem 4: Data Not Displaying

**Symptoms:** "No appointments found" but you have data

**Debug Steps:**

1. **Check console for errors:**
   - Press F12 → Console tab
   - Look for error messages

2. **Check Network request:**
   - F12 → Network tab
   - Refresh page
   - Click on `with-patients` request
   - Check Response tab - should show JSON data

3. **Verify API endpoint:**
   - Open in browser: `http://localhost:8080/api/appointments/with-patients`
   - Should see JSON data

4. **Check component props:**
   ```javascript
   // Add this in App.jsx after fetching data
   console.log('Appointments:', appointments);
   console.log('Loading:', loading);
   console.log('Error:', error);
   ```

### Problem 5: Styling Not Applied

**Symptoms:** Page looks plain/unstyled

**Solution:**

1. Verify `App.css` is imported in `App.jsx`
2. Hard refresh: `Ctrl+Shift+R`
3. Check browser console for CSS errors
4. Verify file saved: `Ctrl+S`

---

## Session 4 Completion Checklist

### ✅ Project Setup Complete
- [ ] React project created with Vite
- [ ] Dependencies installed (axios)
- [ ] Project folder structure organized
- [ ] VS Code opened with project

### ✅ Code Files Created
- [ ] `src/services/api.js` - API configuration
- [ ] `src/components/AppointmentTable.jsx` - Table component
- [ ] `src/App.jsx` - Updated main component
- [ ] `src/App.css` - Updated styles

### ✅ Testing Verified
- [ ] Frontend runs: `npm run dev` works
- [ ] Backend is running on port 8080
- [ ] Browser opens: `http://localhost:5173`
- [ ] No CORS errors in console
- [ ] Data loads successfully
- [ ] Table displays appointments (or shows "No appointments found")

### ✅ Understanding Achieved
- [ ] Understand how React components work
- [ ] Understand how axios makes API calls
- [ ] Understand component props and state
- [ ] Understand useEffect for data fetching

---

## What You've Built

**Architecture Overview:**

```
Browser (localhost:5173)
    ↓
React App (src/App.jsx)
    ↓
API Service (src/services/api.js)
    ↓ HTTP Request
Spring Boot Backend (localhost:8080)
    ↓
PostgreSQL Database
```

**Data Flow:**

1. **Component Mounts:** `App.jsx` runs `useEffect`
2. **API Call:** Calls `appointmentAPI.getWithPatients()`
3. **HTTP Request:** Axios sends GET to backend
4. **Backend Processing:** Spring Boot queries database
5. **Response:** JSON data returned to frontend
6. **State Update:** React updates `appointments` state
7. **Re-render:** `AppointmentTable` displays data

---

## Next Steps (Session 5)

In the next session, you'll add:

1. **Search Bar** - Filter by patient name or phone
2. **Treatment Filters** - Checkbox filters for implant/denture/orthodontics
3. **Dynamic Filtering** - Results update as you type/click
4. **Debouncing** - Optimize search performance

**Estimated Time:** 1-2 hours

---

## Quick Reference Commands

### Development Workflow

```bash
# Start backend (in backend folder)
mvn spring-boot:run

# Start frontend (in frontend folder)
npm run dev

# Stop frontend
Ctrl+C (in terminal)

# Install new package
npm install package-name

# Check for errors
npm run build  # Production build test
```

### VS Code Shortcuts

```
Ctrl+P              → Quick file open
Ctrl+`              → Toggle terminal
Ctrl+B              → Toggle sidebar
Ctrl+/              → Toggle comment
Ctrl+S              → Save file
Ctrl+Shift+F        → Search in all files
```

---

## Getting Help

**If you're stuck:**

1. **Check browser console** (F12 → Console tab)
2. **Check VS Code terminal** for error messages
3. **Verify backend is running** (test in browser)
4. **Review this guide's Troubleshooting section**
5. **Check Network tab** (F12 → Network) for API requests

**Common Issue Quick Fixes:**

- Can't see data → Check backend is running
- CORS error → Restart backend after config change
- Styling wrong → Hard refresh browser (Ctrl+Shift+R)
- Port in use → Change port or kill process
- Import error → Check file paths and names match exactly

---

**🎉 Congratulations!**

You've successfully completed Session 4! Your React frontend is now:
- ✅ Communicating with Spring Boot backend
- ✅ Fetching and displaying appointment data
- ✅ Styled professionally
- ✅ Ready for search and filter features (Session 5)

**Take a screenshot of your working application and save it!**

---

*Session 4 completed: [Date/Time]*

**Next Session:** Session 5 - Search & Filter Implementation
