import { MapPin, Heart, Activity, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Trip {
  id: string;
  destination: string;
  image: string;
  startDate: string;
  endDate: string;
  status: 'confirmed' | 'pending';
}

interface Destination {
  id: string;
  name: string;
  image: string;
  location: string;
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface FormInputProps {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  disabled?: boolean;
  isTextArea?: boolean;
}

export const TripCard = ({ trip }: { trip: Trip }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="relative h-48">
        <img src={trip.image} alt={trip.destination} className="w-full h-full object-cover" />
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${trip.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{trip.destination}</h3>
        <p className="text-sm text-gray-500 mt-1">
          {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
        </p>
        <button 
          onClick={() => navigate(`/trips/${trip.id}`)}
          className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export const DestinationCard = ({ destination }: { destination: Destination }) => {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => navigate(`/destinations/${destination.id}`)}
      className="bg-white rounded-xl shadow-md overflow-hidden group cursor-pointer"
    >
      <div className="relative h-48">
        <img src={destination.image} alt={destination.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-black/25 group-hover:bg-black/40 transition-colors duration-300" />
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-lg font-semibold">{destination.name}</h3>
          <p className="text-sm flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {destination.location}
          </p>
        </div>
      </div>
    </div>
  );
};

export const EmptyState = ({ icon, title, description, actionLabel, onAction }: EmptyStateProps) => (
  <div className="text-center py-12">
    <div className="mx-auto h-12 w-12 text-gray-400">{icon}</div>
    <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
    <p className="mt-2 text-sm text-gray-500">{description}</p>
    {actionLabel && onAction && (
      <button 
        onClick={onAction}
        className="mt-4 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

export const FormInput = ({ label, id, type = 'text', value, onChange, disabled, isTextArea }: FormInputProps) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    {isTextArea ? (
      <textarea
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        rows={3}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
    ) : (
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
    )}
  </div>
);

export const TabButton = ({ label, icon, isActive, onClick }: { label: string; icon: React.ReactNode; isActive: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
  >
    {icon}
    {label}
  </button>
);

export const getEmptyStateConfig = (type: 'trips' | 'saved' | 'activity') => {
  switch (type) {
    case 'trips':
      return {
        icon: <Calendar className="h-12 w-12" />,
        title: 'No trips planned',
        description: 'Start planning your next adventure!',
        actionLabel: 'Plan a Trip',
      };
    case 'saved':
      return {
        icon: <Heart className="h-12 w-12" />,
        title: 'No saved destinations',
        description: 'Save your favorite destinations for later!',
        actionLabel: 'Explore Destinations',
      };
    case 'activity':
      return {
        icon: <Activity className="h-12 w-12" />,
        title: 'No recent activity',
        description: 'Your recent activity will appear here',
      };
  }
};