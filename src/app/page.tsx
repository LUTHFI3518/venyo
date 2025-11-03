'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext'; // Import useTheme
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowRight, FiCalendar, FiUsers } from 'react-icons/fi';
import { HiOutlineTicket } from 'react-icons/hi';
import Waves from '@/components/Waves'; // Import the Waves component

// Animated text component for letter-by-letter animation
const AnimatedText = ({ text, className = '' }: { text: string; className?: string }) => {
  return (
    <div className={`flex flex-wrap ${className}`}>
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03, duration: 0.3 }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </div>
  );
};

export default function Home() {
  const { user, userRole, loading } = useAuth();
  const { theme } = useTheme(); // Get theme
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (userRole === 'admin' || userRole === 'superadmin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/user/dashboard');
      }
    }
  }, [user, userRole, loading, router]);

  if (loading || user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'light' ? 'bg-white' : 'bg-black' // Themed
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
          <p className={`mt-4 ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-400' // Themed
          }`}>Loading...</p>
        </div>
      </div>
    );
  }

  const stats = [
    { 
      icon: <FiUsers className="w-8 h-8" />,
      value: '10K+', 
      label: 'Active Users',
      description: 'Trusted by organizations worldwide'
    },
    { 
      icon: <FiCalendar className="w-8 h-8" />,
      value: '500+', 
      label: 'Venues',
      description: 'Managed across platforms'
    },
    { 
      icon: <HiOutlineTicket className="w-8 h-8" />,
      value: '50K+', 
      label: 'Bookings',
      description: 'Processed seamlessly'
    },
  ];

  const testimonials = [
    {
      text: "Venyo has completely transformed how we manage our college venues. The booking system is intuitive and the admin controls are powerful.",
      author: "@college_admin"
    },
    {
      text: "The time slot booking feature is exactly what we needed. Managing multiple venues has never been easier!",
      author: "@event_manager"
    },
    {
      text: "From the house of Manage My Event - this platform delivers on its promise. Highly customizable and reliable.",
      author: "@organizer_pro"
    },
    {
      text: "Real-time availability tracking and automated scheduling save us hours every week. A must-have for venue management.",
      author: "@facility_manager"
    },
    {
      text: "The approval workflow and notifications make coordinating bookings seamless. Our team loves it!",
      author: "@team_lead"
    },
    {
      text: "Venyo's multi-venue support is outstanding. We can manage auditoriums, labs, and conference halls all in one place.",
      author: "@admin_user"
    },
  ];

  return (
    <div className={`min-h-screen relative overflow-hidden ${
      theme === 'light' ? 'bg-white' : 'bg-black' // Themed
    }`}>
      {/* Header (Kept dark as per your provided snippet) */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-6xl px-4">
        <div className="flex items-center justify-between h-12 px-6 rounded-full bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 shadow-lg">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">V</span>
            </div>
            <span className="text-base font-bold text-white">Venyo</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium text-white/90 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/auth" className="text-sm font-medium text-white/90 hover:text-white transition-colors">
              Get Started
            </Link>
          </nav>
          <div className="flex items-center">
            <Link
              href="/auth"
              className="px-4 py-1.5 bg-violet-600 text-white rounded-full text-sm font-medium hover:bg-violet-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* --- ADDED WAVES --- */}
        <Waves
          className="absolute inset-0 z-0"
          backgroundColor={theme === 'light' ? '#ffffff' : '#000000'}
          waveAmpX={60}
          waveAmpY={30}
          xGap={20}
          yGap={20}
        />
        {/* --- End Waves --- */}
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 ${
                theme === 'light' 
                  ? 'bg-violet-100 text-violet-700' 
                  : 'bg-violet-500/10 text-violet-400' // Themed
              }`}
            >
              <span>From the house of Manage My Event</span>
            </motion.div>

            <h1 className={`text-6xl lg:text-8xl font-bold mb-6 leading-tight tracking-tight ${
              theme === 'light' ? 'text-gray-900' : 'text-gray-100' // Themed
            }`}>
              <AnimatedText text="Venue Management" className="block" />
              <span className="block text-violet-600 mt-2">
                <AnimatedText text="For Modern" className="block" />
              </span>
              <AnimatedText text="Organizations" className="block mt-2" />
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className={`text-xl mb-4 max-w-2xl mx-auto ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400' // Themed
              }`}
            >
              Highly customizable venue management platform that makes your booking process truly stand out
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mt-8"
            >
              <Link
                href="/auth"
                className={`inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  theme === 'light'
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'bg-violet-600 text-white hover:bg-violet-700' // Themed
                }`}
              >
                <span>Get Started</span>
                <FiArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-20 px-4 sm:px-6 lg:px-8 ${
        theme === 'light' ? 'bg-gray-50' : 'bg-gray-900' // Themed
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="flex justify-center mb-4 text-violet-600">
                  {stat.icon}
                </div>
                <h2 className={`text-4xl font-bold mb-2 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white' // Themed
                }`}>{stat.value}</h2>
                <h3 className={`text-lg font-semibold mb-1 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white' // Themed
                }`}>{stat.label}</h3>
                <p className={`${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400' // Themed
                }`}>{stat.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={`py-20 px-4 sm:px-6 lg:px-8 ${
        theme === 'light' ? 'bg-white' : 'bg-black' // Themed
      }`}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className={`text-3xl font-bold mb-2 ${
              theme === 'light' ? 'text-gray-900' : 'text-white' // Themed
            }`}>Loved by organizations worldwide</h2>
            <p className={`${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400' // Themed
            }`}>See what users are saying about Venyo</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-lg border transition-colors cursor-pointer ${
                  theme === 'light' 
                    ? 'bg-gray-50 border-gray-200 hover:border-violet-300'
                    : 'bg-gray-900 border-gray-800 hover:border-violet-700' // Themed
                }`}
              >
                <p className={`mb-4 leading-relaxed ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300' // Themed
                }`}>{testimonial.text}</p>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {testimonial.author[1].toUpperCase()}
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${
                    theme === 'light' ? 'text-gray-900' : 'text-white' // Themed
                  }`}>{testimonial.author}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 px-4 sm:px-6 lg:px-8 ${
        theme === 'light' ? 'bg-gray-900 text-white' : 'bg-violet-900 text-white' // Themed
      }`}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-4"
          >
            Start Managing Your Venues
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg mb-8 text-gray-300" // Lightened text
          >
            Bookings, Availability, Scheduling - One Click Away
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/auth"
              className={`inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                theme === 'light'
                  ? 'bg-white text-gray-900 hover:bg-gray-100'
                  : 'bg-violet-600 text-white hover:bg-violet-500' // Themed
              }`}
            >
              <span>Get Started</span>
              <FiArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t py-12 px-4 sm:px-6 lg:px-8 ${
        theme === 'light' ? 'bg-white border-gray-200' : 'bg-black border-gray-800' // Themed
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <div>
                <p className={`text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400' // Themed
                }`}>
                  A platform created with <span className="text-violet-600">❤️</span> by Venyo Team
                </p>
                <p className={`text-xs mt-1 ${
                  theme === 'light' ? 'text-gray-500' : 'text-gray-500' // Themed
                }`}>From the house of Manage My Event</p>
              </div>
            </div>
            <div className={`flex items-center space-x-6 text-sm ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400' // Themed
            }`}>
              <Link href="/auth" className="hover:text-violet-600 transition-colors">
                Get Started
              </Link>
              <Link href="#" className="hover:text-violet-600 transition-colors">
                Documentation
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Venyo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

