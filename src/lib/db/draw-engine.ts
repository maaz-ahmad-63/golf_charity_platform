import { supabaseServer, getActiveSubscriberCount } from '@/lib/db/utils';

// Draw configuration constants
const PRIZE_DISTRIBUTION = {
  '5-match': 0.4,
  '4-match': 0.35,
  '3-match': 0.25,
};

const MONTHLY_SUBSCRIPTION_AMOUNT = 9.99; // Base amount used for prize pool calculation

// Generate random draw numbers (5 numbers between 1-45)
export function generateRandomNumbers(): number[] {
  const numbers = new Set<number>();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

// Weighted draw - favor most/least frequent scores
export async function generateAlgorithmicNumbers(userId?: string): Promise<number[]> {
  try {
    let query = supabaseServer
      .from('golf_scores')
      .select('score')
      .order('score_date', { ascending: false })
      .limit(1000); // Get recent scores for analysis

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: scores, error } = await query;

    if (error || !scores || scores.length === 0) {
      return generateRandomNumbers();
    }

    // Calculate frequency of each score
    const scoreFrequency: Record<number, number> = {};
    scores.forEach((entry: any) => {
      scoreFrequency[entry.score] = (scoreFrequency[entry.score] || 0) + 1;
    });

    // Get scores sorted by frequency (ascending - least frequent first)
    const sortedScores = Object.entries(scoreFrequency)
      .sort((a, b) => a[1] - b[1])
      .map(([score]) => parseInt(score));

    // Pick a mix of least frequent and most frequent scores
    const selected = new Set<number>();

    // Add 2 least frequent
    for (let i = 0; i < 2 && i < sortedScores.length; i++) {
      selected.add(sortedScores[i]);
    }

    // Add 3 from random positions (including most frequent)
    while (selected.size < 5) {
      const randomIdx = Math.floor(Math.random() * sortedScores.length);
      selected.add(sortedScores[randomIdx]);
    }

    return Array.from(selected).sort((a, b) => a - b);
  } catch (error) {
    console.error('Error generating algorithmic numbers:', error);
    return generateRandomNumbers();
  }
}

// Calculate prize pool based on active subscribers
export async function calculatePrizePool() {
  try {
    const activeSubscribers = await getActiveSubscriberCount();
    const totalPool = activeSubscribers * MONTHLY_SUBSCRIPTION_AMOUNT * 0.3; // 30% goes to prize pool

    return {
      total: totalPool,
      pool_5_match: totalPool * PRIZE_DISTRIBUTION['5-match'],
      pool_4_match: totalPool * PRIZE_DISTRIBUTION['4-match'],
      pool_3_match: totalPool * PRIZE_DISTRIBUTION['3-match'],
      active_subscribers: activeSubscribers,
    };
  } catch (error) {
    console.error('Error calculating prize pool:', error);
    return {
      total: 0,
      pool_5_match: 0,
      pool_4_match: 0,
      pool_3_match: 0,
      active_subscribers: 0,
    };
  }
}

// Check user scores against winning numbers
export async function checkUserWinners(
  winningNumbers: number[],
  poolAmounts: Record<string, number>
) {
  try {
    const { data: allScores, error: scoresError } = await supabaseServer
      .from('golf_scores')
      .select('user_id, score')
      .order('score_date', { ascending: false })
      .limit(5 * 10000); // Assuming max users * 5 scores each

    if (scoresError || !allScores) {
      return [];
    }

    // Group scores by user (get last 5)
    const userScores: Record<string, number[]> = {};
    allScores.forEach((entry: any) => {
      if (!userScores[entry.user_id]) {
        userScores[entry.user_id] = [];
      }
      if (userScores[entry.user_id].length < 5) {
        userScores[entry.user_id].push(entry.score);
      }
    });

    // Check matches for each user
    const winners = [];

    for (const [userId, scores] of Object.entries(userScores)) {
      const matches = scores.filter((score: number) => winningNumbers.includes(score)).length;

      if (matches === 5) {
        const winnersCount = Object.entries(userScores).filter(
          ([, userScores]: any[]) =>
            userScores.filter((score: number) => winningNumbers.includes(score)).length === 5
        ).length;

        winners.push({
          userId,
          matchType: '5-match',
          prizeAmount: poolAmounts.pool_5_match / winnersCount,
          matches,
        });
      } else if (matches === 4) {
        const winnersCount = Object.entries(userScores).filter(
          ([, userScores]: any[]) =>
            userScores.filter((score: number) => winningNumbers.includes(score)).length === 4
        ).length;

        winners.push({
          userId,
          matchType: '4-match',
          prizeAmount: poolAmounts.pool_4_match / winnersCount,
          matches,
        });
      } else if (matches === 3) {
        const winnersCount = Object.entries(userScores).filter(
          ([, userScores]: any[]) =>
            userScores.filter((score: number) => winningNumbers.includes(score)).length === 3
        ).length;

        winners.push({
          userId,
          matchType: '3-match',
          prizeAmount: poolAmounts.pool_3_match / winnersCount,
          matches,
        });
      }
    }

    return winners;
  } catch (error) {
    console.error('Error checking winners:', error);
    return [];
  }
}

// Create a monthly draw
export async function createMonthlyDraw(
  drawMonth: string,
  drawLogic: 'random' | 'algorithmic'
) {
  try {
    // Generate winning numbers
    const winningNumbers =
      drawLogic === 'random' ? generateRandomNumbers() : await generateAlgorithmicNumbers();

    // Calculate prize pool
    const prizePool = await calculatePrizePool();

    // Create draw record
    const { data: newDraw, error } = await supabaseServer
      .from('draws')
      .insert([
        {
          draw_month: drawMonth,
          winning_numbers: winningNumbers,
          status: 'draft',
          draw_logic: drawLogic,
          pool_5_total: prizePool.pool_5_match,
          pool_4_total: prizePool.pool_4_match,
          pool_3_total: prizePool.pool_3_match,
          active_subscribers: prizePool.active_subscribers,
        },
      ])
      .select();

    if (error) throw error;

    return newDraw?.[0];
  } catch (error) {
    console.error('Error creating draw:', error);
    throw error;
  }
}

// Publish draw results
export async function publishDrawResults(drawId: string) {
  try {
    // Get draw details
    const { data: draw, error: drawError } = await supabaseServer
      .from('draws')
      .select('*')
      .eq('id', drawId)
      .single();

    if (drawError || !draw) {
      throw new Error('Draw not found');
    }

    // Check winners
    const winners = await checkUserWinners(draw.winning_numbers, {
      pool_5_match: draw.pool_5_total,
      pool_4_match: draw.pool_4_total,
      pool_3_match: draw.pool_3_total,
    });

    // Insert winners
    if (winners.length > 0) {
      const winnerRecords = winners.map((winner: any) => ({
        draw_id: drawId,
        user_id: winner.userId,
        match_type: winner.matchType,
        prize_amount: winner.prizeAmount,
        verification_status: 'pending',
        payment_status: 'pending',
      }));

      const { error: insertError } = await supabaseServer
        .from('winners')
        .insert(winnerRecords);

      if (insertError) throw insertError;
    }

    // Update draw status to published
    const { data: updatedDraw, error: updateError } = await supabaseServer
      .from('draws')
      .update({ status: 'published' })
      .eq('id', drawId)
      .select();

    if (updateError) throw updateError;

    return {
      draw: updatedDraw?.[0],
      winners: winners.length,
    };
  } catch (error) {
    console.error('Error publishing draw:', error);
    throw error;
  }
}
