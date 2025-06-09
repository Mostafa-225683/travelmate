import { useMemo, useEffect, useState } from "react";
import { getDestinations } from "../lib/hotelService";

type ContinentInfo = {
  name: string;
  image: string;
  countryCount: number;
  countries: Set<string>;
};

const continentImages = {
  Europe:
    "https://images.unsplash.com/photo-1541343672885-9be56236302a?auto=format&fit=crop&q=80",
  "North America":
    "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&q=80",
  "South America":
    "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&q=80",
  Asia: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80",
  Africa:
    "https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&q=80",
  Oceania:
    "https://images.unsplash.com/photo-1589330273594-fade1ee91647?auto=format&fit=crop&q=80"
};

export default function ContinentsSection() {
  const [destinations, setDestinations] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDestinations() {
      try {
        const data = await getDestinations();
        setDestinations(data);
      } catch (error) {
        console.error("Failed to fetch destinations:", error);
      }
    }
    fetchDestinations();
  }, []);

  const continentInfo = useMemo(() => {
    // Create and return the continent info array
    return Object.entries(continentImages).map(([name, image]) => ({
      name,
      image,
      countryCount: 0,
      countries: new Set<string>(),
    }));
  }, [destinations]);

  return (
    <section className="py-20 px-6 md:px-10 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
            Explore by Continent
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover amazing destinations across every continent, each with its
            unique culture and charm.
          </p>
        </div>

        {/* ✅ Grid of 3 per row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {continentInfo.map((continent, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-all duration-300 aspect-[4/3]"
            >
              <img
                src={continent.image}
                alt={continent.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-lg font-bold text-white mb-1">
                    {continent.name}
                  </h3>
                  <p className="text-sm text-white/90">
                    {continent.countryCount}{" "}
                    {continent.countryCount === 1 ? "country" : "countries"}
                  </p>
                </div>
              </div>
              <a
                href={`/destinations?continent=${encodeURIComponent(
                  continent.name
                )}`}
                className="absolute inset-0"
                aria-label={`Explore hotels in ${continent.name}`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
