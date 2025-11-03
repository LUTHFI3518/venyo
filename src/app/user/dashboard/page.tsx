'use client';

import { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion'; // --- FIX: Imported 'Variants' type
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/navigation';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import VenueCard from '@/components/VenueCard';
import BookingModal from '@/components/BookingModal';
import { FiSearch, FiCalendar, FiClock, FiCheckCircle, FiXCircle, FiFileText } from 'react-icons/fi';
import { format } from 'date-fns';

// --- Animation Variants ---
// For sections scrolling into view
// --- FIX: Added 'Variants' type to fix TS errors
const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

// For staggering children (like the venue card grid)
// --- FIX: Added 'Variants' type to fix TS errors
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Each child animates 0.1s after the previous
    }
  }
};
// --- End Animation Variants ---

interface Venue {
  id: string;
  name: string;
  capacity: number;
  status: 'available' | 'booked' | 'maintenance';
  availability?: {
    [date: string]: string[];
  };
  description?: string;
  image_url?: string; // Added image_url to match VenueCard
}

interface Booking {
  id: string;
  venue_id: string;
  venue_name: string;
  user_id: string;
  date: string;
  start_time: string;
  end_time: string;
  purpose: string;
  pdf_url?: string; // Made optional
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function UserDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const venuesRef = collection(db, 'venues');
    const q = query(venuesRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const venuesData: Venue[] = [];
      const now = new Date();
      const today = format(now, 'yyyy-MM-dd');
      
      console.log('🔍 Cleaning up expired bookings. Today:', today);
      
      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        // Ensure all fields from Venue interface are included
        const venue: Venue = { 
          id: docSnapshot.id,
          name: data.name || '',
          capacity: data.capacity || 0,
          status: data.status || 'available',
          availability: data.availability || {},
          description: data.description || '',
          image_url: data.image_url || ''
        };
        const originalAvailability = venue.availability || {};
        
        // Clean up expired dates from availability (past dates)
        const cleanedAvailability: { [date: string]: string[] } = {};
        const todayDate = new Date(today);
        todayDate.setHours(0, 0, 0, 0); // Set to start of day
        
        Object.keys(originalAvailability).forEach((dateKey) => {
          try {
            const bookingDate = new Date(dateKey);
            bookingDate.setHours(0, 0, 0, 0);
            
            if (bookingDate >= todayDate) {
              cleanedAvailability[dateKey] = originalAvailability[dateKey];
            }
          } catch (e) {
            if (dateKey >= today) {
              cleanedAvailability[dateKey] = originalAvailability[dateKey];
            }
          }
        });
        
        const hadExpiredDates = Object.keys(originalAvailability).length !== Object.keys(cleanedAvailability).length;
        
        let status = venue.status || 'available';
        // --- FIX: Removed impossible 'Booked' check. Type is lowercase 'booked'.
        if (Object.keys(cleanedAvailability).length === 0 && status === 'booked') {
          status = 'available';
        }
        
        if (hadExpiredDates || (status !== venue.status && status === 'available')) {
          updateDoc(doc(db, 'venues', docSnapshot.id), {
            availability: cleanedAvailability,
            status: status,
            updated_at: new Date().toISOString(),
          }).catch(error => {
            console.error('❌ Error updating venue after cleanup:', error);
          });
        }
        
        venue.availability = cleanedAvailability;
        venue.status = status;
        venuesData.push(venue);
      });
      setVenues(venuesData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, where('user_id', '==', user.uid));

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
  }, [user]);

  const filteredVenues = venues.filter((venue) =>
    venue.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'light' ? 'bg-white' : 'bg-black' // Theme
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto"></div>
          <p className={`mt-4 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-12 ${
      theme === 'light' ? 'bg-white' : 'bg-black' // Theme
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className={`text-4xl font-bold mb-2 ${
            theme === 'light' ? 'text-[#1e293b]' : 'text-[#f8fafc]'
          }`}>
            Venue Dashboard
          </h1>
          <p className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
            Browse and book available venues
          </p>
        </motion.div>

        {/* My Bookings Section */}
        {bookings.length > 0 && (
          <motion.div
            variants={sectionVariants} // Animation
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="mb-8"
          >
            <h2 className={`text-2xl font-bold mb-4 ${
              theme === 'light' ? 'text-[#1e293b]' : 'text-[#f8fafc]'
            }`}>
              My Bookings
            </h2>
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }} // Animation
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-xl backdrop-blur-xl border ${
                    theme === 'light'
                      ? 'glass-light border-violet-200' // Theme
                      : 'glass-dark border-violet-500/20' // Theme
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className={`text-xl font-semibold mb-2 ${
                        theme === 'light' ? 'text-[#1e293b]' : 'text-[#f8fafc]'
                      }`}>
                        {booking.venue_name}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm mb-3">
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
                      {booking.purpose && (
                        <div className={`mt-3 p-3 rounded-lg ${
                          theme === 'light' 
                            ? 'bg-violet-50 border border-violet-200' // Theme
                            : 'bg-violet-500/10 border border-violet-500/20' // Theme
                        }`}>
                          <div className="flex items-start space-x-2">
                            <FiFileText className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                              theme === 'light' ? 'text-violet-600' : 'text-violet-400' // Theme
                            }`} />
                            <div className="flex-1">
                              <p className={`text-xs font-medium mb-1 ${
                                theme === 'light' ? 'text-violet-700' : 'text-violet-300' // Theme
                              }`}>
                                Booking Purpose:
                              </p>
                              <p className={`text-sm ${
                                theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                              }`}>
                                {booking.purpose}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ml-4 ${
                      booking.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                        : booking.status === 'approved'
                        ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                        : 'bg-red-500/20 text-red-600 dark:text-red-400'
                    }`}>
                      {booking.status === 'pending' && <FiClock className="inline w-3 h-3 mr-1" />}
                      {booking.status === 'approved' && <FiCheckCircle className="inline w-3 h-3 mr-1" />}
                      {booking.status === 'rejected' && <FiXCircle className="inline w-3 h-3 mr-1" />}
                      {booking.status.toUpperCase()}
                    </div>
                  </div>
                </motion.div>
              ))}
              {bookings.length > 5 && (
                <p className={`text-center text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                  Showing 5 most recent bookings. Total: {bookings.length}
                </p>
              )}
            </div>
          </motion.div>
        )}

        <motion.div
          variants={sectionVariants} // Animation
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="mb-8"
        >
          <h2 className={`text-2xl font-bold mb-4 ${
            theme === 'light' ? 'text-[#1e293b]' : 'text-[#f8fafc]'
          }`}>
            Available Venues
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants} // Animation
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          <motion.div variants={sectionVariants} className="relative flex-1">
            <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              theme === 'light' ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search venues..."
              className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                theme === 'light'
                  ? 'bg-gray-50/50 border-gray-300 text-gray-900 placeholder-gray-400' // Theme
                  : 'bg-black/50 border-gray-700 text-gray-200 placeholder-gray-500' // Theme
              } focus:outline-none focus:ring-2 focus:ring-violet-500`}
            />
          </motion.div>
          <motion.div variants={sectionVariants} className="relative">
            <FiCalendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              theme === 'light' ? 'text-gray-400' : 'text-gray-500'
            }`} />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              className={`pl-10 pr-4 py-3 rounded-lg border ${
                  theme === 'light'
                  ? 'bg-gray-50/50 border-gray-300 text-gray-900' // Theme
                  : 'bg-black/50 border-gray-700 text-gray-200' // Theme
              } focus:outline-none focus:ring-2 focus:ring-violet-500`}
              />
            </motion.div>
            </motion.div>

        {filteredVenues.length === 0 ? (
          <motion.div 
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className={`text-center py-12 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
            No venues found
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants} // Animation
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredVenues.map((venue, index) => (
              <VenueCard
                key={venue.id}
                venue={venue}
                selectedDate={selectedDate}
                index={index}
                onRequestBooking={() => {
                  setSelectedVenue(venue);
                  setIsModalOpen(true);
                }}
              />
            ))}
        </motion.div>
        )}
      </div>

      {isModalOpen && selectedVenue && (
          <BookingModal
            venue={selectedVenue}
            selectedDate={selectedDate}
            onClose={() => {
            setIsModalOpen(false);
              setSelectedVenue(null);
            }}
          />
        )}
    </div>
  );
}