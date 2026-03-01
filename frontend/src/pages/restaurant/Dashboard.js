import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyRestaurant, getRestaurantOrders, getRestaurantDashboard } from '../../utils/api';
import { FiPackage, FiDollarSign, FiStar, FiToggleLeft, FiToggleRight, FiSettings } from 'react-icons/fi';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  ready_for_pickup: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function Dashboard() {
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [rRes, oRes] = await Promise.all([
          getMyRestaurant(),
          getRestaurantOrders({ limit: 10 }),
        ]);
        setRestaurant(rRes.data.restaurant);
        setOrders(oRes.data.orders || []);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const toggleOpen = async () => {
    try {
      await API.patch(`/restaurants/${restaurant._id}/toggle`);
      setRestaurant(r => ({ ...r, isOpen: !r.isOpen }));
      toast.success(restaurant.isOpen ? 'Restaurant is now Closed' : 'Restaurant is now Open');
    } catch { toast.error('Failed to update status'); }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await API.patch(`/orders/${orderId}/status`, { status });
      setOrders(orders.map(o => o._id === orderId ? { ...o, status } : o));
      toast.success(`Order ${status.replace(/_/g, ' ')}`);
    } catch { toast.error('Failed to update order'); }
  };

  const nextStatus = { pending: 'confirmed', confirmed: 'preparing', preparing: 'ready_for_pickup', ready_for_pickup: 'out_for_delivery', out_for_delivery: 'delivered' };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
    </div>
  );

  if (!restaurant) return (
    <div className="text-center py-20 px-4">
      <div className="text-7xl mb-4">🍽️</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">No Restaurant Found</h2>
      <p className="text-gray-500 mb-6">Set up your restaurant profile to start receiving orders</p>
      <Link to="/restaurant/setup" className="bg-orange-500 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition">
        Set Up Restaurant
      </Link>
    </div>
  );

  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString());
  const revenue = todayOrders.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.pricing?.total || 0), 0);
  const pending = orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status)).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{restaurant.name}</h1>
            <p className="text-gray-500 text-sm">{restaurant.address?.city}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/restaurant/setup" className="text-gray-500 hover:text-orange-500 transition">
              <FiSettings className="w-5 h-5" />
            </Link>
            <button onClick={toggleOpen}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition ${restaurant.isOpen ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
              {restaurant.isOpen ? <FiToggleRight className="w-5 h-5" /> : <FiToggleLeft className="w-5 h-5" />}
              {restaurant.isOpen ? 'Open' : 'Closed'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Today's Orders", value: todayOrders.length, icon: <FiPackage className="w-6 h-6" />, color: 'text-blue-500 bg-blue-50' },
            { label: 'Active Orders', value: pending, icon: <FiPackage className="w-6 h-6" />, color: 'text-orange-500 bg-orange-50' },
            { label: "Today's Revenue", value: `₹${revenue.toFixed(0)}`, icon: <FiDollarSign className="w-6 h-6" />, color: 'text-green-500 bg-green-50' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl shadow-sm p-5">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>{stat.icon}</div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { to: '/restaurant/menu', emoji: '🍽️', title: 'Manage Menu', desc: 'Add or edit items' },
            { to: '/restaurant/orders', emoji: '📦', title: 'All Orders', desc: 'View order history' },
          ].map(l => (
            <Link key={l.to} to={l.to} className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition">
              <div className="text-3xl mb-2">{l.emoji}</div>
              <h3 className="font-bold text-gray-800">{l.title}</h3>
              <p className="text-gray-500 text-sm">{l.desc}</p>
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-gray-800 text-lg mb-4">Recent Orders</h2>
          {orders.length === 0 ? (
            <div className="text-center py-10 text-gray-400">No orders yet</div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order._id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">{order.customer?.name}</p>
                      <p className="text-xs text-gray-500">#{order._id?.slice(-6).toUpperCase()} · {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{order.items?.map(i => `${i.name} ×${i.quantity}`).join(', ')}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800">₹{order.pricing?.total?.toFixed(0)}</span>
                    {nextStatus[order.status] && (
                      <button onClick={() => updateStatus(order._id, nextStatus[order.status])}
                        className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-orange-600 transition capitalize">
                        Mark as {nextStatus[order.status]?.replace(/_/g, ' ')}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
