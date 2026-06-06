import { useState, useEffect, useRef } from 'react';
import { Edit, Trash2, Save, Search, ChevronDown } from 'lucide-react';
import { GenericListPage } from '../generic/GenericListPage';
import { FormInput, FormTextarea, FormField } from '../common/FormHelpers';
import { getIconComponent } from '../../utils/iconMap';

const ICON_GROUPS: Record<string, { icons: string[]; label: string }> = {
  achievements: {
    label: 'Achievements & Awards',
    icons: ['Award', 'Trophy', 'Star', 'Crown', 'Target', 'TrendingUp'],
  },
  business: {
    label: 'Business & Industry',
    icons: ['Briefcase', 'Building2', 'Factory', 'Wallet', 'Calculator', 'Handshake'],
  },
  technology: {
    label: 'Technology & Digital',
    icons: ['Cpu', 'Code', 'Globe', 'Rocket', 'Activity', 'FlaskConical'],
  },
  safety: {
    label: 'Safety & Quality',
    icons: ['Shield', 'ShieldCheck', 'HardHat', 'HeartPulse', 'Eye'],
  },
  services: {
    label: 'Services & Operations',
    icons: ['Wrench', 'Droplets', 'Mountain', 'Trash2', 'Truck', 'Package'],
  },
  people: {
    label: 'People & Education',
    icons: ['Users', 'Users2', 'BookOpen', 'Coffee', 'Megaphone'],
  },
  travel: {
    label: 'Travel & Transport',
    icons: ['Plane', 'Truck', 'Globe', 'Rocket'],
  },
};

// Flat list of all unique icons
const ALL_ICONS = [...new Set(Object.values(ICON_GROUPS).flatMap((g) => g.icons))];


function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (icon: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Filter icons by search
  const filteredGroups = Object.entries(ICON_GROUPS)
    .map(([key, group]) => ({
      key,
      label: group.label,
      icons: group.icons.filter((icon) =>
        icon.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((g) => g.icons.length > 0);

  return (
    <FormField label="Icon" required>
      <div ref={dropdownRef} className="relative">

        {/* Selected Icon Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center gap-3 px-4 py-2.5 bg-slate-50 border rounded-xl text-sm transition ${
            isOpen
              ? 'border-blue-500 ring-2 ring-blue-500'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          {/* Icon preview */}
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            {getIconComponent(value, 'w-4 h-4 text-blue-600')}
          </div>
          <span className="flex-1 text-left text-slate-700 font-medium">{value}</span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">

            {/* Search */}
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search icons..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Icon Groups */}
            <div className="max-h-80 overflow-y-auto p-2">
              {filteredGroups.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">
                  No icons matching "{search}"
                </div>
              ) : (
                filteredGroups.map((group) => (
                  <div key={group.key} className="mb-3 last:mb-0">
                    {/* Group label */}
                    <div className="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {group.label}
                    </div>

                    {/* Icon grid */}
                    <div className="grid grid-cols-6 gap-1 px-1">
                      {group.icons.map((icon) => {
                        const isSelected = value === icon;
                        return (
                          <button
                            key={`${group.key}-${icon}`}
                            type="button"
                            onClick={() => {
                              onChange(icon);
                              setIsOpen(false);
                              setSearch('');
                            }}
                            title={icon}
                            className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-md scale-105'
                                : 'hover:bg-slate-100 text-slate-600'
                            }`}
                          >
                            {getIconComponent(
                              icon,
                              `w-5 h-5 ${isSelected ? 'text-white' : 'text-slate-600'}`
                            )}
                            <span className={`text-[9px] leading-tight truncate w-full text-center ${
                              isSelected ? 'text-blue-100' : 'text-slate-400'
                            }`}>
                              {icon}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Currently selected footer */}
            <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Selected:</span>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg font-medium">
                  {getIconComponent(value, 'w-3.5 h-3.5')}
                  <span>{value}</span>
                </div>
              </div>
              <span className="text-xs text-slate-400">{ALL_ICONS.length} icons</span>
            </div>
          </div>
        )}
      </div>
    </FormField>
  );
}


interface AchievementsPageProps {
  achievements: any[];
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

export function AchievementsPage({
  achievements, modalOpen, modalType, editingItem, deleteConfirm,
  openAddModal, openEditModal, setModalOpen, setEditingItem,
  setDeleteConfirm, handleAdd, handleEdit, handleDelete,
}: AchievementsPageProps) {

  const [form, setForm] = useState({
    icon: 'Award',
    title: '',
    desc: '',
    year: '',
  });

  useEffect(() => {
    if (modalOpen && editingItem) {
      setForm({
        icon: editingItem.icon || 'Award',
        title: editingItem.title || '',
        desc: editingItem.desc || '',
        year: editingItem.year || '',
      });
    } else if (modalOpen && !editingItem) {
      setForm({
        icon: 'Award',
        title: '',
        desc: '',
        year: String(new Date().getFullYear()),
      });
    }
  }, [modalOpen, editingItem]);

  const handleFormSubmit = (onSave: (data: any) => void) => {
    onSave(form);
  };

  const isFormValid =
    form.title.trim() &&
    form.desc.trim() &&
    form.year.trim() &&
    form.icon;

  return (
    <GenericListPage
      title="Achievements"
      collection="achievements"
      items={achievements}
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
      renderItem={(achievement) => (
        <div key={achievement.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className="w-12 h-12 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl flex items-center justify-center border border-amber-200 flex-shrink-0">
                {getIconComponent(achievement.icon, 'w-6 h-6 text-amber-600')}
              </div>

              {/* Info */}
              <div>
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <h4 className="text-lg font-bold text-slate-800">{achievement.title}</h4>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                    {achievement.year}
                  </span>
                </div>
                <p className="text-sm text-slate-500">{achievement.desc}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => openEditModal(achievement)}
                className="p-2 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-xl transition"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeleteConfirm({ open: true, id: achievement.id, collection: 'achievements' })}
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
          className="space-y-4"
        >
          {/* Icon Picker — visual grid */}
          <IconPicker
            value={form.icon}
            onChange={(icon) => setForm({ ...form, icon })}
          />

          {/* Title */}
          <FormInput
            label="Title"
            value={form.title}
            onChange={(v) => setForm({ ...form, title: v })}
            placeholder="e.g. First SAP Implementation in India"
            required
          />

          {/* Year */}
          <FormInput
            label="Year"
            value={form.year}
            onChange={(v) => setForm({ ...form, year: v })}
            placeholder="e.g. 2008"
            required
          />

          {/* Description */}
          <FormTextarea
            label="Description"
            value={form.desc}
            onChange={(v) => setForm({ ...form, desc: v })}
            rows={2}
            required
            placeholder="e.g. First company in India to implement SAP for entire business operations..."
          />

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
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
              {modalType === 'add' ? 'Create' : 'Update'}
            </button>
          </div>
        </form>
      )}
    />
  );
}