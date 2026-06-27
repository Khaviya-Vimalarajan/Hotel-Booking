import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Calendar, User, Phone, Mail, Award, Clock, Star, X, Download, ShieldCheck, PenTool, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomerDashboard = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    profileImage: user?.profileImage || '',
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    setUploadingImage(true);
    try {
      const res = await api.post('/users/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setProfileForm(prev => ({ ...prev, profileImage: res.data.url }));
      showToast('Image uploaded successfully! Remember to click Save Changes.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to upload image.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  // Review modal state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    setLoadingBookings(true);
    try {
      const res = await api.get('/bookings/my');
      setBookings(res.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      await updateProfile(profileForm);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err, 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleOpenReviewModal = (booking) => {
    setSelectedBooking(booking);
    setReviewForm({ rating: 5, comment: '' });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        userId: user.userId,
        hotelId: selectedBooking.hotelId,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      showToast('Review submitted successfully!', 'success');
      setSelectedBooking(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this luxury reservation?')) return;
    try {
      await api.put(`/bookings/${bookingId}/cancel`);
      showToast('Reservation cancelled successfully.', 'success');
      fetchMyBookings();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel reservation.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 min-h-screen">
      {/* 1. WELCOME HEADER */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden border border-primary/10">
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user.firstName} className="w-full h-full object-cover" />
            ) : (
              <span className="font-serif text-2xl font-bold text-primary uppercase">{user?.firstName.charAt(0)}</span>
            )}
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">Welcome, {user?.firstName}</h1>
            <span className="text-xs text-gray-400">Preferred Loyalty Club Member</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition ${activeTab === 'bookings' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
          >
            My Bookings
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition ${activeTab === 'profile' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* 2. TAB CONTENTS */}
      {activeTab === 'bookings' && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-2xl font-bold text-gray-900">Your Reservations</h3>
            <span className="text-xs text-gray-400 font-semibold">{bookings.length} total stays</span>
          </div>

          {loadingBookings ? (
            <div className="space-y-4">
              {[1, 2].map(n => (
                <div key={n} className="h-32 bg-white rounded-3xl animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-100 flex flex-col items-center gap-3">
              <Clock className="w-10 h-10 text-gray-300" />
              <h4 className="font-serif text-lg text-gray-500">No Reservations Yet</h4>
              <p className="text-xs text-gray-400">Discover premium hotels and rooms to schedule your getaway.</p>
              <button 
                onClick={() => navigate('/')}
                className="mt-2 px-5 py-2 bg-primary text-white rounded-full text-xs font-bold"
              >
                Find Resorts
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {bookings.map((booking) => (
                <div 
                  key={booking.bookingId}
                  className="bg-white rounded-3xl border border-gray-100 hover:shadow-lg transition p-6 flex flex-col md:flex-row justify-between gap-6 shadow-sm"
                >
                  {/* Left segment */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0"><Calendar className="w-6 h-6" /></div>
                    <div>
                      <h4 className="font-serif text-lg font-bold text-gray-900">{booking.hotelName}</h4>
                      <span className="text-xs text-gray-400">Suite {booking.roomNumber} &bull; {booking.guestCount} {booking.guestCount === 1 ? 'Guest' : 'Guests'}</span>
                      <div className="flex gap-4 text-[11px] font-semibold text-gray-500 mt-2">
                        <span>Check-In: <span className="text-gray-800">{booking.checkInDate}</span></span>
                        <span>Check-Out: <span className="text-gray-800">{booking.checkOutDate}</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Right segment */}
                  <div className="flex flex-col justify-between items-end gap-4 min-w-[150px] text-right self-stretch">
                    <div>
                      <span className="text-lg font-bold text-primary">Rs. {booking.totalAmount}</span>
                      <span className={`block text-[10px] font-bold uppercase tracking-wider ${booking.bookingStatus === 'CONFIRMED' ? 'text-primary' : booking.bookingStatus === 'COMPLETED' ? 'text-blue-500' : 'text-amber-500'}`}>
                        {booking.bookingStatus}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {booking.bookingStatus === 'COMPLETED' && (
                        <button
                          onClick={() => handleOpenReviewModal(booking)}
                          className="px-4 py-2 border border-primary text-primary hover:bg-primary/5 rounded-full text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          <span>Review stay</span>
                        </button>
                      )}
                      
                      {booking.bookingStatus === 'PENDING' && (
                        <button
                          onClick={() => navigate('/book', { state: { roomId: booking.roomId, hotelId: booking.hotelId, checkIn: booking.checkInDate, checkOut: booking.checkOutDate, guests: booking.guestCount } })}
                          className="px-4 py-2 bg-secondary hover:bg-secondary-dark text-white rounded-full text-xs font-bold transition"
                        >
                          Pay Now
                        </button>
                      )}

                      {(booking.bookingStatus === 'PENDING' || booking.bookingStatus === 'CONFIRMED') && (
                        <button
                          onClick={() => handleCancelBooking(booking.bookingId)}
                          className="px-4 py-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-full text-xs font-bold transition"
                        >
                          Cancel Booking
                        </button>
                      )}

                      <button
                        onClick={() => {
                          showToast('Downloading reservation invoice receipt PDF...', 'info');
                        }}
                        className="p-2 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-full transition"
                        title="Download Invoice"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-white p-8 rounded-3xl border border-gray-100 shadow-xl">
          <div className="mb-6">
            <h3 className="font-serif text-2xl font-bold text-gray-900">Edit Profile Details</h3>
            <p className="text-xs text-gray-400 mt-1">Keep your customer membership credentials up to date.</p>
          </div>

          <form onSubmit={handleProfileSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">First Name</label>
                <div className="flex items-center gap-2.5 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus-within:border-primary focus-within:bg-white transition">
                  <User className="w-4 h-4 text-gray-400 shrink-0" />
                  <input 
                    type="text" 
                    required
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full bg-transparent border-none text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Last Name</label>
                <div className="flex items-center gap-2.5 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus-within:border-primary focus-within:bg-white transition">
                  <User className="w-4 h-4 text-gray-400 shrink-0" />
                  <input 
                    type="text" 
                    required
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full bg-transparent border-none text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Phone Number</label>
              <div className="flex items-center gap-2.5 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus-within:border-primary focus-within:bg-white transition">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <input 
                  type="tel" 
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-transparent border-none text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Choose Profile Avatar</label>
              <div className="flex flex-wrap gap-4 items-center">
                {[
                  { id: 'avatar1', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Felix' },
                  { id: 'avatar2', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Aneka' },
                  { id: 'avatar3', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Liliana' },
                  { id: 'avatar4', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Jack' },
                  { id: 'avatar5', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Sophia' },
                  { id: 'avatar6', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Milo' },
                ].map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setProfileForm(prev => ({ ...prev, profileImage: avatar.url }))}
                    className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${profileForm.profileImage === avatar.url ? 'border-primary scale-110 shadow-md ring-2 ring-primary/20' : 'border-gray-200'}`}
                  >
                    <img src={avatar.url} alt="Avatar option" className="w-full h-full object-cover" />
                  </button>
                ))}

                {/* Upload Custom Image option */}
                <label className="relative w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-gray-50 transition-all duration-200 text-gray-400 hover:text-primary" title="Upload Custom Photo">
                  <Upload className="w-4 h-4" />
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                {uploadingImage && (
                  <span className="text-[10px] text-gray-400 font-semibold animate-pulse">Uploading...</span>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              className="px-6 py-3.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition shadow-md hover:shadow-lg mt-2 self-start"
            >
              {updatingProfile ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* 3. SUBMIT REVIEW MODAL */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedBooking(null)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-serif text-2xl font-bold text-gray-900">Review Stay</h3>
              <p className="text-xs text-gray-400 mt-1">Rate your stay at {selectedBooking.hotelName}.</p>

              <form onSubmit={handleReviewSubmit} className="flex flex-col gap-5 mt-6">
                {/* Rating selection (stars) */}
                <div className="flex flex-col gap-2 items-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Rating</span>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                        className="p-1 hover:scale-110 transition"
                      >
                        <Star className={`w-8 h-8 ${reviewForm.rating >= star ? 'fill-accent-gold text-accent-gold' : 'text-gray-200'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Review Comment</label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Tell us about your experience..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition"
                >
                  {submittingReview ? 'Submitting Review...' : 'Submit Review'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerDashboard;
