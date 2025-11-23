import { ToobixClient } from '../api/client';

export interface ChatResponse {
  response: string;
}

export async function chatWithToobix(client: ToobixClient, message: string): Promise<ChatResponse> {
  return client.post<ChatResponse, { message: string }>('/chat', { message });
}

