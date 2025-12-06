# 🌐 Oracle Cloud Free Tier - Minecraft Server Setup für 19 Bots

## Warum Oracle Cloud?
- **100% KOSTENLOS FOREVER** (kein Trick, wirklich kostenlos)
- 4 vCPU + 24GB RAM (!!!)
- 200GB Storage
- Immer online, kein Auto-Sleep
- Kann 50+ Bots easy handlen
- Bessere Performance als Aternos/Minehut

---

## TEIL 1: ACCOUNT ERSTELLEN (5 Minuten)

### 1.1 Registrierung
1. Gehe zu: https://www.oracle.com/cloud/free/
2. Klicke "Start for free"
3. Fülle das Formular aus:
   - Email
   - Land: Germany
   - Name
4. **Kreditkarte wird verlangt** (ABER: Es wird nichts abgebucht!)
   - Oracle prüft nur ob die Karte echt ist
   - Free Tier hat keine Kosten
   - Du kannst später ein Spending Limit von 0€ setzen

### 1.2 Account-Verifizierung
- Email bestätigen
- Warte ~2 Minuten auf Account-Aktivierung
- Login bei: https://cloud.oracle.com

---

## TEIL 2: VM INSTANZ ERSTELLEN (10 Minuten)

### 2.1 Compute Instance erstellen
1. Im Oracle Cloud Dashboard:
   - Klicke **"Create a VM instance"**
   - Oder: Menu → Compute → Instances → Create Instance

### 2.2 Instance konfigurieren

**Name:**
```
toobix-minecraft-server
```

**Image und Shape:**
1. Klicke **"Edit"** bei Image and shape
2. **Image wählen:**
   - Canonical Ubuntu 22.04 (empfohlen)
   - ODER: Oracle Linux 8 (auch gut)
3. **Shape wählen:**
   - Klicke **"Change Shape"**
   - Wähle: **VM.Standard.A1.Flex** (ARM-basiert, kostenlos!)
   - ODER: **VM.Standard.E2.1.Micro** (x86, auch kostenlos)

   **Für 19 Bots empfohlen:**
   - **OCPUs:** 4 (Maximum für Free Tier!)
   - **Memory:** 24 GB (Maximum für Free Tier!)

**Networking:**
- Virtual Cloud Network: **Automatisch erstellen** (Standard)
- Subnet: **Public Subnet** (wichtig!)
- **Assign a public IPv4 address:** ✅ MUSS angehakt sein!

**SSH Keys:**
1. **Generate SSH key pair** (empfohlen)
2. Klicke **"Save Private Key"** → Speichere als `oracle-minecraft-key.key`
3. Klicke **"Save Public Key"** → Speichere als `oracle-minecraft-key.pub`
4. **WICHTIG:** Bewahre die Private Key Datei sicher auf!

**Boot Volume:**
- **Size:** 50-100 GB (ausreichend für Minecraft + Bots)

### 2.3 Instance erstellen
- Klicke **"Create"**
- Warte ~2 Minuten bis Status = **RUNNING** (grün)
- Notiere die **Public IP Address** (z.B. 140.238.123.45)

---

## TEIL 3: FIREWALL KONFIGURIEREN (5 Minuten)

### 3.1 Security List anpassen
1. Im Instance Details:
   - Unter **Instance Information** → Klicke auf **Virtual cloud network**
   - Links: **Security Lists** → Klicke auf die Liste (z.B. "Default Security List")

2. **Ingress Rules** (Eingehende Verbindungen):
   - Klicke **"Add Ingress Rules"**

   **Regel 1: Minecraft Server**
   ```
   Source CIDR: 0.0.0.0/0
   IP Protocol: TCP
   Source Port Range: All
   Destination Port Range: 25565
   Description: Minecraft Server
   ```

   **Regel 2: SSH (falls nicht vorhanden)**
   ```
   Source CIDR: 0.0.0.0/0
   IP Protocol: TCP
   Source Port Range: All
   Destination Port Range: 22
   Description: SSH Access
   ```

### 3.2 Ubuntu Firewall konfigurieren (später via SSH)
Wird in Teil 4 gemacht.

---

## TEIL 4: SERVER VERBINDEN & EINRICHTEN (15 Minuten)

### 4.1 SSH Verbindung (von Windows)

**Option A: Mit PowerShell**
```powershell
# Private Key Permissions setzen (wichtig!)
# Kopiere oracle-minecraft-key.key nach C:\Users\DEINNAME\.ssh\

# Verbinden
ssh -i C:\Users\DEINNAME\.ssh\oracle-minecraft-key.key ubuntu@DEINE_PUBLIC_IP
# Beispiel: ssh -i C:\Users\Michael\.ssh\oracle-minecraft-key.key ubuntu@140.238.123.45
```

**Option B: Mit PuTTY**
1. Download PuTTY: https://www.putty.org/
2. Konvertiere Private Key zu .ppk mit PuTTYgen
3. In PuTTY:
   - Host: DEINE_PUBLIC_IP
   - Connection → SSH → Auth → Private key: oracle-minecraft-key.ppk

### 4.2 System Update
```bash
sudo apt update && sudo apt upgrade -y
```

### 4.3 Java installieren
```bash
# OpenJDK 17 (empfohlen für Minecraft 1.20.1)
sudo apt install openjdk-17-jre-headless -y

# Verifizieren
java -version
```

### 4.4 Ubuntu Firewall konfigurieren
```bash
# Firewall aktivieren
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 25565/tcp # Minecraft
sudo ufw enable

# Status prüfen
sudo ufw status
```

### 4.5 Minecraft Server installieren
```bash
# Server Verzeichnis erstellen
mkdir -p ~/minecraft-server
cd ~/minecraft-server

# Server JAR downloaden (Paper - empfohlen für Performance)
wget https://api.papermc.io/v2/projects/paper/versions/1.20.1/builds/196/downloads/paper-1.20.1-196.jar -O server.jar

# ODER Vanilla Server:
# wget https://piston-data.mojang.com/v1/objects/84194a2f286ef7c14ed7ce0090dba59902951553/server.jar

# Ersten Start (erstellt Dateien)
java -Xmx2G -Xms1G -jar server.jar nogui

# EULA akzeptieren
nano eula.txt
# Ändere "eula=false" zu "eula=true"
# Speichern: Ctrl+O, Enter, Ctrl+X
```

### 4.6 Server Properties konfigurieren
```bash
nano server.properties
```

**Wichtige Einstellungen:**
```properties
# Performance für 19 Bots
max-players=20
view-distance=8
simulation-distance=6

# Server Info
server-name=Toobix Colony
motd=Toobix Minecraft Colony - 19 Bots + You!

# Gameplay
difficulty=normal
gamemode=survival
pvp=false
spawn-protection=0

# Performance
network-compression-threshold=256
```

Speichern: `Ctrl+O`, `Enter`, `Ctrl+X`

### 4.7 Start Script erstellen
```bash
nano start.sh
```

**Für 24GB RAM Server:**
```bash
#!/bin/bash
java -Xmx20G -Xms10G -XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions -XX:+DisableExplicitGC -XX:+AlwaysPreTouch -XX:G1HeapWastePercent=5 -XX:G1MixedGCCountTarget=4 -XX:G1MixedGCLiveThresholdPercent=90 -XX:G1RSetUpdatingPauseTimePercent=5 -XX:SurvivorRatio=32 -XX:+PerfDisableSharedMem -XX:MaxTenuringThreshold=1 -XX:G1NewSizePercent=30 -XX:G1MaxNewSizePercent=40 -XX:G1HeapRegionSize=8M -XX:G1ReservePercent=20 -XX:InitiatingHeapOccupancyPercent=15 -Dusing.aikars.flags=https://mcflags.emc.gs -Daikars.new.flags=true -jar server.jar nogui
```

Executable machen:
```bash
chmod +x start.sh
```

### 4.8 Server starten
```bash
./start.sh
```

**Server läuft jetzt!** Verbinde mit: **DEINE_PUBLIC_IP:25565**

---

## TEIL 5: AUTO-START MIT SYSTEMD (Optional, 5 Minuten)

Server startet automatisch nach Reboot:

```bash
sudo nano /etc/systemd/system/minecraft.service
```

**Service File:**
```ini
[Unit]
Description=Toobix Minecraft Server
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/minecraft-server
ExecStart=/home/ubuntu/minecraft-server/start.sh
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Aktivieren:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable minecraft
sudo systemctl start minecraft

# Status prüfen
sudo systemctl status minecraft

# Logs anschauen
sudo journalctl -u minecraft -f
```

**Server Befehle:**
```bash
sudo systemctl start minecraft    # Starten
sudo systemctl stop minecraft     # Stoppen
sudo systemctl restart minecraft  # Neustarten
sudo systemctl status minecraft   # Status
```

---

## TEIL 6: BOTS KONFIGURIEREN

### 6.1 Bot Config Update
Ändere in `toobix-hybrid-empire.ts`:

```typescript
const CONFIG = {
  server: {
    host: 'DEINE_ORACLE_PUBLIC_IP',  // z.B. '140.238.123.45'
    port: 25565
  },
  // ... rest bleibt gleich
};
```

### 6.2 Bots starten
```bash
cd "C:\Dev\Projects\AI\Toobix-Unified\scripts\12-minecraft"
bun run toobix-hybrid-empire.ts
```

---

## TEIL 7: PERFORMANCE MONITORING

### 7.1 Server Ressourcen prüfen
```bash
# CPU & RAM
htop

# Disk Space
df -h

# Network
ifstat
```

### 7.2 Minecraft Performance
In Minecraft Console:
```
/tps    # Ticks per second (sollte 20.0 sein)
/lag    # Zeigt Lag info (Paper Server)
```

---

## TEIL 8: BACKUP SETUP (Empfohlen!)

### 8.1 Automatische Backups
```bash
nano ~/backup-minecraft.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/ubuntu/minecraft-backups"
SERVER_DIR="/home/ubuntu/minecraft-server"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Stop server
sudo systemctl stop minecraft

# Backup world
tar -czf "$BACKUP_DIR/world-backup-$DATE.tar.gz" -C "$SERVER_DIR" world world_nether world_the_end

# Start server
sudo systemctl start minecraft

# Keep only last 7 backups
cd $BACKUP_DIR
ls -t | tail -n +8 | xargs rm -f

echo "Backup completed: world-backup-$DATE.tar.gz"
```

```bash
chmod +x ~/backup-minecraft.sh
```

**Cron Job (täglich um 4 Uhr morgens):**
```bash
crontab -e
```

Füge hinzu:
```
0 4 * * * /home/ubuntu/backup-minecraft.sh
```

---

## TEIL 9: TROUBLESHOOTING

### Problem: Bots können nicht verbinden
```bash
# Prüfe ob Server läuft
sudo systemctl status minecraft

# Prüfe Firewall
sudo ufw status

# Prüfe ob Port offen ist
sudo netstat -tlnp | grep 25565
```

### Problem: Server laggt mit 19 Bots
```bash
# In server.properties reduzieren:
view-distance=6
simulation-distance=4
entity-broadcast-range-percentage=80
```

### Problem: Out of Memory
```bash
# Logs checken
sudo journalctl -u minecraft -n 100

# RAM erhöhen in start.sh:
# -Xmx20G → -Xmx22G
```

### Problem: Server crashed
```bash
# Logs anschauen
cd ~/minecraft-server
tail -100 logs/latest.log

# Automatischer Restart ist aktiv via systemd!
```

---

## TEIL 10: KOSTEN KONTROLLE

### 10.1 Spending Limit setzen
1. Oracle Cloud Console
2. Menu → Billing & Cost Management → Cost Management
3. **Set Budget Alert:** 0.00 EUR
4. Email Notification aktivieren

### 10.2 Always Free Resources prüfen
- Menu → Governance → Limits, Quotas and Usage
- Prüfe "Always Free-Eligible"

**Wichtig:** Solange du nur Free Tier Ressourcen nutzt (VM.Standard.A1.Flex mit max 4 OCPU + 24GB RAM), fallen **KEINE KOSTEN** an!

---

## PERFORMANCE ERWARTUNG

Mit Oracle Cloud Free Tier (4 vCPU, 24GB RAM):

- ✅ **19 Bots + 1 Spieler:** Problemlos
- ✅ **TPS:** Konstant 20.0
- ✅ **Lag:** Keiner
- ✅ **View Distance:** 8-10 chunks möglich
- ✅ **Uptime:** 99.9%

Viel besser als Aternos! 🚀

---

## NÄCHSTE SCHRITTE

1. ✅ Oracle Account erstellen
2. ✅ VM Instance erstellen (4 OCPU, 24GB RAM)
3. ✅ Firewall konfigurieren
4. ✅ SSH verbinden
5. ✅ Minecraft Server installieren
6. ✅ Bot Config updaten
7. ✅ 19 Bots starten
8. 🎮 **Spielen & genießen!**

---

## SUPPORT & HILFE

Falls Probleme auftauchen:
- Oracle Cloud Docs: https://docs.oracle.com/en-us/iaas/Content/home.htm
- Minecraft Server Setup: https://minecraft.fandom.com/wiki/Tutorials/Setting_up_a_server

**Viel Erfolg! Die 19 Bots werden es lieben!** 💚
