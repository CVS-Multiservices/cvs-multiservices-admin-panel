import { useState, useEffect } from 'react';
import { Star, Edit, Trash2, Save } from 'lucide-react';
import { GenericListPage } from '../generic/GenericListPage';
import { FormInput, FormTextarea } from '../common/FormHelpers';
import { ImageUploader } from '../common/ImageUploader';

interface TestimonialsPageProps {
  testimonials: any[];
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

export function TestimonialsPage({
  testimonials, modalOpen, modalType, editingItem, deleteConfirm,
  openAddModal, openEditModal, setModalOpen, setEditingItem,
  setDeleteConfirm, handleAdd, handleEdit, handleDelete, showToast,
}: TestimonialsPageProps) {
  const [form, setForm] = useState({
    name: '',
    role: '',
    company: '',
    image: '',
    rating: 5,
    text: '',
    project: '',
    date: new Date().toISOString().split('T')[0],
    featured: false,
  });

  const [originalImg, setOriginalImg] = useState('');

  useEffect(() => {
    if (modalOpen && editingItem) {
      setForm({
        name: editingItem.name || '',
        role: editingItem.role || '',
        company: editingItem.company || '',
        image: editingItem.image || '',
        rating: editingItem.rating || 5,
        text: editingItem.text || '',
        project: editingItem.project || '',
        date: editingItem.date || new Date().toISOString().split('T')[0],
        featured: editingItem.featured || false,
      });
      setOriginalImg(editingItem.image || '');
    } else if (modalOpen && !editingItem) {
      setForm({
        name: '',
        role: '',
        company: '',
        image: '',
        rating: 5,
        text: '',
        project: '',
        date: new Date().toISOString().split('T')[0],
        featured: false,
      });
      setOriginalImg('');
    }
  }, [modalOpen, editingItem]);

  const handleFormSubmit = (onSave: (data: any) => void) => {
    onSave({ ...form, rating: Number(form.rating) });
  };

  const isFormValid =
    form.name.trim() &&
    form.role.trim() &&
    form.company.trim() &&
    form.text.trim() &&
    form.image;

  return (
    <GenericListPage
      title="Testimonials"
      collection="testimonials"
      items={testimonials}
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
      renderItem={(testimonial) => (
        <div key={testimonial.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* ✅ Circular avatar display with checkerboard for transparency */}
              <div className="relative w-14 h-14 flex-shrink-0">
                <div
                  className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-200"
                  style={{
                    backgroundImage:
                      'linear-gradient(45deg, #f1f5f9 25%, transparent 25%), linear-gradient(-45deg, #f1f5f9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f1f5f9 75%), linear-gradient(-45deg, transparent 75%, #f1f5f9 75%)',
                    backgroundSize: '8px 8px',
                    backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
                  }}
                >
                  {testimonial.image ? (
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://picsum.photos/200/200';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center rounded-full">
                      <span className="text-slate-400 text-lg font-bold">
                        {testimonial.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-lg font-bold text-slate-800">
                    {testimonial.name}
                  </h4>
                  {testimonial.featured && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                      ⭐ Featured
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500">
                  {testimonial.role} • {testimonial.company}
                </p>
                <div className="flex items-center gap-0.5 my-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < (testimonial.rating || 5)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-slate-600 italic">
                  "{testimonial.text?.substring(0, 150)}..."
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => openEditModal(testimonial)}
                className="p-2 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-xl transition"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setDeleteConfirm({
                    open: true,
                    id: testimonial.id,
                    collection: 'testimonials',
                  })
                }
                className="p-2 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-xl transition"
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
            label="Name"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            required
            placeholder="e.g. John Doe"
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Role"
              value={form.role}
              onChange={(v) => setForm({ ...form, role: v })}
              required
              placeholder="e.g. CEO"
            />
            <FormInput
              label="Company"
              value={form.company}
              onChange={(v) => setForm({ ...form, company: v })}
              required
              placeholder="e.g. ONGC"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Rating
              </label>
              <div className="flex items-center gap-1 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setForm({ ...form, rating: star })}
                    className="p-0.5 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 transition ${
                        star <= form.rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-200 hover:text-amber-200'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-slate-500 font-medium">
                  {form.rating}/5
                </span>
              </div>
            </div>
            <FormInput
              label="Date"
              value={form.date}
              onChange={(v) => setForm({ ...form, date: v })}
              type="date"
            />
          </div>
          <FormInput
            label="Project"
            value={form.project}
            onChange={(v) => setForm({ ...form, project: v })}
            placeholder="Project they worked on (optional)"
          />
          <FormTextarea
            label="Testimonial Text"
            value={form.text}
            onChange={(v) => setForm({ ...form, text: v })}
            rows={4}
            required
            placeholder="Write the testimonial quote here..."
          />
        
             {/* ✅ Circular Image Uploader — centered at top */}
          <ImageUploader
            value={form.image}
            onChange={(url) => setForm((prev) => ({ ...prev, image: url }))}
            folder="testimonials"
            label="Profile Photo (Circular Crop)"
            required
            outputWidth={400}
            outputHeight={400}
            aspectRatio={1}
            previewWidth={280}
            showToast={showToast}
            previousCloudinaryUrl={originalImg}
            circular
          />
            <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <input
              type="checkbox"
              id="featured"
              checked={form.featured}
              onChange={(e) =>
                setForm({ ...form, featured: e.target.checked })
              }
              className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            <label
              htmlFor="featured"
              className="text-sm font-medium text-slate-700"
            >
              ⭐ Featured testimonial{' '}
              <span className="text-xs text-slate-400 font-normal">
                : appears prominently on homepage
              </span>
            </label>
            
          </div>

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
              disabled={!isFormValid}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {modalType === 'add' ? 'Create Testimonial' : 'Update Testimonial'}
            </button>
          </div>
        </form>
      )}
    />
  );
}