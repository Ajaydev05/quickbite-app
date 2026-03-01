import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiMapPin, FiClock, FiStar, FiTruck } from 'react-icons/fi';

const categories = [
  { emoji: '🍕', name: 'Pizza' },    { emoji: '🍔', name: 'Burgers' },
  { emoji: '🍣', name: 'Sushi' },    { emoji: '🌮', name: 'Mexican' },
  { emoji: '🍜', name: 'Chinese' },  { emoji: '🥗', name: 'Healthy' },
  { emoji: '🍗', name: 'Chicken' },  { emoji: '🍰', name: 'Desserts' },
];

const features = [
  { icon: <FiTruck className="w-8 h-8 text-orange-500" />, title: 'Fast Delivery', desc: 'Get your food in 30-45 mins' },
  { icon: <FiStar  className="w-8 h-8 text-orange-500" />, title: 'Top Rated',    desc: 'Only the best restaurants' },
  { icon: <FiClock className="w-8 h-8 text-orange-500" />, title: 'Live Tracking',desc: 'Track your order in real-time' },
];

export default function Home() {
  const [city, setCity]     = useState('');
  const navigate            = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/restaurants?city=${city}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-500 to-red-500 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold mb-4 leading-tight">
            Hungry? We've Got You. 🍔
          </h1>
          <p className="text-xl text-orange-100 mb-10">
            Order from the best restaurants near you. Fast delivery, live tracking.
          </p>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <div className="flex-1 flex items-center bg-white rounded-full px-5 py-3 gap-3">
              <FiMapPin className="text-orange-400 flex-shrink-0" />
              <input
                type="text" value={city} onChange={e => setCity(e.target.value)}
                placeholder="Enter your city..."
                className="flex-1 text-gray-800 outline-none text-lg"
              />
            </div>
            <button type="submit" className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition flex items-center gap-2 justify-center">
              <FiSearch /> Find Food
            </button>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">What are you craving?</h2>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
          {categories.map(cat => (
            <button key={cat.name}
              onClick={() => navigate(`/restaurants?cuisine=${cat.name}`)}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-orange-50 hover:shadow-md transition-all group"
            >
              <span className="text-4xl group-hover:scale-110 transition-transform">{cat.emoji}</span>
              <span className="text-sm font-medium text-gray-600">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Why QuickBite */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Why QuickBite?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition">
                <div className="flex justify-center mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-orange-500 text-white py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Own a restaurant?</h2>
        <p className="text-orange-100 text-lg mb-8">Join thousands of restaurants already on QuickBite</p>
        <button onClick={() => navigate('/register')}
          className="bg-white text-orange-500 px-8 py-3 rounded-full font-bold hover:bg-orange-50 transition">
          Partner With Us
        </button>
      </section>
    </div>
  );
}
