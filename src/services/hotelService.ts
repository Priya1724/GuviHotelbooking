import { supabase, Hotel } from '../lib/supabase';

export const hotelService = {
  async getAllHotels() {
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .order('rating', { ascending: false });

    if (error) throw error;
    return data as Hotel[];
  },

  async getHotelById(id: string) {
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as Hotel | null;
  },

  async getHotelsByCity(city: string) {
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .ilike('city', `%${city}%`)
      .order('rating', { ascending: false });

    if (error) throw error;
    return data as Hotel[];
  },

  async createHotel(hotel: Omit<Hotel, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('hotels')
      .insert(hotel)
      .select()
      .single();

    if (error) throw error;
    return data as Hotel;
  },

  async updateHotel(id: string, updates: Partial<Hotel>) {
    const { data, error } = await supabase
      .from('hotels')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Hotel;
  },

  async deleteHotel(id: string) {
    const { error } = await supabase
      .from('hotels')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
