import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

// Server-side client with service role (for admin operations)
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

// Helper function to check subscription status
export async function checkSubscriptionStatus(userId: string) {
  const { data, error } = await supabaseServer
    .from('users')
    .select('subscription_status, subscription_end_date')
    .eq('id', userId)
    .single();

  if (error) throw error;

  // Check if subscription has expired
  if (data.subscription_end_date && new Date(data.subscription_end_date) < new Date()) {
    return 'expired';
  }

  return data.subscription_status;
}

// Helper function to get last 5 scores
export async function getLastFiveScores(userId: string) {
  const { data, error } = await supabaseServer
    .from('golf_scores')
    .select('*')
    .eq('user_id', userId)
    .order('score_date', { ascending: false })
    .limit(5);

  if (error) throw error;
  return data || [];
}

// Helper function to add golf score
export async function addGolfScore(userId: string, score: number, scoreDate: string) {
  if (score < 1 || score > 45) {
    throw new Error('Score must be between 1 and 45 (Stableford format)');
  }

  const { data, error } = await supabaseServer
    .from('golf_scores')
    .insert([{ user_id: userId, score, score_date: scoreDate }])
    .select();

  if (error) throw error;

  // Keep only last 5 scores (delete oldest if needed)
  const scores = await getLastFiveScores(userId);
  if (scores.length > 5) {
    const oldestScore = scores[scores.length - 1];
    await supabaseServer
      .from('golf_scores')
      .delete()
      .eq('id', oldestScore.id);
  }

  return data?.[0];
}

// Helper function to get user charity contribution amount
export async function getCharityContributionAmount(
  userId: string,
  subscriptionAmount: number,
  charityPercentage: number
) {
  return (subscriptionAmount * charityPercentage) / 100;
}

// Helper function to get active subscriber count for prize pool calculation
export async function getActiveSubscriberCount() {
  const { count, error } = await supabaseServer
    .from('users')
    .select('*', { count: 'exact' })
    .eq('subscription_status', 'active');

  if (error) throw error;
  return count || 0;
}
