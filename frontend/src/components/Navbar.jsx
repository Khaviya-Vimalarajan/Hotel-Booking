import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Bell, LogOut, User as UserIcon, Menu, X, Landmark, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

  const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const unreadCount = notifications.filter(n => !n.readStatus).length;
  const freshNotifications = notifications.filter(n => !n.readStatus);

  // Close dropdown when switching user/role
  useEffect(() => {
    setShowNotifDropdown(false);
  }, [user]);

  // Automatically close dropdown after 1.5s when notifications become 0
  useEffect(() => {
    if (showNotifDropdown && freshNotifications.length === 0) {
      const timer = setTimeout(() => {
        setShowNotifDropdown(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [freshNotifications.length, showNotifDropdown]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'STAFF') return '/staff';
    return '/dashboard';
  };

  return (
    <nav className="sticky top-0 z-50 w-full glass shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <Landmark className="w-8 h-8 text-primary group-hover:text-secondary transition-colors duration-300" />
          <div>
            <span className="font-serif text-2xl font-bold tracking-wide text-primary">EMERALD</span>
            <span className="block text-[9px] uppercase tracking-[0.25em] font-medium text-secondary">Resorts & Hotels</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-semibold hover:text-primary transition">Home</Link>
          <Link to="/about" className="text-sm font-semibold hover:text-primary transition">About Us</Link>
          <Link to="/contact" className="text-sm font-semibold hover:text-primary transition">Contact</Link>
          
          {isAuthenticated ? (
            <div className="flex items-center gap-6">
              {/* Notification Bell */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className="relative p-2 text-gray-600 hover:text-primary transition"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-secondary text-white text-[9px] font-bold flex items-center justify-center rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {showNotifDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-3 w-80 bg-white dark:bg-luxury-darkCard border border-gray-100 rounded-xl shadow-xl overflow-hidden z-[100]"
                    >
                      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <span className="font-serif font-bold text-gray-800">Notifications</span>
                        {unreadCount > 0 ? (
                          <button 
                            onClick={markAllAsRead}
                            className="text-[10px] text-primary hover:text-primary-dark font-bold uppercase tracking-wider transition"
                          >
                            Clear All
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 font-semibold">0 new</span>
                        )}
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {freshNotifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-gray-400">No new messages</div>
                        ) : (
                          freshNotifications.map((n) => (
                            <div 
                              key={n.notificationId} 
                              className="p-4 border-b border-gray-50 text-xs flex justify-between items-center gap-3 hover:bg-luxury-bg transition bg-primary/5 font-semibold"
                            >
                              <div className="flex-1">
                                <div className="text-gray-800 font-bold mb-0.5">{n.title}</div>
                                <div className="text-gray-500 font-normal">{n.message}</div>
                              </div>
                              <button
                                onClick={() => markAsRead(n.notificationId)}
                                className="p-1.5 hover:bg-primary/10 text-primary hover:text-primary-dark rounded-full transition shrink-0"
                                title="Mark as Read"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile Link */}
              <Link 
                to={getDashboardLink()} 
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full text-xs font-bold hover:bg-primary-dark transition"
              >
                <UserIcon className="w-4 h-4" />
                <span>Dashboard ({user.firstName})</span>
              </Link>
              
              <button 
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-500 transition p-2"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-primary transition">Sign In</Link>
              <Link 
                to="/register" 
                className="px-5 py-2.5 bg-secondary text-white rounded-full text-xs font-bold hover:bg-secondary-dark transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Book Now
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-gray-700"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 bg-white"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold hover:text-primary">Home</Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold hover:text-primary">About Us</Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold hover:text-primary">Contact</Link>
              {isAuthenticated ? (
                <>
                  <Link to={getDashboardLink()} onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-primary">Dashboard</Link>
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="text-left text-sm font-semibold text-red-500">Sign Out</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold">Sign In</Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="py-2.5 bg-primary text-white rounded-xl text-center text-xs font-bold">Register Now</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
