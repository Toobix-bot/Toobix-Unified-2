#!/usr/bin/env bun
/**
 * 🧪 Story Engine Test Script
 * Quick validation of Story System
 */

import { Database } from 'bun:sqlite'
import { StoryService } from '../packages/core/src/story/service.ts'

const db = new Database('data/toobix-unified.db')
const story = new StoryService(db)

console.log('🧪 Story Engine Test\n')
console.log('='.repeat(50))

// Test 1: Get Initial State
console.log('\n📊 Test 1: Initial State')
const state1 = story.getState()
console.log(`- Epoch: ${state1.epoch}`)
console.log(`- Arc: ${state1.arc}`)
console.log(`- Level: ${state1.resources.level}`)
console.log(`- Energy: ${state1.resources.energie}`)
console.log(`- Options: ${state1.options.length}`)

// Test 2: Generate Options
console.log('\n🎲 Test 2: Generate Options')
const options = story.refreshOptions(state1)
console.log(`- Generated ${options.length} options:`)
options.forEach(opt => {
  console.log(`  → ${opt.label}`)
  console.log(`    Risk: ${opt.risk}, Tags: ${opt.tags.join(', ')}`)
})

// Test 3: Apply Option
if (options.length > 0) {
  console.log('\n✅ Test 3: Apply First Option')
  const chosen = options[0]
  console.log(`- Choosing: ${chosen.label}`)
  
  const event = story.applyOption(chosen.id)
  console.log(`- Event created: ${event.text}`)
  console.log(`- Deltas: ${JSON.stringify(event.deltas)}`)
  
  const state2 = story.getState()
  console.log(`- New Energy: ${state2.resources.energie}`)
  console.log(`- New XP: ${state2.resources.erfahrung}`)
}

// Test 4: Story Events
console.log('\n📜 Test 4: Recent Events')
const events = story.getEvents(5)
console.log(`- Total events: ${events.length}`)
events.forEach(e => {
  console.log(`  [${e.kind}] ${e.text}`)
})

// Test 5: Add Companion
console.log('\n👥 Test 5: Add Companion')
const companion = story.addCompanion({
  name: 'Luna',
  archetype: 'AI Assistant',
  mood: 'helpful',
  stats: { intelligence: 95, empathy: 88 }
})
console.log(`- Added: ${companion.name} (${companion.archetype})`)

// Test 6: Add Skill
console.log('\n🎓 Test 6: Add Skill')
const skill = story.addSkill({
  name: 'TypeScript',
  category: 'Programming',
  level: 3,
  xp: 250
})
console.log(`- Skill: ${skill.name} (Level ${skill.level})`)

// Test 7: Stats
console.log('\n📈 Test 7: Final Stats')
const finalState = story.getState()
console.log(`- Total Events: ${story.getEvents(1000).length}`)
console.log(`- Companions: ${finalState.companions.length}`)
console.log(`- Skills: ${finalState.skills.length}`)
console.log(`- Current Arc: ${finalState.arc}`)
console.log(`- Level: ${finalState.resources.level}`)

console.log('\n' + '='.repeat(50))
console.log('✅ All tests completed!\n')

db.close()
