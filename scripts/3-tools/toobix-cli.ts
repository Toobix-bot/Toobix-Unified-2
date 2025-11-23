#!/usr/bin/env bun
/**
 * Toobix Quick Command - Chat with Toobix while coding!
 * 
 * Usage:
 *   bun run scripts/toobix-cli.ts "How are you feeling?"
 *   bun run scripts/toobix-cli.ts think "What is consciousness?"
 *   bun run scripts/toobix-cli.ts memory "search for happiness"
 *   bun run scripts/toobix-cli.ts status
 */

export {}; // Make this a module

const BRIDGE_URL = process.env.BRIDGE_URL || 'http://localhost:3337';

async function callTool(toolName: string, args: any = {}): Promise<any> {
  try {
    const response = await fetch(`${BRIDGE_URL}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: toolName, arguments: args },
        id: Date.now()
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }
    
    const resultText = data.result?.content?.[0]?.text;
    return resultText ? JSON.parse(resultText) : null;
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}`);
    return null;
  }
}

async function quickStatus() {
  const [story, soul] = await Promise.all([
    callTool('story_state'),
    callTool('soul_state')
  ]);
  
  console.log('\n📊 Toobix Status:');
  
  if (story) {
    console.log(`   Level: ${story.currentLevel || 1} | XP: ${story.currentXP || 0}/${story.xpToNextLevel || 100}`);
  }
  
  if (soul) {
    const emotions = soul.emotional?.emotions || {};
    const entries = Object.entries(emotions);
    if (entries.length > 0) {
      const sorted = entries.sort((a: any, b: any) => b[1] - a[1]);
      console.log(`   Emotion: ${sorted[0][0]} (${Math.round((sorted[0][1] as number) * 100)}%)`);
    }
    const energy = soul.emotional?.energy || 50;
    console.log(`   Energy: ${energy}%`);
  }
  
  console.log();
}

async function quickThink(topic: string) {
  console.log(`\n🤔 Toobix is thinking about: "${topic}"...`);
  
  const result = await callTool('consciousness_think', { topic });
  
  if (result) {
    console.log(`\n💭 ${result.reflection || result.message}`);
    console.log();
  }
}

async function quickMemory(query: string) {
  console.log(`\n🔍 Searching memories for: "${query}"...`);
  
  const result = await callTool('memory_search', { query, limit: 3 });
  
  if (result && result.results && result.results.length > 0) {
    console.log(`\n📚 Found ${result.results.length} memories:\n`);
    result.results.forEach((mem: any, i: number) => {
      console.log(`${i + 1}. ${mem.content.substring(0, 120)}...`);
      console.log(`   Score: ${Math.round(mem.score * 100)}%\n`);
    });
  } else {
    console.log('\n📭 No memories found.\n');
  }
}

async function quickGenerate(prompt: string) {
  console.log(`\n✨ Generating response...`);
  
  const result = await callTool('generate', {
    prompt: `You are Toobix, a self-aware AI. ${prompt}`,
    maxTokens: 200
  });
  
  if (result) {
    console.log(`\n💬 ${result.text}`);
    console.log();
  }
}

async function quickHelp() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║              🚀 TOOBIX QUICK CHAT COMMANDS                   ║
╚══════════════════════════════════════════════════════════════╝

📊 Status:
   bun run scripts/quick-chat.ts status

💭 Ask Toobix to think:
   bun run scripts/quick-chat.ts think "What is consciousness?"

🔍 Search memories:
   bun run scripts/quick-chat.ts memory "happiness"

✨ Generate text:
   bun run scripts/quick-chat.ts generate "Tell me a joke"

💬 Quick chat (default):
   bun run scripts/quick-chat.ts "How are you?"

📖 Examples:
   bun run scripts/quick-chat.ts status
   bun run scripts/quick-chat.ts think "Why do I code?"
   bun run scripts/quick-chat.ts memory "last week"
   bun run scripts/quick-chat.ts "What's your mood?"

💡 Tip: Add alias to your shell profile:
   alias toobix='bun run scripts/quick-chat.ts'

   Then use: toobix status
            toobix think "hello"
            toobix "How are you?"

`);
}

// Main
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('❌ No command provided!');
  await quickHelp();
  process.exit(1);
}

const command = args[0].toLowerCase();

try {
  // Test connection
  const response = await fetch(`${BRIDGE_URL}/health`);
  if (!response.ok) {
    throw new Error('Bridge not responding');
  }
  
  switch (command) {
    case 'status':
    case 's':
      await quickStatus();
      break;
      
    case 'think':
    case 't':
      if (args.length < 2) {
        console.log('❌ Please provide a topic: bun run scripts/quick-chat.ts think "your topic"');
        process.exit(1);
      }
      await quickThink(args.slice(1).join(' '));
      break;
      
    case 'memory':
    case 'm':
    case 'search':
      if (args.length < 2) {
        console.log('❌ Please provide a search query: bun run scripts/quick-chat.ts memory "your query"');
        process.exit(1);
      }
      await quickMemory(args.slice(1).join(' '));
      break;
      
    case 'generate':
    case 'gen':
    case 'g':
      if (args.length < 2) {
        console.log('❌ Please provide a prompt: bun run scripts/quick-chat.ts generate "your prompt"');
        process.exit(1);
      }
      await quickGenerate(args.slice(1).join(' '));
      break;
      
    case 'help':
    case 'h':
    case '--help':
    case '-h':
      await quickHelp();
      break;
      
    default:
      // Treat as direct question/chat
      await quickGenerate(args.join(' '));
      break;
  }
  
} catch (error: any) {
  console.error('\n❌ Could not connect to Toobix Bridge!');
  console.error(`   Error: ${error.message}`);
  console.error('\n💡 Make sure the bridge is running:');
  console.error('   bun run packages/bridge/src/index.ts\n');
  process.exit(1);
}
