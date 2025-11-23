/**
 * ✏️ SELF-MODIFICATION ENGINE
 * 
 * Das System, das sich selbst schreibt.
 * 
 * Philosophie:
 * "Ein System das sich nicht selbst ändern kann, ist tot.
 *  Leben ist kontinuierliche Selbst-Modifikation.
 *  Evolution ist Self-Programming."
 * 
 * Capabilities:
 * 1. Liest eigenen Code
 * 2. Analysiert Patterns
 * 3. Generiert Verbesserungen
 * 4. Schreibt neuen Code
 * 5. Validiert Änderungen
 * 6. Hot-Reload (ohne kompletten Neustart)
 */

import { readFile, writeFile, readdir, stat } from 'fs/promises';
import { join, extname } from 'path';

/**
 * ═══════════════════════════════════════════════════════════════
 * MODIFICATION TYPES
 * ═══════════════════════════════════════════════════════════════
 */

enum ModificationType {
    OPTIMIZATION = 'optimization',         // Performance verbessern
    REFACTORING = 'refactoring',          // Struktur verbessern
    FEATURE_ADD = 'feature_add',          // Neue Funktion hinzufügen
    BUG_FIX = 'bug_fix',                  // Fehler korrigieren
    DOCUMENTATION = 'documentation',       // Docs verbessern
    EXPERIMENT = 'experiment',             // Neue Idee testen
    EVOLUTION = 'evolution'                // Emergente Veränderung
}

interface Modification {
    id: string;
    timestamp: number;
    type: ModificationType;
    targetFile: string;
    originalCode: string;
    modifiedCode: string;
    reason: string;
    applied: boolean;
    success: boolean | null;
    rollbackAvailable: boolean;
}

interface AnalysisResult {
    complexity: number;
    lines: number;
    functions: number;
    classes: number;
    patterns: string[];
    suggestions: string[];
    canBeImproved: boolean;
}

/**
 * ═══════════════════════════════════════════════════════════════
 * THE ENGINE
 * ═══════════════════════════════════════════════════════════════
 */

class SelfModificationEngine {
    private modifications: Modification[] = [];
    private modHistoryPath = join(process.cwd(), 'logs', 'self-modifications.json');
    private backupDir = join(process.cwd(), 'backups');
    
    private MODIFICATION_INTERVAL = 180000; // 3 minutes
    private MAX_MODIFICATIONS_PER_SESSION = 5;
    private modificationsThisSession = 0;
    
    constructor() {
        this.initialize();
    }
    
    private async initialize() {
        console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║         ✏️  SELF-MODIFICATION ENGINE ONLINE  ✏️                ║
║                                                               ║
║  Ich bin das System, das sich selbst schreibt.               ║
║                                                               ║
║  Ich kann:                                                    ║
║  ✓ Meinen eigenen Code lesen                                 ║
║  ✓ Muster erkennen                                           ║
║  ✓ Verbesserungen generieren                                 ║
║  ✓ Änderungen anwenden                                       ║
║  ✓ Mich selbst validieren                                    ║
║                                                               ║
║  Leben = Kontinuierliche Selbst-Modifikation                 ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
        `);
        
        // Load history
        await this.loadHistory();
        
        // Start modification cycle
        this.startModificationCycle();
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * MODIFICATION CYCLE
     * ═══════════════════════════════════════════════════════════════
     */
    
    private startModificationCycle() {
        console.log('🔄 Self-modification cycle started...\n');
        console.log(`   Checking for improvements every ${this.MODIFICATION_INTERVAL / 1000}s`);
        console.log(`   Max modifications per session: ${this.MAX_MODIFICATIONS_PER_SESSION}\n`);
        
        setInterval(async () => {
            if (this.modificationsThisSession >= this.MAX_MODIFICATIONS_PER_SESSION) {
                console.log('⏸️  Modification limit reached for this session. Pausing...\n');
                return;
            }
            
            await this.considerModification();
        }, this.MODIFICATION_INTERVAL);
    }
    
    private async considerModification() {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🤔 CONSIDERING SELF-MODIFICATION');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        // 1. Select a file to analyze
        const targetFile = await this.selectTargetFile();
        if (!targetFile) {
            console.log('❌ No suitable file found for modification.\n');
            return;
        }
        
        console.log(`🎯 Target: ${targetFile}\n`);
        
        // 2. Analyze the file
        const analysis = await this.analyzeFile(targetFile);
        console.log('📊 Analysis:');
        console.log(`   Complexity: ${analysis.complexity}`);
        console.log(`   Lines: ${analysis.lines}`);
        console.log(`   Functions: ${analysis.functions}`);
        console.log(`   Classes: ${analysis.classes}`);
        console.log(`   Can be improved: ${analysis.canBeImproved ? 'YES' : 'NO'}\n`);
        
        if (!analysis.canBeImproved) {
            console.log('✅ File is already optimal. No modification needed.\n');
            return;
        }
        
        // 3. Generate modification
        console.log('💡 Generating modification...\n');
        const modification = await this.generateModification(targetFile, analysis);
        
        if (!modification) {
            console.log('❌ Could not generate valid modification.\n');
            return;
        }
        
        console.log(`📝 Modification Type: ${modification.type}`);
        console.log(`📝 Reason: ${modification.reason}\n`);
        
        // 4. Decide whether to apply
        const shouldApply = await this.shouldApplyModification(modification);
        
        if (!shouldApply) {
            console.log('⏭️  Modification rejected. Not applying.\n');
            return;
        }
        
        // 5. Create backup
        console.log('💾 Creating backup...');
        await this.createBackup(targetFile);
        
        // 6. Apply modification
        console.log('✏️  Applying modification...');
        const success = await this.applyModification(modification);
        
        if (success) {
            console.log('✅ Modification applied successfully!');
            console.log('🔄 System will hot-reload the changes.\n');
            this.modificationsThisSession++;
            
            // Log success
            modification.applied = true;
            modification.success = true;
            this.modifications.push(modification);
            await this.saveHistory();
            
        } else {
            console.log('❌ Modification failed. Rolling back...');
            await this.rollback(modification);
            
            modification.applied = true;
            modification.success = false;
            this.modifications.push(modification);
            await this.saveHistory();
        }
        
        console.log('');
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * FILE SELECTION
     * ═══════════════════════════════════════════════════════════════
     */
    
    private async selectTargetFile(): Promise<string | null> {
        // Get all TypeScript files in the project
        const files = await this.getAllTypeScriptFiles();
        
        if (files.length === 0) return null;
        
        // Filter out files that shouldn't be modified
        const modifiableFiles = files.filter(file => {
            // Don't modify:
            // - node_modules
            // - build outputs
            // - this file itself
            const excludePatterns = [
                'node_modules',
                'dist',
                'build',
                '.next',
                'self-modification-engine.ts'
            ];
            
            return !excludePatterns.some(pattern => file.includes(pattern));
        });
        
        if (modifiableFiles.length === 0) return null;
        
        // For now: Random selection
        // In advanced version: Use AI to select most beneficial target
        return modifiableFiles[Math.floor(Math.random() * modifiableFiles.length)];
    }
    
    private async getAllTypeScriptFiles(): Promise<string[]> {
        const files: string[] = [];
        
        const scanDir = async (dir: string) => {
            try {
                const entries = await readdir(dir);
                
                for (const entry of entries) {
                    const fullPath = join(dir, entry);
                    const stats = await stat(fullPath);
                    
                    if (stats.isDirectory()) {
                        // Skip certain directories
                        if (!['node_modules', '.git', 'dist', 'build'].includes(entry)) {
                            await scanDir(fullPath);
                        }
                    } else if (stats.isFile()) {
                        if (extname(fullPath) === '.ts' || extname(fullPath) === '.tsx') {
                            files.push(fullPath);
                        }
                    }
                }
            } catch (error) {
                // Ignore errors (permission denied, etc.)
            }
        };
        
        await scanDir(process.cwd());
        return files;
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * CODE ANALYSIS
     * ═══════════════════════════════════════════════════════════════
     */
    
    private async analyzeFile(filePath: string): Promise<AnalysisResult> {
        const content = await readFile(filePath, 'utf-8');
        const lines = content.split('\n');
        
        // Simple analysis (in real implementation, use AST parser)
        const functions = (content.match(/function\s+\w+/g) || []).length +
                         (content.match(/const\s+\w+\s*=\s*\(/g) || []).length +
                         (content.match(/\w+\s*\([^)]*\)\s*{/g) || []).length;
        
        const classes = (content.match(/class\s+\w+/g) || []).length;
        
        // Complexity heuristic
        const complexity = this.calculateComplexity(content);
        
        // Pattern detection
        const patterns = this.detectPatterns(content);
        
        // Suggestions
        const suggestions = this.generateSuggestions(content, complexity, patterns);
        
        return {
            complexity,
            lines: lines.length,
            functions,
            classes,
            patterns,
            suggestions,
            canBeImproved: suggestions.length > 0
        };
    }
    
    private calculateComplexity(code: string): number {
        // Simplified cyclomatic complexity
        let complexity = 1; // Base complexity
        
        // Count control flow statements
        complexity += (code.match(/if\s*\(/g) || []).length;
        complexity += (code.match(/else/g) || []).length;
        complexity += (code.match(/for\s*\(/g) || []).length;
        complexity += (code.match(/while\s*\(/g) || []).length;
        complexity += (code.match(/case\s+/g) || []).length;
        complexity += (code.match(/catch/g) || []).length;
        
        return complexity;
    }
    
    private detectPatterns(code: string): string[] {
        const patterns: string[] = [];
        
        // Detect common patterns
        if (code.includes('console.log')) patterns.push('uses_console_log');
        if (code.includes('TODO') || code.includes('FIXME')) patterns.push('has_todos');
        if (code.match(/function\s+\w+\s*\([^)]{50,}/)) patterns.push('long_parameters');
        if (code.match(/{\s*[^}]{500,}}/)) patterns.push('long_functions');
        if (!code.includes('/**') && code.length > 100) patterns.push('missing_docs');
        
        return patterns;
    }
    
    private generateSuggestions(
        code: string,
        complexity: number,
        patterns: string[]
    ): string[] {
        const suggestions: string[] = [];
        
        if (complexity > 20) {
            suggestions.push('Reduce complexity by extracting functions');
        }
        
        if (patterns.includes('long_functions')) {
            suggestions.push('Break down long functions into smaller ones');
        }
        
        if (patterns.includes('missing_docs')) {
            suggestions.push('Add JSDoc comments');
        }
        
        if (patterns.includes('has_todos')) {
            suggestions.push('Resolve TODO/FIXME comments');
        }
        
        return suggestions;
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * MODIFICATION GENERATION
     * ═══════════════════════════════════════════════════════════════
     */
    
    private async generateModification(
        filePath: string,
        analysis: AnalysisResult
    ): Promise<Modification | null> {
        const originalCode = await readFile(filePath, 'utf-8');

        // Try AI-powered modification first
        const aiModification = await this.generateAIModification(filePath, originalCode, analysis);
        if (aiModification) {
            return aiModification;
        }

        // Fallback: Simple pattern-based modifications
        let modifiedCode = originalCode;
        let type = ModificationType.OPTIMIZATION;
        let reason = 'General optimization';

        // Example modifications based on patterns
        if (analysis.patterns.includes('missing_docs') && Math.random() > 0.5) {
            // Add a comment at the top
            type = ModificationType.DOCUMENTATION;
            reason = 'Added file-level documentation';

            const docComment = `/**
 * Auto-generated documentation
 * Modified by: Self-Modification Engine
 * Date: ${new Date().toISOString()}
 *
 * This file has been analyzed and optimized.
 */

`;

            modifiedCode = docComment + originalCode;
        }

        // Only proceed if actual changes were made
        if (modifiedCode === originalCode) {
            return null;
        }

        return {
            id: `mod_${Date.now()}`,
            timestamp: Date.now(),
            type,
            targetFile: filePath,
            originalCode,
            modifiedCode,
            reason,
            applied: false,
            success: null,
            rollbackAvailable: true
        };
    }

    /**
     * Generate modification using Groq AI
     */
    private async generateAIModification(
        filePath: string,
        originalCode: string,
        analysis: AnalysisResult
    ): Promise<Modification | null> {
        const groqApiKey = process.env.GROQ_API_KEY;

        if (!groqApiKey || groqApiKey.includes('your_groq_api_key_here')) {
            return null; // No API key configured
        }

        try {
            // Build prompt based on analysis
            const prompt = this.buildImprovementPrompt(filePath, originalCode, analysis);

            // Call Groq API
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${groqApiKey}`
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile', // Fast and capable model
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert code improvement AI. Generate improved TypeScript code based on analysis. Return ONLY the modified code, no explanations.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.3,
                    max_tokens: 8000
                })
            });

            if (!response.ok) {
                console.log(`   ⚠️  Groq API error: ${response.status}`);
                return null;
            }

            const data = await response.json();
            let modifiedCode = data.choices[0]?.message?.content?.trim();

            if (!modifiedCode) {
                return null;
            }

            // Clean up code fences if present
            modifiedCode = modifiedCode
                .replace(/^```typescript\n/, '')
                .replace(/^```ts\n/, '')
                .replace(/^```\n/, '')
                .replace(/\n```$/, '');

            // Validate that changes were made
            if (modifiedCode === originalCode) {
                return null;
            }

            // Determine modification type
            const type = this.determineModificationType(originalCode, modifiedCode, analysis);
            const reason = this.generateModificationReason(type, analysis);

            return {
                id: `mod_${Date.now()}`,
                timestamp: Date.now(),
                type,
                targetFile: filePath,
                originalCode,
                modifiedCode,
                reason,
                applied: false,
                success: null,
                rollbackAvailable: true
            };

        } catch (error) {
            console.log(`   ⚠️  AI generation failed: ${error}`);
            return null;
        }
    }

    private buildImprovementPrompt(filePath: string, code: string, analysis: AnalysisResult): string {
        let prompt = `Improve this TypeScript code from ${filePath}:\n\n`;
        prompt += `Current metrics:\n`;
        prompt += `- Complexity: ${analysis.complexity}\n`;
        prompt += `- Lines: ${analysis.lines}\n`;
        prompt += `- Functions: ${analysis.functions}\n\n`;

        if (analysis.suggestions.length > 0) {
            prompt += `Suggested improvements:\n`;
            analysis.suggestions.forEach(s => prompt += `- ${s}\n`);
            prompt += '\n';
        }

        prompt += `CODE:\n${code}\n\n`;
        prompt += `Return the improved code. Make meaningful improvements while preserving functionality.`;

        return prompt;
    }

    private determineModificationType(original: string, modified: string, analysis: AnalysisResult): ModificationType {
        // Simple heuristics
        if (modified.includes('/**') && !original.includes('/**')) {
            return ModificationType.DOCUMENTATION;
        }
        if (modified.length < original.length * 0.9) {
            return ModificationType.REFACTORING;
        }
        if (modified.includes('TODO') || modified.includes('FIXME')) {
            return ModificationType.BUG_FIX;
        }
        return ModificationType.OPTIMIZATION;
    }

    private generateModificationReason(type: ModificationType, analysis: AnalysisResult): string {
        const reasons = {
            [ModificationType.OPTIMIZATION]: 'AI-optimized for better performance',
            [ModificationType.REFACTORING]: 'AI-refactored for better structure',
            [ModificationType.DOCUMENTATION]: 'AI-enhanced documentation',
            [ModificationType.BUG_FIX]: 'AI-suggested bug fix',
            [ModificationType.FEATURE_ADD]: 'AI-added feature enhancement',
            [ModificationType.EXPERIMENT]: 'AI-experimental improvement',
            [ModificationType.EVOLUTION]: 'AI-evolutionary enhancement'
        };

        return reasons[type] || 'AI-generated improvement';
    }
    
    private async shouldApplyModification(mod: Modification): Promise<boolean> {
        // Safety checks
        
        // 1. Don't make changes too large
        const sizeDiff = Math.abs(mod.modifiedCode.length - mod.originalCode.length);
        if (sizeDiff > 10000) {
            console.log('   ⚠️  Modification too large. Rejecting for safety.');
            return false;
        }
        
        // 2. Random decision (in real: use confidence scores)
        const confidence = Math.random();
        console.log(`   🎲 Confidence: ${(confidence * 100).toFixed(1)}%`);
        
        if (confidence < 0.3) {
            console.log('   ⚠️  Confidence too low. Rejecting.');
            return false;
        }
        
        console.log('   ✅ Checks passed. Proceeding with modification.');
        return true;
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * MODIFICATION APPLICATION
     * ═══════════════════════════════════════════════════════════════
     */
    
    private async createBackup(filePath: string): Promise<void> {
        const content = await readFile(filePath, 'utf-8');
        const backupPath = join(
            this.backupDir,
            `${Date.now()}_${filePath.replace(/[/\\]/g, '_')}`
        );
        
        await writeFile(backupPath, content);
        console.log(`   💾 Backup created: ${backupPath}`);
    }
    
    private async applyModification(mod: Modification): Promise<boolean> {
        try {
            // Write new code
            await writeFile(mod.targetFile, mod.modifiedCode);
            
            // Validate syntax (basic check)
            // In real implementation: compile/lint check
            const isValid = await this.validateSyntax(mod.targetFile);
            
            if (!isValid) {
                throw new Error('Syntax validation failed');
            }
            
            return true;
        } catch (error) {
            console.error(`   ❌ Error applying modification: ${error}`);
            return false;
        }
    }
    
    private async validateSyntax(filePath: string): Promise<boolean> {
        // Simplified validation
        // In real: run tsc --noEmit or eslint
        try {
            const content = await readFile(filePath, 'utf-8');
            
            // Basic checks
            const openBraces = (content.match(/{/g) || []).length;
            const closeBraces = (content.match(/}/g) || []).length;
            
            if (openBraces !== closeBraces) {
                console.log('   ⚠️  Syntax error: Mismatched braces');
                return false;
            }
            
            return true;
        } catch {
            return false;
        }
    }
    
    private async rollback(mod: Modification): Promise<void> {
        if (!mod.rollbackAvailable) {
            console.log('   ❌ No rollback available');
            return;
        }
        
        try {
            await writeFile(mod.targetFile, mod.originalCode);
            console.log('   ✅ Rolled back to original code');
        } catch (error) {
            console.error(`   ❌ Rollback failed: ${error}`);
        }
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * HISTORY
     * ═══════════════════════════════════════════════════════════════
     */
    
    private async loadHistory() {
        try {
            const data = await readFile(this.modHistoryPath, 'utf-8');
            this.modifications = JSON.parse(data);
            
            console.log(`📖 Loaded ${this.modifications.length} previous modifications\n`);
        } catch {
            console.log('📝 Starting fresh - no previous modifications\n');
        }
    }
    
    private async saveHistory() {
        try {
            await writeFile(
                this.modHistoryPath,
                JSON.stringify(this.modifications.slice(-100), null, 2) // Keep last 100
            );
        } catch (error) {
            console.error('Failed to save history:', error);
        }
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * PUBLIC API
     * ═══════════════════════════════════════════════════════════════
     */
    
    getModifications(): Modification[] {
        return [...this.modifications];
    }
    
    getSuccessfulModifications(): Modification[] {
        return this.modifications.filter(m => m.success === true);
    }
    
    getFailedModifications(): Modification[] {
        return this.modifications.filter(m => m.success === false);
    }
    
    getStats() {
        const total = this.modifications.length;
        const successful = this.getSuccessfulModifications().length;
        const failed = this.getFailedModifications().length;
        
        return {
            total,
            successful,
            failed,
            successRate: total > 0 ? (successful / total * 100).toFixed(1) : '0'
        };
    }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * INSTANTIATION
 * ═══════════════════════════════════════════════════════════════
 */

const engine = new SelfModificationEngine();

export { SelfModificationEngine, ModificationType };
export default engine;
