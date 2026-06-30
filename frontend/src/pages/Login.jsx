import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Mail, Lock, ArrowRight, Landmark, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const { login } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please input your credentials');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const data = await login(email, password);
      showToast('Logged in successfully', 'success');
      
      // Redirect based on roles
      if (data.role === 'ADMIN') {
        navigate('/admin');
      } else if (data.role === 'STAFF') {
        navigate('/staff');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setErrorMsg(err);
      showToast(err, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center px-6 py-12 bg-luxury-bg">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 bg-white rounded-3xl border border-gray-100 shadow-xl"
      >
        {/* Header logo */}
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <Landmark className="w-10 h-10 text-primary" />
          <h2 className="font-serif text-3xl font-bold text-gray-900 mt-2">Welcome Back</h2>
          <p className="text-xs text-gray-400">Please sign in to manage your luxury reservations</p>
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Email Address</label>
            <div className="flex items-center gap-3 px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus-within:border-primary focus-within:bg-white transition-all">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-transparent border-none text-xs font-semibold focus:outline-none placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Password</label>
              <a href="#" className="text-[10px] font-bold text-primary hover:underline">Forgot password?</a>
            </div>
            <div className="flex items-center gap-3 px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus-within:border-primary focus-within:bg-white transition-all">
              <Lock className="w-4 h-4 text-gray-400 shrink-0" />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                className="w-full bg-transparent border-none text-xs font-semibold focus:outline-none placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none transition shrink-0"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-md hover:shadow-lg mt-2"
          >
            {loading ? 'Signing In...' : 'Sign In'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="border-t border-gray-100 mt-8 pt-6 text-center text-xs text-gray-500">
          Don't have a luxury account?{' '}
          <Link to="/register" className="font-bold text-primary hover:underline">Register now</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
