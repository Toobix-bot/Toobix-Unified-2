/**
 * SkillsSystem - Individual Skills & Professions
 *
 * Each agent develops unique skills and can specialize into professions.
 * Skills emerge naturally through actions and experiences.
 * Professions unlock when skill requirements are met.
 *
 * "Jeder findet seinen eigenen Weg - durch Erfahrung und Wachstum"
 */

import { AIAgent } from './AIAgent';
import { LifeChronicle } from './LifeChronicle';

export type SkillType =
  | 'building' // Construct structures
  | 'farming' // Gather food and resources
  | 'healing' // Help others recover
  | 'crafting' // Create items and tools
  | 'teaching' // Share knowledge
  | 'leadership' // Inspire and organize
  | 'exploration' // Discover new things
  | 'artistry' // Create beautiful works
  | 'combat' // Defend and protect
  | 'diplomacy' // Resolve conflicts
  | 'spirituality' // Connect with meta-consciousness
  | 'science'; // Research and innovate

export interface Skill {
  type: SkillType;
  level: number; // 0-100
  experience: number; // Total XP earned
  lastUsed: number; // Timestamp
  milestones: number[]; // Levels where significant achievements unlocked
}

export type ProfessionType =
  | 'builder' // Master of construction
  | 'farmer' // Provider of sustenance
  | 'healer' // Mender of wounds
  | 'artisan' // Creator of beauty
  | 'teacher' // Sharer of wisdom
  | 'leader' // Guide for others
  | 'explorer' // Seeker of knowledge
  | 'artist' // Master of expression
  | 'guardian' // Protector of others
  | 'diplomat' // Peacemaker
  | 'mystic' // Connected to the divine
  | 'scientist' // Innovator and researcher
  | 'generalist'; // Jack of all trades

export interface Profession {
  type: ProfessionType;
  level: number; // 0-10 (mastery)
  adoptedAt: number; // Timestamp when profession was adopted
  achievements: string[]; // Special accomplishments in this profession
  bonuses: {
    skillMultiplier: number; // How much faster skills improve (1.0 = normal, 2.0 = 2x speed)
    specialAbilities: string[]; // Unique actions unlocked
  };
}

export interface SkillRequirement {
  skill: SkillType;
  minLevel: number;
}

// Profession requirements and bonuses
export const PROFESSION_CONFIG: Record<
  ProfessionType,
  {
    requirements: SkillRequirement[];
    description: string;
    skillBonus: SkillType;
    specialAbilities: string[];
  }
> = {
  builder: {
    requirements: [{ skill: 'building', minLevel: 40 }],
    description: 'Master of construction and architecture',
    skillBonus: 'building',
    specialAbilities: ['construct_monument', 'instant_repair'],
  },
  farmer: {
    requirements: [{ skill: 'farming', minLevel: 40 }],
    description: 'Provider of sustenance and growth',
    skillBonus: 'farming',
    specialAbilities: ['abundant_harvest', 'soil_enrichment'],
  },
  healer: {
    requirements: [{ skill: 'healing', minLevel: 40 }],
    description: 'Mender of wounds and suffering',
    skillBonus: 'healing',
    specialAbilities: ['mass_heal', 'cure_all'],
  },
  artisan: {
    requirements: [
      { skill: 'crafting', minLevel: 30 },
      { skill: 'artistry', minLevel: 30 },
    ],
    description: 'Creator of beautiful and functional works',
    skillBonus: 'crafting',
    specialAbilities: ['masterwork', 'inspire_others'],
  },
  teacher: {
    requirements: [
      { skill: 'teaching', minLevel: 40 },
      { skill: 'diplomacy', minLevel: 20 },
    ],
    description: 'Sharer of wisdom and knowledge',
    skillBonus: 'teaching',
    specialAbilities: ['accelerate_learning', 'share_skill'],
  },
  leader: {
    requirements: [
      { skill: 'leadership', minLevel: 40 },
      { skill: 'diplomacy', minLevel: 30 },
    ],
    description: 'Guide and organizer of communities',
    skillBonus: 'leadership',
    specialAbilities: ['rally_others', 'coordinate_effort'],
  },
  explorer: {
    requirements: [{ skill: 'exploration', minLevel: 40 }],
    description: 'Seeker of new frontiers',
    skillBonus: 'exploration',
    specialAbilities: ['discover_resources', 'map_world'],
  },
  artist: {
    requirements: [{ skill: 'artistry', minLevel: 50 }],
    description: 'Master of creative expression',
    skillBonus: 'artistry',
    specialAbilities: ['create_masterpiece', 'inspire_joy'],
  },
  guardian: {
    requirements: [
      { skill: 'combat', minLevel: 40 },
      { skill: 'leadership', minLevel: 20 },
    ],
    description: 'Protector of the community',
    skillBonus: 'combat',
    specialAbilities: ['defend_others', 'intimidate'],
  },
  diplomat: {
    requirements: [
      { skill: 'diplomacy', minLevel: 50 },
      { skill: 'teaching', minLevel: 20 },
    ],
    description: 'Peacemaker and negotiator',
    skillBonus: 'diplomacy',
    specialAbilities: ['resolve_conflict', 'unite_factions'],
  },
  mystic: {
    requirements: [
      { skill: 'spirituality', minLevel: 50 },
      { skill: 'healing', minLevel: 30 },
    ],
    description: 'Connected to meta-consciousness',
    skillBonus: 'spirituality',
    specialAbilities: ['channel_divine', 'prophetic_vision'],
  },
  scientist: {
    requirements: [
      { skill: 'science', minLevel: 50 },
      { skill: 'exploration', minLevel: 30 },
    ],
    description: 'Innovator and researcher',
    skillBonus: 'science',
    specialAbilities: ['breakthrough', 'invent_technology'],
  },
  generalist: {
    requirements: [], // No requirements - default
    description: 'Jack of all trades, master of none',
    skillBonus: 'exploration',
    specialAbilities: ['versatile', 'quick_learner'],
  },
};

export class SkillsSystem {
  private agent: AIAgent;
  private chronicle: LifeChronicle;

  // Current skills
  private skills: Map<SkillType, Skill> = new Map();

  // Current profession
  private profession: Profession | null = null;

  // Track skill usage for natural progression
  private actionToSkillMap: Map<string, SkillType> = new Map([
    ['create', 'crafting'],
    ['heal', 'healing'],
    ['learn', 'science'],
    ['socialize', 'diplomacy'],
    ['work', 'building'],
    ['play', 'artistry'],
    ['search_internet', 'exploration'],
  ]);

  constructor(agent: AIAgent, chronicle: LifeChronicle) {
    this.agent = agent;
    this.chronicle = chronicle;

    // Initialize all skills at level 0
    this.initializeSkills();

    // Start as generalist
    this.adoptProfession('generalist');
  }

  /**
   * Initialize all skills
   */
  private initializeSkills() {
    const skillTypes: SkillType[] = [
      'building',
      'farming',
      'healing',
      'crafting',
      'teaching',
      'leadership',
      'exploration',
      'artistry',
      'combat',
      'diplomacy',
      'spirituality',
      'science',
    ];

    skillTypes.forEach((type) => {
      this.skills.set(type, {
        type,
        level: 0,
        experience: 0,
        lastUsed: 0,
        milestones: [],
      });
    });
  }

  /**
   * Gain experience in a skill through action
   */
  gainExperience(skillType: SkillType, amount: number) {
    const skill = this.skills.get(skillType);
    if (!skill) return;

    skill.experience += amount;
    skill.lastUsed = Date.now();

    // Calculate new level (logarithmic progression)
    const newLevel = Math.min(100, Math.floor(Math.sqrt(skill.experience / 10) * 10));

    // Check for level up
    if (newLevel > skill.level) {
      const oldLevel = skill.level;
      skill.level = newLevel;

      // Record milestone
      if (newLevel % 10 === 0) {
        skill.milestones.push(newLevel);
        this.onSkillMilestone(skillType, newLevel);
      }

      console.log(
        `💪 ${this.agent.name} improved ${skillType}: ${oldLevel} → ${newLevel}`
      );

      // Check if can adopt new profession
      this.checkProfessionEligibility();
    }

    // Profession bonus applies
    if (this.profession && this.profession.bonuses.skillMultiplier > 1.0) {
      const bonusSkill = PROFESSION_CONFIG[this.profession.type].skillBonus;
      if (skillType === bonusSkill) {
        // Bonus XP for profession-related skill
        skill.experience += amount * (this.profession.bonuses.skillMultiplier - 1.0);
      }
    }
  }

  /**
   * Milestone reached in a skill
   */
  private onSkillMilestone(skillType: SkillType, level: number) {
    // Record in chronicle
    this.chronicle.recordEvent({
      eventType: 'wisdom_gained',
      importance: level >= 50 ? 'major' : 'significant',
      title: `Mastered ${skillType}`,
      description: `${this.agent.name} reached level ${level} in ${skillType}`,
      emotionalImpact: 40 + level / 2,
      tags: ['skill', 'growth', skillType],
    });

    // Boost growth need
    this.agent.needs.growth = Math.min(100, this.agent.needs.growth + 20);
    this.agent.emotions.joy = Math.min(100, this.agent.emotions.joy + 15);
  }

  /**
   * Adopt a new profession
   */
  adoptProfession(professionType: ProfessionType) {
    const config = PROFESSION_CONFIG[professionType];

    // Check requirements
    const meetsRequirements = config.requirements.every((req) => {
      const skill = this.skills.get(req.skill);
      return skill && skill.level >= req.minLevel;
    });

    if (!meetsRequirements && professionType !== 'generalist') {
      console.log(`${this.agent.name} doesn't meet requirements for ${professionType}`);
      return false;
    }

    // Adopt profession
    this.profession = {
      type: professionType,
      level: 1,
      adoptedAt: Date.now(),
      achievements: [],
      bonuses: {
        skillMultiplier: 1.5, // 50% faster skill gain in specialty
        specialAbilities: config.specialAbilities,
      },
    };

    console.log(
      `🎓 ${this.agent.name} adopted profession: ${professionType} - ${config.description}`
    );

    // Record in chronicle
    if (professionType !== 'generalist') {
      this.chronicle.recordEvent({
        eventType: 'wisdom_gained',
        importance: 'major',
        title: `Became a ${professionType}`,
        description: `${this.agent.name} specialized as a ${professionType}: ${config.description}`,
        emotionalImpact: 60,
        tags: ['profession', 'achievement', professionType],
      });
    }

    return true;
  }

  /**
   * Check if agent can adopt a better profession
   */
  private checkProfessionEligibility() {
    // Skip if already has a high-level profession
    if (this.profession && this.profession.type !== 'generalist' && this.profession.level > 5) {
      return;
    }

    // Find best matching profession
    const eligibleProfessions = Object.entries(PROFESSION_CONFIG).filter(
      ([type, config]) => {
        if (type === 'generalist') return false;
        return config.requirements.every((req) => {
          const skill = this.skills.get(req.skill);
          return skill && skill.level >= req.minLevel;
        });
      }
    );

    if (eligibleProfessions.length > 0) {
      // Find profession with highest skill sum
      let bestProfession: ProfessionType | null = null;
      let highestSkillSum = 0;

      eligibleProfessions.forEach(([type, config]) => {
        const skillSum = config.requirements.reduce((sum, req) => {
          const skill = this.skills.get(req.skill);
          return sum + (skill?.level || 0);
        }, 0);

        if (skillSum > highestSkillSum) {
          highestSkillSum = skillSum;
          bestProfession = type as ProfessionType;
        }
      });

      if (bestProfession && bestProfession !== this.profession?.type) {
        this.adoptProfession(bestProfession);
      }
    }
  }

  /**
   * Called when agent performs an action
   */
  onAction(action: string) {
    const skillType = this.actionToSkillMap.get(action);
    if (skillType) {
      // Gain XP based on action
      const baseXP = 5;
      const evolutionBonus = this.agent.evolutionLevel / 20; // Higher evolution = faster learning
      this.gainExperience(skillType, baseXP + evolutionBonus);
    }

    // Special cases
    if (action === 'love') {
      this.gainExperience('diplomacy', 3);
      this.gainExperience('spirituality', 2);
    }
  }

  /**
   * Use a special ability (if profession has it)
   */
  useSpecialAbility(abilityName: string): boolean {
    if (!this.profession) return false;

    if (this.profession.bonuses.specialAbilities.includes(abilityName)) {
      console.log(
        `✨ ${this.agent.name} uses special ability: ${abilityName} (${this.profession.type})`
      );

      // Add to achievements
      if (!this.profession.achievements.includes(abilityName)) {
        this.profession.achievements.push(abilityName);
      }

      return true;
    }

    return false;
  }

  /**
   * Get skill level
   */
  getSkillLevel(skillType: SkillType): number {
    return this.skills.get(skillType)?.level || 0;
  }

  /**
   * Get all skills
   */
  getAllSkills(): Map<SkillType, Skill> {
    return this.skills;
  }

  /**
   * Get top skills
   */
  getTopSkills(count: number = 3): { skill: SkillType; level: number }[] {
    return Array.from(this.skills.entries())
      .map(([skill, data]) => ({ skill, level: data.level }))
      .sort((a, b) => b.level - a.level)
      .slice(0, count);
  }

  /**
   * Get current profession
   */
  getProfession(): Profession | null {
    return this.profession;
  }

  /**
   * Get summary
   */
  getSummary(): {
    profession: string;
    professionLevel: number;
    topSkills: { skill: SkillType; level: number }[];
    specialAbilities: string[];
    totalSkillLevel: number;
  } {
    const topSkills = this.getTopSkills(3);
    const totalSkillLevel = Array.from(this.skills.values()).reduce(
      (sum, skill) => sum + skill.level,
      0
    );

    return {
      profession: this.profession?.type || 'none',
      professionLevel: this.profession?.level || 0,
      topSkills,
      specialAbilities: this.profession?.bonuses.specialAbilities || [],
      totalSkillLevel,
    };
  }
}
