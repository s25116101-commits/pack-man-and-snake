import React from 'react';
import { CharacterType } from '../types/game';
import { Trophy, ArrowRight, RotateCcw, Award } from 'lucide-react';

interface VictoryModalProps {
  playerScore: number;
  rivalScore: number;
  timeRemaining: number;
  characterType: CharacterType;
  currentLevel: number;
  mapBadge?: string;
  mapName?: string;
  onNextLevel: () => void;
  onPlayAgain: () => void;
  onReturnTitle: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  playerScore,
  rivalScore,
  timeRemaining,
  characterType,
  currentLevel,
  mapBadge,
  mapName,
  onNextLevel,
  onPlayAgain,
  onReturnTitle,
}) => {
  // Compute Rank Badge: S, A, B, C
  const ratio = playerScore / Math.max(1, rivalScore);
  let rank = 'C';
  let rankColor = 'text-amber-400 border-amber-400 bg-amber-950/60 shadow-[0_0_20px_rgba(245,158,11,0.5)]';

  if (ratio >= 2.0 || (ratio >= 1.6 && timeRemaining > 60)) {
    rank = 'S';
    rankColor = 'text-rose-400 border-rose-400 bg-rose-950/60 shadow-[0_0_25px_rgba(244,63,94,0.6)]';
  } else if (ratio >= 1.5) {
    rank = 'A';
    rankColor = 'text-cyan-400 border-cyan-400 bg-cyan-950/60 shadow-[0_0_20px_rgba(6,182,212,0.5)]';
  } else if (ratio >= 1.2) {
    rank = 'B';
    rankColor = 'text-emerald-400 border-emerald-400 bg-emerald-950/60 shadow-[0_0_20px_rgba(16,185,129,0.5)]';
  }

  const scoreDiff = playerScore - rivalScore;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none">
      <div className="bg-[#070e1e] border-2 border-emerald-500/70 rounded-2xl w-full max-w-lg p-6 shadow-[0_0_40px_rgba(16,185,129,0.35)] relative flex flex-col text-center">
        {/* Victory Header */}
        <div className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-1 font-mono">
          {mapName && mapBadge
            ? `${mapName} [${mapBadge}] · 通關達成`
            : currentLevel === 5
            ? 'RANDOM MAZE CLEARED · 隨機迷宮通關'
            : currentLevel === 2
            ? 'MINI COLISEUM CLEARED · 微型角鬥場通關'
            : `MAP ${currentLevel} CLEARED · 通關達成`}
        </div>

        <h2 className="font-arcade text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 tracking-wider mb-2 drop-shadow-[0_0_15px_#10b981]">
          VICTORY!
        </h2>

        <p className="text-xs text-slate-300 font-mono mb-6">
          You successfully outmaneuvered the ghosts and outscored the Rival Fox!
        </p>

        {/* Rank Badge Centerpiece */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="text-[11px] text-slate-400 font-mono uppercase tracking-wider mb-2 flex items-center gap-1">
            <Award size={14} /> SCORE RATING BADGE
          </div>
          <div
            className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center font-arcade text-4xl font-bold ${rankColor}`}
          >
            {rank}
          </div>
          <span className="text-xs text-slate-300 font-mono mt-2">
            {rank === 'S' && 'SUPREME DOMINATION!'}
            {rank === 'A' && 'EXCELLENT ROUTING!'}
            {rank === 'B' && 'GREAT ARCADE REFLEXES!'}
            {rank === 'C' && 'RIVAL NARROWLY BESTED!'}
          </span>
        </div>

        {/* Score comparison card */}
        <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 mb-6 font-mono text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">PLAYER ({characterType === 'snake' ? 'Snake 🐍' : 'Pac-Man 🟡'})</span>
            <span className="font-arcade text-white text-sm">{playerScore.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">RIVAL (Fox NPC 🦊)</span>
            <span className="font-arcade text-orange-400 text-sm">{rivalScore.toLocaleString()}</span>
          </div>

          <div className="border-t border-slate-700/60 pt-2 flex items-center justify-between">
            <span className="text-emerald-400 font-semibold">MARGIN OF VICTORY</span>
            <span className="font-arcade text-emerald-300 text-sm">+{scoreDiff.toLocaleString()}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onNextLevel}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-arcade text-xs font-bold shadow-[0_0_15px_#10b981] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            NEXT LEVEL
            <ArrowRight size={16} />
          </button>

          <button
            onClick={onPlayAgain}
            className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} />
            REPLAY
          </button>

          <button
            onClick={onReturnTitle}
            className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-mono text-xs font-bold transition-all cursor-pointer"
          >
            TITLE
          </button>
        </div>
      </div>
    </div>
  );
};
