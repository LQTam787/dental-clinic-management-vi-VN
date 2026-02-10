# Complete Git Repository & GitHub Upload Guide
## Dental Clinic Management System

**Version:** 1.0  
**Date:** February 8, 2026  
**Purpose:** Package source code into Git repository and upload to GitHub following industry best practices

---

## Table of Contents

1. [Pre-Setup Checklist](#pre-setup-checklist)
2. [Repository Structure Planning](#repository-structure-planning)
3. [Creating .gitignore Files](#creating-gitignore-files)
4. [Creating README.md](#creating-readmemd)
5. [Creating LICENSE](#creating-license)
6. [Git Repository Initialization](#git-repository-initialization)
7. [GitHub Repository Creation](#github-repository-creation)
8. [First Commit & Push](#first-commit--push)
9. [Repository Verification](#repository-verification)
10. [Best Practices Summary](#best-practices-summary)
11. [Troubleshooting](#troubleshooting)

---

## Pre-Setup Checklist

### Software Requirements

**Before starting, ensure you have:**

- [ ] **Git installed** (version 2.30 or higher)
  ```bash
  # Check Git version
  git --version
  # Expected: git version 2.30.0 or higher
  ```
  
  **If not installed:**
  - Windows: Download from https://git-scm.com/download/win
  - Mac: `brew install git` or download from https://git-scm.com/download/mac
  - Linux: `sudo apt-get install git` (Ubuntu/Debian)

- [ ] **GitHub account created**
  - Go to https://github.com/join
  - Create account if you don't have one
  - Verify email address

- [ ] **Git configured with your identity**
  ```bash
  # Set your name
  git config --global user.name "Your Name"
  
  # Set your email (use GitHub email)
  git config --global user.email "your.email@example.com"
  
  # Verify configuration
  git config --global --list
  ```

- [ ] **SSH key configured for GitHub** (RECOMMENDED) OR **Personal Access Token ready**
  
  **Option A: SSH Key (Recommended):**
  ```bash
  # Check if SSH key exists
  ls -la ~/.ssh
  # Look for id_rsa.pub or id_ed25519.pub
  
  # If no key exists, generate one
  ssh-keygen -t ed25519 -C "your.email@example.com"
  # Press Enter to accept default location
  # Enter passphrase (optional but recommended)
  
  # Display public key
  cat ~/.ssh/id_ed25519.pub
  # Copy the entire output
  
  # Add to GitHub:
  # 1. Go to GitHub.com → Settings → SSH and GPG keys
  # 2. Click "New SSH key"
  # 3. Paste your public key
  # 4. Click "Add SSH key"
  
  # Test SSH connection
  ssh -T git@github.com
  # Expected: "Hi username! You've successfully authenticated..."
  ```
  
  **Option B: Personal Access Token (Alternative):**
  ```
  1. Go to GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
  2. Click "Generate new token (classic)"
  3. Give it a note: "Dental Clinic Project"
  4. Select scopes: repo (all), workflow
  5. Click "Generate token"
  6. COPY THE TOKEN - you won't see it again!
  7. Save it securely (password manager)
  ```

### Project Files Status

**Verify your project structure:**

```bash
# Navigate to your project root
cd /path/to/your/projects

# You should have these folders:
dental-clinic-backend/      # Spring Boot backend
dental-clinic-frontend/     # React frontend

# And potentially these documentation files:
Session_8_Final_Complete_Documentation.md
Test_Report_020826.md
Build_Report_020826.md
```

**Checklist:**
- [ ] Backend builds successfully (`mvn package`)
- [ ] Frontend builds successfully (`npm run build`)
- [ ] No uncommitted sensitive data (passwords, API keys)
- [ ] Documentation is up to date

---

## Repository Structure Planning

### Recommended Repository Structure

We will create a **monorepo** structure (all code in one repository):

```
dental-clinic-management/
├── .git/                           # Git metadata (auto-created)
├── .gitignore                      # Root-level gitignore
├── README.md                       # Main project README
├── LICENSE                         # License file
├── docs/                           # Documentation folder
│   ├── Session_8_Final_Complete_Documentation.md
│   ├── Test_Report_020826.md
│   ├── Build_Report_020826.md
│   ├── DEPLOYMENT_GUIDE.md        # Deployment instructions
│   └── USER_MANUAL.md             # User guide
├── backend/                        # Backend application
│   ├── .gitignore                 # Backend-specific gitignore
│   ├── pom.xml                    # Maven configuration
│   ├── README.md                  # Backend-specific README
│   └── src/                       # Source code
│       ├── main/
│       │   ├── java/
│       │   └── resources/
│       └── test/
└── frontend/                       # Frontend application
    ├── .gitignore                 # Frontend-specific gitignore
    ├── package.json               # Node dependencies
    ├── README.md                  # Frontend-specific README
    ├── vite.config.js             # Vite configuration
    ├── index.html                 # Entry HTML
    ├── public/                    # Public assets
    └── src/                       # Source code
        ├── components/
        ├── services/
        └── App.jsx
```

### Why Monorepo?

**Advantages:**
- ✅ Single repository to manage
- ✅ Easier to keep frontend/backend in sync
- ✅ Atomic commits across both projects
- ✅ Simpler CI/CD setup
- ✅ Better for small-to-medium projects

**Alternative: Multi-repo** (separate repos for backend/frontend)
- Only recommended for large teams with separate responsibilities
- Not necessary for this project

---

## Creating .gitignore Files

### Understanding .gitignore

**Purpose:** Tells Git which files/folders to NEVER track
**Critical for:**
- Preventing sensitive data from being committed
- Keeping repository clean
- Reducing repository size
- Avoiding build artifacts in version control

### Root .gitignore

**Location:** `dental-clinic-management/.gitignore`

**Create this file:**

```gitignore
# ==================================================================
# ROOT .GITIGNORE FOR DENTAL CLINIC MANAGEMENT SYSTEM
# ==================================================================
# This file prevents sensitive and generated files from being committed
# Last updated: 2026-02-08

# ==================== OPERATING SYSTEM FILES ====================

# macOS
.DS_Store
.AppleDouble
.LSOverride
._*
.DocumentRevisions-V100
.fseventsd
.Spotlight-V100
.TemporaryItems
.Trashes
.VolumeIcon.icns
.com.apple.timemachine.donotpresent
.AppleDB
.AppleDesktop
Network Trash Folder
Temporary Items
.apdisk

# Windows
Thumbs.db
Thumbs.db:encryptable
ehthumbs.db
ehthumbs_vista.db
*.stackdump
[Dd]esktop.ini
$RECYCLE.BIN/
*.cab
*.msi
*.msix
*.msm
*.msp
*.lnk

# Linux
*~
.directory
.Trash-*
.nfs*

# ==================== IDE / EDITOR FILES ====================

# IntelliJ IDEA
.idea/
*.iml
*.ipr
*.iws
out/
.idea_modules/

# Eclipse
.classpath
.project
.settings/
.metadata
bin/
tmp/
*.tmp
*.bak
*.swp
*~.nib
local.properties

# VS Code
.vscode/
*.code-workspace
.history/

# NetBeans
/nbproject/private/
/nbbuild/
/dist/
/nbdist/
/.nb-gradle/

# JetBrains IDEs (general)
.idea/
*.iml
*.ipr
*.iws
.idea_modules/
atlassian-ide-plugin.xml
com_crashlytics_export_strings.xml
crashlytics.properties
crashlytics-build.properties
fabric.properties

# Vim
[._]*.s[a-v][a-z]
[._]*.sw[a-p]
[._]s[a-rt-v][a-z]
[._]ss[a-gi-z]
[._]sw[a-p]
Session.vim
Sessionx.vim
.netrwhist
*~
tags
[._]*.un~

# Sublime Text
*.tmlanguage.cache
*.tmPreferences.cache
*.stTheme.cache
*.sublime-workspace
*.sublime-project
sftp-config.json
Package Control.last-run
Package Control.ca-list
Package Control.ca-bundle
Package Control.system-ca-bundle
Package Control.cache/
Package Control.ca-certs/
Package Control.merged-ca-bundle
Package Control.user-ca-bundle
oscrypto-ca-bundle.crt
bh_unicode_properties.cache
GitHub.sublime-settings

# ==================== SENSITIVE FILES ====================

# Configuration files with secrets
*.env
.env.local
.env.development.local
.env.test.local
.env.production.local
*.local
secrets/
config/secrets.yml
application-secret.properties

# Database dumps
*.sql
*.dump
*.backup

# Credentials
credentials.json
service-account.json
*.pem
*.key
*.keystore
*.jks

# ==================== BUILD ARTIFACTS ====================

# Compiled files
*.class
*.jar
*.war
*.ear
*.zip
*.tar.gz
*.rar

# Package files
*.7z
*.dmg
*.gz
*.iso
*.tar
*.tgz

# ==================== LOG FILES ====================

# Application logs
*.log
logs/
*.log.*
log/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# ==================== TEMPORARY FILES ====================

# Cache directories
.cache/
*.cache
cache/

# Temporary directories
temp/
tmp/
.tmp/

# ==================== BACKUP FILES ====================

# Backups
*.bak
*.backup
*.old
*~
backup/

# ==================== OTHER ====================

# Node modules (covered in frontend .gitignore but just in case)
node_modules/

# Coverage reports
coverage/
*.cover
*.coverage
.nyc_output
.pytest_cache/

# System files
.fuse_hidden*
.directory
.Trash-*

# Custom
TODO.txt
NOTES.txt
scratch/

# End of root .gitignore
```

**Save this file as:** `dental-clinic-management/.gitignore`

---

### Backend .gitignore

**Location:** `dental-clinic-management/backend/.gitignore`

**Create this file:**

```gitignore
# ==================================================================
# BACKEND (SPRING BOOT / MAVEN) .GITIGNORE
# ==================================================================
# For Java Spring Boot application with Maven
# Last updated: 2026-02-08

# ==================== MAVEN ====================

target/
!.mvn/wrapper/maven-wrapper.jar
!**/src/main/**/target/
!**/src/test/**/target/
pom.xml.tag
pom.xml.releaseBackup
pom.xml.versionsBackup
pom.xml.next
release.properties
dependency-reduced-pom.xml
buildNumber.properties
.mvn/timing.properties
.mvn/wrapper/maven-wrapper.jar

# ==================== GRADLE (if switching to Gradle) ====================

.gradle
**/build/
!src/**/build/
gradle-app.setting
!gradle-wrapper.jar
.gradletasknamecache

# ==================== JAVA ====================

# Compiled class files
*.class

# Log files
*.log

# BlueJ files
*.ctxt

# Mobile Tools for Java (J2ME)
.mtj.tmp/

# Package Files
*.jar
*.war
*.nar
*.ear
*.zip
*.tar.gz
*.rar

# Virtual machine crash logs
hs_err_pid*
replay_pid*

# ==================== SPRING BOOT ====================

# Spring Boot application properties with secrets
application-secret.properties
application-local.properties
application-dev.properties
application-prod.properties

# H2 Database files (if using H2 for testing)
*.db
*.trace.db

# Log files
spring.log
application.log

# ==================== DATABASE ====================

# PostgreSQL
*.sql
*.dump
*.backup

# Database configuration with credentials
database.properties

# ==================== IDE FILES ====================

# IntelliJ IDEA
.idea/
*.iml
*.ipr
*.iws
out/
.idea_modules/

# Eclipse
.classpath
.project
.settings/
bin/

# NetBeans
/nbproject/private/
/nbbuild/
/dist/
/nbdist/
/.nb-gradle/

# VS Code
.vscode/

# ==================== TESTING ====================

# JUnit test results
/test-output/
*.log

# Coverage reports
.jacoco/
jacoco.exec
*.exec

# ==================== OTHER ====================

# OS files
.DS_Store
Thumbs.db

# Application runtime
*.pid

# Temporary files
*.tmp
*.temp
temp/

# Backups
*.bak
*.old

# End of backend .gitignore
```

**Save this file as:** `dental-clinic-management/backend/.gitignore`

---

### Frontend .gitignore

**Location:** `dental-clinic-management/frontend/.gitignore`

**Create this file:**

```gitignore
# ==================================================================
# FRONTEND (REACT / VITE) .GITIGNORE
# ==================================================================
# For React application built with Vite
# Last updated: 2026-02-08

# ==================== DEPENDENCIES ====================

# Node modules
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional stylelint cache
.stylelintcache

# Yarn
.yarn/cache
.yarn/unplugged
.yarn/build-state.yml
.yarn/install-state.gz
.pnp.*

# ==================== BUILD OUTPUT ====================

# Vite build output
dist/
dist-ssr/
build/

# Production build
/build

# ==================== ENVIRONMENT VARIABLES ====================

# Local environment files
.env
.env.local
.env.development
.env.development.local
.env.test
.env.test.local
.env.production
.env.production.local

# ==================== LOGS ====================

# Log files
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# ==================== TESTING ====================

# Coverage directory
coverage/
*.lcov
.nyc_output

# Test results
test-results/
/tests/e2e/videos/
/tests/e2e/screenshots/

# ==================== IDE / EDITOR ====================

# VS Code
.vscode/
!.vscode/extensions.json
*.code-workspace

# IntelliJ IDEA
.idea/
*.iml
*.ipr
*.iws

# WebStorm
.idea/

# Sublime Text
*.sublime-project
*.sublime-workspace

# ==================== OS FILES ====================

# macOS
.DS_Store
.AppleDouble
.LSOverride

# Windows
Thumbs.db
Thumbs.db:encryptable
ehthumbs.db
ehthumbs_vista.db
*.stackdump
[Dd]esktop.ini
$RECYCLE.BIN/

# Linux
*~
.directory

# ==================== VITE SPECIFIC ====================

# Vite cache
.vite/
*.local

# ==================== MISCELLANEOUS ====================

# Temporary files
*.tmp
*.temp
.temp/
.cache/

# Backup files
*.bak
*.old
*.swp
*~

# Debug files
.vscode/launch.json

# Package lock (optional - see notes below)
# package-lock.json  # Uncomment if using Yarn exclusively
# yarn.lock          # Uncomment if using npm exclusively

# End of frontend .gitignore
```

**Save this file as:** `dental-clinic-management/frontend/.gitignore`

**IMPORTANT NOTE about package-lock.json:**
- **KEEP** `package-lock.json` if using npm (recommended)
- **KEEP** `yarn.lock` if using Yarn
- These files ensure consistent dependencies across environments
- They SHOULD be committed to version control

---

## Creating README.md

### Main README.md

**Location:** `dental-clinic-management/README.md`

**This is the MOST IMPORTANT file - it's the first thing people see!**

**Create this file:**

```markdown
# 🦷 Dental Clinic Management System

A comprehensive full-stack web application for managing dental clinic operations, including patient records and appointment scheduling.

![Project Status](https://img.shields.io/badge/status-production--ready-green)
![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.1-brightgreen)
![React](https://img.shields.io/badge/React-18-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-blue)
![License](https://img.shields.io/badge/license-MIT-blue)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## 🎯 Overview

The Dental Clinic Management System is a modern, responsive web application designed to streamline dental practice operations. Built with industry-standard technologies, it provides efficient patient management and appointment scheduling capabilities.

**Developed for:** Real-world dental clinic operations  
**Development Period:** January - February 2026  
**Current Version:** 1.0.0

## ✨ Features

### Patient Management
- ✅ Create, read, update patient records
- ✅ Unique phone number validation
- ✅ Comprehensive patient information storage
- ✅ Quick patient lookup and search

### Appointment Management
- ✅ Schedule and manage appointments
- ✅ Link appointments to patient records
- ✅ Track treatment requirements (implants, dentures, orthodontics)
- ✅ Fee tracking and notes

### Search & Filter
- ✅ Real-time search by patient name or phone number
- ✅ Debounced search for optimal performance
- ✅ Multi-criteria filtering by treatment needs
- ✅ Combined search and filter capabilities

### User Interface
- ✅ Modern, responsive Material Design interface
- ✅ Mobile-friendly responsive layout
- ✅ Intuitive modal-based forms
- ✅ Real-time form validation
- ✅ Success/error notifications
- ✅ Confirmation dialogs for destructive actions

## 🛠️ Technology Stack

### Backend
- **Framework:** Spring Boot 3.2.1
- **Language:** Java 17
- **Build Tool:** Maven 3.8+
- **Database:** PostgreSQL 14
- **ORM:** Spring Data JPA (Hibernate)
- **API:** RESTful architecture

### Frontend
- **Library:** React 18
- **Build Tool:** Vite 5
- **HTTP Client:** Axios
- **Styling:** Custom CSS with Material Design principles
- **State Management:** React Hooks (useState, useEffect)

### Database
- **RDBMS:** PostgreSQL 14
- **Schema:** Relational design with foreign keys
- **Queries:** JPQL for complex operations

## 📦 Prerequisites

Before installation, ensure you have the following installed:

### Required Software

| Software | Version | Download Link |
|----------|---------|---------------|
| Java JDK | 17 or higher | https://adoptium.net/ |
| PostgreSQL | 14 or higher | https://www.postgresql.org/download/ |
| Node.js | 18 or higher | https://nodejs.org/ |
| npm | 9 or higher | (included with Node.js) |
| Maven | 3.8 or higher | https://maven.apache.org/download.cgi |

### Verify Installation

```bash
# Verify Java
java -version
# Expected: openjdk version "17.0.x" or higher

# Verify PostgreSQL
psql --version
# Expected: psql (PostgreSQL) 14.x or higher

# Verify Node.js and npm
node --version
npm --version
# Expected: v18.x.x or higher, 9.x.x or higher

# Verify Maven
mvn --version
# Expected: Apache Maven 3.8.x or higher
```

```
## 🚀 Installation

### 1. Clone the Repository

```bash
# Clone using HTTPS
git clone https://github.com/YOUR_USERNAME/dental-clinic-management.git

# OR clone using SSH (recommended)
git clone git@github.com:YOUR_USERNAME/dental-clinic-management.git

# Navigate to project directory
cd dental-clinic-management
```

```
### 2. Database Setup

```bash
# Start PostgreSQL service (if not already running)
# Windows: Start from Services or pgAdmin
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql

# Create database
psql -U postgres

# In psql prompt:
CREATE DATABASE dental_clinic;
\q
```

```
### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies (downloads from Maven Central)
mvn clean install

# OR skip tests during installation
mvn clean install -DskipTests

# Build should succeed with "BUILD SUCCESS"
```

```
### 4. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# This downloads all packages from npm registry
# Wait for completion (may take 1-2 minutes)
```

```
## ⚙️ Configuration

### Backend Configuration

**Edit:** `backend/src/main/resources/application.properties`

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/dental_clinic
spring.datasource.username=postgres
spring.datasource.password=YOUR_POSTGRES_PASSWORD

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true

# Server Configuration
server.port=8080
```

```
**⚠️ IMPORTANT:** Replace `YOUR_POSTGRES_PASSWORD` with your actual PostgreSQL password

### Frontend Configuration

**Edit:** `frontend/src/services/api.js`

```javascript
// Default configuration (works if backend is on localhost:8080)
const API_BASE_URL = 'http://localhost:8080/api';

// For network deployment, replace with server IP:
// const API_BASE_URL = 'http://192.168.1.100:8080/api';
```

```
## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend:**

```bash
cd backend
mvn spring-boot:run

# Wait for: "Started DentalClinicApplication in X.XXX seconds"
# Backend will run on http://localhost:8080
```

```
**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev

# Wait for: "Local: http://localhost:5173/"
# Frontend will run on http://localhost:5173
```

```
**Access the application:** Open browser to `http://localhost:5173`

### Production Mode

**Backend:**

```bash
cd backend
mvn clean package -DskipTests
java -jar target/dental-clinic-backend-0.0.1-SNAPSHOT.jar
```

```
**Frontend:**

```bash
cd frontend
npm run build
npx serve -s dist -p 5173
```

```
## 📁 Project Structure
```

```
dental-clinic-management/
│
├── backend/                        # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/dentalclinic/
│   │   │   │       ├── model/             # Entity classes
│   │   │   │       │   ├── Patient.java
│   │   │   │       │   └── Appointment.java
│   │   │   │       ├── repository/        # Data access layer
│   │   │   │       │   ├── PatientRepository.java
│   │   │   │       │   └── AppointmentRepository.java
│   │   │   │       ├── service/           # Business logic
│   │   │   │       │   ├── PatientService.java
│   │   │   │       │   └── AppointmentService.java
│   │   │   │       ├── controller/        # REST endpoints
│   │   │   │       │   ├── PatientController.java
│   │   │   │       │   └── AppointmentController.java
│   │   │   │       ├── dto/               # Data transfer objects
│   │   │   │       │   └── AppointmentWithPatientDTO.java
│   │   │   │       ├── exception/         # Exception handling
│   │   │   │       │   ├── GlobalExceptionHandler.java
│   │   │   │       │   └── ResourceNotFoundException.java
│   │   │   │       └── config/            # Configuration
│   │   │   │           └── CorsConfig.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/                          # Unit tests (future)
│   ├── pom.xml                            # Maven dependencies
│   └── README.md
│
├── frontend/                       # React frontend
│   ├── public/                            # Public assets
│   ├── src/
│   │   ├── components/                    # React components
│   │   │   ├── AppointmentTable.jsx      # Main table
│   │   │   ├── SearchBar.jsx             # Search component
│   │   │   ├── TreatmentFilter.jsx       # Filter component
│   │   │   ├── Modal.jsx                 # Modal wrapper
│   │   │   ├── PatientForm.jsx           # Patient form
│   │   │   └── AppointmentForm.jsx       # Appointment form
│   │   ├── services/                      # API integration
│   │   │   └── api.js                    # Axios API client
│   │   ├── App.jsx                        # Main application
│   │   ├── App.css                        # Global styles
│   │   └── main.jsx                       # Entry point
│   ├── index.html                         # HTML template
│   ├── package.json                       # npm dependencies
│   ├── vite.config.js                     # Vite configuration
│   └── README.md
│
├── docs/                           # Documentation
│   ├── Session_8_Final_Complete_Documentation.md
│   ├── Test_Report_020826.md
│   ├── Build_Report_020826.md
│   ├── DEPLOYMENT_GUIDE.md
│   └── USER_MANUAL.md
│
├── .gitignore                      # Git ignore rules
├── README.md                       # This file
└── LICENSE                         # Project license
```

```
## 📚 API Documentation

### Base URL

http://localhost:8080/api
```

```
### Patient Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/patients` | Get all patients |
| GET | `/patients/{id}` | Get patient by ID |
| POST | `/patients` | Create new patient |
| PUT | `/patients/{id}` | Update patient |
| DELETE | `/patients/{id}` | Delete patient |

### Appointment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/appointments` | Get all appointments |
| GET | `/appointments/with-patients` | Get appointments with patient details |
| GET | `/appointments/{id}` | Get appointment by ID |
| POST | `/appointments` | Create new appointment |
| PUT | `/appointments/{id}` | Update appointment |
| DELETE | `/appointments/{id}` | Delete appointment |
| GET | `/appointments/search?query={term}` | Search appointments |

### Example API Calls

**Get All Patients:**
```bash
curl http://localhost:8080/api/patients
```

```
**Create Patient:**
```bash
curl -X POST http://localhost:8080/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "birthYear": 1985,
    "gender": "Male",
    "phone": "555-0123",
    "address": "123 Main St"
  }'
```

```
**Search Appointments:**
```bash
curl "http://localhost:8080/api/appointments/search?query=John"
```

```
## 🧪 Testing

### Testing Report

Comprehensive testing has been completed with **100% pass rate**.

**Test Coverage:**
- ✅ 92 Total Tests
- ✅ Patient Management (5 tests)
- ✅ Appointment Management (4 tests)
- ✅ Search & Filter (5 tests)
- ✅ User Workflows (4 tests)
- ✅ Cross-browser Compatibility
- ✅ Responsive Design
- ✅ Performance Benchmarks
- ✅ Edge Cases (7 tests)

**Full testing report:** See `docs/Test_Report_020826.md`

### Running Tests

```bash
# Backend tests (when implemented)
cd backend
mvn test

# Frontend tests (when implemented)
cd frontend
npm test
```

```
## 🚀 Deployment

### Local Deployment

See comprehensive deployment guide in `docs/DEPLOYMENT_GUIDE.md`

**Quick Start:**

1. Build backend JAR:
   ```bash
   cd backend
   mvn clean package -DskipTests
   ```

2. Build frontend:
   ```bash
   cd frontend
   npm run build
   ```

3. Run in production:
   ```bash
   # Backend
   java -jar backend/target/dental-clinic-backend-0.0.1-SNAPSHOT.jar
   
   # Frontend
   npx serve -s frontend/dist -p 5173
   ```

```
### Cloud Deployment

The application can be deployed to:
- Heroku
- AWS Elastic Beanstalk
- DigitalOcean
- Render
- Railway

**See full deployment guide:** `docs/DEPLOYMENT_GUIDE.md`

## 🤝 Contributing

Contributions are welcome! This project is open for improvements.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- **Java:** Follow Google Java Style Guide
- **JavaScript:** Follow Airbnb JavaScript Style Guide
- **Commits:** Use conventional commit messages

### Reporting Issues

Found a bug? Have a suggestion? Please open an issue on GitHub.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 📞 Contact

**Developer:** Lai Quang Tam  
**Email:** [your.email@example.com]  
**GitHub:** [@yourusername](https://github.com/yourusername)  
**Project Link:** [https://github.com/yourusername/dental-clinic-management](https://github.com/yourusername/dental-clinic-management)

---

## 🌟 Acknowledgments

- Built as a comprehensive full-stack learning project
- Designed for real-world dental clinic use
- Inspired by modern healthcare management systems
- Special thanks to the Spring Boot and React communities

---

**⭐ If you found this project helpful, please consider giving it a star!**

---

*Last Updated: February 8, 2026*
```

**Save this file as:** `dental-clinic-management/README.md`

---

### Backend README.md

**Location:** `dental-clinic-management/backend/README.md`

```markdown
# Backend - Dental Clinic Management System

Spring Boot REST API for dental clinic management.

## Technology Stack

- **Spring Boot:** 3.2.1
- **Java:** 17
- **Maven:** 3.8+
- **Database:** PostgreSQL 14
- **ORM:** Spring Data JPA

## Prerequisites

- Java JDK 17+
- PostgreSQL 14+
- Maven 3.8+

## Setup

1. Create database:
   ```sql
   CREATE DATABASE dental_clinic;
   ```

2. Configure `application.properties`:
   ```properties
   spring.datasource.password=YOUR_PASSWORD
   ```

3. Build:
   ```bash
   mvn clean install
   ```

4. Run:
   ```bash
   mvn spring-boot:run
   ```

```
## API Endpoints

See main README.md for full API documentation.

**Base URL:** `http://localhost:8080/api`
```

```
## Architecture
```

```
src/main/java/com/dentalclinic/
├── model/          # JPA entities
├── repository/     # Data access
├── service/        # Business logic
├── controller/     # REST endpoints
├── dto/            # Data transfer objects
├── exception/      # Exception handling
└── config/         # Configuration
```

```
## Building for Production
```

```bash
mvn clean package -DskipTests
java -jar target/dental-clinic-backend-0.0.1-SNAPSHOT.jar
```

```
## Testing

```bash
mvn test
```

```
## License

MIT License - See LICENSE file
```

**Save this file as:** `dental-clinic-management/backend/README.md`

---

### Frontend README.md

**Location:** `dental-clinic-management/frontend/README.md`

```markdown
# Frontend - Dental Clinic Management System

React-based user interface for dental clinic management.

## Technology Stack

- **React:** 18
- **Vite:** 5
- **Axios:** 1.6+
- **CSS:** Custom styling with Material Design

## Prerequisites

- Node.js 18+
- npm 9+

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure API URL in `src/services/api.js`:
   ```javascript
   const API_BASE_URL = 'http://localhost:8080/api';
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Open browser to `http://localhost:5173`

```
## Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
```

```
## Project Structure
```

```
src/
├── components/        # React components
│   ├── AppointmentTable.jsx
│   ├── SearchBar.jsx
│   ├── TreatmentFilter.jsx
│   ├── Modal.jsx
│   ├── PatientForm.jsx
│   └── AppointmentForm.jsx
├── services/          # API integration
│   └── api.js
├── App.jsx            # Main component
├── App.css            # Styles
└── main.jsx           # Entry point
```

## Building for Production

```bash
npm run build
```

Build output will be in `dist/` directory.

```
## Deployment

```bash
# Using serve
npx serve -s dist -p 5173

# Or any static file server
```

```
## Features

- Responsive design (mobile-friendly)
- Real-time search with debouncing
- Multi-criteria filtering
- Form validation
- Modal-based forms
- Success/error notifications

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Edge (latest)
- Safari (latest)

## License

```
MIT License - See LICENSE file
```

**Save this file as:** `dental-clinic-management/frontend/README.md`

---

## Creating LICENSE

**Location:** `dental-clinic-management/LICENSE`

**MIT License (Recommended for open source):**

```
MIT License

Copyright (c) 2026 Lai Quang Tam

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

**Save this file as:** `dental-clinic-management/LICENSE`

**Alternative licenses you could consider:**
- **Apache 2.0** - More explicit patent grant
- **GPL-3.0** - Copyleft license (requires derivatives to be open source)
- **Proprietary** - If you want to keep it private/commercial

**For open source portfolio projects, MIT is recommended.**
```

---

## Git Repository Initialization

### Step-by-Step Process

**Now we will initialize Git and prepare for GitHub upload.**

### Phase 1: Create Repository Structure

```bash
# Navigate to your projects folder
cd /path/to/your/projects

# Create new project folder
mkdir dental-clinic-management
cd dental-clinic-management

# Create subdirectories
mkdir backend frontend docs
```

---

### Phase 2: Copy Project Files

```bash
# Copy backend files
# (Replace with your actual backend project path)
cp -r /path/to/dental-clinic-backend/* backend/

# Copy frontend files
# (Replace with your actual frontend project path)
cp -r /path/to/dental-clinic-frontend/* frontend/

# Copy documentation files
cp /path/to/Session_8_Final_Complete_Documentation.md docs/
cp /path/to/Test_Report_020826.md docs/
cp /path/to/Build_Report_020826.md docs/
```

**Windows users:** Use `xcopy` or File Explorer to copy files

---

### Phase 3: Create Configuration Files

**In the root directory** (`dental-clinic-management/`):

1. **Create `.gitignore`** (use content from earlier section)
   ```bash
   # Create file
   touch .gitignore
   # OR on Windows
   type nul > .gitignore
   
   # Then paste the root .gitignore content into it
   ```

2. **Create `README.md`** (use content from earlier section)
   ```bash
   touch README.md
   # Paste main README content
   ```

3. **Create `LICENSE`** (use content from earlier section)
   ```bash
   touch LICENSE
   # Paste license content
   ```

---

### Phase 4: Create Backend-Specific Files

**In `backend/` directory:**

1. **Create `backend/.gitignore`** (use backend .gitignore content)
   ```bash
   cd backend
   touch .gitignore
   # Paste backend .gitignore content
   ```

2. **Create `backend/README.md`** (use backend README content)
   ```bash
   touch README.md
   # Paste backend README content
   ```

3. **Verify backend structure:**
   ```bash
   ls -la
   # Should see: src/, pom.xml, .gitignore, README.md
   ```

---

### Phase 5: Create Frontend-Specific Files

**In `frontend/` directory:**

1. **Create `frontend/.gitignore`** (use frontend .gitignore content)
   ```bash
   cd ../frontend
   touch .gitignore
   # Paste frontend .gitignore content
   ```

2. **Create `frontend/README.md`** (use frontend README content)
   ```bash
   touch README.md
   # Paste frontend README content
   ```

3. **Verify frontend structure:**
   ```bash
   ls -la
   # Should see: src/, package.json, .gitignore, README.md
   ```

---

### Phase 6: Initialize Git Repository

**Return to root directory:**

```bash
cd ..  # Back to dental-clinic-management/
pwd    # Verify you're in the root directory
```

**Initialize Git:**

```bash
# Initialize Git repository
git init

# Expected output:
# Initialized empty Git repository in /path/to/dental-clinic-management/.git/
```

**Verify initialization:**

```bash
# Check Git status
git status

# Expected output will show all untracked files
```

---

### Phase 7: Configure Git (if not already done)

```bash
# Set your name (will appear in commits)
git config user.name "Your Name"

# Set your email (should match GitHub email)
git config user.email "your.email@example.com"

# Verify configuration
git config --list
```

**These settings are local to this repository.**

---

### Phase 8: Review Files to be Committed

**Check what will be included:**

```bash
# See all files that will be tracked
git status

# See what's being ignored
git status --ignored
```

**CRITICAL VERIFICATION:**

Ensure these files are **NOT** shown in `git status`:
- ❌ `backend/target/`
- ❌ `frontend/node_modules/`
- ❌ `frontend/dist/`
- ❌ `.idea/` or `.vscode/`
- ❌ `*.class` files
- ❌ Any files with passwords or secrets

**If you see any of these, fix your .gitignore files!**

---

### Phase 9: Stage Files for Commit

```bash
# Add all files (respecting .gitignore)
git add .

# Verify what's staged
git status

# You should see files in green (staged for commit)
```

**Double-check the staged files:**

```bash
# List all staged files
git diff --staged --name-only

# Review carefully - make sure no sensitive data is included
```

**If you need to unstage a file:**

```bash
# Unstage specific file
git reset HEAD path/to/file

# Unstage everything
git reset HEAD .
```

---

### Phase 10: Create Initial Commit

**This is a milestone - your first commit!**

```bash
# Create initial commit
git commit -m "Initial commit: Complete dental clinic management system

- Add Spring Boot backend with REST API
- Add React frontend with Vite
- Add comprehensive documentation
- Add test reports and build reports
- Configure .gitignore for Java and Node
- Add README with full project documentation
- Add MIT license
- Project status: Production ready"

# This creates a detailed commit message
# First line is summary (50 chars max recommended)
# Blank line separates summary from body
# Body provides details (72 chars per line recommended)
```

**Expected output:**

```
[main (root-commit) abc1234] Initial commit: Complete dental clinic management system
 XX files changed, XXXX insertions(+)
 create mode 100644 .gitignore
 create mode 100644 LICENSE
 create mode 100644 README.md
 ...
```

---

### Phase 11: Verify Repository State

```bash
# Check commit history
git log

# Should show your initial commit
# Press 'q' to exit log view

# Check current branch
git branch

# Should show: * main (or * master)

# View commit details
git show HEAD
```

**Your local Git repository is now ready!**

---

## GitHub Repository Creation

### Step-by-Step GitHub Setup

### Phase 1: Create Repository on GitHub

**Option A: Via GitHub Website (Recommended for first-time users):**

1. **Log into GitHub:**
   - Go to https://github.com
   - Sign in with your credentials

2. **Create New Repository:**
   - Click the **"+"** icon in top-right corner
   - Select **"New repository"**

3. **Configure Repository:**
   - **Repository name:** `dental-clinic-management`
   - **Description:** `Full-stack dental clinic management system with Spring Boot and React`
   - **Visibility:**
     - **Public** - Anyone can see (recommended for portfolio)
     - **Private** - Only you can see
   - **Initialize repository:**
     - ❌ **DO NOT** check "Add a README file"
     - ❌ **DO NOT** check "Add .gitignore"
     - ❌ **DO NOT** choose a license
     - **Why?** We already have these files locally!

4. **Click "Create repository"**

**You'll see a page with setup instructions - we'll use these next!**

---

**Option B: Via GitHub CLI (Advanced):**

```bash
# Install GitHub CLI first
# Mac: brew install gh
# Windows: Download from https://cli.github.com/

# Authenticate
gh auth login

# Create repository
gh repo create dental-clinic-management \
  --public \
  --description "Full-stack dental clinic management system with Spring Boot and React" \
  --source=. \
  --remote=origin

# This creates the repo and sets up the remote automatically
```

---

### Phase 2: Connect Local Repository to GitHub

**After creating the GitHub repository, you'll see instructions. Follow these:**

**Copy your repository URL:**
- **SSH URL (recommended):** `git@github.com:YOUR_USERNAME/dental-clinic-management.git`
- **HTTPS URL:** `https://github.com/YOUR_USERNAME/dental-clinic-management.git`

**In your local terminal:**

```bash
# Make sure you're in project root
cd /path/to/dental-clinic-management

# Add GitHub as remote (using SSH)
git remote add origin git@github.com:YOUR_USERNAME/dental-clinic-management.git

# OR if using HTTPS
git remote add origin https://github.com/YOUR_USERNAME/dental-clinic-management.git

# Verify remote was added
git remote -v

# Expected output:
# origin  git@github.com:YOUR_USERNAME/dental-clinic-management.git (fetch)
# origin  git@github.com:YOUR_USERNAME/dental-clinic-management.git (push)
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

---

### Phase 3: Rename Branch to 'main' (if needed)

**GitHub's default branch is now 'main', but Git might use 'master':**

```bash
# Check current branch name
git branch

# If it shows 'master', rename to 'main'
git branch -M main

# Verify
git branch
# Should show: * main
```

---

## First Commit & Push

### Phase 1: Push to GitHub

**This uploads your code to GitHub:**

```bash
# Push your code to GitHub
git push -u origin main

# The -u flag sets 'origin main' as the default upstream
# Future pushes can just use: git push
```

**What happens:**

```
Enumerating objects: XX, done.
Counting objects: 100% (XX/XX), done.
Delta compression using up to 8 threads
Compressing objects: 100% (XX/XX), done.
Writing objects: 100% (XX/XX), X.XX MiB | X.XX MiB/s, done.
Total XX (delta X), reused X (delta X), pack-reused 0
remote: Resolving deltas: 100% (X/X), done.
To github.com:YOUR_USERNAME/dental-clinic-management.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

**If using HTTPS (not SSH), you'll be prompted for credentials:**
- **Username:** Your GitHub username
- **Password:** Your Personal Access Token (NOT your GitHub password!)

---

### Phase 2: Verify Upload

**Check GitHub:**

1. Go to your repository URL:
   ```
   https://github.com/YOUR_USERNAME/dental-clinic-management
   ```

2. **You should see:**
   - ✅ README.md displayed on the main page
   - ✅ File structure matching your local project
   - ✅ Green "✓" icon indicating files are tracked
   - ✅ Commit message displayed
   - ✅ File count (should show ~50-100 files)

3. **Verify specific items:**
   - Click on `backend/` folder - should show source code
   - Click on `frontend/` folder - should show React code
   - Click on `docs/` folder - should show documentation
   - Check that `node_modules/` and `target/` are NOT present

---

### Phase 3: Create GitHub Repository Description

**Make your repository attractive:**

1. **On GitHub repository page, click "About" gear icon**

2. **Add description:**
   ```
   Full-stack dental clinic management system built with Spring Boot, React, and PostgreSQL. Features patient management, appointment scheduling, search & filter capabilities, and responsive UI.
   ```

3. **Add topics (tags):**
   - `spring-boot`
   - `react`
   - `postgresql`
   - `full-stack`
   - `java`
   - `javascript`
   - `healthcare`
   - `crud`
   - `rest-api`
   - `vite`

4. **Add website:** Your deployed URL (if deployed) or leave empty

5. **Click "Save changes"**

---

### Phase 4: Enable GitHub Features

**Recommended GitHub settings:**

1. **Settings → General:**
   - ✅ Enable "Issues"
   - ✅ Enable "Discussions" (optional)
   - ❌ Disable "Wikis" (unless you plan to use it)
   - ❌ Disable "Projects" (unless you plan to use it)

2. **Settings → Branches:**
   - Set default branch: `main`
   - (Optional) Add branch protection rules

3. **Settings → Actions:**
   - Enable if you plan to add CI/CD (future enhancement)

---

## Repository Verification

### Complete Verification Checklist

**Go through this checklist to ensure everything is correct:**

### Local Repository Verification

```bash
# Check Git status
git status
# Expected: "nothing to commit, working tree clean"

# Check remote
git remote -v
# Expected: Shows origin with your GitHub URL

# Check branch
git branch
# Expected: * main

# Check commit history
git log --oneline
# Expected: Shows your initial commit

# Verify .gitignore is working
git status --ignored
# Expected: Shows ignored files (target/, node_modules/, etc.)
```

---

### GitHub Repository Verification

**Visit your GitHub repository and verify:**

- [ ] **README.md displays** correctly on main page
- [ ] **Project structure** is correct:
  - [ ] `backend/` folder exists with source code
  - [ ] `frontend/` folder exists with source code
  - [ ] `docs/` folder exists with documentation
  - [ ] `.gitignore` files are present
  - [ ] `LICENSE` file is present

- [ ] **Ignored files NOT present:**
  - [ ] No `target/` folder
  - [ ] No `node_modules/` folder
  - [ ] No `dist/` folder
  - [ ] No `.idea/` or `.vscode/` folders
  - [ ] No compiled files (`.class`)

- [ ] **Documentation visible:**
  - [ ] Session 8 documentation
  - [ ] Test report
  - [ ] Build report

- [ ] **Repository settings:**
  - [ ] Description added
  - [ ] Topics/tags added
  - [ ] License shows as "MIT License"

- [ ] **README renders properly:**
  - [ ] Headers display correctly
  - [ ] Badges show (if added)
  - [ ] Code blocks formatted
  - [ ] Links work
  - [ ] Tables display correctly

---

### File Count Verification

**Expected file counts (approximate):**

```bash
# Count all tracked files
git ls-files | wc -l

# Expected: 50-150 files depending on project
```

**File breakdown:**
- Backend: ~30-50 files (.java, .xml, .properties)
- Frontend: ~15-25 files (.jsx, .js, .css, .json)
- Documentation: ~5-10 files (.md)
- Configuration: ~5-10 files (.gitignore, LICENSE, etc.)

---

### Security Verification

**CRITICAL - Check for sensitive data:**

```bash
# Search for common sensitive patterns
git log -p | grep -i "password"
git log -p | grep -i "secret"
git log -p | grep -i "api_key"

# If anything found, see "Troubleshooting" section!
```

**Check specific files:**

```bash
# View application.properties
git show HEAD:backend/src/main/resources/application.properties

# Should NOT contain actual passwords
# Should have placeholder like: spring.datasource.password=YOUR_PASSWORD
```

---

## Best Practices Summary

### Git Commit Best Practices

**Commit Message Format:**

```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Formatting, missing semicolons, etc.
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Maintenance tasks

**Examples:**

```bash
# Good commit messages
git commit -m "feat: Add patient search by phone number"
git commit -m "fix: Correct appointment date validation"
git commit -m "docs: Update README with deployment instructions"

# Bad commit messages (avoid these)
git commit -m "update"
git commit -m "fix stuff"
git commit -m "asdfasdf"
```

---

### GitHub Repository Best Practices

**Documentation:**
- ✅ Comprehensive README.md
- ✅ LICENSE file
- ✅ Contributing guidelines (for open source)
- ✅ Code of conduct (for large projects)

**Structure:**
- ✅ Clear folder organization
- ✅ Separate backend/frontend
- ✅ Documentation in docs/ folder
- ✅ Examples or screenshots in assets/ folder

**Security:**
- ✅ Never commit passwords or API keys
- ✅ Use environment variables for secrets
- ✅ Add .env to .gitignore
- ✅ Use GitHub Secrets for CI/CD

**Maintenance:**
- ✅ Keep README updated
- ✅ Tag releases with semantic versioning
- ✅ Respond to issues and pull requests
- ✅ Regular dependency updates

---

### .gitignore Best Practices

**Rules:**
1. **Ignore build artifacts** (target/, dist/, node_modules/)
2. **Ignore IDE files** (.idea/, .vscode/)
3. **Ignore OS files** (.DS_Store, Thumbs.db)
4. **Ignore sensitive data** (*.env, credentials.json)
5. **Ignore logs** (*.log)
6. **Keep configuration templates** (example.env)

**Testing .gitignore:**

```bash
# See what would be committed
git status

# See ignored files
git status --ignored

# Check specific file
git check-ignore -v path/to/file
```

---

### Branch Strategy Best Practices

**For solo development:**
- `main` - Production-ready code
- `develop` - Active development (optional)
- `feature/feature-name` - New features (optional)

**For team development:**
- `main` - Production releases only
- `develop` - Integration branch
- `feature/*` - Feature branches
- `hotfix/*` - Emergency fixes
- `release/*` - Release preparation

**This project is simple, so `main` branch only is fine.**

---

## Troubleshooting

### Common Issues and Solutions

### Issue 1: Git Not Installed

**Symptom:**
```bash
git: command not found
```

**Solution:**
```bash
# Mac
brew install git

# Windows
# Download from https://git-scm.com/download/win

# Linux (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install git
```

---

### Issue 2: Permission Denied (SSH)

**Symptom:**
```
Permission denied (publickey).
fatal: Could not read from remote repository.
```

**Solution:**

1. **Check SSH key exists:**
   ```bash
   ls -la ~/.ssh
   # Look for id_rsa or id_ed25519
   ```

2. **Generate SSH key if missing:**
   ```bash
   ssh-keygen -t ed25519 -C "your.email@example.com"
   ```

3. **Add to GitHub:**
   ```bash
   cat ~/.ssh/id_ed25519.pub
   # Copy output, go to GitHub → Settings → SSH Keys → Add
   ```

4. **Test connection:**
   ```bash
   ssh -T git@github.com
   ```

**Alternative:** Use HTTPS instead of SSH
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/dental-clinic-management.git
```

---

### Issue 3: Authentication Failed (HTTPS)

**Symptom:**
```
Authentication failed for 'https://github.com/...'
```

**Solution:**

**You MUST use Personal Access Token, not password:**

1. **Create token:**
   - GitHub → Settings → Developer settings → Personal access tokens
   - Generate new token (classic)
   - Select scopes: `repo`, `workflow`
   - Copy token (you won't see it again!)

2. **Use token as password:**
   ```bash
   Username: your_github_username
   Password: ghp_yourpersonalaccesstoken
   ```

3. **Or use Git credential manager:**
   ```bash
   # Windows
   git config --global credential.helper wincred
   
   # Mac
   git config --global credential.helper osxkeychain
   
   # Linux
   git config --global credential.helper store
   ```

---

### Issue 4: Committed Sensitive Data

**Symptom:** Accidentally committed password or API key

**Solution - Remove from history (ADVANCED):**

⚠️ **WARNING:** This rewrites Git history

```bash
# For recent commit (not pushed yet)
git reset --soft HEAD~1  # Undo last commit
# Edit files to remove sensitive data
git add .
git commit -m "Fix: Remove sensitive data"

# For already pushed commit
# Use BFG Repo Cleaner or git filter-branch
# See: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository
```

**Prevention:** Always review files before committing!

---

### Issue 5: Large Files Rejected

**Symptom:**
```
remote: error: File XXX is 123.45 MB; this exceeds GitHub's file size limit of 100 MB
```

**Solution:**

1. **Remove large file:**
   ```bash
   git rm --cached path/to/large/file
   ```

2. **Add to .gitignore:**
   ```bash
   echo "path/to/large/file" >> .gitignore
   ```

3. **For very large files, use Git LFS:**
   ```bash
   git lfs install
   git lfs track "*.jar"
   ```

---

### Issue 6: Merge Conflicts

**Symptom:**
```
CONFLICT (content): Merge conflict in file.txt
Automatic merge failed; fix conflicts and then commit the result.
```

**Solution:**

1. **Find conflicted files:**
   ```bash
   git status
   ```

2. **Edit files, look for:**
   ```
   <<<<<<< HEAD
   Your changes
   =======
   Conflicting changes
   >>>>>>> branch-name
   ```

3. **Resolve conflicts, then:**
   ```bash
   git add .
   git commit -m "Resolve merge conflict"
   ```

---

### Issue 7: Wrong Remote URL

**Symptom:** Push goes to wrong repository

**Solution:**

```bash
# Check current remote
git remote -v

# Change remote URL
git remote set-url origin NEW_URL

# Verify
git remote -v
```

---

### Issue 8: Accidentally Committed to Wrong Branch

**Symptom:** Made commits on `main` instead of feature branch

**Solution:**

```bash
# Create new branch from current position
git branch feature-branch

# Reset main to previous commit
git reset --hard HEAD~N  # N = number of commits to undo

# Switch to feature branch
git checkout feature-branch
```

---

### Issue 9: Node Modules or Target Folder Committed

**Symptom:** Huge repository size, many files

**Solution:**

```bash
# Remove from Git but keep locally
git rm -r --cached frontend/node_modules
git rm -r --cached backend/target

# Make sure .gitignore includes them
echo "node_modules/" >> frontend/.gitignore
echo "target/" >> backend/.gitignore

# Commit removal
git commit -m "Remove build artifacts from repository"
git push
```

---

### Issue 10: GitHub Shows Wrong Language

**Symptom:** GitHub language bar shows HTML as 90% of repository

**Solution:**

Create `.gitattributes` file in root:

```gitattributes
# .gitattributes
# Properly detect languages

*.java linguist-detectable=true
*.jsx linguist-detectable=true
*.js linguist-detectable=true
*.css linguist-detectable=true

# Ignore documentation from language stats
*.md linguist-documentation

# Ignore generated files
frontend/dist/* linguist-generated
backend/target/* linguist-generated
```

---

## Quick Reference Commands

### Essential Git Commands

```bash
# Status and information
git status                  # Check current status
git log                    # View commit history
git log --oneline          # Compact commit history
git diff                   # See changes
git branch                 # List branches

# Making changes
git add .                  # Stage all changes
git add filename           # Stage specific file
git commit -m "message"    # Commit changes
git push                   # Push to GitHub
git pull                   # Pull from GitHub

# Undoing changes
git reset HEAD filename    # Unstage file
git checkout -- filename   # Discard local changes
git revert HEAD            # Undo last commit (safe)
git reset --hard HEAD      # Discard all local changes (DANGER)

# Branches
git branch branch-name     # Create branch
git checkout branch-name   # Switch branch
git checkout -b branch     # Create and switch
git merge branch-name      # Merge branch
git branch -d branch-name  # Delete branch

# Remote repository
git remote -v              # View remotes
git remote add origin URL  # Add remote
git push -u origin main    # First push
git push                   # Subsequent pushes
git pull                   # Get latest changes

# Cleanup
git clean -fd              # Remove untracked files
git gc                     # Garbage collection
```

---

### Complete Setup Sequence Summary

**For quick reference, here's the complete sequence:**

```bash
# 1. Create project structure
mkdir dental-clinic-management
cd dental-clinic-management
mkdir backend frontend docs

# 2. Copy project files
cp -r /path/to/backend/* backend/
cp -r /path/to/frontend/* frontend/
cp /path/to/docs/* docs/

# 3. Create configuration files
# Create .gitignore, README.md, LICENSE in root
# Create .gitignore, README.md in backend/
# Create .gitignore, README.md in frontend/

# 4. Initialize Git
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"

# 5. Initial commit
git add .
git commit -m "Initial commit: Complete dental clinic management system"

# 6. Create GitHub repository
# Do this on GitHub.com

# 7. Connect and push
git remote add origin git@github.com:YOUR_USERNAME/dental-clinic-management.git
git branch -M main
git push -u origin main

# 8. Verify on GitHub
# Check repository on GitHub.com
```

---

## Conclusion

**You now have:**
- ✅ Local Git repository initialized
- ✅ Complete .gitignore configuration
- ✅ Professional README.md
- ✅ MIT License
- ✅ GitHub repository created
- ✅ Code pushed to GitHub
- ✅ Repository verified and secured

**Your repository is:**
- 🌟 Portfolio-ready
- 🌟 Well-documented
- 🌟 Following best practices
- 🌟 Properly configured
- 🌟 Publicly visible (or private, your choice)

**Next steps:**
1. ⭐ Add repository to your resume/LinkedIn
2. 📸 Add screenshots to README
3. 🚀 Consider deploying to Heroku/AWS
4. 📝 Keep documentation updated
5. 🔄 Implement new features in branches

---

**Congratulations! Your project is now professionally packaged and shared on GitHub!** 🎉

---

*This guide was created on February 8, 2026 for the Dental Clinic Management System project.*
