export interface Venue {
  id: string;
  name: string;
  address: string;
  year: string;
  points: number;
  badge: 'default' | 'blood' | 'rare';
  category: string;
  part: number;
  partTitle: string;
  partSubtitle: string;
  description: string;
  tags: string[];
  url: string;
}

export interface PragueUser {
  id: string;
  slug: string;
  display_name: string | null;
  total_points: number;
  created_at: string;
  updated_at: string;
}

export interface PragueClaim {
  id: string;
  user_id: string;
  venue_id: string;
  photo_url: string;
  notes: string | null;
  points_awarded: number;
  created_at: string;
}

export interface Tier {
  name: string;
  min: number;
  max: number;
  reward: string;
}

export interface BonusMultiplier {
  multiplier: number;
  description: string;
}

export interface SecretAchievement {
  name: string;
  points: number;
  description: string;
}
