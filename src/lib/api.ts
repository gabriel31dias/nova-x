export const API_URL = 'https://api.blackcrystal.online/api';
const TOKEN_KEY = 'bc_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// Throws Error with the API message (first 422 field error when present).
export async function api<T = any>(path: string, opts: { method?: string; body?: unknown; token?: string | null; headers?: Record<string, string> } = {}): Promise<T> {
  const isForm = opts.body instanceof FormData;
  const headers: Record<string, string> = { Accept: 'application/json', ...opts.headers };
  if (!isForm && opts.body !== undefined) headers['Content-Type'] = 'application/json';
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;

  const res = await fetch(API_URL + path, {
    method: opts.method ?? (opts.body !== undefined ? 'POST' : 'GET'),
    headers,
    body: isForm ? (opts.body as FormData) : opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  // Panel session expired/revoked or 2FA pending: drop it and fall back to the login screen.
  if (opts.token && (res.status === 401 || data.error === '2FA_REQUIRED')) {
    clearToken();
    localStorage.removeItem('bc_user');
    window.location.reload();
  }
  if (!res.ok) {
    const fieldErr = data.errors && (Object.values(data.errors)[0] as string[] | undefined)?.[0];
    const msg = res.status === 429 ? 'Muitas tentativas. Aguarde um minuto.' : fieldErr || data.message || data.msg || data.error;
    throw Object.assign(new Error(msg || `Erro ${res.status}`), { status: res.status, data });
  }
  return data;
}
