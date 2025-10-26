import { MapPin, Star } from 'lucide-react';
import { Hotel } from '../lib/supabase';

type HotelCardProps = {
  hotel: Hotel;
  onSelect: (hotel: Hotel) => void;
};

export function HotelCard({ hotel, onSelect }: HotelCardProps) {
  const amenitiesList = Array.isArray(hotel.amenities) ? hotel.amenities : [];

  return (
    <div
      onClick={() => onSelect(hotel)}
      className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
    >
      <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
        {hotel.image_url ? (
          <img src={hotel.image_url} alt={hotel.name} className="w-full h-full object-cover" />
        ) : (
          <div className="text-white text-6xl font-bold opacity-20">{hotel.name.charAt(0)}</div>
        )}
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-900">{hotel.name}</h3>
          <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-lg">
            <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
            <span className="text-sm font-semibold text-yellow-700">{hotel.rating.toFixed(1)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-gray-600 mb-3">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{hotel.city}</span>
        </div>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{hotel.description}</p>
        {amenitiesList.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {amenitiesList.slice(0, 3).map((amenity, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
              >
                {amenity}
              </span>
            ))}
            {amenitiesList.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{amenitiesList.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
