import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register }  = useAuth();
  const navigate      = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'customer' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const user = await register(form);
      if (user.role === 'restaurant_owner') navigate('/restaurant/setup');
      else navigate('/restaurants');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">🍔</span>
          <h1 className="text-2xl font-bold text-gray-800 mt-3">Create Account</h1>
          <p className="text-gray-500 mt-1">Join QuickBite today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Full Name', key: 'name', type: 'text', placeholder: 'John Doe' },
            { label: 'Email',     key: 'email', type: 'email', placeholder: 'you@example.com' },
            { label: 'Phone',     key: 'phone', type: 'tel', placeholder: '+91 9999999999' },
            { label: 'Password',  key: 'password', type: 'password', placeholder: 'Min 6 characters' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input type={f.type} required value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder={f.placeholder} />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">I am a...</label>
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400">
              <option value="customer">Customer</option>
              <option value="restaurant_owner">Restaurant Owner</option>
            </select>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition disabled:opacity-60">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-orange-500 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
