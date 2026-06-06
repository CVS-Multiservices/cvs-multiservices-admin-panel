import { useState, useEffect } from 'react';
import { Edit, Trash2, Save, Plus, X, Sparkles, Search } from 'lucide-react';
import { GenericListPage } from '../generic/GenericListPage';
import { FormInput, FormTextarea, FormField } from '../common/FormHelpers';
import { getIconComponent, iconMap } from '../../utils/iconMap';

interface TimelinePageProps {
  timelineEvents: any[];
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
}

// ==================== ICON PICKER ====================
function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (iconName: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const allIcons = Object.keys(iconMap);
  const filteredIcons = search
    ? allIcons.filter((name) =>
        name.toLowerCase().includes(search.toLowerCase())
      )
    : allIcons;

  return (
    <FormField label="Icon">
      <div className="space-y-2">
        {/* Selected icon preview */}
        <div
          className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            {getIconComponent(value, 'w-5 h-5 text-blue-600')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700">{value}</p>
            <p className="text-xs text-slate-400">Click to change icon</p>
          </div>
          <div
            className={`w-6 h-6 flex items-center justify-center text-slate-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          >
            ▾
          </div>
        </div>

        {/* Icon grid dropdown */}
        {isOpen && (
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-lg">
            {/* Search */}
            <div className="p-3 border-b border-slate-200 sticky top-0 bg-white z-10">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search icons..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  autoFocus
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                {filteredIcons.length} of {allIcons.length} icons
              </p>
            </div>

            {/* Grid */}
            <div className="p-3 max-h-52 overflow-y-auto">
              {filteredIcons.length > 0 ? (
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
                  {filteredIcons.map((iconName) => {
                    const isSelected = value === iconName;
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => {
                          onChange(iconName);
                          setIsOpen(false);
                          setSearch('');
                        }}
                        title={iconName}
                        className={`w-full aspect-square flex items-center justify-center rounded-xl transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-110 ring-2 ring-blue-300'
                            : 'bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:scale-105'
                        }`}
                      >
                        {getIconComponent(
                          iconName,
                          `w-4 h-4 ${isSelected ? 'text-white' : ''}`
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 text-sm">
                  No icons match "{search}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </FormField>
  );
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
    <FormField label="Highlights / Milestones">
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
            placeholder="e.g. First Office, 10 Employees, ISO Certified (Enter or comma to add)"
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
export function TimelinePage({
  timelineEvents,
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
}: TimelinePageProps) {
  const [form, setForm] = useState({
    year: '',
    title: '',
    subtitle: '',
    description: '',
    highlights: [] as string[],
    icon: 'Building2',
    featured: false,
  });

  useEffect(() => {
    if (modalOpen && editingItem) {
      setForm({
        year: editingItem.year || '',
        title: editingItem.title || '',
        subtitle: editingItem.subtitle || '',
        description: editingItem.description || '',
        highlights: Array.isArray(editingItem.highlights)
          ? editingItem.highlights
          : [],
        icon: editingItem.icon || 'Building2',
        featured: editingItem.featured || false,
      });
    } else if (modalOpen && !editingItem) {
      setForm({
        year: String(new Date().getFullYear()),
        title: '',
        subtitle: '',
        description: '',
        highlights: [],
        icon: 'Building2',
        featured: false,
      });
    }
  }, [modalOpen, editingItem]);

  const handleFormSubmit = (onSave: (data: any) => void) => {
    onSave({
      ...form,
      highlights: form.highlights,
    });
  };

  const isFormValid =
    form.year.trim() && form.title.trim() && form.description.trim();

  return (
    <GenericListPage
      title="Timeline Events"
      collection="timeline"
      items={timelineEvents}
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
      renderItem={(event) => (
        <div
          key={event.id}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  event.featured ? 'bg-blue-600' : 'bg-slate-100'
                }`}
              >
                {getIconComponent(
                  event.icon,
                  `w-6 h-6 ${
                    event.featured ? 'text-white' : 'text-slate-600'
                  }`
                )}
              </div>

              <div className="min-w-0">
                {/* Badges */}
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="px-2.5 py-0.5 bg-slate-800 text-white text-xs font-bold rounded-full">
                    {event.year}
                  </span>
                  {event.featured && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Featured
                    </span>
                  )}
                  {event.icon && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-mono rounded">
                      {event.icon}
                    </span>
                  )}
                </div>

                <h4 className="text-lg font-bold text-slate-800">
                  {event.title}
                </h4>

                {event.subtitle && (
                  <p className="text-sm text-slate-500">{event.subtitle}</p>
                )}

                {event.description && (
                  <p className="text-sm text-slate-400 mt-0.5 line-clamp-2">
                    {event.description}
                  </p>
                )}

                {/* Highlights */}
                {Array.isArray(event.highlights) &&
                  event.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {event.highlights
                        .slice(0, 4)
                        .map((h: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full border border-emerald-200"
                          >
                            ✓ {h}
                          </span>
                        ))}
                      {event.highlights.length > 4 && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full">
                          +{event.highlights.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => openEditModal(event)}
                className="p-2 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-xl transition"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setDeleteConfirm({
                    open: true,
                    id: event.id,
                    collection: 'timeline',
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
      )}
      renderForm={(_item, onSave) => (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleFormSubmit(onSave);
          }}
        >
          <div className="space-y-4">
            {/* Year + Subtitle — 2 columns on larger, stacked on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Year"
                value={form.year}
                onChange={(v) => setForm({ ...form, year: v })}
                placeholder="e.g. 1997, 2005, 2024"
                required
              />
              <FormInput
                label="Subtitle"
                value={form.subtitle}
                onChange={(v) => setForm({ ...form, subtitle: v })}
                placeholder="e.g. Foundation, Expansion, Milestone"
              />
            </div>

            {/* Title — full width */}
            <FormInput
              label="Title"
              value={form.title}
              onChange={(v) => setForm({ ...form, title: v })}
              required
              placeholder="e.g. Humble Beginnings, International Expansion"
            />

            {/* Description — full width */}
            <FormTextarea
              label="Description"
              value={form.description}
              onChange={(v) => setForm({ ...form, description: v })}
              rows={3}
              required
              placeholder="Describe this milestone or event in detail..."
            />

            {/* Highlights — chip input */}
            <HighlightsInput
              value={form.highlights}
              onChange={(highlights) => setForm({ ...form, highlights })}
            />

            {/* Icon Picker */}
            <IconPicker
              value={form.icon}
              onChange={(icon) => setForm({ ...form, icon })}
            />

            {/* Featured toggle */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <input
                type="checkbox"
                id="timeline-featured"
                checked={form.featured}
                onChange={(e) =>
                  setForm({ ...form, featured: e.target.checked })
                }
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="timeline-featured"
                className="text-sm font-medium text-slate-700 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                Featured Event
                <span className="text-xs text-slate-400 font-normal">
                  — highlighted prominently on timeline
                </span>
              </label>
            </div>
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
              {modalType === 'add' ? 'Create Event' : 'Update Event'}
            </button>
          </div>
        </form>
      )}
    />
  );
}