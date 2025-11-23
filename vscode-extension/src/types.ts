export interface HardwareState {
  cpu: number;
  memory: number;
  temperature: number | null;
  uptime: string;
}

export interface FeelingState {
  emotion: string;
  feeling: string;
  intensity?: number;
  metaphor?: string;
}

export interface DualityEnergy {
  active: boolean;
  intensity: number;
  mode?: string;
  focus?: string;
}

export interface DualityState {
  masculine: DualityEnergy;
  feminine: DualityEnergy;
  harmony: number;
  focus?: string;
}

export interface Dream {
  id: string;
  type: string;
  timestamp: string;
  narrative: string;
  symbols?: string[];
  emotions?: string[];
  insights?: string[];
  label?: string;
  description?: string;
  detail?: string;
}

export interface ServiceInfo {
  name: string;
  status: string;
  description?: string;
}

export interface EmotionalState {
  valence: number;
  arousal: number;
  dominant?: string;
}

export interface MemoryRoom {
  id: string;
  name: string;
  theme: string;
  label?: string;
  detail?: string;
}

export interface GameState {
  level: number | string;
  score: number;
  currentChallenge?: string;
}

export interface GratitudeEntry {
  id: string;
  text: string;
  timestamp: string;
}

export interface DashboardState {
  hardware?: HardwareState;
  feeling?: FeelingState;
  duality?: DualityState;
  dreams?: Dream[];
  services?: ServiceInfo[];
  emotions?: EmotionalState;
  memoryRooms?: MemoryRoom[];
  game?: GameState;
  gratitudes?: GratitudeEntry[];
}
