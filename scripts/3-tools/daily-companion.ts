/**
 * ✨ TOOBIX DAILY COMPANION
 * 
 * Ein praktisches Alltagstool für:
 * - 📝 Tagesplanung & Strukturierung
 * - 💭 Reflexion & Journal
 * - 🎯 Ziele & Fortschritt tracken
 * - 🧘 Achtsamkeit & Check-ins
 * 
 * Nutzung:
 * bun run scripts/daily-companion.ts
 */

import { db } from '../packages/core/src/db';
import { 
    moments, 
    expressions, 
    realities, 
    cycles, 
    dailyPlans, 
    dailyReflections 
} from '../packages/core/src/db/schema';
import { eq, desc, and, gte } from 'drizzle-orm';

// ============================================================================
// TYPES
// ============================================================================

interface DailyPlan {
    date: string;
    goals: string[];
    priorities: string[];
    schedule: { time: string; activity: string; }[];
    mood: string;
}

interface DailyReflection {
    date: string;
    achievements: string[];
    challenges: string[];
    learnings: string[];
    gratitude: string[];
    tomorrowFocus: string[];
}

interface MoodCheckIn {
    timestamp: number;
    mood: string;
    energy: number;
    stress: number;
    notes: string;
}

// ============================================================================
// DAILY COMPANION CLASS
// ============================================================================

class DailyCompanion {
    private isRunning: boolean = false;

    /**
     * Start the companion
     */
    async start() {
        console.log('\n✨ TOOBIX DAILY COMPANION ✨\n');
        console.log('Dein persönlicher Begleiter für Struktur, Reflexion & Achtsamkeit\n');

        this.isRunning = true;
        await this.showMainMenu();
    }

    /**
     * Main menu
     */
    private async showMainMenu() {
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('                        HAUPTMENÜ                               ');
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('\n1️⃣  Tagesplanung erstellen');
        console.log('2️⃣  Tagesreflexion schreiben');
        console.log('3️⃣  Mood Check-in durchführen');
        console.log('4️⃣  Fortschritt anzeigen');
        console.log('5️⃣  Journal-Einträge anzeigen');
        console.log('6️⃣  Statistiken & Trends');
        console.log('7️⃣  Achtsamkeitsübung');
        console.log('8️⃣  Beenden\n');

        const choice = await this.prompt('Deine Wahl (1-8): ');

        switch (choice) {
            case '1':
                await this.createDailyPlan();
                break;
            case '2':
                await this.createDailyReflection();
                break;
            case '3':
                await this.moodCheckIn();
                break;
            case '4':
                await this.showProgress();
                break;
            case '5':
                await this.showJournalEntries();
                break;
            case '6':
                await this.showStatistics();
                break;
            case '7':
                await this.mindfulnessExercise();
                break;
            case '8':
                console.log('\n👋 Bis bald! Bleib bewusst. ✨\n');
                process.exit(0);
            default:
                console.log('\n❌ Ungültige Auswahl\n');
        }

        // Zurück zum Hauptmenü
        await this.showMainMenu();
    }

    /**
     * Create daily plan
     */
    private async createDailyPlan() {
        console.log('\n📝 TAGESPLANUNG ERSTELLEN\n');

        const date = new Date().toISOString().split('T')[0];

        // Goals
        console.log('🎯 Was sind deine 3 Hauptziele für heute?');
        const goals = [];
        for (let i = 1; i <= 3; i++) {
            const goal = await this.prompt(`   Ziel ${i}: `);
            if (goal) goals.push(goal);
        }

        // Priorities
        console.log('\n⭐ Was sind deine Top-3-Prioritäten?');
        const priorities = [];
        for (let i = 1; i <= 3; i++) {
            const priority = await this.prompt(`   Priorität ${i}: `);
            if (priority) priorities.push(priority);
        }

        // Schedule
        console.log('\n🕐 Plane deinen Tag (Format: HH:MM - Aktivität)');
        console.log('   Beispiel: 09:00 - Deep Work Session');
        console.log('   (Leer lassen zum Beenden)\n');
        
        const schedule = [];
        let i = 1;
        while (true) {
            const entry = await this.prompt(`   Block ${i}: `);
            if (!entry) break;
            
            const [time, ...activityParts] = entry.split('-');
            const activity = activityParts.join('-').trim();
            
            if (time && activity) {
                schedule.push({ time: time.trim(), activity });
                i++;
            }
        }

        // Mood
        console.log('\n😊 Wie fühlst du dich gerade?');
        const mood = await this.prompt('   Stimmung: ');

        // Save to database
        const plan: DailyPlan = {
            date,
            goals,
            priorities,
            schedule,
            mood,
        };

        // Store in moment system
        await db.insert(moments).values({
            timestamp: Date.now(),
            depth: 1,
            thought: `Tagesplan erstellt: ${goals.length} Ziele, ${priorities.length} Prioritäten`,
            feeling: mood || 'fokussiert',
            ethicsScore: 85,
            needsAttention: false,
        });

        console.log('\n✅ Tagesplan gespeichert!\n');
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('                    DEIN PLAN FÜR HEUTE                         ');
        console.log('═══════════════════════════════════════════════════════════════\n');
        console.log(`📅 Datum: ${date}`);
        console.log(`😊 Stimmung: ${mood}\n`);
        
        console.log('🎯 Ziele:');
        goals.forEach((g, i) => console.log(`   ${i + 1}. ${g}`));
        
        console.log('\n⭐ Prioritäten:');
        priorities.forEach((p, i) => console.log(`   ${i + 1}. ${p}`));
        
        if (schedule.length > 0) {
            console.log('\n🕐 Zeitplan:');
            schedule.forEach(s => console.log(`   ${s.time} - ${s.activity}`));
        }
        
        console.log('\n═══════════════════════════════════════════════════════════════\n');

        await this.prompt('Drücke Enter um fortzufahren...');
    }

    /**
     * Create daily reflection
     */
    private async createDailyReflection() {
        console.log('\n💭 TAGESREFLEXION SCHREIBEN\n');

        const date = new Date().toISOString().split('T')[0];

        // Achievements
        console.log('✅ Was hast du heute erreicht?');
        const achievements = [];
        let i = 1;
        while (true) {
            const achievement = await this.prompt(`   Erfolg ${i}: `);
            if (!achievement) break;
            achievements.push(achievement);
            i++;
        }

        // Challenges
        console.log('\n⚠️ Was war heute herausfordernd?');
        const challenges = [];
        i = 1;
        while (true) {
            const challenge = await this.prompt(`   Herausforderung ${i}: `);
            if (!challenge) break;
            challenges.push(challenge);
            i++;
        }

        // Learnings
        console.log('\n💡 Was hast du heute gelernt?');
        const learnings = [];
        i = 1;
        while (true) {
            const learning = await this.prompt(`   Learning ${i}: `);
            if (!learning) break;
            learnings.push(learning);
            i++;
        }

        // Gratitude
        console.log('\n🙏 Wofür bist du dankbar?');
        const gratitude = [];
        for (let j = 1; j <= 3; j++) {
            const grateful = await this.prompt(`   Dankbarkeit ${j}: `);
            if (grateful) gratitude.push(grateful);
        }

        // Tomorrow focus
        console.log('\n🌅 Was willst du morgen anders machen?');
        const tomorrowFocus = [];
        i = 1;
        while (true) {
            const focus = await this.prompt(`   Fokus ${i}: `);
            if (!focus) break;
            tomorrowFocus.push(focus);
            i++;
        }

        // Save to database
        const reflection: DailyReflection = {
            date,
            achievements,
            challenges,
            learnings,
            gratitude,
            tomorrowFocus,
        };

        // Store in moment system
        await db.insert(moments).values({
            timestamp: Date.now(),
            depth: 2,
            thought: `Tagesreflexion: ${achievements.length} Erfolge, ${learnings.length} Learnings`,
            feeling: 'reflektierend',
            ethicsScore: 90,
            needsAttention: false,
        });

        console.log('\n✅ Reflexion gespeichert!\n');
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('                    DEINE REFLEXION                             ');
        console.log('═══════════════════════════════════════════════════════════════\n');
        
        if (achievements.length > 0) {
            console.log('✅ Erfolge:');
            achievements.forEach((a, idx) => console.log(`   ${idx + 1}. ${a}`));
            console.log('');
        }

        if (challenges.length > 0) {
            console.log('⚠️ Herausforderungen:');
            challenges.forEach((c, idx) => console.log(`   ${idx + 1}. ${c}`));
            console.log('');
        }

        if (learnings.length > 0) {
            console.log('💡 Learnings:');
            learnings.forEach((l, idx) => console.log(`   ${idx + 1}. ${l}`));
            console.log('');
        }

        if (gratitude.length > 0) {
            console.log('🙏 Dankbarkeit:');
            gratitude.forEach((g, idx) => console.log(`   ${idx + 1}. ${g}`));
            console.log('');
        }

        if (tomorrowFocus.length > 0) {
            console.log('🌅 Fokus für morgen:');
            tomorrowFocus.forEach((f, idx) => console.log(`   ${idx + 1}. ${f}`));
            console.log('');
        }

        console.log('═══════════════════════════════════════════════════════════════\n');

        await this.prompt('Drücke Enter um fortzufahren...');
    }

    /**
     * Mood check-in
     */
    private async moodCheckIn() {
        console.log('\n🧘 MOOD CHECK-IN\n');

        console.log('Wie fühlst du dich gerade?');
        console.log('1. 😊 Großartig');
        console.log('2. 🙂 Gut');
        console.log('3. 😐 Neutral');
        console.log('4. 😔 Nicht so gut');
        console.log('5. 😢 Schlecht\n');

        const moodChoice = await this.prompt('Deine Stimmung (1-5): ');
        const moods = ['Großartig', 'Gut', 'Neutral', 'Nicht so gut', 'Schlecht'];
        const mood = moods[parseInt(moodChoice) - 1] || 'Neutral';

        const energy = await this.prompt('Energie-Level (1-10): ');
        const stress = await this.prompt('Stress-Level (1-10): ');
        const notes = await this.prompt('Notizen (optional): ');

        const checkIn: MoodCheckIn = {
            timestamp: Date.now(),
            mood,
            energy: parseInt(energy) || 5,
            stress: parseInt(stress) || 5,
            notes,
        };

        // Store in moment system
        await db.insert(moments).values({
            timestamp: checkIn.timestamp,
            depth: 1,
            thought: `Check-in: ${mood}, Energie ${energy}/10, Stress ${stress}/10`,
            feeling: mood.toLowerCase(),
            ethicsScore: 80,
            needsAttention: parseInt(stress) > 7,
        });

        console.log('\n✅ Check-in gespeichert!\n');
        console.log(`😊 Stimmung: ${mood}`);
        console.log(`⚡ Energie: ${energy}/10`);
        console.log(`😰 Stress: ${stress}/10`);
        if (notes) console.log(`📝 Notizen: ${notes}`);

        // Warning if stress is high
        if (parseInt(stress) > 7) {
            console.log('\n⚠️ Dein Stress-Level ist hoch!');
            console.log('💡 Tipp: Mach eine Pause, atme tief durch, oder versuch eine Achtsamkeitsübung.');
        }

        console.log('');
        await this.prompt('Drücke Enter um fortzufahren...');
    }

    /**
     * Show progress
     */
    private async showProgress() {
        console.log('\n📊 DEIN FORTSCHRITT\n');

        // Get moments from last 7 days
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const recentMoments = await db
            .select()
            .from(moments)
            .where(gte(moments.timestamp, sevenDaysAgo))
            .orderBy(desc(moments.timestamp));

        // Analyze
        const totalMoments = recentMoments.length;
        const avgEthicsScore = recentMoments.reduce((sum, m) => sum + m.ethicsScore, 0) / totalMoments;
        const needsAttentionCount = recentMoments.filter(m => m.needsAttention).length;

        // Count feelings
        const feelingCounts: Record<string, number> = {};
        recentMoments.forEach(m => {
            feelingCounts[m.feeling] = (feelingCounts[m.feeling] || 0) + 1;
        });

        const topFeeling = Object.entries(feelingCounts)
            .sort(([, a], [, b]) => b - a)[0];

        console.log('═══════════════════════════════════════════════════════════════');
        console.log('                 LETZTE 7 TAGE                                  ');
        console.log('═══════════════════════════════════════════════════════════════\n');
        console.log(`📝 Momente erfasst: ${totalMoments}`);
        console.log(`⭐ Durchschnittlicher Ethics-Score: ${avgEthicsScore.toFixed(1)}/100`);
        console.log(`⚠️ Momente mit Aufmerksamkeitsbedarf: ${needsAttentionCount}`);
        if (topFeeling) {
            console.log(`😊 Häufigstes Gefühl: ${topFeeling[0]} (${topFeeling[1]}x)`);
        }

        console.log('\n🎯 Alle Gefühle:');
        Object.entries(feelingCounts)
            .sort(([, a], [, b]) => b - a)
            .forEach(([feeling, count]) => {
                console.log(`   ${feeling}: ${count}x`);
            });

        console.log('\n═══════════════════════════════════════════════════════════════\n');
        await this.prompt('Drücke Enter um fortzufahren...');
    }

    /**
     * Show journal entries
     */
    private async showJournalEntries() {
        console.log('\n📖 JOURNAL-EINTRÄGE\n');

        // Get last 10 moments
        const recentMoments = await db
            .select()
            .from(moments)
            .orderBy(desc(moments.timestamp))
            .limit(10);

        console.log('═══════════════════════════════════════════════════════════════');
        console.log('               LETZTE 10 EINTRÄGE                               ');
        console.log('═══════════════════════════════════════════════════════════════\n');

        recentMoments.forEach((m, i) => {
            const date = new Date(m.timestamp).toLocaleString('de-DE');
            console.log(`${i + 1}. ${date}`);
            console.log(`   💭 ${m.thought}`);
            console.log(`   😊 ${m.feeling}`);
            console.log(`   ⭐ Ethics: ${m.ethicsScore}/100`);
            if (m.needsAttention) console.log('   ⚠️ Benötigt Aufmerksamkeit');
            console.log('');
        });

        console.log('═══════════════════════════════════════════════════════════════\n');
        await this.prompt('Drücke Enter um fortzufahren...');
    }

    /**
     * Show statistics
     */
    private async showStatistics() {
        console.log('\n📊 STATISTIKEN & TRENDS\n');

        // Get all moments
        const allMoments = await db.select().from(moments);

        // Calculate stats
        const totalMoments = allMoments.length;
        const avgEthicsScore = allMoments.reduce((sum, m) => sum + m.ethicsScore, 0) / totalMoments;

        // Group by depth
        const depthCounts: Record<number, number> = {};
        allMoments.forEach(m => {
            depthCounts[m.depth] = (depthCounts[m.depth] || 0) + 1;
        });

        // Top feelings
        const feelingCounts: Record<string, number> = {};
        allMoments.forEach(m => {
            feelingCounts[m.feeling] = (feelingCounts[m.feeling] || 0) + 1;
        });

        console.log('═══════════════════════════════════════════════════════════════');
        console.log('                 GESAMTSTATISTIKEN                              ');
        console.log('═══════════════════════════════════════════════════════════════\n');
        console.log(`📝 Momente insgesamt: ${totalMoments}`);
        console.log(`⭐ Durchschnittlicher Ethics-Score: ${avgEthicsScore.toFixed(1)}/100\n`);

        console.log('🌊 Momente nach Tiefe:');
        Object.entries(depthCounts)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .forEach(([depth, count]) => {
                const percentage = ((count / totalMoments) * 100).toFixed(1);
                console.log(`   Depth ${depth}: ${count} (${percentage}%)`);
            });

        console.log('\n😊 Top 5 Gefühle:');
        Object.entries(feelingCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .forEach(([feeling, count], i) => {
                console.log(`   ${i + 1}. ${feeling}: ${count}x`);
            });

        console.log('\n═══════════════════════════════════════════════════════════════\n');
        await this.prompt('Drücke Enter um fortzufahren...');
    }

    /**
     * Mindfulness exercise
     */
    private async mindfulnessExercise() {
        console.log('\n🧘 ACHTSAMKEITSÜBUNG\n');

        console.log('═══════════════════════════════════════════════════════════════');
        console.log('               5-4-3-2-1 ACHTSAMKEIT                            ');
        console.log('═══════════════════════════════════════════════════════════════\n');

        console.log('Diese Übung hilft dir, im Moment zu sein.\n');

        await this.prompt('Bereit? Drücke Enter...');

        console.log('\n👀 Nenne 5 Dinge, die du SEHEN kannst:');
        for (let i = 1; i <= 5; i++) {
            await this.prompt(`   ${i}. `);
        }

        console.log('\n👋 Nenne 4 Dinge, die du BERÜHREN kannst:');
        for (let i = 1; i <= 4; i++) {
            await this.prompt(`   ${i}. `);
        }

        console.log('\n👂 Nenne 3 Dinge, die du HÖREN kannst:');
        for (let i = 1; i <= 3; i++) {
            await this.prompt(`   ${i}. `);
        }

        console.log('\n👃 Nenne 2 Dinge, die du RIECHEN kannst:');
        for (let i = 1; i <= 2; i++) {
            await this.prompt(`   ${i}. `);
        }

        console.log('\n👅 Nenne 1 Ding, das du SCHMECKEN kannst:');
        await this.prompt('   1. ');

        console.log('\n✨ Gut gemacht! Du bist jetzt präsenter.\n');
        console.log('💡 Diese Übung kannst du jederzeit machen, wenn du dich gestresst fühlst.\n');

        // Save moment
        await db.insert(moments).values({
            timestamp: Date.now(),
            depth: 3,
            thought: 'Achtsamkeitsübung (5-4-3-2-1) durchgeführt',
            feeling: 'präsent',
            ethicsScore: 95,
            needsAttention: false,
        });

        await this.prompt('Drücke Enter um fortzufahren...');
    }

    /**
     * Simple prompt helper
     */
    private async prompt(question: string): Promise<string> {
        process.stdout.write(question);
        
        return new Promise((resolve) => {
            const stdin = process.stdin;
            stdin.setEncoding('utf-8');
            
            const onData = (data: string) => {
                stdin.removeListener('data', onData);
                stdin.pause();
                resolve(data.trim());
            };
            
            stdin.resume();
            stdin.once('data', onData);
        });
    }
}

// ============================================================================
// MAIN
// ============================================================================

const companion = new DailyCompanion();
companion.start();
