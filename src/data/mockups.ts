import { PolaroidCard, CollageSettings, FrameStyle } from '../types';

export interface MockupCardTemplate {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  zIndex: number;
  caption: string;
  style: FrameStyle;
  defaultImageUrl: string;
  presetName?: string;
}

export interface MockupPreset {
  id: string;
  name: string;
  name_display?: string;
  description: string;
  thumbnail: string;
  backgroundType: 'color' | 'texture' | 'image';
  backgroundColor: string;
  backgroundTexture: 'wood' | 'concrete' | 'linen' | 'cork' | 'none';
  backgroundImageUrl: string | null;
  aspectRatio: '16:9' | '4:3' | '1:1';
  cards: MockupCardTemplate[];
  textOverlay?: {
    text: string;
    x: number; // percentage width
    y: number; // percentage height
    fontFamily: string;
    fontSize: number; // base pixels (scaled with canvas)
    color: string;
    align: 'left' | 'center' | 'right';
    rotation?: number;
  };
}

export const MOCKUP_PRESETS: MockupPreset[] = [
  {
    id: 'jeans-pocket',
    name: 'Jeans Pocket Flatlay',
    description: 'Four cozy instant prints tucked into vintage denim pocket seams',
    thumbnail: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=150&auto=format&fit=crop',
    backgroundType: 'image',
    backgroundColor: '#008080',
    backgroundTexture: 'none',
    backgroundImageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1600&auto=format&fit=crop',
    aspectRatio: '4:3',
    cards: [
      {
        x: 56,
        y: 28,
        rotation: 10,
        scale: 0.85,
        zIndex: 1,
        caption: 'Sunny Days ☀️',
        style: 'vintage',
        defaultImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
        presetName: 'vintage-70s'
      },
      {
        x: 23,
        y: 50,
        rotation: -14,
        scale: 0.85,
        zIndex: 2,
        caption: 'Retro Mindset 📻',
        style: 'classic',
        defaultImageUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=600&auto=format&fit=crop',
        presetName: 'golden-hour'
      },
      {
        x: 48,
        y: 62,
        rotation: -7,
        scale: 0.85,
        zIndex: 3,
        caption: 'Denim Moments 🧺',
        style: 'vintage',
        defaultImageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop',
        presetName: 'vintage-70s'
      },
      {
        x: 77,
        y: 65,
        rotation: 6,
        scale: 0.85,
        zIndex: 4,
        caption: 'Faded Memories 🎞️',
        style: 'cream',
        defaultImageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop',
        presetName: 'retro-flash'
      }
    ]
  },
  {
    id: 'crimson-studio',
    name: 'Crimson Red Studio',
    name_display: 'Crimson Studio',
    description: 'A single high-contrast portrait centered on a deep red background',
    thumbnail: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=150&auto=format&fit=crop',
    backgroundType: 'color',
    backgroundColor: '#8B0000',
    backgroundTexture: 'none',
    backgroundImageUrl: null,
    aspectRatio: '1:1',
    cards: [
      {
        x: 50,
        y: 50,
        rotation: 0,
        scale: 1.25,
        zIndex: 1,
        caption: 'Red Velvet Portrait 🌹',
        style: 'cream',
        defaultImageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=600&auto=format&fit=crop',
        presetName: 'retro-flash'
      }
    ]
  },
  {
    id: 'polaroid-stack',
    name: 'Chaotic Photo Pile',
    description: 'A nostalgic scatter with faded B&W snapshots behind one bright photo',
    thumbnail: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=150&auto=format&fit=crop',
    backgroundType: 'texture',
    backgroundColor: '#18181b',
    backgroundTexture: 'concrete',
    backgroundImageUrl: null,
    aspectRatio: '16:9',
    cards: [
      {
        x: 22,
        y: 28,
        rotation: -24,
        scale: 0.85,
        zIndex: 1,
        caption: 'Echoes ☁️',
        style: 'classic',
        defaultImageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop',
        presetName: 'bw-noir'
      },
      {
        x: 78,
        y: 28,
        rotation: 18,
        scale: 0.85,
        zIndex: 2,
        caption: 'City Nights 🌃',
        style: 'classic',
        defaultImageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop',
        presetName: 'bw-noir'
      },
      {
        x: 18,
        y: 72,
        rotation: 12,
        scale: 0.85,
        zIndex: 3,
        caption: 'Laughter Hub ☕',
        style: 'classic',
        defaultImageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop',
        presetName: 'bw-noir'
      },
      {
        x: 82,
        y: 75,
        rotation: -20,
        scale: 0.85,
        zIndex: 4,
        caption: 'Lost & Found 🧭',
        style: 'classic',
        defaultImageUrl: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=600&auto=format&fit=crop',
        presetName: 'bw-noir'
      },
      {
        x: 52,
        y: 18,
        rotation: 4,
        scale: 0.85,
        zIndex: 5,
        caption: 'Retro Days 📻',
        style: 'classic',
        defaultImageUrl: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?q=80&w=600&auto=format&fit=crop',
        presetName: 'bw-noir'
      },
      {
        x: 50,
        y: 53,
        rotation: -3,
        scale: 1.15,
        zIndex: 6,
        caption: 'Sunshine ☀️',
        style: 'classic',
        defaultImageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=600&auto=format&fit=crop',
        presetName: 'vintage-70s'
      }
    ]
  },
  {
    id: 'super-promo',
    name: 'Super Promo Mini',
    description: 'Elegant dual presenting pockets on concrete plaster backdrop',
    thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=150&auto=format&fit=crop',
    backgroundType: 'image',
    backgroundColor: '#ebe9e2',
    backgroundTexture: 'none',
    backgroundImageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1600&auto=format&fit=crop',
    aspectRatio: '1:1',
    cards: [
      {
        x: 35,
        y: 58,
        rotation: -12,
        scale: 0.95,
        zIndex: 1,
        caption: 'Pocket Mini 🏖️',
        style: 'classic',
        defaultImageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop',
        presetName: 'golden-hour'
      },
      {
        x: 65,
        y: 48,
        rotation: 8,
        scale: 0.95,
        zIndex: 2,
        caption: 'Summer Pack 🍉',
        style: 'classic',
        defaultImageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop',
        presetName: 'vintage-70s'
      }
    ],
    textOverlay: {
      text: 'SUPER PROMO\nmini pocket prints',
      x: 50,
      y: 20,
      fontFamily: 'Caveat',
      fontSize: 48,
      color: '#1e2024',
      align: 'center',
      rotation: -1
    }
  },
  {
    id: 'analog-camera',
    name: 'Analog Life Camera',
    description: 'A flatlay of a classic instant camera ejecting your picture',
    thumbnail: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=150&auto=format&fit=crop',
    backgroundType: 'image',
    backgroundColor: '#ffffff',
    backgroundTexture: 'none',
    backgroundImageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=1600&auto=format&fit=crop',
    aspectRatio: '16:9',
    cards: [
      {
        x: 66,
        y: 65,
        rotation: 12,
        scale: 0.8,
        zIndex: 1,
        caption: 'Captured Adventure 🌲',
        style: 'classic',
        defaultImageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop',
        presetName: 'vintage-70s'
      }
    ],
    textOverlay: {
      text: 'THE CAMERA\nFOR AN ANALOG\nLIFE.',
      x: 25,
      y: 42,
      fontFamily: 'Caveat',
      fontSize: 52,
      color: '#1d4ed8', // Felt Blue ink
      align: 'left',
      rotation: -4
    }
  }
];
