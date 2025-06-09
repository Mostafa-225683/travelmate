import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, AlertCircle, MessageSquare } from 'lucide-react';
import { cancelBooking } from '../lib/bookingService';
import { toast } from 'react-hot-toast';
import FeedbackModal from './FeedbackModal';
import { hasFeedbackForBooking } from '../lib/feedbackService';

interface BookingCardProps {
  id: string;
  hotel_name: string;
  hotel_id: string | number;
  check_in: string;
  check_out: string;
  guests: number;
  rooms: number;
  total_price: number;
  created_at: string;
  onCancelSuccess?: () => void;
}

export default function BookingCard({
  id,
  hotel_name,
  hotel_id,
  check_in,
  check_out,
  guests,
  rooms,
  total_price,
  created_at,
  onCancelSuccess
}: BookingCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [hasFeedback, setHasFeedback] = useState(false);

  // Format dates for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate number of nights
  const calculateNights = () => {
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Check if user has already submitted feedback for this booking
  useEffect(() => {
    const checkFeedback = async () => {
      const hasSubmitted = await hasFeedbackForBooking(id);
      setHasFeedback(hasSubmitted);
    };
    checkFeedback();
  }, [id]);

  const handleCancelBooking = async () => {
    setIsLoading(true);
    try {
      const { success, error } = await cancelBooking(id);
      if (success) {
        toast.success('Booking cancelled successfully');
        setShowConfirmCancel(false);
        if (onCancelSuccess) {
          onCancelSuccess();
        }
      } else {
        toast.error(error || 'Failed to cancel booking');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFeedbackSuccess = () => {
    setHasFeedback(true);
    if (onCancelSuccess) {
      // Reuse the onCancelSuccess callback to refresh the parent component
      onCancelSuccess();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900">{hotel_name}</h3>
          <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            Confirmed
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>
              {formatDate(check_in)} - {formatDate(check_out)}
            </span>
            <span className="text-sm text-gray-500">({calculateNights()} nights)</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="h-4 w-4" />
            <span>
              {guests} {guests === 1 ? 'Guest' : 'Guests'}, {rooms} {rooms === 1 ? 'Room' : 'Rooms'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>Booking ID: {id.substring(0, 8)}</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div>
            <span className="text-sm text-gray-500">Total Price</span>
            <p className="text-xl font-bold text-blue-600">${total_price}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFeedbackModal(true)}
              className={`px-4 py-2 border ${hasFeedback ? 'border-green-300 text-green-600' : 'border-blue-300 text-blue-600'} rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1`}
              disabled={isLoading}
            >
              <MessageSquare className="h-4 w-4" />
              {hasFeedback ? 'Feedback Submitted' : 'Leave Feedback'}
            </button>
            <button
              onClick={() => setShowConfirmCancel(true)}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Cancel Booking'}
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          hotelId={hotel_id}
          hotelName={hotel_name}
          bookingId={id}
          onSubmitSuccess={handleFeedbackSuccess}
        />
      )}

      {/* Confirmation Modal */}
      {showConfirmCancel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 space-y-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-6 w-6" />
              <h3 className="text-xl font-bold">Cancel Booking</h3>
            </div>
            <p className="text-gray-600">
              Are you sure you want to cancel your booking at {hotel_name}? This action cannot be undone.
            </p>
            <div className="flex gap-4 pt-4">
              <button
                onClick={() => setShowConfirmCancel(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}