import React, { useState, useEffect } from 'react';
import { getRestaurantOrders, updateOrderStatus } from '../../utils/api';
import { FiRefreshCw, FiPhone } from 'react-icons/fi';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  preparing: 'bg-orange-100 text-orange-800 border-orange-200',
  ready_for_pickup: 'bg-purple-100 text-purple-800 border-purple-200',
  out_for_delivery: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const NEXT_STATUS = {
  pending: { key: 'confirmed', label: 'Accept Order' },
  confirmed: { key: 'preparing', label: 'Start Preparing' },
  preparing: { key: 'ready_for_pickup', label: 'Ready for Pickup' },
  ready_for_pickup: { key: 'out_for_delivery', label: 'Out for Delivery' },
  out_for_delivery: { key: 'delivered', label: 'Mark Delivered' },
};

const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

function OrderCard({ order, onUpdate }) {
  const [updating, setUpdating] = useState(false);
  const next = NEXT_STATUS[order.status];

  const handleUpdate = async () => {
    if (!next) return;
    setUpdating(true);
    try {
      await updateOrderStatus(order._id, { status: next.key });
      onUpdate(order._id, next.key);
      toast.success(`Order ${next.key.replace(/_/g, ' ')}`);
    } catch { toast.error('Failed to update status'); }
    finally { setUpdating(false); }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-bold text-gray-800">{order.customer?.name}</p>
            {order.customer?.phone && (
              <a href={`tel:${order.customer.phone}`} className="text-orange-500 hover:text-orange-600">
                <FiPhone className="w-4 h-4" />
              </a>
            )}
          </div>
          <p className="text-xs text-gray-400">#{order._id?.slice(-6).toUpperCase()} · {new Date(order.createdAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize border ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
          {order.status?.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="bg-gray-50 rounded-xl p-3 mb-3">
        {order.items?.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-gray-700">{item.name} <span className="text-gray-400">×{item.quantity}</span></span>
            <span className="text-gray-600">₹{item.subtotal?.toFixed(0)}</span>
          </div>
        ))}
        {order.specialInstructions && (
          <p className="text-xs text-orange-600 mt-2 italic">📝 {order.specialInstructions}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <span className="font-bold text-gray-800">₹{order.pricing?.total?.toFixed(0)}</span>
          <span className="text-xs text-gray-500 ml-2 capitalize">{order.payment?.method?.replace(/_/g, ' ')}</span>
        </div>
        {next && (
          <button onClick={handleUpdate} disabled={updating}
            className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-600 transition disabled:opacity-60">
            {updating ? 'Updating...' : next.label}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data } = await getRestaurantOrders(filter !== 'all' ? { status: filter } : {});
      setOrders(data.orders || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { loadOrders(); }, [filter]);

  const handleStatusUpdate = (orderId, newStatus) => {
    setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Manage Orders</h1>
          <button onClick={loadOrders} className="text-gray-500 hover:text-orange-500 transition p-2 rounded-full hover:bg-orange-50">
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
          {STATUS_FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition capitalize ${filter === f ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-orange-50'}`}>
              {f === 'all' ? 'All Orders' : f.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-40 animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-7xl mb-4">📭</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No orders</h2>
            <p className="text-gray-500">Orders will appear here when customers place them</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <OrderCard key={order._id} order={order} onUpdate={handleStatusUpdate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
