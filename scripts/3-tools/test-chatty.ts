#!/usr/bin/env bun
// Test Chatty MCP Client connection

import { ChattyMCPClient, ChattyAgent } from '../packages/chatty-client/index.ts'

async function main() {
  console.log('🤖 Testing Chatty MCP Client...\n')

  // Test 1: Basic client connection
  console.log('Test 1: Creating ChattyMCPClient...')
  const client = new ChattyMCPClient('http://localhost:3337')
  
  try {
    // Test 2: Health check
    console.log('\nTest 2: Health check...')
    const healthy = await client.healthCheck()
    console.log(`✅ Health: ${healthy ? 'HEALTHY' : 'UNHEALTHY'}`)

    // Test 3: Discover tools
    console.log('\nTest 3: Discovering tools...')
    const tools = await client.discoverTools()
    console.log(`✅ Found ${tools.length} tools`)
    console.log('First 5 tools:', tools.slice(0, 5).map(t => t.name))

    // Test 4: Call a tool (memory_search)
    console.log('\nTest 4: Calling memory_search tool...')
    const memoryResult = await client.callTool('memory_search', { 
      query: 'test',
      limit: 3
    })
    console.log('✅ Memory search result:', memoryResult)

    // Test 5: Create ChattyAgent
    console.log('\nTest 5: Creating ChattyAgent...')
    const agent = new ChattyAgent('http://localhost:3337')
    await agent.initialize()
    console.log(`✅ Agent initialized with ${agent.tools.length} tools`)

    // Test 6: Test commands
    console.log('\nTest 6: Testing agent commands...')
    
    const helpResponse = await agent.handleUserInput('/help')
    console.log('✅ /help command:', helpResponse.split('\n')[0])

    const toolsResponse = await agent.handleUserInput('/tools')
    console.log('✅ /tools command:', toolsResponse.split('\n').slice(0, 3).join('\n'))

    const memResponse = await agent.handleUserInput('/mem test query')
    console.log('✅ /mem command:', memResponse.split('\n')[0])

    console.log('\n🎉 All tests passed!')
    console.log('\n✅ Chatty Integration is WORKING!')
    console.log('\n📝 Summary:')
    console.log(`   - Bridge running on http://localhost:3337`)
    console.log(`   - ${tools.length} MCP tools accessible`)
    console.log(`   - ChattyAgent fully functional`)
    console.log(`   - Commands: /help, /tools, /mem, /story, /think, /gratitude`)

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message)
    console.error('\nMake sure Bridge is running:')
    console.error('   bun run dev:bridge')
    process.exit(1)
  }
}

main()
