import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSavedHotels } from "../context/SavedHotelsContext";
import { toast } from "react-hot-toast";
import { saveHotel, unsaveHotel, isHotelSaved } from "../lib/supabaseClient"; // make sure you have these functions
import {
  Star,
  Heart,
  MapPin,
  Wifi,
  Coffee,
  Car,
  Waves,
  Sparkles,
  Utensils,
  Wine,
  Dumbbell,
  Wind,
  BellRing,
  Bed,
  Tv,
  Bath,
  Dog,
} from "lucide-react";

interface HotelCardProps {
  id: number;
  hotel_name: string;
  city: string;
  country: string;
  price: number;
  review_score: number;
  image_url: string | string[];
  amenities: string[];
}

type AmenityIconsType = {
  [key: string]: React.ReactElement;
};

const amenityIcons: AmenityIconsType = {
  "Free Internet": <Wifi className="w-4 h-4" />,
  "Free WiFi": <Wifi className="w-4 h-4" />,
  "Breakfast included": <Coffee className="w-4 h-4" />,
  "Free parking": <Car className="w-4 h-4" />,
  Pool: <Waves className="w-4 h-4" />,
  Spa: <Sparkles className="w-4 h-4" />,
  Restaurant: <Utensils className="w-4 h-4" />,
  "Bar/Lounge": <Wine className="w-4 h-4" />,
  "Fitness Centre": <Dumbbell className="w-4 h-4" />,
  "Air conditioning": <Wind className="w-4 h-4" />,
  "Room service": <BellRing className="w-4 h-4" />,
  "Pets Allowed": <Dog className="w-4 h-4" />,
  "Pet Friendly": <Dog className="w-4 h-4" />,
  Room: <Bed className="w-4 h-4" />,
  TV: <Tv className="w-4 h-4" />,
  Bathroom: <Bath className="w-4 h-4" />,
};

export default function HotelCard({
  id,
  hotel_name,
  city,
  country,
  price,
  review_score,
  image_url,
  amenities = [],
}: HotelCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const { user } = useAuth();
  const { refreshSavedCount } = useSavedHotels();

  useEffect(() => {
    if (user) {
      isHotelSaved(id).then((liked) => setIsLiked(liked));
    }
  }, [id, user]);

  const handleToggleSave = async () => {
    if (!user) {
      toast.error("Please login to save hotels.");
      return;
    }

    if (isLiked) {
      const { error } = await unsaveHotel(id);
      if (!error) {
        setIsLiked(false);
        await refreshSavedCount();
      }
    } else {
      const { error } = await saveHotel(id);
      if (!error) {
        setIsLiked(true);
        await refreshSavedCount();
      }
    }
  };

  const displayAmenities = amenities
    .filter((amenity) =>
      Object.keys(amenityIcons).some((key) =>
        amenity.toLowerCase().includes(key.toLowerCase())
      )
    )
    .slice(0, 3);

  // Get the appropriate image URL
  const displayImageUrl = Array.isArray(image_url)
    ? image_url[1] || image_url[0] || "/placeholder-hotel.jpg" // Use second image if available, fallback to first, then placeholder
    : image_url || "/placeholder-hotel.jpg";

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 w-full max-w-lg">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={displayImageUrl}
          alt={hotel_name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <button
          onClick={handleToggleSave}
          className="absolute top-4 right-4 p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/90 transition-all duration-300 group/btn z-10"
        >
          <Heart
            className={`w-5 h-5 transition-all duration-300 ${
              isLiked
                ? "fill-red-500 text-red-500 scale-110"
                : "text-white group-hover/btn:text-red-500"
            }`}
          />
        </button>

        {displayAmenities.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
            <div className="flex items-center gap-2 text-white mb-3">
              <MapPin className="w-4 h-4 text-white" />
              <span className="font-medium">
                {city}, {country}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {displayAmenities.map((amenity, index) => {
                const icon = Object.entries(amenityIcons).find(([key]) =>
                  amenity.toLowerCase().includes(key.toLowerCase())
                )?.[1];
                return (
                  icon && (
                    <div
                      key={index}
                      className="flex items-center gap-1.5 bg-black/30 text-white backdrop-blur-sm rounded-full px-2.5 py-1"
                    >
                      {icon}
                      <span className="text-xs font-medium text-white">
                        {amenity.length > 8
                          ? `${amenity.slice(0, 8)}...`
                          : amenity}
                      </span>
                    </div>
                  )
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
            {hotel_name}
          </h3>
          <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1.5 rounded-full ml-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-yellow-700">
              {review_score}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Starting from</p>
            <p className="text-2xl font-bold text-blue-600">${price}</p>
          </div>
          <Link
            to={`/hotel/${id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:bg-blue-800 transform hover:scale-105 transition-all duration-200 font-medium"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
