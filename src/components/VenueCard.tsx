'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { FiUsers, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import { format } from 'date-fns';

interface Venue {
  id: string;
  name: string;
  capacity: number;
  status: 'available' | 'booked' | 'maintenance';
  availability?: {
    [date: string]: string[];
  };
  description?: string;
  image_url?: string; // Fixed: Added image_url
}

interface VenueCardProps {
  venue: Venue;
  selectedDate: string;
  index: number;
  onRequestBooking: () => void;
}

// Animation variants for staggering content inside the card
const cardContentVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export default function VenueCard({ venue, selectedDate, index, onRequestBooking }: VenueCardProps) {
  const { theme } = useTheme();

  const getStatusIcon = () => {
    switch (venue.status) {
      case 'available':
        return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'booked':
        return <FiXCircle className="w-5 h-5 text-red-500" />;
      case 'maintenance':
        return <FiAlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  // Get booked slots for the selected date
  const bookedSlots = venue.availability?.[selectedDate] || [];
  
  // Generate predefined time slots
  const allTimeSlots: string[] = [
    '09:00-12:00',  // 9 AM to 12 PM
    '12:00-13:00',  // 12 PM to 1 PM
    '14:00-16:00',  // 2 PM to 4 PM
  ];
  
  // Calculate available slots (all slots minus booked slots)
  const availableSlots = allTimeSlots.filter(slot => !bookedSlots.includes(slot));

  return (
    <motion.div
      variants={itemVariants} // Use itemVariants for stagger
      // Animate as it scrolls into view
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ scale: 1.03, y: -5, transition: { type: "spring", stiffness: 300, damping: 15 } }}
      className={`p-6 rounded-xl backdrop-blur-xl border transition-all cursor-pointer ${
        theme === 'light'
          ? 'glass-light border-violet-200 hover:shadow-lg' // Theme
          : 'glass-dark border-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30' // Theme
      }`}
      onClick={onRequestBooking}
    >
      {/* Wrap content in a motion.div to apply stagger */}
      <motion.div variants={cardContentVariants} initial="hidden" animate="visible">
        {venue.image_url && (
          <motion.div variants={itemVariants} className="mb-4 rounded-lg overflow-hidden">
            <img
              src={venue.image_url}
              alt={venue.name}
              className="w-full h-48 object-cover"
            />
          </motion.div>
        )}
        <motion.div variants={itemVariants} className="flex items-start justify-between mb-4">
          <h3 className={`text-xl font-semibold ${
            theme === 'light' ? 'text-[#1e293b]' : 'text-[#f8fafc]'
          }`}>
            {venue.name}
          </h3>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-3 mb-4">
          <div className="flex items-center space-x-2">
            <FiUsers className={`w-4 h-4 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`} />
            <span className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
              Capacity: {venue.capacity}
            </span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <FiClock className={`w-4 h-4 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`} />
            <span className={`text-sm font-medium ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
            }`}>
              {format(new Date(selectedDate), 'MMM dd')}:
            </span>
          </div>
          {availableSlots.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {availableSlots.slice(0, 4).map((slot, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-1 rounded text-xs ${
                    theme === 'light'
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-green-500/20 text-green-400 border border-green-500/30'
                  }`}
                >
                  {slot}
                </span>
              ))}
              {availableSlots.length > 4 && (
                <span className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                  +{availableSlots.length - 4} more available
                </span>
              )}
            </div>
          ) : (
            <span className={`text-xs ${theme === 'light' ? 'text-red-600' : 'text-red-400'}`}>
              No available slots for this date
            </span>
          )}
        </motion.div>

        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.03, transition: { type: "spring", stiffness: 400, damping: 10 } }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
            theme === 'light'
              ? 'bg-violet-500 text-white hover:bg-violet-600' // Theme
              : 'bg-violet-600 text-white hover:bg-violet-700 glow-dark' // Theme
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onRequestBooking();
          }}
        >
          Request Booking
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

