import { Users } from 'lucide-react';
import { Room } from '../lib/supabase';

type RoomCardProps = {
  room: Room;
  onBook: (room: Room) => void;
};

export function RoomCard({ room, onBook }: RoomCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-lg">
      <div className="h-40 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
        {room.image_url ? (
          <img src={room.image_url} alt={room.room_type} className="w-full h-full object-cover" />
        ) : (
          <div className="text-white text-5xl font-bold opacity-20">{room.room_number}</div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="text-lg font-bold text-gray-900 capitalize">{room.room_type}</h4>
            <p className="text-sm text-gray-500">Room {room.room_number}</p>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Users className="w-4 h-4" />
            <span className="text-sm">{room.max_occupancy}</span>
          </div>
        </div>
        {room.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{room.description}</p>
        )}
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
          <div>
            <span className="text-2xl font-bold text-gray-900">₹{room.price_per_night}</span>
            <span className="text-sm text-gray-500">/night</span>
          </div>
          <button
            onClick={() => onBook(room)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
