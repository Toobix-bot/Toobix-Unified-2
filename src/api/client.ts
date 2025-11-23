export interface ToobixClientOptions {
  baseUrl?: string;
  gatewayPort?: number;
  apiKey?: string;
}

export class ToobixClient {
  private readonly baseUrl: string;
  private readonly gatewayPort: number;
  private readonly apiKey?: string;

  constructor(options: ToobixClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? 'http://localhost';
    this.gatewayPort = options.gatewayPort ?? 9000;
    this.apiKey = options.apiKey;
  }

  private url(path: string): string {
    return `${this.baseUrl}:${this.gatewayPort}${path}`;
  }

  private headers(): Record<string, string> {
    const headers: Record<string, string> = {};
    if (this.apiKey) {
      headers['x-toobix-key'] = this.apiKey;
    }
    return headers;
  }

  async get<T>(path: string): Promise<T> {
    const response = await fetch(this.url(path), { headers: this.headers() });
    if (!response.ok) {
      throw new Error(`GET ${path} failed with ${response.status}`);
    }
    return (await response.json()) as T;
  }

  async post<T, B = unknown>(path: string, body: B): Promise<T> {
    const response = await fetch(this.url(path), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.headers() },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`POST ${path} failed with ${response.status}`);
    }

    return (await response.json()) as T;
  }
}
