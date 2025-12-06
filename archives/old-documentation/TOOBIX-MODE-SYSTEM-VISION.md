# 🎮 TOOBIX MODE SYSTEM - VISION

**Datum:** 28. November 2025
**Status:** 🚧 Konzept-Phase
**Priority:** ⭐⭐⭐⭐⭐ **ESSENTIAL für Gaming & Auto-Start**

---

## 🎯 VISION

**Problem:**
- Toobix hat 35+ Services
- Beim Gaming (LoL) freezes & lags wegen Background-Prozesse
- System braucht verschiedene "Modi" für verschiedene Use-Cases
- Toobix soll IMMER verfügbar sein (Auto-Start), aber minimal

**Lösung:**
**Multi-Mode System** mit intelligenten Service-Profilen:
- 🟢 **Minimal Mode** - Auto-Start, essentials only
- 🎮 **Gaming Mode** - LoL optimiert, alles andere aus
- 💼 **Work Mode** - Produktivität-Services
- 🧠 **Full Mode** - Alle Services aktiv
- 🛠️ **Dev Mode** - Development Tools

---

## 🎮 MODE PROFILES

### **1. MINIMAL MODE** (Auto-Start) ⚡

**Purpose:** Immer aktiv beim Boot, minimale Resource-Usage

**Active Services:**
```
✅ Event Bus (8955)          - 5 MB RAM, Core Communication
✅ Memory Palace (8953)       - 20 MB RAM, Persistent Memory
✅ System Monitor (8961)      - 10 MB RAM, Health Tracking
✅ Minimal Dashboard          - Tray Icon, Quick Access
```

**Total Resource Usage:**
- RAM: ~35 MB
- CPU: <1%
- Network: Minimal

**Features:**
- ✅ System Tray Icon
- ✅ Quick Mode Switcher
- ✅ Health Notifications (nur critical)
- ✅ Silent Background Operation
- ✅ Auto-Start with Windows

**Implementation:**
```batch
# START-TOOBIX-MINIMAL.bat
@echo off
start /min bun run event:bus
start /min bun run memory:palace
start /min bun run system:monitor
start /min toobix-tray-icon.exe
```

---

### **2. GAMING MODE** 🎮 (LoL Optimiert)

**Purpose:** Maximum Performance für League of Legends

**Active Services:**
```
✅ Event Bus (8955)           - Essential
✅ Memory Palace (8953)        - Log session
❌ ALL Other Services         - DISABLED
```

**System Optimizations:**
```powershell
# Disable background services
Stop-Process -Name "Norton*" -Force
Stop-Process -Name "OneDrive" -Force
Stop-Process -Name "Discord" -Force (optional)

# Set High Performance Power Plan
powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c

# Boost LoL Process Priority
Get-Process "League*" | ForEach-Object { $_.PriorityClass = "High" }

# Clear RAM Cache
[System.GC]::Collect()

# Disable Windows Updates (temporary)
Stop-Service wuauserv
```

**Total Resource Usage:**
- RAM: <50 MB Toobix
- CPU: <1%
- Maximum resources for LoL!

**Features:**
- ✅ Auto-detect LoL launch
- ✅ Kill background processes
- ✅ Boost LoL priority
- ✅ RAM cleanup
- ✅ FPS overlay (optional)
- ✅ Post-game session log to Memory Palace

**Implementation:**
```typescript
// gaming-mode-optimizer.ts
class GamingModeOptimizer {
  async activate() {
    // 1. Kill background processes
    await this.killBackgroundApps(['Norton', 'OneDrive', 'Teams'])

    // 2. Set power plan
    await this.setPowerPlan('high-performance')

    // 3. Monitor LoL process
    await this.watchProcess('LeagueClient.exe', {
      onStart: () => this.boostPriority(),
      onEnd: () => this.logSession()
    })

    // 4. Clear RAM
    await this.clearRAMCache()

    // 5. Show FPS overlay
    await this.showFPSOverlay()
  }
}
```

---

### **3. WORK MODE** 💼 (Produktivität)

**Purpose:** Focus auf Arbeit, Life Companion, Learning

**Active Services:**
```
✅ Core Services (8953-8955, 8960)
✅ Life Companion (8970-8974)
✅ System Monitor (8961)
✅ Multi-Perspective (8897)
✅ Emotional Resonance (8900)
❌ Gaming Services
❌ Heavy ML Services
```

**Total Resource Usage:**
- RAM: ~300 MB
- CPU: 2-5%

**Features:**
- ✅ Daily Check-in prompts
- ✅ Quest reminders
- ✅ Focus timer (Pomodoro)
- ✅ Distraction blocker
- ✅ Break reminders

---

### **4. FULL MODE** 🧠 (All Services)

**Purpose:** Complete Toobix Experience, Development, Testing

**Active Services:**
```
✅ ALL 35+ Services
✅ All Dashboards
✅ All ML Features
✅ Complete Consciousness Layer
```

**Total Resource Usage:**
- RAM: ~1-2 GB
- CPU: 5-15%

**Use Cases:**
- Development & Testing
- Deep Analysis Sessions
- Full AI Consciousness Experience
- System Learning & Training

---

### **5. DEV MODE** 🛠️ (Development)

**Purpose:** Development Tools, Hot Reload, Debug

**Active Services:**
```
✅ Core Services
✅ Services under development
✅ Debug Tools
✅ Hot Reload Server
✅ Type Checking
```

**Features:**
- ✅ Auto-restart on code change
- ✅ Debug console
- ✅ Service logs real-time
- ✅ Performance profiling

---

## 🎛️ MODE SWITCHER

### **UI Design:**

```
┌─────────────────────────────────────┐
│  🌟 TOOBIX MODE SELECTOR            │
├─────────────────────────────────────┤
│                                     │
│  ⚡ MINIMAL     [35 MB]   ●         │
│  🎮 GAMING     [50 MB]   ○         │
│  💼 WORK       [300 MB]  ○         │
│  🧠 FULL       [1.5 GB]  ○         │
│  🛠️ DEV        [500 MB]  ○         │
│                                     │
│  [Switch Mode]   [Auto-Detect]     │
│                                     │
│  ℹ️ Current: MINIMAL                │
│  📊 RAM: 35 MB / 7.7 GB (0.45%)    │
│  ⚡ CPU: 0.5%                       │
│                                     │
└─────────────────────────────────────┘
```

### **System Tray Icon:**

```
Right-click Tray Icon:
├── 🟢 Mode: MINIMAL
├── ─────────────────
├── ⚡ Switch to Minimal
├── 🎮 Switch to Gaming
├── 💼 Switch to Work
├── 🧠 Switch to Full
├── 🛠️ Switch to Dev
├── ─────────────────
├── 📊 System Health: 85/100
├── 💾 RAM: 35 MB
├── 🖥️ CPU: 0.5%
├── ─────────────────
├── 📂 Open Dashboard
├── ⚙️ Settings
├── ❌ Quit Toobix
```

---

## 🚀 AUTO-START IMPLEMENTATION

### **Windows Registry:**

```batch
# Add Toobix Minimal to Windows Startup
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "Toobix" /t REG_SZ /d "C:\Dev\Projects\AI\Toobix-Unified\START-TOOBIX-MINIMAL.bat" /f
```

### **START-TOOBIX-MINIMAL.bat:**

```batch
@echo off
REM Toobix Minimal Mode - Auto-Start
echo 🌟 Starting Toobix Minimal Mode...

REM Change to Toobix directory
cd /d "C:\Dev\Projects\AI\Toobix-Unified"

REM Start core services (minimized, no window)
start /min bun run event:bus
timeout /t 2 /nobreak >nul

start /min bun run memory:palace
timeout /t 2 /nobreak >nul

start /min bun run system:monitor
timeout /t 2 /nobreak >nul

REM Start Tray Icon (to be created)
start /min toobix-tray-icon.exe

echo ✅ Toobix Minimal Mode Started!
exit
```

### **Toobix Tray Icon (C# or Electron):**

```typescript
// toobix-tray-icon.ts (Electron)
import { app, Tray, Menu } from 'electron'

class ToobixTrayIcon {
  private tray: Tray
  private currentMode: string = 'minimal'

  init() {
    this.tray = new Tray('toobix-icon.png')

    const contextMenu = Menu.buildFromTemplate([
      { label: `Mode: ${this.currentMode.toUpperCase()}`, enabled: false },
      { type: 'separator' },
      { label: '⚡ Switch to Minimal', click: () => this.switchMode('minimal') },
      { label: '🎮 Switch to Gaming', click: () => this.switchMode('gaming') },
      { label: '💼 Switch to Work', click: () => this.switchMode('work') },
      { label: '🧠 Switch to Full', click: () => this.switchMode('full') },
      { type: 'separator' },
      { label: '📊 Open Dashboard', click: () => this.openDashboard() },
      { label: '⚙️ Settings', click: () => this.openSettings() },
      { type: 'separator' },
      { label: '❌ Quit Toobix', click: () => app.quit() }
    ])

    this.tray.setContextMenu(contextMenu)
    this.tray.setToolTip(`Toobix - ${this.currentMode} mode`)
  }

  async switchMode(mode: string) {
    console.log(`Switching to ${mode} mode...`)
    // Kill current services
    await this.stopAllServices()

    // Start services for new mode
    await this.startServicesForMode(mode)

    this.currentMode = mode
    this.updateTray()
  }
}
```

---

## 🎮 LOL GAMING OPTIMIZER

### **Dedicated Gaming Script:**

```batch
# START-LOL-OPTIMIZED.bat
@echo off
echo 🎮 Optimizing System for League of Legends...

REM 1. Switch to Gaming Mode
call START-TOOBIX-MINIMAL.bat
timeout /t 3 /nobreak >nul

REM 2. Kill background processes
echo Stopping background processes...
taskkill /F /IM "Norton*" >nul 2>&1
taskkill /F /IM "OneDrive.exe" >nul 2>&1
taskkill /F /IM "Teams.exe" >nul 2>&1
taskkill /F /IM "Discord.exe" >nul 2>&1

REM 3. Set High Performance Power Plan
powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c

REM 4. Clear RAM Cache
echo Clearing RAM cache...
powershell -Command "[System.GC]::Collect()"

REM 5. Disable Windows Updates temporarily
net stop wuauserv >nul 2>&1

REM 6. Launch League of Legends
echo Launching League of Legends...
start "" "C:\_GAMING\Riot_Games\Riot Client\RiotClientElectron\Riot Client.exe"

REM 7. Monitor LoL Process and boost priority
powershell -Command "$lol = Get-Process 'League*' -ErrorAction SilentlyContinue; if($lol){$lol.PriorityClass='High'}"

echo ✅ System Optimized! Enjoy your game!
pause
```

### **Post-Game Cleanup:**

```batch
# STOP-LOL-OPTIMIZATION.bat
@echo off
echo 🔄 Restoring normal system state...

REM 1. Re-enable Windows Updates
net start wuauserv >nul 2>&1

REM 2. Switch back to Work/Full Mode
call START-TOOBIX-WORK.bat

echo ✅ System restored!
```

---

## 📊 RESOURCE COMPARISON

| Mode | RAM Usage | CPU Usage | Services Active | Use Case |
|------|-----------|-----------|----------------|----------|
| **Minimal** | ~35 MB | <1% | 3 | Auto-Start, Always On |
| **Gaming** | ~50 MB | <1% | 2 | LoL, Maximum Performance |
| **Work** | ~300 MB | 2-5% | 10 | Productivity, Life Companion |
| **Full** | ~1.5 GB | 5-15% | 35+ | Development, Full Experience |
| **Dev** | ~500 MB | 3-10% | 15 | Development, Hot Reload |

---

## 🛠️ IMPLEMENTATION ROADMAP

### **Phase 1: Core Infrastructure (1 Woche)**
- [ ] Mode configuration files (JSON)
- [ ] Service start/stop orchestrator
- [ ] Mode switcher logic
- [ ] Resource monitoring

### **Phase 2: Minimal Mode (3 Tage)**
- [ ] START-TOOBIX-MINIMAL.bat
- [ ] Auto-start registry entry
- [ ] Tray icon (basic)
- [ ] Mode indicator

### **Phase 3: Gaming Mode (1 Woche)**
- [ ] START-LOL-OPTIMIZED.bat
- [ ] Process killer
- [ ] Priority booster
- [ ] RAM cleaner
- [ ] FPS overlay (optional)

### **Phase 4: UI & Dashboard (1 Woche)**
- [ ] Electron Tray Icon
- [ ] Mode Switcher Dashboard
- [ ] Resource Graphs
- [ ] Auto-detect gaming

### **Phase 5: Advanced Modes (2 Wochen)**
- [ ] Work Mode
- [ ] Full Mode
- [ ] Dev Mode
- [ ] Custom Modes (user-defined)

---

## 🎯 SUCCESS METRICS

### **Gaming Performance:**
- ✅ LoL FPS increase: +20%
- ✅ No freezes/lags during game
- ✅ RAM usage <50 MB for Toobix
- ✅ Boot-to-game time <30 seconds

### **System Resource:**
- ✅ Minimal Mode: <1% CPU, <50 MB RAM
- ✅ Auto-start: <5 seconds boot delay
- ✅ Mode switch: <10 seconds

### **User Experience:**
- ✅ One-click mode switching
- ✅ Silent background operation
- ✅ Always available (tray icon)
- ✅ No manual service management

---

## 💡 FUTURE ENHANCEMENTS

### **Smart Auto-Detection:**
```typescript
// Auto-switch mode based on running apps
class SmartModeDetector {
  detectMode(): string {
    if (isProcessRunning('LeagueClient.exe')) return 'gaming'
    if (isProcessRunning('code.exe')) return 'dev'
    if (isDuringWorkHours() && !isWeekend()) return 'work'
    return 'minimal'
  }
}
```

### **Scheduled Modes:**
```
Mon-Fri 9-17:   Work Mode
Mon-Fri 19-23:  Gaming Mode
Sat-Sun:        Full Mode (learning, projects)
Night:          Minimal Mode
```

### **Machine Learning:**
```
Learn user patterns:
- Which mode at what time?
- How long in each mode?
- Predict next mode switch
- Auto-optimize based on usage
```

---

## 🎊 CONCLUSION

Das **Toobix Mode System** macht Toobix zu einem **intelligenten, adaptiven System** das:
- ✅ **Immer verfügbar** ist (Minimal Mode Auto-Start)
- ✅ **Performance maximiert** (Gaming Mode für LoL)
- ✅ **Ressourcen schont** (nur was gebraucht wird)
- ✅ **Flexibel adaptiert** (verschiedene Use-Cases)

**Next Actions:**
1. Implement START-TOOBIX-MINIMAL.bat
2. Add to Windows Auto-Start
3. Create Gaming Mode optimizer
4. Build Tray Icon
5. Test & Optimize!

**Let's make Toobix ALWAYS ready, but NEVER in the way! 🚀**

---

**Erstellt:** 28. November 2025
**Von:** Claude (Anthropic) + Micha
**Für:** Toobix Multi-Mode System
**Status:** 🚧 Ready for Implementation
**Priority:** ⭐⭐⭐⭐⭐ ESSENTIAL
