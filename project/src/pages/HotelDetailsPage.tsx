import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSavedHotels } from "../context/SavedHotelsContext";
import { toast } from "react-hot-toast";
import BookingForm from "../components/BookingForm";
import {
  Star,
  MapPin,
  Wifi,
  Coffee,
  Car,
  Waves,
  Utensils,
  Wind,
  BellRing,
  Bed,
  Heart,
  Camera,
  Info,
  Users,
  Clock,
  Calendar,
  Shield,
  Globe,
  X,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { saveHotel, unsaveHotel, isHotelSaved } from "../lib/supabaseClient";
import { getHotelById, type Hotel } from "../lib/hotelService";
import PhotoGallery from "../components/PhotoGallery";

export default function HotelDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshSavedCount } = useSavedHotels();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isLiked, setIsLiked] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);

  // Fetch hotel data
  useEffect(() => {
    async function fetchHotel() {
      if (!id) return;
      try {
        setLoading(true);
        const hotelData = await getHotelById(id);
        setHotel(hotelData);
      } catch (err) {
        console.error("Failed to fetch hotel:", err);
        setError("Failed to load hotel details");
        navigate("/404");
      } finally {
        setLoading(false);
      }
    }
    fetchHotel();
  }, [id, navigate]);

  // Check if hotel is saved
  useEffect(() => {
    if (user && id) {
      isHotelSaved(id).then(setIsLiked);
    }
  }, [id, user]);

  const handleToggleSave = async () => {
    if (!user) {
      toast.error("Please login to save hotels.");
      return;
    }

    try {
      if (isLiked) {
        const { error } = await unsaveHotel(id!);
        if (!error) {
          setIsLiked(false);
          await refreshSavedCount();
          toast.success("Hotel removed from saved list");
        }
      } else {
        const { error } = await saveHotel(id!);
        if (!error) {
          setIsLiked(true);
          await refreshSavedCount();
          toast.success("Hotel saved to your list");
        }
      }
    } catch (err) {
      toast.error("Failed to update saved hotels");
    }
  };

  const getAmenityIcon = (a: string) => {
    const key = a.toLowerCase();
    if (key.includes("wifi")) return <Wifi />;
    if (key.includes("breakfast")) return <Coffee />;
    if (key.includes("parking")) return <Car />;
    if (key.includes("pool")) return <Waves />;
    if (
      key.includes("restaurant") ||
      key.includes("bar") ||
      key.includes("lounge")
    )
      return <Utensils />;
    if (key.includes("fitness")) return <Users />;
    if (key.includes("spa")) return <Shield />;
    if (key.includes("room service")) return <BellRing />;
    if (key.includes("meeting")) return <Calendar />;
    if (key.includes("business")) return <Globe />;
    if (key.includes("concierge")) return <MapPin />;
    if (key.includes("laundry")) return <Wind />;
    if (key.includes("suite") || key.includes("family")) return <Bed />;
    return <Info />;
  };

  const parseLocation = (locationString: string) => {
    try {
      const [lat, lng] = locationString
        .replace("(", "")
        .replace(")", "")
        .split(",")
        .map((coord) => parseFloat(coord.trim()));
      return { lat, lng };
    } catch {
      return null;
    }
  };

  // Get the appropriate image URL
  const displayImageUrl = Array.isArray(hotel?.image_url)
    ? hotel.image_url[1] || hotel.image_url[0] || "/placeholder-hotel.jpg" // Use second image if available, fallback to first, then placeholder
    : hotel?.image_url || "/placeholder-hotel.jpg";

  // Get all images
  const allImages = Array.isArray(hotel?.image_url)
    ? hotel.image_url
    : hotel?.image_url
    ? [hotel.image_url]
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading hotel details...</p>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-red-600">{error || "Hotel not found"}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Process amenities
  const amenitiesArray = Array.isArray(hotel.amenities)
    ? hotel.amenities
    : typeof hotel.amenities === "string"
    ? JSON.parse(hotel.amenities.replace(/'/g, '"'))
    : [];

  const highlights = [
    {
      icon: <Info className="w-5 h-5 text-blue-600" />,
      title: "Iconic Property",
      description: "Discover premium facilities and unique architecture.",
    },
    {
      icon: <Utensils className="w-5 h-5 text-blue-600" />,
      title: "Local Cuisine",
      description: "Authentic flavors and signature dishes.",
    },
    {
      icon: <Camera className="w-5 h-5 text-blue-600" />,
      title: "Photo Opportunities",
      description: "Scenic spots for perfect memories.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="relative h-[50vh] w-full overflow-hidden">
        <img
          src={displayImageUrl}
          alt={hotel.hotel_name}
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10" />
        <div className="absolute bottom-0 p-8 md:p-12 z-20">
          <div className="text-white space-y-4 max-w-4xl">
            <div className="flex gap-4 flex-wrap">
              <div className="flex gap-2 items-center bg-white/10 px-4 py-1.5 rounded-full">
                <MapPin className="w-4 h-4" />
                {hotel.city}, {hotel.country}
              </div>
              <div className="flex gap-2 items-center bg-white/10 px-4 py-1.5 rounded-full">
                <Star className="w-4 h-4 text-yellow-400" />
                {hotel.stars}
              </div>
            </div>
            <h1 className="text-5xl font-bold">{hotel.hotel_name}</h1>
          </div>
        </div>
        <div className="absolute top-8 right-8 z-30 flex gap-4">
          <button
            onClick={handleToggleSave}
            className={`group flex items-center gap-2 px-4 py-2 rounded-full transition 
    ${
      isLiked
        ? "bg-white text-red-500"
        : "bg-white/10 text-white hover:bg-white hover:text-red-500"
    }`}
          >
            <Heart
              className={`h-4 w-4 transition 
      ${isLiked ? "fill-red-500 text-red-500" : "group-hover:text-red-500"}`}
            />
            <span
              className={isLiked ? "text-red-500" : "group-hover:text-red-500"}
            >
              {isLiked ? "Saved" : "Save"}
            </span>
          </button>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="bg-white border-b sticky top-[64px] z-30 shadow-lg">
        <div className="max-w-6xl mx-auto p-4 flex items-center gap-6 overflow-x-auto">
          <button
            onClick={() => setShowPhotoGallery(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600 transition-all"
          >
            <Camera className="h-4 w-4" />
            <span className="font-medium">Photos ({allImages.length})</span>
          </button>
          <div className="ml-auto flex gap-4">
            <button
              onClick={() => setShowBookingForm(true)}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-blue-700 transform hover:scale-105 transition-all"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-12 px-6 md:px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left */}
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-white rounded-2xl shadow-md p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <Info className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold">About</h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-6">
                Experience luxury and comfort at {hotel.hotel_name}, located in
                the heart of {hotel.city}. Our hotel offers exceptional
                amenities and world-class service to make your stay memorable.
              </p>
              {parseLocation(hotel.location) && (
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all">
                  <div className="p-3 rounded-full bg-blue-100">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Location</h4>
                    <p className="text-gray-600">{hotel.address}</p>
                    <a
                      href={`https://www.google.com/maps?q=${
                        parseLocation(hotel.location)?.lat
                      },${parseLocation(hotel.location)?.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mt-2 group"
                    >
                      <span>Open in Google Maps</span>
                      <Globe className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-md p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Highlights</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {highlights.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors group"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                        {item.icon}
                      </div>
                      <h4 className="text-xl font-semibold">{item.title}</h4>
                    </div>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <BellRing className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Amenities</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {amenitiesArray.map((amenity: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition-all hover:scale-105"
                  >
                    <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                      {getAmenityIcon(amenity)}
                    </div>
                    <span className="font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar stays unchanged — keep or customize as needed */}
          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 bg-white rounded-2xl shadow-lg p-8 space-y-6 border border-gray-100">
              <div className="flex items-center justify-between pb-6 border-b">
                <h3 className="text-2xl font-bold">Book Your Stay</h3>
                <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1.5 rounded-full">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-yellow-700">
                    {hotel.stars || "N/A"}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Price per night</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${Number(hotel.price).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span className="text-sm">Check-in</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span className="text-sm">Check-out</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
                  <Users className="w-5 h-5 text-gray-500" />
                  <span className="text-sm">2 Adults, 0 Children</span>
                </div>
              </div>

              <button
                onClick={() => setShowBookingForm(true)}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all"
              >
                Book Now
              </button>

              <div className="pt-6 space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span>Free cancellation available</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>Instant confirmation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
          onClick={() => setShowBookingForm(false)}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowBookingForm(false)}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200 z-10"
              aria-label="Close booking form"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Book Your Stay at {hotel.hotel_name}
              </h2>
              <BookingForm
                hotelName={hotel.hotel_name}
                hotelId={hotel.hotelid}
                price={Number(hotel.price)}
                onSubmit={() => {
                  setShowBookingForm(false);
                  toast.success(
                    "Booking successful! Check your email for confirmation."
                  );
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Add the photo gallery */}
      {showPhotoGallery && (
        <PhotoGallery
          images={allImages}
          onClose={() => setShowPhotoGallery(false)}
        />
      )}
    </div>
  );
}
