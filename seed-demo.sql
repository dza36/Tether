-- =============================================================
-- Tether Demo Seed Script
-- Run against DEV environment with service role (bypasses RLS)
-- Today: 2026-05-16 (Saturday)
-- Evan Smith: 81c561de-dc13-4118-af5d-e57c41b676ce
-- =============================================================

DO $$
DECLARE
  evan_id   uuid := '81c561de-dc13-4118-af5d-e57c41b676ce';
  hh_id     uuid;

  -- Fake user IDs (seeded directly into auth.users)
  laura_id  uuid := 'a2000000-0000-0000-0000-000000000001';
  cole_id   uuid := 'a2000000-0000-0000-0000-000000000002';
  maya_id   uuid := 'a2000000-0000-0000-0000-000000000003';
  marcus_id uuid := 'a2000000-0000-0000-0000-000000000004';
  sofia_id  uuid := 'a2000000-0000-0000-0000-000000000005';
  jin_id    uuid := 'a2000000-0000-0000-0000-000000000006';
  derek_id  uuid := 'a2000000-0000-0000-0000-000000000007';
  ava_id    uuid := 'a2000000-0000-0000-0000-000000000008';
  priya_id  uuid := 'a2000000-0000-0000-0000-000000000009';
  diane_id  uuid := 'a2000000-0000-0000-0000-000000000010';
  tom_id    uuid := 'a2000000-0000-0000-0000-000000000011';
  beth_id   uuid := 'a2000000-0000-0000-0000-000000000012';

  -- Group IDs
  bf_group_id uuid := 'a3000000-0000-0000-0000-000000000001';
  tn_group_id uuid := 'a3000000-0000-0000-0000-000000000002';

  -- Event IDs
  bbq_id uuid := 'a4000000-0000-0000-0000-000000000001';

  -- Task IDs
  grocery_task_id uuid := 'a5000000-0000-0000-0000-000000000001';
  lawn_task_id    uuid := 'a5000000-0000-0000-0000-000000000002';
  chore_task_id   uuid := 'a5000000-0000-0000-0000-000000000003';
  week_task_id    uuid := 'a5000000-0000-0000-0000-000000000004';

  -- Potluck item IDs
  p1 uuid := 'a6000000-0000-0000-0000-000000000001';
  p2 uuid := 'a6000000-0000-0000-0000-000000000002';
  p3 uuid := 'a6000000-0000-0000-0000-000000000003';
  p4 uuid := 'a6000000-0000-0000-0000-000000000004';
  p5 uuid := 'a6000000-0000-0000-0000-000000000005';

BEGIN

-- =============================================================
-- 1. FAKE AUTH USERS
-- =============================================================
INSERT INTO auth.users (id, aud, role, email, email_confirmed_at, encrypted_password, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES
  (laura_id,  'authenticated', 'authenticated', 'laura.smith@demo.tether', now(), '', '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  (cole_id,   'authenticated', 'authenticated', 'cole.smith@demo.tether',  now(), '', '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  (maya_id,   'authenticated', 'authenticated', 'maya.smith@demo.tether',  now(), '', '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  (marcus_id, 'authenticated', 'authenticated', 'marcus@demo.tether',      now(), '', '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  (sofia_id,  'authenticated', 'authenticated', 'sofia@demo.tether',       now(), '', '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  (jin_id,    'authenticated', 'authenticated', 'jin@demo.tether',         now(), '', '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  (derek_id,  'authenticated', 'authenticated', 'derek@demo.tether',       now(), '', '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  (ava_id,    'authenticated', 'authenticated', 'ava@demo.tether',         now(), '', '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  (priya_id,  'authenticated', 'authenticated', 'priya@demo.tether',       now(), '', '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  (diane_id,  'authenticated', 'authenticated', 'diane@demo.tether',       now(), '', '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  (tom_id,    'authenticated', 'authenticated', 'tom@demo.tether',         now(), '', '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  (beth_id,   'authenticated', 'authenticated', 'beth@demo.tether',        now(), '', '{"provider":"email","providers":["email"]}', '{}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 2. USER PROFILES
-- =============================================================
INSERT INTO users (id, display_name, email, onboarded, subscription_tier, created_at, updated_at)
VALUES
  (laura_id,  'Laura Smith', 'laura.smith@demo.tether', true, 'free', now(), now()),
  (cole_id,   'Cole Smith',  'cole.smith@demo.tether',  true, 'free', now(), now()),
  (maya_id,   'Maya Smith',  'maya.smith@demo.tether',  true, 'free', now(), now()),
  (marcus_id, 'Marcus',      'marcus@demo.tether',      true, 'free', now(), now()),
  (sofia_id,  'Sofia',       'sofia@demo.tether',       true, 'free', now(), now()),
  (jin_id,    'Jin',         'jin@demo.tether',         true, 'free', now(), now()),
  (derek_id,  'Derek',       'derek@demo.tether',       true, 'free', now(), now()),
  (ava_id,    'Ava',         'ava@demo.tether',         true, 'free', now(), now()),
  (priya_id,  'Priya',       'priya@demo.tether',       true, 'free', now(), now()),
  (diane_id,  'Diane',       'diane@demo.tether',       true, 'free', now(), now()),
  (tom_id,    'Tom',         'tom@demo.tether',         true, 'free', now(), now()),
  (beth_id,   'Beth',        'beth@demo.tether',        true, 'free', now(), now())
ON CONFLICT (id) DO NOTHING;

UPDATE users SET display_name = 'Evan Smith' WHERE id = evan_id;

-- =============================================================
-- 3. HOUSEHOLD — use existing if present, else create
-- =============================================================
SELECT hm.household_id INTO hh_id
FROM household_members hm
WHERE hm.user_id = evan_id
LIMIT 1;

IF hh_id IS NULL THEN
  hh_id := gen_random_uuid();
  INSERT INTO households (id, name, created_by, status)
  VALUES (hh_id, 'The Smithsonian', evan_id, 'active');
  INSERT INTO household_members (id, household_id, user_id, role)
  VALUES (gen_random_uuid(), hh_id, evan_id, 'admin');
ELSE
  UPDATE households SET name = 'The Smithsonian' WHERE id = hh_id;
END IF;

INSERT INTO household_members (id, household_id, user_id, role)
VALUES
  (gen_random_uuid(), hh_id, laura_id, 'adult'),
  (gen_random_uuid(), hh_id, cole_id,  'child'),
  (gen_random_uuid(), hh_id, maya_id,  'child')
ON CONFLICT (household_id, user_id) DO NOTHING;

-- =============================================================
-- 4. CONTACTS (Evan ↔ all 9, accepted)
-- =============================================================
INSERT INTO contacts (id, requester_id, recipient_id, status)
VALUES
  (gen_random_uuid(), evan_id, marcus_id, 'accepted'),
  (gen_random_uuid(), evan_id, sofia_id,  'accepted'),
  (gen_random_uuid(), evan_id, jin_id,    'accepted'),
  (gen_random_uuid(), evan_id, derek_id,  'accepted'),
  (gen_random_uuid(), evan_id, ava_id,    'accepted'),
  (gen_random_uuid(), evan_id, priya_id,  'accepted'),
  (gen_random_uuid(), evan_id, diane_id,  'accepted'),
  (gen_random_uuid(), evan_id, tom_id,    'accepted'),
  (gen_random_uuid(), evan_id, beth_id,   'accepted')
ON CONFLICT (requester_id, recipient_id) DO NOTHING;

-- =============================================================
-- 5. GROUPS
-- =============================================================
INSERT INTO groups (id, name, type, created_by)
VALUES
  (bf_group_id, 'Best Friends', 'shared', evan_id),
  (tn_group_id, 'Trivia Night', 'shared', evan_id)
ON CONFLICT (id) DO NOTHING;

INSERT INTO group_members (id, group_id, user_id, status, added_by)
VALUES
  -- Best Friends (Evan + 6)
  (gen_random_uuid(), bf_group_id, evan_id,   'accepted', evan_id),
  (gen_random_uuid(), bf_group_id, marcus_id, 'accepted', evan_id),
  (gen_random_uuid(), bf_group_id, sofia_id,  'accepted', evan_id),
  (gen_random_uuid(), bf_group_id, jin_id,    'accepted', evan_id),
  (gen_random_uuid(), bf_group_id, derek_id,  'accepted', evan_id),
  (gen_random_uuid(), bf_group_id, ava_id,    'accepted', evan_id),
  (gen_random_uuid(), bf_group_id, priya_id,  'accepted', evan_id),
  -- Trivia Night (Evan + 3)
  (gen_random_uuid(), tn_group_id, evan_id,  'accepted', evan_id),
  (gen_random_uuid(), tn_group_id, diane_id, 'accepted', evan_id),
  (gen_random_uuid(), tn_group_id, tom_id,   'accepted', evan_id),
  (gen_random_uuid(), tn_group_id, beth_id,  'accepted', evan_id)
ON CONFLICT (group_id, user_id) DO NOTHING;

-- =============================================================
-- 6. MEMORIAL DAY BBQ (Marcus's event, Evan pending)
--    May 25 = 9 days out = Beyond tab
-- =============================================================
INSERT INTO items (id, created_by, item_type, name, status, event_date, start_time, end_time, event_icon, location, guests_can_invite, allow_additional_items)
VALUES (bbq_id, marcus_id, 'event', 'Memorial Day BBQ', 'active', '2026-05-25', '14:00', '20:00', '🍖', 'Marcus''s Place', true, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO event_guests (id, item_id, user_id, is_owner, rsvp_status)
VALUES
  (gen_random_uuid(), bbq_id, marcus_id, true,  'going'),
  (gen_random_uuid(), bbq_id, evan_id,   false, 'pending'),
  (gen_random_uuid(), bbq_id, sofia_id,  false, 'going'),
  (gen_random_uuid(), bbq_id, jin_id,    false, 'going'),
  (gen_random_uuid(), bbq_id, derek_id,  false, 'maybe'),
  (gen_random_uuid(), bbq_id, ava_id,    false, 'going')
ON CONFLICT (item_id, user_id) DO NOTHING;

INSERT INTO potluck_items (id, item_id, name, category, quantity, added_by)
VALUES
  (p1, bbq_id, 'Burgers',        'food',    2, marcus_id),
  (p2, bbq_id, 'Hot Dogs',       'food',    2, marcus_id),
  (p3, bbq_id, 'A case of beer', 'drinks',  1, marcus_id),
  (p4, bbq_id, 'Chips & Dip',    'snacks',  1, marcus_id),
  (p5, bbq_id, 'Dessert',        'food',    1, marcus_id)
ON CONFLICT (id) DO NOTHING;

-- Sofia already claimed burgers
INSERT INTO potluck_claims (id, potluck_item_id, user_id, quantity)
VALUES (gen_random_uuid(), p1, sofia_id, 1)
ON CONFLICT (potluck_item_id, user_id) DO NOTHING;

-- =============================================================
-- 7. TASKS
-- =============================================================

-- Grocery Run — Today
INSERT INTO tether_items (id, user_id, household_id, created_by, name, type, status, date)
VALUES (grocery_task_id, evan_id, hh_id, evan_id, 'Grocery Run', 'grocery', 'active', '2026-05-16')
ON CONFLICT (id) DO NOTHING;

INSERT INTO grocery_items (id, task_id, household_id, name, dept, qty, unit, checked, is_custom, status, added_by)
VALUES
  (gen_random_uuid(), grocery_task_id, hh_id, 'Milk',         'dairy',     1, 'count', false, false, 'active', evan_id),
  (gen_random_uuid(), grocery_task_id, hh_id, 'Eggs',         'dairy',     1, 'count', false, false, 'active', evan_id),
  (gen_random_uuid(), grocery_task_id, hh_id, 'Bread',        'bakery',    1, 'count', false, false, 'active', evan_id),
  (gen_random_uuid(), grocery_task_id, hh_id, 'Chicken',      'meat',      2, 'lbs',   false, false, 'active', evan_id),
  (gen_random_uuid(), grocery_task_id, hh_id, 'Apples',       'produce',   1, 'count', false, false, 'active', evan_id),
  (gen_random_uuid(), grocery_task_id, hh_id, 'Pasta',        'dry goods', 2, 'count', false, false, 'active', evan_id),
  (gen_random_uuid(), grocery_task_id, hh_id, 'Pasta Sauce',  'dry goods', 1, 'count', false, false, 'active', evan_id),
  (gen_random_uuid(), grocery_task_id, hh_id, 'Orange Juice', 'beverages', 1, 'count', false, false, 'active', evan_id);

-- Mow the Lawn — Today
INSERT INTO tether_items (id, user_id, household_id, created_by, name, type, status, date)
VALUES (lawn_task_id, evan_id, hh_id, evan_id, 'Mow the Lawn', 'oneTime', 'active', '2026-05-16')
ON CONFLICT (id) DO NOTHING;

-- Weekend Chores — Today
INSERT INTO tether_items (id, user_id, household_id, created_by, name, type, status, date)
VALUES (chore_task_id, evan_id, hh_id, evan_id, 'Weekend Chores', 'chore', 'active', '2026-05-16')
ON CONFLICT (id) DO NOTHING;

INSERT INTO chore_items (id, task_id, household_id, name, done, status, added_by)
VALUES
  ('a7000000-0000-0000-0000-000000000001', chore_task_id, hh_id, 'Vacuuming',         true,  'active', evan_id),
  ('a7000000-0000-0000-0000-000000000002', chore_task_id, hh_id, 'Clean bathrooms',   false, 'active', evan_id),
  ('a7000000-0000-0000-0000-000000000003', chore_task_id, hh_id, 'Take out trash',    false, 'active', evan_id),
  ('a7000000-0000-0000-0000-000000000004', chore_task_id, hh_id, 'Wipe down kitchen', false, 'active', evan_id)
ON CONFLICT (id) DO NOTHING;

-- Book Campsite — This Week (May 21, 5 days out)
INSERT INTO tether_items (id, user_id, household_id, created_by, name, type, status, date)
VALUES (week_task_id, evan_id, hh_id, evan_id, 'Book Campsite for Summer', 'oneTime', 'active', '2026-05-21')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 8. OCCASIONS
-- Clear any occasions created during onboarding before seeding
-- =============================================================
DELETE FROM occasions WHERE user_id = evan_id;


INSERT INTO occasions (id, user_id, type, name, month, day, year, visibility, status)
VALUES
  ('a8000000-0000-0000-0000-000000000001', evan_id, 'birthday',    'Maya''s Birthday',    7,  10, 2018, 'household', 'active'),
  ('a8000000-0000-0000-0000-000000000002', evan_id, 'anniversary', 'Wedding Anniversary', 10, 12, 2013, 'household', 'active'),
  ('a8000000-0000-0000-0000-000000000003', evan_id, 'remembrance', 'Grandpa Joe',         3,  22, 2009, 'private',   'active')
ON CONFLICT (id) DO NOTHING;

END $$;
