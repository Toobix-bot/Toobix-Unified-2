/**
 * 🔗 SERVICE MESH AUTO-REGISTRATION HELPER
 * 
 * Füge diesen Code in jeden Service ein, damit er sich automatisch
 * beim Service Mesh registriert.
 */

export interface ServiceRegistration {
  name: string;
  port: number;
  role: string;
  endpoints: string[];
  capabilities: string[];
  version?: string;
}

export async function registerWithServiceMesh(config: ServiceRegistration): Promise<void> {
  const SERVICE_MESH_URL = 'http://localhost:8910';
  
  try {
    const response = await fetch(`${SERVICE_MESH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...config,
        registeredAt: new Date().toISOString(),
        healthEndpoint: '/health'
      }),
      signal: AbortSignal.timeout(3000)
    });

    if (response.ok) {
      console.log(`✅ Registered with Service Mesh: ${config.name}`);
      
      // Heartbeat alle 30 Sekunden
      setInterval(async () => {
        try {
          await fetch(`${SERVICE_MESH_URL}/heartbeat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              name: config.name, 
              port: config.port,
              timestamp: new Date().toISOString()
            }),
            signal: AbortSignal.timeout(2000)
          });
        } catch (error) {
          // Silent fail - Service Mesh might be down
        }
      }, 30000);
      
    } else {
      console.warn(`⚠️  Service Mesh registration failed: ${response.status}`);
    }
  } catch (error: any) {
    console.warn(`⚠️  Service Mesh not available: ${error.message}`);
    // Don't fail service startup if mesh is unavailable
  }
}

// Example usage:
/*
import { registerWithServiceMesh } from './service-mesh-registration';

const server = Bun.serve({
  port: 8XXX,
  fetch: handleRequest
});

registerWithServiceMesh({
  name: 'my-service',
  port: 8XXX,
  role: 'my-role',
  endpoints: ['/health', '/api/...'],
  capabilities: ['capability1', 'capability2'],
  version: '1.0.0'
});
*/
