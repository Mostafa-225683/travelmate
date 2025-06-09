import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { MapPin, Globe } from "lucide-react";
import { getDestinations } from "../lib/hotelService";

type Destination = {
  city: string;
  country: string;
  continent: string;
  count: number;
  image_url: string;
};

export default function DestinationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams] = useSearchParams();
  const initialContinent = searchParams.get("continent") || "";
  const [selectedContinent, setSelectedContinent] =
    useState<string>(initialContinent);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDestinations() {
      try {
        const data = await getDestinations();
        // Process the data to get counts and image_url
        const processedDestinations = data.reduce<Destination[]>(
          (acc, dest) => {
            const existingDestination = acc.find(
              (d) => d.city === dest.city && d.country === dest.country
            );

            if (existingDestination) {
              existingDestination.count++;
            } else {
              acc.push({
                city: dest.city,
                country: dest.country,
                continent: dest.continent,
                count: 1,
                image_url:
                  dest.image_url ||
                  "https://images.unsplash.com/photo-1582719508461-905c673771fd", // fallback image
              });
            }

            return acc;
          },
          []
        );

        setDestinations(processedDestinations);
      } catch (error) {
        console.error("Failed to fetch destinations:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDestinations();
  }, []);

  // Get unique continents
  const continents = useMemo(() => {
    return Array.from(
      new Set(destinations.map((dest) => dest.continent))
    ).filter(Boolean);
  }, [destinations]);

  // Filter destinations based on search query and selected continent
  const filteredDestinations = destinations.filter((dest) => {
    const matchesSearch =
      dest.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.country.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesContinent =
      !selectedContinent || dest.continent === selectedContinent;

    return matchesSearch && matchesContinent;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-xl text-gray-600">Loading destinations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="relative">
        {/* Background Image with Tint Overlay */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1582719508461-905c673771fd')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-black/50" /> {/* Tint Layer */}
        {/* Overlay Content */}
        <div className="relative z-10 min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 sm:px-6 md:py-20 lg:py-24">
          <div className="text-center max-w-3xl mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 leading-tight">
              Explore Amazing Destinations
            </h1>
            <p className="text-base md:text-lg text-white px-2 sm:px-0">
              Discover the world's most beautiful places and plan your next
              adventure
            </p>
          </div>

          {/* Search and Filter Controls */}
          <div className="w-full max-w-4xl flex flex-col md:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="w-full md:flex-1 relative">
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-white/20 bg-white/10 text-white placeholder-white backdrop-blur-sm focus:outline-none focus:border-white/40 transition-all"
              />
            </div>

            {/* Continent Filter */}
            <div className="w-full md:w-64 relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white" />
              <select
                value={selectedContinent}
                onChange={(e) => setSelectedContinent(e.target.value)}
                className="w-full pl-12 pr-10 py-3 rounded-full border border-white/30 bg-white/10 text-white placeholder-white/60 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white/40 transition-all appearance-none cursor-pointer"
              >
                <option className="text-black" value="">
                  All Continents
                </option>
                {continents.map((continent) => (
                  <option
                    className="text-black"
                    key={continent}
                    value={continent}
                  >
                    {continent}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Destinations Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDestinations.map((destination, index) => (
            <div
              key={`${destination.city}-${index}`}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={destination.image_url}
                  alt={`${destination.city}, ${destination.country}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 text-white/90 mb-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{destination.country}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {destination.city}
                  </h3>
                  <p className="text-white/80">
                    {destination.count}{" "}
                    {destination.count === 1 ? "hotel" : "hotels"} available
                  </p>
                </div>
              </div>
              <a
                href={`/search?city=${encodeURIComponent(destination.city)}`}
                className="absolute inset-0"
                aria-label={`View hotels in ${destination.city}`}
              ></a>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
