import { supabase, Room } from '../lib/supabase';

export const roomService = {
  async getRoomsByHotel(hotelId: string) {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('hotel_id', hotelId)
      .order('price_per_night', { ascending: true });

    if (error) throw error;
    return data as Room[];
  },

  async getRoomById(id: string) {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as Room | null;
  },

  async getAvailableRooms(hotelId: string, checkIn: string, checkOut: string) {
    const { data: bookedRoomIds, error: bookingError } = await supabase
      .from('bookings')
      .select('room_id')
      .eq('hotel_id', hotelId)
      .neq('status', 'CANCELLED')
      .or(`check_in_date.lte.${checkOut},check_out_date.gte.${checkIn}`);

    if (bookingError) throw bookingError;

    const bookedIds = bookedRoomIds?.map(b => b.room_id) || [];

    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('hotel_id', hotelId)
      .eq('is_available', true)
      .not('id', 'in', `(${bookedIds.length > 0 ? bookedIds.join(',') : "''"})`)
      .order('price_per_night', { ascending: true });

    if (error) throw error;
    return data as Room[];
  },

  async createRoom(room: Omit<Room, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('rooms')
      .insert(room)
      .select()
      .single();

    if (error) throw error;
    return data as Room;
  },

  async updateRoom(id: string, updates: Partial<Room>) {
    const { data, error } = await supabase
      .from('rooms')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Room;
  },

  async deleteRoom(id: string) {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
