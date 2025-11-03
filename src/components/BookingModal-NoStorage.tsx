'use client';

// This is BookingModal without PDF upload - for free tier usage
// To use this, rename BookingModal.tsx to BookingModal.tsx.backup
// and rename this file to BookingModal.tsx

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FiX, FiCalendar, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import { useNotification } from '@/hooks/useNotification';

interface Venue {
  id: string;
  name: string;
  capacity: number;
  status: 'available' | 'booked' | 'maintenance';
  availability?: {
    [date: string]: string[];
  };
}

interface BookingModalProps {
  venue: Venue;
  selectedDate: string;
  onClose: () => void;
}

export default function BookingModal({ venue, selectedDate, onClose }: BookingModalProps) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { showToast, speak } = useNotification();
  const [date, setDate] = useState(selectedDate);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [purpose, setPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'bookings'), {
        venue_id: venue.id,
        venue_name: venue.name,
        user_id: user.uid,
        user_email: user.email,
        date,
        start_time: startTime,
        end_time: endTime,
        purpose,
        pdf_url: '', // No Storage - PDFs disabled
        status: 'pending',
        created_at: new Date().toISOString(),
      });

      showToast('Booking request submitted successfully!', 'success');
      speak('Your booking request has been submitted for approval.');
      onClose();
    } catch (error) {
      console.error('Error submitting booking:', error);
      showToast('Failed to submit booking request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`relative w-full max-w-2xl p-6 rounded-2xl backdrop-blur-xl border ${
            theme === 'light'
              ? 'glass-light border-sky-200'
              : 'glass-dark border-blue-500/20'
          } max-h-[90vh] overflow-y-auto`}
        >
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
              theme === 'light'
                ? 'text-gray-600 hover:bg-gray-100'
                : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            <FiX className="w-5 h-5" />
          </button>

          <h2 className={`text-2xl font-bold mb-4 ${
            theme === 'light' ? 'text-[#1e293b]' : 'text-[#f8fafc]'
          }`}>
            Request Booking
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'light' ? 'text-gray-700' : 'text-gray-300'
              }`}>
                Venue
              </label>
              <input
                type="text"
                value={venue.name}
                disabled
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'light'
                    ? 'bg-gray-100 border-gray-300 text-gray-600'
                    : 'bg-gray-800 border-gray-700 text-gray-400'
                }`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 flex items-center space-x-2 ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  <FiCalendar />
                  <span>Date</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  required
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'light'
                      ? 'bg-white/50 border-gray-300 text-gray-900'
                      : 'bg-gray-800/50 border-gray-700 text-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-sky-500`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`block text-sm font-medium mb-2 flex items-center space-x-2 ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    <FiClock />
                    <span>Start</span>
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'light'
                        ? 'bg-white/50 border-gray-300 text-gray-900'
                        : 'bg-gray-800/50 border-gray-700 text-gray-200'
                    } focus:outline-none focus:ring-2 focus:ring-sky-500`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    End
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'light'
                        ? 'bg-white/50 border-gray-300 text-gray-900'
                        : 'bg-gray-800/50 border-gray-700 text-gray-200'
                    } focus:outline-none focus:ring-2 focus:ring-sky-500`}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'light' ? 'text-gray-700' : 'text-gray-300'
              }`}>
                Purpose / Notes
              </label>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                rows={3}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'light'
                    ? 'bg-white/50 border-gray-300 text-gray-900 placeholder-gray-400'
                    : 'bg-gray-800/50 border-gray-700 text-gray-200 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-sky-500`}
                placeholder="Describe the purpose of your booking..."
              />
            </div>

            {/* PDF Upload Section Removed - No Storage Required */}

            <div className="flex space-x-4 pt-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  theme === 'light'
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  theme === 'light'
                    ? 'bg-sky-500 text-white hover:bg-sky-600'
                    : 'bg-blue-600 text-white hover:bg-blue-700 glow-dark'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

