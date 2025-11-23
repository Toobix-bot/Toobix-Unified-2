/**
 * QUICK CORS FIX SCRIPT
 * Adds CORS headers to all service responses
 */

// This is a helper that all services should use
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
};

export function addCors(headers: any) {
  return { ...headers, ...corsHeaders };
}

export function handleCorsPrefl ight(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  return null;
}

console.log('✅ CORS Helper loaded - import in your services!');
