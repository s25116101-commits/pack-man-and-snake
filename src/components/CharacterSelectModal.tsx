import React from 'react';
import { CharacterType } from '../types/game';
import { Shield, Zap, X, Check, AlertTriangle, Sparkles } from 'lucide-react';

interface CharacterSelectModalProps {
  selectedCharacter: CharacterType;
  onSelect: (char: CharacterType) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({
  selectedCharacter,
  onSelect,
  onConfirm,
  onClose,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm select-none">
      <div className="bg-[#070e1e] border-2 border-cyan-500/60 rounded-2xl w-full max-w-4xl p-4 sm:p-6 shadow-[0_0_30px_rgba(0,240,255,0.3)] relative flex flex-col max-h-[95vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="text-xs uppercase tracking-widest text-cyan-400 font-bold mb-1 font-mono">
            DUAL UNIVERSE FIGHTERS
          </div>
          <h2 className="font-arcade text-lg sm:text-2xl text-white tracking-wider">
            SELECT YOUR HERO
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Each character introduces fundamentally distinct maze survival & score strategies.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* Card A: Snake */}
          <div
            onClick={() => onSelect('snake')}
            className={`flex flex-col rounded-xl p-4 sm:p-5 border-2 cursor-pointer transition-all ${
              selectedCharacter === 'snake'
                ? 'bg-emerald-950/40 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.35)] scale-[1.01]'
                : 'bg-slate-900/60 border-slate-700 hover:border-emerald-600/60 opacity-80 hover:opacity-100'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-400 flex items-center justify-center text-3xl shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                  🐍
                </div>
                <div>
                  <h3 className="font-orbitron font-bold text-lg sm:text-xl text-emerald-400 tracking-wide">
                    THE SNAKE (貪吃蛇)
                  </h3>
                  <span className="text-[11px] text-emerald-300/80 font-mono">
                    PHYSICAL BARRIER SPECIALIST
                  </span>
                </div>
              </div>
              {selectedCharacter === 'snake' && (
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-black flex items-center justify-center">
                  <Check size={16} strokeWidth={3} />
                </div>
              )}
            </div>

            {/* Perks & Abilities */}
            <div className="space-y-2.5 mb-4 text-xs font-mono">
              <div className="flex items-start gap-2 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-500/20">
                <Shield size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-300">BLOCK & ENTRAP:</strong>
                  <p className="text-slate-300 text-[11px] mt-0.5">
                    Your growing body is a solid physical wall. Ghosts bounce off, and the Rival Fox cannot cross your segments!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-500/20">
                <Sparkles size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-300">GROWTH ADVANTAGE:</strong>
                  <p className="text-slate-300 text-[11px] mt-0.5">
                    Every white dot eaten adds 1 body segment. Longer coils allow closing off entire maze corridors.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-rose-950/30 p-2.5 rounded-lg border border-rose-500/20">
                <AlertTriangle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-rose-300">HAZARD - SELF-BITE:</strong>
                  <p className="text-slate-300 text-[11px] mt-0.5">
                    Biting your own body loses a life! Narrow maze turns become progressively lethal as your length increases.
                  </p>
                </div>
              </div>
            </div>

            {/* Stat bars */}
            <div className="mt-auto pt-3 border-t border-emerald-900/40 text-[10px] font-mono space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">DEFENSE / CROWD CONTROL</span>
                <span className="text-emerald-400 font-bold">★★★★★</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">MANEUVERABILITY</span>
                <span className="text-amber-400 font-bold">★★★☆☆</span>
              </div>
            </div>
          </div>

          {/* Card B: Pac-Man */}
          <div
            onClick={() => onSelect('pacman')}
            className={`flex flex-col rounded-xl p-4 sm:p-5 border-2 cursor-pointer transition-all ${
              selectedCharacter === 'pacman'
                ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)] scale-[1.01]'
                : 'bg-slate-900/60 border-slate-700 hover:border-amber-600/60 opacity-80 hover:opacity-100'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-950 border border-amber-400 flex items-center justify-center text-3xl shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                  🟡
                </div>
                <div>
                  <h3 className="font-orbitron font-bold text-lg sm:text-xl text-amber-400 tracking-wide">
                    PAC-MAN (小精靈)
                  </h3>
                  <span className="text-[11px] text-amber-300/80 font-mono">
                    AGILE PREDATOR & SPEED HUNTER
                  </span>
                </div>
              </div>
              {selectedCharacter === 'pacman' && (
                <div className="w-6 h-6 rounded-full bg-amber-500 text-black flex items-center justify-center">
                  <Check size={16} strokeWidth={3} />
                </div>
              )}
            </div>

            {/* Perks & Abilities */}
            <div className="space-y-2.5 mb-4 text-xs font-mono">
              <div className="flex items-start gap-2 bg-amber-950/30 p-2.5 rounded-lg border border-amber-500/20">
                <Sparkles size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300">POWER PELLET FRENZY:</strong>
                  <p className="text-slate-300 text-[11px] mt-0.5">
                    Eat golden Power Pellets to turn ghosts blue and chomp them for 200, 400, 800, 1600 bonus points!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-amber-950/30 p-2.5 rounded-lg border border-amber-500/20">
                <Zap size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300">NIMBLE SPEED & NO BODY TRAP:</strong>
                  <p className="text-slate-300 text-[11px] mt-0.5">
                    Size remains 1 tile throughout. Never gets boxed in by its own tail; effortlessly slips through tight corners.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-rose-950/30 p-2.5 rounded-lg border border-rose-500/20">
                <AlertTriangle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-rose-300">HAZARD - ZERO DEFENSIVE WALLS:</strong>
                  <p className="text-slate-300 text-[11px] mt-0.5">
                    Cannot build physical barriers to slow down the Rival Fox. You must beat the Fox purely on routing speed!
                  </p>
                </div>
              </div>
            </div>

            {/* Stat bars */}
            <div className="mt-auto pt-3 border-t border-amber-900/40 text-[10px] font-mono space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">OFFENSIVE MULTIPLIER</span>
                <span className="text-amber-400 font-bold">★★★★★</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">MANEUVERABILITY</span>
                <span className="text-amber-400 font-bold">★★★★★</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold cursor-pointer transition-colors"
          >
            BACK
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-arcade text-xs font-bold shadow-[0_0_15px_#00f0ff] cursor-pointer transition-all active:scale-95"
          >
            CONFIRM HERO
          </button>
        </div>
      </div>
    </div>
  );
};
