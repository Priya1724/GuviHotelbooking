import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
};

export type Hotel = {
  id: string;
  name: string;
  city: string;
  address: string;
  description: string | null;
  rating: number;
  image_url: string | null;
  amenities: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Room = {
  id: string;
  hotel_id: string;
  room_number: string;
  room_type: string;
  description: string | null;
  price_per_night: number;
  max_occupancy: number;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
};

export type Booking = {
  id: string;
  user_id: string;
  room_id: string;
  hotel_id: string;
  check_in_date: string;
  check_out_date: string;
  total_nights: number;
  total_amount: number;
  guest_count: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  special_requests: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  created_at: string;
  updated_at: string;
};

export type Payment = {
  id: string;
  booking_id: string;
  amount: number;
  payment_method: string;
  payment_status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  transaction_id: string | null;
  payment_date: string;
  created_at: string;
};
