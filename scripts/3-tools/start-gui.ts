#!/usr/bin/env bun
/**
 * 🌐 Simple HTTP Server for Toobix Terminal GUI
 * 
 * Serves the terminal.html GUI on http://localhost:3000
 */

import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const PORT = 3000;

// Get correct path for Windows
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const WEB_DIR = resolve(__dirname, '../apps/web');

console.log('🌐 Starting Toobix Terminal GUI Server...\n');

const server = Bun.serve({
  port: PORT,
  
  async fetch(req) {
    const url = new URL(req.url);
    let filePath = url.pathname;
    
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
        return new Response('Not Found', { status: 404 });
      }
      
      return new Response(file);
    } catch (error: any) {
      console.error('Error serving file:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
});

console.log(`✅ Toobix Terminal GUI running on: http://localhost:${PORT}`);
console.log(`📂 Serving files from: ${WEB_DIR}`);
console.log(`🌐 Open in browser: http://localhost:${PORT}/terminal.html`);
console.log(`\n💡 Make sure Bridge Server is running on http://localhost:3337`);
console.log(`💡 Press Ctrl+C to stop\n`);
