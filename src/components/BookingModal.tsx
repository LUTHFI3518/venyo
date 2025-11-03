'use client';

// BookingModal with ImgBB for free PDF uploads
// This version uses ImgBB API instead of Firebase Storage

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { uploadToImgBB } from '@/lib/imgbb';
import { FiX, FiUpload, FiFile, FiCalendar, FiClock } from 'react-icons/fi';
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
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [purpose, setPurpose] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Predefined time slots
  const timeSlots = ['09:00-12:00', '12:00-13:00', '14:00-16:00'];
  
  // Get booked slots for selected date
  const bookedSlots = venue.availability?.[date] || [];
  
  // Calculate available slots
  const availableSlots = timeSlots.filter(slot => !bookedSlots.includes(slot));
  
  // Update selected slots when date changes - clear selection
  useEffect(() => {
    setSelectedTimeSlots([]);
  }, [date, venue.availability]);
  
  // Toggle slot selection
  const toggleSlot = (slot: string) => {
    if (bookedSlots.includes(slot)) return; // Can't select booked slots
    
    setSelectedTimeSlots(prev => 
      prev.includes(slot) 
        ? prev.filter(s => s !== slot)
        : [...prev, slot]
    );
  };

  // Get ImgBB API key from environment variable
  // Add NEXT_PUBLIC_IMGBB_API_KEY to your .env.local
  const imgbbApiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY || '';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      showToast('Please select a PDF file', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      let pdfUrl = '';
      
      // Upload PDF to ImgBB if file is selected and API key is available
      if (pdfFile && imgbbApiKey) {
        try {
          setUploadProgress(10);
          const imgbbResponse = await uploadToImgBB(pdfFile, imgbbApiKey);
          pdfUrl = imgbbResponse.data.url;
          setUploadProgress(100);
          showToast('PDF uploaded successfully!', 'success');
        } catch (uploadError) {
          console.error('ImgBB upload failed:', uploadError);
          showToast('PDF upload failed. Submitting without PDF...', 'info');
          // Continue without PDF - booking will still work
        }
      } else if (pdfFile && !imgbbApiKey) {
        showToast('PDF upload not configured. Submitting without PDF...', 'info');
      }

      // Validate all required fields
      if (selectedTimeSlots.length === 0) {
        showToast('Please select at least one time slot', 'error');
        setIsSubmitting(false);
        return;
      }
      
      if (!purpose || purpose.trim() === '') {
        showToast('Please enter the purpose of your booking', 'error');
        setIsSubmitting(false);
        return;
      }

      // Create separate booking requests for each selected slot
      const bookingPromises = selectedTimeSlots.map(async (slot) => {
        const [startTime, endTime] = slot.split('-').map(t => t.trim());
        return addDoc(collection(db, 'bookings'), {
        venue_id: venue.id,
        venue_name: venue.name,
        user_id: user.uid,
        user_email: user.email,
          date,
        start_time: startTime,
        end_time: endTime,
          purpose,
        pdf_url: pdfUrl,
        status: 'pending',
          created_at: new Date().toISOString(),
      });
      });

      await Promise.all(bookingPromises);

      showToast(`Booking request submitted successfully for ${selectedTimeSlots.length} slot(s)!`, 'success');
      speak(`Your booking request for ${selectedTimeSlots.length} time slot${selectedTimeSlots.length > 1 ? 's' : ''} has been submitted for approval.`);
      onClose();
    } catch (error) {
      console.error('Error submitting booking:', error);
      showToast('Failed to submit booking request', 'error');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
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
            {/* Show availability for selected date */}
            <div className={`p-3 rounded-lg mb-4 ${
              theme === 'light' ? 'bg-blue-50 border border-blue-200' : 'bg-blue-500/10 border border-blue-500/20'
            }`}>
              <p className={`text-xs font-medium mb-2 ${
                theme === 'light' ? 'text-blue-700' : 'text-blue-300'
              }`}>
                Select Time Slots for {format(new Date(date), 'MMM dd, yyyy')} (Multiple selection allowed) <span className="text-red-500">*</span>:
              </p>
              <div className="flex flex-wrap gap-2 mb-2">
                {timeSlots.map((slot) => {
                  const isBooked = bookedSlots.includes(slot);
                  const isSelected = selectedTimeSlots.includes(slot);
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => toggleSlot(slot)}
                      disabled={isBooked}
                      className={`px-3 py-1 rounded text-xs font-medium transition-all relative ${
                        isBooked
                          ? theme === 'light'
                            ? 'bg-red-100 text-red-700 cursor-not-allowed opacity-60'
                            : 'bg-red-500/20 text-red-400 cursor-not-allowed opacity-60'
                          : isSelected
                          ? theme === 'light'
                            ? 'bg-green-500 text-white border-2 border-green-600'
                            : 'bg-green-600 text-white border-2 border-green-400'
                          : theme === 'light'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                          : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 bg-white rounded-full w-4 h-4 flex items-center justify-center text-green-600 text-xs font-bold">
                          ✓
                        </span>
                      )}
                      {slot} {isBooked && '(Booked)'}
                    </button>
                  );
                })}
              </div>
              {selectedTimeSlots.length > 0 && (
                <p className={`text-xs mt-2 ${theme === 'light' ? 'text-green-700' : 'text-green-400'}`}>
                  ✓ {selectedTimeSlots.length} slot(s) selected: {selectedTimeSlots.join(', ')}
                </p>
              )}
              {bookedSlots.length > 0 && (
                <p className={`text-xs mt-2 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                  Booked slots are disabled.
                </p>
              )}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'light' ? 'text-gray-700' : 'text-gray-300'
              }`}>
                Venue <span className="text-red-500">*</span>
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
                  <span>Date <span className="text-red-500">*</span></span>
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

              {selectedTimeSlots.length > 0 && (
              <div>
                  <label className={`block text-sm font-medium mb-2 flex items-center space-x-2 ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                    <FiClock />
                    <span>Selected Time Slots ({selectedTimeSlots.length})</span>
                </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedTimeSlots.map((slot, idx) => {
                      const [startTime, endTime] = slot.split('-').map(t => t.trim());
                      return (
                        <div
                          key={idx}
                          className={`px-3 py-2 rounded-lg border ${
                    theme === 'light'
                              ? 'bg-green-50 border-green-200 text-gray-900'
                              : 'bg-green-500/10 border-green-500/30 text-gray-200'
                          }`}
                        >
                          <span className={`font-semibold text-sm ${
                            theme === 'light' ? 'text-green-700' : 'text-green-400'
                          }`}>
                            {slot}
                          </span>
                          <p className={`text-xs mt-0.5 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                            {startTime} - {endTime}
                          </p>
                        </div>
                      );
                    })}
                  </div>
              </div>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'light' ? 'text-gray-700' : 'text-gray-300'
              }`}>
                Purpose / Notes <span className="text-red-500">*</span>
              </label>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                  rows={3}
                  required
                  className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'light'
                      ? 'bg-white/50 border-gray-300 text-gray-900 placeholder-gray-400'
                      : 'bg-gray-800/50 border-gray-700 text-gray-200 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-sky-500`}
                  placeholder="Describe the purpose of your booking... *"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'light' ? 'text-gray-700' : 'text-gray-300'
              }`}>
                PDF Document (Optional) {!imgbbApiKey && <span className="text-xs text-yellow-600 dark:text-yellow-400">(API key not configured)</span>}
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
                  theme === 'light'
                    ? 'border-gray-300 hover:border-sky-400 hover:bg-sky-50'
                    : 'border-gray-700 hover:border-blue-500 hover:bg-blue-500/10'
                } ${!imgbbApiKey ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
              <input
                ref={fileInputRef}
                type="file"
                  accept=".pdf"
                onChange={handleFileSelect}
                  disabled={!imgbbApiKey}
                className="hidden"
              />
                <div className="text-center">
                  <FiUpload className={`w-8 h-8 mx-auto mb-2 ${
                    theme === 'light' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  {pdfFile ? (
                    <div className="flex items-center justify-center space-x-2">
                      <FiFile className={`w-5 h-5 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`} />
                      <span className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                        {pdfFile.name}
                      </span>
                    </div>
                  ) : (
                    <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                      {imgbbApiKey ? 'Click to upload PDF' : 'Configure ImgBB API key to enable PDF upload'}
                    </p>
                  )}
                </div>
              </div>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-2">
                  <div className={`h-2 rounded-full overflow-hidden ${
                    theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'
                  }`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      className="h-full bg-sky-500"
                    />
                  </div>
                  <p className={`text-xs mt-1 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                    Uploading: {Math.round(uploadProgress)}%
                  </p>
                </div>
              )}
            </div>

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

