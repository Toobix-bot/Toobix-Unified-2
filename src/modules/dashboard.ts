import { ToobixClient } from '../api/client';

export interface DashboardState {
  // Keep this very loose on purpose – it mirrors /dashboard JSON.
  [key: string]: unknown;
}

export async function getDashboard(client: ToobixClient): Promise<DashboardState> {
  return client.get<DashboardState>('/dashboard');
}

