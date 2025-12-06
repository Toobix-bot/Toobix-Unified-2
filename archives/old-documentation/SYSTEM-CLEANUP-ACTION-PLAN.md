# 🧹 SYSTEM CLEANUP - ACTION PLAN

**Datum:** 28. November 2025
**Potent:** **40+ GB Sofort, 75+ GB Gesamt**
**Status:** ⚠️ **MANUAL EXECUTION REQUIRED**

---

## 📊 QUICK SUMMARY

| Task | Gain | Risk | Status | Action Required |
|------|------|------|--------|----------------|
| **1. LoL Duplikat** | 34 GB | 🟡 Medium | ⏳ Pending | Manual deletion |
| **2. Norton Uninstall** | 1 GB + RAM | 🟢 Safe | ⏳ Pending | Norton Removal Tool |
| **3. Hibernation deaktivieren** | 3.15 GB | 🟢 Safe | ⏳ Pending | PowerShell command |
| **4. Python venvs** | 2 GB | 🟡 Medium | ⏳ Pending | Manual selection |
| **5. Temp-Files** | 706 MB | 🟢 Safe | ✅ DONE | - |

**TOTAL GAIN: 40+ GB**

---

## 🎯 TASK 1: LOL DUPLIKAT LÖSCHEN (34 GB!)

### **Problem:**
```
Location:  C:\_GAMING\Riot_Games\
Issue:     Duplikat-Installation vorhanden
Old:       Installation vom 5. November (veraltet)
Current:   Installation vom 28. November (aktuell)
Gain:      34 GB
```

### **Verification Commands:**
```powershell
# 1. Check Riot Games folder size
powershell -Command "Get-ChildItem 'C:\_GAMING\Riot_Games' -Recurse | Measure-Object -Property Length -Sum | Select-Object @{Name='SizeGB';Expression={[math]::Round($_.Sum / 1GB, 2)}}"

# 2. List subdirectories with dates
powershell -Command "Get-ChildItem 'C:\_GAMING\Riot_Games' -Directory | Select-Object Name, LastWriteTime, @{Name='SizeGB';Expression={[math]::Round((Get-ChildItem $_.FullName -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1GB, 2)}}"
```

### **Action Steps:**

#### **Option A: Safe Manual Deletion**
```
1. ✅ Backup League Client Config (optional):
   - Copy C:\_GAMING\Riot_Games\Riot Client\Config
   - Copy C:\_GAMING\Riot_Games\League of Legends\Config

2. ⚠️ Identify OLD Installation:
   - Look for folder dated November 5
   - Compare with November 28 folder

3. 🗑️ Delete OLD Installation:
   Windows Explorer:
   - Navigate to C:\_GAMING\Riot_Games
   - Right-click on OLD folder
   - Delete
   - Empty Recycle Bin

4. ✅ Verify Game Still Works:
   - Launch League Client
   - Test login
   - Play one game
```

#### **Option B: Complete Reinstall (Safer but slower)**
```
1. Uninstall League via Windows Settings
2. Delete entire C:\_GAMING\Riot_Games folder
3. Fresh install to desired location
4. Gain: 34 GB immediately
```

### **Recommendation:**
✅ **Option A** if you know which is the old installation
✅ **Option B** if unsure - fresh start is safest

---

## 🎯 TASK 2: NORTON DEINSTALLIEREN (1 GB + RAM)

### **Problem:**
```
Versions:  Norton 360 v25 + v22 (beide installiert!)
RAM Impact: ~200-300 MB
Disk Impact: ~500 MB - 1 GB
Issue:      Dual installation, unnecessary overhead
```

### **Action Steps:**

#### **1. Download Norton Removal Tool:**
```
URL: https://support.norton.com/sp/en/us/home/current/solutions/kb20080710133834EN
File: Norton_Removal_Tool.exe
```

#### **2. Uninstall via Windows Settings:**
```
Windows 11:
1. Settings → Apps → Installed apps
2. Search "Norton"
3. Click "..." → Uninstall for BOTH versions
4. Follow uninstall wizard
```

#### **3. Run Norton Removal Tool:**
```
1. Run Norton_Removal_Tool.exe as Administrator
2. Select "Remove Norton"
3. Restart computer when prompted
```

#### **4. Verify Removal:**
```powershell
# Check if Norton is gone
powershell -Command "Get-ItemProperty 'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*' | Where-Object {$_.DisplayName -like '*Norton*'}"
```

### **Benefits:**
- ✅ ~200-300 MB RAM freed
- ✅ ~500 MB - 1 GB Disk freed
- ✅ Faster boot time
- ✅ Less background CPU usage

---

## 🎯 TASK 3: RUHEZUSTAND DEAKTIVIEREN (3.15 GB)

### **Problem:**
```
File:   C:\hiberfil.sys (3.15 GB)
Usage:  Hibernation support
Issue:  If you don't use hibernation, this is wasted space
```

### **Check if You Use Hibernation:**
```
Do you ever:
- Use "Hibernate" instead of "Shut down"?
- See "Hiberfil.sys" in C:\?

If NO → Safe to disable
If YES → Keep it
```

### **Action Steps:**

#### **Disable Hibernation (Reversible):**
```powershell
# Run PowerShell as ADMINISTRATOR
powercfg -h off

# Verify hiberfil.sys is gone
ls C:\hiberfil.sys
# Should say: File not found
```

#### **Re-enable Later (if needed):**
```powershell
# Run PowerShell as ADMINISTRATOR
powercfg -h on
```

### **Benefits:**
- ✅ 3.15 GB freed IMMEDIATELY
- ✅ Completely reversible
- ✅ No data loss risk
- ✅ Slight faster boot (no hibernate resume check)

---

## 🎯 TASK 4: PYTHON VENVS BEREINIGEN (2 GB)

### **Problem:**
```
Location:  Archived Python projects
Size:      ~2 GB
Issue:     Old virtual environments with dependencies
Reinstall: Easy (pip install -r requirements.txt)
```

### **Identify Python venvs:**
```powershell
# Find all venv/env folders
powershell -Command "Get-ChildItem C:\ -Recurse -Directory -Include 'venv','env','.venv' -ErrorAction SilentlyContinue | Select-Object FullName, @{Name='SizeGB';Expression={[math]::Round((Get-ChildItem $_.FullName -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1GB, 2)}}"
```

### **Safe Deletion Strategy:**

#### **Projects in Archive:**
```
Locations to check:
- C:\_PROJEKTE_ARCHIV (if exists)
- C:\Users\micha\Documents\old-projects
- C:\Users\micha\__CLEANUP_BACKUP

Rule: If project is archived/not active → DELETE venv

Reason: venvs are recreatable:
  python -m venv venv
  pip install -r requirements.txt
```

#### **Active Projects:**
```
Keep venvs for:
- C:\Dev\Projects\AI\Toobix-Unified
- C:\Dev\Projects\AI\WR
- Any actively developed project
```

### **Action Steps:**
```
1. Review each venv location
2. Decide: Active or Archived?
3. Delete archived venvs:
   - Right-click → Delete
   - Or: rmdir /s /q "C:\path\to\venv"

4. Document deleted venvs (optional):
   - Create DELETED_VENVS.txt
   - List project names
   - Can recreate anytime
```

---

## 🎯 TASK 5: TEMP-CLEANUP ✅ DONE!

### **Status:**
```
Cleaned:  706 MB
Location: Various temp folders
Method:   Disk Cleanup + Manual
Status:   ✅ COMPLETE
```

---

## 🔥 EXECUTION PLAN

### **Recommended Order:**

```
1. ⚡ QUICK WINS (Safe, Reversible):
   □ Hibernation deaktivieren (5 minutes, 3.15 GB)
     → PowerShell as Admin: powercfg -h off

2. 🎯 MAXIMUM IMPACT:
   □ LoL Duplikat löschen (15 minutes, 34 GB)
     → Verify which is old, delete OLD folder

3. 🧹 MAINTENANCE:
   □ Norton deinstallieren (20 minutes, 1 GB + RAM)
     → Windows Settings + Norton Removal Tool

4. 🧪 OPTIONAL:
   □ Python venvs (30 minutes, 2 GB)
     → Review archived projects, delete venvs
```

### **Total Time:** ~1-2 Stunden
### **Total Gain:** 40+ GB

---

## ⚠️ SAFETY CHECKS

### **Before You Start:**
- [ ] Backup important game configs (optional)
- [ ] Close all games and applications
- [ ] Have admin rights available
- [ ] Check free space BEFORE: 34 GB / 237 GB
- [ ] Restart computer after all changes

### **During Execution:**
- [ ] Read each step carefully
- [ ] Don't delete system folders (C:\Windows, C:\Program Files)
- [ ] When in doubt, STOP and ask
- [ ] Take screenshots if needed

### **After Completion:**
- [ ] Verify disk space: Should show ~75 GB free
- [ ] Test critical applications (LoL, etc.)
- [ ] Restart computer
- [ ] Run System Monitor dashboard
- [ ] Celebrate 40+ GB freed! 🎉

---

## 📊 EXPECTED RESULTS

### **Before:**
```
Disk C:\:  203.4 GB / 237.39 GB (85.68% full)  🔴 Critical
RAM:       6.5 GB / 7.7 GB (84.42% full)       🔴 Critical
Health:    45/100                               🟠 Warning
```

### **After (Step 1-3):**
```
Disk C:\:  165 GB / 237.39 GB (~69% full)      🟡 Better
RAM:       6.2 GB / 7.7 GB (~80% full)         🟡 Better
Health:    60/100                               🟡 Fair
```

### **After (All Steps):**
```
Disk C:\:  128 GB / 237.39 GB (~54% full)      🟢 OPTIMAL
RAM:       6.0 GB / 7.7 GB (~78% full)         🟢 Good
Health:    75/100                               🟢 Good
```

### **Ultimate Goal (with Backup relocation):**
```
Disk C:\:  ~100 GB / 237.39 GB (~42% full)     🟢 EXCELLENT
RAM:       <6 GB / 7.7 GB (<78%)               🟢 EXCELLENT
Health:    85/100                               🟢 EXCELLENT
```

---

## 🚀 NEXT STEPS AFTER CLEANUP

### **Immediate:**
1. ✅ Restart System Monitor dashboard
2. ✅ Verify new Health Score
3. ✅ Check Disk Usage graph
4. ✅ Test critical applications

### **This Week:**
- [ ] Move C:\_BACKUP to external drive (23.79 GB)
- [ ] Organize C:\ structure (remove empty folders)
- [ ] Set up OneDrive optimization
- [ ] Create System Restore Point

### **Long-term:**
- [ ] Regular cleanup schedule (monthly)
- [ ] Monitor disk usage trends
- [ ] Archive old projects properly
- [ ] Consider SSD upgrade if needed

---

## 💡 PREVENTION TIPS

### **Avoid Future Bloat:**
- 🎮 **Games:** Install to separate drive if possible
- 📦 **Downloads:** Clear downloads folder monthly
- 🗂️ **Projects:** Archive old projects, delete venvs
- 💾 **Backups:** Use external drive or cloud, NOT C:\
- 🧹 **Cleanup:** Monthly Disk Cleanup routine
- 📊 **Monitor:** Check System Control Center weekly

### **Early Warning Signs:**
- ⚠️ Disk usage >75%
- ⚠️ RAM usage >80%
- ⚠️ Slow boot time
- ⚠️ Applications lagging
- ⚠️ "Low disk space" warnings

**Action:** Run System Control Center cleanup BEFORE critical!

---

## 🛠️ TOOLS & COMMANDS REFERENCE

### **Check Disk Space:**
```powershell
# Current usage
powershell -Command "Get-PSDrive C | Select-Object Used, Free, @{Name='Total';Expression={$_.Used + $_.Free}}"
```

### **Check RAM Usage:**
```powershell
# Top RAM consumers
powershell -Command "Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 10 ProcessName, @{Name='RAM_MB';Expression={[math]::Round($_.WorkingSet / 1MB, 2)}}"
```

### **Run System Monitor:**
```bash
cd C:\Dev\Projects\AI\Toobix-Unified
bun run system:monitor
# Open: http://localhost:8961/api/system/current
```

### **Open Dashboard:**
```bash
start scripts\dashboards\system-control-center.html
```

---

## 📞 NEED HELP?

**If Something Goes Wrong:**
1. ❌ DON'T panic
2. ⏸️ STOP further changes
3. 📸 Take screenshot of error
4. 🔄 Restart computer
5. 💬 Ask for help with details

**Common Issues:**
- "Access Denied" → Run as Administrator
- "File in Use" → Close all applications, restart
- "Cannot Delete" → Check file isn't open, check permissions

---

## ✅ FINAL CHECKLIST

### **Pre-Flight:**
- [ ] Read entire document
- [ ] Understand each task
- [ ] Have admin rights ready
- [ ] Close all applications
- [ ] Backup critical configs (optional)

### **Execution:**
- [ ] Task 1: Hibernation (powercfg -h off)
- [ ] Task 2: LoL Duplikat (delete old folder)
- [ ] Task 3: Norton (removal tool)
- [ ] Task 4: Python venvs (archived projects)

### **Post-Flight:**
- [ ] Restart computer
- [ ] Verify disk space (~75 GB free)
- [ ] Test critical apps
- [ ] Run System Monitor
- [ ] Update Health Score
- [ ] Celebrate success! 🎉

---

**🎊 LET'S FREE UP 40+ GB! 🎊**

**Erstellt:** 28. November 2025
**Von:** Claude (Anthropic)
**Für:** System Optimization
**Potential:** 40+ GB sofort, 75+ GB gesamt
**Status:** ⚠️ Ready for Execution
