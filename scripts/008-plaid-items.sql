-- Create plaid_items table to map Supabase users to Plaid item IDs
CREATE TABLE IF NOT EXISTS public.plaid_items (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  item_id TEXT UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  institution_id TEXT,
  institution_name TEXT,
  linked_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_plaid_items_user_id ON public.plaid_items(user_id);

-- Create index for item_id lookups (webhook handler)
CREATE INDEX IF NOT EXISTS idx_plaid_items_item_id ON public.plaid_items(item_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_plaid_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS plaid_items_updated_at_trigger ON public.plaid_items;
CREATE TRIGGER plaid_items_updated_at_trigger
BEFORE UPDATE ON public.plaid_items
FOR EACH ROW
EXECUTE FUNCTION update_plaid_items_updated_at();
