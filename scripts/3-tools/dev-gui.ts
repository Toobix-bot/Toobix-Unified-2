#!/usr/bin/env bun
/**
 * 🔥 Toobix Live Development Server
 * 
 * Hot-reload GUI + Bridge Server Monitor + Auto-Restart
 * 
 * Features:
 * - Watches apps/web/ for changes
 * - Auto-reloads browser on file save
 * - Monitors Bridge Server status
 * - Live console output
 */

import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { watch } from 'fs';

const PORT = 3000;
const BRIDGE_URL = 'http://localhost:3337';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const WEB_DIR = resolve(__dirname, '../apps/web');

console.clear();
console.log('🔥 TOOBIX LIVE DEVELOPMENT SERVER\n');
console.log('━'.repeat(60));
console.log('📂 Watching:', WEB_DIR);
console.log('🌐 Server:', `http://localhost:${PORT}`);
console.log('🔗 Bridge:', BRIDGE_URL);
console.log('━'.repeat(60));
console.log();

// Connected clients for SSE
const clients = new Set<ReadableStreamDefaultController>();

// Check Bridge status
async function checkBridge() {
  try {
    const response = await fetch(`${BRIDGE_URL}/tools`);
    if (response.ok) {
      return { status: 'online', statusCode: 200 };
    }
    return { status: 'error', statusCode: response.status };
  } catch (error) {
    return { status: 'offline', statusCode: 0 };
  }
}

// Notify clients of file changes
function notifyClients(file: string) {
  console.log(`📝 File changed: ${file}`);
  console.log('🔄 Notifying clients to reload...\n');
  
  const message = `data: ${JSON.stringify({ type: 'reload', file })}\n\n`;
  
  for (const client of clients) {
    try {
      client.enqueue(new TextEncoder().encode(message));
    } catch (e) {
      clients.delete(client);
    }
  }
}

// Watch for file changes
const watcher = watch(WEB_DIR, { recursive: true }, (eventType, filename) => {
  if (filename && (filename.endsWith('.html') || filename.endsWith('.css') || filename.endsWith('.js'))) {
    notifyClients(filename);
  }
});

console.log('👁️  File watcher active\n');

// Check Bridge on startup
const bridgeStatus = await checkBridge();
if (bridgeStatus.status === 'online') {
  console.log('✅ Bridge Server: Online\n');
} else {
  console.log('⚠️  Bridge Server: Offline');
  console.log('💡 Start with: bun start:bridge\n');
}

// HTTP Server
const server = Bun.serve({
  port: PORT,
  
  async fetch(req) {
    const url = new URL(req.url);
    let filePath = url.pathname;
    
    // SSE endpoint for live reload
    if (filePath === '/dev-events') {
      return new Response(
        new ReadableStream({
          start(controller) {
            clients.add(controller);
            
            // Send initial connection message
            const welcome = `data: ${JSON.stringify({ type: 'connected' })}\n\n`;
            controller.enqueue(new TextEncoder().encode(welcome));
            
            // Cleanup on close
            req.signal.addEventListener('abort', () => {
              clients.delete(controller);
            });
          },
        }),
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        }
      );
    }
    
    // Default to terminal.html
    if (filePath === '/' || filePath === '') {
      filePath = '/terminal.html';
    }
    
    // Serve file from web directory
    const fullPath = join(WEB_DIR, filePath);
    
    try {
      const file = Bun.file(fullPath);
      const exists = await file.exists();
      
      if (!exists) {
        return new Response('Not Found: ' + filePath, { 
          status: 404,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
      
      // Inject live reload script for HTML files
      if (filePath.endsWith('.html')) {
        let content = await file.text();
        
        // Add live reload script before </body>
        const liveReloadScript = `
<script>
  // 🔥 Live Reload
  const evtSource = new EventSource('/dev-events');
  
  evtSource.addEventListener('message', (e) => {
    const data = JSON.parse(e.data);
    
    if (data.type === 'connected') {
      console.log('🔥 Live reload connected');
    } else if (data.type === 'reload') {
      console.log('🔄 File changed: ' + data.file + ', reloading...');
      setTimeout(() => location.reload(), 100);
    }
  });
  
  evtSource.addEventListener('error', (e) => {
    console.log('❌ Live reload connection lost');
  });
</script>`;
        
        content = content.replace('</body>', liveReloadScript + '\n</body>');
        
        return new Response(content, {
          headers: { 'Content-Type': 'text/html' }
        });
      }
      
      return new Response(file);
    } catch (error: any) {
      console.error('❌ Error serving file:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
});

console.log('🎯 Development server ready!\n');
console.log('📖 Open in VS Code Simple Browser:');
console.log(`   http://localhost:${PORT}/terminal.html\n`);
console.log('💡 Edit files in apps/web/ → Auto-reload!');
console.log('💡 Press Ctrl+C to stop\n');

// Monitor Bridge status every 10s
setInterval(async () => {
  const status = await checkBridge();
  const timestamp = new Date().toLocaleTimeString();
  
  if (status.status === 'online') {
    console.log(`[${timestamp}] ✅ Bridge: Online | Clients: ${clients.size}`);
  } else {
    console.log(`[${timestamp}] ⚠️  Bridge: ${status.status.toUpperCase()} | Clients: ${clients.size}`);
  }
}, 10000);

// Cleanup on exit
process.on('SIGINT', () => {
  console.log('\n\n🛑 Stopping development server...');
  watcher.close();
  process.exit(0);
});
