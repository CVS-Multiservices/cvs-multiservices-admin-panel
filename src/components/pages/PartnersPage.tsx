import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Edit, Trash2, Save, Upload, X, CheckCircle2, Loader2,
  ZoomIn, ZoomOut, RotateCcw, Move, Pipette, Eraser,
  ImageIcon, RefreshCw,
} from 'lucide-react';
import { GenericListPage } from '../generic/GenericListPage';
import { FormInput, FormField } from '../common/FormHelpers';
import { uploadApi, UploadFolder } from '../../services/api';
import { InlineLoader } from '../common/ImageUploader';

// ==================== TYPES ====================
interface LogoUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  previousCloudinaryUrl?: string;
}

// ==================== BACKGROUND COLORS ====================
const BG_COLORS = [
  { label: 'White', value: '#FFFFFF', textColor: '#64748b' },
  { label: 'Light Gray', value: '#F8FAFC', textColor: '#64748b' },
  { label: 'Snow', value: '#F1F5F9', textColor: '#64748b' },
  { label: 'Cream', value: '#FFFBEB', textColor: '#92400e' },
  { label: 'Light Blue', value: '#EFF6FF', textColor: '#1e40af' },
  { label: 'Light Green', value: '#F0FDF4', textColor: '#166534' },
  { label: 'Light Purple', value: '#FAF5FF', textColor: '#7e22ce' },
  { label: 'Light Pink', value: '#FFF1F2', textColor: '#be123c' },
  { label: 'Dark Navy', value: '#0F172A', textColor: '#e2e8f0' },
  { label: 'Dark Gray', value: '#1E293B', textColor: '#e2e8f0' },
  { label: 'Black', value: '#000000', textColor: '#e2e8f0' },
  { label: 'Transparent', value: 'transparent', textColor: '#64748b' },
];

// ==================== BACKGROUND REMOVAL (Client-Side) ====================
function removeBackground(
  img: HTMLImageElement,
  threshold: number = 30,
  mode: 'white' | 'auto' = 'auto'
): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Sample corners to detect background color
  const cornerPixels: number[][] = [];
  const samplePoints = [
    [0, 0],
    [canvas.width - 1, 0],
    [0, canvas.height - 1],
    [canvas.width - 1, canvas.height - 1],
    [Math.floor(canvas.width / 2), 0],
    [0, Math.floor(canvas.height / 2)],
    [canvas.width - 1, Math.floor(canvas.height / 2)],
    [Math.floor(canvas.width / 2), canvas.height - 1],
  ];

  for (const [x, y] of samplePoints) {
    const idx = (y * canvas.width + x) * 4;
    cornerPixels.push([data[idx], data[idx + 1], data[idx + 2]]);
  }

  // Average corner color as detected background
  let bgR: number, bgG: number, bgB: number;

  if (mode === 'white') {
    bgR = 255;
    bgG = 255;
    bgB = 255;
  } else {
    bgR = Math.round(cornerPixels.reduce((s, p) => s + p[0], 0) / cornerPixels.length);
    bgG = Math.round(cornerPixels.reduce((s, p) => s + p[1], 0) / cornerPixels.length);
    bgB = Math.round(cornerPixels.reduce((s, p) => s + p[2], 0) / cornerPixels.length);
  }

  // Remove pixels similar to background
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const distance = Math.sqrt(
      Math.pow(r - bgR, 2) +
      Math.pow(g - bgG, 2) +
      Math.pow(b - bgB, 2)
    );

    if (distance < threshold) {
      data[i + 3] = 0; // Make transparent
    }
  }

  // Edge smoothing — anti-alias the boundary
  const smoothed = new Uint8ClampedArray(data.length);
  smoothed.set(data);

  for (let y = 1; y < canvas.height - 1; y++) {
    for (let x = 1; x < canvas.width - 1; x++) {
      const idx = (y * canvas.width + x) * 4;
      const alpha = data[idx + 3];

      if (alpha > 0 && alpha < 255) continue;

      // Check if this is a border pixel
      let transparentNeighbors = 0;
      let opaqueNeighbors = 0;

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nIdx = ((y + dy) * canvas.width + (x + dx)) * 4;
          if (data[nIdx + 3] === 0) transparentNeighbors++;
          else opaqueNeighbors++;
        }
      }

      // Soften edges
      if (alpha > 0 && transparentNeighbors > 0 && opaqueNeighbors > 0) {
        const ratio = opaqueNeighbors / (transparentNeighbors + opaqueNeighbors);
        smoothed[idx + 3] = Math.round(alpha * ratio);
      }
    }
  }

  return new ImageData(smoothed, canvas.width, canvas.height);
}

// Get bounding box of non-transparent pixels
function getContentBounds(imageData: ImageData): {
  top: number; left: number; right: number; bottom: number;
} {
  const { data, width, height } = imageData;
  let top = height, left = width, right = 0, bottom = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 10) {
        if (y < top) top = y;
        if (y > bottom) bottom = y;
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
  }

  return { top, left, right, bottom };
}

// ==================== LOGO PROCESSOR COMPONENT ====================
// ==================== LOGO PROCESSOR COMPONENT ====================
function LogoProcessor({
  src,
  onDone,
  onCancel,
  showToast,
}: {
  src: string;
  onDone: (blob: Blob) => void;
  onCancel: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}) {
  const OUTPUT_W = 480;
  const OUTPUT_H = 260;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement | null>(null); // ✅ Store processed as canvas

  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bgRemoved, setBgRemoved] = useState(false);
  const [threshold, setThreshold] = useState(30);
  const [removeMode, setRemoveMode] = useState<'auto' | 'white'>('auto');
  const [padding, setPadding] = useState(20);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // ✅ Content bounds after BG removal
  const [contentBounds, setContentBounds] = useState<{
    top: number; left: number; right: number; bottom: number;
    width: number; height: number;
  } | null>(null);

  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      setImgLoaded(true);
      fitOriginalToCanvas(img);
    };
    img.onerror = () => showToast('Failed to load image', 'error');
    img.src = src;
  }, [src]);

  // ✅ Fit original (non-processed) image
  const fitOriginalToCanvas = (img: HTMLImageElement) => {
    const availW = OUTPUT_W - padding * 2;
    const availH = OUTPUT_H - padding * 2;
    const scaleX = availW / img.naturalWidth;
    const scaleY = availH / img.naturalHeight;
    const fitScale = Math.min(scaleX, scaleY, 1);
    setScale(fitScale);
    setPosition({
      x: (OUTPUT_W - img.naturalWidth * fitScale) / 2,
      y: (OUTPUT_H - img.naturalHeight * fitScale) / 2,
    });
  };

  // ✅ Center processed content (after BG removal) — always centered
  const centerProcessedContent = useCallback(
    (bounds: { top: number; left: number; right: number; bottom: number }, pad?: number) => {
      const usePadding = pad ?? padding;
      const contentW = bounds.right - bounds.left + 1;
      const contentH = bounds.bottom - bounds.top + 1;

      if (contentW <= 0 || contentH <= 0) return;

      const availW = OUTPUT_W - usePadding * 2;
      const availH = OUTPUT_H - usePadding * 2;
      const fitScale = Math.min(availW / contentW, availH / contentH, 1);

      const scaledW = contentW * fitScale;
      const scaledH = contentH * fitScale;

      setScale(fitScale);
      setPosition({
        x: (OUTPUT_W - scaledW) / 2 - bounds.left * fitScale,
        y: (OUTPUT_H - scaledH) / 2 - bounds.top * fitScale,
      });
    },
    [padding]
  );

  // ✅ Draw — completely rewritten for clean centering
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    // Clear & draw background
    ctx.clearRect(0, 0, OUTPUT_W, OUTPUT_H);

    if (bgColor === 'transparent') {
      const size = 10;
      for (let y = 0; y < OUTPUT_H; y += size) {
        for (let x = 0; x < OUTPUT_W; x += size) {
          ctx.fillStyle =
            (Math.floor(x / size) + Math.floor(y / size)) % 2 === 0
              ? '#e2e8f0'
              : '#ffffff';
          ctx.fillRect(x, y, size, size);
        }
      }
    } else {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, OUTPUT_W, OUTPUT_H);
    }

    if (bgRemoved && processedCanvasRef.current) {
      // ✅ Draw the processed (BG-removed) canvas
      const procCanvas = processedCanvasRef.current;
      ctx.drawImage(
        procCanvas,
        position.x,
        position.y,
        procCanvas.width * scale,
        procCanvas.height * scale
      );
    } else if (imageRef.current) {
      const img = imageRef.current;
      ctx.drawImage(
        img,
        position.x,
        position.y,
        img.naturalWidth * scale,
        img.naturalHeight * scale
      );
    }

    // Subtle border
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, OUTPUT_W - 1, OUTPUT_H - 1);
  }, [bgColor, bgRemoved, scale, position]);

  useEffect(() => {
    if (imgLoaded) draw();
  }, [imgLoaded, draw]);

  // Mouse/Touch drag
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging.current) return;
    const dx = e.touches[0].clientX - lastPos.current.x;
    const dy = e.touches[0].clientY - lastPos.current.y;
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.02 : 0.02;
    setScale((prev) => Math.max(0.05, Math.min(3, prev + delta)));
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);
    const canvas = canvasRef.current;
    if (canvas) canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
      if (canvas) canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleWheel]);

  // ✅ Background removal — fixed centering
  const handleRemoveBg = async () => {
    if (!imageRef.current) return;
    setIsProcessing(true);
    showToast('Removing background...', 'info');

    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      const processed = removeBackground(imageRef.current, threshold, removeMode);

      // Create a persistent canvas from the processed ImageData
      const procCanvas = document.createElement('canvas');
      procCanvas.width = processed.width;
      procCanvas.height = processed.height;
      const procCtx = procCanvas.getContext('2d')!;
      procCtx.putImageData(processed, 0, 0);
      processedCanvasRef.current = procCanvas;

      // Find content bounds
      const bounds = getContentBounds(processed);
      const contentW = bounds.right - bounds.left + 1;
      const contentH = bounds.bottom - bounds.top + 1;

      setContentBounds({
        ...bounds,
        width: contentW,
        height: contentH,
      });

      // ✅ Center the content
      centerProcessedContent(bounds);

      setBgRemoved(true);
      showToast('Background removed! Logo centered automatically.', 'success');
    } catch {
      showToast('Background removal failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ Restore original
  const handleRestoreOriginal = () => {
    setBgRemoved(false);
    processedCanvasRef.current = null;
    setContentBounds(null);
    if (imageRef.current) fitOriginalToCanvas(imageRef.current);
    showToast('Original image restored', 'info');
  };

  const handleZoom = (delta: number) => {
    setScale((prev) => Math.max(0.05, Math.min(3, prev + delta)));
  };

  // ✅ Center fit — uses content bounds if BG removed
  const handleCenterFit = () => {
    if (bgRemoved && contentBounds) {
      centerProcessedContent(contentBounds);
    } else if (imageRef.current) {
      fitOriginalToCanvas(imageRef.current);
    }
  };

  // ✅ Re-center when padding changes and BG is removed
  const handlePaddingChange = (newPadding: number) => {
    setPadding(newPadding);
    if (bgRemoved && contentBounds) {
      centerProcessedContent(contentBounds, newPadding);
    } else if (imageRef.current) {
      const img = imageRef.current;
      const availW = OUTPUT_W - newPadding * 2;
      const availH = OUTPUT_H - newPadding * 2;
      const scaleX = availW / img.naturalWidth;
      const scaleY = availH / img.naturalHeight;
      const fitScale = Math.min(scaleX, scaleY, 1);
      setScale(fitScale);
      setPosition({
        x: (OUTPUT_W - img.naturalWidth * fitScale) / 2,
        y: (OUTPUT_H - img.naturalHeight * fitScale) / 2,
      });
    }
  };

  // ✅ Re-center when BG color changes and BG is removed
  useEffect(() => {
    if (bgRemoved && contentBounds) {
      centerProcessedContent(contentBounds);
    }
  }, [bgColor]);

  // ✅ Export — clean final render
  const handleDone = () => {
    // Create a fresh export canvas
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = OUTPUT_W;
    exportCanvas.height = OUTPUT_H;
    const ctx = exportCanvas.getContext('2d')!;

    // Background
    if (bgColor === 'transparent') {
      // Transparent — leave clear
      ctx.clearRect(0, 0, OUTPUT_W, OUTPUT_H);
    } else {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, OUTPUT_W, OUTPUT_H);
    }

    // Draw content
    if (bgRemoved && processedCanvasRef.current) {
      const procCanvas = processedCanvasRef.current;
      ctx.drawImage(
        procCanvas,
        position.x,
        position.y,
        procCanvas.width * scale,
        procCanvas.height * scale
      );
    } else if (imageRef.current) {
      const img = imageRef.current;
      ctx.drawImage(
        img,
        position.x,
        position.y,
        img.naturalWidth * scale,
        img.naturalHeight * scale
      );
    }

    const format = bgColor === 'transparent' ? 'image/png' : 'image/jpeg';
    exportCanvas.toBlob(
      (blob) => {
        if (blob) onDone(blob);
      },
      format,
      0.95
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <p className="text-sm font-semibold text-slate-700">Logo Editor</p>
        <p className="text-xs text-slate-400 mt-0.5">
          Output: 480×260px · Drag to position · Scroll to zoom
        </p>
        {bgRemoved && contentBounds && (
          <p className="text-xs text-emerald-500 mt-0.5">
            ✓ Background removed · Content: {contentBounds.width}×{contentBounds.height}px · Auto-centered
          </p>
        )}
      </div>

      {/* Canvas preview */}
      <div className="flex justify-center">
        <div
          className="relative rounded-2xl overflow-hidden border-2 border-blue-200 shadow-inner"
          style={{
            width: OUTPUT_W,
            maxWidth: '100%',
            background:
              bgColor === 'transparent'
                ? 'repeating-conic-gradient(#e2e8f0 0% 25%, #fff 0% 50%) 50% / 16px 16px'
                : bgColor,
          }}
        >
          <canvas
            ref={canvasRef}
            width={OUTPUT_W}
            height={OUTPUT_H}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className="block cursor-grab active:cursor-grabbing"
            style={{ width: '100%', height: 'auto' }}
          />
          {!imgLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
            </div>
          )}

          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="text-sm font-medium text-blue-700">
                  Removing background...
                </span>
              </div>
            </div>
          )}

          <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded-lg font-medium">
            480×260px
          </div>

          {bgRemoved && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-emerald-500/90 text-white text-xs rounded-lg font-medium flex items-center gap-1">
              <Eraser className="w-3 h-3" />
              BG Removed · Centered
            </div>
          )}

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-black/50 text-white text-xs rounded-full">
            <Move className="w-3 h-3" /> Drag to reposition
          </div>
        </div>
      </div>

      {/* Zoom controls */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => handleZoom(-0.05)}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="flex-1 flex items-center gap-3">
          <input
            type="range"
            min={5}
            max={300}
            step={1}
            value={Math.round(scale * 100)}
            onChange={(e) => setScale(Number(e.target.value) / 100)}
            className="flex-1 accent-blue-600"
          />
          <span className="text-xs text-slate-500 w-10 text-right">
            {Math.round(scale * 100)}%
          </span>
        </div>
        <button
          type="button"
          onClick={() => handleZoom(0.05)}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleCenterFit}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
          title="Center & fit logo"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Background Color Picker */}
      <FormField label="Background Color">
        <div className="grid grid-cols-6 gap-2">
          {BG_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => setBgColor(color.value)}
              className={`relative flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                bgColor === color.value
                  ? 'border-blue-500 shadow-md scale-105'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div
                className="w-8 h-8 rounded-lg border border-slate-200"
                style={{
                  background:
                    color.value === 'transparent'
                      ? 'repeating-conic-gradient(#e2e8f0 0% 25%, #fff 0% 50%) 50% / 8px 8px'
                      : color.value,
                }}
              />
              <span className="text-[9px] text-slate-500 leading-tight text-center">
                {color.label}
              </span>
              {bgColor === color.value && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-3">
          <label className="text-xs text-slate-500">Custom:</label>
          <input
            type="color"
            value={bgColor === 'transparent' ? '#ffffff' : bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer"
          />
          <input
            type="text"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            placeholder="#FFFFFF"
            className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </FormField>

      {/* Padding */}
      <div className="flex items-center gap-3">
        <label className="text-xs text-slate-500 w-16">Padding:</label>
        <input
          type="range"
          min={0}
          max={80}
          step={5}
          value={padding}
          onChange={(e) => handlePaddingChange(Number(e.target.value))}
          className="flex-1 accent-blue-600"
        />
        <span className="text-xs text-slate-500 w-10 text-right">{padding}px</span>
      </div>

      {/* Background Removal Section */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl space-y-3">
        <div className="flex items-center gap-2">
          <Eraser className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-semibold text-purple-700">
            Background Remover
          </span>
          <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full font-medium">
            Auto-centers after removal
          </span>
        </div>

        <p className="text-xs text-purple-500">
          Removes solid-color backgrounds and auto-centers the logo on chosen
          background color.
        </p>

        {/* Mode */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-600">Detect:</label>
          <button
            type="button"
            onClick={() => setRemoveMode('auto')}
            className={`px-3 py-1.5 text-xs rounded-lg transition ${
              removeMode === 'auto'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-purple-50'
            }`}
          >
            <Pipette className="w-3 h-3 inline mr-1" />
            Auto-detect BG
          </button>
          <button
            type="button"
            onClick={() => setRemoveMode('white')}
            className={`px-3 py-1.5 text-xs rounded-lg transition ${
              removeMode === 'white'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-purple-50'
            }`}
          >
            White BG Only
          </button>
        </div>

        {/* Threshold */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-600 w-20">Sensitivity:</label>
          <input
            type="range"
            min={5}
            max={100}
            step={1}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="flex-1 accent-purple-600"
          />
          <span className="text-xs text-purple-600 w-8 text-right font-mono">
            {threshold}
          </span>
        </div>
        <p className="text-[10px] text-slate-400">
          Lower = precise · Higher = aggressive (may remove logo edges)
        </p>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRemoveBg}
            disabled={isProcessing || !imgLoaded}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Eraser className="w-4 h-4" />
            )}
            {isProcessing
              ? 'Processing...'
              : bgRemoved
              ? 'Re-process & Re-center'
              : 'Remove Background'}
          </button>

          {bgRemoved && (
            <>
              <button
                type="button"
                onClick={() => {
                  if (contentBounds) centerProcessedContent(contentBounds);
                  showToast('Logo re-centered', 'info');
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 font-medium rounded-xl transition text-sm"
                title="Re-center logo"
              >
                <RotateCcw className="w-4 h-4" />
                Center
              </button>
              <button
                type="button"
                onClick={handleRestoreOriginal}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl transition text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Restore
              </button>
            </>
          )}
        </div>
      </div>

      {/* Final Actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition text-sm"
        >
          Choose Different Image
        </button>
        <button
          type="button"
          onClick={handleDone}
          disabled={!imgLoaded || isProcessing}
          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Upload Logo to Cloudinary
        </button>
      </div>
    </div>
  );
}
// ==================== LOGO UPLOADER (Wraps LogoProcessor) ====================
function LogoUploader({
  value,
  onChange,
  label = 'Logo',
  required = false,
  showToast,
  previousCloudinaryUrl,
}: LogoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rawSrc, setRawSrc] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteFromCloudinary = async (url: string): Promise<boolean> => {
    if (!url || !url.includes('cloudinary.com')) return true;
    try {
      setIsDeleting(true);
      const result = await uploadApi.delete(url);
      return result.success;
    } catch {
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be less than 10MB.');
      return;
    }
    setUploadError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      setRawSrc(ev.target?.result as string);
      setShowEditor(true);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleEditorDone = async (blob: Blob) => {
    setShowEditor(false);
    setRawSrc(null);
    setUploading(true);
    setUploadProgress(0);
    setUploadError('');

    const urlToDelete = value || previousCloudinaryUrl;
    if (urlToDelete && urlToDelete.includes('cloudinary.com')) {
      showToast('Removing old logo from Cloudinary...', 'info');
      await deleteFromCloudinary(urlToDelete);
    }

    const isPng = blob.type === 'image/png';
    const ext = isPng ? 'png' : 'jpg';
    const fileName = `partner-logo-${Date.now()}.${ext}`;
    const file = new File([blob], fileName, { type: blob.type });

    const result = await uploadApi.upload(file, 'partners' as UploadFolder, (percent) => {
      setUploadProgress(percent);
    });

    setUploading(false);
    setUploadProgress(0);

    if (result.success && result.data?.url) {
      onChange(result.data.url);
      showToast('Logo uploaded successfully!', 'success');
    } else {
      setUploadError(result.message || 'Upload failed.');
      showToast('Upload failed. Please try again.', 'error');
    }
  };

  const handleEditorCancel = () => {
    setShowEditor(false);
    setRawSrc(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = async () => {
    const urlToDelete = value || previousCloudinaryUrl;
    if (urlToDelete && urlToDelete.includes('cloudinary.com')) {
      const deleted = await deleteFromCloudinary(urlToDelete);
      if (deleted) showToast('Logo removed from Cloudinary', 'success');
      else showToast('Failed to remove from Cloudinary', 'error');
    }
    onChange('');
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <FormField label={label} required={required}>
      <div className="space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {isDeleting && <InlineLoader message="Removing logo from Cloudinary..." />}

        {/* Editor */}
        {showEditor && rawSrc && (
          <LogoProcessor
            src={rawSrc}
            onDone={handleEditorDone}
            onCancel={handleEditorCancel}
            showToast={showToast}
          />
        )}

        {/* Uploading */}
        {!showEditor && uploading && (
          <div className="p-6 border-2 border-blue-200 rounded-2xl bg-blue-50">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle
                    cx="32" cy="32" r="28"
                    fill="none" stroke="#e2e8f0" strokeWidth="6"
                  />
                  <circle
                    cx="32" cy="32" r="28"
                    fill="none" stroke="#3b82f6" strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - uploadProgress / 100)}`}
                    className="transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">
                    {uploadProgress}%
                  </span>
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  <p className="text-sm font-semibold text-blue-700">
                    Uploading logo...
                  </p>
                </div>
              </div>
              <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Preview — uploaded */}
        {!showEditor && !uploading && value && (
          <div className="space-y-3">
            <div
              className="relative rounded-2xl overflow-hidden border-2 border-emerald-200 mx-auto"
              style={{
                width: 480,
                maxWidth: '100%',
                background:
                  'repeating-conic-gradient(#f1f5f9 0% 25%, #fff 0% 50%) 50% / 16px 16px',
              }}
            >
              <img
                src={value}
                alt="Logo"
                className="w-full object-contain"
                style={{ aspectRatio: '480/260' }}
                onError={() => setUploadError('Failed to load preview.')}
              />
              <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 text-xs font-semibold bg-white/90 px-2 py-0.5 rounded-lg">
                  Uploaded
                </span>
              </div>
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 hover:bg-black/70 text-white text-xs rounded-lg transition"
              >
                View ↗
              </a>
            </div>

            {/* URL */}
            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 mb-0.5">Cloudinary URL</p>
                <p
                  className="text-xs text-slate-600 truncate font-mono"
                  title={value}
                >
                  {value}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(value);
                  showToast('URL copied!', 'info');
                }}
                className="px-2 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs rounded-lg transition flex-shrink-0"
              >
                Copy
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition"
              >
                <Upload className="w-4 h-4" /> Replace Logo
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={isDeleting}
                className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-xl transition disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <X className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Drop zone */}
        {!showEditor && !uploading && !value && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full flex flex-col items-center justify-center gap-4 p-10 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50 scale-[0.99]'
                : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition ${
                isDragging ? 'bg-blue-200' : 'bg-slate-100'
              }`}
            >
              <Upload
                className={`w-8 h-8 transition ${
                  isDragging ? 'text-blue-600' : 'text-slate-400'
                }`}
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700">
                {isDragging ? 'Drop logo here' : 'Upload Partner Logo'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Click to browse or drag & drop
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                PNG, JPG, SVG, WEBP · Max 10MB
              </p>
            </div>

            {/* Flow */}
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
              <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">
                1
              </span>
              <span>Select</span>
              <span className="text-slate-300">→</span>
              <span className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-600">
                2
              </span>
              <span className="text-purple-600">Edit & Remove BG</span>
              <span className="text-slate-300">→</span>
              <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                3
              </span>
              <span className="text-blue-600 font-medium">Upload</span>
            </div>

            {/* Resolution hint */}
            <div className="flex items-center gap-2">
              <div
                className="border-2 border-blue-300 rounded bg-blue-50 flex items-center justify-center"
                style={{ width: 58, height: 32 }}
              >
                <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="text-left">
                <p className="text-xs font-medium text-slate-600">
                  480×260px output
                </p>
                <p className="text-xs text-slate-400">
                  With BG removal & color picker
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {uploadError && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Upload Error</p>
              <p className="text-xs text-red-500 mt-0.5">{uploadError}</p>
            </div>
          </div>
        )}
      </div>
    </FormField>
  );
}

// ==================== PARTNERS PAGE ====================
interface PartnersPageProps {
  partners: any[];
  modalOpen: boolean;
  modalType: 'add' | 'edit';
  editingItem: any;
  deleteConfirm: { open: boolean; id: any; collection: string };
  openAddModal: () => void;
  openEditModal: (item: any) => void;
  setModalOpen: (v: boolean) => void;
  setEditingItem: (v: any) => void;
  setDeleteConfirm: (v: { open: boolean; id: any; collection: string }) => void;
  handleAdd: (collection: string, item: any) => void;
  handleEdit: (collection: string, id: any, item: any) => void;
  handleDelete: (collection: string, id: any) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function PartnersPage({
  partners, modalOpen, modalType, editingItem, deleteConfirm,
  openAddModal, openEditModal, setModalOpen, setEditingItem,
  setDeleteConfirm, handleAdd, handleEdit, handleDelete, showToast,
}: PartnersPageProps) {
  const [form, setForm] = useState({
    name: '',
    logo: '',
  });

  const [originalImg, setOriginalImg] = useState('');

  useEffect(() => {
    if (modalOpen && editingItem) {
      setForm({
        name: editingItem.name || '',
        logo: editingItem.logo || '',
      });
      setOriginalImg(editingItem.logo || '');
    } else if (modalOpen && !editingItem) {
      setForm({ name: '', logo: '' });
      setOriginalImg('');
    }
  }, [modalOpen, editingItem]);

  const handleFormSubmit = (onSave: (data: any) => void) => {
    onSave(form);
  };

  const isFormValid = form.name.trim() && form.logo;

  return (
    <GenericListPage
      title="Partners"
      collection="partners"
      items={partners}
      modalOpen={modalOpen}
      modalType={modalType}
      editingItem={editingItem}
      deleteConfirm={deleteConfirm}
      openAddModal={openAddModal}
      setModalOpen={setModalOpen}
      setEditingItem={setEditingItem}
      setDeleteConfirm={setDeleteConfirm}
      handleAdd={handleAdd}
      handleEdit={handleEdit}
      handleDelete={handleDelete}
      renderItem={(partner) => (
        <div
          key={partner.id}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-12 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center"
                style={{
                  background:
                    'repeating-conic-gradient(#f8fafc 0% 25%, #fff 0% 50%) 50% / 8px 8px',
                }}
              >
                {partner.logo ? (
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="w-full h-full object-contain p-1"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://picsum.photos/80/60';
                    }}
                  />
                ) : (
                  <ImageIcon className="w-5 h-5 text-slate-300" />
                )}
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-800">
                  {partner.name}
                </h4>
                <p className="text-xs text-slate-400">Partner Logo · 480×260px</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => openEditModal(partner)}
                className="p-2 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-xl transition"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setDeleteConfirm({
                    open: true,
                    id: partner.id,
                    collection: 'partners',
                  })
                }
                className="p-2 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-xl transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      renderForm={(_item, onSave) => (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleFormSubmit(onSave);
          }}
          className="space-y-4"
        >
          <FormInput
            label="Company Name"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            placeholder="e.g. Adani Group, Reliance Industries"
            required
          />

          <LogoUploader
            value={form.logo}
            onChange={(url) => setForm((prev) => ({ ...prev, logo: url }))}
            label="Partner Logo (480×260px · BG Remover Included)"
            required
            showToast={showToast}
            previousCloudinaryUrl={originalImg}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setModalOpen(false);
                setEditingItem(null);
              }}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {modalType === 'add' ? 'Add Partner' : 'Update Partner'}
            </button>
          </div>
        </form>
      )}
    />
  );
}