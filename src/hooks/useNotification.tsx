'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface NotificationContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  speak: (text: string) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('venyo-voice-enabled');
      if (stored !== null) {
        setVoiceEnabled(stored === 'true');
      }
      
      // Get theme from localStorage or system preference
      const themeStored = localStorage.getItem('venyo-theme');
      if (themeStored) {
        setTheme(themeStored === 'light' ? 'light' : 'dark');
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

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const speak = (text: string) => {
    if (!voiceEnabled || typeof window === 'undefined') return;

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSetVoiceEnabled = (enabled: boolean) => {
    setVoiceEnabled(enabled);
    localStorage.setItem('venyo-voice-enabled', enabled.toString());
  };

  return (
    <NotificationContext.Provider
      value={{
        showToast,
        speak,
        voiceEnabled,
        setVoiceEnabled: handleSetVoiceEnabled,
      }}
    >
      {children}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={`p-4 rounded-lg shadow-lg backdrop-blur-xl border max-w-sm ${
                toast.type === 'success'
                  ? theme === 'light'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-green-900/30 border-green-500/50 text-green-300'
                  : toast.type === 'error'
                  ? theme === 'light'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-red-900/30 border-red-500/50 text-red-300'
                  : theme === 'light'
                  ? 'bg-blue-50 border-blue-200 text-blue-800'
                  : 'bg-blue-900/30 border-blue-500/50 text-blue-300'
              }`}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

