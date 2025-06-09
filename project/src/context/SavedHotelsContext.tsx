import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

type SavedHotelsContextType = {
  savedCount: number;
  refreshSavedCount: () => Promise<void>;
};

const SavedHotelsContext = createContext<SavedHotelsContextType | undefined>(undefined);

export function SavedHotelsProvider({ children }: { children: ReactNode }) {
  const [savedCount, setSavedCount] = useState(0);
  const { user } = useAuth();

  const fetchSavedCount = async () => {
    if (!user) {
      setSavedCount(0);
      return;
    }

    const { count, error } = await supabase
      .from("saved_hotels")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (!error) {
      setSavedCount(count ?? 0);
    }
  };

  // Fetch saved count when user changes
  useEffect(() => {
    fetchSavedCount();
  }, [user]);

  // Function to manually refresh the saved count
  const refreshSavedCount = async () => {
    await fetchSavedCount();
  };

  return (
    <SavedHotelsContext.Provider
      value={{
        savedCount,
        refreshSavedCount,
      }}
    >
      {children}
    </SavedHotelsContext.Provider>
  );
}

export function useSavedHotels() {
  const context = useContext(SavedHotelsContext);
  if (!context) {
    throw new Error('useSavedHotels must be used within a SavedHotelsProvider');
  }
  return context;
}