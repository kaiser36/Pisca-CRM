"use client";

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserProfile } from '@/types/crm'; // Import UserProfile

interface SessionContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null; // Add profile to context
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>; // Add refreshProfile
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error fetching user profile:', error);
      return null;
    }
    return data as UserProfile;
  };

  const refreshProfile = async () => {
    if (user) {
      const userProfile = await fetchUserProfile(user.id);
      setProfile(userProfile);
    } else {
      setProfile(null);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('Auth state changed:', event, currentSession);
      setSession(currentSession);
      setUser(currentSession?.user || null);

      if (currentSession?.user) {
        const userProfile = await fetchUserProfile(currentSession.user.id);
        setProfile(userProfile);
        if (location.pathname === '/login') {
          navigate('/'); // Redirect to home if logged in and on login page
        }
      } else {
        setProfile(null);
        // Redirect to login if not authenticated and trying to access a protected route
        const protectedRoutes = ['/', '/crm', '/company-additional-data', '/settings', '/accounts', '/am-view', '/products', '/campaigns', '/pisca-console'];
        if (protectedRoutes.some(route => location.pathname.startsWith(route))) {
          navigate('/login');
        }
      }
      setIsLoading(false);
    });

    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      console.log('Initial session check:', initialSession);
      setSession(initialSession);
      setUser(initialSession?.user || null);

      if (initialSession?.user) {
        const userProfile = await fetchUserProfile(initialSession.user.id);
        setProfile(userProfile);
        if (location.pathname === '/login') {
          navigate('/');
        }
      } else {
        const protectedRoutes = ['/', '/crm', '/company-additional-data', '/settings', '/accounts', '/am-view', '/products', '/campaigns', '/pisca-console'];
        if (protectedRoutes.some(route => location.pathname.startsWith(route))) {
          navigate('/login');
        }
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  const signOut = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
      setSession(null);
      setUser(null);
      setProfile(null);
      navigate('/login');
    }
    setIsLoading(false);
  };

  return (
    <SessionContext.Provider value={{ session, user, profile, isLoading, signOut, refreshProfile }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionContextProvider');
  }
  return context;
};