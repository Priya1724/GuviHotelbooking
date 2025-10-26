import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { roomService } from '../services/roomService';
import { Hotel, Room } from '../lib/supabase';

type AdminManageRoomsProps = {
  hotel: Hotel;
  onNavigate: (page: string) => void;
};

export function AdminManageRooms({ hotel, onNavigate }: AdminManageRoomsProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    room_number: '',
    room_type: 'single',
    description: '',
    price_per_night: '',
    max_occupancy: '2',
    image_url: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRooms();
  }, [hotel.id]);

  const loadRooms = async () => {
    try {
      const data = await roomService.getRoomsByHotel(hotel.id);
      setRooms(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await roomService.createRoom({
        hotel_id: hotel.id,
        room_number: formData.room_number,
        room_type: formData.room_type,
        description: formData.description || null,
        price_per_night: parseFloat(formData.price_per_night),
        max_occupancy: parseInt(formData.max_occupancy),
        image_url: formData.image_url || null,
        is_available: true,
      });

      setFormData({
        room_number: '',
        room_type: 'single',
        description: '',
        price_per_night: '',
        max_occupancy: '2',
        image_url: '',
      });
      setShowForm(false);
      loadRooms();
    } catch (err: any) {
      setError(err.message || 'Failed to create room');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;

    try {
      await roomService.deleteRoom(roomId);
      loadRooms();
    } catch (err: any) {
      alert(err.message || 'Failed to delete room');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => onNavigate('admin')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{hotel.name}</h1>
            <p className="text-gray-600 mt-1">Manage Rooms</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Room
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Room</h2>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Room Number</label>
                  <input
                    type="text"
                    value={formData.room_number}
                    onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
                  <select
                    value={formData.room_type}
                    onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  >
                    <option value="single">Single</option>
                    <option value="double">Double</option>
                    <option value="suite">Suite</option>
                    <option value="deluxe">Deluxe</option>
                    <option value="presidential">Presidential</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price per Night (₹)</label>
                  <input
                    type="number"
                    value={formData.price_per_night}
                    onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Occupancy</label>
                  <input
                    type="number"
                    value={formData.max_occupancy}
                    onChange={(e) => setFormData({ ...formData, max_occupancy: e.target.value })}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading rooms...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600 text-lg">No rooms yet. Add your first room!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div key={room.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="h-40 bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
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
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  {room.description && (
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{room.description}</p>
                  )}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <div>
                      <p className="text-xl font-bold text-gray-900">₹{room.price_per_night}</p>
                      <p className="text-xs text-gray-500">per night</p>
                    </div>
                    <p className="text-sm text-gray-600">Max: {room.max_occupancy}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
