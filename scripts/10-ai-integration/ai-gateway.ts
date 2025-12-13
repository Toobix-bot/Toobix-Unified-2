/**
 * AI GATEWAY (minimal stub)
 * Port: 8911
 * - GET /health          -> status ok
 * - POST /chat {messages} -> proxies to LLM Gateway (8954) if available, otherwise echoes
 */

import { serve } from 'bun'

const PORT = 8911
const LLM_GATEWAY = 'http://localhost:8954/chat'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
}

async function forwardToLLMGateway(body: any) {
  try {
    const res = await fetch(LLM_GATEWAY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000)
    })
    if (!res.ok) throw new Error(`LLM Gateway status ${res.status}`)
    return await res.json()
  } catch (err: any) {
    return { error: err?.message || String(err) }
  }
}

serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url)

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', service: 'ai-gateway', port: PORT }), { headers: corsHeaders })
    }

    if (url.pathname === '/chat' && req.method === 'POST') {
      const body = await req.json()
      const resp = await forwardToLLMGateway(body)
      return new Response(JSON.stringify(resp), { headers: corsHeaders })
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404, headers: corsHeaders })
  }
})

console.log(`AI Gateway running on http://localhost:${PORT} (proxy -> ${LLM_GATEWAY})`)
