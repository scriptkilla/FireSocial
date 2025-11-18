
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile } from '../types';
import { ALL_USERS_DATA_BASE, INITIAL_CREATOR_MONETIZATION } from '../data';

interface AuthContextType {
  user: Profile | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for persisted session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('firesocial_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('firesocial_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        // Simulate checking against "Database" (ALL_USERS_DATA + LocalStorage for new signups)
        const predefinedUser = ALL_USERS_DATA_BASE.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (predefinedUser) {
            // Allow any password for demo purposes on predefined users, or check specific mock passwords
            if (password === 'password' || password.length > 3) {
                setUser(predefinedUser);
                localStorage.setItem('firesocial_user', JSON.stringify(predefinedUser));
                resolve();
            } else {
                reject(new Error('Invalid password'));
            }
        } else {
             // Check locally stored users (from previous signups in this session)
             const localUsersStr = localStorage.getItem('firesocial_local_users');
             const localUsers: any[] = localUsersStr ? JSON.parse(localUsersStr) : [];
             const localUser = localUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

             if (localUser && localUser.password === password) {
                 const profile = localUser.profile;
                 setUser(profile);
                 localStorage.setItem('firesocial_user', JSON.stringify(profile));
                 resolve();
             } else {
                 reject(new Error('User not found or invalid credentials'));
             }
        }
      }, 1000);
    });
  };

  const signup = async (name: string, email: string, password: string) => {
      return new Promise<void>((resolve, reject) => {
          setTimeout(() => {
              // Check if exists
              if (ALL_USERS_DATA_BASE.some(u => u.email.toLowerCase() === email.toLowerCase())) {
                  reject(new Error('Email already in use'));
                  return;
              }

              const newProfile: Profile = {
                  id: Date.now(),
                  name: name,
                  username: `@${name.replace(/\s+/g, '').toLowerCase()}`,
                  email: email,
                  bio: 'New to FireSocial! 🔥',
                  avatar: '👋',
                  followers: 0,
                  following: 0,
                  posts: 0,
                  badges: [],
                  streak: 0,
                  online: true,
                  verified: false,
                  privacySettings: { profilePublic: true, showOnlineStatus: true, allowTagging: true, showActivity: true, privateAccount: false, suggestAccount: true, activityStatus: true },
                  notificationSettings: { push: true, email: true },
                  contentPreferences: { favoriteTopics: [], hiddenWords: [], sensitiveContent: 'blur' },
                  language: 'en-US',
                  twoFactorEnabled: false,
                  mutedAccounts: [],
                  restrictedAccounts: [],
                  blockedAccounts: [],
                  unlockedAchievements: ['first_post'], // Grant one for joining
                  isCreator: false
              };

              // Save to "Local DB"
              const localUsersStr = localStorage.getItem('firesocial_local_users');
              const localUsers = localUsersStr ? JSON.parse(localUsersStr) : [];
              localUsers.push({ email, password, profile: newProfile });
              localStorage.setItem('firesocial_local_users', JSON.stringify(localUsers));

              setUser(newProfile);
              localStorage.setItem('firesocial_user', JSON.stringify(newProfile));
              resolve();
          }, 1500);
      });
  };

  const loginWithGoogle = async () => {
      return new Promise<void>((resolve) => {
          setTimeout(() => {
              // Mock Google User
              const googleUser: Profile = {
                  id: 99999,
                  name: 'Google User',
                  username: '@google_user',
                  email: 'user@gmail.com',
                  bio: 'Signed in via Google',
                  avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c', // Generic google placeholder or similar
                  followers: 10,
                  following: 5,
                  posts: 0,
                  badges: ['🔥'],
                  streak: 1,
                  online: true,
                  verified: true,
                  privacySettings: { profilePublic: true, showOnlineStatus: true, allowTagging: true, showActivity: true, privateAccount: false, suggestAccount: true, activityStatus: true },
                  notificationSettings: { push: true, email: true },
                  contentPreferences: { favoriteTopics: [], hiddenWords: [], sensitiveContent: 'blur' },
                  language: 'en-US',
                  twoFactorEnabled: false,
                  mutedAccounts: [],
                  restrictedAccounts: [],
                  blockedAccounts: [],
                  unlockedAchievements: [],
                  isCreator: false
              };
              setUser(googleUser);
              localStorage.setItem('firesocial_user', JSON.stringify(googleUser));
              resolve();
          }, 1500);
      });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('firesocial_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, loginWithGoogle, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
