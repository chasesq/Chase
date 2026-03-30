-- Add demo users for testing
-- User 1: LIN HUANG (linhuang011@gmail.com)
-- User 2: Johnny Mercer (johnnymercer1122@gmail.com)

-- Insert LIN HUANG
INSERT INTO public.users (
  email,
  username,
  password_hash,
  full_name,
  phone,
  address,
  member_since,
  tier
) VALUES (
  'linhuang011@gmail.com',
  'LIN HUANG',
  '$2b$10$8q6VQU.8n7K1R0P8V9L2wubBnfJ5l5Y3V3H5C0U0R1E9X0M0Z9R6K',
  'LIN HUANG',
  '+1 (702) 555-0147',
  '123 Main Street, Las Vegas, Nevada NV, USA',
  '2020-01-15',
  'Chase Private Client'
) ON CONFLICT (email) DO NOTHING;

-- Insert Johnny Mercer
INSERT INTO public.users (
  email,
  username,
  password_hash,
  full_name,
  phone,
  address,
  member_since,
  tier
) VALUES (
  'johnnymercer1122@gmail.com',
  'Johnny Mercer',
  '$2b$10$9r7WRV.9o8L2S1Q9W0M3xvcCogK6m6Z4W4I6D1V1S2F0Y1N1A0S7L',
  'Johnny Mercer',
  '+1 (702) 555-0148',
  '456 Oak Avenue, Las Vegas, Nevada NV, USA',
  '2019-06-20',
  'Chase Private Client'
) ON CONFLICT (email) DO NOTHING;
