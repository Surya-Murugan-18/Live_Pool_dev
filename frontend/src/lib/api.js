const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/** Base fetch wrapper — attaches the JWT and throws on non-2xx. */
export async function api(path, options = {}) {
  const token =
    localStorage.getItem('livepoll_token') ||
    sessionStorage.getItem('livepoll_token');

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Request failed');
  return body;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export const authApi = {
  /** POST /auth/login — returns { token, user } */
  login: (data) => api('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  /** POST /auth/signup — returns { token, user } */
  signup: (data) => api('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),

  /** GET /auth/me — returns the authenticated user object */
  me: () => api('/auth/me'),

  /**
   * PATCH /auth/profile — update display name
   * @param {{ name: string }} data
   */
  updateProfile: (data) =>
    api('/auth/profile', { method: 'PATCH', body: JSON.stringify(data) }),

  /**
   * PATCH /auth/avatar — upload/replace profile photo
   * @param {{ avatarUrl: string }} data — base64 data-URI (client-resized ≤ 200 KB)
   */
  updateAvatar: (data) =>
    api('/auth/avatar', { method: 'PATCH', body: JSON.stringify(data) }),

  /**
   * PATCH /auth/password — change password
   * @param {{ current: string, new: string }} data
   */
  changePassword: (data) =>
    api('/auth/password', { method: 'PATCH', body: JSON.stringify(data) }),

  /**
   * DELETE /auth/account — permanently delete account
   * @param {{ password: string }} data — requires password confirmation
   */
  deleteAccount: (data) =>
    api('/auth/account', { method: 'DELETE', body: JSON.stringify(data) }),
};

// ---------------------------------------------------------------------------
// Polls
// ---------------------------------------------------------------------------
export const pollsApi = {
  /** GET /polls — returns Poll[] for the authenticated user */
  list: () => api('/polls'),

  /** GET /polls/:id — returns a single Poll (public, no auth required) */
  get: (id) => api(`/polls/${id}`),

  /**
   * POST /polls — creates a new poll.
   * @param {{ question: string, options: string[], allowOneVote: boolean }} data
   */
  create: (data) => api('/polls', { method: 'POST', body: JSON.stringify(data) }),

  /**
   * POST /polls/:id/vote — cast a vote.
   * @param {string} id  poll id
   * @param {string} optionId
   */
  vote: (id, optionId) =>
    api(`/polls/${id}/vote`, { method: 'POST', body: JSON.stringify({ optionId }) }),

  /** PATCH /polls/:id/close — closes the poll, returns updated Poll */
  close: (id) => api(`/polls/${id}/close`, { method: 'PATCH' }),

  /** DELETE /polls/:id — permanently deletes poll and all its votes */
  delete: (id) => api(`/polls/${id}`, { method: 'DELETE' }),
};

export { API_URL };
