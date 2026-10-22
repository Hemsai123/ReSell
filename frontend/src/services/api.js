import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: `${API_URL}/api`,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json'
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  sendOtp: (data) => api.post('/auth/send-otp/', data),
  verifyOtp: (data) => api.post('/auth/verify-otp/', data),
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: () => api.post('/auth/logout/'),
  getCurrentUser: () => api.get('/auth/user/'),
}

export const productsAPI = {
  getAll: (params) => api.get('/products/', { params }),
  getById: (slug) => api.get(`/products/${slug}/`),
  create: (data) => api.post('/products/', data),
  update: (slug, data) => api.patch(`/products/${slug}/`, data),
  delete: (slug) => api.delete(`/products/${slug}/`),
  myListings: () => api.get('/products/my_listings/'),
  addReview: (slug, data) => api.post(`/products/${slug}/add_review/`, data),
  toggleWishlist: (slug) => api.post(`/products/${slug}/toggle_wishlist/`),
  markSold: (slug) => api.post(`/products/${slug}/mark_sold/`),
  contactSeller: (slug) => api.post(`/products/${slug}/contact_seller/`),
}

export const categoriesAPI = {
  getAll: () => api.get('/categories/'),
  getBySlug: (slug) => api.get(`/categories/${slug}/`),
  create: (data) => api.post('/categories/', data),
}

export const brandsAPI = {
  getAll: () => api.get('/brands/'),
  create: (data) => api.post('/brands/', data),
}

export const conversationsAPI = {
  getAll: () => api.get('/conversations/'),
  getOrCreate: (productId) => api.post('/conversations/', { product_id: productId }),
  getMessages: (id) => api.get(`/conversations/${id}/messages/`),
  sendMessage: (id, message, image = null) => {
    const formData = new FormData()
    if (message) formData.append('message', message)
    if (image) formData.append('image', image)
    return api.post(`/conversations/${id}/send_message/`, formData)
  },
  deleteMessage: (conversationId, messageId) => api.delete(`/conversations/${conversationId}/messages/${messageId}/`),
  markRead: (id) => api.post(`/conversations/${id}/mark_read/`),
}

export const wishlistAPI = {
  getAll: () => api.get('/wishlist/'),
  add: (productId) => api.post('/wishlist/', { product_id: productId }),
  remove: (id) => api.delete(`/wishlist/${id}/`),
}

export const notificationsAPI = {
  getAll: () => api.get('/notifications/'),
  markAllRead: () => api.post('/notifications/mark_all_read/'),
}

export default api
