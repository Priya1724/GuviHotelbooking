import { supabase } from '../lib/supabase';

export const adminService = {
  async getDashboardStats() {
    const [usersResult, hotelsResult, bookingsResult, paymentsResult] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('hotels').select('id', { count: 'exact', head: true }),
      supabase.from('bookings').select('id', { count: 'exact', head: true }),
      supabase.from('payments').select('amount').eq('payment_status', 'SUCCESS'),
    ]);

    const totalRevenue = paymentsResult.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    return {
      totalUsers: usersResult.count || 0,
      totalHotels: hotelsResult.count || 0,
      totalBookings: bookingsResult.count || 0,
      totalRevenue,
    };
  },

  async getRecentBookings(limit: number = 10) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        hotels:hotel_id(name, city),
        rooms:room_id(room_number, room_type),
        profiles:user_id(full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async getAllUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getBookingsByStatus() {
    const { data, error } = await supabase
      .from('bookings')
      .select('status');

    if (error) throw error;

    const stats = data.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return stats;
  },
};
