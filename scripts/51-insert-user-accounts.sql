-- Insert user accounts for Lin Huang
INSERT INTO public.user_accounts (user_id, account_type, account_number, account_name, balance, currency)
SELECT 
  (SELECT id FROM public.users WHERE email = 'linhuang011@gmail.com'),
  'checking',
  'CHK-****7890',
  'Checking Account',
  0.00,
  'USD'
WHERE EXISTS (SELECT 1 FROM public.users WHERE email = 'linhuang011@gmail.com')
ON CONFLICT (account_number) DO NOTHING;

INSERT INTO public.user_accounts (user_id, account_type, account_number, account_name, balance, currency)
SELECT 
  (SELECT id FROM public.users WHERE email = 'linhuang011@gmail.com'),
  'savings',
  'SAV-****7891',
  'Savings Account',
  0.00,
  'USD'
WHERE EXISTS (SELECT 1 FROM public.users WHERE email = 'linhuang011@gmail.com')
ON CONFLICT (account_number) DO NOTHING;

-- Insert user accounts for Johnny Mercer
INSERT INTO public.user_accounts (user_id, account_type, account_number, account_name, balance, currency)
SELECT 
  (SELECT id FROM public.users WHERE email = 'johnnymercer1122@gmail.com'),
  'checking',
  'CHK-****5678',
  'Checking Account',
  5250.75,
  'USD'
WHERE EXISTS (SELECT 1 FROM public.users WHERE email = 'johnnymercer1122@gmail.com')
ON CONFLICT (account_number) DO NOTHING;

INSERT INTO public.user_accounts (user_id, account_type, account_number, account_name, balance, currency)
SELECT 
  (SELECT id FROM public.users WHERE email = 'johnnymercer1122@gmail.com'),
  'savings',
  'SAV-****5679',
  'Savings Account',
  12500.00,
  'USD'
WHERE EXISTS (SELECT 1 FROM public.users WHERE email = 'johnnymercer1122@gmail.com')
ON CONFLICT (account_number) DO NOTHING;

-- Insert user accounts for CHUN HUNG
INSERT INTO public.user_accounts (user_id, account_type, account_number, account_name, balance, currency)
SELECT 
  (SELECT id FROM public.users WHERE email = 'hungchun164@gmail.com'),
  'checking',
  'CHK-****5001',
  'Checking Account',
  5250.75,
  'USD'
WHERE EXISTS (SELECT 1 FROM public.users WHERE email = 'hungchun164@gmail.com')
ON CONFLICT (account_number) DO NOTHING;

INSERT INTO public.user_accounts (user_id, account_type, account_number, account_name, balance, currency)
SELECT 
  (SELECT id FROM public.users WHERE email = 'hungchun164@gmail.com'),
  'savings',
  'SAV-****5002',
  'Savings Account',
  12500.00,
  'USD'
WHERE EXISTS (SELECT 1 FROM public.users WHERE email = 'hungchun164@gmail.com')
ON CONFLICT (account_number) DO NOTHING;

INSERT INTO public.user_accounts (user_id, account_type, account_number, account_name, balance, currency)
SELECT 
  (SELECT id FROM public.users WHERE email = 'hungchun164@gmail.com'),
  'money_market',
  'MM-****5003',
  'Money Market Account',
  25000.50,
  'USD'
WHERE EXISTS (SELECT 1 FROM public.users WHERE email = 'hungchun164@gmail.com')
ON CONFLICT (account_number) DO NOTHING;
