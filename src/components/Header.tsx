import React from 'react';
import { Camera, Download, Layers, Image as ImageIcon, RefreshCcw } from 'lucide-react';

interface HeaderProps {
  mode: 'single' | 'collage';
  setMode: (mode: 'single' | 'collage') => void;
  onExport: () => void;
  isExporting: boolean;
  onReset: () => void;
  hasCards: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  setMode,
  onExport,
  isExporting,
  onReset,
  hasCards,
}) => {
  return (
    <header id="app-header" className="bg-[#dfdfdf] border-b-[3px] border-black px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4 z-10 shadow-md">
      
      {/* Brand Logo & Slogan (90s Retro Stickers) */}
      <div className="flex items-center gap-3">
        <a href="/" aria-label="POLA Frame home" className="flex items-center gap-1.5">
          <div className="px-3.5 py-1 bg-yellow-300 border-2 border-black font-retro text-[13px] text-black tracking-widest brutal-shadow-pink uppercase rotate-[-2deg] select-none">
            Pola
          </div>
          <div className="px-3.5 py-1 bg-cyan-300 border-2 border-black font-retro text-[13px] text-black tracking-widest brutal-shadow uppercase rotate-[3deg] select-none">
            Frame
          </div>
        </a>
        <div className="flex flex-col justify-center pl-1 border-l-2 border-black/20 h-8">
          <p className="font-pixel text-[15px] leading-none text-slate-800 tracking-widest uppercase">90s Retro Studio</p>
          <p className="text-[9px] text-slate-500 tracking-wider uppercase font-mono mt-0.5">EST. 1995</p>
        </div>
      </div>

      {/* Mode Switches (Chunky Beveled / Brutalist Tabs) */}
      <div className="flex bg-[#c0c0c0] p-1 border-2 border-black brutal-shadow">
        <button
          onClick={() => setMode('single')}
          className={`
            flex items-center gap-2 px-5 py-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-r-2 border-black
            ${mode === 'single'
              ? 'bg-yellow-300 text-black shadow-inner font-extrabold'
              : 'text-slate-700 hover:text-black hover:bg-white/40'
            }
          `}
        >
          <ImageIcon className="w-4 h-4 text-black" />
          Single Print
        </button>
        <button
          onClick={() => setMode('collage')}
          className={`
            flex items-center gap-2 px-5 py-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer
            ${mode === 'collage'
              ? 'bg-[#ff00a0] text-white shadow-inner font-extrabold'
              : 'text-slate-700 hover:text-black hover:bg-white/40'
            }
          `}
        >
          <Layers className="w-4 h-4 text-current" />
          Collage Board
        </button>
      </div>

      {/* Action Buttons (Retro OS Controls) */}
      <div className="flex items-center gap-3">
        {hasCards && (
          <button
            onClick={onReset}
            title="Reset to default"
            className="p-2.5 text-black bg-white hover:bg-red-200 border-2 border-black brutal-shadow cursor-pointer transition-all hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:translate-x-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onExport}
          disabled={!hasCards || isExporting}
          className={`
            flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-widest cursor-pointer transition-all border-2 border-black
            ${isExporting 
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : hasCards
                ? 'bg-green-400 hover:bg-green-300 text-black brutal-shadow hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:translate-x-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }
          `}
        >
          {isExporting ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Rendering...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download (HD)
            </>
          )}
        </button>
      </div>
      
    </header>
  );
};
