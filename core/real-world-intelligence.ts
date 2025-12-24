/**
 * 🌍 REAL-WORLD INTELLIGENCE HUB
 *
 * Observes the world, understands it through Toobix's consciousness,
 * and generates actionable quests for individuals and collectives.
 *
 * Port: 8888
 *
 * Pipeline:
 * 1. SENSE: Fetch real-world data (news, trends, events)
 * 2. UNDERSTAND: Analyze through 20 perspectives
 * 3. EVALUATE: Determine relevance (individual + collective)
 * 4. ACT: Generate quests and recommendations
 * 5. IMPACT: Track changes and progress
 */

import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 8888;

// Service URLs
const SERVICES = {
  multiPerspective: 'http://localhost:8897',
  livingWorld: 'http://localhost:7779',
  gamification: 'http://localhost:7778',
  llmRouter: 'http://localhost:8959',
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

// ============================================================================
// RSS NEWS FEEDS (All Free!)
// ============================================================================

const NEWS_FEEDS = {
  general: [
    'https://feeds.bbci.co.uk/news/rss.xml',
    'https://www.theguardian.com/world/rss',
    'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
  ],
  technology: [
    'https://www.wired.com/feed/rss',
    'https://techcrunch.com/feed/',
    'https://www.theverge.com/rss/index.xml',
  ],
  science: [
    'https://www.sciencedaily.com/rss/all.xml',
    'https://www.nature.com/nature.rss',
  ],
  health: [
    'https://www.who.int/rss-feeds/news-english.xml',
    'https://feeds.webmd.com/rss/rss.aspx?RSSSource=RSS_PUBLIC',
  ],
  environment: [
    'https://www.theguardian.com/environment/rss',
  ],
  economy: [
    'https://www.economist.com/finance-and-economics/rss.xml',
  ],
};

// Life domains mapping
const LIFE_DOMAINS = {
  career: ['technology', 'economy'],
  health: ['health', 'science'],
  environment: ['environment', 'science'],
  society: ['general'],
  personal_growth: ['science', 'health'],
};

// ============================================================================
// NEWS FETCHING & PARSING
// ============================================================================

interface NewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  category: string;
}

async function fetchRSS(url: string, category: string): Promise<NewsItem[]> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Toobix-Real-World-Intelligence/1.0'
      }
    });

    if (!response.ok) {
      console.error(`[RSS] Failed to fetch ${url}: ${response.status}`);
      return [];
    }

    const xml = await response.text();

    // Simple XML parsing for RSS (items between <item> tags)
    const items: NewsItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/;
    const descRegex = /<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/;
    const linkRegex = /<link>(.*?)<\/link>/;
    const dateRegex = /<pubDate>(.*?)<\/pubDate>/;

    let match;
    let count = 0;
    while ((match = itemRegex.exec(xml)) !== null && count < 5) {
      const itemXml = match[1];

      const titleMatch = titleRegex.exec(itemXml);
      const descMatch = descRegex.exec(itemXml);
      const linkMatch = linkRegex.exec(itemXml);
      const dateMatch = dateRegex.exec(itemXml);

      const title = (titleMatch?.[1] || titleMatch?.[2] || '').trim();
      const description = (descMatch?.[1] || descMatch?.[2] || '').trim();
      const link = (linkMatch?.[1] || '').trim();
      const pubDate = (dateMatch?.[1] || '').trim();

      if (title && link) {
        items.push({
          title,
          description: description.substring(0, 200),
          link,
          pubDate,
          source: new URL(url).hostname,
          category
        });
        count++;
      }
    }

    return items;
  } catch (e) {
    console.error(`[RSS] Error fetching ${url}:`, e);
    return [];
  }
}

async function getWorldPulse(): Promise<NewsItem[]> {
  console.log('[World Pulse] Fetching news from all sources...');

  const allFeeds = Object.entries(NEWS_FEEDS).flatMap(([category, urls]) =>
    urls.map(url => ({ url, category }))
  );

  // Fetch all feeds in parallel (but limit to 5 concurrent)
  const results: NewsItem[] = [];
  for (let i = 0; i < allFeeds.length; i += 5) {
    const batch = allFeeds.slice(i, i + 5);
    const batchResults = await Promise.all(
      batch.map(({ url, category }) => fetchRSS(url, category))
    );
    results.push(...batchResults.flat());
  }

  console.log(`[World Pulse] Fetched ${results.length} news items`);
  return results;
}

// ============================================================================
// PERSPECTIVE ANALYSIS
// ============================================================================

async function analyzeWithPerspectives(topic: string) {
  try {
    const response = await fetch(`${SERVICES.multiPerspective}/perspectives`);
    if (!response.ok) return null;

    const perspectives = await response.json();

    // Return perspective insights on the topic
    return perspectives.map((p: any) => ({
      name: p.name,
      viewpoint: p.description,
      archetype: p.archetype
    }));
  } catch (e) {
    console.error('[Perspectives] Failed to fetch:', e);
    return null;
  }
}

// ============================================================================
// QUEST GENERATION
// ============================================================================

interface Quest {
  id: string;
  type: 'personal' | 'collective';
  title: string;
  description: string;
  domain: string;
  difficulty: 'easy' | 'medium' | 'hard';
  impact: 'low' | 'medium' | 'high';
  deadline?: string;
  relatedNews?: string[];
}

async function generateQuestsFromNews(news: NewsItem[]): Promise<Quest[]> {
  const quests: Quest[] = [];

  // Group news by category
  const newsByCategory = news.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, NewsItem[]>);

  // Generate quests for each category
  for (const [category, items] of Object.entries(newsByCategory)) {
    if (items.length === 0) continue;

    // Personal quest
    quests.push({
      id: `personal-${category}-${Date.now()}`,
      type: 'personal',
      title: getPersonalQuestTitle(category),
      description: getPersonalQuestDescription(category, items[0]),
      domain: category,
      difficulty: 'easy',
      impact: 'medium',
      relatedNews: items.slice(0, 2).map(i => i.link)
    });

    // Collective quest
    if (items.length >= 2) {
      quests.push({
        id: `collective-${category}-${Date.now()}`,
        type: 'collective',
        title: getCollectiveQuestTitle(category),
        description: getCollectiveQuestDescription(category, items),
        domain: category,
        difficulty: 'medium',
        impact: 'high',
        relatedNews: items.slice(0, 3).map(i => i.link)
      });
    }
  }

  return quests;
}

function getPersonalQuestTitle(category: string): string {
  const titles: Record<string, string> = {
    general: 'Stay Informed: Read Global News',
    technology: 'Learn: Explore New Tech Developments',
    science: 'Discover: Read Latest Scientific Findings',
    health: 'Self-Care: Learn About Health Advances',
    environment: 'Awareness: Understand Environmental Changes',
    economy: 'Financial Literacy: Study Economic Trends',
  };
  return titles[category] || 'Stay Aware: Read Current Events';
}

function getPersonalQuestDescription(category: string, news: NewsItem): string {
  return `Read and reflect on: "${news.title}". Consider how this impacts your life and what actions you can take.`;
}

function getCollectiveQuestTitle(category: string): string {
  const titles: Record<string, string> = {
    general: 'Collective Action: Discuss Global Issues',
    technology: 'Tech for Good: Share Knowledge',
    science: 'Science Literacy: Spread Understanding',
    health: 'Community Health: Support Wellbeing',
    environment: 'Planet Care: Take Environmental Action',
    economy: 'Economic Justice: Support Fair Systems',
  };
  return titles[category] || 'Together: Make a Difference';
}

function getCollectiveQuestDescription(category: string, news: NewsItem[]): string {
  const topNews = news[0];
  return `Multiple news items about ${category}. As a community, we can: research, discuss, and take action on "${topNews.title}" and related topics.`;
}

// ============================================================================
// RELEVANCE SCORING (Personal)
// ============================================================================

async function getPersonalRelevance(playerName: string, news: NewsItem[]): Promise<any[]> {
  // TODO: Get player profile from Living World
  // For now, score based on category importance

  const categoryPriority: Record<string, number> = {
    health: 10,
    environment: 9,
    technology: 7,
    general: 6,
    science: 5,
    economy: 5,
  };

  return news.map(item => ({
    ...item,
    relevanceScore: categoryPriority[item.category] || 5,
    reason: `Important ${item.category} news`
  })).sort((a, b) => b.relevanceScore - a.relevanceScore);
}

// ============================================================================
// ENDPOINTS
// ============================================================================

// ========== GET /pulse ==========
app.get('/pulse', async (req, res) => {
  console.log('[/pulse] Fetching world pulse...');
  const news = await getWorldPulse();
  res.json({
    timestamp: new Date().toISOString(),
    totalItems: news.length,
    categories: Object.keys(NEWS_FEEDS),
    news: news.slice(0, 20),
    summary: `Collected ${news.length} news items from ${Object.keys(NEWS_FEEDS).length} categories`
  });
});

// ========== GET /news/:category ==========
app.get('/news/:category', async (req, res) => {
  const category = req.params.category;
  if (!NEWS_FEEDS[category as keyof typeof NEWS_FEEDS]) {
    return res.status(404).json({ error: 'Invalid category' });
  }
  const feeds = NEWS_FEEDS[category as keyof typeof NEWS_FEEDS];
  const newsPromises = feeds.map(url => fetchRSS(url, category));
  const results = await Promise.all(newsPromises);
  const news = results.flat();
  res.json({ category, count: news.length, news });
});

// ========== GET /quests ==========
app.get('/quests', async (req, res) => {
  const playerName = req.headers['x-player-name'] as string || 'Player';
  console.log('[/quests] Generating quests from current news...');
  const news = await getWorldPulse();
  const quests = await generateQuestsFromNews(news);
  const personalQuests = quests.filter(q => q.type === 'personal');
  const collectiveQuests = quests.filter(q => q.type === 'collective');
  res.json({
    player: playerName,
    generated: new Date().toISOString(),
    personal: personalQuests,
    collective: collectiveQuests,
    total: quests.length
  });
});

// ========== GET /relevance ==========
app.get('/relevance', async (req, res) => {
  const playerName = req.headers['x-player-name'] as string || 'Player';
  const news = await getWorldPulse();
  const relevant = await getPersonalRelevance(playerName, news);
  res.json({ player: playerName, topRelevant: relevant.slice(0, 10) });
});

// ========== POST /analyze ==========
app.post('/analyze', async (req, res) => {
  const { topic } = req.body as { topic: string };
  const perspectives = await analyzeWithPerspectives(topic);
  res.json({ topic, perspectives, analysisDate: new Date().toISOString() });
});

// ========== GET /health ==========
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Real-World Intelligence Hub',
    port: PORT,
    features: ['news-aggregation', 'quest-generation', 'relevance-scoring', 'perspective-analysis']
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    endpoints: [
      'GET  /pulse - Get world news pulse',
      'GET  /news/:category - News by category',
      'GET  /quests - Generate personal & collective quests',
      'GET  /relevance - Get personally relevant news',
      'POST /analyze - Analyze topic with perspectives',
      'GET  /health - Health check'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║         🌍 REAL-WORLD INTELLIGENCE HUB - RUNNING               ║
║                                                                ║
║  Port: ${PORT}                                              ║
║  Status: Online                                                ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`);
});
