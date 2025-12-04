"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface Profile {
  username: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signInWithOAuth: (provider: 'google') => Promise<void>;
  signInWithEmail: (emailOrUsername: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const supabase = useMemo(() => createClient(), []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', user.id)
          .maybeSingle();

        setProfile(data || null);
      } catch (error) {
        setProfile(null);
      }
    }
  }, [user?.id, supabase]);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async (userId: string) => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', userId)
          .maybeSingle();

        if (mounted) {
          setProfile(data || null);
        }
      } catch (error) {
        if (mounted) {
          setProfile(null);
        }
      }
    };

    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setLoading(false);
          
          if (currentSession?.user) {
            loadProfile(currentSession.user.id);
          }
        }
      } catch (error) {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: Session | null) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          loadProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signInWithOAuth = async (provider: 'google') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  const signInWithEmail = async (emailOrUsername: string, password: string) => {
    let email = emailOrUsername;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailOrUsername)) {
      const { data, error } = await supabase.rpc('get_email_by_username', { username_input: emailOrUsername });
      
      if (error || !data) {
        throw new Error('Invalid username or password');
      }
      
      email = data;
    }
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
  };

  const signUpWithEmail = async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          username: username,
        },
      },
    });
    
    if (error) throw error;
    
    if (data.session) {
      setUser(data.user);
      setSession(data.session);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signInWithOAuth,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
