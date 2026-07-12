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
import { Camera, Image as ImageIcon, Sparkles, Upload } from 'lucide-react';

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

      // Download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
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
        <div className="h-[46vh] lg:h-full lg:flex-1 flex flex-col min-h-0 border-b-3 lg:border-b-0 lg:border-r-3 border-black">
          
          {/* Quick aesthetic header guide - 90s style */}
          {activeCards.length === 0 && (
            <div className="p-3 bg-[#c0c0c0] border-b-[3px] border-black text-center animate-fade-in shadow-md flex items-center justify-center gap-2.5">
              <span className="text-[11px] md:text-xs text-black font-pixel uppercase tracking-widest font-bold">
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
                className="bg-yellow-300 hover:bg-yellow-200 text-[11px] md:text-xs font-black text-black px-3 py-1.5 border-2 border-black brutal-shadow cursor-pointer font-retro outline-none"
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

        {/* Settings panel sidebar */}
        <div className="h-[38vh] lg:h-full w-full lg:w-[380px] shrink-0 min-h-0">
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
    </div>
  );
}
