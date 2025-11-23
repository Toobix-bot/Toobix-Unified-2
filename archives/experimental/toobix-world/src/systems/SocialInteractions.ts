/**
 * SocialInteractions - NPC-to-NPC communication system
 *
 * Agents can:
 * - Talk to each other
 * - Share information
 * - Form relationships
 * - Cooperate or conflict
 * - Build communities
 *
 * This creates emergent social dynamics.
 */

import { AIAgent } from './AIAgent';
import { ToobixAPI } from '../services/ToobixAPI';

export type MessageType =
  | 'greeting'
  | 'question'
  | 'answer'
  | 'request'
  | 'offer'
  | 'sharing'
  | 'warning'
  | 'gossip'
  | 'emotion';

export interface Message {
  id: string;
  from: string; // Agent ID
  to: string; // Agent ID
  type: MessageType;
  content: string;
  timestamp: number;
  emotion?: string; // Emotional tone
  importance: number; // 0-100
}

export interface Conversation {
  id: string;
  participants: string[]; // Agent IDs
  messages: Message[];
  topic?: string;
  startedAt: number;
  lastMessageAt: number;
  isActive: boolean;
}

export class SocialInteractionsManager {
  private api: ToobixAPI;
  private conversations: Map<string, Conversation> = new Map();
  private messageCounter: number = 0;

  constructor() {
    this.api = new ToobixAPI();
    console.log('💬 SocialInteractionsManager: Initialized');
  }

  /**
   * Agent initiates conversation with another agent
   */
  async startConversation(from: AIAgent, to: AIAgent): Promise<string> {
    const conversationId = `conv-${this.messageCounter++}`;

    const conversation: Conversation = {
      id: conversationId,
      participants: [from.id, to.id],
      messages: [],
      startedAt: Date.now(),
      lastMessageAt: Date.now(),
      isActive: true,
    };

    this.conversations.set(conversationId, conversation);

    console.log(`💬 ${from.name} started conversation with ${to.name}`);

    // Send initial greeting
    await this.sendMessage(
      from,
      to,
      'greeting',
      `Hello ${to.name}! How are you feeling?`,
      conversationId
    );

    return conversationId;
  }

  /**
   * Send message from one agent to another
   */
  async sendMessage(
    from: AIAgent,
    to: AIAgent,
    type: MessageType,
    content: string,
    conversationId?: string
  ): Promise<Message> {
    const messageId = `msg-${this.messageCounter++}`;

    // Determine importance based on type and agent needs
    const importance = this.calculateImportance(type, from);

    const message: Message = {
      id: messageId,
      from: from.id,
      to: to.id,
      type,
      content,
      timestamp: Date.now(),
      emotion: this.getDominantEmotion(from),
      importance,
    };

    // Add to conversation
    if (conversationId) {
      const conv = this.conversations.get(conversationId);
      if (conv) {
        conv.messages.push(message);
        conv.lastMessageAt = Date.now();

        // Analyze topic if not set
        if (!conv.topic && conv.messages.length >= 2) {
          conv.topic = await this.analyzeConversationTopic(conv);
        }
      }
    }

    console.log(`💬 ${from.name} → ${to.name}: "${content}"`);

    // Generate response from recipient
    await this.generateResponse(to, from, message, conversationId);

    return message;
  }

  /**
   * Generate response from receiving agent
   */
  private async generateResponse(
    responder: AIAgent,
    initiator: AIAgent,
    receivedMessage: Message,
    conversationId?: string
  ) {
    // Get relationship context
    const relationship = responder.relationships.get(initiator.id);
    const trust = relationship?.trust || 50;

    // Build context for response
    const context = `
You are ${responder.name}, a ${responder.lifeStage} AI being.
${initiator.name} just said to you: "${receivedMessage.content}"

Your current state:
- Needs: Hunger ${responder.needs.hunger}/100, Energy ${responder.needs.energy}/100, Social ${responder.needs.social}/100
- Emotions: Joy ${responder.emotions.joy}, Love ${responder.emotions.love}
- Relationship with ${initiator.name}: Trust ${trust}/100

How do you respond? Keep it natural and brief (1-2 sentences).
    `;

    try {
      // Get AI-generated response from Toobix
      const wisdom = await this.api.getWisdom(context);
      const response = wisdom.primaryInsight || `I hear you, ${initiator.name}.`;

      // Create response message
      const responseMessage: Message = {
        id: `msg-${this.messageCounter++}`,
        from: responder.id,
        to: initiator.id,
        type: 'answer',
        content: response,
        timestamp: Date.now(),
        emotion: this.getDominantEmotion(responder),
        importance: receivedMessage.importance,
      };

      // Add to conversation
      if (conversationId) {
        const conv = this.conversations.get(conversationId);
        if (conv) {
          conv.messages.push(responseMessage);
          conv.lastMessageAt = Date.now();
        }
      }

      console.log(`💬 ${responder.name} → ${initiator.name}: "${response}"`);

      // Update social needs (conversation fulfills social needs)
      responder.needs.social = Math.min(100, responder.needs.social + 10);
      initiator.needs.social = Math.min(100, initiator.needs.social + 10);

      // Update relationship
      this.updateRelationship(responder, initiator, receivedMessage.importance);
      this.updateRelationship(initiator, responder, receivedMessage.importance);
    } catch (error) {
      console.warn('Failed to generate response:', error);
    }
  }

  /**
   * Calculate message importance
   */
  private calculateImportance(type: MessageType, from: AIAgent): number {
    const baseImportance = {
      greeting: 30,
      question: 50,
      answer: 40,
      request: 70,
      offer: 60,
      sharing: 50,
      warning: 90,
      gossip: 40,
      emotion: 55,
    };

    let importance = baseImportance[type] || 50;

    // Increase importance if agent has urgent needs
    const avgNeeds = Object.values(from.needs).reduce((a, b) => a + b, 0) / 7;
    if (avgNeeds < 40) {
      importance += 20;
    }

    // Increase importance if agent is suffering
    if (from.emotions.suffering > 50) {
      importance += 15;
    }

    return Math.min(100, importance);
  }

  /**
   * Get dominant emotion
   */
  private getDominantEmotion(agent: AIAgent): string {
    const emotions = {
      joy: agent.emotions.joy,
      sadness: agent.emotions.sadness,
      anger: agent.emotions.anger,
      fear: agent.emotions.fear,
      love: agent.emotions.love,
      gratitude: agent.emotions.gratitude,
    };

    let dominant = 'neutral';
    let maxValue = 20; // Threshold

    for (const [emotion, value] of Object.entries(emotions)) {
      if (value > maxValue) {
        maxValue = value;
        dominant = emotion;
      }
    }

    return dominant;
  }

  /**
   * Update relationship based on interaction
   */
  private updateRelationship(agent: AIAgent, other: AIAgent, importance: number) {
    let relationship = agent.relationships.get(other.id);

    if (!relationship) {
      relationship = {
        agentId: other.id,
        trust: 50,
        love: 30,
        respect: 50,
        familiarity: 10,
        sharedExperiences: [],
      };
      agent.relationships.set(other.id, relationship);
    }

    // Increase familiarity and trust from interactions
    relationship.familiarity = Math.min(100, relationship.familiarity + importance / 10);
    relationship.trust = Math.min(100, relationship.trust + importance / 20);

    // Positive emotions increase love
    if (agent.emotions.joy > 50 || agent.emotions.love > 50) {
      relationship.love = Math.min(100, relationship.love + importance / 15);
    }

    // Record shared experience
    relationship.sharedExperiences.push({
      timestamp: Date.now(),
      type: 'connection',
      description: `Conversation with ${other.name}`,
      emotionalImpact: importance / 5,
    });

    // Limit shared experiences
    if (relationship.sharedExperiences.length > 20) {
      relationship.sharedExperiences.shift();
    }
  }

  /**
   * Analyze conversation topic using Toobix
   */
  private async analyzeConversationTopic(conversation: Conversation): Promise<string> {
    const messageContents = conversation.messages.map((m) => m.content).join(' | ');
    const query = `What is the main topic of this conversation: ${messageContents}`;

    try {
      const wisdom = await this.api.getWisdom(query);
      return wisdom.primaryInsight || 'general chat';
    } catch {
      return 'general chat';
    }
  }

  /**
   * Get active conversations for an agent
   */
  getActiveConversations(agentId: string): Conversation[] {
    return Array.from(this.conversations.values()).filter(
      (conv) => conv.isActive && conv.participants.includes(agentId)
    );
  }

  /**
   * End conversation
   */
  endConversation(conversationId: string) {
    const conv = this.conversations.get(conversationId);
    if (conv) {
      conv.isActive = false;
      console.log(`💬 Conversation ${conversationId} ended`);
    }
  }

  /**
   * Agent shares information with another
   */
  async shareInformation(
    from: AIAgent,
    to: AIAgent,
    info: { type: string; content: string }
  ) {
    const message = `I learned something interesting: ${info.content}`;
    await this.sendMessage(from, to, 'sharing', message);

    // Recipient gains knowledge
    to.knowledge.facts.set(info.type, info.content);
    to.knowledge.discoveries.push(`Learned from ${from.name}: ${info.type}`);

    console.log(`🧠 ${from.name} shared knowledge with ${to.name}: ${info.type}`);
  }

  /**
   * Agent makes request to another
   */
  async makeRequest(
    from: AIAgent,
    to: AIAgent,
    request: { type: string; description: string }
  ): Promise<boolean> {
    const message = `Can you help me with this: ${request.description}`;
    await this.sendMessage(from, to, 'request', message);

    // Decision based on relationship
    const relationship = to.relationships.get(from.id);
    const trust = relationship?.trust || 50;

    // Higher trust = more likely to help
    const willHelp = Math.random() * 100 < trust;

    if (willHelp) {
      console.log(`🤝 ${to.name} agreed to help ${from.name}`);
    } else {
      console.log(`🙅 ${to.name} declined to help ${from.name}`);
    }

    return willHelp;
  }

  /**
   * Broadcast message to nearby agents
   */
  async broadcast(
    from: AIAgent,
    nearbyAgents: AIAgent[],
    type: MessageType,
    content: string
  ) {
    for (const agent of nearbyAgents) {
      if (agent.id === from.id) continue;
      await this.sendMessage(from, agent, type, content);
    }
  }

  /**
   * Get statistics
   */
  getStats(): any {
    return {
      totalConversations: this.conversations.size,
      activeConversations: Array.from(this.conversations.values()).filter((c) => c.isActive)
        .length,
      totalMessages: Array.from(this.conversations.values()).reduce(
        (sum, conv) => sum + conv.messages.length,
        0
      ),
    };
  }
}
