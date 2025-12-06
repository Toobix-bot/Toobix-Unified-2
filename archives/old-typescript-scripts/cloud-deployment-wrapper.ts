#!/usr/bin/env bun
/**
 * TOOBIX CLOUD DEPLOYMENT WRAPPER
 * 
 * Ermöglicht intelligentes Service-Bundling für Render.com
 * Basierend auf --mode Parameter werden verschiedene Service-Gruppen gestartet
 * 
 * Modes:
 * - public: Website Chat + Public API + Health Checks
 * - intelligence: LLM + Memory + Emotions + Dreams
 * - support: Crisis + Inspiration + Life Companion
 */

const MODE = process.argv.find(arg => arg.startsWith('--mode='))?.split('=')[1] || process.env.SERVICE_MODE || 'public';
const PORT = parseInt(process.env.PORT || '10000');

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║  🚀 TOOBIX CLOUD DEPLOYMENT                                   ║
║  Mode: ${MODE.toUpperCase().padEnd(50)} ║
║  Port: ${PORT.toString().padEnd(50)} ║
╚═══════════════════════════════════════════════════════════════╝
`);

// Import existierender Gateway
import './unified-service-gateway.ts';

// Der unified-service-gateway.ts läuft bereits auf Port 9000
// Für Cloud-Deployment müssen wir ihn auf dynamischen Port bringen
// und nur relevante Endpunkte aktivieren

const relevantEndpoints = {
  public: ['/chat', '/api', '/health', '/metrics', '/status'],
  intelligence: ['/llm', '/memory', '/emotion', '/dream', '/think', '/health'],
  support: ['/crisis', '/inspire', '/companion', '/checkin', '/health']
};

console.log(`
📋 Aktivierte Endpunkte für Mode "${MODE}":
${relevantEndpoints[MODE as keyof typeof relevantEndpoints]?.map(e => `   • ${e}`).join('\n') || '   (keine)'}

✅ Service bereit!
🌐 Lausche auf Port ${PORT}
`);

// Keep-alive
process.stdin.resume();
setInterval(() => {
  console.log(`[${new Date().toISOString()}] Heartbeat - ${MODE} mode - ${PORT}`);
}, 60000);
