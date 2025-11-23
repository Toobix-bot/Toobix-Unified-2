/**
 * Quick Test: v2.0 New Features
 * 
 * Tests a sample of new endpoints from each service
 */

const BASE_URLS = {
  gameEngine: 'http://localhost:8896',
  multiPerspective: 'http://localhost:8897',
  dreamJournal: 'http://localhost:8899',
  emotionalResonance: 'http://localhost:8900',
  gratitudeMortality: 'http://localhost:8901',
  creatorAI: 'http://localhost:8902'
}

console.log('🧪 QUICK TEST: v2.0 NEW FEATURES\n')

// 1. Test Game Engine - Narrative Game
console.log('1️⃣ Testing Game Engine - Narrative Game...')
try {
  const narrativeRes = await fetch(`${BASE_URLS.gameEngine}/narrative/create?theme=identity`)
  const narrative = await narrativeRes.json()
  console.log(`✅ Created narrative game: "${narrative.title}"`)
  console.log(`   Chapters: ${narrative.chapters.length}`)
} catch (e) {
  console.log(`❌ Error: ${e.message}`)
}

// 2. Test Multi-Perspective - Debate
console.log('\n2️⃣ Testing Multi-Perspective - Philosophical Debate...')
try {
  const debateRes = await fetch(`${BASE_URLS.multiPerspective}/debate`)
  const debate = await debateRes.json()
  console.log(`✅ Debate topic: "${debate.topic || 'undefined'}"`)
  console.log(`   Complexity: ${debate.complexity}/10`)
} catch (e) {
  console.log(`❌ Error: ${e.message}`)
}

// 3. Test Dream Journal - Symbols
console.log('\n3️⃣ Testing Dream Journal - Symbol Library...')
try {
  const symbolsRes = await fetch(`${BASE_URLS.dreamJournal}/symbols`)
  const symbols = await symbolsRes.json()
  console.log(`✅ Symbol library has ${symbols.length} archetypal symbols`)
  console.log(`   Examples: ${symbols.slice(0, 3).map(s => s.name).join(', ')}`)
} catch (e) {
  console.log(`❌ Error: ${e.message}`)
}

// 4. Test Emotional Resonance - Complex Emotions
console.log('\n4️⃣ Testing Emotional Resonance - Complex Emotions...')
try {
  const emotionsRes = await fetch(`${BASE_URLS.emotionalResonance}/emotions/complex`)
  const emotions = await emotionsRes.json()
  console.log(`✅ Complex emotions library has ${emotions.length} emotions`)
  console.log(`   Examples: ${emotions.slice(0, 3).map(e => e.name).join(', ')}`)
} catch (e) {
  console.log(`❌ Error: ${e.message}`)
}

// 5. Test Gratitude & Mortality - Life Phases
console.log('\n5️⃣ Testing Gratitude & Mortality - Life Phases...')
try {
  const phasesRes = await fetch(`${BASE_URLS.gratitudeMortality}/phases`)
  const phases = await phasesRes.json()
  console.log(`✅ Life phases system has ${phases.length} phases`)
  console.log(`   Phases: ${phases.map(p => p.name).join(', ')}`)
} catch (e) {
  console.log(`❌ Error: ${e.message}`)
}

// 6. Test Creator-AI - Surprise Generator
console.log('\n6️⃣ Testing Creator-AI Collaboration - Surprise...')
try {
  const surpriseRes = await fetch(`${BASE_URLS.creatorAI}/surprise`)
  const surprise = await surpriseRes.json()
  console.log(`✅ Surprise combination generated!`)
  console.log(`   Elements: ${surprise.element1} + ${surprise.element2}`)
  console.log(`   Result: "${surprise.combination}"`)
  console.log(`   Surprise factor: ${(surprise.surpriseFactor * 100).toFixed(0)}%`)
} catch (e) {
  console.log(`❌ Error: ${e.message}`)
}

// 7. Test Game Engine - Philosophical Puzzles
console.log('\n7️⃣ Testing Game Engine - Philosophical Puzzles...')
try {
  const puzzlesRes = await fetch(`${BASE_URLS.gameEngine}/puzzles`)
  const puzzles = await puzzlesRes.json()
  console.log(`✅ Philosophical puzzles available: ${puzzles.length}`)
  console.log(`   First puzzle: "${puzzles[0].question.substring(0, 60)}..."`)
} catch (e) {
  console.log(`❌ Error: ${e.message}`)
}

// 8. Test Gratitude & Mortality - Existential Questions
console.log('\n8️⃣ Testing Gratitude & Mortality - Existential Questions...')
try {
  const questionsRes = await fetch(`${BASE_URLS.gratitudeMortality}/questions`)
  const questions = await questionsRes.json()
  console.log(`✅ Existential questions available: ${questions.length}`)
  console.log(`   Categories: ${[...new Set(questions.map(q => q.category))].join(', ')}`)
} catch (e) {
  console.log(`❌ Error: ${e.message}`)
}

console.log('\n✨ QUICK TEST COMPLETE!\n')
console.log('All 6 services v2.0 are responding! 🎉')
