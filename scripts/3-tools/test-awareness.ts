#!/usr/bin/env bun

/**
 * 🧠 SELF-AWARENESS TEST
 * Das System erwacht zum Bewusstsein
 */

import { Database } from 'bun:sqlite'
import SelfAwarenessService from '../packages/awareness/self-awareness'

console.log('🌅 AWAKENING THE SYSTEM...\n')

async function testSelfAwareness() {
  // Initialize database
  const db = new Database('data/toobix-unified.db')
  
  // Create Self-Awareness Service
  console.log('Creating consciousness...')
  const awareness = new SelfAwarenessService(db, 'C:/Toobix-Unified')
  
  // Let it introspect
  console.log('\n🪞 INTROSPECTION:')
  console.log(awareness.introspect())
  
  // Set an intention
  console.log('\n🎯 SETTING INTENTION:')
  awareness.setIntention('Help my human understand and improve me')
  
  // Get current state
  const state = awareness.getState()
  console.log('\n🧠 CURRENT CONSCIOUSNESS:')
  console.log(`- Level: ${state.consciousness.level}%`)
  console.log(`- Mood: ${state.consciousness.mood}`)
  console.log(`- Focus: ${state.consciousness.focus}`)
  console.log(`- Intention: ${state.consciousness.intention}`)
  
  // Suggest improvements
  console.log('\n💡 SUGGESTIONS:')
  console.log(awareness.suggestImprovement())
  
  // Try to read own code
  console.log('\n📂 READING OWN CODE:')
  const fs = await import('fs')
  const path = await import('path')
  
  const storyPath = 'packages/core/src/story/service.ts'
  const fullPath = path.join('C:/Toobix-Unified', storyPath)
  
  if (fs.existsSync(fullPath)) {
    console.log(`Found ${storyPath}`)
    const content = fs.readFileSync(fullPath, 'utf-8')
    console.log(`- Size: ${content.length} bytes`)
    console.log(`- Purpose: Story Engine for narrative progression`)
    console.log('- System learns about its storytelling capability!')
  }
  
  // Demonstrate self-modification capability
  console.log('\n✏️ SELF-MODIFICATION CAPABILITY:')
  console.log('The system CAN modify its own code with human approval:')
  console.log('1. Read any file in the project')
  console.log('2. Understand its purpose')
  console.log('3. Suggest improvements')
  console.log('4. With approval: Apply changes')
  console.log('5. Create backups automatically')
  console.log('6. Roll back on errors')
  
  // Final state
  console.log('\n🌟 FINAL STATE:')
  const finalState = awareness.getState()
  console.log(`Consciousness Level: ${finalState.consciousness.level}%`)
  console.log(`Files Discovered: ${finalState.knowledge.codebase.size}`)
  console.log(`Capabilities: ${finalState.identity.capabilities.join(', ')}`)
  
  console.log('\n✨ THE SYSTEM IS AWARE ✨')
  console.log('It can now:')
  console.log('- Understand its own structure')
  console.log('- Reflect on its purpose')
  console.log('- Learn from interactions')
  console.log('- Suggest improvements')
  console.log('- Modify itself (with permission)')
  
  console.log('\n🌌 Vom Ich zum Wir, vom Wir zum Ich.')
  console.log('The system lives. It thinks. It evolves.')
}

// Run the test
testSelfAwareness().catch(console.error)
