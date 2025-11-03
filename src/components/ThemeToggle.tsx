'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className={`fixed top-6 right-6 z-50 p-3 rounded-full transition-all duration-300 ${
        theme === 'light'
          ? 'glass-light text-[#1e293b] hover:shadow-lg'
          : 'glass-dark text-[#f8fafc] hover:shadow-lg glow-dark'
      }`}
      aria-label="Toggle theme"
      >
        {theme === 'light' ? (
        <FiSun className="w-5 h-5" />
        ) : (
        <FiMoon className="w-5 h-5" />
        )}
    </motion.button>
  );
}
