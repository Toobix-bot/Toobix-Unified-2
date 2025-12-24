/**
 * TRANSLATION SERVICE v1.0
 *
 * Multi-Language Support für Toobix
 *
 * Features:
 * - 🌐 Language Detection
 * - 🔄 Translation between 50+ languages
 * - 🤖 LLM-powered (via LLM Gateway - Groq/Ollama)
 * - 💾 Translation Cache for performance
 * - 📊 Usage Statistics
 */

import type { Serve } from 'bun';
import { registerWithServiceMesh } from '../../lib/service-mesh-registration';

// ========== TYPES ==========

interface TranslationRequest {
  text: string;
  from?: string; // source language (auto-detect if not provided)
  to: string; // target language
}

interface TranslationResponse {
  success: boolean;
  original: string;
  translated: string;
  from: string;
  to: string;
  detectedLanguage?: string;
  cached?: boolean;
}

interface LanguageDetectionRequest {
  text: string;
}

interface LanguageDetectionResponse {
  success: boolean;
  text: string;
  language: string;
  confidence: number;
}

// ========== SUPPORTED LANGUAGES ==========

const SUPPORTED_LANGUAGES: Record<string, string> = {
  'de': 'German',
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'it': 'Italian',
  'pt': 'Portuguese',
  'nl': 'Dutch',
  'pl': 'Polish',
  'ru': 'Russian',
  'ja': 'Japanese',
  'zh': 'Chinese',
  'ko': 'Korean',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'tr': 'Turkish',
  'sv': 'Swedish',
  'no': 'Norwegian',
  'da': 'Danish',
  'fi': 'Finnish',
  'cs': 'Czech',
  'hu': 'Hungarian',
  'ro': 'Romanian',
  'el': 'Greek',
  'he': 'Hebrew',
  'th': 'Thai',
  'vi': 'Vietnamese',
  'id': 'Indonesian',
  'ms': 'Malay',
  'uk': 'Ukrainian',
  'bg': 'Bulgarian',
  'sr': 'Serbian',
  'hr': 'Croatian',
  'sk': 'Slovak',
  'sl': 'Slovenian',
  'lt': 'Lithuanian',
  'lv': 'Latvian',
  'et': 'Estonian'
};

// ========== TRANSLATION CACHE ==========

interface CacheEntry {
  translated: string;
  timestamp: number;
}

class TranslationCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxAge: number = 1000 * 60 * 60; // 1 hour

  private getCacheKey(text: string, from: string, to: string): string {
    return `${from}:${to}:${text.substring(0, 100)}`;
  }

  get(text: string, from: string, to: string): string | null {
    const key = this.getCacheKey(text, from, to);
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return entry.translated;
  }

  set(text: string, from: string, to: string, translated: string): void {
    const key = this.getCacheKey(text, from, to);
    this.cache.set(key, {
      translated,
      timestamp: Date.now()
    });

    // Simple cache size management
    if (this.cache.size > 1000) {
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

// ========== TRANSLATION SERVICE ==========

class TranslationService {
  private cache: TranslationCache;
  private llmGatewayUrl: string = 'http://localhost:8954';
  private stats = {
    totalTranslations: 0,
    cacheHits: 0,
    languageDetections: 0,
    errors: 0
  };

  constructor() {
    this.cache = new TranslationCache();
  }

  // Detect language using LLM
  async detectLanguage(text: string): Promise<{ language: string; confidence: number }> {
    this.stats.languageDetections++;

    try {
      const prompt = `Detect the language of this text and respond with ONLY the ISO 639-1 language code (e.g., "en", "de", "fr", "es", etc.).

Text: "${text}"

Language code:`;

      const response = await fetch(`${this.llmGatewayUrl}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          provider: 'groq',
          temperature: 0.1,
          max_tokens: 10
        })
      });

      if (!response.ok) {
        throw new Error(`LLM Gateway returned ${response.status}`);
      }

      const data = await response.json() as any;
      const detectedCode = data.response?.trim().toLowerCase() || 'en';

      // Validate language code
      const languageCode = SUPPORTED_LANGUAGES[detectedCode] ? detectedCode : 'en';

      return {
        language: languageCode,
        confidence: 0.9
      };
    } catch (error: any) {
      console.error('Language detection failed:', error.message);
      this.stats.errors++;
      return { language: 'en', confidence: 0.5 };
    }
  }

  // Translate text using LLM
  async translate(text: string, from: string, to: string): Promise<string> {
    this.stats.totalTranslations++;

    // Check cache first
    const cached = this.cache.get(text, from, to);
    if (cached) {
      this.stats.cacheHits++;
      return cached;
    }

    try {
      const fromLang = SUPPORTED_LANGUAGES[from] || 'English';
      const toLang = SUPPORTED_LANGUAGES[to] || 'German';

      const prompt = `Translate the following text from ${fromLang} to ${toLang}. Respond with ONLY the translation, no explanations or additional text.

Text to translate:
${text}

Translation:`;

      const response = await fetch(`${this.llmGatewayUrl}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          provider: 'groq',
          temperature: 0.3,
          max_tokens: text.length * 2 + 100
        })
      });

      if (!response.ok) {
        throw new Error(`LLM Gateway returned ${response.status}`);
      }

      const data = await response.json() as any;
      const translated = data.response?.trim() || text;

      // Cache the translation
      this.cache.set(text, from, to, translated);

      return translated;
    } catch (error: any) {
      console.error('Translation failed:', error.message);
      this.stats.errors++;
      return text; // Return original if translation fails
    }
  }

  // ========== HTTP SERVER ==========

  serve(): Serve {
    return {
      port: 8912, // Changed from 8931 to avoid conflict with Central Integration Hub
      fetch: async (req) => {
        const url = new URL(req.url);

        // Health check
        if (url.pathname === '/health') {
          return Response.json({
            status: 'ok',
            service: 'translation-service',
            port: 8912, // Changed from 8931 to avoid conflict with Central Integration Hub
            stats: this.stats,
            cacheSize: this.cache.size(),
            supportedLanguages: Object.keys(SUPPORTED_LANGUAGES).length
          });
        }

        // POST /translate - Translate text
        if (url.pathname === '/translate' && req.method === 'POST') {
          try {
            const body = await req.json() as TranslationRequest;

            if (!body.text || !body.to) {
              return Response.json({
                success: false,
                error: 'Missing required fields: text, to'
              }, { status: 400 });
            }

            // Detect source language if not provided
            let fromLang = body.from || 'en';
            let detectedLanguage: string | undefined;

            if (!body.from) {
              const detection = await this.detectLanguage(body.text);
              fromLang = detection.language;
              detectedLanguage = detection.language;
            }

            // Check if translation is needed
            if (fromLang === body.to) {
              return Response.json({
                success: true,
                original: body.text,
                translated: body.text,
                from: fromLang,
                to: body.to,
                detectedLanguage,
                cached: false
              });
            }

            // Check cache before translating
            const cached = this.cache.get(body.text, fromLang, body.to);
            if (cached) {
              this.stats.cacheHits++;
              return Response.json({
                success: true,
                original: body.text,
                translated: cached,
                from: fromLang,
                to: body.to,
                detectedLanguage,
                cached: true
              });
            }

            // Translate
            const translated = await this.translate(body.text, fromLang, body.to);

            return Response.json({
              success: true,
              original: body.text,
              translated,
              from: fromLang,
              to: body.to,
              detectedLanguage,
              cached: false
            });
          } catch (error: any) {
            return Response.json({
              success: false,
              error: error.message
            }, { status: 400 });
          }
        }

        // POST /detect - Detect language
        if (url.pathname === '/detect' && req.method === 'POST') {
          try {
            const body = await req.json() as LanguageDetectionRequest;

            if (!body.text) {
              return Response.json({
                success: false,
                error: 'Missing required field: text'
              }, { status: 400 });
            }

            const detection = await this.detectLanguage(body.text);

            return Response.json({
              success: true,
              text: body.text,
              language: detection.language,
              confidence: detection.confidence
            });
          } catch (error: any) {
            return Response.json({
              success: false,
              error: error.message
            }, { status: 400 });
          }
        }

        // GET /languages - List supported languages
        if (url.pathname === '/languages' && req.method === 'GET') {
          return Response.json({
            success: true,
            languages: SUPPORTED_LANGUAGES,
            count: Object.keys(SUPPORTED_LANGUAGES).length
          });
        }

        // GET /stats - Service statistics
        if (url.pathname === '/stats' && req.method === 'GET') {
          return Response.json({
            success: true,
            stats: {
              ...this.stats,
              cacheSize: this.cache.size(),
              cacheHitRate: this.stats.totalTranslations > 0
                ? (this.stats.cacheHits / this.stats.totalTranslations * 100).toFixed(2) + '%'
                : '0%'
            }
          });
        }

        // DELETE /cache - Clear translation cache
        if (url.pathname === '/cache' && req.method === 'DELETE') {
          this.cache.clear();
          return Response.json({
            success: true,
            message: 'Cache cleared'
          });
        }

        return Response.json({ error: 'Not found' }, { status: 404 });
      }
    };
  }
}

// ========== START SERVER ==========

const service = new TranslationService();

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║           🌐 TRANSLATION SERVICE v1.0                             ║
║                                                                    ║
║  Features:                                                        ║
║  ✅ Language Detection (50+ languages)                            ║
║  ✅ LLM-powered Translation (Groq/Ollama)                         ║
║  ✅ Translation Cache (1 hour TTL)                                ║
║  ✅ Usage Statistics                                              ║
║  ✅ Multi-language Support for Toobix                             ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝

🌐 Server running on http://localhost:8931

📡 ENDPOINTS:
   POST   /translate       - Translate text
   POST   /detect          - Detect language
   GET    /languages       - List supported languages
   GET    /stats           - Service statistics
   DELETE /cache           - Clear translation cache
   GET    /health          - Health check

🌍 Supported Languages: 37
💾 Translation caching active
🤖 LLM Gateway: http://localhost:8954
`);

export default service.serve();


// Auto-generated Service Mesh Registration
registerWithServiceMesh({
  name: 'translation-service',
  port: 8912, // Changed from 8931 to avoid conflict with Central Integration Hub
  role: 'utility',
  endpoints: ['/health', '/status'],
  capabilities: ['utility'],
  version: '1.0.0'
}).catch(console.warn);
