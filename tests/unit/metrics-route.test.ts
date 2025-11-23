import { describe, expect, it } from 'vitest';

describe('Gateway metrics snapshot (without server)', () => {
  it('exposes metrics builder via ESM import dynamic call', async () => {
    const mod = await import('../../services/unified-service-gateway');
    const hasBuilder = (mod as any).buildMetrics || (mod as any).fetchMetrics;
    expect(typeof hasBuilder === 'function').toBe(true);
  });
});
