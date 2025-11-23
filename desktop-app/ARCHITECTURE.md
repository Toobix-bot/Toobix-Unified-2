# 🏗️ TOOBIX UNIFIED - MODULARE ARCHITEKTUR

## 🎯 Design-Prinzipien

### 1. **Modularität**
- Jeder Service ist unabhängig
- Plugin-basierte Erweiterung
- Keine hart-kodierten Abhängigkeiten
- Hot-Reload fähig

### 2. **Skalierbarkeit**
- Horizontale Skalierung (mehrere Instanzen)
- Vertikale Skalierung (Ressourcen-Optimierung)
- Auto-Discovery neuer Services
- Load Balancing ready

### 3. **Anpassbarkeit**
- Konfigurierbare Services
- Theme-System
- Plugin-Marketplace ready
- Custom UI-Komponenten

### 4. **Wartbarkeit**
- Klare Struktur
- Dokumentierter Code
- Type-Safety (TypeScript)
- Automatisierte Tests

## 🔌 Plugin-System

### Service-Plugin Struktur

Jeder Service folgt diesem Pattern:

```typescript
// scripts/2-services/example-service.ts

interface ServicePlugin {
  // Metadaten
  metadata: {
    id: string;
    name: string;
    version: string;
    icon: string;
    category: string;
    dependencies?: string[];
  };
  
  // Konfiguration
  config: {
    port: number;
    autostart: boolean;
    resources?: {
      cpu?: number;    // CPU-Limit (%)
      memory?: number;  // Memory-Limit (MB)
    };
  };
  
  // Lifecycle Hooks
  onInstall?(): Promise<void>;
  onEnable?(): Promise<void>;
  onDisable?(): Promise<void>;
  onUninstall?(): Promise<void>;
  
  // Main Server
  serve(): {
    port: number;
    fetch(req: Request): Response | Promise<Response>;
  };
}
```

### Beispiel: Wetter-Service Plugin

```typescript
// scripts/2-services/weather-service.ts

export const WeatherServicePlugin: ServicePlugin = {
  metadata: {
    id: 'weather-service',
    name: 'Weather Intelligence',
    version: '1.0.0',
    icon: '🌤️',
    category: 'analytics'
  },
  
  config: {
    port: 8912,
    autostart: false
  },
  
  async onInstall() {
    console.log('Weather Service: Installing...');
    // Setup database, download initial data, etc.
  },
  
  async onEnable() {
    console.log('Weather Service: Starting...');
  },
  
  serve() {
    return {
      port: this.config.port,
      
      async fetch(req: Request) {
        const url = new URL(req.url);
        
        if (url.pathname === '/weather/current') {
          const weather = await fetchCurrentWeather();
          return Response.json(weather);
        }
        
        if (url.pathname === '/health') {
          return Response.json({ status: 'healthy' });
        }
        
        return Response.json({ error: 'Not found' }, { status: 404 });
      }
    };
  }
};

async function fetchCurrentWeather() {
  // Fetch from API
  return { temp: 22, condition: 'sunny' };
}
```

## 📦 Service-Discovery

### Automatisches Laden

Services werden automatisch erkannt und geladen:

```typescript
// src/main.ts - Service Discovery

async function discoverServices() {
  const servicesDir = path.join(__dirname, '../scripts/2-services');
  const files = await fs.readdir(servicesDir);
  
  const services: ServiceConfig[] = [];
  
  for (const file of files) {
    if (file.endsWith('.ts') || file.endsWith('.js')) {
      try {
        const module = await import(path.join(servicesDir, file));
        
        if (module.default?.metadata) {
          services.push({
            id: module.default.metadata.id,
            name: module.default.metadata.name,
            path: path.join('scripts/2-services', file),
            port: module.default.config.port,
            autostart: module.default.config.autostart,
            icon: module.default.metadata.icon,
            category: module.default.metadata.category
          });
        }
      } catch (error) {
        console.error(`Failed to load service from ${file}:`, error);
      }
    }
  }
  
  return services;
}
```

## 🎨 UI-Komponenten-System

### Wiederverwendbare Komponenten

```typescript
// src/components/ServiceCard.tsx

interface ServiceCardProps {
  service: Service;
  status: ServiceStatus;
  onStart: () => void;
  onStop: () => void;
  onRestart: () => void;
}

export function ServiceCard({ service, status, ...handlers }: ServiceCardProps) {
  return (
    <div className={`service-card ${status}`}>
      <ServiceHeader service={service} status={status} />
      <ServiceInfo service={service} />
      <ServiceActions service={service} status={status} {...handlers} />
    </div>
  );
}
```

### Plugin-UI-Extension

Services können eigene UI-Komponenten registrieren:

```typescript
// Service mit Custom UI

export const WeatherServicePlugin = {
  // ... metadata & config
  
  // Custom UI Component
  ui: {
    // Dashboard Widget
    dashboardWidget: () => (
      <div className="weather-widget">
        <h3>Current Weather</h3>
        <div className="temp">22°C</div>
        <div className="condition">Sunny ☀️</div>
      </div>
    ),
    
    // Settings Panel
    settingsPanel: () => (
      <div className="weather-settings">
        <input placeholder="API Key" />
        <select>
          <option>Celsius</option>
          <option>Fahrenheit</option>
        </select>
      </div>
    ),
    
    // Full Page View
    fullView: () => (
      <div className="weather-full-view">
        <WeatherChart />
        <WeatherForecast />
      </div>
    )
  }
};
```

## 🔄 State Management

### Service State

```typescript
// src/stores/servicesStore.ts

interface ServiceState {
  services: Service[];
  status: ServiceStatus;
  logs: Log[];
  settings: ServiceSettings;
}

class ServiceStore {
  private state: ServiceState = {
    services: [],
    status: {},
    logs: [],
    settings: {}
  };
  
  private listeners = new Set<() => void>();
  
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  getState() {
    return this.state;
  }
  
  updateServiceStatus(serviceId: string, status: string) {
    this.state.status[serviceId] = status;
    this.notify();
  }
  
  private notify() {
    this.listeners.forEach(listener => listener());
  }
}

export const serviceStore = new ServiceStore();
```

### React Integration

```typescript
// src/hooks/useServices.ts

export function useServices() {
  const [state, setState] = useState(serviceStore.getState());
  
  useEffect(() => {
    return serviceStore.subscribe(() => {
      setState(serviceStore.getState());
    });
  }, []);
  
  return state;
}
```

## 🌐 Inter-Service Communication

### Event Bus

```typescript
// src/eventBus.ts

type EventHandler = (data: any) => void;

class EventBus {
  private handlers = new Map<string, Set<EventHandler>>();
  
  on(event: string, handler: EventHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
  }
  
  off(event: string, handler: EventHandler) {
    this.handlers.get(event)?.delete(handler);
  }
  
  emit(event: string, data: any) {
    this.handlers.get(event)?.forEach(handler => handler(data));
  }
}

export const eventBus = new EventBus();

// Usage in Service
eventBus.on('dream-generated', (dream) => {
  console.log('New dream:', dream);
  // Trigger emotion analysis, memory storage, etc.
});

eventBus.emit('dream-generated', {
  id: 'dream_123',
  theme: 'Flying',
  symbols: ['sky', 'freedom']
});
```

## 📊 Performance Monitoring

### Service Metrics

```typescript
// src/monitoring/metrics.ts

interface ServiceMetrics {
  cpu: number;
  memory: number;
  requests: number;
  errors: number;
  latency: number;
}

class MetricsCollector {
  private metrics = new Map<string, ServiceMetrics>();
  
  async collectMetrics(serviceId: string) {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;
    
    try {
      const response = await fetch(`http://localhost:${service.port}/metrics`);
      const data = await response.json();
      
      this.metrics.set(serviceId, data);
      
      // Trigger alerts if needed
      if (data.cpu > 80) {
        this.alert(`High CPU usage on ${serviceId}: ${data.cpu}%`);
      }
      
    } catch (error) {
      console.error(`Failed to collect metrics for ${serviceId}`);
    }
  }
  
  getMetrics(serviceId: string) {
    return this.metrics.get(serviceId);
  }
  
  private alert(message: string) {
    // Send notification, log, etc.
    eventBus.emit('system-alert', { message });
  }
}

export const metricsCollector = new MetricsCollector();
```

## 🔐 Security

### API Key Management

```typescript
// src/security/keyManager.ts

import { safeStorage } from 'electron';

class KeyManager {
  encryptKey(key: string): Buffer {
    return safeStorage.encryptString(key);
  }
  
  decryptKey(encrypted: Buffer): string {
    return safeStorage.decryptString(encrypted);
  }
  
  storeKey(name: string, key: string) {
    const encrypted = this.encryptKey(key);
    store.set(`keys.${name}`, encrypted.toString('base64'));
  }
  
  getKey(name: string): string | null {
    const encrypted = store.get(`keys.${name}`) as string;
    if (!encrypted) return null;
    
    const buffer = Buffer.from(encrypted, 'base64');
    return this.decryptKey(buffer);
  }
}

export const keyManager = new KeyManager();
```

## 🚀 Deployment

### Build Pipeline

```json
{
  "scripts": {
    "prebuild": "npm run lint && npm run test",
    "build": "tsc && vite build",
    "postbuild": "electron-builder",
    
    "build:win": "npm run build && electron-builder --win",
    "build:mac": "npm run build && electron-builder --mac",
    "build:linux": "npm run build && electron-builder --linux",
    
    "package": "npm run build && electron-builder --win --mac --linux",
    
    "release": "npm run package && npm run upload"
  }
}
```

### Auto-Update

```typescript
// src/updater.ts

import { autoUpdater } from 'electron-updater';

export function setupAutoUpdater() {
  autoUpdater.checkForUpdatesAndNotify();
  
  autoUpdater.on('update-available', (info) => {
    mainWindow?.webContents.send('update-available', {
      version: info.version,
      releaseNotes: info.releaseNotes
    });
  });
  
  autoUpdater.on('update-downloaded', (info) => {
    mainWindow?.webContents.send('update-ready', {
      version: info.version
    });
  });
}
```

## 📖 Best Practices

### 1. Service Development
- Folge dem Plugin-Pattern
- Implementiere Health-Checks
- Nutze TypeScript für Type-Safety
- Dokumentiere API-Endpoints

### 2. UI Development
- Wiederverwendbare Komponenten
- Responsive Design
- Dark/Light Theme Support
- Accessibility (ARIA)

### 3. Performance
- Lazy Loading
- Code Splitting
- Service Worker für Caching
- Debounce/Throttle für Events

### 4. Testing
- Unit Tests für Komponenten
- Integration Tests für Services
- E2E Tests für Workflows
- Performance Tests

---

**Diese modulare Architektur ermöglicht es dir, Services und Features hinzuzufügen ohne das bestehende System zu brechen! 🎯**
