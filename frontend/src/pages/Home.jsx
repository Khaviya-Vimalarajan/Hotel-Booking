import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Search, MapPin, Calendar, Users, Star, ArrowRight, Wifi, Shield, Dumbbell, Coffee } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [searchParams, setSearchParams] = useState({
    city: '',
    search: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async (params = {}) => {
    setLoading(true);
    try {
      const res = await api.get('/hotels', { params });
      setHotels(res.data);
    } catch (err) {
      console.error('Error fetching hotels:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const cleanParams = {};
    if (searchParams.city && searchParams.city.trim()) {
      cleanParams.city = searchParams.city.trim();
    }
    if (searchParams.search && searchParams.search.trim()) {
      cleanParams.search = searchParams.search.trim();
    }
    fetchHotels(cleanParams);

    // Smooth scroll down to the results section
    setTimeout(() => {
      const element = document.getElementById('hotels-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="w-full min-h-screen">
      {/* 1. HERO SECTION */}
      <div className="relative h-[85vh] w-full flex items-center justify-center overflow-hidden">
        {/* Full-bleed background */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[8000ms] scale-105"
          style={{ 
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.55)), url('https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1800&h=1000&fit=crop')` 
          }}
        />
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white flex flex-col items-center gap-6">
          <motion.span 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs uppercase tracking-[0.3em] font-bold text-secondary-light bg-black/35 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10"
          >
            Luxury Resorts & Hotels
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold leading-tight"
          >
            Experience the Sanctuary <br />
            <span className="italic font-normal text-secondary-light">of Modern Luxury</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-xl text-sm sm:text-base text-gray-200 font-light"
          >
            Escape the ordinary. Discover high-end coastal resorts and mountain lodges curated for ultimate serenity and private relaxation.
          </motion.p>
          
          {/* Floating Search Widget */}
          <motion.form 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            onSubmit={handleSearchSubmit}
            className="w-full max-w-4xl mt-8 p-5 rounded-2xl glass backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-center gap-4 text-gray-800"
          >
            {/* Destination Search */}
            <div className="w-full flex items-center gap-3 px-4 py-3 bg-white/60 dark:bg-black/10 rounded-xl border border-white/40">
              <MapPin className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1 text-left">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500">Destination</label>
                <input 
                  type="text" 
                  placeholder="Where are you going?" 
                  value={searchParams.city}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full bg-transparent border-none text-xs font-semibold focus:outline-none placeholder-gray-500"
                />
              </div>
            </div>

            {/* Keyword Search */}
            <div className="w-full flex items-center gap-3 px-4 py-3 bg-white/60 dark:bg-black/10 rounded-xl border border-white/40">
              <Search className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1 text-left">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500">Hotel Name</label>
                <input 
                  type="text" 
                  placeholder="Search specific hotel" 
                  value={searchParams.search}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full bg-transparent border-none text-xs font-semibold focus:outline-none placeholder-gray-500"
                />
              </div>
            </div>

            {/* Search Action */}
            <button 
              type="submit" 
              className="w-full md:w-auto py-3.5 px-10 md:ml-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg self-stretch md:self-auto"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </motion.form>
        </div>
      </div>

      {/* 2. PROMOTIONS BANNER */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-secondary/15 border border-secondary/20 rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-secondary">Seasonal Offers</span>
            <h3 className="font-serif text-2xl font-bold text-secondary-dark mt-1">Exclusive Member Discount Active</h3>
            <p className="text-xs text-gray-600 mt-1">Apply promo code <span className="font-bold text-secondary">LUXURY25</span> at checkout to receive 25% off all suite bookings this month.</p>
          </div>
          <button 
            onClick={() => navigate('/register')}
            className="px-6 py-3 bg-secondary hover:bg-secondary-dark text-white text-xs font-bold rounded-full flex items-center gap-2 transition"
          >
            <span>Sign Up Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 3. HOTEL DISPLAY CARDS */}
      <section id="hotels-section" className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center md:text-left mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-secondary">Select Destinations</span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold mt-1 text-gray-900">Featured Luxury Resorts</h2>
          </div>
          <p className="max-w-sm text-xs text-gray-500">Every resort is designed to reflect the natural aesthetics of its landscape, matching luxury with heritage.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse bg-white rounded-3xl h-96 shadow-md border border-gray-100" />
            ))}
          </div>
        ) : hotels.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <h4 className="font-serif text-xl text-gray-500 mb-2">No Resorts Found</h4>
            <p className="text-xs text-gray-400">Try adjusting your filters or destination keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {hotels.map((hotel, index) => (
              <motion.div
                key={hotel.hotelId}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl border border-gray-50 transition-all duration-300 flex flex-col"
              >
                {/* Image Wrap */}
                <div className="relative h-64 w-full overflow-hidden">
                  <img 
                    src={hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'} 
                    alt={hotel.hotelName} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                  
                  {/* Rating Badge */}
                  <div className="absolute top-4 left-4 bg-white/95 px-3 py-1.5 rounded-full shadow-md backdrop-blur-sm flex items-center gap-1.5 text-xs font-bold text-gray-800">
                    <Star className="w-3.5 h-3.5 fill-accent-gold text-accent-gold" />
                    <span>{hotel.starRating || 5.0}</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-secondary flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-secondary" />
                      <span>{hotel.city}, {hotel.country}</span>
                    </span>
                    <h3 className="font-serif text-xl font-bold mt-2 text-gray-900 group-hover:text-primary transition-colors">
                      {hotel.hotelName}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed mt-2 line-clamp-3">
                      {hotel.description}
                    </p>
                  </div>

                  <div className="border-t border-gray-100 pt-5 mt-5 flex items-center justify-between">
                    <span className="text-xs text-gray-400">Starting from</span>
                    <button 
                      onClick={() => navigate(`/hotels/${hotel.hotelId}`)}
                      className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-full text-xs font-bold transition flex items-center gap-1.5 shadow-sm group-hover:shadow"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* 4. VALUE PROPOSITION */}
      <section className="bg-primary/5 py-20 my-12 border-t border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center md:text-left flex flex-col items-center md:items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><Shield className="w-6 h-6" /></div>
            <h4 className="font-serif text-lg font-bold text-gray-900">Secure Bookings</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Guaranteed room locks and 100% secure payments through integrated encryptions.</p>
          </div>
          <div className="text-center md:text-left flex flex-col items-center md:items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><Coffee className="w-6 h-6" /></div>
            <h4 className="font-serif text-lg font-bold text-gray-900">Premium Amenities</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Infinity pool decks, Michelin-star local chefs, private beach keys, and private dining rooms.</p>
          </div>
          <div className="text-center md:text-left flex flex-col items-center md:items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><Dumbbell className="w-6 h-6" /></div>
            <h4 className="font-serif text-lg font-bold text-gray-900">Wellness Sanctuary</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Fully equipped modern cardio chambers and daily sunrise coastal yoga classes.</p>
          </div>
          <div className="text-center md:text-left flex flex-col items-center md:items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><Wifi className="w-6 h-6" /></div>
            <h4 className="font-serif text-lg font-bold text-gray-900">Unrestricted Fiber WiFi</h4>
            <p className="text-xs text-gray-500 leading-relaxed">State of the art coverage across all private terraces and beach cabanas.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
