# Windows Service Management - Quick Reference Card
## Dental Clinic Management System

**Print this card and keep it handy!**

---

## WinSW Service Commands

**⚠️ All commands must be run as Administrator**

**Open Command Prompt as Admin:**
1. Windows key → type "cmd"
2. Right-click "Command Prompt"
3. Select "Run as administrator"

**Navigate to service directory:**
```batch
cd C:\DentalClinic\service
```

---

### Common Commands

**Check Status:**
```batch
DentalClinicService.exe status
```

**Start Service:**
```batch
DentalClinicService.exe start
```

**Stop Service:**
```batch
DentalClinicService.exe stop
```

**Restart Service:**
```batch
DentalClinicService.exe restart
```

**View Logs:**
```batch
type logs\DentalClinicService.out.log
```

**View Errors:**
```batch
type logs\DentalClinicService.err.log
```

---

## Using Windows Services GUI

**Open Services:**
1. Windows + R
2. Type: `services.msc`
3. Press Enter

**Find your service:**
- Look for: "Dental Clinic Management System"

**Actions available:**
- Right-click → Start
- Right-click → Stop
- Right-click → Restart
- Right-click → Properties (for advanced settings)

---

## Troubleshooting

**Problem: Service won't start**

1. Check Java is installed:
   ```batch
   java -version
   ```

2. Check database is running:
   ```batch
   psql -U postgres -c "SELECT 1"
   ```

3. Check port 8080 is free:
   ```batch
   netstat -ano | findstr :8080
   ```

4. View error log:
   ```batch
   type C:\DentalClinic\service\logs\DentalClinicService.err.log
   ```

---

**Problem: Application not accessible**

1. Wait 30 seconds after service start
2. Check service status (should show "Running")
3. Try: http://localhost:8080
4. Check firewall isn't blocking port 8080

---

**Problem: Service installed but won't auto-start**

1. Open Services (services.msc)
2. Find "Dental Clinic Management System"
3. Right-click → Properties
4. Startup type should be: "Automatic (Delayed Start)"
5. If not, change it and click OK

---

## Quick Health Check

**Run these to verify everything is working:**

```batch
REM 1. Check service status
cd C:\DentalClinic\service
DentalClinicService.exe status

REM 2. Check if port 8080 is listening
netstat -ano | findstr :8080

REM 3. Test database connection
psql -U postgres -d dental_clinic -c "SELECT COUNT(*) FROM patients;"
```

**All should show positive results!**

---

## Emergency: Stop All Java Processes

**If service gets stuck:**

```batch
REM This stops ALL Java processes - use carefully!
taskkill /F /IM java.exe
```

**Then restart service:**
```batch
cd C:\DentalClinic\service
DentalClinicService.exe start
```

---

## Application URLs

**Backend API:**
- http://localhost:8080/api/patients
- http://localhost:8080/api/appointments

**Frontend (if using Option A - served by backend):**
- http://localhost:8080/

**Health Check:**
- http://localhost:8080/actuator/health (if actuator enabled)

---

## Important File Locations

**Service Configuration:**
- `C:\DentalClinic\service\DentalClinicService.xml`

**Application JAR:**
- `C:\DentalClinic\dental-clinic-backend-0.0.1-SNAPSHOT.jar`

**Database Config:**
- `C:\DentalClinic\application.properties`

**Service Logs:**
- `C:\DentalClinic\service\logs\`

**Database Backups:**
- `C:\DentalClinic\Backups\`

---

## Maintenance Schedule

**Daily:**
- [ ] Verify service is running
- [ ] Check application is accessible
- [ ] Automated backup runs at 2 AM

**Weekly:**
- [ ] Review service logs for errors
- [ ] Copy backup to external drive
- [ ] Test application features

**Monthly:**
- [ ] Test backup restoration
- [ ] Check disk space
- [ ] Review and clean old logs

---

## Support Contact

**For technical issues:**
- Check service logs first
- Review this quick reference
- Consult full documentation: Windows_11_Auto_Start_Guide.md

**Emergency contact:**
- Name: ___________________
- Phone: ___________________
- Email: ___________________

---

**Service Name:** Dental Clinic Management System  
**Service ID:** DentalClinicService  
**Installation Date:** ___________________  
**Administrator:** ___________________

---

**Quick Status Check:**
✓ Service installed: [ ] YES [ ] NO  
✓ Auto-start enabled: [ ] YES [ ] NO  
✓ Database configured: [ ] YES [ ] NO  
✓ Backup configured: [ ] YES [ ] NO  
✓ Tested restart: [ ] YES [ ] NO  

---

*Print this card and laminate it for durability!*
