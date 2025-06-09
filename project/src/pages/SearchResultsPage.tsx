import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { searchHotels, type Hotel } from "../lib/hotelService";
import HotelCard from "../components/HotelCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Search,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Star,
  Funnel,
} from "lucide-react";

const useQuery = () => new URLSearchParams(useLocation().search);

const allAmenities = [
  "Air conditioning",
  "Bar/Lounge",
  "Breakfast included",
  "Concierge",
  "Fitness Centre with Gym / Workout Room",
  "Free parking",
  "Free Internet",
  "Laundry Service",
  "Non-smoking rooms",
  "Outdoor pool",
  "Pets Allowed ( Dog / Pet Friendly )",
  "Pool",
  "Restaurant",
  "Room service",
  "Spa",
  "Suites",
  "Wheelchair Access",
];

export default function SearchResultsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const query = useQuery();
  const navigate = useNavigate();
  const city = query.get("city") || "";
  const guests = query.get("guests") || "1";

  const [searchQuery, setSearchQuery] = useState(city);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [minStars, setMinStars] = useState(3);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 9;

  useEffect(() => {
    async function fetchSearchResults() {
      try {
        const searchQuery = query.get("q") || "";
        const results = await searchHotels(searchQuery);
        setHotels(results);
      } catch (error) {
        console.error("Failed to fetch search results:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSearchResults();
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(
      `/search?city=${encodeURIComponent(searchQuery)}&guests=${guests}`
    );
  };

  const parseAmenities = (raw: any): string[] => {
    try {
      if (Array.isArray(raw)) return raw;
      if (typeof raw === "string") {
        const fixed = raw.replace(/'/g, '"');
        const parsed = JSON.parse(fixed);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch {
      return [];
    }
    return [];
  };

  const filteredHotels = hotels.filter((hotel) => {
    const hotelAmenities = parseAmenities(hotel.amenities);
    const isCityMatch = hotel.city
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const isPriceOk = hotel.price <= maxPrice;
    const isStarOk = hotel.stars >= minStars;

    const hasAllSelectedAmenities = selectedAmenities.every((a) =>
      hotelAmenities.some((h) => h.toLowerCase().includes(a.toLowerCase()))
    );

    return isCityMatch && isPriceOk && isStarOk && hasAllSelectedAmenities;
  });

  // Add sorting state
  const [sortBy, setSortBy] = useState("recommended");

  // Enhanced sorting function
  const sortHotels = (hotelsToSort: Hotel[]) => {
    switch (sortBy) {
      case "price-low":
        return [...hotelsToSort].sort(
          (a, b) => (Number(a.price) || 0) - (Number(b.price) || 0)
        );
      case "price-high":
        return [...hotelsToSort].sort(
          (a, b) => (Number(b.price) || 0) - (Number(a.price) || 0)
        );
      case "rating":
        return [...hotelsToSort].sort(
          (a, b) =>
            (Number(b.review_score || b.stars) || 0) -
            (Number(a.review_score || a.stars) || 0)
        );
      default:
        return hotelsToSort;
    }
  };

  const filteredAndSortedHotels = sortHotels(filteredHotels);
  const totalPages = Math.ceil(filteredAndSortedHotels.length / resultsPerPage);
  const currentHotels = filteredAndSortedHotels.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  // Pagination handler
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <main className="flex-grow py-10 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Search Header */}
          <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mb-8">
            <div className="w-full md:w-auto flex-1 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Where would you like to go?"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-sm hover:shadow-md hover:bg-blue-700 active:bg-blue-800 transform transition-all duration-200 ease-in-out flex items-center gap-2 cursor-pointer"
            >
              <Search className="h-4 w-4" /> Search
            </button>
          </form>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Enhanced Filters Sidebar */}
            <aside className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 h-fit">
              <div className="flex items-center gap-3 mb-6">
                <Funnel className="h-4 w-4" />
                <h2 className="font-semibold">Filters</h2>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Price Range
                  </label>
                  <input
                    type="range"
                    min={50}
                    max={1000}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="text-sm font-medium text-blue-600 mt-2">
                    ${maxPrice}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Rating
                  </label>

                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setMinStars(star)}
                        className={`p-1 transition-all duration-200 transform hover:scale-110 focus:outline-none group`}
                        type="button"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= minStars
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-gray-100 text-gray-300 group-hover:fill-gray-200"
                          } transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3 text-gray-700">
                    Amenities
                  </h3>
                  <div className="grid grid-cols-1 gap-2 text-sm max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {allAmenities.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedAmenities.includes(amenity)}
                          onChange={(e) =>
                            setSelectedAmenities((prev) =>
                              e.target.checked
                                ? [...prev, amenity]
                                : prev.filter((a) => a !== amenity)
                            )
                          }
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
                        />
                        <span className="text-gray-700 select-none">
                          {amenity}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Enhanced Hotel Results Section */}
            <section className="lg:col-span-3 space-y-6">
              <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold">
                  🔍 Results for "
                  <span className="text-blue-600">{searchQuery}</span>"
                  <span className="text-sm text-gray-500 ml-2">
                    ({filteredHotels.length} properties)
                  </span>
                </h2>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border rounded-lg px-4 py-2 text-sm bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rating</option>
                </select>
              </div>

              {currentHotels.length === 0 ? (
                <div className="bg-white text-center py-12 rounded-lg shadow">
                  <MapPin className="mx-auto mb-4 h-10 w-10 text-blue-500" />
                  <h2 className="text-xl font-bold">No hotels found</h2>
                  <p className="text-gray-500 mt-2">
                    Try adjusting your filters or search
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {currentHotels.map((hotel) => (
                    <HotelCard
                      key={hotel.hotelid}
                      id={hotel.hotelid}
                      hotel_name={hotel.hotel_name}
                      city={hotel.city}
                      country={hotel.country}
                      price={hotel.price}
                      review_score={Number(hotel.stars) || 0}
                      image_url={hotel.image_url}
                      amenities={parseAmenities(hotel.amenities)}
                    />
                  ))}
                </div>
              )}

              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-10">
                  <button
                    onClick={() =>
                      handlePageChange(Math.max(1, currentPage - 1))
                    }
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center gap-2 group"
                  >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Previous
                  </button>

                  <button
                    onClick={() =>
                      handlePageChange(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg border text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center gap-2 group"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
