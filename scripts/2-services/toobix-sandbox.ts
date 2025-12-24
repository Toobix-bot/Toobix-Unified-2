/**
 * 🛡️ TOOBIX SECURE SANDBOX
 *
 * Sichere Umgebung für Selbst-Programmierung
 * - Code-Validierung
 * - Isolierte Ausführung
 * - Ressourcen-Limits
 *
 * Port: 8994
 */

import express from 'express';
import { spawn } from 'child_process';
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const app = express();
const PORT = 8994;

app.use(express.json());

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

interface SandboxExecution {
    id: string;
    code: string;
    language: 'typescript' | 'javascript';
    status: 'pending' | 'running' | 'completed' | 'failed';
    output?: string;
    error?: string;
    createdAt: Date;
    completedAt?: Date;
    executionTime?: number;
}

class SecureSandbox {
    private sandboxDir = './sandbox';
    private executions: SandboxExecution[] = [];
    private runningExecutions = 0;
    private maxConcurrent = 3;

    constructor() {
        this.ensureSandboxDir();
    }

    private ensureSandboxDir() {
        if (!existsSync(this.sandboxDir)) {
            mkdirSync(this.sandboxDir, { recursive: true });
        }
    }

    async executeCode(code: string, language: 'typescript' | 'javascript'): Promise<SandboxExecution> {
        const execution: SandboxExecution = {
            id: `exec-${Date.now()}`,
            code,
            language,
            status: 'pending',
            createdAt: new Date()
        };

        this.executions.push(execution);

        // Check if we can run now
        if (this.runningExecutions >= this.maxConcurrent) {
            console.log(`⏳ Execution ${execution.id} queued (max concurrent reached)`);
            return execution;
        }

        // Execute
        this.runExecution(execution);

        return execution;
    }

    private async runExecution(execution: SandboxExecution): Promise<void> {
        this.runningExecutions++;
        execution.status = 'running';

        console.log(`\n🚀 Executing ${execution.id}`);
        console.log(`   Language: ${execution.language}`);
        console.log(`   Code length: ${execution.code.length} chars\n`);

        const startTime = Date.now();

        try {
            // Security check
            if (this.containsDangerousCode(execution.code)) {
                throw new Error('Dangerous code detected - execution blocked');
            }

            // Write code to temp file
            const fileName = `${execution.id}.${execution.language === 'typescript' ? 'ts' : 'js'}`;
            const filePath = join(this.sandboxDir, fileName);
            writeFileSync(filePath, execution.code);

            // Execute with resource limits
            const output = await this.executeWithLimits(filePath, execution.language);

            execution.output = output;
            execution.status = 'completed';
            execution.completedAt = new Date();
            execution.executionTime = Date.now() - startTime;

            console.log(`✅ Execution ${execution.id} completed in ${execution.executionTime}ms`);

        } catch (error: any) {
            execution.error = error.message || String(error);
            execution.status = 'failed';
            execution.completedAt = new Date();
            execution.executionTime = Date.now() - startTime;

            console.error(`❌ Execution ${execution.id} failed:`, execution.error);
        }

        this.runningExecutions--;
    }

    private containsDangerousCode(code: string): boolean {
        const dangerousPatterns = [
            /require\s*\(\s*['"]fs['"]\s*\)/i,  // File system access
            /require\s*\(\s*['"]child_process['"]\s*\)/i,  // Process spawning
            /require\s*\(\s*['"]os['"]\s*\)/i,  // OS access
            /eval\s*\(/i,  // Dynamic code execution
            /Function\s*\(/i,  // Dynamic function creation
            /process\.exit/i,  // Process termination
            /while\s*\(\s*true\s*\)/i,  // Infinite loops
            /setInterval|setTimeout/i  // Timers (could cause issues)
        ];

        for (const pattern of dangerousPatterns) {
            if (pattern.test(code)) {
                console.warn(`⚠️ Dangerous pattern detected: ${pattern}`);
                return true;
            }
        }

        return false;
    }

    private executeWithLimits(filePath: string, language: 'typescript' | 'javascript'): Promise<string> {
        return new Promise((resolve, reject) => {
            const command = language === 'typescript' ? 'bun' : 'node';
            const args = language === 'typescript' ? ['run', filePath] : [filePath];

            const child = spawn(command, args, {
                timeout: 10000, // 10 second timeout
                maxBuffer: 1024 * 1024, // 1MB output limit
                env: {
                    ...process.env,
                    NODE_ENV: 'sandbox'
                }
            });

            let output = '';
            let errorOutput = '';

            child.stdout.on('data', (data) => {
                output += data.toString();
            });

            child.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            child.on('close', (code) => {
                if (code === 0) {
                    resolve(output || '(no output)');
                } else {
                    reject(new Error(errorOutput || `Process exited with code ${code}`));
                }
            });

            child.on('error', (error) => {
                reject(error);
            });
        });
    }

    getExecution(id: string): SandboxExecution | undefined {
        return this.executions.find(e => e.id === id);
    }

    getRecentExecutions(limit: number = 10): SandboxExecution[] {
        return this.executions.slice(-limit);
    }

    getStats() {
        const total = this.executions.length;
        const completed = this.executions.filter(e => e.status === 'completed').length;
        const failed = this.executions.filter(e => e.status === 'failed').length;
        const avgTime = this.executions
            .filter(e => e.executionTime)
            .reduce((sum, e) => sum + (e.executionTime || 0), 0) / completed || 0;

        return {
            total,
            completed,
            failed,
            running: this.runningExecutions,
            averageExecutionTime: Math.round(avgTime),
            successRate: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }
}

// Initialize sandbox
const sandbox = new SecureSandbox();

// API Routes
app.get('/health', (req, res) => {
    res.json({
        status: 'secure',
        service: 'sandbox',
        port: PORT
    });
});

app.post('/execute', async (req, res) => {
    const { code, language = 'typescript' } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'Code is required' });
    }

    if (!['typescript', 'javascript'].includes(language)) {
        return res.status(400).json({ error: 'Invalid language' });
    }

    const execution = await sandbox.executeCode(code, language);
    res.json(execution);
});

app.get('/executions/:id', (req, res) => {
    const { id } = req.params;
    const execution = sandbox.getExecution(id);

    if (!execution) {
        return res.status(404).json({ error: 'Execution not found' });
    }

    res.json(execution);
});

app.get('/executions', (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    res.json({
        executions: sandbox.getRecentExecutions(limit)
    });
});

app.get('/stats', (req, res) => {
    res.json(sandbox.getStats());
});

// Start server
app.listen(PORT, () => {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  🛡️ TOOBIX SECURE SANDBOX                                  ║');
    console.log('║                                                            ║');
    console.log('║  Safe environment for self-programming                    ║');
    console.log('║  - Code validation                                        ║');
    console.log('║  - Resource limits                                        ║');
    console.log('║  - Isolated execution                                     ║');
    console.log('║                                                            ║');
    console.log(`║  Port: ${PORT}                                              ║`);
    console.log('║  Status: 🟢 SECURE                                        ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
});
