import { FilterSettings, FrameSettings, FrameStyle, LightLeakStyle } from '../types';

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  settings: Partial<FilterSettings>;
}

export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'original',
    name: 'Original',
    description: 'No filters applied',
    settings: {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      sepia: 0,
      temperature: 0,
      blur: 0,
      grain: 0,
      vignette: 0,
      lightLeak: 'none',
      lightLeakIntensity: 50,
      presetName: 'original',
    },
  },
  {
    id: 'vintage-70s',
    name: "Instant '70s",
    description: 'Warm, faded, high-contrast analog look',
    settings: {
      brightness: 105,
      contrast: 110,
      saturation: 90,
      sepia: 25,
      temperature: 20,
      blur: 0.5,
      grain: 35,
      vignette: 25,
      lightLeak: 'warm-glow',
      lightLeakIntensity: 60,
      presetName: 'vintage-70s',
    },
  },
  {
    id: 'matte-cream',
    name: 'Matte Cream',
    description: 'Soft, creamy whites with faded contrast',
    settings: {
      brightness: 110,
      contrast: 85,
      saturation: 85,
      sepia: 15,
      temperature: 15,
      blur: 0.2,
      grain: 15,
      vignette: 10,
      lightLeak: 'none',
      lightLeakIntensity: 0,
      presetName: 'matte-cream',
    },
  },
  {
    id: 'retro-flash',
    name: 'Retro Flash',
    description: 'Overexposed center with heavy vignette',
    settings: {
      brightness: 125,
      contrast: 120,
      saturation: 110,
      sepia: 5,
      temperature: 5,
      blur: 0,
      grain: 20,
      vignette: 45,
      lightLeak: 'side-flare',
      lightLeakIntensity: 70,
      presetName: 'retro-flash',
    },
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    description: 'Bathed in warm sunset light with subtle leak',
    settings: {
      brightness: 102,
      contrast: 95,
      saturation: 120,
      sepia: 10,
      temperature: 30,
      blur: 0.3,
      grain: 10,
      vignette: 15,
      lightLeak: 'sunset-strip',
      lightLeakIntensity: 65,
      presetName: 'golden-hour',
    },
  },
  {
    id: 'bw-noir',
    name: 'B&W Film',
    description: 'High-contrast, granular black and white',
    settings: {
      brightness: 100,
      contrast: 125,
      saturation: 0,
      sepia: 5,
      temperature: -5,
      blur: 0.2,
      grain: 45,
      vignette: 30,
      lightLeak: 'none',
      lightLeakIntensity: 0,
      presetName: 'bw-noir',
    },
  },
  {
    id: 'faded-indigo',
    name: 'Cold Indigo',
    description: 'Cool blue undertones with low saturation',
    settings: {
      brightness: 95,
      contrast: 95,
      saturation: 75,
      sepia: 5,
      temperature: -25,
      blur: 0.4,
      grain: 25,
      vignette: 20,
      lightLeak: 'none',
      lightLeakIntensity: 0,
      presetName: 'faded-indigo',
    },
  },
  {
    id: 'rainbow-leak',
    name: 'Spectrum',
    description: 'Faded retro look with a colorful light leak',
    settings: {
      brightness: 105,
      contrast: 100,
      saturation: 105,
      sepia: 10,
      temperature: 10,
      blur: 0.1,
      grain: 20,
      vignette: 15,
      lightLeak: 'rainbow-streak',
      lightLeakIntensity: 80,
      presetName: 'rainbow-leak',
    },
  },
];

export const DEFAULT_FILTER_SETTINGS: FilterSettings = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  sepia: 0,
  temperature: 0,
  blur: 0,
  grain: 0,
  vignette: 0,
  lightLeak: 'none',
  lightLeakIntensity: 50,
  presetName: 'original',
};

export const DEFAULT_FRAME_SETTINGS: FrameSettings = {
  style: 'classic',
  caption: 'Summer Vibes ☀️',
  fontFamily: 'Caveat',
  fontSize: 32,
  markerColor: '#1e293b', // charcoal
  textAlignment: 'center',
  textAngle: -1.5,
  aspectRatio: '1:1',
  showDate: true,
  dateText: 'JUL 11, 2026',
  dateFontFamily: 'JetBrains Mono',
};

export const GOOGLE_HANDWRITING_FONTS = [
  { id: 'Caveat', name: 'Caveat (Fluid & Clean)' },
  { id: 'Architects Daughter', name: "Architect's Daughter (Print)" },
  { id: 'Reenie Beanie', name: 'Reenie Beanie (Thin Sketch)' },
  { id: 'Permanent Marker', name: 'Permanent Marker (Bold Pen)' },
  { id: 'Shadows Into Light', name: 'Shadows Into Light (Neat)' },
  { id: 'Gochi Hand', name: 'Gochi Hand (Playful)' },
  { id: 'Just Another Hand', name: 'Just Another Hand (Tall Cursive)' },
];

export const FRAME_STYLES: { id: FrameStyle; name: string; bgClass: string; textClass: string }[] = [
  { id: 'classic', name: 'Classic Polaroid White', bgClass: 'bg-[#faf9f6]', textClass: 'text-slate-800' },
  { id: 'vintage', name: 'Aged Paper Vintage', bgClass: 'bg-[#f4ebd0]', textClass: 'text-stone-800' },
  { id: 'cream', name: 'Warm Cream', bgClass: 'bg-[#fdfaf2]', textClass: 'text-amber-950' },
  { id: 'charcoal', name: 'Dark Charcoal', bgClass: 'bg-[#22252a]', textClass: 'text-neutral-200' },
  { id: 'kraft-paper', name: 'Kraft Cardboard', bgClass: 'bg-[#d2b48c]', textClass: 'text-amber-900' },
  { id: 'pastel-pink', name: 'Pastel Rose', bgClass: 'bg-[#fce7f3]', textClass: 'text-pink-900' },
  { id: 'pastel-blue', name: 'Pastel Sky', bgClass: 'bg-[#e0f2fe]', textClass: 'text-sky-900' },
];

export const MARKER_COLORS = [
  { id: '#1e293b', name: 'Charcoal Black', border: 'border-slate-800' },
  { id: '#1d4ed8', name: 'Felt Blue', border: 'border-blue-700' },
  { id: '#be123c', name: 'Ink Red', border: 'border-rose-700' },
  { id: '#d97706', name: 'Metallic Gold', border: 'border-amber-600' },
  { id: '#047857', name: 'Forest Green', border: 'border-emerald-700' },
];

export const COLLAGE_BACKGROUNDS = [
  { id: 'none', name: 'Solid Color', type: 'color', value: '#121316' },
  { id: 'concrete', name: 'Studio Concrete', type: 'texture', bgClass: 'bg-[#1e2024]', overlayClass: 'opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]' },
  { id: 'wood', name: 'Warm Walnut Wood', type: 'texture', style: { backgroundColor: '#2d1e18', backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 0), linear-gradient(0deg, rgba(0,0,0,0.15) 50%, transparent 50%)', backgroundSize: '100px 100px, 100% 40px' } },
  { id: 'linen', name: 'Cozy Linen', type: 'texture', style: { backgroundColor: '#f5f5f4', backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 0), linear-gradient(rgba(0,0,0,0.03) 1px, transparent 0)', backgroundSize: '20px 20px' } },
  { id: 'cork', name: 'Cork Pinboard', type: 'texture', style: { backgroundColor: '#bc8f8f', backgroundImage: 'radial-gradient(#a0522d 15%, transparent 16%), radial-gradient(#a0522d 15%, transparent 16%)', backgroundSize: '10px 10px', backgroundPosition: '0 0, 5px 5px' } },
];
