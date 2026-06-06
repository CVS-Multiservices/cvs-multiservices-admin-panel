import { useState, useEffect } from 'react';
import { Edit, Trash2, Save, Image as ImageIcon } from 'lucide-react';
import { GenericListPage } from '../generic/GenericListPage';
import { FormInput } from '../common/FormHelpers';
import { ImageUploader } from '../common/ImageUploader';

// ==================== PROPS ====================
interface GalleryPageProps {
  galleryItems: any[];
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

// ==================== COMPONENT ====================
export function GalleryPage({
  galleryItems,
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
}: GalleryPageProps) {
  const [form, setForm] = useState({
    title: '',
    image: '',
  });

  const [originalImg, setOriginalImg] = useState('');

  // ==================== SYNC FORM WITH EDITING ITEM ====================
  useEffect(() => {
    if (modalOpen && editingItem) {
      setForm({
        title: editingItem.title || '',
        image: editingItem.image || '',
      });
      setOriginalImg(editingItem.image || '');
    } else if (modalOpen && !editingItem) {
      setForm({ title: '', image: '' });
      setOriginalImg('');
    }
  }, [modalOpen, editingItem]);

  // ==================== SUBMIT ====================
  const handleFormSubmit = (onSave: (data: any) => void) => {
    onSave({ ...form });
  };

  // ==================== VALIDATION ====================
  const isFormValid = form.title.trim() && form.image;

  return (
    <GenericListPage
      title="Gallery"
      collection="gallery"
      items={galleryItems}
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

      // ==================== LIST ROW CARD ====================
      renderItem={(item, index) => (
        <div
          key={item.id}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition group"
        >
          <div className="flex items-center gap-4 p-3">

            {/* ── Index number ── */}
            <span className="w-7 text-center text-xs font-semibold text-slate-400 flex-shrink-0">
              {index + 1}
            </span>

            {/* ── Thumbnail — fixed small 4:3 box ── */}
            <div
              className="flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200"
              style={{ width: '80px', height: '60px' }}  // 4:3 → 80×60
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://picsum.photos/80/60';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-slate-300" />
                </div>
              )}
            </div>

            {/* ── Title + resolution badge ── */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {item.title}
              </p>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                <ImageIcon className="w-3 h-3" />
                1200 × 900 px · 4:3
              </p>
            </div>

            {/* ── Actions ── */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => openEditModal(item)}
                className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setDeleteConfirm({
                    open: true,
                    id: item.id,
                    collection: 'gallery',
                  })
                }
                className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      // ==================== FORM ====================
      renderForm={(_item, onSave) => (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleFormSubmit(onSave);
          }}
        >
          <div className="space-y-4">
            {/* Title */}
            <FormInput
              label="Image Title"
              value={form.title}
              onChange={(v) => setForm({ ...form, title: v })}
              required
              placeholder="e.g. Seismic Survey Operations – Rajasthan Basin 2024"
            />

            {/* Image Uploader — 4:3, 1200×900 */}
            <ImageUploader
              value={form.image}
              onChange={(url) => setForm((prev) => ({ ...prev, image: url }))}
              folder="gallery"
              label="Gallery Image (4:3 ratio · Recommended 1200×900px)"
              required
              outputWidth={1200}
              outputHeight={900}
              aspectRatio={4 / 3}
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
              {modalType === 'add' ? 'Add Image' : 'Update Image'}
            </button>
          </div>
        </form>
      )}
    />
  );
}