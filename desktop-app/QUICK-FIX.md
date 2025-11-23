# 🔧 Quick Fixes for Common Issues

## 1. Groq API Key Not Set

**Problem**: Chat, AI Training, and Life Coach don't work

**Solution**:
```batch
# Run this script
.\set-key.bat

# Or directly:
node set-groq-key-simple.js YOUR_GROQ_API_KEY
```

Get your free key from: https://console.groq.com/keys

---

## 2. Views Show Nothing

**Problem**: Clicking on AI Training, Adaptive UI, or Life Coach shows blank screen

**Solutions**:

### For AI Training:
1. Start the **Hybrid AI Core** service (Port 8915)
2. Go to Services → Find "Hybrid AI Core" → Click **Start**
3. Wait a few seconds
4. Go back to AI Training view

### For Life Coach:
1. Start the **Life-Domain AI Coach** service (Port 8916)
2. **Set your Groq API key** in Settings
3. Reload the app

### For Adaptive UI:
- This is a placeholder for future features
- Currently shows "Coming Soon" message

---

## 3. TypeScript Compilation Errors

**Problem**: `tsc` command not found or compilation fails

**Solution**:
```batch
# Install TypeScript globally
npm install -g typescript

# Or use local TypeScript
npx tsc

# Or just continue - the app will still work
```

---

## 4. Services Won't Start

**Problem**: Service status shows "error" or "stopped"

**Solutions**:

1. **Check if port is in use**:
   ```powershell
   netstat -ano | findstr :8896
   ```

2. **Kill existing process**:
   ```batch
   taskkill /PID <process_id> /F
   ```

3. **Start service manually**:
   ```batch
   cd C:\Dev\Projects\AI\Toobix-Unified
   bun run scripts/2-services/SERVICE_NAME.ts
   ```

4. **Check logs** in Dashboard → Service Logs

---

## 5. Keyboard Shortcuts Don't Work

**Problem**: Alt + Number doesn't switch views

**Solutions**:
- Make sure the app window has focus
- Some apps/OS features may override Alt+key combinations
- Use mouse navigation as alternative
- Check if another program is using the same shortcuts

---

## 6. Settings Won't Save

**Problem**: API key or settings don't persist

**Solutions**:
1. Make sure you click **💾 Save Settings**
2. Check electron-store permissions
3. Try setting key via script: `.\set-key.bat`
4. Restart the app after saving

---

## 7. App Won't Start

**Problem**: Desktop app doesn't launch

**Solutions**:

1. **Check dependencies**:
   ```batch
   npm install
   ```

2. **Clear cache**:
   ```batch
   rm -rf node_modules
   npm install
   ```

3. **Check ports**:
   - Vite needs port 5173
   - If in use, it will try 5174, 5175, etc.

4. **Run in debug mode**:
   ```batch
   npm run dev:electron
   ```

---

## 8. Chat Shows Error

**Problem**: "Error invoking remote method 'chat-with-groq'"

**Root Cause**: Groq API key not initialized

**Solution**:
1. Go to **⚙️ Settings**
2. Enter your Groq API key
3. Click **💾 Save Settings**
4. Restart the app (Ctrl+C, then `.\launch-desktop-v2.bat`)

---

## 9. Services Are Slow

**Problem**: Services take long to start or respond

**Solutions**:
- Start services one by one instead of "Start All"
- Check system resources (CPU/Memory)
- Close other applications
- Some services are resource-intensive (Hybrid AI Core)

---

## 10. No Logs Showing

**Problem**: Service Logs section is empty

**Solutions**:
- Logs appear when services are active
- Perform some actions (start/stop services, send chat messages)
- Check if event listeners are working
- Restart the app

---

## Quick Diagnostic Commands

```powershell
# Check all service ports
netstat -ano | findstr "8896 8900 8910 8915 8916"

# Check Node/Bun versions
node --version
bun --version

# Test a service directly
curl http://localhost:8896/health

# View electron-store data
node -e "const Store = require('electron-store'); const store = new Store(); console.log(store.store);"
```

---

## Still Having Issues?

1. **Check the logs** in the Desktop App dashboard
2. **Try the PowerShell interaction script**: `.\interact-with-system.ps1`
3. **Review documentation**: See DESKTOP-APP-GUIDE.md
4. **Restart everything**: Close app, stop services, clear cache

---

**Most issues are resolved by: Setting the Groq API key and restarting the app!**
