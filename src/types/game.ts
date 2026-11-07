export type GameState = 
  | 'TITLE'
  | 'CHARACTER_SELECT'
  | 'PLAYING'
  | 'PAUSED'
  | 'VICTORY'
  | 'GAME_OVER';

export type CharacterType = 'snake' | 'pacman';

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'NONE';

export interface GridPos {
  x: number; // grid col (0 .. cols-1)
  y: number; // grid row (0 .. rows-1)
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface SnakeSegment {
  x: number;
  y: number;
  dir: Direction;
}

export type GhostType = 'blinky' | 'pinky' | 'inky' | 'clyde';
export type GhostState = 'HOUSE' | 'CHASE' | 'SCATTER' | 'FRIGHTENED' | 'EATEN';

export interface Ghost {
  id: GhostType;
  name: string;
  color: string;
  x: number; // float coordinate in tile units
  y: number;
  gridX: number;
  gridY: number;
  dir: Direction;
  targetDir: Direction;
  state: GhostState;
  speed: number;
  frightenedTimer: number;
  homeCorner: GridPos;
  houseTimer: number; // delay before releasing
}

export interface RivalNPC {
  x: number;
  y: number;
  gridX: number;
  gridY: number;
  dir: Direction;
  targetDir: Direction;
  speed: number;
  score: number;
  isFrozen: boolean;
  freezeTimer: number;
  targetPos: GridPos | null;
  path: GridPos[];
  repathTimer: number;
  pelletsEaten: number;
  mouthOpen: boolean;
  speedBoostTimer?: number;
  powerFrenzyTimer?: number;
}

export type ItemType = 'pellet' | 'power_pellet' | 'cherry' | 'apple' | 'strawberry' | 'speed_shoe' | 'hourglass';

export interface MazeItem {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  points: number;
  collectedBy: 'player' | 'rival' | null;
  pulsePhase?: number;
  respawnTimer?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface ScorePopup {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  life: number;
}

export interface GameLevelConfig {
  levelNumber: number;
  name: string;
  targetScoreRatio: number; // player must score at least this proportion or exceed rival
  ghostSpeed: number;
  rivalSpeed: number;
  playerSpeed: number;
  timeLimitSec: number;
}
