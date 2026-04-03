import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  generateRandomNumbers,
  generateAlgorithmicNumbers,
  calculatePrizePool,
} from '@/lib/db/draw-engine';

// POST /api/draws/simulate - Simulate draw results (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - admin access required' },
        { status: 403 }
      );
    }

    const { drawLogic } = await request.json();

    if (!drawLogic) {
      return NextResponse.json(
        { success: false, error: 'Draw logic is required' },
        { status: 400 }
      );
    }

    // Generate preview numbers without saving
    const numbers =
      drawLogic === 'random' ? generateRandomNumbers() : await generateAlgorithmicNumbers();

    const prizePool = await calculatePrizePool();

    return NextResponse.json({
      success: true,
      data: {
        winning_numbers: numbers,
        pool_5_match: prizePool.pool_5_match,
        pool_4_match: prizePool.pool_4_match,
        pool_3_match: prizePool.pool_3_match,
        active_subscribers: prizePool.active_subscribers,
      },
      message: 'Simulation generated successfully',
    });
  } catch (error) {
    console.error('Error simulating draw:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to simulate draw' },
      { status: 500 }
    );
  }
}
