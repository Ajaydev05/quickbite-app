import React, { useState, useEffect } from 'react';
import { getMyRestaurant, addMenuItem, updateMenuItem, deleteMenuItem, toggleItem, getMenu } from '../../utils/api';
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CATEGORIES = ['Starters', 'Main Course', 'Breads', 'Rice & Biryani', 'Desserts', 'Beverages', 'Combos', 'Other'];
const EMPTY_ITEM = { name: '', description: '', price: '', category: 'Main Course', isVeg: true, isAvailable: true, image: '' };

function MenuItemForm({ item, onSave, onClose }) {
  const [form, setForm] = useState(item || EMPTY_ITEM);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save item');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-bold text-gray-800 text-lg">{item ? 'Edit Item' : 'Add Menu Item'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Item Name *</label>
            <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" placeholder="e.g. Butter Chicken" />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Description</label>
            <textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm resize-none" placeholder="Describe the dish..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Price (₹) *</label>
              <input required type="number" min="1" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" placeholder="299" />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Category *</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Image URL</label>
            <input value={form.image} onChange={e => setForm({...form, image: e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" placeholder="https://..." />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isVeg} onChange={e => setForm({...form, isVeg: e.target.checked})} className="accent-green-500" />
              <span className="text-sm text-gray-700">🟢 Veg</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isAvailable} onChange={e => setForm({...form, isAvailable: e.target.checked})} className="accent-orange-500" />
              <span className="text-sm text-gray-700">Available</span>
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl font-medium hover:bg-orange-600 transition disabled:opacity-60 text-sm">
              {saving ? 'Saving...' : 'Save Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ManageMenu() {
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getMyRestaurant();
        setRestaurant(data.restaurant);
        const { data: menuData } = await getMenu(data.restaurant._id);
        // Flatten menu from grouped to array
        const items = Array.isArray(menuData.menu) ? menuData.menu.flatMap(c => c.items || []) : Object.values(menuData.menu || {}).flat();
        setMenu(items.length ? items : []);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleSave = async (formData) => {
    if (editItem) {
      const { data } = await updateMenuItem(editItem._id, { ...formData, restaurant: restaurant._id });
      setMenu(menu.map(i => i._id === editItem._id ? data.item : i));
      toast.success('Item updated!');
    } else {
      const { data } = await addMenuItem({ ...formData, restaurant: restaurant._id });
      setMenu([...menu, data.item]);
      toast.success('Item added!');
    }
    setEditItem(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await deleteMenuItem(id);
      setMenu(menu.filter(i => i._id !== id));
      toast.success('Item deleted');
    } catch { toast.error('Failed to delete item'); }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await toggleItem(id);
      setMenu(menu.map(i => i._id === id ? { ...i, isAvailable: data.isAvailable } : i));
    } catch { toast.error('Failed to toggle availability'); }
  };

  const categories = ['All', ...new Set(menu.map(i => i.category))];
  const filtered = filterCategory === 'All' ? menu : menu.filter(i => i.category === filterCategory);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {(showForm || editItem) && (
        <MenuItemForm
          item={editItem}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditItem(null); }}
        />
      )}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Menu Management</h1>
            <p className="text-gray-500 text-sm">{menu.length} items</p>
          </div>
          <button onClick={() => { setEditItem(null); setShowForm(true); }}
            className="bg-orange-500 text-white px-5 py-2.5 rounded-full font-medium flex items-center gap-2 hover:bg-orange-600 transition text-sm">
            <FiPlus /> Add Item
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
          {categories.map(c => (
            <button key={c} onClick={() => setFilterCategory(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${filterCategory === c ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-orange-50'}`}>
              {c}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-7xl mb-4">🍽️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No menu items yet</h2>
            <p className="text-gray-500 mb-6">Add your first dish to start receiving orders</p>
            <button onClick={() => setShowForm(true)} className="bg-orange-500 text-white px-6 py-3 rounded-full font-bold hover:bg-orange-600 transition">
              Add First Item
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(item => (
              <div key={item._id} className={`bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4 transition ${!item.isAvailable ? 'opacity-60' : ''}`}>
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 bg-orange-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🍽️</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${item.isVeg ? 'border-green-600 bg-green-600' : 'border-red-600 bg-red-600'}`} />
                    <h3 className="font-bold text-gray-800 truncate">{item.name}</h3>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex-shrink-0">{item.category}</span>
                  </div>
                  <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{item.description}</p>
                  <p className="font-bold text-orange-500 mt-1">₹{item.price}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handleToggle(item._id)} title="Toggle availability"
                    className={`text-xl ${item.isAvailable ? 'text-green-500' : 'text-gray-400'}`}>
                    {item.isAvailable ? <FiToggleRight /> : <FiToggleLeft />}
                  </button>
                  <button onClick={() => { setEditItem(item); setShowForm(true); }} className="text-blue-400 hover:text-blue-600 transition p-1">
                    <FiEdit2 />
                  </button>
                  <button onClick={() => handleDelete(item._id)} className="text-red-400 hover:text-red-600 transition p-1">
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
