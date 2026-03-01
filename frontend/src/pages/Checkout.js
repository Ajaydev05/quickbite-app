import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { placeOrder } from '../utils/api';
import { FiMapPin, FiCreditCard, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { id: 'cod',   label: 'Cash on Delivery',  icon: '💵' },
  { id: 'upi',   label: 'UPI',               icon: '📱' },
  { id: 'card',  label: 'Credit/Debit Card', icon: '💳' },
];

export default function Checkout() {
  const { cart, emptyCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [address, setAddress] = useState({
    street: '', city: '', state: '', pincode: '', label: 'Home',
  });

  const items = cart.items || [];
  const subtotal = cart.total || 0;
  const deliveryFee = cart.restaurant?.deliveryFee ?? 40;
  const tax = +(subtotal * 0.05).toFixed(2);
  const total = +(subtotal + deliveryFee + tax).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address.street || !address.city || !address.pincode) {
      toast.error('Please fill in delivery address');
      return;
    }
    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    setLoading(true);
    try {
      const orderItems = items.map(i => ({
        menuItemId: i.menuItem?._id || i.menuItem,
        name: i.name,
        quantity: i.quantity,
        customizations: i.customizations || [],
      }));
      const { data } = await placeOrder({
        restaurantId: cart.restaurant?._id || cart.restaurant,
        items: orderItems,
        deliveryAddress: address,
        payment: { method: paymentMethod },
        specialInstructions,
      });
      await emptyCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  // Use saved address if available
  const savedAddresses = user?.addresses || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Delivery Address */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-4"><FiMapPin className="text-orange-500" /> Delivery Address</h2>
            {savedAddresses.length > 0 && (
              <div className="mb-4 space-y-2">
                <p className="text-sm text-gray-500 font-medium">Saved Addresses</p>
                {savedAddresses.map(a => (
                  <button type="button" key={a._id}
                    onClick={() => setAddress({ street: a.street, city: a.city, state: a.state, pincode: a.pincode, label: a.label })}
                    className="w-full text-left border rounded-xl p-3 hover:border-orange-500 transition text-sm">
                    <span className="font-medium">{a.label}</span>: {a.street}, {a.city} - {a.pincode}
                  </button>
                ))}
                <p className="text-sm text-gray-400 font-medium mt-3">Or enter new address</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Street / Flat No.', key: 'street', colSpan: true },
                { label: 'City', key: 'city' },
                { label: 'State', key: 'state' },
                { label: 'Pincode', key: 'pincode' },
              ].map(f => (
                <div key={f.key} className={f.colSpan ? 'col-span-2' : ''}>
                  <label className="block text-sm text-gray-600 mb-1">{f.label}</label>
                  <input
                    value={address[f.key]}
                    onChange={e => setAddress({ ...address, [f.key]: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                    placeholder={f.label}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-4"><FiCreditCard className="text-orange-500" /> Payment Method</h2>
            <div className="space-y-2">
              {PAYMENT_METHODS.map(m => (
                <label key={m.id} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition ${paymentMethod === m.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}>
                  <input type="radio" name="payment" value={m.id} checked={paymentMethod === m.id}
                    onChange={() => setPaymentMethod(m.id)} className="accent-orange-500" />
                  <span className="text-xl">{m.icon}</span>
                  <span className="font-medium text-gray-700">{m.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Special Instructions */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-3">Special Instructions</h2>
            <textarea rows={2} value={specialInstructions}
              onChange={e => setSpecialInstructions(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              placeholder="Any allergies or preferences? (optional)" />
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-4">Order Summary</h2>
            <div className="divide-y">
              {items.map(item => (
                <div key={item._id} className="flex justify-between py-2 text-sm text-gray-600">
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{item.subtotal?.toFixed(0)}</span>
                </div>
              ))}
            </div>
            <div className="border-t mt-3 pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Delivery Fee</span><span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
              <div className="flex justify-between text-gray-600"><span>GST (5%)</span><span>₹{tax}</span></div>
              <div className="flex justify-between font-bold text-gray-800 text-base pt-2 border-t">
                <span>Total</span><span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 transition disabled:opacity-60 flex items-center justify-center gap-2">
            <FiCheckCircle />
            {loading ? 'Placing Order...' : `Place Order · ₹${total.toFixed(0)}`}
          </button>
        </form>
      </div>
    </div>
  );
}
