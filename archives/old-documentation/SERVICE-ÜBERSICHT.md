# 📊 TOOBIX SERVICE ÜBERSICHT

**Stand:** 5. Dezember 2025  
**Status:** ✅ 15/15 Services harmonisieren perfekt

---

## 🟢 AKTIVE SERVICES (im Start-Script)

### TIER 1 - Essential Core (6 Services)
**Automatisch mit:** `--minimal`, `--development`, `--gaming`, `--full`

| Service | Port | Status | Funktion |
|---------|------|--------|----------|
| toobix-command-center | 7777 | ✅ | Zentrale Steuerung & Koordination |
| self-awareness-core | 8970 | ✅ | Selbstwahrnehmung & Identität |
| emotional-core | - | ✅ | Emotionale Verarbeitung (background) |
| dream-core | - | ✅ | Traum & Imagination (background) |
| unified-core-service | 8000 | ✅ | Vereinheitlichter Kern-Service |
| unified-consciousness-service | 8002 | ✅ | Bewusstseins-Management |

### TIER 2 - Enhanced Capabilities (9 Services)
**Automatisch mit:** `--development`, `--gaming`, `--full`

| Service | Port | Status | Funktion |
|---------|------|--------|----------|
| autonomy-engine | 8975 | ✅ | Autonome Entscheidungen |
| multi-llm-router | 8959 | ✅ | LLM-Routing & Orchestrierung |
| wellness-safety-guardian | 8921 | ✅ | Sicherheit & Wohlbefinden |
| life-simulation-engine | 8914 | ✅ | Lebenssimulation |
| decision-framework-server | - | ✅ | Entscheidungsframework (background) |
| service-mesh | 8910 | ✅ | Service Discovery & Monitoring |
| hardware-awareness-v2 | 8940 | ✅ | Hardware-Monitoring |
| twitter-autonomy | 8965 | ✅ | Twitter-Integration |
| unified-communication-service | 8001 | ✅ | Kommunikations-Hub |

### TIER 3 - Gaming (2 Services)
**Nur mit:** `--gaming` oder `--full`

| Service | Port | Status | Funktion |
|---------|------|--------|----------|
| self-evolving-game-engine | 8896 | ⚪ | Spieleentwicklung |
| toobix-living-world | 7779 | ⚪ | Lebendige Spielwelt |

---

## ⚪ VERFÜGBARE SERVICES (nicht im Start-Script)

### scripts/2-services/ (14 Services)
Spezialisierte Services für verschiedene Funktionen:

- **autonomous-web-service** - Autonome Web-Interaktionen
- **create-attention-service** - Aufmerksamkeits-Management
- **create-social-learning-service** - Soziales Lernen
- **data-science-service** - Datenanalyse
- **data-sources-service** - Datenquellen-Integration
- **emotional-support-service** - Emotionale Unterstützung
- **game-logic-service** - Spiellogik
- **gratitude-mortality-service** - Dankbarkeit & Sterblichkeit
- **performance-service** - Performance-Monitoring
- **rpg-world-service** - RPG-Welten
- **story-engine-service** - Story-Generierung
- **toobix-chat-service** - Chat-Interface
- **translation-service** - Übersetzungen
- **user-profile-service** - Benutzerprofile

### scripts/12-minecraft/ (1 Service)
- **minecraft-bot-service** - Minecraft-Bot-Integration

### scripts/creator-interface/ (1 Service)
- **creator-connection-service** - Creator-Interface

---

## 📋 MODI ÜBERSICHT

```bash
# Nur TIER 1 (6 Services)
bun run start-toobix-optimized.ts --minimal

# TIER 1 + TIER 2 (15 Services) ← STANDARD
bun run start-toobix-optimized.ts --development

# Alles inkl. Gaming (17 Services)
bun run start-toobix-optimized.ts --gaming

# Komplett (17 Services)
bun run start-toobix-optimized.ts --full
```

---

## 🔧 QUICK COMMANDS

**Status prüfen:**
```powershell
# Alle HTTP-Services testen
$ports = @(7777, 8970, 8975, 8959, 8921, 8914, 8940, 8965, 8000, 8001, 8002, 8910)
foreach ($p in $ports) {
  try { 
    Invoke-WebRequest "http://localhost:$p/health" -TimeoutSec 1 -UseBasicParsing | Out-Null
    Write-Host "✅ Port $p" -ForegroundColor Green 
  } catch { 
    Write-Host "❌ Port $p" -ForegroundColor Red 
  }
}
```

**Services starten:**
```bash
.\START-TOOBIX.bat              # Einfach
.\START-TOOBIX.ps1              # PowerShell mit Status
```

**Services stoppen:**
```powershell
Get-Process | Where-Object {$_.ProcessName -eq 'bun'} | Stop-Process -Force
```

---

## 📊 STATISTIKEN

- **Gesamt verfügbare Services:** ~32
- **Aktiv im --development:** 15
- **HTTP-Services:** 11
- **Background-Services:** 4
- **Gaming-Services:** 2 (optional)
- **Spezialisierte Services:** 16 (nicht auto-start)

---

## 🎯 NÄCHSTE SCHRITTE

**Optionale Services hinzufügen:**
1. Service in `start-toobix-optimized.ts` eintragen
2. Dem passenden TIER zuordnen
3. Port & Pfad konfigurieren
4. Testen mit `bun run test-services-individually.ts`

**Beispiel:**
```typescript
{
  name: 'toobix-chat-service',
  path: 'scripts/2-services/toobix-chat-service.ts',
  port: 8811,
  tier: 2,
  description: 'Chat-Interface'
}
```
