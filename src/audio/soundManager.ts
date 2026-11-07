/**
 * Web Audio API procedural synthesizer for Snake x Pac-Man arcade audio.
 * Zero external audio file dependencies, zero loading latency, pure retro synthesis.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isBgmPlaying: boolean = false;
  private bgmIntervalId: number | null = null;
  private wakaPitchToggle: boolean = false;

  constructor() {
    // Read user mute preference
    try {
      const savedMute = localStorage.getItem('snake_pacman_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
    } catch {
      this.isMuted = false;
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.bgmGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.bgmGain.gain.value = this.isMuted ? 0 : 0.15;
      this.sfxGain.gain.value = this.isMuted ? 0 : 0.35;

      this.bgmGain.connect(this.ctx.destination);
      this.sfxGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public userGesture() {
    this.initContext();
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('snake_pacman_muted', String(this.isMuted));
    } catch {
      // ignore
    }

    if (this.bgmGain && this.sfxGain) {
      const t = this.ctx ? this.ctx.currentTime : 0;
      this.bgmGain.gain.setValueAtTime(this.isMuted ? 0 : 0.15, t);
      this.sfxGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, t);
    }

    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Chomp sound (classic waka-waka alternate pitch)
  public playChomp(isSnake: boolean = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    this.wakaPitchToggle = !this.wakaPitchToggle;
    const baseFreq = isSnake 
      ? (this.wakaPitchToggle ? 320 : 380) 
      : (this.wakaPitchToggle ? 440 : 520);

    osc.type = isSnake ? 'triangle' : 'square';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, t + 0.07);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.075);
  }

  // Snake body stretch sound
  public playSnakeStretch() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.12);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  // Power pellet pickup
  public playPowerPellet() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.linearRampToValueAtTime(650, t + 0.25);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.32);
  }

  // Eat ghost crunchy arcade sound
  public playEatGhost() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    [300, 480, 720, 960].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      const start = t + idx * 0.06;
      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, start + 0.08);

      gain.gain.setValueAtTime(0.25, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(start);
      osc.stop(start + 0.09);
    });
  }

  // Fruit pickup chime
  public playFruit() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const start = t + i * 0.07;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.22, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(start);
      osc.stop(start + 0.16);
    });
  }

  // Speed boost whoosh
  public playSpeedBoost() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.3);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.32);
  }

  // Freeze Hourglass crystal sound
  public playFreeze() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(700, t + 0.35);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.36);
  }

  // Player death descending arcade jingle
  public playDeath() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const freqs = [659, 622, 587, 554, 523, 493, 466, 440, 415, 392, 349, 293, 220, 160];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const start = t + idx * 0.055;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.07);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(start);
      osc.stop(start + 0.075);
    });
  }

  // Level victory fanfare
  public playVictory() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    // C4 - E4 - G4 - C5 - E5 - G5 - C6 triumph
    const melody = [
      { f: 523.25, d: 0.1 },
      { f: 523.25, d: 0.1 },
      { f: 523.25, d: 0.1 },
      { f: 659.25, d: 0.25 },
      { f: 783.99, d: 0.25 },
      { f: 1046.5, d: 0.5 },
    ];

    let currentT = t;
    melody.forEach(note => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, currentT);

      gain.gain.setValueAtTime(0.25, currentT);
      gain.gain.exponentialRampToValueAtTime(0.001, currentT + note.d);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(currentT);
      osc.stop(currentT + note.d + 0.02);

      currentT += note.d + 0.04;
    });
  }

  // Button click / UI select
  public playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.04);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.045);
  }

  // Snake bites its own body: buzz hurt crunch SFX
  public playBiteSelf() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(75, t + 0.18);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.19);
  }

  // Start background retro electro synth loop
  public startBGM() {
    if (this.isBgmPlaying) return;
    this.isBgmPlaying = true;
    this.initContext();

    // 8-step bassline sequence loop
    const bassline = [110, 110, 130.81, 146.83, 110, 110, 98, 123.47];
    let step = 0;

    this.bgmIntervalId = window.setInterval(() => {
      if (!this.ctx || !this.bgmGain || this.isMuted) return;
      const t = this.ctx.currentTime;

      // Bass note
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, t);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(bassline[step % bassline.length], t);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(t);
      osc.stop(t + 0.18);

      step++;
    }, 180);
  }

  public stopBGM() {
    if (this.bgmIntervalId !== null) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
    this.isBgmPlaying = false;
  }
}

export const soundManager = new SoundManager();
