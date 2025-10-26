import { useState, useEffect } from 'react';
import { Hotel, Users, Calendar, DollarSign, Plus } from 'lucide-react';
import { adminService } from '../services/adminService';
import { hotelService } from '../services/hotelService';

type AdminDashboardProps = {
  onNavigate: (page: string) => void;
};

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHotels: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, bookingsData, hotelsData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getRecentBookings(5),
        hotelService.getAllHotels(),
      ]);
      setStats(statsData);
      setRecentBookings(bookingsData);
      setHotels(hotelsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHotel = async (hotelId: string) => {
    if (!confirm('Are you sure you want to delete this hotel? This will also delete all its rooms.')) {
      return;
    }

    try {
      await hotelService.deleteHotel(hotelId);
      loadDashboardData();
    } catch (error: any) {
      alert(error.message || 'Failed to delete hotel');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={() => onNavigate('admin-add-hotel')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Hotel
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-medium">Total Users</h3>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-medium">Total Hotels</h3>
              <Hotel className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalHotels}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-600">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-medium">Total Bookings</h3>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-600">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-medium">Total Revenue</h3>
              <DollarSign className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">₹{stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Bookings</h2>
            {recentBookings.length === 0 ? (
              <p className="text-gray-600">No bookings yet</p>
            ) : (
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{booking.hotels?.name}</p>
                        <p className="text-sm text-gray-600">{booking.profiles?.full_name}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{booking.check_in_date} to {booking.check_out_date}</span>
                      <span className="font-semibold text-blue-600">₹{booking.total_amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Hotels Management</h2>
            {hotels.length === 0 ? (
              <p className="text-gray-600">No hotels yet</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {hotels.map((hotel) => (
                  <div key={hotel.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">{hotel.name}</p>
                        <p className="text-sm text-gray-600">{hotel.city}</p>
                        <p className="text-sm text-gray-500 mt-1">Rating: {hotel.rating.toFixed(1)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onNavigate('admin-manage-rooms', { hotel })}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Rooms
                        </button>
                        <button
                          onClick={() => handleDeleteHotel(hotel.id)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
