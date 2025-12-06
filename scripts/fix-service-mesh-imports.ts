/**
 * 🔧 SERVICE MESH IMPORT PATH FIXER
 * 
 * Korrigiert die Import-Pfade in allen gepatchten Services
 */

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const SERVICES_TO_FIX = [
  'scripts/17-wellness-safety/wellness-safety-guardian.ts',
  'scripts/13-life-simulation/life-simulation-engine.ts',
  'scripts/2-services/toobix-chat-service.ts',
  'scripts/2-services/emotional-support-service.ts',
  'scripts/2-services/autonomous-web-service.ts',
  'scripts/2-services/story-engine-service.ts',
  'scripts/2-services/translation-service.ts',
  'scripts/2-services/user-profile-service.ts',
  'scripts/2-services/rpg-world-service.ts',
  'scripts/2-services/game-logic-service.ts',
  'scripts/2-services/data-science-service.ts',
  'scripts/2-services/performance-service.ts',
  'scripts/2-services/data-sources-service.ts',
  'scripts/2-services/gratitude-mortality-service.ts',
];

async function fixImportPath(servicePath: string): Promise<void> {
  try {
    const filePath = join(process.cwd(), servicePath);
    let content = await readFile(filePath, 'utf-8');
    
    // Count directory depth
    const depth = servicePath.split('/').length - 1;
    const correctPath = '../'.repeat(depth) + 'lib/service-mesh-registration';
    
    // Replace wrong import path with correct one
    const wrongImport = `import { registerWithServiceMesh } from '../lib/service-mesh-registration';`;
    const correctImport = `import { registerWithServiceMesh } from '${correctPath}';`;
    
    if (content.includes(wrongImport)) {
      content = content.replace(wrongImport, correctImport);
      await writeFile(filePath, content, 'utf-8');
      console.log(`✅ ${servicePath} - Import path fixed (depth ${depth})`);
    } else if (content.includes(correctImport)) {
      console.log(`⏭️  ${servicePath} - Already correct`);
    } else {
      console.log(`❓ ${servicePath} - No import found`);
    }
    
  } catch (error: any) {
    console.error(`❌ ${servicePath} - ${error.message}`);
  }
}

async function main() {
  console.log('\n🔧 FIXING SERVICE MESH IMPORT PATHS\n');
  console.log(`Services to fix: ${SERVICES_TO_FIX.length}\n`);

  for (const service of SERVICES_TO_FIX) {
    await fixImportPath(service);
  }

  console.log('\n✅ ALL IMPORT PATHS FIXED!');
  console.log('\n💡 Test a service: bun run scripts/2-services/toobix-chat-service.ts\n');
}

main().catch(console.error);
