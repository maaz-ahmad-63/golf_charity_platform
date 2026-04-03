import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabaseServer } from '@/lib/db/utils';

// GET /api/admin/dashboard - Get admin dashboard data
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - admin access required' },
        { status: 403 }
      );
    }

    // Get total users
    const { count: totalUsers } = await supabaseServer
      .from('users')
      .select('*', { count: 'exact' });

    // Get active subscriptions
    const { count: activeSubscriptions } = await supabaseServer
      .from('users')
      .select('*', { count: 'exact' })
      .eq('subscription_status', 'active');

    // Get all winners with amounts for total pool
    const { data: winners } = await supabaseServer
      .from('winners')
      .select('prize_amount');

    const totalPool = winners?.reduce((sum: number, w: any) => sum + w.prize_amount, 0) || 0;

    // Get charity contributions
    const { data: contributions } = await supabaseServer
      .from('charity_contributions')
      .select('amount');

    const totalCharityRaised = contributions?.reduce((sum, c) => sum + c.amount, 0) || 0;

    // Get recent winners
    const { data: recentWinners } = await supabaseServer
      .from('winners')
      .select('*, users(*), draws(*)')
      .order('created_at', { ascending: false })
      .limit(10);

    // Get pending verifications
    const { data: pendingVerifications } = await supabaseServer
      .from('winners')
      .select('*, users(*)')
      .eq('verification_status', 'pending')
      .order('created_at', { ascending: true });

    // Get draw statistics
    const { data: draws } = await supabaseServer
      .from('draws')
      .select('*')
      .order('draw_month', { ascending: false });

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: totalUsers || 0,
        activeSubscriptions: activeSubscriptions || 0,
        totalPool: parseFloat(totalPool.toFixed(2)),
        totalCharityRaised: parseFloat(totalCharityRaised.toFixed(2)),
        recentWinners: recentWinners || [],
        pendingVerifications: pendingVerifications || [],
        draws: draws || [],
      },
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin dashboard' },
      { status: 500 }
    );
  }
}
