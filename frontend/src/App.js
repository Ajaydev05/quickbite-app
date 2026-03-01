import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Pages
import Home           from './pages/Home';
import Login          from './pages/Login';
import Register       from './pages/Register';
import RestaurantList from './pages/RestaurantList';
import RestaurantDetail from './pages/RestaurantDetail';
import Cart           from './pages/Cart';
import Checkout       from './pages/Checkout';
import OrderTracking  from './pages/OrderTracking';
import OrderHistory   from './pages/OrderHistory';
import Profile        from './pages/Profile';

// Restaurant Owner Pages
import RestaurantDashboard from './pages/restaurant/Dashboard';
import ManageMenu          from './pages/restaurant/ManageMenu';
import ManageOrders        from './pages/restaurant/ManageOrders';
import RestaurantSetup     from './pages/restaurant/Setup';

// Admin Pages
import AdminDashboard  from './pages/admin/Dashboard';
import AdminUsers      from './pages/admin/Users';

import Navbar from './components/common/Navbar';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"                    element={<Home />} />
        <Route path="/login"               element={<Login />} />
        <Route path="/register"            element={<Register />} />
        <Route path="/restaurants"         element={<RestaurantList />} />
        <Route path="/restaurants/:id"     element={<RestaurantDetail />} />

        <Route path="/cart"      element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/checkout"  element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/orders"    element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
        <Route path="/orders/:id"element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
        <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        <Route path="/restaurant/dashboard" element={<ProtectedRoute roles={['restaurant_owner']}><RestaurantDashboard /></ProtectedRoute>} />
        <Route path="/restaurant/menu"      element={<ProtectedRoute roles={['restaurant_owner']}><ManageMenu /></ProtectedRoute>} />
        <Route path="/restaurant/orders"    element={<ProtectedRoute roles={['restaurant_owner']}><ManageOrders /></ProtectedRoute>} />
        <Route path="/restaurant/setup"     element={<ProtectedRoute roles={['restaurant_owner']}><RestaurantSetup /></ProtectedRoute>} />

        <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users"     element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster position="top-right" />
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
