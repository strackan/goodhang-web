export type MembershipTier = 'free' | 'core';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';
export type UserRole = 'member' | 'ambassador' | 'admin';
export type MembershipStatus = 'pending' | 'active' | 'suspended' | 'alumni';

export interface Profile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  role?: string;
  company?: string;
  linkedin_url?: string;
  interests?: string[];
  membership_tier: MembershipTier;
  membership_status: MembershipStatus;
  user_role: UserRole;
  region_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  email: string;
  name: string;
  linkedin_url?: string;
  why_join: string;
  contribution?: string;
  referral_source?: string;
  status: ApplicationStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  interview_scheduled_at?: string;
  interview_completed_at?: string;
  interview_notes?: string;
  admin_notes?: string;
  rejection_reason?: string;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  location: string;
  location_lat?: number;
  location_lng?: number;
  event_datetime: string;
  capacity?: number;
  is_public: boolean;
  created_by?: string;
  region_id?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface RSVP {
  id: string;
  event_id: string;
  user_id?: string;
  guest_name?: string;
  guest_email?: string;
  plus_ones: number;
  created_at: string;
}

export interface Region {
  id: string;
  name: string;
  slug: string;
  description?: string;
  ambassador_ids?: string[];
  created_at: string;
}

// Joined types for queries
export interface EventWithRSVPCount extends Event {
  rsvp_count?: number;
  user_rsvp?: RSVP;
}

export interface ApplicationWithReviewer extends Application {
  reviewer?: Profile;
}
