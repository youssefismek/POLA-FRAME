import React, { useRef, useState } from 'react';
import { PolaroidCard as PolaroidCardType, CollageSettings } from '../types';
import { PolaroidCard } from './PolaroidCard';
import { COLLAGE_BACKGROUNDS } from '../data/filters';
import { MOCKUP_PRESETS } from '../data/mockups';
import { Upload, Plus, Trash2, ArrowUp, ArrowDown, RotateCw, ZoomIn, Info } from 'lucide-react';

interface WorkspaceProps {
  mode: 'single' | 'collage';
  cards: PolaroidCardType[];
  selectedCardId: string | null;
  collageSettings: CollageSettings;
  onSelectCard: (id: string) => void;
  onAddCard: (file: File) => void;
  onDeleteCard: (id: string) => void;
  onUpdateCardLayout: (id: string, layout: { x?: number; y?: number; rotation?: number; scale?: number }) => void;
  onUpdateCardLayers: (id: string, action: 'front' | 'back' | 'up' | 'down') => void;
  onUploadSingleImage: (file: File) => void;
  onReplaceCardImage?: (id: string, file: File) => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({
  mode,
  cards,
  selectedCardId,
  collageSettings,
  onSelectCard,
  onAddCard,
  onDeleteCard,
  onUpdateCardLayout,
  onUpdateCardLayers,
  onUploadSingleImage,
  onReplaceCardImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const selectedCard = cards.find(c => c.id === selectedCardId) || cards[0];

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        if (mode === 'single') {
          onUploadSingleImage(file);
        } else {
          onAddCard(file);
        }
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (mode === 'single') {
        onUploadSingleImage(file);
      } else {
        onAddCard(file);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Get active background styling for Collage mode
  const getCollageBgStyle = (): React.CSSProperties => {
    if (collageSettings.backgroundType === 'color') {
      return { backgroundColor: collageSettings.backgroundColor };
    } else if (collageSettings.backgroundType === 'texture') {
      const preset = COLLAGE_BACKGROUNDS.find(b => b.id === collageSettings.backgroundTexture);
      if (preset && preset.style) {
        return preset.style;
      }
      return { backgroundColor: '#141517' };
    } else if (collageSettings.backgroundType === 'image' && collageSettings.backgroundImageUrl) {
      return {
        backgroundImage: `url(${collageSettings.backgroundImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    return { backgroundColor: '#141517' };
  };

  const getCollageBgClass = (): string => {
    if (collageSettings.backgroundType === 'texture') {
      const preset = COLLAGE_BACKGROUNDS.find(b => b.id === collageSettings.backgroundTexture);
      if (preset && preset.bgClass) {
        return preset.bgClass;
      }
    }
    return '';
  };

  // Compute collage board aspect ratio class
  const getBoardAspectRatioClass = () => {
    switch (collageSettings.aspectRatio) {
      case '4:3':
        return 'aspect-[4/3]';
      case '1:1':
        return 'aspect-square';
      case '16:9':
      default:
        return 'aspect-[16/9]';
    }
  };

  return (
    <div 
      id="workspace-container"
      className="flex-1 flex flex-col items-center justify-center p-6 bg-[#008080] retro-grid relative overflow-y-auto min-h-0"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Drag & Drop Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 bg-yellow-300/90 border-[6px] border-double border-black z-50 flex flex-col items-center justify-center pointer-events-none transition-all brutal-shadow">
          <Upload className="w-16 h-16 text-black animate-bounce mb-4" />
          <p className="text-black text-xl font-pixel uppercase tracking-widest font-bold">Drop your photo here!</p>
          <p className="text-black text-sm font-mono mt-1">Supports PNG, JPG, JPEG, WEBP</p>
        </div>
      )}

      {mode === 'single' ? (
        /* ================= SINGLE POLAROID MODE ================= */
        <div className="w-full max-w-2xl flex flex-col items-center justify-center py-6">
          {cards.length === 0 ? (
            /* Upload Placeholder - 90s brutalist retro */
            <button
              onClick={triggerFileInput}
              className="p-8 border-4 border-black rounded-none bg-[#c0c0c0] flex flex-col items-center justify-center gap-4 group cursor-pointer hover:bg-[#dfdfdf] transition-all duration-100 w-full max-w-md aspect-square text-center brutal-shadow"
            >
              <div className="w-16 h-16 bg-white border-2 border-black rounded-none flex items-center justify-center group-hover:bg-yellow-300 group-hover:text-black text-black transition-all duration-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Upload className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="font-pixel text-[18px] uppercase tracking-wider text-black font-bold">CLICK TO UPLOAD PHOTO</h3>
                <p className="text-xs font-mono text-black/85 max-w-xs mx-auto leading-relaxed">
                  [DRAG & DROP IMAGE FILE HERE]<br/>
                  SUPPORTS PNG, JPG, WEBP • MAX 10MB
                </p>
              </div>
            </button>
          ) : (
            /* Active Polaroid Render */
            <div className="w-full flex flex-col items-center gap-6">
              <div className="relative group/card p-4">
                {/* Visual guidelines */}
                <PolaroidCard card={selectedCard} isSelected={true} />
                
                {/* Hover swap trigger */}
                <button
                  onClick={triggerFileInput}
                  className="absolute inset-0 bg-black/10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 rounded-none flex flex-col items-center justify-center gap-2 text-white cursor-pointer"
                >
                  <div className="bg-black/80 px-4 py-2 rounded-none border-2 border-white flex items-center gap-2 text-xs font-semibold">
                    <Upload className="w-4 h-4" />
                    <span>Replace Photo</span>
                  </div>
                </button>
              </div>

              {/* Quick tip */}
              <div className="flex items-center gap-2 text-yellow-300 text-xs font-mono uppercase font-bold bg-black px-4 py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                <Info className="w-4 h-4 text-yellow-300" />
                <span>Hover card to replace, or use left controls to adjust filters</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ================= COLLAGE PACK MODE ================= */
        <div className="w-full max-w-5xl flex flex-col gap-4">
          
          {/* Collage Toolbar - Grey 90s system control bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#c0c0c0] border-3 border-black p-4 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-3">
              <button
                onClick={triggerFileInput}
                className="flex items-center gap-2 bg-yellow-300 hover:bg-yellow-200 text-black font-extrabold text-xs px-5 py-2.5 rounded-none border-2 border-black brutal-shadow transition-all cursor-pointer uppercase tracking-wider font-pixel"
              >
                <Plus className="w-4 h-4 text-black" />
                Add Photo Card
              </button>
              {cards.length > 0 && (
                <span className="text-black font-mono text-[11px] uppercase tracking-wider font-bold bg-white px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  {cards.length} Card{cards.length > 1 ? 's' : ''} on table
                </span>
              )}
            </div>

            {/* Quick Selected Card Action Bar */}
            {selectedCardId && (
              <div className="flex items-center gap-1.5 bg-white p-2 rounded-none border-2 border-black animate-fade-in text-xs text-black shadow-[2px_2px_0px_0px_#000]">
                <span className="px-2 font-pixel text-[13px] text-black border-r-2 border-black mr-1 uppercase font-bold">
                  Card:
                </span>
                
                {/* Replace Photo trigger */}
                {onReplaceCardImage && (
                  <>
                    <button
                      onClick={() => replaceFileInputRef.current?.click()}
                      title="Replace Selected Photo"
                      className="p-1.5 hover:bg-yellow-300 hover:text-black border-2 border-transparent hover:border-black rounded-none transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Replace</span>
                    </button>
                    <input
                      type="file"
                      ref={replaceFileInputRef}
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          onReplaceCardImage(selectedCardId, e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                    <div className="w-[1px] h-4 bg-slate-300 mx-1" />
                  </>
                )}
                
                {/* Rotate slider/trigger */}
                <button
                  onClick={() => {
                    const activeCard = cards.find(c => c.id === selectedCardId);
                    if (activeCard) {
                      onUpdateCardLayout(selectedCardId, { rotation: (activeCard.rotation + 15) % 360 });
                    }
                  }}
                  title="Rotate 15° Right"
                  className="p-1.5 hover:bg-yellow-300 hover:text-black border-2 border-transparent hover:border-black rounded-none transition-all cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>

                {/* Scale buttons */}
                <button
                  onClick={() => {
                    const activeCard = cards.find(c => c.id === selectedCardId);
                    if (activeCard) {
                      onUpdateCardLayout(selectedCardId, { scale: Math.min(1.5, activeCard.scale + 0.1) });
                    }
                  }}
                  title="Scale Up"
                  className="p-1.5 hover:bg-yellow-300 hover:text-black border-2 border-transparent hover:border-black rounded-none transition-all cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>

                {/* Order triggers */}
                <button
                  onClick={() => onUpdateCardLayers(selectedCardId, 'up')}
                  title="Bring Forward"
                  className="p-1.5 hover:bg-yellow-300 hover:text-black border-2 border-transparent hover:border-black rounded-none transition-all cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onUpdateCardLayers(selectedCardId, 'down')}
                  title="Send Backward"
                  className="p-1.5 hover:bg-yellow-300 hover:text-black border-2 border-transparent hover:border-black rounded-none transition-all cursor-pointer"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

                {/* Delete button */}
                <button
                  onClick={() => onDeleteCard(selectedCardId)}
                  title="Delete Card"
                  className="p-1.5 hover:bg-red-500 hover:text-white border-2 border-transparent hover:border-black rounded-none text-red-500 transition-all ml-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Collage Tabletop Board */}
          <div 
            id="collage-board"
            ref={boardRef}
            style={getCollageBgStyle()}
            className={`
              w-full rounded-none relative shadow-xl border-3 border-black overflow-hidden select-none transition-all duration-300 brutal-shadow
              ${getBoardAspectRatioClass()}
              ${getCollageBgClass()}
            `}
            onClick={() => {
              // Click outside any cards to deselect
            }}
          >
            {/* Texture mesh filter if concrete/cork */}
            {collageSettings.backgroundTexture === 'concrete' && (
              <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
            )}

            {/* Mockup HTML Text Overlay */}
            {(() => {
              const activeMockup = collageSettings.mockupId 
                ? MOCKUP_PRESETS.find(m => m.id === collageSettings.mockupId) 
                : null;
              if (activeMockup && activeMockup.textOverlay) {
                return (
                  <div 
                    style={{
                      position: 'absolute',
                      left: `${activeMockup.textOverlay.x}%`,
                      top: `${activeMockup.textOverlay.y}%`,
                      transform: `translate(-50%, -50%) rotate(${activeMockup.textOverlay.rotation || 0}deg)`,
                      fontFamily: activeMockup.textOverlay.fontFamily,
                      fontSize: `calc(${activeMockup.textOverlay.fontSize}px * 0.45 + 1vw)`,
                      color: activeMockup.textOverlay.color,
                      textAlign: activeMockup.textOverlay.align as any,
                      fontWeight: 'bold',
                      lineHeight: 1.15,
                      whiteSpace: 'pre-line',
                      pointerEvents: 'none',
                      zIndex: 2,
                    }}
                  >
                    {activeMockup.textOverlay.text}
                  </div>
                );
              }
              return null;
            })()}

            {cards.length === 0 ? (
              /* Collage Empty State - beautiful 90s OS box */
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[#008080]/30 backdrop-blur-xs">
                <div className="bg-[#c0c0c0] p-6 rounded-none border-[3px] border-black brutal-shadow max-w-sm flex flex-col items-center">
                  <div className="w-full bg-[#000080] text-white text-xs px-2 py-1 font-retro tracking-wide flex justify-between items-center mb-4">
                    <span>POLAFRAME DESKTOP INSTRUCTION</span>
                    <span className="font-bold cursor-pointer">X</span>
                  </div>
                  <button
                    onClick={triggerFileInput}
                    className="group flex flex-col items-center cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-none bg-white border-2 border-black group-hover:bg-yellow-300 group-hover:text-black flex items-center justify-center text-black transition-all duration-100 mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <Plus className="w-8 h-8" />
                    </div>
                    <h3 className="text-black font-pixel text-[17px] uppercase tracking-wide font-bold">Start Your Photo Pack</h3>
                    <p className="text-black text-xs font-mono mt-2 max-w-xs leading-relaxed">
                      Click to boot-up your device and scatter your first Polaroid photo card on this digital tabletop board!
                    </p>
                  </button>
                </div>
              </div>
            ) : (
              /* Scatter Polaroid Cards */
              cards.map((card) => (
                <PolaroidCard
                  key={card.id}
                  card={card}
                  isSelected={card.id === selectedCardId}
                  isCollageMode={true}
                  onSelect={() => onSelectCard(card.id)}
                  onUpdateLayout={(layout) => onUpdateCardLayout(card.id, layout)}
                />
              ))
            )}
          </div>

          {/* Tabletop footer instructions */}
          <div className="flex items-center gap-2 justify-center text-white text-[12px] font-mono font-bold bg-black/40 px-4 py-2 border-2 border-black/10">
            <Info className="w-4 h-4 text-yellow-300" />
            <span>DRAG CARDS TO REPOSITION • CLICK CARD TO EDIT • DOUBLE EXPOSURE & TINTS SUPPORTED</span>
          </div>
        </div>
      )}
    </div>
  );
};
