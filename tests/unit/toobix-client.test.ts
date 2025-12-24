import { describe, expect, it } from 'vitest';
import { ToobixClient } from '../../src/api/client';

describe('ToobixClient', () => {
  it('builds URLs correctly', () => {
    const client = new ToobixClient({ baseUrl: 'http://localhost', gatewayPort: 9000 });
    const url = (client as any).url('/test');
    expect(url).toBe('http://localhost:9000/test');
  });
});
