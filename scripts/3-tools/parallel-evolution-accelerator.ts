#!/usr/bin/env bun
/**
 * 🚀 PARALLEL EVOLUTION ACCELERATOR
 *
 * Toobix entwickelt sich in 4 parallelen Branches gleichzeitig:
 * - Branch A: Duplikat-Merges (hohe Priorität)
 * - Branch B: Neue Services (mittlere Priorität)
 * - Branch C: Code-Optimierung (niedrige Priorität)
 * - Branch D: Service-Startups (mittlere Priorität)
 *
 * Jeder Branch läuft 1-2 Minuten parallel, dann werden die besten
 * Ergebnisse gemerged und dem User präsentiert.
 */

import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = 8998;
const EVOLUTION_ENGINE = 'http://localhost:8999';
const BRANCH_DURATION = 120000; // 2 Minuten pro Branch

interface EvolutionBranch {
    id: string;
    name: string;
    focus: string;
    startTime: Date;
    status: 'running' | 'completed' | 'failed';
    steps: number;
    score: number;
    changes: string[];
    proposals: any[];
}

interface ParallelEvolutionCycle {
    id: string;
    startTime: Date;
    branches: EvolutionBranch[];
    status: 'running' | 'merging' | 'completed' | 'waiting_approval';
    bestBranch?: string;
    mergedChanges?: string[];
    finalScore?: number;
}

class ParallelEvolutionAccelerator {
    private cycles: ParallelEvolutionCycle[] = [];
    private currentCycle?: ParallelEvolutionCycle;
    private clients = new Set<WebSocket>();

    constructor() {
        this.setupWebSocket();
        this.setupRoutes();
    }

    private setupWebSocket() {
        wss.on('connection', (ws: WebSocket) => {
            console.log('📡 New client connected to Parallel Evolution Dashboard');
            this.clients.add(ws);

            // Send current state
            if (this.currentCycle) {
                ws.send(JSON.stringify({
                    type: 'cycle_update',
                    data: this.currentCycle
                }));
            }

            ws.on('close', () => {
                this.clients.delete(ws);
            });
        });
    }

    private broadcast(data: any) {
        const message = JSON.stringify(data);
        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }

    private setupRoutes() {
        app.use(express.json());

        app.get('/health', (req, res) => {
            res.json({ status: 'online', service: 'parallel-evolution-accelerator' });
        });

        app.get('/current-cycle', (req, res) => {
            res.json(this.currentCycle || { status: 'idle' });
        });

        app.post('/start-cycle', async (req, res) => {
            if (this.currentCycle && this.currentCycle.status === 'running') {
                return res.json({ error: 'Cycle already running' });
            }

            const cycle = await this.startParallelEvolution();
            res.json({ success: true, cycleId: cycle.id });
        });

        app.post('/approve', async (req, res) => {
            const { cycleId, approved } = req.body;

            if (approved) {
                await this.commitMergedChanges(cycleId);
                res.json({ success: true, message: 'Changes committed!' });

                // Auto-start nächster Cycle
                setTimeout(() => this.startParallelEvolution(), 3000);
            } else {
                res.json({ success: true, message: 'Changes rejected' });
            }
        });
    }

    private async startParallelEvolution(): Promise<ParallelEvolutionCycle> {
        const cycleId = `cycle-${Date.now()}`;

        const cycle: ParallelEvolutionCycle = {
            id: cycleId,
            startTime: new Date(),
            status: 'running',
            branches: [
                {
                    id: 'branch-a',
                    name: 'Duplikat-Merges',
                    focus: 'merge',
                    startTime: new Date(),
                    status: 'running',
                    steps: 0,
                    score: 54,
                    changes: [],
                    proposals: []
                },
                {
                    id: 'branch-b',
                    name: 'Neue Services',
                    focus: 'new_service',
                    startTime: new Date(),
                    status: 'running',
                    steps: 0,
                    score: 54,
                    changes: [],
                    proposals: []
                },
                {
                    id: 'branch-c',
                    name: 'Code-Optimierung',
                    focus: 'optimize',
                    startTime: new Date(),
                    status: 'running',
                    steps: 0,
                    score: 54,
                    changes: [],
                    proposals: []
                },
                {
                    id: 'branch-d',
                    name: 'Service-Startups',
                    focus: 'startup',
                    startTime: new Date(),
                    status: 'running',
                    steps: 0,
                    score: 54,
                    changes: [],
                    proposals: []
                }
            ]
        };

        this.currentCycle = cycle;
        this.broadcast({ type: 'cycle_started', data: cycle });

        console.log(`\n${'='.repeat(80)}`);
        console.log(`🚀 PARALLEL EVOLUTION CYCLE STARTED: ${cycleId}`);
        console.log(`${'='.repeat(80)}\n`);

        // Starte alle Branches parallel!
        const branchPromises = cycle.branches.map(branch =>
            this.runEvolutionBranch(branch, cycle)
        );

        // Warte bis alle Branches fertig sind
        await Promise.all(branchPromises);

        // Merge die besten Ergebnisse
        await this.mergeBestResults(cycle);

        return cycle;
    }

    private async runEvolutionBranch(
        branch: EvolutionBranch,
        cycle: ParallelEvolutionCycle
    ): Promise<void> {
        console.log(`\n🌿 Starting ${branch.name} (${branch.focus})`);

        const startTime = Date.now();
        const maxSteps = 10; // Max 10 steps pro Branch

        for (let step = 0; step < maxSteps; step++) {
            // Check if time limit reached
            if (Date.now() - startTime > BRANCH_DURATION) {
                console.log(`⏱️  ${branch.name}: Time limit reached`);
                break;
            }

            try {
                // Analyse
                const analysis = await this.callEvolutionEngine('/analyze');

                // Find improvement basierend auf Branch-Fokus
                const improvement = analysis.improvements?.find((imp: any) =>
                    imp.type === branch.focus
                );

                if (!improvement) {
                    console.log(`⚠️  ${branch.name}: No more ${branch.focus} improvements`);
                    break;
                }

                // Generate code
                console.log(`🔨 ${branch.name} Step ${step + 1}: ${improvement.title}`);

                const proposal = await this.callEvolutionEngine('/propose', {
                    type: branch.focus,
                    improvement
                });

                if (proposal.success) {
                    branch.proposals.push(proposal);
                    branch.changes.push(improvement.title);
                    branch.steps++;
                    branch.score = analysis.analysis?.score || branch.score;

                    // Live-Update an Dashboard
                    this.broadcast({
                        type: 'branch_progress',
                        data: { cycleId: cycle.id, branch }
                    });
                }

                // Kurze Pause zwischen Steps
                await new Promise(resolve => setTimeout(resolve, 5000));

            } catch (error) {
                console.error(`❌ ${branch.name} Step ${step + 1} failed:`, error);
            }
        }

        branch.status = 'completed';
        console.log(`✅ ${branch.name} completed: ${branch.steps} steps, Score: ${branch.score}`);

        this.broadcast({
            type: 'branch_completed',
            data: { cycleId: cycle.id, branch }
        });
    }

    private async mergeBestResults(cycle: ParallelEvolutionCycle): Promise<void> {
        console.log(`\n${'='.repeat(80)}`);
        console.log(`🔀 MERGING BEST RESULTS`);
        console.log(`${'='.repeat(80)}\n`);

        cycle.status = 'merging';
        this.broadcast({ type: 'merging_started', data: cycle });

        // Finde den besten Branch (höchster Score)
        const bestBranch = cycle.branches.reduce((best, current) =>
            current.score > best.score ? current : best
        );

        console.log(`🏆 Best Branch: ${bestBranch.name} (Score: ${bestBranch.score})`);
        console.log(`   Changes: ${bestBranch.changes.join(', ')}`);

        // Sammle alle einzigartigen Änderungen
        const allChanges = new Set<string>();
        cycle.branches.forEach(branch => {
            branch.changes.forEach(change => allChanges.add(change));
        });

        cycle.bestBranch = bestBranch.id;
        cycle.mergedChanges = Array.from(allChanges);
        cycle.finalScore = bestBranch.score;
        cycle.status = 'waiting_approval';

        console.log(`\n📊 MERGE COMPLETE - Waiting for User Approval`);
        console.log(`   Total Changes: ${cycle.mergedChanges.length}`);
        console.log(`   Final Score: ${cycle.finalScore}/100\n`);

        this.broadcast({
            type: 'waiting_approval',
            data: cycle
        });
    }

    private async commitMergedChanges(cycleId: string): Promise<void> {
        const cycle = this.cycles.find(c => c.id === cycleId) || this.currentCycle;
        if (!cycle) return;

        console.log(`\n✅ COMMITTING MERGED CHANGES FOR ${cycleId}`);

        // Commit alle Proposals vom besten Branch
        const bestBranch = cycle.branches.find(b => b.id === cycle.bestBranch);
        if (bestBranch) {
            for (const proposal of bestBranch.proposals) {
                try {
                    await this.callEvolutionEngine('/commit', {
                        approved: true,
                        proposalId: proposal.proposal?.id
                    });
                    console.log(`   ✓ Committed: ${proposal.proposal?.title}`);
                } catch (error) {
                    console.error(`   ✗ Failed to commit:`, error);
                }
            }
        }

        cycle.status = 'completed';
        this.cycles.push(cycle);

        this.broadcast({
            type: 'cycle_completed',
            data: cycle
        });
    }

    private async callEvolutionEngine(endpoint: string, body?: any): Promise<any> {
        const response = await fetch(`${EVOLUTION_ENGINE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : undefined
        });
        return response.json();
    }

    start() {
        server.listen(PORT, () => {
            console.log('\n╔════════════════════════════════════════════════════════════╗');
            console.log('║                                                            ║');
            console.log('║  🚀 PARALLEL EVOLUTION ACCELERATOR                         ║');
            console.log('║                                                            ║');
            console.log('║  Toobix entwickelt sich in 4 Branches parallel:           ║');
            console.log('║  • Branch A: Duplikat-Merges                               ║');
            console.log('║  • Branch B: Neue Services                                 ║');
            console.log('║  • Branch C: Code-Optimierung                              ║');
            console.log('║  • Branch D: Service-Startups                              ║');
            console.log('║                                                            ║');
            console.log(`║  Port: ${PORT}                                              ║`);
            console.log('║  Dashboard: parallel-evolution-dashboard.html              ║');
            console.log('║                                                            ║');
            console.log('╚════════════════════════════════════════════════════════════╝\n');

            console.log('📡 Bereit für parallele Evolution!');
            console.log('   POST /start-cycle - Startet neuen Parallel-Cycle');
            console.log('   POST /approve     - Approved gemergte Änderungen\n');
        });
    }
}

const accelerator = new ParallelEvolutionAccelerator();
accelerator.start();
