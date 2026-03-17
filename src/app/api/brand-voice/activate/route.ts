import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  console.log('[Brand Voice Activate API] Request received');
  
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[Brand Voice Activate API] Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Brand Voice Activate API] User authenticated:', user.id);

    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error('[Brand Voice Activate API] JSON parse error:', e);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { id } = body;

    if (!id) {
      console.log('[Brand Voice Activate API] Missing voice ID');
      return NextResponse.json({ error: 'Voice ID required' }, { status: 400 });
    }

    console.log('[Brand Voice Activate API] Deactivating all voices for user');
    await supabase
      .from('brand_voices')
      .update({ is_active: false })
      .eq('user_id', user.id);

    console.log('[Brand Voice Activate API] Activating voice:', id);
    const { error } = await supabase
      .from('brand_voices')
      .update({ is_active: true })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('[Brand Voice Activate API] Update error:', error);
      throw error;
    }

    console.log('[Brand Voice Activate API] Voice activated successfully');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Brand Voice Activate API] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
