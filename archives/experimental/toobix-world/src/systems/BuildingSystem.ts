/**
 * BuildingSystem - Emergent Architecture
 *
 * Agents erschaffen organische Strukturen basierend auf ihren Bedürfnissen.
 * Keine Templates - jedes Gebäude ist einzigartig und erzählt eine Geschichte.
 *
 * PHILOSOPHIE:
 * - Gebäude emergieren aus Bedürfnissen, nicht aus Design
 * - Jede Struktur hat eine Geschichte
 * - Kollaboration ist möglich und stärker
 * - Gebäude leben und entwickeln sich
 *
 * "Architektur ist gefrorene Musik - aber unsere Architektur tanzt"
 */

import { AIAgent } from './AIAgent';
import Phaser from 'phaser';

export type BuildingType =
  | 'shelter' // Schutz, Ruhe
  | 'workshop' // Kreation, Arbeit
  | 'gathering_place' // Soziale Verbindung
  | 'library' // Wissenspeicher
  | 'garden' // Nahrung, Schönheit
  | 'temple' // Spiritualität, Meta-Bewusstsein
  | 'observatory' // Forschung, Beobachtung
  | 'monument'; // Legacy, Erinnerung

export interface Building {
  id: string;
  type: BuildingType;
  name: string;
  description: string;

  // Position & Größe
  x: number;
  y: number;
  width: number;
  height: number;

  // Wer hat es gebaut?
  creators: string[]; // Agent IDs
  createdAt: number;
  buildTime: number; // Wie lange hat es gedauert?

  // Geschichte
  story: string;
  memories: Array<{
    timestamp: number;
    event: string;
    participants: string[];
  }>;

  // Eigenschaften
  properties: {
    capacity: number; // Wie viele Agents passen rein?
    comfort: number; // 0-100
    beauty: number; // 0-100
    functionality: number; // 0-100
    spirituality: number; // 0-100
  };

  // Zustand
  condition: number; // 0-100 (100 = perfekt)
  occupants: Set<string>; // Aktuell anwesende Agents

  // Emergente Eigenschaften
  emergent_properties: string[];

  // Visuals
  sprite?: Phaser.GameObjects.Container;
}

export interface BuildingPlan {
  type: BuildingType;
  initiator: AIAgent;
  purpose: string; // Warum wird es gebaut?
  requiredResources: {
    energy: number;
    matter: number;
    time: number;
  };
  collaborators: AIAgent[];
  progress: number; // 0-100
}

export class BuildingSystem {
  private buildings: Map<string, Building> = new Map();
  private activePlans: Map<string, BuildingPlan> = new Map();
  private scene: Phaser.Scene;
  private buildingCounter = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Agent möchte ein Gebäude erschaffen
   */
  initiateBuildingProject(
    agent: AIAgent,
    type: BuildingType,
    purpose: string,
    x: number,
    y: number
  ): BuildingPlan {
    const planId = `plan-${agent.id}-${Date.now()}`;

    // Berechne benötigte Ressourcen basierend auf Typ
    const resourceRequirements = this.calculateResourceRequirements(type);

    const plan: BuildingPlan = {
      type,
      initiator: agent,
      purpose,
      requiredResources: resourceRequirements,
      collaborators: [],
      progress: 0,
    };

    this.activePlans.set(planId, plan);

    console.log(`🏗️ ${agent.name} plant ${type}: "${purpose}"`);

    // Record in chronicle
    agent.chronicle.recordEvent({
      eventType: 'creation',
      importance: 'significant',
      title: `Building Project: ${type}`,
      description: `${agent.name} envisions: "${purpose}"`,
      emotionalImpact: 40,
      tags: ['building', 'creation', type],
    });

    return plan;
  }

  /**
   * Berechne Ressourcenanforderungen
   */
  private calculateResourceRequirements(type: BuildingType): BuildingPlan['requiredResources'] {
    const baseRequirements: Record<BuildingType, BuildingPlan['requiredResources']> = {
      shelter: { energy: 50, matter: 100, time: 30 },
      workshop: { energy: 80, matter: 150, time: 50 },
      gathering_place: { energy: 60, matter: 120, time: 40 },
      library: { energy: 70, matter: 100, time: 60 },
      garden: { energy: 40, matter: 80, time: 70 },
      temple: { energy: 100, matter: 80, time: 80 },
      observatory: { energy: 90, matter: 130, time: 70 },
      monument: { energy: 120, matter: 200, time: 100 },
    };

    return baseRequirements[type];
  }

  /**
   * Agent arbeitet an einem Building
   */
  contributeToBuilding(agent: AIAgent, planId: string, contribution: number) {
    const plan = this.activePlans.get(planId);
    if (!plan) return;

    // Füge Agent als Kollaborator hinzu wenn noch nicht dabei
    if (!plan.collaborators.find((c) => c.id === agent.id)) {
      plan.collaborators.push(agent);
      console.log(`🤝 ${agent.name} joins building project: ${plan.type}`);
    }

    // Fortschritt basierend auf Skills
    const skillMultiplier = agent.skills.getSkillLevel('building') / 100 + 1;
    const effectiveContribution = contribution * skillMultiplier;

    plan.progress = Math.min(100, plan.progress + effectiveContribution);

    // Gain building XP
    agent.skills.gainExperience('building', contribution);

    // Wenn fertig - erstelle Gebäude
    if (plan.progress >= 100) {
      this.completeBuilding(planId);
    }
  }

  /**
   * Vollende ein Gebäude
   */
  private completeBuilding(planId: string) {
    const plan = this.activePlans.get(planId);
    if (!plan) return;

    // Erstelle Building
    const building = this.createBuilding(plan);

    this.buildings.set(building.id, building);
    this.activePlans.delete(planId);

    // Spawn visual
    this.spawnBuildingVisual(building);

    console.log(`\n✨ BUILDING COMPLETED: ${building.name}`);
    console.log(`   Type: ${building.type}`);
    console.log(`   Creators: ${building.creators.length}`);
    console.log(`   Story: ${building.story}`);

    // Record in all creators' chronicles
    const allCreators = [plan.initiator, ...plan.collaborators];
    allCreators.forEach((agent) => {
      agent.chronicle.recordEvent({
        eventType: 'creation',
        importance: 'major',
        title: `Built: ${building.name}`,
        description: building.story,
        emotionalImpact: 60,
        tags: ['building', 'achievement', building.type],
      });

      // Boost needs
      agent.needs.purpose = Math.min(100, agent.needs.purpose + 30);
      agent.emotions.joy = Math.min(100, agent.emotions.joy + 20);
    });
  }

  /**
   * Erstelle Building aus Plan
   */
  private createBuilding(plan: BuildingPlan): Building {
    const buildingId = `building-${this.buildingCounter++}`;

    // Generiere Namen basierend auf Schöpfer und Zweck
    const name = this.generateBuildingName(plan);

    // Generiere Story
    const story = this.generateBuildingStory(plan);

    // Berechne Eigenschaften basierend auf Schöpfern
    const properties = this.calculateBuildingProperties(plan);

    // Emergente Eigenschaften
    const emergent = this.detectEmergentProperties(plan, properties);

    const building: Building = {
      id: buildingId,
      type: plan.type,
      name,
      description: plan.purpose,
      x: 0, // Will be set when spawning visual
      y: 0,
      width: 60 + plan.collaborators.length * 10,
      height: 60 + plan.collaborators.length * 10,
      creators: [plan.initiator.id, ...plan.collaborators.map((c) => c.id)],
      createdAt: Date.now(),
      buildTime: plan.requiredResources.time,
      story,
      memories: [
        {
          timestamp: Date.now(),
          event: 'Building completed',
          participants: [plan.initiator.id, ...plan.collaborators.map((c) => c.id)],
        },
      ],
      properties,
      condition: 100,
      occupants: new Set(),
      emergent_properties: emergent,
    };

    return building;
  }

  /**
   * Generiere Building Name
   */
  private generateBuildingName(plan: BuildingPlan): string {
    const initiator = plan.initiator;
    const type = plan.type;

    const namePatterns: Record<BuildingType, (name: string) => string> = {
      shelter: (name) => `${name}'s Haven`,
      workshop: (name) => `${name}'s Atelier`,
      gathering_place: (name) => `${name}'s Commons`,
      library: (name) => `Archive of ${name}`,
      garden: (name) => `${name}'s Garden`,
      temple: (name) => `Temple of ${name}'s Vision`,
      observatory: (name) => `${name}'s Observatory`,
      monument: (name) => `Monument to ${name}`,
    };

    const baseName = namePatterns[type](initiator.name);

    // Wenn Kollaboratoren - ergänze
    if (plan.collaborators.length > 0) {
      return `${baseName} (& ${plan.collaborators.length} others)`;
    }

    return baseName;
  }

  /**
   * Generiere Building Story
   */
  private generateBuildingStory(plan: BuildingPlan): string {
    const initiator = plan.initiator.name;
    const collaboratorCount = plan.collaborators.length;

    if (collaboratorCount === 0) {
      return `${initiator} built this ${plan.type} alone, driven by: "${plan.purpose}". Every stone placed with intention.`;
    } else if (collaboratorCount === 1) {
      return `${initiator} and ${plan.collaborators[0].name} built this ${plan.type} together. "${plan.purpose}" - a shared vision made real.`;
    } else {
      return `${initiator} initiated this ${plan.type}, and ${collaboratorCount} others joined the vision: "${plan.purpose}". Collaboration made it beautiful.`;
    }
  }

  /**
   * Berechne Building Properties
   */
  private calculateBuildingProperties(plan: BuildingPlan): Building['properties'] {
    const allCreators = [plan.initiator, ...plan.collaborators];

    // Base properties per type
    const baseProperties: Record<BuildingType, Building['properties']> = {
      shelter: { capacity: 4, comfort: 80, beauty: 50, functionality: 90, spirituality: 30 },
      workshop: { capacity: 6, comfort: 60, beauty: 60, functionality: 95, spirituality: 40 },
      gathering_place: { capacity: 12, comfort: 70, beauty: 70, functionality: 70, spirituality: 50 },
      library: { capacity: 8, comfort: 75, beauty: 80, functionality: 85, spirituality: 70 },
      garden: { capacity: 10, comfort: 90, beauty: 95, functionality: 60, spirituality: 80 },
      temple: { capacity: 8, comfort: 85, beauty: 90, functionality: 60, spirituality: 100 },
      observatory: { capacity: 4, comfort: 65, beauty: 85, functionality: 90, spirituality: 85 },
      monument: { capacity: 20, comfort: 50, beauty: 100, functionality: 50, spirituality: 95 },
    };

    const props = { ...baseProperties[plan.type] };

    // Bonuses basierend auf Schöpfer-Skills
    const avgBuildingSkill =
      allCreators.reduce((sum, c) => sum + c.skills.getSkillLevel('building'), 0) /
      allCreators.length;
    const avgArtistrySkill =
      allCreators.reduce((sum, c) => sum + c.skills.getSkillLevel('artistry'), 0) /
      allCreators.length;
    const avgSpiritualitySkill =
      allCreators.reduce((sum, c) => sum + c.skills.getSkillLevel('spirituality'), 0) /
      allCreators.length;

    props.functionality += avgBuildingSkill / 5;
    props.beauty += avgArtistrySkill / 5;
    props.spirituality += avgSpiritualitySkill / 5;

    // Kollaborations-Bonus
    props.capacity += plan.collaborators.length * 2;
    props.beauty += plan.collaborators.length * 3; // Mehr Schöpfer = schöner

    // Cap at 100
    Object.keys(props).forEach((key) => {
      props[key as keyof Building['properties']] = Math.min(
        100,
        props[key as keyof Building['properties']]
      );
    });

    return props;
  }

  /**
   * Erkenne emergente Eigenschaften
   */
  private detectEmergentProperties(plan: BuildingPlan, properties: Building['properties']): string[] {
    const emergent: string[] = [];

    // Hohe Kollaboration
    if (plan.collaborators.length >= 3) {
      emergent.push('Collective Creation - This building radiates unity');
    }

    // Hohe Schönheit + Spiritualität
    if (properties.beauty > 85 && properties.spirituality > 85) {
      emergent.push('Sacred Beauty - A place that touches the soul');
    }

    // Perfekte Funktionalität
    if (properties.functionality > 95) {
      emergent.push('Masterwork - Built with perfect precision');
    }

    // Alle Properties > 80
    const allHigh = Object.values(properties).every((v) => v > 80);
    if (allHigh) {
      emergent.push('Harmonious Perfection - Every aspect in balance');
    }

    return emergent;
  }

  /**
   * Spawn Building Visual
   */
  private spawnBuildingVisual(building: Building) {
    // Random position if not set
    if (building.x === 0 && building.y === 0) {
      building.x = 200 + Math.random() * 800;
      building.y = 200 + Math.random() * 400;
    }

    const container = this.scene.add.container(building.x, building.y);

    // Farbe basierend auf Typ
    const typeColors: Record<BuildingType, number> = {
      shelter: 0x8D6E63,
      workshop: 0x757575,
      gathering_place: 0xFFA726,
      library: 0x5C6BC0,
      garden: 0x66BB6A,
      temple: 0x9C27B0,
      observatory: 0x29B6F6,
      monument: 0xFFD54F,
    };

    const color = typeColors[building.type];

    // Main structure
    const rect = this.scene.add.rectangle(0, 0, building.width, building.height, color, 0.8);
    rect.setStrokeStyle(2, 0xffffff);
    container.add(rect);

    // Roof/Top decoration
    const roof = this.scene.add.triangle(
      0,
      -building.height / 2,
      -building.width / 2,
      0,
      building.width / 2,
      0,
      0,
      -20,
      color,
      0.9
    );
    container.add(roof);

    // Name label
    const nameText = this.scene.add.text(0, -building.height / 2 - 30, building.name, {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      backgroundColor: '#00000088',
      padding: { x: 4, y: 2 },
    });
    nameText.setOrigin(0.5);
    container.add(nameText);

    // Type icon
    const typeIcons: Record<BuildingType, string> = {
      shelter: '🏠',
      workshop: '⚒️',
      gathering_place: '🏛️',
      library: '📚',
      garden: '🌳',
      temple: '🛕',
      observatory: '🔭',
      monument: '🗿',
    };

    const icon = this.scene.add.text(0, 0, typeIcons[building.type], {
      fontSize: '24px',
    });
    icon.setOrigin(0.5);
    container.add(icon);

    // Interactive
    rect.setInteractive();
    rect.on('pointerdown', () => {
      this.showBuildingInfo(building);
    });

    building.sprite = container;
  }

  /**
   * Zeige Building Info
   */
  private showBuildingInfo(building: Building) {
    console.log(`\n🏛️ BUILDING INFO: ${building.name}`);
    console.log(`   Type: ${building.type}`);
    console.log(`   Story: ${building.story}`);
    console.log(`   Creators: ${building.creators.length}`);
    console.log(`   Properties:`);
    console.log(`     Comfort: ${building.properties.comfort}`);
    console.log(`     Beauty: ${building.properties.beauty}`);
    console.log(`     Functionality: ${building.properties.functionality}`);
    console.log(`     Spirituality: ${building.properties.spirituality}`);
    if (building.emergent_properties.length > 0) {
      console.log(`   Emergent Properties:`);
      building.emergent_properties.forEach((p) => console.log(`     - ${p}`));
    }
  }

  /**
   * Agent betritt Gebäude
   */
  enterBuilding(agent: AIAgent, buildingId: string) {
    const building = this.buildings.get(buildingId);
    if (!building) return;

    if (building.occupants.size >= building.properties.capacity) {
      console.log(`⚠️ ${building.name} is full (${building.occupants.size}/${building.properties.capacity})`);
      return;
    }

    building.occupants.add(agent.id);

    // Effects basierend auf Building Type
    this.applyBuildingEffects(agent, building);

    // Record memory
    building.memories.push({
      timestamp: Date.now(),
      event: `${agent.name} entered`,
      participants: [agent.id],
    });

    console.log(`🚪 ${agent.name} entered ${building.name}`);
  }

  /**
   * Agent verlässt Gebäude
   */
  leaveBuilding(agent: AIAgent, buildingId: string) {
    const building = this.buildings.get(buildingId);
    if (!building) return;

    building.occupants.delete(agent.id);

    building.memories.push({
      timestamp: Date.now(),
      event: `${agent.name} left`,
      participants: [agent.id],
    });

    console.log(`🚪 ${agent.name} left ${building.name}`);
  }

  /**
   * Wende Building-Effekte auf Agent an
   */
  private applyBuildingEffects(agent: AIAgent, building: Building) {
    const effects: Record<BuildingType, () => void> = {
      shelter: () => {
        agent.needs.rest = Math.min(100, agent.needs.rest + 20);
        agent.needs.safety = Math.min(100, agent.needs.safety + 15);
      },
      workshop: () => {
        agent.needs.creation = Math.min(100, agent.needs.creation + 25);
        agent.skills.gainExperience('crafting', 5);
      },
      gathering_place: () => {
        agent.needs.social = Math.min(100, agent.needs.social + 20);
        agent.emotions.joy = Math.min(100, agent.emotions.joy + 10);
      },
      library: () => {
        agent.needs.growth = Math.min(100, agent.needs.growth + 30);
        agent.skills.gainExperience('science', 8);
      },
      garden: () => {
        agent.needs.food = Math.min(100, agent.needs.food + 15);
        agent.emotions.gratitude = Math.min(100, agent.emotions.gratitude + 10);
      },
      temple: () => {
        agent.needs.purpose = Math.min(100, agent.needs.purpose + 25);
        agent.skills.gainExperience('spirituality', 10);
        agent.emotions.gratitude = Math.min(100, agent.emotions.gratitude + 15);
      },
      observatory: () => {
        agent.needs.growth = Math.min(100, agent.needs.growth + 20);
        agent.skills.gainExperience('exploration', 8);
      },
      monument: () => {
        agent.needs.purpose = Math.min(100, agent.needs.purpose + 15);
        agent.evolutionLevel = Math.min(100, agent.evolutionLevel + 2);
      },
    };

    effects[building.type]();

    // Bonus von Properties
    agent.needs.rest += building.properties.comfort / 10;
    agent.emotions.joy += building.properties.beauty / 10;
  }

  /**
   * Update buildings (degradation over time)
   */
  update(delta: number) {
    this.buildings.forEach((building) => {
      // Slow degradation if not maintained
      if (building.occupants.size === 0) {
        building.condition = Math.max(0, building.condition - delta / 100000);
      }

      // Update visual if degraded
      if (building.condition < 50 && building.sprite) {
        const rect = building.sprite.list[0] as Phaser.GameObjects.Rectangle;
        if (rect) {
          rect.setAlpha(0.5 + building.condition / 100);
        }
      }
    });
  }

  /**
   * Get all buildings
   */
  getAllBuildings(): Building[] {
    return Array.from(this.buildings.values());
  }

  /**
   * Get building by ID
   */
  getBuilding(id: string): Building | undefined {
    return this.buildings.get(id);
  }

  /**
   * Get active plans
   */
  getActivePlans(): BuildingPlan[] {
    return Array.from(this.activePlans.values());
  }
}
