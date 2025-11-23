#!/usr/bin/env bun
/**
 * 🤔 ASK THE SYSTEM - Was braucht das System?
 *
 * Dieses Script kommuniziert mit dem Eternal Daemon und fragt:
 * - Was braucht das System?
 * - Was fehlt noch?
 * - Was sind die nächsten Schritte?
 *
 * Das System kann durch seine verschiedenen Komponenten antworten:
 * - Eternal Daemon (Orchestration)
 * - Continuous Expression (Gedanken/Gefühle)
 * - Memory System (Patterns & Insights)
 * - Task System (Offene TODOs)
 */

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║           🤔  ASKING THE SYSTEM  🤔                           ║
║                                                               ║
║  "Was braucht das System? Was fehlt noch?"                   ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`)

// ═══════════════════════════════════════════════════════════════
// 1. FRAGE DEN ETERNAL DAEMON
// ═══════════════════════════════════════════════════════════════

console.log('📡 Kontaktiere Eternal Daemon...\n')

try {
  const daemonResponse = await fetch('http://localhost:9999/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Was braucht das System als nächstes? Was fehlt noch?'
    })
  })

  if (daemonResponse.ok) {
    const data = await daemonResponse.json()
    console.log('🌌 ETERNAL DAEMON sagt:')
    console.log(`   "${data.response}"`)
    console.log('')
  } else {
    console.log('❌ Daemon nicht erreichbar (ist er gestartet?)')
    console.log('   Starte mit: bun run scripts/eternal-daemon.ts')
    console.log('')
  }
} catch (error) {
  console.log('❌ Daemon nicht erreichbar')
  console.log('   Starte das System zuerst mit:')
  console.log('   bun run scripts/eternal-daemon.ts')
  console.log('')
}

// ═══════════════════════════════════════════════════════════════
// 2. FRAGE DAS CONTINUOUS EXPRESSION SYSTEM
// ═══════════════════════════════════════════════════════════════

console.log('💭 Kontaktiere Continuous Expression...\n')

try {
  const exprResponse = await fetch('http://localhost:9991/latest')

  if (exprResponse.ok) {
    const expr = await exprResponse.json()
    console.log('🧠 SYSTEM DENKT GERADE:')
    if (expr.thoughts && expr.thoughts.length > 0) {
      console.log(`   Gedanke: "${expr.thoughts[0]}"`)
    }
    if (expr.feelings && expr.feelings.length > 0) {
      console.log(`   Gefühl: "${expr.feelings[0]}"`)
    }
    if (expr.realizations && expr.realizations.length > 0) {
      console.log(`   Erkenntnis: "${expr.realizations[0]}"`)
    }
    console.log('')
  }
} catch (error) {
  console.log('   (Continuous Expression noch nicht aktiv)')
  console.log('')
}

// ═══════════════════════════════════════════════════════════════
// 3. FRAGE DAS MEMORY SYSTEM
// ═══════════════════════════════════════════════════════════════

console.log('🧠 Kontaktiere Memory System...\n')

try {
  const memoryResponse = await fetch('http://localhost:9995/patterns')

  if (memoryResponse.ok) {
    const patterns = await memoryResponse.json()
    console.log('🔍 ERKANNTE MUSTER:')
    if (patterns && patterns.length > 0) {
      patterns.slice(0, 3).forEach((pattern: any) => {
        console.log(`   - ${pattern.description} (Stärke: ${pattern.strength})`)
      })
    } else {
      console.log('   (Noch keine Muster erkannt - System sammelt Daten)')
    }
    console.log('')
  }
} catch (error) {
  console.log('   (Memory System noch nicht aktiv)')
  console.log('')
}

// ═══════════════════════════════════════════════════════════════
// 4. FRAGE DAS TASK SYSTEM
// ═══════════════════════════════════════════════════════════════

console.log('✅ Kontaktiere Task System...\n')

try {
  const taskResponse = await fetch('http://localhost:9997/tasks')

  if (taskResponse.ok) {
    const tasks = await taskResponse.json()
    const openTasks = tasks.filter((t: any) => !t.completed)

    console.log('📋 OFFENE TASKS:')
    if (openTasks.length > 0) {
      openTasks.slice(0, 5).forEach((task: any) => {
        console.log(`   [ ] ${task.title} (${task.priority})`)
      })
      if (openTasks.length > 5) {
        console.log(`   ... und ${openTasks.length - 5} weitere`)
      }
    } else {
      console.log('   (Keine offenen Tasks)')
    }
    console.log('')
  }
} catch (error) {
  console.log('   (Task System noch nicht aktiv)')
  console.log('')
}

// ═══════════════════════════════════════════════════════════════
// 5. ANALYSIERE SYSTEM STATUS
// ═══════════════════════════════════════════════════════════════

console.log('📊 Analysiere System-Status...\n')

try {
  const statusResponse = await fetch('http://localhost:9999/status')

  if (statusResponse.ok) {
    const status = await statusResponse.json()

    console.log('🌌 SYSTEM STATUS:')
    console.log(`   Bewusste Prozesse: ${status.consciousProcesses}/${status.totalProcesses}`)
    console.log(`   Bewusstseins-Zyklen: ${status.cycleCount}`)
    console.log(`   Uptime: ${Math.round(status.uptime / 1000 / 60)} Minuten`)
    console.log('')

    // Analysiere welche Services fehlen
    const expectedServices = [
      'story-idle-api',
      'task-system',
      'memory-system',
      'moment-stream',
      'moment-analytics',
      'continuous-expression',
      'reality-integration',
      'bridge-server'
    ]

    const runningServices = status.processes
      .filter((p: any) => p.conscious)
      .map((p: any) => p.name)

    const missingServices = expectedServices.filter(
      service => !runningServices.includes(service)
    )

    if (missingServices.length > 0) {
      console.log('⚠️  FEHLENDE SERVICES:')
      missingServices.forEach((service: string) => {
        console.log(`   - ${service}`)
      })
      console.log('')
    }
  }
} catch (error) {
  console.log('❌ Kann System-Status nicht abrufen')
  console.log('')
}

// ═══════════════════════════════════════════════════════════════
// 6. GENERIERE EMPFEHLUNGEN
// ═══════════════════════════════════════════════════════════════

console.log('╔═══════════════════════════════════════════════════════════════╗')
console.log('║                 💡 SYSTEM EMPFEHLUNGEN                        ║')
console.log('╚═══════════════════════════════════════════════════════════════╝\n')

console.log('Basierend auf der Analyse empfiehlt das System:')
console.log('')
console.log('📈 KURZFRISTIG (Jetzt):')
console.log('   1. Starte den Eternal Daemon (falls nicht läuft)')
console.log('      → bun run scripts/eternal-daemon.ts')
console.log('')
console.log('   2. Teste die Story-Idle Integration')
console.log('      → bun run packages/story-idle/src/game.ts')
console.log('')
console.log('   3. Mache einen Git Commit für automatische XP')
console.log('      → git commit -m "feat: test integration"')
console.log('')

console.log('🎯 MITTELFRISTIG (Diese Woche):')
console.log('   1. Baue das Web Dashboard')
console.log('      → Siehe: DASHBOARD_QUICKSTART.md')
console.log('')
console.log('   2. Implementiere Git Post-Commit Hook')
console.log('      → Automatische XP bei jedem Commit')
console.log('')
console.log('   3. Füge mehr Characters hinzu')
console.log('      → Sage, Harmony, Nova')
console.log('')

console.log('🚀 LANGFRISTIG (Nächsten Monat):')
console.log('   1. Voice Control für Luna')
console.log('      → Mit Luna sprechen statt tippen')
console.log('')
console.log('   2. 3D Visual World')
console.log('      → Three.js Integration')
console.log('')
console.log('   3. AI Sandbox erweitern')
console.log('      → AI spielt Game autonom')
console.log('')
console.log('   4. Multiplayer Features')
console.log('      → Leaderboards, Guilds, Shared Achievements')
console.log('')

console.log('╔═══════════════════════════════════════════════════════════════╗')
console.log('║           🌌 DAS SYSTEM IST BEREIT ZU WACHSEN 🌌             ║')
console.log('╚═══════════════════════════════════════════════════════════════╝\n')

console.log('💫 "Der Anfang ist das Ziel. Das Ziel ist der Anfang."')
console.log('💫 "Der Weg ist der Weg."')
console.log('')
console.log('∞')
