import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiLogOut, FiPackage, FiHome } from 'react-icons/fi';
import { MdRestaurantMenu, MdDashboard } from 'react-icons/md';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount }    = useCart();
  const navigate         = useNavigate();
  const [open, setOpen]  = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const ownerLinks = [
    { to: '/restaurant/dashboard', icon: <MdDashboard />, label: 'Dashboard' },
    { to: '/restaurant/menu',      icon: <MdRestaurantMenu />, label: 'Menu' },
    { to: '/restaurant/orders',    icon: <FiPackage />, label: 'Orders' },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🍔</span>
            <span className="text-xl font-bold text-orange-500">QuickBite</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/restaurants" className="text-gray-600 hover:text-orange-500 font-medium transition">Browse</Link>

            {user?.role === 'restaurant_owner' && ownerLinks.map(l => (
              <Link key={l.to} to={l.to} className="flex items-center gap-1 text-gray-600 hover:text-orange-500 font-medium transition">
                {l.icon}{l.label}
              </Link>
            ))}

            {user?.role === 'admin' && (
              <Link to="/admin/dashboard" className="text-gray-600 hover:text-orange-500 font-medium">Admin</Link>
            )}

            {user && (
              <Link to="/cart" className="relative">
                <FiShoppingCart className="w-6 h-6 text-gray-600 hover:text-orange-500 transition" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{itemCount}</span>
                )}
              </Link>
            )}

            {user ? (
              <div className="relative">
                <button onClick={() => setDropOpen(!dropOpen)} className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-full hover:bg-orange-100 transition">
                  <FiUser className="text-orange-500" />
                  <span className="text-sm font-medium text-gray-700">{user.name.split(' ')[0]}</span>
                </button>
                {dropOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border py-1 z-50">
                    <Link to="/profile"  onClick={() => setDropOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50"><FiUser /> Profile</Link>
                    <Link to="/orders"   onClick={() => setDropOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50"><FiPackage /> My Orders</Link>
                    <hr className="my-1" />
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"><FiLogOut /> Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login"    className="text-gray-600 hover:text-orange-500 font-medium">Login</Link>
                <Link to="/register" className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 font-medium transition">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setOpen(!open)} className="md:hidden text-gray-600">
            {open ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t px-4 py-3 space-y-2">
          <Link to="/restaurants" onClick={() => setOpen(false)} className="block py-2 text-gray-700 hover:text-orange-500">Browse Restaurants</Link>
          {user && <Link to="/cart"    onClick={() => setOpen(false)} className="block py-2 text-gray-700">Cart ({itemCount})</Link>}
          {user && <Link to="/orders"  onClick={() => setOpen(false)} className="block py-2 text-gray-700">My Orders</Link>}
          {user && <Link to="/profile" onClick={() => setOpen(false)} className="block py-2 text-gray-700">Profile</Link>}
          {user?.role === 'restaurant_owner' && ownerLinks.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block py-2 text-gray-700">{l.label}</Link>
          ))}
          {!user && <>
            <Link to="/login"    onClick={() => setOpen(false)} className="block py-2 text-gray-700">Login</Link>
            <Link to="/register" onClick={() => setOpen(false)} className="block py-2 text-orange-500 font-medium">Sign Up</Link>
          </>}
          {user && <button onClick={handleLogout} className="block py-2 text-red-500 w-full text-left">Logout</button>}
        </div>
      )}
    </nav>
  );
}
