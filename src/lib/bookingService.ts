import { supabase } from './supabaseClient';

export interface BookingData {
  hotel_id: string | number;
  hotel_name: string;
  check_in: string;
  check_out: string;
  guests: number;
  rooms: number;
  total_price: number;
  user_id?: string;
}

export const createBooking = async (bookingData: BookingData): Promise<{ success: boolean; error?: string; booking_id?: string }> => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { success: false, error: 'You must be logged in to book a hotel.' };
    }
    
    // Add user_id to booking data
    const bookingWithUser = {
      ...bookingData,
      user_id: user.id,
      created_at: new Date().toISOString()
    };
    
    // Insert booking into Supabase
    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingWithUser)
      .select('id')
      .single();
    
    if (error) {
      console.error('Booking error:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, booking_id: data.id };
  } catch (err: any) {
    console.error('Unexpected booking error:', err);
    return { success: false, error: err.message || 'An unexpected error occurred' };
  }
};

export const getUserBookings = async (): Promise<{ bookings: any[]; error?: string }> => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { bookings: [], error: 'You must be logged in to view bookings.' };
    }
    
    // Get user's bookings
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Get bookings error:', error);
      return { bookings: [], error: error.message };
    }
    
    return { bookings: data || [] };
  } catch (err: any) {
    console.error('Unexpected get bookings error:', err);
    return { bookings: [], error: err.message || 'An unexpected error occurred' };
  }
};

export const cancelBooking = async (bookingId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { success: false, error: 'You must be logged in to cancel a booking.' };
    }
    
    // First verify the booking belongs to the user
    const { data: bookingData, error: fetchError } = await supabase
      .from('bookings')
      .select('user_id')
      .eq('id', bookingId)
      .single();
    
    if (fetchError) {
      return { success: false, error: 'Booking not found.' };
    }
    
    if (bookingData.user_id !== user.id) {
      return { success: false, error: 'You do not have permission to cancel this booking.' };
    }
    
    // Delete the booking
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred' };
  }
};