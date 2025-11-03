'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  userRole: 'user' | 'admin' | 'superadmin' | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'user' | 'admin' | 'superadmin' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Store basic user info in session
        if (typeof window !== 'undefined') {
          localStorage.setItem('venyo-user-id', currentUser.uid);
          localStorage.setItem('venyo-user-email', currentUser.email || '');
        }
        
        // Fetch user role from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
            const role = userDoc.data().role || 'user';
            setUserRole(role);
            
            // Store role in session
            if (typeof window !== 'undefined') {
              localStorage.setItem('venyo-user-role', role);
            }
        } else {
          // Create user document if it doesn't exist
            await setDoc(doc(db, 'users', currentUser.uid), {
              email: currentUser.email,
              role: 'user',
              createdAt: new Date().toISOString(),
            });
            setUserRole('user');
            
            // Store role in session
            if (typeof window !== 'undefined') {
              localStorage.setItem('venyo-user-role', 'user');
            }
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          // Default to 'user' if there's an error
          setUserRole('user');
          if (typeof window !== 'undefined') {
            localStorage.setItem('venyo-user-role', 'user');
          }
        }
      } else {
        setUser(null);
        setUserRole(null);
        // Clear session
        if (typeof window !== 'undefined') {
          localStorage.removeItem('venyo-user-role');
          localStorage.removeItem('venyo-user-id');
          localStorage.removeItem('venyo-user-email');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          role: 'user',
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
      await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (email: string, password: string) => {
      const result = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', result.user.uid), {
      email: result.user.email,
      role: 'user',
      createdAt: new Date().toISOString(),
    });
  };

  const signOut = async () => {
      await firebaseSignOut(auth);
    // Clear session storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('venyo-user-role');
      localStorage.removeItem('venyo-user-id');
      localStorage.removeItem('venyo-user-email');
    }
  };

  return (
    <AuthContext.Provider
      value={{
      user, 
        userRole,
      loading, 
      signInWithGoogle, 
      signInWithEmail, 
      signUpWithEmail, 
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
