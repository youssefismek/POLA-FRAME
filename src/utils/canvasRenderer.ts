import { PolaroidCard, FilterSettings, FrameSettings, CollageSettings } from '../types';
import { COLLAGE_BACKGROUNDS, FRAME_STYLES } from '../data/filters';
import { MOCKUP_PRESETS } from '../data/mockups';

// Helper to load an image from a URL
export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image: ' + err));
    img.src = url;
  });
}

// Apply gamma correction directly to canvas pixel data
export function applyGammaToContext(ctx: CanvasRenderingContext2D, width: number, height: number, gamma: number) {
  if (gamma === 1.0 || gamma <= 0) return;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const exponent = 1 / gamma;
  const lut = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    lut[i] = Math.min(255, Math.max(0, Math.pow(i / 255, exponent) * 255));
  }
  for (let i = 0; i < data.length; i += 4) {
    data[i] = lut[data[i]];     // R
    data[i + 1] = lut[data[i + 1]]; // G
    data[i + 2] = lut[data[i + 2]]; // B
  }
  ctx.putImageData(imgData, 0, 0);
}

// Generate a grain noise pattern tile canvas to overlay for high performance
function createNoiseCanvas(width: number, height: number, intensity: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  // We want subtle monochrome noise
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * intensity * 2.55;
    data[i] = Math.min(255, Math.max(0, 128 + noise));     // R
    data[i + 1] = Math.min(255, Math.max(0, 128 + noise)); // G
    data[i + 2] = Math.min(255, Math.max(0, 128 + noise)); // B
    data[i + 3] = intensity * 1.5;                         // A (subtle opacity)
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

// Draw a single Polaroid card on a custom offscreen canvas and return it
export async function renderPolaroidToCanvas(
  card: PolaroidCard,
  targetWidth = 1200
): Promise<HTMLCanvasElement> {
  const { 
    filter, 
    frame, 
    imageUrl, 
    doubleExposureEnabled = false, 
    imageUrl2, 
    image1Opacity = 100, 
    image2Opacity = 50, 
    image1Gamma = 1.0, 
    image2Gamma = 1.0 
  } = card;
  const { aspectRatio } = frame;

  // 1. Calculate dimensions of the Polaroid card
  // A standard polaroid card has:
  // - Top/Left/Right border: 5% of overall card width
  // - Bottom border: 22% of overall card width
  // Let's determine image width and height based on the selected aspect ratio
  const borderSize = targetWidth * 0.055; // ~5.5% margin
  const topBorder = borderSize;
  const sideBorder = borderSize;
  const bottomBorder = targetWidth * 0.22; // ~22% bottom margin

  const imgWidth = targetWidth - sideBorder * 2;
  let imgHeight = imgWidth; // 1:1 by default

  if (aspectRatio === '4:5') {
    imgHeight = imgWidth * 1.25;
  } else if (aspectRatio === '3:4') {
    imgHeight = imgWidth * 1.33;
  } else if (aspectRatio === '16:9') {
    imgHeight = imgWidth * 0.5625;
  }

  const targetHeight = imgHeight + topBorder + bottomBorder;

  // 2. Setup Canvas
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  // Ensure the custom handwriting font is fully loaded
  try {
    await document.fonts.load(`${frame.fontSize * 2}px "${frame.fontFamily}"`);
    await document.fonts.load(`14px "${frame.dateFontFamily}"`);
  } catch (e) {
    console.warn('Could not load specific custom fonts, falling back to system serif/mono.', e);
  }

  // 3. Draw Card Frame Background
  let frameColor = '#faf9f6'; // Classic White
  if (frame.style === 'vintage') frameColor = '#f4ebd0';
  else if (frame.style === 'cream') frameColor = '#fdfaf2';
  else if (frame.style === 'charcoal') frameColor = '#22252a';
  else if (frame.style === 'kraft-paper') frameColor = '#c8a27c';
  else if (frame.style === 'pastel-pink') frameColor = '#fbcfe8';
  else if (frame.style === 'pastel-blue') frameColor = '#bae6fd';

  ctx.fillStyle = frameColor;
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  // Draw subtle cardboard/vintage paper pattern if vintage/kraft
  if (frame.style === 'vintage' || frame.style === 'kraft-paper') {
    ctx.save();
    ctx.globalAlpha = 0.04;
    const paperNoise = createNoiseCanvas(200, 200, 40);
    const pattern = ctx.createPattern(paperNoise, 'repeat');
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }
    ctx.restore();
  }

  // 4. Load & Draw Photo (supporting Double Exposure)
  let img1: HTMLImageElement | null = null;
  let img2: HTMLImageElement | null = null;

  if (doubleExposureEnabled && imageUrl2) {
    try {
      const [loadedImg1, loadedImg2] = await Promise.all([
        loadImage(imageUrl),
        loadImage(imageUrl2)
      ]);
      img1 = loadedImg1;
      img2 = loadedImg2;
    } catch (e) {
      console.warn("Could not load double exposure second image, falling back to single image.", e);
      img1 = await loadImage(imageUrl);
    }
  } else {
    img1 = await loadImage(imageUrl);
  }

  // Create temporary canvas for the image to apply filters cleanly
  const imgCanvas = document.createElement('canvas');
  imgCanvas.width = imgWidth;
  imgCanvas.height = imgHeight;
  const imgCtx = imgCanvas.getContext('2d');
  if (!imgCtx) throw new Error('Could not get image canvas context');

  // Apply filters to image context
  const filters: string[] = [];
  if (filter.brightness !== 100) filters.push(`brightness(${filter.brightness}%)`);
  if (filter.contrast !== 100) filters.push(`contrast(${filter.contrast}%)`);
  if (filter.saturation !== 100) filters.push(`saturate(${filter.saturation}%)`);
  if (filter.sepia > 0) filters.push(`sepia(${filter.sepia}%)`);
  if (filter.blur > 0) filters.push(`blur(${filter.blur}px)`);
  const filterString = filters.length > 0 ? filters.join(' ') : 'none';

  // Draw Photo 1
  if (img1) {
    const p1Canvas = document.createElement('canvas');
    p1Canvas.width = imgWidth;
    p1Canvas.height = imgHeight;
    const p1Ctx = p1Canvas.getContext('2d');
    if (p1Ctx) {
      p1Ctx.filter = filterString;
      const scale1 = Math.max(imgWidth / img1.width, imgHeight / img1.height);
      const sw1 = imgWidth / scale1;
      const sh1 = imgHeight / scale1;
      const sx1 = (img1.width - sw1) / 2;
      const sy1 = (img1.height - sh1) / 2;
      p1Ctx.drawImage(img1, sx1, sy1, sw1, sh1, 0, 0, imgWidth, imgHeight);

      if (doubleExposureEnabled) {
        applyGammaToContext(p1Ctx, imgWidth, imgHeight, image1Gamma);
      }
      
      // Draw onto final canvas with opacity
      imgCtx.save();
      imgCtx.globalAlpha = doubleExposureEnabled ? (image1Opacity / 100) : 1.0;
      imgCtx.drawImage(p1Canvas, 0, 0);
      imgCtx.restore();
    }
  }

  // Draw Photo 2 (Double Exposure overlay)
  if (doubleExposureEnabled && img2) {
    const p2Canvas = document.createElement('canvas');
    p2Canvas.width = imgWidth;
    p2Canvas.height = imgHeight;
    const p2Ctx = p2Canvas.getContext('2d');
    if (p2Ctx) {
      p2Ctx.filter = filterString;
      const scale2 = Math.max(imgWidth / img2.width, imgHeight / img2.height);
      const sw2 = imgWidth / scale2;
      const sh2 = imgHeight / scale2;
      const sx2 = (img2.width - sw2) / 2;
      const sy2 = (img2.height - sh2) / 2;
      p2Ctx.drawImage(img2, sx2, sy2, sw2, sh2, 0, 0, imgWidth, imgHeight);

      applyGammaToContext(p2Ctx, imgWidth, imgHeight, image2Gamma);

      // Draw onto final canvas with opacity
      imgCtx.save();
      imgCtx.globalAlpha = image2Opacity / 100;
      imgCtx.drawImage(p2Canvas, 0, 0);
      imgCtx.restore();
    }
  }

  // Apply temperature color tint (amber for warm, cyan for cool)
  if (filter.temperature !== 0) {
    imgCtx.save();
    if (filter.temperature > 0) {
      imgCtx.fillStyle = '#ff8c00'; // Warm Amber
      imgCtx.globalAlpha = (filter.temperature / 100) * 0.15; // Max 15% opacity
      imgCtx.globalCompositeOperation = 'color-burn';
    } else {
      imgCtx.fillStyle = '#00bfff'; // Cool Cyan/Ice Blue
      imgCtx.globalAlpha = (Math.abs(filter.temperature) / 100) * 0.15;
      imgCtx.globalCompositeOperation = 'color-burn';
    }
    imgCtx.fillRect(0, 0, imgWidth, imgHeight);
    imgCtx.restore();
  }

  // Draw Vignette over the photo
  if (filter.vignette > 0) {
    imgCtx.save();
    const cx = imgWidth / 2;
    const cy = imgHeight / 2;
    const r1 = Math.min(cx, cy) * 0.4;
    const r2 = Math.sqrt(cx * cx + cy * cy) * 0.95;
    const grad = imgCtx.createRadialGradient(cx, cy, r1, cx, cy, r2);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(0.5, `rgba(0, 0, 0, ${(filter.vignette / 100) * 0.15})`);
    grad.addColorStop(1, `rgba(0, 0, 0, ${(filter.vignette / 100) * 0.7})`);
    imgCtx.fillStyle = grad;
    imgCtx.fillRect(0, 0, imgWidth, imgHeight);
    imgCtx.restore();
  }

  // Draw Light Leaks
  if (filter.lightLeak !== 'none' && filter.lightLeakIntensity > 0) {
    imgCtx.save();
    imgCtx.globalCompositeOperation = 'screen';
    const intensity = filter.lightLeakIntensity / 100;

    if (filter.lightLeak === 'warm-glow') {
      const leakGrad = imgCtx.createRadialGradient(0, 0, 50, 0, 0, imgWidth * 0.9);
      leakGrad.addColorStop(0, `rgba(255, 120, 50, ${intensity * 0.85})`);
      leakGrad.addColorStop(0.5, `rgba(255, 60, 10, ${intensity * 0.3})`);
      leakGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      imgCtx.fillStyle = leakGrad;
      imgCtx.fillRect(0, 0, imgWidth, imgHeight);
    } else if (filter.lightLeak === 'sunset-strip') {
      const leakGrad = imgCtx.createLinearGradient(0, imgHeight, imgWidth, 0);
      leakGrad.addColorStop(0, `rgba(255, 50, 50, ${intensity * 0.7})`);
      leakGrad.addColorStop(0.3, `rgba(255, 120, 0, ${intensity * 0.45})`);
      leakGrad.addColorStop(0.6, `rgba(255, 220, 0, ${intensity * 0.2})`);
      leakGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      imgCtx.fillStyle = leakGrad;
      imgCtx.fillRect(0, 0, imgWidth, imgHeight);
    } else if (filter.lightLeak === 'rainbow-streak') {
      // Create a gorgeous rainbow gradient strip
      const leakGrad = imgCtx.createLinearGradient(0, 0, imgWidth, imgHeight * 0.4);
      leakGrad.addColorStop(0, 'rgba(255, 0, 0, 0.05)');
      leakGrad.addColorStop(0.15, `rgba(255, 0, 0, ${intensity * 0.45})`);
      leakGrad.addColorStop(0.35, `rgba(255, 127, 0, ${intensity * 0.35})`);
      leakGrad.addColorStop(0.55, `rgba(255, 255, 0, ${intensity * 0.3})`);
      leakGrad.addColorStop(0.75, `rgba(0, 255, 0, ${intensity * 0.2})`);
      leakGrad.addColorStop(0.85, `rgba(0, 0, 255, ${intensity * 0.15})`);
      leakGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      imgCtx.fillStyle = leakGrad;
      imgCtx.fillRect(0, 0, imgWidth, imgHeight);
    } else if (filter.lightLeak === 'side-flare') {
      const leakGrad = imgCtx.createRadialGradient(imgWidth, imgHeight / 2, 10, imgWidth, imgHeight / 2, imgWidth * 0.75);
      leakGrad.addColorStop(0, `rgba(255, 255, 220, ${intensity * 0.9})`);
      leakGrad.addColorStop(0.3, `rgba(255, 150, 80, ${intensity * 0.45})`);
      leakGrad.addColorStop(0.7, `rgba(255, 50, 50, ${intensity * 0.15})`);
      leakGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      imgCtx.fillStyle = leakGrad;
      imgCtx.fillRect(0, 0, imgWidth, imgHeight);
    }
    imgCtx.restore();
  }

  // Apply Film Grain to the image
  if (filter.grain > 0) {
    imgCtx.save();
    imgCtx.globalCompositeOperation = 'overlay';
    // Overlay noise canvas
    const noise = createNoiseCanvas(300, 300, filter.grain);
    const pattern = imgCtx.createPattern(noise, 'repeat');
    if (pattern) {
      imgCtx.fillStyle = pattern;
      imgCtx.fillRect(0, 0, imgWidth, imgHeight);
    }
    imgCtx.restore();
  }

  // Draw the fully processed image canvas onto the main Polaroid canvas
  ctx.drawImage(imgCanvas, sideBorder, topBorder);

  // Draw subtle inner shadow border on the image inset for extreme depth
  ctx.save();
  ctx.strokeStyle = frame.style === 'charcoal' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 1;
  ctx.strokeRect(sideBorder, topBorder, imgWidth, imgHeight);

  // Soft internal vignette shadow inside the image border
  ctx.strokeStyle = 'rgba(0,0,0,0.03)';
  ctx.lineWidth = 3;
  ctx.strokeRect(sideBorder + 1.5, topBorder + 1.5, imgWidth - 3, imgHeight - 3);
  ctx.restore();

  // 5. Draw Caption Text
  if (frame.caption.trim()) {
    ctx.save();
    
    // Set pen ink color
    ctx.fillStyle = frame.markerColor;
    
    // Center of handwriting text area
    const textX = targetWidth / 2;
    const textY = imgHeight + topBorder + (bottomBorder * 0.55);

    // Dynamic typography scaling based on frame size and custom value
    const baseFontSize = (targetWidth / 400) * frame.fontSize; 
    ctx.font = `normal ${baseFontSize}px "${frame.fontFamily}", cursive, sans-serif`;
    ctx.textAlign = frame.textAlignment;
    ctx.textBaseline = 'middle';

    // Apply handwritten rotation tilt
    if (frame.textAngle !== 0) {
      ctx.translate(textX, textY);
      ctx.rotate((frame.textAngle * Math.PI) / 180);
      ctx.fillText(frame.caption, 0, 0);
    } else {
      ctx.fillText(frame.caption, textX, textY);
    }
    ctx.restore();
  }

  // 6. Draw Date Badge
  if (frame.showDate && frame.dateText.trim()) {
    ctx.save();
    
    // Positioned in bottom-right corner slightly inside
    const dateX = targetWidth - sideBorder - 10;
    const dateY = targetHeight - 20;

    // Subtle dark slate or matching light text depending on frame
    ctx.fillStyle = frame.style === 'charcoal' ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)';
    
    const dateFontSize = targetWidth * 0.016; // dynamic size ~19px for 1200w
    ctx.font = `500 ${dateFontSize}px "${frame.dateFontFamily}", monospace`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(frame.dateText, dateX, dateY);
    ctx.restore();
  }

  // Draw subtle vintage stain / texture on top of the entire polaroid
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.015;
  const vignetteGrad = ctx.createRadialGradient(targetWidth / 2, targetHeight / 2, targetWidth * 0.2, targetWidth / 2, targetHeight / 2, targetWidth * 0.8);
  vignetteGrad.addColorStop(0, 'rgba(0,0,0,0)');
  vignetteGrad.addColorStop(1, 'rgba(120,60,0,1)'); // warm brown vintage halo
  ctx.fillStyle = vignetteGrad;
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  ctx.restore();

  return canvas;
}

// Draw the entire collage (photo pack) on a high-res canvas for download
export async function renderCollageToCanvas(
  cards: PolaroidCard[],
  collageSettings: CollageSettings,
  canvasWidth = 2400
): Promise<HTMLCanvasElement> {
  // 1. Calculate height based on selected aspect ratio
  let aspectMultiplier = 0.5625; // 16:9
  if (collageSettings.aspectRatio === '4:3') aspectMultiplier = 0.75;
  else if (collageSettings.aspectRatio === '1:1') aspectMultiplier = 1;

  const canvasHeight = canvasWidth * aspectMultiplier;

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get collage canvas context');

  // 2. Draw Background
  if (collageSettings.backgroundType === 'color') {
    ctx.fillStyle = collageSettings.backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  } else if (collageSettings.backgroundType === 'texture') {
    const bgPreset = COLLAGE_BACKGROUNDS.find(b => b.id === collageSettings.backgroundTexture);
    if (bgPreset) {
      if (bgPreset.id === 'concrete') {
        // Concrete look
        ctx.fillStyle = '#1e2024';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Draw industrial subtle grains
        ctx.save();
        ctx.globalAlpha = 0.15;
        const noise = createNoiseCanvas(400, 400, 50);
        const pattern = ctx.createPattern(noise, 'repeat');
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }
        ctx.restore();

        // Concrete texture gradients
        const grad = ctx.createRadialGradient(canvasWidth/2, canvasHeight/2, 100, canvasWidth/2, canvasHeight/2, canvasWidth);
        grad.addColorStop(0, 'rgba(255,255,255,0.03)');
        grad.addColorStop(1, 'rgba(0,0,0,0.45)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      } else if (bgPreset.id === 'wood') {
        // Wood look
        ctx.fillStyle = '#2f1f17';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Render stylish modern wood planks procedurally!
        ctx.save();
        const plankHeight = canvasHeight / 12;
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 4;
        for (let i = 0; i <= 12; i++) {
          const y = i * plankHeight;
          // Plank splits
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvasWidth, y);
          ctx.stroke();
          
          // Plank wood grains
          ctx.fillStyle = i % 2 === 0 ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.015)';
          ctx.fillRect(0, y, canvasWidth, plankHeight);
        }
        
        // Wood fiber overlay
        ctx.globalAlpha = 0.08;
        const noise = createNoiseCanvas(500, 50, 60);
        const pattern = ctx.createPattern(noise, 'repeat');
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }
        ctx.restore();

        // Dark ambient shadow
        const shadowGrad = ctx.createRadialGradient(canvasWidth/2, canvasHeight/2, canvasWidth*0.2, canvasWidth/2, canvasHeight/2, canvasWidth*0.75);
        shadowGrad.addColorStop(0, 'rgba(0,0,0,0)');
        shadowGrad.addColorStop(1, 'rgba(0,0,0,0.6)');
        ctx.fillStyle = shadowGrad;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      } else if (bgPreset.id === 'linen') {
        // Elegant Linen bedsheet texture
        ctx.fillStyle = '#ebe9e2';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        ctx.save();
        // Crosshatch linen lines
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.025)';
        ctx.lineWidth = 1;
        for (let x = 0; x < canvasWidth; x += 12) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvasHeight);
          ctx.stroke();
        }
        for (let y = 0; y < canvasHeight; y += 12) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvasWidth, y);
          ctx.stroke();
        }

        // Ambient lighting shadow vignette
        const linenVignette = ctx.createRadialGradient(canvasWidth/2, canvasHeight/2, canvasWidth*0.1, canvasWidth/2, canvasHeight/2, canvasWidth*0.8);
        linenVignette.addColorStop(0, 'rgba(255,255,255,0.25)');
        linenVignette.addColorStop(1, 'rgba(120,110,95,0.3)');
        ctx.fillStyle = linenVignette;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.restore();
      } else if (bgPreset.id === 'cork') {
        // Pinboard Cork
        ctx.fillStyle = '#b7805d';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        ctx.save();
        // High density granular cork dots
        ctx.globalAlpha = 0.25;
        const corkNoise = createNoiseCanvas(150, 150, 80);
        const pattern = ctx.createPattern(corkNoise, 'repeat');
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }
        
        const pinGrad = ctx.createRadialGradient(canvasWidth/2, canvasHeight/2, canvasWidth*0.1, canvasWidth/2, canvasHeight/2, canvasWidth*0.8);
        pinGrad.addColorStop(0, 'rgba(0,0,0,0)');
        pinGrad.addColorStop(1, 'rgba(0,0,0,0.4)');
        ctx.fillStyle = pinGrad;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.restore();
      } else {
        // Fallback
        ctx.fillStyle = collageSettings.backgroundColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }
    }
  } else if (collageSettings.backgroundType === 'image' && collageSettings.backgroundImageUrl) {
    try {
      const bgImg = await loadImage(collageSettings.backgroundImageUrl);
      const bgScale = Math.max(canvasWidth / bgImg.width, canvasHeight / bgImg.height);
      const sw = canvasWidth / bgScale;
      const sh = canvasHeight / bgScale;
      const sx = (bgImg.width - sw) / 2;
      const sy = (bgImg.height - sh) / 2;
      ctx.drawImage(bgImg, sx, sy, sw, sh, 0, 0, canvasWidth, canvasHeight);
    } catch (e) {
      console.error('Failed to load collage background image, using fallback color', e);
      ctx.fillStyle = '#141517';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
  }

  // Draw Mockup text overlays (if any)
  if (collageSettings.mockupId) {
    const mockup = MOCKUP_PRESETS.find(m => m.id === collageSettings.mockupId);
    if (mockup && mockup.textOverlay) {
      const overlay = mockup.textOverlay;
      ctx.save();
      
      const posX = (overlay.x / 100) * canvasWidth;
      const posY = (overlay.y / 100) * canvasHeight;
      
      ctx.translate(posX, posY);
      if (overlay.rotation) {
        ctx.rotate((overlay.rotation * Math.PI) / 180);
      }
      
      // Load and scale font size dynamically
      const scaledFontSize = (canvasWidth / 1000) * overlay.fontSize;
      ctx.font = `bold ${scaledFontSize}px "${overlay.fontFamily}", cursive, sans-serif`;
      ctx.fillStyle = overlay.color;
      ctx.textAlign = overlay.align;
      ctx.textBaseline = 'middle';
      
      const lines = overlay.text.split('\n');
      const lineHeight = scaledFontSize * 1.15;
      
      lines.forEach((line, index) => {
        const offset = (index - (lines.length - 1) / 2) * lineHeight;
        ctx.fillText(line, 0, offset);
      });
      
      ctx.restore();
    }
  }

  // Sort cards by zIndex to draw back-to-front correctly
  const sortedCards = [...cards].sort((a, b) => a.zIndex - b.zIndex);

  // 3. Render and Draw each Polaroid card
  for (const card of sortedCards) {
    ctx.save();

    // Determine the high-res size of the card inside the collage
    // Default collage card width is around 20% to 25% of the total workspace
    const baseCardWidth = canvasWidth * 0.24; 
    const finalCardWidth = baseCardWidth * card.scale;

    // Render individual Polaroid high-res canvas
    const pCanvas = await renderPolaroidToCanvas(card, finalCardWidth);

    // Calculate center coordinates
    const posX = (card.x / 100) * canvasWidth;
    const posY = (card.y / 100) * canvasHeight;

    ctx.translate(posX, posY);
    ctx.rotate((card.rotation * Math.PI) / 180);

    // Set gorgeous organic drop shadow for the stacked polaroids
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = canvasWidth * 0.015; // Realistic blur
    ctx.shadowOffsetX = canvasWidth * 0.005; // Light from top-left
    ctx.shadowOffsetY = canvasWidth * 0.008;

    // Draw the pre-rendered polaroid canvas centered on its coordinate
    ctx.drawImage(
      pCanvas,
      -pCanvas.width / 2,
      -pCanvas.height / 2
    );

    ctx.restore();
  }

  return canvas;
}
