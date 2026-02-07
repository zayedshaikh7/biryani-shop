-- Profiles + Orders flexible pricing + shop scoping
BEGIN;

-- Create profiles table for onboarding
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only access their own profile
CREATE POLICY IF NOT EXISTS profiles_select_own ON public.profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS profiles_insert_own ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Alter orders for shop scoping and flexible pricing
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS shop_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS unit_price numeric DEFAULT 0;

-- Allow fractional quantities (e.g., 1.5)
ALTER TABLE public.orders
  ALTER COLUMN quantity TYPE numeric USING quantity::numeric;

-- Enforce authenticated-only access scoped to shop_id
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Remove any previous anon-wide policy if present
DROP POLICY IF EXISTS "Allow public access to orders" ON public.orders;

CREATE POLICY IF NOT EXISTS orders_select_own ON public.orders
  FOR SELECT TO authenticated
  USING (shop_id = auth.uid());

CREATE POLICY IF NOT EXISTS orders_insert_own ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (shop_id = auth.uid());

CREATE POLICY IF NOT EXISTS orders_update_own ON public.orders
  FOR UPDATE TO authenticated
  USING (shop_id = auth.uid())
  WITH CHECK (shop_id = auth.uid());

CREATE POLICY IF NOT EXISTS orders_delete_own ON public.orders
  FOR DELETE TO authenticated
  USING (shop_id = auth.uid());

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_orders_shop_id_created_at ON public.orders(shop_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

COMMIT;