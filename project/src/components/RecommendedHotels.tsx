import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import HotelCard from "./HotelCard";

interface RecommendedHotel {
  hotel_id: number;
  name: string;
  city: string;
  country: string;
  price: number;
  stars: number;
  image_url: string;
  amenities: string[];
  similarity_score: number | null;
}

export default function RecommendedHotels() {
  const { user } = useAuth();
  const [hotels, setHotels] = useState<RecommendedHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noRecommendations, setNoRecommendations] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        setNoRecommendations(false);

        const response = await fetch(
          `http://localhost:8001/recommend?user_id=${user.id}`,
          {
            method: "GET",
            credentials: "omit",
          }
        );

        if (!response.ok) {
          throw new Error(`Backend error: ${await response.text()}`);
        }

        const recommendedHotels = await response.json();

        if (!recommendedHotels || recommendedHotels.length === 0) {
          setNoRecommendations(true);
          setHotels([]);
          return;
        }

        // Since the backend now returns full hotel objects, we don't need to fetch them individually
        setHotels(recommendedHotels);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : "Failed to load recommendations"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  if (!user) {
    return (
      <section className="py-12 px-6 md:px-10 bg-gray-50 text-center">
        <h2 className="text-3xl font-bold">🔮 AI-Powered Recommendations</h2>
        <p className="text-gray-600">Please log in to get your results.</p>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="py-12 px-6 md:px-10 bg-gray-50 text-center">
        <div className="animate-spin h-10 w-10 rounded-full border-b-2 border-blue-500 mx-auto" />
        <p className="mt-4 text-gray-600">Loading recommendations...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 px-6 md:px-10 bg-gray-50 text-center">
        <h2 className="text-2xl font-bold mb-4">
          🎯 Personalized Recommendations
        </h2>
        <p className="text-red-600 mb-4">{error}</p>
      </section>
    );
  }

  if (noRecommendations) {
    return (
      <section className="py-12 px-6 md:px-10 bg-gray-50 text-center">
        <h2 className="text-2xl font-bold mb-4">
          🎯 Personalized Recommendations
        </h2>
        <p className="text-gray-600 mb-6">
          Book your first hotel to get personalized recommendations based on
          your preferences!
        </p>
        <a
          href="/search"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Explore Hotels
        </a>
      </section>
    );
  }

  return (
    <section className="py-12 px-6 md:px-10 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-6">
          🔮 AI-Powered Recommendations
        </h2>
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
