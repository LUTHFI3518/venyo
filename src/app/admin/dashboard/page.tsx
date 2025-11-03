'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/navigation';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FiUsers, FiCalendar, FiClock, FiCheckCircle } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import Noise from '@/components/Noise'; // Import the Noise component

export default function AdminDashboard() {
  const { user, userRole, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalVenues: 0,
    pendingApprovals: 0,
    upcomingBookings: 0,
    totalBookings: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && (!user || (userRole !== 'admin' && userRole !== 'superadmin'))) {
      router.push('/auth');
    }
  }, [user, userRole, authLoading, router]);

  useEffect(() => {
    // Fetch venues
    const venuesRef = collection(db, 'venues');
    const venuesUnsubscribe = onSnapshot(query(venuesRef), (snapshot) => {
      setStats((prev) => ({ ...prev, totalVenues: snapshot.size }));
    });

    // Fetch bookings
    const bookingsRef = collection(db, 'bookings');
    const bookingsUnsubscribe = onSnapshot(query(bookingsRef), (snapshot) => {
      let pending = 0;
      let upcoming = 0;
      const now = new Date();
      const venueStats: { [key: string]: number } = {};

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === 'pending') pending++;
        if (data.status === 'approved') {
          const bookingDate = new Date(data.date);
          if (bookingDate >= now) upcoming++;
          venueStats[data.venue_name] = (venueStats[data.venue_name] || 0) + 1;
        }
      });
      
      setStats((prev) => ({
        ...prev,
        pendingApprovals: pending,
        upcomingBookings: upcoming,
        totalBookings: snapshot.size,
      }));

      // Prepare chart data
      const chartDataArray = Object.entries(venueStats).map(([name, value]) => ({
        name,
        bookings: value,
      }));
      setChartData(chartDataArray);
    });

    return () => {
      venuesUnsubscribe();
      bookingsUnsubscribe();
    };
  }, []);

  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'light' ? 'bg-white' : 'bg-black' // Changed
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto"></div> {/* Changed */}
          <p className={`mt-4 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Loading...</p>
        </div>
      </div>
    );
  }

  // Updated stat card colors to violet/purple
  const statCards = [
    {
      title: 'Total Venues',
      value: stats.totalVenues,
      icon: FiUsers,
      color: 'bg-violet-600', // Changed
      link: '/admin/venues',
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals,
      icon: FiClock,
      color: 'bg-yellow-500',
      link: '/admin/approvals',
    },
    {
      title: 'Upcoming Bookings',
      value: stats.upcomingBookings,
      icon: FiCalendar,
      color: 'bg-green-500',
      link: '/admin/approvals',
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: FiCheckCircle,
      color: 'bg-purple-600', // Changed
      link: '/admin/approvals',
    },
  ];

  return (
    // Add relative, overflow-hidden
    <div className={`relative overflow-hidden min-h-screen pb-12 ${
      theme === 'light' ? 'bg-white' : 'bg-black' // Changed
    }`}>
      {/* Add Noise component */}
      <Noise
        patternAlpha={theme === 'light' ? 10 : 5}
        patternRefreshInterval={4}
        tint={theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(139, 92, 246, 0.1)'}
      />
      
      {/* Add relative, z-10 to put content above noise */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className={`text-4xl font-bold mb-2 ${
            theme === 'light' ? 'text-[#1e293b]' : 'text-violet-400' // Changed
          }`}>
            Admin Dashboard
          </h1>
          <p className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
            Manage venues and bookings
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Link key={stat.title} href={stat.link}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
                className={`p-6 rounded-xl backdrop-blur-xl border cursor-pointer ${
                  theme === 'light'
                    ? 'glass-light border-violet-200 hover:shadow-lg' // Changed
                    : 'glass-dark border-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30' // Changed
                }`}
            >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
                <h3 className={`text-2xl font-bold mb-1 ${
                  theme === 'light' ? 'text-[#1e293b]' : 'text-[#f8fafc]'
              }`}>
                {stat.value}
              </h3>
                <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                  {stat.title}
              </p>
            </motion.div>
            </Link>
          ))}
        </div>

        <div className={`p-6 rounded-xl backdrop-blur-xl border ${
          theme === 'light'
            ? 'glass-light border-violet-200' // Changed
            : 'glass-dark border-violet-500/20' // Changed
        }`}>
          <h2 className={`text-2xl font-bold mb-6 ${
            theme === 'light' ? 'text-[#1e293b]' : 'text-violet-400' // Changed
            }`}>
              Venue Utilization
          </h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={theme === 'light' ? '#e2e8f0' : '#374151'} // Changed
                />
                <XAxis 
                  dataKey="name" 
                  stroke={theme === 'light' ? '#6b7280' : '#9ca3af'} // Changed
                />
                <YAxis 
                  stroke={theme === 'light' ? '#6b7280' : '#9ca3af'} // Changed
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(31,41,55,0.8)',
                    borderColor: theme === 'light' ? '#e2e8f0' : '#4b5563',
                    borderRadius: '0.75rem',
                    backdropFilter: 'blur(4px)',
                  }}
                  itemStyle={{
                    color: theme === 'light' ? '#1f2937' : '#f3f4f6'
                  }}
                  labelStyle={{
                    color: theme === 'light' ? '#1f2937' : '#f3f4f6'
                  }}
                />
                <Bar dataKey="bookings" fill={theme === 'light' ? '#8b5cf6' : '#a78bfa'} /> {/* Changed */}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={`text-center py-12 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
              No booking data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
