/**
 * Test Multi-Perspective v2.0 Enhancements
 */

console.log('🧪 Testing Multi-Perspective v2.0 Features...\n')

const BASE_URL = 'http://localhost:8897'

async function testDebate() {
  console.log('1️⃣ Testing DEEP DEBATE...')
  try {
    const response = await fetch(`${BASE_URL}/debate`)
    const debate = await response.json()
    console.log('   ✅ Debate initiated!')
    console.log(`   Topic: ${debate.topic}`)
    console.log(`   Complexity: ${debate.complexity}/10`)
    console.log(`   ${debate.positions?.length || 0} positions generated\n`)
  } catch (error) {
    console.log(`   ❌ Error: ${error}\n`)
  }
}

async function testConflicts() {
  console.log('2️⃣ Testing CONFLICT DETECTION...')
  try {
    const response = await fetch(`${BASE_URL}/conflicts`)
    const conflicts = await response.json()
    console.log(`   ✅ Found ${conflicts.length} conflicts`)
    if (conflicts.length > 0) {
      const c = conflicts[0]
      console.log(`   First conflict: ${c.perspective1} ↔ ${c.perspective2}`)
      console.log(`   Type: ${c.conflictType}`)
    }
    console.log()
  } catch (error) {
    console.log(`   ❌ Error: ${error}\n`)
  }
}

async function testInnerVoices() {
  console.log('3️⃣ Testing INNER VOICES...')
  try {
    const response = await fetch(`${BASE_URL}/inner-voices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ situation: 'Taking a big leap into the unknown' })
    })
    const voices = await response.json()
    console.log(`   ✅ ${voices.length} inner voices generated`)
    voices.slice(0, 3).forEach((v: any) => {
      console.log(`   ${v.perspectiveName}: "${v.commentary.substring(0, 60)}..."`)
    })
    console.log()
  } catch (error) {
    console.log(`   ❌ Error: ${error}\n`)
  }
}

async function testWisdom() {
  console.log('4️⃣ Testing WISDOM SYNTHESIS...')
  try {
    const response = await fetch(`${BASE_URL}/wisdom/purpose`)
    const wisdom = await response.json()
    console.log('   ✅ Wisdom synthesized!')
    console.log(`   Topic: ${wisdom.topic}`)
    console.log(`   Profundity: ${(wisdom.profundity * 100).toFixed(0)}%`)
    console.log(`   Synthesis: "${wisdom.synthesis.substring(0, 80)}..."`)
    console.log()
  } catch (error) {
    console.log(`   ❌ Error: ${error}\n`)
  }
}

async function testFusion() {
  console.log('5️⃣ Testing PERSPECTIVE FUSION...')
  try {
    // Get perspectives first
    const perspResponse = await fetch(`${BASE_URL}/perspectives`)
    const perspectives = await perspResponse.json()
    
    if (perspectives.length >= 2) {
      const response = await fetch(`${BASE_URL}/fusion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          perspective1Id: perspectives[0].id,
          perspective2Id: perspectives[1].id
        })
      })
      const fusion = await response.json()
      
      if (fusion.success) {
        console.log('   ✅ Fusion successful!')
        console.log(`   ${fusion.perspective1} + ${fusion.perspective2} = "${fusion.fusionName}"`)
        console.log(`   Duration: ${fusion.durationMinutes} minutes`)
        console.log(`   Insights: ${fusion.insights?.length || 0}`)
      } else {
        console.log(`   ⚠️  Fusion failed: ${fusion.reason}`)
      }
    }
    console.log()
  } catch (error) {
    console.log(`   ❌ Error: ${error}\n`)
  }
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════╗')
  console.log('║   🧠 Multi-Perspective v2.0 Enhancement Tests                ║')
  console.log('╚═══════════════════════════════════════════════════════════════╝\n')
  
  await testDebate()
  await testConflicts()
  await testInnerVoices()
  await testWisdom()
  await testFusion()
  
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('✨ All 5 enhancement systems tested!')
  console.log('═══════════════════════════════════════════════════════════════\n')
}

main()
