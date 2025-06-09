import { supabase } from './supabaseClient';

export interface FeedbackData {
  hotel_id: number | string;
  booking_id?: string;
  rating: number;
  comment?: string;
}

export interface Feedback extends FeedbackData {
  id: string;
  user_id: string;
  hotel_name?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Submit feedback for a hotel booking
 */
export const submitFeedback = async (feedbackData: FeedbackData): Promise<{ success: boolean; error?: string; feedback_id?: string }> => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { success: false, error: 'You must be logged in to submit feedback.' };
    }
    
    // Add user_id to feedback data
    const feedbackWithUser = {
      ...feedbackData,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Insert feedback into Supabase
    const { data, error } = await supabase
      .from('feedback')
      .insert(feedbackWithUser)
      .select('id')
      .single();
    
    if (error) {
      console.error('Feedback submission error:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, feedback_id: data.id };
  } catch (err: any) {
    console.error('Unexpected feedback error:', err);
    return { success: false, error: err.message || 'An unexpected error occurred' };
  }
};

/**
 * Get all feedback for a user
 */
export const getUserFeedback = async (): Promise<{ feedback: Feedback[]; error?: string }> => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { feedback: [], error: 'You must be logged in to view feedback.' };
    }
    
    // Get user's feedback with hotel information
    const { data, error } = await supabase
      .from('feedback')
      .select(`
        *,
        bookings(hotel_name)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Get feedback error:', error);
      return { feedback: [], error: error.message };
    }
    
    // Transform the data to include hotel_name from the booking
    const transformedFeedback = data.map((item: any) => ({
      ...item,
      hotel_name: item.bookings?.hotel_name || 'Unknown Hotel',
      bookings: undefined // Remove the nested bookings object
    }));
    
    return { feedback: transformedFeedback || [] };
  } catch (err: any) {
    console.error('Unexpected get feedback error:', err);
    return { feedback: [], error: err.message || 'An unexpected error occurred' };
  }
};

/**
 * Check if a user has already submitted feedback for a booking
 */
export const hasFeedbackForBooking = async (bookingId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;
    
    const { data, error } = await supabase
      .from('feedback')
      .select('id')
      .eq('user_id', user.id)
      .eq('booking_id', bookingId)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking feedback:', error);
      return false;
    }
    
    return !!data;
  } catch (err) {
    console.error('Error checking feedback:', err);
    return false;
  }
};