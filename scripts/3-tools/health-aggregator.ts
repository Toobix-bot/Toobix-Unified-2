#!/usr/bin/env bun
import { Logger } from '../packages/core/src/utils/logger.ts'

const log = new Logger('health-aggregator')
const PORT = Number(process.env.HEALTH_AGG_PORT || 3010)

const services = [
  { id: 'daemon', port: 9999 },
  { id: 'port-manager', port: 9988 },
  { id: 'service-consciousness', port: 9989 },
  { id: 'groq-api', port: 9987 },
  { id: 'blockworld-ai', port: 9990 },
  { id: 'expression', port: 9991 },
  { id: 'reality-integration', port: 9992 },
  { id: 'blockworld', port: 9993 },
  { id: 'moment-stream', port: 9994 },
  { id: 'memory', port: 9995 },
  { id: 'analytics', port: 9996 },
  { id: 'tasks', port: 9997 },
  { id: 'achievements', port: 9998 },
  { id: 'bridge', port: 3337 },
  { id: 'ai-sandbox', port: 3003 },
  { id: 'story-idle', port: 3004 },
  { id: 'life-game-chat', port: 3005 },
]

async function checkHealth(port: number): Promise<{ ok: boolean; data?: any; error?: string; ms: number }>{
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 800)
  const started = performance.now()
  try {
    const res = await fetch(`http://localhost:${port}/health`, { signal: controller.signal })
    const ms = Math.round(performance.now() - started)
    clearTimeout(timeout)
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, ms }
    const data = await res.json().catch(() => ({}))
    return { ok: true, data, ms }
  } catch (e: any) {
    clearTimeout(timeout)
    const ms = Math.round(performance.now() - started)
    return { ok: false, error: e?.message || String(e), ms }
  }
}

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}

const server = Bun.serve({
  port: PORT,
  fetch: async (req) => {
    const url = new URL(req.url)

    if (url.pathname === '/health') {
      return json({ status: 'ok', version: 1, uptime: process.uptime(), services: services.length })
    }

    if (url.pathname === '/aggregate') {
      const results = await Promise.all(
        services.map(async (s) => {
          const r = await checkHealth(s.port)
          return { id: s.id, port: s.port, ok: r.ok, ms: r.ms, data: r.data, error: r.error }
        })
      )
      const ok = results.filter(r => r.ok).length
      const down = results.length - ok
      return json({ status: down === 0 ? 'ok' : 'degraded', ok, down, results })
    }

    if (url.pathname === '/' || url.pathname === '/status') {
      return new Response('Health Aggregator\nGET /health\nGET /aggregate', { headers: { 'content-type': 'text/plain' } })
    }

    return new Response('Not found', { status: 404 })
  }
})

log.info('Health Aggregator listening', { port: PORT })
