/**
 * 🔁 CIRCUIT BREAKER LIBRARY
 * 
 * Verhindert Cascade Failures bei Service-Ausfällen
 */

export enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Service is failing, reject requests
  HALF_OPEN = 'HALF_OPEN' // Testing if service recovered
}

export interface CircuitBreakerConfig {
  failureThreshold: number;      // How many failures before opening
  successThreshold: number;      // How many successes before closing from half-open
  timeout: number;               // How long to wait before half-open (ms)
  resetTimeout?: number;         // How long to reset failure count after success (ms)
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number = 0;
  private nextAttempt: number = 0;
  
  constructor(
    private name: string,
    private config: CircuitBreakerConfig
  ) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new Error(`Circuit breaker OPEN for ${this.name}`);
      }
      // Try to recover
      this.state = CircuitState.HALF_OPEN;
      console.log(`🔄 Circuit breaker HALF_OPEN for ${this.name}`);
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess(): void {
    this.failureCount = 0;
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
        console.log(`✅ Circuit breaker CLOSED for ${this.name}`);
      }
    }
  }
  
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    this.successCount = 0;
    
    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.config.timeout;
      console.log(`❌ Circuit breaker OPEN for ${this.name} (failures: ${this.failureCount})`);
    }
  }
  
  getState(): CircuitState {
    return this.state;
  }
  
  getStats() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      nextAttempt: this.nextAttempt
    };
  }
  
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    console.log(`🔄 Circuit breaker RESET for ${this.name}`);
  }
}

/**
 * Example usage:
 * 
 * const breaker = new CircuitBreaker('external-api', {
 *   failureThreshold: 5,
 *   successThreshold: 2,
 *   timeout: 60000 // 1 minute
 * });
 * 
 * try {
 *   const data = await breaker.execute(() => 
 *     fetch('http://localhost:8xxx/api').then(r => r.json())
 *   );
 * } catch (error) {
 *   // Handle circuit open or actual error
 * }
 */
