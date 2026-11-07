import React, { useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

interface ConceptArtModalProps {
  onClose: () => void;
}

const ARTWORK_ITEMS = [
  {
    title: 'Character Select Screen (角色選擇畫面)',
    desc: 'The neon arcade character selection showcasing Snake (Wrap & Block) vs Pac-Man (Power Pellet & Nimble).',
    src: '/assets/aistudio/Gemini_Generated_Image_t8re4ot8re4ot8re_6f279674.jfif',
  },
  {
    title: 'In-Game Playfield & HUD (實戰迷宮與狀態介面)',
    desc: 'Action arena featuring the snake body trail, Rival Fox competing for dots, ghost chasers, and score tug-of-war.',
    src: '/assets/aistudio/Gemini_Generated_Image_poqrxvpoqrxvpoqr_3a5acac7.jfif',
  },
  {
    title: '2D Sprites & UI Icons Sheet (2D 精靈圖與介面素材)',
    desc: 'Full asset specification: Snake orientations, Pac-Man mouth cycles, Fox NPC animations, Ghosts, pellets, and rating badges.',
    src: '/assets/aistudio/b9dc3c15-c548-48db-91e4-bdbca1635ce2_87503faa.jfif',
  },
  {
    title: 'Neon Maze Architecture (雙霓虹迷宮架構)',
    desc: 'Classic looping arcade labyrinth between arcade cabinets with ghost pen, wrap tunnels, and no dead ends.',
    src: '/assets/aistudio/22c24db1-f6a0-4053-8e3f-43d84b491b12_0134e927.jfif',
  },
];

export const ConceptArtModal: React.FC<ConceptArtModalProps> = ({ onClose }) => {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const current = ARTWORK_ITEMS[activeIdx];

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md select-none">
      <div className="bg-[#070e1e] border-2 border-cyan-500/70 rounded-2xl w-full max-w-4xl p-4 sm:p-6 shadow-[0_0_40px_rgba(0,240,255,0.35)] relative flex flex-col max-h-[92vh] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 transition-colors cursor-pointer z-10"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="text-xs uppercase tracking-widest text-cyan-400 font-bold mb-1 font-mono flex items-center justify-center gap-1.5">
            <ImageIcon size={14} /> OFFICIAL CONCEPT ART & DESIGN SYSTEM
          </div>
          <h2 className="font-arcade text-lg sm:text-xl text-white tracking-wider">
            {current.title}
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            {current.desc}
          </p>
        </div>

        {/* Main Artwork Preview */}
        <div className="flex-1 min-h-0 flex items-center justify-center bg-black/60 rounded-xl border border-cyan-500/30 p-2 overflow-hidden">
          <img
            src={current.src}
            alt={current.title}
            className="max-h-[50vh] sm:max-h-[58vh] max-w-full object-contain rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.8)]"
          />
        </div>

        {/* Thumbnails row */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-4 pt-3 border-t border-slate-800">
          {ARTWORK_ITEMS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`rounded-lg overflow-hidden border-2 cursor-pointer transition-all flex flex-col items-center bg-slate-900/80 p-1 ${
                activeIdx === idx
                  ? 'border-cyan-400 shadow-[0_0_12px_#00f0ff] scale-[1.02]'
                  : 'border-slate-700 opacity-60 hover:opacity-100 hover:border-slate-500'
              }`}
            >
              <img src={item.src} alt={item.title} className="h-12 sm:h-16 w-full object-cover rounded" />
              <span className="text-[9px] sm:text-[10px] font-mono text-slate-300 truncate w-full text-center mt-1">
                Art #{idx + 1}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
