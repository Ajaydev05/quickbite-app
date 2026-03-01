import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminDashboard, verifyRestaurant } from '../../utils/api';
import { FiUsers, FiShoppingBag, FiDollarSign, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { MdRestaurant } from 'react-icons/md';
import toast from 'react-hot-toast';
import API from '../../utils/api';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminDashboard()
      .then(res => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const handleVerify = async (id) => {
    try {
      await verifyRestaurant(id);
      toast.success('Restaurant verified!');
      // refresh
      const res = await getAdminDashboard();
      setData(res.data);
    } catch { toast.error('Failed to verify restaurant'); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" /></div>;

  const stats = data?.stats || {};
  const pending = data?.pendingRestaurants || [];
  const recentOrders = data?.recentOrders || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm">Platform overview</p>
          </div>
          <Link to="/admin/users" className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-orange-600 transition">
            Manage Users →
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users',        value: stats.users,       icon: <FiUsers />,       color: 'text-blue-500 bg-blue-50' },
            { label: 'Total Restaurants',  value: stats.restaurants, icon: <MdRestaurant />,  color: 'text-orange-500 bg-orange-50' },
            { label: 'Total Orders',       value: stats.totalOrders,      icon: <FiShoppingBag />, color: 'text-purple-500 bg-purple-50' },
            { label: 'Total Revenue',      value: `₹${(stats.revenue || 0).toLocaleString('en-IN')}`, icon: <FiDollarSign />, color: 'text-green-500 bg-green-50' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3 ${s.color}`}>{s.icon}</div>
              <p className="text-2xl font-bold text-gray-800">{s.value ?? '—'}</p>
              <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Pending Verification */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
              <FiAlertCircle className="text-orange-500" /> Pending Verification
              {pending.length > 0 && <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">{pending.length}</span>}
            </h2>
            {pending.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <FiCheckCircle className="w-10 h-10 mx-auto mb-2 text-green-400" />
                <p>All restaurants verified!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pending.map(r => (
                  <div key={r._id} className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">🍽️</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{r.name}</p>
                      <p className="text-gray-500 text-xs">{r.address?.city} · {r.owner?.name}</p>
                    </div>
                    <button onClick={() => handleVerify(r._id)}
                      className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-600 transition flex-shrink-0">
                      Verify
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-4">Recent Orders</h2>
            {recentOrders.length === 0 ? (
              <div className="text-center py-10 text-gray-400">No recent orders</div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map(order => (
                  <div key={order._id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm">{order.customer?.name}</p>
                      <p className="text-gray-500 text-xs truncate">{order.restaurant?.name} · #{order._id?.slice(-6).toUpperCase()}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-gray-800 text-sm">₹{order.pricing?.total?.toFixed(0)}</p>
                      <span className={`text-xs capitalize ${order.status === 'delivered' ? 'text-green-600' : order.status === 'cancelled' ? 'text-red-500' : 'text-orange-500'}`}>
                        {order.status?.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
