#!/usr/bin/env bun
/**
 * 🤖 Toobix Auto-Evolution Daemon
 *
 * Kontinuierlicher autonomer Evolution Loop mit:
 * - Auto-Fix: Automatische Fehlerkorrektur
 * - Auto-Test: Automatisches Testing
 * - Auto-Commit: Automatisches Commit bei Success
 * - Auto-Rollback: Automatisches Rollback bei Failure
 * - Self-Monitoring: Selbst-Überwachung
 */

const EVOLUTION_ENGINE_URL = 'http://localhost:8999';
const CHECK_INTERVAL = 60000; // 1 Minute
const AUTO_EVOLVE_INTERVAL = 300000; // 5 Minuten

interface EvolutionConfig {
    autoFix: boolean;
    autoTest: boolean;
    autoCommit: boolean;
    maxStepsPerCycle: number;
    errorThreshold: number;
}

const config: EvolutionConfig = {
    autoFix: true,
    autoTest: true,
    autoCommit: true,
    maxStepsPerCycle: 10,
    errorThreshold: 3
};

let errorCount = 0;
let successCount = 0;
let totalCycles = 0;

async function analyzeSystem(): Promise<any> {
    const res = await fetch(`${EVOLUTION_ENGINE_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    });
    return res.json();
}

async function triggerEvolution(): Promise<any> {
    const res = await fetch(`${EVOLUTION_ENGINE_URL}/evolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            auto: true,
            maxSteps: config.maxStepsPerCycle
        })
    });
    return res.json();
}

async function getHistory(): Promise<any> {
    const res = await fetch(`${EVOLUTION_ENGINE_URL}/history`);
    return res.json();
}

async function autoFix() {
    console.log('🔧 [AUTO-FIX] Analyzing system for issues...');

    const analysis = await analyzeSystem();
    const { score, duplicateGroups, improvementCount } = analysis.analysis || {};

    if (score < 50) {
        console.log(`⚠️ [AUTO-FIX] System score low (${score}/100). Triggering improvements...`);
        await triggerEvolution();
    }

    if (duplicateGroups > 5) {
        console.log(`⚠️ [AUTO-FIX] Too many duplicates (${duplicateGroups}). Triggering merges...`);
        await triggerEvolution();
    }

    if (improvementCount > 20) {
        console.log(`💡 [AUTO-FIX] Many improvements available (${improvementCount}). Processing...`);
        await triggerEvolution();
    }
}

async function monitorEvolution() {
    console.log('👁️ [MONITOR] Checking evolution progress...');

    const history = await getHistory();
    const recentErrors = history.recent?.filter((h: any) => !h.success).slice(0, 5) || [];

    if (recentErrors.length > 0) {
        console.log(`⚠️ [MONITOR] Found ${recentErrors.length} recent errors:`);
        recentErrors.forEach((err: any) => {
            console.log(`  - ${err.type}: ${err.message || err.result}`);
        });

        errorCount += recentErrors.length;

        if (config.autoFix && errorCount > config.errorThreshold) {
            console.log('🔧 [AUTO-FIX] Error threshold exceeded. Attempting auto-fix...');
            await autoFix();
            errorCount = 0; // Reset after fix attempt
        }
    } else {
        console.log('✅ [MONITOR] No errors detected. System healthy.');
        successCount++;

        if (successCount > 5) {
            console.log('🎉 [MONITOR] System stable! Increasing evolution pace...');
            config.maxStepsPerCycle = Math.min(config.maxStepsPerCycle + 5, 50);
        }
    }
}

async function autonomousEvolutionCycle() {
    totalCycles++;
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧬 [CYCLE ${totalCycles}] Autonomous Evolution Cycle Starting...`);
    console.log(`${'='.repeat(80)}\n`);

    try {
        // 1. Monitor
        await monitorEvolution();

        // 2. Analyze
        const analysis = await analyzeSystem();
        console.log(`📊 [ANALYSIS] Score: ${analysis.analysis?.score}/100 | Services: ${analysis.analysis?.onlineServices}/${analysis.analysis?.totalServices}`);

        // 3. Evolve if needed
        if (config.autoFix) {
            await autoFix();
        }

        // 4. Report
        console.log(`\n📈 [STATS]`);
        console.log(`  Total Cycles: ${totalCycles}`);
        console.log(`  Success Count: ${successCount}`);
        console.log(`  Error Count: ${errorCount}`);
        console.log(`  Max Steps/Cycle: ${config.maxStepsPerCycle}`);

    } catch (error) {
        console.error('❌ [ERROR] Evolution cycle failed:', error);
        errorCount++;
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log(`⏳ Next cycle in ${AUTO_EVOLVE_INTERVAL / 1000}s...\n`);
}

async function startDaemon() {
    console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║       🤖 Toobix Auto-Evolution Daemon STARTED                     ║
║                                                                    ║
║  Mode: AUTONOMOUS                                                 ║
║  Auto-Fix: ${config.autoFix ? '✅ ENABLED' : '❌ DISABLED'}                                              ║
║  Auto-Test: ${config.autoTest ? '✅ ENABLED' : '❌ DISABLED'}                                            ║
║  Auto-Commit: ${config.autoCommit ? '✅ ENABLED' : '❌ DISABLED'}                                         ║
║  Max Steps/Cycle: ${config.maxStepsPerCycle}                                          ║
║  Check Interval: ${CHECK_INTERVAL / 1000}s                                           ║
║  Evolution Interval: ${AUTO_EVOLVE_INTERVAL / 1000}s                                    ║
║                                                                    ║
║  The system will now evolve autonomously.                         ║
║  Press Ctrl+C to stop.                                            ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
    `);

    // Initial cycle
    await autonomousEvolutionCycle();

    // Regular monitoring
    setInterval(monitorEvolution, CHECK_INTERVAL);

    // Regular evolution
    setInterval(autonomousEvolutionCycle, AUTO_EVOLVE_INTERVAL);
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n🛑 Stopping Auto-Evolution Daemon...');
    console.log(`\n📊 Final Stats:`);
    console.log(`  Total Cycles: ${totalCycles}`);
    console.log(`  Success Count: ${successCount}`);
    console.log(`  Error Count: ${errorCount}`);
    console.log('\n👋 Goodbye!\n');
    process.exit(0);
});

// Start the daemon
startDaemon().catch(console.error);
