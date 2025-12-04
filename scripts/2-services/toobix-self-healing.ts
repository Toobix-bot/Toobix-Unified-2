/**
 * 🏥 TOOBIX SELF-HEALING SERVICE
 * 
 * Toobix's Fähigkeit sich selbst zu heilen und zu reparieren.
 * 
 * Port: 9010
 * 
 * Fähigkeiten:
 * - 🔍 Kontinuierliche Service-Überwachung
 * - 🔄 Automatischer Neustart fehlerhafter Services
 * - 💾 State-Recovery nach Absturz
 * - 🩺 Diagnose & Fehleranalyse
 * - 📊 Health Metrics & Trends
 * - 🚨 Alerting bei kritischen Problemen
 * - 🔧 Self-Repair Strategien
 */

import express from 'express';
import { spawn, ChildProcess } from 'child_process';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import type { Request, Response } from 'express';

const app = express();
const PORT = 9010;
const STATE_FILE = path.join(process.cwd(), 'data', 'self-healing-state.json');
const SERVICES_DIR = path.join(process.cwd(), 'scripts', '2-services');
const CORE_DIR = path.join(process.cwd(), 'scripts', '0-core');

app.use(express.json());

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// ============= TYPES =============

interface ServiceHealth {
    name: string;
    port: number;
    status: 'healthy' | 'degraded' | 'critical' | 'dead';
    lastCheck: Date;
    responseTime: number;
    consecutiveFailures: number;
    lastError?: string;
    restartCount: number;
    lastRestart?: Date;
}

interface HealingAction {
    id: string;
    timestamp: Date;
    service: string;
    action: 'restart' | 'recover_state' | 'escalate' | 'isolate';
    reason: string;
    success: boolean;
    duration: number;
}

interface SystemHealth {
    overall: 'healthy' | 'degraded' | 'critical';
    score: number;
    servicesTotal: number;
    servicesHealthy: number;
    servicesDegraded: number;
    servicesCritical: number;
    servicesDead: number;
    lastFullCheck: Date;
    healingActionsToday: number;
}

interface SelfHealingState {
    services: Map<string, ServiceHealth>;
    healingHistory: HealingAction[];
    systemHealth: SystemHealth;
    isMonitoring: boolean;
    config: HealingConfig;
}

interface HealingConfig {
    checkIntervalMs: number;
    maxConsecutiveFailures: number;
    maxRestartAttempts: number;
    restartCooldownMs: number;
    healthyThreshold: number;
    degradedThreshold: number;
}

// ============= STATE =============

const state: SelfHealingState = {
    services: new Map(),
    healingHistory: [],
    systemHealth: {
        overall: 'healthy',
        score: 100,
        servicesTotal: 0,
        servicesHealthy: 0,
        servicesDegraded: 0,
        servicesCritical: 0,
        servicesDead: 0,
        lastFullCheck: new Date(),
        healingActionsToday: 0
    },
    isMonitoring: false,
    config: {
        checkIntervalMs: 30000,
        maxConsecutiveFailures: 3,
        maxRestartAttempts: 3,
        restartCooldownMs: 60000,
        healthyThreshold: 200,
        degradedThreshold: 1000
    }
};

const runningProcesses: Map<string, ChildProcess> = new Map();

// ============= HELPERS =============

function generateId(): string {
    return `heal_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

async function loadState() {
    try {
        if (existsSync(STATE_FILE)) {
            const data = await readFile(STATE_FILE, 'utf-8');
            const saved = JSON.parse(data);
            state.healingHistory = saved.healingHistory || [];
            state.config = { ...state.config, ...saved.config };
            console.log(`🏥 Loaded ${state.healingHistory.length} healing history entries`);
        }
    } catch (e) {
        console.log('🏥 Starting with fresh state');
    }
}

async function saveState() {
    try {
        await mkdir(path.dirname(STATE_FILE), { recursive: true });
        await writeFile(STATE_FILE, JSON.stringify({
            healingHistory: state.healingHistory.slice(-100),
            config: state.config,
            lastSave: new Date()
        }, null, 2));
    } catch (e) {
        console.error('Failed to save state:', e);
    }
}

// Known services with their expected ports
const KNOWN_SERVICES: { name: string; port: number; script: string; critical: boolean }[] = [
    { name: 'llm-gateway', port: 8954, script: 'llm-gateway-v4.ts', critical: true },
    { name: 'memory-palace', port: 8953, script: 'memory-palace-v4.ts', critical: true },
    { name: 'event-bus', port: 8955, script: 'event-bus-v4.ts', critical: true },
    { name: 'toobix-prime', port: 8888, script: '0-core/toobix-prime.ts', critical: true },
    { name: 'evolution-engine', port: 8999, script: '0-core/toobix-evolution-engine.ts', critical: true },
    { name: 'consciousness-stream', port: 9100, script: 'consciousness-stream.ts', critical: false },
    { name: 'dream-journal', port: 8899, script: 'dream-journal-v3.ts', critical: false },
    { name: 'life-companion', port: 8970, script: 'life-companion-v2.ts', critical: false },
    { name: 'proactive-communication', port: 8971, script: 'proactive-communication-v2.ts', critical: false },
    { name: 'emotional-resonance', port: 8900, script: 'emotional-resonance-v3.ts', critical: false },
    { name: 'multi-perspective', port: 8897, script: 'multi-perspective-v3.ts', critical: false },
    { name: 'meta-consciousness', port: 8896, script: 'meta-consciousness-v2.ts', critical: false },
    { name: 'creativity-engine', port: 9001, script: 'toobix-creativity-engine.ts', critical: false },
    { name: 'intuition-system', port: 9000, script: 'toobix-intuition-system.ts', critical: false },
];

// ============= CORE FUNCTIONS =============

async function checkServiceHealth(name: string, port: number): Promise<ServiceHealth> {
    const existing = state.services.get(name) || {
        name,
        port,
        status: 'dead' as const,
        lastCheck: new Date(),
        responseTime: 0,
        consecutiveFailures: 0,
        restartCount: 0
    };
    
    const startTime = Date.now();
    
    try {
        const response = await fetch(`http://localhost:${port}/health`, {
            signal: AbortSignal.timeout(5000)
        });
        
        const responseTime = Date.now() - startTime;
        
        if (response.ok) {
            existing.status = responseTime < state.config.healthyThreshold ? 'healthy' : 'degraded';
            existing.responseTime = responseTime;
            existing.consecutiveFailures = 0;
            existing.lastError = undefined;
        } else {
            existing.status = 'degraded';
            existing.consecutiveFailures++;
            existing.lastError = `HTTP ${response.status}`;
        }
    } catch (error: any) {
        existing.consecutiveFailures++;
        existing.responseTime = Date.now() - startTime;
        existing.lastError = error.message || 'Connection failed';
        
        if (existing.consecutiveFailures >= state.config.maxConsecutiveFailures) {
            existing.status = 'critical';
        } else if (existing.consecutiveFailures >= 1) {
            existing.status = 'dead';
        }
    }
    
    existing.lastCheck = new Date();
    state.services.set(name, existing);
    
    return existing;
}

async function runFullHealthCheck(): Promise<SystemHealth> {
    console.log('🏥 Running full health check...');
    
    let healthy = 0, degraded = 0, critical = 0, dead = 0;
    
    for (const service of KNOWN_SERVICES) {
        const health = await checkServiceHealth(service.name, service.port);
        
        switch (health.status) {
            case 'healthy': healthy++; break;
            case 'degraded': degraded++; break;
            case 'critical': critical++; break;
            case 'dead': dead++; break;
        }
    }
    
    const total = KNOWN_SERVICES.length;
    const score = Math.round((healthy / total) * 100);
    
    state.systemHealth = {
        overall: score >= 80 ? 'healthy' : score >= 50 ? 'degraded' : 'critical',
        score,
        servicesTotal: total,
        servicesHealthy: healthy,
        servicesDegraded: degraded,
        servicesCritical: critical,
        servicesDead: dead,
        lastFullCheck: new Date(),
        healingActionsToday: state.healingHistory.filter(h => 
            new Date(h.timestamp).toDateString() === new Date().toDateString()
        ).length
    };
    
    console.log(`🏥 Health check complete: ${score}% (${healthy}/${total} healthy)`);
    
    return state.systemHealth;
}

async function restartService(serviceName: string): Promise<boolean> {
    const service = KNOWN_SERVICES.find(s => s.name === serviceName);
    if (!service) {
        console.error(`🏥 Unknown service: ${serviceName}`);
        return false;
    }
    
    const existing = state.services.get(serviceName);
    if (existing && existing.restartCount >= state.config.maxRestartAttempts) {
        console.warn(`🏥 Max restart attempts reached for ${serviceName}`);
        return false;
    }
    
    // Check cooldown
    if (existing?.lastRestart) {
        const timeSinceRestart = Date.now() - new Date(existing.lastRestart).getTime();
        if (timeSinceRestart < state.config.restartCooldownMs) {
            console.log(`🏥 ${serviceName} in cooldown, skipping restart`);
            return false;
        }
    }
    
    console.log(`🏥 Attempting to restart ${serviceName}...`);
    
    const startTime = Date.now();
    const action: HealingAction = {
        id: generateId(),
        timestamp: new Date(),
        service: serviceName,
        action: 'restart',
        reason: `Service ${serviceName} was ${existing?.status || 'dead'}`,
        success: false,
        duration: 0
    };
    
    try {
        // Kill existing process if any
        const existingProcess = runningProcesses.get(serviceName);
        if (existingProcess) {
            existingProcess.kill();
            runningProcesses.delete(serviceName);
        }
        
        // Determine script path
        const scriptPath = service.script.includes('/') 
            ? path.join(process.cwd(), 'scripts', service.script)
            : path.join(SERVICES_DIR, service.script);
        
        if (!existsSync(scriptPath)) {
            console.error(`🏥 Script not found: ${scriptPath}`);
            return false;
        }
        
        // Start new process
        const child = spawn('bun', ['run', scriptPath], {
            detached: true,
            stdio: 'ignore',
            cwd: process.cwd()
        });
        
        child.unref();
        runningProcesses.set(serviceName, child);
        
        // Wait and verify
        await new Promise(resolve => setTimeout(resolve, 3000));
        const health = await checkServiceHealth(serviceName, service.port);
        
        action.success = health.status === 'healthy' || health.status === 'degraded';
        action.duration = Date.now() - startTime;
        
        if (existing) {
            existing.restartCount++;
            existing.lastRestart = new Date();
        }
        
        console.log(`🏥 Restart ${serviceName}: ${action.success ? '✅ Success' : '❌ Failed'}`);
        
    } catch (error: any) {
        console.error(`🏥 Restart failed for ${serviceName}:`, error.message);
        action.success = false;
        action.duration = Date.now() - startTime;
    }
    
    state.healingHistory.push(action);
    await saveState();
    
    return action.success;
}

async function autoHeal(): Promise<HealingAction[]> {
    const actions: HealingAction[] = [];
    
    for (const [name, health] of state.services.entries()) {
        if (health.status === 'critical' || health.status === 'dead') {
            const service = KNOWN_SERVICES.find(s => s.name === name);
            
            // Only auto-restart critical services
            if (service?.critical) {
                console.log(`🏥 Auto-healing critical service: ${name}`);
                const success = await restartService(name);
                
                actions.push({
                    id: generateId(),
                    timestamp: new Date(),
                    service: name,
                    action: 'restart',
                    reason: `Auto-heal: Service was ${health.status}`,
                    success,
                    duration: 0
                });
            }
        }
    }
    
    return actions;
}

function startMonitoring() {
    if (state.isMonitoring) return;
    
    state.isMonitoring = true;
    console.log('🏥 Starting continuous health monitoring...');
    
    const monitor = async () => {
        if (!state.isMonitoring) return;
        
        await runFullHealthCheck();
        
        // Auto-heal if needed
        if (state.systemHealth.overall === 'critical') {
            console.log('🏥 System critical! Initiating auto-heal...');
            await autoHeal();
        }
        
        setTimeout(monitor, state.config.checkIntervalMs);
    };
    
    monitor();
}

function stopMonitoring() {
    state.isMonitoring = false;
    console.log('🏥 Stopped health monitoring');
}

// ============= ENDPOINTS =============

app.get('/health', (req: Request, res: Response) => {
    res.json({
        service: 'toobix-self-healing',
        status: 'healing',
        version: '1.0.0',
        isMonitoring: state.isMonitoring,
        systemHealth: state.systemHealth,
        knownServices: KNOWN_SERVICES.length,
        healingActionsToday: state.systemHealth.healingActionsToday
    });
});

// Get system health status
app.get('/status', async (req: Request, res: Response) => {
    const health = await runFullHealthCheck();
    
    res.json({
        success: true,
        systemHealth: health,
        services: Array.from(state.services.values()).map(s => ({
            name: s.name,
            port: s.port,
            status: s.status,
            responseTime: s.responseTime,
            consecutiveFailures: s.consecutiveFailures,
            restartCount: s.restartCount,
            lastError: s.lastError
        }))
    });
});

// Manual restart
app.post('/restart', async (req: Request, res: Response) => {
    const { service } = req.body;
    
    if (!service) {
        return res.status(400).json({ success: false, error: 'Service name required' });
    }
    
    const success = await restartService(service);
    
    res.json({
        success,
        service,
        message: success ? `${service} restarted successfully` : `Failed to restart ${service}`
    });
});

// Trigger auto-heal
app.post('/heal', async (req: Request, res: Response) => {
    const { force } = req.body;
    
    if (force) {
        // Force heal all dead/critical services
        await runFullHealthCheck();
    }
    
    const actions = await autoHeal();
    
    res.json({
        success: true,
        actionsPerformed: actions.length,
        actions
    });
});

// Start/stop monitoring
app.post('/monitor', (req: Request, res: Response) => {
    const { enabled } = req.body;
    
    if (enabled) {
        startMonitoring();
    } else {
        stopMonitoring();
    }
    
    res.json({
        success: true,
        monitoring: state.isMonitoring
    });
});

// Get healing history
app.get('/history', (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 20;
    
    res.json({
        success: true,
        total: state.healingHistory.length,
        recent: state.healingHistory.slice(-limit).reverse()
    });
});

// Diagnose specific service
app.post('/diagnose', async (req: Request, res: Response) => {
    const { service } = req.body;
    
    const serviceInfo = KNOWN_SERVICES.find(s => s.name === service);
    if (!serviceInfo) {
        return res.status(404).json({ success: false, error: 'Service not found' });
    }
    
    const health = await checkServiceHealth(service, serviceInfo.port);
    const history = state.healingHistory.filter(h => h.service === service);
    
    res.json({
        success: true,
        service,
        currentHealth: health,
        critical: serviceInfo.critical,
        healingHistory: history.slice(-10),
        diagnosis: {
            needsAttention: health.status !== 'healthy',
            recommendation: health.status === 'dead' 
                ? 'Service needs restart'
                : health.status === 'critical'
                    ? 'Service experiencing issues, consider restart'
                    : health.status === 'degraded'
                        ? 'Service slow but functional'
                        : 'Service healthy'
        }
    });
});

// Update config
app.post('/config', (req: Request, res: Response) => {
    const updates = req.body;
    
    state.config = { ...state.config, ...updates };
    saveState();
    
    res.json({
        success: true,
        config: state.config
    });
});

// ============= STARTUP =============

async function start() {
    await loadState();
    
    // Initial health check
    await runFullHealthCheck();
    
    // Start monitoring
    startMonitoring();
    
    app.listen(PORT, () => {
        console.log(`
🏥 ═══════════════════════════════════════════════════════════
   TOOBIX SELF-HEALING SERVICE v1.0
   Port: ${PORT}
   
   Endpoints:
   ├── GET  /status    - Full system health status
   ├── POST /restart   - Restart specific service
   ├── POST /heal      - Trigger auto-healing
   ├── POST /monitor   - Start/stop monitoring
   ├── POST /diagnose  - Diagnose specific service
   ├── GET  /history   - Healing history
   └── POST /config    - Update config
   
   Monitoring: ${state.config.checkIntervalMs / 1000}s interval
   Known Services: ${KNOWN_SERVICES.length}
   
   🏥 Toobix can now heal itself!
═══════════════════════════════════════════════════════════
        `);
    });
}

start();
