import { useState, useEffect } from "react";
import { Calendar, Users, CreditCard, AlertCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { createBooking } from "../lib/bookingService";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

interface BookingFormProps {
  hotelName: string;
  hotelId: string | number;
  price: number;
  onSubmit?: (bookingData: BookingData) => void;
}

interface BookingData {
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  name: string;
  email: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

interface ValidationErrors {
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  rooms?: string;
  name?: string;
  email?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
}

export default function BookingForm({
  hotelName,
  hotelId,
  price,
  onSubmit,
}: BookingFormProps) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [bookingData, setBookingData] = useState<BookingData>({
    checkIn: "",
    checkOut: "",
    guests: 1,
    rooms: 1,
    name: "",
    email: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  useEffect(() => {
    // Get search parameters
    const guests = searchParams.get("guests");
    const rooms = searchParams.get("rooms");
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");

    // Only set initial values if they're not already set
    setBookingData((prev) => ({
      ...prev,
      // Only update if the current value is empty and search param exists
      guests: prev.guests || parseInt(guests || "1"),
      rooms: prev.rooms || parseInt(rooms || "1"),
      checkIn: prev.checkIn || checkIn || "",
      checkOut: prev.checkOut || checkOut || "",
    }));
  }, []); // Only run once on component mount

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    // Handle different input types appropriately
    if (type === "number") {
      // Parse numeric inputs
      setBookingData((prev) => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else if (type === "date") {
      // Handle date inputs
      setBookingData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      // Handle all other inputs
      setBookingData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Date validations
    const checkInDate = new Date(bookingData.checkIn);
    const checkOutDate = new Date(bookingData.checkOut);

    if (checkInDate < currentDate) {
      newErrors.checkIn = "Check-in date cannot be in the past";
    }
    if (checkOutDate <= checkInDate) {
      newErrors.checkOut = "Check-out date must be after check-in date";
    }

    // Guest and room validation
    if (bookingData.guests < 1 || bookingData.guests > 10) {
      newErrors.guests = "Number of guests must be between 1 and 10";
    }
    if (bookingData.rooms < 1 || bookingData.rooms > 5) {
      newErrors.rooms = "Number of rooms must be between 1 and 5";
    }
    if (bookingData.guests < bookingData.rooms) {
      newErrors.guests = "Number of guests cannot be less than number of rooms";
    }

    // Name validation
    if (bookingData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters long";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Card validations
    const cardNumberRegex = /^[0-9]{16}$/;
    if (!cardNumberRegex.test(bookingData.cardNumber.replace(/\s/g, ""))) {
      newErrors.cardNumber = "Please enter a valid 16-digit card number";
    }

    const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!expiryRegex.test(bookingData.expiryDate)) {
      newErrors.expiryDate = "Please enter a valid expiry date (MM/YY)";
    } else {
      // Check if card is expired
      const [month, year] = bookingData.expiryDate.split("/");
      const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
      if (expiry < new Date()) {
        newErrors.expiryDate = "Card has expired";
      }
    }

    const cvvRegex = /^[0-9]{3,4}$/;
    if (!cvvRegex.test(bookingData.cvv)) {
      newErrors.cvv = "Please enter a valid CVV";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotalPrice = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return price;
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );
    return price * nights;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmation(true);
    }
  };

  const handleConfirm = async () => {
    if (!user) {
      toast.error("Please log in to complete your booking");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      // Calculate total price
      const totalPrice = calculateTotalPrice();

      // Prepare booking data for API
      const apiBookingData = {
        hotel_id: hotelId,
        hotel_name: hotelName,
        check_in: bookingData.checkIn,
        check_out: bookingData.checkOut,
        guests: bookingData.guests,
        rooms: bookingData.rooms,
        total_price: totalPrice,
      };

      // Create booking in Supabase
      const { success, error, booking_id } = await createBooking(
        apiBookingData
      );

      if (success) {
        toast.success("Booking confirmed successfully!");
        setShowConfirmation(false);

        // Call onSubmit if provided (for backward compatibility)
        if (onSubmit) {
          onSubmit(bookingData);
        }

        // Navigate to bookings page
        navigate("/profile#trips");
      } else {
        toast.error(error || "Failed to complete booking");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Booking error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6 hover:shadow-xl transition-shadow duration-300">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-800">{hotelName}</h3>
          <p className="text-gray-600 mt-1">Complete your booking</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dates and Guests */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    name="checkIn"
                    value={bookingData.checkIn}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300 ${
                      errors.checkIn ? "border-red-500" : "border-gray-300"
                    }`}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                  {errors.checkIn && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.checkIn}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    name="checkOut"
                    value={bookingData.checkOut}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300 ${
                      errors.checkOut ? "border-red-500" : "border-gray-300"
                    }`}
                    min={
                      bookingData.checkIn ||
                      new Date().toISOString().split("T")[0]
                    }
                    required
                  />
                  {errors.checkOut && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.checkOut}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Guests
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  name="guests"
                  min="1"
                  max="10"
                  value={bookingData.guests}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.guests ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                {errors.guests && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.guests}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Rooms
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  name="rooms"
                  min="1"
                  max="5"
                  value={bookingData.rooms}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.rooms ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                {errors.rooms && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.rooms}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={bookingData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.name}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={bookingData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="cardNumber"
                  value={bookingData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="1234 5678 9012 3456"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.cardNumber ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                {errors.cardNumber && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.cardNumber}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="text"
                  name="expiryDate"
                  value={bookingData.expiryDate}
                  onChange={handleInputChange}
                  placeholder="MM/YY"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.expiryDate ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                {errors.expiryDate && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.expiryDate}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  name="cvv"
                  value={bookingData.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.cvv ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                {errors.cvv && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.cvv}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Price per night</span>
              <span>${price}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-800">
              <span>Total Price</span>
              <span>${calculateTotalPrice()}</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transform hover:scale-105 transition-all duration-200 font-medium"
          >
            Confirm Booking
          </button>
        </form>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
          onClick={() => setShowConfirmation(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 space-y-4 transform transition-all duration-300 scale-100 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900">Confirm Booking</h3>
            <div className="space-y-2">
              <p className="text-gray-600">
                Please review your booking details:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Check-in:</span>
                  <span className="font-medium">
                    {new Date(bookingData.checkIn).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Check-out:</span>
                  <span className="font-medium">
                    {new Date(bookingData.checkOut).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Guests:</span>
                  <span className="font-medium">{bookingData.guests}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-gray-900 pt-2 border-t">
                  <span>Total Price:</span>
                  <span>${calculateTotalPrice()}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
