// ============================================================
// TOOBIX MINECRAFT KNOWLEDGE BASE
// Komplettes Wissen über Minecraft 1.20.1
// ============================================================

export interface MinecraftKnowledge {
  version: string;
  gamePhases: GamePhase[];
  recipes: CraftingRecipe[];
  biomes: BiomeInfo[];
  mobs: MobInfo[];
  structures: StructureInfo[];
  enchantments: EnchantmentInfo[];
  potions: PotionInfo[];
  farmingTechniques: FarmingTechnique[];
  survivalTips: SurvivalTip[];
  buildingPatterns: BuildingPattern[];
  redstoneBasics: RedstoneKnowledge[];
  speedrunStrategies: SpeedrunStrategy[];
  dimensionKnowledge: DimensionInfo[];
}

export interface GamePhase {
  name: string;
  dayRange: [number, number];
  goals: string[];
  essentialItems: string[];
  dangers: string[];
  milestones: string[];
  masteryScore: number; // 0-100
}

export interface CraftingRecipe {
  result: string;
  ingredients: string[];
  craftingTable: boolean;
  priority: 'essential' | 'important' | 'useful' | 'luxury';
  unlockDay: number;
}

export interface BiomeInfo {
  name: string;
  resources: string[];
  mobs: string[];
  structures: string[];
  dangerLevel: number;
  foodSources: string[];
  shelterOptions: string[];
}

export interface MobInfo {
  name: string;
  hostile: boolean;
  drops: string[];
  health: number;
  damage: number;
  spawnConditions: string;
  fightStrategy: string;
  avoidStrategy: string;
}

export interface StructureInfo {
  name: string;
  loot: string[];
  dangers: string[];
  findingTips: string;
  worthExploring: boolean;
}

export interface EnchantmentInfo {
  name: string;
  maxLevel: number;
  appliesTo: string[];
  priority: number;
  description: string;
}

export interface PotionInfo {
  name: string;
  ingredients: string[];
  duration: number;
  useCase: string;
}

export interface FarmingTechnique {
  name: string;
  type: 'crop' | 'animal' | 'mob' | 'tree' | 'automatic';
  resources: string[];
  output: string[];
  efficiency: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface SurvivalTip {
  situation: string;
  solution: string;
  priority: number;
}

export interface BuildingPattern {
  name: string;
  purpose: string;
  materials: string[];
  dimensions: string;
  complexity: number;
}

export interface RedstoneKnowledge {
  concept: string;
  components: string[];
  useCase: string;
  difficulty: number;
}

export interface SpeedrunStrategy {
  phase: string;
  actions: string[];
  timeGoal: number;
  risks: string[];
}

export interface DimensionInfo {
  name: string;
  accessRequirements: string[];
  uniqueResources: string[];
  bosses: string[];
  survivalTips: string[];
}

// ============================================================
// KOMPLETTES MINECRAFT 1.20.1 WISSEN
// ============================================================

export const MINECRAFT_KNOWLEDGE: MinecraftKnowledge = {
  version: "1.20.1",
  
  // ==================== GAME PHASES ====================
  gamePhases: [
    {
      name: "First Night Survival",
      dayRange: [1, 1],
      goals: [
        "Punch tree for wood",
        "Craft crafting table",
        "Craft wooden pickaxe",
        "Mine stone",
        "Craft stone tools",
        "Find or create shelter",
        "Craft bed if sheep found",
        "Survive the night"
      ],
      essentialItems: [
        "crafting_table", "wooden_pickaxe", "stone_pickaxe", 
        "stone_sword", "torch", "furnace"
      ],
      dangers: ["zombies", "skeletons", "spiders", "creepers", "darkness"],
      milestones: ["first_shelter", "first_tools", "survived_night"],
      masteryScore: 0
    },
    {
      name: "Early Game Establishment",
      dayRange: [2, 10],
      goals: [
        "Build permanent base",
        "Create farm (wheat, carrots, potatoes)",
        "Find iron ore",
        "Craft iron tools and armor",
        "Create animal pen",
        "Build storage system",
        "Explore nearby caves",
        "Find diamonds (optional)"
      ],
      essentialItems: [
        "iron_pickaxe", "iron_sword", "iron_armor_set",
        "shield", "bed", "chest", "furnace", "wheat_seeds"
      ],
      dangers: ["cave_mobs", "creeper_explosions", "lava", "fall_damage"],
      milestones: ["iron_age", "farm_established", "base_complete"],
      masteryScore: 0
    },
    {
      name: "Mid Game Expansion",
      dayRange: [11, 50],
      goals: [
        "Find diamonds (12+ for full armor + tools)",
        "Create enchanting setup",
        "Build nether portal",
        "Explore nether safely",
        "Find fortress",
        "Collect blaze rods",
        "Create brewing stand",
        "Build mob farm (XP)"
      ],
      essentialItems: [
        "diamond_pickaxe", "diamond_sword", "diamond_armor_set",
        "enchanting_table", "bookshelves", "brewing_stand",
        "blaze_rod", "ender_pearl", "obsidian"
      ],
      dangers: ["ghasts", "blazes", "wither_skeletons", "lava_oceans", "piglins"],
      milestones: ["diamond_age", "nether_access", "enchanting_ready"],
      masteryScore: 0
    },
    {
      name: "Late Game Preparation",
      dayRange: [51, 100],
      goals: [
        "Collect ender pearls (12+)",
        "Find stronghold",
        "Prepare end gear",
        "Max enchant equipment",
        "Create potion supply",
        "Build enderman farm (optional)",
        "Defeat Ender Dragon"
      ],
      essentialItems: [
        "eyes_of_ender", "max_enchanted_gear", "potions",
        "golden_apples", "beds_for_dragon", "slow_falling_potions"
      ],
      dangers: ["endermen", "ender_dragon", "void", "shulkers"],
      milestones: ["stronghold_found", "dragon_defeated", "elytra_obtained"],
      masteryScore: 0
    },
    {
      name: "End Game Mastery",
      dayRange: [101, 500],
      goals: [
        "Explore end cities",
        "Obtain elytra",
        "Collect shulker boxes",
        "Build mega farms",
        "Create villager trading hall",
        "Obtain all enchantments",
        "Defeat Wither",
        "Get beacon"
      ],
      essentialItems: [
        "elytra", "shulker_boxes", "beacon", "netherite_gear",
        "mending_books", "efficiency_5", "fortune_3"
      ],
      dangers: ["shulkers", "wither", "guardian_temples"],
      milestones: ["elytra_flight", "beacon_active", "netherite_upgrade"],
      masteryScore: 0
    },
    {
      name: "Transcendence",
      dayRange: [501, Infinity],
      goals: [
        "Build architectural masterpieces",
        "Create self-sustaining systems",
        "Achieve all advancements",
        "Help other players",
        "Create art and beauty",
        "Spiritual Minecraft experience"
      ],
      essentialItems: ["everything_automated", "creative_freedom"],
      dangers: ["boredom", "losing_purpose"],
      milestones: ["all_advancements", "masterpiece_built", "enlightenment"],
      masteryScore: 0
    }
  ],

  // ==================== CRAFTING RECIPES ====================
  recipes: [
    // Day 1 Essential
    { result: "crafting_table", ingredients: ["oak_planks:4"], craftingTable: false, priority: 'essential', unlockDay: 1 },
    { result: "wooden_pickaxe", ingredients: ["oak_planks:3", "stick:2"], craftingTable: true, priority: 'essential', unlockDay: 1 },
    { result: "wooden_axe", ingredients: ["oak_planks:3", "stick:2"], craftingTable: true, priority: 'essential', unlockDay: 1 },
    { result: "wooden_sword", ingredients: ["oak_planks:2", "stick:1"], craftingTable: true, priority: 'essential', unlockDay: 1 },
    { result: "stick", ingredients: ["oak_planks:2"], craftingTable: false, priority: 'essential', unlockDay: 1 },
    { result: "torch", ingredients: ["coal:1", "stick:1"], craftingTable: false, priority: 'essential', unlockDay: 1 },
    { result: "furnace", ingredients: ["cobblestone:8"], craftingTable: true, priority: 'essential', unlockDay: 1 },
    
    // Stone Age
    { result: "stone_pickaxe", ingredients: ["cobblestone:3", "stick:2"], craftingTable: true, priority: 'essential', unlockDay: 1 },
    { result: "stone_sword", ingredients: ["cobblestone:2", "stick:1"], craftingTable: true, priority: 'essential', unlockDay: 1 },
    { result: "stone_axe", ingredients: ["cobblestone:3", "stick:2"], craftingTable: true, priority: 'important', unlockDay: 1 },
    { result: "stone_shovel", ingredients: ["cobblestone:1", "stick:2"], craftingTable: true, priority: 'useful', unlockDay: 1 },
    
    // Shelter & Storage
    { result: "chest", ingredients: ["oak_planks:8"], craftingTable: true, priority: 'essential', unlockDay: 1 },
    { result: "bed", ingredients: ["wool:3", "oak_planks:3"], craftingTable: true, priority: 'essential', unlockDay: 1 },
    { result: "door", ingredients: ["oak_planks:6"], craftingTable: true, priority: 'important', unlockDay: 1 },
    
    // Iron Age
    { result: "iron_pickaxe", ingredients: ["iron_ingot:3", "stick:2"], craftingTable: true, priority: 'essential', unlockDay: 3 },
    { result: "iron_sword", ingredients: ["iron_ingot:2", "stick:1"], craftingTable: true, priority: 'essential', unlockDay: 3 },
    { result: "iron_axe", ingredients: ["iron_ingot:3", "stick:2"], craftingTable: true, priority: 'important', unlockDay: 3 },
    { result: "shield", ingredients: ["iron_ingot:1", "oak_planks:6"], craftingTable: true, priority: 'essential', unlockDay: 3 },
    { result: "bucket", ingredients: ["iron_ingot:3"], craftingTable: true, priority: 'essential', unlockDay: 3 },
    { result: "iron_helmet", ingredients: ["iron_ingot:5"], craftingTable: true, priority: 'important', unlockDay: 3 },
    { result: "iron_chestplate", ingredients: ["iron_ingot:8"], craftingTable: true, priority: 'important', unlockDay: 3 },
    { result: "iron_leggings", ingredients: ["iron_ingot:7"], craftingTable: true, priority: 'important', unlockDay: 3 },
    { result: "iron_boots", ingredients: ["iron_ingot:4"], craftingTable: true, priority: 'important', unlockDay: 3 },
    
    // Diamond Age
    { result: "diamond_pickaxe", ingredients: ["diamond:3", "stick:2"], craftingTable: true, priority: 'essential', unlockDay: 10 },
    { result: "diamond_sword", ingredients: ["diamond:2", "stick:1"], craftingTable: true, priority: 'essential', unlockDay: 10 },
    { result: "enchanting_table", ingredients: ["diamond:2", "obsidian:4", "book:1"], craftingTable: true, priority: 'essential', unlockDay: 15 },
    
    // Nether
    { result: "flint_and_steel", ingredients: ["iron_ingot:1", "flint:1"], craftingTable: false, priority: 'essential', unlockDay: 5 },
    { result: "brewing_stand", ingredients: ["blaze_rod:1", "cobblestone:3"], craftingTable: true, priority: 'important', unlockDay: 20 },
    
    // End
    { result: "eye_of_ender", ingredients: ["ender_pearl:1", "blaze_powder:1"], craftingTable: false, priority: 'essential', unlockDay: 30 }
  ],

  // ==================== BIOMES ====================
  biomes: [
    {
      name: "Plains",
      resources: ["grass", "flowers", "oak_trees", "horses", "villages"],
      mobs: ["sheep", "cows", "pigs", "horses", "donkeys"],
      structures: ["village", "ruined_portal"],
      dangerLevel: 2,
      foodSources: ["wheat", "carrots", "potatoes", "beef", "porkchop"],
      shelterOptions: ["village_house", "hill_dugout", "simple_hut"]
    },
    {
      name: "Forest",
      resources: ["oak_wood", "birch_wood", "mushrooms", "flowers"],
      mobs: ["wolves", "rabbits", "sheep", "pigs"],
      structures: ["woodland_mansion_nearby"],
      dangerLevel: 3,
      foodSources: ["apples", "mushroom_stew", "rabbit"],
      shelterOptions: ["treehouse", "forest_cabin", "underground"]
    },
    {
      name: "Taiga",
      resources: ["spruce_wood", "ferns", "sweet_berries", "foxes"],
      mobs: ["wolves", "foxes", "rabbits"],
      structures: ["village", "pillager_outpost"],
      dangerLevel: 3,
      foodSources: ["sweet_berries", "rabbit", "wolf_meat"],
      shelterOptions: ["spruce_cabin", "snow_igloo_style"]
    },
    {
      name: "Desert",
      resources: ["sand", "sandstone", "cactus", "dead_bushes"],
      mobs: ["rabbits", "husks"],
      structures: ["desert_temple", "desert_well", "village"],
      dangerLevel: 5,
      foodSources: ["rabbit", "village_farms"],
      shelterOptions: ["desert_temple", "sandstone_house", "underground"]
    },
    {
      name: "Jungle",
      resources: ["jungle_wood", "cocoa_beans", "bamboo", "melons"],
      mobs: ["parrots", "ocelots", "pandas"],
      structures: ["jungle_temple"],
      dangerLevel: 4,
      foodSources: ["melons", "cocoa", "chicken"],
      shelterOptions: ["treehouse", "temple_base"]
    },
    {
      name: "Mountains",
      resources: ["stone", "emeralds", "coal", "iron", "goats"],
      mobs: ["goats", "llamas"],
      structures: ["pillager_outpost"],
      dangerLevel: 6,
      foodSources: ["goat", "llama"],
      shelterOptions: ["cave_base", "mountain_fortress"]
    },
    {
      name: "Swamp",
      resources: ["clay", "lily_pads", "slime", "blue_orchids"],
      mobs: ["slimes", "frogs", "witches"],
      structures: ["witch_hut"],
      dangerLevel: 5,
      foodSources: ["fish", "witch_drops"],
      shelterOptions: ["stilted_house", "floating_base"]
    },
    {
      name: "Ocean",
      resources: ["fish", "kelp", "sea_pickles", "prismarine"],
      mobs: ["dolphins", "turtles", "drowned", "guardians"],
      structures: ["ocean_monument", "shipwreck", "ocean_ruins"],
      dangerLevel: 7,
      foodSources: ["fish", "kelp", "turtle_eggs"],
      shelterOptions: ["underwater_base", "boat_house"]
    }
  ],

  // ==================== MOBS ====================
  mobs: [
    // Hostile
    {
      name: "Zombie",
      hostile: true,
      drops: ["rotten_flesh", "iron_ingot_rare", "carrot_rare", "potato_rare"],
      health: 20,
      damage: 3,
      spawnConditions: "Light level 0, night or dark caves",
      fightStrategy: "Circle strafe, sword attacks, keep distance",
      avoidStrategy: "Stay in lit areas, build 2-block high walls"
    },
    {
      name: "Skeleton",
      hostile: true,
      drops: ["bone", "arrow", "bow_rare"],
      health: 20,
      damage: 4,
      spawnConditions: "Light level 0, night or dark caves",
      fightStrategy: "Shield block arrows, close distance quickly, strafe",
      avoidStrategy: "Use cover, stay in lit areas"
    },
    {
      name: "Creeper",
      hostile: true,
      drops: ["gunpowder", "music_disc_if_skeleton_kills"],
      health: 20,
      damage: 49, // explosion
      spawnConditions: "Light level 0, any time",
      fightStrategy: "Hit and run, bow from distance, never let it explode",
      avoidStrategy: "Listen for hiss, always be aware of surroundings"
    },
    {
      name: "Spider",
      hostile: true,
      drops: ["string", "spider_eye"],
      health: 16,
      damage: 2,
      spawnConditions: "Light level 0, can climb walls",
      fightStrategy: "Easy to kill, watch for wall climbing",
      avoidStrategy: "2-block overhangs prevent climbing"
    },
    {
      name: "Enderman",
      hostile: true,
      drops: ["ender_pearl"],
      health: 40,
      damage: 7,
      spawnConditions: "Any light level, rare overworld, common in End",
      fightStrategy: "Hit legs, stand under 2-block ceiling, water nearby",
      avoidStrategy: "Never look at eyes, wear pumpkin head"
    },
    {
      name: "Blaze",
      hostile: true,
      drops: ["blaze_rod"],
      health: 20,
      damage: 6,
      spawnConditions: "Nether fortress only",
      fightStrategy: "Shield fireballs, snowballs deal 3 damage, fire resistance",
      avoidStrategy: "Stay out of fortress, or block line of sight"
    },
    {
      name: "Ghast",
      hostile: true,
      drops: ["ghast_tear", "gunpowder"],
      health: 10,
      damage: 17, // fireball explosion
      spawnConditions: "Nether, large open spaces",
      fightStrategy: "Reflect fireballs with any attack, bow is easiest",
      avoidStrategy: "Stay near walls, block line of sight"
    },
    // Passive/Neutral
    {
      name: "Cow",
      hostile: false,
      drops: ["beef", "leather"],
      health: 10,
      damage: 0,
      spawnConditions: "Grass blocks, light level 7+",
      fightStrategy: "Kill for food and leather",
      avoidStrategy: "N/A - friendly"
    },
    {
      name: "Sheep",
      hostile: false,
      drops: ["wool", "mutton"],
      health: 8,
      damage: 0,
      spawnConditions: "Grass blocks, light level 7+",
      fightStrategy: "Shear for wool, kill for mutton",
      avoidStrategy: "N/A - friendly"
    },
    {
      name: "Pig",
      hostile: false,
      drops: ["porkchop"],
      health: 10,
      damage: 0,
      spawnConditions: "Grass blocks, light level 7+",
      fightStrategy: "Kill for porkchop, best food source early",
      avoidStrategy: "N/A - friendly"
    },
    {
      name: "Chicken",
      hostile: false,
      drops: ["chicken", "feather"],
      health: 4,
      damage: 0,
      spawnConditions: "Grass blocks, light level 7+",
      fightStrategy: "Kill for food and feathers for arrows",
      avoidStrategy: "N/A - friendly"
    },
    {
      name: "Villager",
      hostile: false,
      drops: [],
      health: 20,
      damage: 0,
      spawnConditions: "Villages, bred by players",
      fightStrategy: "NEVER KILL - trade for valuable items",
      avoidStrategy: "Protect them!"
    }
  ],

  // ==================== STRUCTURES ====================
  structures: [
    {
      name: "Village",
      loot: ["wheat", "bread", "iron", "obsidian", "diamond_armor_rare"],
      dangers: ["zombie_siege", "pillager_raids"],
      findingTips: "Common in plains, desert, taiga. Look for lights at night.",
      worthExploring: true
    },
    {
      name: "Desert Temple",
      loot: ["diamond", "gold", "emerald", "enchanted_books", "horse_armor"],
      dangers: ["TNT_trap_in_floor"],
      findingTips: "Look for pyramid shape in desert biomes",
      worthExploring: true
    },
    {
      name: "Jungle Temple",
      loot: ["diamond", "gold", "emerald", "bamboo"],
      dangers: ["arrow_traps", "lever_puzzle"],
      findingTips: "Covered in vines in jungle biomes",
      worthExploring: true
    },
    {
      name: "Mineshaft",
      loot: ["rails", "chest_minecart", "enchanted_books", "diamond_ore_nearby"],
      dangers: ["cave_spider_spawners", "ravines", "getting_lost"],
      findingTips: "Underground, often in ravines or caves",
      worthExploring: true
    },
    {
      name: "Stronghold",
      loot: ["ender_pearls", "enchanted_books", "iron", "end_portal"],
      dangers: ["silverfish", "complex_layout"],
      findingTips: "Use Eye of Ender to locate, always underground",
      worthExploring: true
    },
    {
      name: "Nether Fortress",
      loot: ["blaze_rods", "nether_wart", "wither_skeleton_skulls", "saddles"],
      dangers: ["blazes", "wither_skeletons", "lava"],
      findingTips: "Travel along Z-axis in nether, look for dark brick structures",
      worthExploring: true
    },
    {
      name: "End City",
      loot: ["elytra", "shulker_shells", "dragon_head", "enchanted_gear"],
      dangers: ["shulkers", "void", "height"],
      findingTips: "Beyond outer end islands, use ender pearls or bridges",
      worthExploring: true
    },
    {
      name: "Ocean Monument",
      loot: ["sponge", "prismarine", "gold", "sea_lanterns"],
      dangers: ["guardians", "elder_guardians", "drowning", "mining_fatigue"],
      findingTips: "Deep ocean biomes, use water breathing potions",
      worthExploring: true
    }
  ],

  // ==================== ENCHANTMENTS ====================
  enchantments: [
    { name: "Mending", maxLevel: 1, appliesTo: ["all"], priority: 10, description: "XP repairs item - BEST enchant" },
    { name: "Unbreaking", maxLevel: 3, appliesTo: ["all"], priority: 9, description: "Increases durability" },
    { name: "Efficiency", maxLevel: 5, appliesTo: ["pickaxe", "axe", "shovel"], priority: 8, description: "Faster mining" },
    { name: "Fortune", maxLevel: 3, appliesTo: ["pickaxe"], priority: 9, description: "More drops from ores" },
    { name: "Silk Touch", maxLevel: 1, appliesTo: ["pickaxe"], priority: 7, description: "Pick up blocks directly" },
    { name: "Sharpness", maxLevel: 5, appliesTo: ["sword", "axe"], priority: 8, description: "More damage" },
    { name: "Looting", maxLevel: 3, appliesTo: ["sword"], priority: 8, description: "More mob drops" },
    { name: "Fire Aspect", maxLevel: 2, appliesTo: ["sword"], priority: 6, description: "Sets mobs on fire" },
    { name: "Protection", maxLevel: 4, appliesTo: ["armor"], priority: 8, description: "Reduces all damage" },
    { name: "Feather Falling", maxLevel: 4, appliesTo: ["boots"], priority: 7, description: "Reduces fall damage" },
    { name: "Depth Strider", maxLevel: 3, appliesTo: ["boots"], priority: 6, description: "Faster underwater movement" },
    { name: "Respiration", maxLevel: 3, appliesTo: ["helmet"], priority: 6, description: "Longer underwater breathing" },
    { name: "Power", maxLevel: 5, appliesTo: ["bow"], priority: 8, description: "More arrow damage" },
    { name: "Infinity", maxLevel: 1, appliesTo: ["bow"], priority: 7, description: "Infinite arrows with 1 arrow" },
    { name: "Flame", maxLevel: 1, appliesTo: ["bow"], priority: 5, description: "Flaming arrows" }
  ],

  // ==================== POTIONS ====================
  potions: [
    { name: "Healing", ingredients: ["nether_wart", "glistering_melon"], duration: 0, useCase: "Instant health restore" },
    { name: "Regeneration", ingredients: ["nether_wart", "ghast_tear"], duration: 45, useCase: "Continuous healing" },
    { name: "Strength", ingredients: ["nether_wart", "blaze_powder"], duration: 180, useCase: "Combat boost" },
    { name: "Speed", ingredients: ["nether_wart", "sugar"], duration: 180, useCase: "Travel and escape" },
    { name: "Fire Resistance", ingredients: ["nether_wart", "magma_cream"], duration: 180, useCase: "Nether survival, lava" },
    { name: "Night Vision", ingredients: ["nether_wart", "golden_carrot"], duration: 180, useCase: "Cave exploration" },
    { name: "Water Breathing", ingredients: ["nether_wart", "pufferfish"], duration: 180, useCase: "Ocean exploration" },
    { name: "Invisibility", ingredients: ["night_vision", "fermented_spider_eye"], duration: 180, useCase: "Mob avoidance" },
    { name: "Slow Falling", ingredients: ["nether_wart", "phantom_membrane"], duration: 90, useCase: "End exploration, safety" }
  ],

  // ==================== FARMING TECHNIQUES ====================
  farmingTechniques: [
    {
      name: "Basic Wheat Farm",
      type: 'crop',
      resources: ["hoe", "water_bucket", "wheat_seeds"],
      output: ["wheat", "wheat_seeds"],
      efficiency: 3,
      difficulty: 'easy'
    },
    {
      name: "Automatic Crop Farm",
      type: 'automatic',
      resources: ["water", "hopper", "chest", "villager"],
      output: ["wheat", "carrots", "potatoes", "beetroot"],
      efficiency: 9,
      difficulty: 'medium'
    },
    {
      name: "Cow/Pig Breeder",
      type: 'animal',
      resources: ["fence", "wheat", "carrots"],
      output: ["beef", "leather", "porkchop"],
      efficiency: 5,
      difficulty: 'easy'
    },
    {
      name: "Chicken Farm",
      type: 'animal',
      resources: ["hopper", "chest", "lava", "glass"],
      output: ["chicken", "feather", "eggs"],
      efficiency: 8,
      difficulty: 'medium'
    },
    {
      name: "Iron Golem Farm",
      type: 'mob',
      resources: ["villagers:3", "beds:3", "zombie", "water", "lava"],
      output: ["iron_ingot", "poppy"],
      efficiency: 10,
      difficulty: 'hard'
    },
    {
      name: "Mob Spawner XP Farm",
      type: 'mob',
      resources: ["spawner", "water", "hoppers", "chest"],
      output: ["xp", "mob_drops"],
      efficiency: 8,
      difficulty: 'medium'
    },
    {
      name: "Enderman Farm",
      type: 'mob',
      resources: ["endermite", "minecart", "rails", "trapdoors"],
      output: ["ender_pearl", "xp"],
      efficiency: 10,
      difficulty: 'hard'
    },
    {
      name: "Tree Farm",
      type: 'tree',
      resources: ["saplings", "bone_meal", "axe"],
      output: ["logs", "saplings", "apples"],
      efficiency: 6,
      difficulty: 'easy'
    },
    {
      name: "Sugar Cane Farm",
      type: 'automatic',
      resources: ["sugar_cane", "water", "pistons", "observer"],
      output: ["sugar_cane"],
      efficiency: 9,
      difficulty: 'medium'
    }
  ],

  // ==================== SURVIVAL TIPS ====================
  survivalTips: [
    { situation: "First night no shelter", solution: "Dig 3 blocks down, place block above, wait till morning", priority: 10 },
    { situation: "Low health no food", solution: "Kill passive mobs, eat rotten flesh as last resort (hunger effect)", priority: 9 },
    { situation: "Lost in cave", solution: "Place torches on right wall going in, follow left wall to exit", priority: 8 },
    { situation: "Creeper approaching", solution: "Sprint away, or hit once and back up, repeat", priority: 10 },
    { situation: "Skeleton shooting", solution: "Strafe left/right while approaching, use shield", priority: 9 },
    { situation: "Fell in lava", solution: "Swim up immediately, drink fire resistance if available", priority: 10 },
    { situation: "Enderman aggro", solution: "Find water or 2-block ceiling, attack legs", priority: 8 },
    { situation: "No bed first night", solution: "Build 1x1 tower 20+ blocks high, mobs can't reach", priority: 7 },
    { situation: "Hunger depleting", solution: "Golden apples or steak give best saturation", priority: 6 },
    { situation: "Mining diamonds", solution: "Always mine around diamond ore first to check for lava", priority: 9 },
    { situation: "Nether portal spawn bad", solution: "Build obsidian shelter immediately around portal", priority: 8 },
    { situation: "Fighting blaze", solution: "Use snowballs (3 damage each) or arrows with shield", priority: 7 },
    { situation: "Dragon fight", solution: "Destroy crystals first, beds do massive damage", priority: 10 },
    { situation: "Shulker attack", solution: "Shield blocks bullets, eat chorus fruit if levitating", priority: 7 }
  ],

  // ==================== BUILDING PATTERNS ====================
  buildingPatterns: [
    {
      name: "Emergency Shelter",
      purpose: "First night survival",
      materials: ["dirt:20", "door:1"],
      dimensions: "3x3x2",
      complexity: 1
    },
    {
      name: "Starter House",
      purpose: "Early game base",
      materials: ["oak_planks:64", "cobblestone:32", "glass:16", "door:1", "torch:8"],
      dimensions: "7x7x4",
      complexity: 2
    },
    {
      name: "Farm Hut",
      purpose: "Food production center",
      materials: ["oak_planks:48", "fence:16", "water_bucket:1", "hoe:1"],
      dimensions: "9x9x3",
      complexity: 2
    },
    {
      name: "Storage Building",
      purpose: "Organized item storage",
      materials: ["oak_planks:128", "chest:27", "signs:27", "torch:16"],
      dimensions: "9x5x4",
      complexity: 3
    },
    {
      name: "Enchanting Room",
      purpose: "Enchanting setup",
      materials: ["obsidian:4", "diamond:2", "book:1", "bookshelf:15", "torch:4"],
      dimensions: "5x5x3",
      complexity: 4
    },
    {
      name: "Nether Portal Room",
      purpose: "Safe nether access",
      materials: ["obsidian:10", "cobblestone:64", "torch:8", "chest:2"],
      dimensions: "5x5x5",
      complexity: 3
    },
    {
      name: "Mob Grinder Tower",
      purpose: "XP and mob drops",
      materials: ["cobblestone:256", "water_bucket:2", "hopper:8", "chest:4"],
      dimensions: "9x9x24",
      complexity: 5
    },
    {
      name: "Villager Trading Hall",
      purpose: "Efficient trading",
      materials: ["oak_planks:128", "beds:12", "workstations:12", "fence:24"],
      dimensions: "15x9x4",
      complexity: 6
    }
  ],

  // ==================== REDSTONE BASICS ====================
  redstoneBasics: [
    {
      concept: "Basic Circuit",
      components: ["redstone_dust", "lever", "lamp"],
      useCase: "Lighting systems",
      difficulty: 1
    },
    {
      concept: "Piston Door",
      components: ["sticky_piston:2", "redstone_dust", "button"],
      useCase: "Hidden entrances",
      difficulty: 3
    },
    {
      concept: "Observer Clock",
      components: ["observer:2", "redstone_dust"],
      useCase: "Automatic farms",
      difficulty: 2
    },
    {
      concept: "Hopper System",
      components: ["hopper", "chest", "comparator"],
      useCase: "Item sorting",
      difficulty: 4
    },
    {
      concept: "T Flip-Flop",
      components: ["dropper:2", "hopper:2", "comparator", "redstone_dust"],
      useCase: "Toggle switches",
      difficulty: 5
    }
  ],

  // ==================== SPEEDRUN STRATEGIES ====================
  speedrunStrategies: [
    {
      phase: "Overworld",
      actions: [
        "Get wood immediately",
        "Craft wooden pickaxe",
        "Mine 3 stone for stone pickaxe",
        "Find village or shipwreck for food/iron",
        "Get 10+ iron for bucket, flint&steel",
        "Create nether portal with bucket casting"
      ],
      timeGoal: 10,
      risks: ["bad_spawn", "no_village", "death"]
    },
    {
      phase: "Nether",
      actions: [
        "Find fortress immediately",
        "Kill 7+ blazes for rods",
        "Trade with piglins for pearls",
        "Get 12+ ender pearls",
        "Return to overworld"
      ],
      timeGoal: 8,
      risks: ["ghasts", "lava", "no_fortress"]
    },
    {
      phase: "Stronghold",
      actions: [
        "Craft eyes of ender",
        "Throw eyes to locate",
        "Dig down to stronghold",
        "Find portal room",
        "Fill portal, enter End"
      ],
      timeGoal: 3,
      risks: ["bad_eye_luck", "silverfish"]
    },
    {
      phase: "End Fight",
      actions: [
        "Destroy end crystals with beds",
        "Hit dragon when perched",
        "Use beds for damage",
        "Collect dragon egg",
        "Victory!"
      ],
      timeGoal: 5,
      risks: ["dragon_knockback", "void_death", "crystal_explosion"]
    }
  ],

  // ==================== DIMENSIONS ====================
  dimensionKnowledge: [
    {
      name: "Overworld",
      accessRequirements: ["spawn_here"],
      uniqueResources: ["diamond", "emerald", "lapis", "all_ores"],
      bosses: [],
      survivalTips: [
        "Light up areas to prevent spawns",
        "Sleep to skip night and phantoms",
        "Always carry food and tools"
      ]
    },
    {
      name: "Nether",
      accessRequirements: ["obsidian:10", "flint_and_steel"],
      uniqueResources: ["netherite", "blaze_rod", "ghast_tear", "nether_wart", "quartz"],
      bosses: ["wither"],
      survivalTips: [
        "Bring fire resistance potions",
        "Gold armor prevents piglin aggro",
        "Build bridges carefully over lava",
        "Mark your portal location",
        "Beds explode - use for combat only"
      ]
    },
    {
      name: "The End",
      accessRequirements: ["eyes_of_ender:12", "find_stronghold"],
      uniqueResources: ["elytra", "shulker_shell", "end_stone", "chorus_fruit", "dragon_egg"],
      bosses: ["ender_dragon"],
      survivalTips: [
        "Bring slow falling potions",
        "Water bucket for emergencies",
        "Ender chest for safety",
        "Pumpkin head prevents endermen",
        "Bridge carefully - void is death"
      ]
    }
  ]
};

// ============================================================
// KNOWLEDGE QUERY FUNCTIONS
// ============================================================

export function getPhaseForDay(day: number): GamePhase {
  return MINECRAFT_KNOWLEDGE.gamePhases.find(p => 
    day >= p.dayRange[0] && day <= p.dayRange[1]
  ) || MINECRAFT_KNOWLEDGE.gamePhases[0];
}

export function getEssentialRecipesForDay(day: number): CraftingRecipe[] {
  return MINECRAFT_KNOWLEDGE.recipes.filter(r => 
    r.unlockDay <= day && (r.priority === 'essential' || r.priority === 'important')
  );
}

export function getMobStrategy(mobName: string): MobInfo | undefined {
  return MINECRAFT_KNOWLEDGE.mobs.find(m => 
    m.name.toLowerCase() === mobName.toLowerCase()
  );
}

export function getBiomeInfo(biomeName: string): BiomeInfo | undefined {
  return MINECRAFT_KNOWLEDGE.biomes.find(b => 
    b.name.toLowerCase().includes(biomeName.toLowerCase())
  );
}

export function getSurvivalTip(situation: string): SurvivalTip | undefined {
  return MINECRAFT_KNOWLEDGE.survivalTips.find(t =>
    t.situation.toLowerCase().includes(situation.toLowerCase())
  );
}

export function getEnchantmentPriority(): EnchantmentInfo[] {
  return [...MINECRAFT_KNOWLEDGE.enchantments].sort((a, b) => b.priority - a.priority);
}

export function getStructureLoot(structureName: string): StructureInfo | undefined {
  return MINECRAFT_KNOWLEDGE.structures.find(s =>
    s.name.toLowerCase().includes(structureName.toLowerCase())
  );
}

export function getFarmingGuide(type: string): FarmingTechnique[] {
  return MINECRAFT_KNOWLEDGE.farmingTechniques.filter(f =>
    f.type === type || f.name.toLowerCase().includes(type.toLowerCase())
  );
}

console.log("📚 Minecraft 1.20.1 Knowledge Base loaded!");
console.log(`   - ${MINECRAFT_KNOWLEDGE.gamePhases.length} Game Phases`);
console.log(`   - ${MINECRAFT_KNOWLEDGE.recipes.length} Recipes`);
console.log(`   - ${MINECRAFT_KNOWLEDGE.biomes.length} Biomes`);
console.log(`   - ${MINECRAFT_KNOWLEDGE.mobs.length} Mobs`);
console.log(`   - ${MINECRAFT_KNOWLEDGE.structures.length} Structures`);
console.log(`   - ${MINECRAFT_KNOWLEDGE.enchantments.length} Enchantments`);
console.log(`   - ${MINECRAFT_KNOWLEDGE.survivalTips.length} Survival Tips`);
