import { useState } from 'react';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { bookingService } from '../services/bookingService';
import { paymentService } from '../services/paymentService';
import { Hotel, Room } from '../lib/supabase';

type BookingPageProps = {
  hotel: Hotel;
  room: Room;
  checkIn: string;
  checkOut: string;
  onNavigate: (page: string, data?: any) => void;
};

export function BookingPage({ hotel, room, checkIn, checkOut, onNavigate }: BookingPageProps) {
  const { user, profile } = useAuth();
  const [guestName, setGuestName] = useState(profile?.full_name || '');
  const [guestEmail, setGuestEmail] = useState(profile?.email || '');
  const [guestPhone, setGuestPhone] = useState(profile?.phone || '');
  const [guestCount, setGuestCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPayment, setShowPayment] = useState(false);

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const nights = calculateNights();
  const totalAmount = nights * room.price_per_night;

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      setError('Please select check-in and check-out dates');
      return;
    }
    if (nights === 0) {
      setError('Check-out date must be after check-in date');
      return;
    }
    setShowPayment(true);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setLoading(true);

    try {
      const booking = await bookingService.createBooking({
        user_id: user.id,
        room_id: room.id,
        hotel_id: hotel.id,
        check_in_date: checkIn,
        check_out_date: checkOut,
        total_nights: nights,
        total_amount: totalAmount,
        guest_count: guestCount,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone,
        special_requests: specialRequests || null,
        status: 'PENDING',
      });

      const payment = await paymentService.simulatePayment(
        booking.id,
        totalAmount,
        paymentMethod
      );

      if (payment.payment_status === 'SUCCESS') {
        await bookingService.updateBookingStatus(booking.id, 'CONFIRMED');
        onNavigate('booking-success', { booking, payment });
      } else {
        setError('Payment failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!checkIn || !checkOut) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-700 mb-4">Please select check-in and check-out dates</p>
          <button
            onClick={() => onNavigate('home')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => onNavigate('hotel-details', { hotel, checkIn, checkOut })}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Hotel
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
            <h1 className="text-3xl font-bold mb-2">Complete Your Booking</h1>
            <p className="text-blue-100">Just a few more steps to confirm your reservation</p>
          </div>

          <div className="p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Hotel Details</h3>
                <p className="text-gray-700 font-medium">{hotel.name}</p>
                <p className="text-gray-600 text-sm">{hotel.city}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Room Details</h3>
                <p className="text-gray-700 font-medium capitalize">{room.room_type}</p>
                <p className="text-gray-600 text-sm">Room {room.room_number}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Stay Duration</h3>
                <p className="text-gray-700">{checkIn} to {checkOut}</p>
                <p className="text-gray-600 text-sm">{nights} night{nights !== 1 ? 's' : ''}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Total Amount</h3>
                <p className="text-3xl font-bold text-blue-600">₹{totalAmount.toFixed(2)}</p>
              </div>
            </div>

            {!showPayment ? (
              <form onSubmit={handleProceedToPayment} className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Guest Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Guests</label>
                    <input
                      type="number"
                      value={guestCount}
                      onChange={(e) => setGuestCount(parseInt(e.target.value))}
                      min={1}
                      max={room.max_occupancy}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Any special requests or preferences?"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Proceed to Payment
                </button>
              </form>
            ) : (
              <form onSubmit={handlePayment} className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-6 h-6" />
                  Payment Details
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-700">Credit/Debit Card</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        value="upi"
                        checked={paymentMethod === 'upi'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-700">UPI</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        value="netbanking"
                        checked={paymentMethod === 'netbanking'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-700">Net Banking</span>
                    </label>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    This is a simulated payment. Your booking will be created after processing.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPayment(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : `Pay ₹${totalAmount.toFixed(2)}`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
