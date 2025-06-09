import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useAuth } from "../context/AuthContext";
import {
  MapPin,
  Mail,
  Phone,
  Lock,
  User,
  Calendar,
  Heart,
  Activity,
  Settings,
  Shield,
  InfoIcon,
  Loader,
  Star,
  MessageSquare,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-hot-toast";
import ChangePasswordForm from "../components/ChangePasswordForm";
import HotelCard from "../components/HotelCard";
import BookingCard from "../components/BookingCard";
import { getUserBookings } from "../lib/bookingService";
import {
  TripCard,
  DestinationCard,
  EmptyState,
  FormInput,
  TabButton,
  getEmptyStateConfig,
} from "../components/ProfileComponents";
import { getHotelsByIds } from "../lib/hotelService";
import { getUserFeedback, type Feedback } from "../lib/feedbackService"

interface Hotel {
  hotelid: number;
  hotel_name: string;
  city: string;
  country: string;
  price: number;
  review_score: number;
  stars: number;
  image_url: string[] | string;
  amenities: string[];
}

interface Booking {
  id: string;
  hotel_id: string | number;
  hotel_name: string;
  check_in: string;
  check_out: string;
  guests: number;
  rooms: number;
  total_price: number;
  created_at: string;
  user_id: string;
}

type TabType = "trips" | "saved" | "activity" | "settings";

// FeedbackCard component to display user feedback
const FeedbackCard = ({ feedback }: { feedback: Feedback }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{feedback.hotel_name}</h3>
        <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-full">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-medium text-blue-700">{feedback.rating}/5</span>
        </div>
      </div>
      
      {feedback.comment && (
        <div className="mb-3 text-gray-600">
          <p className="italic">{feedback.comment}</p>
        </div>
      )}
      
      <div className="flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <MessageSquare className="h-4 w-4" />
          <span>Feedback ID: {feedback.id.substring(0, 8)}</span>
        </div>
        <span>{formatDate(feedback.created_at)}</span>
      </div>
    </div>
  );
};

export default function UserProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [saved, setSaved] = useState<Hotel[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

  const [activeTab, setActiveTab] = useState<TabType>("trips");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "+1234567890",
    location: "New York, USA",
    bio: "Passionate traveler exploring the world one destination at a time.",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (user) {
      const [firstName, lastName] = user.name?.split(" ") || ["", ""];
      setFormData({
        firstName,
        lastName,
        email: user.email || "",
        phone: "+1234567890",
        location: "New York, USA",
        bio: "Passionate traveler exploring the world one destination at a time.",
      });
    }
  }, [user]);

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (["trips", "saved", "activity", "settings"].includes(hash)) {
      setActiveTab(hash as TabType);
      setTimeout(() => {
        const section = document.getElementById(hash);
        if (section) section.scrollIntoView({ behavior: "smooth" });
      }, 150);
    }

    // Load bookings when trips tab is active
    if (hash === "trips" || activeTab === "trips") {
      fetchBookings();
    }
    
    // Load feedback when activity tab is active
    if (hash === "activity" || activeTab === "activity") {
      fetchFeedback();
    }
  }, [location.hash, user, activeTab]);
  
  // Fetch user feedback
  const fetchFeedback = async () => {
    if (!user) return;

    setIsLoadingFeedback(true);
    try {
      const { feedback, error } = await getUserFeedback();
      if (error) {
        toast.error(error);
      } else {
        setFeedback(feedback);
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
      toast.error("Failed to load your feedback");
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  const fetchBookings = async () => {
    if (!user) return;

    setIsLoadingBookings(true);
    try {
      const { bookings, error } = await getUserBookings();
      if (error) {
        toast.error(error);
      } else {
        setBookings(bookings);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load your bookings");
    } finally {
      setIsLoadingBookings(false);
    }
  };

  useEffect(() => {
    const fetchSaved = async () => {
      if (!user) return;

      try {
        // First get saved hotel IDs
        const { data: savedData } = await supabase
          .from("saved_hotels")
          .select("hotel_id")
          .eq("user_id", user.id);

        const savedHotelIds = savedData?.map((item) => item.hotel_id) || [];

        if (savedHotelIds.length === 0) {
          setSaved([]);
          return;
        }

        // Then fetch the actual hotel data from the hotels table
        const savedHotels = await getHotelsByIds(savedHotelIds);

        // Transform the data to match the Hotel interface
        const transformedHotels = savedHotels.map((h) => ({
          hotelid: h.hotelid,
          hotel_name: h.hotel_name,
          city: h.city,
          country: h.country,
          price: h.price,
          review_score: h.stars,
          stars: h.stars,
          image_url: h.image_url,
          amenities: Array.isArray(h.amenities)
            ? h.amenities
            : typeof h.amenities === "string"
            ? JSON.parse(h.amenities.replace(/'/g, '"'))
            : [],
        }));

        setSaved(transformedHotels);
      } catch (error) {
        console.error("Error fetching saved hotels:", error);
        toast.error("Failed to load saved hotels");
      }
    };

    fetchSaved();
  }, [user]);

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsEditing(false);
    } catch {
      setFormError("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const renderTabContent = () => {
    if (activeTab === "trips") {
      return (
        <div id="trips">
          {isLoadingBookings ? (
            <div className="flex justify-center items-center py-12">
              <Loader className="h-8 w-8 text-blue-600 animate-spin" />
              <span className="ml-2 text-gray-600">
                Loading your bookings...
              </span>
            </div>
          ) : bookings.length > 0 ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Your Bookings
                </h2>
                <button
                  onClick={() => navigate("/destinations")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Book New Trip
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {bookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    {...booking}
                    onCancelSuccess={fetchBookings}
                  />
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              {...getEmptyStateConfig("trips")}
              onAction={() => navigate("/destinations")}
            />
          )}
        </div>
      );
    }

    if (activeTab === "saved") {
      return (
        <div id="saved">
          {saved.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {saved.map((hotel) => (
                <HotelCard
                  key={hotel.hotelid}
                  id={hotel.hotelid}
                  hotel_name={hotel.hotel_name}
                  city={hotel.city}
                  country={hotel.country}
                  price={hotel.price}
                  review_score={hotel.stars}
                  image_url={
                    Array.isArray(hotel.image_url)
                      ? hotel.image_url[1] || hotel.image_url[0]
                      : hotel.image_url
                  }
                  amenities={hotel.amenities}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              {...getEmptyStateConfig("saved")}
              onAction={() => navigate("/destinations")}
            />
          )}
        </div>
      );
    }

    if (activeTab === "activity") {
      return (
        <div id="activity">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Reviews & Feedback</h2>
          {isLoadingFeedback ? (
            <div className="flex justify-center items-center py-12">
              <Loader className="h-8 w-8 text-blue-600 animate-spin" />
              <span className="ml-2 text-gray-600">
                Loading your feedback...
              </span>
            </div>
          ) : feedback.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {feedback.map((item) => (
                <FeedbackCard key={item.id} feedback={item} />
              ))}
            </div>
          ) : (
            <EmptyState {...getEmptyStateConfig("activity")} />
          )}
        </div>
      );
    }

    return (
      <div id="settings" className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-full text-blue-600">
              <InfoIcon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Personal Information
            </h3>
          </div>
          <form onSubmit={handleFormSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="First Name"
                id="firstName"
                value={formData.firstName}
                onChange={handleFormChange}
                disabled={!isEditing}
              />
              <FormInput
                label="Last Name"
                id="lastName"
                value={formData.lastName}
                onChange={handleFormChange}
                disabled={!isEditing}
              />
              <FormInput
                label="Email"
                id="email"
                type="email"
                value={formData.email}
                onChange={handleFormChange}
                disabled={!isEditing}
              />
              <FormInput
                label="Phone"
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={handleFormChange}
                disabled={!isEditing}
              />
              <FormInput
                label="Location"
                id="location"
                value={formData.location}
                onChange={handleFormChange}
                disabled={!isEditing}
              />
              <FormInput
                label="Bio"
                id="bio"
                value={formData.bio}
                onChange={handleFormChange}
                disabled={!isEditing}
                isTextArea
              />
            </div>
            {isEditing && (
              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full opacity-50"></div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-full text-blue-600">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Security</h3>
          </div>
          <p className="text-gray-600 mb-6">
            Update your password to keep your account secure. We recommend using
            a strong password that you don't use elsewhere.
          </p>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-100">
            <ChangePasswordForm />
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <p className="text-lg md:text-xl text-gray-600 mb-6">
          Please log in to view your profile.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300"
        >
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      {formError && (
        <div className="bg-red-50 text-red-600 p-4 text-center">
          {formError}
        </div>
      )}
      <div className="flex-1">
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="h-32 w-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-semibold">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {user?.name || "User"}
                  </h1>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <User className="h-4 w-4" />
                    {isEditing ? "Cancel Editing" : "Edit Profile"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-6 justify-center md:justify-start text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {formData.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    {formData.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    {formData.phone}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-wrap gap-4 mb-8">
            {["trips", "saved", "activity", "settings"].map((tab) => {
              const icons = {
                trips: Calendar,
                saved: Heart,
                activity: Activity,
                settings: Settings,
              };
              const Icon = icons[tab as TabType];
              return (
                <TabButton
                  key={tab}
                  label={tab.charAt(0).toUpperCase() + tab.slice(1)}
                  icon={<Icon className="h-5 w-5" />}
                  isActive={activeTab === tab}
                  onClick={() => setActiveTab(tab as TabType)}
                />
              );
            })}
          </div>
          {renderTabContent()}
        </div>
      </div>
      <Footer />
    </div>
  );
}
