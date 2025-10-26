/*
  # Hotel Booking System Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `phone` (text, optional)
      - `role` (text, default 'user') - either 'user' or 'admin'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `hotels`
      - `id` (uuid, primary key)
      - `name` (text)
      - `city` (text)
      - `address` (text)
      - `description` (text)
      - `rating` (numeric, 0-5 scale)
      - `image_url` (text, optional)
      - `amenities` (jsonb, array of amenities)
      - `created_by` (uuid, references profiles)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `rooms`
      - `id` (uuid, primary key)
      - `hotel_id` (uuid, references hotels)
      - `room_number` (text)
      - `room_type` (text) - e.g., 'single', 'double', 'suite'
      - `description` (text)
      - `price_per_night` (numeric)
      - `max_occupancy` (integer)
      - `image_url` (text, optional)
      - `is_available` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `bookings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `room_id` (uuid, references rooms)
      - `hotel_id` (uuid, references hotels)
      - `check_in_date` (date)
      - `check_out_date` (date)
      - `total_nights` (integer)
      - `total_amount` (numeric)
      - `guest_count` (integer)
      - `guest_name` (text)
      - `guest_email` (text)
      - `guest_phone` (text)
      - `special_requests` (text, optional)
      - `status` (text, default 'PENDING') - 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `payments`
      - `id` (uuid, primary key)
      - `booking_id` (uuid, references bookings)
      - `amount` (numeric)
      - `payment_method` (text) - e.g., 'card', 'upi', 'netbanking'
      - `payment_status` (text, default 'PENDING') - 'PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'
      - `transaction_id` (text, optional)
      - `payment_date` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to:
      - View all hotels and rooms
      - Create and view their own bookings
      - View their own profile and payment history
    - Add policies for admins to:
      - Manage hotels and rooms
      - View all bookings and payments
      - View all user profiles

  3. Important Notes
    - User roles are stored in the profiles table
    - Admins can be identified by role = 'admin'
    - Booking date conflicts are handled at application level
    - Payment simulation is tracked with status updates
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create hotels table
CREATE TABLE IF NOT EXISTS hotels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text NOT NULL,
  address text NOT NULL,
  description text,
  rating numeric(2, 1) CHECK (rating >= 0 AND rating <= 5) DEFAULT 0,
  image_url text,
  amenities jsonb DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  room_number text NOT NULL,
  room_type text NOT NULL,
  description text,
  price_per_night numeric(10, 2) NOT NULL CHECK (price_per_night > 0),
  max_occupancy integer NOT NULL DEFAULT 2 CHECK (max_occupancy > 0),
  image_url text,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(hotel_id, room_number)
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  room_id uuid NOT NULL REFERENCES rooms(id),
  hotel_id uuid NOT NULL REFERENCES hotels(id),
  check_in_date date NOT NULL,
  check_out_date date NOT NULL,
  total_nights integer NOT NULL CHECK (total_nights > 0),
  total_amount numeric(10, 2) NOT NULL CHECK (total_amount > 0),
  guest_count integer NOT NULL DEFAULT 1 CHECK (guest_count > 0),
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  guest_phone text NOT NULL,
  special_requests text,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (check_out_date > check_in_date)
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id),
  amount numeric(10, 2) NOT NULL CHECK (amount > 0),
  payment_method text NOT NULL,
  payment_status text NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED')),
  transaction_id text,
  payment_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_hotels_city ON hotels(city);
CREATE INDEX IF NOT EXISTS idx_rooms_hotel_id ON rooms(hotel_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Hotels policies
CREATE POLICY "Anyone can view hotels"
  ON hotels FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert hotels"
  ON hotels FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update hotels"
  ON hotels FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete hotels"
  ON hotels FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Rooms policies
CREATE POLICY "Anyone can view rooms"
  ON rooms FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert rooms"
  ON rooms FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update rooms"
  ON rooms FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete rooms"
  ON rooms FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Bookings policies
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Payments policies
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = payments.booking_id
      AND bookings.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can create payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = payments.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "System can update payments"
  ON payments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = payments.booking_id
      AND bookings.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = payments.booking_id
      AND bookings.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON hotels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();