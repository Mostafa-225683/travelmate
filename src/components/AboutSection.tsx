import {
  MapPin,
  Globe,
  Brain,
  DollarSign,
  Calendar,
  Heart
} from 'lucide-react';

const AboutSection = () => {
  const features = [
    {
      icon: <Globe className="h-10 w-10 text-blue-600" />,
      title: 'Smart Recommendations',
      description: 'Our AI algorithm analyzes your preferences to find your perfect destination match.'
    },
    {
      icon: <MapPin className="h-10 w-10 text-blue-600" />,
      title: 'Diverse Destinations',
      description: 'From pristine beaches to mountain retreats, urban adventures to countryside escapes.'
    },
    {
      icon: <Brain className="h-10 w-10 text-blue-600" />,
      title: 'Personalized Experience',
      description: 'The more you use our platform, the better we understand your travel preferences.'
    },
    {
      icon: <DollarSign className="h-10 w-10 text-blue-600" />,
      title: 'Budget Conscious',
      description: 'Find amazing destinations that match your budget, from economical to luxury.'
    },
    {
      icon: <Calendar className="h-10 w-10 text-blue-600" />,
      title: 'Seasonal Awareness',
      description: 'Recommendations that consider the best time to visit each destination.'
    },
    {
      icon: <Heart className="h-10 w-10 text-blue-600" />,
      title: 'Passion for Travel',
      description: 'Created by travelers for travelers, with love and expertise.'
    }
  ];

  return (
    <section id="about" className="py-20 px-6 md:px-10 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">Why Travel with Us?</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            At TravelMate, we combine intelligent travel tech with passion and personal touch — to guide your journey anywhere in the world.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 shadow hover:shadow-lg hover:scale-[1.02] transition duration-300"
            >
              <div className="mb-4 bg-blue-100 p-4 rounded-full">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
