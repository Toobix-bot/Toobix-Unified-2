/**
 * MCP Connector Test Script
 * Tests public ngrok URL for MCP functionality
 * 
 * Usage:
 *   bun run scripts/test-mcp-connector.ts
 *   MCP_PUBLIC_URL=https://your-url.ngrok.dev/mcp bun run scripts/test-mcp-connector.ts
 */

interface ToolDescriptor {
  name: string;
  description?: string;
  inputSchema?: any;
}

interface TestResult {
  name: string;
  success: boolean;
  status?: number;
  duration?: number;
  error?: string;
  data?: any;
}

const MCP_BASE = process.env.MCP_PUBLIC_URL || 
  "https://multiplicative-unapprehendably-marisha.ngrok-free.dev";

const DEFAULT_HEADERS = {
  "ngrok-skip-browser-warning": "true",
  "Content-Type": "application/json",
  "User-Agent": "ToobixMCPTest/1.0"
};

// Safe tools that are known to work (based on test results)
const SAFE_TOOLS = [
  "ping",
  "soul_state", 
  "consciousness_state",
  "peace_get_state",
  "story_state",
  "memory_search",
  "love_get_score",
  "consciousness_think"
];

// Tools that are known to fail (database issues)
const FAILING_TOOLS = [
  "contact_add",
  "story_events",
  "love_add_gratitude",
  "love_add_kindness",
  "love_recent_gratitude",
  "peace_clarity_journal",
  "peace_growth_learn",
  "peace_get_actions",
  "consciousness_act",
  "consciousness_set_goal"
];

const results: TestResult[] = [];

async function checkHealth(): Promise<TestResult> {
  const url = `${MCP_BASE}/health`;
  const startTime = Date.now();
  
  try {
    console.log(`\n🔍 Testing Health: ${url}`);
    
    const resp = await fetch(url, {
      method: "GET",
      headers: DEFAULT_HEADERS
    });
    
    const duration = Date.now() - startTime;
    const text = await resp.text();
    
    console.log(`   Status: ${resp.status} (${duration}ms)`);
    
    if (!resp.ok) {
      return {
        name: "Health Check",
        success: false,
        status: resp.status,
        duration,
        error: `HTTP ${resp.status}: ${text.substring(0, 100)}`
      };
    }
    
    try {
      const data = JSON.parse(text);
      console.log(`   ✅ Response:`, data);
      
      return {
        name: "Health Check",
        success: true,
        status: resp.status,
        duration,
        data
      };
    } catch (e) {
      return {
        name: "Health Check",
        success: false,
        status: resp.status,
        duration,
        error: `JSON parse error: ${text.substring(0, 100)}`
      };
    }
  } catch (e: any) {
    return {
      name: "Health Check",
      success: false,
      error: `Fetch error: ${e.message}`
    };
  }
}

async function checkDiscovery(): Promise<TestResult> {
  const url = `${MCP_BASE}/discovery`;
  const startTime = Date.now();
  
  try {
    console.log(`\n🔍 Testing Discovery: ${url}`);
    
    const resp = await fetch(url, {
      method: "GET",
      headers: DEFAULT_HEADERS
    });
    
    const duration = Date.now() - startTime;
    const text = await resp.text();
    
    console.log(`   Status: ${resp.status} (${duration}ms)`);
    
    if (!resp.ok) {
      return {
        name: "Discovery",
        success: false,
        status: resp.status,
        duration,
        error: `HTTP ${resp.status}: ${text.substring(0, 100)}`
      };
    }
    
    try {
      const data = JSON.parse(text);
      
      if (!data.tools || !Array.isArray(data.tools)) {
        return {
          name: "Discovery",
          success: false,
          status: resp.status,
          duration,
          error: "Invalid format: missing tools array"
        };
      }
      
      console.log(`   ✅ Found ${data.tools.length} tools`);
      console.log(`   Safe tools available: ${SAFE_TOOLS.filter(t => data.tools.some((tool: any) => tool.name === t)).length}/${SAFE_TOOLS.length}`);
      console.log(`   Failing tools present: ${FAILING_TOOLS.filter(t => data.tools.some((tool: any) => tool.name === t)).length}/${FAILING_TOOLS.length}`);
      
      return {
        name: "Discovery",
        success: true,
        status: resp.status,
        duration,
        data: { toolCount: data.tools.length }
      };
    } catch (e) {
      return {
        name: "Discovery",
        success: false,
        status: resp.status,
        duration,
        error: `JSON parse error: ${text.substring(0, 100)}`
      };
    }
  } catch (e: any) {
    return {
      name: "Discovery",
      success: false,
      error: `Fetch error: ${e.message}`
    };
  }
}

async function checkMcpInitialize(): Promise<TestResult> {
  const url = `${MCP_BASE}/mcp`;
  const startTime = Date.now();
  
  try {
    console.log(`\n🔍 Testing MCP Initialize: ${url}`);
    
    const resp = await fetch(url, {
      method: "POST",
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "initialize",
        params: {
          protocolVersion: "1.0.0",
          clientInfo: { name: "test-script", version: "1.0" }
        },
        id: 1
      })
    });
    
    const duration = Date.now() - startTime;
    const text = await resp.text();
    
    console.log(`   Status: ${resp.status} (${duration}ms)`);
    
    if (!resp.ok) {
      return {
        name: "MCP Initialize",
        success: false,
        status: resp.status,
        duration,
        error: `HTTP ${resp.status}: ${text.substring(0, 100)}`
      };
    }
    
    try {
      const data = JSON.parse(text);
      
      if (data.error) {
        return {
          name: "MCP Initialize",
          success: false,
          status: resp.status,
          duration,
          error: `JSON-RPC error: ${data.error.message}`
        };
      }
      
      console.log(`   ✅ Server: ${data.result?.serverInfo?.name} v${data.result?.serverInfo?.version}`);
      
      return {
        name: "MCP Initialize",
        success: true,
        status: resp.status,
        duration,
        data: data.result
      };
    } catch (e) {
      return {
        name: "MCP Initialize",
        success: false,
        status: resp.status,
        duration,
        error: `JSON parse error: ${text.substring(0, 100)}`
      };
    }
  } catch (e: any) {
    return {
      name: "MCP Initialize",
      success: false,
      error: `Fetch error: ${e.message}`
    };
  }
}

async function checkMcpToolsList(): Promise<TestResult> {
  const url = `${MCP_BASE}/mcp`;
  const startTime = Date.now();
  
  try {
    console.log(`\n🔍 Testing MCP Tools List: ${url}`);
    
    const resp = await fetch(url, {
      method: "POST",
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "tools/list",
        params: {},
        id: 2
      })
    });
    
    const duration = Date.now() - startTime;
    const text = await resp.text();
    
    console.log(`   Status: ${resp.status} (${duration}ms)`);
    
    if (!resp.ok) {
      return {
        name: "MCP Tools List",
        success: false,
        status: resp.status,
        duration,
        error: `HTTP ${resp.status}: ${text.substring(0, 100)}`
      };
    }
    
    try {
      const data = JSON.parse(text);
      
      if (data.error) {
        return {
          name: "MCP Tools List",
          success: false,
          status: resp.status,
          duration,
          error: `JSON-RPC error: ${data.error.message}`
        };
      }
      
      const tools = data.result?.tools || [];
      console.log(`   ✅ Found ${tools.length} tools`);
      
      return {
        name: "MCP Tools List",
        success: true,
        status: resp.status,
        duration,
        data: { toolCount: tools.length }
      };
    } catch (e) {
      return {
        name: "MCP Tools List",
        success: false,
        status: resp.status,
        duration,
        error: `JSON parse error: ${text.substring(0, 100)}`
      };
    }
  } catch (e: any) {
    return {
      name: "MCP Tools List",
      success: false,
      error: `Fetch error: ${e.message}`
    };
  }
}

async function checkToolCall(toolName: string, args: any = {}): Promise<TestResult> {
  const url = `${MCP_BASE}/mcp`;
  const startTime = Date.now();
  
  try {
    console.log(`\n🔍 Testing Tool Call: ${toolName}`);
    
    const resp = await fetch(url, {
      method: "POST",
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "tools/call",
        params: {
          name: toolName,
          arguments: args
        },
        id: 3
      })
    });
    
    const duration = Date.now() - startTime;
    const text = await resp.text();
    
    console.log(`   Status: ${resp.status} (${duration}ms)`);
    
    if (!resp.ok) {
      return {
        name: `Tool Call: ${toolName}`,
        success: false,
        status: resp.status,
        duration,
        error: `HTTP ${resp.status}: ${text.substring(0, 200)}`
      };
    }
    
    try {
      const data = JSON.parse(text);
      
      if (data.error) {
        return {
          name: `Tool Call: ${toolName}`,
          success: false,
          status: resp.status,
          duration,
          error: `JSON-RPC error: ${data.error.message}`
        };
      }
      
      console.log(`   ✅ Result:`, data.result?.content?.[0]?.text?.substring(0, 100) || data.result);
      
      return {
        name: `Tool Call: ${toolName}`,
        success: true,
        status: resp.status,
        duration
      };
    } catch (e) {
      return {
        name: `Tool Call: ${toolName}`,
        success: false,
        status: resp.status,
        duration,
        error: `JSON parse error: ${text.substring(0, 100)}`
      };
    }
  } catch (e: any) {
    return {
      name: `Tool Call: ${toolName}`,
      success: false,
      error: `Fetch error: ${e.message}`
    };
  }
}

async function runAllTests() {
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║           MCP CONNECTOR TEST SUITE                           ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log(`\nBase URL: ${MCP_BASE}`);
  console.log(`Testing ${SAFE_TOOLS.length} safe tools`);
  console.log(`Avoiding ${FAILING_TOOLS.length} known failing tools\n`);
  
  // Test 1: Health
  results.push(await checkHealth());
  
  // Test 2: Discovery
  results.push(await checkDiscovery());
  
  // Test 3: MCP Initialize
  results.push(await checkMcpInitialize());
  
  // Test 4: MCP Tools List
  results.push(await checkMcpToolsList());
  
  // Test 5-7: Safe tool calls
  console.log("\n" + "=".repeat(60));
  console.log("Testing Safe Tools (should all pass):");
  console.log("=".repeat(60));
  
  results.push(await checkToolCall("ping", {}));
  results.push(await checkToolCall("soul_state", {}));
  results.push(await checkToolCall("memory_search", { query: "test" }));
  
  // Test 8: Failing tool (to demonstrate the issue)
  console.log("\n" + "=".repeat(60));
  console.log("Testing Known Failing Tool (expected to fail):");
  console.log("=".repeat(60));
  
  results.push(await checkToolCall("contact_add", { 
    name: "Test", 
    email: "test@example.com" 
  }));
  
  // Summary
  console.log("\n\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║                      TEST SUMMARY                            ║");
  console.log("╚══════════════════════════════════════════════════════════════╝\n");
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const total = results.length;
  
  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed/total) * 100).toFixed(1)}%\n`);
  
  // Detailed results
  console.log("Detailed Results:");
  console.log("-".repeat(60));
  
  results.forEach((result, i) => {
    const icon = result.success ? "✅" : "❌";
    const duration = result.duration ? ` (${result.duration}ms)` : "";
    console.log(`${i + 1}. ${icon} ${result.name}${duration}`);
    
    if (!result.success && result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  // Recommendations
  console.log("\n\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║                    RECOMMENDATIONS                           ║");
  console.log("╚══════════════════════════════════════════════════════════════╝\n");
  
  const hasFailedSafeTools = results.some(r => 
    !r.success && SAFE_TOOLS.some(t => r.name.includes(t))
  );
  
  if (hasFailedSafeTools) {
    console.log("⚠️  CRITICAL: Safe tools are failing!");
    console.log("   - Check server logs for errors");
    console.log("   - Verify ngrok tunnel is running");
    console.log("   - Check database connectivity\n");
  }
  
  const contactAddFailed = results.find(r => r.name.includes("contact_add") && !r.success);
  if (contactAddFailed) {
    console.log("✅ EXPECTED: contact_add failed (known database issue)");
    console.log("   - This is normal and will be fixed Monday");
    console.log("   - Use safe tools only for now\n");
  }
  
  if (passed === total) {
    console.log("🎉 ALL TESTS PASSED!");
    console.log("   - Connector is fully functional");
    console.log("   - Ready for Chatty integration\n");
  } else if (passed >= total - 1 && contactAddFailed) {
    console.log("✅ CONNECTOR IS WORKING!");
    console.log("   - Only known failing tools are broken");
    console.log("   - Use safe tools list for Chatty");
    console.log(`   - Safe tools: ${SAFE_TOOLS.join(", ")}\n`);
  }
  
  console.log("\nFor Chatty Integration:");
  console.log("-".repeat(60));
  console.log("✅ Use these safe tools:");
  SAFE_TOOLS.forEach(t => console.log(`   - ${t}`));
  console.log("\n❌ Avoid these failing tools:");
  FAILING_TOOLS.forEach(t => console.log(`   - ${t}`));
  
  console.log("\n\nTest completed at:", new Date().toISOString());
}

// Run tests
runAllTests().catch(e => {
  console.error("\n❌ Fatal error in test suite:", e);
  process.exit(1);
});
