import { CheckCircle } from 'lucide-react';
import { Booking, Payment } from '../lib/supabase';

type BookingSuccessPageProps = {
  booking: Booking & { hotels: any; rooms: any };
  payment: Payment;
  onNavigate: (page: string) => void;
};

export function BookingSuccessPage({ booking, payment, onNavigate }: BookingSuccessPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">Your reservation has been successfully confirmed</p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Booking ID</p>
              <p className="font-semibold text-gray-900">{booking.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
              <p className="font-semibold text-gray-900">{payment.transaction_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Hotel</p>
              <p className="font-semibold text-gray-900">{booking.hotels?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Room</p>
              <p className="font-semibold text-gray-900 capitalize">
                {booking.rooms?.room_type} - {booking.rooms?.room_number}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Check-in</p>
              <p className="font-semibold text-gray-900">{booking.check_in_date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Check-out</p>
              <p className="font-semibold text-gray-900">{booking.check_out_date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Guests</p>
              <p className="font-semibold text-gray-900">{booking.guest_count}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
              <p className="font-semibold text-green-600 text-xl">₹{booking.total_amount}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            A confirmation email has been sent to <strong>{booking.guest_email}</strong> with all
            the booking details.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onNavigate('bookings')}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            View My Bookings
          </button>
          <button
            onClick={() => onNavigate('home')}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
