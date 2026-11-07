import {
  CharacterType,
  Direction,
  Ghost,
  GridPos,
  ItemType,
  MazeItem,
  Particle,
  RivalNPC,
  ScorePopup,
  SnakeSegment,
} from '../types/game';
import { soundManager } from '../audio/soundManager';
import {
  getMapConfig,
  isWalkableForGhost,
  isWalkableForPlayer,
  MapConfig,
} from './mazeData';

export interface GameEngineCallbacks {
  onScoreUpdate: (playerScore: number, rivalScore: number) => void;
  onLivesUpdate: (lives: number) => void;
  onTimeUpdate: (timeRemaining: number) => void;
  onGameOver: (playerScore: number, rivalScore: number, reason: string) => void;
  onVictory: (playerScore: number, rivalScore: number, timeRemaining: number) => void;
  onActiveBuffsUpdate: (buffs: {
    speed: number;
    freeze: number;
    powerPellet: number;
    playerFrozen?: number;
    rivalSpeed?: number;
    rivalFrenzy?: number;
  }) => void;
}

export class GameEngine {
  private callbacks: GameEngineCallbacks;
  public characterType: CharacterType = 'snake';
  public currentLevel: number = 1;
  public proceduralSize: 'MINI' | 'STANDARD' | 'EXPANSIVE' = 'STANDARD';
  public mapConfig: MapConfig = getMapConfig(1);

  // Dynamic Grid Map dimensions
  public cols: number = 28;
  public rows: number = 21;
  public tunnelRow: number = 10;
  public offsetX: number = 0;
  public offsetY: number = 0;

  // Grid map (copy of current level map)
  public map: number[][] = [];
  public items: MazeItem[] = [];
  public totalPellets: number = 0;
  public pelletsRemaining: number = 0;

  // Player state
  public playerGridX: number = 13;
  public playerGridY: number = 16;
  public playerFloatX: number = 13;
  public playerFloatY: number = 16;
  public playerDir: Direction = 'LEFT';
  public playerNextDir: Direction = 'LEFT';
  public playerScore: number = 0;
  public playerLives: number = 3;
  public playerSpeed: number = 4.2; // tiles per second
  public mouthPhase: number = 0;

  // Snake specific
  public snakeSegments: SnakeSegment[] = [];
  public snakeGrowPending: number = 0;

  // Rival Fox state
  public rival: RivalNPC;

  // Ghosts
  public ghosts: Ghost[] = [];
  public ghostConsecutiveEaten: number = 0;

  // Buffs & Timers
  public frightenedTimer: number = 0;
  public speedBoostTimer: number = 0;
  public freezeTimer: number = 0;
  public playerFreezeTimer: number = 0;
  public roundTimeLimit: number = 60;
  public timeRemaining: number = 60;
  public fruitSpawnTimer: number = 6;
  public snakeBiteCooldown: number = 0;

  // Particles & Popups
  public particles: Particle[] = [];
  public popups: ScorePopup[] = [];

  // Loop control
  public isRunning: boolean = false;
  public isPaused: boolean = false;
  private lastTimestamp: number = 0;
  private animFrameId: number | null = null;
  private tileSizePx: number = 24;

  constructor(callbacks: GameEngineCallbacks) {
    this.callbacks = callbacks;
    this.mapConfig = getMapConfig(1);
    this.cols = this.mapConfig.cols;
    this.rows = this.mapConfig.rows;
    this.tunnelRow = this.mapConfig.tunnelRow;
    this.rival = this.createDefaultRival();
    this.initGame(this.characterType, 1);
  }

  private createDefaultRival(): RivalNPC {
    const startPos = this.mapConfig ? this.mapConfig.rivalStart : { x: 14, y: 4 };
    return {
      x: startPos.x,
      y: startPos.y,
      gridX: startPos.x,
      gridY: startPos.y,
      dir: 'LEFT',
      targetDir: 'LEFT',
      speed: 3.2,
      score: 0,
      isFrozen: false,
      freezeTimer: 0,
      speedBoostTimer: 0,
      powerFrenzyTimer: 0,
      targetPos: null,
      path: [],
      repathTimer: 0,
      pelletsEaten: 0,
      mouthOpen: false,
    };
  }

  public setTileSize(ts: number, offsetX: number = 0, offsetY: number = 0) {
    this.tileSizePx = ts;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }

  public initGame(
    charType: CharacterType,
    level: number = 1,
    proceduralSize?: 'MINI' | 'STANDARD' | 'EXPANSIVE'
  ) {
    this.characterType = charType;
    this.currentLevel = level;
    if (proceduralSize) this.proceduralSize = proceduralSize;

    this.playerScore = 0;
    this.playerLives = 3;
    this.frightenedTimer = 0;
    this.speedBoostTimer = 0;
    this.freezeTimer = 0;
    this.playerFreezeTimer = 0;
    this.ghostConsecutiveEaten = 0;
    this.particles = [];
    this.popups = [];

    // Load level map config (Handcrafted or Procedural Random)
    this.mapConfig = getMapConfig(level, this.proceduralSize);
    this.cols = this.mapConfig.cols;
    this.rows = this.mapConfig.rows;
    this.tunnelRow = this.mapConfig.tunnelRow;
    this.roundTimeLimit = this.mapConfig.timeLimitSec;
    this.timeRemaining = this.roundTimeLimit;
    this.fruitSpawnTimer = this.mapConfig.fruitIntervalSec;

    this.map = this.mapConfig.grid.map(row => [...row]);

    // Populate items
    this.items = [];
    this.totalPellets = 0;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const val = this.map[r][c];
        if (val === 1) {
          this.items.push({
            id: `p_${c}_${r}`,
            type: 'pellet',
            x: c,
            y: r,
            points: 10,
            collectedBy: null,
          });
          this.totalPellets++;
        } else if (val === 2) {
          this.items.push({
            id: `pp_${c}_${r}`,
            type: 'power_pellet',
            x: c,
            y: r,
            points: 50,
            collectedBy: null,
          });
          this.totalPellets++;
        }
      }
    }
    this.pelletsRemaining = this.totalPellets;
    this.snakeBiteCooldown = 0;

    // Pre-spawn initial special items
    const bonusLocs = this.mapConfig.bonusLocations;
    const initialCount = this.mapConfig.sizeCategory === 'MINI' ? 3 : (this.mapConfig.sizeCategory === 'EXPANSIVE' ? 6 : 4);
    const initialLocs = [...bonusLocs].sort(() => 0.5 - Math.random()).slice(0, initialCount);
    const initialTypes: ItemType[] = ['speed_shoe', 'hourglass', 'cherry', 'apple'];
    initialLocs.forEach((loc, idx) => {
      this.spawnBonusItemAt(loc, initialTypes[idx % initialTypes.length]);
    });

    // Reset Player
    this.resetPlayerPosition();

    // Reset Rival
    this.rival = this.createDefaultRival();
    const baseRivalSpeed = this.mapConfig.sizeCategory === 'MINI' ? 3.4 : (3.1 + Math.min(3, level) * 0.2);
    this.rival.speed = baseRivalSpeed;

    // Reset Ghosts
    this.initGhosts(level);

    this.callbacks.onScoreUpdate(this.playerScore, this.rival.score);
    this.callbacks.onLivesUpdate(this.playerLives);
    this.callbacks.onTimeUpdate(this.timeRemaining);
  }

  private resetPlayerPosition() {
    const startPos = this.mapConfig ? this.mapConfig.playerStart : { x: 13, y: 16 };
    this.playerGridX = startPos.x;
    this.playerGridY = startPos.y;
    this.playerFloatX = startPos.x;
    this.playerFloatY = startPos.y;
    this.playerDir = 'LEFT';
    this.playerNextDir = 'LEFT';

    if (this.characterType === 'snake') {
      const segs: SnakeSegment[] = [];
      const initLen = this.mapConfig.sizeCategory === 'MINI' ? 3 : 4;
      for (let i = 0; i < initLen; i++) {
        segs.push({
          x: Math.min(this.cols - 2, startPos.x + i),
          y: startPos.y,
          dir: 'LEFT',
        });
      }
      this.snakeSegments = segs;
      this.snakeGrowPending = 0;
    }
  }

  private initGhosts(level: number) {
    const baseSpeed = (this.mapConfig.sizeCategory === 'MINI' ? 2.8 : 3.0) + (Math.min(3, level) - 1) * 0.3;
    const spawnPos = this.mapConfig.ghostSpawn;
    const homeCorners = this.mapConfig.ghostHomeCorners;
    this.ghosts = [
      {
        id: 'blinky',
        name: 'Blinky',
        color: '#ef4444',
        x: spawnPos.blinky.x,
        y: spawnPos.blinky.y,
        gridX: spawnPos.blinky.x,
        gridY: spawnPos.blinky.y,
        dir: 'LEFT',
        targetDir: 'LEFT',
        state: 'CHASE',
        speed: baseSpeed * 1.05,
        frightenedTimer: 0,
        homeCorner: homeCorners.blinky,
        houseTimer: 0,
      },
      {
        id: 'pinky',
        name: 'Pinky',
        color: '#f472b6',
        x: spawnPos.pinky.x,
        y: spawnPos.pinky.y,
        gridX: spawnPos.pinky.x,
        gridY: spawnPos.pinky.y,
        dir: 'UP',
        targetDir: 'UP',
        state: 'HOUSE',
        speed: baseSpeed * 0.98,
        frightenedTimer: 0,
        homeCorner: homeCorners.pinky,
        houseTimer: 1.5,
      },
      {
        id: 'inky',
        name: 'Inky',
        color: '#38bdf8',
        x: spawnPos.inky.x,
        y: spawnPos.inky.y,
        gridX: spawnPos.inky.x,
        gridY: spawnPos.inky.y,
        dir: 'UP',
        targetDir: 'UP',
        state: 'HOUSE',
        speed: baseSpeed * 0.95,
        frightenedTimer: 0,
        homeCorner: homeCorners.inky,
        houseTimer: 3.5,
      },
      {
        id: 'clyde',
        name: 'Clyde',
        color: '#fb923c',
        x: spawnPos.clyde.x,
        y: spawnPos.clyde.y,
        gridX: spawnPos.clyde.x,
        gridY: spawnPos.clyde.y,
        dir: 'UP',
        targetDir: 'UP',
        state: 'HOUSE',
        speed: baseSpeed * 0.92,
        frightenedTimer: 0,
        homeCorner: homeCorners.clyde,
        houseTimer: 5.5,
      },
    ];
  }

  public setPlayerDirection(dir: Direction) {
    if (this.characterType === 'snake') {
      const isOpposite =
        (dir === 'UP' && this.playerDir === 'DOWN') ||
        (dir === 'DOWN' && this.playerDir === 'UP') ||
        (dir === 'LEFT' && this.playerDir === 'RIGHT') ||
        (dir === 'RIGHT' && this.playerDir === 'LEFT');

      if (isOpposite) {
        const aheadTile = this.getNeighborTile(
          Math.round(this.playerFloatX),
          Math.round(this.playerFloatY),
          this.playerDir
        );
        // Only reject 180-reversal if forward path is clear (prevents accidental neck bites while moving)
        // If facing a wall or blocked corner, allow immediate turnaround so the snake NEVER gets stuck!
        if (this.canPlayerEnter(aheadTile.x, aheadTile.y)) {
          return;
        }
      }
    }
    this.playerNextDir = dir;
  }

  public triggerActiveAbility() {
    if (this.characterType === 'snake') {
      if (this.speedBoostTimer <= 0) {
        this.speedBoostTimer = 3.5;
        soundManager.playSpeedBoost();
        this.addPopup(this.playerFloatX, this.playerFloatY, 'COIL BOOST!', '#10b981');
      }
    } else {
      if (this.speedBoostTimer <= 0) {
        this.speedBoostTimer = 4.0;
        soundManager.playSpeedBoost();
        this.addPopup(this.playerFloatX, this.playerFloatY, 'TURBO DASH!', '#facc15');
      }
    }
  }

  public isSnakeBodyTile(gx: number, gy: number, excludeHead: boolean = true): boolean {
    if (this.characterType !== 'snake' || this.snakeSegments.length <= 1) return false;
    const startIdx = excludeHead ? 1 : 0;
    for (let i = startIdx; i < this.snakeSegments.length; i++) {
      if (this.snakeSegments[i].x === gx && this.snakeSegments[i].y === gy) {
        return true;
      }
    }
    return false;
  }

  public update(dt: number) {
    if (!this.isRunning || this.isPaused) return;

    const safeDt = Math.min(dt, 0.05);

    // Timers
    this.timeRemaining -= safeDt;
    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0;
      this.evaluateGameCompletion();
      return;
    }
    this.callbacks.onTimeUpdate(Math.ceil(this.timeRemaining));

    // Power pellet frightened timer
    if (this.frightenedTimer > 0) {
      this.frightenedTimer -= safeDt;
      if (this.frightenedTimer <= 0) {
        this.frightenedTimer = 0;
        this.ghostConsecutiveEaten = 0;
        this.ghosts.forEach(g => {
          if (g.state === 'FRIGHTENED') g.state = 'CHASE';
        });
      }
    }

    // Speed boost timer
    if (this.speedBoostTimer > 0) {
      this.speedBoostTimer -= safeDt;
      if (this.speedBoostTimer <= 0) this.speedBoostTimer = 0;
    }

    // Freeze timer for Rival Fox
    if (this.freezeTimer > 0) {
      this.freezeTimer -= safeDt;
      this.rival.isFrozen = true;
      this.rival.freezeTimer = this.freezeTimer;
      if (this.freezeTimer <= 0) {
        this.freezeTimer = 0;
        this.rival.isFrozen = false;
      }
    }

    // Freeze timer for Player
    if (this.playerFreezeTimer > 0) {
      this.playerFreezeTimer -= safeDt;
      if (this.playerFreezeTimer <= 0) {
        this.playerFreezeTimer = 0;
      }
    }

    // Rival Fox buff timers
    if (this.rival.speedBoostTimer && this.rival.speedBoostTimer > 0) {
      this.rival.speedBoostTimer -= safeDt;
      if (this.rival.speedBoostTimer <= 0) this.rival.speedBoostTimer = 0;
    }
    if (this.rival.powerFrenzyTimer && this.rival.powerFrenzyTimer > 0) {
      this.rival.powerFrenzyTimer -= safeDt;
      if (this.rival.powerFrenzyTimer <= 0) this.rival.powerFrenzyTimer = 0;
    }

    // Snake self-bite penalty cooldown
    if (this.snakeBiteCooldown > 0) {
      this.snakeBiteCooldown -= safeDt;
      if (this.snakeBiteCooldown <= 0) this.snakeBiteCooldown = 0;
    }

    this.callbacks.onActiveBuffsUpdate({
      speed: Math.max(0, this.speedBoostTimer),
      freeze: Math.max(0, this.freezeTimer),
      powerPellet: Math.max(0, this.frightenedTimer),
      playerFrozen: Math.max(0, this.playerFreezeTimer),
      rivalSpeed: Math.max(0, this.rival.speedBoostTimer || 0),
      rivalFrenzy: Math.max(0, this.rival.powerFrenzyTimer || 0),
    });

    // White dot respawn timer: Dots refresh 10 seconds after being eaten
    for (const item of this.items) {
      if (item.type === 'pellet' && item.collectedBy && item.respawnTimer !== undefined) {
        item.respawnTimer -= safeDt;
        if (item.respawnTimer <= 0) {
          item.collectedBy = null;
          item.respawnTimer = undefined;
          this.pelletsRemaining++;
          this.spawnSparks(item.x, item.y, '#ffffff', 2);
        }
      }
    }

    // Spawn bonus items periodically
    this.updateFruitSpawner(safeDt);

    // Update Player
    this.updatePlayer(safeDt);

    // Update Rival Fox
    this.updateRival(safeDt);

    // Update Ghosts
    this.updateGhosts(safeDt);

    // Check entity collisions
    this.checkCollisions();

    // Update particles & score popups
    this.updateParticles(safeDt);
    this.updatePopups(safeDt);

    // Check victory condition
    if (this.pelletsRemaining <= 0) {
      this.evaluateGameCompletion();
    }
  }

  private spawnBonusItemAt(pos: GridPos, specificType?: ItemType) {
    const types: ItemType[] = ['cherry', 'apple', 'strawberry', 'speed_shoe', 'hourglass'];
    const chosenType = specificType || types[Math.floor(Math.random() * types.length)];

    let points = 100;
    if (chosenType === 'apple') points = 200;
    else if (chosenType === 'strawberry') points = 300;
    else if (chosenType === 'speed_shoe') points = 150;
    else if (chosenType === 'hourglass') points = 150;

    const existingIdx = this.items.findIndex(
      it => it.x === pos.x && it.y === pos.y && it.type !== 'pellet' && it.type !== 'power_pellet'
    );
    if (existingIdx !== -1) {
      this.items.splice(existingIdx, 1);
    }

    this.items.push({
      id: `bonus_${pos.x}_${pos.y}_${Date.now()}`,
      type: chosenType,
      x: pos.x,
      y: pos.y,
      points,
      collectedBy: null,
      pulsePhase: 0,
    });
  }

  private updateFruitSpawner(dt: number) {
    this.fruitSpawnTimer -= dt;
    if (this.fruitSpawnTimer <= 0) {
      this.fruitSpawnTimer = this.mapConfig.fruitIntervalSec;

      const bonusLocs = this.mapConfig.bonusLocations;
      const activeBonusItems = this.items.filter(
        it => !it.collectedBy && it.type !== 'pellet' && it.type !== 'power_pellet'
      );

      const maxSimultaneousBonus = this.mapConfig.sizeCategory === 'MINI' ? 4 : (this.mapConfig.sizeCategory === 'EXPANSIVE' ? 8 : 6);
      if (activeBonusItems.length < maxSimultaneousBonus) {
        const availableLocs = bonusLocs.filter(
          loc => !activeBonusItems.some(it => it.x === loc.x && it.y === loc.y)
        );

        if (availableLocs.length > 0) {
          const spawnLoc = availableLocs[Math.floor(Math.random() * availableLocs.length)];
          this.spawnBonusItemAt(spawnLoc);
          this.addPopup(spawnLoc.x, spawnLoc.y, 'ITEM SPAWN!', '#38bdf8');
          this.spawnSparks(spawnLoc.x, spawnLoc.y, '#38bdf8', 12);
        }
      }
    }
  }

  private updatePlayer(dt: number) {
    if (this.playerFreezeTimer > 0) {
      return;
    }

    const currentSpeed = (this.speedBoostTimer > 0 ? this.playerSpeed * 1.4 : this.playerSpeed);
    const moveDist = currentSpeed * dt;
    this.mouthPhase += dt * (currentSpeed * 2);

    // 1. Reverse direction check
    const isOpposite =
      (this.playerNextDir === 'UP' && this.playerDir === 'DOWN') ||
      (this.playerNextDir === 'DOWN' && this.playerDir === 'UP') ||
      (this.playerNextDir === 'LEFT' && this.playerDir === 'RIGHT') ||
      (this.playerNextDir === 'RIGHT' && this.playerDir === 'LEFT');

    const currGx = Math.round(this.playerFloatX);
    const currGy = Math.round(this.playerFloatY);
    const aheadTile = this.getNeighborTile(currGx, currGy, this.playerDir);
    const isBlockedAhead = !this.canPlayerEnter(aheadTile.x, aheadTile.y);

    if (isOpposite) {
      if (this.characterType === 'pacman') {
        this.playerDir = this.playerNextDir;
      } else if (isBlockedAhead) {
        // Snake: allow immediate 180 turnaround when facing a blocked wall/corner
        this.playerDir = this.playerNextDir;
      }
    }

    // 2. Turning logic at intersection/center
    if (this.playerNextDir !== this.playerDir && !isOpposite && this.playerNextDir !== 'NONE') {
      const isHorizontalMove = this.playerDir === 'LEFT' || this.playerDir === 'RIGHT';
      if (isHorizontalMove) {
        const gx = Math.round(this.playerFloatX);
        const gy = Math.round(this.playerFloatY);
        if (Math.abs(this.playerFloatX - gx) <= moveDist + 0.18 || isBlockedAhead) {
          const nextTile = this.getNeighborTile(gx, gy, this.playerNextDir);
          if (this.canPlayerEnter(nextTile.x, nextTile.y)) {
            this.playerFloatX = gx;
            this.playerDir = this.playerNextDir;
          }
        }
      } else {
        const gx = Math.round(this.playerFloatX);
        const gy = Math.round(this.playerFloatY);
        if (Math.abs(this.playerFloatY - gy) <= moveDist + 0.18 || isBlockedAhead) {
          const nextTile = this.getNeighborTile(gx, gy, this.playerNextDir);
          if (this.canPlayerEnter(nextTile.x, nextTile.y)) {
            this.playerFloatY = gy;
            this.playerDir = this.playerNextDir;
          }
        }
      }
    }

    // 3. Move forward in this.playerDir
    if (this.playerDir === 'LEFT') {
      this.playerFloatY = currGy;
      const nextTile = { x: Math.floor(this.playerFloatX - moveDist), y: currGy };
      if (this.canPlayerEnter(nextTile.x, nextTile.y)) {
        this.playerFloatX -= moveDist;
      } else {
        const stopX = Math.floor(this.playerFloatX);
        if (this.playerFloatX > stopX) {
          this.playerFloatX = Math.max(stopX, this.playerFloatX - moveDist);
        }
      }
    } else if (this.playerDir === 'RIGHT') {
      this.playerFloatY = currGy;
      const nextTile = { x: Math.ceil(this.playerFloatX + moveDist), y: currGy };
      if (this.canPlayerEnter(nextTile.x, nextTile.y)) {
        this.playerFloatX += moveDist;
      } else {
        const stopX = Math.ceil(this.playerFloatX);
        if (this.playerFloatX < stopX) {
          this.playerFloatX = Math.min(stopX, this.playerFloatX + moveDist);
        }
      }
    } else if (this.playerDir === 'UP') {
      this.playerFloatX = currGx;
      const nextTile = { x: currGx, y: Math.floor(this.playerFloatY - moveDist) };
      if (this.canPlayerEnter(nextTile.x, nextTile.y)) {
        this.playerFloatY -= moveDist;
      } else {
        const stopY = Math.floor(this.playerFloatY);
        if (this.playerFloatY > stopY) {
          this.playerFloatY = Math.max(stopY, this.playerFloatY - moveDist);
        }
      }
    } else if (this.playerDir === 'DOWN') {
      this.playerFloatX = currGx;
      const nextTile = { x: currGx, y: Math.ceil(this.playerFloatY + moveDist) };
      if (this.canPlayerEnter(nextTile.x, nextTile.y)) {
        this.playerFloatY += moveDist;
      } else {
        const stopY = Math.ceil(this.playerFloatY);
        if (this.playerFloatY < stopY) {
          this.playerFloatY = Math.min(stopY, this.playerFloatY + moveDist);
        }
      }
    }

    // Wraparound tunnel
    if (this.tunnelRow >= 0 && Math.round(this.playerFloatY) === this.tunnelRow) {
      if (this.playerFloatX < -0.5) this.playerFloatX = this.cols - 0.5;
      if (this.playerFloatX > this.cols - 0.5) this.playerFloatX = -0.5;
    }

    // 4. Grid cell transition & Snake segment trailing
    const newGx = Math.round(this.playerFloatX);
    const newGy = Math.round(this.playerFloatY);

    if (newGx !== this.playerGridX || newGy !== this.playerGridY) {
      if (this.characterType === 'snake') {
        if (this.isSnakeBodyTile(newGx, newGy, true)) {
          this.handleSnakeSelfBite(newGx, newGy);
        }

        this.snakeSegments.unshift({
          x: newGx,
          y: newGy,
          dir: this.playerDir,
        });

        if (this.snakeGrowPending > 0) {
          this.snakeGrowPending--;
        } else {
          this.snakeSegments.pop();
        }

        // Anti-stuck slide-out logic: if snake head bumps close to Fox, safely dodge Fox
        const distToFox = Math.hypot(newGx - this.rival.x, newGy - this.rival.y);
        if (distToFox < 1.0) {
          const escapeDirs: Direction[] = ['RIGHT', 'DOWN', 'LEFT', 'UP'];
          for (const ed of escapeDirs) {
            const en = this.getNeighborTile(Math.round(this.rival.x), Math.round(this.rival.y), ed);
            if (this.canPlayerEnter(en.x, en.y) && !this.isSnakeBodyTile(en.x, en.y, false) && (en.x !== newGx || en.y !== newGy)) {
              this.rival.x = en.x;
              this.rival.y = en.y;
              this.rival.gridX = en.x;
              this.rival.gridY = en.y;
              this.rival.dir = ed;
              this.rival.repathTimer = 0.3;
              this.spawnSparks(en.x, en.y, '#f97316', 10);
              this.addPopup(en.x, en.y, 'FOX DODGE! 🦊', '#f97316');
              break;
            }
          }
        }
      }

      this.playerGridX = newGx;
      this.playerGridY = newGy;

      // Item pickup
      this.checkItemPickup(this.playerGridX, this.playerGridY, 'player');
    }
  }

  private handleSnakeSelfBite(gx: number, gy: number) {
    if (this.snakeBiteCooldown > 0) return;
    this.snakeBiteCooldown = 1.2;

    const penalty = 200;
    this.playerScore = Math.max(0, this.playerScore - penalty);
    this.callbacks.onScoreUpdate(this.playerScore, this.rival.score);

    soundManager.playBiteSelf();
    this.addPopup(gx, gy, `-${penalty} 咬到自己!`, '#ef4444');
    this.spawnSparks(gx, gy, '#ef4444', 22);

    const hitIdx = this.snakeSegments.findIndex(
      (seg, idx) => idx > 0 && seg.x === gx && seg.y === gy
    );
    if (hitIdx !== -1) {
      this.snakeSegments = this.snakeSegments.slice(0, Math.max(3, hitIdx));
    } else if (this.snakeSegments.length > 3) {
      this.snakeSegments.splice(Math.max(3, this.snakeSegments.length - 2));
    }
  }

  private canPlayerEnter(x: number, y: number): boolean {
    if (this.tunnelRow >= 0 && (x < 0 || x >= this.cols) && y === this.tunnelRow) return true;
    if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return false;
    const tile = this.map[y]?.[x] ?? 0;
    return isWalkableForPlayer(tile);
  }

  private checkItemPickup(gx: number, gy: number, collector: 'player' | 'rival') {
    const availableItems = this.items.filter(it => it.x === gx && it.y === gy && !it.collectedBy);
    if (availableItems.length === 0) return;

    const item = availableItems.find(it => it.type !== 'pellet' && it.type !== 'power_pellet') || availableItems[0];
    item.collectedBy = collector;

    if (collector === 'player') {
      this.playerScore += item.points;

      if (item.type === 'pellet') {
        this.pelletsRemaining--;
        item.respawnTimer = 10.0;
        soundManager.playChomp(this.characterType === 'snake');
        if (this.characterType === 'snake') {
          this.snakeGrowPending++;
          if (this.snakeSegments.length % 5 === 0) {
            soundManager.playSnakeStretch();
          }
        }
        this.spawnSparks(gx, gy, '#ffffff', 4);
      } else if (item.type === 'power_pellet') {
        this.pelletsRemaining--;
        soundManager.playPowerPellet();
        this.frightenedTimer = 8.0;
        this.ghosts.forEach(g => {
          if (g.state !== 'EATEN' && g.state !== 'HOUSE') {
            g.state = 'FRIGHTENED';
          }
        });
        if (this.characterType === 'snake') {
          this.snakeGrowPending += 3;
        }
        this.addPopup(gx, gy, 'POWER UP!', '#fbbf24');
        this.spawnSparks(gx, gy, '#facc15', 12);
      } else if (item.type === 'cherry' || item.type === 'apple' || item.type === 'strawberry') {
        soundManager.playFruit();
        this.addPopup(gx, gy, `+${item.points}`, '#f43f5e');
        this.spawnSparks(gx, gy, '#f43f5e', 10);
      } else if (item.type === 'speed_shoe') {
        soundManager.playSpeedBoost();
        this.speedBoostTimer = 6.0;
        this.addPopup(gx, gy, 'SPEED UP!', '#06b6d4');
        this.spawnSparks(gx, gy, '#06b6d4', 12);
      } else if (item.type === 'hourglass') {
        soundManager.playFreeze();
        this.freezeTimer = 5.0;
        this.addPopup(gx, gy, 'RIVAL FROZEN!', '#38bdf8');
        this.spawnSparks(gx, gy, '#38bdf8', 14);
      }

      this.callbacks.onScoreUpdate(this.playerScore, this.rival.score);
    } else {
      // Rival Fox item collection
      this.rival.score += item.points;
      this.rival.pelletsEaten++;

      if (item.type === 'pellet') {
        this.pelletsRemaining--;
        item.respawnTimer = 10.0;
        soundManager.playChomp(true);
        this.spawnSparks(gx, gy, '#f97316', 4);
      } else if (item.type === 'power_pellet') {
        this.pelletsRemaining--;
        soundManager.playPowerPellet();
        this.rival.powerFrenzyTimer = 7.0;
        this.addPopup(gx, gy, 'FOX FRENZY!', '#f59e0b');
        this.spawnSparks(gx, gy, '#f59e0b', 14);
      } else if (item.type === 'speed_shoe') {
        soundManager.playSpeedBoost();
        this.rival.speedBoostTimer = 5.0;
        this.addPopup(gx, gy, 'FOX SPEED UP!', '#06b6d4');
        this.spawnSparks(gx, gy, '#06b6d4', 14);
      } else if (item.type === 'hourglass') {
        soundManager.playFreeze();
        this.playerFreezeTimer = 3.5;
        this.addPopup(this.playerFloatX, this.playerFloatY, 'PLAYER FROZEN!', '#38bdf8');
        this.spawnSparks(this.playerFloatX, this.playerFloatY, '#38bdf8', 16);
      } else if (item.type === 'cherry' || item.type === 'apple' || item.type === 'strawberry') {
        soundManager.playFruit();
        this.addPopup(gx, gy, `FOX +${item.points}`, '#f43f5e');
        this.spawnSparks(gx, gy, '#f43f5e', 10);
      }

      this.callbacks.onScoreUpdate(this.playerScore, this.rival.score);
    }
  }

  // Update Rival Fox AI
  private updateRival(dt: number) {
    if (this.rival.isFrozen) return;

    // 1. Anti-penetration check: If Fox is trapped inside snake body, slide it out immediately!
    if (this.characterType === 'snake' && this.snakeSegments.length > 0) {
      const isInsideSnake = this.snakeSegments.some(
        seg => Math.hypot(this.rival.x - seg.x, this.rival.y - seg.y) < 0.75
      );
      if (isInsideSnake) {
        const searchRadial: { dx: number; dy: number; dir: Direction }[] = [
          { dx: 1, dy: 0, dir: 'RIGHT' },
          { dx: -1, dy: 0, dir: 'LEFT' },
          { dx: 0, dy: 1, dir: 'DOWN' },
          { dx: 0, dy: -1, dir: 'UP' },
          { dx: 2, dy: 0, dir: 'RIGHT' },
          { dx: -2, dy: 0, dir: 'LEFT' },
          { dx: 0, dy: 2, dir: 'DOWN' },
          { dx: 0, dy: -2, dir: 'UP' },
        ];
        for (const s of searchRadial) {
          const ex = Math.round(this.rival.x) + s.dx;
          const ey = Math.round(this.rival.y) + s.dy;
          if (this.canPlayerEnter(ex, ey) && !this.isSnakeBodyTile(ex, ey, false)) {
            this.rival.x = ex;
            this.rival.y = ey;
            this.rival.gridX = ex;
            this.rival.gridY = ey;
            this.rival.dir = s.dir;
            this.rival.repathTimer = 0.35;
            this.spawnSparks(ex, ey, '#f97316', 12);
            this.addPopup(ex, ey, 'FOX SLIPPED OUT! 🦊', '#f97316');
            break;
          }
        }
      }
    }

    const baseSpeed = this.rival.speed;
    const currentSpeed = (this.rival.speedBoostTimer && this.rival.speedBoostTimer > 0)
      ? baseSpeed * 1.35
      : baseSpeed;
    const moveDist = currentSpeed * dt;
    this.rival.repathTimer -= dt;

    const currGx = Math.round(this.rival.x);
    const currGy = Math.round(this.rival.y);

    const isHorizontal = this.rival.dir === 'LEFT' || this.rival.dir === 'RIGHT';
    const distToCenter = isHorizontal ? Math.abs(this.rival.x - currGx) : Math.abs(this.rival.y - currGy);

    const aheadTile = this.getNeighborTile(currGx, currGy, this.rival.dir);
    const isBlockedAhead = !this.canRivalEnter(aheadTile.x, aheadTile.y);

    if (distToCenter <= moveDist + 0.12 || isBlockedAhead || this.rival.repathTimer <= 0) {
      this.rival.repathTimer = 0.28;
      const nextDir = this.computeRivalNextDirection(currGx, currGy);

      if (nextDir !== 'NONE' && (nextDir !== this.rival.dir || isBlockedAhead)) {
        if (isHorizontal) this.rival.x = currGx;
        else this.rival.y = currGy;
        this.rival.dir = nextDir;
      } else if (isBlockedAhead) {
        const candidates: Direction[] = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
        let resolved = false;
        for (const c of candidates) {
          const n = this.getNeighborTile(currGx, currGy, c);
          if (this.canRivalEnter(n.x, n.y)) {
            this.rival.dir = c;
            if (isHorizontal) this.rival.x = currGx;
            else this.rival.y = currGy;
            resolved = true;
            break;
          }
        }

        if (!resolved) {
          const oppDir: Record<Direction, Direction> = {
            UP: 'DOWN',
            DOWN: 'UP',
            LEFT: 'RIGHT',
            RIGHT: 'LEFT',
            NONE: 'NONE',
          };
          const rev = oppDir[this.rival.dir];
          const rn = this.getNeighborTile(currGx, currGy, rev);
          if (this.canRivalEnter(rn.x, rn.y)) {
            this.rival.dir = rev;
            if (isHorizontal) this.rival.x = currGx;
            else this.rival.y = currGy;
          } else {
            this.rival.x = currGx;
            this.rival.y = currGy;
          }
        }
      }
    }

    if (this.rival.dir === 'LEFT') {
      this.rival.y = currGy;
      const nextTile = { x: Math.floor(this.rival.x - moveDist), y: currGy };
      if (this.canRivalEnter(nextTile.x, nextTile.y)) {
        this.rival.x -= moveDist;
      } else {
        const stopX = Math.floor(this.rival.x);
        if (this.rival.x > stopX) this.rival.x = Math.max(stopX, this.rival.x - moveDist);
        this.rival.repathTimer = 0;
      }
    } else if (this.rival.dir === 'RIGHT') {
      this.rival.y = currGy;
      const nextTile = { x: Math.ceil(this.rival.x + moveDist), y: currGy };
      if (this.canRivalEnter(nextTile.x, nextTile.y)) {
        this.rival.x += moveDist;
      } else {
        const stopX = Math.ceil(this.rival.x);
        if (this.rival.x < stopX) this.rival.x = Math.min(stopX, this.rival.x + moveDist);
        this.rival.repathTimer = 0;
      }
    } else if (this.rival.dir === 'UP') {
      this.rival.x = currGx;
      const nextTile = { x: currGx, y: Math.floor(this.rival.y - moveDist) };
      if (this.canRivalEnter(nextTile.x, nextTile.y)) {
        this.rival.y -= moveDist;
      } else {
        const stopY = Math.floor(this.rival.y);
        if (this.rival.y > stopY) this.rival.y = Math.max(stopY, this.rival.y - moveDist);
        this.rival.repathTimer = 0;
      }
    } else if (this.rival.dir === 'DOWN') {
      this.rival.x = currGx;
      const nextTile = { x: currGx, y: Math.ceil(this.rival.y + moveDist) };
      if (this.canRivalEnter(nextTile.x, nextTile.y)) {
        this.rival.y += moveDist;
      } else {
        const stopY = Math.ceil(this.rival.y);
        if (this.rival.y < stopY) this.rival.y = Math.min(stopY, this.rival.y + moveDist);
        this.rival.repathTimer = 0;
      }
    }

    // Tunnel wrap
    if (this.tunnelRow >= 0 && Math.round(this.rival.y) === this.tunnelRow) {
      if (this.rival.x < -0.5) this.rival.x = this.cols - 0.5;
      if (this.rival.x > this.cols - 0.5) this.rival.x = -0.5;
    }

    const newGx = Math.round(this.rival.x);
    const newGy = Math.round(this.rival.y);
    if (newGx !== this.rival.gridX || newGy !== this.rival.gridY) {
      this.rival.gridX = newGx;
      this.rival.gridY = newGy;
      this.checkItemPickup(this.rival.gridX, this.rival.gridY, 'rival');
    }
  }

  private canRivalEnter(x: number, y: number): boolean {
    if (this.tunnelRow >= 0 && (x < 0 || x >= this.cols) && y === this.tunnelRow) return true;
    if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return false;
    const tile = this.map[y]?.[x] ?? 0;
    if (!isWalkableForPlayer(tile)) return false;

    // Snake body blocks the rival fox
    if (this.isSnakeBodyTile(x, y, false)) return false;

    return true;
  }

  // Radial Flood-Fill BFS for closest reachable item
  private computeRivalNextDirection(startX: number, startY: number): Direction {
    const uncollectedItems = this.items.filter(it => !it.collectedBy);
    if (uncollectedItems.length === 0) return 'NONE';

    const itemMap = new Map<string, MazeItem>();
    for (const it of uncollectedItems) {
      itemMap.set(`${it.x},${it.y}`, it);
    }

    const oppDir: Record<Direction, Direction> = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT',
      NONE: 'NONE',
    };

    const queue: { x: number; y: number; firstDir: Direction; dist: number }[] = [];
    const visited = new Set<string>();
    visited.add(`${startX},${startY}`);

    const directions: Direction[] = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
    directions.sort((a, b) => {
      if (a === this.rival.dir) return -1;
      if (b === this.rival.dir) return 1;
      if (a === oppDir[this.rival.dir]) return 1;
      if (b === oppDir[this.rival.dir]) return -1;
      return 0;
    });

    for (const d of directions) {
      const neighbor = this.getNeighborTile(startX, startY, d);
      if (this.canRivalEnter(neighbor.x, neighbor.y)) {
        const key = `${neighbor.x},${neighbor.y}`;
        if (itemMap.has(key)) {
          return d;
        }
        visited.add(key);
        queue.push({ x: neighbor.x, y: neighbor.y, firstDir: d, dist: 1 });
      }
    }

    let iterations = 0;
    while (queue.length > 0 && iterations < 500) {
      iterations++;
      const curr = queue.shift()!;

      let checkX = curr.x;
      if (this.tunnelRow >= 0 && curr.y === this.tunnelRow) {
        if (checkX < 0) checkX = this.cols - 1;
        if (checkX >= this.cols) checkX = 0;
      }

      const key = `${checkX},${curr.y}`;
      if (itemMap.has(key)) {
        return curr.firstDir;
      }

      if (curr.dist > 50) continue;

      for (const d of ['UP', 'RIGHT', 'DOWN', 'LEFT'] as Direction[]) {
        const neighbor = this.getNeighborTile(checkX, curr.y, d);
        const nKey = `${neighbor.x},${neighbor.y}`;
        if (!visited.has(nKey) && this.canRivalEnter(neighbor.x, neighbor.y)) {
          visited.add(nKey);
          queue.push({ x: neighbor.x, y: neighbor.y, firstDir: curr.firstDir, dist: curr.dist + 1 });
        }
      }
    }

    for (const d of directions) {
      const n = this.getNeighborTile(startX, startY, d);
      if (this.canRivalEnter(n.x, n.y)) return d;
    }

    return 'NONE';
  }

  // Update Ghosts
  private updateGhosts(dt: number) {
    for (const ghost of this.ghosts) {
      if (ghost.state === 'HOUSE') {
        ghost.houseTimer -= dt;
        if (ghost.houseTimer <= 0) {
          ghost.state = this.frightenedTimer > 0 ? 'FRIGHTENED' : 'CHASE';
          const bSpawn = this.mapConfig.ghostSpawn.blinky;
          ghost.x = bSpawn.x;
          ghost.y = bSpawn.y;
          ghost.gridX = Math.round(ghost.x);
          ghost.gridY = Math.round(ghost.y);
          ghost.dir = 'LEFT';
        }
        continue;
      }

      let ghostSpeed = ghost.speed;
      if (ghost.state === 'FRIGHTENED') ghostSpeed *= 0.55;
      if (ghost.state === 'EATEN') ghostSpeed *= 2.2;

      const moveDist = ghostSpeed * dt;
      const currGx = Math.round(ghost.x);
      const currGy = Math.round(ghost.y);

      const isHorizontal = ghost.dir === 'LEFT' || ghost.dir === 'RIGHT';
      const distToCenter = isHorizontal ? Math.abs(ghost.x - currGx) : Math.abs(ghost.y - currGy);

      if (distToCenter <= moveDist + 0.1) {
        const nextDir = this.chooseGhostDirection(ghost, currGx, currGy);
        if (nextDir !== 'NONE' && nextDir !== ghost.dir) {
          if (isHorizontal) ghost.x = currGx;
          else ghost.y = currGy;
          ghost.dir = nextDir;
        }
      }

      if (ghost.dir === 'LEFT') {
        ghost.y = currGy;
        const nextTile = { x: Math.floor(ghost.x - moveDist), y: currGy };
        if (this.canGhostEnter(ghost, nextTile.x, nextTile.y)) {
          ghost.x -= moveDist;
        } else {
          const stopX = Math.floor(ghost.x);
          if (ghost.x > stopX) ghost.x = Math.max(stopX, ghost.x - moveDist);
          const alt = this.chooseGhostDirection(ghost, currGx, currGy);
          if (alt !== 'NONE') ghost.dir = alt;
        }
      } else if (ghost.dir === 'RIGHT') {
        ghost.y = currGy;
        const nextTile = { x: Math.ceil(ghost.x + moveDist), y: currGy };
        if (this.canGhostEnter(ghost, nextTile.x, nextTile.y)) {
          ghost.x += moveDist;
        } else {
          const stopX = Math.ceil(ghost.x);
          if (ghost.x < stopX) ghost.x = Math.min(stopX, ghost.x + moveDist);
          const alt = this.chooseGhostDirection(ghost, currGx, currGy);
          if (alt !== 'NONE') ghost.dir = alt;
        }
      } else if (ghost.dir === 'UP') {
        ghost.x = currGx;
        const nextTile = { x: currGx, y: Math.floor(ghost.y - moveDist) };
        if (this.canGhostEnter(ghost, nextTile.x, nextTile.y)) {
          ghost.y -= moveDist;
        } else {
          const stopY = Math.floor(ghost.y);
          if (ghost.y > stopY) ghost.y = Math.max(stopY, ghost.y - moveDist);
          const alt = this.chooseGhostDirection(ghost, currGx, currGy);
          if (alt !== 'NONE') ghost.dir = alt;
        }
      } else if (ghost.dir === 'DOWN') {
        ghost.x = currGx;
        const nextTile = { x: currGx, y: Math.ceil(ghost.y + moveDist) };
        if (this.canGhostEnter(ghost, nextTile.x, nextTile.y)) {
          ghost.y += moveDist;
        } else {
          const stopY = Math.ceil(ghost.y);
          if (ghost.y < stopY) ghost.y = Math.min(stopY, ghost.y + moveDist);
          const alt = this.chooseGhostDirection(ghost, currGx, currGy);
          if (alt !== 'NONE') ghost.dir = alt;
        }
      }

      // Tunnel wrap
      if (this.tunnelRow >= 0 && Math.round(ghost.y) === this.tunnelRow) {
        if (ghost.x < -0.5) ghost.x = this.cols - 0.5;
        if (ghost.x > this.cols - 0.5) ghost.x = -0.5;
      }

      ghost.gridX = Math.round(ghost.x);
      ghost.gridY = Math.round(ghost.y);

      // Check if eaten ghost reached home base
      if (ghost.state === 'EATEN') {
        const home = this.mapConfig.ghostSpawn.blinky;
        if (Math.hypot(ghost.gridX - home.x, ghost.gridY - home.y) <= 1) {
          ghost.state = 'CHASE';
        }
      }
    }
  }

  private canGhostEnter(ghost: Ghost, x: number, y: number): boolean {
    if (this.tunnelRow >= 0 && (x < 0 || x >= this.cols) && y === this.tunnelRow) return true;
    if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return false;
    const tile = this.map[y]?.[x] ?? 0;
    if (!isWalkableForGhost(tile, ghost.state === 'EATEN')) return false;

    // Snake's body blocks ghosts
    if (this.isSnakeBodyTile(x, y, false)) {
      return false;
    }

    return true;
  }

  private chooseGhostDirection(ghost: Ghost, gx: number, gy: number): Direction {
    const oppDir: Record<Direction, Direction> = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT',
      NONE: 'NONE',
    };

    const validDirs: Direction[] = [];
    const candidates: Direction[] = ['UP', 'LEFT', 'DOWN', 'RIGHT'];

    for (const d of candidates) {
      if (d === oppDir[ghost.dir]) continue;
      const n = this.getNeighborTile(gx, gy, d);
      if (this.canGhostEnter(ghost, n.x, n.y)) {
        validDirs.push(d);
      }
    }

    if (validDirs.length === 0) {
      const reverse = oppDir[ghost.dir];
      const n = this.getNeighborTile(gx, gy, reverse);
      if (this.canGhostEnter(ghost, n.x, n.y)) return reverse;
      return 'NONE';
    }

    if (ghost.state === 'FRIGHTENED') {
      return validDirs[Math.floor(Math.random() * validDirs.length)];
    }

    let targetX = this.playerGridX;
    let targetY = this.playerGridY;

    if (ghost.state === 'EATEN') {
      targetX = this.mapConfig.ghostSpawn.blinky.x;
      targetY = this.mapConfig.ghostSpawn.blinky.y;
    } else {
      switch (ghost.id) {
        case 'blinky':
          targetX = this.playerGridX;
          targetY = this.playerGridY;
          break;
        case 'pinky':
          const pVec = this.getDirVector(this.playerDir);
          targetX = this.playerGridX + pVec.x * 3;
          targetY = this.playerGridY + pVec.y * 3;
          break;
        case 'inky':
          targetX = this.playerGridX + (this.playerGridX - this.rival.gridX);
          targetY = this.playerGridY + (this.playerGridY - this.rival.gridY);
          break;
        case 'clyde':
          const distToPlayer = Math.hypot(gx - this.playerGridX, gy - this.playerGridY);
          if (distToPlayer < 5) {
            targetX = ghost.homeCorner.x;
            targetY = ghost.homeCorner.y;
          } else {
            targetX = this.playerGridX;
            targetY = this.playerGridY;
          }
          break;
      }
    }

    let bestDir = validDirs[0];
    let bestDist = Infinity;

    for (const d of validDirs) {
      const n = this.getNeighborTile(gx, gy, d);
      const dist = Math.hypot(n.x - targetX, n.y - targetY);
      if (dist < bestDist) {
        bestDist = dist;
        bestDir = d;
      }
    }

    return bestDir;
  }

  // Check collision between player and ghosts
  private checkCollisions() {
    for (const ghost of this.ghosts) {
      if (ghost.state === 'EATEN' || ghost.state === 'HOUSE') continue;

      const dist = Math.hypot(this.playerFloatX - ghost.x, this.playerFloatY - ghost.y);
      if (dist < 0.75) {
        if (ghost.state === 'FRIGHTENED') {
          soundManager.playEatGhost();
          ghost.state = 'EATEN';
          this.ghostConsecutiveEaten++;
          const pts = 200 * Math.pow(2, Math.min(3, this.ghostConsecutiveEaten - 1));
          this.playerScore += pts;
          this.callbacks.onScoreUpdate(this.playerScore, this.rival.score);
          this.addPopup(ghost.x, ghost.y, `+${pts}`, '#38bdf8');
          this.spawnSparks(ghost.x, ghost.y, '#38bdf8', 16);
        } else {
          this.handlePlayerHitByGhost(`Caught by ${ghost.name}!`);
          return;
        }
      }
    }
  }

  private handlePlayerHitByGhost(reason: string) {
    soundManager.playDeath();
    this.spawnSparks(this.playerFloatX, this.playerFloatY, '#ef4444', 24);

    // Score deduction penalty when caught/killed by ghost (-300 points, min 0)
    const ghostPenalty = 300;
    this.playerScore = Math.max(0, this.playerScore - ghostPenalty);
    this.callbacks.onScoreUpdate(this.playerScore, this.rival.score);
    this.addPopup(this.playerFloatX, this.playerFloatY, `-${ghostPenalty} 被幽靈抓到!`, '#ef4444');

    this.playerLives--;
    this.callbacks.onLivesUpdate(this.playerLives);

    if (this.playerLives <= 0) {
      this.callbacks.onGameOver(this.playerScore, this.rival.score, reason);
      this.stop();
    } else {
      this.resetPlayerPosition();
      this.initGhosts(this.currentLevel);
      this.addPopup(this.playerFloatX, this.playerFloatY, 'RESPAWN', '#fbbf24');
    }
  }

  private evaluateGameCompletion() {
    this.stop();

    if (this.playerScore > this.rival.score) {
      soundManager.playVictory();
      this.callbacks.onVictory(this.playerScore, this.rival.score, Math.ceil(this.timeRemaining));
    } else {
      soundManager.playDeath();
      this.callbacks.onGameOver(
        this.playerScore,
        this.rival.score,
        `Defeated by Rival Fox! (Rival: ${this.rival.score} vs Player: ${this.playerScore})`
      );
    }
  }

  // Particle bursts
  private spawnSparks(gx: number, gy: number, color: string, count: number) {
    const px = this.offsetX + gx * this.tileSizePx + this.tileSizePx / 2;
    const py = this.offsetY + gy * this.tileSizePx + this.tileSizePx / 2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 90;
      this.particles.push({
        x: px,
        y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: color,
        size: 1.5 + Math.random() * 2.5,
        alpha: 1,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
      });
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private addPopup(gx: number, gy: number, text: string, color: string) {
    const px = this.offsetX + gx * this.tileSizePx + this.tileSizePx / 2;
    const py = this.offsetY + gy * this.tileSizePx + this.tileSizePx / 2;
    this.popups.push({
      x: px,
      y: py,
      text: text,
      color: color,
      alpha: 1,
      life: 1.2,
    });
  }

  private updatePopups(dt: number) {
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const pop = this.popups[i];
      pop.y -= 25 * dt;
      pop.life -= dt;
      pop.alpha = Math.max(0, pop.life / 1.2);
      if (pop.life <= 0) {
        this.popups.splice(i, 1);
      }
    }
  }

  // Direction helpers
  private getNeighborTile(x: number, y: number, dir: Direction): GridPos {
    switch (dir) {
      case 'UP': return { x, y: y - 1 };
      case 'DOWN': return { x, y: y + 1 };
      case 'LEFT': return { x: x - 1, y };
      case 'RIGHT': return { x: x + 1, y };
      default: return { x, y };
    }
  }

  private getDirVector(dir: Direction): { x: number; y: number } {
    switch (dir) {
      case 'UP': return { x: 0, y: -1 };
      case 'DOWN': return { x: 0, y: 1 };
      case 'LEFT': return { x: -1, y: 0 };
      case 'RIGHT': return { x: 1, y: 0 };
      default: return { x: 0, y: 0 };
    }
  }

  public start() {
    this.isRunning = true;
    this.isPaused = false;
    soundManager.startBGM();
    this.lastTimestamp = performance.now();
  }

  public pause() {
    this.isPaused = true;
    soundManager.stopBGM();
  }

  public resume() {
    this.isPaused = false;
    soundManager.startBGM();
    this.lastTimestamp = performance.now();
  }

  public stop() {
    this.isRunning = false;
    soundManager.stopBGM();
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }
}
