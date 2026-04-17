/*
  # Create trikal_payments table

  1. New Tables
    - `trikal_payments`
      - `id` (uuid, primary key)
      - `email` (text, required)
      - `name` (text)
      - `amount` (integer, in paise - ₹21 = 2100, ₹11 = 1100, ₹51 = 5100)
      - `tier` (text: 'base', 'addon_redflag', 'addon_timeline', 'bundle')
      - `payment_id` (text, Razorpay payment ID)
      - `order_id` (text, Razorpay order ID)
      - `status` (text: 'pending', 'completed', 'failed')
      - `unlocked_content` (jsonb, stores what was unlocked)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `trikal_payments` table
    - Allow anyone to insert (for payment initiation)
    - Users can read their own payments by email
*/

CREATE TABLE IF NOT EXISTS trikal_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text DEFAULT '',
  amount integer NOT NULL,
  tier text NOT NULL CHECK (tier IN ('base', 'addon_redflag', 'addon_timeline', 'bundle')),
  payment_id text DEFAULT '',
  order_id text DEFAULT '',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  unlocked_content jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trikal_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can initiate payment"
  ON trikal_payments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read own payments"
  ON trikal_payments FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email');

CREATE INDEX idx_trikal_payments_email ON trikal_payments(email);
CREATE INDEX idx_trikal_payments_status ON trikal_payments(status);