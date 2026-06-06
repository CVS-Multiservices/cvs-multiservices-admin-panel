import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Edit, Trash2, Save, Plus, X, Sparkles, AlertTriangle,
  Upload, Loader2, ZoomIn, ZoomOut, RotateCcw,
  Eraser, RefreshCw, MapPin, IndianRupee, Users2, Briefcase,
  Building2, Newspaper
} from 'lucide-react';
import { GenericListPage } from '../generic/GenericListPage';
import { FormInput, FormTextarea, FormField } from '../common/FormHelpers';
import { uploadApi } from '../../services/api';
import { InlineLoader } from '../common/ImageUploader';


const DEPARTMENTS = [
  { id: 'engineering', name: 'Engineering' },
  { id: 'operations', name: 'Operations' },
  { id: 'technical', name: 'Technical' },
  { id: 'it', name: 'IT & Software' },
  { id: 'sales', name: 'Sales & Marketing' },
  { id: 'finance', name: 'Finance & Accounts' },
  { id: 'hr', name: 'Human Resources' },
  { id: 'hse', name: 'HSE (Health, Safety & Environment)' },
  { id: 'admin', name: 'Administration' },
  { id: 'logistics', name: 'Logistics & Supply Chain' },
  { id: 'legal', name: 'Legal & Compliance' },
  { id: 'management', name: 'Management' },
];

const EMPLOYMENT_TYPES = [
  { id: 'full-time', name: 'Full Time' },
  { id: 'part-time', name: 'Part Time' },
  { id: 'contract', name: 'Contract' },
  { id: 'internship', name: 'Internship' },
  { id: 'freelance', name: 'Freelance' },
  { id: 'temporary', name: 'Temporary' },
];

const EXPERIENCE_LEVELS = [
  { id: 'fresher', name: 'Fresher (0 yrs)' },
  { id: 'junior', name: 'Junior (1-3 yrs)' },
  { id: 'mid', name: 'Mid-Level (3-5 yrs)' },
  { id: 'senior', name: 'Senior (5-10 yrs)' },
  { id: 'lead', name: 'Lead (10+ yrs)' },
  { id: 'director', name: 'Director (15+ yrs)' },
];

const CURRENCIES = [
  { id: 'INR', name: '₹ INR' },
  { id: 'USD', name: '$ USD' },
  { id: 'EUR', name: '€ EUR' },
  { id: 'GBP', name: '£ GBP' },
];

// ==================== CHIP INPUT ====================
function ChipInput({
  value,
  onChange,
  label,
  placeholder,
  color = 'blue',
}: {
  value: string[];
  onChange: (items: string[]) => void;
  label: string;
  placeholder?: string;
  color?: 'blue' | 'emerald' | 'amber' | 'purple';
}) {
  const [inputVal, setInputVal] = useState('');

  const colorMap = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-700', hover: 'hover:text-blue-900' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', hover: 'hover:text-emerald-900' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-700', hover: 'hover:text-amber-900' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-700', hover: 'hover:text-purple-900' },
  };
  const c = colorMap[color];

  const addItems = (raw: string) => {
    const items = raw
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !value.includes(s));
    if (items.length > 0) onChange([...value, ...items]);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); addItems(inputVal); }
    if (e.key === ',') { e.preventDefault(); addItems(inputVal); }
    if (e.key === 'Backspace' && inputVal === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <FormField label={label}>
      <div className="space-y-2">
        {value.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl min-h-[44px]">
            {value.map((item, index) => (
              <span
                key={index}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${c.bg} ${c.text} text-xs font-medium rounded-lg`}
              >
                {item}
                <button
                  type="button"
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                  className={`${c.hover} transition`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => { if (inputVal.trim()) addItems(inputVal); }}
            placeholder={placeholder || `Add ${label.toLowerCase()}...`}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          <button
            type="button"
            onClick={() => { if (inputVal.trim()) addItems(inputVal); }}
            className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-400">
          Press{' '}
          <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">Enter</kbd>
          {' '}or{' '}
          <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">,</kbd>
          {' '}to add • Backspace removes last
        </p>
      </div>
    </FormField>
  );
}

// ==================== ID/NAME DROPDOWN ====================
function IdNameSelect({
  label,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string;
  value: { id: string; name: string };
  onChange: (val: { id: string; name: string }) => void;
  options: { id: string; name: string }[];
  required?: boolean;
}) {
  return (
    <FormField label={label} required={required}>
      <select
        value={value.id}
        onChange={(e) => {
          const selected = options.find((o) => o.id === e.target.value);
          if (selected) onChange({ id: selected.id, name: selected.name });
        }}
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none"
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>
    </FormField>
  );
}

// ==================== BG COLORS ====================
const BG_COLORS = [
  { label: 'White', value: '#FFFFFF' },
  { label: 'Light Gray', value: '#F8FAFC' },
  { label: 'Snow', value: '#F1F5F9' },
  { label: 'Cream', value: '#FFFBEB' },
  { label: 'Light Blue', value: '#EFF6FF' },
  { label: 'Light Green', value: '#F0FDF4' },
  { label: 'Dark Navy', value: '#0F172A' },
  { label: 'Black', value: '#000000' },
  { label: 'Transparent', value: 'transparent' },
];

// ==================== BG REMOVAL ====================
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

  const samplePoints = [
    [0, 0], [canvas.width - 1, 0], [0, canvas.height - 1],
    [canvas.width - 1, canvas.height - 1],
    [Math.floor(canvas.width / 2), 0], [0, Math.floor(canvas.height / 2)],
    [canvas.width - 1, Math.floor(canvas.height / 2)],
    [Math.floor(canvas.width / 2), canvas.height - 1],
  ];
  const corners = samplePoints.map(([x, y]) => {
    const idx = (y * canvas.width + x) * 4;
    return [data[idx], data[idx + 1], data[idx + 2]];
  });

  let bgR: number, bgG: number, bgB: number;
  if (mode === 'white') { bgR = bgG = bgB = 255; }
  else {
    bgR = Math.round(corners.reduce((s, p) => s + p[0], 0) / corners.length);
    bgG = Math.round(corners.reduce((s, p) => s + p[1], 0) / corners.length);
    bgB = Math.round(corners.reduce((s, p) => s + p[2], 0) / corners.length);
  }

  for (let i = 0; i < data.length; i += 4) {
    const dist = Math.sqrt(
      (data[i] - bgR) ** 2 + (data[i + 1] - bgG) ** 2 + (data[i + 2] - bgB) ** 2
    );
    if (dist < threshold) data[i + 3] = 0;
  }

  const smoothed = new Uint8ClampedArray(data.length);
  smoothed.set(data);
  for (let y = 1; y < canvas.height - 1; y++) {
    for (let x = 1; x < canvas.width - 1; x++) {
      const idx = (y * canvas.width + x) * 4;
      if (data[idx + 3] > 0) {
        let tp = 0, op = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nIdx = ((y + dy) * canvas.width + (x + dx)) * 4;
            data[nIdx + 3] === 0 ? tp++ : op++;
          }
        }
        if (tp > 0 && op > 0) {
          smoothed[idx + 3] = Math.round(data[idx + 3] * (op / (tp + op)));
        }
      }
    }
  }
  return new ImageData(smoothed, canvas.width, canvas.height);
}

function getContentBounds(imageData: ImageData) {
  const { data, width, height } = imageData;
  let top = height, left = width, right = 0, bottom = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 10) {
        if (y < top) top = y;
        if (y > bottom) bottom = y;
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
  }
  return { top, left, right, bottom };
}

// ==================== COMPACT LOGO EDITOR ====================
function CompanyLogoEditor({
  src,
  onDone,
  onCancel,
  showToast,
}: {
  src: string;
  onDone: (blob: Blob) => void;
  onCancel: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}) {
  const W = 128, H = 128;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const procCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bgRemoved, setBgRemoved] = useState(false);
  const [threshold, setThreshold] = useState(30);
  const [removeMode, setRemoveMode] = useState<'auto' | 'white'>('auto');
  const [padding, setPadding] = useState(20);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [contentBounds, setContentBounds] = useState<any>(null);

  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { imageRef.current = img; setImgLoaded(true); fitImage(img); };
    img.onerror = () => showToast('Failed to load image', 'error');
    img.src = src;
  }, [src]);

  const fitImage = (img: HTMLImageElement, pad?: number) => {
    const p = pad ?? padding;
    const s = Math.min((W - p * 2) / img.naturalWidth, (H - p * 2) / img.naturalHeight, 1);
    setScale(s);
    setPosition({ x: (W - img.naturalWidth * s) / 2, y: (H - img.naturalHeight * s) / 2 });
  };

  const centerContent = useCallback((bounds: any, pad?: number) => {
    const p = pad ?? padding;
    const cw = bounds.right - bounds.left + 1;
    const ch = bounds.bottom - bounds.top + 1;
    if (cw <= 0 || ch <= 0) return;
    const s = Math.min((W - p * 2) / cw, (H - p * 2) / ch, 1);
    setScale(s);
    setPosition({ x: (W - cw * s) / 2 - bounds.left * s, y: (H - ch * s) / 2 - bounds.top * s });
  }, [padding]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, W, H);
    if (bgColor === 'transparent') {
      for (let y = 0; y < H; y += 10)
        for (let x = 0; x < W; x += 10) {
          ctx.fillStyle = (Math.floor(x / 10) + Math.floor(y / 10)) % 2 === 0 ? '#e2e8f0' : '#fff';
          ctx.fillRect(x, y, 10, 10);
        }
    } else { ctx.fillStyle = bgColor; ctx.fillRect(0, 0, W, H); }

    if (bgRemoved && procCanvasRef.current) {
      const pc = procCanvasRef.current;
      ctx.drawImage(pc, position.x, position.y, pc.width * scale, pc.height * scale);
    } else if (imageRef.current) {
      const img = imageRef.current;
      ctx.drawImage(img, position.x, position.y, img.naturalWidth * scale, img.naturalHeight * scale);
    }
  }, [bgColor, bgRemoved, scale, position]);

  useEffect(() => { if (imgLoaded) draw(); }, [imgLoaded, draw]);

  const onMouseDown = (e: React.MouseEvent) => { isDragging.current = true; lastPos.current = { x: e.clientX, y: e.clientY }; e.preventDefault(); };
  const onTouchStart = (e: React.TouchEvent) => { isDragging.current = true; lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return;
    setPosition(p => ({ x: p.x + e.clientX - lastPos.current.x, y: p.y + e.clientY - lastPos.current.y }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, []);
  const onMouseUp = useCallback(() => { isDragging.current = false; }, []);
  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging.current) return;
    setPosition(p => ({ x: p.x + e.touches[0].clientX - lastPos.current.x, y: p.y + e.touches[0].clientY - lastPos.current.y }));
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);
  const onWheel = useCallback((e: WheelEvent) => { e.preventDefault(); setScale(s => Math.max(0.05, Math.min(3, s + (e.deltaY > 0 ? -0.02 : 0.02)))); }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onMouseUp);
    const c = canvasRef.current;
    if (c) c.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);
      if (c) c.removeEventListener('wheel', onWheel);
    };
  }, [onMouseMove, onMouseUp, onTouchMove, onWheel]);

  const handleRemoveBg = async () => {
    if (!imageRef.current) return;
    setIsProcessing(true);
    showToast('Removing background...', 'info');
    await new Promise(r => setTimeout(r, 50));
    try {
      const processed = removeBackground(imageRef.current, threshold, removeMode);
      const pc = document.createElement('canvas');
      pc.width = processed.width; pc.height = processed.height;
      pc.getContext('2d')!.putImageData(processed, 0, 0);
      procCanvasRef.current = pc;
      const bounds = getContentBounds(processed);
      setContentBounds({ ...bounds, width: bounds.right - bounds.left + 1, height: bounds.bottom - bounds.top + 1 });
      centerContent(bounds);
      setBgRemoved(true);
      showToast('Background removed & centered!', 'success');
    } catch { showToast('Background removal failed', 'error'); }
    finally { setIsProcessing(false); }
  };

  const handleRestore = () => {
    setBgRemoved(false); procCanvasRef.current = null; setContentBounds(null);
    if (imageRef.current) fitImage(imageRef.current);
    showToast('Original restored', 'info');
  };

  useEffect(() => { if (bgRemoved && contentBounds) centerContent(contentBounds); }, [bgColor]);

  const handleDone = () => {
    const ec = document.createElement('canvas'); ec.width = W; ec.height = H;
    const ctx = ec.getContext('2d')!;
    if (bgColor === 'transparent') ctx.clearRect(0, 0, W, H);
    else { ctx.fillStyle = bgColor; ctx.fillRect(0, 0, W, H); }
    if (bgRemoved && procCanvasRef.current) {
      ctx.drawImage(procCanvasRef.current, position.x, position.y, procCanvasRef.current.width * scale, procCanvasRef.current.height * scale);
    } else if (imageRef.current) {
      const img = imageRef.current;
      ctx.drawImage(img, position.x, position.y, img.naturalWidth * scale, img.naturalHeight * scale);
    }
    ec.toBlob(b => { if (b) onDone(b); }, bgColor === 'transparent' ? 'image/png' : 'image/jpeg', 0.95);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">128×128px · Drag to position · Scroll to zoom</p>

      <div className="flex justify-center">
        <div className="relative rounded-xl overflow-hidden border-2 border-blue-200 shadow-inner" style={{ width: W, maxWidth: '100%' }}>
          <canvas ref={canvasRef} width={W} height={H} onMouseDown={onMouseDown} onTouchStart={onTouchStart}
            className="block cursor-grab active:cursor-grabbing" style={{ width: '100%', height: 'auto' }} />
          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          )}
          {bgRemoved && (
            <div className="absolute top-1.5 right-1.5 px-2 py-0.5 bg-emerald-500/90 text-white text-[10px] rounded-md flex items-center gap-1">
              <Eraser className="w-2.5 h-2.5" /> Centered
            </div>
          )}
        </div>
      </div>

      {/* Zoom */}
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setScale(s => Math.max(0.05, s - 0.05))} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg"><ZoomOut className="w-3.5 h-3.5" /></button>
        <input type="range" min={5} max={300} value={Math.round(scale * 100)} onChange={e => setScale(Number(e.target.value) / 100)} className="flex-1 accent-blue-600" />
        <span className="text-xs text-slate-500 w-9 text-right">{Math.round(scale * 100)}%</span>
        <button type="button" onClick={() => setScale(s => Math.min(3, s + 0.05))} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg"><ZoomIn className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => bgRemoved && contentBounds ? centerContent(contentBounds) : imageRef.current && fitImage(imageRef.current)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg"><RotateCcw className="w-3.5 h-3.5" /></button>
      </div>

      {/* BG Color */}
      <div className="flex flex-wrap gap-1.5">
        {BG_COLORS.map(c => (
          <button key={c.value} type="button" onClick={() => setBgColor(c.value)}
            className={`w-7 h-7 rounded-lg border-2 transition ${bgColor === c.value ? 'border-blue-500 scale-110' : 'border-slate-200'}`}
            style={{ background: c.value === 'transparent' ? 'repeating-conic-gradient(#e2e8f0 0% 25%,#fff 0% 50%) 50%/8px 8px' : c.value }}
            title={c.label} />
        ))}
        <input type="color" value={bgColor === 'transparent' ? '#ffffff' : bgColor} onChange={e => setBgColor(e.target.value)}
          className="w-7 h-7 rounded-lg border border-slate-200 cursor-pointer" />
      </div>

      {/* Padding */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 w-12">Pad:</span>
        <input type="range" min={0} max={80} step={5} value={padding}
          onChange={e => { const p = Number(e.target.value); setPadding(p); bgRemoved && contentBounds ? centerContent(contentBounds, p) : imageRef.current && fitImage(imageRef.current, p); }}
          className="flex-1 accent-blue-600" />
        <span className="text-xs text-slate-500 w-8 text-right">{padding}px</span>
      </div>

      {/* BG Remover */}
      <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-2">
        <div className="flex items-center gap-2">
          <Eraser className="w-3.5 h-3.5 text-purple-600" />
          <span className="text-xs font-semibold text-purple-700">Background Remover</span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setRemoveMode('auto')}
            className={`px-2.5 py-1 text-xs rounded-lg ${removeMode === 'auto' ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
            Auto-detect
          </button>
          <button type="button" onClick={() => setRemoveMode('white')}
            className={`px-2.5 py-1 text-xs rounded-lg ${removeMode === 'white' ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
            White BG
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 w-16">Sensitivity:</span>
          <input type="range" min={5} max={100} value={threshold} onChange={e => setThreshold(Number(e.target.value))} className="flex-1 accent-purple-600" />
          <span className="text-xs text-purple-600 w-6 text-right">{threshold}</span>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={handleRemoveBg} disabled={isProcessing || !imgLoaded}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded-lg disabled:opacity-50">
            {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eraser className="w-3.5 h-3.5" />}
            {bgRemoved ? 'Re-process' : 'Remove BG'}
          </button>
          {bgRemoved && (
            <button type="button" onClick={handleRestore}
              className="px-3 py-2 bg-white border border-slate-200 text-slate-600 text-xs rounded-lg">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl">
          Cancel
        </button>
        <button type="button" onClick={handleDone} disabled={!imgLoaded || isProcessing}
          className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl disabled:opacity-50">
          Use This Logo
        </button>
      </div>
    </div>
  );
}

// ==================== COMPANY LOGO UPLOADER ====================
function CompanyLogoUploader({
  value,
  onChange,
  showToast,
  previousUrl,
}: {
  value: string;
  onChange: (url: string) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  previousUrl?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rawSrc, setRawSrc] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteCdn = async (url: string) => {
    if (!url?.includes('cloudinary.com')) return true;
    try { setIsDeleting(true); return (await uploadApi.delete(url)).success; }
    catch { return false; } finally { setIsDeleting(false); }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Select a valid image.'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('Max 10MB.'); return; }
    setError('');
    const r = new FileReader();
    r.onload = (e) => { setRawSrc(e.target?.result as string); setShowEditor(true); };
    r.readAsDataURL(file);
  };

  const handleDone = async (blob: Blob) => {
    setShowEditor(false); setRawSrc(null); setUploading(true); setProgress(0); setError('');
    const del = value || previousUrl;
    if (del?.includes('cloudinary.com')) { showToast('Removing old logo...', 'info'); await deleteCdn(del); }
    const ext = blob.type === 'image/png' ? 'png' : 'jpg';
    const file = new File([blob], `company-logo-${Date.now()}.${ext}`, { type: blob.type });
    const result = await uploadApi.upload(file, 'partners' as any, p => setProgress(p));
    setUploading(false); setProgress(0);
    if (result.success && result.data?.url) { onChange(result.data.url); showToast('Logo uploaded!', 'success'); }
    else { setError(result.message || 'Upload failed.'); showToast('Upload failed.', 'error'); }
  };

  const handleRemove = async () => {
    const del = value || previousUrl;
    if (del?.includes('cloudinary.com')) { const ok = await deleteCdn(del); showToast(ok ? 'Removed' : 'Failed', ok ? 'success' : 'error'); }
    onChange(''); setError('');
  };

  return (
    <FormField label="Company Logo (128×128px)">
      <div className="space-y-2">
        <input ref={fileRef} type="file" accept="image/*" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = ''; }} className="hidden" />
        {isDeleting && <InlineLoader message="Removing logo..." />}

        {showEditor && rawSrc && <CompanyLogoEditor src={rawSrc} onDone={handleDone} onCancel={() => { setShowEditor(false); setRawSrc(null); }} showToast={showToast} />}

        {!showEditor && uploading && (
          <div className="p-4 border-2 border-blue-200 rounded-xl bg-blue-50 flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <p className="text-sm text-blue-700 font-medium">Uploading... {progress}%</p>
            <div className="w-full h-2 bg-blue-200 rounded-full"><div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
          </div>
        )}

        {!showEditor && !uploading && value && (
          <div className="space-y-2">
            <div className="rounded-xl overflow-hidden border-2 border-emerald-200 bg-white" style={{ background: 'repeating-conic-gradient(#f8fafc 0% 25%,#fff 0% 50%) 50%/12px 12px' }}>
              <img src={value} alt="Logo" className="w-full object-contain" style={{ aspectRatio: '480/260' }} />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl">
                <Upload className="w-3.5 h-3.5" /> Replace
              </button>
              <button type="button" onClick={handleRemove} disabled={isDeleting} className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl disabled:opacity-50">
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        )}

        {!showEditor && !uploading && !value && (
          <div onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
            onDrop={e => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current?.click()}
            className={`flex flex-col items-center gap-3 p-6 border-2 border-dashed rounded-xl cursor-pointer transition ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'}`}>
            <Upload className={`w-6 h-6 ${isDragging ? 'text-blue-600' : 'text-slate-400'}`} />
            <div className="text-center">
              <p className="text-xs font-medium text-slate-600">Upload company logo</p>
              <p className="text-[10px] text-slate-400">PNG, JPG · Max 10MB · BG remover included</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">
            <X className="w-3.5 h-3.5" /> {error}
          </div>
        )}
      </div>
    </FormField>
  );
}

// ==================== SALARY FORMATTER ====================
function formatSalary(amount: number, currency: string): string {
  if (currency === 'INR') {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
    return `₹${amount}`;
  }
  return `${amount}`;
}

// ==================== MAIN COMPONENT ====================
interface JobsPageProps {
  jobListings: any[];
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

export function JobsPage({
  jobListings, modalOpen, modalType, editingItem, deleteConfirm,
  openAddModal, openEditModal, setModalOpen, setEditingItem,
  setDeleteConfirm, handleAdd, handleEdit, handleDelete, showToast,
}: JobsPageProps) {
  const [form, setForm] = useState({
    title: '',
    company: {
      id: 'cvs',
      name: 'CVS Multi Services Pvt. Ltd.',
      logo: '',
      industry: 'Industrial Services',
      isHiring: true,
    },
    department: { id: 'engineering', name: 'Engineering' },
    location: { id: '', name: '' },
    type: { id: 'full-time', name: 'Full Time' },
    experience: { id: 'mid', name: 'Mid-Level (3-5 yrs)' },
    salary: { min: 600000, max: 1000000, currency: 'INR' },
    postedDate: new Date().toISOString().split('T')[0],
    closingDate: '',
    isUrgent: false,
    isFeatured: false,
    description: '',
    responsibilities: [] as string[],
    requirements: [] as string[],
    benefits: [] as string[],
    skills: [] as string[],
    positionCount: 1,
  });

  const [originalLogo, setOriginalLogo] = useState('');

  useEffect(() => {
    if (modalOpen && editingItem) {
      setForm({
        title: editingItem.title || '',
        company: {
          id: editingItem.company?.id || 'cvs',
          name: editingItem.company?.name || 'CVS Multi Services Pvt. Ltd.',
          logo: editingItem.company?.logo || '',
          industry: editingItem.company?.industry || 'Industrial Services',
          isHiring: editingItem.company?.isHiring ?? true,
        },
        department: editingItem.department || { id: 'engineering', name: 'Engineering' },
        location: editingItem.location || { id: '', name: '' },
        type: editingItem.type || { id: 'full-time', name: 'Full Time' },
        experience: editingItem.experience || { id: 'mid', name: 'Mid-Level (3-5 yrs)' },
        salary: editingItem.salary || { min: 600000, max: 1000000, currency: 'INR' },
        postedDate: editingItem.postedDate ? new Date(editingItem.postedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        closingDate: editingItem.closingDate ? new Date(editingItem.closingDate).toISOString().split('T')[0] : '',
        isUrgent: editingItem.isUrgent || false,
        isFeatured: editingItem.isFeatured || false,
        description: editingItem.description || '',
        responsibilities: Array.isArray(editingItem.responsibilities) ? editingItem.responsibilities : [],
        requirements: Array.isArray(editingItem.requirements) ? editingItem.requirements : [],
        benefits: Array.isArray(editingItem.benefits) ? editingItem.benefits : [],
        skills: Array.isArray(editingItem.skills) ? editingItem.skills : [],
        positionCount: editingItem.positionCount || 1,
      });
      setOriginalLogo(editingItem.company?.logo || '');
    } else if (modalOpen && !editingItem) {
      setForm({
        title: '',
        company: { id: 'cvs', name: 'CVS Multi Services Pvt. Ltd.', logo: '', industry: 'Industrial Services', isHiring: true },
        department: { id: 'engineering', name: 'Engineering' },
        location: { id: '', name: '' },
        type: { id: 'full-time', name: 'Full Time' },
        experience: { id: 'mid', name: 'Mid-Level (3-5 yrs)' },
        salary: { min: 600000, max: 1000000, currency: 'INR' },
        postedDate: new Date().toISOString().split('T')[0],
        closingDate: '',
        isUrgent: false,
        isFeatured: false,
        description: '',
        responsibilities: [],
        requirements: [],
        benefits: [],
        skills: [],
        positionCount: 1,
      });
      setOriginalLogo('');
    }
  }, [modalOpen, editingItem]);

  const handleFormSubmit = (onSave: (data: any) => void) => {
    // Auto-generate location.id from name
    const locationId = form.location.name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    onSave({
      ...form,
      location: { ...form.location, id: locationId || form.location.id },
      company: {
        ...form.company,
        id: form.company.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').trim(),
      },
    });
  };

  const isFormValid =
    form.title.trim() &&
    form.company.name.trim() &&
    form.location.name.trim() &&
    form.description.trim();

  return (
    <GenericListPage
      title="Job Listings"
      collection="jobs"
      items={jobListings}
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
      renderItem={(job) => (
        <div key={job.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 hover:shadow-md transition">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
              {/* Company logo */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border border-slate-200 bg-white flex-shrink-0 flex items-center justify-center"
                style={{ background: 'repeating-conic-gradient(#f8fafc 0% 25%,#fff 0% 50%) 50%/8px 8px' }}>
                {job.company?.logo ? (
                  <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-contain p-1"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                {/* Badges */}
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                  {job.isUrgent && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] sm:text-xs font-medium rounded-full animate-pulse flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Urgent
                    </span>
                  )}
                  {job.isFeatured && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] sm:text-xs font-medium rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Featured
                    </span>
                  )}
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] sm:text-xs font-medium rounded-full">
                    {job.type?.name || job.type}
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] sm:text-xs font-medium rounded-full">
                    {job.experience?.name || job.experience}
                  </span>
                </div>

                <h4 className="text-base sm:text-lg font-bold text-slate-800 mb-0.5 truncate">
                  {job.title}
                </h4>

                <p className="text-xs sm:text-sm text-slate-500 mb-1">
                  {job.company?.name || 'Company'} · {job.department?.name || job.department}
                </p>

                <div className="flex items-center gap-2 sm:gap-4 flex-wrap text-xs sm:text-sm text-slate-500 mb-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
                    {job.location?.name || job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <IndianRupee className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
                    {formatSalary(job.salary?.min || 0, job.salary?.currency || 'INR')} - {formatSalary(job.salary?.max || 0, job.salary?.currency || 'INR')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
                    {job.positionCount || 1} position{(job.positionCount || 1) !== 1 ? 's' : ''}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 line-clamp-1 sm:line-clamp-2 mb-2">
                  {job.description}
                </p>

                {/* Skills */}
                {Array.isArray(job.skills) && job.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {job.skills.slice(0, 4).map((s: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] sm:text-xs rounded-full">
                        {s}
                      </span>
                    ))}
                    {job.skills.length > 4 && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] sm:text-xs rounded-full">
                        +{job.skills.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => openEditModal(job)} className="p-2 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-xl transition" title="Edit">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => setDeleteConfirm({ open: true, id: job.id, collection: 'jobs' })} className="p-2 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-xl transition" title="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      renderForm={(_item, onSave) => (
        <form
          onSubmit={(e) => { e.preventDefault(); handleFormSubmit(onSave); }}
        >
          <div className="space-y-4">
            {/* ═══════ SECTION: Job Info ═══════ */}
            <div className="pb-2 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" /> Job Information
              </h3>
            </div>

            <FormInput
              label="Job Title"
              value={form.title}
              onChange={(v) => setForm({ ...form, title: v })}
              required
              placeholder="e.g. Junior Software Developer, Site Engineer"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <IdNameSelect
                label="Department"
                value={form.department}
                onChange={(v) => setForm({ ...form, department: v })}
                options={DEPARTMENTS}
                required
              />
              <IdNameSelect
                label="Employment Type"
                value={form.type}
                onChange={(v) => setForm({ ...form, type: v })}
                options={EMPLOYMENT_TYPES}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Location"
                value={form.location.name}
                onChange={(v) => setForm({ ...form, location: { ...form.location, name: v } })}
                required
                placeholder="e.g. Ahmedabad, Gujarat"
              />
              <IdNameSelect
                label="Experience Level"
                value={form.experience}
                onChange={(v) => setForm({ ...form, experience: v })}
                options={EXPERIENCE_LEVELS}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="No. of Positions"
                value={form.positionCount}
                onChange={(v) => setForm({ ...form, positionCount: Math.max(1, Number(v)) })}
                type="number"
              />
              <FormField label="Currency">
                <select
                  value={form.salary.currency}
                  onChange={(e) => setForm({ ...form, salary: { ...form.salary, currency: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none"
                >
                  {CURRENCIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </FormField>
            </div>

            {/* Salary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label={`Salary Min (${form.salary.currency})`}
                value={form.salary.min}
                onChange={(v) => setForm({ ...form, salary: { ...form.salary, min: Number(v) } })}
                type="number"
              />
              <FormInput
                label={`Salary Max (${form.salary.currency})`}
                value={form.salary.max}
                onChange={(v) => setForm({ ...form, salary: { ...form.salary, max: Number(v) } })}
                type="number"
              />
            </div>

            {form.salary.min > 0 && (
              <p className="text-xs text-slate-400">
                Range: {formatSalary(form.salary.min, form.salary.currency)} – {formatSalary(form.salary.max, form.salary.currency)}
                {form.salary.currency === 'INR' && ` (${(form.salary.min / 100000).toFixed(1)} - ${(form.salary.max / 100000).toFixed(1)} LPA)`}
              </p>
            )}

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Posted Date"
                value={form.postedDate}
                onChange={(v) => setForm({ ...form, postedDate: v })}
                type="date"
              />
              <FormInput
                label="Closing Date"
                value={form.closingDate}
                onChange={(v) => setForm({ ...form, closingDate: v })}
                type="date"
              />
            </div>

            {/* Flags */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                <input type="checkbox" id="job-urgent" checked={form.isUrgent}
                  onChange={(e) => setForm({ ...form, isUrgent: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500" />
                <label htmlFor="job-urgent" className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Urgent Hiring
                </label>
              </div>
              <div className="flex-1 flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <input type="checkbox" id="job-featured" checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500" />
                <label htmlFor="job-featured" className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Featured Job
                </label>
              </div>
            </div>

            {/* ═══════ SECTION: Company ═══════ */}
            <div className="pb-2 border-b border-slate-200 mt-2">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" /> Company Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Company Name"
                value={form.company.name}
                onChange={(v) => setForm({ ...form, company: { ...form.company, name: v } })}
                required
                placeholder="e.g. CVS Multi Services Pvt. Ltd."
              />
              <FormInput
                label="Industry"
                value={form.company.industry}
                onChange={(v) => setForm({ ...form, company: { ...form.company, industry: v } })}
                placeholder="e.g. Industrial Services, Oil & Gas"
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <input type="checkbox" id="company-hiring" checked={form.company.isHiring}
                onChange={(e) => setForm({ ...form, company: { ...form.company, isHiring: e.target.checked } })}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
              <label htmlFor="company-hiring" className="text-sm font-medium text-slate-700">
                Currently Hiring
              </label>
            </div>

            <CompanyLogoUploader
              value={form.company.logo}
              onChange={(url) => setForm({ ...form, company: { ...form.company, logo: url } })}
              showToast={showToast}
              previousUrl={originalLogo}
            />

            {/* ═══════ SECTION: Description ═══════ */}
            <div className="pb-2 border-b border-slate-200 mt-2">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-blue-600" /> Job Details
              </h3>
            </div>

            <div>
              <FormTextarea
                label="Job Description"
                value={form.description}
                onChange={(v) => setForm({ ...form, description: v })}
                rows={4}
                required
                placeholder={`Describe the job role, responsibilities overview, and what the candidate can expect...

Press Enter twice to start a new paragraph.`}
              />
              {form.description.trim() && (
                <p className="text-xs text-slate-400 mt-1">
                  {form.description.trim().split(/\s+/).length} words · {form.description.split(/\n\s*\n/).filter(p => p.trim()).length} paragraphs
                </p>
              )}
            </div>

            {/* Chip inputs */}
            <ChipInput
              label="Responsibilities"
              value={form.responsibilities}
              onChange={(v) => setForm({ ...form, responsibilities: v })}
              placeholder="e.g. Develop APIs, Code reviews, Mentor juniors"
              color="blue"
            />

            <ChipInput
              label="Requirements"
              value={form.requirements}
              onChange={(v) => setForm({ ...form, requirements: v })}
              placeholder="e.g. B.Tech in CS, 2+ years experience"
              color="purple"
            />

            <ChipInput
              label="Benefits & Perks"
              value={form.benefits}
              onChange={(v) => setForm({ ...form, benefits: v })}
              placeholder="e.g. Health Insurance, Flexible Hours, WFH"
              color="emerald"
            />

            <ChipInput
              label="Skills Required"
              value={form.skills}
              onChange={(v) => setForm({ ...form, skills: v })}
              placeholder="e.g. React, Node.js, MongoDB, Python"
              color="amber"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 mt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => { setModalOpen(false); setEditingItem(null); }}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              <Save className="w-4 h-4" />
              {modalType === 'add' ? 'Post Job' : 'Update Job'}
            </button>
          </div>
        </form>
      )}
    />
  );
}