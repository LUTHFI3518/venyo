'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Noise from './Noise'; // Import the new Noise component

export default function Footer() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    setMounted(true);
    // Get theme from localStorage or system preference
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('venyo-theme');
      if (stored) {
        setTheme(stored === 'light' ? 'light' : 'dark');
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
      }
      
      // Listen for theme changes
      const observer = new MutationObserver(() => {
        const htmlTheme = document.documentElement.classList.contains('light') ? 'light' : 'dark';
        setTheme(htmlTheme);
      });
      
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });
      
      return () => observer.disconnect();
    }
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    // Add relative and overflow-hidden to contain the noise
    <footer className={`relative overflow-hidden border-t ${
      theme === 'light' 
        ? 'bg-white border-violet-200' // Violet theme
        : 'bg-black border-violet-500/20' // Black and Violet theme
    }`}>
      {/* Add the Noise component as the background */}
      <Noise
        patternAlpha={theme === 'light' ? 10 : 5} // More subtle in dark mode
        patternRefreshInterval={4}
      />
      
      {/* Add relative z-10 to put content above the noise canvas */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className={`text-3xl font-bold mb-4 ${
            theme === 'light' ? 'text-[#1e293b]' : 'text-[#f8fafc]'
          }`}>
            About Venyo
          </h2>
          <p className={`text-lg mb-4 max-w-2xl mx-auto ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
          }`}>
            Venyo — a futuristic and minimal platform for managing college venues, auditoriums, and labs.
          </p>
          <p className={`text-base ${
            theme === 'light' ? 'text-gray-500' : 'text-gray-400' // Adjusted dark mode text
          }`}>
            Created & Designed by{' '}
            <motion.span
              className={`font-bold inline-block ${
              theme === 'light' 
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent' // Violet theme
                  : 'bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent' // Violet theme
              }`}
              animate={{
                backgroundPosition: ['0%', '100%', '0%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            >
              Luthfi ✦
            </motion.span>
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
