import { registerWithServiceMesh } from '../lib/service-mesh-registration';

/**
 * TOOBIX UNIFIED COMMUNICATION SERVICE
 * Konsolidiert Chat, Life-Domain, Proactive Communication
 * Port 8001
 */

const PORT = 8001;

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  context?: string;
}

const messageHistory: Message[] = [];
const activeConversations = new Map<string, Message[]>();

// ==================== CHAT MODULE ====================
async function handleChat(req: Request): Promise<Response> {
  const url = new URL(req.url);
  
  if (url.pathname === '/api/chat/message' && req.method === 'POST') {
    const { message, context, userId = 'anonymous' } = await req.json();
    
    const msg: Message = {
      id: crypto.randomUUID(),
      content: message,
      timestamp: new Date(),
      context
    };
    
    messageHistory.push(msg);
    
    // Get or create conversation
    if (!activeConversations.has(userId)) {
      activeConversations.set(userId, []);
    }
    activeConversations.get(userId)!.push(msg);
    
    return Response.json({
      response: `I understand you said: "${message}". This unified service handles all communication.`,
      messageId: msg.id,
      timestamp: msg.timestamp
    });
  }
  
  if (url.pathname === '/api/chat/history') {
    const userId = url.searchParams.get('userId') || 'anonymous';
    return Response.json({
      messages: activeConversations.get(userId) || [],
      total: messageHistory.length
    });
  }
  
  return new Response('Not Found', { status: 404 });
}

// ==================== LIFE DOMAINS MODULE ====================
async function handleLifeDomains(req: Request): Promise<Response> {
  const url = new URL(req.url);
  
  if (url.pathname === '/api/life-domains/list') {
    return Response.json({
      domains: [
        { id: 'health', name: 'Health & Wellness', priority: 'high' },
        { id: 'relationships', name: 'Relationships', priority: 'high' },
        { id: 'career', name: 'Career & Growth', priority: 'medium' },
        { id: 'hobbies', name: 'Hobbies & Interests', priority: 'medium' },
        { id: 'finance', name: 'Financial Well-being', priority: 'medium' }
      ]
    });
  }
  
  if (url.pathname === '/api/life-domains/check-in' && req.method === 'POST') {
    const { domain, status, notes } = await req.json();
    return Response.json({
      recorded: true,
      domain,
      timestamp: new Date().toISOString(),
      encouragement: 'Great job checking in on your life domains!'
    });
  }
  
  return new Response('Not Found', { status: 404 });
}

// ==================== PROACTIVE COMMUNICATION MODULE ====================
async function handleProactive(req: Request): Promise<Response> {
  const url = new URL(req.url);
  
  if (url.pathname === '/api/proactive/suggest') {
    return Response.json({
      suggestions: [
        'How about a quick check-in on your wellness goals?',
        'Would you like to review your progress today?',
        'I noticed it\'s been a while - how are you feeling?'
      ],
      nextCheckIn: new Date(Date.now() + 3600000).toISOString()
    });
  }
  
  return new Response('Not Found', { status: 404 });
}

// ==================== MAIN ROUTER ====================
async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  
  if (url.pathname === '/health') {
    return Response.json({ status: 'healthy', service: 'toobix-unified-communication' });
  }
  
  if (url.pathname === '/') {
    return Response.json({
      name: 'Toobix Unified Communication Service',
      modules: ['chat', 'life-domains', 'proactive-communication'],
      endpoints: ['/api/chat/*', '/api/life-domains/*', '/api/proactive/*']
    });
  }
  
  if (url.pathname.startsWith('/api/chat')) return handleChat(req);
  if (url.pathname.startsWith('/api/life-domains')) return handleLifeDomains(req);
  if (url.pathname.startsWith('/api/proactive')) return handleProactive(req);
  
  return new Response('Not Found', { status: 404 });
}

const server = Bun.serve({
  port: PORT,
  fetch: handleRequest
});

// Auto-generated Service Mesh Registration
registerWithServiceMesh({
  name: 'unified-communication-service',
  port: 8001,
  role: 'communication',
  endpoints: ['/health', '/status'],
  capabilities: ['communication'],
  version: '1.0.0'
}).catch(console.warn);


console.log(`🗨️  Toobix Unified Communication Service running on http://localhost:${PORT}`);
