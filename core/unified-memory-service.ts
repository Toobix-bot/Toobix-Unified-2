/**
 * TOOBIX UNIFIED MEMORY SERVICE
 * Konsolidiert Memory Palace variants
 * Port 8003
 */

const PORT = 8003;

interface Memory {
  id: string;
  content: string;
  category: string;
  importance: number;
  timestamp: Date;
  tags: string[];
}

const memories: Memory[] = [];

async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  
  if (url.pathname === '/health') {
    return Response.json({ status: 'healthy', service: 'toobix-unified-memory' });
  }
  
  if (url.pathname === '/api/memory/store' && req.method === 'POST') {
    const { content, category, importance = 0.5, tags = [] } = await req.json();
    const memory: Memory = {
      id: crypto.randomUUID(),
      content,
      category,
      importance,
      timestamp: new Date(),
      tags
    };
    memories.push(memory);
    return Response.json({ success: true, memoryId: memory.id });
  }
  
  if (url.pathname === '/api/memory/recall') {
    const query = url.searchParams.get('query') || '';
    const category = url.searchParams.get('category');
    
    let results = memories;
    if (category) {
      results = results.filter(m => m.category === category);
    }
    if (query) {
      results = results.filter(m => 
        m.content.toLowerCase().includes(query.toLowerCase()) ||
        m.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
      );
    }
    
    return Response.json({
      memories: results.slice(-20),
      total: results.length
    });
  }
  
  if (url.pathname === '/api/memory/stats') {
    return Response.json({
      total: memories.length,
      categories: [...new Set(memories.map(m => m.category))],
      recentCount: memories.filter(m => 
        Date.now() - m.timestamp.getTime() < 24 * 60 * 60 * 1000
      ).length
    });
  }
  
  return new Response('Not Found', { status: 404 });
}

const server = Bun.serve({ port: PORT, fetch: handleRequest });
console.log(`🗃️  Toobix Unified Memory Service running on http://localhost:${PORT}`);
