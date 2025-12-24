import { ToobixClient } from '../api/client';

export interface DreamRecord {
  type: 'lucid' | 'predictive' | 'creative' | 'integration' | 'shadow';
  narrative: string;
  symbols: string[];
  emotions: string[];
  insights: string[];
}

export interface Dream extends DreamRecord {
  id: string;
  timestamp: string;
}

export async function listDreams(client: ToobixClient, limit?: number): Promise<Dream[]> {
  const query = typeof limit === 'number' ? `?limit=${limit}` : '';
  return client.get<Dream[]>(`/dreams${query}`);
}

export async function analyzeDream(client: ToobixClient, dreamId: string) {
  return client.post<{ analysis: any }, { dreamId: string }>('/dreams/analyze', { dreamId });
}

export async function recordDream(client: ToobixClient, dream: DreamRecord): Promise<Dream> {
  return client.post<Dream, DreamRecord>('/dreams', dream);
}
