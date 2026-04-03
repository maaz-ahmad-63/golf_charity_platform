import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabaseServer } from '@/lib/db/utils';

// POST /api/winners/verify - User submits proof
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { winnerId, proofUrl } = await request.json();

    if (!winnerId || !proofUrl) {
      return NextResponse.json(
        { success: false, error: 'Winner ID and proof URL are required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: winner } = await supabaseServer
      .from('winners')
      .select('user_id')
      .eq('id', winnerId)
      .single();

    if (!winner || winner.user_id !== user.userId) {
      return NextResponse.json(
        { success: false, error: 'Winner not found' },
        { status: 404 }
      );
    }

    // Update with proof
    const { data: updated, error } = await supabaseServer
      .from('winners')
      .update({
        proof_url: proofUrl,
        verification_status: 'pending',
      })
      .eq('id', winnerId)
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: updated?.[0],
      message: 'Proof submitted for verification',
    });
  } catch (error) {
    console.error('Error submitting proof:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit proof' },
      { status: 500 }
    );
  }
}

// GET /api/winners/pending - Admin view pending verifications
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - admin access required' },
        { status: 403 }
      );
    }

    const { data: winners, error } = await supabaseServer
      .from('winners')
      .select('*, users(*), draws(*)')
      .eq('verification_status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: winners || [],
    });
  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pending verifications' },
      { status: 500 }
    );
  }
}

// PUT /api/winners/:id - Admin approve/reject winner
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const winnerId = searchParams.get('id');

    if (!winnerId) {
      return NextResponse.json(
        { success: false, error: 'Winner ID is required' },
        { status: 400 }
      );
    }

    const { verificationStatus, paymentStatus } = await request.json();

    if (!verificationStatus && !paymentStatus) {
      return NextResponse.json(
        { success: false, error: 'At least one status is required' },
        { status: 400 }
      );
    }

    const updates: Record<string, any> = {};

    if (verificationStatus) {
      updates.verification_status = verificationStatus;
    }

    if (paymentStatus) {
      updates.payment_status = paymentStatus;
      if (paymentStatus === 'paid') {
        updates.payout_date = new Date().toISOString();
      }
    }

    const { data: updated, error } = await supabaseServer
      .from('winners')
      .update(updates)
      .eq('id', winnerId)
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: updated?.[0],
      message: 'Winner status updated successfully',
    });
  } catch (error) {
    console.error('Error updating winner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update winner' },
      { status: 500 }
    );
  }
}
