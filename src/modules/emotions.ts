import { ToobixClient } from '../api/client';

export interface EmotionalState {
  current: string;
  valence: number;
  arousal: number;
  trend: string;
  stability: number;
}

export async function getEmotionalState(client: ToobixClient): Promise<EmotionalState> {
  return client.get<EmotionalState>('/emotions/state');
}

export async function listEmotions(client: ToobixClient, limit = 10) {
  return client.get<{ emotions: any[] }>(`/emotions?limit=${limit}`);
}

export async function getInsights(client: ToobixClient, limit = 30) {
  return client.get<{ insights: any }>(`/emotions/insights?limit=${limit}`);
}
