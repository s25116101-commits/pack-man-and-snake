import React from 'react';
import { CharacterType, Direction } from '../types/game';
import { Shield, Zap, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface BottomControlsProps {
  characterType: CharacterType;
  onTriggerAbility: () => void;
  onSetDirection: (dir: Direction) => void;
  speedBoostRemaining: number;
}

export const BottomControls: React.FC<BottomControlsProps> = ({
  characterType,
  onTriggerAbility,
  onSetDirection,
  speedBoostRemaining,
}) => {
  const isSnake = characterType === 'snake';
  const isCooldown = speedBoostRemaining > 0;

  return (
    <footer className="w-full bg-[#070d1c]/90 border-t border-cyan-500/30 px-3 sm:px-6 py-2 select-none flex flex-wrap items-center justify-between gap-2 max-w-5xl mx-auto">
      {/* Ability Action Card */}
      <div className="flex items-center gap-3">
        <button
          onClick={onTriggerAbility}
          disabled={isCooldown}
          className={`px-3 sm:px-4 py-2 rounded-lg border font-mono text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
            isSnake
              ? 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)] active:scale-95'
              : 'bg-amber-950/80 hover:bg-amber-900 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)] active:scale-95'
          } ${isCooldown ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSnake ? <Shield size={16} /> : <Zap size={16} />}
          <span>
            {isSnake ? 'WRAP / COIL SURGE' : 'TURBO DASH'}
          </span>
          <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-white/70">
            [SPACE]
          </span>
        </button>

        <div className="hidden md:flex flex-col text-[11px] text-slate-400 font-mono">
          <span>
            {isSnake
              ? '🧱 Snake body physically blocks ghosts and traps the Rival Fox!'
              : '⚡ Eat Power Pellets to turn ghosts blue and chomp them for points!'}
          </span>
        </div>
      </div>

      {/* Virtual D-pad (Compact for touch/quick keyboard alternative) */}
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="grid grid-cols-3 gap-1 w-28 h-20 items-center justify-items-center">
          <div />
          <button
            onClick={() => onSetDirection('UP')}
            className="w-8 h-8 rounded bg-slate-800/80 hover:bg-cyan-900/60 active:bg-cyan-600 border border-slate-600 text-cyan-300 flex items-center justify-center cursor-pointer transition-colors"
          >
            <ArrowUp size={16} />
          </button>
          <div />

          <button
            onClick={() => onSetDirection('LEFT')}
            className="w-8 h-8 rounded bg-slate-800/80 hover:bg-cyan-900/60 active:bg-cyan-600 border border-slate-600 text-cyan-300 flex items-center justify-center cursor-pointer transition-colors"
          >
            <ArrowLeft size={16} />
          </button>

          <button
            onClick={() => onSetDirection('DOWN')}
            className="w-8 h-8 rounded bg-slate-800/80 hover:bg-cyan-900/60 active:bg-cyan-600 border border-slate-600 text-cyan-300 flex items-center justify-center cursor-pointer transition-colors"
          >
            <ArrowDown size={16} />
          </button>

          <button
            onClick={() => onSetDirection('RIGHT')}
            className="w-8 h-8 rounded bg-slate-800/80 hover:bg-cyan-900/60 active:bg-cyan-600 border border-slate-600 text-cyan-300 flex items-center justify-center cursor-pointer transition-colors"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
};
