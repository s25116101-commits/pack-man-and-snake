import React from 'react';
import { CharacterType } from '../types/game';
import { RotateCcw, Users, Home, AlertCircle } from 'lucide-react';

interface GameOverModalProps {
  playerScore: number;
  rivalScore: number;
  reason: string;
  characterType: CharacterType;
  onRetry: () => void;
  onOpenCharacterSelect: () => void;
  onReturnTitle: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  playerScore,
  rivalScore,
  reason,
  characterType,
  onRetry,
  onOpenCharacterSelect,
  onReturnTitle,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none">
      <div className="bg-[#0b0c16] border-2 border-rose-500/70 rounded-2xl w-full max-w-lg p-6 shadow-[0_0_40px_rgba(244,63,94,0.35)] relative flex flex-col text-center">
        {/* Game Over Title */}
        <div className="text-xs uppercase tracking-widest text-rose-400 font-bold mb-1 font-mono">
          MAZE RUN TERMINATED
        </div>

        <h2 className="font-arcade text-2xl sm:text-3xl text-rose-500 tracking-wider mb-2 drop-shadow-[0_0_15px_#f43f5e]">
          GAME OVER
        </h2>

        {/* Reason card */}
        <div className="flex items-center justify-center gap-2 bg-rose-950/40 border border-rose-500/30 rounded-xl p-3 mb-6 text-xs text-rose-200 font-mono">
          <AlertCircle size={16} className="text-rose-400 shrink-0" />
          <span>{reason}</span>
        </div>

        {/* Scores summary */}
        <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 mb-6 font-mono text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">YOUR SCORE ({characterType === 'snake' ? 'Snake 🐍' : 'Pac-Man 🟡'})</span>
            <span className="font-arcade text-white text-sm">{playerScore.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">RIVAL SCORE (Fox NPC 🦊)</span>
            <span className="font-arcade text-orange-400 text-sm">{rivalScore.toLocaleString()}</span>
          </div>

          {rivalScore > playerScore && (
            <div className="border-t border-slate-700/60 pt-2 text-[11px] text-amber-300">
              💡 Tip: Grab the Freeze Hourglass ⏳ to halt the Fox for 5 seconds and steal points!
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onRetry}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-arcade text-xs font-bold shadow-[0_0_15px_#f43f5e] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <RotateCcw size={16} />
            RETRY
          </button>

          <button
            onClick={onOpenCharacterSelect}
            className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Users size={16} />
            SWITCH HERO
          </button>

          <button
            onClick={onReturnTitle}
            className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Home size={16} />
            TITLE
          </button>
        </div>
      </div>
    </div>
  );
};
