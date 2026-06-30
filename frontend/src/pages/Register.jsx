import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Mail, Phone, Lock, ArrowRight, User, Eye, EyeOff, Landmark } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
  const { register, login } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await register(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password,
        formData.phone
      );
      await login(formData.email, formData.password);
      showToast('Welcome! Your luxury membership account has been registered.', 'success');
      navigate('/');
    } catch (err) {
      setErrorMsg(err);
      showToast(err, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[90vh] flex items-center justify-center px-6 py-12 bg-luxury-bg">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 bg-white rounded-3xl border border-gray-100 shadow-xl"
      >
        {/* Header logo */}
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <Landmark className="w-10 h-10 text-primary" />
          <h2 className="font-serif text-3xl font-bold text-gray-900 mt-2">Create Account</h2>
          <p className="text-xs text-gray-400">Join our exclusive hotel membership program</p>
        </div>

        {errorMsg && (
          <motion.div 
            animate={{ x: [-10, 10, -10, 10, 0] }}
            transition={{ duration: 0.4 }}
            className="p-4 mb-6 rounded-2xl bg-red-50 text-red-500 border border-red-100 text-xs text-center font-semibold"
          >
            {errorMsg}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">First Name</label>
              <div className="flex items-center gap-2.5 px-3.5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus-within:border-primary focus-within:bg-white transition-all">
                <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <input 
                  type="text" 
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                  className="w-full bg-transparent border-none text-xs font-semibold focus:outline-none placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Last Name</label>
              <div className="flex items-center gap-2.5 px-3.5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus-within:border-primary focus-within:bg-white transition-all">
                <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <input 
                  type="text" 
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  className="w-full bg-transparent border-none text-xs font-semibold focus:outline-none placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Email Address</label>
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus-within:border-primary focus-within:bg-white transition-all">
              <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input 
                type="email" 
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john.doe@example.com"
                className="w-full bg-transparent border-none text-xs font-semibold focus:outline-none placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Phone Number</label>
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus-within:border-primary focus-within:bg-white transition-all">
              <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+94 77 123 4567"
                className="w-full bg-transparent border-none text-xs font-semibold focus:outline-none placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Password</label>
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus-within:border-primary focus-within:bg-white transition-all">
              <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input 
                type={showPassword ? "text" : "password"} 
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                placeholder="At least 6 characters"
                className="w-full bg-transparent border-none text-xs font-semibold focus:outline-none placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none transition shrink-0"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-md hover:shadow-lg mt-2"
          >
            {loading ? 'Creating Account...' : 'Register'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="border-t border-gray-100 mt-6 pt-5 text-center text-xs text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary hover:underline">Sign in</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
