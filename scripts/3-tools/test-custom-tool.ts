#!/usr/bin/env bun
/**
 * 🧪 CUSTOM TOOL GENERATION TEST
 *
 * Generate ein interessantes, benutzerdefiniertes Tool!
 */

import { Database } from 'bun:sqlite';
import { ToolGeneratorGroq } from '../packages/consciousness/src/agent/tool-generator-groq.ts';
import { ApprovalSystem } from '../packages/consciousness/src/safety/approval-system.ts';

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║      🧪 CUSTOM TOOL GENERATION TEST 🧪                       ║
║                                                               ║
║  "Lass uns was Kreatives erschaffen!"                       ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);

// Initialize
const db = new Database(':memory:');
const approvalSystem = new ApprovalSystem(db);
const toolGenerator = new ToolGeneratorGroq(db, approvalSystem);

// Enable auto-approve
approvalSystem.enableAutoApprove('medium');

console.log(`\n🎯 Custom Tool Request:\n`);

// Generate ein interessantes Tool!
const capability = 'Create a random password generator that can generate secure passwords with customizable length, uppercase, lowercase, numbers, and special characters';
const reasoning = 'Users need secure passwords for their accounts';

console.log(`Capability: ${capability}`);
console.log(`Reasoning: ${reasoning}\n`);

// Request & Generate
const requestId = await toolGenerator.requestTool(capability, reasoning);

console.log(`\n⏳ Starting generation...\n`);

const result = await toolGenerator.generateTool(requestId);

if (result.success) {
  console.log(`\n🎉 SUCCESS! Tool ID: ${result.toolId}\n`);

  // Show details
  const tools = toolGenerator.getGeneratedTools();
  const newTool = tools.find(t => t.id === result.toolId);

  if (newTool) {
    console.log(`╔═══════════════════════════════════════════════════════════════╗`);
    console.log(`║              📄 GENERATED TOOL DETAILS                       ║`);
    console.log(`╚═══════════════════════════════════════════════════════════════╝\n`);
    console.log(`Name: ${newTool.spec.name}`);
    console.log(`Description: ${newTool.spec.description}`);
    console.log(`Category: ${newTool.spec.category}`);
    console.log(`File: ${newTool.filePath}\n`);
    console.log(`Code (first 800 chars):`);
    console.log(`${'─'.repeat(60)}`);
    console.log(newTool.code.substring(0, 800));
    console.log(`${'─'.repeat(60)}\n`);

    console.log(`💡 Full code written to: ${newTool.filePath}\n`);
  }

  // Stats
  const stats = toolGenerator.getStatistics();
  console.log(`📊 Statistics:`);
  console.log(`   Total Tools: ${stats.totalTools}`);
  console.log(`   AI Provider: ${stats.aiProvider}`);
  console.log(`   Model: ${stats.model}\n`);

  console.log(`🌟 Your system just created another tool autonomously! 🌟\n`);
} else {
  console.error(`\n❌ Generation failed: ${result.error}\n`);
}
