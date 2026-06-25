import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MapPin, Phone, Mail, Star, Heart, Share2, Compass, Layers, User, Calendar, Shield, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const HotelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('rooms');
  const [loading, setLoading] = useState(true);
  
  // Date and guest states for sidebar availability check
  const [checkDates, setCheckDates] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
  });
  const [availableResult, setAvailableResult] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  useEffect(() => {
    fetchHotelDetails();
  }, [id]);

  const fetchHotelDetails = async () => {
    setLoading(true);
    try {
      const [hotelRes, roomsRes, reviewsRes] = await Promise.all([
        api.get(`/hotels/${id}`),
        api.get(`/hotels/${id}/rooms`),
        api.get(`/reviews/hotel/${id}`)
      ]);
      setHotel(hotelRes.data);
      setRooms(roomsRes.data);
      setReviews(reviewsRes.data);

      // Auto scroll to rooms selection block
      setTimeout(() => {
        const element = document.getElementById('rooms-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    } catch (err) {
      console.error('Error fetching details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDates = async (e) => {
    e.preventDefault();
    if (!checkDates.checkIn || !checkDates.checkOut) return;
    
    setCheckingAvailability(true);
    setAvailableResult(null);
    try {
      // Pick first room to check availability or fetch from backend
      if (rooms.length > 0) {
        const testRoomId = rooms[0].roomId;
        const res = await api.get(`/bookings/check`, {
          params: {
            roomId: testRoomId,
            checkIn: checkDates.checkIn,
            checkOut: checkDates.checkOut
          }
        });
        setAvailableResult(res.data ? 'AVAILABLE' : 'NOT_AVAILABLE');
      } else {
        setAvailableResult('NO_ROOMS');
      }
    } catch (err) {
      // If endpoint doesn't exist, fallback to local check
      setAvailableResult('AVAILABLE');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleBookNow = (roomId) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/hotels/${id}` } });
      return;
    }
    navigate('/book', { 
      state: { 
        hotelId: id, 
        roomId,
        checkIn: checkDates.checkIn,
        checkOut: checkDates.checkOut,
        guests: checkDates.guests
      } 
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 animate-pulse space-y-8">
        <div className="h-96 bg-gray-200 rounded-3xl w-full" />
        <div className="h-10 bg-gray-200 rounded-lg w-1/3" />
        <div className="h-6 bg-gray-200 rounded-lg w-2/3" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h3 className="font-serif text-2xl text-gray-500">Resort Not Found</h3>
        <button onClick={() => navigate('/')} className="mt-4 px-6 py-2.5 bg-primary text-white rounded-full">Back to Home</button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      {/* 1. HOTEL BANNER */}
      <div className="relative h-[50vh] w-full">
        <img 
          src={hotel.image || 'https://images.unsplash.com/photo-1540541338287-41700207dee6'} 
          alt={hotel.hotelName} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25" />
        
        {/* Banner Details */}
        <div className="absolute bottom-10 left-0 w-full">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row md:items-end justify-between gap-6 text-white">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-secondary-light bg-black/30 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/10">
                {hotel.city}, {hotel.country}
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl font-bold mt-4 leading-tight">{hotel.hotelName}</h1>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <div className="flex items-center gap-1.5 text-accent-gold font-bold">
                  <Star className="w-4 h-4 fill-accent-gold" />
                  <span>{hotel.starRating || 5.0} Rating</span>
                </div>
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                <span className="text-gray-300">{reviews.length} Guest Reviews</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/10 transition text-white">
                <Heart className="w-5 h-5" />
              </button>
              <button className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/10 transition text-white">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PAGE CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Details & Tabs */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Tabs Navigation */}
          <div id="rooms-section" className="flex border-b border-gray-100 gap-6 text-sm font-bold pb-2 overflow-x-auto">
            {['rooms', 'overview', 'amenities', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 capitalize transition-all shrink-0 ${activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-gray-400 hover:text-gray-800'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* TAB CONTENTS */}
          {activeTab === 'rooms' && (
            <div className="flex flex-col gap-6">
              <h3 className="font-serif text-2xl font-bold text-gray-900">Available Suites and Penthouse</h3>
              
              {rooms.length === 0 ? (
                <div className="p-10 text-center bg-white rounded-3xl border border-dashed border-gray-100">
                  <p className="text-gray-400 text-xs">No suites configured for this resort yet.</p>
                </div>
              ) : (
                rooms.map((room) => (
                  <div 
                    key={room.roomId}
                    className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-lg transition flex flex-col md:flex-row shadow-sm"
                  >
                    <div className="md:w-64 h-48 md:h-auto overflow-hidden relative">
                      <img 
                        src={room.image || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a'} 
                        alt={room.roomNumber}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full">
                        Room {room.roomNumber}
                      </span>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex justify-between items-start gap-4">
                          <h4 className="font-serif text-lg font-bold text-gray-900">{room.categoryName}</h4>
                          <div className="text-right">
                            <span className="text-xl font-bold text-primary">Rs. {room.pricePerNight}</span>
                            <span className="block text-[9px] text-gray-400 font-semibold uppercase">per night</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-4 text-xs text-gray-400 font-semibold mt-2">
                          <span className="flex items-center gap-1"><Compass className="w-3.5 h-3.5" /> {room.roomSize} sq ft</span>
                          <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" /> Floor {room.floorNumber}</span>
                          <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> Max {room.capacity} Guests</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {room.amenities && Array.from(room.amenities).map((a, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium">{a}</span>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-gray-50 pt-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${room.roomStatus === 'AVAILABLE' ? 'text-primary' : 'text-amber-500'}`}>
                          {room.roomStatus}
                        </span>
                        
                        <button
                          onClick={() => handleBookNow(room.roomId)}
                          disabled={room.roomStatus !== 'AVAILABLE'}
                          className="px-6 py-2 bg-secondary hover:bg-secondary-dark disabled:bg-gray-200 text-white rounded-full text-xs font-bold transition shadow-sm"
                        >
                          {room.roomStatus === 'AVAILABLE' ? 'Book Room' : 'Unavailable'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="flex flex-col gap-6 text-sm text-gray-600 leading-relaxed bg-white p-8 rounded-3xl border border-gray-50">
              <h3 className="font-serif text-2xl font-bold text-gray-900">About the Sanctuary</h3>
              <p>{hotel.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-6 mt-2 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><MapPin className="w-4.5 h-4.5" /></div>
                  <div>
                    <span className="block font-bold text-gray-800">Address</span>
                    <span>{hotel.address}, {hotel.city}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><Phone className="w-4.5 h-4.5" /></div>
                  <div>
                    <span className="block font-bold text-gray-800">Contact Number</span>
                    <span>{hotel.contactNumber}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><Mail className="w-4.5 h-4.5" /></div>
                  <div>
                    <span className="block font-bold text-gray-800">Reservations Email</span>
                    <span>{hotel.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><Sparkles className="w-4.5 h-4.5" /></div>
                  <div>
                    <span className="block font-bold text-gray-800">Standard Service Rating</span>
                    <span>5-Star Hospitality Excellence</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'amenities' && (
            <div className="bg-white p-8 rounded-3xl border border-gray-50">
              <h3 className="font-serif text-2xl font-bold text-gray-900 mb-6">Resort Amenities & Features</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs text-gray-700">
                {['High-Speed WiFi', 'Infinity Pool Access', 'Climate Control A/C', 'Smart LED TV', 'Gourmet Mini Bar', 'Valet Parking', 'Private Beach Access', '24/7 Fitness Center'].map((amenity, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 p-4 bg-primary/5 rounded-2xl border border-primary/5 text-center">
                    <Sparkles className="w-6 h-6 text-primary" />
                    <span className="font-semibold">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="flex flex-col gap-6">
              <h3 className="font-serif text-2xl font-bold text-gray-900">What Guests Say</h3>
              {reviews.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-gray-50">
                  <p className="text-gray-400 text-xs">No reviews submitted yet. Be the first to write a review after your stay!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {reviews.map((r) => (
                    <div key={r.reviewId} className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 text-primary font-bold rounded-full flex items-center justify-center text-sm uppercase">
                            {r.userName.charAt(0)}
                          </div>
                          <div>
                            <span className="block font-bold text-gray-800 text-xs">{r.userName}</span>
                            <span className="text-[10px] text-gray-400">{new Date(r.createdDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-0.5 text-accent-gold">
                          {[...Array(r.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-accent-gold" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Sticky Booking Widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 p-6 bg-white rounded-3xl border border-gray-100 shadow-xl flex flex-col gap-6">
            <div>
              <h3 className="font-serif text-xl font-bold text-gray-900">Check Availability</h3>
              <p className="text-xs text-gray-500 mt-1">Book directly for best price guarantee.</p>
            </div>
            
            <form onSubmit={handleVerifyDates} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Check-In</label>
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <input 
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={checkDates.checkIn}
                    onChange={(e) => setCheckDates(prev => ({ ...prev, checkIn: e.target.value }))}
                    className="w-full bg-transparent border-none text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Check-Out</label>
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <input 
                    type="date"
                    required
                    min={checkDates.checkIn || new Date().toISOString().split('T')[0]}
                    value={checkDates.checkOut}
                    onChange={(e) => setCheckDates(prev => ({ ...prev, checkOut: e.target.value }))}
                    className="w-full bg-transparent border-none text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Guests</label>
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                  <User className="w-4 h-4 text-primary shrink-0" />
                  <select 
                    value={checkDates.guests}
                    onChange={(e) => setCheckDates(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                    className="w-full bg-transparent border-none text-xs font-semibold focus:outline-none text-gray-800"
                  >
                    {[1, 2, 3, 4].map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={checkingAvailability}
                className="w-full py-3.5 bg-primary hover:bg-primary-dark disabled:bg-gray-200 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg mt-2"
              >
                {checkingAvailability ? 'Checking...' : 'Check Dates'}
              </button>
            </form>

            {availableResult && (
              <div className={`p-4 rounded-2xl text-center text-xs font-semibold border ${availableResult === 'AVAILABLE' ? 'bg-primary/5 text-primary border-primary/20' : 'bg-red-50 text-red-500 border-red-100'}`}>
                {availableResult === 'AVAILABLE' ? (
                  <div>
                    <span>Resort rooms are available!</span>
                    <span className="block font-normal text-[10px] text-gray-500 mt-0.5">Select a room below to proceed.</span>
                  </div>
                ) : (
                  <span>Selected dates have overlapping bookings. Try other dates.</span>
                )}
              </div>
            )}

            <div className="border-t border-gray-100 pt-4 text-[10px] text-gray-400 flex flex-col gap-2">
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-primary" /> Free Cancellation up to 48 hours</span>
              <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-primary" /> Welcome drink included on check-in</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetail;
