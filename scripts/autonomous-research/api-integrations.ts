/**
 * 🌐 API INTEGRATIONS - Real External API Support
 *
 * Integrates with real-world APIs for research capabilities
 */

// ============================================================================
// TYPES
// ============================================================================

export interface APIConfig {
  name: string;
  baseURL: string;
  apiKey?: string;
  rateLimit: number; // requests per minute
  enabled: boolean;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  relevance: number;
  timestamp: Date;
}

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: Date;
  category?: string;
}

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  timestamp: Date;
}

// ============================================================================
// API INTEGRATION LAYER
// ============================================================================

export class APIIntegrationLayer {
  private apis: Map<string, APIConfig> = new Map();
  private rateLimiters: Map<string, number[]> = new Map();

  constructor() {
    this.setupAPIs();
  }

  private setupAPIs() {
    // Google Custom Search API
    this.apis.set('google', {
      name: 'Google Custom Search',
      baseURL: 'https://www.googleapis.com/customsearch/v1',
      apiKey: process.env.GOOGLE_API_KEY,
      rateLimit: 100, // 100 requests/minute
      enabled: !!process.env.GOOGLE_API_KEY,
    });

    // News API
    this.apis.set('newsapi', {
      name: 'News API',
      baseURL: 'https://newsapi.org/v2',
      apiKey: process.env.NEWS_API_KEY,
      rateLimit: 100,
      enabled: !!process.env.NEWS_API_KEY,
    });

    // OpenWeather API
    this.apis.set('weather', {
      name: 'OpenWeather API',
      baseURL: 'https://api.openweathermap.org/data/2.5',
      apiKey: process.env.OPENWEATHER_API_KEY,
      rateLimit: 60,
      enabled: !!process.env.OPENWEATHER_API_KEY,
    });

    // Wikipedia API (no key needed)
    this.apis.set('wikipedia', {
      name: 'Wikipedia API',
      baseURL: 'https://en.wikipedia.org/w/api.php',
      rateLimit: 200,
      enabled: true,
    });

    // arXiv API (academic papers, no key needed)
    this.apis.set('arxiv', {
      name: 'arXiv API',
      baseURL: 'http://export.arxiv.org/api',
      rateLimit: 1, // 1 request per 3 seconds
      enabled: true,
    });
  }

  // ==========================================================================
  // RATE LIMITING
  // ==========================================================================

  private checkRateLimit(apiName: string): boolean {
    const config = this.apis.get(apiName);
    if (!config) return false;

    const now = Date.now();
    const requests = this.rateLimiters.get(apiName) || [];

    // Remove requests older than 1 minute
    const recentRequests = requests.filter(time => now - time < 60000);

    if (recentRequests.length >= config.rateLimit) {
      return false; // Rate limit exceeded
    }

    recentRequests.push(now);
    this.rateLimiters.set(apiName, recentRequests);
    return true;
  }

  // ==========================================================================
  // GOOGLE SEARCH
  // ==========================================================================

  async searchGoogle(query: string, maxResults: number = 10): Promise<SearchResult[]> {
    const config = this.apis.get('google');
    if (!config || !config.enabled) {
      console.log('⚠️ Google API not configured');
      return [];
    }

    if (!this.checkRateLimit('google')) {
      console.log('⚠️ Google API rate limit exceeded');
      return [];
    }

    try {
      const response = await fetch(
        `${config.baseURL}?key=${config.apiKey}&cx=${process.env.GOOGLE_CX}&q=${encodeURIComponent(query)}&num=${maxResults}`
      );

      if (!response.ok) throw new Error(`Google API error: ${response.statusText}`);

      const data = await response.json();
      const results: SearchResult[] = (data.items || []).map((item: any) => ({
        title: item.title,
        url: item.link,
        snippet: item.snippet,
        source: 'Google',
        relevance: 1.0, // Google results are considered highly relevant
        timestamp: new Date(),
      }));

      console.log(`🔍 Found ${results.length} results for: ${query}`);
      return results;

    } catch (err) {
      console.error('Google Search error:', err);
      return [];
    }
  }

  // ==========================================================================
  // NEWS SEARCH
  // ==========================================================================

  async searchNews(query: string, maxResults: number = 10): Promise<NewsArticle[]> {
    const config = this.apis.get('newsapi');
    if (!config || !config.enabled) {
      console.log('⚠️ News API not configured');
      return [];
    }

    if (!this.checkRateLimit('newsapi')) {
      console.log('⚠️ News API rate limit exceeded');
      return [];
    }

    try {
      const response = await fetch(
        `${config.baseURL}/everything?q=${encodeURIComponent(query)}&pageSize=${maxResults}&apiKey=${config.apiKey}`
      );

      if (!response.ok) throw new Error(`News API error: ${response.statusText}`);

      const data = await response.json();
      const articles: NewsArticle[] = (data.articles || []).map((article: any) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source.name,
        publishedAt: new Date(article.publishedAt),
        category: article.category,
      }));

      console.log(`📰 Found ${articles.length} news articles for: ${query}`);
      return articles;

    } catch (err) {
      console.error('News Search error:', err);
      return [];
    }
  }

  // ==========================================================================
  // WIKIPEDIA SEARCH
  // ==========================================================================

  async searchWikipedia(query: string): Promise<SearchResult[]> {
    if (!this.checkRateLimit('wikipedia')) {
      console.log('⚠️ Wikipedia API rate limit exceeded');
      return [];
    }

    try {
      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`
      );

      if (!response.ok) throw new Error(`Wikipedia API error: ${response.statusText}`);

      const data = await response.json();
      const results: SearchResult[] = (data.query.search || []).map((item: any) => ({
        title: item.title,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
        snippet: item.snippet.replace(/<[^>]*>/g, ''), // Remove HTML tags
        source: 'Wikipedia',
        relevance: 0.8,
        timestamp: new Date(),
      }));

      console.log(`📚 Found ${results.length} Wikipedia results for: ${query}`);
      return results;

    } catch (err) {
      console.error('Wikipedia Search error:', err);
      return [];
    }
  }

  // ==========================================================================
  // WEATHER DATA
  // ==========================================================================

  async getWeather(location: string): Promise<WeatherData | null> {
    const config = this.apis.get('weather');
    if (!config || !config.enabled) {
      console.log('⚠️ Weather API not configured');
      return null;
    }

    if (!this.checkRateLimit('weather')) {
      console.log('⚠️ Weather API rate limit exceeded');
      return null;
    }

    try {
      const response = await fetch(
        `${config.baseURL}/weather?q=${encodeURIComponent(location)}&appid=${config.apiKey}&units=metric`
      );

      if (!response.ok) throw new Error(`Weather API error: ${response.statusText}`);

      const data = await response.json();
      const weather: WeatherData = {
        location: data.name,
        temperature: data.main.temp,
        condition: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        timestamp: new Date(),
      };

      console.log(`🌤️ Weather for ${location}: ${weather.temperature}°C, ${weather.condition}`);
      return weather;

    } catch (err) {
      console.error('Weather API error:', err);
      return null;
    }
  }

  // ==========================================================================
  // ARXIV SEARCH (Academic Papers)
  // ==========================================================================

  async searchArxiv(query: string, maxResults: number = 10): Promise<SearchResult[]> {
    if (!this.checkRateLimit('arxiv')) {
      console.log('⚠️ arXiv API rate limit exceeded (1 req/3s)');
      return [];
    }

    try {
      const response = await fetch(
        `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&max_results=${maxResults}`
      );

      if (!response.ok) throw new Error(`arXiv API error: ${response.statusText}`);

      const text = await response.text();

      // Parse XML (simplified - would use proper XML parser in production)
      const entries = text.match(/<entry>[\s\S]*?<\/entry>/g) || [];
      const results: SearchResult[] = entries.map(entry => {
        const title = entry.match(/<title>(.*?)<\/title>/)?.[1] || '';
        const summary = entry.match(/<summary>(.*?)<\/summary>/)?.[1] || '';
        const id = entry.match(/<id>(.*?)<\/id>/)?.[1] || '';

        return {
          title: title.trim().replace(/\s+/g, ' '),
          url: id,
          snippet: summary.trim().replace(/\s+/g, ' ').substring(0, 200),
          source: 'arXiv',
          relevance: 0.9,
          timestamp: new Date(),
        };
      });

      console.log(`📄 Found ${results.length} academic papers for: ${query}`);
      return results;

    } catch (err) {
      console.error('arXiv Search error:', err);
      return [];
    }
  }

  // ==========================================================================
  // UNIFIED SEARCH (All APIs)
  // ==========================================================================

  async searchAll(query: string): Promise<SearchResult[]> {
    console.log(`🔍 Conducting unified search for: ${query}`);

    const results = await Promise.all([
      this.searchGoogle(query, 5),
      this.searchWikipedia(query),
      this.searchArxiv(query, 3),
    ]);

    const allResults = results.flat();

    // Sort by relevance
    allResults.sort((a, b) => b.relevance - a.relevance);

    console.log(`✅ Total results found: ${allResults.length}`);
    return allResults;
  }

  // ==========================================================================
  // API STATUS
  // ==========================================================================

  getStatus(): Record<string, any> {
    const status: Record<string, any> = {};

    for (const [name, config] of this.apis) {
      const requests = this.rateLimiters.get(name) || [];
      const recentRequests = requests.filter(time => Date.now() - time < 60000);

      status[name] = {
        enabled: config.enabled,
        rateLimit: `${recentRequests.length}/${config.rateLimit} per minute`,
        available: config.enabled && recentRequests.length < config.rateLimit,
      };
    }

    return status;
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default APIIntegrationLayer;
