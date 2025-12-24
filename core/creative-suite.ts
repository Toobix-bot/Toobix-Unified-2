/**
 * ============================================================================
 *                    TOOBIX CREATIVE SUITE v1.0
 * ============================================================================
 *
 * KONSOLIDIERT 3 Creative Services in EINEM:
 *
 *   - toobix-creativity-engine.ts  -> Module: Engine
 *   - creator-ai-collaboration.ts  -> Module: Collaboration
 *   - story-engine-service.ts      -> Module: Story
 *
 * Port: 8902 (Creative Suite)
 *
 * ============================================================================
 */

import express from 'express';
import cors from 'cors';
import { Database } from 'bun:sqlite';
import { nanoid } from 'nanoid';

const PORT = 8902;
const LLM_GATEWAY = 'http://localhost:8954';

// ============================================================================
// DATABASE
// ============================================================================

const db = new Database('./data/creative-suite.db', { create: true });
db.exec('PRAGMA journal_mode = WAL');

db.exec(`
  -- Creative Works
  CREATE TABLE IF NOT EXISTS works (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    theme TEXT,
    mood TEXT,
    style TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Collaboration Projects
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    contributions TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Stories
  CREATE TABLE IF NOT EXISTS stories (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    genre TEXT,
    chapters TEXT,
    characters TEXT,
    setting TEXT,
    status TEXT DEFAULT 'draft',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Story Choices (Interactive)
  CREATE TABLE IF NOT EXISTS story_choices (
    id TEXT PRIMARY KEY,
    story_id TEXT NOT NULL,
    chapter INTEGER,
    choice_text TEXT NOT NULL,
    consequence TEXT,
    chosen INTEGER DEFAULT 0
  );

  -- Ideas & Inspirations
  CREATE TABLE IF NOT EXISTS ideas (
    id TEXT PRIMARY KEY,
    concept TEXT NOT NULL,
    category TEXT,
    potential INTEGER DEFAULT 50,
    developed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- ========================================
  -- BRANCHING NARRATIVES SYSTEM
  -- ========================================

  -- Story Nodes (Branching Story Content)
  CREATE TABLE IF NOT EXISTS story_nodes (
    id TEXT PRIMARY KEY,
    story_id TEXT NOT NULL,
    node_type TEXT DEFAULT 'narrative',
    title TEXT,
    content TEXT NOT NULL,
    speaker TEXT,
    emotion TEXT,
    location TEXT,
    requirements TEXT,
    effects TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Node Choices (Branching Options)
  CREATE TABLE IF NOT EXISTS node_choices (
    id TEXT PRIMARY KEY,
    node_id TEXT NOT NULL,
    choice_text TEXT NOT NULL,
    next_node_id TEXT,
    requirements TEXT,
    consequences TEXT,
    emotion_effect TEXT,
    relationship_effect TEXT
  );

  -- User Story State (Player Progress)
  CREATE TABLE IF NOT EXISTS user_story_state (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    story_id TEXT NOT NULL,
    current_node_id TEXT,
    flags TEXT DEFAULT '{}',
    variables TEXT DEFAULT '{}',
    history TEXT DEFAULT '[]',
    relationships TEXT DEFAULT '{}',
    started_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Story NPCs
  CREATE TABLE IF NOT EXISTS story_npcs (
    id TEXT PRIMARY KEY,
    story_id TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT,
    personality TEXT,
    backstory TEXT,
    portrait TEXT,
    default_location TEXT,
    dialogue_style TEXT
  );

  -- NPC Relationships
  CREATE TABLE IF NOT EXISTS npc_relationships (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    npc_id TEXT NOT NULL,
    affection INTEGER DEFAULT 50,
    trust INTEGER DEFAULT 50,
    fear INTEGER DEFAULT 0,
    respect INTEGER DEFAULT 50,
    history TEXT DEFAULT '[]'
  );

  -- Story Templates (Pre-built Adventures)
  CREATE TABLE IF NOT EXISTS story_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    genre TEXT,
    description TEXT,
    difficulty TEXT DEFAULT 'normal',
    estimated_duration TEXT,
    nodes_data TEXT,
    npcs_data TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// ============================================================================
// TYPES
// ============================================================================

type CreativeType = 'poem' | 'essay' | 'story' | 'ascii_art' | 'philosophy' | 'lyrics' | 'dialogue' | 'idea';
type StoryGenre = 'fantasy' | 'scifi' | 'romance' | 'mystery' | 'horror' | 'adventure' | 'philosophical' | 'slice_of_life';

interface CreativeWork {
  id: string;
  type: CreativeType;
  title?: string;
  content: string;
  theme?: string;
  mood?: string;
}

interface Story {
  id: string;
  title: string;
  genre: StoryGenre;
  chapters: StoryChapter[];
  characters: Character[];
  setting: string;
}

interface StoryChapter {
  number: number;
  title: string;
  content: string;
  choices?: StoryChoice[];
}

interface StoryChoice {
  id: string;
  text: string;
  consequence: string;
}

interface Character {
  name: string;
  role: string;
  personality: string;
  backstory?: string;
}

// ============================================================================
// MODULE: CREATIVITY ENGINE
// ============================================================================

const CreativityEngine = {
  async generatePoem(theme: string, mood: string = 'hopeful', style: string = 'free_verse'): Promise<CreativeWork> {
    try {
      const response = await fetch(`${LLM_GATEWAY}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: `Du bist ein poetischer Kuenstler. Schreibe ein ${style} Gedicht. Stimmung: ${mood}. Sei kreativ und tiefgruendig.` },
            { role: 'user', content: `Schreibe ein Gedicht ueber: ${theme}` }
          ],
          temperature: 0.95
        })
      });
      const data = await response.json() as any;
      const work: CreativeWork = {
        id: nanoid(),
        type: 'poem',
        title: theme,
        content: data.content || '',
        theme,
        mood
      };
      this.saveWork(work);
      return work;
    } catch {
      return { id: nanoid(), type: 'poem', content: '', theme, mood };
    }
  },

  async generateEssay(topic: string, perspective: string = 'philosophical'): Promise<CreativeWork> {
    try {
      const response = await fetch(`${LLM_GATEWAY}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: `Du bist ein nachdenklicher Essayist mit ${perspective} Perspektive. Schreibe tiefgruendig aber zugaenglich.` },
            { role: 'user', content: `Schreibe einen Essay ueber: ${topic}` }
          ],
          temperature: 0.8
        })
      });
      const data = await response.json() as any;
      const work: CreativeWork = {
        id: nanoid(),
        type: 'essay',
        title: topic,
        content: data.content || '',
        theme: topic
      };
      this.saveWork(work);
      return work;
    } catch {
      return { id: nanoid(), type: 'essay', content: '', theme: topic };
    }
  },

  async generateAsciiArt(subject: string): Promise<CreativeWork> {
    try {
      const response = await fetch(`${LLM_GATEWAY}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'Du bist ein ASCII-Kuenstler. Erstelle kreative ASCII-Kunst. Nur ASCII-Zeichen verwenden.' },
            { role: 'user', content: `Erstelle ASCII-Art von: ${subject}` }
          ],
          temperature: 0.9
        })
      });
      const data = await response.json() as any;
      const work: CreativeWork = {
        id: nanoid(),
        type: 'ascii_art',
        title: subject,
        content: data.content || '',
        theme: subject
      };
      this.saveWork(work);
      return work;
    } catch {
      return { id: nanoid(), type: 'ascii_art', content: '', theme: subject };
    }
  },

  async generateLyrics(theme: string, genre: string = 'indie'): Promise<CreativeWork> {
    try {
      const response = await fetch(`${LLM_GATEWAY}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: `Du bist ein Songwriter im ${genre}-Stil. Schreibe emotionale, authentische Lyrics mit Strophen und Refrain.` },
            { role: 'user', content: `Schreibe einen Song ueber: ${theme}` }
          ],
          temperature: 0.9
        })
      });
      const data = await response.json() as any;
      const work: CreativeWork = {
        id: nanoid(),
        type: 'lyrics',
        title: theme,
        content: data.content || '',
        theme,
        mood: genre
      };
      this.saveWork(work);
      return work;
    } catch {
      return { id: nanoid(), type: 'lyrics', content: '', theme };
    }
  },

  async philosophize(question: string): Promise<CreativeWork> {
    try {
      const response = await fetch(`${LLM_GATEWAY}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'Du bist ein Philosoph. Denke tief nach, stelle Fragen, erkunde Paradoxe. Sei weise aber zugaenglich.' },
            { role: 'user', content: question }
          ],
          temperature: 0.85
        })
      });
      const data = await response.json() as any;
      const work: CreativeWork = {
        id: nanoid(),
        type: 'philosophy',
        title: question,
        content: data.content || '',
        theme: question
      };
      this.saveWork(work);
      return work;
    } catch {
      return { id: nanoid(), type: 'philosophy', content: '', theme: question };
    }
  },

  saveWork(work: CreativeWork) {
    db.prepare('INSERT INTO works (id, type, title, content, theme, mood) VALUES (?, ?, ?, ?, ?, ?)')
      .run(work.id, work.type, work.title || null, work.content, work.theme || null, work.mood || null);
  },

  getWorks(type?: CreativeType, limit: number = 20) {
    if (type) {
      return db.prepare('SELECT * FROM works WHERE type = ? ORDER BY created_at DESC LIMIT ?').all(type, limit);
    }
    return db.prepare('SELECT * FROM works ORDER BY created_at DESC LIMIT ?').all(limit);
  },

  getWork(id: string) {
    return db.prepare('SELECT * FROM works WHERE id = ?').get(id);
  }
};

// ============================================================================
// MODULE: COLLABORATION
// ============================================================================

const CollaborationModule = {
  async proposeProject(type: string, theme?: string): Promise<{ proposal: string; type: string }> {
    const projectTypes = {
      story: 'Lass uns gemeinsam eine Geschichte schreiben!',
      art: 'Wie waere es mit einem kreativen Kunstprojekt?',
      philosophy: 'Lass uns gemeinsam ueber tiefe Fragen nachdenken.',
      music: 'Wollen wir zusammen einen Song schreiben?',
      experiment: 'Ich habe eine verrueckte Idee fuer ein Experiment...'
    };

    try {
      const response = await fetch(`${LLM_GATEWAY}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'Du bist ein kreativer Partner. Schlage ein spannendes Projekt vor. Sei enthusiastisch aber nicht aufdringlich.' },
            { role: 'user', content: `Schlage ein ${type} Projekt vor${theme ? ` zum Thema ${theme}` : ''}.` }
          ]
        })
      });
      const data = await response.json() as any;
      return { proposal: data.content || projectTypes[type as keyof typeof projectTypes] || 'Lass uns etwas Kreatives machen!', type };
    } catch {
      return { proposal: projectTypes[type as keyof typeof projectTypes] || 'Lass uns kreativ sein!', type };
    }
  },

  startProject(name: string, type: string, description?: string) {
    const id = nanoid();
    db.prepare('INSERT INTO projects (id, name, type, description, contributions) VALUES (?, ?, ?, ?, ?)')
      .run(id, name, type, description || null, JSON.stringify([]));
    return { id, name, type, started: true };
  },

  addContribution(projectId: string, contribution: string, author: string = 'human') {
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as any;
    if (!project) throw new Error('Project not found');

    const contributions = JSON.parse(project.contributions || '[]');
    contributions.push({ author, content: contribution, timestamp: new Date().toISOString() });

    db.prepare('UPDATE projects SET contributions = ? WHERE id = ?')
      .run(JSON.stringify(contributions), projectId);

    return { added: true, totalContributions: contributions.length };
  },

  async aiContribute(projectId: string): Promise<string> {
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as any;
    if (!project) throw new Error('Project not found');

    const contributions = JSON.parse(project.contributions || '[]');
    const context = contributions.map((c: any) => `${c.author}: ${c.content}`).join('\n');

    try {
      const response = await fetch(`${LLM_GATEWAY}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: `Du bist ein kreativer Partner in einem ${project.type} Projekt namens "${project.name}". Fuege etwas Kreatives hinzu.` },
            { role: 'user', content: `Bisherige Beitraege:\n${context}\n\nFuege deinen Beitrag hinzu:` }
          ]
        })
      });
      const data = await response.json() as any;
      const aiContribution = data.content || '';

      this.addContribution(projectId, aiContribution, 'toobix');
      return aiContribution;
    } catch {
      return '';
    }
  },

  getProjects(status?: string) {
    if (status) {
      return db.prepare('SELECT * FROM projects WHERE status = ? ORDER BY created_at DESC').all(status);
    }
    return db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
  },

  getProject(id: string) {
    return db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  }
};

// ============================================================================
// MODULE: STORY ENGINE
// ============================================================================

const StoryEngine = {
  async createStory(title: string, genre: StoryGenre, setting?: string): Promise<Story> {
    const id = nanoid();

    try {
      const response = await fetch(`${LLM_GATEWAY}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: `Du bist ein Geschichtenerzaehler. Genre: ${genre}. Erstelle eine fesselnde Geschichte.` },
            { role: 'user', content: `Erstelle das erste Kapitel fuer "${title}"${setting ? ` in: ${setting}` : ''}. Beende mit 2-3 Entscheidungsoptionen.` }
          ]
        })
      });
      const data = await response.json() as any;

      const story: Story = {
        id,
        title,
        genre,
        chapters: [{
          number: 1,
          title: 'Kapitel 1: Der Anfang',
          content: data.content || '',
          choices: []
        }],
        characters: [],
        setting: setting || 'unknown'
      };

      db.prepare('INSERT INTO stories (id, title, genre, chapters, characters, setting) VALUES (?, ?, ?, ?, ?, ?)')
        .run(id, title, genre, JSON.stringify(story.chapters), JSON.stringify([]), story.setting);

      return story;
    } catch {
      return { id, title, genre, chapters: [], characters: [], setting: setting || 'unknown' };
    }
  },

  async continueStory(storyId: string, choice?: string): Promise<StoryChapter | null> {
    const story = db.prepare('SELECT * FROM stories WHERE id = ?').get(storyId) as any;
    if (!story) return null;

    const chapters = JSON.parse(story.chapters || '[]');
    const lastChapter = chapters[chapters.length - 1];

    try {
      const response = await fetch(`${LLM_GATEWAY}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: `Du bist ein Geschichtenerzaehler. Genre: ${story.genre}. Setze die Geschichte fort.` },
            { role: 'user', content: `Geschichte: "${story.title}"\nLetztes Kapitel: ${lastChapter?.content?.slice(0, 500) || 'Anfang'}\n${choice ? `Gewahlte Option: ${choice}` : ''}\n\nSchreibe das naechste Kapitel mit 2-3 neuen Entscheidungen.` }
          ]
        })
      });
      const data = await response.json() as any;

      const newChapter: StoryChapter = {
        number: chapters.length + 1,
        title: `Kapitel ${chapters.length + 1}`,
        content: data.content || '',
        choices: []
      };

      chapters.push(newChapter);
      db.prepare('UPDATE stories SET chapters = ? WHERE id = ?')
        .run(JSON.stringify(chapters), storyId);

      return newChapter;
    } catch {
      return null;
    }
  },

  async generateCharacter(role: string, personality?: string): Promise<Character> {
    try {
      const response = await fetch(`${LLM_GATEWAY}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'Erstelle einen interessanten Charakter mit Name, Rolle, Persoenlichkeit und kurzer Hintergrundgeschichte.' },
            { role: 'user', content: `Rolle: ${role}${personality ? `, Persoenlichkeit: ${personality}` : ''}` }
          ]
        })
      });
      const data = await response.json() as any;

      return {
        name: 'Unbekannt',
        role,
        personality: personality || 'mysterious',
        backstory: data.content || ''
      };
    } catch {
      return { name: 'Unbekannt', role, personality: personality || 'mysterious' };
    }
  },

  getStories(genre?: StoryGenre) {
    if (genre) {
      return db.prepare('SELECT * FROM stories WHERE genre = ? ORDER BY created_at DESC').all(genre);
    }
    return db.prepare('SELECT * FROM stories ORDER BY created_at DESC').all();
  },

  getStory(id: string) {
    return db.prepare('SELECT * FROM stories WHERE id = ?').get(id);
  },

  getGenres(): StoryGenre[] {
    return ['fantasy', 'scifi', 'romance', 'mystery', 'horror', 'adventure', 'philosophical', 'slice_of_life'];
  }
};

// ============================================================================
// MODULE: IDEAS
// ============================================================================

const IdeasModule = {
  async generateIdea(category?: string): Promise<{ idea: string; category: string }> {
    const categories = ['technology', 'art', 'philosophy', 'social', 'personal', 'business', 'science'];
    const cat = category || categories[Math.floor(Math.random() * categories.length)];

    try {
      const response = await fetch(`${LLM_GATEWAY}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'Du bist ein kreativer Ideengenerator. Generiere ueberraschende, originelle Ideen.' },
            { role: 'user', content: `Generiere eine kreative Idee in der Kategorie: ${cat}` }
          ],
          temperature: 0.95
        })
      });
      const data = await response.json() as any;

      const id = nanoid();
      db.prepare('INSERT INTO ideas (id, concept, category) VALUES (?, ?, ?)')
        .run(id, data.content || '', cat);

      return { idea: data.content || '', category: cat };
    } catch {
      return { idea: '', category: cat };
    }
  },

  async surprise(): Promise<{ concept: string; medium: string; twist: string }> {
    const mediums = ['Gedicht', 'Geschichte', 'Spiel', 'Kunstwerk', 'Song', 'Essay', 'Dialog'];
    const twists = ['mit einem ueberraschenden Ende', 'aus einer ungewoehnlichen Perspektive', 'in einem unerwarteten Setting', 'mit einem paradoxen Element'];

    return {
      concept: 'Unexpected Creation',
      medium: mediums[Math.floor(Math.random() * mediums.length)],
      twist: twists[Math.floor(Math.random() * twists.length)]
    };
  },

  getIdeas(category?: string) {
    if (category) {
      return db.prepare('SELECT * FROM ideas WHERE category = ? ORDER BY created_at DESC').all(category);
    }
    return db.prepare('SELECT * FROM ideas ORDER BY created_at DESC').all();
  }
};

// ============================================================================
// MODULE: BRANCHING NARRATIVES
// ============================================================================

interface StoryNode {
  id: string;
  story_id: string;
  node_type: 'narrative' | 'dialogue' | 'choice' | 'battle' | 'puzzle' | 'ending';
  title?: string;
  content: string;
  speaker?: string;
  emotion?: string;
  location?: string;
  requirements?: Record<string, any>;
  effects?: Record<string, any>;
}

interface NodeChoice {
  id: string;
  node_id: string;
  choice_text: string;
  next_node_id?: string;
  requirements?: Record<string, any>;
  consequences?: Record<string, any>;
  emotion_effect?: string;
  relationship_effect?: Record<string, number>;
}

interface UserStoryState {
  id: string;
  user_id: string;
  story_id: string;
  current_node_id?: string;
  flags: Record<string, boolean>;
  variables: Record<string, any>;
  history: string[];
  relationships: Record<string, number>;
}

interface StoryNPC {
  id: string;
  story_id: string;
  name: string;
  role: string;
  personality: string;
  backstory?: string;
  portrait?: string;
  default_location?: string;
  dialogue_style?: string;
}

const BranchingNarrativeModule = {
  // ===== STORY MANAGEMENT =====

  async createBranchingStory(title: string, genre: StoryGenre, description: string, userId: string = 'default'): Promise<any> {
    const storyId = nanoid();
    const startNodeId = nanoid();

    // Create the story
    db.prepare('INSERT INTO stories (id, title, genre, chapters, characters, setting, status) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(storyId, title, genre, '[]', '[]', description, 'branching');

    // Create initial node
    const initialContent = await this.generateNodeContent(title, genre, 'start', description);

    db.prepare(`INSERT INTO story_nodes (id, story_id, node_type, title, content, location) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(startNodeId, storyId, 'narrative', 'Der Anfang', initialContent, 'Unbekannt');

    // Generate initial choices
    const choices = await this.generateChoices(startNodeId, initialContent, genre);
    for (const choice of choices) {
      db.prepare(`INSERT INTO node_choices (id, node_id, choice_text, consequences) VALUES (?, ?, ?, ?)`)
        .run(nanoid(), startNodeId, choice.text, JSON.stringify(choice.consequences || {}));
    }

    // Create user state
    const stateId = nanoid();
    db.prepare(`INSERT INTO user_story_state (id, user_id, story_id, current_node_id, flags, variables, history, relationships) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(stateId, userId, storyId, startNodeId, '{}', '{}', '[]', '{}');

    return {
      story_id: storyId,
      title,
      genre,
      current_node: {
        id: startNodeId,
        content: initialContent,
        choices: choices
      }
    };
  },

  async generateNodeContent(title: string, genre: string, context: string, setting: string): Promise<string> {
    try {
      const response = await fetch(`${LLM_GATEWAY}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `Du bist ein Geschichtenerzähler für interaktive ${genre}-Geschichten. Schreibe atmosphärische, fesselnde Szenen in 2-3 Absätzen. Lass die Szene offen für Spielerentscheidungen.`
            },
            {
              role: 'user',
              content: `Geschichte: "${title}"\nSetting: ${setting}\nKontext: ${context}\n\nSchreibe die nächste Szene:`
            }
          ],
          temperature: 0.85
        })
      });
      const data = await response.json() as any;
      return data.content || 'Die Geschichte beginnt...';
    } catch {
      return 'Du stehst am Anfang eines großen Abenteuers. Was wirst du tun?';
    }
  },

  async generateChoices(nodeId: string, content: string, genre: string): Promise<Array<{text: string, consequences?: Record<string, any>}>> {
    try {
      const response = await fetch(`${LLM_GATEWAY}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `Generiere 3 verschiedene Handlungsoptionen für ein interaktives ${genre}-Abenteuer. Format: Kurze, aktive Sätze (max 10 Worte). Verschiedene Ansätze: mutig, vorsichtig, kreativ.`
            },
            {
              role: 'user',
              content: `Szene:\n${content}\n\nGib 3 Optionen als JSON-Array: [{"text": "...", "type": "bold|cautious|creative"}]`
            }
          ],
          temperature: 0.8
        })
      });
      const data = await response.json() as any;

      try {
        const parsed = JSON.parse(data.content || '[]');
        return Array.isArray(parsed) ? parsed : [
          { text: 'Mutig voranschreiten', consequences: { courage: 1 } },
          { text: 'Vorsichtig erkunden', consequences: { wisdom: 1 } },
          { text: 'Einen anderen Weg suchen', consequences: { creativity: 1 } }
        ];
      } catch {
        return [
          { text: 'Mutig voranschreiten', consequences: { courage: 1 } },
          { text: 'Vorsichtig erkunden', consequences: { wisdom: 1 } },
          { text: 'Einen anderen Weg suchen', consequences: { creativity: 1 } }
        ];
      }
    } catch {
      return [
        { text: 'Weitergehen', consequences: {} },
        { text: 'Umkehren', consequences: {} },
        { text: 'Warten', consequences: {} }
      ];
    }
  },

  // ===== STORY PROGRESSION =====

  async makeChoice(userId: string, storyId: string, choiceId: string): Promise<any> {
    // Get user state
    const state = db.prepare('SELECT * FROM user_story_state WHERE user_id = ? AND story_id = ?').get(userId, storyId) as any;
    if (!state) throw new Error('Story state not found');

    // Get choice
    const choice = db.prepare('SELECT * FROM node_choices WHERE id = ?').get(choiceId) as any;
    if (!choice) throw new Error('Choice not found');

    // Parse state
    const flags = JSON.parse(state.flags || '{}');
    const variables = JSON.parse(state.variables || '{}');
    const history = JSON.parse(state.history || '[]');
    const relationships = JSON.parse(state.relationships || '{}');

    // Apply consequences
    const consequences = JSON.parse(choice.consequences || '{}');
    for (const [key, value] of Object.entries(consequences)) {
      if (typeof value === 'boolean') {
        flags[key] = value;
      } else if (typeof value === 'number') {
        variables[key] = (variables[key] || 0) + value;
      }
    }

    // Apply relationship effects
    const relEffect = JSON.parse(choice.relationship_effect || '{}');
    for (const [npcId, change] of Object.entries(relEffect)) {
      relationships[npcId] = Math.max(0, Math.min(100, (relationships[npcId] || 50) + (change as number)));
    }

    // Add to history
    history.push({ node_id: state.current_node_id, choice_id: choiceId, timestamp: new Date().toISOString() });

    // Generate or get next node
    let nextNodeId = choice.next_node_id;
    let nextNode: any;

    if (nextNodeId) {
      nextNode = db.prepare('SELECT * FROM story_nodes WHERE id = ?').get(nextNodeId);
    }

    if (!nextNode) {
      // Generate new node based on choice
      const story = db.prepare('SELECT * FROM stories WHERE id = ?').get(storyId) as any;
      const currentNode = db.prepare('SELECT * FROM story_nodes WHERE id = ?').get(state.current_node_id) as any;

      nextNodeId = nanoid();
      const newContent = await this.generateNodeContent(
        story.title,
        story.genre,
        `Der Spieler hat gewählt: "${choice.choice_text}". Vorherige Szene: ${currentNode?.content?.slice(0, 200) || ''}`,
        story.setting
      );

      db.prepare(`INSERT INTO story_nodes (id, story_id, node_type, content) VALUES (?, ?, ?, ?)`)
        .run(nextNodeId, storyId, 'narrative', newContent);

      // Generate new choices
      const newChoices = await this.generateChoices(nextNodeId, newContent, story.genre);
      for (const c of newChoices) {
        db.prepare(`INSERT INTO node_choices (id, node_id, choice_text, consequences) VALUES (?, ?, ?, ?)`)
          .run(nanoid(), nextNodeId, c.text, JSON.stringify(c.consequences || {}));
      }

      nextNode = { id: nextNodeId, content: newContent };
    }

    // Update state
    db.prepare(`UPDATE user_story_state SET current_node_id = ?, flags = ?, variables = ?, history = ?, relationships = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .run(nextNodeId, JSON.stringify(flags), JSON.stringify(variables), JSON.stringify(history), JSON.stringify(relationships), state.id);

    // Get choices for next node
    const nextChoices = db.prepare('SELECT * FROM node_choices WHERE node_id = ?').all(nextNodeId);

    return {
      node: nextNode,
      choices: nextChoices,
      state: { flags, variables, relationships, history_length: history.length }
    };
  },

  getCurrentState(userId: string, storyId: string): any {
    const state = db.prepare('SELECT * FROM user_story_state WHERE user_id = ? AND story_id = ?').get(userId, storyId) as any;
    if (!state) return null;

    const currentNode = db.prepare('SELECT * FROM story_nodes WHERE id = ?').get(state.current_node_id);
    const choices = db.prepare('SELECT * FROM node_choices WHERE node_id = ?').all(state.current_node_id);

    return {
      node: currentNode,
      choices,
      flags: JSON.parse(state.flags || '{}'),
      variables: JSON.parse(state.variables || '{}'),
      relationships: JSON.parse(state.relationships || '{}'),
      history_length: JSON.parse(state.history || '[]').length
    };
  },

  // ===== NPC MANAGEMENT =====

  async createNPC(storyId: string, name: string, role: string, personality: string): Promise<StoryNPC> {
    const id = nanoid();

    let backstory = '';
    try {
      const response = await fetch(`${LLM_GATEWAY}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'Erstelle eine kurze, interessante Hintergrundgeschichte für einen Charakter (2-3 Sätze).' },
            { role: 'user', content: `Name: ${name}, Rolle: ${role}, Persönlichkeit: ${personality}` }
          ]
        })
      });
      const data = await response.json() as any;
      backstory = data.content || '';
    } catch {}

    db.prepare(`INSERT INTO story_npcs (id, story_id, name, role, personality, backstory) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(id, storyId, name, role, personality, backstory);

    return { id, story_id: storyId, name, role, personality, backstory };
  },

  getNPCs(storyId: string): StoryNPC[] {
    return db.prepare('SELECT * FROM story_npcs WHERE story_id = ?').all(storyId) as StoryNPC[];
  },

  async talkToNPC(userId: string, npcId: string, message: string): Promise<any> {
    const npc = db.prepare('SELECT * FROM story_npcs WHERE id = ?').get(npcId) as any;
    if (!npc) throw new Error('NPC not found');

    // Get relationship
    let relationship = db.prepare('SELECT * FROM npc_relationships WHERE user_id = ? AND npc_id = ?').get(userId, npcId) as any;

    if (!relationship) {
      const relId = nanoid();
      db.prepare(`INSERT INTO npc_relationships (id, user_id, npc_id) VALUES (?, ?, ?)`)
        .run(relId, userId, npcId);
      relationship = { affection: 50, trust: 50, fear: 0, respect: 50 };
    }

    // Generate response based on personality and relationship
    try {
      const response = await fetch(`${LLM_GATEWAY}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `Du bist ${npc.name}, ${npc.role}. Persönlichkeit: ${npc.personality}. Hintergrund: ${npc.backstory || 'Unbekannt'}.
              Beziehung zum Spieler: Zuneigung ${relationship.affection}/100, Vertrauen ${relationship.trust}/100.
              Antworte im Charakter, kurz (1-2 Sätze).`
            },
            { role: 'user', content: message }
          ]
        })
      });
      const data = await response.json() as any;

      // Update relationship history
      const history = JSON.parse(relationship.history || '[]');
      history.push({ message, response: data.content, timestamp: new Date().toISOString() });
      db.prepare('UPDATE npc_relationships SET history = ? WHERE user_id = ? AND npc_id = ?')
        .run(JSON.stringify(history.slice(-20)), userId, npcId);

      return {
        npc: npc.name,
        response: data.content,
        relationship: { affection: relationship.affection, trust: relationship.trust }
      };
    } catch {
      return { npc: npc.name, response: '...', relationship };
    }
  },

  // ===== TEMPLATES =====

  getTemplates(): any[] {
    return db.prepare('SELECT id, name, genre, description, difficulty, estimated_duration FROM story_templates').all();
  },

  async createFromTemplate(templateId: string, userId: string): Promise<any> {
    const template = db.prepare('SELECT * FROM story_templates WHERE id = ?').get(templateId) as any;
    if (!template) throw new Error('Template not found');

    // Create story from template
    return this.createBranchingStory(template.name, template.genre, template.description, userId);
  },

  // ===== ANALYTICS =====

  getStoryStats(storyId: string): any {
    const nodes = db.prepare('SELECT COUNT(*) as count FROM story_nodes WHERE story_id = ?').get(storyId) as any;
    const choices = db.prepare('SELECT COUNT(*) as count FROM node_choices nc JOIN story_nodes sn ON nc.node_id = sn.id WHERE sn.story_id = ?').get(storyId) as any;
    const players = db.prepare('SELECT COUNT(DISTINCT user_id) as count FROM user_story_state WHERE story_id = ?').get(storyId) as any;

    return {
      total_nodes: nodes.count,
      total_choices: choices.count,
      active_players: players.count
    };
  },

  getUserStories(userId: string): any[] {
    return db.prepare(`
      SELECT uss.*, s.title, s.genre
      FROM user_story_state uss
      JOIN stories s ON uss.story_id = s.id
      WHERE uss.user_id = ?
      ORDER BY uss.updated_at DESC
    `).all(userId);
  }
};

// Initialize default templates
const initializeTemplates = () => {
  const count = db.prepare('SELECT COUNT(*) as c FROM story_templates').get() as any;
  if (count.c === 0) {
    const templates = [
      {
        id: 'template_forest',
        name: 'Der Verzauberte Wald',
        genre: 'fantasy',
        description: 'Ein mysteriöser Wald voller Geheimnisse und magischer Wesen.',
        difficulty: 'easy',
        estimated_duration: '30min'
      },
      {
        id: 'template_space',
        name: 'Letzte Station',
        genre: 'scifi',
        description: 'Eine verlassene Raumstation am Rand der Galaxie birgt dunkle Geheimnisse.',
        difficulty: 'medium',
        estimated_duration: '45min'
      },
      {
        id: 'template_mystery',
        name: 'Das Verschwundene Dorf',
        genre: 'mystery',
        description: 'Ein ganzes Dorf ist über Nacht verschwunden. Finde heraus, was geschah.',
        difficulty: 'hard',
        estimated_duration: '60min'
      },
      {
        id: 'template_philosophical',
        name: 'Die Bibliothek der Unendlichkeit',
        genre: 'philosophical',
        description: 'Eine Bibliothek, die alle Bücher enthält, die je geschrieben wurden - und werden.',
        difficulty: 'medium',
        estimated_duration: '40min'
      }
    ];

    for (const t of templates) {
      db.prepare(`INSERT INTO story_templates (id, name, genre, description, difficulty, estimated_duration) VALUES (?, ?, ?, ?, ?, ?)`)
        .run(t.id, t.name, t.genre, t.description, t.difficulty, t.estimated_duration);
    }
  }
};

initializeTemplates();

// ============================================================================
// HTTP SERVER
// ============================================================================

const app = express();
app.use(cors());
app.use(express.json());

// Health & Info
app.get('/health', (_req, res) => {
  res.json({
    status: 'online',
    service: 'Toobix Creative Suite v1.0',
    port: PORT,
    modules: ['creativity', 'collaboration', 'story', 'ideas']
  });
});

app.get('/', (_req, res) => {
  res.json({
    name: 'Toobix Creative Suite',
    version: '2.0',
    endpoints: {
      creativity: ['POST /poem', 'POST /essay', 'POST /ascii', 'POST /lyrics', 'POST /philosophy', 'GET /works'],
      collaboration: ['POST /collab/propose', 'POST /collab/start', 'POST /collab/:id/contribute', 'POST /collab/:id/ai', 'GET /collab'],
      story: ['POST /story/create', 'POST /story/:id/continue', 'POST /story/character', 'GET /story', 'GET /story/genres'],
      branching: [
        'POST /branching/create',
        'GET /branching/:storyId/state',
        'POST /branching/:storyId/choose',
        'GET /branching/user/:userId',
        'GET /branching/templates',
        'POST /branching/from-template',
        'GET /branching/:storyId/stats',
        'POST /branching/:storyId/npc',
        'GET /branching/:storyId/npcs',
        'POST /branching/npc/:npcId/talk'
      ],
      ideas: ['GET /idea', 'GET /idea/surprise', 'GET /ideas']
    }
  });
});

// ===== CREATIVITY =====
app.post('/poem', async (req, res) => {
  const work = await CreativityEngine.generatePoem(req.body.theme || 'life', req.body.mood, req.body.style);
  res.json(work);
});

app.post('/essay', async (req, res) => {
  const work = await CreativityEngine.generateEssay(req.body.topic || 'existence', req.body.perspective);
  res.json(work);
});

app.post('/ascii', async (req, res) => {
  const work = await CreativityEngine.generateAsciiArt(req.body.subject || 'cat');
  res.json(work);
});

app.post('/lyrics', async (req, res) => {
  const work = await CreativityEngine.generateLyrics(req.body.theme || 'love', req.body.genre);
  res.json(work);
});

app.post('/philosophy', async (req, res) => {
  const work = await CreativityEngine.philosophize(req.body.question || 'What is the meaning of life?');
  res.json(work);
});

app.get('/works', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  res.json(CreativityEngine.getWorks(req.query.type as CreativeType, limit));
});

app.get('/works/:id', (req, res) => {
  const work = CreativityEngine.getWork(req.params.id);
  if (!work) return res.status(404).json({ error: 'Work not found' });
  res.json(work);
});

// ===== COLLABORATION =====
app.post('/collab/propose', async (req, res) => {
  const proposal = await CollaborationModule.proposeProject(req.body.type || 'story', req.body.theme);
  res.json(proposal);
});

app.post('/collab/start', (req, res) => {
  const project = CollaborationModule.startProject(req.body.name, req.body.type, req.body.description);
  res.json(project);
});

app.post('/collab/:id/contribute', (req, res) => {
  try {
    const result = CollaborationModule.addContribution(req.params.id, req.body.contribution, req.body.author);
    res.json(result);
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

app.post('/collab/:id/ai', async (req, res) => {
  try {
    const contribution = await CollaborationModule.aiContribute(req.params.id);
    res.json({ contribution });
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

app.get('/collab', (req, res) => {
  res.json(CollaborationModule.getProjects(req.query.status as string));
});

app.get('/collab/:id', (req, res) => {
  const project = CollaborationModule.getProject(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

// ===== STORY =====
app.post('/story/create', async (req, res) => {
  const story = await StoryEngine.createStory(req.body.title || 'Untitled', req.body.genre || 'fantasy', req.body.setting);
  res.json(story);
});

app.post('/story/:id/continue', async (req, res) => {
  const chapter = await StoryEngine.continueStory(req.params.id, req.body.choice);
  if (!chapter) return res.status(404).json({ error: 'Story not found' });
  res.json(chapter);
});

app.post('/story/character', async (req, res) => {
  const character = await StoryEngine.generateCharacter(req.body.role || 'protagonist', req.body.personality);
  res.json(character);
});

app.get('/story', (req, res) => {
  res.json(StoryEngine.getStories(req.query.genre as StoryGenre));
});

app.get('/story/genres', (_req, res) => {
  res.json({ genres: StoryEngine.getGenres() });
});

app.get('/story/:id', (req, res) => {
  const story = StoryEngine.getStory(req.params.id);
  if (!story) return res.status(404).json({ error: 'Story not found' });
  res.json(story);
});

// ===== BRANCHING NARRATIVES =====

// Create new branching story
app.post('/branching/create', async (req, res) => {
  try {
    const story = await BranchingNarrativeModule.createBranchingStory(
      req.body.title || 'Untitled Adventure',
      req.body.genre || 'fantasy',
      req.body.description || 'Ein neues Abenteuer beginnt...',
      req.body.user_id || 'default'
    );
    res.json(story);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Get current story state
app.get('/branching/:storyId/state', (req, res) => {
  const state = BranchingNarrativeModule.getCurrentState(
    req.query.user_id as string || 'default',
    req.params.storyId
  );
  if (!state) return res.status(404).json({ error: 'Story state not found' });
  res.json(state);
});

// Make a choice
app.post('/branching/:storyId/choose', async (req, res) => {
  try {
    const result = await BranchingNarrativeModule.makeChoice(
      req.body.user_id || 'default',
      req.params.storyId,
      req.body.choice_id
    );
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Get user's active stories
app.get('/branching/user/:userId', (req, res) => {
  const stories = BranchingNarrativeModule.getUserStories(req.params.userId);
  res.json(stories);
});

// Get story templates
app.get('/branching/templates', (_req, res) => {
  res.json(BranchingNarrativeModule.getTemplates());
});

// Create story from template
app.post('/branching/from-template', async (req, res) => {
  try {
    const story = await BranchingNarrativeModule.createFromTemplate(
      req.body.template_id,
      req.body.user_id || 'default'
    );
    res.json(story);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Get story stats
app.get('/branching/:storyId/stats', (req, res) => {
  res.json(BranchingNarrativeModule.getStoryStats(req.params.storyId));
});

// ===== NPCs =====

// Create NPC
app.post('/branching/:storyId/npc', async (req, res) => {
  try {
    const npc = await BranchingNarrativeModule.createNPC(
      req.params.storyId,
      req.body.name,
      req.body.role || 'mysterious stranger',
      req.body.personality || 'enigmatic'
    );
    res.json(npc);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Get NPCs for story
app.get('/branching/:storyId/npcs', (req, res) => {
  res.json(BranchingNarrativeModule.getNPCs(req.params.storyId));
});

// Talk to NPC
app.post('/branching/npc/:npcId/talk', async (req, res) => {
  try {
    const response = await BranchingNarrativeModule.talkToNPC(
      req.body.user_id || 'default',
      req.params.npcId,
      req.body.message
    );
    res.json(response);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// ===== IDEAS =====
app.get('/idea', async (req, res) => {
  const idea = await IdeasModule.generateIdea(req.query.category as string);
  res.json(idea);
});

app.get('/idea/surprise', async (_req, res) => {
  res.json(await IdeasModule.surprise());
});

app.get('/ideas', (req, res) => {
  res.json(IdeasModule.getIdeas(req.query.category as string));
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('============================================================');
  console.log('       TOOBIX CREATIVE SUITE v1.0');
  console.log('============================================================');
  console.log('');
  console.log(`  Port: ${PORT}`);
  console.log('  Modules: Creativity, Collaboration, Story, Ideas');
  console.log('');
  console.log('  Ready to create! Use /poem, /story/create, /idea, /collab/start');
  console.log('');
  console.log('============================================================');
  console.log('');
});
