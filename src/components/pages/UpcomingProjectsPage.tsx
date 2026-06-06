import { useState, useEffect } from 'react';
import { Edit, Trash2, Save, Plus, X } from 'lucide-react';
import { GenericListPage } from '../generic/GenericListPage';
import { FormInput, FormTextarea, FormField } from '../common/FormHelpers';
import { ImageUploader } from '../common/ImageUploader';

interface UpcomingProjectsPageProps {
  upcomingProjects: any[];
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

// ==================== CATEGORY → ICON MAPPING ====================
const CATEGORY_ICON_MAP: Record<string, string> = {
  'effluent treatment': 'Droplets',
  'water treatment': 'Droplets',
  'etp': 'Droplets',
  'wastewater': 'Droplets',
  'seismic survey': 'Mountain',
  'seismic': 'Mountain',
  '2d survey': 'Mountain',
  '3d survey': 'Mountain',
  'geophysical': 'Mountain',
  'waste management': 'Trash2',
  'waste disposal': 'Trash2',
  'hazardous waste': 'Trash2',
  'equipment supply': 'Wrench',
  'equipment': 'Wrench',
  'machinery': 'Wrench',
  'supply': 'Package',
  'safety': 'ShieldCheck',
  'hse': 'ShieldCheck',
  'health & safety': 'ShieldCheck',
  'transport': 'Truck',
  'logistics': 'Truck',
  'trucking': 'Truck',
  'construction': 'HardHat',
  'civil': 'HardHat',
  'infrastructure': 'Building2',
  'oil & gas': 'Factory',
  'oilfield': 'Factory',
  'petroleum': 'Factory',
  'drilling': 'Factory',
  'international': 'Rocket',
  'overseas': 'Rocket',
  'default': 'FolderKanban',
};

function getIconFromCategory(category: string): string {
  if (!category) return 'FolderKanban';
  const lower = category.toLowerCase().trim();
  if (CATEGORY_ICON_MAP[lower]) return CATEGORY_ICON_MAP[lower];
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
    if (e.key === 'Enter') { e.preventDefault(); addHighlights(inputVal); }
    if (e.key === ',') { e.preventDefault(); addHighlights(inputVal); }
  };

  const handleBlur = () => { if (inputVal.trim()) addHighlights(inputVal); };

  const removeHighlight = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <FormField label="Highlights">
      <div className="space-y-2">
        {value.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl min-h-[44px]">
            {value.map((highlight, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg"
              >
                {highlight}
                <button
                  type="button"
                  onClick={() => removeHighlight(index)}
                  className="hover:text-blue-900 transition"
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
            placeholder="e.g. 800 Sq Km, Offshore Operations (press Enter or comma to add)"
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          <button
            type="button"
            onClick={() => { if (inputVal.trim()) addHighlights(inputVal); }}
            className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition flex-shrink-0"
            title="Add highlight"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-400">
          Type and press{' '}
          <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">Enter</kbd>
          {' '}or{' '}
          <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">,</kbd>
          {' '}to add • Comma-separated paste also works
        </p>
      </div>
    </FormField>
  );
}

// ==================== COMPONENT ====================
export function UpcomingProjectsPage({
  upcomingProjects, modalOpen, modalType, editingItem, deleteConfirm,
  openAddModal, openEditModal, setModalOpen, setEditingItem,
  setDeleteConfirm, handleAdd, handleEdit, handleDelete, showToast,
}: UpcomingProjectsPageProps) {

  const [form, setForm] = useState({
    title: '',
    client: '',
    location: '',
    category: '',
    image: '',
    estimatedDuration: '',
    description: '',
    highlights: [] as string[],
  });

  const [originalImg, setOriginalImg] = useState('');

  useEffect(() => {
    if (modalOpen && editingItem) {
      setForm({
        title: editingItem.title || '',
        client: editingItem.client || '',
        location: editingItem.location || '',
        category: editingItem.category || '',
        image: editingItem.image || '',
        estimatedDuration: editingItem.estimatedDuration || '',
        description: editingItem.description || '',
        highlights: Array.isArray(editingItem.highlights) ? editingItem.highlights : [],
      });
      setOriginalImg(editingItem.image || '');
    } else if (modalOpen && !editingItem) {
      setForm({
        title: '',
        client: '',
        location: '',
        category: '',
        image: '',
        estimatedDuration: '',
        description: '',
        highlights: [],
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
    form.client.trim() &&
    form.location.trim() &&
    form.description.trim() &&
    form.estimatedDuration.trim() &&
    form.image;

  return (
    <GenericListPage
      title="Upcoming Projects"
      collection="upcoming-projects"
      items={upcomingProjects}
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
      renderItem={(project) => (
        <div key={project.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition">
          <div className="flex flex-col md:flex-row">

            {/* Image — 3:2 ratio */}
            <div
              className="w-full md:w-56 flex-shrink-0 bg-slate-100 overflow-hidden"
              style={{ aspectRatio: '3/2' }}
            >
              {project.image ? (
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/600/400'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-slate-300 text-xs">No image</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">

                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {project.category && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        {project.category}
                      </span>
                    )}
                    <span className="text-slate-400 text-xs">📍 {project.location}</span>
                    {project.estimatedDuration && (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-200">
                        ⏱ {project.estimatedDuration}
                      </span>
                    )}
                  </div>

                  <h4 className="text-lg font-bold text-slate-800 mb-1">{project.title}</h4>

                  <p className="text-sm text-slate-500 mb-1">
                    Client: <span className="font-medium text-slate-700">{project.client}</span>
                  </p>

                  {project.description && (
                    <p className="text-sm text-slate-500 line-clamp-1 mb-1">{project.description}</p>
                  )}

                  {/* Highlights */}
                  {Array.isArray(project.highlights) && project.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {project.highlights.slice(0, 4).map((h: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full border border-emerald-200"
                        >
                          ✓ {h}
                        </span>
                      ))}
                      {project.highlights.length > 4 && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full">
                          +{project.highlights.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEditModal(project)}
                    className="p-2 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-xl transition"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ open: true, id: project.id, collection: 'upcoming-projects' })}
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

            {/* Project Title — full width */}
            <FormInput
              label="Project Title"
              value={form.title}
              onChange={(v) => setForm({ ...form, title: v })}
              required
              placeholder="e.g. 3D Seismic Survey - Krishna Godavari Basin"
            />

            {/* Category — full width with auto-icon */}
            <div>
              <FormInput
                label="Category"
                value={form.category}
                onChange={(v) => setForm({ ...form, category: v })}
                placeholder="e.g. Seismic Survey, Effluent Treatment, International..."
              />
              {form.category && (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                  <span>Auto icon:</span>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg font-medium">
                    {getIconFromCategory(form.category)}
                  </span>
                </div>
              )}
            </div>

            {/* Client + Location — 2 columns */}
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Client"
                value={form.client}
                onChange={(v) => setForm({ ...form, client: v })}
                required
                placeholder="e.g. ONGC"
              />
              <FormInput
                label="Location"
                value={form.location}
                onChange={(v) => setForm({ ...form, location: v })}
                required
                placeholder="e.g. Andhra Pradesh"
              />
            </div>

            {/* Estimated Duration — full width */}
            <FormInput
              label="Estimated Duration"
              value={form.estimatedDuration}
              onChange={(v) => setForm({ ...form, estimatedDuration: v })}
              required
              placeholder="e.g. 18 months, 2 years, 36 months"
            />

            {/* Description — full width */}
            <FormTextarea
              label="Description"
              value={form.description}
              onChange={(v) => setForm({ ...form, description: v })}
              rows={2}
              required
              placeholder="e.g. Large-scale 3D seismic acquisition project covering 800 sq km in the offshore KG Basin..."
            />

            {/* Highlights — full width */}
            <HighlightsInput
              value={form.highlights}
              onChange={(highlights) => setForm({ ...form, highlights })}
            />

            {/* Image Uploader — full width */}
            <ImageUploader
              value={form.image}
              onChange={(url) => setForm((prev) => ({ ...prev, image: url }))}
              folder="projects"
              label="Project Image (3:2 ratio · Recommended 1200×800px)"
              required
              outputWidth={1200}
              outputHeight={800}
              aspectRatio={3 / 2}
              previewWidth={560}
              showToast={showToast}
              previousCloudinaryUrl={originalImg}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => { setModalOpen(false); setEditingItem(null); }}
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
              {modalType === 'add' ? 'Create Project' : 'Update Project'}
            </button>
          </div>
        </form>
      )}
    />
  );
}