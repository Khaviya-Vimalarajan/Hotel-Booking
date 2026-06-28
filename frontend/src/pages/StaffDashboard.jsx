import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { Search, MapPin, Calendar, Clock, LogIn, LogOut, CheckCircle, RefreshCw, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StaffDashboard = () => {
  const { showToast } = useNotifications();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('check-in'); // 'check-in' or 'check-out'
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings');
      setBookings(res.data);
      setAccessDenied(false);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setAccessDenied(true);
      } else {
        showToast('Error loading reservations registry.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProcessCheckIn = async (bookingId, roomId) => {
    try {
      // 1. Update Booking Status to CHECKED_IN
      await api.put(`/bookings/${bookingId}/status`, { status: 'CHECKED_IN' });
      
      showToast(`Check-in processed successfully. Room marked as occupied.`, 'success');
      fetchBookings();
    } catch (err) {
      showToast('Failed to complete check-in.', 'error');
    }
  };

  const handleProcessCheckOut = async (bookingId, roomId) => {
    try {
      // 1. Update Booking Status to COMPLETED
      await api.put(`/bookings/${bookingId}/status`, { status: 'COMPLETED' });
      
      showToast(`Check-out completed successfully. Room released.`, 'success');
      fetchBookings();
    } catch (err) {
      showToast('Failed to complete check-out.', 'error');
    }
  };

  // Filter list by searchQuery
  const filteredBookings = bookings.filter(b => 
    b.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.roomNumber.includes(searchQuery)
  );

  // Group bookings
  const checkInList = filteredBookings.filter(b => b.bookingStatus === 'CONFIRMED');
  const checkOutList = filteredBookings.filter(b => b.bookingStatus === 'CHECKED_IN');

  if (accessDenied) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-2">
          <Clock className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-gray-900">Access Restricted</h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          Your account is registered as a staff member, but only **Receptionists** are authorized to access the front-desk operations dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Reception Desk</h1>
          <p className="text-xs text-gray-400 mt-1">Manage check-in arrivals, departures check-outs, and room assignments.</p>
        </div>

        <button 
          onClick={fetchBookings}
          className="p-3 border border-gray-200 rounded-full hover:bg-gray-50 text-gray-500 transition"
          title="Refresh List"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* FILTER SEARCH BAR & SUB-TABS */}
      <div className="flex flex-col md:flex-row gap-6 mb-8 justify-between items-center bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        {/* Search */}
        <div className="w-full md:w-96 flex items-center gap-2.5 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus-within:border-primary focus-within:bg-white transition-all">
          <Search className="w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by guest name or room..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none text-xs font-semibold focus:outline-none placeholder-gray-400"
          />
        </div>

        {/* Action Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab('check-in')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeSubTab === 'check-in' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
          >
            <LogIn className="w-4 h-4" />
            <span>Process Check-In</span>
          </button>
          <button
            onClick={() => setActiveSubTab('check-out')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeSubTab === 'check-out' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
          >
            <LogOut className="w-4 h-4" />
            <span>Process Check-Out</span>
          </button>
        </div>
      </div>

      {/* LIST DATA */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(n => (
            <div key={n} className="h-28 bg-white rounded-3xl animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : (activeSubTab === 'check-in' ? checkInList : checkOutList).length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-100 flex flex-col items-center gap-3">
          <Clock className="w-10 h-10 text-gray-300" />
          <h4 className="font-serif text-lg text-gray-500">No Reservations Found</h4>
          <p className="text-xs text-gray-400">All arrivals for the selected registry are settled.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {(activeSubTab === 'check-in' ? checkInList : checkOutList).map((b) => (
            <div 
              key={b.bookingId}
              className="bg-white rounded-3xl border border-gray-100 hover:shadow-lg transition p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-bold text-gray-900">{b.userName}</h4>
                  <span className="text-xs text-gray-400">{b.userEmail} &bull; Room {b.roomNumber} ({b.hotelName})</span>
                  <div className="flex gap-4 text-[10px] font-bold text-gray-500 mt-2">
                    <span>In: {b.checkInDate}</span>
                    <span>Out: {b.checkOutDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="block font-bold text-gray-900 text-sm">Rs. {b.totalAmount}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-primary">{b.bookingStatus}</span>
                </div>
                
                {activeSubTab === 'check-in' ? (
                  <button
                    onClick={() => handleProcessCheckIn(b.bookingId, b.roomId)}
                    className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Check-In Guest</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleProcessCheckOut(b.bookingId, b.roomId)}
                    className="px-5 py-2.5 bg-secondary hover:bg-secondary-dark text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Checkout & Bill</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
