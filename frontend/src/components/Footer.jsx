import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Landmark, Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const Footer = () => {
  const { showToast } = useNotifications();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    showToast('Thank you for subscribing to our newsletter!', 'success');
    setEmail('');
  };

  return (
    <footer className="bg-luxury-darkBg text-gray-400 pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        {/* Branch Info */}
        <div className="flex flex-col gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <Landmark className="w-8 h-8 text-primary-light" />
            <div>
              <span className="font-serif text-2xl font-bold tracking-wide text-white">EMERALD</span>
              <span className="block text-[9px] uppercase tracking-[0.25em] font-medium text-secondary">Resorts & Hotels</span>
            </div>
          </Link>
          <p className="text-xs leading-relaxed mt-2">
            Experience the ultimate retreat where luxury merges with the ocean breeze. Our boutique resorts offer unparalleled peace and comfort.
          </p>
          <div className="flex gap-4 mt-2">
            <a href="#" className="hover:text-primary-light transition"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="hover:text-primary-light transition"><Facebook className="w-5 h-5" /></a>
            <a href="#" className="hover:text-primary-light transition"><Twitter className="w-5 h-5" /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-serif text-lg font-bold text-white mb-6">Quick Links</h4>
          <ul className="flex flex-col gap-3 text-sm">
            <li><Link to="/" className="hover:text-white transition">Home</Link></li>
            <li><Link to="/about" className="hover:text-white transition">About Our Brand</Link></li>
            <li><Link to="/contact" className="hover:text-white transition">Contact Reservations</Link></li>
            <li><Link to="/login" className="hover:text-white transition">Sign In</Link></li>
            <li><Link to="/register" className="hover:text-white transition">Create Account</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="font-serif text-lg font-bold text-white mb-6">Reservations</h4>
          <ul className="flex flex-col gap-4 text-xs">
            <li className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary-light shrink-0" />
              <span>77 Galle Road, Colombo 00300, Sri Lanka</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-primary-light shrink-0" />
              <span>+94 11 555 7722</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary-light shrink-0" />
              <a href="mailto:reservations@emeraldresorts.lk" className="hover:text-white transition">reservations@emeraldresorts.lk</a>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="font-serif text-lg font-bold text-white mb-6">Newsletter</h4>
          <p className="text-xs leading-relaxed mb-4">
            Subscribe to receive seasonal promotional offers and exclusive member discounts.
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <input 
              type="email" 
              required
              placeholder="Your email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-primary-light"
            />
            <button type="submit" className="px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark transition">
              Join
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs">
        <span>&copy; {new Date().getFullYear()} Emerald Resorts & Hotels. All rights reserved.</span>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-white transition">Privacy Policy</a>
          <a href="#" className="hover:text-white transition">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
