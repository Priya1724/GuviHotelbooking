import { useState, useEffect } from 'react';
import { Calendar, MapPin, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { bookingService } from '../services/bookingService';

export function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  const loadBookings = async () => {
    if (!user) return;

    try {
      const data = await bookingService.getUserBookings(user.id);
      setBookings(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await bookingService.cancelBooking(bookingId);
      loadBookings();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Bookings</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading bookings...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">You don't have any bookings yet</p>
            <p className="text-gray-500">Start exploring hotels and make your first booking!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        {booking.hotels?.name}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{booking.hotels?.city}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Room</p>
                      <p className="font-semibold text-gray-900 capitalize">
                        {booking.rooms?.room_type}
                      </p>
                      <p className="text-sm text-gray-600">Room {booking.rooms?.room_number}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Check-in</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <p className="font-semibold text-gray-900">{booking.check_in_date}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Check-out</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <p className="font-semibold text-gray-900">{booking.check_out_date}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                      <p className="text-xl font-bold text-blue-600">₹{booking.total_amount}</p>
                      <p className="text-sm text-gray-600">{booking.total_nights} nights</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Guest Name</p>
                        <p className="font-medium text-gray-900">{booking.guest_name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Guests</p>
                        <p className="font-medium text-gray-900">{booking.guest_count}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">{booking.guest_email}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Phone</p>
                        <p className="font-medium text-gray-900">{booking.guest_phone}</p>
                      </div>
                    </div>

                    {booking.special_requests && (
                      <div className="mt-3">
                        <p className="text-gray-600 text-sm">Special Requests</p>
                        <p className="text-gray-900">{booking.special_requests}</p>
                      </div>
                    )}
                  </div>

                  {booking.status === 'CONFIRMED' && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Cancel Booking
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
