/**
 * IDLE ENGINE SERVICE
 * Port: 8972
 *
 * Generates resources automatically over time
 * Even when user is not active
 */

import { serve } from 'bun';

// ========================================
// TYPES
// ========================================

interface IdleState {
  lastUpdate: Date;
  accumulatedCredits: number;
  accumulatedResearch: number;
  rate: {
    creditsPerMinute: number;
    researchPerHour: number;
  };
}

// ========================================
// STATE
// ========================================

let idleState: IdleState = {
  lastUpdate: new Date(),
  accumulatedCredits: 0,
  accumulatedResearch: 0,
  rate: {
    creditsPerMinute: 15,
    researchPerHour: 2
  }
};

const PLAYER_STATE_URL = 'http://localhost:8970';

// ========================================
// IDLE CALCULATION
// ========================================

function calculateIdleGain(): { credits: number; research: number; minutesIdle: number } {
  const now = new Date();
  const minutesIdle = (now.getTime() - idleState.lastUpdate.getTime()) / 1000 / 60;

  const credits = Math.floor(minutesIdle * idleState.rate.creditsPerMinute);
  const research = Math.floor(minutesIdle * (idleState.rate.researchPerHour / 60));

  return { credits, research, minutesIdle };
}

async function collectIdleRewards() {
  const gain = calculateIdleGain();

  if (gain.credits > 0 || gain.research > 0) {
    // Update accumulated
    idleState.accumulatedCredits += gain.credits;
    idleState.accumulatedResearch += gain.research;

    // Send to player state
    try {
      await fetch(`${PLAYER_STATE_URL}/api/resources/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resources: {
            credits: gain.credits,
            research: gain.research
          }
        })
      });

      console.log(`💰 Idle gain: +${gain.credits} credits, +${gain.research} research (${gain.minutesIdle.toFixed(1)}m idle)`);
    } catch (error) {
      console.error('❌ Error sending rewards:', error);
    }
  }

  idleState.lastUpdate = new Date();
  return gain;
}

// ========================================
// AUTO TICK
// ========================================

// Tick every minute
setInterval(async () => {
  await collectIdleRewards();
}, 60000); // 60 seconds

// ========================================
// HTTP SERVER
// ========================================

const server = serve({
  port: 8972,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    // GET /api/idle/status - Get current idle status
    if (path === '/api/idle/status' && req.method === 'GET') {
      const pending = calculateIdleGain();
      return new Response(
        JSON.stringify({
          ...idleState,
          pending,
          nextTick: new Date(Date.now() + 60000)
        }),
        { headers }
      );
    }

    // POST /api/idle/collect - Manually collect rewards
    if (path === '/api/idle/collect' && req.method === 'POST') {
      const gain = await collectIdleRewards();
      return new Response(
        JSON.stringify({
          success: true,
          gain,
          accumulated: {
            credits: idleState.accumulatedCredits,
            research: idleState.accumulatedResearch
          }
        }),
        { headers }
      );
    }

    // POST /api/idle/rate - Update idle rates
    if (path === '/api/idle/rate' && req.method === 'POST') {
      const body = await req.json() as { creditsPerMinute?: number; researchPerHour?: number };
      if (body.creditsPerMinute) idleState.rate.creditsPerMinute = body.creditsPerMinute;
      if (body.researchPerHour) idleState.rate.researchPerHour = body.researchPerHour;
      return new Response(JSON.stringify({ success: true, rate: idleState.rate }), { headers });
    }

    return new Response('Not Found', { status: 404, headers });
  }
});

// ========================================
// STARTUP
// ========================================

console.log('');
console.log('========================================');
console.log('  ⚙️ IDLE ENGINE SERVICE');
console.log('========================================');
console.log('');
console.log(`Port: ${server.port}`);
console.log(`Rate: +${idleState.rate.creditsPerMinute}/min credits, +${idleState.rate.researchPerHour}/hour research`);
console.log('');
console.log('Endpoints:');
console.log('  GET  /api/idle/status     - Get status');
console.log('  POST /api/idle/collect    - Collect rewards');
console.log('  POST /api/idle/rate       - Update rates');
console.log('');
console.log('✅ Auto-tick started (every 60s)');
console.log('========================================');
console.log('');
