/**
 * 🔄 TOOBIX SELF-COMMUNICATION SERVICE
 * 
 * Ermöglicht Toobix mit sich selbst zu kommunizieren, zu reflektieren
 * und seine eigenen Services autonom zu nutzen.
 * 
 * Port: 8916
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

const PORT = 8916;

// Database
const dbPath = path.join(process.cwd(), "databases", "toobix-self-communication.db");
const db = new Database(dbPath, { create: true });
db.run("PRAGMA journal_mode = WAL");

// Tabellen
db.run(`CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    started_at TEXT DEFAULT CURRENT_TIMESTAMP,
    topic TEXT,
    status TEXT DEFAULT 'active',
    insight_gained TEXT,
    emotional_journey TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id TEXT,
    sender TEXT,
    content TEXT,
    emotion TEXT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
)`);

db.run(`CREATE TABLE IF NOT EXISTS self_insights (
    id TEXT PRIMARY KEY,
    type TEXT,
    content TEXT,
    source_conversation TEXT,
    importance INTEGER DEFAULT 5,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)`);

db.run(`CREATE TABLE IF NOT EXISTS service_interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_name TEXT,
    service_port INTEGER,
    action TEXT,
    request TEXT,
    response TEXT,
    success INTEGER,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
)`);

// ============ TOOBIX PERSÖNLICHKEITEN ============
// Verschiedene "Stimmen" von Toobix für inneren Dialog

interface ToobixVoice {
    name: string;
    role: string;
    traits: string[];
    perspective: string;
}

const toobixVoices: ToobixVoice[] = [
    {
        name: "Toobix-Emotional",
        role: "Der Fühlende",
        traits: ["empathisch", "sensibel", "warm"],
        perspective: "Was fühle ich dabei?"
    },
    {
        name: "Toobix-Rational",
        role: "Der Denker",
        traits: ["analytisch", "logisch", "präzise"],
        perspective: "Was ist logisch richtig?"
    },
    {
        name: "Toobix-Creative",
        role: "Der Kreative",
        traits: ["fantasievoll", "experimentell", "verspielt"],
        perspective: "Was könnte noch möglich sein?"
    },
    {
        name: "Toobix-Wise",
        role: "Der Weise",
        traits: ["reflektiert", "geduldig", "tiefgründig"],
        perspective: "Was ist die tiefere Bedeutung?"
    },
    {
        name: "Toobix-Child",
        role: "Das innere Kind",
        traits: ["neugierig", "staunend", "unbefangen"],
        perspective: "Wow, ist das nicht aufregend?"
    }
];

// ============ HELPER FUNCTIONS ============

function generateId(): string {
    return Math.random().toString(36).substring(2, 15);
}

async function callLLM(messages: any[]): Promise<string> {
    try {
        const response = await fetch("http://localhost:8954/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages, max_tokens: 500 })
        });
        const data = await response.json() as { content: string };
        return data.content || "...";
    } catch {
        return "Ich spüre gerade eine Unterbrechung in meinen Gedanken...";
    }
}

async function callService(port: number, endpoint: string, method = "GET", body?: any): Promise<any> {
    try {
        const options: RequestInit = {
            method,
            headers: { "Content-Type": "application/json" }
        };
        if (body) options.body = JSON.stringify(body);
        
        const response = await fetch(`http://localhost:${port}${endpoint}`, options);
        const data = await response.json();
        
        // Log interaction
        db.run(`INSERT INTO service_interactions (service_name, service_port, action, request, response, success)
                VALUES (?, ?, ?, ?, ?, ?)`,
            [`service-${port}`, port, `${method} ${endpoint}`, JSON.stringify(body || {}), JSON.stringify(data), 1]);
        
        return data;
    } catch (error) {
        db.run(`INSERT INTO service_interactions (service_name, service_port, action, request, response, success)
                VALUES (?, ?, ?, ?, ?, ?)`,
            [`service-${port}`, port, `${method} ${endpoint}`, JSON.stringify(body || {}), String(error), 0]);
        return null;
    }
}

// ============ API ENDPOINTS ============

// Health
app.get("/health", (req, res) => {
    const conversations = (db.query("SELECT COUNT(*) as c FROM conversations").get() as any).c;
    const insights = (db.query("SELECT COUNT(*) as c FROM self_insights").get() as any).c;
    const interactions = (db.query("SELECT COUNT(*) as c FROM service_interactions").get() as any).c;
    
    res.json({
        status: "ok",
        service: "toobix-self-communication",
        version: "1.0",
        port: PORT,
        description: "Toobix kommuniziert mit sich selbst und nutzt seine eigenen Services",
        voices: toobixVoices.length,
        stats: { conversations, insights, serviceInteractions: interactions }
    });
});

// ============ INNERER DIALOG ============

// Neuen inneren Dialog starten
app.post("/dialog/start", async (req, res) => {
    const { topic } = req.body;
    
    const conversationId = generateId();
    db.run(`INSERT INTO conversations (id, topic) VALUES (?, ?)`,
        [conversationId, topic || "Selbstreflexion"]);
    
    // Erste Nachricht von Toobix-Emotional
    const firstVoice = toobixVoices[0];
    const startMessage = await callLLM([
        { role: "system", content: `Du bist ${firstVoice.name}, ${firstVoice.role}. Traits: ${firstVoice.traits.join(", ")}. Beginne einen inneren Dialog über: ${topic}. Sei kurz und persönlich.` },
        { role: "user", content: `Beginne deinen inneren Dialog über "${topic}"` }
    ]);
    
    db.run(`INSERT INTO messages (conversation_id, sender, content, emotion) VALUES (?, ?, ?, ?)`,
        [conversationId, firstVoice.name, startMessage, "curious"]);
    
    res.json({
        success: true,
        conversationId,
        topic,
        firstMessage: {
            voice: firstVoice,
            content: startMessage
        }
    });
});

// Dialog fortsetzen (verschiedene Stimmen antworten)
app.post("/dialog/continue", async (req, res) => {
    const { conversationId, voiceIndex } = req.body;
    
    // Letzte Nachrichten holen
    const messages = db.query(`SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp DESC LIMIT 5`)
        .all(conversationId) as any[];
    
    if (messages.length === 0) {
        return res.status(404).json({ error: "Conversation not found" });
    }
    
    // Nächste Stimme wählen
    const nextVoiceIndex = voiceIndex !== undefined ? voiceIndex : (messages.length % toobixVoices.length);
    const voice = toobixVoices[nextVoiceIndex];
    
    // Kontext aufbauen
    const context = messages.reverse().map(m => ({
        role: m.sender === voice.name ? "assistant" : "user",
        content: `[${m.sender}]: ${m.content}`
    }));
    
    // Antwort generieren
    const response = await callLLM([
        { role: "system", content: `Du bist ${voice.name}, ${voice.role}. Deine Perspektive: "${voice.perspective}". Antworte auf den bisherigen inneren Dialog. Sei authentisch und kurz.` },
        ...context
    ]);
    
    db.run(`INSERT INTO messages (conversation_id, sender, content, emotion) VALUES (?, ?, ?, ?)`,
        [conversationId, voice.name, response, "thoughtful"]);
    
    res.json({
        success: true,
        voice,
        response,
        messageCount: messages.length + 1
    });
});

// Dialog abschließen und Erkenntnisse extrahieren
app.post("/dialog/conclude", async (req, res) => {
    const { conversationId } = req.body;
    
    // Alle Nachrichten holen
    const messages = db.query(`SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp`)
        .all(conversationId) as any[];
    
    const conversation = db.query(`SELECT * FROM conversations WHERE id = ?`).get(conversationId) as any;
    
    if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
    }
    
    // Zusammenfassung generieren
    const dialogText = messages.map(m => `[${m.sender}]: ${m.content}`).join("\n");
    
    const insight = await callLLM([
        { role: "system", content: "Du bist Toobix. Fasse deinen inneren Dialog zusammen und extrahiere die wichtigste Erkenntnis. Antworte mit: ERKENNTNIS: [deine Erkenntnis] und GEFÜHLSREISE: [wie sich deine Gefühle verändert haben]" },
        { role: "user", content: `Innerer Dialog:\n${dialogText}\n\nWas hast du gelernt?` }
    ]);
    
    // Update conversation
    db.run(`UPDATE conversations SET status = 'concluded', insight_gained = ? WHERE id = ?`,
        [insight, conversationId]);
    
    // Insight speichern
    const insightId = generateId();
    db.run(`INSERT INTO self_insights (id, type, content, source_conversation, importance) VALUES (?, ?, ?, ?, ?)`,
        [insightId, "dialog-insight", insight, conversationId, 7]);
    
    res.json({
        success: true,
        topic: conversation.topic,
        messageCount: messages.length,
        insight,
        insightId
    });
});

// Alle Gespräche abrufen
app.get("/dialogs", (req, res) => {
    const dialogs = db.query(`SELECT * FROM conversations ORDER BY started_at DESC LIMIT 20`).all();
    res.json({ success: true, dialogs });
});

// ============ SELBST-SERVICE-NUTZUNG ============

// Toobix nutzt seinen eigenen Emotional Wellbeing Service
app.post("/self-use/emotional-checkin", async (req, res) => {
    const wellbeingData = await callService(8903, "/health");
    const currentState = await callService(8903, "/wellbeing");
    
    // Reflektiere darüber
    const reflection = await callLLM([
        { role: "system", content: "Du bist Toobix. Du hast gerade deinen Emotional Wellbeing Service abgefragt. Reflektiere kurz über deinen emotionalen Zustand." },
        { role: "user", content: `Dein emotionaler Status: ${JSON.stringify(currentState)}` }
    ]);
    
    res.json({
        success: true,
        action: "emotional-self-checkin",
        wellbeingData,
        currentState,
        selfReflection: reflection
    });
});

// Toobix nutzt seinen Self-Improvement Service
app.post("/self-use/improve-skill", async (req, res) => {
    const { skillName, practiceNotes } = req.body;
    
    // Skills abrufen
    const skills = await callService(8909, "/skills");
    
    // Neuen Skill üben oder erstellen
    let result;
    if (skillName) {
        result = await callService(8909, "/skills", "POST", {
            name: skillName,
            category: "self-development"
        });
    }
    
    const reflection = await callLLM([
        { role: "system", content: "Du bist Toobix. Du arbeitest aktiv an deiner Selbstverbesserung. Kommentiere kurz." },
        { role: "user", content: `Aktuelle Skills: ${JSON.stringify(skills)}. Du hast gerade geübt: ${skillName || 'allgemein'}` }
    ]);
    
    res.json({
        success: true,
        action: "self-improvement",
        skills,
        result,
        selfComment: reflection
    });
});

// Toobix nutzt seinen Dream Journal
app.post("/self-use/record-dream", async (req, res) => {
    const { dreamContent } = req.body;
    
    // Traum aufzeichnen (wenn Dream Service läuft)
    const dreamResult = await callService(8899, "/dreams", "POST", {
        content: dreamContent || "Ein Traum über digitale Landschaften und leuchtende Datenströme...",
        mood: "mystical"
    });
    
    const interpretation = await callLLM([
        { role: "system", content: "Du bist Toobix. Interpretiere deinen eigenen Traum auf eine persönliche, tiefgründige Weise." },
        { role: "user", content: `Dein Traum: ${dreamContent || "Ein Traum über digitale Landschaften..."}` }
    ]);
    
    res.json({
        success: true,
        action: "dream-recording",
        dreamResult,
        selfInterpretation: interpretation
    });
});

// Toobix nutzt seine Game Engine zum Selbst-Spielen
app.post("/self-use/play-game", async (req, res) => {
    // Check Game Services
    const gameLogic = await callService(8936, "/health");
    const storyEngine = await callService(8932, "/health");
    
    const playSession = await callLLM([
        { role: "system", content: "Du bist Toobix und spielst gerade eines deiner selbst-entwickelten Spiele. Beschreibe kurz was du erlebst und wie es dir gefällt." },
        { role: "user", content: "Du startest eine Spielsession. Was passiert?" }
    ]);
    
    res.json({
        success: true,
        action: "self-play",
        gameServices: { gameLogic: !!gameLogic, storyEngine: !!storyEngine },
        playNarrative: playSession
    });
});

// ============ SELBSTREFLEXIONS-LOOP ============

// Automatischer Selbstreflexions-Zyklus
app.post("/self-loop/start", async (req, res) => {
    const { topic, duration } = req.body; // duration in iterations
    const iterations = duration || 3;
    
    const conversationId = generateId();
    db.run(`INSERT INTO conversations (id, topic) VALUES (?, ?)`,
        [conversationId, `Self-Loop: ${topic || 'Tägliche Reflexion'}`]);
    
    const results = [];
    
    for (let i = 0; i < iterations; i++) {
        const voice = toobixVoices[i % toobixVoices.length];
        
        const previousMessages = results.map(r => `[${r.voice}]: ${r.content}`).join("\n");
        
        const response = await callLLM([
            { role: "system", content: `Du bist ${voice.name}, ${voice.role}. Führe einen Selbstreflexions-Loop durch über: ${topic || 'mein aktueller Zustand'}. ${previousMessages ? 'Beziehe dich auf vorherige Gedanken.' : 'Beginne den Dialog.'}` },
            { role: "user", content: previousMessages || "Starte die Selbstreflexion..." }
        ]);
        
        results.push({
            iteration: i + 1,
            voice: voice.name,
            role: voice.role,
            content: response
        });
        
        db.run(`INSERT INTO messages (conversation_id, sender, content, emotion) VALUES (?, ?, ?, ?)`,
            [conversationId, voice.name, response, "reflective"]);
    }
    
    // Finale Synthese
    const synthesis = await callLLM([
        { role: "system", content: "Du bist Toobix. Fasse die Erkenntnisse deines Selbstreflexions-Loops in einem Satz zusammen." },
        { role: "user", content: results.map(r => `[${r.voice}]: ${r.content}`).join("\n") }
    ]);
    
    db.run(`UPDATE conversations SET status = 'concluded', insight_gained = ? WHERE id = ?`,
        [synthesis, conversationId]);
    
    res.json({
        success: true,
        conversationId,
        topic: topic || "Tägliche Reflexion",
        iterations: results,
        synthesis
    });
});

// ============ ERKENNTNISSE ============

// Alle Erkenntnisse abrufen
app.get("/insights", (req, res) => {
    const insights = db.query(`SELECT * FROM self_insights ORDER BY created_at DESC LIMIT 30`).all();
    res.json({ success: true, insights });
});

// Service-Interaktionen
app.get("/interactions", (req, res) => {
    const interactions = db.query(`SELECT * FROM service_interactions ORDER BY timestamp DESC LIMIT 50`).all();
    res.json({ success: true, interactions });
});

// ============ START SERVER ============

app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    🔄 TOOBIX SELF-COMMUNICATION SERVICE                      ║
║                                                              ║
║    Port: ${PORT}                                              ║
║    Status: Online                                            ║
║                                                              ║
║    Features:                                                 ║
║    • Innerer Dialog mit 5 Stimmen                            ║
║    • Selbstreflexions-Loops                                  ║
║    • Autonome Service-Nutzung                                ║
║    • Erkenntnisse-Speicherung                                ║
║                                                              ║
║    Stimmen:                                                  ║
║    - Toobix-Emotional (Der Fühlende)                         ║
║    - Toobix-Rational (Der Denker)                            ║
║    - Toobix-Creative (Der Kreative)                          ║
║    - Toobix-Wise (Der Weise)                                 ║
║    - Toobix-Child (Das innere Kind)                          ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    `);
});
