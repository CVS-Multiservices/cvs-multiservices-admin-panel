import { useState, useEffect } from 'react';
import { Edit, Trash2, Save, Plus, X, CheckCircle2, Clock, Star } from 'lucide-react';
import { GenericListPage } from '../generic/GenericListPage';
import { FormInput, FormTextarea, FormField } from '../common/FormHelpers';
import { ImageUploader } from '../common/ImageUploader';

interface OngoingProjectsPageProps {
    ongoingProjects: any[];
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

// ==================== STATUS VALUES ====================
const STATUS_OPTIONS = [
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Completed' },
] as const;

type ProjectStatus = 'ongoing' | 'completed';

// ==================== STATUS BADGE ====================
function StatusBadge({ status }: { status: string }) {
    const isCompleted = status === 'completed';
    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full border ${
                isCompleted
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
        >
            {isCompleted ? (
                <CheckCircle2 className="w-3 h-3" />
            ) : (
                <Clock className="w-3 h-3" />
            )}
            {isCompleted ? 'Completed' : 'Ongoing'}
        </span>
    );
}

// ==================== FEATURED BADGE ====================
function FeaturedBadge() {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full border bg-yellow-50 text-yellow-700 border-yellow-300">
            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
            Featured
        </span>
    );
}

// ==================== STATUS CHECKBOX INPUT ====================
function StatusCheckbox({
    value,
    onChange,
}: {
    value: ProjectStatus;
    onChange: (status: ProjectStatus) => void;
}) {
    return (
        <FormField label="Project Status">
            <div className="flex items-center gap-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                {STATUS_OPTIONS.map((option) => {
                    const isSelected = value === option.value;
                    const isCompleted = option.value === 'completed';

                    return (
                        <label
                            key={option.value}
                            className="flex items-center gap-3 cursor-pointer group select-none"
                        >
                            {/* Custom checkbox */}
                            <div className="relative flex-shrink-0">
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => onChange(option.value)}
                                    className="sr-only"
                                />
                                <div
                                    onClick={() => onChange(option.value)}
                                    className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all cursor-pointer ${
                                        isSelected
                                            ? isCompleted
                                                ? 'bg-emerald-500 border-emerald-500'
                                                : 'bg-amber-500 border-amber-500'
                                            : 'bg-white border-slate-300 group-hover:border-slate-400'
                                    }`}
                                >
                                    {isSelected && (
                                        <svg
                                            className="w-3 h-3 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={3}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    )}
                                </div>
                            </div>

                            {/* Label with icon */}
                            <span
                                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                                    isSelected
                                        ? isCompleted
                                            ? 'text-emerald-700'
                                            : 'text-amber-700'
                                        : 'text-slate-500 group-hover:text-slate-700'
                                }`}
                            >
                                {isCompleted ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                    <Clock className="w-4 h-4" />
                                )}
                                {option.label}
                            </span>
                        </label>
                    );
                })}
            </div>
        </FormField>
    );
}

// ==================== FEATURED TOGGLE ====================
function FeaturedToggle({
    value,
    onChange,
}: {
    value: boolean;
    onChange: (featured: boolean) => void;
}) {
    return (
        <FormField label="Featured Project">
            <div
                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all select-none ${
                    value
                        ? 'bg-yellow-50 border-yellow-300'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => onChange(!value)}
            >
                {/* Left — description */}
                <div className="flex items-center gap-3">
                    <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                            value ? 'bg-yellow-100' : 'bg-slate-200'
                        }`}
                    >
                        <Star
                            className={`w-5 h-5 transition-colors ${
                                value
                                    ? 'fill-yellow-500 text-yellow-500'
                                    : 'text-slate-400'
                            }`}
                        />
                    </div>
                    <div>
                        <p
                            className={`text-sm font-semibold transition-colors ${
                                value ? 'text-yellow-800' : 'text-slate-700'
                            }`}
                        >
                            {value ? 'Featured on website' : 'Mark as featured'}
                        </p>
                        <p
                            className={`text-xs transition-colors ${
                                value ? 'text-yellow-600' : 'text-slate-400'
                            }`}
                        >
                            {value
                                ? 'This project will be highlighted in the featured section'
                                : 'Enable to showcase this project prominently'}
                        </p>
                    </div>
                </div>

                {/* Right — pill toggle switch */}
                <div
                    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                        value ? 'bg-yellow-400' : 'bg-slate-300'
                    }`}
                >
                    <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                            value ? 'translate-x-5' : 'translate-x-0'
                        }`}
                    />
                </div>
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
                        placeholder="e.g. 24/7 Operations, Zero Discharge (press Enter or comma to add)"
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
export function OngoingProjectsPage({
    ongoingProjects, modalOpen, modalType, editingItem, deleteConfirm,
    openAddModal, openEditModal, setModalOpen, setEditingItem,
    setDeleteConfirm, handleAdd, handleEdit, handleDelete, showToast,
}: OngoingProjectsPageProps) {

    const [form, setForm] = useState({
        title: '',
        client: '',
        location: '',
        category: '',
        image: '',
        description: '',
        teamSize: '' as number | string,
        highlights: [] as string[],
        status: 'ongoing' as ProjectStatus,
        featured: false,                        // ← NEW boolean field
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
                description: editingItem.description || '',
                teamSize: editingItem.teamSize || '',
                highlights: Array.isArray(editingItem.highlights) ? editingItem.highlights : [],
                status: (editingItem.status === 'completed' ? 'completed' : 'ongoing') as ProjectStatus,
                // Safely coerce stored value → boolean (handles true / "true" / 1)
                featured: Boolean(editingItem.featured) ?? false,  // ← NEW
            });
            setOriginalImg(editingItem.image || '');
        } else if (modalOpen && !editingItem) {
            setForm({
                title: '',
                client: '',
                location: '',
                category: '',
                image: '',
                description: '',
                teamSize: '',
                highlights: [],
                status: 'ongoing',
                featured: false,   // ← default false for new projects
            });
            setOriginalImg('');
        }
    }, [modalOpen, editingItem]);

    const handleFormSubmit = (onSave: (data: any) => void) => {
        const icon = getIconFromCategory(form.category);
        onSave({
            ...form,
            icon,
            teamSize: Number(form.teamSize),
            highlights: form.highlights,
            status: form.status,
            featured: form.featured,   // ← boolean stored in DB
        });
    };

    const isFormValid =
        form.title.trim() &&
        form.client.trim() &&
        form.location.trim() &&
        form.description.trim() &&
        form.teamSize !== '' &&
        Number(form.teamSize) > 0 &&
        form.image;

    return (
        <GenericListPage
            title="Ongoing Projects"
            collection="ongoing-projects"
            items={ongoingProjects}
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
                <div
                    key={project.id}
                    className={`bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition ${
                        project.featured
                            ? 'border-yellow-300 ring-1 ring-yellow-200'
                            : 'border-slate-200'
                    }`}
                >
                    <div className="flex flex-col md:flex-row">

                        {/* Image — 3:2 ratio */}
                        <div
                            className="w-full md:w-56 flex-shrink-0 bg-slate-100 overflow-hidden relative"
                            style={{ aspectRatio: '3/2' }}
                        >
                            {project.image ? (
                                <img
                                    src={project.image}
                                    alt={project.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://picsum.photos/600/400';
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-slate-300 text-xs">No image</span>
                                </div>
                            )}

                            {/* Status ribbon — bottom-left of image */}
                            <div className="absolute bottom-2 left-2">
                                <StatusBadge status={project.status || 'ongoing'} />
                            </div>

                            {/* Featured star — top-right of image */}
                            {project.featured && (
                                <div className="absolute top-2 right-2">
                                    <span className="flex items-center justify-center w-6 h-6 bg-yellow-400 rounded-full shadow">
                                        <Star className="w-3.5 h-3.5 fill-white text-white" />
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">

                                    {/* Badges row */}
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        {project.category && (
                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                                {project.category}
                                            </span>
                                        )}
                                        {/* Featured badge inline with other badges */}
                                        {project.featured && <FeaturedBadge />}
                                        <span className="text-slate-400 text-xs">
                                            📍 {project.location}
                                        </span>
                                    </div>

                                    <h4 className="text-lg font-bold text-slate-800 mb-1">
                                        {project.title}
                                    </h4>

                                    <p className="text-sm text-slate-500 mb-1">
                                        Client:{' '}
                                        <span className="font-medium text-slate-700">
                                            {project.client}
                                        </span>
                                        {project.teamSize && (
                                            <>
                                                {' '}• Team:{' '}
                                                <span className="font-medium text-slate-700">
                                                    {project.teamSize} people
                                                </span>
                                            </>
                                        )}
                                    </p>

                                    {project.description && (
                                        <p className="text-sm text-slate-500 line-clamp-1 mb-1">
                                            {project.description}
                                        </p>
                                    )}

                                    {/* Highlights */}
                                    {Array.isArray(project.highlights) &&
                                        project.highlights.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {project.highlights
                                                    .slice(0, 4)
                                                    .map((h: string, i: number) => (
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
                                        onClick={() =>
                                            setDeleteConfirm({
                                                open: true,
                                                id: project.id,
                                                collection: 'ongoing-projects',
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

                        {/* ── Project Title ── */}
                        <FormInput
                            label="Project Title"
                            value={form.title}
                            onChange={(v) => setForm({ ...form, title: v })}
                            required
                            placeholder="e.g. ONGC Mehsana ETP Operations"
                        />

                        {/* ── Category ── */}
                        <div>
                            <FormInput
                                label="Category"
                                value={form.category}
                                onChange={(v) => setForm({ ...form, category: v })}
                                placeholder="e.g. Effluent Treatment, Seismic Survey..."
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

                        <FormInput
                            label="Client"
                            value={form.client}
                            onChange={(v) => setForm({ ...form, client: v })}
                            required
                            placeholder="e.g. Oil and Natural Gas Corporation"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormInput
                                label="Location"
                                value={form.location}
                                onChange={(v) => setForm({ ...form, location: v })}
                                required
                                placeholder="e.g. Mehsana, Gujarat"
                            />
                            <FormInput
                                label="Team Size"
                                value={form.teamSize}
                                onChange={(v) => setForm({ ...form, teamSize: v })}
                                type="number"
                                required
                                placeholder="e.g. 45"
                            />
                        </div>

                        {/* ── Status + Featured side by side on md+ ── */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <StatusCheckbox
                                value={form.status}
                                onChange={(status) => setForm({ ...form, status })}
                            />
                            <FeaturedToggle
                                value={form.featured}
                                onChange={(featured) => setForm({ ...form, featured })}
                            />
                        </div>

                        {/* ── Description ── */}
                        <FormTextarea
                            label="Description"
                            value={form.description}
                            onChange={(v) => setForm({ ...form, description: v })}
                            rows={2}
                            required
                            placeholder="e.g. Operating and maintaining mobile effluent treatment plants..."
                        />

                        {/* ── Highlights ── */}
                        <HighlightsInput
                            value={form.highlights}
                            onChange={(highlights) => setForm({ ...form, highlights })}
                        />

                        {/* ── Image Uploader ── */}
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

                    {/* ── Actions ── */}
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