import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import AboutSection from "../components/AboutSection";
import Footer from "../components/Footer";
import HotelCard from "../components/HotelCard";
import ContinentsSection from "../components/ContinentsSection";
import { getTopHotels, type Hotel } from "../lib/hotelService";
import { MapPin, Star } from "lucide-react";
import RecommendedHotels from "../components/RecommendedHotels";
import CollaborativeRecommendations from "../components/CollaborativeRecommendations";

export default function HomePage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);

  useEffect(() => {
    async function fetchHotels() {
      try {
        const topHotels = await getTopHotels(9);
        setHotels(topHotels);
      } catch (error) {
        console.error("Failed to fetch hotels:", error);
      }
    }
    fetchHotels();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Navbar />
      <Hero />

      {/* Special Offers Section */}
      <section className="py-20 px-6 md:px-10 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Special Travel Deals
              </h2>
              <p className="text-gray-600">
                Exclusive offers on top-rated hotels worldwide
              </p>
            </div>
            <a
              href="/search"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 font-medium"
            >
              View all deals
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          </div>

          {/* Updated grid container */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hotels.map((hotel) => (
              <HotelCard
                key={hotel.hotelid}
                id={hotel.hotelid}
                hotel_name={hotel.hotel_name}
                city={hotel.city}
                country={hotel.country}
                price={hotel.price}
                review_score={hotel.stars || hotel.review_score || 0}
                image_url={hotel.image_url}
                amenities={
                  Array.isArray(hotel.amenities)
                    ? hotel.amenities
                    : typeof hotel.amenities === "string"
                    ? JSON.parse(hotel.amenities.replace(/'/g, '"'))
                    : []
                }
              />
            ))}
          </div>
        </div>
      </section>

      <RecommendedHotels />

      <CollaborativeRecommendations />

      <ContinentsSection />

      {/* Popular Destinations Section */}
      <section className="py-20 px-6 md:px-10 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Popular Destinations
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover trending locations loved by travelers worldwide
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hotels.slice(0, 3).map((destination) => (
              <div
                key={destination.hotelid}
                className="group relative overflow-hidden rounded-2xl shadow-lg h-[400px]"
              >
                <div className="h-full w-full">
                  <img
                    src={
                      Array.isArray(destination.image_url)
                        ? destination.image_url[1] || destination.image_url[0]
                        : destination.image_url
                    }
                    alt={`${destination.city}, ${destination.country}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="flex items-center gap-2 text-white/90 mb-3">
                      <MapPin className="h-5 w-5" />
                      <span className="text-base">{destination.country}</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-3">
                      {destination.city}
                    </h3>
                    <p className="text-white/80 text-lg">
                      Starting from ${destination.price}
                    </p>
                  </div>
                </div>
                <a
                  href={`/search?city=${encodeURIComponent(destination.city)}`}
                  className="absolute inset-0"
                  aria-label={`View hotels in ${destination.city}`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 md:px-10 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Travelers Say
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real experiences from our satisfied customers
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                location: "New York, USA",
                comment:
                  "Found my dream vacation spot through TravelMate. The booking process was seamless!",
                rating: 5,
                image:
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
              },
              {
                name: "Michael Chen",
                location: "Singapore",
                comment:
                  "Great deals and exceptional customer service. Will definitely book again!",
                rating: 5,
                image:
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
              },
              {
                name: "Emma Thompson",
                location: "London, UK",
                comment:
                  "The personalized recommendations were spot on. Made planning my trip so much easier.",
                rating: 5,
                image:
                  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {testimonial.location}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.comment}"</p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-6 md:px-10 bg-blue-600">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-4">Stay Updated</h2>
            <p className="text-white/90 max-w-2xl mx-auto">
              Subscribe to our newsletter for exclusive travel deals and
              destination insights
            </p>
          </div>
          <form className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-3 rounded-xl border-2 border-transparent focus:border-white/20 bg-white/10 text-white placeholder-white/60 outline-none"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <AboutSection />
      <Footer />
    </div>
  );
}
