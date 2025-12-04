/**
 * 🔧 UNIVERSAL SERVICE WRAPPER
 * 
 * Macht jeden Service zu einem Express-basierten HTTP-Service mit:
 * - Health Endpoint
 * - Event Bus Integration
 * - Standardisierte API
 * - Graceful Shutdown
 */

import express, { Express, Request, Response } from 'express';
import { createServer, Server } from 'http';
import { getEventBusClient, EventBusClient } from '../src/modules/event-bus-client';

export interface ServiceWrapperConfig {
  name: string;
  port: number;
  description: string;
  version: string;
}

export class UniversalServiceWrapper {
  private app: Express;
  private server: Server;
  private eventBus: EventBusClient;
  private config: ServiceWrapperConfig;
  private startTime: Date;
  private customEndpoints: Map<string, Function> = new Map();
  private customData: Record<string, any> = {};

  constructor(config: ServiceWrapperConfig) {
    this.config = config;
    this.app = express();
    this.server = createServer(this.app);
    this.eventBus = getEventBusClient(config.name);
    this.startTime = new Date();

    this.setupMiddleware();
    this.setupDefaultEndpoints();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    
    // CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
      next();
    });
  }

  private setupDefaultEndpoints(): void {
    // Health check
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({
        status: 'ok',
        service: this.config.name,
        port: this.config.port,
        version: this.config.version,
        uptime: Math.floor((Date.now() - this.startTime.getTime()) / 1000),
        description: this.config.description
      });
    });

    // Service info
    this.app.get('/info', (req: Request, res: Response) => {
      res.json({
        name: this.config.name,
        port: this.config.port,
        version: this.config.version,
        description: this.config.description,
        startTime: this.startTime.toISOString(),
        uptime: Math.floor((Date.now() - this.startTime.getTime()) / 1000),
        endpoints: [...this.customEndpoints.keys()]
      });
    });

    // Custom data access
    this.app.get('/data', (req: Request, res: Response) => {
      res.json({ success: true, data: this.customData });
    });

    this.app.get('/data/:key', (req: Request, res: Response) => {
      const key = req.params.key;
      if (key in this.customData) {
        res.json({ success: true, [key]: this.customData[key] });
      } else {
        res.status(404).json({ success: false, error: 'Key not found' });
      }
    });
  }

  // Add custom endpoint
  addEndpoint(method: 'get' | 'post' | 'put' | 'delete' | 'patch', path: string, handler: (req: Request, res: Response) => void): void {
    this.customEndpoints.set(`${method.toUpperCase()} ${path}`, handler);
    this.app[method](path, handler);
  }

  // Set custom data
  setData(key: string, value: any): void {
    this.customData[key] = value;
  }

  getData(key: string): any {
    return this.customData[key];
  }

  // Get Express app for advanced customization
  getApp(): Express {
    return this.app;
  }

  // Get Event Bus client
  getEventBus(): EventBusClient {
    return this.eventBus;
  }

  // Start the service
  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen(this.config.port, async () => {
        console.log('');
        console.log(`🚀 ═══════════════════════════════════════════════════════`);
        console.log(`🚀  ${this.config.name.toUpperCase()} v${this.config.version}`);
        console.log(`🚀 ═══════════════════════════════════════════════════════`);
        console.log(`🚀  📍 Port: ${this.config.port}`);
        console.log(`🚀  📝 ${this.config.description}`);
        console.log(`🚀 ═══════════════════════════════════════════════════════`);
        console.log('');

        await this.eventBus.emitServiceStarted([this.config.name]);
        resolve();
      });
    });
  }

  // Stop the service
  async stop(): Promise<void> {
    console.log(`\n🛑 Stopping ${this.config.name}...`);
    await this.eventBus.emitServiceStopped('Graceful shutdown');
    
    return new Promise((resolve) => {
      this.server.close(() => {
        console.log(`✅ ${this.config.name} stopped`);
        resolve();
      });
    });
  }
}

// Helper function to create a service quickly
export function createService(config: ServiceWrapperConfig): UniversalServiceWrapper {
  return new UniversalServiceWrapper(config);
}

// Handle graceful shutdown
export function setupGracefulShutdown(service: UniversalServiceWrapper): void {
  process.on('SIGINT', async () => {
    await service.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    await service.stop();
    process.exit(0);
  });
}
