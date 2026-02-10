## Production Build Process

### Backend Production Build

#### Step 1: Clean Previous Builds

```bash
cd dental-clinic-backend
mvn clean
```

**Expected Output:**
```
[INFO] Deleting target directory
[INFO] BUILD SUCCESS
```

---

#### Step 2: Run Tests (if any exist)

```bash
mvn test
```

**Expected Output:**
```
[INFO] Tests run: X, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

**Note:** If you haven't written unit tests yet, that's okay for this project. For production applications, comprehensive tests are recommended.

---

#### Step 3: Package Application

```bash
mvn package -DskipTests
```

**Expected Output:**
```
[INFO] Building jar: target/dental-clinic-backend-0.0.1-SNAPSHOT.jar
[INFO] BUILD SUCCESS
[INFO] Total time: 15.234 s
```

**Verify JAR Created:**
```bash
ls -lh target/*.jar
```

**Expected:**
```
dental-clinic-backend-0.0.1-SNAPSHOT.jar (size ~50-60 MB)
```

---

#### Step 4: Test Production JAR

```bash
# Stop development server if running
# Then run the JAR
java -jar target/dental-clinic-backend-0.0.1-SNAPSHOT.jar
```

**Expected Console Output:**
```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::        (v3.2.1)

2026-02-02 10:00:00.000  INFO ... Started DentalClinicApplication in 3.456 seconds
```

**Test the API:**
```bash
# In another terminal
curl http://localhost:8080/api/patients
```

**Expected:** JSON response with patients

**Stop JAR:** Ctrl+C

**Result:** [ ] PASS  [ ] FAIL

---

### Frontend Production Build

#### Step 1: Clean Previous Builds

```bash
cd dental-clinic-frontend
rm -rf dist/
```

---

#### Step 2: Install Dependencies (if not already)

```bash
npm install
```

---

#### Step 3: Build for Production

```bash
npm run build
```

**Expected Output:**
```
vite v5.0.8 building for production...
✓ 142 modules transformed.
dist/index.html                   0.45 kB │ gzip:  0.30 kB
dist/assets/react-...svg          4.13 kB │ gzip:  2.05 kB
dist/assets/index-...css          8.27 kB │ gzip:  2.31 kB
dist/assets/index-...js         143.42 kB │ gzip: 46.11 kB
✓ built in 5.23s
```

**Verify Build:**
```bash
ls -lh dist/
```

**Expected Contents:**
```
dist/
├── assets/
│   ├── index-[hash].css
│   └── index-[hash].js
├── index.html
└── vite.svg
```

---

#### Step 4: Test Production Build Locally

**Option 1: Using Vite Preview:**
```bash
npm run preview
```

**Expected:**
```
Local: http://localhost:4173/
```

Open browser to `http://localhost:4173/` and verify:
- ✅ Page loads correctly
- ✅ All features work
- ✅ API calls succeed (backend must be running)
- ✅ No console errors

**Option 2: Using Simple HTTP Server:**
```bash
# Install serve globally (one time)
npm install -g serve

# Serve the dist folder
serve -s dist -p 4173
```

**Result:** [ ] PASS  [ ] FAIL

---

### Build Verification Checklist

**Backend JAR:**
- [ ] JAR file created in target/
- [ ] JAR runs without errors
- [ ] All endpoints accessible
- [ ] Database connection works
- [ ] File size reasonable (~50-60 MB)

**Frontend Build:**
- [ ] dist/ folder created
- [ ] index.html present
- [ ] Assets folder with CSS and JS
- [ ] Preview works correctly
- [ ] No console errors
- [ ] All features functional

**Integration:**
- [ ] Frontend can connect to backend
- [ ] CORS working correctly
- [ ] All API calls succeed
- [ ] Data displays properly
