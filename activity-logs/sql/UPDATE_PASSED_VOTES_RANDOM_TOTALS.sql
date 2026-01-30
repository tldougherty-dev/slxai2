-- Update existing passed votes to have random total votes between 30-40
-- Run this in Supabase SQL Editor if votes are already inserted

-- Update Motion 1: Board Roles
UPDATE vote_options
SET votes = CASE 
  WHEN label = 'Yes' THEN floor(random() * 11)::int + 30
  WHEN label = 'No' THEN 0
  ELSE votes
END
WHERE vote_id IN (
  SELECT id FROM votes 
  WHERE title = 'Motion 1 for Board Roles' 
  AND status = 'closed'
);

-- Update Motion 2: Election Timing
UPDATE vote_options
SET votes = CASE 
  WHEN label = 'Yes' THEN floor(random() * 11)::int + 30
  WHEN label = 'No' THEN 0
  ELSE votes
END
WHERE vote_id IN (
  SELECT id FROM votes 
  WHERE title = 'Motion 2 for Election Timing' 
  AND status = 'closed'
);

-- Update Motion 3: Waiving Membership Dues
UPDATE vote_options
SET votes = CASE 
  WHEN label = 'Yes' THEN floor(random() * 11)::int + 30
  WHEN label = 'No' THEN 0
  ELSE votes
END
WHERE vote_id IN (
  SELECT id FROM votes 
  WHERE title = 'Motion 3 for Waiving Membership Dues' 
  AND status = 'closed'
);

