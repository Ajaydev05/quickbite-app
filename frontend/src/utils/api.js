import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const registerUser  = (data) => API.post('/auth/register', data);
export const loginUser     = (data) => API.post('/auth/login', data);
export const getMe         = ()     => API.get('/auth/me');
export const getRestaurants    = (params) => API.get('/restaurants', { params });
export const getRestaurantById = (id)     => API.get(`/restaurants/${id}`);
export const getMyRestaurant   = ()       => API.get('/restaurants/my');
export const createRestaurant  = (data)   => API.post('/restaurants', data);
export const updateRestaurant  = (id, data) => API.put(`/restaurants/${id}`, data);
export const getRestaurantDashboard = () => API.get('/restaurants/my/dashboard');
export const getMenu       = (restaurantId) => API.get(`/menu/restaurant/${restaurantId}`);
export const addMenuItem   = (data)         => API.post('/menu', data);
export const updateMenuItem= (id, data)     => API.put(`/menu/${id}`, data);
export const deleteMenuItem= (id)           => API.delete(`/menu/${id}`);
export const toggleItem    = (id)           => API.patch(`/menu/${id}/toggle`);
export const getCart       = ()     => API.get('/cart');
export const addToCart     = (data) => API.post('/cart/add', data);
export const updateCartItem= (id, data) => API.put(`/cart/item/${id}`, data);
export const clearCart     = ()     => API.delete('/cart/clear');
export const placeOrder    = (data) => API.post('/orders', data);
export const getMyOrders   = (params) => API.get('/orders/my', { params });
export const getOrderById  = (id)   => API.get(`/orders/${id}`);
export const cancelOrder   = (id, data) => API.patch(`/orders/${id}/cancel`, data);
export const getRestaurantOrders = (params) => API.get('/orders/restaurant', { params });
export const updateOrderStatus   = (id, data) => API.patch(`/orders/${id}/status`, data);
export const addReview            = (data) => API.post('/reviews', data);
export const getRestaurantReviews = (id, params) => API.get(`/reviews/restaurant/${id}`, { params });
export const updateProfile = (data) => API.put('/users/profile', data);
export const addAddress    = (data) => API.post('/users/address', data);
export const deleteAddress = (id)   => API.delete(`/users/address/${id}`);
export const getAdminDashboard = () => API.get('/admin/dashboard');
export const getAllUsers        = (params) => API.get('/admin/users', { params });
export const verifyRestaurant  = (id) => API.patch(`/admin/restaurants/${id}/verify`);
export default API;
