'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/navigation';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useNotification } from '@/hooks/useNotification';
import { FiCheckCircle, FiXCircle, FiFile, FiDownload, FiUser, FiCalendar, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import Noise from '@/components/Noise'; // Import the Noise component

interface Booking {
  id: string;
  // --- FIXED: Replaced placeholder with actual properties ---
  venue_id: string;
  venue_name: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  date: string;
  start_time: string;
  end_time: string;
  time_slot: string;
  purpose: string;
  pdf_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  // ----------------------------------------------------
  created_at: string;
}

export default function ApprovalsPage() {
  const { user, userRole, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const { showToast, speak } = useNotification();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || (userRole !== 'admin' && userRole !== 'superadmin'))) {
      router.push('/auth');
    }
  }, [user, userRole, authLoading, router]);

  useEffect(() => {
    const bookingsRef = collection(db, 'bookings');
    let q;
    
    if (filter === 'all') {
      q = query(bookingsRef);
    } else {
      q = query(bookingsRef, where('status', '==', filter));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingsData: Booking[] = [];
      snapshot.forEach((doc) => {
        bookingsData.push({ id: doc.id, ...doc.data() } as Booking);
      });
      setBookings(bookingsData.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    });

    return () => unsubscribe();
  }, [filter]);

  const handleApproval = async (bookingId: string, approved: boolean) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const booking = bookings.find((b) => b.id === bookingId);
      
      if (!booking) {
        showToast('Booking not found', 'error');
        return;
      }

      // Get current booking status to check if we need to clean up venue availability
      const wasApproved = booking.status === 'approved';

      // Update booking status
      await updateDoc(bookingRef, {
        status: approved ? 'approved' : 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.uid,
      });

      // If rejecting an approved booking, remove it from venue availability
      if (!approved && wasApproved) {
        try {
          const venueRef = doc(db, 'venues', booking.venue_id);
          const venueDoc = await getDoc(venueRef);
          
          if (venueDoc.exists()) {
            const venueData = venueDoc.data();
            let currentAvailability = venueData.availability || {};

            // Clean up expired dates (past dates) from availability
            const today = format(new Date(), 'yyyy-MM-dd');
            const cleanedAvailability: { [date: string]: string[] } = {};
            Object.keys(currentAvailability).forEach((dateKey) => {
              if (dateKey >= today) {
                cleanedAvailability[dateKey] = currentAvailability[dateKey];
              }
            });
            currentAvailability = cleanedAvailability;
            
            // Remove this booking's time slot from availability
            const dateKey = booking.date;
            // Use time_slot field if available, otherwise construct it
            const timeSlot = booking.time_slot || `${booking.start_time}-${booking.end_time}`;
            const existingSlots = currentAvailability[dateKey] || [];
            const updatedSlots = existingSlots.filter((slot: string) => slot !== timeSlot);
            
            if (updatedSlots.length === 0) {
              // No more bookings for this date, remove the date
              delete currentAvailability[dateKey];
            } else {
              // Still have other bookings for this date, keep the date
              currentAvailability[dateKey] = updatedSlots;
            }
            
            // Determine new status: if no future bookings, set to available
            let newStatus = venueData.status;
            if (Object.keys(currentAvailability).length === 0) {
              newStatus = 'available';
            }
            
            // Update venue availability
            await updateDoc(venueRef, {
              availability: currentAvailability,
              status: newStatus,
              updated_at: new Date().toISOString(),
            });
          }
        } catch (venueError) {
          console.error('Error removing booking from venue availability:', venueError);
          showToast('Venue availability update failed', 'info');
        }
      }

      // If approved, update venue availability
      if (approved) {
        try {
          const venueRef = doc(db, 'venues', booking.venue_id);
          const venueDoc = await getDoc(venueRef);
          
          if (venueDoc.exists()) {
            const venueData = venueDoc.data();
            let currentAvailability = venueData.availability || {};
            
            // Clean up expired dates (past dates) from availability
            const today = format(new Date(), 'yyyy-MM-dd');
            const cleanedAvailability: { [date: string]: string[] } = {};
            Object.keys(currentAvailability).forEach((dateKey) => {
              if (dateKey >= today) {
                cleanedAvailability[dateKey] = currentAvailability[dateKey];
              }
            });
            currentAvailability = cleanedAvailability;
            
            // Check for time slot conflicts (allow multiple bookings per day if no overlap)
            const dateKey = booking.date; // Date in format YYYY-MM-DD
            // Use time_slot field if available, otherwise construct it
            const timeSlot = booking.time_slot || `${booking.start_time}-${booking.end_time}`;
            const existingSlots = currentAvailability[dateKey] || [];
            
            // Check if this exact time slot is already booked
            if (existingSlots.includes(timeSlot)) {
              showToast(`Time slot ${timeSlot} is already booked for ${format(new Date(booking.date), 'MMM dd, yyyy')}.`, 'error');
              // Reject this booking
              await updateDoc(bookingRef, {
                status: 'rejected',
                reviewed_at: new Date().toISOString(),
                reviewed_by: user?.uid,
              });
              return;
      }

            // Check for overlapping time slots
            const hasOverlap = existingSlots.some((existingSlot: string) => {
              const [existingStart, existingEnd] = existingSlot.split('-').map(t => t.trim());
              const [newStart, newEnd] = [booking.start_time, booking.end_time];
              
              // Check if new slot overlaps with existing slot
              return (
                (newStart >= existingStart && newStart < existingEnd) ||
                (newEnd > existingStart && newEnd <= existingEnd) ||
                (newStart <= existingStart && newEnd >= existingEnd)
              );
            });
            
            if (hasOverlap) {
              showToast(`Time slot overlaps with existing booking for ${format(new Date(booking.date), 'MMM dd, yyyy')}.`, 'error');
              // Reject this booking
              await updateDoc(bookingRef, {
                status: 'rejected',
                reviewed_at: new Date().toISOString(),
                reviewed_by: user?.uid,
              });
              return;
            }
            
            // Add the time slot to existing slots (multiple bookings per day allowed)
            existingSlots.push(timeSlot);
            currentAvailability[dateKey] = existingSlots.sort(); // Sort for consistency
            
            // Check if venue should be marked as booked (has at least one booking)
            // Update venue availability and potentially status
            await updateDoc(venueRef, {
              availability: currentAvailability,
              // Update status to 'booked' if it's currently 'available'
              // (don't override 'maintenance' status)
              status: venueData.status === 'available' ? 'booked' : venueData.status,
              updated_at: new Date().toISOString(),
            });
          }
        } catch (venueError) {
          console.error('Error updating venue availability:', venueError);
          showToast('Venue availability update failed, but booking was approved', 'info');
        }
        
        showToast(`Booking for ${booking.venue_name} approved!`, 'success');
        speak('Your booking has been approved.');
      } else {
        showToast(`Booking for ${booking.venue_name} rejected.`, 'error');
        speak('Your booking has been rejected.');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      showToast('Failed to update booking status', 'error');
    }
  };

  // --- NEW ANIMATED LOADING STATE ---
  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'light' ? 'bg-white' : 'bg-black'
      }`}>
        {/* Added motion wrapper for fade in/out */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-center"
        >
          {/* Replaced 'animate-spin' with a motion component for a cleaner pulse */}
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ 
              rotate: { repeat: Infinity, duration: 1, ease: "linear" },
              scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
            }}
            className="rounded-full h-12 w-12 border-b-2 border-t-2 border-violet-500 mx-auto"
          ></motion.div>
          {/* Added pulsing animation to the text */}
          <motion.p
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className={`mt-4 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}
          >
            Loading...
          </motion.p>
        </motion.div>
      </div>
    );
  }
  // --- END OF LOADING STATE ---

  const filteredBookings = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className={`relative overflow-hidden min-h-screen pb-12 ${
      theme === 'light' ? 'bg-white' : 'bg-black' // Changed
    }`}>
      {/* Add Noise component */}
      <Noise
        patternAlpha={theme === 'light' ? 10 : 5}
        patternRefreshInterval={4}
        tint={theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(139, 92, 246, 0.1)'}
      />
      
      {/* Add relative z-10 to content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className={`text-4xl font-bold mb-2 ${
            theme === 'light' ? 'text-[#1e293b]' : 'text-violet-400' // Changed
            }`}>
              Booking Approvals
            </h1>
          <p className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
              Review and manage booking requests
            </p>
        </motion.div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((filterOption) => (
            <motion.button
              key={filterOption}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === filterOption
                  ? theme === 'light'
                    ? 'bg-violet-500 text-white' // Changed
                    : 'bg-violet-600 text-white glow-dark' // Changed
                  : theme === 'light'
                  ? 'bg-white/50 text-gray-700 hover:bg-gray-100'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </motion.button>
          ))}
        </div>

        {filteredBookings.length === 0 ? (
          <div className={`text-center py-12 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
            No {filter === 'all' ? '' : filter} bookings found
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-6 rounded-xl backdrop-blur-xl border ${
                  theme === 'light'
                    ? 'glass-light border-violet-200' // Changed
                    : 'glass-dark border-violet-500/20' // Changed
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className={`text-xl font-semibold mb-2 ${
                      theme === 'light' ? 'text-[#1e293b]' : 'text-[#f8fafc]'
                  }`}>
                      {booking.venue_name}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className={`flex items-center space-x-2 ${
                        theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                        <FiUser />
                        <span>{booking.user_email}</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${
                        theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                        <FiCalendar />
                        <span>{format(new Date(booking.date), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${
                        theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                        <FiClock />
                        <span>{booking.start_time} - {booking.end_time}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    booking.status === 'pending'
                      ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                      : booking.status === 'approved'
                      ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                      : 'bg-red-500/20 text-red-600 dark:text-red-400'
                  }`}>
                    {booking.status.toUpperCase()}
                  </div>
                </div>

                {booking.purpose && (
                  <div className={`mb-4 p-3 rounded-lg border ${ // Added border
                    theme === 'light' 
                      ? 'bg-violet-50 border-violet-200' // Changed
                      : 'bg-violet-500/10 border-violet-500/20' // Changed
                  }`}>
                    <p className={`text-sm ${
                      theme === 'light' ? 'text-violet-900' : 'text-violet-300' // Changed
                    }`}>
                      {booking.purpose}
                    </p>
                        </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {booking.pdf_url && (
                      <a
                        href={booking.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                              theme === 'light'
                            ? 'text-violet-600 hover:bg-violet-50' // Changed
                            : 'text-violet-400 hover:bg-violet-500/20' // Changed
                            }`}
                          >
                        <FiFile />
                        <span>View PDF</span>
                        <FiDownload className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  {booking.status === 'pending' && (
                        <div className="flex space-x-2">
                              <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleApproval(booking.id, true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                              >
                        <FiCheckCircle />
                        <span>Approve</span>
                              </motion.button>
                              <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleApproval(booking.id, false)}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                              >
                        <FiXCircle />
                        <span>Reject</span>
                              </motion.button>
            </div>
          )}

                  {booking.status === 'approved' && (
                  <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (confirm(`Are you sure you want to reject this approved booking for ${booking.venue_name}?`)) {
                          handleApproval(booking.id, false);
                        }
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                      <FiXCircle />
                      <span>Reject Booking</span>
                  </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
              </div>
        )}
      </div>
    </div>
  );
}

