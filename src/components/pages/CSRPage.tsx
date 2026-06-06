import { useState, useEffect } from 'react';
import {
  Edit, Trash2, Save, Plus, X, Heart, MapPin, Calendar,
  Sparkles, Target,
} from 'lucide-react';
import { GenericListPage } from '../generic/GenericListPage';
import { FormInput, FormTextarea, FormField } from '../common/FormHelpers';
import { ImageUploader } from '../common/ImageUploader';

interface CSRPageProps {
  csrInitiatives: any[];
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

// ==================== CATEGORY OPTIONS ====================
const CSR_CATEGORIES = [
  'Environment',
  'Education',
  'Healthcare',
  'Social',
  'Emergency',
  'Community Development',
  'Skill Development',
  'Infrastructure',
  'Sanitation',
  'Other',
];

// ==================== CATEGORY → ICON MAPPING ====================
const CATEGORY_ICON_MAP: Record<string, string> = {
  'environment': 'Droplets',
  'water': 'Droplets',
  'clean water': 'Droplets',
  'green': 'TreePine',
  'tree': 'TreePine',
  'plantation': 'TreePine',
  'education': 'GraduationCap',
  'school': 'GraduationCap',
  'scholarship': 'GraduationCap',
  'literacy': 'GraduationCap',
  'healthcare': 'Heart',
  'health': 'Heart',
  'medical': 'Heart',
  'hospital': 'Heart',
  'social': 'Users2',
  'women': 'Users2',
  'empowerment': 'Users2',
  'community': 'Users2',
  'community development': 'Users2',
  'emergency': 'HandHeart',
  'disaster': 'HandHeart',
  'relief': 'HandHeart',
  'rehabilitation': 'HandHeart',
  'skill development': 'Wrench',
  'training': 'Wrench',
  'vocational': 'Wrench',
  'infrastructure': 'Building2',
  'construction': 'Building2',
  'sanitation': 'Trash2',
  'waste': 'Trash2',
  'hygiene': 'Trash2',
  'default': 'Heart',
};

function getIconFromCategory(category: string): string {
  if (!category) return 'Heart';
  const lower = category.toLowerCase().trim();

  // Exact match
  if (CATEGORY_ICON_MAP[lower]) return CATEGORY_ICON_MAP[lower];

  // Partial match
  for (const key of Object.keys(CATEGORY_ICON_MAP)) {
    if (key === 'default') continue;
    if (lower.includes(key) || key.includes(lower)) return CATEGORY_ICON_MAP[key];
  }

  return CATEGORY_ICON_MAP['default'];
}

// ==================== HIGHLIGHTS INPUT ====================
function HighlightsInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (highlights: string[]) => void;
}) {
  const [inputVal, setInputVal] = useState('');

  const addHighlights = (raw: string) => {
    const items = raw
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !value.includes(s));
    if (items.length > 0) onChange([...value, ...items]);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addHighlights(inputVal);
    }
    if (e.key === ',') {
      e.preventDefault();
      addHighlights(inputVal);
    }
    if (e.key === 'Backspace' && inputVal === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handleBlur = () => {
    if (inputVal.trim()) addHighlights(inputVal);
  };

  const removeHighlight = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <FormField label="Key Achievements / Highlights">
      <div className="space-y-2">
        {value.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl min-h-[44px]">
            {value.map((highlight, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-lg"
              >
                ✓ {highlight}
                <button
                  type="button"
                  onClick={() => removeHighlight(index)}
                  className="hover:text-emerald-900 transition"
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
            onBlur={handleBlur}
            placeholder="e.g. 50+ Water Plants, 200+ Bore Wells, 25 Villages (Enter or comma to add)"
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          <button
            type="button"
            onClick={() => {
              if (inputVal.trim()) addHighlights(inputVal);
            }}
            className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition flex-shrink-0"
            title="Add highlight"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-400">
          Type and press{' '}
          <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">
            Enter
          </kbd>{' '}
          or{' '}
          <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">
            ,
          </kbd>{' '}
          to add • Backspace removes last • Comma-separated paste works
        </p>
      </div>
    </FormField>
  );
}

// ==================== COMPONENT ====================
export function CSRPage({
  csrInitiatives,
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
}: CSRPageProps) {
  const [form, setForm] = useState({
    title: '',
    category: 'Environment',
    description: '',
    longDescription: '',
    image: '',
    impact: '',
    year: '',
    location: '',
    highlights: [] as string[],
    featured: false,
  });

  const [originalImg, setOriginalImg] = useState('');

  // Form initialization
  useEffect(() => {
    if (modalOpen && editingItem) {
      setForm({
        title: editingItem.title || '',
        category: editingItem.category || 'Environment',
        description: editingItem.description || '',
        longDescription: editingItem.longDescription || '',
        image: editingItem.image || '',
        impact: editingItem.impact || '',
        year: editingItem.year || '',
        location: editingItem.location || '',
        highlights: Array.isArray(editingItem.highlights)
          ? editingItem.highlights
          : [],
        featured: editingItem.featured || false,
      });
      setOriginalImg(editingItem.image || '');
    } else if (modalOpen && !editingItem) {
      setForm({
        title: '',
        category: 'Environment',
        description: '',
        longDescription: '',
        image: '',
        impact: '',
        year: '',
        location: '',
        highlights: [],
        featured: false,
      });
      setOriginalImg('');
    }
  }, [modalOpen, editingItem]);

  const handleFormSubmit = (onSave: (data: any) => void) => {
    const icon = getIconFromCategory(form.category);
    onSave({
      ...form,
      icon,
      highlights: form.highlights,
    });
  };

  const isFormValid =
    form.title.trim() &&
    form.category.trim() &&
    form.description.trim() &&
    form.longDescription.trim() &&
    form.impact.trim() &&
    form.year.trim() &&
    form.location.trim() &&
    form.image;

  return (
    <GenericListPage
      title="CSR Initiatives"
      collection="csr"
      items={csrInitiatives}
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
      renderItem={(initiative) => (
        <div
          key={initiative.id}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition"
        >
          <div className="flex flex-col md:flex-row">
            {/* Image — 2:1 ratio */}
            <div
              className="w-full md:w-64 flex-shrink-0 bg-slate-100 overflow-hidden"
              style={{ aspectRatio: '2/1' }}
            >
              {initiative.image ? (
                <img
                  src={initiative.image}
                  alt={initiative.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://picsum.photos/800/400';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50">
                  <Heart className="w-8 h-8 text-slate-300" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                      {initiative.category}
                    </span>

                    {initiative.featured && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Featured
                      </span>
                    )}

                    <span className="flex items-center gap-1 text-slate-400 text-xs">
                      <MapPin className="w-3 h-3" />
                      {initiative.location}
                    </span>

                    <span className="flex items-center gap-1 text-slate-400 text-xs">
                      <Calendar className="w-3 h-3" />
                      {initiative.year}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-slate-800 mb-1">
                    {initiative.title}
                  </h4>

                  {/* Impact */}
                  {initiative.impact && (
                    <p className="text-sm text-blue-600 font-semibold mb-1 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5" />
                      {initiative.impact}
                    </p>
                  )}

                  <p className="text-sm text-slate-500 line-clamp-2 mb-2">
                    {initiative.description}
                  </p>

                  {/* Highlights */}
                  {Array.isArray(initiative.highlights) &&
                    initiative.highlights.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {initiative.highlights
                          .slice(0, 4)
                          .map((h: string, i: number) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full border border-emerald-200"
                            >
                              ✓ {h}
                            </span>
                          ))}
                        {initiative.highlights.length > 4 && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full">
                            +{initiative.highlights.length - 4} more
                          </span>
                        )}
                      </div>
                    )}

                  {/* Auto icon indicator */}
                  {initiative.icon && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                      <span>Icon:</span>
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-mono text-[10px]">
                        {initiative.icon}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEditModal(initiative)}
                    className="p-2 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-xl transition"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setDeleteConfirm({
                        open: true,
                        id: initiative.id,
                        collection: 'csr',
                      })
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
            {/* Title — full width */}
            <FormInput
              label="Initiative Title"
              value={form.title}
              onChange={(v) => setForm({ ...form, title: v })}
              required
              placeholder="e.g. Clean Water Initiative, Green Earth Program"
            />

            {/* Category + Featured — row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Category dropdown */}
              <FormField label="Category" required>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none"
                >
                  {CSR_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </FormField>

              {/* Featured toggle */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Visibility
                </label>
                <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl h-[42px]">
                  <input
                    type="checkbox"
                    id="csr-featured"
                    checked={form.featured}
                    onChange={(e) =>
                      setForm({ ...form, featured: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <label
                    htmlFor="csr-featured"
                    className="text-sm font-medium text-slate-700 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Featured Initiative
                  </label>
                </div>
              </div>
            </div>

            {/* Auto-icon preview */}
            {form.category && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl">
                <span className="text-xs text-slate-500">
                  Auto-assigned icon:
                </span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-lg font-medium text-xs">
                  {getIconFromCategory(form.category)}
                </span>
                <span className="text-xs text-slate-400">
                  (based on category)
                </span>
              </div>
            )}

            {/* Impact + Year — 2 columns */}
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Impact Statement"
                value={form.impact}
                onChange={(v) => setForm({ ...form, impact: v })}
                required
                placeholder="e.g. 50,000+ Lives Impacted"
              />
              <FormInput
                label="Duration / Year"
                value={form.year}
                onChange={(v) => setForm({ ...form, year: v })}
                required
                placeholder="e.g. 2018 - Present, 2020"
              />
            </div>

            {/* Location — full width */}
            <FormInput
              label="Location"
              value={form.location}
              onChange={(v) => setForm({ ...form, location: v })}
              required
              placeholder="e.g. Rural Gujarat, Pan India, Multiple States"
            />

            {/* Short Description — full width */}
            <div>
              <FormTextarea
                label="Short Description (Card Preview)"
                value={form.description}
                onChange={(v) => setForm({ ...form, description: v })}
                rows={2}
                required
                placeholder="Brief 1-2 sentence summary shown on CSR cards..."
              />
              <p className="text-xs text-slate-400 mt-1">
                {form.description.length}/200 characters recommended
              </p>
            </div>

            {/* Long Description — full width with paragraph support */}
            <div>
              <FormTextarea
                label="Full Description (Detail Modal)"
                value={form.longDescription}
                onChange={(v) => setForm({ ...form, longDescription: v })}
                rows={8}
                required
                placeholder={`Write the full initiative description here...

Start a new paragraph by pressing Enter twice (leave a blank line).

Paragraph 1: Introduction and background of the initiative...

Paragraph 2: What we've achieved, numbers, and impact...

Paragraph 3: Future goals and ongoing efforts...

• Use bullet points with • symbol for lists
• Each line with • becomes a list item`}
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-slate-400">
                  {form.longDescription.trim()
                    ? `${
                        form.longDescription.trim().split(/\s+/).length
                      } words · ${
                        form.longDescription
                          .split(/\n\s*\n/)
                          .filter((p) => p.trim().length > 0).length
                      } paragraphs`
                    : '0 words'}
                </p>
                <p className="text-xs text-slate-400">
                  Press{' '}
                  <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">
                    Enter
                  </kbd>{' '}
                  twice for new paragraph
                </p>
              </div>

              {/* Paragraph preview */}
              {form.longDescription.trim() && (
                <details className="mt-2">
                  <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-700 font-medium">
                    Preview paragraphs (
                    {
                      form.longDescription
                        .split(/\n\s*\n/)
                        .filter((p) => p.trim().length > 0).length
                    }
                    )
                  </summary>
                  <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl max-h-48 overflow-y-auto">
                    {form.longDescription
                      .split(/\n\s*\n/)
                      .filter((p) => p.trim().length > 0)
                      .map((paragraph, idx) => (
                        <div key={idx} className="mb-3 last:mb-0">
                          <span className="text-xs text-slate-400 font-mono">
                            P{idx + 1}:
                          </span>
                          <p className="text-sm text-slate-600 mt-0.5 whitespace-pre-line">
                            {paragraph.trim()}
                          </p>
                        </div>
                      ))}
                  </div>
                </details>
              )}
            </div>

            {/* Highlights — chip input */}
            <HighlightsInput
              value={form.highlights}
              onChange={(highlights) => setForm({ ...form, highlights })}
            />

            {/* Image Uploader — 2:1 ratio, 1600×800 */}
            <ImageUploader
              value={form.image}
              onChange={(url) =>
                setForm((prev) => ({ ...prev, image: url }))
              }
              folder="csr"
              label="Initiative Image (2:1 wide landscape · Recommended 1600×800px)"
              required
              outputWidth={1600}
              outputHeight={800}
              aspectRatio={2 / 1}
              previewWidth={560}
              showToast={showToast}
              previousCloudinaryUrl={originalImg}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-slate-200">
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
              {modalType === 'add'
                ? 'Create Initiative'
                : 'Update Initiative'}
            </button>
          </div>
        </form>
      )}
    />
  );
}