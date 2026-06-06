import React, { useState } from 'react';
import { Save, Edit, Trash2 } from 'lucide-react';
import { GenericListPage } from './GenericListPage';
import { getIconComponent } from '../../utils/iconMap';

interface SimpleCRUDPageProps {
  title: string;
  collection: string;
  items: any[];
  itemFields: (item: any) => { main: string; sub: string; icon?: string; image?: string };
  formFields: (item: any, onChange: (data: any) => void) => React.ReactNode;
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
  modalType2: 'add' | 'edit';
}

export function SimpleCRUDPage({
  title, collection, items, itemFields, formFields,
  modalOpen, modalType, editingItem, deleteConfirm,
  openAddModal, openEditModal, setModalOpen, setEditingItem,
  setDeleteConfirm, handleAdd, handleEdit, handleDelete,
}: SimpleCRUDPageProps) {
  return (
    <GenericListPage
      title={title}
      collection={collection}
      items={items}
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
      renderItem={(item, index) => {
        const fields = itemFields(item);
        return (
          <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {fields.image ? (
                  <img
                    src={fields.image}
                    alt={fields.main}
                    className="w-14 h-14 object-cover rounded-xl"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/60/60'; }}
                  />
                ) : fields.icon ? (
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                    {getIconComponent(fields.icon, 'w-6 h-6 text-slate-600')}
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                )}
                <div>
                  <h4 className="text-lg font-bold text-slate-800">{fields.main}</h4>
                  <p className="text-sm text-slate-500 whitespace-pre-line">{fields.sub}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(item)}
                  className="p-2 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-xl transition"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm({ open: true, id: item.id, collection })}
                  className="p-2 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-xl transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      }}
      renderForm={(item, onSave) => {
        const [form, setForm] = useState(item || {});
        return (
          <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4">
            {formFields(form, (data: any) => setForm({ ...form, ...data }))}
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
        );
      }}
    />
  );
}