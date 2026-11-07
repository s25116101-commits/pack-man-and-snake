import {
  CharacterType,
  Direction,
  Ghost,
  MazeItem,
  Particle,
  RivalNPC,
  ScorePopup,
  SnakeSegment,
} from '../types/game';

export class MazeRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private tileSize: number;
  public cols: number = 28;
  public rows: number = 21;
  public offsetX: number = 0;
  public offsetY: number = 0;
  private animTimer: number = 0;
  public themeColor: string = '#00f0ff';
  public glowColor: string = 'rgba(0, 240, 255, 0.7)';
  public wallFillColor: string = '#081120';

  constructor(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    cols: number = 28,
    rows: number = 21
  ) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.cols = cols;
    this.rows = rows;
    this.tileSize = Math.min(width / this.cols, height / this.rows);
    this.offsetX = Math.floor((width - this.cols * this.tileSize) / 2);
    this.offsetY = Math.floor((height - this.rows * this.tileSize) / 2);
  }

  public setDimensions(width: number, height: number, cols?: number, rows?: number) {
    this.width = width;
    this.height = height;
    if (cols) this.cols = cols;
    if (rows) this.rows = rows;
    this.tileSize = Math.min(width / this.cols, height / this.rows);
    this.offsetX = Math.floor((width - this.cols * this.tileSize) / 2);
    this.offsetY = Math.floor((height - this.rows * this.tileSize) / 2);
  }

  public getTileSize(): number {
    return this.tileSize;
  }

  public getOffsetX(): number {
    return this.offsetX;
  }

  public getOffsetY(): number {
    return this.offsetY;
  }

  public setTheme(themeColor: string, glowColor: string, wallFillColor: string = '#081120') {
    this.themeColor = themeColor;
    this.glowColor = glowColor;
    this.wallFillColor = wallFillColor;
  }

  public update(dt: number) {
    this.animTimer += dt;
  }

  public clear() {
    this.ctx.fillStyle = '#050811';
    this.ctx.fillRect(0, 0, this.width, this.height);

    const ts = this.tileSize;
    const ox = this.offsetX;
    const oy = this.offsetY;
    const arenaW = this.cols * ts;
    const arenaH = this.rows * ts;

    // Subtle background grid lines for cyberpunk arcade feel
    this.ctx.save();
    this.ctx.strokeStyle = this.themeColor === '#00f0ff' ? 'rgba(0, 240, 255, 0.03)' : `${this.themeColor}12`;
    this.ctx.lineWidth = 1;

    for (let x = ox; x <= ox + arenaW + 0.1; x += ts) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, oy);
      this.ctx.lineTo(x, oy + arenaH);
      this.ctx.stroke();
    }
    for (let y = oy; y <= oy + arenaH + 0.1; y += ts) {
      this.ctx.beginPath();
      this.ctx.moveTo(ox, y);
      this.ctx.lineTo(ox + arenaW, y);
      this.ctx.stroke();
    }

    // Outer neon glow border frame
    this.ctx.strokeStyle = `${this.themeColor}44`;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(ox, oy, arenaW, arenaH);

    this.ctx.restore();
  }

  // Draw maze walls with double neon glow matching reference image
  public drawMaze(map: number[][]) {
    if (!map || map.length === 0 || !map[0]) return;
    const rows = map.length;
    const cols = map[0].length;
    this.rows = rows;
    this.cols = cols;
    const ctx = this.ctx;
    const ts = this.tileSize;
    const ox = this.offsetX;
    const oy = this.offsetY;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const tile = map[r][c];
        const px = ox + c * ts;
        const py = oy + r * ts;

        if (tile === 0) {
          // Wall tile
          ctx.fillStyle = this.wallFillColor;
          ctx.fillRect(px, py, ts, ts);

          // Draw neon wall borders where adjacent tile is not wall
          const neighbors = {
            top: r > 0 ? map[r - 1][c] : 0,
            bottom: r < rows - 1 ? map[r + 1][c] : 0,
            left: c > 0 ? map[r][c - 1] : 0,
            right: c < cols - 1 ? map[r][c + 1] : 0,
          };

          // Neon themed border line
          ctx.strokeStyle = this.themeColor;
          ctx.shadowColor = this.glowColor;
          ctx.shadowBlur = 8;
          ctx.lineWidth = 2.5;

          if (neighbors.top !== 0) {
            ctx.beginPath();
            ctx.moveTo(px, py + 1);
            ctx.lineTo(px + ts, py + 1);
            ctx.stroke();
          }
          if (neighbors.bottom !== 0) {
            ctx.beginPath();
            ctx.moveTo(px, py + ts - 1);
            ctx.lineTo(px + ts, py + ts - 1);
            ctx.stroke();
          }
          if (neighbors.left !== 0) {
            ctx.beginPath();
            ctx.moveTo(px + 1, py);
            ctx.lineTo(px + 1, py + ts);
            ctx.stroke();
          }
          if (neighbors.right !== 0) {
            ctx.beginPath();
            ctx.moveTo(px + ts - 1, py);
            ctx.lineTo(px + ts - 1, py + ts);
            ctx.stroke();
          }

          // Subtle inner highlight
          ctx.shadowBlur = 0;
          ctx.strokeStyle = `${this.themeColor}33`;
          ctx.lineWidth = 1;
          ctx.strokeRect(px + 3, py + 3, ts - 6, ts - 6);
        } else if (tile === 4) {
          // Ghost Gate (Pink / Magenta flashing barrier)
          ctx.fillStyle = 'rgba(236, 72, 153, 0.15)';
          ctx.fillRect(px, py, ts, ts);

          ctx.strokeStyle = '#ec4899';
          ctx.shadowColor = '#ec4899';
          ctx.shadowBlur = 10;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(px, py + ts / 2);
          ctx.lineTo(px + ts, py + ts / 2);
          ctx.stroke();
        } else if (tile === 3 && (c === 0 || c === cols - 1)) {
          // Warp portal indicator
          ctx.fillStyle = 'rgba(0, 240, 255, 0.1)';
          ctx.fillRect(px, py, ts, ts);

          ctx.strokeStyle = '#00f0ff';
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 8;
          ctx.lineWidth = 2;
          ctx.strokeRect(px + 2, py + 2, ts - 4, ts - 4);

          // Warp hourglass / chevron glyph
          ctx.fillStyle = '#00f0ff';
          ctx.font = `${Math.floor(ts * 0.6)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(c === 0 ? '◀' : '▶', px + ts / 2, py + ts / 2);
        }
      }
    }

    ctx.restore();
  }

  // Draw dots, power pellets, and bonus items
  public drawItems(items: MazeItem[]) {
    if (!items || items.length === 0) return;
    const ctx = this.ctx;
    const ts = this.tileSize;
    const ox = this.offsetX;
    const oy = this.offsetY;

    for (const item of items) {
      if (item.collectedBy) continue;

      const cx = ox + item.x * ts + ts / 2;
      const cy = oy + item.y * ts + ts / 2;

      ctx.save();

      if (item.type === 'pellet') {
        // Normal white dot
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(cx, cy, ts * 0.16, 0, Math.PI * 2);
        ctx.fill();
      } else if (item.type === 'power_pellet') {
        // Glowing pulsing power pellet
        const pulse = 1 + Math.sin(this.animTimer * 8) * 0.25;
        const radius = ts * 0.38 * pulse;

        const grad = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.5);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.4, '#fde047');
        grad.addColorStop(1, 'rgba(245, 158, 11, 0)');

        ctx.fillStyle = grad;
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 1.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy, ts * 0.26, 0, Math.PI * 2);
        ctx.fill();
      } else if (item.type === 'cherry') {
        this.drawCherry(cx, cy, ts);
      } else if (item.type === 'apple') {
        this.drawApple(cx, cy, ts);
      } else if (item.type === 'strawberry') {
        this.drawStrawberry(cx, cy, ts);
      } else if (item.type === 'speed_shoe') {
        this.drawSpeedShoe(cx, cy, ts);
      } else if (item.type === 'hourglass') {
        this.drawHourglass(cx, cy, ts);
      }

      ctx.restore();
    }
  }

  private drawCherry(cx: number, cy: number, ts: number) {
    const ctx = this.ctx;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 8;

    // Two red cherries
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(cx - ts * 0.2, cy + ts * 0.12, ts * 0.2, 0, Math.PI * 2);
    ctx.arc(cx + ts * 0.2, cy + ts * 0.16, ts * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Cherry highlights
    ctx.fillStyle = '#fca5a5';
    ctx.beginPath();
    ctx.arc(cx - ts * 0.25, cy + ts * 0.08, ts * 0.07, 0, Math.PI * 2);
    ctx.arc(cx + ts * 0.15, cy + ts * 0.12, ts * 0.07, 0, Math.PI * 2);
    ctx.fill();

    // Stems joining at top
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - ts * 0.18, cy);
    ctx.quadraticCurveTo(cx, cy - ts * 0.35, cx + ts * 0.05, cy - ts * 0.35);
    ctx.moveTo(cx + ts * 0.18, cy + ts * 0.05);
    ctx.quadraticCurveTo(cx + ts * 0.1, cy - ts * 0.35, cx + ts * 0.05, cy - ts * 0.35);
    ctx.stroke();
  }

  private drawApple(cx: number, cy: number, ts: number) {
    const ctx = this.ctx;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 8;

    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(cx, cy + ts * 0.05, ts * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = '#f87171';
    ctx.beginPath();
    ctx.arc(cx - ts * 0.1, cy - ts * 0.05, ts * 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Stem and leaf
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - ts * 0.25);
    ctx.lineTo(cx + ts * 0.08, cy - ts * 0.38);
    ctx.stroke();

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.ellipse(cx + ts * 0.15, cy - ts * 0.32, ts * 0.1, ts * 0.05, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawStrawberry(cx: number, cy: number, ts: number) {
    const ctx = this.ctx;
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 8;

    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.moveTo(cx, cy + ts * 0.35);
    ctx.quadraticCurveTo(cx - ts * 0.32, cy - ts * 0.05, cx - ts * 0.22, cy - ts * 0.22);
    ctx.lineTo(cx + ts * 0.22, cy - ts * 0.22);
    ctx.quadraticCurveTo(cx + ts * 0.32, cy - ts * 0.05, cx, cy + ts * 0.35);
    ctx.fill();

    // Green cap
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.ellipse(cx, cy - ts * 0.24, ts * 0.2, ts * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();

    // Seeds
    ctx.fillStyle = '#fef08a';
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.arc(cx + i * ts * 0.12, cy, ts * 0.035, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawSpeedShoe(cx: number, cy: number, ts: number) {
    const ctx = this.ctx;
    const bounce = Math.sin(this.animTimer * 6) * 3;
    const y = cy + bounce;

    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 10;

    // Cyan sneaker
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.roundRect(cx - ts * 0.3, y - ts * 0.1, ts * 0.6, ts * 0.25, 4);
    ctx.fill();

    // White sole
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - ts * 0.32, y + ts * 0.1, ts * 0.64, ts * 0.08);

    // Speed wings / trails
    ctx.strokeStyle = '#67e8f9';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - ts * 0.38, y - ts * 0.05);
    ctx.lineTo(cx - ts * 0.18, y - ts * 0.2);
    ctx.moveTo(cx - ts * 0.42, y + ts * 0.05);
    ctx.lineTo(cx - ts * 0.24, y - ts * 0.1);
    ctx.stroke();
  }

  private drawHourglass(cx: number, cy: number, ts: number) {
    const ctx = this.ctx;
    const rotate = (Math.sin(this.animTimer * 2) * 0.1);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotate);

    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 10;

    // Glowing cyan / ice hourglass frame
    ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(-ts * 0.25, -ts * 0.3);
    ctx.lineTo(ts * 0.25, -ts * 0.3);
    ctx.lineTo(-ts * 0.25, ts * 0.3);
    ctx.lineTo(ts * 0.25, ts * 0.3);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();

    // Golden / blue sand inside
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, ts * 0.16, ts * 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Draw Snake player character
  public drawSnake(
    segments: SnakeSegment[],
    headFloatX: number,
    headFloatY: number,
    speedBoost: boolean = false,
    isFrozen: boolean = false,
    isHurt: boolean = false
  ) {
    if (!segments || segments.length === 0) return;
    const ctx = this.ctx;
    const ts = this.tileSize;
    const ox = this.offsetX;
    const oy = this.offsetY;
    const hurtFlash = isHurt && Math.floor(this.animTimer * 16) % 2 === 0;

    ctx.save();

    // Draw snake body segments from tail to head
    for (let i = segments.length - 1; i >= 0; i--) {
      const seg = segments[i];
      const isHead = i === 0;
      const isTail = i === segments.length - 1;

      const cx = ox + (isHead ? headFloatX : seg.x) * ts + ts / 2;
      const cy = oy + (isHead ? headFloatY : seg.y) * ts + ts / 2;

      if (isHead) {
        // Snake Head
        ctx.save();
        ctx.translate(cx, cy);

        // Rotate head according to direction
        let angle = 0;
        if (seg.dir === 'RIGHT') angle = 0;
        else if (seg.dir === 'DOWN') angle = Math.PI / 2;
        else if (seg.dir === 'LEFT') angle = Math.PI;
        else if (seg.dir === 'UP') angle = -Math.PI / 2;

        ctx.rotate(angle);

        // Head glow
        ctx.shadowColor = hurtFlash ? '#ef4444' : (isFrozen ? '#38bdf8' : (speedBoost ? '#38bdf8' : '#10b981'));
        ctx.shadowBlur = hurtFlash ? 18 : 12;

        // Head ellipse / rounded shape
        ctx.fillStyle = hurtFlash ? '#ef4444' : (isFrozen ? '#7dd3fc' : (speedBoost ? '#06b6d4' : '#10b981'));
        ctx.beginPath();
        ctx.ellipse(0, 0, ts * 0.44, ts * 0.36, 0, 0, Math.PI * 2);
        ctx.fill();

        // Inner glowing core
        ctx.fillStyle = hurtFlash ? '#fee2e2' : (isFrozen ? '#e0f2fe' : '#6ee7b7');
        ctx.beginPath();
        ctx.ellipse(ts * 0.05, 0, ts * 0.3, ts * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();

        // Expressive eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ts * 0.15, -ts * 0.18, ts * 0.11, 0, Math.PI * 2);
        ctx.arc(ts * 0.15, ts * 0.18, ts * 0.11, 0, Math.PI * 2);
        ctx.fill();

        // Black pupils
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(ts * 0.2, -ts * 0.18, ts * 0.06, 0, Math.PI * 2);
        ctx.arc(ts * 0.2, ts * 0.18, ts * 0.06, 0, Math.PI * 2);
        ctx.fill();

        // Flicking red tongue
        const tongueOut = Math.sin(this.animTimer * 12) > 0.2;
        if (tongueOut) {
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(ts * 0.4, 0);
          ctx.lineTo(ts * 0.65, 0);
          ctx.lineTo(ts * 0.75, -ts * 0.08);
          ctx.moveTo(ts * 0.65, 0);
          ctx.lineTo(ts * 0.75, ts * 0.08);
          ctx.stroke();
        }

        ctx.restore();
      } else {
        // Body segment
        const factor = 1 - (i / segments.length) * 0.25;
        const radius = (isTail ? ts * 0.26 : ts * 0.34) * factor;

        ctx.shadowColor = hurtFlash ? '#ef4444' : (speedBoost ? '#06b6d4' : '#059669');
        ctx.shadowBlur = 8;

        // Outer neon green or hurt red
        ctx.fillStyle = hurtFlash ? '#f87171' : (speedBoost ? '#0ea5e9' : '#10b981');
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner glowing core
        ctx.fillStyle = hurtFlash ? '#fca5a5' : (speedBoost ? '#bae6fd' : '#a7f3d0');
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2);
        ctx.fill();

        // Connect adjacent segment with thick line to eliminate gaps
        if (i > 0) {
          const prevSeg = segments[i - 1];
          const px = ox + (i === 1 ? headFloatX : prevSeg.x) * ts + ts / 2;
          const py = oy + (i === 1 ? headFloatY : prevSeg.y) * ts + ts / 2;

          // Don't connect if wrapped around edges
          if (Math.abs(prevSeg.x - seg.x) <= 1.5 && Math.abs(prevSeg.y - seg.y) <= 1.5) {
            ctx.strokeStyle = hurtFlash ? '#ef4444' : (speedBoost ? '#0ea5e9' : '#10b981');
            ctx.lineWidth = radius * 1.8;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(px, py);
            ctx.stroke();
          }
        }
      }
    }

    ctx.restore();
  }

  // Draw Pac-Man player character
  public drawPacman(
    x: number,
    y: number,
    dir: Direction,
    mouthPhase: number,
    speedBoost: boolean = false,
    isFrozen: boolean = false
  ) {
    const ctx = this.ctx;
    const ts = this.tileSize;
    const cx = this.offsetX + x * ts + ts / 2;
    const cy = this.offsetY + y * ts + ts / 2;

    ctx.save();
    ctx.translate(cx, cy);

    // If frozen, draw ice enclosure
    if (isFrozen) {
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 16;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.beginPath();
      ctx.roundRect(-ts * 0.48, -ts * 0.45, ts * 0.96, ts * 0.9, 8);
      ctx.fill();

      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Rotation based on direction
    let angle = 0;
    if (dir === 'RIGHT') angle = 0;
    else if (dir === 'DOWN') angle = Math.PI / 2;
    else if (dir === 'LEFT') angle = Math.PI;
    else if (dir === 'UP') angle = -Math.PI / 2;

    ctx.rotate(angle);

    ctx.shadowColor = isFrozen ? '#38bdf8' : (speedBoost ? '#38bdf8' : '#fbbf24');
    ctx.shadowBlur = 14;

    const mouthAngle = isFrozen ? 0.05 : 0.25 * Math.abs(Math.sin(mouthPhase * 8)) * Math.PI;

    // Yellow Pac-Man body
    ctx.fillStyle = isFrozen ? '#7dd3fc' : (speedBoost ? '#67e8f9' : '#facc15');
    ctx.beginPath();
    ctx.arc(0, 0, ts * 0.44, mouthAngle, Math.PI * 2 - mouthAngle);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    // Glowing eye
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(ts * 0.05, -ts * 0.22, ts * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Eye highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ts * 0.07, -ts * 0.24, ts * 0.03, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Draw Rival NPC: The Fox (搶食狐狸)
  public drawRivalFox(fox: RivalNPC) {
    if (!fox) return;
    const ctx = this.ctx;
    const ts = this.tileSize;
    const cx = this.offsetX + fox.x * ts + ts / 2;
    const cy = this.offsetY + fox.y * ts + ts / 2;

    ctx.save();
    ctx.translate(cx, cy);

    // Rotation or direction flip
    let angle = 0;
    if (fox.dir === 'RIGHT') angle = 0;
    else if (fox.dir === 'DOWN') angle = Math.PI / 2;
    else if (fox.dir === 'LEFT') angle = Math.PI;
    else if (fox.dir === 'UP') angle = -Math.PI / 2;

    ctx.rotate(angle);

    // If frozen, draw ice aura
    if (fox.isFrozen) {
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 16;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.beginPath();
      ctx.roundRect(-ts * 0.48, -ts * 0.45, ts * 0.96, ts * 0.9, 8);
      ctx.fill();

      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Frost sparkles
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 4; i++) {
        const sx = Math.sin(this.animTimer * 5 + i) * ts * 0.3;
        const sy = Math.cos(this.animTimer * 5 + i) * ts * 0.3;
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Aura based on active buffs
    const isSpeedBoosted = fox.speedBoostTimer && fox.speedBoostTimer > 0;
    const isFrenzy = fox.powerFrenzyTimer && fox.powerFrenzyTimer > 0;

    if (isFrenzy) {
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 18;
    } else if (isSpeedBoosted) {
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 16;
    } else {
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 10;
    }

    // Orange Fox body
    ctx.fillStyle = isFrenzy ? '#f59e0b' : (isSpeedBoosted ? '#fb923c' : '#ea580c');
    ctx.beginPath();
    ctx.ellipse(0, 0, ts * 0.38, ts * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Fox Pointed Ears
    ctx.fillStyle = '#c2410c';
    ctx.beginPath();
    ctx.moveTo(ts * 0.05, -ts * 0.22);
    ctx.lineTo(ts * 0.25, -ts * 0.48);
    ctx.lineTo(ts * 0.35, -ts * 0.2);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(ts * 0.05, ts * 0.22);
    ctx.lineTo(ts * 0.25, ts * 0.48);
    ctx.lineTo(ts * 0.35, ts * 0.2);
    ctx.closePath();
    ctx.fill();

    // White inner ears
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.moveTo(ts * 0.12, -ts * 0.24);
    ctx.lineTo(ts * 0.24, -ts * 0.4);
    ctx.lineTo(ts * 0.3, -ts * 0.22);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(ts * 0.12, ts * 0.24);
    ctx.lineTo(ts * 0.24, ts * 0.4);
    ctx.lineTo(ts * 0.3, ts * 0.22);
    ctx.closePath();
    ctx.fill();

    // White snout/cheeks
    ctx.fillStyle = '#ffedd5';
    ctx.beginPath();
    ctx.moveTo(ts * 0.15, -ts * 0.16);
    ctx.lineTo(ts * 0.42, 0);
    ctx.lineTo(ts * 0.15, ts * 0.16);
    ctx.closePath();
    ctx.fill();

    // Black nose tip
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.arc(ts * 0.42, 0, ts * 0.06, 0, Math.PI * 2);
    ctx.fill();

    // Sharp eyes
    ctx.fillStyle = '#431407';
    ctx.beginPath();
    ctx.arc(ts * 0.2, -ts * 0.1, ts * 0.055, 0, Math.PI * 2);
    ctx.arc(ts * 0.2, ts * 0.1, ts * 0.055, 0, Math.PI * 2);
    ctx.fill();

    // Bushy tail with white tip wiggling behind
    const tailWiggle = Math.sin(this.animTimer * 10) * 0.15;
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.ellipse(-ts * 0.35, tailWiggle * ts, ts * 0.24, ts * 0.15, Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    // White tail tip
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-ts * 0.5, tailWiggle * ts, ts * 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Draw Ghosts (Blinky, Pinky, Inky, Clyde)
  public drawGhosts(ghosts: Ghost[], frightenedTimer: number) {
    if (!ghosts || ghosts.length === 0) return;
    const ctx = this.ctx;
    const ts = this.tileSize;
    const ox = this.offsetX;
    const oy = this.offsetY;

    for (const ghost of ghosts) {
      const cx = ox + ghost.x * ts + ts / 2;
      const cy = oy + ghost.y * ts + ts / 2;

      ctx.save();
      ctx.translate(cx, cy);

      if (ghost.state === 'EATEN') {
        // Just floating glowing eyes
        this.drawGhostEyes(ghost.dir, ts);
      } else if (ghost.state === 'FRIGHTENED') {
        // Wavy blue/white scared ghost
        const isFlashing = frightenedTimer <= 2.5 && Math.floor(this.animTimer * 8) % 2 === 0;
        const ghostColor = isFlashing ? '#ffffff' : '#3b82f6';
        const shadowColor = isFlashing ? '#ffffff' : '#60a5fa';

        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = 12;

        this.drawGhostBody(ghostColor, ts);
        this.drawScaredFace(ts, isFlashing);
      } else {
        // Normal colored ghost
        ctx.shadowColor = ghost.color;
        ctx.shadowBlur = 12;

        this.drawGhostBody(ghost.color, ts);
        this.drawGhostEyes(ghost.dir, ts);
      }

      ctx.restore();
    }
  }

  private drawGhostBody(color: string, ts: number) {
    const ctx = this.ctx;
    const w = ts * 0.42;
    const h = ts * 0.44;

    ctx.fillStyle = color;
    ctx.beginPath();
    // Top dome
    ctx.arc(0, -h * 0.1, w, Math.PI, 0, false);
    // Right side
    ctx.lineTo(w, h * 0.7);

    // Wavy skirt at the bottom
    const waves = 3;
    const step = (w * 2) / waves;
    for (let i = 0; i < waves; i++) {
      const xStart = w - i * step;
      const xEnd = xStart - step;
      const waveDip = (i % 2 === 0) ? h * 0.95 : h * 0.65;
      ctx.quadraticCurveTo(xStart - step / 2, waveDip, xEnd, h * 0.7);
    }

    ctx.lineTo(-w, -h * 0.1);
    ctx.closePath();
    ctx.fill();
  }

  private drawGhostEyes(dir: Direction, ts: number) {
    const ctx = this.ctx;

    let dx = 0;
    let dy = 0;
    if (dir === 'RIGHT') dx = ts * 0.06;
    else if (dir === 'LEFT') dx = -ts * 0.06;
    else if (dir === 'UP') dy = -ts * 0.06;
    else if (dir === 'DOWN') dy = ts * 0.06;

    // Eyeballs
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-ts * 0.18, -ts * 0.12, ts * 0.13, ts * 0.16, 0, 0, Math.PI * 2);
    ctx.ellipse(ts * 0.18, -ts * 0.12, ts * 0.13, ts * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Blue pupils looking in direction
    ctx.fillStyle = '#1d4ed8';
    ctx.beginPath();
    ctx.arc(-ts * 0.18 + dx, -ts * 0.12 + dy, ts * 0.07, 0, Math.PI * 2);
    ctx.arc(ts * 0.18 + dx, -ts * 0.12 + dy, ts * 0.07, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawScaredFace(ts: number, isWhite: boolean) {
    const ctx = this.ctx;
    const eyeColor = isWhite ? '#dc2626' : '#f59e0b';

    // Scared tiny dots for eyes
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.arc(-ts * 0.15, -ts * 0.1, ts * 0.06, 0, Math.PI * 2);
    ctx.arc(ts * 0.15, -ts * 0.1, ts * 0.06, 0, Math.PI * 2);
    ctx.fill();

    // Wavy wiggly mouth
    ctx.strokeStyle = eyeColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-ts * 0.22, ts * 0.16);
    ctx.lineTo(-ts * 0.11, ts * 0.22);
    ctx.lineTo(0, ts * 0.16);
    ctx.lineTo(ts * 0.11, ts * 0.22);
    ctx.lineTo(ts * 0.22, ts * 0.16);
    ctx.stroke();
  }

  // Draw particle system
  public drawParticles(particles: Particle[]) {
    if (!particles || particles.length === 0) return;
    const ctx = this.ctx;
    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Draw floating score popups
  public drawScorePopups(popups: ScorePopup[]) {
    if (!popups || popups.length === 0) return;
    const ctx = this.ctx;
    for (const pop of popups) {
      ctx.save();
      ctx.globalAlpha = pop.alpha;
      ctx.fillStyle = pop.color;
      ctx.shadowColor = pop.color;
      ctx.shadowBlur = 8;
      ctx.font = 'bold 12px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(pop.text, pop.x, pop.y);
      ctx.restore();
    }
  }
}
