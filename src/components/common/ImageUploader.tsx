import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Upload, X, CheckCircle2, Loader2,
  ZoomIn, ZoomOut, RotateCcw, Move, ImageIcon,
} from 'lucide-react';
import { uploadApi, UploadFolder } from '../../services/api';
import { FormField } from './FormHelpers';

// ==================== TYPES ====================
export interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder: UploadFolder;
  label?: string;
  required?: boolean;
  outputWidth?: number;
  outputHeight?: number;
  aspectRatio?: number;
  previewWidth?: number;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  previousCloudinaryUrl?: string;
  // ✅ NEW — circular crop support
  circular?: boolean;
}

interface CropState {
  x: number;
  y: number;
  scale: number;
}

// ==================== LOADING OVERLAY ====================
export function InlineLoader({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-sm mx-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <div className="text-center">
          <p className="text-slate-800 font-semibold">{message}</p>
          <p className="text-slate-500 text-sm mt-1">This may take a moment...</p>
        </div>
      </div>
    </div>
  );
}

// ==================== IMAGE CROPPER ====================
function ImageCropper({
  src,
  outputWidth,
  outputHeight,
  previewWidth,
  previewHeight,
  onCropDone,
  onCancel,
  circular = false,
}: {
  src: string;
  outputWidth: number;
  outputHeight: number;
  previewWidth: number;
  previewHeight: number;
  onCropDone: (blob: Blob) => void;
  onCancel: () => void;
  circular?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const [crop, setCrop] = useState<CropState>({ x: 0, y: 0, scale: 1 });
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [isReady, setIsReady] = useState(false);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
      const scaleX = previewWidth / img.naturalWidth;
      const scaleY = previewHeight / img.naturalHeight;
      const initialScale = Math.max(scaleX, scaleY);
      const scaledW = img.naturalWidth * initialScale;
      const scaledH = img.naturalHeight * initialScale;
      setCrop({
        x: (previewWidth - scaledW) / 2,
        y: (previewHeight - scaledH) / 2,
        scale: initialScale,
      });
      setIsReady(true);
    };
    img.onerror = () => console.error('Failed to load image');
    img.src = src;
  }, [src, previewWidth, previewHeight]);

  
const draw = useCallback(() => {
  const canvas = canvasRef.current;
  const img = imageRef.current;
  if (!canvas || !img) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, previewWidth, previewHeight);

  if (circular) {
    const cx = previewWidth / 2;
    const cy = previewHeight / 2;
    const radius = Math.min(previewWidth, previewHeight) / 2;

    // Clip to circle, draw image, then restore
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Draw image within circular clip
    ctx.drawImage(
      img,
      crop.x, crop.y,
      img.naturalWidth * crop.scale,
      img.naturalHeight * crop.scale
    );
    ctx.restore();

    // Circle border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 1, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshair guides
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx, cy + radius);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - radius, cy);
    ctx.lineTo(cx + radius, cy);
    ctx.stroke();
    ctx.setLineDash([]);
  } else {
    // Original rectangular drawing
    ctx.drawImage(
      img,
      crop.x, crop.y,
      img.naturalWidth * crop.scale,
      img.naturalHeight * crop.scale
    );

    // Rule of thirds
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo((previewWidth / 3) * i, 0);
      ctx.lineTo((previewWidth / 3) * i, previewHeight);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, (previewHeight / 3) * i);
      ctx.lineTo(previewWidth, (previewHeight / 3) * i);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, previewWidth - 2, previewHeight - 2);
  }
}, [crop, previewWidth, previewHeight, circular]);

  useEffect(() => {
    if (isReady) draw();
  }, [crop, isReady, draw]);

  // Clamp
  const clampCrop = useCallback(
    (x: number, y: number, scale: number) => {
      if (!imageRef.current) return { x, y };
      const sw = imageRef.current.naturalWidth * scale;
      const sh = imageRef.current.naturalHeight * scale;
      return {
        x: Math.min(0, Math.max(previewWidth - sw, x)),
        y: Math.min(0, Math.max(previewHeight - sh, y)),
      };
    },
    [previewWidth, previewHeight]
  );

  // Mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      lastPos.current = { x: e.clientX, y: e.clientY };
      setCrop((prev) => ({
        ...prev,
        ...clampCrop(prev.x + dx, prev.y + dy, prev.scale),
      }));
    },
    [clampCrop]
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Touch
  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    lastPos.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging.current) return;
      const dx = e.touches[0].clientX - lastPos.current.x;
      const dy = e.touches[0].clientY - lastPos.current.y;
      lastPos.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      setCrop((prev) => ({
        ...prev,
        ...clampCrop(prev.x + dx, prev.y + dy, prev.scale),
      }));
    },
    [clampCrop]
  );

  // Wheel zoom
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setCrop((prev) => {
        const img = imageRef.current;
        if (!img) return prev;
        const minScale = Math.max(
          previewWidth / img.naturalWidth,
          previewHeight / img.naturalHeight
        );
        const newScale = Math.max(minScale, Math.min(5, prev.scale + delta));
        const r = newScale / prev.scale;
        const cx = previewWidth / 2;
        const cy = previewHeight / 2;
        return {
          scale: newScale,
          ...clampCrop(
            cx - (cx - prev.x) * r,
            cy - (cy - prev.y) * r,
            newScale
          ),
        };
      });
    },
    [clampCrop, previewWidth, previewHeight]
  );

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);
    const canvas = canvasRef.current;
    if (canvas)
      canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
      if (canvas) canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleWheel]);

  const handleZoom = (delta: number) => {
    setCrop((prev) => {
      const img = imageRef.current;
      if (!img) return prev;
      const minScale = Math.max(
        previewWidth / img.naturalWidth,
        previewHeight / img.naturalHeight
      );
      const newScale = Math.max(minScale, Math.min(5, prev.scale + delta));
      const r = newScale / prev.scale;
      const cx = previewWidth / 2;
      const cy = previewHeight / 2;
      return {
        scale: newScale,
        ...clampCrop(
          cx - (cx - prev.x) * r,
          cy - (cy - prev.y) * r,
          newScale
        ),
      };
    });
  };

  const handleReset = () => {
    const img = imageRef.current;
    if (!img) return;
    const s = Math.max(
      previewWidth / img.naturalWidth,
      previewHeight / img.naturalHeight
    );
    setCrop({
      x: (previewWidth - img.naturalWidth * s) / 2,
      y: (previewHeight - img.naturalHeight * s) / 2,
      scale: s,
    });
  };

  // ✅ Export — handles both rectangular and circular
  const handleDone = () => {
    const img = imageRef.current;
    if (!img) return;
    const c = document.createElement('canvas');
    c.width = outputWidth;
    c.height = outputHeight;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    const s = outputWidth / previewWidth;

    if (circular) {
      // ✅ Circular export — clip to circle, transparent outside
      const centerX = outputWidth / 2;
      const centerY = outputHeight / 2;
      const radius = Math.min(outputWidth, outputHeight) / 2;

      // Clip to circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // Draw image within clip
      ctx.drawImage(
        img,
        crop.x * s,
        crop.y * s,
        img.naturalWidth * crop.scale * s,
        img.naturalHeight * crop.scale * s
      );

      // Export as PNG for transparency
      c.toBlob(
        (blob) => {
          if (blob) onCropDone(blob);
        },
        'image/png',
        1.0
      );
    } else {
      // ✅ Rectangular export — original behavior
      ctx.drawImage(
        img,
        crop.x * s,
        crop.y * s,
        img.naturalWidth * crop.scale * s,
        img.naturalHeight * crop.scale * s
      );
      c.toBlob(
        (blob) => {
          if (blob) onCropDone(blob);
        },
        'image/jpeg',
        0.92
      );
    }
  };

  const aspectLabel = circular
    ? `${outputWidth}×${outputHeight}px (Circle)`
    : `${outputWidth}×${outputHeight}px`;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-slate-700">
          {circular ? 'Position Face Inside Circle' : 'Position & Crop Image'}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          Drag to pan • Scroll to zoom • Output: {aspectLabel}
        </p>
        {imgSize.w > 0 && (
          <p className="text-xs text-slate-400">
            Source: {imgSize.w}×{imgSize.h}px
          </p>
        )}
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className={`relative overflow-hidden border-2 border-blue-200 shadow-inner bg-slate-900 ${
          circular ? 'rounded-full' : 'rounded-2xl'
        }`}
        style={{
          width: previewWidth,
          height: previewHeight,
          maxWidth: '100%',
          margin: circular ? '0 auto' : undefined,
        }}
      >
        <canvas
          ref={canvasRef}
          width={previewWidth}
          height={previewHeight}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className={`block cursor-grab active:cursor-grabbing ${
            circular ? 'rounded-full' : ''
          }`}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}
        {!circular && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded-lg font-medium">
            {aspectLabel}
          </div>
        )}
        <div
          className={`absolute flex items-center gap-1.5 px-3 py-1.5 bg-black/50 text-white text-xs rounded-full ${
            circular
              ? 'bottom-4 left-1/2 -translate-x-1/2'
              : 'bottom-2 left-1/2 -translate-x-1/2'
          }`}
        >
          <Move className="w-3 h-3" />{' '}
          {circular ? 'Drag to center face' : 'Drag to reposition'}
        </div>
      </div>

      {/* ✅ Circular info badge below canvas */}
      {circular && (
        <div className="flex justify-center">
          <span className="px-3 py-1 bg-purple-50 text-purple-600 text-xs font-medium rounded-full border border-purple-200">
            🔵 Circular crop — transparent outside circle
          </span>
        </div>
      )}

      {/* Zoom controls */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => handleZoom(-0.1)}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="flex-1 flex items-center gap-3">
          <span className="text-xs text-slate-400 w-6">
            {imgSize.w > 0
              ? `${Math.round(
                  Math.max(
                    previewWidth / imgSize.w,
                    previewHeight / imgSize.h
                  ) * 100
                )}%`
              : '—'}
          </span>
          <input
            type="range"
            min={50}
            max={500}
            step={1}
            value={Math.round(crop.scale * 100)}
            onChange={(e) => {
              const ns = Number(e.target.value) / 100;
              const img = imageRef.current;
              if (!img) return;
              const ms = Math.max(
                previewWidth / img.naturalWidth,
                previewHeight / img.naturalHeight
              );
              const cs = Math.max(ms, ns);
              const r = cs / crop.scale;
              const cx = previewWidth / 2;
              const cy = previewHeight / 2;
              setCrop({
                scale: cs,
                ...clampCrop(
                  cx - (cx - crop.x) * r,
                  cy - (cy - crop.y) * r,
                  cs
                ),
              });
            }}
            className="flex-1 accent-blue-600"
          />
          <span className="text-xs text-slate-500 w-10 text-right">
            {Math.round(crop.scale * 100)}%
          </span>
        </div>
        <button
          type="button"
          onClick={() => handleZoom(0.1)}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Actions */}
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
          disabled={!isReady}
          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Upload & Use This Crop
        </button>
      </div>
    </div>
  );
}

// ==================== MAIN IMAGE UPLOADER ====================
export function ImageUploader({
  value,
  onChange,
  folder,
  label = 'Image',
  required = false,
  outputWidth = 1200,
  outputHeight = 800,
  aspectRatio,
  previewWidth = 560,
  showToast,
  previousCloudinaryUrl,
  circular = false,
}: ImageUploaderProps) {
  // ✅ Circular forces 1:1
  const effectiveOutputWidth = circular ? Math.min(outputWidth, outputHeight) : outputWidth;
  const effectiveOutputHeight = circular ? Math.min(outputWidth, outputHeight) : outputHeight;
  const computedAspect = circular ? 1 : (aspectRatio ?? outputWidth / outputHeight);
  const previewHeight = Math.round(previewWidth / computedAspect);

  // ✅ For circular, limit preview size to keep it reasonable
  const effectivePreviewWidth = circular ? Math.min(previewWidth, 320) : previewWidth;
  const effectivePreviewHeight = circular ? effectivePreviewWidth : previewHeight;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rawSrc, setRawSrc] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
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
      setUploadError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setUploadError('File size must be less than 20MB.');
      return;
    }
    setUploadError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      setRawSrc(ev.target?.result as string);
      setShowCropper(true);
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

  const handleCropDone = async (croppedBlob: Blob) => {
    setShowCropper(false);
    setRawSrc(null);
    setUploading(true);
    setUploadProgress(0);
    setUploadError('');

    const urlToDelete = value || previousCloudinaryUrl;
    if (urlToDelete && urlToDelete.includes('cloudinary.com')) {
      showToast('Removing old image from Cloudinary...', 'info');
      await deleteFromCloudinary(urlToDelete);
    }

    // ✅ Use .png extension for circular (transparent background)
    const ext = circular ? 'png' : 'jpg';
    const mimeType = circular ? 'image/png' : 'image/jpeg';
    const fileName = `${folder}-${Date.now()}.${ext}`;
    const file = new File([croppedBlob], fileName, { type: mimeType });

    const result = await uploadApi.upload(file, folder, (percent) => {
      setUploadProgress(percent);
    });

    setUploading(false);
    setUploadProgress(0);

    if (result.success && result.data?.url) {
      onChange(result.data.url);
      showToast('Image uploaded to Cloudinary successfully!', 'success');
    } else {
      setUploadError(result.message || 'Upload failed. Please try again.');
      showToast('Image upload failed. Please try again.', 'error');
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setRawSrc(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = async () => {
    const urlToDelete = value || previousCloudinaryUrl;
    if (urlToDelete && urlToDelete.includes('cloudinary.com')) {
      const deleted = await deleteFromCloudinary(urlToDelete);
      if (deleted) {
        showToast('Image removed from Cloudinary', 'success');
      } else {
        showToast('Failed to remove image from Cloudinary', 'error');
      }
    }
    onChange('');
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const aspectLabel = circular
    ? `${effectiveOutputWidth}×${effectiveOutputHeight}px (Circle)`
    : `${effectiveOutputWidth}×${effectiveOutputHeight}px`;
  const ratioLabel = (() => {
    if (circular) return '1:1';
    const gcd = (a: number, b: number): number =>
      b === 0 ? a : gcd(b, a % b);
    const g = gcd(effectiveOutputWidth, effectiveOutputHeight);
    return `${effectiveOutputWidth / g}:${effectiveOutputHeight / g}`;
  })();

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

        {isDeleting && (
          <InlineLoader message="Removing image from Cloudinary..." />
        )}

        {/* Cropper */}
        {showCropper && rawSrc && (
          <ImageCropper
            src={rawSrc}
            outputWidth={effectiveOutputWidth}
            outputHeight={effectiveOutputHeight}
            previewWidth={effectivePreviewWidth}
            previewHeight={effectivePreviewHeight}
            onCropDone={handleCropDone}
            onCancel={handleCropCancel}
            circular={circular}
          />
        )}

        {/* Uploading progress */}
        {!showCropper && uploading && (
          <div className="p-6 border-2 border-blue-200 rounded-2xl bg-blue-50">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-16 h-16">
                <svg
                  className="w-16 h-16 -rotate-90"
                  viewBox="0 0 64 64"
                >
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="6"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${
                      2 * Math.PI * 28 * (1 - uploadProgress / 100)
                    }`}
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
                    Uploading to Cloudinary...
                  </p>
                </div>
                <p className="text-xs text-blue-500">
                  {uploadProgress < 100 ? 'Please wait...' : 'Processing...'}
                </p>
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

        {/* Preview — image ready */}
        {!showCropper && !uploading && value && (
          <div className="space-y-3">
            <div
              className={`relative overflow-hidden border-2 border-emerald-200 bg-slate-100 ${
                circular ? 'rounded-full mx-auto' : 'rounded-2xl'
              }`}
              style={
                circular
                  ? {
                      width: effectivePreviewWidth,
                      height: effectivePreviewWidth,
                    }
                  : {}
              }
            >
              <img
                src={value}
                alt="Uploaded"
                className={`w-full object-cover ${
                  circular ? 'h-full rounded-full' : ''
                }`}
                style={
                  circular
                    ? {}
                    : {
                        aspectRatio: `${effectiveOutputWidth}/${effectiveOutputHeight}`,
                      }
                }
                onError={() =>
                  setUploadError('Failed to load image preview.')
                }
              />
              {!circular && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 text-xs font-semibold">
                          Uploaded to Cloudinary
                        </span>
                      </div>
                      <p className="text-white/60 text-xs">
                        {aspectLabel} · {ratioLabel}
                      </p>
                    </div>
                    <a
                      href={value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 bg-black/50 hover:bg-black/70 text-white text-xs rounded-lg transition"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View ↗
                    </a>
                  </div>
                </>
              )}
            </div>

            {/* ✅ Circular success info below the circle */}
            {circular && (
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 text-xs font-semibold">
                    Uploaded to Cloudinary
                  </span>
                </div>
                <p className="text-slate-400 text-xs">
                  {aspectLabel} · {ratioLabel} · Circular PNG
                </p>
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs rounded-lg transition mt-1"
                >
                  View full image ↗
                </a>
              </div>
            )}

            {/* URL display */}
            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 mb-0.5">
                  Cloudinary URL
                </p>
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
                  showToast('URL copied to clipboard!', 'info');
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
                <Upload className="w-4 h-4" /> Replace Image
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={isDeleting}
                className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete from Cloudinary"
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
        {!showCropper && !uploading && !value && (
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
              className={`w-16 h-16 flex items-center justify-center transition ${
                circular ? 'rounded-full' : 'rounded-2xl'
              } ${isDragging ? 'bg-blue-200' : 'bg-slate-100'}`}
            >
              <Upload
                className={`w-8 h-8 transition ${
                  isDragging ? 'text-blue-600' : 'text-slate-400'
                }`}
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700">
                {isDragging ? 'Drop image here' : `Upload ${label}`}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Click to browse or drag & drop
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                PNG, JPG, WEBP · Max 20MB
              </p>
            </div>

            {/* Flow hint */}
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
              <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 flex-shrink-0">
                1
              </span>
              <span>Select</span>
              <span className="text-slate-300">→</span>
              <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 flex-shrink-0">
                2
              </span>
              <span>{circular ? 'Circle Crop' : 'Crop'}</span>
              <span className="text-slate-300">→</span>
              <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600 flex-shrink-0">
                3
              </span>
              <span className="text-blue-600 font-medium">Auto-upload</span>
            </div>

            {/* Resolution hint */}
            <div className="flex items-center gap-2">
              <div
                className={`border-2 border-blue-300 bg-blue-50 flex items-center justify-center p-1 ${
                  circular ? 'rounded-full w-14 h-14' : 'rounded'
                }`}
                style={
                  circular
                    ? {}
                    : {
                        width: 56,
                        height: Math.round(56 / computedAspect),
                      }
                }
              >
                <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="text-left">
                <p className="text-xs font-medium text-slate-600">
                  {circular ? '1:1 Circle' : `${ratioLabel} ratio`}
                </p>
                <p className="text-xs text-slate-400">
                  Output: {aspectLabel}
                </p>
                {circular && (
                  <p className="text-xs text-purple-500">
                    Transparent PNG outside circle
                  </p>
                )}
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