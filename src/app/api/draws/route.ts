import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabaseServer } from '@/lib/db/utils';
import {
  createMonthlyDraw,
  publishDrawResults,
} from '@/lib/db/draw-engine';

// GET /api/draws - Get draws
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const month = searchParams.get('month');

    let query = supabaseServer.from('draws').select('*');

    if (status) {
      query = query.eq('status', status);
    }

    if (month) {
      query = query.eq('draw_month', month);
    }

    const { data: draws, error } = await query.order('draw_month', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: draws || [],
    });
  } catch (error) {
    console.error('Error fetching draws:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch draws' },
      { status: 500 }
    );
  }
}

// POST /api/draws - Create a new draw (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - admin access required' },
        { status: 403 }
      );
    }

    const { drawMonth, drawLogic } = await request.json();

    if (!drawMonth || !drawLogic) {
      return NextResponse.json(
        { success: false, error: 'Draw month and draw logic are required' },
        { status: 400 }
      );
    }

    // Check if draw already exists for this month
    const { data: existingDraw } = await supabaseServer
      .from('draws')
      .select('id')
      .eq('draw_month', drawMonth)
      .single();

    if (existingDraw) {
      return NextResponse.json(
        { success: false, error: 'Draw already exists for this month' },
        { status: 409 }
      );
    }

    const newDraw = await createMonthlyDraw(drawMonth, drawLogic);

    return NextResponse.json({
      success: true,
      data: newDraw,
      message: 'Draw created successfully',
    });
  } catch (error) {
    console.error('Error creating draw:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create draw' },
      { status: 500 }
    );
  }
}
