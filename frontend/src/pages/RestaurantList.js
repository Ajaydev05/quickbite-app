import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getRestaurants } from '../utils/api';
import { FiStar, FiClock, FiSearch, FiFilter } from 'react-icons/fi';

const cuisines = ['All', 'Pizza', 'Burgers', 'Sushi', 'Chinese', 'Mexican', 'Healthy', 'Chicken'];

function RestaurantCard({ r, onClick }) {
  return (
    <div onClick={onClick} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden group">
      <div className="relative h-48 bg-gradient-to-br from-orange-100 to-red-100 overflow-hidden">
        {r.image
          ? <img src={r.image} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
          : <div className="w-full h-full flex items-center justify-center text-6xl">🍽️</div>
        }
        {!r.isOpen && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-800 px-4 py-1 rounded-full font-bold text-sm">Closed</span>
          </div>
        )}
        {r.isVerified && (
          <span className="absolute top-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">✓ Verified</span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-gray-800 text-lg">{r.name}</h3>
          <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg">
            <FiStar className="text-yellow-400 fill-yellow-400 w-4 h-4" />
            <span className="text-sm font-bold text-gray-700">{r.rating?.toFixed(1) || '4.0'}</span>
          </div>
        </div>
        <p className="text-gray-500 text-sm mt-1">{r.cuisine?.join(', ')}</p>
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
          <span className="flex items-center gap-1"><FiClock className="w-4 h-4" />{r.deliveryTime}</span>
          <span>Min ₹{r.minOrder}</span>
          {r.deliveryFee === 0
            ? <span className="text-green-600 font-medium">Free delivery</span>
            : <span>₹{r.deliveryFee} delivery</span>
          }
        </div>
      </div>
    </div>
  );
}

export default function RestaurantList() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [activeCuisine, setActiveCuisine] = useState('All');
  const [sort, setSort]               = useState('rating');
  const [searchParams]                = useSearchParams();
  const navigate                      = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = { sort };
        if (search) params.search = search;
        const city = searchParams.get('city');
        const cuisine = searchParams.get('cuisine') || (activeCuisine !== 'All' ? activeCuisine : null);
        if (city)    params.city    = city;
        if (cuisine) params.cuisine = cuisine;

        const { data } = await getRestaurants(params);
        setRestaurants(data.restaurants);
      } catch {}
      finally { setLoading(false); }
    };
    fetch();
  }, [search, activeCuisine, sort, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 flex items-center bg-gray-100 rounded-full px-5 py-3 gap-3">
              <FiSearch className="text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search restaurants..."
                className="flex-1 bg-transparent outline-none text-gray-700" />
            </div>
            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-500" />
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="border rounded-full px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400">
                <option value="rating">Top Rated</option>
                <option value="deliveryTime">Fastest</option>
                <option value="minOrder">Min Order</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          {/* Cuisine Filter */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
            {cuisines.map(c => (
              <button key={c} onClick={() => setActiveCuisine(c)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${activeCuisine === c ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-orange-50'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_,i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl">🍽️</span>
            <p className="text-xl text-gray-500 mt-4">No restaurants found</p>
            <p className="text-gray-400">Try a different city or cuisine</p>
          </div>
        ) : (
          <>
            <p className="text-gray-500 mb-6">{restaurants.length} restaurants found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map(r => (
                <RestaurantCard key={r._id} r={r} onClick={() => navigate(`/restaurants/${r._id}`)} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
