import React from 'react';
import { X, Shield, Zap, Sparkles, AlertTriangle, Snowflake } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm select-none">
      <div className="bg-[#070e1e] border-2 border-cyan-500/70 rounded-2xl w-full max-w-3xl p-4 sm:p-6 shadow-[0_0_35px_rgba(0,240,255,0.3)] relative flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="text-xs uppercase tracking-widest text-cyan-400 font-bold mb-1 font-mono">
            GAME RULES & TACTICAL MANUAL
          </div>
          <h2 className="font-arcade text-xl sm:text-2xl text-white tracking-wider">
            HOW TO PLAY (遊戲玩法指南)
          </h2>
        </div>

        {/* Content sections */}
        <div className="space-y-4 font-mono text-xs">
          {/* Dual Character System */}
          <div className="bg-slate-900/70 border border-slate-700/80 rounded-xl p-3.5">
            <h3 className="font-orbitron font-bold text-sm text-cyan-300 mb-2 flex items-center gap-2">
              <Sparkles size={16} /> 1. 雙主角選擇系統 (Dual Playable Characters)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-lg p-2.5">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                  <span>🐍</span> 貪吃蛇 (Snake)
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  每吃一顆白色點點，身體就變長一節！你的長身體是<strong>實體屏障</strong>，幽靈會被擋住，搶食狐狸也無法跨越你的身體！
                  <br />
                  <span className="text-amber-400">⚠️ 扣分機制：若咬到自己的身體會<strong>扣除 200 分</strong>並切斷尾段糾結部位（保留至少 4 節），不會直接扣命！</span>
                </p>
              </div>

              <div className="bg-amber-950/30 border border-amber-500/30 rounded-lg p-2.5">
                <div className="font-bold text-amber-400 flex items-center gap-1.5 mb-1">
                  <span>🟡</span> 小精靈 (Pac-Man)
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  吃點點不會變長，體型永遠保持 1 格極度靈活！吃下「大力丸」可使幽靈變藍並反殺吞噬，獲得 200/400/800/1600 高額加分！
                  <br />
                  <span className="text-rose-400">⚠️ 戰術劣勢：無法以身體建構障礙，必須以純粹走位與狐狸比拼吃點點速度！</span>
                </p>
              </div>
            </div>
          </div>

          {/* The Rival NPC Fox & Rules */}
          <div className="bg-slate-900/70 border border-slate-700/80 rounded-xl p-3.5">
            <h3 className="font-orbitron font-bold text-sm text-orange-400 mb-2 flex items-center gap-2">
              <span>🦊</span> 2. 搶食 NPC (The Rival Fox) & 60 秒爭奪戰
            </h3>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              迷宮中有一隻敏捷的「搶食狐狸」。它會以最短路徑演算瘋狂吃走白色點點與道具！
              <br />
              ✨ <strong>點點 10 秒刷新：</strong>白色點點被吃掉後會在 <strong>10 秒後重新刷新</strong>，雙方在 60 秒內持續搶食累計分數！
              <br />
              ⚡ <strong>狐狸也會吃道具並觸發：</strong>若狐狸吃下「冰凍沙漏」會將<strong>玩家冰凍 3.5 秒</strong>！吃下「加速鞋」會暴走衝刺！吃下「大力丸」會進入 7 秒狂暴雙倍得分狀態！
              <br />
              <strong className="text-amber-300">
                勝負關鍵：每局限時 60 秒，時間結束時玩家分數必須高於搶食狐狸才能獲勝！
              </strong>
            </p>
          </div>

          {/* Ghosts & Traps */}
          <div className="bg-slate-900/70 border border-slate-700/80 rounded-xl p-3.5">
            <h3 className="font-orbitron font-bold text-sm text-rose-400 mb-2 flex items-center gap-2">
              <AlertTriangle size={16} /> 3. 四色幽靈 (Ghosts) & 迷宮通道
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] mb-2">
              <div className="bg-rose-950/40 border border-rose-500/30 p-2 rounded text-center">
                <span className="text-rose-400 font-bold">Blinky (紅)</span>
                <p className="text-slate-400 text-[10px] mt-0.5">直擊追擊者</p>
              </div>
              <div className="bg-pink-950/40 border border-pink-500/30 p-2 rounded text-center">
                <span className="text-pink-400 font-bold">Pinky (粉)</span>
                <p className="text-slate-400 text-[10px] mt-0.5">前方伏擊者</p>
              </div>
              <div className="bg-cyan-950/40 border border-cyan-500/30 p-2 rounded text-center">
                <span className="text-cyan-400 font-bold">Inky (青)</span>
                <p className="text-slate-400 text-[10px] mt-0.5">側翼包抄者</p>
              </div>
              <div className="bg-amber-950/40 border border-amber-500/30 p-2 rounded text-center">
                <span className="text-amber-400 font-bold">Clyde (橘)</span>
                <p className="text-slate-400 text-[10px] mt-0.5">懦夫游移者</p>
              </div>
            </div>
            <p className="text-slate-300 text-[11px] mb-1">
              🌀 <strong>穿透傳送門：</strong>迷宮左右兩側設有雙向傳送通道，進入左側邊界將立即從右側穿出！
            </p>
            <p className="text-rose-400 text-[11px] font-bold">
              💀 <strong>幽靈擊殺懲罰：</strong>碰到幽靈時除扣除 1 點生命外，還將<strong>扣除 300 分</strong>！請小心幽靈圍堵。
            </p>
          </div>

          {/* Items & Bonus */}
          <div className="bg-slate-900/70 border border-slate-700/80 rounded-xl p-3.5">
            <h3 className="font-orbitron font-bold text-sm text-emerald-400 mb-2 flex items-center gap-2">
              <Zap size={16} /> 4. 特殊道具與戰略道具 (Items)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="bg-sky-950/40 border border-sky-500/30 p-2 rounded flex items-center gap-2">
                <Snowflake size={18} className="text-sky-400 shrink-0" />
                <div>
                  <strong className="text-sky-300">冰凍沙漏 (Hourglass)</strong>
                  <p className="text-slate-400 text-[10px]">將搶食狐狸冰凍 5 秒，趁機搶分！</p>
                </div>
              </div>

              <div className="bg-cyan-950/40 border border-cyan-500/30 p-2 rounded flex items-center gap-2">
                <Zap size={18} className="text-cyan-400 shrink-0" />
                <div>
                  <strong className="text-cyan-300">加速跑鞋 (Speed Shoes)</strong>
                  <p className="text-slate-400 text-[10px]">大幅提升移動速度 6 秒！</p>
                </div>
              </div>

              <div className="bg-rose-950/40 border border-rose-500/30 p-2 rounded flex items-center gap-2">
                <span className="text-base">🍒</span>
                <div>
                  <strong className="text-rose-300">加分水果 (Fruits)</strong>
                  <p className="text-slate-400 text-[10px]">櫻桃 +100、蘋果 +200、草莓 +300</p>
                </div>
              </div>
            </div>
            <p className="text-emerald-400 text-[10px] mt-2 border-t border-slate-800 pt-1.5 font-bold">
              🗺️ <strong>超高頻率生成 (3~6 秒刷新)：</strong>特殊道具生成點遍布全迷宮多處開放幹道，開局直接投放多樣道具！
            </p>
          </div>

          {/* Map Dimensions & Characteristics */}
          <div className="bg-slate-900/70 border border-slate-700/80 rounded-xl p-3.5">
            <h3 className="font-orbitron font-bold text-sm text-amber-400 mb-2 flex items-center gap-2">
              <Shield size={16} /> 5. 多元地圖尺寸與戰術特色 (Map Sizes & Arenas)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
              <div className="bg-slate-800/60 border border-amber-500/40 p-2 rounded">
                <span className="text-amber-300 font-bold">⚡ MAP 2 · 微型角鬥場 [迷你 19×15]</span>
                <p className="text-slate-300 text-[10px] mt-0.5">
                  <strong>特色：</strong>緊湊微型戰場！每一步都在死線邊緣，狐狸與幽靈近身肉搏，道具密集狂暴刷新，40 秒極速定勝負！
                </p>
              </div>
              <div className="bg-slate-800/60 border border-cyan-500/40 p-2 rounded">
                <span className="text-cyan-300 font-bold">MAP 1 · 霓虹街機 [標準 28×21]</span>
                <p className="text-slate-300 text-[10px] mt-0.5">
                  <strong>特色：</strong>經典街機平衡架構，外圍雙向巡航大道，適中的策略深度與逃脫空間。
                </p>
              </div>
              <div className="bg-slate-800/60 border border-fuchsia-500/40 p-2 rounded">
                <span className="text-fuchsia-300 font-bold">MAP 3 · 雙子星競技場 [雙環 28×21]</span>
                <p className="text-slate-300 text-[10px] mt-0.5">
                  <strong>特色：</strong>左右對稱雙環賽道，四通八達的中樞走廊，絕佳的貪吃蛇包抄與衝刺場地。
                </p>
              </div>
              <div className="bg-slate-800/60 border border-emerald-500/40 p-2 rounded">
                <span className="text-emerald-300 font-bold">MAP 4 · 賽博迷宮神殿 [廣闊 31×21]</span>
                <p className="text-slate-300 text-[10px] mt-0.5">
                  <strong>特色：</strong>廣闊巨幅同心電路迷宮！橫向 31 格超寬矩陣，貪吃蛇可壯大至超長身軀包圍全場。
                </p>
              </div>
            </div>
            <p className="text-orange-400 text-[10px] mt-2 border-t border-slate-800 pt-1.5 font-bold">
              🎲 <strong>MAP 5 隨機迷宮：</strong>具備自選尺寸功能（可切換迷你 19×15、標準 28×21、廣闊 31×21），程序演算法保證 0 死路四通八達！
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-5 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-arcade text-xs font-bold shadow-[0_0_15px_#00f0ff] cursor-pointer transition-all active:scale-95"
          >
            UNDERSTOOD, LET'S PLAY!
          </button>
        </div>
      </div>
    </div>
  );
};
