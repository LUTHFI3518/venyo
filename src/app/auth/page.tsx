'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock, FiUser, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import Waves from '@/components/Waves'; // 1. Import Waves

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  // --- States ---
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // --- End States ---
  
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, user, userRole, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    // --- Redirect logic ---
    if (!authLoading && user && userRole) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('venyo-user-role', userRole);
        localStorage.setItem('venyo-user-id', user.uid);
      }

      if (userRole === 'admin' || userRole === 'superadmin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/user/dashboard');
      }
    }
    // --- End Redirect logic ---
  }, [user, userRole, authLoading, router]); // <-- router is correctly included here

  const handleGoogleSignIn = async () => {
    // --- Google Sign-in logic ---
    try {
      setLoading(true);
      setError('');
      await signInWithGoogle();
    } catch (err: any)
 {
      setError(err.message || 'Failed to sign in with Google');
      setLoading(false);
    }
    // --- End Google Sign-in logic ---
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    // --- Email Auth logic ---
    e.preventDefault();
    setError('');
      setLoading(true);

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${isSignUp ? 'sign up' : 'sign in'}`);
      setLoading(false);
    }
    // --- End Email Auth logic ---
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* --- FIX: Removed the 'lineColor' prop --- */}
      <Waves
        className="absolute inset-0 z-0"
        backgroundColor={theme === 'light' ? '#ffffff' : '#000000'}
        waveAmpX={60}
        waveAmpY={30}
        xGap={20}
        yGap={20}
      />
      {/* --- End Fix --- */}
      
      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 mx-auto w-12 h-12"
        >
          <button className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-violet-700 flex items-center justify-center font-bold text-white text-sm hover:from-violet-700 hover:to-violet-800 transition-all shadow-lg shadow-violet-500/50">
            V
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl p-8 lg:p-12 shadow-xl border ${
            theme === 'light' 
              ? 'bg-white/80 backdrop-blur-xl border-gray-200/50' 
              : 'bg-gray-900/50 backdrop-blur-xl border-violet-500/20'
          }`}
        >
          <div className="text-center mb-8">
            <h1 className={`text-4xl font-bold mb-2 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              {isSignUp ? 'Create an account' : 'Welcome back'}
            </h1>
            <p className={`text-sm ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {isSignUp ? 'Sign up and get started with Venyo' : 'Sign in to continue to Venyo'}
            </p>
          </div>
          
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-4 p-3 rounded-lg border flex items-center space-x-2 ${
                  theme === 'light'
                    ? 'bg-red-100/50 border-red-300 text-red-700'
                    : 'bg-red-900/30 border-red-500/50 text-red-400'
                }`}
              >
                <FiAlertCircle className="flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {loading && user && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-4 p-3 rounded-lg border ${
                theme === 'light'
                  ? 'bg-violet-100/50 border-violet-300 text-violet-700'
                  : 'bg-violet-900/30 border-violet-500/50 text-violet-300'
              }`}
            >
              <p className="text-sm">
                {userRole === 'admin' || userRole === 'superadmin'
                  ? 'Redirecting to Admin Dashboard...'
                  : 'Redirecting to Dashboard...'}
              </p>
            </motion.div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
            <AnimatePresence>
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      Full name
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Amélie Laurent"
                        required={isSignUp}
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all ${
                          theme === 'light'
                            ? 'bg-gray-200/50 border-gray-300/50 text-gray-800'
                            : 'bg-gray-800/50 border-gray-700 text-white'
                        }`}
                      />
                    </div>
                  </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'light' ? 'text-gray-700' : 'text-gray-300'
              }`}>
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="amélielaurent7622@gmail.com"
                  required
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all ${
                    theme === 'light'
                      ? 'bg-gray-200/50 border-gray-300/50 text-gray-800'
                      : 'bg-gray-800/50 border-gray-700 text-white'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'light' ? 'text-gray-700' : 'text-gray-300'
              }`}>
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="*********************"
                  required
                  className={`w-full pl-10 pr-12 py-3 rounded-lg border backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all ${
                    theme === 'light'
                      ? 'bg-gray-200/50 border-gray-300/50 text-gray-800'
                      : 'bg-gray-800/50 border-gray-700 text-white'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      Confirm Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        required={isSignUp}
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all ${
                          theme === 'light'
                            ? 'bg-gray-200/50 border-gray-300/50 text-gray-800'
                            : 'bg-gray-800/50 border-gray-700 text-white'
                        }`}
                      />
                    </div>
                  </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg font-medium bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white shadow-lg shadow-violet-500/50 hover:shadow-xl hover:shadow-violet-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Submit'}
            </motion.button>
          </form>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => {}}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg border backdrop-blur-sm font-medium flex items-center justify-center space-x-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                theme === 'light'
                  ? 'bg-gray-200/50 border-gray-300/50 text-gray-700 hover:bg-gray-300/70'
                  : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <FaApple className="w-5 h-5" />
              <span>Apple</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg border backdrop-blur-sm font-medium flex items-center justify-center space-x-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                theme === 'light'
                  ? 'bg-gray-200/50 border-gray-300/50 text-gray-700 hover:bg-gray-300/7I 70'
                  : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <FcGoogle className="w-5 h-5" />
              <span>Google</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Footer Links (Outside Card) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`flex items-center justify-between text-sm mt-6 ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
          }`}
        >
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className={`${
              theme === 'light' ? 'hover:text-violet-700 text-violet-600' : 'hover:text-violet-400 text-violet-500'
            } transition-colors`}
          >
            {isSignUp ? 'Have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
          <a href="#" className={`${
              theme === 'light' ? 'hover:text-violet-700 text-violet-600' : 'hover:text-violet-400 text-violet-500'
            } transition-colors`}>
            Terms & Conditions
          </a>
        </motion.div>
      </div>
    </div>
  );
}