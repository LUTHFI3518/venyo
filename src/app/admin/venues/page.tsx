'use client';

import React, { useState, useEffect, useRef } from 'react';
// --- FIXED: Replaced placeholder with imports ---
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/navigation';
import { collection, query, onSnapshot, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore'; // Note: 'doc' is imported here
import { db } from '@/lib/firebase';
import { useNotification } from '@/hooks/useNotification';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiCheckCircle, FiXCircle, FiAlertCircle, FiX, FiUpload } from 'react-icons/fi';
import { format } from 'date-fns';
import { uploadToImgBB } from '@/lib/imgbb';
// --- End Fix ---
import Noise from '@/components/Noise'; // Import Noise component

interface Venue {
  id: string;
  // --- FIXED: Replaced placeholder with interface properties ---
  name: string;
  capacity: number;
  description?: string;
  status: 'available' | 'booked' | 'maintenance';
  image_url?: string;
  // --- End Fix ---
  availability?: {
    [date: string]: string[];
  };
}

export default function VenuesPage() {
// --- FIXED: Replaced placeholder with component body ---
  const { user, userRole, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const { showToast } = useNotification();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    capacity: 0,
    description: '',
    status: 'available' as 'available' | 'booked' | 'maintenance',
    image_url: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [imageDeleted, setImageDeleted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get ImgBB API key from environment variable
  const imgbbApiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY || '';

  useEffect(() => {
    if (!authLoading && (!user || (userRole !== 'admin' && userRole !== 'superadmin'))) {
      router.push('/auth');
    }
  }, [user, userRole, authLoading, router]);

  useEffect(() => {
    const venuesRef = collection(db, 'venues');
    const unsubscribe = onSnapshot(query(venuesRef), async (snapshot) => {
      const venuesData: Venue[] = [];
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // --- FIX: Renamed 'doc' variable to 'venueDoc' to avoid conflict with imported 'doc' function
      snapshot.forEach((venueDoc) => {
        const data = venueDoc.data(); // --- FIX: Changed from doc.data()
        const availability = data.availability || {};
        
        // Clean up expired dates from availability (past dates)
        const cleanedAvailability: { [date: string]: string[] } = {};
        const todayDate = new Date(today);
        todayDate.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
        
        Object.keys(availability).forEach((dateKey) => {
          try {
            const bookingDate = new Date(dateKey);
            bookingDate.setHours(0, 0, 0, 0);
            
            if (bookingDate >= todayDate) {
              cleanedAvailability[dateKey] = availability[dateKey];
            }
          } catch (e) {
            if (dateKey >= today) {
              cleanedAvailability[dateKey] = availability[dateKey];
            }
          }
        });
        
        let status = data.status || 'available';
        const hadExpiredDates = Object.keys(availability).length !== Object.keys(cleanedAvailability).length;
        
        if (Object.keys(cleanedAvailability).length === 0 && (status === 'booked' || status === 'Booked')) {
          status = 'available';
        }
        
        const statusChanged = status !== data.status;
        const availabilityChanged = JSON.stringify(availability) !== JSON.stringify(cleanedAvailability);
        
        if (hadExpiredDates || statusChanged || availabilityChanged) {
          // --- FIX: Changed from doc.id
          console.log(`🔄 Updating venue ${data.name || venueDoc.id}:`, {
            oldStatus: data.status,
            newStatus: status,
            expiredDates: hadExpiredDates,
            oldAvailabilityKeys: Object.keys(availability),
            newAvailabilityKeys: Object.keys(cleanedAvailability)
          });
          
          // --- FIX: Now 'doc' refers to the Firebase function, and 'venueDoc.id' is the variable
          updateDoc(doc(db, 'venues', venueDoc.id), {
            status: status,
            availability: cleanedAvailability,
            updated_at: new Date().toISOString(),
          }).then(() => {
            // --- FIX: Changed from doc.id
            console.log(`✅ Successfully updated venue ${data.name || venueDoc.id}`);
          }).catch(err => {
            console.error('❌ Error updating venue status:', err);
          });
        }
        
        venuesData.push({ 
          id: venueDoc.id, // --- FIX: Changed from doc.id
          name: data.name || '',
          capacity: data.capacity || 0,
          description: data.description || '',
          status: status,
          image_url: data.image_url || '',
          availability: cleanedAvailability,
        } as Venue);
      });
      setVenues(venuesData);
    });

    return () => unsubscribe();
  }, []);

  const handleAddVenue = () => {
    setEditingVenue(null);
    setFormData({
      name: '',
      capacity: 0,
      description: '',
      status: 'available',
      image_url: '',
    });
    setImageFile(null);
    setImagePreview(null);
    setImageDeleted(false);
    setIsModalOpen(true);
  };

  const handleEditVenue = (venue: Venue) => {
    setEditingVenue(venue);
    setFormData({
      name: venue.name,
      capacity: venue.capacity,
      description: venue.description || '',
      status: venue.status || 'available',
      image_url: venue.image_url || '',
    });
    setImagePreview(venue.image_url || null);
    setImageFile(null);
    setImageDeleted(false);
    setIsModalOpen(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setImageFile(file);
        setImageDeleted(false); // Reset deletion flag when new image is selected
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        showToast('Please select an image file', 'error');
      }
    }
  };

  const handleDeleteImage = () => {
    if (confirm('Are you sure you want to remove this image?')) {
      setImageFile(null);
      setImagePreview(null);
      setImageDeleted(true); // Mark image as deleted
      setFormData({ ...formData, image_url: '' });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteVenue = async (venueId: string) => {
    if (confirm('Are you sure you want to delete this venue?')) {
      try {
        // This line correctly uses the imported 'doc' function and was not a problem
        await deleteDoc(doc(db, 'venues', venueId));
        showToast('Venue deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting venue:', error);
        showToast('Failed to delete venue', 'error');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      let imageUrl = formData.image_url;

      if (imageFile && imgbbApiKey) {
        try {
          setUploadProgress(10);
          const imgbbResponse = await uploadToImgBB(imageFile, imgbbApiKey);
          imageUrl = imgbbResponse.data.url;
          setUploadProgress(100);
          showToast('Image uploaded successfully!', 'success');
        } catch (uploadError) {
          console.error('ImgBB upload failed:', uploadError);
          showToast('Image upload failed. Saving venue without image...', 'info');
        }
      } else if (imageFile && !imgbbApiKey) {
        showToast('Image upload not configured. Saving venue without image...', 'info');
      }
      
      if (imageDeleted) {
        imageUrl = '';
      }

      if (editingVenue) {
        // This line correctly uses the imported 'doc' function and was not a problem
        await updateDoc(doc(db, 'venues', editingVenue.id), {
          ...formData,
          image_url: imageUrl,
          updated_at: new Date().toISOString(),
        });
        showToast('Venue updated successfully', 'success');
      } else {
        await addDoc(collection(db, 'venues'), {
          ...formData,
          image_url: imageUrl,
          availability: {},
          created_at: new Date().toISOString(),
        });
        showToast('Venue added successfully', 'success');
      }
      setIsModalOpen(false);
      setEditingVenue(null);
      setImageFile(null);
      setImagePreview(null);
      setImageDeleted(false);
      setUploadProgress(0);
    } catch (error) {
      console.error('Error saving venue:', error);
      showToast('Failed to save venue', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
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

  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'light' ? 'bg-white' : 'bg-black'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto"></div>
          <p className={`mt-4 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-12 relative overflow-hidden ${
      theme === 'light' ? 'bg-white' : 'bg-black'
    }`}>
      <Noise
        patternAlpha={theme === 'light' ? 10 : 5}
        patternRefreshInterval={4}
        tint={theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(139, 92, 246, 0.1)'}
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className={`text-4xl font-bold mb-2 ${
              theme === 'light' ? 'text-[#1e293b]' : 'text-violet-400'
            }`}>
              Venue Management
            </h1>
            <p className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
              Add, edit, and manage venues
            </p>
          </div>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={async () => {
                const today = format(new Date(), 'yyyy-MM-dd');
                const todayDate = new Date(today);
                todayDate.setHours(0, 0, 0, 0);
                
                let updatedCount = 0;
                
                for (const venue of venues) {
                  const availability = venue.availability || {};
                  const cleanedAvailability: { [date: string]: string[] } = {};
                  
                  Object.keys(availability).forEach((dateKey) => {
                    try {
                      const bookingDate = new Date(dateKey);
                      bookingDate.setHours(0, 0, 0, 0);
                      if (bookingDate >= todayDate) {
                        cleanedAvailability[dateKey] = availability[dateKey];
                      }
                    } catch (e) {
                      if (dateKey >= today) {
                        cleanedAvailability[dateKey] = availability[dateKey];
                      }
                    }
                  });
                  
                  let newStatus = venue.status;
                  if (Object.keys(cleanedAvailability).length === 0 && venue.status === 'booked') {
                    newStatus = 'available';
                  }
                  
                  if (Object.keys(availability).length !== Object.keys(cleanedAvailability).length || newStatus !== venue.status) {
                    try {
                      // This line correctly uses the imported 'doc' function and was not a problem
                      await updateDoc(doc(db, 'venues', venue.id), {
                        availability: cleanedAvailability,
                        status: newStatus,
                        updated_at: new Date().toISOString(),
                      });
                      updatedCount++;
                      console.log(`✅ Refreshed venue: ${venue.name}`);
                    } catch (error) {
                      console.error(`Error refreshing venue ${venue.name}:`, error);
                    }
                  }
                }
                
                if (updatedCount > 0) {
                  showToast(`Refreshed ${updatedCount} venue(s) - expired bookings removed`, 'success');
                } else {
                  showToast('All venues are up to date', 'info');
                }
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                theme === 'light'
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-green-600 text-white hover:bg-green-700 glow-dark'
              }`}
            >
              <FiCheckCircle />
              <span>Refresh Status</span>
            </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
              onClick={handleAddVenue}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              theme === 'light'
                  ? 'bg-violet-500 text-white hover:bg-violet-600'
                  : 'bg-violet-600 text-white hover:bg-violet-700 glow-dark'
              }`}
          >
              <FiPlus />
            <span>Add Venue</span>
          </motion.button>
          </div>
        </motion.div>

        {venues.length === 0 ? (
          <div className={`text-center py-12 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
            No venues found. Add your first venue!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue, index) => (
              <motion.div
                key={venue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className={`p-6 rounded-xl backdrop-blur-xl border ${
                  theme === 'light'
                    ? 'glass-light border-violet-200 hover:shadow-lg'
                    : 'glass-dark border-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30'
                }`}
              >
                {venue.image_url && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img
                      src={venue.image_url}
                      alt={venue.name}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
                <div className="flex items-start justify-between mb-4">
                  <h3 className={`text-xl font-semibold ${
                    theme === 'light' ? 'text-[#1e293b]' : 'text-[#f8fafc]'
                    }`}>
                      {venue.name}
                    </h3>
                  {getStatusIcon(venue.status)}
                </div>

                <div className="space-y-2 mb-4">
                  <div className={`flex items-center space-x-2 text-sm ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                    <FiUsers />
                    <span>Capacity: {venue.capacity}</span>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full inline-block capitalize ${
                    venue.status === 'available'
                      ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                      : venue.status === 'booked'
                      ? 'bg-red-500/2Examples0 text-red-600 dark:text-red-400'
                      : 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {venue.status}
                  </div>
                </div>

                {venue.description && (
                  <p className={`text-sm mb-4 ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {venue.description}
                  </p>
                )}

                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEditVenue(venue)}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      theme === 'light'
                        ? 'bg-violet-50 text-violet-600 hover:bg-violet-100'
                        : 'bg-violet-500/20 text-violet-400 hover:bg-violet-500/30'
                    }`}
                  >
                    <FiEdit2 />
                    <span>Edit</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteVenue(venue.id)}
                    className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      theme === 'light'
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    }`}
                  >
                    <FiTrash2 />
                  </motion.button>
                </div>
              </motion.div>
            ))}
        </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`relative w-full max-w-md p-6 rounded-2xl backdrop-blur-xl border ${
                theme === 'light'
                  ? 'glass-light border-violet-200'
                  : 'glass-dark border-violet-500/20'
              }`}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                  theme === 'light'
                    ? 'text-gray-600 hover:bg-gray-100'
                    : 'text-gray-400 hover:bg-gray-800'
                }`}
            >
                <FiX className="w-5 h-5" />
              </button>

              <h2 className={`text-2xl font-bold mb-4 ${
                theme === 'light' ? 'text-[#1e293b]' : 'text-violet-400'
              }`}>
                {editingVenue ? 'Edit Venue' : 'Add Venue'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Image Upload */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    Venue Image {!imgbbApiKey && <span className="text-xs text-yellow-600 dark:text-yellow-400">(API key not configured)</span>}
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
                      theme === 'light'
                        ? 'border-gray-300 hover:border-violet-400 hover:bg-violet-50'
                        : 'border-gray-700 hover:border-violet-500 hover:bg-violet-500/10'
                    } ${!imgbbApiKey ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      disabled={!imgbbApiKey}
                      className="hidden"
                    />
                    <div className="text-center">
                      {imagePreview ? (
                        <div className="space-y-3">
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-32 object-cover rounded-lg mx-auto"
                            />
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current?.click();
                              }}
                              disabled={!imgbbApiKey}
                              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                !imgbbApiKey
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : theme === 'light'
                                  ? 'bg-violet-100 text-violet-700 hover:bg-violet-200'
                                  : 'bg-violet-500/20 text-violet-400 hover:bg-violet-500/30'
                              }`}
                            >
                              <FiEdit2 className="w-3 h-3" />
                              <span>Edit</span>
                            </motion.button>
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteImage();
                              }}
                              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                theme === 'light'
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                  : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                              }`}
                            >
                              <FiTrash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </motion.button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <FiUpload className={`w-8 h-8 mx-auto mb-2 ${
                            theme === 'light' ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                          <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                            {imgbbApiKey ? (
                              <>Drag & drop an image here, or <span className="font-medium text-violet-500">browse</span></>
                            ) : (
                              'Configure ImgBB API key to enable image upload'
                            )}
                          </p>
                        </>
                      )}
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                          <div
                            className="bg-violet-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    Venue Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'light'
                        ? 'bg-white/50 border-gray-300 text-gray-900'
                        : 'bg-gray-800/50 border-gray-700 text-gray-200'
                    } focus:outline-none focus:ring-2 focus:ring-violet-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    Capacity
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    required
                    min="1"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'light'
                        ? 'bg-white/50 border-gray-300 text-gray-900'
                        : 'bg-gray-800/50 border-gray-700 text-gray-200'
                    } focus:outline-none focus:ring-2 focus:ring-violet-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'light'
                        ? 'bg-white/50 border-gray-300 text-gray-900'
                        : 'bg-gray-800/50 border-gray-700 text-gray-200'
                    } focus:outline-none focus:ring-2 focus:ring-violet-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'light'
                        ? 'bg-white/50 border-gray-300 text-gray-900'
                        : 'bg-gray-800/50 border-gray-700 text-gray-200'
                    } focus:outline-none focus:ring-2 focus:ring-violet-500`}
                  >
                    <option value="available">Available</option>
                    <option value="booked">Booked</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div className="flex space-x-4 pt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsModalOpen(false)}
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
                    disabled={isUploading}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                      isUploading
                        ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                        : theme === 'light'
                        ? 'bg-violet-500 text-white hover:bg-violet-600'
                        : 'bg-violet-600 text-white hover:bg-violet-700 glow-dark'
                    }`}
                  >
                    {isUploading ? 'Uploading...' : editingVenue ? 'Update' : 'Add'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
// --- End Fix ---
}