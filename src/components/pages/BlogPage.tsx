import { useState, useEffect } from 'react';
import { Edit, Trash2, Save, Plus, X, Calendar, Clock, User, Tag } from 'lucide-react';
import { GenericListPage } from '../generic/GenericListPage';
import { FormInput, FormTextarea, FormField } from '../common/FormHelpers';
import { ImageUploader } from '../common/ImageUploader';

interface BlogPageProps {
  blogPosts: any[];
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
const BLOG_CATEGORIES = [
  'Company Update',
  'Achievement',
  'Project Milestone',
  'Team',
  'Industry',
  'Technology',
  'HSE',
  'CSR',
  'Press Release',
];

// ==================== TAGS INPUT (same pattern as HighlightsInput) ====================
function TagsInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
}) {
  const [inputVal, setInputVal] = useState('');

  const addTags = (raw: string) => {
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
      addTags(inputVal);
    }
    if (e.key === ',') {
      e.preventDefault();
      addTags(inputVal);
    }
    // Backspace removes last tag when input is empty
    if (e.key === 'Backspace' && inputVal === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handleBlur = () => {
    if (inputVal.trim()) addTags(inputVal);
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <FormField label="Tags">
      <div className="space-y-2">
        {value.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl min-h-[44px]">
            {value.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg"
              >
                <Tag className="w-3 h-3" />
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(index)}
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
            placeholder="e.g. Seismic Survey, Oil & Gas, New Contract (press Enter or comma)"
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          <button
            type="button"
            onClick={() => {
              if (inputVal.trim()) addTags(inputVal);
            }}
            className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition flex-shrink-0"
            title="Add tag"
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
          to add • Backspace removes last tag • Comma-separated paste works
        </p>
      </div>
    </FormField>
  );
}

// ==================== READ TIME CALCULATOR ====================
function calculateReadTime(text: string): string {
  if (!text) return '1 min';
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min`;
}

// ==================== COMPONENT ====================
export function BlogPage({
  blogPosts,
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
}: BlogPageProps) {
  const [form, setForm] = useState({
    title: '',
    category: 'Company Update',
    date: new Date().toISOString().split('T')[0],
    excerpt: '',
    fullContent: '',
    img: '',
    readTime: '1 min',
    author: 'CVS Communications Team',
    tags: [] as string[],
  });

  const [originalImg, setOriginalImg] = useState('');

  // Update form when editingItem changes
  useEffect(() => {
    if (modalOpen && editingItem) {
      setForm({
        title: editingItem.title || '',
        category: editingItem.category || 'Company Update',
        date: editingItem.date || new Date().toISOString().split('T')[0],
        excerpt: editingItem.excerpt || '',
        fullContent: editingItem.fullContent || '',
        img: editingItem.img || '',
        readTime:
          editingItem.readTime ||
          calculateReadTime(editingItem.fullContent || ''),
        author: editingItem.author || 'CVS Communications Team',
        tags: Array.isArray(editingItem.tags) ? editingItem.tags : [],
      });
      setOriginalImg(editingItem.img || '');
    } else if (modalOpen && !editingItem) {
      setForm({
        title: '',
        category: 'Company Update',
        date: new Date().toISOString().split('T')[0],
        excerpt: '',
        fullContent: '',
        img: '',
        readTime: '1 min',
        author: 'CVS Communications Team',
        tags: [],
      });
      setOriginalImg('');
    }
  }, [modalOpen, editingItem]);

  // Auto-calculate read time when fullContent changes
  useEffect(() => {
    if (form.fullContent) {
      setForm((prev) => ({
        ...prev,
        readTime: calculateReadTime(prev.fullContent),
      }));
    }
  }, [form.fullContent]);

  const handleFormSubmit = (onSave: (data: any) => void) => {
    onSave({
      ...form,
      tags: form.tags,
    });
  };

  const isFormValid =
    form.title.trim() &&
    form.category.trim() &&
    form.date &&
    form.excerpt.trim() &&
    form.fullContent.trim() &&
    form.img &&
    form.author.trim();

  // Word count for fullContent
  const wordCount = form.fullContent.trim()
    ? form.fullContent.trim().split(/\s+/).length
    : 0;
  const paragraphCount = form.fullContent.trim()
    ? form.fullContent
        .split(/\n\s*\n/)
        .filter((p) => p.trim().length > 0).length
    : 0;

  return (
    <GenericListPage
      title="Blog Posts"
      collection="blog"
      items={blogPosts}
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
      renderItem={(post) => (
        <div
          key={post.id}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition"
        >
          <div className="flex flex-col md:flex-row">
            {/* Image — 4:3 ratio */}
            <div
              className="w-full md:w-56 flex-shrink-0 bg-slate-100 overflow-hidden"
              style={{ aspectRatio: '4/3' }}
            >
              {post.img ? (
                <img
                  src={post.img}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://picsum.photos/600/450';
                  }}
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
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 text-xs">
                      <Calendar className="w-3 h-3" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 text-xs">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-slate-800 mb-1">
                    {post.title}
                  </h4>

                  <p className="text-sm text-slate-500 mb-1">
                    <User className="w-3 h-3 inline mr-1" />
                    {post.author}
                  </p>

                  <p className="text-sm text-slate-500 line-clamp-2 mb-2">
                    {post.excerpt}
                  </p>

                  {/* Tags */}
                  {Array.isArray(post.tags) && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.slice(0, 4).map((tag: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {post.tags.length > 4 && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full">
                          +{post.tags.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEditModal(post)}
                    className="p-2 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-xl transition"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setDeleteConfirm({
                        open: true,
                        id: post.id,
                        collection: 'blog',
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
              label="Blog Title"
              value={form.title}
              onChange={(v) => setForm({ ...form, title: v })}
              required
              placeholder="e.g. CVS Secures New Seismic Survey Contract in Western India"
            />

            {/* Category + Date + Read Time — 3 columns */}
            <div className="grid grid-cols-3 gap-4">
              {/* Category dropdown */}
              <FormField label="Category" required>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none"
                >
                  {BLOG_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormInput
                label="Date"
                value={form.date}
                onChange={(v) => setForm({ ...form, date: v })}
                type="date"
                required
              />

              {/* Read time — auto-calculated with indicator */}
              <div>
                <FormInput
                  label="Read Time"
                  value={form.readTime}
                  onChange={(v) => setForm({ ...form, readTime: v })}
                  placeholder="3 min"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Auto: ~{wordCount} words → {calculateReadTime(form.fullContent)}
                </p>
              </div>
            </div>

            {/* Author — full width */}
            <FormInput
              label="Author"
              value={form.author}
              onChange={(v) => setForm({ ...form, author: v })}
              required
              placeholder="e.g. CVS Communications Team"
            />

            {/* Excerpt — full width */}
            <div>
              <FormTextarea
                label="Excerpt (Short Summary)"
                value={form.excerpt}
                onChange={(v) => setForm({ ...form, excerpt: v })}
                rows={2}
                required
                placeholder="Brief summary shown in blog listing cards (1-2 sentences)..."
              />
              <p className="text-xs text-slate-400 mt-1">
                {form.excerpt.length}/200 characters recommended
              </p>
            </div>

            {/* Full Content — full width with paragraph guidance */}
            <div>
              <FormTextarea
                label="Full Content"
                value={form.fullContent}
                onChange={(v) => setForm({ ...form, fullContent: v })}
                rows={10}
                required
                placeholder={`Write your blog post content here...

Start a new paragraph by pressing Enter twice (leave a blank line between paragraphs).

Paragraph 1: Introduction to the topic...

Paragraph 2: Key details and highlights...

Paragraph 3: Conclusion and next steps...

• Use bullet points with • symbol
• Each new line with • becomes a list item`}
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-slate-400">
                  {wordCount} words · {paragraphCount}{' '}
                  {paragraphCount === 1 ? 'paragraph' : 'paragraphs'} ·{' '}
                  {calculateReadTime(form.fullContent)} read
                </p>
                <p className="text-xs text-slate-400">
                  Press{' '}
                  <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">
                    Enter
                  </kbd>{' '}
                  twice for new paragraph
                </p>
              </div>

              {/* Live paragraph preview */}
              {form.fullContent.trim() && (
                <details className="mt-2">
                  <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-700 font-medium">
                    Preview paragraphs ({paragraphCount})
                  </summary>
                  <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl max-h-48 overflow-y-auto">
                    {form.fullContent
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

            {/* Tags — chip input (same as HighlightsInput pattern) */}
            <TagsInput
              value={form.tags}
              onChange={(tags) => setForm({ ...form, tags })}
            />

            {/* Image Uploader — 4:3 ratio, 1800×1350 */}
            <ImageUploader
              value={form.img}
              onChange={(url) => setForm((prev) => ({ ...prev, img: url }))}
              folder="blog"
              label="Blog Cover Image (4:3 ratio · Recommended 1800×1350px)"
              required
              outputWidth={1800}
              outputHeight={1350}
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
              {modalType === 'add' ? 'Publish Post' : 'Update Post'}
            </button>
          </div>
        </form>
      )}
    />
  );
}