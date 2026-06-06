import { useState, useEffect } from 'react';
import { Edit, Trash2, Save, AlertCircle } from 'lucide-react';
import { GenericListPage } from '../generic/GenericListPage';
import { FormInput } from '../common/FormHelpers';
import { getIconComponent } from '../../utils/iconMap';

interface StatsPageProps {
  stats: any[];
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

const MAX_STATS = 4;

export function StatsPage({
  stats, modalOpen, modalType, editingItem, deleteConfirm,
  openAddModal, openEditModal, setModalOpen, setEditingItem,
  setDeleteConfirm, handleAdd, handleEdit, handleDelete, showToast,
}: StatsPageProps) {

  const [form, setForm] = useState({
    value: 0,
    label: '',
  });

  useEffect(() => {
    if (modalOpen && editingItem) {
      setForm({
        value: editingItem.value || 0,
        label: editingItem.label || '',
      });
    } else if (modalOpen && !editingItem) {
      setForm({
        value: 0,
        label: '',
      });
    }
  }, [modalOpen, editingItem]);

  const handleFormSubmit = (onSave: (data: any) => void) => {
    // ✅ Only value and label — no suffix in payload
    onSave({
      value: Number(form.value),
      label: form.label,
    });
  };

  const handleOpenAddModal = () => {
    if (stats.length >= MAX_STATS) {
      showToast(`Maximum ${MAX_STATS} stats cards allowed. Delete one to add a new.`, 'error');
      return;
    }
    openAddModal();
  };

  return (
    <GenericListPage
      title="Stats Cards"
      collection="stats"
      items={stats}
      modalOpen={modalOpen}
      modalType={modalType}
      editingItem={editingItem}
      deleteConfirm={deleteConfirm}
      openAddModal={handleOpenAddModal}
      setModalOpen={setModalOpen}
      setEditingItem={setEditingItem}
      setDeleteConfirm={setDeleteConfirm}
      handleAdd={handleAdd}
      handleEdit={handleEdit}
      handleDelete={handleDelete}
      emptyState={
        <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-sm text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-slate-400" />
          </div>
          <h4 className="text-lg font-semibold text-slate-700 mb-2">No stats yet</h4>
          <p className="text-slate-500 text-sm mb-4">
            Add up to {MAX_STATS} stats cards to display on your homepage
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition"
          >
            Add First Stat
          </button>
        </div>
      }
      renderItem={(stat) => (
        <div key={stat.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: (stat.color || '#d4a017') + '20' }}
              >
                {getIconComponent(stat.icon || 'Star', 'w-6 h-6')}
              </div>

              {/* Value + Label */}
              <div>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-2xl font-bold text-slate-800">{stat.value}</span>
                  {/* ✅ + is only visual — not stored in DB */}
                  <span className="text-lg font-semibold text-slate-500">+</span>
                </div>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => openEditModal(stat)}
                className="p-2 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-xl transition"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeleteConfirm({ open: true, id: stat.id, collection: 'stats' })}
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
          <FormInput
            label="Value"
            value={form.value}
            onChange={(v) => setForm({ ...form, value: Number(v) || 0 })}
            type="number"
            required
            placeholder="e.g. 500"
          />

          <FormInput
            label="Label"
            value={form.label}
            onChange={(v) => setForm({ ...form, label: v })}
            placeholder="e.g. Projects Completed"
            required
          />

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
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition shadow-lg shadow-blue-600/30"
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