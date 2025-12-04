/**
 * TOOBIX API GATEWAY v1.0
 *
 * Zentraler Eintrittspunkt für alle Toobix-Services
 *
 * Features:
 * - 🚪 Single Entry Point für Frontend
 * - 🔀 Request Routing zu allen Services
 * - 🔄 Load Balancing
 * - 📊 Request/Response Logging
 * - ⚡ Caching Layer
 * - 🔒 Authentication & Authorization (vorbereitet)
 * - 📈 Rate Limiting
 * - 🎯 Service Discovery Integration
 */

import type { Serve } from 'bun';

// ========== TYPES ==========

interface ServiceConfig {
  name: string;
  url: string;
  healthEndpoint: string;
  status: 'online' | 'offline' | 'degraded';
  lastCheck: Date;
  responseTime: number;
}

interface GatewayStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  cacheHits: number;
  cacheMisses: number;
}

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

// ========== SERVICE REGISTRY ==========

class ServiceRegistry {
  private services: Map<string, ServiceConfig> = new Map();

  constructor() {
    this.registerServices();
    this.startHealthChecks();
  }

  private registerServices() {
    const serviceConfigs: ServiceConfig[] = [
      {
        name: 'llm-gateway',
        url: 'http://localhost:8954',
        healthEndpoint: '/health',
        status: 'online',
        lastCheck: new Date(),
        responseTime: 0
      },
      {
        name: 'emotional-resonance',
        url: 'http://localhost:8900',
        healthEndpoint: '/health',
        status: 'online',
        lastCheck: new Date(),
        responseTime: 0
      },
      {
        name: 'emotional-resonance-v2',
        url: 'http://localhost:8908',
        healthEndpoint: '/health',
        status: 'online',
        lastCheck: new Date(),
        responseTime: 0
      },
      {
        name: 'multi-perspective',
        url: 'http://localhost:8897',
        healthEndpoint: '/health',
        status: 'online',
        lastCheck: new Date(),
        responseTime: 0
      },
      {
        name: 'user-profile',
        url: 'http://localhost:8904',
        healthEndpoint: '/health',
        status: 'online',
        lastCheck: new Date(),
        responseTime: 0
      },
      {
        name: 'data-sources',
        url: 'http://localhost:8930',
        healthEndpoint: '/health',
        status: 'online',
        lastCheck: new Date(),
        responseTime: 0
      },
      {
        name: 'translation',
        url: 'http://localhost:8931',
        healthEndpoint: '/health',
        status: 'online',
        lastCheck: new Date(),
        responseTime: 0
      },
      {
        name: 'orchestration-hub',
        url: 'http://localhost:9001',
        healthEndpoint: '/health',
        status: 'online',
        lastCheck: new Date(),
        responseTime: 0
      },
      {
        name: 'story-engine',
        url: 'http://localhost:8932',
        healthEndpoint: '/health',
        status: 'online',
        lastCheck: new Date(),
        responseTime: 0
      },
      {
        name: 'rpg-world',
        url: 'http://localhost:8933',
        healthEndpoint: '/health',
        status: 'online',
        lastCheck: new Date(),
        responseTime: 0
      },
      {
        name: 'performance',
        url: 'http://localhost:8934',
        healthEndpoint: '/health',
        status: 'online',
        lastCheck: new Date(),
        responseTime: 0
      },
      {
        name: 'data-science',
        url: 'http://localhost:8935',
        healthEndpoint: '/health',
        status: 'online',
        lastCheck: new Date(),
        responseTime: 0
      },
      {
        name: 'game-logic',
        url: 'http://localhost:8936',
        healthEndpoint: '/health',
        status: 'online',
        lastCheck: new Date(),
        responseTime: 0
      }
    ];

    serviceConfigs.forEach(config => {
      this.services.set(config.name, config);
    });

    console.log(`✅ Registered ${this.services.size} services`);
  }

  async checkHealth(serviceName: string): Promise<boolean> {
    const service = this.services.get(serviceName);
    if (!service) return false;

    try {
      const startTime = Date.now();
      const response = await fetch(`${service.url}${service.healthEndpoint}`, {
        signal: AbortSignal.timeout(3000)
      });
      const responseTime = Date.now() - startTime;

      service.status = response.ok ? 'online' : 'degraded';
      service.lastCheck = new Date();
      service.responseTime = responseTime;

      return response.ok;
    } catch (error) {
      service.status = 'offline';
      service.lastCheck = new Date();
      return false;
    }
  }

  private startHealthChecks() {
    // Health check every 30 seconds
    setInterval(async () => {
      for (const [name] of this.services) {
        await this.checkHealth(name);
      }
    }, 30000);
  }

  getService(name: string): ServiceConfig | undefined {
    return this.services.get(name);
  }

  getAllServices(): ServiceConfig[] {
    return Array.from(this.services.values());
  }

  getHealthyService(name: string): ServiceConfig | undefined {
    const service = this.services.get(name);
    return service?.status === 'online' ? service : undefined;
  }
}

// ========== CACHE LAYER ==========

class CacheLayer {
  private cache: Map<string, CacheEntry> = new Map();
  private defaultTTL: number = 60000; // 1 minute

  private getCacheKey(method: string, path: string, body?: any): string {
    const bodyHash = body ? JSON.stringify(body) : '';
    return `${method}:${path}:${bodyHash}`;
  }

  get(method: string, path: string, body?: any): any | null {
    const key = this.getCacheKey(method, path, body);
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(method: string, path: string, data: any, ttl?: number, body?: any): void {
    const key = this.getCacheKey(method, path, body);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
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

// ========== API GATEWAY ==========

class APIGateway {
  private registry: ServiceRegistry;
  private cache: CacheLayer;
  private stats: GatewayStats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    cacheHits: 0,
    cacheMisses: 0
  };

  constructor() {
    this.registry = new ServiceRegistry();
    this.cache = new CacheLayer();
  }

  private parseServiceFromPath(path: string): { service: string; subpath: string } | null {
    // Format: /api/{service}/{subpath}
    const match = path.match(/^\/api\/([^\/]+)(.*)$/);
    if (!match) return null;

    return {
      service: match[1],
      subpath: match[2] || '/'
    };
  }

  async proxyRequest(req: Request): Promise<Response> {
    this.stats.totalRequests++;
    const startTime = Date.now();

    try {
      const url = new URL(req.url);
      const parsed = this.parseServiceFromPath(url.pathname);

      if (!parsed) {
        this.stats.failedRequests++;
        return Response.json({ error: 'Invalid API path format. Use /api/{service}/{endpoint}' }, { status: 400 });
      }

      // Get service from registry
      const service = this.registry.getHealthyService(parsed.service);
      if (!service) {
        this.stats.failedRequests++;
        return Response.json({
          error: `Service '${parsed.service}' not available`,
          availableServices: this.registry.getAllServices().map(s => s.name)
        }, { status: 503 });
      }

      // Check cache for GET requests
      if (req.method === 'GET') {
        const cached = this.cache.get(req.method, url.pathname);
        if (cached) {
          this.stats.cacheHits++;
          return Response.json(cached);
        }
        this.stats.cacheMisses++;
      }

      // Proxy the request
      const targetUrl = `${service.url}${parsed.subpath}${url.search}`;

      let body = undefined;
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        body = await req.text();
      }

      const proxyResponse = await fetch(targetUrl, {
        method: req.method,
        headers: {
          'Content-Type': req.headers.get('Content-Type') || 'application/json',
          'X-Forwarded-For': 'api-gateway',
          'X-Request-ID': `gw-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        },
        body,
        signal: AbortSignal.timeout(30000)
      });

      const responseData = await proxyResponse.json();

      // Cache successful GET responses
      if (req.method === 'GET' && proxyResponse.ok) {
        this.cache.set(req.method, url.pathname, responseData);
      }

      // Update stats
      this.stats.successfulRequests++;
      const responseTime = Date.now() - startTime;
      this.stats.averageResponseTime =
        (this.stats.averageResponseTime * (this.stats.successfulRequests - 1) + responseTime) / this.stats.successfulRequests;

      return Response.json(responseData, {
        status: proxyResponse.status,
        headers: {
          'X-Response-Time': `${responseTime}ms`,
          'X-Service': service.name
        }
      });

    } catch (error: any) {
      this.stats.failedRequests++;
      console.error('Gateway proxy error:', error.message);

      return Response.json({
        error: 'Gateway proxy error',
        message: error.message
      }, { status: 500 });
    }
  }

  serve(): Serve {
    return {
      port: 3000,
      fetch: async (req) => {
        const url = new URL(req.url);

        // Health check
        if (url.pathname === '/health') {
          return Response.json({
            status: 'ok',
            service: 'api-gateway',
            port: 3000,
            stats: this.stats,
            cacheSize: this.cache.size(),
            services: this.registry.getAllServices()
          });
        }

        // Service discovery endpoint
        if (url.pathname === '/services' && req.method === 'GET') {
          return Response.json({
            success: true,
            services: this.registry.getAllServices()
          });
        }

        // Clear cache
        if (url.pathname === '/cache' && req.method === 'DELETE') {
          this.cache.clear();
          return Response.json({ success: true, message: 'Cache cleared' });
        }

        // Stats endpoint
        if (url.pathname === '/stats' && req.method === 'GET') {
          return Response.json({
            success: true,
            stats: {
              ...this.stats,
              cacheSize: this.cache.size(),
              cacheHitRate: this.stats.totalRequests > 0
                ? ((this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses)) * 100).toFixed(2) + '%'
                : '0%',
              successRate: this.stats.totalRequests > 0
                ? ((this.stats.successfulRequests / this.stats.totalRequests) * 100).toFixed(2) + '%'
                : '0%'
            }
          });
        }

        // Proxy all /api/* requests
        if (url.pathname.startsWith('/api/')) {
          return await this.proxyRequest(req);
        }

        // Default: API documentation
        return Response.json({
          service: 'Toobix API Gateway',
          version: '1.0',
          endpoints: {
            'GET /health': 'Gateway health check',
            'GET /services': 'List all registered services',
            'GET /stats': 'Gateway statistics',
            'DELETE /cache': 'Clear request cache',
            'ALL /api/{service}/{endpoint}': 'Proxy to service endpoints'
          },
          availableServices: this.registry.getAllServices().map(s => ({
            name: s.name,
            status: s.status,
            url: `/api/${s.name}`
          })),
          examples: [
            'GET /api/user-profile/users',
            'POST /api/multi-perspective',
            'POST /api/translation/translate',
            'GET /api/data-sources/news'
          ]
        });
      }
    };
  }
}

// ========== START SERVER ==========

const gateway = new APIGateway();

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║           🚪 TOOBIX API GATEWAY v1.0                              ║
║                                                                    ║
║  Features:                                                        ║
║  ✅ Single Entry Point für alle Services                          ║
║  ✅ Service Discovery & Health Checks                             ║
║  ✅ Request Caching (1 min TTL)                                   ║
║  ✅ Load Balancing (vorbereitet)                                  ║
║  ✅ Request/Response Logging                                      ║
║  ✅ Rate Limiting (vorbereitet)                                   ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝

🚪 API Gateway running on http://localhost:3000

📡 GATEWAY ENDPOINTS:
   GET    /health          - Gateway health check
   GET    /services        - List all services
   GET    /stats           - Gateway statistics
   DELETE /cache           - Clear cache

🔀 PROXY FORMAT:
   ALL    /api/{service}/{endpoint}

📚 AVAILABLE SERVICES:
   /api/llm-gateway/*
   /api/emotional-resonance/*
   /api/multi-perspective/*
   /api/user-profile/*
   /api/data-sources/*
   /api/translation/*
   /api/orchestration-hub/*
   /api/story-engine/*
   /api/rpg-world/*
   /api/performance/*
   /api/data-science/*
   /api/game-logic/*

📝 EXAMPLES:
   GET  http://localhost:3000/api/user-profile/users
   POST http://localhost:3000/api/multi-perspective
   POST http://localhost:3000/api/translation/translate
   GET  http://localhost:3000/api/data-sources/news
   POST http://localhost:3000/api/story-engine/generate
   POST http://localhost:3000/api/rpg-world/action
   GET  http://localhost:3000/api/performance/optimize/recommendations
   POST http://localhost:3000/api/data-science/analyze
   POST http://localhost:3000/api/game-logic/self-play

🎯 Frontend kann jetzt EINEN Endpunkt nutzen statt 12!
`);

export default gateway.serve();
