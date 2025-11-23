# ⚡ TOOBIX UNIFIED V2.0 - QUICK START

**2-Minuten Guide um die neue Version zu starten!**

---

## 🚀 Option 1: Schnellstart (empfohlen)

### Schritt 1: Vite Config aktualisieren

Öffne `desktop-app/vite.config.ts` und stelle sicher dass es so aussieht:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
```

### Schritt 2: Starten

```powershell
cd C:\Dev\Projects\AI\Toobix-Unified\desktop-app

# Dependencies installieren (falls noch nicht geschehen)
npm install

# Vite Dev Server starten (Terminal 1)
npm run dev:react

# Electron App starten mit V2.0 (Terminal 2)
# Öffne http://localhost:5173/index-v2.html im Browser
# ODER: Starte Electron direkt
npm run dev:electron
```

### Schritt 3: Main.ts anpassen (optional - für Electron)

Wenn du die neue Version in Electron laden willst, ändere in `src/main.ts`:

```typescript
// Zeile 105 ändern von:
mainWindow.loadURL('http://localhost:5173');

// Zu:
mainWindow.loadURL('http://localhost:5173/index-v2.html');
```

---

## 🎯 Option 2: Als Hauptversion setzen

**Warnung:** Dies ersetzt die alte Version!

```powershell
cd C:\Dev\Projects\AI\Toobix-Unified\desktop-app\src

# Backup der alten Version
Move-Item App.tsx App-old.tsx
Move-Item App.css App-old.css

# Neue Version als Haupt setzen
Move-Item App-v2.tsx App.tsx
Move-Item App-enhanced.css App.css

# Index.html anpassen
Copy-Item ..\index-v2.html ..\index.html
```

Dann normal starten:

```powershell
npm run dev
```

---

## 🧪 Option 3: Beide Versionen testen

### Im Browser (ohne Electron)

```powershell
npm run dev:react
```

Dann öffne beide URLs:
- **V1.0:** http://localhost:5173
- **V2.0:** http://localhost:5173/index-v2.html

---

## ✅ Funktions-Check

Nach dem Start solltest du sehen:

### ✨ Glassmorphic UI
- Transparente, verschwommene Karten
- Glühende Akzent-Farben
- Smooth Animationen

### 🔔 Toast Notifications
- Rechts oben erscheinen automatisch Benachrichtigungen
- Beim Start: "Services loaded"
- Beim Service-Start: "Service started"

### ⏳ Loading States
- Beim ersten Laden: Skeleton Screens
- Bei Operationen: Loading Spinner
- Bei Fehlern: Error State mit Retry

### 🎨 Moderne Elemente
- Animierte Progress Bars im Dashboard
- Pulsende Status-Indikatoren
- Gradient Text für "Toobix"
- Smooth Hover-Effekte

---

## 🐛 Troubleshooting

### Problem: "Cannot find module './utils'"

**Lösung:**
```powershell
# Stelle sicher dass alle neuen Dateien vorhanden sind:
ls src/utils.ts
ls src/ToastContainer.tsx
ls src/hooks/useServices.ts
ls src/hooks/useChat.ts
ls src/components/LoadingStates.tsx
```

### Problem: Vite startet nicht

**Lösung:**
```powershell
# Dependencies neu installieren
rm -rf node_modules
rm package-lock.json
npm install
npm run dev:react
```

### Problem: Services werden nicht angezeigt

**Lösung:**
1. Prüfe ob der Main Process läuft (Terminal 2)
2. Öffne DevTools (F12) und schau nach Fehlern in Console
3. Prüfe ob `window.electronAPI` verfügbar ist

### Problem: Toasts erscheinen nicht

**Lösung:**
1. Öffne DevTools und prüfe ob `ToastContainer` gerendert wird
2. Stelle sicher dass `App-enhanced.css` geladen wurde
3. Prüfe die CSS-Klassen im Elements-Tab

---

## 📊 Feature-Tests

### Test 1: Service Management

1. Gehe zu "Services" View
2. Wähle einen Service (z.B. Game Engine)
3. Klicke "Start"
4. **Erwartung:**
   - Loading State während Start
   - Toast Notification "Service started"
   - Status-Badge wird grün mit pulsierendem Indikator
   - Progress Bar im Dashboard aktualisiert sich

### Test 2: Toast Notifications

1. Gehe zu Dashboard
2. Klicke "Start All Services"
3. **Erwartung:**
   - Toast: "Starting all services..."
   - Mehrere Toasts erscheinen für jeden Service
   - Final Toast: "All services started"
   - Toasts verschwinden nach 5 Sekunden

### Test 3: Chat (mit Groq API Key)

1. Gehe zu Settings
2. Trage Groq API Key ein
3. Speichere (Toast: "Settings saved")
4. Gehe zu Chat
5. Sende eine Nachricht
6. **Erwartung:**
   - Loading Spinner während AI denkt
   - Antwort erscheint smooth
   - Bei Fehler: Error Toast

### Test 4: Loading States

1. Öffne App im Browser
2. Drücke F5 (Refresh)
3. **Erwartung:**
   - Skeleton Screens im Dashboard
   - Smooth Fade-In wenn Daten geladen
   - Keine "Loading..." Text-Anzeigen

---

## 🎨 Customization

### Farben anpassen

Öffne `src/App-enhanced.css` und ändere:

```css
:root {
  --accent: #00d4ff;       /* Deine Primärfarbe */
  --secondary: #bd00ff;    /* Deine Sekundärfarbe */
  --bg-dark: #0a0a0f;      /* Hintergrund */
}
```

### Toast-Dauer ändern

In `src/utils.ts`:

```typescript
// Zeile ~52
private notify() {
  // ...
  const duration = toast.duration ?? 3000; // 3 Sekunden statt 5
  // ...
}
```

---

## 📝 Checkliste

- [ ] Dependencies installiert (`npm install`)
- [ ] Vite Dev Server läuft (Port 5173)
- [ ] Electron Main Process läuft (optional)
- [ ] Browser zeigt V2.0 UI an
- [ ] Toast Notifications funktionieren
- [ ] Services können gestartet werden
- [ ] Loading States erscheinen korrekt
- [ ] Chat funktioniert (mit API Key)

---

## 🎉 Ready!

Deine Desktop App ist jetzt auf **Version 2.0**! 🚀

**Next Steps:**
1. Teste alle Features
2. Passe Theme an (optional)
3. Lies `UPGRADE-V2.md` für Details
4. Gib Feedback für V2.1

**Viel Spaß!** 🧠✨
