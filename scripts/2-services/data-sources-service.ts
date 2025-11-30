/**
 * DATA SOURCES SERVICE v1.0
 *
 * Externe Datenquellen-Integration für Toobix
 *
 * Features:
 * - 📰 News API Integration (aktuelle Nachrichten)
 * - 🌤️ Weather API (Wetterdaten)
 * - 📚 Wikipedia Integration (Wissensdatenbank)
 * - 🔍 Web Search (DuckDuckGo)
 * - 💾 Response Caching
 * - 📊 Usage Statistics
 */

import type { Serve } from 'bun';

// ========== TYPES ==========

interface NewsRequest {
  query?: string;
  category?: 'general' | 'business' | 'technology' | 'science' | 'health';
  language?: string;
  limit?: number;
}

interface WeatherRequest {
  location: string;
  units?: 'metric' | 'imperial';
}

interface WikipediaRequest {
  query: string;
  lang?: string;
}

interface SearchRequest {
  query: string;
  limit?: number;
}

// ========== CACHE ==========

interface CacheEntry {
  data: any;
  timestamp: number;
}

class DataCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxAge: number = 1000 * 60 * 15; // 15 minutes

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    // Simple cache size management
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// ========== DATA SOURCES SERVICE ==========

class DataSourcesService {
  private cache: DataCache;
  private stats = {
    newsRequests: 0,
    weatherRequests: 0,
    wikipediaRequests: 0,
    searchRequests: 0,
    cacheHits: 0,
    errors: 0
  };

  constructor() {
    this.cache = new DataCache();
  }

  // ========== NEWS (RSS FEEDS) ==========

  async fetchNews(request: NewsRequest): Promise<any> {
    this.stats.newsRequests++;

    const cacheKey = `news:${request.query || 'general'}:${request.category || 'general'}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      this.stats.cacheHits++;
      return { ...cached, cached: true };
    }

    try {
      // Using RSS feeds from public sources (no API key needed)
      const category = request.category || 'general';
      const feedUrl = this.getRssFeedUrl(category);

      const response = await fetch(feedUrl, {
        headers: { 'User-Agent': 'Toobix/1.0' }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch news: ${response.status}`);
      }

      const xmlText = await response.text();
      const articles = this.parseRssFeed(xmlText, request.limit || 10);

      const result = {
        success: true,
        source: 'RSS Feed',
        category,
        articles,
        cached: false
      };

      this.cache.set(cacheKey, result);
      return result;
    } catch (error: any) {
      console.error('News fetch failed:', error.message);
      this.stats.errors++;
      return { success: false, error: error.message };
    }
  }

  private getRssFeedUrl(category: string): string {
    const feeds: Record<string, string> = {
      'general': 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
      'technology': 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml',
      'business': 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml',
      'science': 'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml',
      'health': 'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml'
    };

    return feeds[category] || feeds['general'];
  }

  private parseRssFeed(xmlText: string, limit: number): any[] {
    // Simple RSS parsing (extract title, link, description from <item> tags)
    const articles: any[] = [];
    const itemRegex = /<item>(.*?)<\/item>/gs;
    const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>/s;
    const linkRegex = /<link>(.*?)<\/link>/s;
    const descRegex = /<description><!\[CDATA\[(.*?)\]\]><\/description>/s;
    const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/s;

    let match;
    let count = 0;

    while ((match = itemRegex.exec(xmlText)) !== null && count < limit) {
      const itemContent = match[1];

      const titleMatch = titleRegex.exec(itemContent);
      const linkMatch = linkRegex.exec(itemContent);
      const descMatch = descRegex.exec(itemContent);
      const pubDateMatch = pubDateRegex.exec(itemContent);

      if (titleMatch && linkMatch) {
        articles.push({
          title: titleMatch[1],
          link: linkMatch[1],
          description: descMatch ? descMatch[1].substring(0, 200) : '',
          publishedAt: pubDateMatch ? pubDateMatch[1] : ''
        });
        count++;
      }
    }

    return articles;
  }

  // ========== WEATHER (Open-Meteo - No API Key) ==========

  async fetchWeather(request: WeatherRequest): Promise<any> {
    this.stats.weatherRequests++;

    const cacheKey = `weather:${request.location}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      this.stats.cacheHits++;
      return { ...cached, cached: true };
    }

    try {
      // Step 1: Geocode location using Open-Meteo Geocoding
      const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(request.location)}&count=1&language=en&format=json`;

      const geoResponse = await fetch(geocodeUrl);
      if (!geoResponse.ok) {
        throw new Error('Failed to geocode location');
      }

      const geoData = await geoResponse.json() as any;
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('Location not found');
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      // Step 2: Fetch weather data
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;

      const weatherResponse = await fetch(weatherUrl);
      if (!weatherResponse.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const weatherData = await weatherResponse.json() as any;

      const result = {
        success: true,
        location: {
          name,
          country,
          latitude,
          longitude
        },
        current: {
          temperature: weatherData.current_weather.temperature,
          windspeed: weatherData.current_weather.windspeed,
          weathercode: weatherData.current_weather.weathercode,
          time: weatherData.current_weather.time
        },
        forecast: weatherData.daily,
        cached: false
      };

      this.cache.set(cacheKey, result);
      return result;
    } catch (error: any) {
      console.error('Weather fetch failed:', error.message);
      this.stats.errors++;
      return { success: false, error: error.message };
    }
  }

  // ========== WIKIPEDIA ==========

  async fetchWikipedia(request: WikipediaRequest): Promise<any> {
    this.stats.wikipediaRequests++;

    const lang = request.lang || 'en';
    const cacheKey = `wiki:${lang}:${request.query}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      this.stats.cacheHits++;
      return { ...cached, cached: true };
    }

    try {
      const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(request.query)}`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Toobix/1.0',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Wikipedia API returned ${response.status}`);
      }

      const data = await response.json() as any;

      const result = {
        success: true,
        title: data.title,
        extract: data.extract,
        description: data.description,
        thumbnail: data.thumbnail?.source,
        url: data.content_urls?.desktop?.page,
        lang,
        cached: false
      };

      this.cache.set(cacheKey, result);
      return result;
    } catch (error: any) {
      console.error('Wikipedia fetch failed:', error.message);
      this.stats.errors++;
      return { success: false, error: error.message };
    }
  }

  // ========== WEB SEARCH (DuckDuckGo Instant Answer) ==========

  async fetchSearch(request: SearchRequest): Promise<any> {
    this.stats.searchRequests++;

    const cacheKey = `search:${request.query}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      this.stats.cacheHits++;
      return { ...cached, cached: true };
    }

    try {
      const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(request.query)}&format=json&no_html=1&skip_disambig=1`;

      const response = await fetch(url, {
        headers: { 'User-Agent': 'Toobix/1.0' }
      });

      if (!response.ok) {
        throw new Error(`DuckDuckGo API returned ${response.status}`);
      }

      const data = await response.json() as any;

      const result = {
        success: true,
        query: request.query,
        answer: data.AbstractText || data.Answer || '',
        source: data.AbstractSource || '',
        url: data.AbstractURL || '',
        relatedTopics: (data.RelatedTopics || []).slice(0, request.limit || 5).map((t: any) => ({
          text: t.Text,
          url: t.FirstURL
        })),
        cached: false
      };

      this.cache.set(cacheKey, result);
      return result;
    } catch (error: any) {
      console.error('Search failed:', error.message);
      this.stats.errors++;
      return { success: false, error: error.message };
    }
  }

  // ========== HTTP SERVER ==========

  serve(): Serve {
    return {
      port: 8930,
      fetch: async (req) => {
        const url = new URL(req.url);

        // Health check
        if (url.pathname === '/health') {
          return Response.json({
            status: 'ok',
            service: 'data-sources-service',
            port: 8930,
            stats: this.stats,
            cacheSize: this.cache.size()
          });
        }

        // POST /news - Fetch news
        if (url.pathname === '/news' && req.method === 'POST') {
          try {
            const body = await req.json() as NewsRequest;
            const result = await this.fetchNews(body);
            return Response.json(result);
          } catch (error: any) {
            return Response.json({ success: false, error: error.message }, { status: 400 });
          }
        }

        // POST /weather - Fetch weather
        if (url.pathname === '/weather' && req.method === 'POST') {
          try {
            const body = await req.json() as WeatherRequest;

            if (!body.location) {
              return Response.json({ success: false, error: 'Missing required field: location' }, { status: 400 });
            }

            const result = await this.fetchWeather(body);
            return Response.json(result);
          } catch (error: any) {
            return Response.json({ success: false, error: error.message }, { status: 400 });
          }
        }

        // POST /wikipedia - Fetch Wikipedia
        if (url.pathname === '/wikipedia' && req.method === 'POST') {
          try {
            const body = await req.json() as WikipediaRequest;

            if (!body.query) {
              return Response.json({ success: false, error: 'Missing required field: query' }, { status: 400 });
            }

            const result = await this.fetchWikipedia(body);
            return Response.json(result);
          } catch (error: any) {
            return Response.json({ success: false, error: error.message }, { status: 400 });
          }
        }

        // POST /search - Web search
        if (url.pathname === '/search' && req.method === 'POST') {
          try {
            const body = await req.json() as SearchRequest;

            if (!body.query) {
              return Response.json({ success: false, error: 'Missing required field: query' }, { status: 400 });
            }

            const result = await this.fetchSearch(body);
            return Response.json(result);
          } catch (error: any) {
            return Response.json({ success: false, error: error.message }, { status: 400 });
          }
        }

        // GET /stats - Service statistics
        if (url.pathname === '/stats' && req.method === 'GET') {
          return Response.json({
            success: true,
            stats: {
              ...this.stats,
              cacheSize: this.cache.size(),
              cacheHitRate: this.stats.newsRequests + this.stats.weatherRequests + this.stats.wikipediaRequests + this.stats.searchRequests > 0
                ? (this.stats.cacheHits / (this.stats.newsRequests + this.stats.weatherRequests + this.stats.wikipediaRequests + this.stats.searchRequests) * 100).toFixed(2) + '%'
                : '0%'
            }
          });
        }

        // DELETE /cache - Clear cache
        if (url.pathname === '/cache' && req.method === 'DELETE') {
          this.cache.clear();
          return Response.json({ success: true, message: 'Cache cleared' });
        }

        return Response.json({ error: 'Not found' }, { status: 404 });
      }
    };
  }
}

// ========== START SERVER ==========

const service = new DataSourcesService();

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║           📡 DATA SOURCES SERVICE v1.0                            ║
║                                                                    ║
║  Features:                                                        ║
║  ✅ News API (RSS Feeds - NY Times)                               ║
║  ✅ Weather API (Open-Meteo - No Key Required)                    ║
║  ✅ Wikipedia Integration                                         ║
║  ✅ Web Search (DuckDuckGo)                                       ║
║  ✅ Response Caching (15 min TTL)                                 ║
║  ✅ Usage Statistics                                              ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝

📡 Server running on http://localhost:8930

📡 ENDPOINTS:
   POST   /news            - Fetch news articles
   POST   /weather         - Get weather data
   POST   /wikipedia       - Search Wikipedia
   POST   /search          - Web search (DuckDuckGo)
   GET    /stats           - Service statistics
   DELETE /cache           - Clear cache
   GET    /health          - Health check

🌍 Data Sources:
   📰 News: NY Times RSS Feeds (no API key)
   🌤️ Weather: Open-Meteo (free, no key)
   📚 Wikipedia: REST API
   🔍 Search: DuckDuckGo Instant Answer API

💾 15-minute response caching active
`);

export default service.serve();
