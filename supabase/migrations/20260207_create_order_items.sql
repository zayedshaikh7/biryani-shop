/*
  # Create order_items table for multi-item orders

  - Each order can have multiple items
  - Scoped by shop_id for RLS consistency with orders
*/
-- 1. BEGIN TRANSACTION
BEGIN;

-- 2. SETUP PROFILES TABLE
-- This fixes the "Could not find 'user_id' column" error
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. SETUP ORDER_ITEMS TABLE
-- This allows one order to have many products
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  shop_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1, -- Supports decimals like 1.5 KG
  unit_price numeric NOT NULL DEFAULT 0,
  line_total numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. ENABLE SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 5. SET SECURITY POLICIES
-- We drop them first to avoid "42601 syntax error" with IF NOT EXISTS
DROP POLICY IF EXISTS profiles_owner_policy ON public.profiles;
CREATE POLICY profiles_owner_policy ON public.profiles 
  FOR ALL TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS order_items_owner_policy ON public.order_items;
CREATE POLICY order_items_owner_policy ON public.order_items
  FOR ALL TO authenticated USING (shop_id = auth.uid()) WITH CHECK (shop_id = auth.uid());

-- 6. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_shop_id ON public.order_items(shop_id);

-- 7. FINISH TRANSACTION
COMMIT;