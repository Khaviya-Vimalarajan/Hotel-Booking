import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Calendar, User, Shield, CreditCard, CheckCircle, ArrowRight, ArrowLeft, Landmark, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const steps = ['Verify Dates', 'Guest Details', 'Apply Promo', 'Payment', 'Confirmation'];

const BookWizard = () => {
  const { user } = useAuth();
  const { showToast, fetchNotifications } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  // Params passed from hotel detail page
  const initialRoomId = location.state?.roomId || '';
  const initialHotelId = location.state?.hotelId || '';
  const initialCheckIn = location.state?.checkIn || '';
  const initialCheckOut = location.state?.checkOut || '';
  const initialGuests = location.state?.guests || 1;

  const [activeStep, setActiveStep] = useState(0);
  const [room, setRoom] = useState(null);
  const [loadingRoom, setLoadingRoom] = useState(true);

  // Form states
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guestCount, setGuestCount] = useState(initialGuests);
  const [guestNotes, setGuestNotes] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discountInfo, setDiscountInfo] = useState(null);

  // Billing states
  const [totalPrice, setTotalPrice] = useState(0);
  const [basePrice, setBasePrice] = useState(0);
  const [days, setDays] = useState(0);

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [slMobileNumber, setSlMobileNumber] = useState(user?.phone || '');
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    cvv: '',
    expiryDate: '',
    nameOnCard: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
  });
  const [processingPayment, setProcessingPayment] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    if (!initialRoomId) {
      showToast('Please select a room to start booking.', 'info');
      navigate('/');
      return;
    }
    fetchRoomDetails();
  }, [initialRoomId]);

  useEffect(() => {
    calculatePrice();
  }, [checkIn, checkOut, room, discountInfo]);

  const fetchRoomDetails = async () => {
    setLoadingRoom(true);
    try {
      const res = await api.get(`/rooms/${initialRoomId}`);
      setRoom(res.data);
    } catch (err) {
      showToast('Error loading room details.', 'error');
    } finally {
      setLoadingRoom(false);
    }
  };

  const calculatePrice = () => {
    if (!room || !checkIn || !checkOut) return;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const timeDiff = end.getTime() - start.getTime();
    const daysCount = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysCount > 0) {
      setDays(daysCount);
      const base = room.pricePerNight * daysCount;
      setBasePrice(base);
      
      if (discountInfo) {
        const discountMultiplier = 1 - (discountInfo.discountPercentage / 100);
        setTotalPrice(base * discountMultiplier);
      } else {
        setTotalPrice(base);
      }
    } else {
      setDays(0);
      setBasePrice(0);
      setTotalPrice(0);
    }
  };

  const handleApplyPromo = async (e) => {
    e.preventDefault();
    if (!promoCode) return;
    try {
      const res = await api.get(`/promotions/verify/${promoCode}`);
      setDiscountInfo(res.data);
      showToast(`Promo applied! ${res.data.discountPercentage}% discount.`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid promotion code.', 'error');
      setDiscountInfo(null);
    }
  };

  const handleNextStep = () => {
    if (activeStep === 0) {
      if (!checkIn || !checkOut || days <= 0) {
        showToast('Please verify your check-in and check-out dates.', 'error');
        return;
      }
    }
    setActiveStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleProcessPaymentSubmit = async (e) => {
    e.preventDefault();
    setProcessingPayment(true);
    try {
      // 1. Create Booking (PENDING status)
      const bookingRes = await api.post('/bookings', {
        userId: user.userId,
        roomId: room.roomId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guestCount,
        promoCode: discountInfo ? promoCode : null,
      });

      const booking = bookingRes.data;

      // 2. Process simulated payment
      const paymentRes = await api.post('/payments', {
        bookingId: booking.bookingId,
        amount: totalPrice,
        paymentMethod: paymentMethod,
        cardNumber: paymentMethod === 'Credit Card' ? cardInfo.cardNumber : slMobileNumber,
        cvv: cardInfo.cvv,
        expiryDate: cardInfo.expiryDate,
      });

      setConfirmedBooking({
        ...booking,
        transactionId: paymentRes.data.transactionId,
        paymentDate: paymentRes.data.paymentDate,
      });
      
      showToast('Payment successful! Reservation confirmed.', 'success');
      if (fetchNotifications) {
        fetchNotifications();
      }
      setActiveStep(4);
    } catch (err) {
      showToast(err.response?.data?.message || 'Transaction failed. Please try again.', 'error');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loadingRoom) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mx-auto mb-4" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12 min-h-[80vh]">
      
      {/* LEFT COLUMN: Progress line & Wizard forms */}
      <div className="lg:col-span-2 flex flex-col gap-8">
        
        {/* Progress Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto gap-4">
          {steps.map((label, idx) => (
            <div key={label} className="flex items-center gap-2 text-xs shrink-0">
              <span className={`w-6 h-6 flex items-center justify-center rounded-full font-bold border ${activeStep >= idx ? 'bg-primary border-primary text-white' : 'border-gray-200 text-gray-400'}`}>
                {idx + 1}
              </span>
              <span className={`font-bold ${activeStep >= idx ? 'text-primary' : 'text-gray-400'}`}>{label}</span>
            </div>
          ))}
        </div>

        {/* Form panel container */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl flex-1 flex flex-col justify-between min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* STEP 0: DATE VERIFICATION */}
              {activeStep === 0 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-gray-900">Verify Check-In/Out Dates</h3>
                    <p className="text-xs text-gray-500 mt-1">Select your stay dates to finalize the price calculation.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Check-In</label>
                      <div className="flex items-center gap-2.5 px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl">
                        <Calendar className="w-4 h-4 text-primary shrink-0" />
                        <input 
                          type="date" 
                          required
                          min={new Date().toISOString().split('T')[0]}
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                          className="w-full bg-transparent border-none text-xs font-semibold focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Check-Out</label>
                      <div className="flex items-center gap-2.5 px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl">
                        <Calendar className="w-4 h-4 text-primary shrink-0" />
                        <input 
                          type="date" 
                          required
                          min={checkIn || new Date().toISOString().split('T')[0]}
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          className="w-full bg-transparent border-none text-xs font-semibold focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 1: GUEST INFO */}
              {activeStep === 1 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-gray-900">Verify Guest Details</h3>
                    <p className="text-xs text-gray-500 mt-1">Set guest parameters and optional request notes.</p>
                  </div>
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Guest Count</label>
                      <div className="flex items-center gap-2.5 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl">
                        <User className="w-4 h-4 text-primary shrink-0" />
                        <select 
                          value={guestCount}
                          onChange={(e) => setGuestCount(parseInt(e.target.value))}
                          className="w-full bg-transparent border-none text-xs font-semibold focus:outline-none text-gray-800"
                        >
                          {[...Array(room.capacity)].map((_, i) => (
                            <option key={i} value={i + 1}>{i + 1} {i === 0 ? 'Guest' : 'Guests'}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Special Requests / Notes</label>
                      <textarea
                        rows="4"
                        placeholder="E.g., early check-in, dietary restrictions, airport shuttle arrangements..."
                        value={guestNotes}
                        onChange={(e) => setGuestNotes(e.target.value)}
                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: APPLY PROMO CODE */}
              {activeStep === 2 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-gray-900">Apply Coupon Promo Code</h3>
                    <p className="text-xs text-gray-500 mt-1">Apply members-only coupons to decrease check-out rates.</p>
                  </div>
                  <form onSubmit={handleApplyPromo} className="flex gap-4 items-center">
                    <div className="flex-1 flex items-center gap-2.5 px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl">
                      <Tag className="w-4 h-4 text-primary shrink-0" />
                      <input 
                        type="text" 
                        placeholder="E.g., WELCOME10, LUXURY25"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        className="w-full bg-transparent border-none text-xs font-semibold focus:outline-none"
                      />
                    </div>
                    <button type="submit" className="px-6 py-3.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition">
                      Apply
                    </button>
                  </form>
                  {discountInfo && (
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs font-bold text-primary flex items-center justify-between">
                      <span>Promo "{discountInfo.title}" Applied Successfully!</span>
                      <span>{discountInfo.discountPercentage}% OFF</span>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: SECURE PAYMENT CHECKOUT */}
              {activeStep === 3 && (
                <form onSubmit={handleProcessPaymentSubmit} className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-gray-900">Secure Payment Checkout</h3>
                    <p className="text-xs text-gray-500 mt-1">Select a local Sri Lankan payment method to complete the booking.</p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold focus:outline-none text-gray-800"
                    >
                      <option value="Credit Card">Credit / Debit Card (Visa/Mastercard)</option>
                      <option value="Bank Transfer">Bank Transfer / Cash at Reception</option>
                    </select>
                  </div>

                  {paymentMethod === 'Credit Card' ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Cardholder Name</label>
                        <input 
                          type="text"
                          required
                          value={cardInfo.nameOnCard}
                          onChange={(e) => setCardInfo(prev => ({ ...prev, nameOnCard: e.target.value }))}
                          className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:outline-none focus:bg-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Card Number</label>
                        <div className="flex items-center gap-2.5 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl">
                          <CreditCard className="w-4 h-4 text-gray-400 shrink-0" />
                          <input 
                            type="text"
                            required
                            placeholder="4111 2222 3333 4444"
                            value={cardInfo.cardNumber}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                              if (val.length > 16) val = val.substring(0, 16);
                              const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                              setCardInfo(prev => ({ ...prev, cardNumber: formatted }));
                            }}
                            className="w-full bg-transparent border-none text-xs font-semibold focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Expiration Date</label>
                          <input 
                            type="text"
                            required
                            placeholder="MM/YY"
                            value={cardInfo.expiryDate}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, '');
                              if (val.length > 4) val = val.substring(0, 4);
                              let formatted = val;
                              if (val.length > 2) {
                                formatted = val.substring(0, 2) + '/' + val.substring(2);
                              }
                              setCardInfo(prev => ({ ...prev, expiryDate: formatted }));
                            }}
                            className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:outline-none focus:bg-white text-center"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">CVV Security Code</label>
                          <input 
                            type="password"
                            required
                            placeholder="123"
                            maxLength="3"
                            value={cardInfo.cvv}
                            onChange={(e) => setCardInfo(prev => ({ ...prev, cvv: e.target.value }))}
                            className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:outline-none focus:bg-white text-center"
                          />
                        </div>
                      </div>
                    </div>
                  ) : paymentMethod === 'Bank Transfer' ? (
                    <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100 flex flex-col gap-3 text-xs text-gray-700 leading-relaxed">
                      <span className="font-bold text-amber-800">Bank Transfer Details</span>
                      <div>
                        <span className="block font-bold">Bank Name: <span className="font-normal">Commercial Bank of Ceylon PLC</span></span>
                        <span className="block font-bold">Account Name: <span className="font-normal">Emerald Resorts Sri Lanka (Pvt) Ltd</span></span>
                        <span className="block font-bold">Account Number: <span className="font-normal">1000 2345 6789</span></span>
                        <span className="block font-bold">Branch: <span className="font-normal">Galle Fort Branch</span></span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-semibold">Instructions: Please transfer the full Rs. amount. Once completed, your stay will be validated by the front desk.</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Sri Lankan Mobile Number (for OTP verification)</label>
                        <input 
                          type="tel"
                          required
                          placeholder="e.g. 0771234567"
                          value={slMobileNumber}
                          onChange={(e) => setSlMobileNumber(e.target.value)}
                          className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:outline-none focus:bg-white font-mono"
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 leading-relaxed">We will initiate a secure mobile payment validation. You will receive an SMS push PIN verification to confirm the ezCash/mCash/FriMi transfer.</span>
                    </div>
                  )}
                  
                  <button 
                    type="submit"
                    disabled={processingPayment}
                    className="w-full py-3.5 bg-secondary hover:bg-secondary-dark text-white text-xs font-bold rounded-xl transition shadow-md hover:shadow-lg mt-2 flex items-center justify-center gap-2"
                  >
                    {processingPayment ? 'Processing Checkout...' : `Confirm & Pay Rs. ${totalPrice.toFixed(2)}`}
                  </button>
                </form>
              )}

              {/* STEP 4: CONFIRMATION INVOICE */}
              {activeStep === 4 && confirmedBooking && (
                <div className="flex flex-col gap-6 items-center text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary"><CheckCircle className="w-10 h-10" /></div>
                  <div>
                    <h3 className="font-serif text-3xl font-bold text-gray-900">Stay Confirmed!</h3>
                    <p className="text-xs text-gray-400 mt-1">Your reservation receipt invoice is compiled below.</p>
                  </div>

                  {/* Printable Invoice Container */}
                  <div className="w-full border border-gray-200 rounded-3xl p-6 text-left text-xs bg-gray-50 flex flex-col gap-4 mt-2">
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                      <div>
                        <span className="font-serif font-bold text-gray-800 text-sm">{room.hotelName}</span>
                        <span className="block text-[9px] text-gray-400">Room Number: {room.roomNumber} ({room.categoryName})</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-700">Receipt Ref:</span>
                        <span className="block font-mono text-[10px] text-gray-500">{confirmedBooking.transactionId}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-[11px]">
                      <div>
                        <span className="block text-gray-400 font-bold uppercase text-[9px]">Guest details</span>
                        <span className="font-semibold">{confirmedBooking.userName}</span>
                        <span className="block text-gray-500">{confirmedBooking.userEmail}</span>
                      </div>
                      <div>
                        <span className="block text-gray-400 font-bold uppercase text-[9px]">Reservation dates</span>
                        <span className="font-semibold">{checkIn} to {checkOut}</span>
                        <span className="block text-gray-500">({days} Nights stay)</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 flex justify-between items-center text-sm font-bold text-primary">
                      <span>Total Amount Settled</span>
                      <span>Rs. {totalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-4 w-full">
                    <button 
                      onClick={() => window.print()}
                      className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition"
                    >
                      Print Receipt
                    </button>
                    <button 
                      onClick={() => navigate('/dashboard')}
                      className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition"
                    >
                      Go to Dashboard
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Wizard Action Back/Next Buttons */}
          {activeStep < 3 && (
            <div className="flex justify-between items-center border-t border-gray-50 pt-6 mt-8">
              <button
                onClick={handlePrevStep}
                disabled={activeStep === 0}
                className="px-5 py-2.5 border border-gray-200 disabled:opacity-30 hover:bg-gray-50 text-gray-600 text-xs font-bold rounded-full transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              
              <button
                onClick={handleNextStep}
                className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-full transition flex items-center gap-1.5 shadow-sm"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Live pricing summary card */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 bg-white border border-gray-100 rounded-3xl p-6 shadow-xl flex flex-col gap-6">
          <h4 className="font-serif text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Booking Summary</h4>
          
          {/* Suite Thumbnail Details */}
          <div className="flex gap-3 items-center">
            <img 
              src={room.image || 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6'} 
              alt={room.roomNumber}
              className="w-16 h-16 object-cover rounded-2xl"
            />
            <div>
              <span className="block font-bold text-gray-800 text-xs leading-snug">{room.hotelName}</span>
              <span className="text-[10px] text-gray-400">Suite {room.roomNumber} ({room.categoryName})</span>
            </div>
          </div>

          {/* Pricing parameters calculations */}
          <div className="flex flex-col gap-3 text-xs text-gray-600 border-t border-b border-gray-100 py-4">
            <div className="flex justify-between">
              <span>Rate per night</span>
              <span className="font-bold text-gray-800">Rs. {room.pricePerNight}</span>
            </div>
            <div className="flex justify-between">
              <span>Stay duration</span>
              <span className="font-bold text-gray-800">{days} Nights</span>
            </div>
            <div className="flex justify-between">
              <span>Guest count</span>
              <span className="font-bold text-gray-800">{guestCount} {guestCount === 1 ? 'Guest' : 'Guests'}</span>
            </div>
            
            {discountInfo && (
              <div className="flex justify-between text-primary font-bold">
                <span>Discount coupon ({discountInfo.title})</span>
                <span>-{discountInfo.discountPercentage}%</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center text-sm font-bold text-primary">
            <span>Estimated Price</span>
            <span className="text-lg">Rs. {totalPrice.toFixed(2)}</span>
          </div>

          <div className="p-3 bg-gray-50 rounded-2xl text-[9px] text-gray-400 flex items-center gap-2 border border-gray-100">
            <Shield className="w-4 h-4 text-primary shrink-0" />
            <span>Encrypted security shielding. We will never store CVV tags in system databases.</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default BookWizard;
