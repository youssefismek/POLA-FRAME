import React, { useRef } from 'react';
import { PolaroidCard as PolaroidCardType } from '../types';
import { FRAME_STYLES } from '../data/filters';

interface PolaroidCardProps {
  card: PolaroidCardType;
  isSelected?: boolean;
  isCollageMode?: boolean;
  onSelect?: () => void;
  onUpdateLayout?: (layout: { x?: number; y?: number; rotation?: number; scale?: number }) => void;
}

export const PolaroidCard: React.FC<PolaroidCardProps> = ({
  card,
  isSelected = false,
  isCollageMode = false,
  onSelect,
  onUpdateLayout,
}) => {
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
  const cardRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; cardX: number; cardY: number } | null>(null);

  // Get active background styling from FRAME_STYLES
  const framePreset = FRAME_STYLES.find((f) => f.id === frame.style) || FRAME_STYLES[0];

  // Map light leak to CSS gradient
  const getLightLeakCSS = () => {
    if (filter.lightLeak === 'none') return 'none';
    const intensity = filter.lightLeakIntensity / 100;

    switch (filter.lightLeak) {
      case 'warm-glow':
        return `radial-gradient(circle at top left, rgba(255, 120, 50, ${intensity * 0.85}) 0%, rgba(255, 60, 10, ${intensity * 0.3}) 55%, transparent 100%)`;
      case 'sunset-strip':
        return `linear-gradient(45deg, rgba(255, 50, 50, ${intensity * 0.7}) 0%, rgba(255, 120, 0, ${intensity * 0.45}) 30%, rgba(255, 220, 0, ${intensity * 0.2}) 60%, transparent 100%)`;
      case 'rainbow-streak':
        return `linear-gradient(135deg, rgba(255, 0, 0, ${intensity * 0.45}) 0%, rgba(255, 127, 0, ${intensity * 0.35}) 20%, rgba(255, 255, 0, ${intensity * 0.25}) 40%, rgba(0, 255, 0, ${intensity * 0.15}) 60%, rgba(0, 0, 255, ${intensity * 0.1}) 80%, transparent 100%)`;
      case 'side-flare':
        return `radial-gradient(circle at right, rgba(255, 255, 220, ${intensity * 0.9}) 0%, rgba(255, 150, 80, ${intensity * 0.45}) 30%, rgba(255, 50, 50, ${intensity * 0.15}) 70%, transparent 100%)`;
      default:
        return 'none';
    }
  };

  // Build filter style for photo
  const getImageFilterStyle = () => {
    const filters = [];
    if (filter.brightness !== 100) filters.push(`brightness(${filter.brightness}%)`);
    if (filter.contrast !== 100) filters.push(`contrast(${filter.contrast}%)`);
    if (filter.saturation !== 100) filters.push(`saturate(${filter.saturation}%)`);
    if (filter.sepia > 0) filters.push(`sepia(${filter.sepia}%)`);
    if (filter.blur > 0) filters.push(`blur(${filter.blur}px)`);

    return filters.join(' ');
  };

  // Image Aspect Ratio styles
  const getImageAspectRatioClass = () => {
    switch (frame.aspectRatio) {
      case '4:5':
        return 'aspect-[4/5]';
      case '3:4':
        return 'aspect-[3/4]';
      case '16:9':
        return 'aspect-[16/9]';
      case '1:1':
      default:
        return 'aspect-square';
    }
  };

  // Drag handlers for Collage Mode
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isCollageMode || !onUpdateLayout) return;
    onSelect?.();

    // Prevent dragging if clicking delete/rotate controls (will be outside)
    if ((e.target as HTMLElement).closest('.card-control-btn')) return;

    e.preventDefault();
    const board = cardRef.current?.parentElement;
    if (!board) return;

    const boardRect = board.getBoundingClientRect();
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      cardX: card.x,
      cardY: card.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStartRef.current) return;
      const deltaX = moveEvent.clientX - dragStartRef.current.startX;
      const deltaY = moveEvent.clientY - dragStartRef.current.startY;

      // Convert pixel delta to percentage of board
      const pctDeltaX = (deltaX / boardRect.width) * 100;
      const pctDeltaY = (deltaY / boardRect.height) * 100;

      onUpdateLayout({
        x: Math.max(0, Math.min(100, dragStartRef.current.cardX + pctDeltaX)),
        y: Math.max(0, Math.min(100, dragStartRef.current.cardY + pctDeltaY)),
      });
    };

    const handleMouseUp = () => {
      dragStartRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isCollageMode || !onUpdateLayout) return;
    onSelect?.();

    if ((e.target as HTMLElement).closest('.card-control-btn')) return;

    const touch = e.touches[0];
    const board = cardRef.current?.parentElement;
    if (!board) return;

    const boardRect = board.getBoundingClientRect();
    dragStartRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      cardX: card.x,
      cardY: card.y,
    };

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (!dragStartRef.current) return;
      const touchMove = moveEvent.touches[0];
      const deltaX = touchMove.clientX - dragStartRef.current.startX;
      const deltaY = touchMove.clientY - dragStartRef.current.startY;

      const pctDeltaX = (deltaX / boardRect.width) * 100;
      const pctDeltaY = (deltaY / boardRect.height) * 100;

      onUpdateLayout({
        x: Math.max(0, Math.min(100, dragStartRef.current.cardX + pctDeltaX)),
        y: Math.max(0, Math.min(100, dragStartRef.current.cardY + pctDeltaY)),
      });
    };

    const handleTouchEnd = () => {
      dragStartRef.current = null;
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  // Temperature color blend overlays
  const getTempColorStyle = () => {
    if (filter.temperature === 0) return {};
    const isWarm = filter.temperature > 0;
    const color = isWarm ? 'rgba(255, 140, 0, 1)' : 'rgba(0, 191, 255, 1)';
    const opacity = (Math.abs(filter.temperature) / 100) * 0.15;
    return {
      backgroundColor: color,
      opacity: opacity,
      mixBlendMode: 'color-burn' as const,
    };
  };

  // Frame custom width sizing (makes the container scale dynamically or look neat)
  const getCardStyle = (): React.CSSProperties => {
    if (isCollageMode) {
      return {
        position: 'absolute',
        left: `${card.x}%`,
        top: `${card.y}%`,
        transform: `translate(-50%, -50%) rotate(${card.rotation}deg) scale(${card.scale})`,
        zIndex: card.zIndex,
        width: '210px', // Perfect default responsive collage card size
        cursor: 'move',
        transition: dragStartRef.current ? 'none' : 'transform 0.1s ease-out, box-shadow 0.2s ease-out',
      };
    }
    return {
      width: '100%',
      maxWidth: '380px',
      margin: '0 auto',
    };
  };

  return (
    <div
      id={`polaroid-card-${card.id}`}
      ref={cardRef}
      style={getCardStyle()}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={`
        ${framePreset.bgClass}
        p-4 pb-14 rounded-none relative select-none overflow-hidden
        ${isSelected && isCollageMode ? 'border-[3px] border-[#ff00ff] shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] scale-[1.04] z-50' : 'border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.65)]'}
        ${isCollageMode ? 'hover:scale-[1.02] cursor-move transition-transform' : ''}
      `}
    >
      {doubleExposureEnabled && (
        <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
          <defs>
            <filter id={`gamma-filter-1-${card.id}`}>
              <feComponentTransfer>
                <feFuncR type="gamma" exponent={1 / image1Gamma} />
                <feFuncG type="gamma" exponent={1 / image1Gamma} />
                <feFuncB type="gamma" exponent={1 / image1Gamma} />
              </feComponentTransfer>
            </filter>
            <filter id={`gamma-filter-2-${card.id}`}>
              <feComponentTransfer>
                <feFuncR type="gamma" exponent={1 / image2Gamma} />
                <feFuncG type="gamma" exponent={1 / image2Gamma} />
                <feFuncB type="gamma" exponent={1 / image2Gamma} />
              </feComponentTransfer>
            </filter>
          </defs>
        </svg>
      )}

      {/* 1. Image Viewport Inset */}
      <div 
        className={`w-full overflow-hidden relative shadow-inner select-none border border-black/10 ${getImageAspectRatioClass()}`}
        style={{
          boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.12)'
        }}
      >
        {/* The Photo itself */}
        <img
          src={imageUrl}
          alt="Polaroid filter preview"
          draggable={false}
          style={{
            filter: doubleExposureEnabled 
              ? `${getImageFilterStyle()} url(#gamma-filter-1-${card.id})`
              : getImageFilterStyle(),
            opacity: doubleExposureEnabled ? image1Opacity / 100 : 1,
          }}
          className="w-full h-full object-cover select-none pointer-events-none"
        />

        {/* Double Exposure Image 2 */}
        {doubleExposureEnabled && imageUrl2 && (
          <img
            src={imageUrl2}
            alt="Double exposure layer"
            draggable={false}
            style={{
              filter: `${getImageFilterStyle()} url(#gamma-filter-2-${card.id})`,
              opacity: image2Opacity / 100,
              position: 'absolute',
              inset: 0,
            }}
            className="w-full h-full object-cover select-none pointer-events-none"
          />
        )}

        {/* Temperature blend layer */}
        {filter.temperature !== 0 && (
          <div 
            className="absolute inset-0 pointer-events-none select-none"
            style={getTempColorStyle()}
          />
        )}

        {/* Vignette Layer */}
        {filter.vignette > 0 && (
          <div
            className="absolute inset-0 pointer-events-none select-none mix-blend-multiply"
            style={{
              background: `radial-gradient(circle, rgba(0,0,0,0) 40%, rgba(0,0,0,${(filter.vignette / 100) * 0.2}) 65%, rgba(0,0,0,${(filter.vignette / 100) * 0.75}) 100%)`,
            }}
          />
        )}

        {/* Light Leak Layer */}
        {filter.lightLeak !== 'none' && (
          <div
            className="absolute inset-0 pointer-events-none select-none mix-blend-screen"
            style={{
              background: getLightLeakCSS(),
            }}
          />
        )}

        {/* Noise/Grain texture layer */}
        {filter.grain > 0 && (
          <div
            className="absolute inset-0 pointer-events-none select-none opacity-20 mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              opacity: (filter.grain / 100) * 0.45,
            }}
          />
        )}
      </div>

      {/* 2. Handwriting Caption */}
      {frame.caption.trim() && (
        <div
          className={`
            absolute bottom-5 left-4 right-4 text-center select-none pointer-events-none
            ${framePreset.textClass}
          `}
          style={{
            fontFamily: `"${frame.fontFamily}", cursive, sans-serif`,
            fontSize: `${frame.fontSize * 0.85}px`,
            color: frame.markerColor,
            transform: `rotate(${frame.textAngle}deg)`,
            textAlign: frame.textAlignment,
            transformOrigin: 'center',
          }}
        >
          {frame.caption}
        </div>
      )}

      {/* 3. Date Stamp */}
      {frame.showDate && frame.dateText.trim() && (
        <div
          className={`
            absolute bottom-2 right-4 text-[9px] select-none pointer-events-none font-medium tracking-tight
            ${frame.style === 'charcoal' ? 'text-white/40' : 'text-black/45'}
          `}
          style={{
            fontFamily: `"${frame.dateFontFamily}", monospace`,
          }}
        >
          {frame.dateText}
        </div>
      )}

      {/* Subtle overlay paper stain */}
      <div 
        className="absolute inset-0 pointer-events-none select-none opacity-[0.015] mix-blend-multiply"
        style={{
          background: `radial-gradient(circle, rgba(0,0,0,0) 30%, rgba(120,60,0,1) 100%)`
        }}
      />
    </div>
  );
};
