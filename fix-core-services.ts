/**
 * 🔧 CORE SERVICE AUTO-FIXER
 * Fügt Keep-Alive zu allen Core Services hinzu
 */

import { readFile, writeFile } from 'node:fs/promises';

const CORE_SERVICES = [
  'core/toobix-command-center.ts',
  'core/self-awareness-core.ts',
  'core/emotional-core.ts',
  'core/dream-core.ts',
  'core/unified-core-service.ts',
  'core/unified-consciousness-service.ts'
];

const KEEP_ALIVE_CODE = `
// Keep the process alive
process.stdin.resume();

console.log('🟢 Service is running. Press Ctrl+C to stop.');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\\n🛑 Shutting down gracefully...');
  process.exit(0);
});
`;

async function addKeepAlive(filePath: string): Promise<boolean> {
  try {
    const content = await readFile(filePath, 'utf-8');
    
    // Check if already has keep-alive
    if (content.includes('process.stdin.resume()')) {
      console.log(`⏭️  ${filePath} - Already has keep-alive`);
      return true;
    }
    
    // Find the best place to insert (after Bun.serve or at the end of main/start function)
    let updatedContent: string;
    
    if (content.includes('Bun.serve(')) {
      // Add after Bun.serve
      const serveMatch = content.match(/(Bun\.serve\({[\s\S]*?\}\);)/);
      if (serveMatch) {
        updatedContent = content.replace(
          serveMatch[1],
          serveMatch[1] + '\n' + KEEP_ALIVE_CODE
        );
      } else {
        updatedContent = content + '\n' + KEEP_ALIVE_CODE;
      }
    } else {
      // Add at the end
      updatedContent = content + '\n' + KEEP_ALIVE_CODE;
    }
    
    await writeFile(filePath, updatedContent, 'utf-8');
    console.log(`✅ ${filePath} - Keep-alive added`);
    return true;
    
  } catch (error: any) {
    console.log(`❌ ${filePath} - Error: ${error.message}`);
    return false;
  }
}

async function addErrorHandling(filePath: string): Promise<boolean> {
  try {
    const content = await readFile(filePath, 'utf-8');
    
    // Check if file already has good error handling
    const hasTryCatch = content.includes('try {') && content.includes('catch');
    
    if (hasTryCatch) {
      console.log(`⏭️  ${filePath} - Already has error handling`);
      return true;
    }
    
    // Wrap main function in try-catch if not already done
    // This is a simple heuristic - in practice you'd want more sophisticated detection
    
    console.log(`ℹ️  ${filePath} - Error handling needs manual review`);
    return true;
    
  } catch (error: any) {
    console.log(`❌ ${filePath} - Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('  🔧 CORE SERVICE AUTO-FIXER');
  console.log('════════════════════════════════════════════════════════════════\n');
  
  console.log('📝 Adding keep-alive mechanisms...\n');
  
  let fixedCount = 0;
  
  for (const service of CORE_SERVICES) {
    const success = await addKeepAlive(service);
    if (success) fixedCount++;
  }
  
  console.log(`\n✅ Fixed ${fixedCount}/${CORE_SERVICES.length} services\n`);
  
  console.log('📋 Next steps:\n');
  console.log('1. Run: bun run check-core-services.ts');
  console.log('2. Test: bun run start-toobix-optimized.ts --minimal');
  console.log('3. Verify: All services stay running\n');
}

main().catch(console.error);
