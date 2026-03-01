import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, addAddress, deleteAddress } from '../utils/api';
import { FiUser, FiMapPin, FiPlus, FiTrash2, FiEdit2, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, fetchUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: 'Home', street: '', city: '', state: '', pincode: '' });
  const [addingAddress, setAddingAddress] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      await fetchUser();
      setEditing(false);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally { setSaving(false); }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await addAddress(newAddress);
      await fetchUser();
      setAddingAddress(false);
      setNewAddress({ label: 'Home', street: '', city: '', state: '', pincode: '' });
      toast.success('Address saved!');
    } catch {
      toast.error('Failed to save address');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Remove this address?')) return;
    try {
      await deleteAddress(id);
      await fetchUser();
      toast.success('Address removed');
    } catch {
      toast.error('Failed to remove address');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold">{user?.name}</h1>
              <p className="text-orange-100 text-sm">{user?.email}</p>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full mt-1 inline-block capitalize">
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
          </div>
          {user?.loyaltyPoints > 0 && (
            <div className="mt-4 bg-white/10 rounded-xl px-4 py-2 text-sm flex items-center gap-2">
              🏆 <span>{user.loyaltyPoints} Loyalty Points</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['profile', 'addresses'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-full font-medium text-sm transition capitalize ${activeTab === tab ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-orange-50'}`}>
              {tab === 'profile' ? '👤 Profile' : '📍 Addresses'}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-800 flex items-center gap-2"><FiUser className="text-orange-500" /> Personal Info</h2>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-orange-500 text-sm font-medium hover:underline">
                  <FiEdit2 /> Edit
                </button>
              ) : (
                <button onClick={handleSaveProfile} disabled={saving}
                  className="flex items-center gap-1.5 bg-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-orange-600 transition">
                  <FiSave /> {saving ? 'Saving...' : 'Save'}
                </button>
              )}
            </div>
            <div className="space-y-4">
              {[
                { label: 'Full Name', key: 'name', editable: true },
                { label: 'Phone', key: 'phone', editable: true },
                { label: 'Email', value: user?.email, editable: false },
                { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '', editable: false },
              ].map(field => (
                <div key={field.key || field.label}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{field.label}</label>
                  {editing && field.editable ? (
                    <input value={form[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  ) : (
                    <p className="text-gray-800 font-medium">{field.value || form[field.key] || user?.[field.key]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="space-y-4">
            {user?.addresses?.length > 0 ? user.addresses.map(addr => (
              <div key={addr._id} className="bg-white rounded-2xl shadow-sm p-5 flex items-start gap-3">
                <FiMapPin className="text-orange-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800 text-sm">{addr.label}</span>
                    {addr.isDefault && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Default</span>}
                  </div>
                  <p className="text-gray-600 text-sm mt-0.5">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                </div>
                <button onClick={() => handleDeleteAddress(addr._id)} className="text-red-400 hover:text-red-600 transition">
                  <FiTrash2 />
                </button>
              </div>
            )) : (
              <div className="text-center py-10 text-gray-500">
                <div className="text-5xl mb-3">📍</div>
                <p>No saved addresses yet</p>
              </div>
            )}

            {!addingAddress ? (
              <button onClick={() => setAddingAddress(true)}
                className="w-full border-2 border-dashed border-orange-300 text-orange-500 rounded-2xl py-4 flex items-center justify-center gap-2 font-medium hover:bg-orange-50 transition">
                <FiPlus /> Add New Address
              </button>
            ) : (
              <form onSubmit={handleAddAddress} className="bg-white rounded-2xl shadow-sm p-5">
                <h3 className="font-bold text-gray-800 mb-4">New Address</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Label</label>
                    <select value={newAddress.label} onChange={e => setNewAddress({ ...newAddress, label: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                      {['Home', 'Work', 'Other'].map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  {[
                    { key: 'street', label: 'Street / Flat No.' },
                    { key: 'city', label: 'City' },
                    { key: 'state', label: 'State' },
                    { key: 'pincode', label: 'Pincode' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-xs text-gray-500 mb-1 block">{f.label}</label>
                      <input required value={newAddress[f.key]} onChange={e => setNewAddress({ ...newAddress, [f.key]: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        placeholder={f.label} />
                    </div>
                  ))}
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setAddingAddress(false)}
                      className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition">
                      Cancel
                    </button>
                    <button type="submit"
                      className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl font-medium hover:bg-orange-600 transition">
                      Save Address
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
