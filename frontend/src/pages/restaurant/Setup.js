import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyRestaurant, createRestaurant, updateRestaurant } from '../../utils/api';
import { FiSave, FiMapPin, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CUISINES = ['Indian', 'Chinese', 'Italian', 'Mexican', 'Continental', 'Biryani', 'Pizza', 'Burgers', 'Sushi', 'Thai', 'Healthy', 'Desserts'];

const EMPTY = {
  name: '', description: '', phone: '', email: '',
  address: { street: '', city: '', state: '', pincode: '' },
  cuisine: [],
  deliveryTime: '30-45', deliveryFee: 40, minOrder: 100,
  image: '', coverImage: '',
};

export default function Setup() {
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMyRestaurant()
      .then(({ data }) => {
        setRestaurant(data.restaurant);
        setForm({ ...EMPTY, ...data.restaurant, address: data.restaurant.address || EMPTY.address });
      })
      .catch(() => {/* no restaurant yet */})
      .finally(() => setLoading(false));
  }, []);

  const toggleCuisine = (c) => {
    setForm(f => ({
      ...f,
      cuisine: f.cuisine.includes(c) ? f.cuisine.filter(x => x !== c) : [...f.cuisine, c],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.cuisine.length === 0) { toast.error('Select at least one cuisine'); return; }
    setSaving(true);
    try {
      if (restaurant) {
        await updateRestaurant(restaurant._id, form);
        toast.success('Restaurant updated!');
      } else {
        await createRestaurant(form);
        toast.success('Restaurant created!');
      }
      navigate('/restaurant/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save restaurant');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">{restaurant ? 'Edit Restaurant' : 'Set Up Your Restaurant'}</h1>
          <p className="text-gray-500 mt-1">{restaurant ? 'Update your restaurant details' : 'Fill in the details to get started'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-4"><FiInfo className="text-orange-500" /> Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Restaurant Name *</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" placeholder="e.g. Spice Garden" />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Description</label>
                <textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm resize-none"
                  placeholder="Describe your restaurant..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Phone *</label>
                  <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" placeholder="+91 99999 99999" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" placeholder="restaurant@email.com" />
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-4"><FiMapPin className="text-orange-500" /> Address</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Street Address *</label>
                <input required value={form.address.street} onChange={e => setForm({...form, address: {...form.address, street: e.target.value}})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" placeholder="Street / Area" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'city', label: 'City', placeholder: 'City' },
                  { key: 'state', label: 'State', placeholder: 'State' },
                  { key: 'pincode', label: 'Pincode', placeholder: '000000' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-sm text-gray-600 mb-1 block">{f.label} *</label>
                    <input required value={form.address[f.key]} onChange={e => setForm({...form, address: {...form.address, [f.key]: e.target.value}})}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" placeholder={f.placeholder} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cuisine */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-4">Cuisine Types *</h2>
            <div className="flex flex-wrap gap-2">
              {CUISINES.map(c => (
                <button key={c} type="button" onClick={() => toggleCuisine(c)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${form.cuisine.includes(c) ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-orange-50'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Delivery Settings */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-4">Delivery Settings</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'deliveryTime', label: 'Delivery Time', placeholder: '30-45 mins', type: 'text' },
                { key: 'deliveryFee', label: 'Delivery Fee (₹)', placeholder: '40', type: 'number' },
                { key: 'minOrder', label: 'Min Order (₹)', placeholder: '100', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-sm text-gray-600 mb-1 block">{f.label}</label>
                  <input type={f.type} value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" placeholder={f.placeholder} />
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-4">Images</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Logo URL</label>
                <input value={form.image} onChange={e => setForm({...form, image: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" placeholder="https://..." />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Cover Image URL</label>
                <input value={form.coverImage} onChange={e => setForm({...form, coverImage: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" placeholder="https://..." />
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 transition disabled:opacity-60 flex items-center justify-center gap-2">
            <FiSave /> {saving ? 'Saving...' : restaurant ? 'Update Restaurant' : 'Create Restaurant'}
          </button>
        </form>
      </div>
    </div>
  );
}
