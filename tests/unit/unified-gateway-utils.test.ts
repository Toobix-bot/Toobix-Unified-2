import { describe, expect, it } from 'vitest';
import { formatDashboardSummary, parseChatCommand } from '../../services/unified-service-gateway';

describe('parseChatCommand', () => {
  it('returns null for non-commands', () => {
    expect(parseChatCommand('hello')).toBeNull();
  });

  it('parses leading slash commands', () => {
    expect(parseChatCommand('/dream lucid fly to moon')).toEqual({
      command: 'dream',
      args: 'lucid fly to moon'
    });
  });
});

describe('formatDashboardSummary', () => {
  it('renders a compact snapshot summary', () => {
    const summary = formatDashboardSummary({
      timestamp: new Date().toISOString(),
      hardware: { cpu: { usage: 12 }, memory: { usagePercent: 34 } },
      feeling: null,
      duality: {
        state: {
          masculine: { intensity: 60, mode: 'action', active: true, traits: [] },
          feminine: { intensity: 55, mode: 'flowing', active: true, traits: [] },
          harmony: 75,
          currentPhase: 'Integration',
          timestamp: new Date().toISOString()
        },
        history: []
      },
      dreams: { recent: [] },
      emotions: { state: { dominant: 'calm', valence: 5, arousal: 4, trend: 'stable', stability: 90, energy: 10, momentum: 'steady', timestamp: new Date().toISOString() }, insights: {} as any },
      memory: { rooms: [], recent: [] },
      gratitudes: [],
      services: [],
      game: { level: 1, score: 0 },
      profile: { level: 1, xp: 0, arcs: {}, artifacts: [], interactions: 0, lastUpdate: new Date().toISOString() }
    } as any);

    expect(summary).toContain('Hardware');
    expect(summary).toContain('Dualität');
    expect(summary).toContain('Emotion');
  });
});
