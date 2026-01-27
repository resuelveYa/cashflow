import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  User,
  LoginCredentials,
  RegisterData,
  UpdateProfileData,
  UpdateMetaData,
  UpdateAddressData,
  mapSupabaseUserToLocal
} from '../types/user';
import { ENV } from '../config/env';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Authentication methods
  login: (email: string, password: string) => Promise<boolean>;
  loginWithCredentials: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;

  // Profile management
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  updateMeta: (data: UpdateMetaData) => Promise<void>;
  updateAddress: (data: UpdateAddressData) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  refreshUser: () => Promise<void>;

  // Utility methods
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setUser(session?.user ? mapSupabaseUserToLocal(session.user) : null);
      setIsLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ? mapSupabaseUserToLocal(session.user) : null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const clearError = () => setError(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const loginWithCredentials = async (credentials: LoginCredentials): Promise<void> => {
    const success = await login(credentials.email, credentials.password);
    if (!success) throw new Error(error || 'Login failed');
  };

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      setError(null);
      const { error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.name,
            first_name: userData.firstName,
            last_name: userData.lastName,
          }
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      window.location.href = ENV.URLS.LANDING;
    } catch (err) {
      console.error('Logout error:', err);
      setError('Error al cerrar sesión');
    }
  };

  const updateProfile = async (data: UpdateProfileData): Promise<void> => {
    try {
      setError(null);
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: data.name,
          position: data.position,
          location: data.location,
          address: data.address,
        }
      });
      if (error) throw error;
      await refreshUser();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateMeta = async (data: UpdateMetaData): Promise<void> => {
    try {
      setError(null);
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: data.name,
          position: data.position,
          location: data.location,
        }
      });
      if (error) throw error;
      await refreshUser();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateAddress = async (data: UpdateAddressData): Promise<void> => {
    try {
      setError(null);
      const { error } = await supabase.auth.updateUser({
        data: {
          address: data.address,
          country: data.country,
          city: data.city,
          postal_code: data.postal_code,
        }
      });
      if (error) throw error;
      await refreshUser();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const uploadAvatar = async (file: File): Promise<void> => {
    // This would normally upload to Supabase Storage, then update metadata
    // For now, let's keep it simple as a reminder that this needs backend storage
    console.warn('uploadAvatar needs Supabase Storage configuration');
  };

  const refreshUser = async (): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user ? mapSupabaseUserToLocal(user) : null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    loginWithCredentials,
    register,
    logout,
    updateProfile,
    updateMeta,
    updateAddress,
    uploadAvatar,
    refreshUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;