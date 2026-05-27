import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 30000,
});

// Attach JWT from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pv_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — clear token and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('pv_token');
      // Let the auth store handle the redirect
      window.dispatchEvent(new CustomEvent('pv:unauthorized'));
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register:       (data)    => api.post('/auth/register', data),
  login:          (data)    => api.post('/auth/login', data),
  logout:         ()        => api.post('/auth/logout'),
  getMe:          ()        => api.get('/auth/me'),
  updateProfile:  (data)    => api.put('/auth/updateprofile', data),
  updatePassword: (data)    => api.put('/auth/updatepassword', data),
  updateAvatar:   (formData)=> api.put('/auth/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// ─── Pins ──────────────────────────────────────────────────────────────────────
export const pinAPI = {
  getAll:        (params)   => api.get('/pins', { params }),
  getOne:        (id)       => api.get(`/pins/${id}`),
  create:        (formData) => api.post('/pins', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:        (id, data) => api.put(`/pins/${id}`, data),
  delete:        (id)       => api.delete(`/pins/${id}`),
  toggleSave:    (id)       => api.post(`/pins/${id}/save`),
  addComment:    (id, data) => api.post(`/pins/${id}/comments`, data),
  deleteComment: (id, cid)  => api.delete(`/pins/${id}/comments/${cid}`),
  getRelated:    (id)       => api.get(`/pins/related/${id}`),
};

// ─── Boards ────────────────────────────────────────────────────────────────────
export const boardAPI = {
  getAll:        (params)        => api.get('/boards', { params }),
  getOne:        (id)            => api.get(`/boards/${id}`),
  create:        (data)          => api.post('/boards', data),
  update:        (id, data)      => api.put(`/boards/${id}`, data),
  delete:        (id)            => api.delete(`/boards/${id}`),
  addPin:        (id, pinId)     => api.post(`/boards/${id}/pins`, { pinId }),
  removePin:     (id, pinId)     => api.delete(`/boards/${id}/pins/${pinId}`),
};

// ─── Users ─────────────────────────────────────────────────────────────────────
export const userAPI = {
  search:       (q)       => api.get('/users', { params: { q } }),
  getProfile:   (username)=> api.get(`/users/${username}`),
  getUserPins:  (username, params) => api.get(`/users/${username}/pins`, { params }),
  toggleFollow: (id)      => api.post(`/users/${id}/follow`),
};

export default api;
