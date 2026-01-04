/*
  # Create Orders Management System Schema

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `order_number` (text, unique) - Auto-generated order ID
      - `customer_name` (text)
      - `mobile_number` (text)
      - `biryani_type` (text) - Type of biryani ordered
      - `quantity` (integer)
      - `price` (numeric) - Total price
      - `order_type` (text) - Dine-in / Takeaway / Delivery
      - `order_status` (text) - Pending, Cooking, Ready, Completed
      - `payment_mode` (text) - Cash / UPI / Card
      - `advance_payment` (numeric) - Advance amount paid
      - `remaining_amount` (numeric) - Remaining amount to be paid
      - `payment_status` (text) - Paid, Partially Paid, Unpaid
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `orders` table
    - Add policy for public access (shop staff usage)
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  mobile_number text NOT NULL,
  biryani_type text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  price numeric NOT NULL DEFAULT 0,
  -- order_type text NOT NULL DEFAULT 'Dine-in',
  order_status text NOT NULL DEFAULT 'Pending',
  payment_mode text,
  advance_payment numeric DEFAULT 0,
  remaining_amount numeric DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'Unpaid',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to orders"
  ON orders
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_mobile_number ON orders(mobile_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);