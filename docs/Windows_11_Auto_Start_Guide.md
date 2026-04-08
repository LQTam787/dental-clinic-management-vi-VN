# Windows 11 Auto-Start Setup Guide
## Dental Clinic Management System

**Last Updated:** February 2026  
**Compatible with:** Windows 11 (and Windows 10)

---

## ⚠️ Important: Choose ONE Method

This guide provides two methods. Choose the one that best fits your needs:

- **Method 1 (WinSW):** True Windows Service - runs in background, no console window
- **Method 2 (Task Scheduler):** Simpler setup, uses built-in Windows tools

---

## Method 1: WinSW (Recommended)

**Windows Service Wrapper (WinSW)** - Modern, actively maintained, works perfectly on Windows 11.

### Advantages:
✅ Runs as true Windows service  
✅ No visible console window  
✅ Starts before user login  
✅ Can auto-restart on failure  
✅ Actively maintained (2024)  
✅ Professional solution  

---

### Step 1: Download WinSW

1. Go to: https://github.com/winsw/winsw/releases
2. Download the latest **WinSW-x64.exe** (not the .NET Framework version)
3. Current version: 3.0.0-alpha.11 or newer

**Direct download:** https://github.com/winsw/winsw/releases/download/v3.0.0-alpha.11/WinSW-x64.exe

---

### Step 2: Setup Directory Structure

Create the following structure:

```
C:\DentalClinic\
├── dental-clinic-backend-0.0.1-SNAPSHOT.jar
├── application.properties
├── service\
│   ├── DentalClinicService.exe      (renamed WinSW-x64.exe)
│   ├── DentalClinicService.xml      (we'll create this)
│   └── logs\                         (will be created automatically)
```

**Commands:**
```batch
cd C:\DentalClinic
mkdir service
mkdir service\logs
```

---

### Step 3: Install WinSW

1. **Copy downloaded WinSW-x64.exe** to `C:\DentalClinic\service\`
2. **Rename it** to `DentalClinicService.exe`

```batch
copy "C:\Users\YourName\Downloads\WinSW-x64.exe" "C:\DentalClinic\service\DentalClinicService.exe"
```

---

### Step 4: Create Service Configuration

Create file: **`C:\DentalClinic\service\DentalClinicService.xml`**

Copy this content exactly:

```xml
<service>
  <id>DentalClinicService</id>
  <name>Dental Clinic Management System</name>
  <description>Backend service for Dental Clinic Management System</description>
  
  <!-- Path to Java executable -->
  <executable>java</executable>
  
  <!-- Arguments to pass to Java -->
  <arguments>-jar "C:\DentalClinic\dental-clinic-backend-0.0.1-SNAPSHOT.jar"</arguments>
  
  <!-- Working directory -->
  <workingdirectory>C:\DentalClinic</workingdirectory>
  
  <!-- Log configuration -->
  <log mode="roll-by-size">
    <sizeThreshold>10240</sizeThreshold>
    <keepFiles>8</keepFiles>
  </log>
  
  <!-- Startup configuration -->
  <startmode>Automatic</startmode>
  <delayedAutoStart>true</delayedAutoStart>
  
  <!-- Restart on failure -->
  <onfailure action="restart" delay="10 sec"/>
  <onfailure action="restart" delay="20 sec"/>
  <onfailure action="restart" delay="30 sec"/>
  
  <!-- Stop configuration -->
  <stopparentprocessfirst>true</stopparentprocessfirst>
  <stoptimeout>15 sec</stoptimeout>
  
  <!-- Environment variables (optional) -->
  <env name="JAVA_OPTS" value="-Xmx512m"/>
</service>
```

**Important Notes:**
- The JAR path must match your actual JAR filename
- Java must be in your system PATH
- Delayed auto start gives Windows time to fully boot

---

### Step 5: Verify Java in PATH

**Check if Java is accessible:**

```batch
java -version
```

**Expected output:**
```
openjdk version "17.0.x"
```

**If NOT found:**

1. Find your Java installation (usually `C:\Program Files\Java\jdk-17` or similar)
2. Add to PATH:
   - Open System Properties → Advanced → Environment Variables
   - Edit "Path" in System Variables
   - Add: `C:\Program Files\Java\jdk-17\bin`
   - Click OK on all dialogs
   - **Restart Command Prompt**

---

### Step 6: Install the Service

**Open Command Prompt as Administrator:**
1. Press Windows key
2. Type "cmd"
3. Right-click "Command Prompt"
4. Select "Run as administrator"

**Install the service:**

```batch
cd C:\DentalClinic\service
DentalClinicService.exe install
```

**Expected output:**
```
2026-02-11 10:30:15,123 INFO  - Installing service 'Dental Clinic Management System (DentalClinicService)'...
2026-02-11 10:30:15,456 INFO  - Service 'Dental Clinic Management System (DentalClinicService)' was installed successfully.
```

---

### Step 7: Start the Service

**Start the service:**

```batch
DentalClinicService.exe start
```

**Or use Windows Services:**
1. Press Windows + R
2. Type: `services.msc`
3. Find "Dental Clinic Management System"
4. Right-click → Start

**Expected output:**
```
2026-02-11 10:31:00,123 INFO  - Starting service 'Dental Clinic Management System (DentalClinicService)'...
2026-02-11 10:31:03,456 INFO  - Service 'Dental Clinic Management System (DentalClinicService)' started successfully.
```

---

### Step 8: Verify Service is Running

**Check service status:**

```batch
DentalClinicService.exe status
```

**Or check in Services:**
1. Open Services (services.msc)
2. Find "Dental Clinic Management System"
3. Status should show: **Running**
4. Startup Type should show: **Automatic (Delayed Start)**

**Test the application:**

Open browser → `http://localhost:8080`

You should see your Dental Clinic application!

---

### Step 9: Check Logs (If Issues)

**Logs are in:** `C:\DentalClinic\service\logs\`

**Files:**
- `DentalClinicService.out.log` - Application output
- `DentalClinicService.err.log` - Error messages
- `DentalClinicService.wrapper.log` - Service wrapper logs

**View latest log:**
```batch
type C:\DentalClinic\service\logs\DentalClinicService.out.log
```

---

### Service Management Commands

**All commands must be run as Administrator in `C:\DentalClinic\service\`**

```batch
# Check status
DentalClinicService.exe status

# Start service
DentalClinicService.exe start

# Stop service
DentalClinicService.exe stop

# Restart service
DentalClinicService.exe restart

# Uninstall service (if needed)
DentalClinicService.exe uninstall

# View service configuration
DentalClinicService.exe test
```

---

### Test Auto-Start

**To verify it starts automatically:**

1. **Restart your computer**
2. **After login, wait 30 seconds** (delayed start)
3. **Open browser** → `http://localhost:8080`
4. **Application should be running!**

---

### Troubleshooting WinSW

**Problem: Service won't install**

**Solution:**
- Make sure running Command Prompt as Administrator
- Check Java is in PATH: `java -version`
- Verify paths in XML file are correct
- Check XML file is saved with UTF-8 encoding

---

**Problem: Service starts but application doesn't work**

**Solution:**
- Check logs: `C:\DentalClinic\service\logs\DentalClinicService.err.log`
- Verify database is running
- Check application.properties has correct database password
- Ensure all paths in XML are absolute paths

---

**Problem: Service won't start**

**Solution:**
- Open Services (services.msc)
- Find "Dental Clinic Management System"
- Right-click → Properties
- Check "Log On" tab - should be "Local System account"
- Try starting manually from Services panel
- Check Event Viewer for errors

---

**Problem: Service starts but stops immediately**

**Solution:**
- Check if port 8080 is already in use:
  ```batch
  netstat -ano | findstr :8080
  ```
- If in use, either stop the other application or change port in application.properties
- Check database is accessible
- Review error logs

---

## Method 2: Windows Task Scheduler (Simpler Alternative)

**Use this if:**
- You want simpler setup
- Don't want to install additional software
- Okay with a brief console window on startup

---

### Step 1: Create Startup Script

Create file: **`C:\DentalClinic\start-backend.bat`**

```batch
@echo off
REM Dental Clinic Backend Startup Script

REM Change to application directory
cd /d C:\DentalClinic

REM Start application (window will be minimized)
start /min "Dental Clinic Backend" java -jar dental-clinic-backend-0.0.1-SNAPSHOT.jar

REM Log startup
echo %date% %time% - Service started >> startup.log
```

**Make executable:** (already is, it's a .bat file)

---

### Step 2: Create Task in Task Scheduler

**Open Task Scheduler:**
1. Press Windows key
2. Type "Task Scheduler"
3. Click "Task Scheduler"

**Create new task:**
1. Click "Create Task" (not "Create Basic Task")
2. Configure as follows:

---

### Step 3: Configure General Tab

**General tab:**
- **Name:** Dental Clinic Backend
- **Description:** Auto-start Dental Clinic Management System backend
- ☑ **Run whether user is logged on or not**
- ☑ **Run with highest privileges**
- ☐ Hidden (leave unchecked to see status)
- **Configure for:** Windows 10/11

---

### Step 4: Configure Triggers Tab

**Triggers tab:**
1. Click "New..."
2. **Begin the task:** At startup
3. ☑ **Delay task for:** 30 seconds (gives Windows time to start)
4. ☑ **Enabled**
5. Click OK

---

### Step 5: Configure Actions Tab

**Actions tab:**
1. Click "New..."
2. **Action:** Start a program
3. **Program/script:** `C:\DentalClinic\start-backend.bat`
4. **Start in (optional):** `C:\DentalClinic`
5. Click OK

---

### Step 6: Configure Conditions Tab

**Conditions tab:**
- ☐ **Start the task only if the computer is on AC power** (UNCHECK this!)
- ☑ **Start only if the following network connection is available:** Any connection
- All other boxes unchecked

---

### Step 7: Configure Settings Tab

**Settings tab:**
- ☑ **Allow task to be run on demand**
- ☐ **Run task as soon as possible after a scheduled start is missed**
- ☑ **If the task fails, restart every:** 1 minute, **Attempt to restart up to:** 3 times
- **If the running task does not end when requested, force it to stop**
- **Do not start a new instance**

Click OK

---

### Step 8: Enter Password

**When prompted:**
- Enter your Windows password
- This allows the task to run even when you're not logged in
- Click OK

---

### Step 9: Test the Task

**Test immediately:**
1. Find "Dental Clinic Backend" in Task Scheduler
2. Right-click → Run
3. Wait 10-15 seconds
4. Open browser → `http://localhost:8080`
5. Application should be running!

---

### Step 10: Test Auto-Start

**Restart computer and verify:**
1. Restart computer
2. Wait 1 minute after login
3. Open browser → `http://localhost:8080`
4. Application should be running!

---

### Managing Task Scheduler Task

**View task status:**
1. Open Task Scheduler
2. Find "Dental Clinic Backend"
3. Check "Status" column

**Disable auto-start:**
1. Right-click task → Disable

**Enable auto-start:**
1. Right-click task → Enable

**Delete task:**
1. Right-click task → Delete

**View run history:**
1. Select task
2. Click "History" tab at bottom
3. See all start/stop events

---

### Troubleshooting Task Scheduler

**Problem: Task doesn't run**

**Solution:**
- Check task is Enabled
- Check "Run with highest privileges" is checked
- Verify path to .bat file is correct
- Check Windows password is still correct (re-enter if changed)

---

**Problem: Task runs but application doesn't start**

**Solution:**
- Run the .bat file manually to test
- Check Java is in PATH
- Check database is running
- Review startup.log file

---

**Problem: Multiple instances starting**

**Solution:**
- Check "Do not start a new instance" in Settings tab
- Manually stop all java processes before testing:
  ```batch
  taskkill /F /IM java.exe
  ```

---

## Comparison: WinSW vs Task Scheduler

| Feature | WinSW | Task Scheduler |
|---------|-------|----------------|
| Setup Complexity | Medium | Easy |
| Additional Software | Yes | No (Built-in) |
| True Windows Service | ✅ Yes | ❌ No |
| Auto-restart on crash | ✅ Yes | ⚠️ Limited |
| Log management | ✅ Built-in | ❌ Manual |
| Professional | ✅ Very | ⚠️ Moderate |
| Console window | ❌ No | ⚠️ Briefly visible |
| Recommended for | Production | Development/Testing |

---

## Recommended Choice

**For your dental clinic (production use):**

→ **Use WinSW (Method 1)**

**Why:**
- More professional
- True Windows service
- Better error handling
- Auto-restarts on failure
- Cleaner (no visible windows)
- Industry standard

**Task Scheduler is fine for:**
- Testing
- Personal use
- Quick setup
- Non-critical applications

---

## Post-Installation Checklist

After setting up auto-start (either method):

- [ ] Service/Task runs automatically on startup
- [ ] Application accessible at http://localhost:8080
- [ ] No error messages in logs
- [ ] Database connection working
- [ ] Frontend loads correctly
- [ ] All features functional
- [ ] Tested computer restart
- [ ] Documented admin password (for service maintenance)

---

## Stopping the Service Temporarily

**WinSW:**
```batch
# Run as Administrator
cd C:\DentalClinic\service
DentalClinicService.exe stop
```

**Task Scheduler:**
1. Open Task Scheduler
2. Find "Dental Clinic Backend"
3. Right-click → End
4. Or right-click → Disable (prevents auto-start)

**Or stop Java process directly:**
```batch
# List Java processes
tasklist | findstr java

# Stop process (find PID from above)
taskkill /PID [PID_NUMBER] /F

# Or stop all Java processes (use carefully!)
taskkill /F /IM java.exe
```

---

## Uninstalling Auto-Start

**WinSW:**
```batch
# Run as Administrator
cd C:\DentalClinic\service
DentalClinicService.exe stop
DentalClinicService.exe uninstall
```

**Task Scheduler:**
1. Open Task Scheduler
2. Find "Dental Clinic Backend"
3. Right-click → Delete
4. Confirm deletion

---

## Additional Resources

**WinSW:**
- GitHub: https://github.com/winsw/winsw
- Documentation: https://github.com/winsw/winsw/blob/v3/docs/README.md
- Sample configs: https://github.com/winsw/winsw/tree/v3/examples

**Windows Task Scheduler:**
- Microsoft Docs: https://docs.microsoft.com/en-us/windows/win32/taskschd/task-scheduler-start-page

---

## Getting Help

**If you encounter issues:**

1. **Check logs:**
   - WinSW: `C:\DentalClinic\service\logs\`
   - Task Scheduler: Event Viewer → Windows Logs → Application

2. **Verify basics:**
   - Java is installed and in PATH
   - Database is running
   - Firewall isn't blocking port 8080
   - application.properties has correct database password

3. **Test manually first:**
   ```batch
   cd C:\DentalClinic
   java -jar dental-clinic-backend-0.0.1-SNAPSHOT.jar
   ```
   If this doesn't work, fix the basic issue before setting up auto-start

4. **Check Windows Event Viewer:**
   - Windows + X → Event Viewer
   - Windows Logs → Application
   - Look for errors from Java or your service

---

## Success!

Once set up correctly:

✅ Application starts automatically when Windows starts  
✅ Runs in background (WinSW) or minimized (Task Scheduler)  
✅ Auto-restarts on failure  
✅ No manual intervention needed  
✅ Production-ready setup  

Your dental clinic system is now fully deployed and will start automatically every time the computer boots!

---

**Last Updated:** February 11, 2026  
**Tested on:** Windows 11 (22H2, 23H2)  
**Application:** Dental Clinic Management System v1.0
