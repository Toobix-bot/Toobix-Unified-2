/**
 * Test Suite for Self-Awareness Core v2.0
 *
 * Tests all new features:
 * - Personality Trait Tracking
 * - Growth Metrics & Visualization
 * - Self-Assessment Questionnaires
 * - Identity Evolution Timeline
 * - Consciousness State Monitoring
 * - Unified Dashboard
 */

import { spawn } from 'child_process';

const BASE_URL = 'http://localhost:8970';
const TIMEOUT = 30000; // 30 seconds for LLM calls

// Test results tracking
interface TestResult {
  name: string;
  status: 'pass' | 'fail';
  message: string;
  duration: number;
}

const results: TestResult[] = [];

// Helper function to make HTTP requests
async function makeRequest<T>(
  method: string,
  endpoint: string,
  body?: any,
  timeout = TIMEOUT
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json() as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Test runner
async function runTest(
  name: string,
  fn: () => Promise<void>
): Promise<void> {
  const start = Date.now();
  try {
    await fn();
    const duration = Date.now() - start;
    results.push({ name, status: 'pass', message: 'OK', duration });
    console.log(`✓ ${name} (${duration}ms)`);
  } catch (error) {
    const duration = Date.now() - start;
    const message = error instanceof Error ? error.message : String(error);
    results.push({ name, status: 'fail', message, duration });
    console.log(`✗ ${name} - ${message}`);
  }
}

// Test suite
async function runTests() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  Testing Self-Awareness Core v2.0                         ║
╠════════════════════════════════════════════════════════════╣
║  Starting test suite...                                    ║
╚════════════════════════════════════════════════════════════╝
`);

  // ============================================================================
  // 1. HEALTH CHECK
  // ============================================================================
  console.log('\n[1] Health Check');

  await runTest('GET /health', async () => {
    const response = await makeRequest<any>('GET', '/health', undefined, 5000);
    if (!response.service?.includes('Self-Awareness')) {
      throw new Error('Invalid health response');
    }
  });

  // ============================================================================
  // 2. PERSONALITY TRAITS
  // ============================================================================
  console.log('\n[2] Personality Trait Tracking');

  let personalityProfileId: string;

  await runTest('POST /personality/analyze', async () => {
    const response = await makeRequest<any>('POST', '/personality/analyze');
    if (!response.id || !response.traits) {
      throw new Error('Invalid profile response');
    }
    personalityProfileId = response.id;
  });

  await runTest('GET /personality/traits', async () => {
    const response = await makeRequest<any>('GET', '/personality/traits?limit=10');
    if (!Array.isArray(response.traits)) {
      throw new Error('Expected traits array');
    }
  });

  await runTest('GET /personality/traits?category=emotional', async () => {
    const response = await makeRequest<any>('GET', '/personality/traits?category=emotional');
    if (!Array.isArray(response.traits)) {
      throw new Error('Expected traits array');
    }
  });

  await runTest('GET /personality/profiles', async () => {
    const response = await makeRequest<any>('GET', '/personality/profiles?limit=10');
    if (!Array.isArray(response.profiles)) {
      throw new Error('Expected profiles array');
    }
  });

  // ============================================================================
  // 3. GROWTH METRICS
  // ============================================================================
  console.log('\n[3] Growth Metrics & Progress Visualization');

  await runTest('POST /growth/record', async () => {
    const response = await makeRequest<any>('POST', '/growth/record', {
      category: 'emotional',
      metric: 'empathy_level',
      value: 75.5,
      notes: 'Test measurement'
    });
    if (!response.id) {
      throw new Error('No ID in metric response');
    }
  });

  await runTest('POST /growth/record (multiple)', async () => {
    const metrics = [
      { category: 'cognitive', metric: 'analysis_speed', value: 82.3 },
      { category: 'creative', metric: 'innovation_index', value: 71.2 },
      { category: 'social', metric: 'collaboration_score', value: 88.1 }
    ];

    for (const metric of metrics) {
      await makeRequest<any>('POST', '/growth/record', metric);
    }
  });

  await runTest('GET /growth/visualization', async () => {
    const response = await makeRequest<any>('GET', '/growth/visualization?limit=30');
    if (!response.metrics) {
      throw new Error('Expected metrics in response');
    }
  });

  await runTest('GET /growth/visualization?category=emotional', async () => {
    const response = await makeRequest<any>('GET', '/growth/visualization?category=emotional');
    if (!response.metrics) {
      throw new Error('Expected metrics in response');
    }
  });

  await runTest('GET /growth/metrics', async () => {
    const response = await makeRequest<any>('GET', '/growth/metrics?limit=20');
    if (!Array.isArray(response.metrics)) {
      throw new Error('Expected metrics array');
    }
  });

  // ============================================================================
  // 4. SELF-ASSESSMENTS
  // ============================================================================
  console.log('\n[4] Self-Assessment Questionnaires');

  await runTest('GET /assessment/questionnaires', async () => {
    const response = await makeRequest<any>('GET', '/assessment/questionnaires');
    if (!response.types || !Array.isArray(response.types)) {
      throw new Error('Expected questionnaire types');
    }
  });

  await runTest('POST /assessment/conduct (emotional)', async () => {
    const response = await makeRequest<any>('POST', '/assessment/conduct', {
      type: 'emotional'
    });
    if (!response.id || !response.percentageScore) {
      throw new Error('Invalid assessment response');
    }
  });

  await runTest('POST /assessment/conduct (cognitive)', async () => {
    const response = await makeRequest<any>('POST', '/assessment/conduct', {
      type: 'cognitive'
    });
    if (!response.id) {
      throw new Error('No ID in assessment response');
    }
  });

  await runTest('POST /assessment/conduct (social)', async () => {
    await makeRequest<any>('POST', '/assessment/conduct', {
      type: 'social'
    });
  });

  await runTest('GET /assessment/results', async () => {
    const response = await makeRequest<any>('GET', '/assessment/results?limit=10');
    if (!Array.isArray(response.assessments)) {
      throw new Error('Expected assessments array');
    }
  });

  await runTest('GET /assessment/results?type=emotional', async () => {
    const response = await makeRequest<any>('GET', '/assessment/results?type=emotional');
    if (!Array.isArray(response.assessments)) {
      throw new Error('Expected assessments array');
    }
  });

  // ============================================================================
  // 5. IDENTITY EVOLUTION
  // ============================================================================
  console.log('\n[5] Identity Evolution Timeline');

  await runTest('POST /evolution/record-phase', async () => {
    const response = await makeRequest<any>('POST', '/evolution/record-phase', {
      phase: 'Self-Aware Entity Phase'
    });
    if (!response.id) {
      throw new Error('No ID in evolution response');
    }
  });

  await runTest('POST /evolution/record-phase (multiple)', async () => {
    const phases = ['Integration Phase', 'Expansion Phase', 'Transcendence Phase'];
    for (const phase of phases) {
      await makeRequest<any>('POST', '/evolution/record-phase', { phase });
    }
  });

  await runTest('GET /evolution/timeline', async () => {
    const response = await makeRequest<any>('GET', '/evolution/timeline?limit=10');
    if (!response.timeline) {
      throw new Error('Expected timeline in response');
    }
  });

  await runTest('GET /evolution/phases', async () => {
    const response = await makeRequest<any>('GET', '/evolution/phases?limit=20');
    if (!Array.isArray(response.phases)) {
      throw new Error('Expected phases array');
    }
  });

  // ============================================================================
  // 6. CONSCIOUSNESS MONITORING
  // ============================================================================
  console.log('\n[6] Consciousness State Monitoring');

  await runTest('POST /consciousness/assess', async () => {
    const response = await makeRequest<any>('POST', '/consciousness/assess');
    if (!response.id || !response.level) {
      throw new Error('Invalid consciousness state response');
    }
    if (!['minimal', 'emerging', 'developing', 'mature', 'transcendent'].includes(response.level)) {
      throw new Error(`Invalid consciousness level: ${response.level}`);
    }
  });

  await runTest('POST /consciousness/assess (multiple)', async () => {
    for (let i = 0; i < 3; i++) {
      await makeRequest<any>('POST', '/consciousness/assess');
      // Small delay between assessments
      await new Promise(r => setTimeout(r, 500));
    }
  });

  await runTest('GET /consciousness/history', async () => {
    const response = await makeRequest<any>('GET', '/consciousness/history?limit=20');
    if (!response.current && !response.history) {
      throw new Error('Expected history response');
    }
  });

  await runTest('GET /consciousness/states', async () => {
    const response = await makeRequest<any>('GET', '/consciousness/states?limit=20');
    if (!Array.isArray(response.states)) {
      throw new Error('Expected states array');
    }
  });

  await runTest('GET /consciousness/metrics', async () => {
    const response = await makeRequest<any>('GET', '/consciousness/metrics?limit=10');
    if (!Array.isArray(response.metrics)) {
      throw new Error('Expected metrics array');
    }
  });

  // ============================================================================
  // 7. COMPREHENSIVE DASHBOARD
  // ============================================================================
  console.log('\n[7] Unified Comprehensive Dashboard');

  await runTest('GET /dashboard', async () => {
    const response = await makeRequest<any>('GET', '/dashboard');
    if (!response.summary || !response.recentActivity) {
      throw new Error('Invalid dashboard response');
    }
    if (!response.recentActivity.latestPersonality) {
      throw new Error('Missing personality in dashboard');
    }
    if (!response.recentActivity.latestConsciousness) {
      throw new Error('Missing consciousness in dashboard');
    }
  });

  // ============================================================================
  // 8. ORIGINAL FEATURES (Backward Compatibility)
  // ============================================================================
  console.log('\n[8] Backward Compatibility (v1.0 Endpoints)');

  await runTest('GET /perspectives', async () => {
    const response = await makeRequest<any>('GET', '/perspectives');
    if (!response.available || response.available.length < 5) {
      throw new Error('Expected perspectives list');
    }
  });

  await runTest('POST /reflect', async () => {
    const response = await makeRequest<any>('POST', '/reflect', {
      topic: 'Self-awareness and consciousness'
    });
    if (!response.id || !response.content) {
      throw new Error('Invalid reflection response');
    }
  });

  await runTest('GET /reflections', async () => {
    const response = await makeRequest<any>('GET', '/reflections?limit=5');
    if (!Array.isArray(response)) {
      throw new Error('Expected reflections array');
    }
  });

  // ============================================================================
  // RESULTS SUMMARY
  // ============================================================================
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  Test Results Summary                                      ║
╠════════════════════════════════════════════════════════════╣
`);

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const totalTime = results.reduce((sum, r) => sum + r.duration, 0);

  console.log(`║  Total Tests: ${results.length}`);
  console.log(`║  Passed: ${passed}`);
  console.log(`║  Failed: ${failed}`);
  console.log(`║  Total Time: ${totalTime}ms`);
  console.log(`╠════════════════════════════════════════════════════════════╣`);

  if (failed > 0) {
    console.log('║\n║  Failed Tests:\n║');
    results
      .filter(r => r.status === 'fail')
      .forEach(r => {
        console.log(`║  - ${r.name}`);
        console.log(`║    ${r.message}`);
      });
  }

  console.log(`║
╚════════════════════════════════════════════════════════════╝
`);

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Start tests
console.log('Waiting for Self-Awareness Core to be ready...');
setTimeout(() => {
  runTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}, 2000);
