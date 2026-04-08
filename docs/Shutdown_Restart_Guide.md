# System Shutdown & Restart Scripts - Usage Guide
## Dental Clinic Management System

**Created:** February 2026  
**Purpose:** Maintenance and troubleshooting scripts for Windows 11

---

## Overview

You now have two scripts for managing the Dental Clinic service:

1. **shutdown-system.bat** - Stops the system for maintenance
2. **restart-system.bat** - Starts the system after maintenance

Both scripts must be **run as Administrator** to work properly.

---

## File Locations

**Copy both scripts to:**
```
C:\DentalClinic\
```

Your folder structure should look like:
```
C:\DentalClinic\
├── dental-clinic-backend-0.0.1-SNAPSHOT.jar
├── application.properties
├── service\
│   ├── DentalClinicService.exe
│   ├── DentalClinicService.xml
│   └── logs\
├── shutdown-system.bat          ← NEW
└── restart-system.bat           ← NEW
```

---

## Creating Desktop Shortcuts (Recommended)

**For easy access, create shortcuts on your desktop:**

### Shutdown Shortcut

1. Right-click on desktop → New → Shortcut
2. Location: `C:\DentalClinic\shutdown-system.bat`
3. Click Next
4. Name: `🛑 Shutdown Dental Clinic`
5. Click Finish
6. Right-click the new shortcut → Properties
7. Click "Advanced..." button
8. ✅ Check "Run as administrator"
9. Click OK → OK
10. (Optional) Change icon: Right-click → Properties → Change Icon

### Restart Shortcut

1. Right-click on desktop → New → Shortcut
2. Location: `C:\DentalClinic\restart-system.bat`
3. Click Next
4. Name: `🔄 Restart Dental Clinic`
5. Click Finish
6. Right-click the new shortcut → Properties
7. Click "Advanced..." button
8. ✅ Check "Run as administrator"
9. Click OK → OK
10. (Optional) Change icon: Right-click → Properties → Change Icon

---

## Using the Shutdown Script

### When to Use

Use `shutdown-system.bat` when you need to:
- ✅ Perform database maintenance
- ✅ Update the application JAR file
- ✅ Troubleshoot issues
- ✅ Change configuration files
- ✅ Perform backups manually
- ✅ Restart the computer
- ✅ Test deployment changes

### How to Run

**Method 1: Using Desktop Shortcut (Recommended)**
1. Double-click "🛑 Shutdown Dental Clinic" shortcut
2. Click "Yes" when UAC prompts for admin rights
3. Wait for shutdown to complete
4. Press any key to close the window

**Method 2: From File Explorer**
1. Navigate to `C:\DentalClinic\`
2. Right-click `shutdown-system.bat`
3. Select "Run as administrator"
4. Click "Yes" when UAC prompts
5. Wait for shutdown to complete
6. Press any key to close the window

### What the Script Does

**Step by step:**
1. ✅ Checks if running as administrator
2. ✅ Checks current service status
3. ✅ Stops the Windows service gracefully
4. ✅ Waits for service to stop (5 seconds)
5. ✅ Cleans up any remaining Java processes on port 8080
6. ✅ Closes related terminal windows
7. ✅ Shows completion message

### Expected Output

```
============================================================
 Dental Clinic Management System - SHUTDOWN
============================================================

[1/4] Checking service status...
Service is currently running

[2/4] Stopping Dental Clinic service...
Service stopped successfully

[3/4] Cleaning up any remaining processes...
Cleanup complete

[4/4] Closing related terminal windows...
Terminal windows closed

============================================================
 SHUTDOWN COMPLETE
============================================================

The Dental Clinic Management System has been shut down.

What you can do now:
  - Perform database maintenance
  - Update application files
  - Troubleshoot issues
  - Update configuration

To restart the system, run: restart-system.bat

Service logs are available at:
  C:\DentalClinic\service\logs\

Press any key to continue . . .
```

### After Shutdown

**The system is now stopped. You can:**

✅ **Update the JAR file:**
```batch
# Backup old version first
copy dental-clinic-backend-0.0.1-SNAPSHOT.jar dental-clinic-backend-backup.jar

# Copy new version
copy "new-version.jar" "dental-clinic-backend-0.0.1-SNAPSHOT.jar"
```

✅ **Edit configuration:**
```batch
notepad application.properties
```

✅ **Perform database maintenance:**
```batch
# Create manual backup
"C:\Program Files\PostgreSQL\14\bin\pg_dump.exe" -U postgres dental_clinic > manual_backup.sql

# Or run maintenance queries
psql -U postgres dental_clinic
```

✅ **Check logs:**
```batch
cd C:\DentalClinic\service\logs
type DentalClinicService.out.log
```

---

## Using the Restart Script

### When to Use

Use `restart-system.bat` when you need to:
- ✅ Start the system after shutdown
- ✅ Resume operations after maintenance
- ✅ Test changes you made
- ✅ Recover from manual shutdown
- ✅ Restart after troubleshooting

### How to Run

**Method 1: Using Desktop Shortcut (Recommended)**
1. Double-click "🔄 Restart Dental Clinic" shortcut
2. Click "Yes" when UAC prompts for admin rights
3. Wait for startup to complete (15-30 seconds)
4. Window will auto-close after 10 seconds

**Method 2: From File Explorer**
1. Navigate to `C:\DentalClinic\`
2. Right-click `restart-system.bat`
3. Select "Run as administrator"
4. Click "Yes" when UAC prompts
5. Wait for startup to complete
6. Window will auto-close after 10 seconds

### What the Script Does

**Step by step:**
1. ✅ Checks if running as administrator
2. ✅ Checks if service is already running
3. ✅ If running, asks if you want to restart
4. ✅ Starts the Windows service
5. ✅ Waits for initialization (15 seconds)
6. ✅ Verifies service is running
7. ✅ Checks if port 8080 is listening
8. ✅ Minimizes terminal windows
9. ✅ Shows completion message
10. ✅ Auto-closes after 10 seconds

### Expected Output

```
============================================================
 Dental Clinic Management System - RESTART
============================================================

[1/5] Checking current service status...

[2/5] Starting Dental Clinic service...
Service start command sent successfully

[3/5] Waiting for service to initialize...
This may take 15-30 seconds...
Service is running

[4/5] Verifying application is responding...
Application is listening on port 8080 - READY!

[5/5] Minimizing terminal windows...
Windows minimized

============================================================
 RESTART COMPLETE
============================================================

The Dental Clinic Management System is now running!

Access the application at:
  http://localhost:8080

Service status:
Running

Logs available at:
  C:\DentalClinic\service\logs\

To stop the system again, run: shutdown-system.bat

This window will close in 10 seconds...
```

### After Restart

**The system is now running. You should:**

1. **Verify application is accessible:**
   - Open browser
   - Navigate to `http://localhost:8080`
   - Verify frontend loads
   - Test a quick search

2. **Check service status:**
   ```batch
   cd C:\DentalClinic\service
   DentalClinicService.exe status
   ```

3. **Monitor logs for errors:**
   ```batch
   type C:\DentalClinic\service\logs\DentalClinicService.out.log
   ```

---

## Typical Maintenance Workflow

### Scenario: Updating the Application

**1. Shutdown the system:**
```
Double-click "🛑 Shutdown Dental Clinic"
Wait for confirmation
```

**2. Backup current version:**
```batch
cd C:\DentalClinic
copy dental-clinic-backend-0.0.1-SNAPSHOT.jar dental-clinic-backend-backup.jar
```

**3. Deploy new version:**
```batch
copy "C:\Downloads\dental-clinic-backend-NEW.jar" "C:\DentalClinic\dental-clinic-backend-0.0.1-SNAPSHOT.jar"
```

**4. Restart the system:**
```
Double-click "🔄 Restart Dental Clinic"
Wait for confirmation
```

**5. Verify it works:**
```
Open http://localhost:8080
Test basic functions
```

**6. If problems occur:**
```batch
# Rollback to previous version
cd C:\DentalClinic
copy dental-clinic-backend-backup.jar dental-clinic-backend-0.0.1-SNAPSHOT.jar

# Restart again
Double-click "🔄 Restart Dental Clinic"
```

---

### Scenario: Database Maintenance

**1. Shutdown the system:**
```
Double-click "🛑 Shutdown Dental Clinic"
```

**2. Perform database work:**
```batch
# Create backup
"C:\Program Files\PostgreSQL\14\bin\pg_dump.exe" -U postgres dental_clinic > backup.sql

# Run maintenance
psql -U postgres dental_clinic
VACUUM ANALYZE;
REINDEX DATABASE dental_clinic;
\q
```

**3. Restart the system:**
```
Double-click "🔄 Restart Dental Clinic"
```

**4. Verify data integrity:**
```
Open application
Check recent appointments
Verify patient data
```

---

### Scenario: Troubleshooting Startup Issues

**1. Shutdown the system:**
```
Double-click "🛑 Shutdown Dental Clinic"
```

**2. Check logs:**
```batch
cd C:\DentalClinic\service\logs
type DentalClinicService.err.log
# Look for error messages
```

**3. Test database connection:**
```batch
psql -U postgres dental_clinic -c "SELECT COUNT(*) FROM patients;"
```

**4. Test manual start:**
```batch
cd C:\DentalClinic
java -jar dental-clinic-backend-0.0.1-SNAPSHOT.jar
# If this works, problem is with service config
# If this fails, problem is with JAR or database
```

**5. Fix the issue based on error messages**

**6. Restart the system:**
```
Double-click "🔄 Restart Dental Clinic"
```

---

## Troubleshooting the Scripts

### Error: "This script must be run as Administrator!"

**Problem:** Script not running with admin rights

**Solution:**
1. Right-click the .bat file
2. Select "Run as administrator"
3. Or use desktop shortcut configured with "Run as administrator"

---

### Error: "Failed to start service!"

**Problem:** Service won't start

**Possible causes and solutions:**

1. **Database not running:**
   ```batch
   # Check if PostgreSQL is running
   sc query postgresql-x64-14
   
   # Start PostgreSQL if stopped
   net start postgresql-x64-14
   ```

2. **Port 8080 already in use:**
   ```batch
   # Find what's using port 8080
   netstat -ano | findstr :8080
   
   # Kill the process (replace PID with actual number)
   taskkill /PID [PID] /F
   ```

3. **Configuration error:**
   ```batch
   # Check application.properties
   notepad C:\DentalClinic\application.properties
   
   # Verify database password is correct
   # Verify database name is correct
   ```

4. **Check error logs:**
   ```batch
   type C:\DentalClinic\service\logs\DentalClinicService.err.log
   ```

---

### Warning: "Port 8080 not detected yet"

**Problem:** Application slow to start

**Solution:**
- This is usually normal
- Wait additional 30 seconds
- Try accessing http://localhost:8080
- If still not working, check error logs

---

### Service Already Running

**Problem:** Restart script detects service already running

**What happens:**
- Script asks: "Do you want to restart it anyway?"
- Press Y to restart (stops then starts)
- Press N to cancel

**When to choose Y:**
- Application behaving strangely
- Need to reload configuration
- After editing files

**When to choose N:**
- Application working fine
- Just checking status

---

## Best Practices

### DO:
✅ Always run scripts as Administrator  
✅ Wait for shutdown to complete before restarting  
✅ Check logs after restart  
✅ Test application after maintenance  
✅ Keep backup copies before updates  
✅ Notify users before shutting down  

### DON'T:
❌ Interrupt scripts while running  
❌ Run both scripts simultaneously  
❌ Edit files while service is running  
❌ Shutdown without backup during business hours  
❌ Force restart if errors occur  

---

## Quick Reference Commands

**Check service status:**
```batch
cd C:\DentalClinic\service
DentalClinicService.exe status
```

**View recent log:**
```batch
type C:\DentalClinic\service\logs\DentalClinicService.out.log
```

**Check if application is responding:**
```batch
curl http://localhost:8080/api/patients
# Or open in browser
```

**Check if port is listening:**
```batch
netstat -ano | findstr :8080
```

---

## Emergency Procedures

### Complete Service Reset

**If everything is broken:**

```batch
# 1. Stop everything
Double-click "🛑 Shutdown Dental Clinic"

# 2. Force kill any Java processes
taskkill /F /IM java.exe

# 3. Restart PostgreSQL
net stop postgresql-x64-14
net start postgresql-x64-14

# 4. Restart service
Double-click "🔄 Restart Dental Clinic"
```

---

### Restore from Backup

**If application is corrupted:**

```batch
# 1. Shutdown
Double-click "🛑 Shutdown Dental Clinic"

# 2. Restore JAR from backup
cd C:\DentalClinic
copy dental-clinic-backend-backup.jar dental-clinic-backend-0.0.1-SNAPSHOT.jar

# 3. Restart
Double-click "🔄 Restart Dental Clinic"
```

---

## Maintenance Schedule

**Daily:**
- No shutdown needed (service runs 24/7)

**Weekly:**
- No scheduled shutdown needed

**Monthly:**
- Consider shutdown for:
  - Windows updates requiring restart
  - Application updates
  - Database maintenance (VACUUM, REINDEX)

**As Needed:**
- Shutdown for troubleshooting
- Shutdown for configuration changes
- Shutdown for testing

---

## Support

**If scripts don't work:**

1. Check you're running as Administrator
2. Verify service was installed correctly
3. Check logs for errors
4. Review Windows Event Viewer
5. Consult main documentation

**For help:**
- Review this guide
- Check service logs
- Consult Windows_11_Auto_Start_Guide.md
- Contact IT support

---

## Summary

**Two simple scripts for system management:**

🛑 **shutdown-system.bat**
- Stops the service safely
- Cleans up processes
- Prepares for maintenance

🔄 **restart-system.bat**
- Starts the service
- Verifies it's working
- Confirms application is ready

**Both scripts:**
- Must run as Administrator
- Provide clear feedback
- Include error handling
- Safe to use repeatedly

**Create desktop shortcuts for easy access!**

---

**Last Updated:** February 11, 2026  
**Application:** Dental Clinic Management System v1.0  
**Compatible with:** Windows 11, Windows 10
