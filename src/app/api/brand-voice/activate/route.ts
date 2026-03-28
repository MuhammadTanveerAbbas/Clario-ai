import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Voice ID required' }, { status: 400 });
    }

    // Deactivate all voices before activating the selected one (only one active at a time)
    await supabase
      .from('brand_voices')
      .update({ is_active: false })
      .eq('user_id', user.id);

    const { error } = await supabase
      .from('brand_voices')
      .update({ is_active: true })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Brand Voice Activate] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
