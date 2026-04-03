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

// Save subscriptions to file
function saveSubscriptions(subscriptions: any) {
  try {
    fs.writeFileSync(mockSubscriptionsFile, JSON.stringify(subscriptions, null, 2));
  } catch (error) {
    console.error('Failed to save subscriptions:', error);
  }
}

// Extract user ID from token (simple mock)
function getUserIdFromToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;

  try {
    // For mock, we'll store user info in localStorage-like cookie
    const cookie = request.cookies.get('auth_token');
    if (cookie) {
      // In real app, verify JWT. For mock, just extract user info
      return cookie.value.split('-')[0]; // Simplified
    }
  } catch (error) {
    return null;
  }
  return null;
}

// POST /api/checkout - Create checkout session
export async function POST(request: NextRequest) {
  try {
    // Get user ID from auth token
    const userIdCookie = request.cookies.get('userId');
    const emailCookie = request.cookies.get('userEmail');

    if (!userIdCookie || !emailCookie) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const userId = userIdCookie.value;
    const email = emailCookie.value;

    const { plan, charityId, charityPercentage } = await request.json();

    if (!plan || !['monthly', 'yearly'].includes(plan)) {
      return NextResponse.json(
        { success: false, error: 'Invalid subscription plan' },
        { status: 400 }
      );
    }

    if (charityPercentage && (charityPercentage < 10 || charityPercentage > 100)) {
      return NextResponse.json(
        { success: false, error: 'Charity percentage must be between 10 and 100' },
        { status: 400 }
      );
    }

    // Load subscriptions
    const subscriptions = loadSubscriptions();

    // Create subscription
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const amount = plan === 'monthly' ? 29.99 : 299.99;
    const charityPercent = charityPercentage || 10;

    subscriptions[userId] = {
      id: subscriptionId,
      userId,
      email,
      plan,
      amount,
      charityId: charityId || '',
      charityPercentage: charityPercent,
      status: 'active',
      createdAt: new Date().toISOString(),
      nextBillingDate: new Date(Date.now() + (plan === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString(),
    };

    // Save subscriptions
    saveSubscriptions(subscriptions);

    return NextResponse.json({
      success: true,
      data: {
        subscriptionId,
        plan,
        amount,
        charityPercentage: charityPercent,
        status: 'active',
      },
      message: 'Subscription activated successfully!',
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Checkout failed' },
      { status: 500 }
    );
  }
}
