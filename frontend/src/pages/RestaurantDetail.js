import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRestaurantById } from '../utils/api';
import { useCart } from '../context/CartContext';
import { FiStar, FiClock, FiShoppingCart, FiPlus, FiMinus } from 'react-icons/fi';
import { MdVeganSymbol } from 'react-icons/md';
import toast from 'react-hot-toast';

function MenuItem({ item }) {
  const { addItem, cart, updateItem } = useCart();
  const cartItem = cart.items?.find(i => i.menuItem?._id === item._id || i.menuItem === item._id);
  const qty = cartItem?.quantity || 0;

  return (
    <div className="flex items-center gap-4 py-4 border-b last:border-0">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {item.isVeg
            ? <span className="w-4 h-4 border-2 border-green-600 flex items-center justify-center rounded-sm"><span className="w-2 h-2 bg-green-600 rounded-full" /></span>
            : <span className="w-4 h-4 border-2 border-red-600 flex items-center justify-center rounded-sm"><span className="w-2 h-2 bg-red-600 rounded-full" /></span>
          }
          <h4 className="font-semibold text-gray-800">{item.name}</h4>
          {item.isBestSeller && <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full font-medium">⭐ Best Seller</span>}
        </div>
        <p className="text-gray-500 text-sm mt-1 line-clamp-2">{item.description}</p>
        <p className="font-bold text-gray-800 mt-2">₹{item.price}</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        {item.image && <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover" />}
        {qty === 0 ? (
          <button onClick={() => addItem(item._id)} className="bg-orange-500 text-white px-5 py-2 rounded-xl font-bold hover:bg-orange-600 transition text-sm flex items-center gap-1">
            <FiPlus /> Add
          </button>
        ) : (
          <div className="flex items-center gap-3 bg-orange-500 rounded-xl px-2 py-1">
            <button onClick={() => updateItem(cartItem._id, qty - 1)} className="text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-orange-600 transition"><FiMinus /></button>
            <span className="text-white font-bold w-6 text-center">{qty}</span>
            <button onClick={() => addItem(item._id)} className="text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-orange-600 transition"><FiPlus /></button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RestaurantDetail() {
  const { id }               = useParams();
  const navigate             = useNavigate();
  const { itemCount, cart }  = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu]             = useState({});
  const [loading, setLoading]       = useState(true);
  const [activeCategory, setActiveCategory] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getRestaurantById(id);
        setRestaurant(data.restaurant);
        setMenu(data.menu);
        setActiveCategory(Object.keys(data.menu)[0] || '');
      } catch { toast.error('Failed to load restaurant'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
    </div>
  );

  if (!restaurant) return <div className="text-center py-20"><p className="text-gray-500">Restaurant not found</p></div>;

  const categories = Object.keys(menu);
  const cartTotal  = cart.total || 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Cover */}
      <div className="relative h-56 bg-gradient-to-br from-orange-200 to-red-200">
        {restaurant.coverImage && <img src={restaurant.coverImage} alt="" className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="max-w-4xl mx-auto flex items-end gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white shadow-lg overflow-hidden flex-shrink-0">
              {restaurant.image
                ? <img src={restaurant.image} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-3xl bg-orange-50">🍽️</div>
              }
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">{restaurant.name}</h1>
              <p className="text-orange-200 text-sm">{restaurant.cuisine?.join(' • ')}</p>
              <div className="flex items-center gap-4 mt-1 text-sm">
                <span className="flex items-center gap-1"><FiStar className="fill-yellow-400 text-yellow-400" />{restaurant.rating?.toFixed(1)} ({restaurant.totalReviews})</span>
                <span className="flex items-center gap-1"><FiClock />{restaurant.deliveryTime}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${restaurant.isOpen ? 'bg-green-500' : 'bg-red-500'}`}>
                  {restaurant.isOpen ? 'Open' : 'Closed'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Info Strip */}
        <div className="bg-white rounded-2xl p-4 flex gap-6 text-center shadow-sm mb-6">
          {[
            { label: 'Min Order', value: `₹${restaurant.minOrder}` },
            { label: 'Delivery Fee', value: restaurant.deliveryFee === 0 ? 'FREE' : `₹${restaurant.deliveryFee}` },
            { label: 'Delivery Time', value: restaurant.deliveryTime },
          ].map(i => (
            <div key={i.label} className="flex-1 border-r last:border-0">
              <p className="font-bold text-gray-800">{i.value}</p>
              <p className="text-xs text-gray-500">{i.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-6">
          {/* Category Sidebar */}
          {categories.length > 0 && (
            <div className="hidden md:block w-48 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-sm p-3 sticky top-20">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition ${activeCategory === cat ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-orange-50'}`}>
                    {cat} <span className="text-xs opacity-70">({menu[cat]?.length})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Menu Items */}
          <div className="flex-1">
            {/* Mobile Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-3 md:hidden">
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${activeCategory === cat ? 'bg-orange-500 text-white' : 'bg-white text-gray-600'}`}>
                  {cat}
                </button>
              ))}
            </div>

            {activeCategory && menu[activeCategory] && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{activeCategory}</h2>
                {menu[activeCategory].map(item => <MenuItem key={item._id} item={item} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Cart Bar */}
      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-40">
          <div className="max-w-md mx-auto">
            <button onClick={() => navigate('/cart')}
              className="w-full bg-orange-500 text-white rounded-2xl p-4 flex items-center justify-between shadow-2xl hover:bg-orange-600 transition">
              <span className="bg-orange-600 rounded-xl px-3 py-1 text-sm font-bold">{itemCount} items</span>
              <span className="font-bold flex items-center gap-2"><FiShoppingCart /> View Cart</span>
              <span className="font-bold">₹{cartTotal.toFixed(0)}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
