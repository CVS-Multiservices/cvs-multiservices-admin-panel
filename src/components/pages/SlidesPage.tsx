import { useState, useEffect } from 'react';
import { Edit, Trash2, Save, ImageIcon } from 'lucide-react';
import { GenericListPage } from '../generic/GenericListPage';
import { FormInput } from '../common/FormHelpers';
import { ImageUploader, InlineLoader } from '../common/ImageUploader';
import { uploadApi } from '../../services/api';

interface SlidesPageProps {
  slides: any[];
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

export function SlidesPage({
  slides, modalOpen, modalType, editingItem, deleteConfirm,
  openAddModal, openEditModal, setModalOpen, setEditingItem,
  setDeleteConfirm, handleAdd, handleEdit, handleDelete, showToast,
}: SlidesPageProps) {
  const [form, setForm] = useState({
    title: '',
    img: '',
  });

  const [originalImg, setOriginalImg] = useState('');
  const [isDeletingSlide, setIsDeletingSlide] = useState(false);

  useEffect(() => {
    if (modalOpen && editingItem) {
      setForm({
        title: editingItem.title || '',
        img: editingItem.img || '',
      });
      setOriginalImg(editingItem.img || '');
    } else if (modalOpen && !editingItem) {
      setForm({ title: '', img: '' });
      setOriginalImg('');
    }
  }, [modalOpen, editingItem]);

  const handleFormSubmit = (onSave: (data: any) => void) => {
    onSave(form);
  };

  const handleDeleteWithCloudinary = async (collection: string, id: any) => {
    const slide = slides.find((s) => s.id === id);
    setIsDeletingSlide(true);

    if (slide?.img && slide.img.includes('cloudinary.com')) {
      try {
        await uploadApi.delete(slide.img);
      } catch {
        // Silent fail — still delete from DB
      }
    }

    await handleDelete(collection, id);
    setIsDeletingSlide(false);
    showToast('Slide deleted successfully!', 'success');
  };

  return (
    <>
      {isDeletingSlide && (
        <InlineLoader message="Deleting slide and removing image from Cloudinary..." />
      )}

      <GenericListPage
        title="Hero Slides"
        collection="slides"
        items={slides}
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
        handleDelete={handleDeleteWithCloudinary}
        renderItem={(slide, index) => (
          <div
            key={slide.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition"
          >
            <div className="flex flex-col sm:flex-row">
              {/* Thumbnail */}
              <div className="w-full sm:w-48 h-32 bg-slate-100 flex-shrink-0 overflow-hidden">
                {slide.img ? (
                  <img
                    src={slide.img}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-slate-400 text-xs">#{index + 1}</span>
                      {slide.img?.includes('cloudinary.com') && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                          ☁ Cloudinary
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-bold text-slate-800">
                      {slide.title || (
                        <span className="text-slate-400 font-normal italic">
                          No title
                        </span>
                      )}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEditModal(slide)}
                      className="p-2 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-xl transition"
                      title="Edit slide"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteConfirm({
                          open: true,
                          id: slide.id,
                          collection: 'slides',
                        })
                      }
                      className="p-2 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-xl transition"
                      title="Delete slide"
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
            className="space-y-4"
          >
            {/* Title only */}
            <FormInput
              label="Title"
              value={form.title}
              onChange={(v) => setForm({ ...form, title: v })}
              required
              placeholder="e.g. SEISMIC SURVEY"
            />

            {/* Image uploader */}
            <ImageUploader
              value={form.img}
              onChange={(url) => setForm((prev) => ({ ...prev, img: url }))}
              folder="slides"
              label="Slide Image"
              required
              outputWidth={1600}
              outputHeight={900}
              aspectRatio={16 / 9}
              previewWidth={560}
              showToast={showToast}
              previousCloudinaryUrl={originalImg}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
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
                disabled={!form.img || !form.title}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500
                           text-white font-medium rounded-xl transition shadow-lg
                           shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {modalType === 'add' ? 'Create Slide' : 'Update Slide'}
              </button>
            </div>
          </form>
        )}
      />
    </>
  );
}