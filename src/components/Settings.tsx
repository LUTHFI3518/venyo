'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotification } from '@/hooks/useNotification';
import { FiVolume2, FiVolumeX } from 'react-icons/fi';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Settings({ isOpen, onClose }: SettingsProps) {
  const { theme } = useTheme();
  const { voiceEnabled, setVoiceEnabled } = useNotification();

  return (
    <AnimatePresence>
      {isOpen && (
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
            className={`relative w-full max-w-md p-6 rounded-2xl backdrop-blur-xl border ${
              theme === 'light'
                ? 'glass-light border-sky-200'
                : 'glass-dark border-blue-500/20'
            }`}
          >
            <h2 className={`text-2xl font-bold mb-6 ${
              theme === 'light' ? 'text-[#1e293b]' : 'text-[#f8fafc]'
            }`}>
              Settings
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {voiceEnabled ? (
                    <FiVolume2 className={`w-5 h-5 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`} />
                  ) : (
                    <FiVolumeX className={`w-5 h-5 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`} />
                  )}
                  <div>
                    <p className={`font-medium ${theme === 'light' ? 'text-gray-900' : 'text-gray-100'}`}>
                      Voice Alerts
                    </p>
                    <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                      Enable voice notifications for booking updates
                    </p>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    voiceEnabled
                      ? theme === 'light'
                        ? 'bg-sky-500'
                        : 'bg-blue-600'
                      : theme === 'light'
                      ? 'bg-gray-300'
                      : 'bg-gray-700'
                  }`}
                >
                  <motion.div
                    className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
                    animate={{ x: voiceEnabled ? 24 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </motion.button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className={`w-full mt-6 py-3 px-4 rounded-lg font-medium transition-all ${
                theme === 'light'
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
            >
              Close
            </motion.button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
