import { useState, useEffect } from 'react';
import { Edit, Trash2, Save, User } from 'lucide-react';
import { GenericListPage } from '../generic/GenericListPage';
import { FormInput, FormTextarea } from '../common/FormHelpers';
import { ImageUploader } from '../common/ImageUploader';

interface TeamPageProps {
  team: any[];
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

export function TeamPage({
  team, modalOpen, modalType, editingItem, deleteConfirm,
  openAddModal, openEditModal, setModalOpen, setEditingItem,
  setDeleteConfirm, handleAdd, handleEdit, handleDelete, showToast,
}: TeamPageProps) {
  const [form, setForm] = useState({
    name: '',
    role: '',
    img: '',
    desc: '',
  });

  const [originalImg, setOriginalImg] = useState('');

  useEffect(() => {
    if (modalOpen && editingItem) {
      setForm({
        name: editingItem.name || '',
        role: editingItem.role || '',
        img: editingItem.img || '',
        desc: editingItem.desc || '',
      });
      setOriginalImg(editingItem.img || '');
    } else if (modalOpen && !editingItem) {
      setForm({ name: '', role: '', img: '', desc: '' });
      setOriginalImg('');
    }
  }, [modalOpen, editingItem]);

  const handleFormSubmit = (onSave: (data: any) => void) => {
    onSave(form);
  };

  const isFormValid =
    form.name.trim() &&
    form.role.trim() &&
    form.desc.trim() &&
    form.img;

  return (
    <GenericListPage
      title="Team Members"
      collection="team"
      items={team}
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
      renderItem={(member) => (
        <div
          key={member.id}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-slate-200 flex-shrink-0 bg-slate-100">
                {member.img ? (
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://picsum.photos/200/200';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-200">
                    <User className="w-6 h-6 text-slate-400" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h4 className="text-lg font-bold text-slate-800">{member.name}</h4>
                <p className="text-sm text-blue-600 font-medium">{member.role}</p>
                <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{member.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => openEditModal(member)}
                className="p-2 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-xl transition"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setDeleteConfirm({
                    open: true,
                    id: member.id,
                    collection: 'team',
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
            {/* Square profile image — NOT circular */}
          

            <FormInput
              label="Full Name"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              placeholder="e.g. Chetan Shah"
              required
            />

            <FormInput
              label="Role / Designation"
              value={form.role}
              onChange={(v) => setForm({ ...form, role: v })}
              placeholder="e.g. Managing Director, Chief Engineer"
              required
            />

            <FormTextarea
              label="Description / Bio"
              value={form.desc}
              onChange={(v) => setForm({ ...form, desc: v })}
              rows={3}
              required
              placeholder="Brief description about this team member, their experience, expertise..."
            />

              <ImageUploader
              value={form.img}
              onChange={(url) => setForm((prev) => ({ ...prev, img: url }))}
              folder="team"
              label="Profile Photo (Square · 600×600px)"
              required
              outputWidth={600}
              outputHeight={600}
              aspectRatio={1}
              previewWidth={300}
              showToast={showToast}
              previousCloudinaryUrl={originalImg}
            />
          </div>

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
              {modalType === 'add' ? 'Add Member' : 'Update Member'}
            </button>
          </div>
        </form>
      )}
    />
  );
}