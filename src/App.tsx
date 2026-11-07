import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CharacterType, Direction, GameState } from './types/game';
import { GameEngine } from './game/gameEngine';
import { MazeRenderer } from './game/renderer';
import { soundManager } from './audio/soundManager';
import { GameHud } from './components/GameHud';
import { BottomControls } from './components/BottomControls';
import { TitleScreen } from './components/TitleScreen';
import { CharacterSelectModal } from './components/CharacterSelectModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { ConceptArtModal } from './components/ConceptArtModal';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Game UI State
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [characterType, setCharacterType] = useState<CharacterType>('snake');
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [proceduralSize, setProceduralSize] = useState<'MINI' | 'STANDARD' | 'EXPANSIVE'>('STANDARD');
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [rivalScore, setRivalScore] = useState<number>(0);
  const [playerLives, setPlayerLives] = useState<number>(3);
  const [timeRemaining, setTimeRemaining] = useState<number>(60);
  const [highScore, setHighScore] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getMuted());
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [activeBuffs, setActiveBuffs] = useState<{
    speed: number;
    freeze: number;
    powerPellet: number;
    playerFrozen?: number;
    rivalSpeed?: number;
    rivalFrenzy?: number;
  }>({
    speed: 0,
    freeze: 0,
    powerPellet: 0,
    playerFrozen: 0,
    rivalSpeed: 0,
    rivalFrenzy: 0,
  });

  // Modal overlays
  const [showCharSelect, setShowCharSelect] = useState<boolean>(false);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [showConceptArt, setShowConceptArt] = useState<boolean>(false);
  const [gameOverReason, setGameOverReason] = useState<string>('');

  // Engine & Renderer refs
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<MazeRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Load high score
  useEffect(() => {
    try {
      const saved = localStorage.getItem('snake_pacman_highscore');
      if (saved) setHighScore(parseInt(saved, 10) || 0);
    } catch {
      // ignore
    }
  }, []);

  const saveHighScore = useCallback((score: number) => {
    setHighScore(prev => {
      if (score > prev) {
        try {
          localStorage.setItem('snake_pacman_highscore', String(score));
        } catch {
          // ignore
        }
        return score;
      }
      return prev;
    });
  }, []);

  // Canvas resize and render setup
  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const mapConfig = engineRef.current?.mapConfig;
    const cols = mapConfig ? mapConfig.cols : 28;
    const rows = mapConfig ? mapConfig.rows : 21;

    const targetAspect = cols / rows;
    let width = containerWidth;
    let height = containerWidth / targetAspect;

    if (height > containerHeight) {
      height = containerHeight;
      width = height * targetAspect;
    }

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${Math.floor(width)}px`;
    canvas.style.height = `${Math.floor(height)}px`;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    if (!rendererRef.current) {
      rendererRef.current = new MazeRenderer(ctx, width, height, cols, rows);
    } else {
      rendererRef.current.setDimensions(width, height, cols, rows);
    }

    if (engineRef.current) {
      const tileSize = rendererRef.current.getTileSize();
      const offsetX = rendererRef.current.getOffsetX();
      const offsetY = rendererRef.current.getOffsetY();
      engineRef.current.setTileSize(tileSize, offsetX, offsetY);

      if (engineRef.current.mapConfig) {
        rendererRef.current.setTheme(
          engineRef.current.mapConfig.themeColor,
          engineRef.current.mapConfig.glowColor,
          engineRef.current.mapConfig.wallFillColor
        );
      }
    }
  }, []);

  // Initialize Game Engine instance
  useEffect(() => {
    const engine = new GameEngine({
      onScoreUpdate: (pScore, rScore) => {
        setPlayerScore(pScore);
        setRivalScore(rScore);
      },
      onLivesUpdate: (lives) => {
        setPlayerLives(lives);
      },
      onTimeUpdate: (time) => {
        setTimeRemaining(time);
      },
      onGameOver: (pScore, rScore, reason) => {
        saveHighScore(pScore);
        setGameOverReason(reason);
        setGameState('GAME_OVER');
      },
      onVictory: (pScore, rScore) => {
        saveHighScore(pScore);
        setGameState('VICTORY');
      },
      onActiveBuffsUpdate: (buffs) => {
        setActiveBuffs(buffs);
      },
    });

    engineRef.current = engine;

    return () => {
      engine.stop();
    };
  }, [saveHighScore]);

  // Window resize listener
  useEffect(() => {
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [updateCanvasSize]);

  // Main 60fps Game Loop
  useEffect(() => {
    let running = true;

    const gameLoop = (timestamp: number) => {
      if (!running) return;

      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
      }
      const rawDt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;
      const dt = Math.min(rawDt, 0.05);

      const engine = engineRef.current;
      const renderer = rendererRef.current;

      if (engine && renderer) {
        if (gameState === 'PLAYING' && !isPaused) {
          engine.update(dt);
        }
        renderer.update(dt);

        renderer.clear();
        if (engine.map && engine.map.length > 0) {
          renderer.drawMaze(engine.map);
          renderer.drawItems(engine.items);

          if (engine.characterType === 'snake') {
            renderer.drawSnake(
              engine.snakeSegments,
              engine.playerFloatX,
              engine.playerFloatY,
              engine.speedBoostTimer > 0,
              engine.playerFreezeTimer > 0,
              engine.snakeBiteCooldown > 0
            );
          } else {
            renderer.drawPacman(
              engine.playerFloatX,
              engine.playerFloatY,
              engine.playerDir,
              engine.mouthPhase,
              engine.speedBoostTimer > 0,
              engine.playerFreezeTimer > 0
            );
          }

          renderer.drawRivalFox(engine.rival);
          renderer.drawGhosts(engine.ghosts, engine.frightenedTimer);
          renderer.drawParticles(engine.particles);
          renderer.drawScorePopups(engine.popups);
        }
      }

      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      running = false;
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [gameState, isPaused]);

  // Keyboard navigation & controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      soundManager.userGesture();

      if (gameState === 'TITLE') {
        if (e.code === 'Enter' || e.code === 'Space') {
          handleStartGame();
          e.preventDefault();
        }
        return;
      }

      const engine = engineRef.current;
      if (!engine) return;

      if (e.code === 'KeyP' || e.code === 'Escape') {
        handleTogglePause();
        e.preventDefault();
        return;
      }

      if (e.code === 'Space') {
        engine.triggerActiveAbility();
        e.preventDefault();
        return;
      }

      let dir: Direction | null = null;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') dir = 'UP';
      else if (e.code === 'ArrowDown' || e.code === 'KeyS') dir = 'DOWN';
      else if (e.code === 'ArrowLeft' || e.code === 'KeyA') dir = 'LEFT';
      else if (e.code === 'ArrowRight' || e.code === 'KeyD') dir = 'RIGHT';

      if (dir) {
        engine.setPlayerDirection(dir);
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState, isPaused]);

  const syncThemeWithRenderer = () => {
    if (rendererRef.current && engineRef.current?.mapConfig) {
      rendererRef.current.setTheme(
        engineRef.current.mapConfig.themeColor,
        engineRef.current.mapConfig.glowColor,
        engineRef.current.mapConfig.wallFillColor
      );
    }
  };

  // Actions
  const handleStartGame = () => {
    soundManager.userGesture();
    soundManager.playClick();
    if (engineRef.current) {
      engineRef.current.initGame(characterType, currentLevel, proceduralSize);
      updateCanvasSize();
      syncThemeWithRenderer();
      engineRef.current.start();
    }
    setGameState('PLAYING');
    setIsPaused(false);
  };

  const handleTogglePause = () => {
    soundManager.playClick();
    setIsPaused(prev => {
      const next = !prev;
      if (engineRef.current) {
        if (next) engineRef.current.pause();
        else engineRef.current.resume();
      }
      return next;
    });
  };

  const handleToggleMute = () => {
    soundManager.userGesture();
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleSelectDirection = (dir: Direction) => {
    soundManager.userGesture();
    if (engineRef.current) {
      engineRef.current.setPlayerDirection(dir);
    }
  };

  const handleTriggerAbility = () => {
    soundManager.userGesture();
    if (engineRef.current) {
      engineRef.current.triggerActiveAbility();
    }
  };

  const handleNextLevel = () => {
    soundManager.playClick();
    const nextLvl = currentLevel < 5 ? currentLevel + 1 : 1;
    setCurrentLevel(nextLvl);
    if (engineRef.current) {
      engineRef.current.initGame(characterType, nextLvl, proceduralSize);
      updateCanvasSize();
      syncThemeWithRenderer();
      engineRef.current.start();
    }
    setGameState('PLAYING');
  };

  const handlePlayAgain = () => {
    soundManager.playClick();
    if (engineRef.current) {
      engineRef.current.initGame(characterType, currentLevel, proceduralSize);
      updateCanvasSize();
      syncThemeWithRenderer();
      engineRef.current.start();
    }
    setGameState('PLAYING');
  };

  const handleReturnTitle = () => {
    soundManager.playClick();
    if (engineRef.current) {
      engineRef.current.stop();
    }
    setGameState('TITLE');
    setIsPaused(false);
  };

  const activeMapConfig = engineRef.current?.mapConfig;

  return (
    <div className="relative w-screen h-screen bg-[#050811] text-slate-100 flex flex-col justify-between overflow-hidden font-mono select-none">
      {/* Background CRT scanlines effect */}
      <div className="absolute inset-0 crt-scanlines pointer-events-none z-10" />

      {/* Top HUD (Rendered in Playing / Paused) */}
      <GameHud
        playerScore={playerScore}
        rivalScore={rivalScore}
        playerLives={playerLives}
        timeRemaining={timeRemaining}
        currentLevel={currentLevel}
        mapBadge={activeMapConfig?.sizeBadge}
        mapName={activeMapConfig?.name}
        characterType={characterType}
        activeBuffs={activeBuffs}
        isMuted={isMuted}
        isPaused={isPaused}
        onToggleMute={handleToggleMute}
        onTogglePause={handleTogglePause}
        onOpenHowToPlay={() => setShowHowToPlay(true)}
      />

      {/* Center Game Arena Viewport */}
      <main
        ref={containerRef}
        className="flex-1 w-full flex items-center justify-center p-1 sm:p-2 relative overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          className="rounded-lg shadow-[0_0_30px_rgba(0,240,255,0.15)] border border-cyan-500/20 max-w-full max-h-full"
        />

        {/* Paused Overlay */}
        {isPaused && gameState === 'PLAYING' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-xs">
            <div className="bg-[#070e1e] border-2 border-cyan-400 p-6 rounded-2xl text-center shadow-[0_0_30px_rgba(0,240,255,0.4)]">
              <h3 className="font-arcade text-xl sm:text-2xl text-cyan-300 tracking-wider mb-4 animate-pulse">
                PAUSED (暫停)
              </h3>
              <p className="text-xs text-slate-400 mb-6 font-mono">
                Press 'P' or 'ESC' or click Resume below to continue.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleTogglePause}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-arcade text-xs font-bold shadow-[0_0_15px_#00f0ff] cursor-pointer"
                >
                  RESUME
                </button>
                <button
                  onClick={handleReturnTitle}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold cursor-pointer"
                >
                  QUIT TO TITLE
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Controls */}
      <BottomControls
        characterType={characterType}
        onTriggerAbility={handleTriggerAbility}
        onSetDirection={handleSelectDirection}
        speedBoostRemaining={activeBuffs.speed}
      />

      {/* Title Screen Overlay */}
      {gameState === 'TITLE' && (
        <TitleScreen
          selectedCharacter={characterType}
          highScore={highScore}
          currentLevel={currentLevel}
          proceduralSize={proceduralSize}
          isMuted={isMuted}
          onStartGame={handleStartGame}
          onOpenCharacterSelect={() => setShowCharSelect(true)}
          onOpenHowToPlay={() => setShowHowToPlay(true)}
          onOpenConceptArt={() => setShowConceptArt(true)}
          onSelectLevel={(lvl) => setCurrentLevel(lvl)}
          onSelectProceduralSize={(sz) => setProceduralSize(sz)}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Character Select Modal */}
      {showCharSelect && (
        <CharacterSelectModal
          selectedCharacter={characterType}
          onSelect={(char) => setCharacterType(char)}
          onConfirm={() => setShowCharSelect(false)}
          onClose={() => setShowCharSelect(false)}
        />
      )}

      {/* How To Play Modal */}
      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}

      {/* Concept Art Modal */}
      {showConceptArt && (
        <ConceptArtModal onClose={() => setShowConceptArt(false)} />
      )}

      {/* Victory Modal */}
      {gameState === 'VICTORY' && (
        <VictoryModal
          playerScore={playerScore}
          rivalScore={rivalScore}
          timeRemaining={timeRemaining}
          characterType={characterType}
          currentLevel={currentLevel}
          mapBadge={activeMapConfig?.sizeBadge}
          mapName={activeMapConfig?.name}
          onNextLevel={handleNextLevel}
          onPlayAgain={handlePlayAgain}
          onReturnTitle={handleReturnTitle}
        />
      )}

      {/* Game Over Modal */}
      {gameState === 'GAME_OVER' && (
        <GameOverModal
          playerScore={playerScore}
          rivalScore={rivalScore}
          reason={gameOverReason}
          characterType={characterType}
          onRetry={handlePlayAgain}
          onOpenCharacterSelect={() => {
            setShowCharSelect(true);
            setGameState('TITLE');
          }}
          onReturnTitle={handleReturnTitle}
        />
      )}
    </div>
  );
}
