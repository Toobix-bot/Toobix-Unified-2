/**
 * 🌐 TOOBIX WEB SERVER
 * 
 * Serviert das Web-Interface und proxied API-Calls
 */

const WEB_PORT = 3000;
const API_URL = "http://localhost:8954";

const server = Bun.serve({
  port: WEB_PORT,
  
  async fetch(req) {
    const url = new URL(req.url);
    
    // API Proxy
    if (url.pathname.startsWith('/api/')) {
      const apiPath = url.pathname.replace('/api', '');
      try {
        const apiResponse = await fetch(`${API_URL}${apiPath}`, {
          method: req.method,
          headers: req.headers,
          body: req.method !== 'GET' ? await req.text() : undefined
        });
        
        const data = await apiResponse.text();
        return new Response(data, {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: 'API unavailable' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Direct chat endpoint
    if (url.pathname === '/chat' && req.method === 'POST') {
      try {
        const body = await req.text();
        const apiResponse = await fetch(`${API_URL}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: body
        });
        
        const data = await apiResponse.text();
        return new Response(data, {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: 'Chat unavailable' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }
    
    // Static files
    let filePath = url.pathname;
    if (filePath === '/') filePath = '/index.html';
    
    const fullPath = `./web${filePath}`;
    const file = Bun.file(fullPath);
    
    if (await file.exists()) {
      const contentType = filePath.endsWith('.html') ? 'text/html' :
                          filePath.endsWith('.css') ? 'text/css' :
                          filePath.endsWith('.js') ? 'application/javascript' :
                          'text/plain';
      
      return new Response(file, {
        headers: { 'Content-Type': contentType }
      });
    }
    
    // 404
    return new Response('Not Found', { status: 404 });
  }
});

console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║     🌐 TOOBIX WEB SERVER                                                  ║
║                                                                           ║
║     Local:  http://localhost:${WEB_PORT}                                      ║
║                                                                           ║
║     Bereit für ngrok!                                                     ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
`);
