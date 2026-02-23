-- Prague Underground: tables, trigger, storage bucket, and RLS policies

-- === TABLES ===

CREATE TABLE IF NOT EXISTS prague_underground_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  display_name TEXT,
  total_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS prague_underground_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES prague_underground_users(id) ON DELETE CASCADE,
  venue_id TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  notes TEXT,
  points_awarded INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, venue_id)
);

CREATE INDEX IF NOT EXISTS idx_pu_claims_user_id ON prague_underground_claims(user_id);

-- === TRIGGER: Auto-update total_points on user after claim insert ===

CREATE OR REPLACE FUNCTION update_pu_user_total_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE prague_underground_users
  SET total_points = (
    SELECT COALESCE(SUM(points_awarded), 0)
    FROM prague_underground_claims
    WHERE user_id = NEW.user_id
  ),
  updated_at = now()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_pu_update_points ON prague_underground_claims;
CREATE TRIGGER trg_pu_update_points
  AFTER INSERT ON prague_underground_claims
  FOR EACH ROW
  EXECUTE FUNCTION update_pu_user_total_points();

-- === RLS: Open policies (slug is the access control, no Supabase Auth) ===

ALTER TABLE prague_underground_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE prague_underground_claims ENABLE ROW LEVEL SECURITY;

-- Users table: allow all operations via anon key
CREATE POLICY "pu_users_select" ON prague_underground_users FOR SELECT USING (true);
CREATE POLICY "pu_users_insert" ON prague_underground_users FOR INSERT WITH CHECK (true);
CREATE POLICY "pu_users_update" ON prague_underground_users FOR UPDATE USING (true);

-- Claims table: allow all operations via anon key
CREATE POLICY "pu_claims_select" ON prague_underground_claims FOR SELECT USING (true);
CREATE POLICY "pu_claims_insert" ON prague_underground_claims FOR INSERT WITH CHECK (true);

-- === STORAGE BUCKET ===

INSERT INTO storage.buckets (id, name, public)
VALUES ('prague-underground', 'prague-underground', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: public read, permissive insert
CREATE POLICY "pu_storage_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'prague-underground');

CREATE POLICY "pu_storage_public_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'prague-underground');
