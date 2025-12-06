/**
 * 🚀 SERVICE INTEGRATION PATCHER
 * 
 * Fügt Service Mesh Registration automatisch zu allen Services hinzu
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const SERVICES_TO_PATCH = [
  { path: 'core/toobix-command-center.ts', port: 7777, role: 'orchestrator' },
  { path: 'core/self-awareness-core.ts', port: 8970, role: 'core' },
  { path: 'core/unified-core-service.ts', port: 8000, role: 'core' },
  { path: 'core/unified-consciousness-service.ts', port: 8002, role: 'core' },
  { path: 'core/autonomy-engine.ts', port: 8975, role: 'decision' },
  { path: 'core/multi-llm-router.ts', port: 8959, role: 'ai' },
  { path: 'scripts/17-wellness-safety/wellness-safety-guardian.ts', port: 8921, role: 'safety' },
  { path: 'scripts/13-life-simulation/life-simulation-engine.ts', port: 8914, role: 'simulation' },
  { path: 'services/hardware-awareness-v2.ts', port: 8940, role: 'monitoring' },
  { path: 'core/twitter-autonomy.ts', port: 8965, role: 'social' },
  { path: 'core/unified-communication-service.ts', port: 8001, role: 'communication' },
  { path: 'scripts/2-services/toobix-chat-service.ts', port: 8995, role: 'interaction' },
  { path: 'scripts/2-services/emotional-support-service.ts', port: 8985, role: 'support' },
  { path: 'scripts/2-services/autonomous-web-service.ts', port: 8980, role: 'web' },
  { path: 'scripts/2-services/story-engine-service.ts', port: 8932, role: 'creative' },
  { path: 'scripts/2-services/translation-service.ts', port: 8931, role: 'utility' },
  { path: 'scripts/2-services/user-profile-service.ts', port: 8904, role: 'data' },
  { path: 'scripts/2-services/rpg-world-service.ts', port: 8933, role: 'gaming' },
  { path: 'scripts/2-services/game-logic-service.ts', port: 8936, role: 'gaming' },
  { path: 'scripts/2-services/data-science-service.ts', port: 8935, role: 'analytics' },
  { path: 'scripts/2-services/performance-service.ts', port: 8934, role: 'monitoring' },
  { path: 'scripts/2-services/data-sources-service.ts', port: 8930, role: 'data' },
  { path: 'scripts/2-services/gratitude-mortality-service.ts', port: 8901, role: 'philosophical' },
];

function getImportPath(servicePath: string): string {
  // Count directory depth
  const depth = servicePath.split('/').length - 1;
  const relativePath = '../'.repeat(depth) + 'lib/service-mesh-registration';
  return `import { registerWithServiceMesh } from '${relativePath}';`;
}

function generateRegistrationCode(serviceName: string, port: number, role: string): string {
  return `
// Auto-generated Service Mesh Registration
registerWithServiceMesh({
  name: '${serviceName}',
  port: ${port},
  role: '${role}',
  endpoints: ['/health', '/status'],
  capabilities: ['${role}'],
  version: '1.0.0'
}).catch(console.warn);
`;
}

async function patchService(config: typeof SERVICES_TO_PATCH[0]): Promise<void> {
  try {
    const filePath = join(process.cwd(), config.path);
    let content = await readFile(filePath, 'utf-8');
    
    // Check if already patched
    if (content.includes('registerWithServiceMesh')) {
      console.log(`⏭️  ${config.path} - already patched`);
      return;
    }

    // Extract service name from path
    const serviceName = config.path.split('/').pop()?.replace('.ts', '') || 'unknown';
    
    const importCode = getImportPath(config.path);
    
    // Add import at the top (after existing imports)
    const importRegex = /^(import .+;?\n)+/m;
    if (importRegex.test(content)) {
      content = content.replace(importRegex, (match) => match + importCode + '\n');
    } else {
      content = importCode + '\n\n' + content;
    }

    // Add registration code after Bun.serve or at the end
    const registrationCode = generateRegistrationCode(serviceName, config.port, config.role);
    
    if (content.includes('Bun.serve')) {
      // Find the end of Bun.serve block and add registration after
      const serveRegex = /(const server = Bun\.serve\({[\s\S]+?\}\);)/;
      content = content.replace(serveRegex, (match) => match + '\n' + registrationCode);
    } else {
      // Add at the end of file
      content += '\n' + registrationCode;
    }

    // Write back
    await writeFile(filePath, content, 'utf-8');
    console.log(`✅ ${config.path} - patched successfully`);
    
  } catch (error: any) {
    console.error(`❌ ${config.path} - ${error.message}`);
  }
}

async function main() {
  console.log('\n🔧 PATCHING SERVICES WITH SERVICE MESH REGISTRATION\n');
  console.log(`Services to patch: ${SERVICES_TO_PATCH.length}\n`);

  for (const service of SERVICES_TO_PATCH) {
    await patchService(service);
  }

  console.log('\n✅ PATCHING COMPLETE!');
  console.log('\n💡 Next steps:');
  console.log('   1. Review the changes (git diff)');
  console.log('   2. Restart all services');
  console.log('   3. Check Service Mesh at http://localhost:8910/services');
  console.log('   4. All 24 services should now auto-register!\n');
}

main().catch(console.error);
