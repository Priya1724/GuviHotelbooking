import { useState, useEffect } from 'react';
import { MapPin, Star, ArrowLeft } from 'lucide-react';
import { RoomCard } from '../components/RoomCard';
import { roomService } from '../services/roomService';
import { Hotel, Room } from '../lib/supabase';

type HotelDetailsPageProps = {
  hotel: Hotel;
  checkIn: string;
  checkOut: string;
  onNavigate: (page: string, data?: any) => void;
};

export function HotelDetailsPage({ hotel, checkIn, checkOut, onNavigate }: HotelDetailsPageProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRooms();
  }, [hotel.id, checkIn, checkOut]);

  const loadRooms = async () => {
    try {
      let data;
      if (checkIn && checkOut) {
        data = await roomService.getAvailableRooms(hotel.id, checkIn, checkOut);
      } else {
        data = await roomService.getRoomsByHotel(hotel.id);
      }
      setRooms(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleBookRoom = (room: Room) => {
    onNavigate('booking', { hotel, room, checkIn, checkOut });
  };

  const amenitiesList = Array.isArray(hotel.amenities) ? hotel.amenities : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Search
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{hotel.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>{hotel.city}</span>
                </div>
                <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
                  <span className="font-semibold text-yellow-700">{hotel.rating.toFixed(1)}</span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{hotel.address}</p>
              <p className="text-gray-700 leading-relaxed">{hotel.description}</p>

              {amenitiesList.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {amenitiesList.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="h-96 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              {hotel.image_url ? (
                <img
                  src={hotel.image_url}
                  alt={hotel.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <div className="text-white text-9xl font-bold opacity-20">
                  {hotel.name.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {checkIn && checkOut ? 'Available Rooms' : 'All Rooms'}
          </h2>
          {checkIn && checkOut && (
            <p className="text-gray-600">
              For {checkIn} to {checkOut}
            </p>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading rooms...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600 text-lg">
              {checkIn && checkOut
                ? 'No rooms available for the selected dates. Try different dates.'
                : 'No rooms available at this hotel.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} onBook={handleBookRoom} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
