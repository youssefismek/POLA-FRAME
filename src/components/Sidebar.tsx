import React, { useState } from 'react';
import { 
  FilterSettings, 
  FrameSettings, 
  CollageSettings, 
  PolaroidCard, 
  FrameStyle, 
  LightLeakStyle,
  PolaroidAspectRatio
} from '../types';
import { 
  FILTER_PRESETS, 
  GOOGLE_HANDWRITING_FONTS, 
  FRAME_STYLES, 
  MARKER_COLORS, 
  COLLAGE_BACKGROUNDS 
} from '../data/filters';
import { MOCKUP_PRESETS } from '../data/mockups';
import { 
  Sliders, 
  Type, 
  Settings, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Trash2, 
  Compass, 
  Maximize, 
  Layout, 
  Image as ImageIcon,
  Palette
} from 'lucide-react';

interface SidebarProps {
  mode: 'single' | 'collage';
  cards: PolaroidCard[];
  selectedCardId: string | null;
  collageSettings: CollageSettings;
  onUpdateCardFilter: (id: string, filter: Partial<FilterSettings>) => void;
  onUpdateCardFrame: (id: string, frame: Partial<FrameSettings>) => void;
  onUpdateCardLayout: (id: string, layout: { rotation?: number; scale?: number }) => void;
  onUpdateCardDoubleExposure?: (
    id: string, 
    update: { 
      doubleExposureEnabled?: boolean; 
      imageUrl2?: string; 
      image1Opacity?: number; 
      image2Opacity?: number; 
      image1Gamma?: number; 
      image2Gamma?: number; 
    }
  ) => void;
  onUpdateCollageSettings: (settings: Partial<CollageSettings>) => void;
  onDeleteCard: (id: string) => void;
  onLoadMockup?: (id: string) => void;
  onReplaceCardImage?: (id: string, file: File) => void;
  isMobileView?: boolean;
  activeMobileSection?: string | null;
  onCloseMobileSection?: () => void;
  onBackToMenu?: () => void;
  isAdjusting?: boolean;
  setIsAdjusting?: (adj: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mode,
  cards,
  selectedCardId,
  collageSettings,
  onUpdateCardFilter,
  onUpdateCardFrame,
  onUpdateCardLayout,
  onUpdateCardDoubleExposure,
  onUpdateCollageSettings,
  onDeleteCard,
  onLoadMockup,
  onReplaceCardImage,
  isMobileView = false,
  activeMobileSection = null,
  onCloseMobileSection,
  onBackToMenu,
  isAdjusting = false,
  setIsAdjusting,
}) => {
  // Accordion active sections
  const [openSections, setOpenSections] = useState({
    mockups: true,
    presets: true,
    doubleExposure: true,
    filters: false,
    frame: true,
    caption: true,
    collage: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const selectedCard = cards.find(c => c.id === selectedCardId) || cards[0];

  // Helper to update active card's filter
  const updateFilter = (settings: Partial<FilterSettings>) => {
    if (selectedCard) {
      onUpdateCardFilter(selectedCard.id, settings);
    }
  };

  // Helper to update active card's frame
  const updateFrame = (settings: Partial<FrameSettings>) => {
    if (selectedCard) {
      onUpdateCardFrame(selectedCard.id, settings);
    }
  };

  // Apply a specific preset to the active card
  const handleApplyPreset = (presetId: string) => {
    const preset = FILTER_PRESETS.find(p => p.id === presetId);
    if (preset && selectedCard) {
      updateFilter({
        ...preset.settings,
        presetName: presetId,
      });
    }
  };

  // Custom Background file upload helper
  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      onUpdateCollageSettings({
        backgroundType: 'image',
        backgroundImageUrl: url,
      });
    }
  };

  // Guard: No selected card in sidebar if cards are empty
  const hasSelectedCard = cards.length > 0;

  // Floating panel for mobile view
  const getMobileSectionTitle = () => {
    switch (activeMobileSection) {
      case 'mockups': return 'Retro Mockup Scenes';
      case 'presets': return 'Retro Filters';
      case 'doubleExposure': return 'Double Exposure';
      case 'filters': return 'Fine-Tune Photo';
      case 'frame': return 'Frame & Paper Style';
      case 'caption': return 'Handwritten Caption';
      case 'collage': return 'Tabletop Background';
      default: return 'Settings';
    }
  };

  const getMobileSectionIcon = () => {
    switch (activeMobileSection) {
      case 'mockups': return <ImageIcon className="w-4 h-4 text-white" />;
      case 'presets': return <Sparkles className="w-4 h-4 text-white" />;
      case 'doubleExposure': return <ImageIcon className="w-4 h-4 text-white" />;
      case 'filters': return <Sliders className="w-4 h-4 text-white" />;
      case 'frame': return <Compass className="w-4 h-4 text-white" />;
      case 'caption': return <Type className="w-4 h-4 text-white" />;
      case 'collage': return <Layout className="w-4 h-4 text-white" />;
      default: return <Settings className="w-4 h-4 text-white" />;
    }
  };

  if (isMobileView) {
    if (!activeMobileSection) return null;

    const handleStartDrag = (e: React.TouchEvent | React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'range') {
        setIsAdjusting?.(true);
      }
    };

    const handleEndDrag = () => {
      setIsAdjusting?.(false);
    };

    return (
      <div 
        className={`fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100vw-24px)] max-w-[390px] bg-[#c0c0c0] border-[3px] border-black p-1 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-40 transition-all duration-150 ${
          isAdjusting ? 'opacity-20' : 'opacity-[0.98]'
        }`}
        onMouseDown={handleStartDrag}
        onTouchStart={handleStartDrag}
        onMouseUp={handleEndDrag}
        onTouchEnd={handleEndDrag}
        onMouseLeave={handleEndDrag}
      >
        {/* Title bar - 90s system style */}
        <div className="bg-[#000080] text-white px-2 py-1 flex items-center justify-between select-none">
          <div className="flex items-center font-retro text-[11px] tracking-wide font-extrabold uppercase">
            {onBackToMenu && (
              <button 
                onClick={onBackToMenu}
                className="bg-[#c0c0c0] text-black border border-black hover:bg-yellow-300 font-pixel text-[9px] px-1.5 py-0.5 cursor-pointer leading-none font-black mr-2 flex items-center gap-0.5"
                title="Back to Controls"
              >
                ◀
              </button>
            )}
            <div className="flex items-center gap-1.5">
              {getMobileSectionIcon()}
              <span>{getMobileSectionTitle()}</span>
            </div>
          </div>
          <button 
            onClick={onCloseMobileSection}
            className="bg-[#c0c0c0] text-black border border-black hover:bg-red-500 hover:text-white font-pixel text-[11px] px-1.5 py-0.5 cursor-pointer leading-none font-black"
          >
            X
          </button>
        </div>

        {/* Content body */}
        <div className="p-2.5 max-h-[36vh] overflow-y-auto bg-[#dfdfdf] border border-white/40 mt-1 space-y-4">
          {activeMobileSection === 'mockups' && mode === 'collage' && onLoadMockup && (
            <div className="p-1 space-y-3">
              <p className="text-[10px] font-mono text-black leading-relaxed">
                Choose a pre-built mockup template scene:
              </p>
              <div className="grid grid-cols-1 gap-2">
                {MOCKUP_PRESETS.map((mockup) => {
                  const isSelected = collageSettings.mockupId === mockup.id;
                  return (
                    <button
                      key={mockup.id}
                      onClick={() => onLoadMockup(mockup.id)}
                      className={`
                        p-1.5 text-left border-2 border-black flex items-center gap-2.5 w-full cursor-pointer
                        ${isSelected ? 'bg-black text-white' : 'bg-white text-black hover:bg-yellow-100'}
                      `}
                    >
                      <img 
                        src={mockup.thumbnail} 
                        alt={mockup.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 object-cover border border-black/30"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[11px] font-bold font-pixel uppercase tracking-wide truncate">{mockup.name}</h4>
                        <p className="text-[9px] font-mono leading-tight truncate opacity-85">{mockup.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeMobileSection === 'presets' && hasSelectedCard && (
            <div className="grid grid-cols-2 gap-1.5 p-0.5">
              {FILTER_PRESETS.map((preset) => {
                const isSelected = selectedCard?.filter.presetName === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset.id)}
                    className={`
                      p-2 text-left border-2 border-black flex flex-col justify-between h-[64px] cursor-pointer
                      ${isSelected ? 'bg-yellow-300 text-black brutal-shadow' : 'bg-white text-black'}
                    `}
                  >
                    <span className="font-bold text-[11px] leading-tight font-pixel uppercase">{preset.name}</span>
                    <span className="text-[9px] text-slate-500 line-clamp-1">{preset.description}</span>
                  </button>
                );
              })}
            </div>
          )}

          {activeMobileSection === 'doubleExposure' && hasSelectedCard && (
            <div className="space-y-3 p-0.5">
              {/* Double Exposure switch */}
              <div className="flex items-center justify-between p-2 bg-white border-2 border-black">
                <div className="space-y-0.5">
                  <label className="text-xs font-bold text-slate-800" htmlFor="double-exposure-toggle-mobile">
                    Double Exposure Mode
                  </label>
                  <p className="text-[9px] text-slate-500 leading-none">Superimpose two photos together</p>
                </div>
                <input
                  id="double-exposure-toggle-mobile"
                  type="checkbox"
                  checked={!!selectedCard?.doubleExposureEnabled}
                  onChange={(e) => {
                    if (onUpdateCardDoubleExposure && selectedCard) {
                      onUpdateCardDoubleExposure(selectedCard.id, {
                        doubleExposureEnabled: e.target.checked
                      });
                    }
                  }}
                  className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded focus:ring-black accent-black cursor-pointer"
                />
              </div>

              {selectedCard?.doubleExposureEnabled && (
                <div className="space-y-3 pt-2 border-t border-black/10">
                  {/* Photo 2 selection */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block">Second Photo</span>
                    {selectedCard?.imageUrl2 ? (
                      <div className="flex items-center gap-2 p-1.5 bg-white border-2 border-black">
                        <img src={selectedCard.imageUrl2} className="w-10 h-10 object-cover border border-black/30" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-slate-700 truncate">Secondary Image</p>
                        </div>
                        <button
                          onClick={() => {
                            const input = document.getElementById('double-exposure-file-input-mobile');
                            if (input) input.click();
                          }}
                          className="px-2 py-1 bg-yellow-300 border-2 border-black text-[10px] font-bold cursor-pointer"
                        >
                          Replace
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          const input = document.getElementById('double-exposure-file-input-mobile');
                          if (input) input.click();
                        }}
                        className="w-full py-4 bg-white border-2 border-dashed border-slate-400 hover:border-black flex flex-col items-center justify-center gap-1 cursor-pointer"
                      >
                        <ImageIcon className="w-5 h-5 text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-700">Upload Second Photo</span>
                      </button>
                    )}
                    <input
                      type="file"
                      id="double-exposure-file-input-mobile"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0 && onUpdateCardDoubleExposure && selectedCard) {
                          const file = e.target.files[0];
                          const url = URL.createObjectURL(file);
                          onUpdateCardDoubleExposure(selectedCard.id, { imageUrl2: url });
                        }
                      }}
                    />
                  </div>

                  {/* Range Sliders for Double Exposure */}
                  <div className="space-y-2">
                    {/* Base Opacity */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-600 font-medium">Base Opacity</span>
                        <span className="text-slate-900 font-bold">{(selectedCard.image1Opacity !== undefined ? selectedCard.image1Opacity : 100)}%</span>
                      </div>
                      <input
                        type="range" min="0" max="100"
                        value={(selectedCard.image1Opacity !== undefined ? selectedCard.image1Opacity : 100)}
                        onChange={(e) => onUpdateCardDoubleExposure?.(selectedCard.id, { image1Opacity: parseInt(e.target.value) })}
                        className="w-full h-1 bg-slate-300 cursor-pointer accent-black"
                      />
                    </div>
                    {/* Overlay Opacity */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-600 font-medium">Overlay Opacity</span>
                        <span className="text-slate-900 font-bold">{(selectedCard.image2Opacity !== undefined ? selectedCard.image2Opacity : 50)}%</span>
                      </div>
                      <input
                        type="range" min="0" max="100"
                        value={(selectedCard.image2Opacity !== undefined ? selectedCard.image2Opacity : 50)}
                        onChange={(e) => onUpdateCardDoubleExposure?.(selectedCard.id, { image2Opacity: parseInt(e.target.value) })}
                        className="w-full h-1 bg-slate-300 cursor-pointer accent-black"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeMobileSection === 'filters' && hasSelectedCard && (
            <div className="space-y-3.5 p-0.5">
              {[
                { label: 'Brightness', key: 'brightness', min: 50, max: 150, unit: '%' },
                { label: 'Contrast', key: 'contrast', min: 50, max: 150, unit: '%' },
                { label: 'Saturation', key: 'saturation', min: 0, max: 200, unit: '%' },
                { label: 'Sepia Cast', key: 'sepia', min: 0, max: 100, unit: '%' },
                { label: 'Warmth Tint', key: 'temperature', min: -50, max: 50, unit: '', customLabel: (val: number) => val > 0 ? `Warm +${val}` : val < 0 ? `Cool ${val}` : 'Neutral' },
                { label: 'Soft Focus', key: 'blur', min: 0, max: 5, step: 0.1, unit: 'px' },
                { label: 'Film Grain', key: 'grain', min: 0, max: 100, unit: '%' },
                { label: 'Vignette', key: 'vignette', min: 0, max: 100, unit: '%' },
              ].map((slider) => {
                const val = selectedCard?.filter[slider.key as keyof FilterSettings] as number;
                return (
                  <div key={slider.key} className="space-y-0.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-700 font-semibold">{slider.label}</span>
                      <span className="font-mono text-slate-500 font-bold">
                        {slider.customLabel ? slider.customLabel(val) : `${val}${slider.unit}`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={slider.min}
                      max={slider.max}
                      step={slider.step || 1}
                      value={val}
                      onChange={(e) => updateFilter({ [slider.key]: parseFloat(e.target.value) })}
                      className="w-full accent-black h-1.5 bg-slate-300 cursor-pointer"
                    />
                  </div>
                );
              })}

              {/* Light Leak Dropdown in Mobile */}
              <div className="space-y-1.5 pt-2 border-t border-black/10">
                <label className="text-[11px] text-slate-700 font-bold block">Light Leak Effect</label>
                <select
                  value={selectedCard?.filter.lightLeak}
                  onChange={(e) => updateFilter({ lightLeak: e.target.value as LightLeakStyle })}
                  className="w-full bg-white border-2 border-black px-2 py-1 text-xs text-black"
                >
                  <option value="none">None</option>
                  <option value="warm-glow">Warm Side Glow</option>
                  <option value="sunset-strip">Sunset Linear Strip</option>
                  <option value="rainbow-streak">Spectrum Rainbow Leak</option>
                  <option value="side-flare">Intense Corner Flare</option>
                </select>
              </div>
            </div>
          )}

          {activeMobileSection === 'frame' && hasSelectedCard && (
            <div className="space-y-4 p-0.5">
              {/* Paper Materials */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 block">Card Paper Material</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {FRAME_STYLES.map((style) => {
                    const isSelected = selectedCard?.frame.style === style.id;
                    return (
                      <button
                        key={style.id}
                        onClick={() => updateFrame({ style: style.id })}
                        className={`
                          p-2 text-left text-[11px] font-semibold flex items-center gap-1.5 border-2 border-black cursor-pointer
                          ${isSelected ? 'bg-black text-white' : 'bg-white text-black'}
                        `}
                      >
                        <span className={`w-3 h-3 rounded-full border border-black/20 ${style.bgClass}`} />
                        <span className="truncate">{style.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Aspect Ratio in Mobile */}
              <div className="space-y-1.5 pt-2 border-t border-black/10">
                <label className="text-[11px] font-bold text-slate-700 block">Photo Aspect Ratio</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['1:1', '4:5', '3:4', '16:9'] as PolaroidAspectRatio[]).map((ratio) => {
                    const isSelected = selectedCard?.frame.aspectRatio === ratio;
                    return (
                      <button
                        key={ratio}
                        onClick={() => updateFrame({ aspectRatio: ratio })}
                        className={`
                          py-1 rounded font-mono text-[11px] font-bold text-center border-2 border-black cursor-pointer
                          ${isSelected ? 'bg-black text-white' : 'bg-white text-black'}
                        `}
                      >
                        {ratio}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Layout Rotation and Scale */}
              {mode === 'collage' && selectedCard && (
                <div className="pt-2 border-t border-black/10 space-y-2">
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-600 font-semibold">Angle rotation</span>
                      <span className="font-mono text-slate-700 font-bold">{selectedCard.rotation}°</span>
                    </div>
                    <input
                      type="range" min="-180" max="180"
                      value={selectedCard.rotation}
                      onChange={(e) => onUpdateCardLayout(selectedCard.id, { rotation: parseInt(e.target.value) })}
                      className="w-full accent-black h-1 bg-slate-300 cursor-pointer"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-600 font-semibold">Scale multiplier</span>
                      <span className="font-mono text-slate-700 font-bold">{Math.round(selectedCard.scale * 100)}%</span>
                    </div>
                    <input
                      type="range" min="50" max="150"
                      value={selectedCard.scale * 100}
                      onChange={(e) => onUpdateCardLayout(selectedCard.id, { scale: parseInt(e.target.value) / 100 })}
                      className="w-full accent-black h-1 bg-slate-300 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeMobileSection === 'caption' && hasSelectedCard && (
            <div className="space-y-3.5 p-0.5">
              {/* Text Area */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 block">Caption Text</label>
                <textarea
                  value={selectedCard?.frame.caption || ''}
                  onChange={(e) => updateFrame({ caption: e.target.value })}
                  placeholder="Type captions with marker pen..."
                  rows={2}
                  className="w-full bg-white border-2 border-black p-2 text-xs text-black focus:outline-none focus:ring-0"
                />
              </div>

              {/* Handwriting Font */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 block">Handwriting Font</label>
                <select
                  value={selectedCard?.frame.fontFamily || 'Architects Daughter'}
                  onChange={(e) => updateFrame({ fontFamily: e.target.value })}
                  className="w-full bg-white border-2 border-black px-2 py-1 text-xs text-black cursor-pointer"
                >
                  {GOOGLE_HANDWRITING_FONTS.map((font) => (
                    <option key={font.id} value={font.id}>{font.name}</option>
                  ))}
                </select>
              </div>

              {/* Marker Pen Color */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 block">Ink Pen Color</label>
                <div className="flex flex-wrap gap-1.5">
                  {MARKER_COLORS.map((color) => {
                    const isSelected = selectedCard?.frame.markerColor === color.id;
                    return (
                      <button
                        key={color.id}
                        onClick={() => updateFrame({ markerColor: color.id })}
                        className={`
                          w-6 h-6 border-2 flex items-center justify-center rounded-full cursor-pointer transition-all
                          ${isSelected ? 'border-black scale-110 shadow-sm' : 'border-black/20 hover:border-black/50'}
                        `}
                        style={{ backgroundColor: color.id }}
                        title={color.name}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full mix-blend-difference" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Caption Font Size */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-600 font-semibold">Pen tip size</span>
                  <span className="font-mono text-slate-700 font-bold">{selectedCard?.frame.fontSize || 16}px</span>
                </div>
                <input
                  type="range" min="10" max="32"
                  value={selectedCard?.frame.fontSize || 16}
                  onChange={(e) => updateFrame({ fontSize: parseInt(e.target.value) })}
                  className="w-full accent-black h-1 bg-slate-300 cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeMobileSection === 'collage' && (
            <div className="space-y-3.5 p-0.5">
              {/* Table Canvas Size */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Table Canvas Size</label>
                <select
                  value={collageSettings.aspectRatio}
                  onChange={(e) => onUpdateCollageSettings({ aspectRatio: e.target.value as '16:9' | '4:3' | '1:1' })}
                  className="w-full bg-white border-2 border-black px-2 py-1.5 text-xs text-black cursor-pointer"
                >
                  <option value="16:9">Widescreen (16:9)</option>
                  <option value="4:3">Classic (4:3)</option>
                  <option value="1:1">Square (1:1)</option>
                </select>
              </div>

              {/* Materials */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Tabletop Texture</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {COLLAGE_BACKGROUNDS.map((bg) => {
                    const isSelected = collageSettings.backgroundType === 'texture' && collageSettings.backgroundTexture === bg.id;
                    return (
                      <button
                        key={bg.id}
                        onClick={() => onUpdateCollageSettings({ backgroundType: 'texture', backgroundTexture: bg.id as any })}
                        className={`
                          p-1.5 text-left border-2 border-black cursor-pointer text-[11px]
                          ${isSelected ? 'bg-black text-white' : 'bg-white text-black'}
                        `}
                      >
                        <span className="font-bold block">{bg.name}</span>
                      </button>
                    );
                  })}
                  <button
                    onClick={() => onUpdateCollageSettings({ backgroundType: 'color' })}
                    className={`
                      p-1.5 text-left border-2 border-black cursor-pointer text-[11px]
                      ${collageSettings.backgroundType === 'color' ? 'bg-black text-white' : 'bg-white text-black'}
                    `}
                  >
                    <span className="font-bold block">Solid Studio Color</span>
                  </button>
                </div>
              </div>

              {collageSettings.backgroundType === 'color' && (
                <div className="space-y-1 animate-fade-in">
                  <label className="text-[11px] text-slate-600 block">Custom Table Color</label>
                  <input
                    type="color"
                    value={collageSettings.backgroundColor}
                    onChange={(e) => onUpdateCollageSettings({ backgroundColor: e.target.value })}
                    className="w-full h-8 cursor-pointer border-2 border-black p-0"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <aside 
      id="control-sidebar"
      className="w-full lg:w-[380px] bg-[#dfdfdf] border-t-2 lg:border-t-0 lg:border-r-[3px] border-black flex flex-col h-full overflow-y-auto select-none"
    >
      <div className="p-4 border-b-2 border-black bg-[#c0c0c0] shadow-sm flex flex-col gap-2">
        <h2 className="text-black font-retro text-[12px] tracking-wider flex items-center gap-2 uppercase">
          <Settings className="w-4 h-4 text-black" />
          Control Panel
        </h2>
        {mode === 'collage' && selectedCardId && (
          <div className="flex flex-col gap-2 bg-cyan-300 border-2 border-black p-2.5 brutal-shadow">
            <div className="text-[11px] font-bold text-black uppercase tracking-wide">
              Editing Selected Card
            </div>
            {onReplaceCardImage && selectedCard && (
              <label className="flex items-center justify-center gap-2 bg-yellow-300 hover:bg-yellow-200 border-2 border-black px-3 py-1 text-[11px] text-black font-extrabold uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition-all">
                <ImageIcon className="w-3.5 h-3.5 text-black" />
                <span>Replace Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      onReplaceCardImage(selectedCard.id, e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
              </label>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 p-4 space-y-4">
        
        {/* ========================================================= */}
        {/* SECTION 0: RETRO MOCKUP SCENES (ONLY IN COLLAGE MODE) */}
        {/* ========================================================= */}
        {mode === 'collage' && onLoadMockup && (
          <div className="border-2 border-black rounded-none overflow-hidden bg-white brutal-shadow">
            <button
              onClick={() => toggleSection('mockups')}
              className="w-full px-4 py-3 bg-yellow-300 hover:bg-yellow-200 border-b-2 border-black transition-all flex items-center justify-between text-black font-extrabold text-xs tracking-widest uppercase cursor-pointer"
            >
              <span className="flex items-center gap-2 text-black font-pixel text-[16px] tracking-widest font-bold">
                <ImageIcon className="w-4 h-4 text-black" />
                Retro Mockup Scenes
              </span>
              {openSections.mockups ? <ChevronUp className="w-4 h-4 text-black" /> : <ChevronDown className="w-4 h-4 text-black" />}
            </button>
            
            {openSections.mockups && (
              <div className="p-4 space-y-3 animate-fade-in text-slate-800">
                <p className="text-[11px] font-mono text-black leading-relaxed">
                  Choose a gorgeous pre-built 90s aesthetic mockup scene to place your photos into:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {MOCKUP_PRESETS.map((mockup) => {
                    const isSelected = collageSettings.mockupId === mockup.id;
                    return (
                      <button
                        key={mockup.id}
                        onClick={() => onLoadMockup(mockup.id)}
                        className={`
                          p-2 text-left transition-all cursor-pointer border-2 border-black flex items-center gap-3 w-full
                          ${isSelected 
                            ? 'bg-black text-white' 
                            : 'bg-slate-50 text-slate-800 hover:bg-yellow-100'
                          }
                        `}
                      >
                        <img 
                          src={mockup.thumbnail} 
                          alt={mockup.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 object-cover border border-black/30"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold font-pixel uppercase tracking-wide truncate">{mockup.name}</h4>
                          <p className="text-[10px] font-mono leading-tight mt-0.5 line-clamp-2 opacity-85">{mockup.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* ========================================================= */}
        {/* SECTION 1: FILTER PRESETS */}
        {/* ========================================================= */}
        {hasSelectedCard && (
          <div className="border-2 border-black rounded-none overflow-hidden bg-white brutal-shadow">
            <button
              onClick={() => toggleSection('presets')}
              className="w-full px-4 py-3 bg-[#c0c0c0] hover:bg-slate-300 border-b-2 border-black transition-all flex items-center justify-between text-black font-extrabold text-xs tracking-widest uppercase cursor-pointer"
            >
              <span className="flex items-center gap-2 text-black font-pixel text-[16px] tracking-widest font-bold">
                <Sparkles className="w-4 h-4 text-black" />
                Retro Filters
              </span>
              {openSections.presets ? <ChevronUp className="w-4 h-4 text-black" /> : <ChevronDown className="w-4 h-4 text-black" />}
            </button>
            
            {openSections.presets && (
              <div className="p-4 space-y-3 animate-fade-in">
                <div className="grid grid-cols-2 gap-2">
                  {FILTER_PRESETS.map((preset) => {
                    const isSelected = selectedCard?.filter.presetName === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleApplyPreset(preset.id)}
                        className={`
                          p-2.5 text-left transition-all cursor-pointer border-2 border-black flex flex-col justify-between h-[68px]
                          ${isSelected 
                            ? 'bg-yellow-300 border-black text-black brutal-shadow' 
                            : 'bg-white border-black hover:bg-slate-100 text-black'
                          }
                        `}
                      >
                        <span className="font-bold text-xs leading-tight">{preset.name}</span>
                        <span className="text-[10px] text-slate-400 line-clamp-1">{preset.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 1.5: DOUBLE EXPOSURE MODE */}
        {/* ========================================================= */}
        {hasSelectedCard && (
          <div className="border-2 border-black rounded-none overflow-hidden bg-white brutal-shadow">
            <button
              onClick={() => toggleSection('doubleExposure')}
              className="w-full px-4 py-3 bg-[#c0c0c0] hover:bg-slate-300 border-b-2 border-black transition-all flex items-center justify-between text-black font-extrabold text-xs tracking-widest uppercase cursor-pointer"
            >
              <span className="flex items-center gap-2 text-black font-pixel text-[16px] tracking-widest font-bold">
                <ImageIcon className="w-4 h-4 text-black" />
                Double Exposure
              </span>
              {openSections.doubleExposure ? <ChevronUp className="w-4 h-4 text-black" /> : <ChevronDown className="w-4 h-4 text-black" />}
            </button>

            {openSections.doubleExposure && (
              <div className="p-4 space-y-4 animate-fade-in">
                {/* 1. Toggle Switch */}
                <div className="flex items-center justify-between p-3 bg-slate-50 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-slate-800 cursor-pointer" htmlFor="double-exposure-toggle">
                      Double Exposure Mode
                    </label>
                    <p className="text-[10px] text-slate-500 leading-normal">Superimpose two photos together</p>
                  </div>
                  <input
                    id="double-exposure-toggle"
                    type="checkbox"
                    checked={!!selectedCard?.doubleExposureEnabled}
                    onChange={(e) => {
                      if (onUpdateCardDoubleExposure && selectedCard) {
                        onUpdateCardDoubleExposure(selectedCard.id, {
                          doubleExposureEnabled: e.target.checked
                        });
                      }
                    }}
                    className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded focus:ring-black focus:ring-2 cursor-pointer accent-black"
                  />
                </div>

                {selectedCard?.doubleExposureEnabled && (
                  <div className="space-y-4 pt-1 border-t border-slate-100 animate-fade-in">
                    {/* 2. Photo 2 Upload Area */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Second Photo</span>
                      
                      {selectedCard?.imageUrl2 ? (
                        <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                          <img
                            src={selectedCard.imageUrl2}
                            alt="Secondary thumbnail"
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-700 truncate">Secondary Image</p>
                            <p className="text-[10px] text-slate-400">Ready to blend</p>
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => {
                                const input = document.getElementById('double-exposure-file-input');
                                if (input) input.click();
                              }}
                              className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 transition-colors text-[11px] font-medium cursor-pointer"
                              title="Replace Photo"
                            >
                              Replace
                            </button>
                            <button
                              onClick={() => {
                                if (onUpdateCardDoubleExposure && selectedCard) {
                                  onUpdateCardDoubleExposure(selectedCard.id, {
                                    imageUrl2: undefined
                                  });
                                }
                              }}
                              className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg transition-colors cursor-pointer"
                              title="Remove Photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            const input = document.getElementById('double-exposure-file-input');
                            if (input) input.click();
                          }}
                          className="w-full py-6 px-4 bg-slate-50 border-2 border-dashed border-slate-200 hover:border-slate-800 hover:bg-slate-50/50 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300"
                        >
                          <ImageIcon className="w-6 h-6 text-slate-400" />
                          <span className="text-xs font-bold text-slate-700">Upload Second Photo</span>
                          <span className="text-[10px] text-slate-400">PNG, JPG, JPEG, WEBP</span>
                        </button>
                      )}

                      <input
                        type="file"
                        id="double-exposure-file-input"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0 && onUpdateCardDoubleExposure && selectedCard) {
                            const file = e.target.files[0];
                            const url = URL.createObjectURL(file);
                            onUpdateCardDoubleExposure(selectedCard.id, {
                              imageUrl2: url
                            });
                          }
                        }}
                      />
                    </div>

                    {/* 3. Image 1 Parameters */}
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      <span className="text-xs font-extrabold text-slate-800 uppercase tracking-widest block">Photo 1 (Base) Controls</span>
                      
                      {/* Image 1 Opacity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600 font-medium">Base Opacity</span>
                          <span className="text-slate-900 font-bold">{(selectedCard.image1Opacity !== undefined ? selectedCard.image1Opacity : 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={(selectedCard.image1Opacity !== undefined ? selectedCard.image1Opacity : 100)}
                          onChange={(e) => {
                            if (onUpdateCardDoubleExposure && selectedCard) {
                              onUpdateCardDoubleExposure(selectedCard.id, {
                                image1Opacity: parseInt(e.target.value)
                              });
                            }
                          }}
                          className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-black"
                        />
                      </div>

                      {/* Image 1 Gamma */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600 font-medium">Base Gamma</span>
                          <span className="text-slate-900 font-bold">{(selectedCard.image1Gamma !== undefined ? selectedCard.image1Gamma : 1.0).toFixed(1)}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="3.0"
                          step="0.1"
                          value={(selectedCard.image1Gamma !== undefined ? selectedCard.image1Gamma : 1.0)}
                          onChange={(e) => {
                            if (onUpdateCardDoubleExposure && selectedCard) {
                              onUpdateCardDoubleExposure(selectedCard.id, {
                                image1Gamma: parseFloat(e.target.value)
                              });
                            }
                          }}
                          className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-black"
                        />
                      </div>
                    </div>

                    {/* 4. Image 2 Parameters */}
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      <span className="text-xs font-extrabold text-slate-800 uppercase tracking-widest block">Photo 2 (Overlay) Controls</span>
                      
                      {/* Image 2 Opacity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600 font-medium">Overlay Opacity</span>
                          <span className="text-slate-900 font-bold">{(selectedCard.image2Opacity !== undefined ? selectedCard.image2Opacity : 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={(selectedCard.image2Opacity !== undefined ? selectedCard.image2Opacity : 50)}
                          onChange={(e) => {
                            if (onUpdateCardDoubleExposure && selectedCard) {
                              onUpdateCardDoubleExposure(selectedCard.id, {
                                image2Opacity: parseInt(e.target.value)
                              });
                            }
                          }}
                          className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-black"
                        />
                      </div>

                      {/* Image 2 Gamma */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600 font-medium">Overlay Gamma</span>
                          <span className="text-slate-900 font-bold">{(selectedCard.image2Gamma !== undefined ? selectedCard.image2Gamma : 1.0).toFixed(1)}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="3.0"
                          step="0.1"
                          value={(selectedCard.image2Gamma !== undefined ? selectedCard.image2Gamma : 1.0)}
                          onChange={(e) => {
                            if (onUpdateCardDoubleExposure && selectedCard) {
                              onUpdateCardDoubleExposure(selectedCard.id, {
                                image2Gamma: parseFloat(e.target.value)
                              });
                            }
                          }}
                          className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-black"
                        />
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 2: MANUAL PHOTO ADJUSTMENTS */}
        {/* ========================================================= */}
        {hasSelectedCard && (
          <div className="border-2 border-black rounded-none overflow-hidden bg-white brutal-shadow">
            <button
              onClick={() => toggleSection('filters')}
              className="w-full px-4 py-3 bg-[#c0c0c0] hover:bg-slate-300 border-b-2 border-black transition-all flex items-center justify-between text-black font-extrabold text-xs tracking-widest uppercase cursor-pointer"
            >
              <span className="flex items-center gap-2 text-black font-pixel text-[16px] tracking-widest font-bold">
                <Sliders className="w-4 h-4 text-black" />
                Fine-Tune Photo
              </span>
              {openSections.filters ? <ChevronUp className="w-4 h-4 text-black" /> : <ChevronDown className="w-4 h-4 text-black" />}
            </button>

            {openSections.filters && (
              <div className="p-4 space-y-4 animate-fade-in text-slate-800">
                
                {/* Sliders loop */}
                {[
                  { label: 'Brightness', key: 'brightness', min: 50, max: 150, unit: '%' },
                  { label: 'Contrast', key: 'contrast', min: 50, max: 150, unit: '%' },
                  { label: 'Saturation', key: 'saturation', min: 0, max: 200, unit: '%' },
                  { label: 'Sepia Cast', key: 'sepia', min: 0, max: 100, unit: '%' },
                  { label: 'Warmth Tint', key: 'temperature', min: -50, max: 50, unit: '', customLabel: (val: number) => val > 0 ? `Warm +${val}` : val < 0 ? `Cool ${val}` : 'Neutral' },
                  { label: 'Soft Focus', key: 'blur', min: 0, max: 5, step: 0.1, unit: 'px' },
                ].map((slider) => {
                  const val = selectedCard?.filter[slider.key as keyof FilterSettings] as number;
                  return (
                    <div key={slider.key} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600 font-medium">{slider.label}</span>
                        <span className="font-mono text-slate-400 text-[11px]">
                          {slider.customLabel ? slider.customLabel(val) : `${val}${slider.unit}`}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={slider.min}
                        max={slider.max}
                        step={slider.step || 1}
                        value={val}
                        onChange={(e) => updateFilter({ [slider.key]: parseFloat(e.target.value) })}
                        className="w-full accent-black h-1 bg-slate-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  );
                })}

                <div className="border-t border-slate-200 pt-4 space-y-4">
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Analog Anomalies</h4>
                  
                  {/* Film Grain Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600 font-medium">Film Grain</span>
                      <span className="font-mono text-slate-400 text-[11px]">{selectedCard?.filter.grain}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={selectedCard?.filter.grain}
                      onChange={(e) => updateFilter({ grain: parseInt(e.target.value) })}
                      className="w-full accent-black h-1 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Vignette Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600 font-medium">Vignette</span>
                      <span className="font-mono text-slate-400 text-[11px]">{selectedCard?.filter.vignette}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={selectedCard?.filter.vignette}
                      onChange={(e) => updateFilter({ vignette: parseInt(e.target.value) })}
                      className="w-full accent-black h-1 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Light Leak Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-600 font-medium block">Light Leak Effect</label>
                    <select
                      value={selectedCard?.filter.lightLeak}
                      onChange={(e) => updateFilter({ lightLeak: e.target.value as LightLeakStyle })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-black shadow-xs"
                    >
                      <option value="none">None</option>
                      <option value="warm-glow">Warm Side Glow</option>
                      <option value="sunset-strip">Sunset Linear Strip</option>
                      <option value="rainbow-streak">Spectrum Rainbow Leak</option>
                      <option value="side-flare">Intense Corner Flare</option>
                    </select>
                  </div>

                  {/* Light Leak Intensity */}
                  {selectedCard?.filter.lightLeak !== 'none' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600 font-medium">Leak Intensity</span>
                        <span className="font-mono text-slate-400 text-[11px]">{selectedCard?.filter.lightLeakIntensity}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={selectedCard?.filter.lightLeakIntensity}
                        onChange={(e) => updateFilter({ lightLeakIntensity: parseInt(e.target.value) })}
                        className="w-full accent-black h-1 bg-slate-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 3: POLAROID FRAME & CUTOUT ASPECT */}
        {/* ========================================================= */}
        {hasSelectedCard && (
          <div className="border-2 border-black rounded-none overflow-hidden bg-white brutal-shadow">
            <button
              onClick={() => toggleSection('frame')}
              className="w-full px-4 py-3 bg-[#c0c0c0] hover:bg-slate-300 border-b-2 border-black transition-all flex items-center justify-between text-black font-extrabold text-xs tracking-widest uppercase cursor-pointer"
            >
              <span className="flex items-center gap-2 text-black font-pixel text-[16px] tracking-widest font-bold">
                <Compass className="w-4 h-4 text-black" />
                Frame & Paper Style
              </span>
              {openSections.frame ? <ChevronUp className="w-4 h-4 text-black" /> : <ChevronDown className="w-4 h-4 text-black" />}
            </button>

            {openSections.frame && (
              <div className="p-4 space-y-4 animate-fade-in text-slate-800">
                
                {/* Border Paper Material preset */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-600 font-medium block">Card Material Preset</label>
                  <div className="grid grid-cols-1 gap-2">
                    {FRAME_STYLES.map((style) => {
                      const isSelected = selectedCard?.frame.style === style.id;
                      return (
                        <button
                          key={style.id}
                          onClick={() => updateFrame({ style: style.id })}
                          className={`
                            px-3 py-2 rounded-lg text-left text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer
                            ${isSelected 
                              ? 'bg-slate-900 border-slate-950 text-white' 
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-950'
                            }
                          `}
                        >
                          <span className={`w-4 h-4 rounded-full border border-black/10 ${style.bgClass}`} />
                          {style.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Aspect Ratio selector */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <label className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                    <Maximize className="w-3.5 h-3.5 text-slate-900" />
                    Photo Cutout Aspect Ratio
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['1:1', '4:5', '3:4', '16:9'] as PolaroidAspectRatio[]).map((ratio) => {
                      const isSelected = selectedCard?.frame.aspectRatio === ratio;
                      return (
                        <button
                          key={ratio}
                          onClick={() => updateFrame({ aspectRatio: ratio })}
                          className={`
                            py-1.5 rounded-md font-mono text-[10px] font-bold text-center border transition-all cursor-pointer
                            ${isSelected 
                              ? 'bg-slate-900 border-slate-950 text-white shadow-xs' 
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-950'
                            }
                          `}
                        >
                          {ratio}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Specific layout options in Collage mode */}
                {mode === 'collage' && selectedCard && (
                  <div className="pt-3 border-t border-slate-200 space-y-3">
                    <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Board Layout</h4>
                    
                    {/* Rotation slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Card Angle</span>
                        <span className="font-mono text-slate-400">{selectedCard.rotation}°</span>
                      </div>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={selectedCard.rotation}
                        onChange={(e) => onUpdateCardLayout(selectedCard.id, { rotation: parseInt(e.target.value) })}
                        className="w-full accent-black h-1 bg-slate-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Scale slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Card Size</span>
                        <span className="font-mono text-slate-400">{Math.round(selectedCard.scale * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        value={selectedCard.scale * 100}
                        onChange={(e) => onUpdateCardLayout(selectedCard.id, { scale: parseInt(e.target.value) / 100 })}
                        className="w-full accent-black h-1 bg-slate-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 4: CAPTION & PEN WRITING */}
        {/* ========================================================= */}
        {hasSelectedCard && (
          <div className="border-2 border-black rounded-none overflow-hidden bg-white brutal-shadow">
            <button
              onClick={() => toggleSection('caption')}
              className="w-full px-4 py-3 bg-[#c0c0c0] hover:bg-slate-300 border-b-2 border-black transition-all flex items-center justify-between text-black font-extrabold text-xs tracking-widest uppercase cursor-pointer"
            >
              <span className="flex items-center gap-2 text-black font-pixel text-[16px] tracking-widest font-bold">
                <Type className="w-4 h-4 text-black" />
                Handwritten Caption
              </span>
              {openSections.caption ? <ChevronUp className="w-4 h-4 text-black" /> : <ChevronDown className="w-4 h-4 text-black" />}
            </button>

            {openSections.caption && (
              <div className="p-4 space-y-4 animate-fade-in text-slate-800">
                
                {/* Caption Text Box */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-600 font-medium block">Write Caption Text</label>
                  <input
                    type="text"
                    value={selectedCard?.frame.caption}
                    maxLength={35}
                    placeholder="E.g. Summer Dreams 🌊"
                    onChange={(e) => updateFrame({ caption: e.target.value })}
                    className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-black focus:ring-1 focus:ring-black focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-900 transition-all shadow-xs"
                  />
                  <div className="text-[10px] text-slate-400 text-right">
                    {35 - (selectedCard?.frame.caption.length || 0)} chars remaining
                  </div>
                </div>

                {/* Custom Handwriting Font list */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-600 font-medium block">Handwriting Style</label>
                  <select
                    value={selectedCard?.frame.fontFamily}
                    onChange={(e) => updateFrame({ fontFamily: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-black shadow-xs cursor-pointer"
                  >
                    {GOOGLE_HANDWRITING_FONTS.map((font) => (
                      <option key={font.id} value={font.id}>{font.name}</option>
                    ))}
                  </select>
                </div>

                {/* Marker Ink Color selection */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-600 font-medium block">Marker Ink Color</label>
                  <div className="flex items-center gap-3">
                    {MARKER_COLORS.map((color) => {
                      const isSelected = selectedCard?.frame.markerColor === color.id;
                      return (
                        <button
                          key={color.id}
                          onClick={() => updateFrame({ markerColor: color.id })}
                          title={color.name}
                          className={`
                            w-7 h-7 rounded-full relative cursor-pointer border shadow-xs hover:scale-105 transition-all
                            ${isSelected ? `${color.border} ring-2 ring-slate-400 scale-105` : 'border-slate-200'}
                          `}
                          style={{ backgroundColor: color.id }}
                        >
                          {isSelected && (
                            <div className="absolute inset-1.5 rounded-full border border-white/20 bg-white/20" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sliders for angle and font size */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-600 block font-medium">Font Size</label>
                    <input
                      type="range"
                      min="18"
                      max="48"
                      value={selectedCard?.frame.fontSize}
                      onChange={(e) => updateFrame({ fontSize: parseInt(e.target.value) })}
                      className="w-full accent-black h-1 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-600 block font-medium">Ink Slant</label>
                    <input
                      type="range"
                      min="-10"
                      max="10"
                      step="0.5"
                      value={selectedCard?.frame.textAngle}
                      onChange={(e) => updateFrame({ textAngle: parseFloat(e.target.value) })}
                      className="w-full accent-black h-1 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Date Stamp Setup */}
                <div className="pt-3 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-slate-600 font-medium flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCard?.frame.showDate}
                        onChange={(e) => updateFrame({ showDate: e.target.checked })}
                        className="rounded border-slate-300 text-black focus:ring-black/20 bg-white w-3.5 h-3.5 cursor-pointer"
                      />
                      Add Retro Date Stamp
                    </label>
                  </div>
                  
                  {selectedCard?.frame.showDate && (
                    <div className="space-y-1 animate-fade-in">
                      <div className="relative">
                        <input
                          type="text"
                          value={selectedCard?.frame.dateText}
                          placeholder="DATE"
                          onChange={(e) => updateFrame({ dateText: e.target.value.toUpperCase() })}
                          className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-black focus:outline-none rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 shadow-xs"
                        />
                        <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 5: COLLAGE TABLETOP CONFIG (ONLY IN COLLAGE MODE) */}
        {/* ========================================================= */}
        {mode === 'collage' && (
          <div className="border-2 border-black rounded-none overflow-hidden bg-white brutal-shadow">
            <button
              onClick={() => toggleSection('collage')}
              className="w-full px-4 py-3 bg-[#c0c0c0] hover:bg-slate-300 border-b-2 border-black transition-all flex items-center justify-between text-black font-extrabold text-xs tracking-widest uppercase cursor-pointer"
            >
              <span className="flex items-center gap-2 text-black font-pixel text-[16px] tracking-widest font-bold">
                <Layout className="w-4 h-4 text-black" />
                Tabletop Background
              </span>
              {openSections.collage ? <ChevronUp className="w-4 h-4 text-black" /> : <ChevronDown className="w-4 h-4 text-black" />}
            </button>

            {openSections.collage && (
              <div className="p-4 space-y-4 animate-fade-in text-slate-800">
                
                {/* Tabletop Aspect Ratio */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-600 font-medium block">Table Canvas Size</label>
                  <select
                    value={collageSettings.aspectRatio}
                    onChange={(e) => onUpdateCollageSettings({ aspectRatio: e.target.value as '16:9' | '4:3' | '1:1' })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-black cursor-pointer shadow-xs"
                  >
                    <option value="16:9">Widescreen Pack (16:9)</option>
                    <option value="4:3">Classic Photo Stack (4:3)</option>
                    <option value="1:1">Square Grid (1:1)</option>
                  </select>
                </div>

                {/* Tabletop Material Presets */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-600 font-medium block">Background Material</label>
                  <div className="grid grid-cols-2 gap-2">
                    {COLLAGE_BACKGROUNDS.map((bg) => {
                      const isSelected = collageSettings.backgroundType === 'texture' && collageSettings.backgroundTexture === bg.id;
                      return (
                        <button
                          key={bg.id}
                          onClick={() => onUpdateCollageSettings({ backgroundType: 'texture', backgroundTexture: bg.id as 'wood' | 'concrete' | 'linen' | 'cork' | 'none' })}
                          className={`
                            p-2 rounded-lg text-left text-xs font-semibold flex flex-col justify-between border transition-all cursor-pointer h-14
                            ${isSelected 
                              ? 'bg-slate-900 border-slate-950 text-white shadow-xs' 
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                            }
                          `}
                        >
                          <span className="block text-[11px] font-bold">{bg.name}</span>
                          <span className="block text-[9px] text-slate-400">Material texture</span>
                        </button>
                      );
                    })}
                    
                    {/* Custom Solid Color option */}
                    <button
                      onClick={() => onUpdateCollageSettings({ backgroundType: 'color' })}
                      className={`
                        p-2 rounded-lg text-left text-xs font-semibold flex flex-col justify-between border transition-all cursor-pointer h-14
                        ${collageSettings.backgroundType === 'color' 
                          ? 'bg-slate-900 border-slate-950 text-white shadow-xs' 
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }
                      `}
                    >
                      <span className="block text-[11px] font-bold">Solid Studio Color</span>
                      <span className="block text-[9px] text-slate-400">Solid canvas background</span>
                    </button>
                  </div>
                </div>

                {/* Background color picker (if Solid Color is selected) */}
                {collageSettings.backgroundType === 'color' && (
                  <div className="space-y-2 pt-2 animate-fade-in">
                    <label className="text-xs text-slate-600 font-medium block">Select Table Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={collageSettings.backgroundColor}
                        onChange={(e) => onUpdateCollageSettings({ backgroundColor: e.target.value })}
                        className="w-10 h-10 border border-slate-200 bg-white rounded-lg cursor-pointer p-0.5 shadow-xs"
                      />
                      <input
                        type="text"
                        value={collageSettings.backgroundColor}
                        onChange={(e) => onUpdateCollageSettings({ backgroundColor: e.target.value })}
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-900 shadow-xs"
                      />
                    </div>
                  </div>
                )}

                {/* Custom tabletop background image upload! */}
                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <label className="text-xs text-slate-600 font-medium flex items-center gap-1.5 block">
                    <ImageIcon className="w-3.5 h-3.5 text-slate-900" />
                    Or Upload Custom Background
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all rounded-lg px-3 py-2 text-xs text-slate-600 hover:text-slate-800 cursor-pointer text-center font-medium shadow-xs">
                      <span className="flex items-center justify-center gap-2">
                        <ImageIcon className="w-3.5 h-3.5" />
                        Choose Table Image
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBackgroundUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {collageSettings.backgroundType === 'image' && collageSettings.backgroundImageUrl && (
                    <div className="flex items-center justify-between text-[11px] bg-slate-50 border border-slate-200 p-2 rounded-lg animate-fade-in">
                      <span className="text-slate-600 font-medium truncate max-w-[180px]">Custom Image Active</span>
                      <button
                        onClick={() => onUpdateCollageSettings({ backgroundType: 'texture', backgroundTexture: 'concrete' })}
                        className="text-red-500 hover:text-red-400 font-bold transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

      </div>

      {/* Aesthetic Workspace Branding */}
      <div className="p-4 border-t-2 border-black text-center text-black font-pixel text-[15px] bg-[#c0c0c0] tracking-wider uppercase">
        POLAFRAME SYSTEM CORE V1.95
      </div>
    </aside>
  );
};
