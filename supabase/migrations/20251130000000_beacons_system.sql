-- Happy Hour Beacon System
-- Allows members to broadcast their real-time location for spontaneous meetups

-- ============================================================
-- BEACONS TABLE
-- ============================================================
CREATE TABLE beacons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Location (simple DECIMAL like events table)
  lat DECIMAL NOT NULL,
  lng DECIMAL NOT NULL,
  venue_name TEXT,
  venue_address TEXT,

  -- Beacon content
  vibe_text TEXT CHECK (char_length(vibe_text) <= 140),
  duration_hint TEXT CHECK (duration_hint IN ('quick_drink', 'few_hours', 'all_night') OR duration_hint IS NULL),
  tagged_member_ids UUID[] DEFAULT '{}',

  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_beacons_user_id ON beacons(user_id);
CREATE INDEX idx_beacons_status_created ON beacons(status, created_at DESC);
CREATE INDEX idx_beacons_lat_lng ON beacons(lat, lng);

-- Enable Row Level Security
ALTER TABLE beacons ENABLE ROW LEVEL SECURITY;

-- Members can view active beacons (or their own closed ones)
CREATE POLICY "Members can view active beacons"
  ON beacons FOR SELECT
  USING (auth.uid() IS NOT NULL AND (status = 'active' OR user_id = auth.uid()));

-- Users can create their own beacons
CREATE POLICY "Users can create own beacons"
  ON beacons FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own beacons
CREATE POLICY "Users can update own beacons"
  ON beacons FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own beacons
CREATE POLICY "Users can delete own beacons"
  ON beacons FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_beacons_updated_at
  BEFORE UPDATE ON beacons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- BEACON RESPONSES TABLE
-- ============================================================
CREATE TABLE beacon_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  beacon_id UUID NOT NULL REFERENCES beacons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  response_type TEXT NOT NULL CHECK (response_type IN ('on_my_way', 'next_time')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate responses of same type from same user
  UNIQUE(beacon_id, user_id, response_type)
);

-- Indexes
CREATE INDEX idx_beacon_responses_beacon ON beacon_responses(beacon_id);
CREATE INDEX idx_beacon_responses_user ON beacon_responses(user_id);

-- Enable Row Level Security
ALTER TABLE beacon_responses ENABLE ROW LEVEL SECURITY;

-- Members can view all responses
CREATE POLICY "Members can view responses"
  ON beacon_responses FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Members can create responses
CREATE POLICY "Members can create responses"
  ON beacon_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Members can delete their own responses
CREATE POLICY "Members can delete own responses"
  ON beacon_responses FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- BEACON PINGS TABLE (Still There? requests)
-- ============================================================
CREATE TABLE beacon_pings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  beacon_id UUID NOT NULL REFERENCES beacons(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_beacon_pings_beacon ON beacon_pings(beacon_id);
CREATE INDEX idx_beacon_pings_from_user ON beacon_pings(from_user_id);

-- Enable Row Level Security
ALTER TABLE beacon_pings ENABLE ROW LEVEL SECURITY;

-- Beacon owners can view pings on their beacons
CREATE POLICY "Beacon owners can view pings"
  ON beacon_pings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM beacons
      WHERE beacons.id = beacon_pings.beacon_id
      AND beacons.user_id = auth.uid()
    )
  );

-- Members can create pings
CREATE POLICY "Members can create pings"
  ON beacon_pings FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

-- ============================================================
-- ADD BEACON PREFERENCES TO PROFILES
-- ============================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS beacon_radius_miles INTEGER DEFAULT 25;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS beacon_notifications BOOLEAN DEFAULT TRUE;
