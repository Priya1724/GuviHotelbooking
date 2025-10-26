import { supabase, Booking } from '../lib/supabase';

export const bookingService = {
  async createBooking(booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) {
    const hasConflict = await this.checkDateConflict(
      booking.room_id,
      booking.check_in_date,
      booking.check_out_date
    );

    if (hasConflict) {
      throw new Error('Room is not available for the selected dates');
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single();

    if (error) throw error;
    return data as Booking;
  },

  async checkDateConflict(roomId: string, checkIn: string, checkOut: string, excludeBookingId?: string) {
    let query = supabase
      .from('bookings')
      .select('id')
      .eq('room_id', roomId)
      .neq('status', 'CANCELLED')
      .or(`and(check_in_date.lte.${checkOut},check_out_date.gte.${checkIn})`);

    if (excludeBookingId) {
      query = query.neq('id', excludeBookingId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data && data.length > 0;
  },

  async getUserBookings(userId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        hotels:hotel_id(name, city, address, image_url),
        rooms:room_id(room_number, room_type, price_per_night)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getBookingById(id: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        hotels:hotel_id(name, city, address, image_url),
        rooms:room_id(room_number, room_type, price_per_night)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getAllBookings() {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        hotels:hotel_id(name, city),
        rooms:room_id(room_number, room_type),
        profiles:user_id(full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateBookingStatus(id: string, status: Booking['status']) {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Booking;
  },

  async cancelBooking(id: string) {
    return this.updateBookingStatus(id, 'CANCELLED');
  },
};
