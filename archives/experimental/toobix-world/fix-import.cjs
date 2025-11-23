const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'systems', 'GiftEconomy.ts');
let content = fs.readFileSync(file, 'utf-8');

// Replace the problematic import
content = content.replace(
  `import { ResourceType, SimulationResource } from './ResourceEconomy';`,
  `// Resource types for gifts\ntype ResourceType = 'energy' | 'matter' | 'time' | 'attention' | 'connection' | 'inspiration';`
);

fs.writeFileSync(file, content, 'utf-8');
console.log('✅ Fixed GiftEconomy.ts import');
