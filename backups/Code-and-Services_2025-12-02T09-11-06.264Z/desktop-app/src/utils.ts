/**
 * TOOBIX UNIFIED - UTILITY FUNCTIONS
 *
 * Helper functions for error handling, notifications, and more
 */

// ========== ERROR HANDLING ==========

export class ServiceError extends Error {
  constructor(
    message: string,
    public serviceId?: string,
    public code?: string,
    public retryable: boolean = true
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number;
    delay?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const { retries = 3, delay = 1000, onRetry } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < retries) {
        onRetry?.(attempt, lastError);
        await sleep(delay * attempt); // Exponential backoff
      }
    }
  }

  throw lastError!;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ========== TOAST NOTIFICATIONS ==========

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

class ToastManager {
  private toasts: Toast[] = [];
  private listeners = new Set<(toasts: Toast[]) => void>();

  subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }

  show(toast: Omit<Toast, 'id'>): string {
    const id = `toast_${Date.now()}_${Math.random()}`;
    const newToast: Toast = { id, ...toast };

    this.toasts.push(newToast);
    this.notify();

    // Auto-dismiss after duration
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }

    return id;
  }

  success(title: string, message?: string, duration?: number) {
    return this.show({ type: 'success', title, message, duration });
  }

  error(title: string, message?: string, duration?: number) {
    return this.show({ type: 'error', title, message, duration });
  }

  warning(title: string, message?: string, duration?: number) {
    return this.show({ type: 'warning', title, message, duration });
  }

  info(title: string, message?: string, duration?: number) {
    return this.show({ type: 'info', title, message, duration });
  }

  dismiss(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.notify();
  }

  clear() {
    this.toasts = [];
    this.notify();
  }
}

export const toast = new ToastManager();

// ========== SERVICE HEALTH CHECKER ==========

export class HealthChecker {
  private healthCache = new Map<number, { healthy: boolean; lastCheck: number }>();
  private cacheTimeout = 5000; // 5 seconds

  async checkHealth(port: number, forceRefresh = false): Promise<boolean> {
    const cached = this.healthCache.get(port);
    const now = Date.now();

    // Return cached result if fresh
    if (!forceRefresh && cached && (now - cached.lastCheck) < this.cacheTimeout) {
      return cached.healthy;
    }

    // Check health
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(`http://localhost:${port}/health`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const healthy = response.ok;
      this.healthCache.set(port, { healthy, lastCheck: now });

      return healthy;
    } catch (error) {
      this.healthCache.set(port, { healthy: false, lastCheck: now });
      return false;
    }
  }

  clearCache(port?: number) {
    if (port) {
      this.healthCache.delete(port);
    } else {
      this.healthCache.clear();
    }
  }
}

export const healthChecker = new HealthChecker();

// ========== DEBOUNCE & THROTTLE ==========

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ========== FORMAT HELPERS ==========

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}`;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3600000) return `${Math.round(ms / 60000)}m`;
  return `${Math.round(ms / 3600000)}h`;
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // Less than 1 minute
  if (diff < 60000) return 'just now';

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }

  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }

  // Less than 7 days
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days}d ago`;
  }

  // Otherwise show date
  return date.toLocaleDateString();
}

// ========== LOCAL STORAGE HELPERS ==========

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },

  remove(key: string): void {
    localStorage.removeItem(key);
  },

  clear(): void {
    localStorage.clear();
  }
};

// ========== COLOR UTILITIES ==========

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function adjustBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const adjust = (value: number) => {
    const adjusted = Math.round(value * (1 + percent / 100));
    return Math.max(0, Math.min(255, adjusted));
  };

  return rgbToHex(adjust(rgb.r), adjust(rgb.g), adjust(rgb.b));
}

// ========== VALIDATION ==========

export function isValidPort(port: number): boolean {
  return Number.isInteger(port) && port >= 1 && port <= 65535;
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ========== ANALYTICS ==========

export class Analytics {
  private events: Array<{ name: string; data: any; timestamp: number }> = [];

  track(eventName: string, data?: any) {
    this.events.push({
      name: eventName,
      data,
      timestamp: Date.now()
    });

    // Keep only last 1000 events
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }
  }

  getEvents(filter?: { name?: string; since?: number }) {
    let filtered = this.events;

    if (filter?.name) {
      filtered = filtered.filter(e => e.name === filter.name);
    }

    if (filter && filter.since !== undefined) {
      filtered = filtered.filter(e => e.timestamp >= filter.since!);
    }

    return filtered;
  }

  clear() {
    this.events = [];
  }
}

export const analytics = new Analytics();
