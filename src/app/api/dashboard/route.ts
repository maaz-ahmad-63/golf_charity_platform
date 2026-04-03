import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Path to mock subscriptions file
const mockSubscriptionsFile = path.join(process.cwd(), '.mock-subscriptions.json');

// Load subscriptions from file
function loadSubscriptions() {
  try {
    if (fs.existsSync(mockSubscriptionsFile)) {
      const data = fs.readFileSync(mockSubscriptionsFile, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.log('Creating new mock subscriptions file');
  }
  return {};
}

// GET /api/dashboard - Get user dashboard data
export async function GET(request: NextRequest) {
  try {
    // Get user ID from cookies
    const userIdCookie = request.cookies.get('userId');
    
    if (!userIdCookie) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = userIdCookie.value;
    const emailCookie = request.cookies.get('userEmail');
    const email = emailCookie?.value || '';

    // Load subscriptions
    const subscriptions = loadSubscriptions();
    const userSubscription = subscriptions[userId] || null;

    // Mock data
    const mockScores = [
      { id: '1', score: 78, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
      { id: '2', score: 82, date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    ];

    const mockWinnings = [
      {
        id: '1',
        draw_id: 'draw_1',
        match_count: 3,
        prize_amount: 250.00,
        verification_status: 'verified',
      },
      {
        id: '2',
        draw_id: 'draw_2',
        match_count: 2,
        prize_amount: 100.00,
        verification_status: 'verified',
      },
    ];

    const totalWon = mockWinnings.reduce((sum: number, w: any) => sum + w.prize_amount, 0);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: userId,
          email,
          full_name: 'Golf Player',
          subscription_status: userSubscription ? userSubscription.status : 'inactive',
          charity_percentage: userSubscription ? userSubscription.charityPercentage : 0,
        },
        subscription: userSubscription || null,
        scores: mockScores,
        winnings: mockWinnings,
        totalWon,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

// PUT /api/dashboard - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const userIdCookie = request.cookies.get('userId');
    
    if (!userIdCookie) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = userIdCookie.value;
    const { charityPercentage } = await request.json();

    if (charityPercentage !== undefined) {
      if (charityPercentage < 10 || charityPercentage > 100) {
        return NextResponse.json(
          { success: false, error: 'Charity percentage must be between 10 and 100' },
          { status: 400 }
        );
      }

      // Update subscription
      const subscriptions = loadSubscriptions();
      if (subscriptions[userId]) {
        subscriptions[userId].charityPercentage = charityPercentage;
        fs.writeFileSync(mockSubscriptionsFile, JSON.stringify(subscriptions, null, 2));
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating dashboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
