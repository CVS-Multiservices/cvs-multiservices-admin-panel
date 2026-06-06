import { useState, useEffect } from 'react';
import {
  Save, Edit, ExternalLink, CheckCircle2, AlertCircle,
  Link, Globe, X, Plus, Trash2, Check,
} from 'lucide-react';

// ==================== INTERFACES ====================

interface LinksData {
  whatsappChat: string | null;
  linkedin: string | null;
  instagram: string | null;
  youtube: string | null;
  facebook: string | null;
  x: string | null;
}

interface LinksPageProps {
  linksItems: any[];
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

// ==================== ICON PROPS ====================

interface IconProps {
  className?: string;
  style?: React.CSSProperties;
}

// ==================== SOCIAL LINK CONFIG ====================

interface SocialConfig {
  key: keyof LinksData;
  label: string;
  icon: React.FC<IconProps>;
  color: string;
  bgColor: string;
  placeholder: string;
  urlPattern: RegExp;
  urlHint: string;
  prefix?: string;
}

// ==================== CUSTOM SOCIAL ICONS ====================

const WhatsAppIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const LinkedInIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const InstagramIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const YouTubeIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const FacebookIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const XTwitterIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

// ==================== SOCIAL LINKS CONFIG ====================

const SOCIAL_LINKS: SocialConfig[] = [
  {
    key: 'whatsappChat',
    label: 'WhatsApp Chat',
    icon: WhatsAppIcon,
    color: '#25D366',
    bgColor: '#25D36615',
    placeholder: '+91 72020 21251',
    urlPattern: /^\+?[1-9]\d{6,14}$/,
    urlHint: 'Enter a valid phone number with country code (e.g. +919876543210)',
    prefix: 'https://wa.me/',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    icon: LinkedInIcon,
    color: '#0A66C2',
    bgColor: '#0A66C215',
    placeholder: 'https://linkedin.com/company/your-company',
    urlPattern: /^https?:\/\/(www\.)?linkedin\.com\/.+/i,
    urlHint: 'Must be a valid LinkedIn URL (e.g. https://linkedin.com/company/...)',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    icon: InstagramIcon,
    color: '#E4405F',
    bgColor: '#E4405F15',
    placeholder: 'https://instagram.com/your_handle',
    urlPattern: /^https?:\/\/(www\.)?instagram\.com\/.+/i,
    urlHint: 'Must be a valid Instagram URL (e.g. https://instagram.com/...)',
  },
  {
    key: 'youtube',
    label: 'YouTube',
    icon: YouTubeIcon,
    color: '#FF0000',
    bgColor: '#FF000015',
    placeholder: 'https://youtube.com/@your_channel',
    urlPattern: /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/i,
    urlHint: 'Must be a valid YouTube URL (e.g. https://youtube.com/@...)',
  },
  {
    key: 'facebook',
    label: 'Facebook',
    icon: FacebookIcon,
    color: '#1877F2',
    bgColor: '#1877F215',
    placeholder: 'https://facebook.com/your.page',
    urlPattern: /^https?:\/\/(www\.)?(facebook\.com|fb\.com)\/.+/i,
    urlHint: 'Must be a valid Facebook URL (e.g. https://facebook.com/...)',
  },
  {
    key: 'x',
    label: 'X (Twitter)',
    icon: XTwitterIcon,
    color: '#000000',
    bgColor: '#00000010',
    placeholder: 'https://x.com/your_handle',
    urlPattern: /^https?:\/\/(www\.)?(x\.com|twitter\.com)\/.+/i,
    urlHint: 'Must be a valid X/Twitter URL (e.g. https://x.com/...)',
  },
];

// ==================== VALIDATION ====================

const cleanPhoneNumber = (phone: string): string =>
  phone.replace(/[\s\-\(\)]/g, '');

const validateField = (
  config: SocialConfig,
  value: string
): { valid: boolean; message: string } => {
  if (!value || !value.trim()) return { valid: true, message: '' };
  const trimmed = value.trim();

  if (config.key === 'whatsappChat') {
    const cleaned = cleanPhoneNumber(trimmed);
    if (!/^\+/.test(cleaned))
      return { valid: false, message: 'Must start with + country code (e.g. +91...)' };
    if (!/^\+?[1-9]\d{6,14}$/.test(cleaned))
      return { valid: false, message: 'Enter a valid phone number (7–15 digits with country code)' };
    return { valid: true, message: '' };
  }

  try {
    const url = new URL(trimmed);
    if (!['http:', 'https:'].includes(url.protocol))
      return { valid: false, message: 'URL must start with http:// or https://' };
  } catch {
    return { valid: false, message: 'Enter a valid URL starting with https://' };
  }

  if (!config.urlPattern.test(trimmed))
    return { valid: false, message: config.urlHint };

  return { valid: true, message: '' };
};

const getPreviewUrl = (config: SocialConfig, value: string | null): string | null => {
  if (!value?.trim()) return null;
  if (config.key === 'whatsappChat') {
    const cleaned = cleanPhoneNumber(value.trim());
    return `${config.prefix}${cleaned.replace('+', '')}`;
  }
  return value.trim();
};

// ==================== ADD LINKS MODAL ====================

function AddLinksModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: LinksData) => Promise<void>;
}) {
  const [form, setForm] = useState<LinksData>({
    whatsappChat: null,
    linkedin:     null,
    instagram:    null,
    youtube:      null,
    facebook:     null,
    x:            null,
  });

  const [errors, setErrors] = useState<Record<string, { valid: boolean; message: string }>>({});
  const [isSaving, setIsSaving] = useState(false);

  const updateField = (key: keyof LinksData, value: string) => {
    const config = SOCIAL_LINKS.find((c) => c.key === key)!;
    const val = value || null;
    setForm((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({
      ...prev,
      [key]: value ? validateField(config, value) : { valid: true, message: '' },
    }));
  };

  const hasErrors = Object.values(errors).some((e) => !e.valid);
  const hasAnyValue = SOCIAL_LINKS.some((c) => form[c.key]?.trim());

  const handleSubmit = async () => {
    // Validate all filled fields
    const newErrors: Record<string, { valid: boolean; message: string }> = {};
    SOCIAL_LINKS.forEach((config) => {
      const val = form[config.key];
      newErrors[config.key] = val ? validateField(config, val) : { valid: true, message: '' };
    });
    setErrors(newErrors);

    if (Object.values(newErrors).some((e) => !e.valid)) return;
    if (!hasAnyValue) return;

    // Clean WhatsApp
    const cleanedForm: LinksData = {
      ...form,
      whatsappChat: form.whatsappChat
        ? cleanPhoneNumber(form.whatsappChat.trim())
        : null,
    };

    setIsSaving(true);
    try {
      await onSave(cleanedForm);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    // ── Backdrop ───────────────────────────────────────────────
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Add Social Links</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Fill in at least one link to get started
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 text-slate-500 rounded-xl transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {SOCIAL_LINKS.map((config) => {
            const Icon  = config.icon;
            const value = form[config.key] || '';
            const error = errors[config.key] || { valid: true, message: '' };
            const hasVal = !!value.trim();

            return (
              <div
                key={config.key}
                className={`rounded-2xl border p-4 transition-all ${
                  !error.valid && hasVal
                    ? 'border-red-300 bg-red-50/20'
                    : hasVal
                    ? 'border-emerald-200 bg-emerald-50/10'
                    : 'border-slate-200 bg-white'
                }`}
              >
                {/* Row header */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: config.bgColor }}
                  >
                    <Icon className="w-4 h-4" style={{ color: config.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-700">{config.label}</p>
                    <p className="text-xs text-slate-400">
                      {config.key === 'whatsappChat'
                        ? 'Phone number with country code'
                        : 'Profile / page URL'}
                    </p>
                  </div>
                  {hasVal && error.valid && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  )}
                  {hasVal && !error.valid && (
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  )}
                </div>

                {/* Input row */}
                <div className="flex gap-2">
                  {config.key === 'whatsappChat' && (
                    <div className="flex items-center px-3 bg-slate-100 border border-slate-200 rounded-l-xl text-sm text-slate-500 font-medium whitespace-nowrap">
                      wa.me/
                    </div>
                  )}
                  <input
                    type={config.key === 'whatsappChat' ? 'tel' : 'url'}
                    value={value}
                    onChange={(e) => updateField(config.key, e.target.value)}
                    placeholder={config.placeholder}
                    className={`flex-1 px-4 py-2.5 bg-slate-50 border text-sm focus:outline-none focus:ring-2 transition ${
                      config.key === 'whatsappChat' ? 'rounded-r-xl' : 'rounded-xl'
                    } ${
                      !error.valid && hasVal
                        ? 'border-red-300 focus:ring-red-400'
                        : 'border-slate-200 focus:ring-blue-500'
                    }`}
                  />
                  {hasVal && (
                    <button
                      type="button"
                      onClick={() => updateField(config.key, '')}
                      className="p-2.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Error */}
                {!error.valid && hasVal && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1.5">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    {error.message}
                  </p>
                )}

                {/* Preview */}
                {error.valid && hasVal && getPreviewUrl(config, value) && (
                  <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1.5 truncate">
                    <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                    <span className="font-mono text-[10px] truncate">
                      {getPreviewUrl(config, value)}
                    </span>
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 flex-shrink-0">
          <p className="text-xs text-slate-500">
            {hasAnyValue
              ? `${SOCIAL_LINKS.filter((c) => form[c.key]?.trim()).length} link(s) ready to save`
              : 'Fill in at least one link'}
          </p>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={hasErrors || isSaving || !hasAnyValue}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Links'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== SINGLE LINK CARD ====================

function LinkCard({
  config,
  value,
  onSave,
  onRemove,
  isSavingKey,
}: {
  config: SocialConfig;
  value: string | null;
  onSave: (key: keyof LinksData, value: string) => Promise<void>;
  onRemove: (key: keyof LinksData) => Promise<void>;
  isSavingKey: keyof LinksData | null;
}) {
  const Icon = config.icon;

  const [isEditing, setIsEditing]               = useState(false);
  const [inputVal, setInputVal]                 = useState('');
  const [error, setError]                       = useState<{ valid: boolean; message: string }>({ valid: true, message: '' });
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const isSaving   = isSavingKey === config.key;
  const hasValue   = !!(value && value.trim());
  const previewUrl = hasValue ? getPreviewUrl(config, value) : null;

  useEffect(() => {
    if (!isEditing) setInputVal(value || '');
  }, [value, isEditing]);

  const startEdit = () => {
    setInputVal(value || '');
    setError({ valid: true, message: '' });
    setIsEditing(true);
    setShowRemoveConfirm(false);
  };

  const handleChange = (val: string) => {
    setInputVal(val);
    setError(validateField(config, val));
  };

  const handleSave = async () => {
    if (!inputVal.trim()) {
      setError({ valid: false, message: 'Please enter a value or cancel' });
      return;
    }
    const validation = validateField(config, inputVal);
    setError(validation);
    if (!validation.valid) return;

    const cleaned =
      config.key === 'whatsappChat'
        ? cleanPhoneNumber(inputVal.trim())
        : inputVal.trim();

    await onSave(config.key, cleaned);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setInputVal(value || '');
    setError({ valid: true, message: '' });
    setIsEditing(false);
    setShowRemoveConfirm(false);
  };

  const handleRemove = async () => {
    await onRemove(config.key);
    setShowRemoveConfirm(false);
    setIsEditing(false);
  };

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all duration-200 ${
        isEditing
          ? 'border-blue-300 shadow-md bg-blue-50/10'
          : showRemoveConfirm
          ? 'border-red-300 bg-red-50/20'
          : hasValue
          ? 'border-emerald-200 bg-white'
          : 'border-slate-200 bg-white'
      }`}
    >
      <div className="p-4 space-y-3">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: config.bgColor }}
          >
            <Icon className="w-5 h-5" style={{ color: config.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-700">{config.label}</p>
            <p className="text-xs text-slate-400">
              {config.key === 'whatsappChat'
                ? 'Phone number with country code'
                : 'Profile / page URL'}
            </p>
          </div>
          {!isEditing && !showRemoveConfirm && (
            hasValue ? (
              <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex-shrink-0">
                <CheckCircle2 className="w-3 h-3" /> Set
              </span>
            ) : (
              <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full flex-shrink-0">
                Not set
              </span>
            )
          )}
        </div>

        {/* Remove Confirm */}
        {showRemoveConfirm && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2">
            <p className="text-sm font-semibold text-red-700">Remove {config.label}?</p>
            <p className="text-xs text-red-500">
              Sets this field to <code className="bg-red-100 px-1 rounded">null</code>.
              The record is not deleted.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowRemoveConfirm(false)}
                className="flex-1 px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRemove}
                disabled={isSaving}
                className="flex-1 px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-500 text-white rounded-lg transition disabled:opacity-50"
              >
                {isSaving ? 'Removing...' : 'Yes, Remove'}
              </button>
            </div>
          </div>
        )}

        {/* Edit Mode */}
        {isEditing && !showRemoveConfirm && (
          <div className="space-y-2">
            <div className="flex gap-2">
              {config.key === 'whatsappChat' && (
                <div className="flex items-center px-3 bg-slate-100 border border-slate-200 rounded-l-xl text-sm text-slate-500 font-medium whitespace-nowrap">
                  wa.me/
                </div>
              )}
              <input
                type={config.key === 'whatsappChat' ? 'tel' : 'url'}
                value={inputVal}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') handleCancel();
                }}
                placeholder={config.placeholder}
                autoFocus
                className={`flex-1 px-4 py-2.5 bg-white border text-sm focus:outline-none focus:ring-2 transition ${
                  config.key === 'whatsappChat' ? 'rounded-r-xl' : 'rounded-xl'
                } ${
                  !error.valid && inputVal
                    ? 'border-red-300 focus:ring-red-400'
                    : 'border-slate-200 focus:ring-blue-500'
                }`}
              />
              {inputVal && (
                <button
                  type="button"
                  onClick={() => handleChange('')}
                  className="p-2.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {!error.valid && inputVal && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {error.message}
              </p>
            )}

            {error.valid && inputVal.trim() && getPreviewUrl(config, inputVal) && (
              <p className="text-xs text-emerald-600 flex items-center gap-1 truncate">
                <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                <span className="font-mono text-[10px] truncate">
                  {getPreviewUrl(config, inputVal)}
                </span>
              </p>
            )}

            <p className="text-[10px] text-slate-400 italic">{config.urlHint}</p>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleCancel}
                className="flex-1 px-3 py-2 text-xs font-medium bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!error.valid || isSaving || !inputVal.trim()}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-3.5 h-3.5" />
                {isSaving ? 'Saving...' : hasValue ? 'Update' : 'Add Link'}
              </button>
            </div>
          </div>
        )}

        {/* View Mode */}
        {!isEditing && !showRemoveConfirm && (
          <>
            {hasValue ? (
              <div className="bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                <p className="text-sm text-slate-700 font-medium truncate">{value}</p>
                {previewUrl && (
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-1 text-xs font-medium hover:underline"
                    style={{ color: config.color }}
                  >
                    <ExternalLink className="w-3 h-3" />
                    {config.key === 'whatsappChat' ? 'Open WhatsApp Chat' : 'Visit Profile'}
                  </a>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl px-3 py-2.5 border border-dashed border-slate-200">
                <p className="text-sm text-slate-400 italic">No link added yet</p>
              </div>
            )}

            <div className="flex gap-2">
              {hasValue ? (
                <>
                  <button
                    onClick={startEdit}
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition disabled:opacity-50"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => setShowRemoveConfirm(true)}
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </>
              ) : (
                <button
                  onClick={startEdit}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition border border-dashed border-slate-300 disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add {config.label}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export function LinksPage({
  linksItems,
  handleEdit,
  handleAdd,
  showToast,
}: LinksPageProps) {

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isSavingKey, setIsSavingKey]   = useState<keyof LinksData | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState<LinksData>({
    whatsappChat: null,
    linkedin:     null,
    instagram:    null,
    youtube:      null,
    facebook:     null,
    x:            null,
  });

  // ── Auto-select first item ────────────────────────────────────
  useEffect(() => {
    if (linksItems.length > 0) {
      const item = selectedItem
        ? linksItems.find((c) => c.id === selectedItem.id) || linksItems[0]
        : linksItems[0];
      setSelectedItem(item);
      loadFormFromItem(item);
    }
  }, [linksItems]);

  useEffect(() => {
    if (selectedItem) loadFormFromItem(selectedItem);
  }, [selectedItem?.id]);

  const loadFormFromItem = (item: any) => {
    setForm({
      whatsappChat: item.whatsappChat ?? null,
      linkedin:     item.linkedin     ?? null,
      instagram:    item.instagram    ?? null,
      youtube:      item.youtube      ?? null,
      facebook:     item.facebook     ?? null,
      x:            item.x            ?? null,
    });
  };

  const filledCount = SOCIAL_LINKS.filter((c) => form[c.key]?.trim()).length;

  // ── Save individual field ─────────────────────────────────────
  const handleSaveField = async (key: keyof LinksData, value: string) => {
    if (!selectedItem) return;
    setIsSavingKey(key);
    try {
      const updatedForm: LinksData = { ...form, [key]: value };
      await handleEdit('links', selectedItem.id, updatedForm);
      setForm(updatedForm);
      setSelectedItem({ ...selectedItem, [key]: value });
      showToast(
        `${SOCIAL_LINKS.find((c) => c.key === key)?.label} link saved!`,
        'success'
      );
    } catch {
      showToast('Failed to save. Please try again.', 'error');
    } finally {
      setIsSavingKey(null);
    }
  };

  // ── Remove field → null ───────────────────────────────────────
  const handleRemoveField = async (key: keyof LinksData) => {
    if (!selectedItem) return;
    setIsSavingKey(key);
    try {
      const updatedForm: LinksData = { ...form, [key]: null };
      await handleEdit('links', selectedItem.id, updatedForm);
      setForm(updatedForm);
      setSelectedItem({ ...selectedItem, [key]: null });
      showToast(
        `${SOCIAL_LINKS.find((c) => c.key === key)?.label} link removed.`,
        'info'
      );
    } catch {
      showToast('Failed to remove. Please try again.', 'error');
    } finally {
      setIsSavingKey(null);
    }
  };

  // ── Create initial document via modal ─────────────────────────
  const handleModalSave = async (data: LinksData) => {
    try {
      await handleAdd('links', data);
      setShowAddModal(false);
      showToast('Social links created successfully!', 'success');
    } catch {
      showToast('Failed to create links. Please try again.', 'error');
    }
  };

  // ==================== RENDER ====================
  return (
    <div className="space-y-6">

      {/* ── Add Modal ─────────────────────────────────────────── */}
      {showAddModal && (
        <AddLinksModal
          onClose={() => setShowAddModal(false)}
          onSave={handleModalSave}
        />
      )}

      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-600" />
            Social Links
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Add, edit or remove each social link individually
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Summary badge — only when data exists */}
          {selectedItem && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-slate-700">
                {filledCount} / {SOCIAL_LINKS.length} configured
              </span>
            </div>
          )}

          {/* Add button — only when NO data exists */}
          {linksItems.length === 0 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition shadow-lg shadow-blue-600/30"
            >
              <Plus className="w-4 h-4" />
              Add Links
            </button>
          )}
        </div>
      </div>

      {/* ── No data state ─────────────────────────────────────── */}
      {linksItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <Link className="w-10 h-10 text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No social links configured yet</p>
          <p className="text-sm text-slate-400 mt-1 mb-4">
            Create the links document to get started
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition shadow-lg shadow-blue-600/30"
          >
            <Plus className="w-4 h-4" />
            Add Social Links
          </button>
        </div>
      ) : (
        <>
          {/* ── 6 Link Cards ──────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {SOCIAL_LINKS.map((config) => (
              <LinkCard
                key={config.key}
                config={config}
                value={form[config.key]}
                onSave={handleSaveField}
                onRemove={handleRemoveField}
                isSavingKey={isSavingKey}
              />
            ))}
          </div>

          {/* ── Quick Preview ──────────────────────────────────── */}
          {filledCount > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Quick Preview
              </p>
              <div className="flex flex-wrap gap-3">
                {SOCIAL_LINKS.filter((c) => form[c.key]?.trim()).map((config) => {
                  const Icon  = config.icon;
                  const url   = getPreviewUrl(config, form[config.key]);
                  if (!url) return null;
                  return (
                    <a
                      key={config.key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all hover:shadow-md hover:scale-105"
                      style={{
                        backgroundColor: config.bgColor,
                        borderColor:     `${config.color}30`,
                        color:           config.color,
                      }}
                    >
                      <Icon className="w-4 h-4" />
                      {config.label}
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}