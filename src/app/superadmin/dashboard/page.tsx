'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/navigation';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FiUsers, FiShield, FiSettings } from 'react-icons/fi';
import Link from 'next/link';

export default function SuperAdminDashboard() {
  const { user, userRole, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  
  interface User {
    id: string;
    email: string;
    role?: 'user' | 'admin' | 'superadmin';
    [key: string]: unknown;
  }

  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!authLoading && (!user || userRole !== 'superadmin')) {
      router.push('/auth');
    }
  }, [user, userRole, authLoading, router]);

  useEffect(() => {
    if (!user || userRole !== 'superadmin') return;

    const usersRef = collection(db, 'users');
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const usersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        email: doc.data().email || '',
        role: doc.data().role || 'user',
        ...doc.data(),
      })) as User[];
      setUsers(usersData);
    });

    return () => unsubscribe();
  }, [user, userRole]);

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin' | 'superadmin') => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
      });
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role. Please try again.');
    }
  };

  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'light' ? 'bg-gradient-to-br from-sky-50 to-white' : 'bg-gradient-dark'
      }`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-8 ${
      theme === 'light' ? 'bg-gradient-to-br from-sky-50 to-white' : 'bg-gradient-dark'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className={`text-3xl font-bold mb-2 ${
            theme === 'light' ? 'text-slate-800' : 'text-slate-100'
          }`}>
            Super Admin Dashboard
          </h1>
          <p className={`${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
            Manage users and system settings
          </p>
        </motion.div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/dashboard">
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className={`p-6 rounded-2xl backdrop-blur-xl cursor-pointer ${
                theme === 'light' ? 'glass-light' : 'glass-dark'
              }`}
            >
              <FiSettings className={`w-8 h-8 mb-4 ${
                theme === 'light' ? 'text-sky-500' : 'text-blue-400'
              }`} />
              <h3 className={`text-xl font-semibold mb-2 ${
                theme === 'light' ? 'text-slate-800' : 'text-slate-100'
              }`}>
                Admin Dashboard
              </h3>
              <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                Manage venues and bookings
              </p>
            </motion.div>
          </Link>

          <Link href="/admin/venues">
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className={`p-6 rounded-2xl backdrop-blur-xl cursor-pointer ${
                theme === 'light' ? 'glass-light' : 'glass-dark'
              }`}
            >
              <FiSettings className={`w-8 h-8 mb-4 ${
                theme === 'light' ? 'text-sky-500' : 'text-blue-400'
              }`} />
              <h3 className={`text-xl font-semibold mb-2 ${
                theme === 'light' ? 'text-slate-800' : 'text-slate-100'
              }`}>
                Venue Management
              </h3>
              <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                Add or edit venues
              </p>
            </motion.div>
          </Link>

          <Link href="/admin/approvals">
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className={`p-6 rounded-2xl backdrop-blur-xl cursor-pointer ${
                theme === 'light' ? 'glass-light' : 'glass-dark'
              }`}
            >
              <FiShield className={`w-8 h-8 mb-4 ${
                theme === 'light' ? 'text-sky-500' : 'text-blue-400'
              }`} />
              <h3 className={`text-xl font-semibold mb-2 ${
                theme === 'light' ? 'text-slate-800' : 'text-slate-100'
              }`}>
                Approvals
              </h3>
              <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                Review booking requests
              </p>
            </motion.div>
          </Link>
        </div>

        {/* Users Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-2xl backdrop-blur-xl ${
            theme === 'light' ? 'glass-light' : 'glass-dark'
          }`}
        >
          <h2 className={`text-2xl font-bold mb-6 ${
            theme === 'light' ? 'text-slate-800' : 'text-slate-100'
          }`}>
            <FiUsers className="inline mr-2" />
            User Management
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${
                  theme === 'light' ? 'border-slate-200 bg-slate-50/50' : 'border-slate-700 bg-slate-800/50'
                }`}>
                  <th className={`px-6 py-4 text-left font-semibold ${
                    theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                  }`}>
                    Email
                  </th>
                  <th className={`px-6 py-4 text-left font-semibold ${
                    theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                  }`}>
                    Role
                  </th>
                  <th className={`px-6 py-4 text-left font-semibold ${
                    theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((userItem, index) => (
                  <motion.tr
                    key={userItem.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border-b ${
                      theme === 'light' ? 'border-slate-200' : 'border-slate-700'
                    } hover:bg-opacity-50 ${
                      theme === 'light' ? 'hover:bg-sky-50' : 'hover:bg-blue-900/20'
                    } transition-colors`}
                  >
                    <td className="px-6 py-4">
                      <span className={`font-medium ${
                        theme === 'light' ? 'text-slate-800' : 'text-slate-100'
                      }`}>
                        {userItem.email}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        userItem.role === 'superadmin'
                          ? theme === 'light'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-purple-900/50 text-purple-300'
                          : userItem.role === 'admin'
                          ? theme === 'light'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-blue-900/50 text-blue-300'
                          : theme === 'light'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-green-900/50 text-green-300'
                      }`}>
                        {userItem.role || 'user'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={userItem.role || 'user'}
                        onChange={(e) => handleRoleChange(userItem.id, e.target.value as 'user' | 'admin' | 'superadmin')}
                        className={`px-3 py-2 rounded-lg ${
                          theme === 'light'
                            ? 'bg-white/50 border border-slate-200 text-slate-800'
                            : 'bg-slate-800/50 border border-slate-700 text-slate-100'
                        } focus:outline-none focus:ring-2 ${
                          theme === 'light' ? 'focus:ring-sky-500' : 'focus:ring-blue-500'
                        }`}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="superadmin">Super Admin</option>
                      </select>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

