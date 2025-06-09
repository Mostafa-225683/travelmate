import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';

type User = {
  id: string;
  email: string;
  name?: string | null;
  email_confirmed?: boolean;
} | null;

type AuthContextType = {
  user: User;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isEmailVerified: boolean;
  loadingInitial: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const updateUserFromSession = (session: any) => {
    if (session?.user) {
      const { id, email, user_metadata, email_confirmed_at } = session.user;
      const name = user_metadata?.name ?? null;
      setUser({ id, email, name, email_confirmed: !!email_confirmed_at });
      setIsEmailVerified(!!email_confirmed_at);
    } else {
      setUser(null);
      setIsEmailVerified(false);
    }
  };

  useEffect(() => {
    const initializeSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Session load error:', error.message);
      } else {
        updateUserFromSession(data.session);
      }
      setLoadingInitial(false);
    };
  
    initializeSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      updateUserFromSession(session);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      updateUserFromSession(data.session);
    } catch (err: any) {
      console.error('Login error:', err.message);
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });
      if (error) throw error;
      updateUserFromSession(data.session);
    } catch (err: any) {
      console.error('Register error:', err.message);
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('Google login error:', err.message);
      setError(err.message || 'Google login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsEmailVerified(false);
    } catch (err: any) {
      console.error('Logout error:', err.message);
      setError(err.message || 'Logout failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loginWithGoogle,
        isLoading,
        error,
        isEmailVerified,
        loadingInitial,
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
