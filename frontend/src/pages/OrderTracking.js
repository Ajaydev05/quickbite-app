import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../utils/api';
import { FiPackage, FiClock, FiCheckCircle, FiTruck, FiPhone } from 'react-icons/fi';
import { MdRestaurant } from 'react-icons/md';

const STATUS_STEPS = [
  { key: 'pending',          icon: <FiPackage />,     label: 'Order Placed' },
  { key: 'confirmed',        icon: <FiCheckCircle />, label: 'Confirmed' },
  { key: 'preparing',        icon: <MdRestaurant />,  label: 'Preparing' },
  { key: 'out_for_delivery', icon: <FiTruck />,       label: 'On the Way' },
  { key: 'delivered',        icon: <FiCheckCircle />, label: 'Delivered' },
];

const STATUS_INDEX = { pending: 0, confirmed: 1, preparing: 2, ready_for_pickup: 2, out_for_delivery: 3, delivered: 4 };

function StatusBadge({ status }) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    preparing: 'bg-orange-100 text-orange-700',
    ready_for_pickup: 'bg-purple-100 text-purple-700',
    out_for_delivery: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
}

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    try {
      const { data } = await getOrderById(id);
      setOrder(data.order);
    } catch {/* ignore */}
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => {
    fetchOrder();
    // Poll every 30s for live updates
    const interval = setInterval(fetchOrder, 30000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
    </div>
  );

  if (!order) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Order not found</p>
      <Link to="/orders" className="text-orange-500 hover:underline mt-2 block">View all orders</Link>
    </div>
  );

  const currentStep = STATUS_INDEX[order.status] ?? 0;
  const cancelled = order.status === 'cancelled';

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Order Tracking</h1>
            <p className="text-gray-500 text-sm mt-1">#{order._id?.slice(-8).toUpperCase()}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Progress Tracker */}
        {!cancelled && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, idx) => (
                <React.Fragment key={step.key}>
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all
                      ${idx <= currentStep ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {step.icon}
                    </div>
                    <span className={`text-xs font-medium text-center max-w-16 ${idx <= currentStep ? 'text-orange-500' : 'text-gray-400'}`}>
                      {step.label}
                    </span>
                  </div>
                  {idx < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-1 mx-1 rounded ${idx < currentStep ? 'bg-orange-500' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
            {order.estimatedDelivery && order.status !== 'delivered' && (
              <div className="mt-4 flex items-center gap-2 text-gray-600 text-sm bg-orange-50 rounded-xl px-4 py-3">
                <FiClock className="text-orange-500" />
                Estimated delivery: {new Date(order.estimatedDelivery).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        )}

        {/* Restaurant Info */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">🍽️</div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800">{order.restaurant?.name}</h3>
              <p className="text-gray-500 text-sm">{order.restaurant?.address?.street}, {order.restaurant?.address?.city}</p>
            </div>
            {order.restaurant?.phone && (
              <a href={`tel:${order.restaurant.phone}`} className="text-orange-500 hover:text-orange-600">
                <FiPhone className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <h3 className="font-bold text-gray-800 mb-3">Items Ordered</h3>
          <div className="divide-y">
            {order.items?.map((item, i) => (
              <div key={i} className="flex justify-between py-2 text-sm">
                <span className="text-gray-700">{item.name} <span className="text-gray-400">× {item.quantity}</span></span>
                <span className="font-medium text-gray-800">₹{item.subtotal?.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <h3 className="font-bold text-gray-800 mb-3">Bill Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{order.pricing?.subtotal?.toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Delivery Fee</span><span>₹{order.pricing?.deliveryFee}</span></div>
            <div className="flex justify-between text-gray-600"><span>Taxes</span><span>₹{order.pricing?.tax?.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-gray-800 border-t pt-2">
              <span>Total Paid</span><span>₹{order.pricing?.total?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Tracking History */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-3">Tracking History</h3>
          <div className="space-y-3">
            {[...order.tracking].reverse().map((t, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-700 capitalize text-sm">{t.status?.replace(/_/g, ' ')}</p>
                  <p className="text-gray-500 text-xs">{t.message}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{new Date(t.timestamp || t.updatedAt).toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/orders" className="text-orange-500 font-medium hover:underline">View All Orders</Link>
        </div>
      </div>
    </div>
  );
}
