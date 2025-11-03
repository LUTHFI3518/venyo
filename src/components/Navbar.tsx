'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
// Imports for all icons needed (logged in and out)
import { FiLogOut, FiHome, FiUser, FiShield } from 'react-icons/fi'; 
import { useRouter } from 'next/navigation';
// Removed the Settings component import
// import Settings from './Settings'; 

export default function Navbar() {
  const { user, signOut, userRole } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  // Removed the settingsOpen state
  // const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };

  const getDashboardPath = () => {
    if (userRole === 'admin' || userRole === 'superadmin') {
      return '/admin/dashboard';
    }
    return '/user/dashboard';
  };

  return (
    <>
    {/* Use header tag and new classes from your snippet */}
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      // Use new layout classes: max-w-6xl, no w-11/12
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-6xl px-4"
    >
      {/* This div is the main pill, styled from your snippet */}
      <div className={`flex items-center justify-between h-12 px-6 rounded-full backdrop-blur-2xl border shadow-lg ${
        theme === 'light'
            ? 'bg-gray-100/70 border-gray-300' // Adapted for light mode
            : 'bg-gray-900/30 border-white/20' // From your snippet
      }`}>
        
        {/* --- LEFT GROUP (Logo + Role) --- */}
        <div className="flex items-center space-x-3">
          {/* New V Logo + Venyo Text from snippet */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">V</span>
            </div>
            <span className={`text-base font-bold ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              Venyo
            </span>
          </Link>

          {/* Role Chip (From Old Content) - styled to fit */}
          {user && userRole && (
            <div className={`hidden sm:flex items-center space-x-2 px-3 py-1 rounded-md border ${
              theme === 'light'
                ? 'bg-violet-100 text-violet-700 border-violet-200'
                : 'bg-violet-500/10 text-violet-400 border-violet-500/20'
            }`}>
              {userRole === 'admin' || userRole === 'superadmin' ? (
                <FiShield className="w-4 h-4" />
              ) : (
                <FiUser className="w-4 h-4" />
              )}
              <span className="text-xs font-medium capitalize">{userRole}</span>
            </div>
          )}
        </div>

        {/* --- CENTER GROUP (Conditional Links) --- */}
        {/* Use nav tag from snippet */}
        <nav className="hidden md:flex items-center space-x-6">
          {user ? (
            // --- LOGGED-IN LINKS (From Old Content) ---
            <Link
              href={getDashboardPath()}
              className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                theme === 'light'
                  ? 'text-gray-600 hover:text-gray-900'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              <FiHome className="w-4 h-4" />
              <span>Dashboard</span> 
            </Link>
          ) : (
            // --- LOGGED-OUT LINKS (From New Design) ---
            <>
              <Link href="/" className={`text-sm font-medium transition-colors ${theme === 'light' ? 'text-gray-600 hover:text-gray-900' : 'text-white/90 hover:text-white'}`}>
                Home
              </Link>
              <Link href="/auth" className={`text-sm font-medium transition-colors ${theme === 'light' ? 'text-gray-600 hover:text-gray-900' : 'text-white/90 hover:text-white'}`}>
                Get Started
              </Link>
            </>
          )}
        </nav>

        {/* --- RIGHT GROUP (Conditional Buttons) --- */}
        <div className="flex items-center">
          {user ? (
            // --- LOGGED-IN BUTTON (From Old Content) ---
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSignOut}
              title="Sign Out"
              // Styled to fit new smaller bar
              className={`flex items-center justify-center p-2 rounded-full transition-all ${ 
              theme === 'light'
                  ? 'text-red-600 hover:bg-red-100'
                  : 'text-red-400 hover:bg-red-500/20'
            }`}
            >
              <FiLogOut className="w-4 h-4" />
            </motion.button>
          ) : (
            // --- LOGGED-OUT BUTTON (From New Design) ---
            <Link
              href="/auth"
              // Classes from your snippet
              className={`px-4 py-1.5 bg-violet-600 text-white rounded-full text-sm font-medium hover:bg-violet-700 transition-colors`}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </motion.header>
      {/* --- SETTINGS MODAL REMOVED --- */}
    </>
  );
}

