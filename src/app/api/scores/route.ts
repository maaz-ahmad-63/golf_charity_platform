import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabaseServer, addGolfScore, getLastFiveScores } from '@/lib/db/utils';

// GET /api/scores - Get user's golf scores
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const scores = await getLastFiveScores(user.userId);

    return NextResponse.json({
      success: true,
      data: scores,
    });
  } catch (error) {
    console.error('Error fetching scores:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch scores' },
      { status: 500 }
    );
  }
}

// POST /api/scores - Add a new golf score
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { score, scoreDate } = await request.json();

    // Validate input
    if (typeof score !== 'number' || score < 1 || score > 45) {
      return NextResponse.json(
        { success: false, error: 'Score must be between 1 and 45 (Stableford format)' },
        { status: 400 }
      );
    }

    if (!scoreDate) {
      return NextResponse.json(
        { success: false, error: 'Score date is required' },
        { status: 400 }
      );
    }

    // Add the score (which handles rolling deletion of oldest score)
    const newScore = await addGolfScore(user.userId, score, scoreDate);

    return NextResponse.json({
      success: true,
      data: newScore,
      message: 'Score added successfully',
    });
  } catch (error) {
    console.error('Error adding score:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add score' },
      { status: 500 }
    );
  }
}

// PUT /api/scores/:id - Update a golf score
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const scoreId = searchParams.get('id');

    if (!scoreId) {
      return NextResponse.json(
        { success: false, error: 'Score ID is required' },
        { status: 400 }
      );
    }

    const { score, scoreDate } = await request.json();

    // Validate input
    if (typeof score !== 'number' || score < 1 || score > 45) {
      return NextResponse.json(
        { success: false, error: 'Score must be between 1 and 45 (Stableford format)' },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: existingScore } = await supabaseServer
      .from('golf_scores')
      .select('user_id')
      .eq('id', scoreId)
      .single();

    if (!existingScore || existingScore.user_id !== user.userId) {
      return NextResponse.json(
        { success: false, error: 'Score not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update the score
    const { data: updatedScore, error } = await supabaseServer
      .from('golf_scores')
      .update({ score, score_date: scoreDate })
      .eq('id', scoreId)
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: updatedScore?.[0],
      message: 'Score updated successfully',
    });
  } catch (error) {
    console.error('Error updating score:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update score' },
      { status: 500 }
    );
  }
}

// DELETE /api/scores/:id - Delete a golf score
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const scoreId = searchParams.get('id');

    if (!scoreId) {
      return NextResponse.json(
        { success: false, error: 'Score ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: existingScore } = await supabaseServer
      .from('golf_scores')
      .select('user_id')
      .eq('id', scoreId)
      .single();

    if (!existingScore || existingScore.user_id !== user.userId) {
      return NextResponse.json(
        { success: false, error: 'Score not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete the score
    const { error } = await supabaseServer
      .from('golf_scores')
      .delete()
      .eq('id', scoreId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Score deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting score:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete score' },
      { status: 500 }
    );
  }
}
