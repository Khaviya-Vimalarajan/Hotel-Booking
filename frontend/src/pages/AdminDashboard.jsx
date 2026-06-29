import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { 
  Building, Bed, User, ShieldCheck, Coins, Tag, Landmark,
  TrendingUp, Star, Plus, Edit, Trash, X, Calendar, Key, AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';

const COLORS = ['#0F6E5C', '#C2703D', '#D4AF37', '#9A5328'];

const AdminDashboard = () => {
  const { showToast } = useNotifications();
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // Entities state
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [staff, setStaff] = useState([]);
  const [promos, setPromos] = useState([]);
  const [categories, setCategories] = useState([]);

  // Modals state
  const [showModal, setShowModal] = useState(null); // 'hotel', 'room', 'staff', 'promo'
  const [editEntity, setEditEntity] = useState(null);

  // Form states
  const [hotelForm, setHotelForm] = useState({ hotelName: '', description: '', address: '', city: '', country: '', starRating: 5, contactNumber: '', email: '', image: '' });
  const [roomForm, setRoomForm] = useState({ hotelId: '', categoryId: '', roomNumber: '', floorNumber: 1, capacity: 2, pricePerNight: 12000, roomSize: 300, image: '', roomStatus: 'AVAILABLE' });
  const [staffForm, setStaffForm] = useState({ firstName: '', lastName: '', email: '', role: '', salary: '', assignedHotelId: '' });
  const [promoForm, setPromoForm] = useState({ title: '', discountPercentage: 10, startDate: '', endDate: '', status: 'ACTIVE' });

  useEffect(() => {
    fetchAnalytics();
    fetchAllEntities();
  }, []);

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await api.get('/analytics/dashboard');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchAllEntities = async () => {
    try {
      const [hotelsRes, roomsRes, staffRes, promosRes, catRes] = await Promise.all([
        api.get('/hotels'),
        api.get('/rooms'),
        api.get('/staff'),
        api.get('/promotions'),
        api.get('/rooms') // using rooms to get category placeholders, but let's query standard categories
      ]);
      setHotels(hotelsRes.data);
      setRooms(roomsRes.data);
      setStaff(staffRes.data);
      setPromos(promosRes.data);
      
      // Seed categories list for form selection
      setCategories([
        { categoryId: 1, categoryName: 'Standard Room' },
        { categoryId: 2, categoryName: 'Deluxe Room' },
        { categoryId: 3, categoryName: 'Family Suite' },
        { categoryId: 4, categoryName: 'Executive Suite' },
        { categoryId: 5, categoryName: 'Presidential Penthouse' },
      ]);
    } catch (err) {
      console.error('Error fetching entities:', err);
    }
  };

  // CRUD Submissions
  const handleHotelSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editEntity) {
        await api.put(`/hotels/${editEntity.hotelId}`, hotelForm);
        showToast('Hotel updated successfully!', 'success');
      } else {
        await api.post('/hotels', hotelForm);
        showToast('Hotel created successfully!', 'success');
      }
      setShowModal(null);
      fetchAllEntities();
      fetchAnalytics();
    } catch (err) {
      showToast('Action failed.', 'error');
    }
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editEntity) {
        await api.put(`/rooms/${editEntity.roomId}`, roomForm);
        showToast('Room updated successfully!', 'success');
      } else {
        await api.post('/rooms', roomForm);
        showToast('Room created successfully!', 'success');
      }
      setShowModal(null);
      fetchAllEntities();
      fetchAnalytics();
    } catch (err) {
      showToast('Action failed.', 'error');
    }
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editEntity) {
        await api.put(`/staff/${editEntity.staffId}`, staffForm);
        showToast('Staff member updated successfully!', 'success');
      } else {
        await api.post('/staff', staffForm);
        showToast('Staff member created successfully!', 'success');
      }
      setShowModal(null);
      fetchAllEntities();
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed.', 'error');
    }
  };

  const handlePromoSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editEntity) {
        await api.put(`/promotions/${editEntity.promotionId}`, promoForm);
        showToast('Promotion updated successfully!', 'success');
      } else {
        await api.post('/promotions', promoForm);
        showToast('Promotion created successfully!', 'success');
      }
      setShowModal(null);
      fetchAllEntities();
    } catch (err) {
      showToast('Action failed.', 'error');
    }
  };

  // Delete helpers
  const handleDeleteHotel = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hotel?')) return;
    try {
      await api.delete(`/hotels/${id}`);
      showToast('Hotel deleted.', 'success');
      fetchAllEntities();
    } catch (err) {
      showToast('Failed to delete.', 'error');
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    try {
      await api.delete(`/rooms/${id}`);
      showToast('Room deleted.', 'success');
      fetchAllEntities();
    } catch (err) {
      showToast('Failed to delete.', 'error');
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) return;
    try {
      await api.delete(`/staff/${id}`);
      showToast('Staff member removed.', 'success');
      fetchAllEntities();
    } catch (err) {
      showToast('Failed to delete.', 'error');
    }
  };

  const handleDeletePromo = async (id) => {
    if (!window.confirm('Are you sure you want to expire/delete this promo?')) return;
    try {
      await api.delete(`/promotions/${id}`);
      showToast('Promotion expired/deleted.', 'success');
      fetchAllEntities();
    } catch (err) {
      showToast('Failed to delete.', 'error');
    }
  };

  // Open modals with pre-fill
  const openHotelModal = (hotel = null) => {
    setEditEntity(hotel);
    if (hotel) {
      setHotelForm({ ...hotel });
    } else {
      setHotelForm({ hotelName: '', description: '', address: '', city: '', country: '', starRating: 5, contactNumber: '', email: '', image: '' });
    }
    setShowModal('hotel');
  };

  const openRoomModal = (room = null) => {
    setEditEntity(room);
    if (room) {
      setRoomForm({ ...room });
    } else {
      setRoomForm({ hotelId: hotels[0]?.hotelId || '', categoryId: 1, roomNumber: '', floorNumber: 1, capacity: 2, pricePerNight: 12000, roomSize: 300, image: '', roomStatus: 'AVAILABLE' });
    }
    setShowModal('room');
  };

  const openStaffModal = (member = null) => {
    setEditEntity(member);
    if (member) {
      setStaffForm({ ...member, assignedHotelId: member.assignedHotelId });
    } else {
      setStaffForm({ firstName: '', lastName: '', email: '', role: '', salary: '', assignedHotelId: hotels[0]?.hotelId || '' });
    }
    setShowModal('staff');
  };

  const openPromoModal = (promo = null) => {
    setEditEntity(promo);
    if (promo) {
      setPromoForm({ ...promo });
    } else {
      setPromoForm({ title: '', discountPercentage: 10, startDate: '', endDate: '', status: 'ACTIVE' });
    }
    setShowModal('promo');
  };

  // Prepare chart data
  const chartData = analytics && Object.keys(analytics.revenueByMonth).map(key => ({
    month: key,
    revenue: analytics.revenueByMonth[key],
  }));

  const pieData = analytics && Object.keys(analytics.occupancyRates).map(key => ({
    name: key,
    value: analytics.occupancyRates[key],
  }));

  return (
    <div className="max-w-7xl mx-auto px-6 pt-3 pb-12 min-h-screen">
      
      {/* 1. TOP TITLE */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6 bg-white py-5 px-5 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Administrator Console</h1>
          <p className="text-xs text-gray-400 mt-1">Review live hotel statistics, modify resort rooms, active coupons, and staff registries.</p>
        </div>

        {/* Tab Selector Links */}
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          {['overview', 'hotels', 'rooms', 'staff', 'promotions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 rounded-xl transition capitalize ${activeTab === tab ? 'bg-primary text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 2. OVERVIEW PANEL */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-10">
          {loadingAnalytics ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-pulse">
              {[1, 2, 3, 4, 5].map(n => (
                <div key={n} className="h-28 bg-white rounded-2xl border border-gray-100" />
              ))}
            </div>
          ) : (
            <>
              {/* KPI Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><Building className="w-5 h-5" /></div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-gray-400">Total Hotels</span>
                    <span className="text-xl font-bold text-gray-900">{analytics.totalHotels}</span>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><Bed className="w-5 h-5" /></div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-gray-400">Total Rooms</span>
                    <span className="text-xl font-bold text-gray-900">{analytics.totalRooms}</span>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><User className="w-5 h-5" /></div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-gray-400">Customers</span>
                    <span className="text-xl font-bold text-gray-900">{analytics.totalCustomers}</span>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><ShieldCheck className="w-5 h-5" /></div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-gray-400">Reservations</span>
                    <span className="text-xl font-bold text-gray-900">{analytics.totalBookings}</span>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><Coins className="w-5 h-5" /></div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-gray-400">Gross Revenue</span>
                    <span className="text-base lg:text-lg font-bold text-gray-900 whitespace-nowrap">
                      Rs. {analytics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chart Visualizations */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Line Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <h3 className="font-serif text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <span>Revenue Trend (Last 6 Months)</span>
                  </h3>
                  <div className="w-full h-80 text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" name="Revenue (Rs.)" stroke="#0F6E5C" strokeWidth={3} dot={{ r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Occupancy Donut Chart */}
                <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
                  <h3 className="font-serif text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Bed className="w-5 h-5 text-primary" />
                    <span>Suite Occupancy Rates</span>
                  </h3>
                  <div className="w-full h-64 text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* 3. HOTELS MANAGEMENT */}
      {activeTab === 'hotels' && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div>
              <h3 className="font-serif text-xl font-bold text-gray-900">Resort Locations</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Manage details of brand hotels.</p>
            </div>
            <button 
              onClick={() => openHotelModal()}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Add Hotel</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-500 uppercase tracking-wider">
                  <th className="p-4">Hotel Name</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {hotels.map((h) => (
                  <tr key={h.hotelId} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="p-4 font-bold text-gray-800 flex items-center gap-3">
                      <img src={h.image} alt={h.hotelName} className="w-10 h-10 object-cover rounded-xl" />
                      <span>{h.hotelName}</span>
                    </td>
                    <td className="p-4 text-gray-500">{h.city}, {h.country}</td>
                    <td className="p-4 font-bold text-accent-gold flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-accent-gold" /> {h.starRating}</td>
                    <td className="p-4 text-gray-500">{h.contactNumber}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openHotelModal(h)} className="p-2 border border-gray-200 rounded-full hover:bg-gray-100 text-gray-500 transition"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteHotel(h.hotelId)} className="p-2 border border-red-100 rounded-full hover:bg-red-50 text-red-500 transition"><Trash className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. ROOMS MANAGEMENT */}
      {activeTab === 'rooms' && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div>
              <h3 className="font-serif text-xl font-bold text-gray-900">Hotel Room Suites</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Manage suite capacity, pricing, and availability states.</p>
            </div>
            <button 
              onClick={() => openRoomModal()}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Add Suite</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-500 uppercase tracking-wider">
                  <th className="p-4">Suite Room</th>
                  <th className="p-4">Hotel Branch</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price / Night</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((r) => (
                  <tr key={r.roomId} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="p-4 font-bold text-gray-800">Suite {r.roomNumber}</td>
                    <td className="p-4 text-gray-500">{r.hotelName}</td>
                    <td className="p-4 text-gray-500">{r.categoryName}</td>
                    <td className="p-4 font-bold text-primary">Rs. {r.pricePerNight}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${r.roomStatus === 'AVAILABLE' ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-600'}`}>
                        {r.roomStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openRoomModal(r)} className="p-2 border border-gray-200 rounded-full hover:bg-gray-100 text-gray-500 transition"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteRoom(r.roomId)} className="p-2 border border-red-100 rounded-full hover:bg-red-50 text-red-500 transition"><Trash className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. STAFF REGISTRY */}
      {activeTab === 'staff' && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div>
              <h3 className="font-serif text-xl font-bold text-gray-900">Resort Staff Directory</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Manage hotel employees and assigned duties.</p>
            </div>
            <button 
              onClick={() => openStaffModal()}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-500 uppercase tracking-wider">
                  <th className="p-4">Employee</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Assigned Location</th>
                  <th className="p-4">Salary</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s.staffId} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="p-4 font-bold text-gray-800">{s.firstName} {s.lastName}</td>
                    <td className="p-4 text-gray-500">{s.email}</td>
                    <td className="p-4 text-gray-500">{s.role}</td>
                    <td className="p-4 text-gray-500">{s.assignedHotelName}</td>
                    <td className="p-4 font-semibold text-gray-700">Rs. {s.salary}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openStaffModal(s)} className="p-2 border border-gray-200 rounded-full hover:bg-gray-100 text-gray-500 transition"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteStaff(s.staffId)} className="p-2 border border-red-100 rounded-full hover:bg-red-50 text-red-500 transition"><Trash className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. PROMOTIONS CONFIG */}
      {activeTab === 'promotions' && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div>
              <h3 className="font-serif text-xl font-bold text-gray-900">Promo Coupons</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Manage seasonal marketing campaign discount percentages.</p>
            </div>
            <button 
              onClick={() => openPromoModal()}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Add Coupon</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-500 uppercase tracking-wider">
                  <th className="p-4">Coupon Code</th>
                  <th className="p-4">Discount (%)</th>
                  <th className="p-4">Valid From</th>
                  <th className="p-4">Valid To</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {promos.map((p) => (
                  <tr key={p.promotionId} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="p-4 font-mono font-bold text-primary flex items-center gap-2"><Tag className="w-3.5 h-3.5" /> {p.title}</td>
                    <td className="p-4 font-bold text-gray-800">{p.discountPercentage}%</td>
                    <td className="p-4 text-gray-500">{p.startDate}</td>
                    <td className="p-4 text-gray-500">{p.endDate}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${p.status === 'ACTIVE' ? 'bg-primary/10 text-primary' : 'bg-red-50 text-red-500'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openPromoModal(p)} className="p-2 border border-gray-200 rounded-full hover:bg-gray-100 text-gray-500 transition"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeletePromo(p.promotionId)} className="p-2 border border-red-100 rounded-full hover:bg-red-50 text-red-500 transition"><Trash className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== POPUP MODALS OVERLAYS ==================== */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white p-8 rounded-3xl shadow-2xl relative max-h-[85vh] overflow-y-auto text-xs"
            >
              <button onClick={() => setShowModal(null)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition">
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-serif text-2xl font-bold text-gray-900 capitalize mb-6">
                {editEntity ? 'Edit' : 'Add'} {showModal}
              </h3>

              {/* HOTEL MODAL FORM */}
              {showModal === 'hotel' && (
                <form onSubmit={handleHotelSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold text-gray-400">Hotel Name</label>
                    <input type="text" required value={hotelForm.hotelName} onChange={(e) => setHotelForm(prev => ({ ...prev, hotelName: e.target.value }))} className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold text-gray-400">Description</label>
                    <textarea rows="3" value={hotelForm.description} onChange={(e) => setHotelForm(prev => ({ ...prev, description: e.target.value }))} className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-gray-400">City</label>
                      <input type="text" required value={hotelForm.city} onChange={(e) => setHotelForm(prev => ({ ...prev, city: e.target.value }))} className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-gray-400">Country</label>
                      <input type="text" required value={hotelForm.country} onChange={(e) => setHotelForm(prev => ({ ...prev, country: e.target.value }))} className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold text-gray-400">Street Address</label>
                    <input type="text" required value={hotelForm.address} onChange={(e) => setHotelForm(prev => ({ ...prev, address: e.target.value }))} className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-gray-400">Star Rating</label>
                      <input type="number" step="0.1" max="5" min="1" value={hotelForm.starRating} onChange={(e) => setHotelForm(prev => ({ ...prev, starRating: parseFloat(e.target.value) }))} className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-center" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-gray-400">Phone</label>
                      <input type="text" value={hotelForm.contactNumber} onChange={(e) => setHotelForm(prev => ({ ...prev, contactNumber: e.target.value }))} className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold text-gray-400">Reservations Email</label>
                    <input type="email" value={hotelForm.email} onChange={(e) => setHotelForm(prev => ({ ...prev, email: e.target.value }))} className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold text-gray-400">Image Cover URL</label>
                    <input type="text" value={hotelForm.image} onChange={(e) => setHotelForm(prev => ({ ...prev, image: e.target.value }))} className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl" />
                  </div>
                  <button type="submit" className="py-3 bg-primary text-white rounded-xl font-bold mt-2 hover:bg-primary-dark transition shadow">Save Hotel</button>
                </form>
              )}

              {/* ROOM MODAL FORM */}
              {showModal === 'room' && (
                <form onSubmit={handleRoomSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold text-gray-400">Hotel Branch</label>
                    <select required value={roomForm.hotelId} onChange={(e) => setRoomForm(prev => ({ ...prev, hotelId: parseInt(e.target.value) }))} className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl">
                      {hotels.map(h => <option key={h.hotelId} value={h.hotelId}>{h.hotelName}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-gray-400">Suite Number</label>
                      <input type="text" required value={roomForm.roomNumber} onChange={(e) => setRoomForm(prev => ({ ...prev, roomNumber: e.target.value }))} className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-center" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-gray-400">Floor Level</label>
                      <input type="number" required value={roomForm.floorNumber} onChange={(e) => setRoomForm(prev => ({ ...prev, floorNumber: parseInt(e.target.value) }))} className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-center" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold text-gray-400">Room Category</label>
                    <select required value={roomForm.categoryId} onChange={(e) => setRoomForm(prev => ({ ...prev, categoryId: parseInt(e.target.value) }))} className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl">
                      {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-gray-400">Price / Night</label>
                      <input type="number" required value={roomForm.pricePerNight} onChange={(e) => setRoomForm(prev => ({ ...prev, pricePerNight: parseFloat(e.target.value) }))} className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-center" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-gray-400">Capacity (Guests)</label>
                      <input type="number" required value={roomForm.capacity} onChange={(e) => setRoomForm(prev => ({ ...prev, capacity: parseInt(e.target.value) }))} className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-center" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-gray-400">Room Size (Sq Ft)</label>
                      <input type="number" required value={roomForm.roomSize} onChange={(e) => setRoomForm(prev => ({ ...prev, roomSize: parseInt(e.target.value) }))} className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-center" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold text-gray-400">Room Status</label>
                    <select required value={roomForm.roomStatus} onChange={(e) => setRoomForm(prev => ({ ...prev, roomStatus: e.target.value }))} className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl">
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="BOOKED">BOOKED</option>
                      <option value="MAINTENANCE">MAINTENANCE</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold text-gray-400">Suite Image URL</label>
                    <input type="text" value={roomForm.image} onChange={(e) => setRoomForm(prev => ({ ...prev, image: e.target.value }))} className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl" />
                  </div>
                  <button type="submit" className="py-3 bg-primary text-white rounded-xl font-bold mt-2 hover:bg-primary-dark transition shadow">Save Suite</button>
                </form>
              )}

              {/* STAFF MODAL FORM */}
              {showModal === 'staff' && (
                <form onSubmit={handleStaffSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-gray-400">First Name</label>
                      <input type="text" required value={staffForm.firstName} onChange={(e) => setStaffForm(prev => ({ ...prev, firstName: e.target.value }))} className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-gray-400">Last Name</label>
                      <input type="text" required value={staffForm.lastName} onChange={(e) => setStaffForm(prev => ({ ...prev, lastName: e.target.value }))} className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold text-gray-400">Email Address</label>
                    <input type="email" required value={staffForm.email} onChange={(e) => setStaffForm(prev => ({ ...prev, email: e.target.value }))} className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold text-gray-400">Role Title</label>
                    <select 
                      required 
                      value={staffForm.role} 
                      onChange={(e) => setStaffForm(prev => ({ ...prev, role: e.target.value }))} 
                      className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold focus:outline-none"
                    >
                      <option value="">Select Role</option>
                      <option value="Receptionist">Receptionist</option>
                      <option value="Housekeeper">Housekeeper</option>
                      <option value="Chef">Chef</option>
                      <option value="Security">Security</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold text-gray-400">Salary (Monthly)</label>
                    <input type="number" required value={staffForm.salary} onChange={(e) => setStaffForm(prev => ({ ...prev, salary: parseFloat(e.target.value) }))} className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-center" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold text-gray-400">Assigned Hotel Branch</label>
                    <select required value={staffForm.assignedHotelId} onChange={(e) => setStaffForm(prev => ({ ...prev, assignedHotelId: parseInt(e.target.value) }))} className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl">
                      {hotels.map(h => <option key={h.hotelId} value={h.hotelId}>{h.hotelName}</option>)}
                    </select>
                  </div>
                  <button type="submit" className="py-3 bg-primary text-white rounded-xl font-bold mt-2 hover:bg-primary-dark transition shadow">Save Staff</button>
                </form>
              )}

              {/* PROMO MODAL FORM */}
              {showModal === 'promo' && (
                <form onSubmit={handlePromoSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold text-gray-400">Coupon Title</label>
                    <input type="text" required placeholder="e.g. SUMMER20" value={promoForm.title} onChange={(e) => setPromoForm(prev => ({ ...prev, title: e.target.value.toUpperCase() }))} className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl font-mono text-center font-bold text-primary" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold text-gray-400">Discount Percentage (%)</label>
                    <input type="number" required value={promoForm.discountPercentage} onChange={(e) => setPromoForm(prev => ({ ...prev, discountPercentage: parseFloat(e.target.value) }))} className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-center" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-gray-400">Valid From</label>
                      <input type="date" required value={promoForm.startDate} onChange={(e) => setPromoForm(prev => ({ ...prev, startDate: e.target.value }))} className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-center" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-gray-400">Valid To</label>
                      <input type="date" required value={promoForm.endDate} onChange={(e) => setPromoForm(prev => ({ ...prev, endDate: e.target.value }))} className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-center" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold text-gray-400">Status</label>
                    <select required value={promoForm.status} onChange={(e) => setPromoForm(prev => ({ ...prev, status: e.target.value }))} className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl">
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="EXPIRED">EXPIRED</option>
                    </select>
                  </div>
                  <button type="submit" className="py-3 bg-primary text-white rounded-xl font-bold mt-2 hover:bg-primary-dark transition shadow">Save Coupon</button>
                </form>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
