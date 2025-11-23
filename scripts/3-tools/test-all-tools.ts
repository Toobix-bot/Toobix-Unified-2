#!/usr/bin/env bun
// Test each MCP tool individually to find problematic ones

import { ChattyMCPClient } from '../packages/chatty-client/index.ts'

const PUBLIC_URL = process.env.MCP_PUBLIC_URL || 'http://localhost:3337'

async function main() {
  console.log(`🧪 Testing all MCP tools individually...\n`)
  console.log(`URL: ${PUBLIC_URL}\n`)
  
  const client = new ChattyMCPClient(PUBLIC_URL)
  
  // Discover all tools
  const tools = await client.discoverTools()
  console.log(`Found ${tools.length} tools\n`)
  
  const results: Array<{
    name: string
    status: 'pass' | 'fail' | 'skip'
    error?: string
    duration?: number
  }> = []
  
  // Test each tool
  for (const tool of tools) {
    const startTime = Date.now()
    
    try {
      const testArgs = getTestArgs(tool.name)
      
      if (testArgs === null) {
        results.push({ name: tool.name, status: 'skip' })
        console.log(`⏭️  ${tool.name} - SKIPPED (no test args)`)
        continue
      }
      
      console.log(`Testing ${tool.name}...`)
      await client.callTool(tool.name, testArgs)
      
      const duration = Date.now() - startTime
      results.push({ name: tool.name, status: 'pass', duration })
      console.log(`  ✅ ${tool.name} - PASSED (${duration}ms)`)
      
    } catch (error: any) {
      const duration = Date.now() - startTime
      results.push({ 
        name: tool.name, 
        status: 'fail', 
        error: error.message,
        duration 
      })
      console.error(`  ❌ ${tool.name} - FAILED (${duration}ms)`)
      console.error(`     Error: ${error.message}`)
    }
  }
  
  // Summary
  console.log(`\n${'='.repeat(60)}`)
  console.log(`📊 Test Results Summary\n`)
  
  const passed = results.filter(r => r.status === 'pass')
  const failed = results.filter(r => r.status === 'fail')
  const skipped = results.filter(r => r.status === 'skip')
  
  console.log(`✅ Passed: ${passed.length}`)
  console.log(`❌ Failed: ${failed.length}`)
  console.log(`⏭️  Skipped: ${skipped.length}`)
  console.log(`📊 Total: ${tools.length}`)
  
  if (failed.length > 0) {
    console.log(`\n🔍 Failed Tools:`)
    failed.forEach(r => {
      console.log(`  ❌ ${r.name}`)
      console.log(`     Error: ${r.error}`)
      console.log(`     Duration: ${r.duration}ms`)
    })
  }
  
  if (passed.length > 0) {
    console.log(`\n⚡ Performance (Passed Tools):`)
    const sorted = passed.sort((a, b) => (b.duration || 0) - (a.duration || 0))
    sorted.slice(0, 5).forEach(r => {
      console.log(`  ${r.duration}ms - ${r.name}`)
    })
  }
  
  // Exit with error if any failed
  if (failed.length > 0) {
    process.exit(1)
  }
}

function getTestArgs(toolName: string): any | null {
  // Provide sensible test arguments per tool
  const argsMap: Record<string, any> = {
    // Memory
    'memory_search': { query: 'test', limit: 1 },
    'memory_add': { text: 'Test memory from tool test', source: 'test-script' },
    
    // AI
    'generate': { prompt: 'Say hello', max_tokens: 10 },
    
    // Actions
    'trigger_action': null,  // Skip - requires action ID
    
    // Soul
    'soul_state': {},
    'soul_event': { event: 'test_event', impact: 0.5 },
    
    // People
    'contact_search': { query: 'test' },
    'contact_add': { name: 'Test Contact', email: 'test@example.com' },
    'contact_update': null,  // Skip - requires contact ID
    'interaction_log': null,  // Skip - requires contact ID
    
    // Story
    'story_state': {},
    'story_choose': null,  // Skip - requires choice context
    'story_events': {},
    'story_person': null,  // Skip - requires person ID
    'story_refresh': {},
    
    // Love
    'love_add_gratitude': { gratitude: 'Test gratitude' },
    'love_add_kindness': { kindness: 'Test kindness act', recipient: 'Test Person' },
    'love_get_score': {},
    'love_get_relationships': {},
    'love_recent_gratitude': {},
    
    // Peace
    'peace_get_state': {},
    'peace_calm_meditate': { duration: 1, focus: 'breath' },
    'peace_calm_breathing': { technique: 'box', duration: 1 },
    'peace_harmony_log_conflict': { description: 'Test conflict', parties: 'A, B' },
    'peace_harmony_resolve': null,  // Skip - requires conflict ID
    'peace_clarity_journal': { entry: 'Test journal entry' },
    'peace_growth_learn': { skill: 'Test Skill', progress: 0.1 },
    'peace_growth_milestone': { milestone: 'Test Milestone' },
    'peace_purpose_value': { value: 'Test Value', description: 'Test Description' },
    'peace_purpose_intention': { intention: 'Test Intention' },
    'peace_get_actions': {},
    'peace_get_conflicts': {},
    
    // Consciousness
    'consciousness_state': {},
    'consciousness_think': { thought: 'Test thought' },
    'consciousness_act': { action: 'Test action', reasoning: 'Test reasoning' },
    'consciousness_communicate': { message: 'Test message', recipient: 'Test Recipient' },
    'consciousness_introspect': { focus: 'test' },
    'consciousness_set_goal': { goal: 'Test Goal', priority: 'medium' },
    'consciousness_analyze_code': null,  // Skip - requires code
    'consciousness_generate_code': null,  // Skip - complex
    'consciousness_test_code': null,  // Skip - complex
    'consciousness_improve_self': null,  // Skip - complex
    'consciousness_read_function': null,  // Skip - requires function name
    'consciousness_save_code': null,  // Skip - requires code
    'consciousness_self_coding_stats': {},
    
    // System
    'ping': {}
  }
  
  return argsMap[toolName] !== undefined ? argsMap[toolName] : null
}

main()
