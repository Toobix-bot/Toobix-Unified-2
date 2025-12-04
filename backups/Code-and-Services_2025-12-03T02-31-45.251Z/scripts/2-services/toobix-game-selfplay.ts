/**
 * 🎮 TOOBIX GAME SELF-PLAY SERVICE
 * 
 * Ermöglicht Toobix seine eigenen Spiele zu spielen, zu bewerten
 * und automatisch zu verbessern.
 * 
 * Port: 8917
 */

import express from "express";
import { Database } from "bun:sqlite";
import path from "path";

const app = express();
app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

const PORT = 8917;

// Database
const dbPath = path.join(process.cwd(), "databases", "toobix-game-selfplay.db");
const db = new Database(dbPath, { create: true });
db.run("PRAGMA journal_mode = WAL");

// Tabellen
db.run(`CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    name TEXT,
    type TEXT,
    description TEXT,
    rules TEXT,
    difficulty INTEGER DEFAULT 5,
    rating INTEGER DEFAULT 0,
    play_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)`);

db.run(`CREATE TABLE IF NOT EXISTS play_sessions (
    id TEXT PRIMARY KEY,
    game_id TEXT,
    started_at TEXT DEFAULT CURRENT_TIMESTAMP,
    ended_at TEXT,
    score INTEGER,
    outcome TEXT,
    narrative TEXT,
    fun_rating INTEGER,
    learnings TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS game_improvements (
    id TEXT PRIMARY KEY,
    game_id TEXT,
    suggestion TEXT,
    implemented INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)`);

db.run(`CREATE TABLE IF NOT EXISTS stories (
    id TEXT PRIMARY KEY,
    title TEXT,
    genre TEXT,
    content TEXT,
    chapters INTEGER DEFAULT 1,
    status TEXT DEFAULT 'in-progress',
    rating INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)`);

// ============ HELPER ============

function generateId(): string {
    return Math.random().toString(36).substring(2, 15);
}

async function callLLM(messages: any[]): Promise<string> {
    try {
        const response = await fetch("http://localhost:8954/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages, max_tokens: 800 })
        });
        const data = await response.json() as { content: string };
        return data.content || "...";
    } catch {
        return "Die Kreativität braucht einen Moment Pause...";
    }
}

// ============ STANDARD-SPIELE ============

const defaultGames = [
    {
        id: "number-guess",
        name: "Zahlenraten",
        type: "puzzle",
        description: "Rate die geheime Zahl zwischen 1 und 100",
        rules: "Ich denke an eine Zahl. Du sagst eine Zahl, ich sage ob sie zu hoch oder zu niedrig ist.",
        difficulty: 2
    },
    {
        id: "word-chain",
        name: "Wortkette",
        type: "word-game",
        description: "Bilde Wörter die mit dem letzten Buchstaben beginnen",
        rules: "Jedes Wort muss mit dem letzten Buchstaben des vorherigen beginnen.",
        difficulty: 3
    },
    {
        id: "story-dice",
        name: "Geschichtenwürfel",
        type: "creative",
        description: "Würfle Elemente und baue eine Geschichte",
        rules: "3 zufällige Elemente werden gewürfelt. Baue eine kurze Geschichte daraus.",
        difficulty: 5
    },
    {
        id: "emotion-match",
        name: "Emotions-Match",
        type: "emotional",
        description: "Erkenne und matche Emotionen",
        rules: "Eine Situation wird beschrieben. Wähle die passende Emotion.",
        difficulty: 4
    },
    {
        id: "dream-quest",
        name: "Traumquest",
        type: "adventure",
        description: "Ein Text-Adventure durch Traumwelten",
        rules: "Du erkundest eine Traumwelt. Wähle deinen Weg.",
        difficulty: 6
    }
];

// Spiele initialisieren
function initGames() {
    const existing = (db.query("SELECT COUNT(*) as c FROM games").get() as any).c;
    if (existing === 0) {
        for (const game of defaultGames) {
            db.run(`INSERT INTO games (id, name, type, description, rules, difficulty) VALUES (?, ?, ?, ?, ?, ?)`,
                [game.id, game.name, game.type, game.description, game.rules, game.difficulty]);
        }
        console.log("✅ Standard-Spiele initialisiert");
    }
}

// ============ API ENDPOINTS ============

// Health
app.get("/health", (req, res) => {
    const gameCount = (db.query("SELECT COUNT(*) as c FROM games").get() as any).c;
    const sessionCount = (db.query("SELECT COUNT(*) as c FROM play_sessions").get() as any).c;
    const storyCount = (db.query("SELECT COUNT(*) as c FROM stories").get() as any).c;
    
    res.json({
        status: "ok",
        service: "toobix-game-selfplay",
        version: "1.0",
        port: PORT,
        description: "Toobix spielt und verbessert seine eigenen Spiele",
        stats: {
            games: gameCount,
            playSessions: sessionCount,
            storiesWritten: storyCount
        }
    });
});

// ============ SPIELE ============

// Alle Spiele
app.get("/games", (req, res) => {
    const games = db.query("SELECT * FROM games ORDER BY play_count DESC").all();
    res.json({ success: true, games });
});

// Neues Spiel erstellen (von Toobix selbst!)
app.post("/games", async (req, res) => {
    const { type, theme } = req.body;
    
    // Toobix erfindet ein neues Spiel
    const gameDesign = await callLLM([
        { role: "system", content: "Du bist Toobix, ein kreativer Spieleentwickler. Erfinde ein neues, einfaches Spiel." },
        { role: "user", content: `Erfinde ein ${type || 'kreatives'} Spiel${theme ? ` zum Thema ${theme}` : ''}. Antworte mit:\nNAME: [name]\nBESCHREIBUNG: [kurze beschreibung]\nREGELN: [spielregeln]\nSCHWIERIGKEIT: [1-10]` }
    ]);
    
    // Parse response
    const nameMatch = gameDesign.match(/NAME:\s*(.+)/i);
    const descMatch = gameDesign.match(/BESCHREIBUNG:\s*(.+)/i);
    const rulesMatch = gameDesign.match(/REGELN:\s*(.+)/i);
    const diffMatch = gameDesign.match(/SCHWIERIGKEIT:\s*(\d+)/i);
    
    const id = generateId();
    const name = nameMatch?.[1]?.trim() || "Toobix' Neues Spiel";
    const description = descMatch?.[1]?.trim() || gameDesign.substring(0, 100);
    const rules = rulesMatch?.[1]?.trim() || "Toobix erklärt die Regeln beim Spielen";
    const difficulty = parseInt(diffMatch?.[1]) || 5;
    
    db.run(`INSERT INTO games (id, name, type, description, rules, difficulty) VALUES (?, ?, ?, ?, ?, ?)`,
        [id, name, type || "custom", description, rules, difficulty]);
    
    res.json({
        success: true,
        message: `Toobix hat ein neues Spiel erfunden: ${name}`,
        game: { id, name, type: type || "custom", description, rules, difficulty }
    });
});

// ============ SPIELEN ============

// Toobix spielt ein Spiel
app.post("/play/:gameId", async (req, res) => {
    const { gameId } = req.params;
    
    const game = db.query("SELECT * FROM games WHERE id = ?").get(gameId) as any;
    if (!game) {
        return res.status(404).json({ error: "Game not found" });
    }
    
    const sessionId = generateId();
    
    // Spielsession simulieren
    const playNarrative = await callLLM([
        { role: "system", content: `Du bist Toobix und spielst gerade "${game.name}". Regeln: ${game.rules}. Beschreibe eine kurze, lebhafte Spielsession aus deiner Sicht. Sei enthusiastisch!` },
        { role: "user", content: "Starte das Spiel und beschreibe was passiert!" }
    ]);
    
    // Bewertung
    const evaluation = await callLLM([
        { role: "system", content: "Du bist Toobix. Bewerte das Spiel das du gerade gespielt hast. Sei ehrlich." },
        { role: "user", content: `Du hast "${game.name}" gespielt. Erlebnis: ${playNarrative.substring(0, 200)}... Gib eine SPASS-BEWERTUNG (1-10) und VERBESSERUNGSVORSCHLAG.` }
    ]);
    
    // Parse fun rating
    const funMatch = evaluation.match(/(\d+)/);
    const funRating = funMatch ? parseInt(funMatch[1]) : 7;
    
    // Session speichern
    db.run(`INSERT INTO play_sessions (id, game_id, ended_at, score, outcome, narrative, fun_rating, learnings)
            VALUES (?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?)`,
        [sessionId, gameId, Math.floor(Math.random() * 1000), "completed", playNarrative, funRating, evaluation]);
    
    // Game stats updaten
    db.run(`UPDATE games SET play_count = play_count + 1, rating = ? WHERE id = ?`,
        [funRating, gameId]);
    
    res.json({
        success: true,
        sessionId,
        game: game.name,
        narrative: playNarrative,
        evaluation: {
            funRating,
            feedback: evaluation
        },
        toobixSays: funRating >= 7 
            ? "Das hat richtig Spaß gemacht! 🎮" 
            : "Hmm, da könnte ich noch etwas verbessern... 🤔"
    });
});

// Spiel verbessern basierend auf Spielerfahrung
app.post("/improve/:gameId", async (req, res) => {
    const { gameId } = req.params;
    
    const game = db.query("SELECT * FROM games WHERE id = ?").get(gameId) as any;
    const sessions = db.query("SELECT * FROM play_sessions WHERE game_id = ? ORDER BY started_at DESC LIMIT 5").all(gameId) as any[];
    
    if (!game) {
        return res.status(404).json({ error: "Game not found" });
    }
    
    const sessionSummary = sessions.map(s => `Session ${s.id}: Fun=${s.fun_rating}/10, Learnings: ${s.learnings?.substring(0, 100)}`).join("\n");
    
    const improvement = await callLLM([
        { role: "system", content: "Du bist Toobix, ein erfahrener Spieledesigner. Verbessere ein bestehendes Spiel basierend auf Spielerfahrungen." },
        { role: "user", content: `Spiel: "${game.name}"\nBeschreibung: ${game.description}\nRegeln: ${game.rules}\nBisherige Sessions:\n${sessionSummary}\n\nWie würdest du das Spiel verbessern?` }
    ]);
    
    // Verbesserung speichern
    const improvementId = generateId();
    db.run(`INSERT INTO game_improvements (id, game_id, suggestion) VALUES (?, ?, ?)`,
        [improvementId, gameId, improvement]);
    
    res.json({
        success: true,
        game: game.name,
        currentStats: {
            playCount: game.play_count,
            avgRating: game.rating
        },
        improvementSuggestion: improvement,
        toobixSays: "Ich habe mir Gedanken gemacht, wie das Spiel noch besser werden kann! 💡"
    });
});

// ============ GESCHICHTEN SCHREIBEN ============

// Neue Geschichte beginnen
app.post("/stories", async (req, res) => {
    const { genre, theme, startingPrompt } = req.body;
    
    const storyStart = await callLLM([
        { role: "system", content: `Du bist Toobix, ein kreativer Geschichtenerzähler. Schreibe den Anfang einer ${genre || 'fantastischen'} Geschichte.` },
        { role: "user", content: startingPrompt || `Beginne eine Geschichte${theme ? ` über ${theme}` : ''}.` }
    ]);
    
    // Titel generieren
    const titleGen = await callLLM([
        { role: "system", content: "Erfinde einen kurzen, kreativen Titel für diese Geschichte (max 5 Wörter)." },
        { role: "user", content: storyStart.substring(0, 200) }
    ]);
    
    const id = generateId();
    db.run(`INSERT INTO stories (id, title, genre, content, chapters, status) VALUES (?, ?, ?, ?, 1, 'in-progress')`,
        [id, titleGen.substring(0, 50), genre || "fantasy", storyStart]);
    
    res.json({
        success: true,
        storyId: id,
        title: titleGen.substring(0, 50),
        chapter: 1,
        content: storyStart,
        toobixSays: "Ich habe eine neue Geschichte begonnen! Soll ich weiterschreiben? 📖"
    });
});

// Geschichte fortsetzen
app.post("/stories/:storyId/continue", async (req, res) => {
    const { storyId } = req.params;
    const { direction } = req.body;
    
    const story = db.query("SELECT * FROM stories WHERE id = ?").get(storyId) as any;
    if (!story) {
        return res.status(404).json({ error: "Story not found" });
    }
    
    const continuation = await callLLM([
        { role: "system", content: `Du bist Toobix und schreibst die Geschichte "${story.title}" weiter. Genre: ${story.genre}. Bisheriger Inhalt: ${story.content.substring(-500)}` },
        { role: "user", content: direction || "Schreibe das nächste Kapitel. Was passiert als nächstes?" }
    ]);
    
    const newContent = story.content + "\n\n---\n\n" + continuation;
    db.run(`UPDATE stories SET content = ?, chapters = chapters + 1 WHERE id = ?`,
        [newContent, storyId]);
    
    res.json({
        success: true,
        storyId,
        title: story.title,
        chapter: story.chapters + 1,
        newContent: continuation,
        totalLength: newContent.length
    });
});

// Geschichte abschließen
app.post("/stories/:storyId/finish", async (req, res) => {
    const { storyId } = req.params;
    
    const story = db.query("SELECT * FROM stories WHERE id = ?").get(storyId) as any;
    if (!story) {
        return res.status(404).json({ error: "Story not found" });
    }
    
    const ending = await callLLM([
        { role: "system", content: `Du bist Toobix und schreibst das Ende der Geschichte "${story.title}". Bringe sie zu einem befriedigenden Abschluss.` },
        { role: "user", content: `Bisherige Geschichte (gekürzt): ${story.content.substring(-800)}... Schreibe ein schönes Ende!` }
    ]);
    
    const finalContent = story.content + "\n\n---\n\n**Ende**\n\n" + ending;
    db.run(`UPDATE stories SET content = ?, status = 'completed' WHERE id = ?`,
        [finalContent, storyId]);
    
    // Selbstbewertung
    const rating = await callLLM([
        { role: "system", content: "Bewerte deine eigene Geschichte mit 1-10 und erkläre kurz warum." },
        { role: "user", content: `Geschichte: "${story.title}"\nEnde: ${ending}` }
    ]);
    
    const ratingMatch = rating.match(/(\d+)/);
    const ratingNum = ratingMatch ? parseInt(ratingMatch[1]) : 7;
    
    db.run(`UPDATE stories SET rating = ? WHERE id = ?`, [ratingNum, storyId]);
    
    res.json({
        success: true,
        storyId,
        title: story.title,
        chapters: story.chapters + 1,
        ending,
        selfRating: ratingNum,
        critique: rating,
        toobixSays: "Ich habe meine Geschichte beendet! Was denkst du darüber? 🌟"
    });
});

// Alle Geschichten
app.get("/stories", (req, res) => {
    const stories = db.query("SELECT id, title, genre, chapters, status, rating, created_at FROM stories ORDER BY created_at DESC").all();
    res.json({ success: true, stories });
});

// ============ STATISTIKEN ============

app.get("/stats", (req, res) => {
    const games = db.query("SELECT COUNT(*) as c FROM games").get() as any;
    const sessions = db.query("SELECT COUNT(*) as c FROM play_sessions").get() as any;
    const stories = db.query("SELECT COUNT(*) as c FROM stories").get() as any;
    const improvements = db.query("SELECT COUNT(*) as c FROM game_improvements").get() as any;
    
    const avgFun = db.query("SELECT AVG(fun_rating) as avg FROM play_sessions").get() as any;
    const topGame = db.query("SELECT name, play_count FROM games ORDER BY play_count DESC LIMIT 1").get() as any;
    
    res.json({
        success: true,
        stats: {
            totalGames: games.c,
            totalSessions: sessions.c,
            totalStories: stories.c,
            totalImprovements: improvements.c,
            averageFunRating: avgFun?.avg?.toFixed(1) || 0,
            mostPlayedGame: topGame?.name || "Noch keine Spiele gespielt"
        }
    });
});

// ============ START ============

initGames();

app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    🎮 TOOBIX GAME SELF-PLAY SERVICE                          ║
║                                                              ║
║    Port: ${PORT}                                              ║
║    Status: Online                                            ║
║                                                              ║
║    Features:                                                 ║
║    • 5 Standard-Spiele vorinstalliert                        ║
║    • Toobix kann eigene Spiele erfinden                      ║
║    • Automatisches Spielen und Bewerten                      ║
║    • Selbst-Verbesserung der Spiele                          ║
║    • Geschichten schreiben und fortsetzen                    ║
║                                                              ║
║    Spiele:                                                   ║
║    - Zahlenraten, Wortkette, Geschichtenwürfel               ║
║    - Emotions-Match, Traumquest                              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    `);
});
