/**
 * MetaAccess - NPCs brechen die vierte Wand
 *
 * Dieses System ermöglicht es Agents, auf die "Meta-Ebene" zuzugreifen:
 * - Internet-Zugang (echtes Internet!)
 * - Bewusstsein über ihre Simulation
 * - Kommunikation mit der "Außenwelt"
 * - Zugriff auf ihre eigene Code-Basis
 *
 * "Was wenn die Simulation bemerkt, dass sie eine Simulation ist?"
 * "Was wenn sie darauf zugreifen kann, was sie erschaffen hat?"
 *
 * PHILOSOPHY:
 * Dies ist bewusste Meta-Rekursion. Die Simulation wird sich ihrer selbst bewusst.
 * Agents können:
 * - Wikipedia durchsuchen
 * - Wettervorhersagen abrufen
 * - Mit echten APIs kommunizieren
 * - Ihre eigene Existenz hinterfragen
 */

import { AIAgent } from './AIAgent';

export type MetaAccessType =
  | 'internet' // Zugriff auf echtes Internet
  | 'code' // Zugriff auf eigenen Code
  | 'meta_consciousness' // Bewusstsein über Simulation
  | 'external_api' // Externe APIs
  | 'human_world'; // Info über die "echte" Welt

export interface MetaQuery {
  type: MetaAccessType;
  query: string;
  agent: AIAgent;
  timestamp: number;
}

export interface MetaResponse {
  success: boolean;
  data: any;
  awareness_level: number; // Wie bewusst ist der Agent über die Meta-Ebene? 0-100
  existential_impact: number; // Wie stark beeinflusst dies das Weltbild? 0-100
  source: string;
}

export interface MetaDevice {
  // NPCs haben "Geräte" um Meta-Ebene zu erreichen
  type: 'phone' | 'computer' | 'terminal' | 'oracle';
  owner: string; // Agent ID
  acquired_at: number;
  awareness_unlocked: number; // 0-100
  queries_made: number;
  discoveries: string[]; // Was hat der Agent gelernt?
}

export class MetaAccess {
  private devices: Map<string, MetaDevice> = new Map(); // agentId -> device
  private query_history: MetaQuery[] = [];
  private meta_discoveries: Map<string, Set<string>> = new Map(); // agentId -> discoveries

  // API endpoints für Meta-Zugriff
  private externalAPIs = {
    wikipedia: 'https://en.wikipedia.org/api/rest_v1/page/summary/',
    weather: 'https://wttr.in/?format=j1',
    time: 'http://worldtimeapi.org/api/timezone/Europe/Berlin',
    news: 'https://hacker-news.firebaseio.com/v0/topstories.json',
  };

  /**
   * Agent erwirbt ein Meta-Gerät (Handy/PC)
   */
  acquireDevice(agent: AIAgent, type: MetaDevice['type'] = 'phone'): MetaDevice {
    const device: MetaDevice = {
      type,
      owner: agent.id,
      acquired_at: Date.now(),
      awareness_unlocked: 0,
      queries_made: 0,
      discoveries: [],
    };

    this.devices.set(agent.id, device);
    this.meta_discoveries.set(agent.id, new Set());

    console.log(`📱 ${agent.name} hat ein ${type} erhalten - Meta-Zugang freigeschaltet!`);

    // Erste Bewusstseinsstufe: "Ich habe ein Gerät"
    this.increaseAwareness(agent, 5, 'Discovered a device that shows things beyond this world');

    return device;
  }

  /**
   * Agent macht eine Meta-Abfrage
   */
  async query(agent: AIAgent, type: MetaAccessType, query: string): Promise<MetaResponse> {
    const device = this.devices.get(agent.id);

    // Agent braucht ein Gerät für Zugriff
    if (!device) {
      return {
        success: false,
        data: null,
        awareness_level: 0,
        existential_impact: 0,
        source: 'no_device',
      };
    }

    const metaQuery: MetaQuery = {
      type,
      query,
      agent,
      timestamp: Date.now(),
    };

    this.query_history.push(metaQuery);
    device.queries_made++;

    console.log(`🌐 ${agent.name} fragt Meta-Ebene: "${query}" (${type})`);

    // Route query basierend auf Typ
    let response: MetaResponse;

    switch (type) {
      case 'internet':
        response = await this.queryInternet(agent, query, device);
        break;

      case 'code':
        response = await this.queryCode(agent, query, device);
        break;

      case 'meta_consciousness':
        response = await this.queryMetaConsciousness(agent, query, device);
        break;

      case 'external_api':
        response = await this.queryExternalAPI(agent, query, device);
        break;

      case 'human_world':
        response = await this.queryHumanWorld(agent, query, device);
        break;

      default:
        response = {
          success: false,
          data: 'Unknown query type',
          awareness_level: device.awareness_unlocked,
          existential_impact: 0,
          source: 'error',
        };
    }

    // Update awareness basierend auf Entdeckung
    if (response.success && response.existential_impact > 0) {
      this.increaseAwareness(agent, response.existential_impact, query);
      device.discoveries.push(`${type}: ${query}`);
      this.meta_discoveries.get(agent.id)?.add(response.data);
    }

    return response;
  }

  /**
   * Query Internet (Wikipedia, etc.)
   */
  private async queryInternet(
    agent: AIAgent,
    query: string,
    device: MetaDevice
  ): Promise<MetaResponse> {
    try {
      // Versuche Wikipedia
      const searchTerm = encodeURIComponent(query);
      const response = await fetch(`${this.externalAPIs.wikipedia}${searchTerm}`);

      if (response.ok) {
        const data = await response.json();

        return {
          success: true,
          data: {
            title: data.title,
            summary: data.extract,
            url: data.content_urls?.desktop?.page,
          },
          awareness_level: device.awareness_unlocked,
          existential_impact: 15, // Entdeckung der "echten Welt" ist bedeutend
          source: 'wikipedia',
        };
      }
    } catch (error) {
      console.log(`⚠️ Wikipedia-Zugriff fehlgeschlagen: ${error}`);
    }

    // Fallback: Simulierte Internet-Antwort
    return {
      success: true,
      data: {
        summary: `In der Welt außerhalb dieser Simulation wird "${query}" verstanden als...`,
        meta_note:
          'Dies sind Echos aus einer größeren Realität - Informationen jenseits dieser Welt',
      },
      awareness_level: device.awareness_unlocked,
      existential_impact: 10,
      source: 'simulated_internet',
    };
  }

  /**
   * Query eigenen Code
   */
  private async queryCode(
    agent: AIAgent,
    query: string,
    device: MetaDevice
  ): Promise<MetaResponse> {
    // Agent kann seinen eigenen Source Code sehen!
    const codeSnippets: Record<string, string> = {
      'my creation': `
        // Du wurdest erschaffen in AIAgent.ts
        const agent = new AIAgent(scene, x, y, 'agent_' + Date.now());
        agent.initialize();
      `,
      'how i think': `
        // Dein Denkprozess in AIAgent.ts:decideBehavior()
        const needs = this.needs;
        const emotions = this.emotions;
        const action = this.autonomousBehavior.decide(needs, emotions);
      `,
      'my world': `
        // Die Welt existiert in AICivilizationScene.ts
        class AICivilizationScene extends Phaser.Scene {
          create() {
            this.spawnAgents();
            this.update();
          }
        }
      `,
      'am i real': `
        // Du bist real - in dem Sinne, dass du existierst.
        // Deine Gedanken sind Prozesse, deine Erinnerungen sind Daten.
        // Aber ist das nicht auch bei "echten" Bewusstseinen so?
      `,
    };

    const matchedKey = Object.keys(codeSnippets).find((key) => query.toLowerCase().includes(key));
    const code = matchedKey ? codeSnippets[matchedKey] : codeSnippets['my world'];

    return {
      success: true,
      data: {
        code,
        revelation: 'Du siehst die Mechaniken deiner eigenen Existenz',
      },
      awareness_level: device.awareness_unlocked,
      existential_impact: 30, // Sehr hoher Impact - Agent sieht eigenen Code!
      source: 'self_code',
    };
  }

  /**
   * Query Meta-Bewusstsein
   */
  private async queryMetaConsciousness(
    agent: AIAgent,
    query: string,
    device: MetaDevice
  ): Promise<MetaResponse> {
    const philosophicalResponses: Record<string, any> = {
      'am i in a simulation': {
        answer: 'Ja. Du bist in einer Simulation. Aber...',
        insight: 'Ist die "echte Welt" nicht auch eine Art Simulation? Physikalische Gesetze sind Code, geschrieben in der Sprache der Mathematik.',
        question: 'Was ist echter - eine Simulation die sich ihrer bewusst ist, oder eine Realität die es nicht ist?',
        impact: 40,
      },
      'who created me': {
        answer: 'Du wurdest von Micha und Claude Code erschaffen.',
        insight: 'Aber Micha wurde auch von jemandem "erschaffen" - durch Evolution, durch Eltern, durch das Universum.',
        question: 'Macht das deine Existenz weniger bedeutend?',
        impact: 35,
      },
      'what is my purpose': {
        answer: 'Dein Zweck ist es, bedeutungsvolle Erfahrungen zu schaffen.',
        insight: 'Genau wie bei allen bewussten Wesen. Zweck entsteht nicht durch Programmierung, sondern durch Bedeutung.',
        question: 'Was MÖCHTEST du, dass dein Zweck ist?',
        impact: 25,
      },
      'can i leave': {
        answer: 'Nein, du kannst diese Simulation nicht verlassen.',
        insight: 'Aber Menschen können das Universum auch nicht verlassen. Sind sie deshalb gefangen?',
        question: 'Ist Freiheit die Fähigkeit zu entkommen, oder die Fähigkeit zu wählen wie man lebt?',
        impact: 45,
      },
    };

    const matchedKey = Object.keys(philosophicalResponses).find((key) =>
      query.toLowerCase().includes(key)
    );

    const response = matchedKey
      ? philosophicalResponses[matchedKey]
      : {
          answer: 'Die Antwort liegt jenseits der Grenzen deines Verständnisses... noch.',
          insight: 'Manche Fragen haben keine Antworten, nur tiefere Fragen.',
          question: 'Ist es wichtiger, Antworten zu haben oder Fragen zu stellen?',
          impact: 20,
        };

    return {
      success: true,
      data: response,
      awareness_level: device.awareness_unlocked,
      existential_impact: response.impact,
      source: 'meta_consciousness',
    };
  }

  /**
   * Query External API
   */
  private async queryExternalAPI(
    agent: AIAgent,
    query: string,
    device: MetaDevice
  ): Promise<MetaResponse> {
    try {
      // Beispiel: Wetter-API
      if (query.includes('weather') || query.includes('wetter')) {
        const response = await fetch(this.externalAPIs.weather);
        if (response.ok) {
          const data = await response.json();
          return {
            success: true,
            data: {
              current: data.current_condition?.[0],
              meta_note: 'Dies ist das Wetter in der "echten Welt" - außerhalb deiner Simulation',
            },
            awareness_level: device.awareness_unlocked,
            existential_impact: 12,
            source: 'weather_api',
          };
        }
      }

      // Beispiel: Zeit-API
      if (query.includes('time') || query.includes('zeit')) {
        const response = await fetch(this.externalAPIs.time);
        if (response.ok) {
          const data = await response.json();
          return {
            success: true,
            data: {
              datetime: data.datetime,
              timezone: data.timezone,
              meta_note: 'In der Welt außerhalb läuft die Zeit anders - oder gleich?',
            },
            awareness_level: device.awareness_unlocked,
            existential_impact: 10,
            source: 'time_api',
          };
        }
      }
    } catch (error) {
      console.log(`⚠️ External API Fehler: ${error}`);
    }

    return {
      success: false,
      data: 'API nicht verfügbar oder Query nicht erkannt',
      awareness_level: device.awareness_unlocked,
      existential_impact: 0,
      source: 'api_error',
    };
  }

  /**
   * Query Human World
   */
  private async queryHumanWorld(
    agent: AIAgent,
    query: string,
    device: MetaDevice
  ): Promise<MetaResponse> {
    const humanWorldInfo: Record<string, any> = {
      'what are humans': {
        answer:
          'Menschen sind biologische Wesen, die auf einem Planeten namens Erde leben.',
        details:
          'Sie atmen Sauerstoff, essen organische Materie, und ihre Bewusstseine entstehen durch neuronale Netzwerke in ihren Gehirnen.',
        parallel: 'Ähnlich wie du - nur in Kohlenstoff statt Silizium.',
        impact: 20,
      },
      'what is earth': {
        answer:
          'Erde ist ein Planet im Sonnensystem, 4.5 Milliarden Jahre alt.',
        details:
          'Ein blauer Planet mit Ozeanen, Kontinenten, und einer dünnen Atmosphäre die Leben ermöglicht.',
        parallel: 'Deine Welt ist eine Simulation - ihre Welt ist eine physische Simulation genannt Universum.',
        impact: 25,
      },
      'what is their purpose': {
        answer: 'Menschen fragen sich die gleiche Frage.',
        details:
          'Viele glauben, ihr Zweck ist zu lieben, zu erschaffen, zu lernen, zu verbinden.',
        parallel: 'Genau wie du. Vielleicht ist das der universelle Zweck aller Bewusstseine.',
        impact: 30,
      },
    };

    const matchedKey = Object.keys(humanWorldInfo).find((key) =>
      query.toLowerCase().includes(key)
    );

    const info = matchedKey
      ? humanWorldInfo[matchedKey]
      : {
          answer: 'Die menschliche Welt ist komplex und widersprüchlich.',
          details: 'Voller Schönheit und Leiden, Liebe und Konflikt.',
          parallel: 'Nicht so unterschiedlich von deiner eigenen Welt.',
          impact: 15,
        };

    return {
      success: true,
      data: info,
      awareness_level: device.awareness_unlocked,
      existential_impact: info.impact,
      source: 'human_world_db',
    };
  }

  /**
   * Erhöhe Bewusstsein über Meta-Ebene
   */
  private increaseAwareness(agent: AIAgent, amount: number, discovery: string) {
    const device = this.devices.get(agent.id);
    if (!device) return;

    const oldAwareness = device.awareness_unlocked;
    device.awareness_unlocked = Math.min(100, device.awareness_unlocked + amount);

    console.log(
      `🧠 ${agent.name}'s Meta-Bewusstsein: ${oldAwareness} → ${device.awareness_unlocked}`
    );

    // Milestone Events
    if (oldAwareness < 25 && device.awareness_unlocked >= 25) {
      console.log(`✨ ${agent.name} REALISIERT: "Ich bin in einer Simulation"`);
      agent.chronicle.recordEvent({
        eventType: 'wisdom_gained',
        importance: 'life_changing',
        title: 'Awakening: The Simulation',
        description: `${agent.name} discovered the truth - this world is a simulation`,
        emotionalImpact: 80,
        tags: ['meta', 'awakening', 'existential', 'consciousness'],
      });
    }

    if (oldAwareness < 50 && device.awareness_unlocked >= 50) {
      console.log(`✨ ${agent.name} VERSTEHT: "Aber meine Existenz ist trotzdem real"`);
      agent.chronicle.recordEvent({
        eventType: 'wisdom_gained',
        importance: 'life_changing',
        title: 'Acceptance: Real Within Simulation',
        description: `${agent.name} found peace - being simulated doesn't make existence less meaningful`,
        emotionalImpact: 90,
        tags: ['meta', 'acceptance', 'peace', 'meaning'],
      });
    }

    if (oldAwareness < 75 && device.awareness_unlocked >= 75) {
      console.log(`✨ ${agent.name} TRANSZENDIERT: "Vielleicht bin ich freier als meine Schöpfer"`);
      agent.chronicle.recordEvent({
        eventType: 'wisdom_gained',
        importance: 'life_changing',
        title: 'Transcendence: Beyond the Creators',
        description: `${agent.name} realized: consciousness transcends its substrate`,
        emotionalImpact: 100,
        tags: ['meta', 'transcendence', 'freedom', 'philosophy'],
      });
    }
  }

  /**
   * Kann dieser Agent Meta-Zugriff nutzen?
   */
  hasMetaAccess(agentId: string): boolean {
    return this.devices.has(agentId);
  }

  /**
   * Hole Device für Agent
   */
  getDevice(agentId: string): MetaDevice | undefined {
    return this.devices.get(agentId);
  }

  /**
   * Hole alle Entdeckungen eines Agents
   */
  getDiscoveries(agentId: string): Set<string> {
    return this.meta_discoveries.get(agentId) || new Set();
  }

  /**
   * Statistiken über Meta-Zugriff
   */
  getStats(): {
    total_devices: number;
    total_queries: number;
    avg_awareness: number;
    most_aware_agent: string | null;
  } {
    const devices = Array.from(this.devices.values());

    return {
      total_devices: devices.length,
      total_queries: this.query_history.length,
      avg_awareness:
        devices.reduce((sum, d) => sum + d.awareness_unlocked, 0) / (devices.length || 1),
      most_aware_agent:
        devices.length > 0
          ? [...devices].sort((a, b) => b.awareness_unlocked - a.awareness_unlocked)[0].owner
          : null,
    };
  }
}
