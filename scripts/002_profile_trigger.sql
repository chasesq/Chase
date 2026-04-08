-- Function to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_account_number TEXT;
BEGIN
  -- Generate a unique account number
  new_account_number := 'CHK-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    phone,
    username,
    account_number,
    balance,
    tier,
    member_since
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', NULL),
    COALESCE(new.raw_user_meta_data ->> 'phone', NULL),
    COALESCE(new.raw_user_meta_data ->> 'username', SPLIT_PART(new.email, '@', 1)),
    new_account_number,
    0.00,
    'basic',
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
