import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Pages
import Home from './pages/Home';
import HotelDetail from './pages/HotelDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import BookWizard from './pages/BookWizard';
import CustomerDashboard from './pages/CustomerDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Simple placeholder page for About Us
const About = () => (
  <div className="max-w-4xl mx-auto px-6 py-20 text-center flex flex-col gap-4">
    <h1 className="font-serif text-4xl font-bold text-gray-900">About Our Heritage</h1>
    <p className="text-sm text-gray-500 leading-relaxed max-w-xl mx-auto">
      Founded in Galle in 2018, Emerald Resorts & Hotels was built to integrate structural luxury directly into Sri Lanka's beautiful coastlines and mountain vistas, preserving local ecosystems while delivering world-class hospitality.
    </p>
  </div>
);

// Simple placeholder page for Contact
const Contact = () => (
  <div className="max-w-4xl mx-auto px-6 py-20 text-center flex flex-col gap-4">
    <h1 className="font-serif text-4xl font-bold text-gray-900">Contact Reservations</h1>
    <p className="text-sm text-gray-500 leading-relaxed">
      Speak directly with a concierge associate: <span className="font-bold text-primary">+94 11 555 7722</span>
    </p>
    <p className="text-xs text-gray-400">Our Colombo front desks are operational 24/7.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <NotificationProvider>
          <div className="flex flex-col min-h-screen bg-luxury-bg text-luxury-text font-sans">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public Pages */}
                <Route path="/" element={<Home />} />
                <Route path="/hotels/:id" element={<HotelDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />

                {/* Customer Routes */}
                <Route path="/book" element={
                  <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
                    <BookWizard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute allowedRoles={['CUSTOMER']}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                } />

                {/* Staff Routes */}
                <Route path="/staff" element={
                  <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                    <StaffDashboard />
                  </ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin" element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
