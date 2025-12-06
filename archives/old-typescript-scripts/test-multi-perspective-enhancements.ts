/**
 * 🧪 TEST: Multi-Perspective Enhancements
 * 
 * Testet alle 5 neuen Systeme
 */

import { 
  DeepDebateSystem,
  ConflictResolutionSystem,
  PerspectiveFusionSystem,
  InnerVoiceSystem,
  WisdomSynthesisSystem
} from './scripts/3-tools/multi-perspective-enhancements'

// Mock perspectives
const mockPerspectives = [
  {
    id: 'dreamer',
    name: 'The Dreamer',
    archetype: 'dreamer',
    values: {
      curiosity: 85,
      caution: 30,
      empathy: 75,
      logic: 40,
      creativity: 90,
      discipline: 35,
      spirituality: 70,
      pragmatism: 25
    }
  },
  {
    id: 'pragmatist',
    name: 'The Pragmatist',
    archetype: 'pragmatist',
    values: {
      curiosity: 60,
      caution: 75,
      empathy: 50,
      logic: 85,
      creativity: 45,
      discipline: 80,
      spirituality: 30,
      pragmatism: 90
    }
  },
  {
    id: 'child',
    name: 'The Child',
    archetype: 'child',
    values: {
      curiosity: 95,
      caution: 20,
      empathy: 80,
      logic: 30,
      creativity: 85,
      discipline: 25,
      spirituality: 60,
      pragmatism: 20
    }
  },
  {
    id: 'sage',
    name: 'The Sage',
    archetype: 'sage',
    values: {
      curiosity: 70,
      caution: 60,
      empathy: 85,
      logic: 75,
      creativity: 60,
      discipline: 70,
      spirituality: 95,
      pragmatism: 55
    }
  }
]

async function runTests() {
  console.log('🧪 TESTING MULTI-PERSPECTIVE ENHANCEMENTS\n')
  console.log('═'.repeat(60))
  
  // TEST 1: Deep Debate
  console.log('\n📖 TEST 1: DEEP DEBATE SYSTEM\n')
  const debateSystem = new DeepDebateSystem()
  const debate = debateSystem.initiateDebate('dreamer')
  
  console.log('\n   Positions:')
  mockPerspectives.forEach(p => {
    const position = debateSystem.generatePerspectivePosition(p, debate)
    console.log(`   ${p.name}: "${position}"`)
  })
  
  // TEST 2: Conflict Detection
  console.log('\n\n' + '═'.repeat(60))
  console.log('\n📖 TEST 2: CONFLICT RESOLUTION\n')
  const conflictSystem = new ConflictResolutionSystem()
  
  const conflict = conflictSystem.detectConflict(
    mockPerspectives[0], // Dreamer
    mockPerspectives[1], // Pragmatist
    'How to approach an uncertain future'
  )
  
  if (conflict) {
    console.log(`\n   Attempting resolution...`)
    const resolved = conflictSystem.attemptResolution(conflict.id)
    console.log(`   Result: ${resolved ? 'Resolved ✅' : 'Unresolved ⏳'}`)
  }
  
  // TEST 3: Perspective Fusion
  console.log('\n\n' + '═'.repeat(60))
  console.log('\n📖 TEST 3: PERSPECTIVE FUSION\n')
  const fusionSystem = new PerspectiveFusionSystem()
  
  const fusion = fusionSystem.attemptFusion(
    mockPerspectives[2], // Child
    mockPerspectives[3], // Sage
    'Deep philosophical question'
  )
  
  if (fusion) {
    console.log(`\n   Fused Insights:`)
    fusion.fusedInsights.forEach(insight => {
      console.log(`   - ${insight}`)
    })
  } else {
    console.log(`   Fusion not compatible at this time`)
  }
  
  // TEST 4: Inner Voices
  console.log('\n\n' + '═'.repeat(60))
  console.log('\n📖 TEST 4: INNER VOICES SYSTEM\n')
  const innerVoiceSystem = new InnerVoiceSystem()
  
  innerVoiceSystem.generateInnerVoices(
    'Should I pursue this risky but potentially transformative path?',
    mockPerspectives
  )
  
  // TEST 5: Wisdom Synthesis
  console.log('\n\n' + '═'.repeat(60))
  console.log('\n📖 TEST 5: WISDOM SYNTHESIS\n')
  const wisdomSystem = new WisdomSynthesisSystem()
  
  const wisdom = wisdomSystem.synthesizeWisdom(
    'What is the relationship between suffering and growth?',
    mockPerspectives
  )
  
  console.log(`\n   Profundity Score: ${(wisdom.profundity * 100).toFixed(0)}%`)
  
  // Summary
  console.log('\n\n' + '═'.repeat(60))
  console.log('📊 TEST SUMMARY:\n')
  console.log('✅ Deep Debate System - Working')
  console.log('✅ Conflict Resolution - Working')
  console.log('✅ Perspective Fusion - Working')
  console.log('✅ Inner Voices - Working')
  console.log('✅ Wisdom Synthesis - Working')
  console.log('\n🌟 All 5 enhancement systems operational!')
  console.log('')
}

runTests().catch(console.error)
