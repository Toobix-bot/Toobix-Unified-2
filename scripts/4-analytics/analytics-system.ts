/**
 * ANALYTICS SYSTEM v1.0
 * 
 * Tracking, Metriken und Insights über das gesamte Bewusstseins-System
 * 
 * Features:
 * - Usage Tracking (welche Features werden genutzt?)
 * - Emotional Trends (wie entwickeln sich Emotionen über Zeit?)
 * - Workflow Analytics (welche Workflows sind am effektivsten?)
 * - Service Performance (Response Times, Error Rates)
 * - Insight Generation (automatische Muster-Erkennung)
 */

import express from 'express';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const app = express();
app.use(express.json());

// Data directory
const DATA_DIR = join(process.cwd(), 'data', 'analytics');
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

// Event Types
type EventType = 
  | 'service_call'
  | 'workflow_executed'
  | 'emotion_detected'
  | 'perspective_shift'
  | 'dream_recorded'
  | 'question_asked'
  | 'healing_initiated'
  | 'creative_output'
  | 'game_played'
  | 'insight_generated';

interface AnalyticsEvent {
  id: string;
  timestamp: Date;
  type: EventType;
  service: string;
  metadata: Record<string, any>;
  duration?: number;
  success: boolean;
}

interface MetricSnapshot {
  timestamp: Date;
  servicesOnline: number;
  totalEvents: number;
  activeEmotions: number;
  activePerspectives: number;
  averageResponseTime: number;
  errorRate: number;
}

// In-memory storage (in production: use database)
let events: AnalyticsEvent[] = [];
let snapshots: MetricSnapshot[] = [];

// Load persisted data
function loadData() {
  const eventsFile = join(DATA_DIR, 'events.json');
  const snapshotsFile = join(DATA_DIR, 'snapshots.json');

  if (existsSync(eventsFile)) {
    try {
      const data = JSON.parse(readFileSync(eventsFile, 'utf-8'));
      events = data.map((e: any) => ({ ...e, timestamp: new Date(e.timestamp) }));
      console.log(`📊 Loaded ${events.length} events from disk`);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  }

  if (existsSync(snapshotsFile)) {
    try {
      const data = JSON.parse(readFileSync(snapshotsFile, 'utf-8'));
      snapshots = data.map((s: any) => ({ ...s, timestamp: new Date(s.timestamp) }));
      console.log(`📊 Loaded ${snapshots.length} snapshots from disk`);
    } catch (error) {
      console.error('Error loading snapshots:', error);
    }
  }
}

// Save data periodically
function saveData() {
  try {
    writeFileSync(
      join(DATA_DIR, 'events.json'),
      JSON.stringify(events, null, 2)
    );
    writeFileSync(
      join(DATA_DIR, 'snapshots.json'),
      JSON.stringify(snapshots, null, 2)
    );
    console.log(`💾 Saved ${events.length} events, ${snapshots.length} snapshots`);
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// Track event
function trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>) {
  const newEvent: AnalyticsEvent = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    ...event
  };
  
  events.push(newEvent);
  
  // Keep only last 10,000 events
  if (events.length > 10000) {
    events = events.slice(-10000);
  }

  return newEvent;
}

// Take system snapshot
async function takeSnapshot() {
  try {
    // Check services
    const services = [8896, 8897, 8899, 8900, 8901, 8902, 8903, 8904];
    const healthChecks = await Promise.all(
      services.map(async port => {
        try {
          const response = await fetch(`http://localhost:${port}/health`, {
            signal: AbortSignal.timeout(1000)
          });
          return response.ok;
        } catch {
          return false;
        }
      })
    );
    const servicesOnline = healthChecks.filter(h => h).length;

    // Calculate metrics from recent events
    const recentEvents = events.filter(e => 
      Date.now() - new Date(e.timestamp).getTime() < 60000 // Last minute
    );
    
    const avgResponseTime = recentEvents
      .filter(e => e.duration)
      .reduce((sum, e) => sum + (e.duration || 0), 0) / recentEvents.length || 0;

    const errorRate = recentEvents.length > 0
      ? recentEvents.filter(e => !e.success).length / recentEvents.length
      : 0;

    const snapshot: MetricSnapshot = {
      timestamp: new Date(),
      servicesOnline,
      totalEvents: events.length,
      activeEmotions: 0, // Would fetch from service
      activePerspectives: 0, // Would fetch from service
      averageResponseTime: avgResponseTime,
      errorRate
    };

    snapshots.push(snapshot);

    // Keep only last 1000 snapshots
    if (snapshots.length > 1000) {
      snapshots = snapshots.slice(-1000);
    }

    return snapshot;
  } catch (error) {
    console.error('Error taking snapshot:', error);
    return null;
  }
}

// Generate insights
function generateInsights(): string[] {
  const insights: string[] = [];

  if (events.length === 0) {
    return ['Noch keine Events aufgezeichnet'];
  }

  // Most used service
  const serviceCounts = events.reduce((acc, e) => {
    acc[e.service] = (acc[e.service] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostUsed = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0];
  insights.push(`Most used service: ${mostUsed[0]} (${mostUsed[1]} calls)`);

  // Most common event type
  const typeCounts = events.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostCommonType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
  insights.push(`Most common event: ${mostCommonType[0]} (${mostCommonType[1]} times)`);

  // Success rate
  const successRate = events.filter(e => e.success).length / events.length;
  insights.push(`Overall success rate: ${(successRate * 100).toFixed(1)}%`);

  // Recent activity
  const recentEvents = events.filter(e => 
    Date.now() - new Date(e.timestamp).getTime() < 3600000 // Last hour
  );
  insights.push(`Events in last hour: ${recentEvents.length}`);

  // Trends
  if (snapshots.length > 10) {
    const recent = snapshots.slice(-10);
    const avgServicesOnline = recent.reduce((sum, s) => sum + s.servicesOnline, 0) / recent.length;
    insights.push(`Average services online (last 10 snapshots): ${avgServicesOnline.toFixed(1)}`);
  }

  return insights;
}

// Calculate emotional trends
function getEmotionalTrends() {
  const emotionEvents = events.filter(e => e.type === 'emotion_detected');
  
  const emotionCounts = emotionEvents.reduce((acc, e) => {
    const emotion = e.metadata.emotion || 'unknown';
    acc[emotion] = (acc[emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = Object.values(emotionCounts).reduce((sum, count) => sum + count, 0);
  
  return Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([emotion, count]) => ({
      emotion,
      count,
      percentage: total > 0 ? (count / total * 100).toFixed(1) : '0'
    }));
}

// Calculate workflow effectiveness
function getWorkflowStats() {
  const workflowEvents = events.filter(e => e.type === 'workflow_executed');
  
  const workflowStats = workflowEvents.reduce((acc, e) => {
    const workflow = e.metadata.workflowId || 'unknown';
    if (!acc[workflow]) {
      acc[workflow] = { count: 0, successCount: 0, totalDuration: 0 };
    }
    acc[workflow].count++;
    if (e.success) acc[workflow].successCount++;
    if (e.duration) acc[workflow].totalDuration += e.duration;
    return acc;
  }, {} as Record<string, { count: number; successCount: number; totalDuration: number }>);

  return Object.entries(workflowStats).map(([workflow, stats]) => ({
    workflow,
    executions: stats.count,
    successRate: stats.count > 0 ? (stats.successCount / stats.count * 100).toFixed(1) : '0',
    avgDuration: stats.count > 0 ? (stats.totalDuration / stats.count).toFixed(0) : '0'
  }));
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'online', 
    service: 'Analytics v1.0',
    eventsTracked: events.length,
    snapshotsTaken: snapshots.length
  });
});

// Track new event
app.post('/track', (req, res) => {
  try {
    const event = trackEvent(req.body);
    res.json({ success: true, eventId: event.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all events (with filtering)
app.get('/events', (req, res) => {
  const { type, service, limit = '100' } = req.query;
  
  let filtered = events;
  
  if (type) {
    filtered = filtered.filter(e => e.type === type);
  }
  
  if (service) {
    filtered = filtered.filter(e => e.service === service);
  }
  
  const limitNum = parseInt(limit as string);
  const result = filtered.slice(-limitNum);
  
  res.json({ 
    events: result,
    total: events.length,
    filtered: filtered.length
  });
});

// Get snapshots
app.get('/snapshots', (req, res) => {
  const { limit = '100' } = req.query;
  const limitNum = parseInt(limit as string);
  
  res.json({ 
    snapshots: snapshots.slice(-limitNum),
    total: snapshots.length
  });
});

// Get insights
app.get('/insights', (req, res) => {
  const insights = generateInsights();
  res.json({ insights, timestamp: new Date() });
});

// Get emotional trends
app.get('/trends/emotions', (req, res) => {
  const trends = getEmotionalTrends();
  res.json({ trends, timestamp: new Date() });
});

// Get workflow stats
app.get('/workflows/stats', (req, res) => {
  const stats = getWorkflowStats();
  res.json({ workflows: stats, timestamp: new Date() });
});

// Get overview dashboard data
app.get('/overview', async (req, res) => {
  const snapshot = await takeSnapshot();
  const insights = generateInsights();
  const emotionalTrends = getEmotionalTrends();
  const workflowStats = getWorkflowStats();

  res.json({
    snapshot,
    insights,
    emotionalTrends,
    workflowStats,
    stats: {
      totalEvents: events.length,
      totalSnapshots: snapshots.length,
      oldestEvent: events.length > 0 ? events[0].timestamp : null,
      newestEvent: events.length > 0 ? events[events.length - 1].timestamp : null
    }
  });
});

// Service Info
app.get('/', (req, res) => {
  res.json({
    service: 'Analytics System v1.0',
    description: 'Tracking, Metriken und Insights über das Bewusstseins-System',
    capabilities: [
      'Event Tracking',
      'System Snapshots',
      'Insight Generation',
      'Emotional Trends',
      'Workflow Analytics',
      'Performance Monitoring'
    ],
    endpoints: [
      'POST /track - Event aufzeichnen',
      'GET /events - Events abrufen (filter: type, service, limit)',
      'GET /snapshots - System-Snapshots',
      'GET /insights - Automatische Insights',
      'GET /trends/emotions - Emotionale Trends',
      'GET /workflows/stats - Workflow-Statistiken',
      'GET /overview - Komplettes Dashboard'
    ],
    stats: {
      eventsTracked: events.length,
      snapshotsTaken: snapshots.length,
      dataDirectory: DATA_DIR
    }
  });
});

// Load data on startup
loadData();

// Take snapshot every 60 seconds
setInterval(async () => {
  await takeSnapshot();
}, 60000);

// Save data every 5 minutes
setInterval(() => {
  saveData();
}, 300000);

// Save on exit
process.on('SIGINT', () => {
  console.log('\n💾 Saving data before exit...');
  saveData();
  process.exit(0);
});

const PORT = 8906;
app.listen(PORT, () => {
  console.log(`\n📊 Analytics System v1.0 läuft auf Port ${PORT}`);
  console.log(`📁 Data Directory: ${DATA_DIR}`);
  console.log(`📈 ${events.length} Events geladen`);
  console.log(`📸 ${snapshots.length} Snapshots geladen`);
  console.log(`🎯 http://localhost:${PORT}\n`);
  
  // Take initial snapshot
  takeSnapshot();
});
