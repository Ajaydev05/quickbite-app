import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getMyOrders, getOrderById, cancelOrder } from '../utils/api';
import { FiPackage, FiClock, FiChevronRight, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-orange-100 text-orange-700',
  out_for_delivery: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

function OrderCard({ order }) {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate(`/orders/${order._id}`)}
      className="bg-white rounded-2xl shadow-sm p-5 cursor-pointer hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-xl">🍽️</div>
          <div>
            <h3 className="font-bold text-gray-800">{order.restaurant?.name}</h3>
            <p className="text-gray-500 text-xs mt-0.5">
              {order.items?.length} item{order.items?.length !== 1 ? 's' : ''} · ₹{order.pricing?.total?.toFixed(0)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
            {order.status?.replace(/_/g, ' ')}
          </span>
          <FiChevronRight className="text-gray-400" />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
        <FiClock />
        <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        {order.items?.slice(0, 2).map((i, idx) => (
          <span key={idx} className="text-gray-500">• {i.name}</span>
        ))}
        {order.items?.length > 2 && <span className="text-gray-400">+{order.items.length - 2} more</span>}
      </div>
    </div>
  );
}

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await getMyOrders(filter ? { status: filter } : {});
        setOrders(data.orders);
      } catch {}
      finally { setLoading(false); }
    };
    fetch();
  }, [filter]);

  const filters = ['', 'pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${filter === f ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-orange-50'}`}>
              {f ? f.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'All'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-7xl mb-4">📦</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">When you place orders, they'll appear here</p>
            <Link to="/restaurants" className="bg-orange-500 text-white px-6 py-3 rounded-full font-bold hover:bg-orange-600 transition">
              Order Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => <OrderCard key={order._id} order={order} />)}
          </div>
        )}
      </div>
    </div>
  );
}

// OrderDetailPage exported for SearchPage re-export
export function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrderById(id).then(({ data }) => setOrder(data.order)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await cancelOrder(id, { reason: 'Cancelled by customer' });
      toast.success('Order cancelled');
      setOrder(o => ({ ...o, status: 'cancelled' }));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cannot cancel order');
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" /></div>;
  if (!order) return <div className="text-center py-20 text-gray-500">Order not found</div>;

  const canCancel = ['pending', 'confirmed'].includes(order.status);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-orange-500 mb-6 transition">
          <FiArrowLeft /> Back
        </button>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800">Order #{order._id?.slice(-8).toUpperCase()}</h1>
          <span className={`text-xs px-3 py-1.5 rounded-full font-medium capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
            {order.status?.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-3">Items</h3>
            <div className="divide-y">
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between py-2 text-sm">
                  <span>{item.name} × {item.quantity}</span>
                  <span className="font-medium">₹{item.subtotal?.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-3">Payment</h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{order.pricing?.subtotal?.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Delivery</span><span>₹{order.pricing?.deliveryFee}</span></div>
              <div className="flex justify-between text-gray-600"><span>Tax</span><span>₹{order.pricing?.tax?.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-gray-800 border-t pt-2"><span>Total</span><span>₹{order.pricing?.total?.toFixed(2)}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-2">Delivery Address</h3>
            <p className="text-gray-600 text-sm">{order.deliveryAddress?.street}, {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}</p>
          </div>

          {canCancel && (
            <button onClick={handleCancel}
              className="w-full border-2 border-red-500 text-red-500 py-3 rounded-2xl font-bold hover:bg-red-50 transition">
              Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
