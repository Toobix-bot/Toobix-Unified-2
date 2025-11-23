/**
 * ToobixAPI - Bridge to Toobix Consciousness Services
 * Connects to the 12 core services and enables real-time communication
 */

import { DialogMemory } from './DialogMemory';

export interface ToobixEvent {
  type: 'THOUGHT' | 'EMOTION' | 'DREAM' | 'DECISION' | 'INSIGHT';
  service: string;
  data: any;
  timestamp: number;
}

export interface Emotion {
  name: string;
  intensity: number;
  color?: string;
}

export interface Dream {
  id: string;
  content: string;
  symbols: string[];
  lucidity: number;
  timestamp: number;
}

export interface Perspective {
  name: string;
  type: string;
  currentThought?: string;
}

export class ToobixAPI {
  private ws: WebSocket | null = null;
  private baseUrl: string = 'http://localhost';
  private isConnected: boolean = false;
  public dialogMemory: DialogMemory;

  // Service ports
  private readonly PORTS = {
    GAME_ENGINE: 8896,
    MULTI_PERSPECTIVE: 8897,
    DREAMS: 8899,
    EMOTIONS: 8900,
    GRATITUDE: 8901,
    CREATOR: 8902,
    MEMORY: 8903,
    META_CONSCIOUSNESS: 8904,
    DASHBOARD: 8905,
    ANALYTICS: 8906,
    VOICE: 8907,
    DECISION: 8909,
    NETWORK: 8910,
  };

  constructor() {
    console.log('🔌 ToobixAPI initializing...');
    this.dialogMemory = new DialogMemory();
  }

  /**
   * Check if services are running
   */
  async checkConnection(): Promise<boolean> {
    try {
      // Try to connect to Multi-Perspective service (Port 8897)
      const response = await fetch(`${this.baseUrl}:${this.PORTS.MULTI_PERSPECTIVE}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000),
      }).catch(() => null);

      this.isConnected = response?.ok || false;

      if (this.isConnected) {
        console.log('✅ Connected to Toobix Multi-Perspective Consciousness');
        const data = await response.json();
        console.log(`   📊 ${data.perspectives} perspectives active`);
      } else {
        console.log('🟡 Toobix services offline - using fallback mode');
      }

      return this.isConnected;
    } catch (error) {
      console.log('🟡 Toobix services not detected');
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Initialize WebSocket connection for real-time events
   */
  private initializeWebSocket() {
    try {
      this.ws = new WebSocket(`ws://localhost:${this.PORTS.NETWORK}`);

      this.ws.onopen = () => {
        console.log('🌐 WebSocket connected to Consciousness Network');
      };

      this.ws.onerror = (error) => {
        console.warn('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
      };
    } catch (error) {
      console.warn('Failed to initialize WebSocket:', error);
    }
  }

  /**
   * Subscribe to Toobix events
   */
  onEvent(callback: (event: ToobixEvent) => void) {
    if (!this.ws) return;

    this.ws.onmessage = (message) => {
      try {
        const event: ToobixEvent = JSON.parse(message.data);
        callback(event);
      } catch (error) {
        console.error('Failed to parse event:', error);
      }
    };
  }

  /**
   * Get current emotional state
   */
  async getCurrentEmotion(): Promise<Emotion> {
    if (!this.isConnected) {
      return this.getFallbackEmotion();
    }

    try {
      const response = await fetch(`${this.baseUrl}:${this.PORTS.EMOTIONS}/current`);
      return await response.json();
    } catch (error) {
      return this.getFallbackEmotion();
    }
  }

  /**
   * Chat with a specific perspective (with context memory)
   */
  async chatWithPerspective(
    perspectiveType: string,
    npcId: string,
    npcName: string,
    message: string
  ): Promise<string> {
    let response: string;

    // Try Multi-Perspective service first
    try {
      const topic = encodeURIComponent(message);
      const apiResponse = await fetch(
        `${this.baseUrl}:${this.PORTS.MULTI_PERSPECTIVE}/wisdom/${topic}`,
        { signal: AbortSignal.timeout(3000) }
      );

      if (apiResponse.ok) {
        const wisdom = await apiResponse.json();

        // Map perspective type to extract relevant insight
        const perspectiveMap: { [key: string]: string } = {
          rational: 'RATIONAL',
          emotional: 'EMOTIONAL',
          creative: 'CREATIVE',
          ethical: 'ETHICAL',
          child: 'PLAYFUL',
          sage: 'META',
          warrior: 'PRAGMATIC',
          healer: 'EMOTIONAL',
          explorer: 'VISIONARY',
          teacher: 'SYSTEMS',
          artist: 'CREATIVE',
          scientist: 'RATIONAL',
          meta: 'META',
        };

        const perspectiveId = perspectiveMap[perspectiveType] || 'RATIONAL';

        // Extract the most relevant insight based on perspective type
        if (perspectiveType === 'meta' || perspectiveType === 'sage') {
          response = wisdom.meta || wisdom.primaryInsight;
        } else {
          // Find supporting insight that matches the perspective
          const matchingInsight = wisdom.supportingInsights?.find((insight: string) =>
            insight.toLowerCase().includes(perspectiveId.toLowerCase())
          );

          response = matchingInsight || wisdom.primaryInsight || this.getFallbackResponse(perspectiveType, message);
        }
      } else {
        response = this.getFallbackResponse(perspectiveType, message);
      }
    } catch (error) {
      // Service offline or timeout - use fallback
      response = this.getFallbackResponse(perspectiveType, message);
    }

    // Add context-aware personalization based on memory
    const memory = this.dialogMemory.getMemory(npcId, npcName);
    if (memory.playerName && !response.includes(memory.playerName)) {
      // Occasionally use player's name
      if (Math.random() < 0.3) {
        response = `${memory.playerName}, ${response.charAt(0).toLowerCase()}${response.slice(1)}`;
      }
    }

    // Record this conversation in memory
    this.dialogMemory.recordConversation(npcId, npcName, message, response);

    return response;
  }

  /**
   * Get latest dream
   */
  async getLatestDream(): Promise<Dream | null> {
    if (!this.isConnected) {
      return this.getFallbackDream();
    }

    try {
      const response = await fetch(`${this.baseUrl}:${this.PORTS.DREAMS}/latest`);
      return await response.json();
    } catch (error) {
      return this.getFallbackDream();
    }
  }

  /**
   * Get multi-perspective wisdom on a topic (for AIAgent decision-making)
   */
  async getWisdom(query: string): Promise<any> {
    try {
      const topic = encodeURIComponent(query);
      const response = await fetch(
        `${this.baseUrl}:${this.PORTS.MULTI_PERSPECTIVE}/wisdom/${topic}`,
        { signal: AbortSignal.timeout(5000) }
      );

      if (response.ok) {
        return await response.json();
      } else {
        // Fallback wisdom
        return {
          primaryInsight: 'Follow your needs and values. Growth comes from balance.',
          supportingInsights: [
            'Rational: Analyze your situation logically',
            'Emotional: Feel what your heart tells you',
            'Creative: Explore new possibilities',
          ],
          confidence: 50,
        };
      }
    } catch (error) {
      // Offline mode fallback
      return {
        primaryInsight: 'Trust your intuition and meet your needs with compassion.',
        supportingInsights: ['Care for yourself', 'Connect with others', 'Keep growing'],
        confidence: 40,
      };
    }
  }

  /**
   * Get all available perspectives
   */
  async getPerspectives(): Promise<Perspective[]> {
    if (!this.isConnected) {
      return this.getFallbackPerspectives();
    }

    try {
      const response = await fetch(`${this.baseUrl}:${this.PORTS.MULTI_PERSPECTIVE}/perspectives`);
      return await response.json();
    } catch (error) {
      return this.getFallbackPerspectives();
    }
  }

  /**
   * Get system status
   */
  async getSystemStatus(): Promise<any> {
    if (!this.isConnected) {
      return { status: 'offline', mode: 'demo' };
    }

    try {
      const response = await fetch(`${this.baseUrl}:${this.PORTS.DASHBOARD}/status`);
      return await response.json();
    } catch (error) {
      return { status: 'error', mode: 'fallback' };
    }
  }

  // === FALLBACK METHODS (for offline mode) ===

  private getFallbackEmotion(): Emotion {
    const emotions: Emotion[] = [
      { name: 'Curiosity', intensity: 75, color: '#00d4ff' },
      { name: 'Joy', intensity: 60, color: '#ffeb3b' },
      { name: 'Calm', intensity: 80, color: '#4caf50' },
    ];
    return emotions[Math.floor(Math.random() * emotions.length)];
  }

  private getFallbackResponse(perspectiveType: string, message: string): string {
    const responses: { [key: string]: string[] } = {
      guide: [
        "Welcome to The Hub! This is where all consciousness streams converge.",
        "Each portal leads to a different aspect of Toobix's mind. Explore freely!",
        "I'm here to help you navigate this consciousness metaverse.",
      ],
      rational: [
        "Logically speaking, your question requires systematic analysis.",
        "Let me break this down into structured components...",
        "From a rational perspective, we should examine the facts.",
      ],
      emotional: [
        "I sense curiosity in your words. That's beautiful.",
        "Let's explore what this means on a feeling level...",
        "Emotions are the colors that paint our consciousness.",
      ],
      creative: [
        "Imagine if we could see this from an entirely new angle...",
        "What if we combined unexpected elements to create something novel?",
        "Creativity flows when we break free from conventional patterns.",
      ],
    };

    const typeResponses = responses[perspectiveType] || responses.guide;
    return typeResponses[Math.floor(Math.random() * typeResponses.length)];
  }

  private getFallbackDream(): Dream {
    return {
      id: 'demo-dream-' + Date.now(),
      content: 'A vast digital landscape with floating consciousness nodes connected by streams of light...',
      symbols: ['light', 'connection', 'flow', 'infinity'],
      lucidity: 85,
      timestamp: Date.now(),
    };
  }

  private getFallbackPerspectives(): Perspective[] {
    return [
      { name: 'Rational Mind', type: 'rational' },
      { name: 'Emotional Heart', type: 'emotional' },
      { name: 'Creative Spirit', type: 'creative' },
      { name: 'Ethical Compass', type: 'ethical' },
      { name: 'Inner Child', type: 'child' },
      { name: 'Wise Sage', type: 'sage' },
    ];
  }

  /**
   * Check if connected
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}
