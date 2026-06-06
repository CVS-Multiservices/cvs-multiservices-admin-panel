import { useState, useEffect } from 'react';
import {
  Edit, Trash2, Save, Plus, X,
  ChevronDown, ChevronRight,
  MapPin, Phone, Mail, Clock,
  Search, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { FormInput, FormTextarea, FormField } from '../common/FormHelpers';
import { getIconComponent, iconMap } from '../../utils/iconMap';

// ==================== INTERFACES ====================

interface ContactInfoItem {
  icon: string;
  title: string;
  lines: string[];
  actionLabel: string;
  actionUrl: string;
}

interface BranchData {
  id: string;
  label: string;
  city: string;
  country: string;
  flag: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  mapSrc: string;
  mapUrl: string;
  color: string;
}

interface ContactPageProps {
  contactItems: any[];
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

// ==================== PRESET COLORS ====================
const BRANCH_COLORS = [
  { label: 'Gold',    value: '#d4a017' },
  { label: 'Blue',    value: '#3b82f6' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Red',     value: '#ef4444' },
  { label: 'Purple',  value: '#8b5cf6' },
  { label: 'Orange',  value: '#f97316' },
  { label: 'Cyan',    value: '#06b6d4' },
  { label: 'Pink',    value: '#ec4899' },
  { label: 'Indigo',  value: '#6366f1' },
  { label: 'Teal',    value: '#14b8a6' },
];

// ==================== COUNTRY PRESETS ====================
const COUNTRY_PRESETS = [
  { label: 'India',        flag: '🇮🇳' },
  { label: 'UAE',          flag: '🇦🇪' },
  { label: 'USA',          flag: '🇺🇸' },
  { label: 'UK',           flag: '🇬🇧' },
  { label: 'Canada',       flag: '🇨🇦' },
  { label: 'Australia',    flag: '🇦🇺' },
  { label: 'Singapore',    flag: '🇸🇬' },
  { label: 'Saudi Arabia', flag: '🇸🇦' },
  { label: 'Qatar',        flag: '🇶🇦' },
  { label: 'Kuwait',       flag: '🇰🇼' },
];

// ==================== ICON PICKER ====================
function IconPicker({
  value, onChange, label = 'Icon',
}: {
  value: string;
  onChange: (iconName: string) => void;
  label?: string;
}) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const allIcons = Object.keys(iconMap);
  const filtered = search
    ? allIcons.filter((n) => n.toLowerCase().includes(search.toLowerCase()))
    : allIcons;

  return (
    <FormField label={label}>
      <div className="space-y-2">
        <div
          className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            {getIconComponent(value, 'w-5 h-5 text-blue-600')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700">{value || 'Select icon'}</p>
            <p className="text-xs text-slate-400">Click to change</p>
          </div>
          <span className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
        </div>

        {isOpen && (
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-lg">
            <div className="p-3 border-b border-slate-200 sticky top-0 bg-white z-10">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search icons..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  autoFocus
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">{filtered.length} of {allIcons.length} icons</p>
            </div>
            <div className="p-3 max-h-48 overflow-y-auto">
              {filtered.length > 0 ? (
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
                  {filtered.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => { onChange(name); setIsOpen(false); setSearch(''); }}
                      title={name}
                      className={`w-full aspect-square flex items-center justify-center rounded-xl transition-all ${
                        value === name
                          ? 'bg-blue-600 text-white scale-110 ring-2 ring-blue-300'
                          : 'bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:scale-105'
                      }`}
                    >
                      {getIconComponent(name, `w-4 h-4 ${value === name ? 'text-white' : ''}`)}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-slate-400 text-sm">No icons match "{search}"</p>
              )}
            </div>
          </div>
        )}
      </div>
    </FormField>
  );
}

function LinesChipInput({
  value, onChange, label = 'Information Lines',
  placeholder = 'Type a line and press Enter',
}: {
  value: string[];
  onChange: (items: string[]) => void;
  label?: string;
  placeholder?: string;
}) {
  const [inputVal, setInputVal] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingVal, setEditingVal] = useState('');

  const addItem = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed]);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); addItem(inputVal); }
    if (e.key === 'Backspace' && inputVal === '' && value.length > 0) onChange(value.slice(0, -1));
  };

  // ── Start editing a chip ──────────────────────────────────────
  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditingVal(value[index]);
  };

  // ── Save edited chip ──────────────────────────────────────────
  const saveEdit = (index: number) => {
    const trimmed = editingVal.trim();
    if (!trimmed) {
      // Empty → remove
      onChange(value.filter((_, i) => i !== index));
    } else {
      const updated = [...value];
      updated[index] = trimmed;
      onChange(updated);
    }
    setEditingIndex(null);
    setEditingVal('');
  };

  // ── Cancel edit ───────────────────────────────────────────────
  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingVal('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') { e.preventDefault(); saveEdit(index); }
    if (e.key === 'Escape') cancelEdit();
  };

  return (
    <FormField label={label}>
      <div className="space-y-2">
        {value.length > 0 && (
          <div className="flex flex-col gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            {value.map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 px-2.5 py-1.5 border text-sm rounded-lg transition-all ${
                  editingIndex === i
                    ? 'bg-blue-50 border-blue-300 shadow-sm'
                    : 'bg-white border-slate-100'
                }`}
              >
                {/* Line number badge */}
                <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                  {i + 1}
                </span>

                {/* ── Edit mode ── */}
                {editingIndex === i ? (
                  <>
                    <input
                      autoFocus
                      type="text"
                      value={editingVal}
                      onChange={(e) => setEditingVal(e.target.value)}
                      onKeyDown={(e) => handleEditKeyDown(e, i)}
                      onBlur={() => saveEdit(i)}
                      className="flex-1 bg-transparent text-slate-700 text-sm focus:outline-none placeholder:text-slate-300"
                      placeholder="Edit line..."
                    />
                    {/* Save edit */}
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); saveEdit(i); }}
                      className="p-0.5 hover:bg-emerald-50 text-emerald-500 rounded transition flex-shrink-0"
                      title="Save"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                    {/* Cancel edit */}
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); cancelEdit(); }}
                      className="p-0.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded transition flex-shrink-0"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  /* ── View mode ── */
                  <>
                    <span
                      className="flex-1 text-slate-700 cursor-pointer hover:text-blue-600 transition truncate"
                      onClick={() => startEdit(i)}
                      title="Click to edit"
                    >
                      {item}
                    </span>
                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => startEdit(i)}
                      className="p-0.5 hover:bg-blue-50 text-slate-400 hover:text-blue-500 rounded transition flex-shrink-0"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                      className="p-0.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition flex-shrink-0"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Add new line ── */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => { if (inputVal.trim()) addItem(inputVal); }}
            placeholder={placeholder}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <button
            type="button"
            onClick={() => { if (inputVal.trim()) addItem(inputVal); }}
            className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">Enter</kbd> to add
          · Click a line or <Edit className="w-3 h-3 inline mx-0.5" /> to edit
          · <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">Esc</kbd> to cancel edit
        </p>
      </div>
    </FormField>
  );
}

// ==================== CONTACT INFO ITEM FORM ====================
function ContactInfoItemForm({
  data, index, onChange, onRemove, isExpanded, onToggle,
}: {
  data: ContactInfoItem;
  index: number;
  onChange: (updated: ContactInfoItem) => void;
  onRemove: () => void;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const update = (field: string, value: any) => onChange({ ...data, [field]: value });

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all ${isExpanded ? 'border-blue-300 bg-blue-50/30' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-center gap-3 p-3 sm:p-4 cursor-pointer hover:bg-slate-50 transition" onClick={onToggle}>
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          {getIconComponent(data.icon || 'Mail', 'w-4 h-4 text-blue-600')}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-700 truncate">{data.title || `Contact Info ${index + 1}`}</p>
          {data.lines.length > 0 && <p className="text-xs text-slate-400 truncate">{data.lines[0]}</p>}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {data.lines.length > 0 && (
            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
              {data.lines.length} line{data.lines.length !== 1 ? 's' : ''}
            </span>
          )}
          {data.actionLabel && (
            <span className="text-[10px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">has action</span>
          )}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition ml-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {isExpanded && (
        <div className="px-3 sm:px-4 pb-4 space-y-4 border-t border-slate-200 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <FormInput label="Title" value={data.title} onChange={(v) => update('title', v)} required placeholder="e.g. Email Us, Call Us, Visit Us" />
            </div>
            <IconPicker value={data.icon || 'Mail'} onChange={(v) => update('icon', v)} label="Icon" />
          </div>
          <LinesChipInput value={data.lines} onChange={(v) => update('lines', v)} label="Information Lines" placeholder="e.g. info@cvsmultiservices.com" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Action Button Label" value={data.actionLabel} onChange={(v) => update('actionLabel', v)} placeholder="e.g. Send Email, View Map" />
            <FormInput label="Action URL" value={data.actionUrl} onChange={(v) => update('actionUrl', v)} placeholder="e.g. mailto:info@example.com" />
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== BRANCH FORM ====================
function BranchForm({
  data, index, onChange, onRemove, isExpanded, onToggle,
}: {
  data: BranchData;
  index: number;
  onChange: (updated: BranchData) => void;
  onRemove: () => void;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const update = (field: string, value: any) => onChange({ ...data, [field]: value });

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all ${isExpanded ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-center gap-3 p-3 sm:p-4 cursor-pointer hover:bg-slate-50 transition" onClick={onToggle}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${data.color || '#d4a017'}20` }}>
          <MapPin className="w-4 h-4" style={{ color: data.color || '#d4a017' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-700 truncate">
            {data.flag && <span className="mr-1">{data.flag}</span>}
            {data.label || `Branch ${index + 1}`}
          </p>
          {(data.city || data.country) && (
            <p className="text-xs text-slate-400 truncate">{[data.city, data.country].filter(Boolean).join(', ')}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {data.phone && (
            <span className="hidden sm:block text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded truncate max-w-[100px]">{data.phone}</span>
          )}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition ml-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {isExpanded && (
        <div className="px-3 sm:px-4 pb-4 space-y-4 border-t border-slate-200 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Branch ID" value={data.id} onChange={(v) => update('id', v)} placeholder="e.g. hq, ahmedabad, dubai" />
            <FormInput label="Label" value={data.label} onChange={(v) => update('label', v)} required placeholder="e.g. Headquarters, Regional Office" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="City" value={data.city} onChange={(v) => update('city', v)} required placeholder="e.g. Mehsana, Dubai" />
            <FormInput label="Country" value={data.country} onChange={(v) => update('country', v)} required placeholder="e.g. India, UAE" />
          </div>

          <FormField label="Country Flag">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {COUNTRY_PRESETS.map((c) => (
                  <button
                    key={c.flag}
                    type="button"
                    onClick={() => update('flag', c.flag)}
                    title={c.label}
                    className={`px-2.5 py-1.5 rounded-xl border text-lg transition-all ${data.flag === c.flag ? 'border-blue-500 bg-blue-50 scale-110 shadow-sm' : 'border-slate-200 hover:border-blue-300 hover:scale-105'}`}
                  >
                    {c.flag}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={data.flag}
                  onChange={(e) => update('flag', e.target.value)}
                  placeholder="Paste emoji flag e.g. 🇮🇳"
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                {data.flag && <span className="text-3xl">{data.flag}</span>}
              </div>
            </div>
          </FormField>

          <FormTextarea label="Address" value={data.address} onChange={(v) => update('address', v)} rows={2} placeholder="e.g. 20, Bhagwati Nagar Society, Mehsana – 384002" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Phone" value={data.phone} onChange={(v) => update('phone', v)} placeholder="e.g. +91 72020 21251" />
            <FormInput label="Email" value={data.email} onChange={(v) => update('email', v)} placeholder="e.g. info@cvsmultiservices.com" />
          </div>

          <FormInput label="Working Hours" value={data.hours} onChange={(v) => update('hours', v)} placeholder="e.g. Mon – Sat: 9:00 AM – 6:00 PM" />
          <FormInput label="Google Maps Embed URL (mapSrc)" value={data.mapSrc} onChange={(v) => update('mapSrc', v)} placeholder="https://www.google.com/maps/embed?pb=..." />
          <FormInput label="Google Maps Link (mapUrl)" value={data.mapUrl} onChange={(v) => update('mapUrl', v)} placeholder="https://maps.google.com/?q=..." />

          <FormField label="Branch Color">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {BRANCH_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => update('color', c.value)}
                    title={c.label}
                    className={`w-8 h-8 rounded-xl border-2 transition-all ${data.color === c.value ? 'border-blue-500 scale-110 shadow-md' : 'border-slate-200 hover:scale-105'}`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input type="color" value={data.color || '#d4a017'} onChange={(e) => update('color', e.target.value)} className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer" />
                <input type="text" value={data.color} onChange={(e) => update('color', e.target.value)} placeholder="#d4a017" className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <div className="w-8 h-8 rounded-lg border border-slate-200" style={{ backgroundColor: data.color || '#d4a017' }} />
              </div>
            </div>
          </FormField>
        </div>
      )}
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
export function ContactPage({
  contactItems,
  deleteConfirm,
  setDeleteConfirm,
  // handleAdd,
  handleEdit,
  handleDelete,
  showToast,
}: ContactPageProps) {

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isEditing, setIsEditing]       = useState(false);
  const [isSaving, setIsSaving]         = useState(false);

  const [form, setForm] = useState<{
    contactInfo: ContactInfoItem[];
    branches: BranchData[];
  }>({ contactInfo: [], branches: [] });

  const [expandedInfos,    setExpandedInfos]    = useState<Record<number, boolean>>({});
  const [expandedBranches, setExpandedBranches] = useState<Record<number, boolean>>({});

  // ── Auto-select first item and load form ──────────────────────
  useEffect(() => {
    if (contactItems.length > 0) {
      const item = selectedItem
        ? contactItems.find((c) => c.id === selectedItem.id) || contactItems[0]
        : contactItems[0];
      setSelectedItem(item);
      loadFormFromItem(item);
    }
  }, [contactItems]);

  // ── Reload form when selected item changes ────────────────────
  useEffect(() => {
    if (selectedItem) {
      loadFormFromItem(selectedItem);
      setIsEditing(false);
    }
  }, [selectedItem?.id]);

  const loadFormFromItem = (item: any) => {
    setForm({
      contactInfo: Array.isArray(item.contactInfo)
        ? item.contactInfo.map((c: any) => ({
            icon:        c.icon        || 'Mail',
            title:       c.title       || '',
            lines:       Array.isArray(c.lines) ? c.lines : [],
            actionLabel: c.actionLabel || '',
            actionUrl:   c.actionUrl   || '',
          }))
        : [],
      branches: Array.isArray(item.branches)
        ? item.branches.map((b: any) => ({
            id:      b.id      || '',
            label:   b.label   || '',
            city:    b.city    || '',
            country: b.country || '',
            flag:    b.flag    || '',
            address: b.address || '',
            phone:   b.phone   || '',
            email:   b.email   || '',
            hours:   b.hours   || '',
            mapSrc:  b.mapSrc  || '',
            mapUrl:  b.mapUrl  || '',
            color:   b.color   || '#d4a017',
          }))
        : [],
    });
    if (item.contactInfo?.length > 0) setExpandedInfos({ 0: true });
    if (item.branches?.length > 0)    setExpandedBranches({ 0: true });
  };

  // ── ContactInfo helpers ───────────────────────────────────────
  const addContactInfo = () => {
    const idx = form.contactInfo.length;
    setForm((prev) => ({
      ...prev,
      contactInfo: [...prev.contactInfo, { icon: 'Mail', title: '', lines: [], actionLabel: '', actionUrl: '' }],
    }));
    setExpandedInfos((prev) => ({ ...prev, [idx]: true }));
  };

  const updateContactInfo = (index: number, updated: ContactInfoItem) => {
    const arr = [...form.contactInfo];
    arr[index] = updated;
    setForm((prev) => ({ ...prev, contactInfo: arr }));
  };

  const removeContactInfo = (index: number) => {
    setForm((prev) => ({ ...prev, contactInfo: prev.contactInfo.filter((_, i) => i !== index) }));
    const next: Record<number, boolean> = {};
    Object.entries(expandedInfos).forEach(([k, v]) => {
      const key = Number(k);
      if (key < index) next[key] = v;
      else if (key > index) next[key - 1] = v;
    });
    setExpandedInfos(next);
  };

  const toggleInfo = (index: number) =>
    setExpandedInfos((prev) => ({ ...prev, [index]: !prev[index] }));

  // ── Branch helpers ────────────────────────────────────────────
  const addBranch = () => {
    const idx = form.branches.length;
    setForm((prev) => ({
      ...prev,
      branches: [...prev.branches, {
        id: '', label: '', city: '', country: '',
        flag: '', address: '', phone: '', email: '',
        hours: '', mapSrc: '', mapUrl: '', color: '#d4a017',
      }],
    }));
    setExpandedBranches((prev) => ({ ...prev, [idx]: true }));
  };

  const updateBranch = (index: number, updated: BranchData) => {
    const arr = [...form.branches];
    arr[index] = updated;
    setForm((prev) => ({ ...prev, branches: arr }));
  };

  const removeBranch = (index: number) => {
    setForm((prev) => ({ ...prev, branches: prev.branches.filter((_, i) => i !== index) }));
    const next: Record<number, boolean> = {};
    Object.entries(expandedBranches).forEach(([k, v]) => {
      const key = Number(k);
      if (key < index) next[key] = v;
      else if (key > index) next[key - 1] = v;
    });
    setExpandedBranches(next);
  };

  const toggleBranch = (index: number) =>
    setExpandedBranches((prev) => ({ ...prev, [index]: !prev[index] }));

  // ── Save ──────────────────────────────────────────────────────
  const handleSave = async () => {
    if (form.contactInfo.length === 0 && form.branches.length === 0) {
      showToast('Add at least one contact info or branch', 'error');
      return;
    }
    setIsSaving(true);
    try {
      if (selectedItem) {
        await handleEdit('contact', selectedItem.id, form);
        setSelectedItem({ ...selectedItem, ...form });
        setIsEditing(false);
        showToast('Contact updated successfully!', 'success');
      }
    } catch {
      showToast('Failed to save. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (selectedItem) loadFormFromItem(selectedItem);
  };

  const isFormValid = form.contactInfo.length > 0 || form.branches.length > 0;
  const confirmDelete = deleteConfirm.open && deleteConfirm.collection === 'contact';

  // ==================== RENDER ====================
  return (
    <div className="space-y-6">

      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Contact</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage contact info and branch locations
          </p>
        </div>

        {/* Edit / Save / Cancel actions */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!isFormValid || isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : selectedItem && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition shadow-lg shadow-blue-600/30"
            >
              <Edit className="w-4 h-4" />
              Edit Contact
            </button>
          )}
        </div>
      </div>

      {/* ── Delete Confirm Banner ────────────────────────────── */}
      {confirmDelete && (
        <div className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700">Delete this contact document?</p>
            <p className="text-xs text-red-500 mt-0.5">This action cannot be undone.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setDeleteConfirm({ open: false, id: null, collection: '' })}
              className="px-3 py-1.5 text-sm bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                handleDelete('contact', deleteConfirm.id);
                setDeleteConfirm({ open: false, id: null, collection: '' });
              }}
              className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-500 text-white rounded-lg transition"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* ── No data state ────────────────────────────────────── */}
      {contactItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <Mail className="w-10 h-10 text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No contact data found</p>
          <p className="text-sm text-slate-400 mt-1">Contact data will appear here once available</p>
        </div>
      ) : (

        /* ── Full-width Form / Preview ───────────────────────── */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Status bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-slate-700">
                {selectedItem?.contactInfo?.length || 0} contact info items
                · {selectedItem?.branches?.length || 0} branches
              </span>
            </div>
            {isEditing && (
              <span className="text-xs px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                ✏️ Editing
              </span>
            )}
          </div>

          {/* Form / Preview body */}
          <div className="p-5 space-y-6">

            {/* ═══ CONTACT INFO ═══ */}
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  Contact Info Items
                  {form.contactInfo.length > 0 && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-normal">
                      {form.contactInfo.length}
                    </span>
                  )}
                </h3>
                {form.contactInfo.length > 1 && isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      const allOpen = Object.values(expandedInfos).every(Boolean) && Object.keys(expandedInfos).length === form.contactInfo.length;
                      const next: Record<number, boolean> = {};
                      form.contactInfo.forEach((_, i) => { next[i] = !allOpen; });
                      setExpandedInfos(next);
                    }}
                    className="text-xs text-slate-500 hover:text-blue-600 transition"
                  >
                    {Object.values(expandedInfos).every(Boolean) && Object.keys(expandedInfos).length === form.contactInfo.length ? 'Collapse All' : 'Expand All'}
                  </button>
                )}
              </div>

              {/* ── EDIT MODE: editable items ── */}
              {isEditing ? (
                <>
                  {form.contactInfo.length > 0 ? (
                    <div className="space-y-3">
                      {form.contactInfo.map((ci, idx) => (
                        <ContactInfoItemForm
                          key={idx}
                          data={ci}
                          index={idx}
                          onChange={(updated) => updateContactInfo(idx, updated)}
                          onRemove={() => removeContactInfo(idx)}
                          isExpanded={expandedInfos[idx] || false}
                          onToggle={() => toggleInfo(idx)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                      <Mail className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 font-medium">No contact info added</p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={addContactInfo}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-blue-300 hover:border-blue-400 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium rounded-2xl transition text-sm"
                  >
                    <Plus className="w-4 h-4" /> Add Contact Info Item
                  </button>
                </>
              ) : (
                /* ── VIEW MODE: read-only cards ── */
                <div className="space-y-2">
                  {form.contactInfo.length > 0 ? form.contactInfo.map((ci, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        {getIconComponent(ci.icon || 'Mail', 'w-4 h-4 text-blue-600')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700">{ci.title}</p>
                        {ci.lines.map((line, j) => (
                          <p key={j} className="text-xs text-slate-500 mt-0.5">{line}</p>
                        ))}
                        {ci.actionLabel && (
                          <a href={ci.actionUrl} className="inline-flex items-center gap-1 mt-1.5 text-xs text-blue-600 font-medium hover:underline">
                            {ci.actionLabel} →
                          </a>
                        )}
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-slate-400 italic">No contact info items</p>
                  )}
                </div>
              )}
            </div>

            {/* ═══ BRANCHES ═══ */}
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Branches / Offices
                  {form.branches.length > 0 && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-normal">
                      {form.branches.length}
                    </span>
                  )}
                </h3>
                {form.branches.length > 1 && isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      const allOpen = Object.values(expandedBranches).every(Boolean) && Object.keys(expandedBranches).length === form.branches.length;
                      const next: Record<number, boolean> = {};
                      form.branches.forEach((_, i) => { next[i] = !allOpen; });
                      setExpandedBranches(next);
                    }}
                    className="text-xs text-slate-500 hover:text-blue-600 transition"
                  >
                    {Object.values(expandedBranches).every(Boolean) && Object.keys(expandedBranches).length === form.branches.length ? 'Collapse All' : 'Expand All'}
                  </button>
                )}
              </div>

              {/* ── EDIT MODE: editable branches ── */}
              {isEditing ? (
                <>
                  {form.branches.length > 0 ? (
                    <div className="space-y-3">
                      {form.branches.map((branch, idx) => (
                        <BranchForm
                          key={idx}
                          data={branch}
                          index={idx}
                          onChange={(updated) => updateBranch(idx, updated)}
                          onRemove={() => removeBranch(idx)}
                          isExpanded={expandedBranches[idx] || false}
                          onToggle={() => toggleBranch(idx)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                      <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 font-medium">No branches added</p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={addBranch}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-emerald-300 hover:border-emerald-400 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-medium rounded-2xl transition text-sm"
                  >
                    <Plus className="w-4 h-4" /> Add Branch / Office
                  </button>
                </>
              ) : (
                /* ── VIEW MODE: read-only branch cards ── */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {form.branches.length > 0 ? form.branches.map((b, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl border"
                      style={{ borderColor: `${b.color || '#d4a017'}40`, backgroundColor: `${b.color || '#d4a017'}08` }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {b.flag && <span className="text-xl">{b.flag}</span>}
                        <div>
                          <p className="text-sm font-bold text-slate-800">{b.label}</p>
                          <p className="text-xs text-slate-500">{[b.city, b.country].filter(Boolean).join(', ')}</p>
                        </div>
                      </div>
                      <div className="space-y-1 text-xs text-slate-600">
                        {b.address && (
                          <p className="flex items-start gap-1.5">
                            <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0 text-slate-400" /> {b.address}
                          </p>
                        )}
                        {b.phone && (
                          <p className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 flex-shrink-0 text-slate-400" /> {b.phone}
                          </p>
                        )}
                        {b.email && (
                          <p className="flex items-center gap-1.5">
                            <Mail className="w-3 h-3 flex-shrink-0 text-slate-400" /> {b.email}
                          </p>
                        )}
                        {b.hours && (
                          <p className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 flex-shrink-0 text-slate-400" /> {b.hours}
                          </p>
                        )}
                      </div>
                      {b.mapUrl && (
                        <a
                          href={b.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-2 text-xs font-medium hover:underline"
                          style={{ color: b.color || '#d4a017' }}
                        >
                          View on Map →
                        </a>
                      )}
                    </div>
                  )) : (
                    <p className="text-sm text-slate-400 italic col-span-3">No branches added</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Sticky save footer (only in edit mode) ─────────── */}
          {isEditing && (
            <div className="flex flex-col sm:flex-row justify-end gap-3 px-5 py-4 border-t border-slate-200 bg-slate-50">
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl transition w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!isFormValid || isSaving}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}