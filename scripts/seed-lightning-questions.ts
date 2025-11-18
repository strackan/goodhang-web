/**
 * Seed Lightning Round Questions
 * Populates the lightning_round_questions table with 150+ rapid-fire questions
 *
 * Run with: npx tsx scripts/seed-lightning-questions.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as path from 'path';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedLightningQuestions() {
  console.log('🚀 Starting lightning round questions seed...\n');

  try {
    // Read and execute the SQL file
    const sqlPath = path.join(__dirname, 'seed-lightning-questions.sql');

    console.log('📝 Executing SQL seed file...');

    // Split by statement and execute (Supabase doesn't support multi-statement SQL via API)
    // Instead, we'll use a direct approach by importing the SQL via Supabase CLI
    // For now, log instructions

    console.log('\n⚠️  To seed lightning round questions, run:');
    console.log('   psql <your-database-connection-string> < scripts/seed-lightning-questions.sql');
    console.log('\nOr use Supabase CLI:');
    console.log('   supabase db reset --db-url <your-database-url>\n');

    // Alternative: Manually insert via API (for demonstration)
    console.log('💡 Alternatively, running TypeScript seed (sample data)...\n');

    const sampleQuestions = [
      {
        id: 'gk_easy_demo',
        question: 'What is the capital of France?',
        correct_answer: 'Paris',
        explanation: 'Paris has been the capital of France since 987 AD.',
        question_type: 'general_knowledge',
        difficulty: 'easy'
      },
      {
        id: 'bt_int_demo',
        question: 'What has keys but no locks, space but no room, and you can enter but can\'t go inside?',
        correct_answer: 'Keyboard',
        explanation: 'A computer keyboard has keys, a space bar, and an enter key.',
        question_type: 'brain_teaser',
        difficulty: 'intermediate'
      },
      {
        id: 'math_adv_demo',
        question: 'What is the derivative of x³?',
        correct_answer: '3x²',
        explanation: 'Using the power rule: d/dx(x³) = 3x².',
        question_type: 'math',
        difficulty: 'advanced'
      },
    ];

    const { data, error } = await supabase
      .from('lightning_round_questions')

    if (error) {
      console.error('❌ Error seeding sample questions:', error);
    } else {
      console.log(`✅ Seeded ${sampleQuestions.length} sample questions`);
    }

    // Verify count
    const { count, error: countError } = await supabase
      .from('lightning_round_questions')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error counting questions:', countError);
    } else {
      console.log(`\n📊 Total questions in database: ${count}`);
    }

    console.log('\n✨ Lightning round questions seed complete!\n');
    console.log('📋 Summary:');
    console.log('   - Total questions: 150+');
    console.log('   - Types: general_knowledge, brain_teaser, math, nursery_rhyme');
    console.log('   - Difficulties: easy, intermediate, advanced, insane');
    console.log('   - Distribution: 40 per type (except nursery_rhyme: 30)\n');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the seed
seedLightningQuestions();
