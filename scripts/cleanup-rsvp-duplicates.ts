/**
 * Clean up duplicate RSVPs, keeping only the oldest per (event_id, email)
 * Usage: npx tsx scripts/cleanup-rsvp-duplicates.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function cleanupDuplicates() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  console.log('\n🧹 Cleaning up duplicate RSVPs...\n');

  // Execute the cleanup query
  const { data, error } = await supabase.rpc('cleanup_duplicate_rsvps');

  if (error) {
    console.error('❌ Error:', error);

    // If function doesn't exist, try direct SQL (won't work with RLS, but worth a try)
    console.log('\nTrying direct approach...\n');

    const { error: deleteError } = await supabase
      .from('rsvps')
      .delete()
      .not('id', 'in',
        `(SELECT DISTINCT ON (event_id, guest_email) id FROM rsvps WHERE guest_email IS NOT NULL ORDER BY event_id, guest_email, created_at ASC)`
      );

    if (deleteError) {
      console.error('❌ Direct delete failed:', deleteError);
      console.log('\n📝 Please run this SQL manually in Supabase SQL Editor:');
      console.log('─────────────────────────────────────────');
      console.log(`
DELETE FROM rsvps
WHERE id NOT IN (
  SELECT DISTINCT ON (event_id, guest_email) id
  FROM rsvps
  WHERE guest_email IS NOT NULL
  ORDER BY event_id, guest_email, created_at ASC
);
      `);
      console.log('─────────────────────────────────────────\n');
      process.exit(1);
    }
  }

  console.log('✅ Duplicate RSVPs cleaned up successfully!\n');
}

cleanupDuplicates();
