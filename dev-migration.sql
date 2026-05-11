-- =============================================
-- Tether Dev Migration
-- Paste this into your dev Supabase SQL Editor
-- =============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- ENUM TYPES
-- ─────────────────────────────────────────────
CREATE TYPE rsvp_status       AS ENUM ('pending', 'going', 'not_going', 'maybe');
CREATE TYPE household_role    AS ENUM ('admin', 'adult', 'child');
CREATE TYPE visibility_level  AS ENUM ('full', 'summary');
CREATE TYPE invite_type       AS ENUM ('household', 'event');
CREATE TYPE invite_status     AS ENUM ('pending', 'accepted', 'declined', 'expired', 'cancelled');
CREATE TYPE item_type         AS ENUM ('chore', 'shopping_list', 'event', 'appointment', 'general');
CREATE TYPE item_visibility   AS ENUM ('household', 'adults_only', 'assigned_only', 'private');
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'lifetime', 'founder', 'employee', 'creator');

-- ─────────────────────────────────────────────
-- TABLES
-- ─────────────────────────────────────────────

CREATE TABLE users (
  id                 uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name       text,
  avatar_url         text,
  email              text,
  onboarded          boolean DEFAULT false,
  birthday           text,
  show_birth_year    boolean DEFAULT false,
  other_dates        jsonb DEFAULT '[]',
  holidays_enabled   boolean DEFAULT false,
  party_days_enabled boolean DEFAULT false,
  preferences        jsonb DEFAULT '{}',
  subscription_tier  subscription_tier DEFAULT 'free',
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now()
);

CREATE TABLE households (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text NOT NULL,
  created_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status      text DEFAULT 'active',
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE household_members (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id  uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role          household_role DEFAULT 'adult',
  joined_at     timestamptz DEFAULT now(),
  UNIQUE(household_id, user_id)
);

CREATE TABLE household_invites (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id    uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  invited_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status          invite_status DEFAULT 'pending',
  request_type    text DEFAULT 'invite',
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE tether_items (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id    uuid REFERENCES households(id) ON DELETE SET NULL,
  created_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name            text NOT NULL,
  type            text,
  status          text DEFAULT 'active',
  days            integer,
  weekdays        integer[],
  month_days      integer[],
  week_interval   integer DEFAULT 1,
  month_day       integer,
  month_week      integer,
  month_weekday   integer,
  year_interval   integer DEFAULT 1,
  date            text,
  due_date        text,
  alt_due_date    text,
  last_done       text,
  checklist       jsonb DEFAULT '[]',
  start_time      text,
  end_time        text,
  is_urgent       boolean DEFAULT false,
  event_icon      text,
  note            text,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE tether_completions (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id      uuid REFERENCES tether_items(id) ON DELETE CASCADE,
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  note         text,
  completed_at timestamptz DEFAULT now()
);

CREATE TABLE chore_items (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id      uuid NOT NULL REFERENCES tether_items(id) ON DELETE CASCADE,
  household_id uuid REFERENCES households(id) ON DELETE SET NULL,
  name         text NOT NULL,
  done         boolean DEFAULT false,
  status       text DEFAULT 'active',
  added_by     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE items (
  id                     uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id           uuid REFERENCES households(id) ON DELETE SET NULL,
  created_by             uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  item_type              item_type DEFAULT 'event',
  name                   text NOT NULL,
  status                 text DEFAULT 'active',
  event_date             text,
  end_date               text,
  start_time             text,
  end_time               text,
  event_icon             text,
  location               text,
  visibility             visibility_level DEFAULT 'full',
  guests_can_invite      boolean DEFAULT true,
  allow_additional_items boolean DEFAULT true,
  snoozed_until          text,
  created_at             timestamptz DEFAULT now(),
  updated_at             timestamptz DEFAULT now()
);

CREATE TABLE event_guests (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id     uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_owner    boolean DEFAULT false,
  rsvp_status rsvp_status DEFAULT 'pending',
  note        text,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(item_id, user_id)
);

CREATE TABLE potluck_items (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id    uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  name       text NOT NULL,
  category   text,
  quantity   integer DEFAULT 1,
  added_by   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE potluck_claims (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  potluck_item_id uuid NOT NULL REFERENCES potluck_items(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quantity        integer DEFAULT 1,
  created_at      timestamptz DEFAULT now(),
  UNIQUE(potluck_item_id, user_id)
);

CREATE TABLE grocery_items (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id      uuid NOT NULL REFERENCES tether_items(id) ON DELETE CASCADE,
  household_id uuid REFERENCES households(id) ON DELETE SET NULL,
  name         text NOT NULL,
  dept         text DEFAULT 'misc',
  qty          numeric DEFAULT 1,
  unit         text DEFAULT 'count',
  size         text,
  note         text,
  checked      boolean DEFAULT false,
  is_custom    boolean DEFAULT false,
  status       text DEFAULT 'active',
  added_by     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE groups (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       text NOT NULL,
  type       text DEFAULT 'shared',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE group_members (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id      uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_email text,
  status        text DEFAULT 'accepted',
  added_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  added_at      timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

CREATE TABLE contacts (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status       text DEFAULT 'pending',
  created_at   timestamptz DEFAULT now(),
  UNIQUE(requester_id, recipient_id)
);

CREATE TABLE occasions (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        text NOT NULL CHECK (type IN ('birthday', 'anniversary', 'remembrance')),
  name        text NOT NULL,
  month       integer NOT NULL CHECK (month >= 1 AND month <= 12),
  day         integer NOT NULL CHECK (day >= 1 AND day <= 31),
  year        integer,
  notes       text,
  visibility  text DEFAULT 'private' CHECK (visibility IN ('private', 'household', 'contacts')),
  contact_id  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status      text DEFAULT 'active',
  merged_into uuid REFERENCES occasions(id) ON DELETE SET NULL,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────
-- FUNCTIONS AND TRIGGERS
-- ─────────────────────────────────────────────

-- Auto-create user row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  )
  ON CONFLICT (id) DO UPDATE SET
    email        = EXCLUDED.email,
    display_name = COALESCE(EXCLUDED.display_name, public.users.display_name),
    avatar_url   = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER set_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Security definer helpers to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_my_household_ids()
RETURNS uuid[] LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT ARRAY(SELECT household_id FROM household_members WHERE user_id = auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.get_my_event_ids()
RETURNS uuid[] LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT ARRAY(SELECT item_id FROM event_guests WHERE user_id = auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.get_my_created_event_ids()
RETURNS uuid[] LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT ARRAY(SELECT id FROM items WHERE created_by = auth.uid())
$$;

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
ALTER TABLE users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE households         ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_invites  ENABLE ROW LEVEL SECURITY;
ALTER TABLE tether_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE tether_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chore_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE items              ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_guests       ENABLE ROW LEVEL SECURITY;
ALTER TABLE potluck_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE potluck_claims     ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups             ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members      ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts           ENABLE ROW LEVEL SECURITY;

-- users
CREATE POLICY "users: read self"
  ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users: update self"
  ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users: insert self"
  ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users: read household members"
  ON users FOR SELECT USING (
    id IN (SELECT user_id FROM household_members WHERE household_id = ANY(get_my_household_ids()))
  );
CREATE POLICY "users: read contacts"
  ON users FOR SELECT USING (
    id IN (
      SELECT recipient_id FROM contacts WHERE requester_id = auth.uid() AND status = 'accepted'
      UNION
      SELECT requester_id FROM contacts WHERE recipient_id = auth.uid() AND status = 'accepted'
    )
  );

-- households
CREATE POLICY "households: read for members"
  ON households FOR SELECT USING (id = ANY(get_my_household_ids()));
CREATE POLICY "households: insert for authenticated"
  ON households FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "households: update for admin"
  ON households FOR UPDATE USING (id = ANY(get_my_household_ids()));
CREATE POLICY "households: delete for admin"
  ON households FOR DELETE USING (id = ANY(get_my_household_ids()));

-- household_members
CREATE POLICY "household_members: read for members"
  ON household_members FOR SELECT USING (
    user_id = auth.uid() OR household_id = ANY(get_my_household_ids())
  );
CREATE POLICY "household_members: insert own"
  ON household_members FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "household_members: insert for admin or self"
  ON household_members FOR INSERT WITH CHECK (
    user_id = auth.uid() OR household_id = ANY(get_my_household_ids())
  );
CREATE POLICY "household_members: delete for admin or self"
  ON household_members FOR DELETE USING (
    user_id = auth.uid() OR household_id = ANY(get_my_household_ids())
  );

-- household_invites
CREATE POLICY "household_invites: read own or admin"
  ON household_invites FOR SELECT USING (
    invited_user_id = auth.uid() OR household_id = ANY(get_my_household_ids())
  );
CREATE POLICY "household_invites: insert for admin"
  ON household_invites FOR INSERT WITH CHECK (
    household_id = ANY(get_my_household_ids())
  );
CREATE POLICY "household_invites: update own or admin"
  ON household_invites FOR UPDATE USING (
    invited_user_id = auth.uid() OR household_id = ANY(get_my_household_ids())
  );
CREATE POLICY "household_invites: delete for admin"
  ON household_invites FOR DELETE USING (
    household_id = ANY(get_my_household_ids())
  );

-- tether_items
CREATE POLICY "tether_items: all for owner"
  ON tether_items FOR ALL USING (user_id = auth.uid());
CREATE POLICY "tether_items: read for household"
  ON tether_items FOR SELECT USING (household_id = ANY(get_my_household_ids()));

-- tether_completions
CREATE POLICY "tether_completions: all own"
  ON tether_completions FOR ALL USING (user_id = auth.uid());
CREATE POLICY "tether_completions: read household"
  ON tether_completions FOR SELECT USING (
    item_id IN (SELECT id FROM tether_items WHERE household_id = ANY(get_my_household_ids()))
  );

-- chore_items
CREATE POLICY "chore_items: all for household or owner"
  ON chore_items FOR ALL USING (
    household_id = ANY(get_my_household_ids())
    OR task_id IN (SELECT id FROM tether_items WHERE user_id = auth.uid())
  );

-- items (events)
CREATE POLICY "items: all for creator"
  ON items FOR ALL USING (created_by = auth.uid());
CREATE POLICY "items: read for household"
  ON items FOR SELECT USING (household_id = ANY(get_my_household_ids()));
CREATE POLICY "items: read for guests"
  ON items FOR SELECT USING (id = ANY(get_my_event_ids()));

-- event_guests
CREATE POLICY "event_guests: all own"
  ON event_guests FOR ALL USING (user_id = auth.uid());
CREATE POLICY "event_guests: read for event creator"
  ON event_guests FOR SELECT USING (
    user_id = auth.uid() OR item_id = ANY(get_my_created_event_ids())
  );
CREATE POLICY "event_guests: insert for event creator"
  ON event_guests FOR INSERT WITH CHECK (
    item_id IN (SELECT id FROM items WHERE created_by = auth.uid())
  );
CREATE POLICY "event_guests: delete for event creator"
  ON event_guests FOR DELETE USING (
    item_id IN (SELECT id FROM items WHERE created_by = auth.uid())
  );

-- potluck_items
CREATE POLICY "potluck_items: all for creator"
  ON potluck_items FOR ALL USING (added_by = auth.uid());
CREATE POLICY "potluck_items: read for event guests"
  ON potluck_items FOR SELECT USING (item_id = ANY(get_my_event_ids()));
CREATE POLICY "potluck_items: insert for event guests"
  ON potluck_items FOR INSERT WITH CHECK (item_id = ANY(get_my_event_ids()));

-- potluck_claims
CREATE POLICY "potluck_claims: all own"
  ON potluck_claims FOR ALL USING (user_id = auth.uid());
CREATE POLICY "potluck_claims: read for event guests"
  ON potluck_claims FOR SELECT USING (
    potluck_item_id IN (
      SELECT pi.id FROM potluck_items pi
      JOIN event_guests eg ON eg.item_id = pi.item_id
      WHERE eg.user_id = auth.uid()
    )
  );

-- grocery_items
CREATE POLICY "grocery_items: all for household"
  ON grocery_items FOR ALL USING (
    household_id = ANY(get_my_household_ids())
    OR task_id IN (SELECT id FROM tether_items WHERE user_id = auth.uid())
  );

-- groups
CREATE POLICY "groups: all for creator"
  ON groups FOR ALL USING (created_by = auth.uid());
CREATE POLICY "groups: read for members"
  ON groups FOR SELECT USING (
    id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );
CREATE POLICY "groups: read all"
  ON groups FOR SELECT USING (true);

-- group_members
CREATE POLICY "group_members: all for group creator"
  ON group_members FOR ALL USING (
    group_id IN (SELECT id FROM groups WHERE created_by = auth.uid())
  );
CREATE POLICY "group_members: read own"
  ON group_members FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "group_members: read all"
  ON group_members FOR SELECT USING (true);
CREATE POLICY "group_members: update own"
  ON group_members FOR UPDATE USING (
    user_id = auth.uid()
    OR invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
CREATE POLICY "group_members: delete own"
  ON group_members FOR DELETE USING (user_id = auth.uid());

-- contacts
CREATE POLICY "contacts: all own"
  ON contacts FOR ALL USING (
    requester_id = auth.uid() OR recipient_id = auth.uid()
  );

-- Allows looking up any user by email to send a contact request.
-- SECURITY DEFINER bypasses RLS; returns only id/display_name/avatar_url.
CREATE OR REPLACE FUNCTION lookup_user_by_email(target_email text)
RETURNS TABLE(id uuid, display_name text, avatar_url text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, display_name, avatar_url
  FROM users
  WHERE lower(email) = lower(target_email)
  LIMIT 1;
$$;

ALTER TABLE occasions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "occasions: all own"
  ON occasions FOR ALL USING (user_id = auth.uid());
CREATE POLICY "occasions: read household"
  ON occasions FOR SELECT USING (
    visibility IN ('household', 'contacts')
    AND user_id IN (
      SELECT user_id FROM household_members
      WHERE household_id = ANY(get_my_household_ids())
    )
  );

-- ─────────────────────────────────────────────
-- COMMUNITY SUGGESTIONS
-- ─────────────────────────────────────────────

ALTER TABLE users ADD COLUMN IF NOT EXISTS anonymous_submissions boolean DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS community_points integer DEFAULT 0;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND subscription_tier IN ('founder', 'employee')
  )
$$;

CREATE TABLE board_items (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       text NOT NULL,
  description text,
  status      text NOT NULL DEFAULT 'active'
              CHECK (status IN ('active', 'in_progress', 'shipped', 'declined')),
  created_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE TABLE suggestions (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content       text NOT NULL,
  anonymous     boolean NOT NULL DEFAULT false,
  status        text NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'listed', 'merged', 'not_now')),
  board_item_id uuid REFERENCES board_items(id) ON DELETE SET NULL,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE suggestion_votes (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  suggestion_id uuid NOT NULL REFERENCES suggestions(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type     text NOT NULL CHECK (vote_type IN ('like', 'need')),
  created_at    timestamptz DEFAULT now(),
  UNIQUE(suggestion_id, user_id)
);

CREATE OR REPLACE TRIGGER set_board_items_updated_at
  BEFORE UPDATE ON board_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE board_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestion_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "board_items: read active"
  ON board_items FOR SELECT USING (status != 'declined' OR is_admin());
CREATE POLICY "board_items: admin all"
  ON board_items FOR ALL USING (is_admin());

CREATE POLICY "suggestions: insert own"
  ON suggestions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "suggestions: read own"
  ON suggestions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "suggestions: read public"
  ON suggestions FOR SELECT USING (status IN ('listed', 'merged'));
CREATE POLICY "suggestions: admin all"
  ON suggestions FOR ALL USING (is_admin());

CREATE POLICY "suggestion_votes: manage own"
  ON suggestion_votes FOR ALL USING (user_id = auth.uid());
CREATE POLICY "suggestion_votes: read all"
  ON suggestion_votes FOR SELECT USING (true);

CREATE POLICY "users: admin read all"
  ON users FOR SELECT USING (is_admin());
