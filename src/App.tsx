import { useState, useEffect } from 'react';
import { 
  FilterSettings, 
  FrameSettings, 
  CollageSettings, 
  PolaroidCard as PolaroidCardType 
} from './types';
import { 
  DEFAULT_FILTER_SETTINGS, 
  DEFAULT_FRAME_SETTINGS,
  FILTER_PRESETS
} from './data/filters';
import { MOCKUP_PRESETS } from './data/mockups';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Workspace } from './components/Workspace';
import { renderPolaroidToCanvas, renderCollageToCanvas } from './utils/canvasRenderer';
import { Camera, Image as ImageIcon, Sparkles, Upload, Sliders, Compass, Type, Layout, X } from 'lucide-react';

// Pre-formated date helper
function getFormattedCurrentDate() {
  const date = new Date();
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// Aesthetic Unsplash sample images
const SAMPLE_PHOTOS = [
  {
    name: 'Summer Friends',
    url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1000&q=80',
    caption: 'Friends Forever 🌸',
  },
  {
    name: 'Golden Retro',
    url: 'https://images.unsplash.com/photo-1554080353-a576cf803bda?auto=format&fit=crop&w=1000&q=80',
    caption: 'Analog Captured 📸',
  },
  {
    name: 'Sunset Coast',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    caption: 'Chasing Sunsets 🌅',
  },
  {
    name: 'Cozy Cafe',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1000&q=80',
    caption: 'Warm Coffee Days ☕',
  }
];

export default function App() {
  const [mode, setMode] = useState<'single' | 'collage'>('single');
  const [singleCard, setSingleCard] = useState<PolaroidCardType | null>(null);
  const [collageCards, setCollageCards] = useState<PolaroidCardType[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportedImage, setExportedImage] = useState<{ url: string; filename: string } | null>(null);

  // Mobile Floating Menu States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMobileSection, setActiveMobileSection] = useState<string | null>(null);
  const [isMobileAdjusting, setIsMobileAdjusting] = useState(false);

  // Collage canvas default settings
  const [collageSettings, setCollageSettings] = useState<CollageSettings>({
    backgroundType: 'texture',
    backgroundColor: '#121316',
    backgroundTexture: 'concrete',
    backgroundImageUrl: null,
    aspectRatio: '16:9',
  });

  // Keep track of the active card list based on current view mode
  const activeCards = mode === 'single' 
    ? (singleCard ? [singleCard] : []) 
    : collageCards;

  // Sync active selected ID in single mode
  useEffect(() => {
    if (mode === 'single' && singleCard) {
      setSelectedCardId(singleCard.id);
    } else if (mode === 'collage') {
      if (collageCards.length > 0 && !selectedCardId) {
        setSelectedCardId(collageCards[0].id);
      } else if (collageCards.length === 0) {
        setSelectedCardId(null);
      }
    }
  }, [mode, singleCard, collageCards, selectedCardId]);

  // Load image dimensions and build polaroid card helper
  const createPolaroidCard = (id: string, imageUrl: string, captionText?: string): Promise<PolaroidCardType> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          id,
          imageUrl,
          originalWidth: img.width,
          originalHeight: img.height,
          filter: { ...DEFAULT_FILTER_SETTINGS },
          frame: { 
            ...DEFAULT_FRAME_SETTINGS, 
            caption: captionText || DEFAULT_FRAME_SETTINGS.caption,
            dateText: getFormattedCurrentDate() 
          },
          x: 50,
          y: 50,
          rotation: -4 + Math.random() * 8, // slight natural rot
          scale: 1,
          zIndex: 1,
        });
      };
      // Fallback if image fails to get dimensions
      img.onerror = () => {
        resolve({
          id,
          imageUrl,
          originalWidth: 800,
          originalHeight: 800,
          filter: { ...DEFAULT_FILTER_SETTINGS },
          frame: { 
            ...DEFAULT_FRAME_SETTINGS, 
            caption: captionText || DEFAULT_FRAME_SETTINGS.caption,
            dateText: getFormattedCurrentDate() 
          },
          x: 50,
          y: 50,
          rotation: -4 + Math.random() * 8,
          scale: 1,
          zIndex: 1,
        });
      };
      img.src = imageUrl;
    });
  };

  // 1. Upload Actions
  const handleUploadSingleImage = async (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    const card = await createPolaroidCard('single-polaroid', objectUrl);
    setSingleCard(card);
  };

  const handleAddCollageCard = async (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    const newId = `card-${Date.now()}`;
    const card = await createPolaroidCard(newId, objectUrl);
    
    // Spread cards randomly around the center of the canvas board
    card.x = 25 + Math.random() * 50;
    card.y = 25 + Math.random() * 50;
    
    // Set layer stack height
    const maxZ = collageCards.reduce((max, c) => Math.max(max, c.zIndex), 0);
    card.zIndex = maxZ + 1;

    setCollageCards(prev => [...prev, card]);
    setSelectedCardId(newId);
  };

  // 2. Sample Image instant loading helper
  const handleLoadSample = async (sampleIndex: number) => {
    const sample = SAMPLE_PHOTOS[sampleIndex];
    if (mode === 'single') {
      const card = await createPolaroidCard('single-polaroid', sample.url, sample.caption);
      setSingleCard(card);
    } else {
      const newId = `sample-${Date.now()}`;
      const card = await createPolaroidCard(newId, sample.url, sample.caption);
      
      // Scatter on board
      card.x = 30 + Math.random() * 40;
      card.y = 30 + Math.random() * 40;
      const maxZ = collageCards.reduce((max, c) => Math.max(max, c.zIndex), 0);
      card.zIndex = maxZ + 1;

      setCollageCards(prev => [...prev, card]);
      setSelectedCardId(newId);
    }
  };

  // 3. Card Modification Triggers
  const handleLoadMockup = async (presetId: string) => {
    const mockup = MOCKUP_PRESETS.find(m => m.id === presetId);
    if (!mockup) return;

    setMode('collage');
    setIsExporting(true);

    try {
      const loadedCards = await Promise.all(
        mockup.cards.map(async (cardTemplate, index) => {
          const cardId = `mock-card-${Date.now()}-${index}`;
          
          const filterSettings = {
            ...DEFAULT_FILTER_SETTINGS,
            ...(cardTemplate.presetName ? FILTER_PRESETS.find(p => p.id === cardTemplate.presetName)?.settings : {})
          };

          return {
            id: cardId,
            imageUrl: cardTemplate.defaultImageUrl,
            originalWidth: 800,
            originalHeight: 800,
            filter: filterSettings,
            frame: {
              ...DEFAULT_FRAME_SETTINGS,
              caption: cardTemplate.caption,
              style: cardTemplate.style,
              dateText: getFormattedCurrentDate(),
            },
            x: cardTemplate.x,
            y: cardTemplate.y,
            rotation: cardTemplate.rotation,
            scale: cardTemplate.scale,
            zIndex: cardTemplate.zIndex,
          };
        })
      );

      setCollageCards(loadedCards);
      setCollageSettings({
        backgroundType: mockup.backgroundType,
        backgroundColor: mockup.backgroundColor,
        backgroundTexture: mockup.backgroundTexture,
        backgroundImageUrl: mockup.backgroundImageUrl,
        aspectRatio: mockup.aspectRatio,
        mockupId: mockup.id,
      });

      if (loadedCards.length > 0) {
        setSelectedCardId(loadedCards[loadedCards.length - 1].id);
      }
    } catch (err) {
      console.error('Failed to load mockup templates:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleReplaceCardImage = async (id: string, file: File) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (mode === 'single' && singleCard) {
        setSingleCard({
          ...singleCard,
          imageUrl: objectUrl,
          originalWidth: img.width,
          originalHeight: img.height,
        });
      } else {
        setCollageCards(prev => prev.map(c => c.id === id ? {
          ...c,
          imageUrl: objectUrl,
          originalWidth: img.width,
          originalHeight: img.height,
        } : c));
      }
    };
    img.src = objectUrl;
  };

  const handleUpdateCardFilter = (id: string, filterUpdate: Partial<FilterSettings>) => {
    if (mode === 'single' && singleCard) {
      setSingleCard({
        ...singleCard,
        filter: { ...singleCard.filter, ...filterUpdate }
      });
    } else {
      setCollageCards(prev => prev.map(c => c.id === id ? { ...c, filter: { ...c.filter, ...filterUpdate } } : c));
    }
  };

  const handleUpdateCardFrame = (id: string, frameUpdate: Partial<FrameSettings>) => {
    if (mode === 'single' && singleCard) {
      setSingleCard({
        ...singleCard,
        frame: { ...singleCard.frame, ...frameUpdate }
      });
    } else {
      setCollageCards(prev => prev.map(c => c.id === id ? { ...c, frame: { ...c.frame, ...frameUpdate } } : c));
    }
  };

  const handleUpdateCardLayout = (id: string, layoutUpdate: { x?: number; y?: number; rotation?: number; scale?: number }) => {
    if (mode === 'single' && singleCard) {
      setSingleCard({ ...singleCard, ...layoutUpdate });
    } else {
      setCollageCards(prev => prev.map(c => c.id === id ? { ...c, ...layoutUpdate } : c));
    }
  };

  const handleUpdateCardDoubleExposure = (
    id: string, 
    update: { 
      doubleExposureEnabled?: boolean; 
      imageUrl2?: string; 
      image1Opacity?: number; 
      image2Opacity?: number; 
      image1Gamma?: number; 
      image2Gamma?: number; 
    }
  ) => {
    if (mode === 'single' && singleCard) {
      setSingleCard({
        ...singleCard,
        ...update
      });
    } else {
      setCollageCards(prev => prev.map(c => c.id === id ? { ...c, ...update } : c));
    }
  };

  const handleUpdateCardLayers = (id: string, action: 'front' | 'back' | 'up' | 'down') => {
    if (collageCards.length <= 1) return;

    setCollageCards(prev => {
      // Find card
      const targetCard = prev.find(c => c.id === id);
      if (!targetCard) return prev;

      let newCards = [...prev];
      // Normalize existing z-indexes first to be contiguous 1..N
      newCards.sort((a, b) => a.zIndex - b.zIndex);
      newCards.forEach((c, idx) => {
        c.zIndex = idx + 1;
      });

      const currentIndex = newCards.findIndex(c => c.id === id);

      if (action === 'front') {
        const maxZ = newCards.length;
        newCards.forEach(c => {
          if (c.zIndex > targetCard.zIndex) c.zIndex -= 1;
        });
        targetCard.zIndex = maxZ;
      } else if (action === 'back') {
        newCards.forEach(c => {
          if (c.zIndex < targetCard.zIndex) c.zIndex += 1;
        });
        targetCard.zIndex = 1;
      } else if (action === 'up' && currentIndex < newCards.length - 1) {
        // Swap with the one above it
        const nextCard = newCards[currentIndex + 1];
        const tempZ = targetCard.zIndex;
        targetCard.zIndex = nextCard.zIndex;
        nextCard.zIndex = tempZ;
      } else if (action === 'down' && currentIndex > 0) {
        // Swap with the one below it
        const prevCard = newCards[currentIndex - 1];
        const tempZ = targetCard.zIndex;
        targetCard.zIndex = prevCard.zIndex;
        prevCard.zIndex = tempZ;
      }

      return newCards;
    });
  };

  const handleDeleteCard = (id: string) => {
    if (mode === 'single') {
      setSingleCard(null);
      setSelectedCardId(null);
    } else {
      setCollageCards(prev => prev.filter(c => c.id !== id));
      if (selectedCardId === id) {
        setSelectedCardId(null);
      }
    }
  };

  // 4. Board Reset action
  const handleReset = () => {
    if (mode === 'single') {
      setSingleCard(null);
    } else {
      setCollageCards([]);
      setSelectedCardId(null);
    }
  };

  // 5. HD Canvas Download Export action
  const handleExport = async () => {
    if (activeCards.length === 0) return;
    setIsExporting(true);

    try {
      // Small simulated delay for loading visual feedback
      await new Promise(resolve => setTimeout(resolve, 600));

      let canvas: HTMLCanvasElement;
      let filename = '';

      if (mode === 'single' && singleCard) {
        canvas = await renderPolaroidToCanvas(singleCard, 1600); // Super crisp 1600px print width
        filename = `polaroid-${Date.now()}.png`;
      } else {
        canvas = await renderCollageToCanvas(collageCards, collageSettings, 2400); // 2400px ultra high-res tabletop
        filename = `polaroid-pack-${Date.now()}.png`;
      }

      const dataUrl = canvas.toDataURL('image/png');

      // Try file sharing via Web Share API if supported
      let shared = false;
      if (navigator.share && navigator.canShare) {
        try {
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          const file = new File([blob], filename, { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Retro Polaroid Photo',
              text: 'Look at my retro photo! Created with Polaroid Studio.',
            });
            shared = true;
          }
        } catch (shareErr) {
          console.log('Web Share cancelled or not supported for files:', shareErr);
        }
      }

      // Trigger traditional download click
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();

      // Show the helper modal so users on mobile can easily save/share via long-press
      setExportedImage({ url: dataUrl, filename });
    } catch (e) {
      console.error('HD Render failed:', e);
      alert('An error occurred during high-definition photo rendering. Please try again with a different image.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div id="app-root-container" className="flex flex-col h-screen bg-[#008080] retro-grid font-sans text-slate-900 overflow-hidden">
      
      {/* App Header */}
      <Header
        mode={mode}
        setMode={(newMode) => {
          setMode(newMode);
          // Auto select if switching to collage
          if (newMode === 'collage' && collageCards.length > 0) {
            setSelectedCardId(collageCards[0].id);
          }
        }}
        onExport={handleExport}
        isExporting={isExporting}
        onReset={handleReset}
        hasCards={activeCards.length > 0}
      />

      {/* Main Studio Body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        
        {/* Studio tabletop board */}
        <div className="flex-1 lg:flex-1 h-full flex flex-col min-h-0 lg:border-r-3 border-black">
          
          {/* Quick aesthetic header guide - 90s style */}
          {activeCards.length === 0 && (
            <>
              {/* Mobile Header Guide - Dropdown selection */}
              <div className="lg:hidden p-3 bg-[#c0c0c0] border-b-[3px] border-black text-center animate-fade-in shadow-md flex items-center justify-center gap-2.5">
                <span className="text-[11px] text-black font-pixel uppercase tracking-widest font-bold">
                  ⚡ Presets / Samples:
                </span>
                <select
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) return;
                    if (val.startsWith('sample-')) {
                      const idx = parseInt(val.split('-')[1]);
                      handleLoadSample(idx);
                    } else if (val.startsWith('mockup-')) {
                      const id = val.split('mockup-')[1];
                      handleLoadMockup(id);
                    }
                    e.target.value = ""; // Reset after selection
                  }}
                  className="bg-yellow-300 hover:bg-yellow-200 text-[11px] font-black text-black px-3 py-1.5 border-2 border-black brutal-shadow cursor-pointer font-retro outline-none"
                  defaultValue=""
                >
                  <option value="" disabled>-- Load a Retro Demo --</option>
                  <optgroup label="Sample Camera Photos">
                    {SAMPLE_PHOTOS.map((sample, idx) => (
                      <option key={idx} value={`sample-${idx}`}>
                        📸 {sample.name}
                      </option>
                    ))}
                  </optgroup>
                  {mode === 'collage' && (
                    <optgroup label="Mockup Template Scenes">
                      {MOCKUP_PRESETS.map((mockup) => (
                        <option key={mockup.id} value={`mockup-${mockup.id}`}>
                          🌌 {mockup.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {/* Desktop Header Guide - Full layout with retro buttons */}
              <div className="hidden lg:flex flex-col gap-3 p-4 bg-[#c0c0c0] border-b-[3px] border-black text-center animate-fade-in shadow-md">
                <div>
                  <p className="text-xs text-black font-pixel uppercase tracking-widest text-[14px] font-bold">
                    ⚡ Boot the camera with a retro sample photo:
                  </p>
                  <div className="flex items-center justify-center gap-2.5 mt-1.5 flex-wrap">
                    {SAMPLE_PHOTOS.map((sample, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleLoadSample(idx)}
                        className="px-4 py-1.5 bg-yellow-300 hover:bg-yellow-200 text-xs font-black text-black transition-all cursor-pointer flex items-center gap-1.5 border-2 border-black brutal-shadow"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-black" />
                        {sample.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                {mode === 'collage' && (
                  <div className="pt-2.5 border-t border-black/10">
                    <p className="text-xs text-black font-pixel uppercase tracking-widest text-[14px] font-bold">
                      🌌 Or load a built-in mockup template scene:
                    </p>
                    <div className="flex items-center justify-center gap-2.5 mt-1.5 flex-wrap">
                      {MOCKUP_PRESETS.map((mockup) => (
                        <button
                          key={mockup.id}
                          onClick={() => handleLoadMockup(mockup.id)}
                          className="px-3 py-1.5 bg-cyan-300 hover:bg-cyan-200 text-[11px] font-black text-black transition-all cursor-pointer flex items-center gap-1.5 border-2 border-black brutal-shadow"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-black" />
                          {mockup.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Interactive Workspace */}
          <Workspace
            mode={mode}
            cards={activeCards}
            selectedCardId={selectedCardId}
            collageSettings={collageSettings}
            onSelectCard={setSelectedCardId}
            onAddCard={handleAddCollageCard}
            onDeleteCard={handleDeleteCard}
            onUpdateCardLayout={handleUpdateCardLayout}
            onUpdateCardLayers={handleUpdateCardLayers}
            onUploadSingleImage={handleUploadSingleImage}
            onReplaceCardImage={handleReplaceCardImage}
          />
        </div>

        {/* Settings panel sidebar (Desktop only) */}
        <div className="hidden lg:block h-full w-[380px] shrink-0 min-h-0">
          <Sidebar
            mode={mode}
            cards={activeCards}
            selectedCardId={selectedCardId}
            collageSettings={collageSettings}
            onUpdateCardFilter={handleUpdateCardFilter}
            onUpdateCardFrame={handleUpdateCardFrame}
            onUpdateCardLayout={handleUpdateCardLayout}
            onUpdateCardDoubleExposure={handleUpdateCardDoubleExposure}
            onUpdateCollageSettings={(updated) => setCollageSettings(prev => ({ ...prev, ...updated }))}
            onDeleteCard={handleDeleteCard}
            onLoadMockup={handleLoadMockup}
            onReplaceCardImage={handleReplaceCardImage}
          />
        </div>
      </div>

      {/* Floating settings panel for mobile view */}
      {activeCards.length > 0 && (
        <Sidebar
          mode={mode}
          cards={activeCards}
          selectedCardId={selectedCardId}
          collageSettings={collageSettings}
          onUpdateCardFilter={handleUpdateCardFilter}
          onUpdateCardFrame={handleUpdateCardFrame}
          onUpdateCardLayout={handleUpdateCardLayout}
          onUpdateCardDoubleExposure={handleUpdateCardDoubleExposure}
          onUpdateCollageSettings={(updated) => setCollageSettings(prev => ({ ...prev, ...updated }))}
          onDeleteCard={handleDeleteCard}
          onLoadMockup={handleLoadMockup}
          onReplaceCardImage={handleReplaceCardImage}
          isMobileView={true}
          activeMobileSection={activeMobileSection}
          onCloseMobileSection={() => {
            setActiveMobileSection(null);
            setIsMobileMenuOpen(false);
          }}
          onBackToMenu={() => {
            setActiveMobileSection(null);
            setIsMobileMenuOpen(true);
          }}
          isAdjusting={isMobileAdjusting}
          setIsAdjusting={setIsMobileAdjusting}
        />
      )}

      {/* Mobile Floating Trigger & Options Stack */}
      {activeCards.length > 0 && (
        <div className="lg:hidden">
          {/* Main Floating Trigger Button at bottom center */}
          {!isMobileMenuOpen && !activeMobileSection && (
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-black border-3 border-white rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:scale-95 transition-all z-40 cursor-pointer animate-bounce"
              title="Edit Controls"
            >
              <Sliders className="w-6 h-6 text-yellow-300" />
            </button>
          )}

          {/* Overlay when menu is expanded */}
          {isMobileMenuOpen && (
            <div 
              onClick={() => {
                setIsMobileMenuOpen(false);
                setActiveMobileSection(null);
              }}
              className="fixed inset-0 bg-black/50 z-40 transition-opacity animate-fade-in"
            />
          )}

          {/* Vertical options stack on the right side of the screen */}
          {isMobileMenuOpen && (
            <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3.5 z-50 animate-fade-in">
              {/* Category selection buttons */}
              {[
                { id: 'presets', label: 'Retro Filters', icon: <Sparkles className="w-5 h-5 text-white" /> },
                { id: 'filters', label: 'Fine-Tune Sliders', icon: <Sliders className="w-5 h-5 text-white" /> },
                { id: 'frame', label: 'Borders & Paper', icon: <Compass className="w-5 h-5 text-white" /> },
                { id: 'caption', label: 'Handwritten Cap', icon: <Type className="w-5 h-5 text-white" /> },
                { id: 'doubleExposure', label: 'Double Blends', icon: <ImageIcon className="w-5 h-5 text-pink-300" /> },
                ...(mode === 'collage' ? [{ id: 'collage', label: 'Canvas Background', icon: <Layout className="w-5 h-5 text-white" /> }] : []),
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveMobileSection(cat.id);
                    setIsMobileMenuOpen(false); // Close menu to focus on the settings panel
                  }}
                  className="flex items-center gap-3 active:scale-95 transition-transform cursor-pointer group"
                >
                  <span className="bg-yellow-300 text-black border-2 border-black font-pixel text-[10px] font-extrabold px-2.5 py-1 uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {cat.label}
                  </span>
                  <div className="w-12 h-12 bg-black border-2 border-white rounded-full flex items-center justify-center shadow-lg group-hover:bg-slate-900">
                    {cat.icon}
                  </div>
                </button>
              ))}

              {/* Bottom-most close button in the stack (just like reference image) */}
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 active:scale-95 transition-transform cursor-pointer group"
              >
                <span className="bg-red-500 text-white border-2 border-black font-pixel text-[10px] font-extrabold px-2.5 py-1 uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  Close
                </span>
                <div className="w-12 h-12 bg-red-600 border-2 border-white rounded-full flex items-center justify-center shadow-lg group-hover:bg-red-500">
                  <X className="w-5 h-5 text-white" />
                </div>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 90s Retro Download/Share Modal for Mobile & Fallback support */}
      {exportedImage && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-[#c0c0c0] border-[3px] border-black max-w-[400px] w-full p-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col z-50">
            
            {/* Title Bar */}
            <div className="bg-[#000080] text-white px-2 py-1 flex items-center justify-between font-retro text-[12px] font-extrabold uppercase select-none">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>SAVE_IMAGE.EXE</span>
              </div>
              <button 
                onClick={() => setExportedImage(null)}
                className="bg-[#c0c0c0] text-black border border-black hover:bg-red-500 hover:text-white font-pixel text-[11px] px-1.5 py-0.5 cursor-pointer leading-none font-black"
              >
                X
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-3 bg-[#dfdfdf] border border-white/40 mt-1 space-y-4 text-center">
              <div className="space-y-1">
                <h3 className="font-pixel text-xs font-bold uppercase text-black">
                  📷 HD Polaroid Exported!
                </h3>
                <div className="bg-[#fff] border-2 border-black p-2 text-left space-y-1.5">
                  <p className="text-[11px] text-slate-800 leading-normal font-sans">
                    📱 <strong className="font-bold">On Mobile:</strong> Press & hold (long tap) on the photo below, then tap <strong className="font-bold">"Save to Photos"</strong> or <strong className="font-bold">"Share"</strong>.
                  </p>
                  <p className="text-[11px] text-slate-800 leading-normal font-sans">
                    💻 <strong className="font-bold">On Desktop:</strong> Right-click and choose <strong className="font-bold">"Save Image As..."</strong>, or click the download button below.
                  </p>
                </div>
              </div>

              {/* The Generated Image */}
              <div className="relative flex items-center justify-center bg-white border-2 border-black p-2 shadow-inner">
                <img 
                  src={exportedImage.url} 
                  alt="Your Retro Polaroid" 
                  referrerPolicy="no-referrer"
                  className="max-h-[260px] max-w-full object-contain pointer-events-auto border border-black/10 select-all"
                  style={{ WebkitTouchCallout: 'default' }}
                />
              </div>

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-center gap-2.5 pt-1.5">
                <a
                  href={exportedImage.url}
                  download={exportedImage.filename}
                  className="px-4 py-1.5 bg-yellow-300 hover:bg-yellow-200 text-black border-2 border-black font-pixel text-[11px] font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 rotate-180 text-black" />
                  <span>Download File</span>
                </a>
                
                <button
                  onClick={() => setExportedImage(null)}
                  className="px-5 py-1.5 bg-[#c0c0c0] hover:bg-[#d5d5d5] text-black border-2 border-black font-pixel text-[11px] font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
