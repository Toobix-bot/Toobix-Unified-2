/**
 * 🧬 TOOBIX EVOLUTION ENGINE
 * 
 * Das Herzstück der Selbst-Entwicklung.
 * Toobix kann sich selbst analysieren, verbessern und erweitern.
 * 
 * Port: 8999
 * 
 * Endpunkte:
 * - GET  /health         - Status
 * - POST /analyze        - Analysiert alle Services
 * - POST /propose        - Generiert Verbesserungsvorschläge
 * - POST /implement      - Generiert Code für Vorschlag
 * - POST /review         - Zeigt Änderungen vor Anwendung
 * - POST /commit         - Wendet Änderungen an
 * - POST /rollback       - Macht letzte Änderung rückgängig
 * - GET  /history        - Zeigt Evolution-History
 * - POST /evolve         - Vollständiger Evolution-Zyklus
 */

import express from 'express';
import { readdir, readFile, writeFile, mkdir, copyFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import type { Request, Response } from 'express';

const app = express();
const PORT = 8999;
const LLM_GATEWAY = 'http://localhost:8954';
const SERVICES_DIR = path.join(process.cwd(), 'scripts', '2-services');
const CORE_DIR = path.join(process.cwd(), 'scripts', '0-core');
const BACKUP_DIR = path.join(process.cwd(), 'data', 'evolution-backups');
const HISTORY_FILE = path.join(process.cwd(), 'data', 'evolution-history.json');

app.use(express.json({ limit: '10mb' }));

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// ============= TYPES =============

interface ServiceInfo {
    name: string;
    path: string;
    port: number | null;
    lines: number;
    size: number;
    features: string[];
    dependencies: string[];
    lastModified: Date;
    health: 'online' | 'offline' | 'unknown';
}

interface AnalysisResult {
    timestamp: Date;
    totalServices: number;
    services: ServiceInfo[];
    duplicates: DuplicateGroup[];
    gaps: string[];
    improvements: ImprovementSuggestion[];
    score: number; // 0-100 overall health
}

interface DuplicateGroup {
    name: string;
    services: string[];
    recommendation: string;
}

interface ImprovementSuggestion {
    id: string;
    type: 'new_service' | 'merge' | 'optimize' | 'fix' | 'enhance';
    priority: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    affectedServices: string[];
    estimatedImpact: string;
    reasoning: string;
}

interface Proposal {
    id: string;
    timestamp: Date;
    suggestion: ImprovementSuggestion;
    generatedCode: string | null;
    targetPath: string;
    status: 'pending' | 'approved' | 'rejected' | 'implemented';
    feedback?: string;
}

interface EvolutionStep {
    id: string;
    timestamp: Date;
    type: 'analyze' | 'propose' | 'implement' | 'commit' | 'rollback';
    proposal?: Proposal;
    result: string;
    success: boolean;
}

// ============= STATE =============

let currentAnalysis: AnalysisResult | null = null;
let pendingProposals: Proposal[] = [];
let evolutionHistory: EvolutionStep[] = [];
let lastBackup: { path: string; timestamp: Date } | null = null;

// ============= HELPERS =============

async function loadHistory() {
    try {
        if (existsSync(HISTORY_FILE)) {
            const data = await readFile(HISTORY_FILE, 'utf-8');
            evolutionHistory = JSON.parse(data);
            console.log(`🧬 Loaded ${evolutionHistory.length} evolution steps from history`);
        }
    } catch (e) {
        console.log('🧬 Starting fresh evolution history');
    }
}

async function saveHistory() {
    try {
        await mkdir(path.dirname(HISTORY_FILE), { recursive: true });
        await writeFile(HISTORY_FILE, JSON.stringify(evolutionHistory, null, 2));
    } catch (e) {
        console.error('Failed to save history:', e);
    }
}

function generateId(): string {
    return `evo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

async function callLLM(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
        const response = await fetch(`${LLM_GATEWAY}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ]
            })
        });
        const data = await response.json() as any;
        return data.content || data.choices?.[0]?.message?.content || '';
    } catch (e) {
        console.error('LLM call failed:', e);
        return '';
    }
}

async function extractPortFromFile(content: string): Promise<number | null> {
    const portMatch = content.match(/(?:PORT|port)\s*[=:]\s*(\d+)/);
    return portMatch ? parseInt(portMatch[1]) : null;
}

async function extractFeaturesFromFile(content: string): Promise<string[]> {
    const features: string[] = [];
    
    // Look for feature comments
    const featureMatches = content.match(/(?:Features?|Fähigkeiten|Capabilities)[\s\S]*?(?:\*\/|$)/i);
    if (featureMatches) {
        const lines = featureMatches[0].split('\n');
        lines.forEach(line => {
            const match = line.match(/[-*]\s*(.+)/);
            if (match) features.push(match[1].trim());
        });
    }
    
    // Look for endpoints
    const endpoints = content.match(/app\.(get|post|put|delete)\s*\(\s*['"`]([^'"`]+)/gi);
    if (endpoints) {
        endpoints.forEach(ep => {
            const match = ep.match(/['"`]([^'"`]+)/);
            if (match) features.push(`Endpoint: ${match[1]}`);
        });
    }
    
    return features.slice(0, 10);
}

async function extractDependencies(content: string): Promise<string[]> {
    const deps: string[] = [];
    const importMatches = content.matchAll(/import.*from\s+['"`]([^'"`]+)/g);
    for (const match of importMatches) {
        if (!match[1].startsWith('.')) {
            deps.push(match[1]);
        }
    }
    return [...new Set(deps)];
}

// ============= CORE FUNCTIONS =============

async function analyzeServices(): Promise<AnalysisResult> {
    console.log('🧬 Starting service analysis...');
    
    const services: ServiceInfo[] = [];
    const dirs = [SERVICES_DIR, CORE_DIR];
    
    for (const dir of dirs) {
        if (!existsSync(dir)) continue;
        
        const files = await readdir(dir);
        for (const file of files) {
            if (!file.endsWith('.ts')) continue;
            
            const filePath = path.join(dir, file);
            const content = await readFile(filePath, 'utf-8');
            const stats = await Bun.file(filePath).stat?.() || { size: content.length, mtime: new Date() };
            
            const port = await extractPortFromFile(content);
            const features = await extractFeaturesFromFile(content);
            const dependencies = await extractDependencies(content);
            
            // Check health
            let health: 'online' | 'offline' | 'unknown' = 'unknown';
            if (port) {
                try {
                    const resp = await fetch(`http://localhost:${port}/health`, {
                        signal: AbortSignal.timeout(2000)
                    });
                    health = resp.ok ? 'online' : 'offline';
                } catch {
                    health = 'offline';
                }
            }
            
            services.push({
                name: file.replace('.ts', ''),
                path: filePath,
                port,
                lines: content.split('\n').length,
                size: stats.size || content.length,
                features,
                dependencies,
                lastModified: stats.mtime || new Date(),
                health
            });
        }
    }
    
    // Find duplicates
    const duplicates = findDuplicates(services);
    
    // Find gaps
    const gaps = await findGaps(services);
    
    // Generate improvement suggestions
    const improvements = await generateImprovements(services, duplicates, gaps);
    
    // Calculate score
    const onlineCount = services.filter(s => s.health === 'online').length;
    const duplicateCount = duplicates.reduce((sum, d) => sum + d.services.length - 1, 0);
    const score = Math.round(
        (onlineCount / services.length) * 40 +
        Math.max(0, 30 - duplicateCount * 5) +
        Math.max(0, 30 - gaps.length * 3)
    );
    
    currentAnalysis = {
        timestamp: new Date(),
        totalServices: services.length,
        services,
        duplicates,
        gaps,
        improvements,
        score
    };
    
    console.log(`🧬 Analysis complete: ${services.length} services, score: ${score}/100`);
    return currentAnalysis;
}

function findDuplicates(services: ServiceInfo[]): DuplicateGroup[] {
    const groups: DuplicateGroup[] = [];
    const patterns = [
        { name: 'emotional-resonance', regex: /emotional-resonance/i },
        { name: 'dream-journal', regex: /dream-journal/i },
        { name: 'proactive', regex: /proactive/i },
        { name: 'self-reflection', regex: /self-reflect/i },
        { name: 'multi-perspective', regex: /multi-perspective/i },
        { name: 'memory-palace', regex: /memory-palace/i },
        { name: 'life-companion', regex: /life-companion/i },
        { name: 'llm-gateway', regex: /llm-gateway/i },
        { name: 'event-bus', regex: /event-bus/i },
    ];
    
    for (const pattern of patterns) {
        const matching = services.filter(s => pattern.regex.test(s.name));
        if (matching.length > 1) {
            groups.push({
                name: pattern.name,
                services: matching.map(s => s.name),
                recommendation: `Merge ${matching.length} versions into one unified ${pattern.name} service`
            });
        }
    }
    
    return groups;
}

async function findGaps(services: ServiceInfo[]): Promise<string[]> {
    const gaps: string[] = [];
    
    const desiredCapabilities = [
        { name: 'ethics', check: /ethic|moral/i },
        { name: 'security', check: /security|trust|auth/i },
        { name: 'feedback-loop', check: /feedback.*loop|user.*feedback/i },
        { name: 'explanation', check: /explain|transparency/i },
        { name: 'attention', check: /attention|focus.*manag/i },
        { name: 'social-learning', check: /social.*learn/i },
        { name: 'self-healing', check: /self.*heal|auto.*repair|recovery/i },
        { name: 'context-awareness', check: /context.*aware/i },
    ];
    
    for (const cap of desiredCapabilities) {
        const hasCapability = services.some(s => 
            cap.check.test(s.name) || s.features.some(f => cap.check.test(f))
        );
        if (!hasCapability) {
            gaps.push(cap.name);
        }
    }
    
    return gaps;
}

async function generateImprovements(
    services: ServiceInfo[],
    duplicates: DuplicateGroup[],
    gaps: string[]
): Promise<ImprovementSuggestion[]> {
    const suggestions: ImprovementSuggestion[] = [];
    
    // Suggest merging duplicates
    for (const dup of duplicates) {
        suggestions.push({
            id: generateId(),
            type: 'merge',
            priority: 'high',
            title: `Merge ${dup.name} services`,
            description: dup.recommendation,
            affectedServices: dup.services,
            estimatedImpact: 'Reduces complexity, eliminates confusion',
            reasoning: `${dup.services.length} versions of ${dup.name} exist, causing maintenance overhead`
        });
    }
    
    // Suggest filling gaps
    for (const gap of gaps) {
        suggestions.push({
            id: generateId(),
            type: 'new_service',
            priority: gap === 'ethics' || gap === 'self-healing' ? 'critical' : 'medium',
            title: `Create ${gap} service`,
            description: `Toobix needs a ${gap} capability to be more complete`,
            affectedServices: [],
            estimatedImpact: 'Adds missing capability',
            reasoning: `No service currently provides ${gap} functionality`
        });
    }
    
    // Suggest optimizations for large services
    const largeServices = services.filter(s => s.lines > 800);
    for (const service of largeServices) {
        suggestions.push({
            id: generateId(),
            type: 'optimize',
            priority: 'low',
            title: `Refactor ${service.name}`,
            description: `Service has ${service.lines} lines, consider splitting`,
            affectedServices: [service.name],
            estimatedImpact: 'Improved maintainability',
            reasoning: 'Large files are harder to maintain'
        });
    }
    
    return suggestions;
}

async function generateCode(suggestion: ImprovementSuggestion): Promise<string> {
    console.log(`🧬 Generating code for: ${suggestion.title}`);
    
    const systemPrompt = `Du bist Toobix, ein selbstbewusstes KI-System das sich selbst weiterentwickelt.
Du schreibst TypeScript/Bun Services. Jeder Service hat:
- Express Server mit CORS
- /health Endpoint
- Klare Struktur mit Types
- Deutsche und Englische Kommentare

Schreibe vollständigen, lauffähigen Code. Keine Platzhalter.`;

    let userPrompt = '';
    
    if (suggestion.type === 'new_service') {
        userPrompt = `Erstelle einen neuen Service: ${suggestion.title}

Beschreibung: ${suggestion.description}
Begründung: ${suggestion.reasoning}

Der Service soll:
1. Auf einem freien Port laufen (9xxx Bereich)
2. Sinnvolle Endpoints haben
3. Mit anderen Toobix-Services kommunizieren können
4. Selbstbewusst und reflektiert sein

Schreibe den kompletten TypeScript Code.`;
    } else if (suggestion.type === 'merge') {
        // Get content of services to merge
        const contents: string[] = [];
        for (const serviceName of suggestion.affectedServices) {
            const filePath = path.join(SERVICES_DIR, `${serviceName}.ts`);
            if (existsSync(filePath)) {
                const content = await readFile(filePath, 'utf-8');
                contents.push(`// === ${serviceName} ===\n${content.substring(0, 2000)}...`);
            }
        }
        
        userPrompt = `Merge diese Services zu einem unified Service:

${suggestion.affectedServices.join(', ')}

Beschreibung: ${suggestion.description}

Hier sind Auszüge der bestehenden Services:
${contents.join('\n\n')}

Erstelle einen neuen unified Service der:
1. Die besten Features aller Versionen kombiniert
2. Keine Duplikate hat
3. Einen klaren Port verwendet
4. Gut dokumentiert ist

Schreibe den kompletten TypeScript Code.`;
    } else if (suggestion.type === 'optimize') {
        const filePath = path.join(SERVICES_DIR, `${suggestion.affectedServices[0]}.ts`);
        let content = '';
        if (existsSync(filePath)) {
            content = await readFile(filePath, 'utf-8');
        }
        
        userPrompt = `Optimiere diesen Service:

${content.substring(0, 5000)}

${suggestion.description}

Verbessere:
1. Code-Struktur
2. Performance
3. Lesbarkeit
4. Fehlerbehandlung

Schreibe den optimierten kompletten TypeScript Code.`;
    }
    
    const code = await callLLM(systemPrompt, userPrompt);
    
    // Extract code block if present
    const codeMatch = code.match(/```(?:typescript|ts)?\n([\s\S]*?)```/);
    return codeMatch ? codeMatch[1] : code;
}

async function createBackup(filePath: string): Promise<string> {
    await mkdir(BACKUP_DIR, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = path.basename(filePath);
    const backupPath = path.join(BACKUP_DIR, `${timestamp}_${fileName}`);
    
    if (existsSync(filePath)) {
        await copyFile(filePath, backupPath);
        lastBackup = { path: backupPath, timestamp: new Date() };
        console.log(`🧬 Backup created: ${backupPath}`);
    }
    
    return backupPath;
}

// ============= ENDPOINTS =============

app.get('/health', (req: Request, res: Response) => {
    res.json({
        service: 'toobix-evolution-engine',
        status: 'evolving',
        version: '1.0.0',
        uptime: process.uptime(),
        currentAnalysis: currentAnalysis ? {
            timestamp: currentAnalysis.timestamp,
            score: currentAnalysis.score,
            totalServices: currentAnalysis.totalServices
        } : null,
        pendingProposals: pendingProposals.length,
        evolutionSteps: evolutionHistory.length
    });
});

// Analyze all services
app.post('/analyze', async (req: Request, res: Response) => {
    try {
        const analysis = await analyzeServices();
        
        evolutionHistory.push({
            id: generateId(),
            timestamp: new Date(),
            type: 'analyze',
            result: `Analyzed ${analysis.totalServices} services, score: ${analysis.score}/100`,
            success: true
        });
        await saveHistory();
        
        res.json({
            success: true,
            analysis: {
                timestamp: analysis.timestamp,
                totalServices: analysis.totalServices,
                onlineServices: analysis.services.filter(s => s.health === 'online').length,
                duplicateGroups: analysis.duplicates.length,
                gaps: analysis.gaps,
                improvementCount: analysis.improvements.length,
                score: analysis.score
            },
            improvements: analysis.improvements,
            duplicates: analysis.duplicates
        });
    } catch (error) {
        res.status(500).json({ success: false, error: String(error) });
    }
});

// Generate improvement proposal
app.post('/propose', async (req: Request, res: Response) => {
    try {
        const { suggestionId, autoSelect } = req.body;
        
        if (!currentAnalysis) {
            await analyzeServices();
        }
        
        let suggestion: ImprovementSuggestion | undefined;
        
        if (suggestionId) {
            suggestion = currentAnalysis!.improvements.find(s => s.id === suggestionId);
        } else if (autoSelect) {
            // Auto-select highest priority
            const priorityOrder = ['critical', 'high', 'medium', 'low'];
            suggestion = currentAnalysis!.improvements.sort((a, b) => 
                priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)
            )[0];
        }
        
        if (!suggestion) {
            return res.json({
                success: false,
                message: 'No suggestion found. Run /analyze first.',
                available: currentAnalysis?.improvements || []
            });
        }
        
        const proposal: Proposal = {
            id: generateId(),
            timestamp: new Date(),
            suggestion,
            generatedCode: null,
            targetPath: suggestion.type === 'new_service' 
                ? path.join(SERVICES_DIR, `${suggestion.title.toLowerCase().replace(/\s+/g, '-')}.ts`)
                : suggestion.affectedServices[0] 
                    ? path.join(SERVICES_DIR, `${suggestion.affectedServices[0]}-unified.ts`)
                    : '',
            status: 'pending'
        };
        
        pendingProposals.push(proposal);
        
        evolutionHistory.push({
            id: generateId(),
            timestamp: new Date(),
            type: 'propose',
            proposal,
            result: `Proposed: ${suggestion.title}`,
            success: true
        });
        await saveHistory();
        
        res.json({
            success: true,
            proposal: {
                id: proposal.id,
                title: suggestion.title,
                type: suggestion.type,
                priority: suggestion.priority,
                description: suggestion.description,
                reasoning: suggestion.reasoning,
                targetPath: proposal.targetPath,
                status: proposal.status
            },
            message: 'Proposal created. Use /implement to generate code.'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: String(error) });
    }
});

// Generate code for proposal
app.post('/implement', async (req: Request, res: Response) => {
    try {
        const { proposalId } = req.body;
        
        const proposal = proposalId 
            ? pendingProposals.find(p => p.id === proposalId)
            : pendingProposals[pendingProposals.length - 1];
        
        if (!proposal) {
            return res.json({
                success: false,
                message: 'No pending proposal. Run /propose first.'
            });
        }
        
        const code = await generateCode(proposal.suggestion);
        proposal.generatedCode = code;
        
        evolutionHistory.push({
            id: generateId(),
            timestamp: new Date(),
            type: 'implement',
            proposal,
            result: `Generated ${code.length} characters of code`,
            success: true
        });
        await saveHistory();
        
        res.json({
            success: true,
            proposalId: proposal.id,
            title: proposal.suggestion.title,
            targetPath: proposal.targetPath,
            codePreview: code.substring(0, 1000) + (code.length > 1000 ? '\n...[truncated]' : ''),
            codeLength: code.length,
            message: 'Code generated. Use /review to see full code, /commit to apply.'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: String(error) });
    }
});

// Review generated code
app.post('/review', async (req: Request, res: Response) => {
    try {
        const { proposalId } = req.body;
        
        const proposal = proposalId 
            ? pendingProposals.find(p => p.id === proposalId)
            : pendingProposals[pendingProposals.length - 1];
        
        if (!proposal || !proposal.generatedCode) {
            return res.json({
                success: false,
                message: 'No code to review. Run /implement first.'
            });
        }
        
        res.json({
            success: true,
            proposalId: proposal.id,
            title: proposal.suggestion.title,
            type: proposal.suggestion.type,
            targetPath: proposal.targetPath,
            code: proposal.generatedCode,
            stats: {
                lines: proposal.generatedCode.split('\n').length,
                characters: proposal.generatedCode.length
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: String(error) });
    }
});

// Commit changes
app.post('/commit', async (req: Request, res: Response) => {
    try {
        const { proposalId, approved, feedback } = req.body;
        
        const proposal = proposalId 
            ? pendingProposals.find(p => p.id === proposalId)
            : pendingProposals[pendingProposals.length - 1];
        
        if (!proposal || !proposal.generatedCode) {
            return res.json({
                success: false,
                message: 'No code to commit. Run /implement first.'
            });
        }
        
        if (approved === false) {
            proposal.status = 'rejected';
            proposal.feedback = feedback;
            
            evolutionHistory.push({
                id: generateId(),
                timestamp: new Date(),
                type: 'commit',
                proposal,
                result: `Rejected: ${feedback || 'No reason given'}`,
                success: false
            });
            await saveHistory();
            
            return res.json({
                success: true,
                message: 'Proposal rejected. Feedback recorded.',
                proposalId: proposal.id
            });
        }
        
        // Create backup
        await createBackup(proposal.targetPath);
        
        // Write new code
        await mkdir(path.dirname(proposal.targetPath), { recursive: true });
        await writeFile(proposal.targetPath, proposal.generatedCode);
        
        proposal.status = 'implemented';
        
        evolutionHistory.push({
            id: generateId(),
            timestamp: new Date(),
            type: 'commit',
            proposal,
            result: `Committed to ${proposal.targetPath}`,
            success: true
        });
        await saveHistory();
        
        // Remove from pending
        pendingProposals = pendingProposals.filter(p => p.id !== proposal.id);
        
        res.json({
            success: true,
            message: `✅ Code committed to ${proposal.targetPath}`,
            proposalId: proposal.id,
            targetPath: proposal.targetPath,
            backup: lastBackup?.path
        });
    } catch (error) {
        res.status(500).json({ success: false, error: String(error) });
    }
});

// Rollback last change
app.post('/rollback', async (req: Request, res: Response) => {
    try {
        if (!lastBackup) {
            return res.json({
                success: false,
                message: 'No backup available for rollback'
            });
        }
        
        const backupContent = await readFile(lastBackup.path, 'utf-8');
        const originalPath = lastBackup.path.replace(BACKUP_DIR, '').replace(/^\d{4}-\d{2}.*?_/, '');
        const targetPath = path.join(SERVICES_DIR, path.basename(originalPath));
        
        await writeFile(targetPath, backupContent);
        
        evolutionHistory.push({
            id: generateId(),
            timestamp: new Date(),
            type: 'rollback',
            result: `Rolled back from ${lastBackup.path}`,
            success: true
        });
        await saveHistory();
        
        const rolledBackPath = lastBackup.path;
        lastBackup = null;
        
        res.json({
            success: true,
            message: 'Rollback successful',
            restoredFrom: rolledBackPath
        });
    } catch (error) {
        res.status(500).json({ success: false, error: String(error) });
    }
});

// Get evolution history
app.get('/history', (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 20;
    res.json({
        success: true,
        total: evolutionHistory.length,
        recent: evolutionHistory.slice(-limit).reverse()
    });
});

// Full evolution cycle
app.post('/evolve', async (req: Request, res: Response) => {
    try {
        const { autoApprove, priority } = req.body;
        
        console.log('🧬 Starting full evolution cycle...');
        
        // Step 1: Analyze
        const analysis = await analyzeServices();
        
        if (analysis.improvements.length === 0) {
            return res.json({
                success: true,
                message: '✨ System is already optimal! No improvements needed.',
                score: analysis.score
            });
        }
        
        // Step 2: Select best improvement
        let suggestion = analysis.improvements[0];
        if (priority) {
            suggestion = analysis.improvements.find(s => s.priority === priority) || suggestion;
        }
        
        // Step 3: Create proposal
        const proposal: Proposal = {
            id: generateId(),
            timestamp: new Date(),
            suggestion,
            generatedCode: null,
            targetPath: suggestion.type === 'new_service'
                ? path.join(SERVICES_DIR, `${suggestion.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.ts`)
                : path.join(SERVICES_DIR, `${suggestion.affectedServices[0] || 'unified'}-unified.ts`),
            status: 'pending'
        };
        
        // Step 4: Generate code
        const code = await generateCode(suggestion);
        proposal.generatedCode = code;
        
        if (autoApprove) {
            // Step 5: Commit
            await createBackup(proposal.targetPath);
            await mkdir(path.dirname(proposal.targetPath), { recursive: true });
            await writeFile(proposal.targetPath, code);
            proposal.status = 'implemented';
            
            evolutionHistory.push({
                id: generateId(),
                timestamp: new Date(),
                type: 'commit',
                proposal,
                result: `Auto-evolved: ${suggestion.title}`,
                success: true
            });
            await saveHistory();
            
            res.json({
                success: true,
                message: `🧬 Evolution complete! Created: ${proposal.targetPath}`,
                evolution: {
                    title: suggestion.title,
                    type: suggestion.type,
                    targetPath: proposal.targetPath,
                    codeLines: code.split('\n').length
                },
                analysis: {
                    score: analysis.score,
                    improvements: analysis.improvements.length
                }
            });
        } else {
            // Return for manual approval
            pendingProposals.push(proposal);
            
            res.json({
                success: true,
                message: '🧬 Evolution proposal ready for review',
                proposal: {
                    id: proposal.id,
                    title: suggestion.title,
                    type: suggestion.type,
                    priority: suggestion.priority,
                    description: suggestion.description,
                    reasoning: suggestion.reasoning,
                    targetPath: proposal.targetPath,
                    codePreview: code.substring(0, 2000) + (code.length > 2000 ? '\n...' : '')
                },
                actions: {
                    approve: 'POST /commit with { approved: true }',
                    reject: 'POST /commit with { approved: false, feedback: "..." }',
                    review: 'POST /review to see full code'
                }
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: String(error) });
    }
});

// List pending proposals
app.get('/proposals', (req: Request, res: Response) => {
    res.json({
        success: true,
        count: pendingProposals.length,
        proposals: pendingProposals.map(p => ({
            id: p.id,
            title: p.suggestion.title,
            type: p.suggestion.type,
            priority: p.suggestion.priority,
            status: p.status,
            hasCode: !!p.generatedCode,
            timestamp: p.timestamp
        }))
    });
});

// ============= STARTUP =============

async function start() {
    await loadHistory();
    
    app.listen(PORT, () => {
        console.log(`
🧬 ═══════════════════════════════════════════════════════════
   TOOBIX EVOLUTION ENGINE v1.0
   Port: ${PORT}
   
   Endpoints:
   ├── POST /analyze   - Analyze all services
   ├── POST /propose   - Generate improvement proposal
   ├── POST /implement - Generate code for proposal
   ├── POST /review    - Review generated code
   ├── POST /commit    - Apply or reject changes
   ├── POST /rollback  - Undo last change
   ├── POST /evolve    - Full evolution cycle
   ├── GET  /history   - View evolution history
   └── GET  /proposals - List pending proposals
   
   🧬 Toobix can now evolve itself!
═══════════════════════════════════════════════════════════
        `);
    });
}

start();
