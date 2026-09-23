import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, role: UserRole, name?: string) => Promise<boolean>;
  signup: (name: string, email: string, role: UserRole, organization?: string) => Promise<boolean>;
  loginWithGoogle: (role?: UserRole) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial default demo accounts
const DEFAULT_USER: User = {
  id: 'usr_demo_01',
  name: 'Ananya Sharma',
  email: 'ananya@example.com',
  role: 'user',
  createdAt: '2026-03-12',
  avatar: 'AS',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('docusentry_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_USER;
      }
    }
    return DEFAULT_USER; // Default logged in as user for effortless preview
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('docusentry_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('docusentry_user');
    }
  }, [user]);

  const login = async (email: string, role: UserRole, name?: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate realistic async network verification
    await new Promise(r => setTimeout(r, 450));

    const derivedName = name || (email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1));
    const newUser: User = {
      id: `${role === 'admin' ? 'adm' : 'usr'}_${Math.random().toString(36).substr(2, 7)}`,
      name: derivedName,
      email: email,
      role: role,
      organization: role === 'admin' ? 'SecureID Enterprise Compliance' : undefined,
      createdAt: new Date().toISOString().split('T')[0],
      avatar: derivedName.substring(0, 2).toUpperCase(),
    };

    setUser(newUser);
    setIsLoading(false);
    return true;
  };

  const signup = async (name: string, email: string, role: UserRole, organization?: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 550));

    const newUser: User = {
      id: `${role === 'admin' ? 'adm' : 'usr'}_${Math.random().toString(36).substr(2, 7)}`,
      name: name,
      email: email,
      role: role,
      organization: organization,
      createdAt: new Date().toISOString().split('T')[0],
      avatar: name.substring(0, 2).toUpperCase(),
    };

    setUser(newUser);
    setIsLoading(false);
    return true;
  };

  const loginWithGoogle = async (role: UserRole = 'user'): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600));

    // Simulated Google OAuth profile
    const googleUser: User = {
      id: `goog_${Math.random().toString(36).substr(2, 8)}`,
      name: 'Jasmeet Kaur',
      email: 'jasmeetkaurdigwa@gmail.com',
      role: role,
      organization: role === 'admin' ? 'Security & Identity Audits' : undefined,
      createdAt: new Date().toISOString().split('T')[0],
      avatar: 'JK',
    };

    setUser(googleUser);
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updatedData: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updatedData };
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        loginWithGoogle,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
