import { useState, useEffect } from 'react';
import {
  Edit, Trash2, Save, Plus, X, ChevronDown, ChevronRight,
  Layers, Search } from 'lucide-react';
import { GenericListPage } from '../generic/GenericListPage';
import { FormInput, FormTextarea, FormField } from '../common/FormHelpers';
import { ImageUploader } from '../common/ImageUploader';
import { getIconComponent, iconMap } from '../../utils/iconMap';

interface FeaturesPageProps {
  features: any[];
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
const COLOR_PRESETS = [
  { label: 'Gold', value: '#d4a017' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Purple', value: '#8b5cf6' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Cyan', value: '#06b6d4' },
  { label: 'Pink', value: '#ec4899' },
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Teal', value: '#14b8a6' },
];

// ==================== ICON PICKER ====================
function IconPicker({
  value,
  onChange,
  label = 'Icon',
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
            <p className="text-sm font-medium text-slate-700">{value}</p>
            <p className="text-xs text-slate-400">Click to change</p>
          </div>
          <span className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
            ▾
          </span>
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
              <p className="text-xs text-slate-400 mt-1.5">
                {filtered.length} of {allIcons.length} icons
              </p>
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

// ==================== FEATURES CHIP INPUT ====================
function FeaturesChipInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (items: string[]) => void;
}) {
  const [inputVal, setInputVal] = useState('');

  const addItems = (raw: string) => {
    const items = raw.split(',').map((s) => s.trim()).filter((s) => s.length > 0 && !value.includes(s));
    if (items.length > 0) onChange([...value, ...items]);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); addItems(inputVal); }
    if (e.key === ',') { e.preventDefault(); addItems(inputVal); }
    if (e.key === 'Backspace' && inputVal === '' && value.length > 0) onChange(value.slice(0, -1));
  };

  return (
    <FormField label="Features / Capabilities">
      <div className="space-y-2">
        {value.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl min-h-[40px]">
            {value.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-lg">
                ✓ {item}
                <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))} className="hover:text-emerald-900">
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
            placeholder="e.g. Oil-water separation, Chemical dosing (Enter or comma)"
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <button type="button" onClick={() => { if (inputVal.trim()) addItems(inputVal); }} className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-400">
          Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">Enter</kbd> or <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">,</kbd> to add
        </p>
      </div>
    </FormField>
  );
}

// ==================== SUB-SERVICE FORM ====================
interface SubServiceData {
  id: string;
  title: string;
  icon: string;
  image: string;
  shortDesc: string;
  fullDesc: string;
  features: string[];
}

function SubServiceForm({
  data,
  index,
  onChange,
  onRemove,
  isExpanded,
  onToggle,
  showToast,
  parentTitle,
}: {
  data: SubServiceData;
  index: number;
  onChange: (updated: SubServiceData) => void;
  onRemove: () => void;
  isExpanded: boolean;
  onToggle: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  parentTitle: string;
}) {
  const update = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  // Auto-generate ID from title
  useEffect(() => {
    if (data.title && !data.id) {
      const prefix = parentTitle
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toLowerCase();
      // const slug = data.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      update('id', `${prefix}-${index + 1}`);
    }
  }, [data.title]);

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all ${isExpanded ? 'border-blue-300 bg-blue-50/30' : 'border-slate-200 bg-white'}`}>
      {/* Header — always visible */}
      <div
        className="flex items-center gap-3 p-3 sm:p-4 cursor-pointer hover:bg-slate-50 transition"
        onClick={onToggle}
      >
        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
          {getIconComponent(data.icon, 'w-4 h-4 text-slate-600')}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-700 truncate">
            {data.title || `Sub-service ${index + 1}`}
          </p>
          {data.shortDesc && (
            <p className="text-xs text-slate-400 truncate">{data.shortDesc}</p>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Status indicators */}
          {data.image && (
            <span className="w-2 h-2 bg-emerald-400 rounded-full" title="Has image" />
          )}
          {data.features.length > 0 && (
            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
              {data.features.length} features
            </span>
          )}

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition ml-1"
            title="Remove sub-service"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {/* Expanded form */}
      {isExpanded && (
        <div className="px-3 sm:px-4 pb-4 space-y-4 border-t border-slate-200 pt-4">
          {/* Title + ID */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <FormInput
                label="Sub-service Title"
                value={data.title}
                onChange={(v) => update('title', v)}
                required
                placeholder="e.g. Produced Water Treatment"
              />
            </div>
            <FormInput
              label="ID (auto)"
              value={data.id}
              onChange={(v) => update('id', v)}
              placeholder="auto-generated"
            />
          </div>

          {/* Icon */}
          <IconPicker
            value={data.icon}
            onChange={(v) => update('icon', v)}
            label="Sub-service Icon"
          />

          {/* Short description */}
          <FormTextarea
            label="Short Description"
            value={data.shortDesc}
            onChange={(v) => update('shortDesc', v)}
            rows={2}
            placeholder="Brief 1-2 sentence summary..."
          />

          {/* Full description */}
          <div>
            <FormTextarea
              label="Full Description"
              value={data.fullDesc}
              onChange={(v) => update('fullDesc', v)}
              rows={4}
              placeholder={`Detailed description of this sub-service...

Press Enter twice to start a new paragraph.`}
            />
            {data.fullDesc.trim() && (
              <p className="text-xs text-slate-400 mt-1">
                {data.fullDesc.trim().split(/\s+/).length} words ·{' '}
                {data.fullDesc.split(/\n\s*\n/).filter((p) => p.trim()).length} paragraphs
              </p>
            )}
          </div>

          {/* Features */}
          <FeaturesChipInput
            value={data.features}
            onChange={(v) => update('features', v)}
          />

          {/* Image — 800×500 */}
          <ImageUploader
            value={data.image}
            onChange={(url) => update('image', url)}
            folder="projects"
            label="Sub-service Image (800×500px · 16:10)"
            outputWidth={800}
            outputHeight={500}
            aspectRatio={8 / 5}
            previewWidth={480}
            showToast={showToast}
          />
        </div>
      )}
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
export function FeaturesPage({
  features,
  modalOpen,
  modalType,
  editingItem,
  deleteConfirm,
  openAddModal,
  openEditModal,
  setModalOpen,
  setEditingItem,
  setDeleteConfirm,
  handleAdd,
  handleEdit,
  handleDelete,
  showToast,
}: FeaturesPageProps) {
  const [form, setForm] = useState({
    title: '',
    shortDesc: '',
    img: '',
    icon: 'Droplets',
    color: '#d4a017',
    index: 0,
    subServices: [] as SubServiceData[],
  });

  const [originalImg, setOriginalImg] = useState('');
  const [expandedSubs, setExpandedSubs] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (modalOpen && editingItem) {
      setForm({
        title: editingItem.title || '',
        shortDesc: editingItem.shortDesc || '',
        img: editingItem.img || '',
        icon: editingItem.icon || 'Droplets',
        color: editingItem.color || '#d4a017',
        index: editingItem.index ?? 0,
        subServices: Array.isArray(editingItem.subServices)
          ? editingItem.subServices.map((s: any) => ({
              id: s.id || '',
              title: s.title || '',
              icon: s.icon || 'Layers',
              image: s.image || '',
              shortDesc: s.shortDesc || '',
              fullDesc: s.fullDesc || '',
              features: Array.isArray(s.features) ? s.features : [],
            }))
          : [],
      });
      setOriginalImg(editingItem.img || '');
      // Expand first sub-service
      if (editingItem.subServices?.length > 0) {
        setExpandedSubs({ 0: true });
      }
    } else if (modalOpen && !editingItem) {
      setForm({
        title: '',
        shortDesc: '',
        img: '',
        icon: 'Droplets',
        color: '#d4a017',
        index: features.length,
        subServices: [],
      });
      setOriginalImg('');
      setExpandedSubs({});
    }
  }, [modalOpen, editingItem]);

  const handleFormSubmit = (onSave: (data: any) => void) => {
    onSave(form);
  };

  const addSubService = () => {
    const newIndex = form.subServices.length;
    const prefix = form.title
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toLowerCase() || 'sub';

    setForm({
      ...form,
      subServices: [
        ...form.subServices,
        {
          id: `${prefix}-${newIndex + 1}`,
          title: '',
          icon: 'Layers',
          image: '',
          shortDesc: '',
          fullDesc: '',
          features: [],
        },
      ],
    });
    setExpandedSubs((prev) => ({ ...prev, [newIndex]: true }));
  };

  const updateSubService = (index: number, updated: SubServiceData) => {
    const subs = [...form.subServices];
    subs[index] = updated;
    setForm({ ...form, subServices: subs });
  };

  const removeSubService = (index: number) => {
    setForm({
      ...form,
      subServices: form.subServices.filter((_, i) => i !== index),
    });
    const newExpanded: Record<number, boolean> = {};
    Object.entries(expandedSubs).forEach(([k, v]) => {
      const key = Number(k);
      if (key < index) newExpanded[key] = v;
      else if (key > index) newExpanded[key - 1] = v;
    });
    setExpandedSubs(newExpanded);
  };

  // const duplicateSubService = (index: number) => {
  //   const original = form.subServices[index];
  //   const newSub = {
  //     ...original,
  //     id: `${original.id}-copy`,
  //     title: `${original.title} (Copy)`,
  //     image: '', // Don't duplicate Cloudinary image
  //   };
  //   const subs = [...form.subServices];
  //   subs.splice(index + 1, 0, newSub);
  //   setForm({ ...form, subServices: subs });
  //   setExpandedSubs((prev) => ({ ...prev, [index + 1]: true }));
  //   showToast('Sub-service duplicated', 'info');
  // };

  const toggleSub = (index: number) => {
    setExpandedSubs((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const isFormValid =
    form.title.trim() &&
    form.shortDesc.trim() &&
    form.img &&
    form.icon;

  return (
    <GenericListPage
      title="Services"
      collection="features"
      items={features}
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
      renderItem={(feature) => (
        <div
          key={feature.id}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition"
        >
          <div className="flex flex-col sm:flex-row">
            {/* Image */}
            <div
              className="w-full sm:w-48 flex-shrink-0 bg-slate-100 overflow-hidden"
              style={{ aspectRatio: '3/2' }}
            >
              {feature.img ? (
                <img
                  src={feature.img}
                  alt={feature.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://picsum.photos/600/400';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Layers className="w-8 h-8 text-slate-300" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    {/* Index badge */}
                    <span className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xs">
                      {String(feature.index ?? 0).padStart(2, '0')}
                    </span>

                    {/* Icon */}
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${feature.color || '#d4a017'}20` }}
                    >
                      {getIconComponent(feature.icon, 'w-4 h-4')}
                    </div>

                    {/* Color dot */}
                    {feature.color && (
                      <div
                        className="w-4 h-4 rounded-full border border-slate-200"
                        style={{ backgroundColor: feature.color }}
                        title={feature.color}
                      />
                    )}

                    {/* Sub-service count */}
                    {feature.subServices?.length > 0 && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-medium rounded-full">
                        {feature.subServices.length} sub-service{feature.subServices.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <h4 className="text-base sm:text-lg font-bold text-slate-800 mb-0.5">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-slate-500 line-clamp-2">
                    {feature.shortDesc}
                  </p>

                  {/* Sub-services preview */}
                  {feature.subServices?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {feature.subServices.slice(0, 3).map((sub: any, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full flex items-center gap-1"
                        >
                          {getIconComponent(sub.icon, 'w-3 h-3')}
                          {sub.title}
                        </span>
                      ))}
                      {feature.subServices.length > 3 && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full">
                          +{feature.subServices.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEditModal(feature)}
                    className="p-2 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-xl transition"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setDeleteConfirm({ open: true, id: feature.id, collection: 'features' })
                    }
                    className="p-2 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-xl transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
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
        >
          <div className="space-y-4">
            {/* ═══════ MAIN SERVICE ═══════ */}
            <div className="pb-2 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                Main Service
              </h3>
            </div>

            {/* Title */}
            <FormInput
              label="Service Title"
              value={form.title}
              onChange={(v) => setForm({ ...form, title: v })}
              required
              placeholder="e.g. Mobile Effluent Treatment Plant"
            />

            {/* Short Desc */}
            <FormTextarea
              label="Short Description"
              value={form.shortDesc}
              onChange={(v) => setForm({ ...form, shortDesc: v })}
              rows={2}
              required
              placeholder="Brief summary of this service..."
            />

            {/* Icon + Index + Color — responsive row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <IconPicker
                  value={form.icon}
                  onChange={(v) => setForm({ ...form, icon: v })}
                  label="Service Icon"
                />
              </div>
              <FormInput
                label="Display Order"
                value={form.index}
                onChange={(v) => setForm({ ...form, index: Number(v) })}
                type="number"
                placeholder="0"
              />
            </div>

            {/* Color picker */}
            <FormField label="Accent Color">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setForm({ ...form, color: c.value })}
                      className={`w-8 h-8 rounded-xl border-2 transition-all ${
                        form.color === c.value
                          ? 'border-blue-500 scale-110 shadow-md'
                          : 'border-slate-200 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    placeholder="#d4a017"
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div
                    className="w-8 h-8 rounded-lg border border-slate-200"
                    style={{ backgroundColor: form.color }}
                  />
                </div>
              </div>
            </FormField>

            {/* Main Image — 1200×800 */}
            <ImageUploader
              value={form.img}
              onChange={(url) => setForm((prev) => ({ ...prev, img: url }))}
              folder="projects"
              label="Service Image (1200×800px · 3:2)"
              required
              outputWidth={1200}
              outputHeight={800}
              aspectRatio={3 / 2}
              previewWidth={560}
              showToast={showToast}
              previousCloudinaryUrl={originalImg}
            />

            {/* ═══════ SUB-SERVICES ═══════ */}
            <div className="pb-2 border-b border-slate-200 mt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  Sub-Services
                  {form.subServices.length > 0 && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-normal">
                      {form.subServices.length}
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-2">
                  {form.subServices.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const allExpanded = Object.values(expandedSubs).every(Boolean) && Object.keys(expandedSubs).length === form.subServices.length;
                        const newState: Record<number, boolean> = {};
                        form.subServices.forEach((_, i) => { newState[i] = !allExpanded; });
                        setExpandedSubs(newState);
                      }}
                      className="text-xs text-slate-500 hover:text-blue-600 transition"
                    >
                      {Object.values(expandedSubs).every(Boolean) && Object.keys(expandedSubs).length === form.subServices.length
                        ? 'Collapse All'
                        : 'Expand All'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Sub-service list */}
            {form.subServices.length > 0 ? (
              <div className="space-y-3">
                {form.subServices.map((sub, idx) => (
                  <SubServiceForm
                    key={`${sub.id}-${idx}`}
                    data={sub}
                    index={idx}
                    onChange={(updated) => updateSubService(idx, updated)}
                    onRemove={() => removeSubService(idx)}
                    isExpanded={expandedSubs[idx] || false}
                    onToggle={() => toggleSub(idx)}
                    showToast={showToast}
                    parentTitle={form.title}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500 font-medium">No sub-services added yet</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Add sub-services to define specific offerings under this service
                </p>
              </div>
            )}

            {/* Add sub-service button */}
            <button
              type="button"
              onClick={addSubService}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-blue-300 hover:border-blue-400 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium rounded-2xl transition text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Sub-Service
            </button>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 mt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setModalOpen(false);
                setEditingItem(null);
              }}
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
              {modalType === 'add' ? 'Create Service' : 'Update Service'}
            </button>
          </div>
        </form>
      )}
    />
  );
}