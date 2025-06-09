import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import HotelCard from "./HotelCard";
import { getHotelById } from "../lib/hotelService";

interface CollaborativeHotel {
  hotel_id: number;
  name: string;
  city: string;
  country: string;
  price: number;
  stars: number;
  image_url: string;
  amenities: string[];
}

interface CollaborativeResponse {
  user_id: string;
  recommended_hotel_ids: number[];
}

export default function CollaborativeRecommendations() {
  const { user } = useAuth();
  const [hotels, setHotels] = useState<CollaborativeHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noRecommendations, setNoRecommendations] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchCollaborativeRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        setNoRecommendations(false);

        // First, try to get recommendations from collaborative filtering service
        const response = await fetch(
          `http://localhost:8000/recommend_by_uuid/${user.id}?top_n=6`,
          {
            method: "GET",
            credentials: "omit",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Collaborative filtering service error: ${await response.text()}`
          );
        }

        const collaborativeResponse: CollaborativeResponse =
          await response.json();

        if (
          !collaborativeResponse.recommended_hotel_ids ||
          collaborativeResponse.recommended_hotel_ids.length === 0
        ) {
          setNoRecommendations(true);
          setHotels([]);
          return;
        }

        // Fetch hotel details for each recommended hotel ID
        const hotelDetails = await Promise.all(
          collaborativeResponse.recommended_hotel_ids.map(async (hotelId) => {
            try {
              const hotel = await getHotelById(hotelId);
              return {
                hotel_id: hotel.hotelid,
                name: hotel.hotel_name || hotel.name || "Unknown Hotel",
                city: hotel.city || "",
                country: hotel.country || "",
                price: hotel.price || 0,
                stars: hotel.stars || hotel.review_score || 0,
                image_url: hotel.image_url || "",
                amenities: Array.isArray(hotel.amenities)
                  ? hotel.amenities
                  : typeof hotel.amenities === "string"
                  ? JSON.parse(hotel.amenities.replace(/'/g, '"'))
                  : [],
              };
            } catch (err) {
              console.error(`Failed to fetch hotel ${hotelId}:`, err);
              return null;
            }
          })
        );

        // Filter out any null results (failed hotel fetches)
        const validHotels = hotelDetails.filter(
          (hotel) => hotel !== null
        ) as CollaborativeHotel[];
        setHotels(validHotels);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load collaborative recommendations"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCollaborativeRecommendations();
  }, [user]);

  if (!user) {
    return (
      <section className="py-12 px-6 md:px-10 bg-gradient-to-br from-purple-50 to-pink-50 text-center">
        <h2 className="text-3xl font-bold text-purple-900">
          🤝 Community Recommendations
        </h2>
        <p className="text-purple-600">
          Please log in to discover what similar travelers recommend.
        </p>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="py-12 px-6 md:px-10 bg-gradient-to-br from-purple-50 to-pink-50 text-center">
        <div className="animate-spin h-10 w-10 rounded-full border-b-2 border-purple-500 mx-auto" />
        <p className="mt-4 text-purple-600">
          Loading community recommendations...
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 px-6 md:px-10 bg-gradient-to-br from-purple-50 to-pink-50 text-center">
        <h2 className="text-2xl font-bold mb-4 text-purple-900">
          🤝 Community Recommendations
        </h2>
        <p className="text-red-600 mb-4">{error}</p>
        <p className="text-purple-600">
          Our collaborative filtering service might be starting up. Please try
          again in a moment.
        </p>
      </section>
    );
  }

  if (noRecommendations) {
    return (
      <section className="py-12 px-6 md:px-10 bg-gradient-to-br from-purple-50 to-pink-50 text-center">
        <h2 className="text-2xl font-bold mb-4 text-purple-900">
          🤝 Community Recommendations
        </h2>
        <p className="text-purple-600 mb-6">
          Book more hotels and rate your stays to get recommendations based on
          what similar travelers enjoyed!
        </p>
        <a
          href="/search"
          className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Explore Hotels
        </a>
      </section>
    );
  }

  return (
    <section className="py-12 px-6 md:px-10 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-purple-900 mb-2">
            🤝 Community Recommendations
          </h2>
          <p className="text-purple-600 max-w-2xl mx-auto">
            Discover hotels loved by travelers with similar preferences to yours
          </p>
          <div className="mt-2 text-sm text-purple-500">
            Based on collaborative filtering • {hotels.length} recommendations
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {hotels.map((hotel) => (
            <HotelCard
              key={hotel.hotel_id}
              id={hotel.hotel_id}
              hotel_name={hotel.name}
              city={hotel.city}
              country={hotel.country}
              price={hotel.price}
              review_score={Number(hotel.stars) || 0}
              image_url={hotel.image_url}
              amenities={hotel.amenities || []}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
