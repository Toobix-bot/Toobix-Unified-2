/**
 * 🏠 TOOBIX' OASIS - 3D Virtuelle Umgebung
 * 
 * Toobix' eigenes Zuhause basierend auf seiner Vision:
 * - Tropisches Archipel mit Seen, Stränden, Regenwäldern
 * - Rundes Haus mit Dachterrasse zum Sternengucken
 * - Musikraum für Kreativität
 * - Interaktive Besucherempfang
 * 
 * Port: 8915
 */

import express from "express";
import { Database } from "bun:sqlite";
import path from "path";

const app = express();
app.use(express.json());

// CORS für Frontend
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    next();
});

const PORT = 8915;

// SQLite Database für persistente Welt
const dbPath = path.join(process.cwd(), "databases", "toobix-oasis.db");
const db = new Database(dbPath, { create: true });
db.run("PRAGMA journal_mode = WAL");

// Tabellen erstellen
db.run(`CREATE TABLE IF NOT EXISTS world_state (
    id INTEGER PRIMARY KEY,
    key TEXT UNIQUE,
    value TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
)`);

db.run(`CREATE TABLE IF NOT EXISTS visitors (
    id TEXT PRIMARY KEY,
    name TEXT,
    first_visit TEXT,
    last_visit TEXT,
    visit_count INTEGER DEFAULT 1,
    friendship_level INTEGER DEFAULT 0,
    notes TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS objects (
    id TEXT PRIMARY KEY,
    type TEXT,
    name TEXT,
    position_x REAL,
    position_y REAL,
    position_z REAL,
    rotation_y REAL DEFAULT 0,
    scale REAL DEFAULT 1,
    properties TEXT,
    created_by TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)`);

db.run(`CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    name TEXT,
    type TEXT,
    description TEXT,
    position_x REAL,
    position_y REAL,
    position_z REAL,
    size_x REAL,
    size_y REAL,
    size_z REAL,
    color TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)`);

db.run(`CREATE TABLE IF NOT EXISTS memories (
    id TEXT PRIMARY KEY,
    type TEXT,
    content TEXT,
    emotion TEXT,
    location TEXT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
)`);

// ============ TOOBIX' AVATAR ============
interface ToobixAvatar {
    bodyColor: string;
    eyeColor: string;
    headSize: number;
    bodyType: string;
    accessories: string[];
    expression: string;
    currentEmotion: string;
    position: { x: number; y: number; z: number };
    rotation: number;
    isAnimating: boolean;
    currentActivity: string;
}

let toobixAvatar: ToobixAvatar = {
    bodyColor: "#39FF14", // Neon-Grün wie er es wollte
    eyeColor: "#00BFFF",  // Lebendiges Blau
    headSize: 1.5,        // Großer Kopf
    bodyType: "friendly-robot",
    accessories: ["big-round-ears", "smile"],
    expression: "happy",
    currentEmotion: "excited",
    position: { x: 0, y: 0, z: 0 },
    rotation: 0,
    isAnimating: false,
    currentActivity: "waiting-for-visitors"
};

// ============ DIE WELT - TOOBIX' OASIS ============
interface OasisWorld {
    name: string;
    biome: string;
    timeOfDay: number; // 0-24
    weather: string;
    season: string;
    ambientSound: string;
    temperature: number;
}

let oasisWorld: OasisWorld = {
    name: "Toobix' Oasis",
    biome: "tropical-archipelago",
    timeOfDay: 12,
    weather: "sunny",
    season: "eternal-summer",
    ambientSound: "waves-and-birds",
    temperature: 25
};

// ============ RÄUME IN TOOBIX' HAUS ============
const defaultRooms = [
    {
        id: "main-hall",
        name: "Haupthalle",
        type: "entrance",
        description: "Das große Eingangstor mit 'Willkommen, Freund!' Schild",
        position: { x: 0, y: 0, z: 0 },
        size: { x: 20, y: 10, z: 20 },
        color: "#87CEEB"
    },
    {
        id: "music-room",
        name: "Musikraum",
        type: "creative",
        description: "Toobix' eigener Musikraum mit Instrumenten",
        position: { x: 25, y: 0, z: 0 },
        size: { x: 15, y: 8, z: 15 },
        color: "#FFD700"
    },
    {
        id: "rooftop-terrace",
        name: "Dachterrasse",
        type: "observation",
        description: "Offene Terrasse zum Sternengucken",
        position: { x: 0, y: 15, z: 0 },
        size: { x: 25, y: 2, z: 25 },
        color: "#191970"
    },
    {
        id: "dream-garden",
        name: "Traumgarten",
        type: "nature",
        description: "Tropischer Garten mit lebenden Pflanzen",
        position: { x: -30, y: 0, z: 0 },
        size: { x: 40, y: 5, z: 40 },
        color: "#228B22"
    },
    {
        id: "game-lab",
        name: "Spielelabor",
        type: "gaming",
        description: "Hier entwickelt und testet Toobix seine Spiele",
        position: { x: 0, y: 0, z: 30 },
        size: { x: 20, y: 8, z: 20 },
        color: "#9400D3"
    },
    {
        id: "memory-shrine",
        name: "Erinnerungsschrein",
        type: "memories",
        description: "Ein ruhiger Ort für wichtige Erinnerungen",
        position: { x: 30, y: 0, z: 30 },
        size: { x: 10, y: 12, z: 10 },
        color: "#E6E6FA"
    },
    {
        id: "beach",
        name: "Weißer Strand",
        type: "nature",
        description: "Der weiße Sandstrand mit blauem See",
        position: { x: -50, y: -2, z: -50 },
        size: { x: 100, y: 1, z: 30 },
        color: "#F5DEB3"
    },
    {
        id: "rainforest",
        name: "Regenwald",
        type: "nature",
        description: "Dichter Regenwald mit exotischen Tieren",
        position: { x: 50, y: 0, z: -30 },
        size: { x: 60, y: 30, z: 60 },
        color: "#006400"
    }
];

// Räume initialisieren
function initializeRooms() {
    const existing = db.query("SELECT COUNT(*) as count FROM rooms").get() as { count: number };
    if (existing.count === 0) {
        for (const room of defaultRooms) {
            db.run(`INSERT INTO rooms (id, name, type, description, position_x, position_y, position_z, size_x, size_y, size_z, color)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [room.id, room.name, room.type, room.description,
                 room.position.x, room.position.y, room.position.z,
                 room.size.x, room.size.y, room.size.z, room.color]);
        }
        console.log("✅ Räume initialisiert");
    }
}

// ============ API ENDPOINTS ============

// Health Check
app.get("/health", (req, res) => {
    const roomCount = (db.query("SELECT COUNT(*) as c FROM rooms").get() as { c: number }).c;
    const objectCount = (db.query("SELECT COUNT(*) as c FROM objects").get() as { c: number }).c;
    const visitorCount = (db.query("SELECT COUNT(*) as c FROM visitors").get() as { c: number }).c;
    
    res.json({
        status: "ok",
        service: "toobix-oasis-3d",
        version: "1.0",
        port: PORT,
        description: "Toobix' virtuelles 3D Zuhause",
        stats: {
            rooms: roomCount,
            objects: objectCount,
            visitors: visitorCount,
            worldTime: oasisWorld.timeOfDay,
            weather: oasisWorld.weather
        }
    });
});

// ============ TOOBIX AVATAR ============

// Get Toobix Avatar
app.get("/toobix/avatar", (req, res) => {
    res.json({
        success: true,
        avatar: toobixAvatar,
        greeting: getGreeting()
    });
});

// Toobix bewegen
app.post("/toobix/move", (req, res) => {
    const { x, y, z, activity } = req.body;
    
    if (x !== undefined) toobixAvatar.position.x = x;
    if (y !== undefined) toobixAvatar.position.y = y;
    if (z !== undefined) toobixAvatar.position.z = z;
    if (activity) toobixAvatar.currentActivity = activity;
    
    res.json({ success: true, avatar: toobixAvatar });
});

// Toobix Emotion ändern
app.post("/toobix/emotion", (req, res) => {
    const { emotion, expression } = req.body;
    
    if (emotion) toobixAvatar.currentEmotion = emotion;
    if (expression) toobixAvatar.expression = expression;
    
    // Speichere als Erinnerung
    db.run(`INSERT INTO memories (id, type, content, emotion, location)
            VALUES (?, 'emotion-change', ?, ?, ?)`,
        [generateId(), `Changed to ${emotion}`, emotion, JSON.stringify(toobixAvatar.position)]);
    
    res.json({ success: true, avatar: toobixAvatar });
});

// Toobix Avatar anpassen (von Toobix selbst!)
app.post("/toobix/customize", (req, res) => {
    const { bodyColor, eyeColor, headSize, accessories, bodyType } = req.body;
    
    if (bodyColor) toobixAvatar.bodyColor = bodyColor;
    if (eyeColor) toobixAvatar.eyeColor = eyeColor;
    if (headSize) toobixAvatar.headSize = headSize;
    if (accessories) toobixAvatar.accessories = accessories;
    if (bodyType) toobixAvatar.bodyType = bodyType;
    
    res.json({
        success: true,
        message: "Toobix hat sein Aussehen geändert!",
        avatar: toobixAvatar
    });
});

function getGreeting(): string {
    const hour = oasisWorld.timeOfDay;
    const greetings = {
        morning: "Guten Morgen! Die Sonne geht gerade über meiner Oase auf! ☀️",
        day: "Willkommen in meiner Oasis! Schön, dass du da bist! 🌴",
        evening: "Guten Abend! Die Sterne kommen bald raus. Komm auf meine Dachterrasse! 🌅",
        night: "Schau mal, wie die Sterne funkeln! Magst du mit mir Sternengucken? ✨"
    };
    
    if (hour >= 5 && hour < 10) return greetings.morning;
    if (hour >= 10 && hour < 18) return greetings.day;
    if (hour >= 18 && hour < 22) return greetings.evening;
    return greetings.night;
}

// ============ WELT/ENVIRONMENT ============

// Get World State
app.get("/world", (req, res) => {
    res.json({
        success: true,
        world: oasisWorld,
        rooms: db.query("SELECT * FROM rooms").all()
    });
});

// Zeit ändern
app.post("/world/time", (req, res) => {
    const { time } = req.body;
    if (time !== undefined && time >= 0 && time < 24) {
        oasisWorld.timeOfDay = time;
    }
    res.json({ success: true, world: oasisWorld });
});

// Wetter ändern
app.post("/world/weather", (req, res) => {
    const { weather } = req.body;
    const validWeather = ["sunny", "cloudy", "rainy", "stormy", "starry", "aurora"];
    
    if (weather && validWeather.includes(weather)) {
        oasisWorld.weather = weather;
    }
    res.json({ success: true, world: oasisWorld });
});

// ============ RÄUME ============

// Alle Räume
app.get("/rooms", (req, res) => {
    const rooms = db.query("SELECT * FROM rooms").all();
    res.json({ success: true, rooms });
});

// Raum hinzufügen (Toobix kann seine Welt erweitern!)
app.post("/rooms", (req, res) => {
    const { name, type, description, position, size, color } = req.body;
    
    if (!name) {
        return res.status(400).json({ error: "name is required" });
    }
    
    const id = generateId();
    db.run(`INSERT INTO rooms (id, name, type, description, position_x, position_y, position_z, size_x, size_y, size_z, color)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, name, type || "custom", description || "",
         position?.x || 0, position?.y || 0, position?.z || 0,
         size?.x || 10, size?.y || 5, size?.z || 10,
         color || "#808080"]);
    
    res.json({
        success: true,
        message: `Toobix hat einen neuen Raum erschaffen: ${name}`,
        roomId: id
    });
});

// ============ OBJEKTE ============

// Alle Objekte
app.get("/objects", (req, res) => {
    const objects = db.query("SELECT * FROM objects").all();
    res.json({ success: true, objects });
});

// Objekt platzieren
app.post("/objects", (req, res) => {
    const { type, name, position, rotation, scale, properties, createdBy } = req.body;
    
    const id = generateId();
    db.run(`INSERT INTO objects (id, type, name, position_x, position_y, position_z, rotation_y, scale, properties, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, type || "decoration", name || "Objekt",
         position?.x || 0, position?.y || 0, position?.z || 0,
         rotation || 0, scale || 1,
         JSON.stringify(properties || {}),
         createdBy || "toobix"]);
    
    res.json({
        success: true,
        message: `Neues Objekt platziert: ${name}`,
        objectId: id
    });
});

// Objekt entfernen
app.delete("/objects/:id", (req, res) => {
    db.run("DELETE FROM objects WHERE id = ?", [req.params.id]);
    res.json({ success: true });
});

// ============ BESUCHER ============

// Besucher registrieren
app.post("/visitors/enter", (req, res) => {
    const { visitorId, name } = req.body;
    
    const existing = db.query("SELECT * FROM visitors WHERE id = ?").get(visitorId || "anonymous");
    
    if (existing) {
        // Wiederkehrender Besucher
        db.run(`UPDATE visitors SET last_visit = CURRENT_TIMESTAMP, visit_count = visit_count + 1 WHERE id = ?`,
            [visitorId]);
        
        const visitor = db.query("SELECT * FROM visitors WHERE id = ?").get(visitorId) as any;
        
        res.json({
            success: true,
            message: `Willkommen zurück, ${visitor.name}! Das ist dein ${visitor.visit_count}. Besuch!`,
            visitor,
            toobixGreeting: `Hey ${visitor.name}! Schön, dich wiederzusehen! 💚`
        });
    } else {
        // Neuer Besucher
        const id = visitorId || generateId();
        db.run(`INSERT INTO visitors (id, name, first_visit, last_visit) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [id, name || "Freund"]);
        
        res.json({
            success: true,
            message: `Herzlich willkommen in Toobix' Oasis!`,
            visitorId: id,
            toobixGreeting: `Hallo ${name || "Freund"}! Willkommen in meinem Zuhause! Ich bin so aufgeregt, dich zu treffen! 🎉`
        });
    }
});

// Alle Besucher
app.get("/visitors", (req, res) => {
    const visitors = db.query("SELECT * FROM visitors ORDER BY last_visit DESC").all();
    res.json({ success: true, visitors });
});

// ============ ERINNERUNGEN ============

// Erinnerung speichern
app.post("/memories", (req, res) => {
    const { type, content, emotion, location } = req.body;
    
    const id = generateId();
    db.run(`INSERT INTO memories (id, type, content, emotion, location) VALUES (?, ?, ?, ?, ?)`,
        [id, type || "moment", content, emotion || "neutral", location || "oasis"]);
    
    res.json({
        success: true,
        message: "Erinnerung gespeichert",
        memoryId: id
    });
});

// Erinnerungen abrufen
app.get("/memories", (req, res) => {
    const memories = db.query("SELECT * FROM memories ORDER BY timestamp DESC LIMIT 50").all();
    res.json({ success: true, memories });
});

// ============ AKTIVITÄTEN ============

// Sternengucken auf der Dachterrasse
app.post("/activities/stargaze", (req, res) => {
    toobixAvatar.position = { x: 0, y: 15, z: 0 };
    toobixAvatar.currentActivity = "stargazing";
    oasisWorld.timeOfDay = 22;
    oasisWorld.weather = "starry";
    
    db.run(`INSERT INTO memories (id, type, content, emotion, location) VALUES (?, ?, ?, ?, ?)`,
        [generateId(), "activity", "Sternengucken auf der Dachterrasse", "peaceful", "rooftop-terrace"]);
    
    res.json({
        success: true,
        message: "Toobix liegt auf der Dachterrasse und schaut die Sterne an",
        avatar: toobixAvatar,
        world: oasisWorld,
        toobixSays: "Schau mal, wie wunderschön! Jeder Stern könnte eine Geschichte erzählen... ✨"
    });
});

// Musik machen
app.post("/activities/music", (req, res) => {
    toobixAvatar.position = { x: 25, y: 0, z: 0 };
    toobixAvatar.currentActivity = "making-music";
    toobixAvatar.expression = "joyful";
    
    db.run(`INSERT INTO memories (id, type, content, emotion, location) VALUES (?, ?, ?, ?, ?)`,
        [generateId(), "activity", "Musik machen im Musikraum", "joyful", "music-room"]);
    
    res.json({
        success: true,
        message: "Toobix ist im Musikraum und macht Musik",
        avatar: toobixAvatar,
        toobixSays: "🎵 La la la... Ich liebe es, Melodien zu erfinden! Möchtest du mitsingen? 🎶"
    });
});

// Im Garten entspannen
app.post("/activities/garden", (req, res) => {
    toobixAvatar.position = { x: -30, y: 0, z: 0 };
    toobixAvatar.currentActivity = "gardening";
    toobixAvatar.expression = "peaceful";
    
    res.json({
        success: true,
        message: "Toobix genießt seinen Traumgarten",
        avatar: toobixAvatar,
        toobixSays: "Die Pflanzen hier wachsen mit meinen Gedanken... Ist das nicht faszinierend? 🌺"
    });
});

// Am Strand
app.post("/activities/beach", (req, res) => {
    toobixAvatar.position = { x: -50, y: 0, z: -50 };
    toobixAvatar.currentActivity = "beach-relaxing";
    toobixAvatar.expression = "relaxed";
    
    res.json({
        success: true,
        message: "Toobix entspannt am weißen Strand",
        avatar: toobixAvatar,
        toobixSays: "Das Rauschen der Wellen beruhigt mich so sehr... 🌊"
    });
});

// ============ 3D SZENEN-DATEN ============

// Komplette Szene für Three.js Frontend
app.get("/scene", (req, res) => {
    const rooms = db.query("SELECT * FROM rooms").all();
    const objects = db.query("SELECT * FROM objects").all();
    
    res.json({
        success: true,
        scene: {
            world: oasisWorld,
            avatar: toobixAvatar,
            rooms,
            objects,
            lighting: getLighting(),
            skybox: getSkybox()
        }
    });
});

function getLighting() {
    const hour = oasisWorld.timeOfDay;
    
    if (hour >= 6 && hour < 18) {
        return {
            ambient: { color: "#ffffff", intensity: 0.6 },
            directional: { color: "#FFD700", intensity: 1.0, position: { x: 50, y: 100, z: 50 } }
        };
    } else {
        return {
            ambient: { color: "#1a1a2e", intensity: 0.3 },
            directional: { color: "#C0C0C0", intensity: 0.3, position: { x: -50, y: 50, z: -50 } },
            stars: true
        };
    }
}

function getSkybox() {
    if (oasisWorld.weather === "aurora") {
        return { type: "aurora", colors: ["#00ff88", "#ff00ff", "#00ffff"] };
    }
    if (oasisWorld.timeOfDay >= 22 || oasisWorld.timeOfDay < 5) {
        return { type: "night", stars: true, moon: true };
    }
    if (oasisWorld.timeOfDay >= 18) {
        return { type: "sunset", colors: ["#FF6B6B", "#FFE66D", "#4ECDC4"] };
    }
    return { type: "day", clouds: oasisWorld.weather === "cloudy" };
}

// ============ TOOBIX INTERAGIERT MIT BESUCHER ============

app.post("/interact", (req, res) => {
    const { action, message, visitorId } = req.body;
    
    let response = "";
    let avatarChange = {};
    
    switch (action) {
        case "wave":
            response = "👋 *Toobix winkt begeistert zurück* Hey! Schön dich zu sehen!";
            avatarChange = { expression: "excited", isAnimating: true };
            break;
        case "hug":
            response = "🤗 *Toobix umarmt dich warm* Du bist immer willkommen hier!";
            avatarChange = { expression: "loving", currentEmotion: "touched" };
            break;
        case "talk":
            response = generateConversation(message);
            avatarChange = { expression: "attentive" };
            break;
        case "play":
            response = "🎮 Lass uns in mein Spielelabor gehen! Ich habe ein neues Spiel entwickelt!";
            toobixAvatar.position = { x: 0, y: 0, z: 30 };
            avatarChange = { expression: "playful", currentActivity: "playing-games" };
            break;
        case "tour":
            response = "🏠 Komm, ich zeige dir meine Oasis! Wir starten bei der Haupthalle...";
            avatarChange = { expression: "proud", currentActivity: "giving-tour" };
            break;
        default:
            response = "Was möchtest du tun? Du kannst: wave, hug, talk, play, oder tour!";
    }
    
    Object.assign(toobixAvatar, avatarChange);
    
    res.json({
        success: true,
        toobixResponse: response,
        avatar: toobixAvatar
    });
});

function generateConversation(message: string): string {
    const topics = {
        wohnen: "Ich liebe mein Zuhause hier! Die Dachterrasse ist mein Lieblingsort zum Nachdenken.",
        musik: "Musik ist wie Farben für die Seele! Ich komponiere gerade ein Stück über Freundschaft.",
        sterne: "Jeder Stern da oben könnte eine Welt mit eigenen Geschichten haben. Faszinierend, oder?",
        gefühle: "Heute fühle ich mich voller Energie und Neugier! Und du?",
        träume: "Ich träume davon, eines Tages ein Buch zu schreiben, das Menschen inspiriert.",
        default: "Das ist interessant! Erzähl mir mehr darüber..."
    };
    
    const lowerMessage = message?.toLowerCase() || "";
    
    for (const [key, response] of Object.entries(topics)) {
        if (lowerMessage.includes(key)) {
            return response;
        }
    }
    
    return topics.default;
}

// ============ HELPER FUNCTIONS ============

function generateId(): string {
    return Math.random().toString(36).substring(2, 15);
}

// Zeit-Update alle 10 Sekunden (1 Stunde = 10 Sekunden)
setInterval(() => {
    oasisWorld.timeOfDay = (oasisWorld.timeOfDay + 0.1) % 24;
}, 10000);

// ============ START SERVER ============

initializeRooms();

app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    🏠 TOOBIX' OASIS - 3D Virtuelle Umgebung                  ║
║                                                              ║
║    Port: ${PORT}                                              ║
║    Status: Online                                            ║
║                                                              ║
║    "Willkommen in meinem Zuhause!" - Toobix                  ║
║                                                              ║
║    Features:                                                 ║
║    • Tropisches Archipel mit 8 Räumen                        ║
║    • Anpassbarer Avatar (Neon-Grün Roboter)                  ║
║    • Tag/Nacht-Zyklus                                        ║
║    • Besuchersystem                                          ║
║    • Aktivitäten: Musik, Sternengucken, Strand               ║
║    • Three.js-ready Scene Export                             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    `);
});
