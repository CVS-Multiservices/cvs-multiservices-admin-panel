// ==================== API SERVICE ====================

export const API_BASE_URL = 'https://cvs-multiservices-backend-production.up.railway.app/api';

// ==================== TYPES ====================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  lastLogin: string | null;
}

export interface AuthSession {
  token: string | null;
  user: AuthUser | null;
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: AuthUser;
  message?: string;
  locked?: boolean;
  lockUntil?: string;
}

export interface SendOtpResponse {
  success: boolean;
  message?: string;
  expiresIn?: number;
  retryAfter?: number;
  locked?: boolean;
}

export interface VerifyOtpResponse {
  success: boolean;
  message?: string;
  resetToken?: string;
  locked?: boolean;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface LogoutResponse {
  success: boolean;
  message?: string;
}

export interface UploadResult {
  success: boolean;
  data?: {
    url: string;
    publicId: string;
    originalName: string;
    size: number;
  };
  message?: string;
}

export type UploadFolder =
  | 'slides' | 'team' | 'blog' | 'partners'
  | 'projects' | 'testimonials' | 'csr'
  | 'gallery' | 'features' | 'general'
  | 'jobs';

// ==================== HELPERS ====================

const STORAGE_KEY = 'cvs_auth';

const getToken = (): string | null => {
  try {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) return JSON.parse(local).token || null;
    const session = sessionStorage.getItem(STORAGE_KEY);
    if (session) return JSON.parse(session).token || null;
    return null;
  } catch {
    return null;
  }
};

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

const getHeaders = (): Record<string, string> => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const mapId = <T extends Record<string, any>>(data: T | T[]): any => {
  if (Array.isArray(data)) return data.map((item) => ({ ...item, id: item._id }));
  return { ...data, id: data._id };
};

// ==================== DEBUG LOGGER ====================

const decodeToken = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id:      payload.id   || payload._id || 'N/A',
      email:   payload.email              || 'N/A',
      name:    payload.name               || 'N/A',
      iat:     new Date(payload.iat * 1000).toLocaleString(),
      exp:     new Date(payload.exp * 1000).toLocaleString(),
      expired: payload.exp * 1000 < Date.now(),
    };
  } catch {
    return null;
  }
};

const logStorageState = (label: string) => {
  console.group(`🗄️ ===== Storage State: ${label} =====`);

  // ── localStorage ─────────────────────────────────────────────
  const local = localStorage.getItem(STORAGE_KEY);
  if (local) {
    try {
      const parsed   = JSON.parse(local);
      const token    = parsed.token as string | null;
      const decoded  = token ? decodeToken(token) : null;
      console.group('📦 localStorage');
      console.log('user        :', parsed.user        ?? null);
      console.log('rememberMe  :', parsed.rememberMe  ?? null);
      console.log('token       :', token ? `${token.substring(0, 50)}...` : null);
      console.log('expired     :', token ? isTokenExpired(token) : 'N/A');
      console.log('decoded     :', decoded ?? '❌ could not decode');
      console.groupEnd();
    } catch {
      console.log('📦 localStorage  : ❌ parse error');
    }
  } else {
    console.log('📦 localStorage  : ✗ empty');
  }

  // ── sessionStorage ────────────────────────────────────────────
  const session = sessionStorage.getItem(STORAGE_KEY);
  if (session) {
    try {
      const parsed   = JSON.parse(session);
      const token    = parsed.token as string | null;
      const decoded  = token ? decodeToken(token) : null;
      console.group('📦 sessionStorage');
      console.log('user        :', parsed.user        ?? null);
      console.log('rememberMe  :', parsed.rememberMe  ?? null);
      console.log('token       :', token ? `${token.substring(0, 50)}...` : null);
      console.log('expired     :', token ? isTokenExpired(token) : 'N/A');
      console.log('decoded     :', decoded ?? '❌ could not decode');
      console.groupEnd();
    } catch {
      console.log('📦 sessionStorage : ❌ parse error');
    }
  } else {
    console.log('📦 sessionStorage : ✗ empty');
  }

  // ── Active token being sent in requests ───────────────────────
  const activeToken = getToken();
  console.group('🔑 Active Token (sent in API requests)');
  if (activeToken) {
    const decoded = decodeToken(activeToken);
    console.log('token   :', `${activeToken.substring(0, 50)}...`);
    console.log('source  :', localStorage.getItem(STORAGE_KEY) ? 'localStorage' : 'sessionStorage');
    console.log('expired :', isTokenExpired(activeToken));
    console.log('decoded :', decoded ?? '❌ could not decode');
  } else {
    console.log('token   : ✗ null — no active token');
  }
  console.groupEnd();

  console.groupEnd();
};

// ==================== GENERIC CRUD ====================

export const createApiService = (endpoint: string) => {
  const getAll = async (): Promise<ApiResponse> => {
    try {
      const res = await fetch(`${API_BASE_URL}/${endpoint}`, { headers: getHeaders() });
      const json: ApiResponse = await res.json();
      if (json.success && json.data) return { success: true, data: mapId(json.data) };
      return json;
    } catch {
      return { success: false, data: [], message: 'Failed to fetch data' };
    }
  };

  const getById = async (id: string): Promise<ApiResponse> => {
    try {
      const res = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, { headers: getHeaders() });
      const json: ApiResponse = await res.json();
      if (json.success && json.data) return { success: true, data: mapId(json.data) };
      return json;
    } catch {
      return { success: false, data: null, message: 'Failed to fetch' };
    }
  };

  const create = async (data: Record<string, any>): Promise<ApiResponse> => {
    try {
      const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST', headers: getHeaders(), body: JSON.stringify(data),
      });
      const json: ApiResponse = await res.json();
      if (json.success && json.data) return { success: true, data: mapId(json.data), message: json.message };
      return json;
    } catch {
      return { success: false, message: 'Failed to create' };
    }
  };

  const update = async (id: string, data: Record<string, any>): Promise<ApiResponse> => {
    try {
      const res = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
        method: 'PUT', headers: getHeaders(), body: JSON.stringify(data),
      });
      const json: ApiResponse = await res.json();
      if (json.success && json.data) return { success: true, data: mapId(json.data), message: json.message };
      return json;
    } catch {
      return { success: false, message: 'Failed to update' };
    }
  };

  const remove = async (id: string): Promise<ApiResponse> => {
    try {
      const res = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
        method: 'DELETE', headers: getHeaders(),
      });
      return res.json();
    } catch {
      return { success: false, message: 'Failed to delete' };
    }
  };

  return { getAll, getById, create, update, delete: remove };
};

// ==================== UPLOAD API ====================

export const uploadApi = {
  upload: (
    file: File,
    folder: UploadFolder = 'general',
    onProgress?: (percent: number) => void
  ): Promise<UploadResult> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve({ success: false, message: 'Select a valid image file.' });
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        resolve({ success: false, message: 'File must be under 20MB.' });
        return;
      }
      const token = getToken();
      if (!token || isTokenExpired(token)) {
        resolve({ success: false, message: 'Session expired. Please log in.' });
        return;
      }
      const formData = new FormData();
      formData.append('image', file);
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
      });
      xhr.addEventListener('load', () => {
        try {
          const r: UploadResult = JSON.parse(xhr.responseText);
          resolve(xhr.status === 200 && r.success ? r : { success: false, message: r.message || 'Upload failed' });
        } catch {
          resolve({ success: false, message: 'Invalid server response.' });
        }
      });
      xhr.addEventListener('error', () => resolve({ success: false, message: 'Network error.' }));
      xhr.addEventListener('abort', () => resolve({ success: false, message: 'Upload cancelled.' }));
      xhr.open('POST', `${API_BASE_URL}/upload/${folder}`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  },

  delete: async (imageUrl: string): Promise<{ success: boolean; message?: string }> => {
    try {
      if (!imageUrl) return { success: false, message: 'No URL provided.' };
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'DELETE', headers: getHeaders(), body: JSON.stringify({ imageUrl }),
      });
      return res.json();
    } catch {
      return { success: false, message: 'Delete failed.' };
    }
  },
};

// ==================== AUTH API ====================

export const authApi = {

  login: async (
    credentials: { email: string; password: string },
    rememberMe: boolean = false
  ): Promise<LoginResponse> => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const json: LoginResponse = await res.json();

      if (res.status === 423) {
        return { success: false, message: json.message, locked: true, lockUntil: json.lockUntil };
      }

      if (json.success && json.token) {
        const session: AuthSession = { token: json.token, user: json.user || null, rememberMe };
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem(STORAGE_KEY, JSON.stringify(session));

        // ── Log after successful login ────────────────────────
        console.log(`✅ LOGIN SUCCESS — stored in ${rememberMe ? 'localStorage' : 'sessionStorage'}`);
        logStorageState('After Login');
      }

      return json;
    } catch {
      return { success: false, message: 'Network error.' };
    }
  },

  // ── Logout ────────────────────────────────────────────────────
  logout: async (): Promise<LogoutResponse> => {
    // ── Log before logout ─────────────────────────────────────
    console.log('🔴 LOGOUT INITIATED');
    logStorageState('Before Logout');

    try {
      const token = getToken();

      if (token && !isTokenExpired(token)) {
        console.log('📡 Sending POST /auth/logout ...');
        console.log('   token   :', `${token.substring(0, 50)}...`);
        console.log('   decoded :', decodeToken(token));

        const res = await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: getHeaders(),
        });

        const json = await res.json();
        console.log(`📡 Logout API → ${res.status}`, json);

        if (!res.ok) {
          console.warn('⚠️ Logout API returned non-ok status:', res.status, json.message);
        }
      } else {
        console.log('⚠️ No valid token found — skipping API call');
        console.log('   token          :', token ? `${token.substring(0, 50)}...` : 'null');
        console.log('   token expired  :', token ? isTokenExpired(token) : 'N/A');
      }
    } catch (error) {
      console.warn('⚠️ Logout API call failed (network error):', error);
    } finally {
      // ── Always clear storage ──────────────────────────────
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
      console.log('🧹 Storage cleared (localStorage + sessionStorage)');

      // ── Log after logout ──────────────────────────────────
      logStorageState('After Logout');
    }

    return { success: true, message: 'Logged out successfully' };
  },

  sendOtp: async (email: string): Promise<SendOtpResponse> => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (res.status === 423) {
        return { success: false, message: json.message, locked: true };
      }
      if (res.status === 429) {
        return { success: false, message: json.message, retryAfter: json.retryAfter };
      }
      return json;
    } catch {
      return { success: false, message: 'Failed to send OTP.' };
    }
  },

  verifyOtp: async (
    email: string,
    otp: string
  ): Promise<VerifyOtpResponse> => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const json = await res.json();
      if (res.status === 423) {
        return { success: false, message: json.message, locked: true };
      }
      return json;
    } catch {
      return { success: false, message: 'Verification failed.' };
    }
  },

  resetPassword: async (payload: {
    resetToken: string;
    newPassword: string;
  }): Promise<ApiResponse> => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return res.json();
    } catch {
      return { success: false, message: 'Reset failed.' };
    }
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<ApiResponse> => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return res.json();
    } catch {
      return { success: false, message: 'Failed to change password.' };
    }
  },

  getSession: (): AuthSession => {
    try {
      const local = localStorage.getItem(STORAGE_KEY);
      if (local) return JSON.parse(local);
      const session = sessionStorage.getItem(STORAGE_KEY);
      if (session) return JSON.parse(session);
    } catch {}
    return { token: null, user: null };
  },

  isAuthenticated: (): boolean => {
    const token = getToken();
    return !!token && !isTokenExpired(token);
  },

  getUser: (): AuthUser | null => {
    return authApi.getSession().user;
  },
};

// ==================== SERVICE EXPORTS ====================

export const slidesApi       = createApiService('slides');
export const statsApi        = createApiService('stats');
export const featuresApi     = createApiService('features');
export const partnersApi     = createApiService('partners');
export const blogApi         = createApiService('blog');
export const achievementsApi = createApiService('achievements');
export const teamApi         = createApiService('team');
export const timelineApi     = createApiService('timeline');
export const ongoingApi      = createApiService('ongoing-projects');
export const upcomingApi     = createApiService('upcoming-projects');
export const testimonialsApi = createApiService('testimonials');
export const jobsApi         = createApiService('jobs');
export const csrApi          = createApiService('csr');
export const galleryApi      = createApiService('gallery');
export const contactApi      = createApiService('contact');
export const linksApi        = createApiService('links');