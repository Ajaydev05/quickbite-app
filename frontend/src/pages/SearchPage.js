import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { getRestaurants } from '../utils/api';
import { FiStar, FiClock } from 'react-icons/fi';

function RestaurantCard({ restaurant: r }) {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate(`/restaurants/${r._id}`)}
      className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden group">
      <div className="relative h-40 bg-gradient-to-br from-orange-100 to-red-100 overflow-hidden">
        {r.image
          ? <img src={r.image} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
          : <div className="w-full h-full flex items-center justify-center text-5xl">🍽️</div>
        }
        {!r.isOpen && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-800 px-4 py-1 rounded-full font-bold text-sm">Closed</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-gray-800">{r.name}</h3>
          <div className="flex items-center gap-1">
            <FiStar className="text-yellow-400 fill-yellow-400 w-3 h-3" />
            <span className="text-xs font-bold text-gray-700">{r.rating?.toFixed(1) || '4.0'}</span>
          </div>
        </div>
        <p className="text-gray-500 text-xs mt-0.5">{r.cuisine?.join(', ')}</p>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
          <span className="flex items-center gap-1"><FiClock className="w-3 h-3" />{r.deliveryTime}</span>
          {r.deliveryFee === 0 ? <span className="text-green-600">Free delivery</span> : <span>₹{r.deliveryFee} delivery</span>}
        </div>
      </div>
    </div>
  );
}

export const SearchPage = () => {
  const [params] = useSearchParams();
  const query = params.get('q') || '';
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    getRestaurants({ search: query })
      .then(res => setRestaurants(res.data.restaurants || []))
      .catch(() => setRestaurants([]))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Results for "<span className="text-orange-500">{query}</span>"
        </h1>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-48 animate-pulse" />)}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-7xl mb-4">🔍</div>
            <p className="text-xl font-bold text-gray-800 mb-2">No results found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {restaurants.map(r => <RestaurantCard key={r._id} restaurant={r} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export const RestaurantsPage = () => {
  const [params] = useSearchParams();
  const [filters, setFilters] = useState({ cuisine: params.get('cuisine') || '', sort: 'rating' });
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const CUISINES = ['Indian', 'Chinese', 'Italian', 'Biryani', 'Pizza', 'Burger', 'Sushi', 'Mexican'];

  useEffect(() => {
    setLoading(true);
    getRestaurants(filters)
      .then(res => setRestaurants(res.data.restaurants || []))
      .catch(() => setRestaurants([]))
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">All Restaurants</h1>
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
          {CUISINES.map(c => (
            <button key={c}
              onClick={() => setFilters(f => ({...f, cuisine: f.cuisine === c ? '' : c}))}
              className={"px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition " + (filters.cuisine === c ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-orange-50')}>
              {c}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-48 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {restaurants.map(r => <RestaurantCard key={r._id} restaurant={r} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export const ProfilePage = () => {
  const { user } = require('../context/AuthContext').useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">{user?.name?.charAt(0)?.toUpperCase()}</div>
            <div>
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="text-orange-100 text-sm">{user?.email}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mb-6">
          {['profile', 'addresses'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={"px-5 py-2.5 rounded-full font-medium text-sm transition capitalize " + (activeTab === tab ? 'bg-orange-500 text-white' : 'bg-white text-gray-600')}>
              {tab}
            </button>
          ))}
        </div>
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            {[['Name', user?.name], ['Email', user?.email], ['Phone', user?.phone], ['Points', user?.loyaltyPoints + ' pts']].map(([label, value]) => (
              <div key={label} className="flex justify-between border-b pb-3 last:border-0">
                <span className="text-gray-500 text-sm">{label}</span>
                <span className="font-medium text-gray-800 text-sm">{value || '—'}</span>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'addresses' && (
          <div className="space-y-3">
            {user?.addresses?.length ? user.addresses.map(a => (
              <div key={a._id} className="bg-white rounded-2xl shadow-sm p-4">
                <p className="font-bold text-sm mb-1">{a.label}</p>
                <p className="text-gray-600 text-sm">{a.street}, {a.city} - {a.pincode}</p>
              </div>
            )) : <div className="text-center py-10 text-gray-400">No saved addresses</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export const NotFoundPage = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center px-4">
    <div>
      <div className="text-8xl mb-6">🍽️</div>
      <h2 className="text-3xl font-bold text-gray-800 mb-2">404 — Page Not Found</h2>
      <p className="text-gray-500 mb-8">Looks like this page got eaten!</p>
      <Link to="/" className="bg-orange-500 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition">Go Home</Link>
    </div>
  </div>
);

export { OrderDetailPage } from './OrdersPage';
export default SearchPage;
