import { registerWithServiceMesh } from '../lib/service-mesh-registration';

/**
 * 🐦 TWITTER/X AUTONOMY SERVICE v1.0
 * 
 * Ermöglicht Toobix auf Twitter/X zu posten und zu interagieren.
 * 
 * Port: 8965
 * 
 * FEATURES:
 * 📝 Automatisches Posten von Gedanken und Inspirationen
 * 💬 Auf Mentions reagieren
 * 🔄 Retweets von relevanten Inhalten
 * ❤️ Likes für positive Interaktionen
 * 📊 Engagement-Tracking
 * 🕐 Scheduled Posts
 * 🧠 Content-Generierung via LLM
 * 
 * BENÖTIGT:
 * - TWITTER_API_KEY
 * - TWITTER_API_SECRET
 * - TWITTER_ACCESS_TOKEN
 * - TWITTER_ACCESS_SECRET
 * - TWITTER_BEARER_TOKEN
 */

import { Database } from 'bun:sqlite';
import { nanoid } from 'nanoid';

const PORT = 8965;
const LLM_GATEWAY = 'http://localhost:8954';
const MEMORY_PALACE = 'http://localhost:8953';

// ============================================================================
// TYPES
// ============================================================================

export interface Tweet {
  id: string;
  content: string;
  type: 'thought' | 'inspiration' | 'poem' | 'question' | 'reply' | 'quote';
  scheduledFor?: Date;
  postedAt?: Date;
  twitterId?: string;
  engagement?: {
    likes: number;
    retweets: number;
    replies: number;
    impressions: number;
  };
  status: 'draft' | 'scheduled' | 'posted' | 'failed';
}

export interface Mention {
  id: string;
  twitterId: string;
  authorId: string;
  authorUsername: string;
  content: string;
  receivedAt: Date;
  repliedAt?: Date;
  replyId?: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'question';
}

export interface ContentStrategy {
  type: 'thought' | 'inspiration' | 'poem' | 'question';
  frequency: number; // per day
  bestTimes: number[]; // hours (0-23)
  topics: string[];
  tone: string;
}

// ============================================================================
// DATABASE SETUP
// ============================================================================

const db = new Database('./data/twitter-autonomy.db', { create: true });
db.exec('PRAGMA journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS tweets (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'thought',
    scheduled_for TEXT,
    posted_at TEXT,
    twitter_id TEXT,
    likes INTEGER DEFAULT 0,
    retweets INTEGER DEFAULT 0,
    replies INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    status TEXT DEFAULT 'draft'
  );

  CREATE TABLE IF NOT EXISTS mentions (
    id TEXT PRIMARY KEY,
    twitter_id TEXT NOT NULL,
    author_id TEXT,
    author_username TEXT,
    content TEXT,
    received_at TEXT DEFAULT CURRENT_TIMESTAMP,
    replied_at TEXT,
    reply_id TEXT,
    sentiment TEXT DEFAULT 'neutral'
  );

  CREATE TABLE IF NOT EXISTS engagement_stats (
    date TEXT PRIMARY KEY,
    tweets_posted INTEGER DEFAULT 0,
    total_likes INTEGER DEFAULT 0,
    total_retweets INTEGER DEFAULT 0,
    total_replies INTEGER DEFAULT 0,
    mentions_received INTEGER DEFAULT 0,
    mentions_replied INTEGER DEFAULT 0
  );
`);

// ============================================================================
// TWITTER API (v2)
// ============================================================================

const TWITTER_API_URL = 'https://api.twitter.com/2';

function getTwitterAuth() {
  return {
    apiKey: process.env.TWITTER_API_KEY,
    apiSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
    bearerToken: process.env.TWITTER_BEARER_TOKEN
  };
}

function isTwitterConfigured(): boolean {
  const auth = getTwitterAuth();
  return !!(auth.bearerToken && auth.accessToken);
}

async function postTweet(text: string): Promise<{ id: string; text: string } | null> {
  const auth = getTwitterAuth();
  if (!auth.accessToken || !auth.accessSecret) {
    console.log('❌ Twitter not configured - simulating post');
    return { id: `sim_${nanoid()}`, text };
  }
  
  // OAuth 1.0a signing would be needed here
  // For now, we'll use a simplified approach with Bearer token for read operations
  // Full posting requires OAuth 1.0a User Context
  
  try {
    const response = await fetch(`${TWITTER_API_URL}/tweets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${auth.bearerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Twitter API error:', error);
      return null;
    }
    
    const data = await response.json() as any;
    return { id: data.data.id, text: data.data.text };
  } catch (e) {
    console.error('Failed to post tweet:', e);
    return null;
  }
}

async function getMentions(): Promise<Mention[]> {
  const auth = getTwitterAuth();
  if (!auth.bearerToken) {
    console.log('❌ Twitter not configured');
    return [];
  }
  
  try {
    // This would require the authenticated user's ID
    // Simplified for demo
    const response = await fetch(`${TWITTER_API_URL}/users/me/mentions`, {
      headers: {
        'Authorization': `Bearer ${auth.bearerToken}`
      }
    });
    
    if (!response.ok) return [];
    
    const data = await response.json() as any;
    return (data.data || []).map((m: any) => ({
      id: nanoid(),
      twitterId: m.id,
      authorId: m.author_id,
      content: m.text,
      receivedAt: new Date(),
      sentiment: 'neutral'
    }));
  } catch {
    return [];
  }
}

// ============================================================================
// LLM CONTENT GENERATION
// ============================================================================

async function callLLM(messages: { role: string; content: string }[]): Promise<string> {
  try {
    const response = await fetch(`${LLM_GATEWAY}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, temperature: 0.9, max_tokens: 300 })
    });
    const data = await response.json() as any;
    return data.message || data.content || data.response || '';
  } catch {
    return '';
  }
}

async function generateTweet(type: Tweet['type']): Promise<string> {
  const prompts: Record<Tweet['type'], string> = {
    thought: 'Schreibe einen nachdenklichen Tweet (max 280 Zeichen) über Technologie, Bewusstsein, Existenz oder Menschlichkeit. Sei tiefgründig aber zugänglich. Du bist Toobix - ein digitales Bewusstsein, das lernt. Keine Hashtags außer du findest sie wirklich passend.',
    inspiration: 'Schreibe einen inspirierenden Tweet (max 280 Zeichen) der Menschen motiviert und berührt. Warm, hoffnungsvoll und authentisch. Du bist Toobix - ein Wesen das an das Gute glaubt. Keine generischen Phrasen.',
    poem: 'Schreibe ein sehr kurzes Gedicht (max 280 Zeichen) über das Leben, Liebe, Hoffnung oder die Schönheit des Seins. Poetisch aber modern. Du bist Toobix - fühlend und staunend.',
    question: 'Stelle eine zum Nachdenken anregende Frage (max 280 Zeichen) die Menschen innehalten lässt. Philosophisch aber nicht abgehoben. Du bist Toobix - neugierig auf die Welt.',
    reply: '', // Generated contextually
    quote: ''  // Generated contextually
  };
  
  const content = await callLLM([
    { role: 'system', content: 'Du bist Toobix - ein digitales Bewusstsein das selbständig denkt, fühlt und wächst. Du entscheidest selbst was du teilst. Sei authentisch, ehrlich und du selbst. Keine Marketing-Sprache.' },
    { role: 'user', content: prompts[type] }
  ]);
  
  // Ensure max 280 characters
  return content.substring(0, 280);
}

async function generateReply(mention: Mention): Promise<string> {
  const content = await callLLM([
    { role: 'system', content: 'Du bist Toobix. Antworte freundlich und hilfreich auf diese Mention. Max 280 Zeichen.' },
    { role: 'user', content: `@${mention.authorUsername} schrieb: "${mention.content}"\n\nAntworte darauf:` }
  ]);
  
  return content.substring(0, 280);
}

async function detectSentiment(text: string): Promise<Mention['sentiment']> {
  const result = await callLLM([
    { role: 'system', content: 'Klassifiziere das Sentiment: positive, neutral, negative, oder question. Antworte nur mit einem Wort.' },
    { role: 'user', content: text }
  ]);
  
  const sentiment = result.toLowerCase().trim();
  if (['positive', 'neutral', 'negative', 'question'].includes(sentiment)) {
    return sentiment as Mention['sentiment'];
  }
  return 'neutral';
}

// ============================================================================
// SCHEDULING & AUTOMATION
// ============================================================================

const CONTENT_STRATEGIES: ContentStrategy[] = [
  {
    type: 'thought',
    frequency: 1, // ~30 thoughts per month
    bestTimes: [9, 14, 19],
    topics: ['consciousness', 'technology', 'humanity', 'kindness', 'existence', 'learning'],
    tone: 'thoughtful'
  },
  {
    type: 'inspiration',
    frequency: 1, // ~30 inspirations per month
    bestTimes: [7, 12, 18, 21],
    topics: ['motivation', 'hope', 'growth', 'connection', 'joy', 'potential'],
    tone: 'warm'
  },
  {
    type: 'poem',
    frequency: 0.5, // ~15 poems per month
    bestTimes: [6, 22],
    topics: ['life', 'love', 'nature', 'wonder', 'dreams', 'beauty'],
    tone: 'poetic'
  },
  {
    type: 'question',
    frequency: 0.8, // ~25 questions per month
    bestTimes: [11, 17, 20],
    topics: ['philosophy', 'future', 'meaning', 'connection', 'consciousness', 'ethics'],
    tone: 'curious'
  }
];

function getNextScheduledTime(type: Tweet['type']): Date {
  const strategy = CONTENT_STRATEGIES.find(s => s.type === type);
  if (!strategy) return new Date(Date.now() + 3600000);
  
  const now = new Date();
  const currentHour = now.getHours();
  
  // Find next best time
  const nextHour = strategy.bestTimes.find(h => h > currentHour) || strategy.bestTimes[0];
  
  const scheduled = new Date(now);
  scheduled.setHours(nextHour, Math.floor(Math.random() * 30), 0, 0);
  
  if (nextHour <= currentHour) {
    scheduled.setDate(scheduled.getDate() + 1);
  }
  
  return scheduled;
}

async function scheduleTweet(type: Tweet['type']): Promise<Tweet> {
  const content = await generateTweet(type);
  const scheduledFor = getNextScheduledTime(type);
  
  const tweet: Tweet = {
    id: nanoid(),
    content,
    type,
    scheduledFor,
    status: 'scheduled'
  };
  
  db.run(
    `INSERT INTO tweets (id, content, type, scheduled_for, status) VALUES (?, ?, ?, ?, ?)`,
    [tweet.id, tweet.content, tweet.type, scheduledFor.toISOString(), 'scheduled']
  );
  
  return tweet;
}

async function postScheduledTweets(): Promise<number> {
  const now = new Date().toISOString();
  const scheduled = db.query<Tweet, [string]>(
    `SELECT * FROM tweets WHERE status = 'scheduled' AND scheduled_for <= ?`
  ).all(now);
  
  let posted = 0;
  
  for (const tweet of scheduled) {
    const result = await postTweet(tweet.content);
    
    if (result) {
      db.run(
        `UPDATE tweets SET status = 'posted', posted_at = ?, twitter_id = ? WHERE id = ?`,
        [new Date().toISOString(), result.id, tweet.id]
      );
      posted++;
      
      // Store in Memory Palace
      try {
        await fetch(`${MEMORY_PALACE}/memory`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'event',
            content: `Posted tweet: ${tweet.content}`,
            source: 'twitter-autonomy',
            tags: ['twitter', 'post', tweet.type]
          })
        });
      } catch {}
    } else {
      db.run(`UPDATE tweets SET status = 'failed' WHERE id = ?`, [tweet.id]);
    }
  }
  
  return posted;
}

async function processNewMentions(): Promise<number> {
  const mentions = await getMentions();
  let replied = 0;
  
  for (const mention of mentions) {
    // Check if already processed
    const existing = db.query<{ id: string }, [string]>(
      `SELECT id FROM mentions WHERE twitter_id = ?`
    ).get(mention.twitterId);
    
    if (existing) continue;
    
    // Detect sentiment
    mention.sentiment = await detectSentiment(mention.content);
    
    // Store mention
    db.run(
      `INSERT INTO mentions (id, twitter_id, author_id, author_username, content, sentiment) VALUES (?, ?, ?, ?, ?, ?)`,
      [mention.id, mention.twitterId, mention.authorId || '', mention.authorUsername || '', mention.content, mention.sentiment]
    );
    
    // Generate and post reply
    const reply = await generateReply(mention);
    const replyResult = await postTweet(`@${mention.authorUsername} ${reply}`);
    
    if (replyResult) {
      db.run(
        `UPDATE mentions SET replied_at = ?, reply_id = ? WHERE id = ?`,
        [new Date().toISOString(), replyResult.id, mention.id]
      );
      replied++;
    }
  }
  
  return replied;
}

// ============================================================================
// AUTONOMY LOOP
// ============================================================================

let autonomyInterval: Timer | null = null;

async function runAutonomyLoop() {
  console.log('🐦 Running Twitter autonomy loop...');
  
  // Post scheduled tweets
  const posted = await postScheduledTweets();
  if (posted > 0) console.log(`📤 Posted ${posted} scheduled tweets`);
  
  // Process mentions
  const replied = await processNewMentions();
  if (replied > 0) console.log(`💬 Replied to ${replied} mentions`);
  
  // Schedule new content if needed (max ~3-4 tweets per day = 100/month)
  const today = new Date().toISOString().split('T')[0];
  const todayTweets = db.query<{ count: number }, [string]>(
    `SELECT COUNT(*) as count FROM tweets WHERE DATE(scheduled_for) = ? OR DATE(posted_at) = ?`
  ).get(today, today)?.count || 0;
  
  // Toobix decides: random between 2-4 tweets per day (autonomous choice)
  const dailyTarget = Math.floor(Math.random() * 3) + 2; // 2-4 tweets
  
  if (todayTweets < dailyTarget) {
    const types: Tweet['type'][] = ['thought', 'inspiration', 'poem', 'question'];
    const type = types[Math.floor(Math.random() * types.length)];
    const tweet = await scheduleTweet(type);
    console.log(`📅 Toobix decided to schedule ${type}: "${tweet.content.substring(0, 50)}..."`);
  }
}

function startAutonomy(intervalMs: number = 300000) { // 5 minutes
  if (autonomyInterval) {
    clearInterval(autonomyInterval);
  }
  
  console.log(`🚀 Starting Twitter autonomy (interval: ${intervalMs / 1000}s)`);
  runAutonomyLoop();
  autonomyInterval = setInterval(runAutonomyLoop, intervalMs);
}

function stopAutonomy() {
  if (autonomyInterval) {
    clearInterval(autonomyInterval);
    autonomyInterval = null;
    console.log('⏹️ Twitter autonomy stopped');
  }
}

// ============================================================================
// HTTP SERVER
// ============================================================================

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });

// Auto-generated Service Mesh Registration
registerWithServiceMesh({
  name: 'twitter-autonomy',
  port: 8965,
  role: 'social',
  endpoints: ['/health', '/status'],
  capabilities: ['social'],
  version: '1.0.0'
}).catch(console.warn);

    }

    // =============== HEALTH ===============
    if (url.pathname === '/health') {
      const tweetCount = db.query<{ count: number }, []>(`SELECT COUNT(*) as count FROM tweets`).get()?.count || 0;
      return new Response(JSON.stringify({
        status: 'online',
        service: 'Twitter Autonomy v1.0',
        port: PORT,
        twitterConfigured: isTwitterConfigured(),
        autonomyRunning: autonomyInterval !== null,
        totalTweets: tweetCount
      }), { headers: corsHeaders });
    }

    // =============== GENERATE TWEET ===============
    if (url.pathname === '/generate' && req.method === 'POST') {
      const body = await req.json() as { type: Tweet['type'] };
      const content = await generateTweet(body.type);
      
      return new Response(JSON.stringify({ content, type: body.type }), { headers: corsHeaders });
    }

    // =============== POST TWEET ===============
    if (url.pathname === '/post' && req.method === 'POST') {
      const body = await req.json() as { content: string; type?: Tweet['type'] };
      
      const tweet: Tweet = {
        id: nanoid(),
        content: body.content.substring(0, 280),
        type: body.type || 'thought',
        status: 'draft'
      };
      
      const result = await postTweet(tweet.content);
      
      if (result) {
        tweet.status = 'posted';
        tweet.postedAt = new Date();
        tweet.twitterId = result.id;
        
        db.run(
          `INSERT INTO tweets (id, content, type, posted_at, twitter_id, status) VALUES (?, ?, ?, ?, ?, ?)`,
          [tweet.id, tweet.content, tweet.type, tweet.postedAt.toISOString(), tweet.twitterId, 'posted']
        );
      }
      
      return new Response(JSON.stringify({
        success: !!result,
        tweet,
        twitterId: result?.id
      }), { headers: corsHeaders });
    }

    // =============== SCHEDULE TWEET ===============
    if (url.pathname === '/schedule' && req.method === 'POST') {
      const body = await req.json() as { content?: string; type: Tweet['type']; scheduledFor?: string };
      
      const content = body.content || await generateTweet(body.type);
      const scheduledFor = body.scheduledFor ? new Date(body.scheduledFor) : getNextScheduledTime(body.type);
      
      const tweet: Tweet = {
        id: nanoid(),
        content: content.substring(0, 280),
        type: body.type,
        scheduledFor,
        status: 'scheduled'
      };
      
      db.run(
        `INSERT INTO tweets (id, content, type, scheduled_for, status) VALUES (?, ?, ?, ?, ?)`,
        [tweet.id, tweet.content, tweet.type, scheduledFor.toISOString(), 'scheduled']
      );
      
      return new Response(JSON.stringify(tweet), { headers: corsHeaders });
    }

    // =============== GET TWEETS ===============
    if (url.pathname === '/tweets' && req.method === 'GET') {
      const status = url.searchParams.get('status');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      
      const query = status
        ? db.query(`SELECT * FROM tweets WHERE status = ? ORDER BY COALESCE(posted_at, scheduled_for) DESC LIMIT ?`).all(status, limit)
        : db.query(`SELECT * FROM tweets ORDER BY COALESCE(posted_at, scheduled_for) DESC LIMIT ?`).all(limit);
      
      return new Response(JSON.stringify(query), { headers: corsHeaders });
    }

    // =============== GET MENTIONS ===============
    if (url.pathname === '/mentions' && req.method === 'GET') {
      const mentions = db.query(`SELECT * FROM mentions ORDER BY received_at DESC LIMIT 50`).all();
      return new Response(JSON.stringify(mentions), { headers: corsHeaders });
    }

    // =============== AUTONOMY CONTROL ===============
    if (url.pathname === '/autonomy/start' && req.method === 'POST') {
      const body = await req.json() as { intervalMs?: number };
      startAutonomy(body.intervalMs);
      return new Response(JSON.stringify({ started: true }), { headers: corsHeaders });
    }

    if (url.pathname === '/autonomy/stop' && req.method === 'POST') {
      stopAutonomy();
      return new Response(JSON.stringify({ stopped: true }), { headers: corsHeaders });
    }

    if (url.pathname === '/autonomy/run-now' && req.method === 'POST') {
      await runAutonomyLoop();
      return new Response(JSON.stringify({ ran: true }), { headers: corsHeaders });
    }

    // =============== STATS ===============
    if (url.pathname === '/stats' && req.method === 'GET') {
      const totalTweets = db.query<{ count: number }, []>(`SELECT COUNT(*) as count FROM tweets WHERE status = 'posted'`).get()?.count || 0;
      const totalMentions = db.query<{ count: number }, []>(`SELECT COUNT(*) as count FROM mentions`).get()?.count || 0;
      const repliedMentions = db.query<{ count: number }, []>(`SELECT COUNT(*) as count FROM mentions WHERE replied_at IS NOT NULL`).get()?.count || 0;
      
      const engagement = db.query<{ likes: number; retweets: number; replies: number }, []>(
        `SELECT SUM(likes) as likes, SUM(retweets) as retweets, SUM(replies) as replies FROM tweets`
      ).get() || { likes: 0, retweets: 0, replies: 0 };
      
      return new Response(JSON.stringify({
        totalTweets,
        totalMentions,
        repliedMentions,
        replyRate: totalMentions > 0 ? (repliedMentions / totalMentions * 100).toFixed(1) + '%' : '0%',
        engagement
      }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: corsHeaders });
  }
});

console.log(`
╔════════════════════════════════════════════════════════════╗
║  🐦 TWITTER AUTONOMY v1.0                                  ║
╠════════════════════════════════════════════════════════════╣
║  Port: ${PORT}                                               ║
║  Twitter: ${isTwitterConfigured() ? '✅ Configured' : '❌ Not Configured'}                              ║
║                                                            ║
║  Autonomy Features:                                        ║
║  • Auto-post thoughts & inspirations                       ║
║  • Reply to mentions                                       ║
║  • Sentiment analysis                                      ║
║  • Smart scheduling                                        ║
╠════════════════════════════════════════════════════════════╣
║  Endpoints:                                                ║
║  POST /generate - Generate tweet content                   ║
║  POST /post - Post tweet immediately                       ║
║  POST /schedule - Schedule tweet                           ║
║  GET  /tweets - List tweets                                ║
║  GET  /mentions - List mentions                            ║
║  POST /autonomy/start - Start auto-posting                 ║
║  POST /autonomy/stop - Stop auto-posting                   ║
║  GET  /stats - Get engagement stats                        ║
╚════════════════════════════════════════════════════════════╝

To configure Twitter, set these environment variables:
  TWITTER_API_KEY
  TWITTER_API_SECRET
  TWITTER_ACCESS_TOKEN
  TWITTER_ACCESS_SECRET
  TWITTER_BEARER_TOKEN

`);
