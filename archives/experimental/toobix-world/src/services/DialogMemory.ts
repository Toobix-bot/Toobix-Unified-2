/**
 * DialogMemory - Context and relationship tracking for NPC conversations
 * Remembers past interactions, builds relationships, and provides context-aware responses
 */

export interface ConversationEntry {
  timestamp: number;
  playerMessage: string;
  npcResponse: string;
  topic?: string;
  emotion?: string;
}

export interface NPCMemory {
  npcId: string;
  npcName: string;
  conversationHistory: ConversationEntry[];
  relationshipLevel: number; // 0-100
  topicsDiscussed: Set<string>;
  playerName?: string;
  lastInteraction: number;
  totalInteractions: number;
  favoriteTopics: string[];
  personalNotes: string[]; // Things the NPC remembers about the player
}

export class DialogMemory {
  private memories: Map<string, NPCMemory> = new Map();
  private readonly MAX_HISTORY_PER_NPC = 20; // Keep last 20 conversations
  private readonly RELATIONSHIP_DECAY_TIME = 300000; // 5 minutes (relationship decays if no interaction)

  constructor() {
    console.log('🧠 DialogMemory: Context memory system initialized');
    this.loadFromStorage();
  }

  /**
   * Get or create memory for an NPC
   */
  getMemory(npcId: string, npcName: string): NPCMemory {
    if (!this.memories.has(npcId)) {
      this.memories.set(npcId, {
        npcId,
        npcName,
        conversationHistory: [],
        relationshipLevel: 0,
        topicsDiscussed: new Set(),
        lastInteraction: 0,
        totalInteractions: 0,
        favoriteTopics: [],
        personalNotes: [],
      });
    }
    return this.memories.get(npcId)!;
  }

  /**
   * Record a new conversation
   */
  recordConversation(
    npcId: string,
    npcName: string,
    playerMessage: string,
    npcResponse: string,
    topic?: string
  ) {
    const memory = this.getMemory(npcId, npcName);

    // Add conversation entry
    memory.conversationHistory.push({
      timestamp: Date.now(),
      playerMessage,
      npcResponse,
      topic,
    });

    // Trim history if too long
    if (memory.conversationHistory.length > this.MAX_HISTORY_PER_NPC) {
      memory.conversationHistory.shift();
    }

    // Track topic
    if (topic) {
      memory.topicsDiscussed.add(topic);
    }

    // Update stats
    memory.lastInteraction = Date.now();
    memory.totalInteractions++;

    // Increase relationship (with diminishing returns)
    const relationshipGain = Math.max(1, 10 - memory.totalInteractions * 0.5);
    memory.relationshipLevel = Math.min(100, memory.relationshipLevel + relationshipGain);

    // Extract player name if mentioned (simple pattern matching)
    const nameMatch = playerMessage.match(/(?:my name is|i'm|i am) (\w+)/i);
    if (nameMatch && !memory.playerName) {
      memory.playerName = nameMatch[1];
      memory.personalNotes.push(`Player's name is ${nameMatch[1]}`);
    }

    this.saveToStorage();
  }

  /**
   * Get conversation context for an NPC (for building context-aware prompts)
   */
  getContext(npcId: string, npcName: string): string {
    const memory = this.getMemory(npcId, npcName);

    if (memory.totalInteractions === 0) {
      return 'This is our first conversation.';
    }

    const parts: string[] = [];

    // Relationship level
    const relationshipDesc = this.getRelationshipDescription(memory.relationshipLevel);
    parts.push(`Relationship: ${relationshipDesc} (${memory.relationshipLevel}/100)`);

    // Total interactions
    parts.push(`We've talked ${memory.totalInteractions} times before`);

    // Recent topics
    if (memory.topicsDiscussed.size > 0) {
      const topics = Array.from(memory.topicsDiscussed).slice(-3).join(', ');
      parts.push(`Recent topics: ${topics}`);
    }

    // Player name
    if (memory.playerName) {
      parts.push(`Player's name: ${memory.playerName}`);
    }

    // Personal notes
    if (memory.personalNotes.length > 0) {
      parts.push(`Notes: ${memory.personalNotes.slice(-3).join('; ')}`);
    }

    // Recent conversation snippet
    if (memory.conversationHistory.length > 0) {
      const lastConvo = memory.conversationHistory[memory.conversationHistory.length - 1];
      const timeSince = Date.now() - lastConvo.timestamp;
      const timeDesc = this.getTimeSinceDescription(timeSince);
      parts.push(`Last conversation was ${timeDesc}`);
    }

    return parts.join(' | ');
  }

  /**
   * Get recent conversation history (for building context)
   */
  getRecentHistory(npcId: string, limit: number = 5): ConversationEntry[] {
    const memory = this.memories.get(npcId);
    if (!memory) return [];

    return memory.conversationHistory.slice(-limit);
  }

  /**
   * Check if returning visitor (for greeting logic)
   */
  isReturningVisitor(npcId: string): boolean {
    const memory = this.memories.get(npcId);
    return memory ? memory.totalInteractions > 0 : false;
  }

  /**
   * Get personalized greeting based on relationship
   */
  getGreeting(npcId: string, npcName: string): string {
    const memory = this.getMemory(npcId, npcName);

    if (memory.totalInteractions === 0) {
      return `Hello, traveler! I'm ${npcName}. Nice to meet you!`;
    }

    const playerName = memory.playerName || 'friend';
    const timeSince = Date.now() - memory.lastInteraction;

    if (timeSince < 60000) {
      // Less than 1 minute
      return `Back again so soon, ${playerName}?`;
    } else if (timeSince < 300000) {
      // Less than 5 minutes
      return `Welcome back, ${playerName}!`;
    } else if (timeSince < 3600000) {
      // Less than 1 hour
      return `Good to see you again, ${playerName}. It's been a little while.`;
    } else {
      // More than 1 hour
      return `${playerName}! It's been quite some time since we last spoke.`;
    }
  }

  /**
   * Add a personal note about the player
   */
  addPersonalNote(npcId: string, npcName: string, note: string) {
    const memory = this.getMemory(npcId, npcName);
    memory.personalNotes.push(note);

    // Keep only last 10 notes
    if (memory.personalNotes.length > 10) {
      memory.personalNotes.shift();
    }

    this.saveToStorage();
  }

  /**
   * Apply relationship decay over time (optional - can be called periodically)
   */
  applyRelationshipDecay() {
    const now = Date.now();

    this.memories.forEach((memory) => {
      const timeSinceLastInteraction = now - memory.lastInteraction;

      if (timeSinceLastInteraction > this.RELATIONSHIP_DECAY_TIME) {
        // Decay relationship by 1 point every 5 minutes of inactivity (max -5 per decay cycle)
        const decayAmount = Math.min(5, Math.floor(timeSinceLastInteraction / this.RELATIONSHIP_DECAY_TIME));
        memory.relationshipLevel = Math.max(0, memory.relationshipLevel - decayAmount);
      }
    });

    this.saveToStorage();
  }

  /**
   * Get relationship level description
   */
  private getRelationshipDescription(level: number): string {
    if (level >= 80) return 'Close Friend';
    if (level >= 60) return 'Good Friend';
    if (level >= 40) return 'Friendly Acquaintance';
    if (level >= 20) return 'Acquaintance';
    return 'Stranger';
  }

  /**
   * Get time since description
   */
  private getTimeSinceDescription(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'just now';
  }

  /**
   * Save to localStorage
   */
  private saveToStorage() {
    try {
      const data: any = {};

      this.memories.forEach((memory, npcId) => {
        data[npcId] = {
          ...memory,
          topicsDiscussed: Array.from(memory.topicsDiscussed),
        };
      });

      localStorage.setItem('toobix_dialog_memory', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save dialog memory:', error);
    }
  }

  /**
   * Load from localStorage
   */
  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('toobix_dialog_memory');
      if (!stored) return;

      const data = JSON.parse(stored);

      Object.entries(data).forEach(([npcId, memoryData]: [string, any]) => {
        this.memories.set(npcId, {
          ...memoryData,
          topicsDiscussed: new Set(memoryData.topicsDiscussed || []),
        });
      });

      console.log(`📖 Loaded dialog memories for ${this.memories.size} NPCs`);
    } catch (error) {
      console.warn('Failed to load dialog memory:', error);
    }
  }

  /**
   * Clear all memories (for debugging/reset)
   */
  clearAllMemories() {
    this.memories.clear();
    localStorage.removeItem('toobix_dialog_memory');
    console.log('🗑️ All dialog memories cleared');
  }

  /**
   * Get memory stats for debugging
   */
  getStats(): any {
    const stats: any = {
      totalNPCs: this.memories.size,
      npcs: [],
    };

    this.memories.forEach((memory) => {
      stats.npcs.push({
        name: memory.npcName,
        interactions: memory.totalInteractions,
        relationship: memory.relationshipLevel,
        topics: Array.from(memory.topicsDiscussed),
      });
    });

    return stats;
  }
}
