import React from 'react';
import { CharacterType } from '../types/game';
import { Play, Users, HelpCircle, Trophy, Volume2, VolumeX, Sparkles, Zap, Maximize2 } from 'lucide-react';

interface TitleScreenProps {
  selectedCharacter: CharacterType;
  highScore: number;
  currentLevel: number;
  proceduralSize: 'MINI' | 'STANDARD' | 'EXPANSIVE';
  isMuted: boolean;
  onStartGame: () => void;
  onOpenCharacterSelect: () => void;
  onOpenHowToPlay: () => void;
  onOpenConceptArt: () => void;
  onSelectLevel: (lvl: number) => void;
  onSelectProceduralSize: (size: 'MINI' | 'STANDARD' | 'EXPANSIVE') => void;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  selectedCharacter,
  highScore,
  currentLevel,
  proceduralSize,
  isMuted,
  onStartGame,
  onOpenCharacterSelect,
  onOpenHowToPlay,
  onOpenConceptArt,
  onSelectLevel,
  onSelectProceduralSize,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-between p-4 sm:p-8 bg-[#050811]/95 text-slate-100 overflow-y-auto">
      {/* Top right mute button */}
      <div className="w-full flex justify-end">
        <button
          onClick={onToggleMute}
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-300 transition-colors cursor-pointer"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>

      {/* Main Lockup & Logo */}
      <div className="flex flex-col items-center text-center max-w-2xl mt-2">
        <div className="text-xs sm:text-sm font-bold tracking-[0.3em] uppercase text-cyan-400 mb-2 drop-shadow-[0_0_8px_#00f0ff]">
          ARCADE FUSION CLASSIC
        </div>

        <h1 className="font-arcade text-2xl sm:text-4xl md:text-5xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-cyan-400 drop-shadow-[0_0_20px_rgba(0,240,255,0.4)] leading-tight mb-2">
          SNAKE × PAC-MAN
        </h1>

        <div className="font-orbitron font-bold text-lg sm:text-2xl tracking-[0.25em] text-cyan-300 drop-shadow-[0_0_12px_rgba(0,240,255,0.7)] mb-5">
          DUAL UNIVERSE
        </div>

        {/* Character Selected Highlight Card */}
        <div className="w-full max-w-md bg-slate-900/80 border border-slate-700/80 rounded-xl p-3.5 mb-4 shadow-[0_0_20px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs text-slate-400 font-mono tracking-wider">SELECTED FIGHTER:</span>
            <button
              onClick={onOpenCharacterSelect}
              className="text-xs text-cyan-400 hover:text-cyan-300 underline font-mono cursor-pointer"
            >
              CHANGE HERO ❯
            </button>
          </div>

          <div
            onClick={onOpenCharacterSelect}
            className={`flex items-center gap-4 p-2.5 rounded-lg border cursor-pointer transition-all ${
              selectedCharacter === 'snake'
                ? 'bg-emerald-950/40 border-emerald-500/70 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                : 'bg-amber-950/40 border-amber-500/70 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
            }`}
          >
            <div className="text-3xl sm:text-4xl">
              {selectedCharacter === 'snake' ? '🐍' : '🟡'}
            </div>
            <div className="flex flex-col text-left">
              <span className="font-orbitron font-bold text-base sm:text-lg text-white">
                {selectedCharacter === 'snake' ? 'THE SNAKE (貪吃蛇)' : 'PAC-MAN (小精靈)'}
              </span>
              <span className="text-xs text-slate-300 font-mono">
                {selectedCharacter === 'snake'
                  ? 'Grows body barrier · Entraps ghosts & rivals'
                  : 'Power Pellet chomper · Hyper nimble maneuverability'}
              </span>
            </div>
          </div>
        </div>

        {/* Arena Map & Size Selector */}
        <div className="w-full max-w-lg bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 mb-5 flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-2.5 px-1">
            <span className="text-[11px] text-slate-400 font-mono tracking-wider flex items-center gap-1.5">
              <Maximize2 size={13} className="text-cyan-400" />
              SELECT ARENA MAP & SIZE (選擇地圖與尺寸):
            </span>
            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
              {currentLevel === 5 ? '🎲 PROCEDURAL' : `MAP ${currentLevel} / 4`}
            </span>
          </div>

          {/* 5 Map Buttons */}
          <div className="grid grid-cols-5 gap-1.5 w-full">
            <button
              onClick={() => onSelectLevel(1)}
              className={`py-2 px-1 rounded-lg text-xs font-mono font-bold border cursor-pointer transition-all flex flex-col items-center ${
                currentLevel === 1
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700/80'
              }`}
            >
              <span className="text-[9px] px-1 rounded bg-cyan-900/60 text-cyan-300 mb-0.5">標準 28×21</span>
              <span className="text-[11px]">經典街機</span>
            </button>

            <button
              onClick={() => onSelectLevel(2)}
              className={`py-2 px-1 rounded-lg text-xs font-mono font-bold border cursor-pointer transition-all flex flex-col items-center ${
                currentLevel === 2
                  ? 'bg-amber-950/80 text-amber-300 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700/80'
              }`}
            >
              <span className="text-[9px] px-1 rounded bg-amber-900/70 text-amber-300 font-bold mb-0.5 animate-pulse">
                ⚡迷你 19×15
              </span>
              <span className="text-[11px]">微型角鬥場</span>
            </button>

            <button
              onClick={() => onSelectLevel(3)}
              className={`py-2 px-1 rounded-lg text-xs font-mono font-bold border cursor-pointer transition-all flex flex-col items-center ${
                currentLevel === 3
                  ? 'bg-fuchsia-950/80 text-fuchsia-300 border-fuchsia-400 shadow-[0_0_12px_rgba(217,70,239,0.4)]'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700/80'
              }`}
            >
              <span className="text-[9px] px-1 rounded bg-fuchsia-900/60 text-fuchsia-300 mb-0.5">雙環 28×21</span>
              <span className="text-[11px]">雙子競技</span>
            </button>

            <button
              onClick={() => onSelectLevel(4)}
              className={`py-2 px-1 rounded-lg text-xs font-mono font-bold border cursor-pointer transition-all flex flex-col items-center ${
                currentLevel === 4
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700/80'
              }`}
            >
              <span className="text-[9px] px-1 rounded bg-emerald-900/60 text-emerald-300 mb-0.5">廣闊 31×21</span>
              <span className="text-[11px]">賽博神殿</span>
            </button>

            <button
              onClick={() => onSelectLevel(5)}
              className={`py-2 px-1 rounded-lg text-xs font-mono font-bold border cursor-pointer transition-all flex flex-col items-center ${
                currentLevel === 5
                  ? 'bg-orange-950/80 text-orange-300 border-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.4)] animate-pulse'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700/80'
              }`}
            >
              <span className="text-[9px] px-1 rounded bg-orange-900/60 text-orange-300 mb-0.5">隨機演算法</span>
              <span className="text-[11px]">🎲 隨機迷宮</span>
            </button>
          </div>

          {/* Random Maze Size Selector sub-bar when Map 5 is active */}
          {currentLevel === 5 && (
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between w-full px-1">
              <span className="text-[10px] text-orange-300 font-mono flex items-center gap-1">
                <Sparkles size={12} /> 隨機迷宮生成尺寸:
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => onSelectProceduralSize('MINI')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer border ${
                    proceduralSize === 'MINI'
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  迷你 (19×15)
                </button>
                <button
                  onClick={() => onSelectProceduralSize('STANDARD')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer border ${
                    proceduralSize === 'STANDARD'
                      ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.6)]'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  標準 (28×21)
                </button>
                <button
                  onClick={() => onSelectProceduralSize('EXPANSIVE')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer border ${
                    proceduralSize === 'EXPANSIVE'
                      ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  廣闊 (31×21)
                </button>
              </div>
            </div>
          )}

          {/* Map Details & Gameplay Characteristics Description */}
          <div className="mt-2.5 text-[11px] font-mono text-center">
            {currentLevel === 1 && (
              <span className="text-cyan-400 font-medium">
                [標準 28×21] 霓虹街機 · 經典攻守平衡 · 雙迴圈大道與安全避難區
              </span>
            )}
            {currentLevel === 2 && (
              <span className="text-amber-400 font-bold">
                [迷你 19×15] 微型角鬥場 · 緊湊死鬥！近身肉搏、40秒極速高壓與密集道具！
              </span>
            )}
            {currentLevel === 3 && (
              <span className="text-fuchsia-400 font-medium">
                [雙環 28×21] 雙子星競技場 · 左右對稱雙環賽道 · 廣域高壓包抄戰
              </span>
            )}
            {currentLevel === 4 && (
              <span className="text-emerald-400 font-medium">
                [廣闊 31×21] 賽博迷宮神殿 · 超大橫向矩陣 · 同心電路縱深迂迴與巨蛇封鎖戰
              </span>
            )}
            {currentLevel === 5 && (
              <span className="text-orange-400 font-bold">
                [隨機動態] 每局生成全新迷宮格局與霓虹配色，完美 0 死路四通八達！
              </span>
            )}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm mb-5">
          <button
            onClick={onStartGame}
            className="w-full sm:flex-1 py-3 px-6 rounded-lg bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-arcade text-sm font-bold shadow-[0_0_20px_rgba(0,240,255,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <Play size={18} className="fill-slate-950" />
            START GAME
          </button>

          <button
            onClick={onOpenCharacterSelect}
            className="w-full sm:w-auto py-3 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Users size={16} />
            HEROES
          </button>
        </div>

        {/* Guide & Gallery buttons */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <button
            onClick={onOpenHowToPlay}
            className="text-cyan-400/90 hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <HelpCircle size={14} />
            HOW TO PLAY
          </button>
          <span className="text-slate-600">·</span>
          <button
            onClick={onOpenConceptArt}
            className="text-amber-400/90 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            ART GALLERY
          </button>
        </div>
      </div>

      {/* Footer stats & controls hint */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono pt-3 border-t border-slate-800/80 gap-2">
        <div className="flex items-center gap-2">
          <Trophy size={14} className="text-amber-400" />
          <span>ALL-TIME RECORD:</span>
          <span className="font-arcade text-amber-300">{highScore.toLocaleString()}</span>
        </div>

        <div className="text-slate-400">
          WASD / Arrows to Move · Space for Skill · P to Pause
        </div>
      </div>
    </div>
  );
};
