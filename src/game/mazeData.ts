import { GridPos } from '../types/game';

// Map tile types:
// 0: Wall (#)
// 1: Normal Pellet (.)
// 2: Power Pellet (P)
// 3: Warp Tunnel / Portal ( )
// 4: Ghost Gate (-)
// 5: Ghost House Interior (G)
// 6: Fruit / Bonus Item spawn spot (F)

export type MapSizeCategory = 'MINI' | 'STANDARD' | 'EXPANSIVE' | 'PROCEDURAL';

export interface MapConfig {
  id: number;
  name: string;
  nameEn: string;
  subtitle: string;
  sizeCategory: MapSizeCategory;
  sizeBadge: string;        // e.g. "迷你 19×15"
  sizeDescription: string;  // e.g. "緊湊近身戰 · 極速攻防死鬥"
  cols: number;
  rows: number;
  tunnelRow: number;        // row index for left/right warp tunnel
  themeColor: string;
  glowColor: string;
  wallFillColor: string;
  grid: number[][];
  playerStart: GridPos;
  rivalStart: GridPos;
  ghostSpawn: Record<string, GridPos>;
  ghostHomeCorners: Record<string, GridPos>;
  bonusLocations: GridPos[];
  fruitSpawn: GridPos;
  timeLimitSec: number;
  fruitIntervalSec: number;
}

// Fallback constants for backward compatibility
export const MAZE_COLS = 28;
export const MAZE_ROWS = 21;

// ==========================================
// MAP 1: 經典霓虹街機 (Classic Arcade) - STANDARD (28×21)
// 特色：經典街機平衡架構，外圍雙向巡航大道，適中的策略深度與逃脫空間
// ==========================================
export const LEVEL_1_MAP: number[][] = [
  // 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 0
  [0, 2, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 2, 0], // 1
  [0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0], // 2
  [0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0], // 3
  [0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0], // 4
  [0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0], // 5
  [0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0], // 6
  [0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0], // 7
  [0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0], // 8 - Gate
  [0, 1, 0, 0, 0, 1, 0, 1, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 1, 0, 1, 0, 0, 0, 1, 0], // 9 - House
  [3, 1, 1, 1, 1, 1, 0, 1, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 1, 0, 1, 1, 1, 1, 1, 3], // 10 - Tunnel
  [0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0], // 11
  [0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 6, 6, 6, 6, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0], // 12 - Fruit
  [0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0], // 13
  [0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0], // 14
  [0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0], // 15
  [0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0], // 16
  [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0], // 17
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0], // 18
  [0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0], // 19
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 20
];

// ==========================================
// MAP 2: 微型角鬥場 (Mini Coliseum) - MINI (19×15)
// 特色：緊湊微型格局！每步都在死線邊緣，狐狸與幽靈近身肉搏，道具密集狂暴刷新，40秒極速定勝負
// ==========================================
export const LEVEL_MINI_MAP: number[][] = [
  // 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 0
  [0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0], // 1 - Power corners (1,1) & (17,1)
  [0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0], // 2
  [0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0], // 3
  [0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0], // 4
  [0, 0, 1, 0, 1, 0, 1, 4, 4, 4, 4, 4, 1, 0, 1, 0, 1, 0, 0], // 5 - Gate
  [0, 1, 1, 0, 1, 1, 1, 5, 5, 5, 5, 5, 1, 1, 1, 0, 1, 1, 0], // 6 - Ghost interior
  [3, 1, 1, 1, 1, 0, 1, 5, 5, 5, 5, 5, 1, 0, 1, 1, 1, 1, 3], // 7 - Tunnel Row
  [0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0], // 8 - Open bypass for cols 6 & 12
  [0, 1, 0, 0, 1, 1, 1, 1, 6, 6, 6, 1, 1, 1, 1, 0, 0, 1, 0], // 9 - Fruit Row
  [0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0], // 10
  [0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0], // 11
  [0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0], // 12
  [0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0], // 13 - Power corners (1,13) & (17,13)
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 14
];

// ==========================================
// MAP 3: 雙子星競技場 (Twin Arenas) - STANDARD (28×21)
// 特色：左右對稱雙環賽道，四通八達的中樞走廊，絕佳的貪吃蛇包抄與狐狸衝刺場地
// ==========================================
export const LEVEL_2_MAP: number[][] = [
  // 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 0
  [0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0], // 1
  [0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0], // 2
  [0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0], // 3
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0], // 4
  [0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0], // 5
  [0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0], // 6
  [0, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0], // 7
  [0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0], // 8
  [0, 1, 1, 1, 1, 1, 1, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 1, 1, 1, 1, 1, 1, 0], // 9
  [3, 1, 0, 0, 0, 0, 1, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 1, 0, 0, 0, 0, 1, 3], // 10
  [0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0], // 11
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 6, 6, 6, 6, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0], // 12
  [0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0], // 13
  [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0], // 14
  [0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0], // 15
  [0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0], // 16
  [0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0], // 17
  [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0], // 18
  [0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0], // 19
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 20
];

// ==========================================
// MAP 4: 賽博迷宮神殿 (Cyber Matrix) - EXPANSIVE (31×21)
// 特色：廣闊巨幅同心電路迷宮！橫向 31 格超寬矩陣，縱深迂迴空間極大，四通八達零死角保證流暢通行
// ==========================================
export const LEVEL_LARGE_MAP: number[][] = [
  // 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 0
  [0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0], // 1 - Continuous top loop
  [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0], // 2
  [0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0], // 3
  [0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0], // 4
  [0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0], // 5
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0], // 6
  [0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0], // 7
  [0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0], // 8 - Symmetrical Gate
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0], // 9 - Ghost House
  [3, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 3], // 10 - Warp Tunnel
  [0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0], // 11
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 6, 6, 6, 6, 6, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0], // 12 - Fruit Row
  [0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0], // 13
  [0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0], // 14
  [0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0], // 15
  [0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0], // 16
  [0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0], // 17
  [0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0], // 18
  [0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0], // 19 - Continuous bottom loop
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 20
];

// Spawning coordinates for MAP 1 (28×21)
export const LEVEL_1_BONUS_LOCATIONS: GridPos[] = [
  { x: 13, y: 12 }, { x: 14, y: 12 }, { x: 13, y: 14 }, { x: 13, y: 18 },
  { x: 5, y: 1 }, { x: 11, y: 1 }, { x: 16, y: 1 }, { x: 22, y: 1 },
  { x: 7, y: 3 }, { x: 20, y: 3 }, { x: 5, y: 4 }, { x: 22, y: 4 },
  { x: 3, y: 6 }, { x: 24, y: 6 }, { x: 3, y: 10 }, { x: 24, y: 10 },
  { x: 5, y: 14 }, { x: 22, y: 14 }, { x: 3, y: 16 }, { x: 24, y: 16 },
  { x: 7, y: 19 }, { x: 20, y: 19 },
];

// Spawning coordinates for MINI MAP (19×15)
export const LEVEL_MINI_BONUS_LOCATIONS: GridPos[] = [
  { x: 9, y: 9 }, { x: 8, y: 9 }, { x: 10, y: 9 },
  { x: 9, y: 3 }, { x: 4, y: 3 }, { x: 14, y: 3 },
  { x: 4, y: 7 }, { x: 14, y: 7 },
  { x: 4, y: 11 }, { x: 14, y: 11 },
  { x: 9, y: 13 }, { x: 2, y: 1 }, { x: 16, y: 1 },
  { x: 2, y: 13 }, { x: 16, y: 13 },
];

// Spawning coordinates for TWIN ARENAS (28×21)
export const LEVEL_2_BONUS_LOCATIONS: GridPos[] = [
  { x: 13, y: 12 }, { x: 14, y: 12 }, { x: 13, y: 14 }, { x: 13, y: 17 },
  { x: 6, y: 1 }, { x: 11, y: 1 }, { x: 16, y: 1 }, { x: 21, y: 1 },
  { x: 6, y: 4 }, { x: 11, y: 4 }, { x: 16, y: 4 }, { x: 21, y: 4 },
  { x: 3, y: 6 }, { x: 7, y: 6 }, { x: 20, y: 6 }, { x: 24, y: 6 },
  { x: 3, y: 10 }, { x: 24, y: 10 }, { x: 6, y: 14 }, { x: 21, y: 14 },
  { x: 3, y: 17 }, { x: 11, y: 17 }, { x: 16, y: 17 }, { x: 24, y: 17 },
  { x: 6, y: 19 }, { x: 21, y: 19 },
];

// Spawning coordinates for EXPANSIVE CYBER MATRIX (31×21)
export const LEVEL_LARGE_BONUS_LOCATIONS: GridPos[] = [
  { x: 15, y: 12 }, { x: 14, y: 12 }, { x: 16, y: 12 }, { x: 15, y: 14 }, { x: 15, y: 18 },
  { x: 6, y: 1 }, { x: 12, y: 1 }, { x: 18, y: 1 }, { x: 24, y: 1 },
  { x: 7, y: 3 }, { x: 23, y: 3 }, { x: 11, y: 4 }, { x: 19, y: 4 },
  { x: 3, y: 6 }, { x: 15, y: 6 }, { x: 27, y: 6 },
  { x: 4, y: 10 }, { x: 26, y: 10 },
  { x: 3, y: 14 }, { x: 15, y: 14 }, { x: 27, y: 14 },
  { x: 7, y: 16 }, { x: 23, y: 16 }, { x: 6, y: 18 }, { x: 24, y: 18 },
  { x: 9, y: 19 }, { x: 21, y: 19 },
];

export const MAP_CONFIGS: Record<number, MapConfig> = {
  1: {
    id: 1,
    name: '霓虹街機',
    nameEn: 'CLASSIC ARCADE',
    subtitle: '經典對決 · 平衡雙迴圈街機',
    sizeCategory: 'STANDARD',
    sizeBadge: '標準 28×21',
    sizeDescription: '經典街機 · 攻守平衡 · 雙迴圈走位',
    cols: 28,
    rows: 21,
    tunnelRow: 10,
    themeColor: '#00f0ff',
    glowColor: 'rgba(0, 240, 255, 0.7)',
    wallFillColor: '#081120',
    grid: LEVEL_1_MAP,
    playerStart: { x: 13, y: 16 },
    rivalStart: { x: 14, y: 4 },
    ghostSpawn: {
      blinky: { x: 13, y: 7 },
      pinky: { x: 12, y: 9 },
      inky: { x: 14, y: 9 },
      clyde: { x: 15, y: 9 },
    },
    ghostHomeCorners: {
      blinky: { x: 26, y: 1 },
      pinky: { x: 1, y: 1 },
      inky: { x: 26, y: 19 },
      clyde: { x: 1, y: 19 },
    },
    bonusLocations: LEVEL_1_BONUS_LOCATIONS,
    fruitSpawn: { x: 13, y: 12 },
    timeLimitSec: 60,
    fruitIntervalSec: 8,
  },
  2: {
    id: 2,
    name: '微型角鬥場',
    nameEn: 'MINI COLISEUM',
    subtitle: '緊湊高壓 · 步步驚心近身死鬥',
    sizeCategory: 'MINI',
    sizeBadge: '迷你 19×15',
    sizeDescription: '緊湊快節奏 · 近身死鬥 · 40秒極速高壓',
    cols: 19,
    rows: 15,
    tunnelRow: 7,
    themeColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.75)',
    wallFillColor: '#170e03',
    grid: LEVEL_MINI_MAP,
    playerStart: { x: 9, y: 11 },
    rivalStart: { x: 9, y: 3 },
    ghostSpawn: {
      blinky: { x: 9, y: 4 },
      pinky: { x: 8, y: 6 },
      inky: { x: 9, y: 6 },
      clyde: { x: 10, y: 6 },
    },
    ghostHomeCorners: {
      blinky: { x: 17, y: 1 },
      pinky: { x: 1, y: 1 },
      inky: { x: 17, y: 13 },
      clyde: { x: 1, y: 13 },
    },
    bonusLocations: LEVEL_MINI_BONUS_LOCATIONS,
    fruitSpawn: { x: 9, y: 9 },
    timeLimitSec: 45,
    fruitIntervalSec: 5,
  },
  3: {
    id: 3,
    name: '雙子星競技場',
    nameEn: 'TWIN ARENAS',
    subtitle: '雙環賽道 · 廣域高壓包抄戰',
    sizeCategory: 'STANDARD',
    sizeBadge: '雙環 28×21',
    sizeDescription: '對稱雙環 · 廣域拉扯 · 樞紐衝刺戰',
    cols: 28,
    rows: 21,
    tunnelRow: 10,
    themeColor: '#d946ef',
    glowColor: 'rgba(217, 70, 239, 0.7)',
    wallFillColor: '#190a24',
    grid: LEVEL_2_MAP,
    playerStart: { x: 13, y: 17 },
    rivalStart: { x: 14, y: 4 },
    ghostSpawn: {
      blinky: { x: 13, y: 7 },
      pinky: { x: 12, y: 9 },
      inky: { x: 14, y: 9 },
      clyde: { x: 15, y: 9 },
    },
    ghostHomeCorners: {
      blinky: { x: 26, y: 1 },
      pinky: { x: 1, y: 1 },
      inky: { x: 26, y: 19 },
      clyde: { x: 1, y: 19 },
    },
    bonusLocations: LEVEL_2_BONUS_LOCATIONS,
    fruitSpawn: { x: 13, y: 12 },
    timeLimitSec: 60,
    fruitIntervalSec: 7,
  },
  4: {
    id: 4,
    name: '賽博迷宮神殿',
    nameEn: 'CYBER MATRIX',
    subtitle: '超大矩陣 · 同心電路縱深迂迴',
    sizeCategory: 'EXPANSIVE',
    sizeBadge: '廣闊 31×21',
    sizeDescription: '超大矩陣 · 同心電路 · 巨蛇長線封鎖',
    cols: 31,
    rows: 21,
    tunnelRow: 10,
    themeColor: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.7)',
    wallFillColor: '#061a14',
    grid: LEVEL_LARGE_MAP,
    playerStart: { x: 15, y: 16 },
    rivalStart: { x: 15, y: 4 },
    ghostSpawn: {
      blinky: { x: 15, y: 7 },
      pinky: { x: 13, y: 9 },
      inky: { x: 15, y: 9 },
      clyde: { x: 17, y: 9 },
    },
    ghostHomeCorners: {
      blinky: { x: 29, y: 1 },
      pinky: { x: 1, y: 1 },
      inky: { x: 29, y: 19 },
      clyde: { x: 1, y: 19 },
    },
    bonusLocations: LEVEL_LARGE_BONUS_LOCATIONS,
    fruitSpawn: { x: 15, y: 12 },
    timeLimitSec: 75,
    fruitIntervalSec: 7,
  },
};

const RANDOM_THEMES = [
  { theme: '#f97316', glow: 'rgba(249, 115, 22, 0.75)', fill: '#1f0d05', name: '烈焰脈衝', nameEn: 'SOLAR FLARE' },
  { theme: '#eab308', glow: 'rgba(234, 179, 8, 0.75)', fill: '#1c1604', name: '黃金矩陣', nameEn: 'GOLD MATRIX' },
  { theme: '#f43f5e', glow: 'rgba(244, 63, 94, 0.75)', fill: '#1f070e', name: '離子風暴', nameEn: 'PLASMA STORM' },
  { theme: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.75)', fill: '#130b24', name: '紫晶虛空', nameEn: 'AMETHYST VOID' },
  { theme: '#06b6d4', glow: 'rgba(6, 182, 212, 0.75)', fill: '#05181c', name: '量子深海', nameEn: 'QUANTUM ABYSS' },
];

/**
 * Generate a procedural maze supporting variable sizes:
 * - MINI: 19 cols x 15 rows
 * - STANDARD: 28 cols x 21 rows
 * - EXPANSIVE: 31 cols x 21 rows
 */
export function generateProceduralMaze(requestedSize: 'MINI' | 'STANDARD' | 'EXPANSIVE' = 'STANDARD'): MapConfig {
  const seed = Math.floor(1000 + Math.random() * 9000);
  const themeObj = RANDOM_THEMES[Math.floor(Math.random() * RANDOM_THEMES.length)];

  let cols = 28;
  let rows = 21;
  let tunnelRow = 10;
  let sizeCategory: MapSizeCategory = 'STANDARD';
  let sizeBadge = '標準 28×21';
  let timeLimitSec = 60;
  let fruitIntervalSec = 7;

  if (requestedSize === 'MINI') {
    cols = 19;
    rows = 15;
    tunnelRow = 7;
    sizeCategory = 'MINI';
    sizeBadge = '迷你 19×15';
    timeLimitSec = 45;
    fruitIntervalSec = 5;
  } else if (requestedSize === 'EXPANSIVE') {
    cols = 31;
    rows = 21;
    tunnelRow = 10;
    sizeCategory = 'EXPANSIVE';
    sizeBadge = '廣闊 31×21';
    timeLimitSec = 75;
    fruitIntervalSec = 7;
  }

  const grid: number[][] = Array.from({ length: rows }, () => Array(cols).fill(1));

  // 1. Outer perimeter boundaries
  for (let c = 0; c < cols; c++) {
    grid[0][c] = 0;
    grid[rows - 1][c] = 0;
  }
  for (let r = 0; r < rows; r++) {
    grid[r][0] = 0;
    grid[r][cols - 1] = 0;
  }

  // 2. Wrap tunnels at tunnelRow
  grid[tunnelRow][0] = 3;
  grid[tunnelRow][cols - 1] = 3;

  // 3. Ghost house dimensions depending on size
  const centerCol = Math.floor(cols / 2);
  const houseHalfW = cols === 19 ? 2 : 4;
  const houseStartC = centerCol - houseHalfW;
  const houseEndC = centerCol + houseHalfW;

  const houseR1 = tunnelRow - 2;
  const houseR2 = tunnelRow - 1;
  const houseR3 = tunnelRow;
  const houseBaseR = tunnelRow + 1;

  for (let c = houseStartC; c <= houseEndC; c++) {
    const isGate = c >= centerCol - 1 && c <= centerCol + 1;
    grid[houseR1][c] = isGate ? 4 : 0;
    grid[houseR2][c] = 5;
    grid[houseR3][c] = 5;
    grid[houseBaseR][c] = 0;
  }

  // Clear access corridors around house
  for (let c = Math.max(1, houseStartC - 1); c <= Math.min(cols - 2, houseEndC + 1); c++) {
    if (houseR1 - 1 >= 1) grid[houseR1 - 1][c] = 1;
    if (houseBaseR + 1 <= rows - 2) grid[houseBaseR + 1][c] = 1;
  }
  // Fruit lane
  const fruitRow = Math.min(rows - 2, houseBaseR + 1);
  for (let c = centerCol - 1; c <= centerCol + 1; c++) {
    grid[fruitRow][c] = 6;
  }

  // 4. Guaranteed top and bottom loop highways
  for (let c = 1; c < cols - 1; c++) {
    grid[1][c] = 1;
    grid[rows - 2][c] = 1;
  }

  // 5. Symmetric architectural wall clusters in Left Half
  const halfCols = Math.floor(cols / 2);
  for (let r = 2; r < rows - 2; r += 2) {
    if (r === tunnelRow || r === fruitRow) continue;
    for (let c = 2; c < halfCols - 1; c += 3) {
      if (Math.random() < 0.65) {
        if (grid[r][c] === 1 && grid[r][c + 1] === 1) {
          grid[r][c] = 0;
          if (c + 1 < halfCols) grid[r][c + 1] = 0;
        }
      }
    }
  }

  // 6. Bilateral symmetry mirror
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < halfCols; c++) {
      if (grid[r][c] === 4 || grid[r][c] === 5) continue;
      grid[r][cols - 1 - c] = grid[r][c];
    }
  }

  // Restore critical points
  grid[tunnelRow][0] = 3;
  grid[tunnelRow][cols - 1] = 3;
  for (let c = houseStartC; c <= houseEndC; c++) {
    const isGate = c >= centerCol - 1 && c <= centerCol + 1;
    grid[houseR1][c] = isGate ? 4 : 0;
    grid[houseR2][c] = 5;
    grid[houseR3][c] = 5;
    grid[houseBaseR][c] = 0;
  }
  for (let c = centerCol - 1; c <= centerCol + 1; c++) {
    grid[fruitRow][c] = 6;
  }

  // Power Pellets in four corners
  grid[1][1] = 2;
  grid[1][cols - 2] = 2;
  grid[rows - 2][1] = 2;
  grid[rows - 2][cols - 2] = 2;

  // 7. Dead-end elimination passes to guarantee complete loop connectivity
  for (let pass = 0; pass < 5; pass++) {
    for (let r = 1; r < rows - 1; r++) {
      for (let c = 1; c < cols - 1; c++) {
        if (!isWalkableForPlayer(grid[r][c])) continue;
        let neighbors = 0;
        const blocked: [number, number][] = [];
        const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
        for (const [dx, dy] of dirs) {
          let nx = c + dx;
          let ny = r + dy;
          if (ny === tunnelRow) {
            if (nx < 0) nx = cols - 1;
            else if (nx >= cols) nx = 0;
          }
          if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && isWalkableForPlayer(grid[ny][nx])) {
            neighbors++;
          } else {
            blocked.push([dx, dy]);
          }
        }
        if (neighbors <= 1 && blocked.length > 0) {
          const [dx, dy] = blocked[Math.floor(Math.random() * blocked.length)];
          const cr = r + dy;
          const cc = c + dx;
          if (cr > 0 && cr < rows - 1 && cc > 0 && cc < cols - 1 && grid[cr][cc] === 0) {
            grid[cr][cc] = 1;
            grid[cr][cols - 1 - cc] = 1;
          }
        }
      }
    }
  }

  // 8. Find intersection hubs for bonus items
  const dynamicBonusLocs: GridPos[] = [];
  for (let r = 1; r < rows - 1; r++) {
    for (let c = 1; c < cols - 1; c++) {
      if (grid[r][c] === 1 && isIntersection(grid, c, r, cols, rows)) {
        dynamicBonusLocs.push({ x: c, y: r });
      }
    }
  }
  if (dynamicBonusLocs.length < 6) {
    dynamicBonusLocs.push(
      { x: centerCol, y: fruitRow },
      { x: centerCol, y: 3 },
      { x: 3, y: 3 },
      { x: cols - 4, y: 3 },
      { x: 3, y: rows - 4 },
      { x: cols - 4, y: rows - 4 }
    );
  }

  const pStartY = Math.min(rows - 3, houseBaseR + 5);
  const rStartY = Math.max(2, houseR1 - 4);

  return {
    id: 5,
    name: `隨機·${themeObj.name}`,
    nameEn: `RANDOM · ${themeObj.nameEn}`,
    subtitle: `程序化動態迷宮 · 種子 #${seed}`,
    sizeCategory,
    sizeBadge,
    sizeDescription: `程序化演算法 · ${sizeBadge} · 0 死路保證`,
    cols,
    rows,
    tunnelRow,
    themeColor: themeObj.theme,
    glowColor: themeObj.glow,
    wallFillColor: themeObj.fill,
    grid,
    playerStart: { x: centerCol, y: pStartY },
    rivalStart: { x: centerCol, y: rStartY },
    ghostSpawn: {
      blinky: { x: centerCol, y: houseR1 - 1 },
      pinky: { x: centerCol - 1, y: houseR2 },
      inky: { x: centerCol, y: houseR2 },
      clyde: { x: centerCol + 1, y: houseR2 },
    },
    ghostHomeCorners: {
      blinky: { x: cols - 2, y: 1 },
      pinky: { x: 1, y: 1 },
      inky: { x: cols - 2, y: rows - 2 },
      clyde: { x: 1, y: rows - 2 },
    },
    bonusLocations: dynamicBonusLocs,
    fruitSpawn: { x: centerCol, y: fruitRow },
    timeLimitSec,
    fruitIntervalSec,
  };
}

export function getMapConfig(level: number, proceduralSize?: 'MINI' | 'STANDARD' | 'EXPANSIVE'): MapConfig {
  if (level === 5) {
    return generateProceduralMaze(proceduralSize ?? 'STANDARD');
  }
  return MAP_CONFIGS[level] || MAP_CONFIGS[1];
}

// Helper to check if grid tile is a walkable corridor for player/rival
export function isWalkableForPlayer(tile: number): boolean {
  return tile === 1 || tile === 2 || tile === 3 || tile === 6;
}

export function isWalkableForGhost(tile: number, isReturning: boolean = false): boolean {
  if (tile === 0) return false;
  if (tile === 4) return true;
  if (tile === 5) return isReturning;
  return true;
}

export function isIntersection(map: number[][], gx: number, gy: number, cols: number = 28, rows: number = 21): boolean {
  if (gx <= 0 || gx >= cols - 1 || gy <= 0 || gy >= rows - 1) return false;
  let paths = 0;
  if (isWalkableForPlayer(map[gy - 1]?.[gx] ?? 0)) paths++;
  if (isWalkableForPlayer(map[gy + 1]?.[gx] ?? 0)) paths++;
  if (isWalkableForPlayer(map[gy]?.[gx - 1] ?? 0)) paths++;
  if (isWalkableForPlayer(map[gy]?.[gx + 1] ?? 0)) paths++;
  return paths >= 3;
}
