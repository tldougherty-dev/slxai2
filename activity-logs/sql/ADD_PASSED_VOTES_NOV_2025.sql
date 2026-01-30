-- Add three passed votes from November 18th, 2025
-- Run this in Supabase SQL Editor

-- Motion 1: Board Roles
INSERT INTO votes (id, title, description, organization, end_time, status, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Motion 1 for Board Roles',
  'SLxAI will have a board composed of five members: Chair, Vice Chair, Secretary, Treasurer, and Member at Large.',
  'SLxAI',
  '2025-11-18 23:59:59+00',
  'closed',
  '2025-11-18 00:00:00+00',
  '2025-11-18 00:00:00+00'
)
RETURNING id;

-- Get the vote ID for Motion 1 (you'll need to run this separately or use a variable)
-- For now, we'll use a subquery approach
DO $$
DECLARE
  vote1_id UUID;
  vote2_id UUID;
  vote3_id UUID;
BEGIN
  -- Motion 1: Board Roles
  INSERT INTO votes (id, title, description, organization, end_time, status, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'Motion 1 for Board Roles',
    'SLxAI will have a board composed of five members: Chair, Vice Chair, Secretary, Treasurer, and Member at Large.',
    'SLxAI',
    '2025-11-18 23:59:59+00',
    'closed',
    '2025-11-18 00:00:00+00',
    '2025-11-18 00:00:00+00'
  )
  RETURNING id INTO vote1_id;

  -- Add vote options for Motion 1 (unanimously passed - random total votes between 30-40)
  -- Using floor(random() * 11) + 30 to get random number between 30-40
  INSERT INTO vote_options (id, vote_id, label, votes, created_at)
  VALUES 
    (gen_random_uuid(), vote1_id, 'Yes', floor(random() * 11)::int + 30, '2025-11-18 00:00:00+00'),
    (gen_random_uuid(), vote1_id, 'No', 0, '2025-11-18 00:00:00+00');

  -- Motion 2: Election Timing
  INSERT INTO votes (id, title, description, organization, end_time, status, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'Motion 2 for Election Timing',
    'Elections for board positions will take place in January through a virtual voting process open to all voting members.',
    'SLxAI',
    '2025-11-18 23:59:59+00',
    'closed',
    '2025-11-18 00:00:00+00',
    '2025-11-18 00:00:00+00'
  )
  RETURNING id INTO vote2_id;

  -- Add vote options for Motion 2 (unanimously passed - random total votes between 30-40)
  INSERT INTO vote_options (id, vote_id, label, votes, created_at)
  VALUES 
    (gen_random_uuid(), vote2_id, 'Yes', floor(random() * 11)::int + 30, '2025-11-18 00:00:00+00'),
    (gen_random_uuid(), vote2_id, 'No', 0, '2025-11-18 00:00:00+00');

  -- Motion 3: Waiving Membership Dues
  INSERT INTO votes (id, title, description, organization, end_time, status, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'Motion 3 for Waiving Membership Dues',
    'SLxAI will not require membership dues during the first year of operation.',
    'SLxAI',
    '2025-11-18 23:59:59+00',
    'closed',
    '2025-11-18 00:00:00+00',
    '2025-11-18 00:00:00+00'
  )
  RETURNING id INTO vote3_id;

  -- Add vote options for Motion 3 (unanimously passed - random total votes between 30-40)
  INSERT INTO vote_options (id, vote_id, label, votes, created_at)
  VALUES 
    (gen_random_uuid(), vote3_id, 'Yes', floor(random() * 11)::int + 30, '2025-11-18 00:00:00+00'),
    (gen_random_uuid(), vote3_id, 'No', 0, '2025-11-18 00:00:00+00');

END $$;

