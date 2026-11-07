import React from 'react';
import { CharacterType } from '../types/game';
import { Heart, Volume2, VolumeX, Pause, Play, Sparkles, Snowflake, Zap } from 'lucide-react';

interface GameHudProps {
  playerScore: number;
  rivalScore: number;
  playerLives: number;
  timeRemaining: number;
  currentLevel: number;
  mapBadge?: string;
  mapName?: string;
  characterType: CharacterType;
  activeBuffs: {
    speed: number;
    freeze: number;
    powerPellet: number;
    playerFrozen?: number;
    rivalSpeed?: number;
    rivalFrenzy?: number;
  };
  isMuted: boolean;
  isPaused: boolean;
  onToggleMute: () => void;
  onTogglePause: () => void;
  onOpenHowToPlay: () => void;
}

export const GameHud: React.FC<GameHudProps> = ({
  playerScore,
  rivalScore,
  playerLives,
  timeRemaining,
  currentLevel,
  mapBadge,
  mapName,
  characterType,
  activeBuffs,
  isMuted,
  isPaused,
  onToggleMute,
  onTogglePause,
  onOpenHowToPlay,
}) => {
  // Format MM:SS
  const mins = Math.floor(timeRemaining / 60);
  const secs = timeRemaining % 60;
  const timeFormatted = `00:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  // Tug-of-war score calculation
  const totalScore = Math.max(1, playerScore + rivalScore);
  const playerPercent = Math.min(100, Math.max(0, (playerScore / totalScore) * 100));

  const isPlayerWinning = playerScore >= rivalScore;

  return (
    <header className="w-full bg-[#070d1c]/90 border-b border-cyan-500/30 px-3 sm:px-6 py-2.5 flex flex-col gap-2 select-none">
      {/* Top row: Player stats, Timer, Rival stats */}
      <div className="flex items-center justify-between gap-2 max-w-5xl mx-auto w-full">
        {/* Player cluster */}
        <div className="flex items-center gap-2.5 min-w-[130px] sm:min-w-[200px]">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center border font-bold text-lg ${
              characterType === 'snake'
                ? 'bg-emerald-950/80 border-emerald-400 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                : 'bg-amber-950/80 border-amber-400 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
            }`}
          >
            {characterType === 'snake' ? '🐍' : '🟡'}
          </div>

          <div className="flex flex-col">
            <span
              className={`text-[10px] sm:text-xs tracking-wider uppercase font-semibold ${
                characterType === 'snake' ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              PLAYER ({characterType === 'snake' ? 'SNAKE' : 'PAC-MAN'})
            </span>
            <span className="font-arcade text-sm sm:text-lg text-white tabular-nums tracking-wider drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
              {playerScore.toLocaleString()}
            </span>
            {/* Lives Hearts or Frozen warning */}
            <div className="flex items-center gap-1 mt-0.5">
              {[1, 2, 3].map(i => (
                <Heart
                  key={i}
                  size={14}
                  className={
                    i <= playerLives
                      ? 'text-rose-500 fill-rose-500 filter drop-shadow-[0_0_4px_rgba(244,63,94,0.8)]'
                      : 'text-slate-700'
                  }
                />
              ))}
              {activeBuffs.playerFrozen !== undefined && activeBuffs.playerFrozen > 0 && (
                <span className="ml-1 text-[9px] font-bold text-sky-300 bg-sky-950/80 border border-sky-400/80 px-1 rounded animate-pulse">
                  ❄ FROZEN!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center Timer & Level */}
        <div className="flex flex-col items-center justify-center">
          <div className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold mb-0.5 flex items-center gap-1.5">
            <span>TIME LEFT</span>
            <span className="text-slate-600">·</span>
            <span className={currentLevel === 2 ? 'text-amber-400 font-bold' : (currentLevel === 5 ? 'text-orange-400 font-bold animate-pulse' : 'text-cyan-300')}>
              {mapName && mapBadge
                ? `${mapName} · [${mapBadge}]`
                : currentLevel === 5
                ? '🎲 隨機迷宮'
                : currentLevel === 2
                ? '微型角鬥場 · [迷你 19×15]'
                : currentLevel === 3
                ? '雙子星競技場 · [雙環 28×21]'
                : currentLevel === 4
                ? '賽博迷宮神殿 · [廣闊 31×21]'
                : '霓虹街機 · [標準 28×21]'}
            </span>
          </div>
          <div className="bg-[#040814] border border-cyan-500/50 rounded px-2.5 py-0.5 text-cyan-300 font-arcade text-xs sm:text-base tracking-widest shadow-[0_0_10px_rgba(0,240,255,0.3)] tabular-nums">
            {timeFormatted}
          </div>

          {/* Active Buffs indicator */}
          <div className="flex items-center gap-1.5 mt-1 h-5">
            {activeBuffs.playerFrozen !== undefined && activeBuffs.playerFrozen > 0 ? (
              <span className="flex items-center gap-1 text-[9px] text-cyan-200 bg-sky-950/90 border border-cyan-400 px-1.5 py-0.2 rounded font-mono font-bold animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.6)]">
                <Snowflake size={10} className="animate-spin text-cyan-300" /> FROZEN {Math.ceil(activeBuffs.playerFrozen)}s
              </span>
            ) : null}
            {activeBuffs.powerPellet > 0 && (
              <span className="flex items-center gap-0.5 text-[9px] text-amber-300 bg-amber-950/80 border border-amber-500/60 px-1.5 py-0.2 rounded font-mono animate-pulse">
                <Sparkles size={10} /> {Math.ceil(activeBuffs.powerPellet)}s
              </span>
            )}
            {activeBuffs.speed > 0 && (
              <span className="flex items-center gap-0.5 text-[9px] text-cyan-300 bg-cyan-950/80 border border-cyan-500/60 px-1.5 py-0.2 rounded font-mono animate-pulse">
                <Zap size={10} /> {Math.ceil(activeBuffs.speed)}s
              </span>
            )}
            {activeBuffs.freeze > 0 && (
              <span className="flex items-center gap-0.5 text-[9px] text-sky-300 bg-sky-950/80 border border-sky-500/60 px-1.5 py-0.2 rounded font-mono animate-pulse">
                <Snowflake size={10} /> {Math.ceil(activeBuffs.freeze)}s
              </span>
            )}
          </div>
        </div>

        {/* Rival Fox cluster */}
        <div className="flex items-center justify-end gap-2.5 min-w-[130px] sm:min-w-[200px]">
          <div className="flex flex-col items-end">
            <span className="text-[10px] sm:text-xs tracking-wider uppercase font-semibold text-orange-400">
              RIVAL (FOX NPC)
            </span>
            <span className="font-arcade text-sm sm:text-lg text-white tabular-nums tracking-wider drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]">
              {rivalScore.toLocaleString()}
            </span>
            <span
              className={`text-[10px] font-mono tracking-tight ${
                activeBuffs.freeze > 0
                  ? 'text-cyan-400 font-bold animate-pulse'
                  : activeBuffs.rivalFrenzy && activeBuffs.rivalFrenzy > 0
                  ? 'text-amber-400 font-bold animate-pulse'
                  : activeBuffs.rivalSpeed && activeBuffs.rivalSpeed > 0
                  ? 'text-cyan-400 font-bold animate-pulse'
                  : 'text-slate-400'
              }`}
            >
              {activeBuffs.freeze > 0
                ? '❄ FROZEN'
                : activeBuffs.rivalFrenzy && activeBuffs.rivalFrenzy > 0
                ? '🔥 FRENZY (2X)'
                : activeBuffs.rivalSpeed && activeBuffs.rivalSpeed > 0
                ? '⚡ SPEED BOOST'
                : 'HUNTING DOTS'}
            </span>
          </div>

          <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-orange-400 bg-orange-950/80 text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.4)] text-lg">
            🦊
          </div>
        </div>
      </div>

      {/* Score Tug-of-War Bar */}
      <div className="max-w-5xl mx-auto w-full flex items-center gap-3">
        <div className="flex-1 bg-slate-900/90 rounded-full h-3 border border-slate-700/80 overflow-hidden flex p-0.5 relative">
          <div
            className={`h-full transition-all duration-300 rounded-l-full ${
              characterType === 'snake' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
            }`}
            style={{ width: `${playerPercent}%` }}
          />
          <div
            className="h-full bg-orange-500 transition-all duration-300 rounded-r-full shadow-[0_0_8px_#f97316]"
            style={{ width: `${100 - playerPercent}%` }}
          />
          {/* Center 50% marker */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/40 transform -translate-x-1/2" />
        </div>

        {/* Action icons (Pause, Mute, Help) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onTogglePause}
            className="p-1.5 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-200 transition-colors cursor-pointer"
            title={isPaused ? 'Resume Game' : 'Pause Game'}
          >
            {isPaused ? <Play size={14} /> : <Pause size={14} />}
          </button>
          <button
            onClick={onToggleMute}
            className="p-1.5 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-200 transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          <button
            onClick={onOpenHowToPlay}
            className="px-2 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 text-[11px] font-bold cursor-pointer transition-colors"
          >
            GUIDE
          </button>
        </div>
      </div>
    </header>
  );
};
