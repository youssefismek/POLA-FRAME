export type PolaroidAspectRatio = '1:1' | '4:5' | '3:4' | '16:9';

export type FrameStyle = 'classic' | 'vintage' | 'charcoal' | 'kraft-paper' | 'cream' | 'pastel-pink' | 'pastel-blue';

export type LightLeakStyle = 'none' | 'warm-glow' | 'sunset-strip' | 'rainbow-streak' | 'side-flare';

export interface FilterSettings {
  brightness: number; // 50 to 150
  contrast: number; // 50 to 150
  saturation: number; // 0 to 200
  sepia: number; // 0 to 100
  temperature: number; // -50 to 50 (warm/cool)
  blur: number; // 0 to 10 (soft focus)
  grain: number; // 0 to 100
  vignette: number; // 0 to 100
  lightLeak: LightLeakStyle;
  lightLeakIntensity: number; // 0 to 100
  presetName: string;
}

export interface FrameSettings {
  style: FrameStyle;
  caption: string;
  fontFamily: string;
  fontSize: number; // in pixels (relative to frame height)
  markerColor: string;
  textAlignment: 'left' | 'center' | 'right';
  textAngle: number; // rotation in degrees, e.g. -5 to 5
  aspectRatio: PolaroidAspectRatio;
  showDate: boolean;
  dateText: string;
  dateFontFamily: string;
}

export interface PolaroidCard {
  id: string;
  imageUrl: string; // Object URL or Base64
  imageUrl2?: string; // Optional second image for double exposure
  doubleExposureEnabled?: boolean;
  image1Opacity?: number; // 0 to 100
  image2Opacity?: number; // 0 to 100
  image1Gamma?: number; // 0.1 to 3.0
  image2Gamma?: number; // 0.1 to 3.0
  originalWidth: number;
  originalHeight: number;
  filter: FilterSettings;
  frame: FrameSettings;
  // Layout values for Collage mode
  x: number; // Percentage of workspace width (0 to 100)
  y: number; // Percentage of workspace height (0 to 100)
  rotation: number; // Degrees (-180 to 180)
  scale: number; // Scale factor (0.5 to 1.5)
  zIndex: number;
}

export interface CollageSettings {
  backgroundType: 'color' | 'texture' | 'image';
  backgroundColor: string;
  backgroundTexture: 'wood' | 'concrete' | 'linen' | 'cork' | 'none';
  backgroundImageUrl: string | null;
  aspectRatio: '16:9' | '4:3' | '1:1';
  mockupId?: string;
}
