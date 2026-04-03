import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { publishDrawResults } from '@/lib/db/draw-engine';

// PUT /api/draws/[id]/publish - Publish draw results (admin only)
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
    const drawId = searchParams.get('id');

    if (!drawId) {
      return NextResponse.json(
        { success: false, error: 'Draw ID is required' },
        { status: 400 }
      );
    }

    const results = await publishDrawResults(drawId);

    return NextResponse.json({
      success: true,
      data: results,
      message: 'Draw published successfully',
    });
  } catch (error) {
    console.error('Error publishing draw:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to publish draw' },
      { status: 500 }
    );
  }
}
