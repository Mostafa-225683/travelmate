import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const saveHotel = async (hotelId: string | number) => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
  
    if (!user) return { error: userError?.message || "User not logged in" };
  
    const { error } = await supabase
      .from("saved_hotels")
      .insert([{ user_id: user.id, hotel_id: hotelId }]);
  
    return { error };
  };
  
  export const unsaveHotel = async (hotelId: string | number) => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
  
    if (!user) return { error: userError?.message || "User not logged in" };
  
    const { error } = await supabase
      .from("saved_hotels")
      .delete()
      .eq("user_id", user.id)
      .eq("hotel_id", hotelId);
  
    return { error };
  };
  
  export const isHotelSaved = async (hotelId: string | number) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
  
    if (!user) return false;
  
    const { data } = await supabase
      .from("saved_hotels")
      .select("id")
      .eq("user_id", user.id)
      .eq("hotel_id", hotelId)
      .maybeSingle();
  
    return Boolean(data);
  };
  
export const supabase = createClient(supabaseUrl, supabaseAnonKey);