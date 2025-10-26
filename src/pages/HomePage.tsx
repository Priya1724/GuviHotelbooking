import { useState, useEffect } from 'react';
import { Search, Calendar } from 'lucide-react';
import { HotelCard } from '../components/HotelCard';
import { hotelService } from '../services/hotelService';
import { Hotel } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type HomePageProps = {
  onNavigate: (page: string, data?: any) => void;
};

export function HomePage({ onNavigate }: HomePageProps) {
  const { user } = useAuth();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [searchCity, setSearchCity] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      const data = await hotelService.getAllHotels();
      setHotels(data);
      setFilteredHotels(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load hotels');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchCity.trim()) {
      setFilteredHotels(hotels);
      return;
    }

    const filtered = hotels.filter(hotel =>
      hotel.city.toLowerCase().includes(searchCity.toLowerCase())
    );
    setFilteredHotels(filtered);
  };

  const handleHotelSelect = (hotel: Hotel) => {
    if (!user) {
      onNavigate('login');
      return;
    }

    onNavigate('hotel-details', { hotel, checkIn, checkOut });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4 text-center">Find Your Perfect Stay</h1>
          <p className="text-xl text-center text-blue-100 mb-8">
            Book amazing hotels at the best prices
          </p>

          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Where do you want to go?
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    placeholder="Enter city name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-in</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={today}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-out</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || today}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={handleSearch}
              className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Search Hotels
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading hotels...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
            {error}
          </div>
        ) : filteredHotels.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No hotels found. Try a different search.</p>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              {searchCity ? `Hotels in ${searchCity}` : 'All Hotels'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} onSelect={handleHotelSelect} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
