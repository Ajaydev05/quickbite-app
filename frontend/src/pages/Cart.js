import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiPlus, FiMinus, FiTrash2, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Cart() {
  const { cart, updateItem, emptyCart, loading } = useCart();
  const navigate = useNavigate();
  const items = cart.items || [];

  const handleClearCart = async () => {
    if (window.confirm('Clear all items from cart?')) {
      await emptyCart();
      toast.success('Cart cleared');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Add items from a restaurant to get started</p>
          <Link to="/restaurants"
            className="bg-orange-500 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition">
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = cart.total || 0;
  const deliveryFee = cart.restaurant?.deliveryFee ?? 0;
  const tax = +(subtotal * 0.05).toFixed(2);
  const total = +(subtotal + deliveryFee + tax).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-orange-500 mb-6 transition">
          <FiArrowLeft /> Back
        </button>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Your Cart</h1>
          <button onClick={handleClearCart} className="text-red-500 text-sm hover:underline flex items-center gap-1">
            <FiTrash2 /> Clear Cart
          </button>
        </div>

        {cart.restaurant && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
            <FiShoppingBag className="text-orange-500" />
            <span className="text-gray-700 font-medium">{cart.restaurant.name}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm mb-6 divide-y">
          {items.map(item => (
            <div key={item._id} className="flex items-center gap-4 p-4">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">{item.name}</h4>
                {item.customizations?.length > 0 && (
                  <p className="text-xs text-gray-500 mt-0.5">{item.customizations.map(c => c.name).join(', ')}</p>
                )}
                <p className="text-orange-500 font-bold mt-1">₹{item.price}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-orange-500 rounded-xl px-2 py-1">
                  <button onClick={() => updateItem(item._id, item.quantity - 1)}
                    className="text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-orange-600 transition">
                    <FiMinus />
                  </button>
                  <span className="text-white font-bold w-5 text-center">{item.quantity}</span>
                  <button onClick={() => updateItem(item._id, item.quantity + 1)}
                    className="text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-orange-600 transition">
                    <FiPlus />
                  </button>
                </div>
                <span className="font-bold text-gray-800 w-16 text-right">₹{item.subtotal?.toFixed(0)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bill Summary */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">Bill Details</h3>
          <div className="space-y-2 text-sm">
            {[
              { label: 'Item Total', value: `₹${subtotal.toFixed(2)}` },
              { label: 'Delivery Fee', value: deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}` },
              { label: 'GST (5%)', value: `₹${tax}` },
            ].map(row => (
              <div key={row.label} className="flex justify-between text-gray-600">
                <span>{row.label}</span><span>{row.value}</span>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between font-bold text-gray-800 text-base">
              <span>Total</span><span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button onClick={() => navigate('/checkout')} disabled={loading}
          className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 transition disabled:opacity-60">
          Proceed to Checkout → ₹{total.toFixed(0)}
        </button>
      </div>
    </div>
  );
}
