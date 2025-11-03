'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import { FiUser, FiShield, FiStar } from 'react-icons/fi';

export default function SessionInfo() {
  const { user, userRole } = useAuth();
  const { theme } = useTheme();

  if (!user || !userRole) return null;

  const getRoleInfo = () => {
    switch (userRole) {
      case 'superadmin':
        return {
          icon: FiStar,
          label: 'Super Admin',
          color: theme === 'light' ? 'text-purple-600' : 'text-purple-400',
          bg: theme === 'light' ? 'bg-purple-50 border-purple-200' : 'bg-purple-900/30 border-purple-500/50',
        };
      case 'admin':
        return {
          icon: FiShield,
          label: 'Admin',
          color: theme === 'light' ? 'text-blue-600' : 'text-blue-400',
          bg: theme === 'light' ? 'bg-blue-50 border-blue-200' : 'bg-blue-900/30 border-blue-500/50',
        };
      default:
        return {
          icon: FiUser,
          label: 'User',
          color: theme === 'light' ? 'text-gray-600' : 'text-gray-400',
          bg: theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-gray-800/50 border-gray-700',
        };
    }
  };

  const roleInfo = getRoleInfo();
  const Icon = roleInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`px-3 py-2 rounded-lg border flex items-center space-x-2 ${roleInfo.bg}`}
    >
      <Icon className={`w-4 h-4 ${roleInfo.color}`} />
      <span className={`text-xs font-medium ${roleInfo.color}`}>
        {roleInfo.label}
      </span>
    </motion.div>
  );
}

