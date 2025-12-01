-- D&D Character System
-- Converts assessment results into Race, Class, Alignment, and Attributes
-- Powers identity features like Breakouts ("Summon the Orcs")

-- ============================================================
-- MEMBER_CHARACTERS TABLE
-- ============================================================
CREATE TABLE member_characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Core D&D Identity
  race TEXT NOT NULL CHECK (race IN (
    'human', 'elf', 'dwarf', 'orc', 'halfling', 'dragonborn'
  )),

  -- Class (54 possible classes - validated at application layer)
  class TEXT NOT NULL,

  -- Alignment (9-point grid)
  alignment TEXT NOT NULL CHECK (alignment IN (
    'LG', 'NG', 'CG',  -- Good row
    'LN', 'TN', 'CN',  -- Neutral row
    'LE', 'NE', 'CE'   -- Evil row
  )),

  -- 6 Attributes (D&D standard 8-20 range)
  attr_strength INTEGER NOT NULL CHECK (attr_strength BETWEEN 8 AND 20),
  attr_dexterity INTEGER NOT NULL CHECK (attr_dexterity BETWEEN 8 AND 20),
  attr_constitution INTEGER NOT NULL CHECK (attr_constitution BETWEEN 8 AND 20),
  attr_intelligence INTEGER NOT NULL CHECK (attr_intelligence BETWEEN 8 AND 20),
  attr_wisdom INTEGER NOT NULL CHECK (attr_wisdom BETWEEN 8 AND 20),
  attr_charisma INTEGER NOT NULL CHECK (attr_charisma BETWEEN 8 AND 20),

  -- Enneagram Type (e.g., "7w8", "3w4", "9w1")
  enneagram_type TEXT CHECK (enneagram_type IS NULL OR enneagram_type ~ '^[1-9]w[1-9]$'),

  -- Avatar Generation
  avatar_seed TEXT NOT NULL,  -- Deterministic seed for sprite generation
  avatar_url TEXT,            -- Cached generated avatar URL (Supabase Storage)

  -- AI-Generated Profile Summary (non-editable, regenerated on retake)
  profile_summary TEXT,
  key_strengths TEXT[],
  summary_generated_at TIMESTAMPTZ,

  -- Status flags
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_public BOOLEAN NOT NULL DEFAULT true,  -- For Breakouts visibility

  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One character per user
  UNIQUE(user_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Primary Breakouts query: "find all Orcs"
CREATE INDEX idx_member_characters_race
  ON member_characters(race)
  WHERE is_active = true AND is_public = true;

-- Query by class: "find all Paladins"
CREATE INDEX idx_member_characters_class
  ON member_characters(class)
  WHERE is_active = true AND is_public = true;

-- Query by alignment: "find Chaotic Good members"
CREATE INDEX idx_member_characters_alignment
  ON member_characters(alignment)
  WHERE is_active = true AND is_public = true;

-- Combined filter for advanced Breakouts
CREATE INDEX idx_member_characters_race_class
  ON member_characters(race, class)
  WHERE is_active = true AND is_public = true;

-- User lookup
CREATE INDEX idx_member_characters_user_id
  ON member_characters(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE member_characters ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view public characters (for Breakouts)
CREATE POLICY "Authenticated users can view public characters"
  ON member_characters FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (is_public = true OR user_id = auth.uid())
  );

-- Users can create their own character
CREATE POLICY "Users can create own character"
  ON member_characters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own character
CREATE POLICY "Users can update own character"
  ON member_characters FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own character (for retakes)
CREATE POLICY "Users can delete own character"
  ON member_characters FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE TRIGGER update_member_characters_updated_at
  BEFORE UPDATE ON member_characters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Compute character title based on CS assessment score
-- Returns title like "Master Paladin", "Expert Maverick", etc.
CREATE OR REPLACE FUNCTION get_character_title(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_class TEXT;
  v_race TEXT;
  v_overall_score INTEGER;
  v_title_prefix TEXT := '';
BEGIN
  -- Get character class and race
  SELECT class, race INTO v_class, v_race
  FROM member_characters
  WHERE user_id = p_user_id AND is_active = true
  LIMIT 1;

  IF v_class IS NULL THEN
    RETURN NULL;
  END IF;

  -- Get overall CS assessment score (most recent completed)
  SELECT overall_score INTO v_overall_score
  FROM cs_assessment_sessions
  WHERE user_id = p_user_id AND status = 'completed'
  ORDER BY completed_at DESC
  LIMIT 1;

  -- Determine title prefix based on score
  IF v_overall_score >= 95 THEN
    v_title_prefix := 'Legendary ';
  ELSIF v_overall_score >= 90 THEN
    v_title_prefix := 'Master ';
  ELSIF v_overall_score >= 85 THEN
    v_title_prefix := 'Expert ';
  ELSIF v_overall_score >= 80 THEN
    v_title_prefix := 'Adept ';
  ELSIF v_overall_score >= 75 THEN
    v_title_prefix := 'Journeyman ';
  ELSIF v_overall_score >= 70 THEN
    v_title_prefix := 'Apprentice ';
  END IF;

  -- Return formatted title: "Master Orcish Maverick"
  -- Race adjective + Class name
  RETURN v_title_prefix || INITCAP(v_race) || ' ' || INITCAP(v_class);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- VIEW FOR BREAKOUTS
-- ============================================================

-- Comprehensive view joining character + profile + CS scores
CREATE OR REPLACE VIEW member_characters_for_breakouts AS
SELECT
  mc.id,
  mc.user_id,
  mc.race,
  mc.class,
  mc.alignment,
  mc.attr_strength,
  mc.attr_dexterity,
  mc.attr_constitution,
  mc.attr_intelligence,
  mc.attr_wisdom,
  mc.attr_charisma,
  mc.enneagram_type,
  mc.avatar_seed,
  mc.avatar_url,
  mc.profile_summary,
  mc.key_strengths,
  get_character_title(mc.user_id) AS display_title,
  p.name AS member_name,
  p.avatar_url AS profile_avatar_url,
  p.company,
  cas.overall_score AS cs_score,
  cas.archetype AS cs_archetype,
  cas.tier AS cs_tier
FROM member_characters mc
JOIN profiles p ON p.id = mc.user_id
LEFT JOIN LATERAL (
  SELECT overall_score, archetype, tier
  FROM cs_assessment_sessions
  WHERE user_id = mc.user_id AND status = 'completed'
  ORDER BY completed_at DESC
  LIMIT 1
) cas ON true
WHERE mc.is_active = true AND mc.is_public = true;

-- ============================================================
-- COMMENTS (Documentation)
-- ============================================================

COMMENT ON TABLE member_characters IS
  'D&D-style character data for GoodHang members, derived from assessment results';

COMMENT ON COLUMN member_characters.race IS
  'Character race: human, elf, dwarf, orc, halfling, dragonborn - assigned based on secondary attributes';

COMMENT ON COLUMN member_characters.class IS
  'Character class (54 options): paladin, maverick, berserker, etc. - assigned based on primary attribute + alignment';

COMMENT ON COLUMN member_characters.alignment IS
  '9-point alignment grid: LG (Lawful Good) through CE (Chaotic Evil)';

COMMENT ON COLUMN member_characters.enneagram_type IS
  'Enneagram with wing notation, e.g., 7w8, 3w4';

COMMENT ON COLUMN member_characters.avatar_seed IS
  'Deterministic seed for procedural avatar generation via Pyxelate';

COMMENT ON COLUMN member_characters.profile_summary IS
  'AI-generated strengths-focused summary, non-editable (retake to change)';

COMMENT ON FUNCTION get_character_title IS
  'Computes title prefix (Master, Expert, etc.) based on CS assessment score + race + class';

COMMENT ON VIEW member_characters_for_breakouts IS
  'Denormalized view for efficient Breakouts queries - includes profile and CS score data';
